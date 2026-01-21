import base64
import os
import uuid
import modal
from pydantic import BaseModel
from acestep.pipeline_ace_step import ACEStepPipeline
from diffusers.pipelines.auto_pipeline import AutoPipelineForText2Image
import torch
import requests
from transformers import AutoTokenizer, AutoModelForCausalLM
app = modal.App("music generator")

aceStepVolume = modal.Volume.from_name('ace-step-models', create_if_missing=True)
hf_volume = modal.Volume.from_name('qwen_hf_cache', create_if_missing=True)
cache_dir = '.cache/huggingface'
aws_secrets = modal.Secret.from_name("test-secret")


image = (modal.Image.micromamba(force_build=True)
        .pip_install_from_requirements("requirements.txt")

         .apt_install("git")
         
         .run_commands([
             'pip install --upgrade pip',
             'pip install -U pip setuptools wheel',
             'git clone https://github.com/ace-step/ACE-Step.git /tmp/ace-step',
             'cd /tmp/ace-step'

         ])
         .env({'HF_HOME': cache_dir})
         .add_local_python_source("prompts")

         )


@app.cls(image=image, volumes={'/models': aceStepVolume, '/hfmodels': hf_volume}, gpu='L4', scaledown_window=15, secrets=[aws_secrets])
class GeneratedMusicResponse(BaseModel):
    audio_str: str


@app.cls(image=image, volumes={'/models': aceStepVolume, '/hfmodels': hf_volume}, gpu='L4', scaledown_window=15, secrets=[aws_secrets])
class MusicModelServer():
    image_model_name:str = 'stabilityai/stable-diffusion-xl-base-1.0'
    llm_model_name: str = 'Qwen/Qwen2-7B-Instruct'

    @modal.enter()
    def __init__(self, image_model_name=image_model_name, llm_model_name=llm_model_name):
        self.music_model = ACEStepPipeline(
            checkpoint_dir='/models',
            dtype="bfloat16",
            torch_compile=False,
            cpu_offload=False,
            overlapped_decode=False
        )
   
    # llm

        self.tokenizer = AutoTokenizer.from_pretrained(llm_model_name)
        self.llm = AutoModelForCausalLM.from_pretrained(
            llm_model_name, torch_dtype='auto', device_map='auto', cache_dir=cache_dir)

        # image generation model
        # from diffusers.pipelines.pipeline_utils import DiffusionPipeline

        self.image_model = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True
        )
        self.image_model.to("cuda")
        self.image_refiner = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/stable-diffusion-xl-refiner-1.0",
            text_encoder_2=self.image_model.text_encoder_2,
            vae=self.image_model.vae,
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16",
            cache_dir=cache_dir
        )
        self.image_refiner.to("cuda")
        # refiner.to("cuda")

    @modal.fastapi_endpoint(method="POST")
    def generate(self):
        out_dir = '/tmp/audio_out'

        try:
            os.mkdir(out_dir)
        except BaseException as e:
            print(e)

        out_path = f'{out_dir}/{uuid.uuid4()}.wav'

        res = self.music_model(
            prompt="Cuban music, salsa, son, Afro-Cuban, traditional Cuban",
            lyrics="[verse]\nSun dips low the night ignites\nBassline hums with gleaming lights\nElectric guitar singing tales so fine\nIn the rhythm we all intertwine\n\n[verse]\nDrums beat steady calling out\nPercussion guides no room for doubt\nElectric pulse through every vein\nDance away every ounce of pain\n\n[chorus]\nFeel the rhythm feel the flow\nLet the music take control\nBassline deep electric hum\nIn this night we're never numb\n\n[bridge]\nStars above they start to glow\nEchoes of the night's soft glow\nElectric strings weave through the air\nIn this moment none compare\n\n[verse]\nHeartbeats sync with every tone\nLost in music never alone\nElectric tales of love and peace\nIn this groove we find release\n\n[chorus]\nFeel the rhythm feel the flow\nLet the music take control\nBassline deep electric hum\nIn this night we're never numb",
            audio_duration=180,
            infer_step=60,
            guidance_scale=15,
            scheduler_type="euler",
            cfg_type="apg",
            omega_scale=10,
            guidance_interval=0.5,
            guidance_interval_decay=0,
            min_guidance_scale=3,
            use_erg_tag=True,
            use_erg_lyric=True,
            use_erg_diffusion=True,
            save_path=out_path
        )
        audio_bytes = None
        with open(out_path, 'rb') as stream:
            audio_bytes = stream.read()
        decoded = base64.b64encode(audio_bytes).decode(encoding='utf-8')
        os.remove(out_path)
        return GeneratedMusicResponse(audio_str=decoded)


@app.function(image=image, timeout=300, gpu="L4", secrets=[aws_secrets], volumes={"/models": aceStepVolume, '/hfmodels':hf_volume})
def run_script():

    print("hello from modal  !")
 

@app.local_entrypoint()
def main():
    server = MusicModelServer()
    endpoint_url = server.generate.get_web_url()
    response = requests.post(endpoint_url)

    music_response = GeneratedMusicResponse(**response.json())
    
    if response.ok:
        out_fname = f'out_{uuid.uuid4()}.wav'
        res_str = base64.b64decode(music_response.audio_str)
        with open(out_fname, 'wb') as stream:
            stream.write(res_str)
        
    

  