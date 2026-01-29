import math
import uuid
import modal
import boto3
from typer import prompt
import os
import torch
import requests
from pydantic import BaseModel

app = modal.App("music generator")


image = (
    modal.Image.debian_slim()
    .apt_install("git")
    .apt_install("ffmpeg")
    .pip_install_from_requirements("requirements.txt")
    .run_commands(
        [
            "git clone https://github.com/ace-step/ACE-Step.git /tmp/ace-50",
            "cd /tmp/ace-50 && pip install .",
        ]
    )
    .add_local_python_source("prompts")

)


aws_secrets = modal.Secret.from_name("musify-secrets")
modelsVolume = modal.Volume.from_name("models-volume", create_if_missing=True)

class BasePrompt_MusicGeneration(BaseModel):
    prompt: str
    lyrics: str = "[Instrumental]"
    guidance_scale: float = 1.5
    audio_duration: int = 300  # in seconds
    infer_step: int = 5


@app.cls(
    secrets=[aws_secrets],
    image=image,
    volumes={"/models": modelsVolume},
    gpu="L4",
    timeout=750,
)
class MusicServer:
    llm_id: str = modal.parameter(default="Qwen/Qwen2.5-7B-Instruct")
    img_model_id: str = modal.parameter(default="ace-step/Imagen-Video-XL") 

    def FormatPromptForImageGeneration(self, prompt: str) -> str:
        # Here you can add any formatting or preprocessing needed for the prompt
        return prompt.strip()

    @modal.enter()
    def __enter__(self):
        from diffusers import AutoPipelineForText2Image
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from acestep.pipeline_ace_step import ACEStepPipeline

        # self.llm_model = AutoModelForCausalLM.from_pretrained(
        #     self.llm_id, torch_dtype=torch.float16, variant="fp16", device_map="auto"
        # )
        # self.llm_tokenizer = AutoTokenizer.from_pretrained(self.llm_id)

        # self.img_model = AutoPipelineForText2Image.from_pretrained(
        #     self.img_model_id, torch_dtype=torch.float16, variant="fp16"
        # )
        # self.img_model.to("cuda")

        self.music_model = ACEStepPipeline(
            checkpoint_dir="/models/ace-step-checkpoint",
            dtype="bfloat16",
            torch_compile=False,
            cpu_offload=False,
            overlapped_decode=False,
        )
        print(self.music_model)
        return

    def FormatLyricsForMusicGeneration(self, lyrics: str) -> str:
        # Here you can add any formatting or preprocessing needed for the lyrics
        return lyrics.strip()

    
    @modal.fastapi_endpoint(method="POST",  )
    def generate(self, req: BasePrompt_MusicGeneration):
        print(f"loading image model {self.img_model_id}...")

        print("image model loaded. ")
        output_path = f"{uuid.uuid4()}.wav"
        print(f"Generated output path: {output_path}")

        print("Formatting prompt for image generation...")
        final_prompt = self.FormatPromptForImageGeneration(req.prompt)
        negative_prompt = ""

        print("Formatting lyrics for music generation...")
        final_lyrics = self.FormatLyricsForMusicGeneration(req.lyrics)

        print("Invoking music model with formatted inputs...")
        wav = self.music_model(
            prompt=final_prompt,
            audio_duration=req.audio_duration,
            infer_step=req.infer_step,
            guidance_scale=req.guidance_scale,
            lyrics=final_lyrics,
            format="wav",
            save_path=output_path,
        )
        print("Music generation completed, proceeding to upload...")
        # image = self.img_model(
        #     prompt=final_prompt,
        #     negative_prompt=negative_prompt,
        #     num_inference_steps=1,
        #     guidance_scale=0.0,
        #     width=1024,
        #     height=1024,
        #     true_cfg_scale=1.0,
        #     generator=torch.manual_seed(0),
        #     save_path=output_path
        # ).images[0]
        # image.save("qwen_fewsteps.png")

        print("Initializing S3 client...")
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("musify_backend_key_id"),
            aws_secret_access_key=os.getenv("musify_backend_key_secret"),
        )

        s3_bucket_name = os.getenv("S3_BUCKET_NAME")

        print("Uploading generated audio to S3...")
        s3_client.upload_file(
            output_path,
            s3_bucket_name,
            "qwen_fewsteps.wav",
            ExtraArgs={"ACL": "public-read"},
        )
        print("Upload completed successfully.")


@app.function(
    image=image,
    timeout=300,
    gpu="A100",
    secrets=[aws_secrets],
    volumes={"/models": modelsVolume},
)
def run_script():
    print("hello from modal!")
    """create server, which is a class containing the models.
    expose server post endpoint, which will be a function call
    call endpoint
    


    """
    server = MusicServer()
    generate_url = server.generate.get_web_url()
    print(f"Generate endpoint URL: {generate_url}")
    response = requests.post(
        generate_url, 
        json={"prompt": "A calm and soothing piano melody"}
    )
    print("Response from server:", response.json())


@app.local_entrypoint()
def main():
    run_script.remote()
