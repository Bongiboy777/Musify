import base64
import os
import uuid
from fastapi.responses import HTMLResponse, JSONResponse, ORJSONResponse, FileResponse
import modal
from pydantic import BaseModel
from acestep.pipeline_ace_step import ACEStepPipeline
from diffusers.pipelines.auto_pipeline import AutoPipelineForText2Image
import torch
import boto3
from botocore.config import Config
import requests
import torchaudio
import logging
import random
from transformers import AutoTokenizer, AutoModelForCausalLM

app = modal.App("music generator")

aceStepVolume = modal.Volume.from_name("ace-step-models", create_if_missing=True)
hf_volume = modal.Volume.from_name("qwen_hf_cache", create_if_missing=True)
cache_dir = ".cache/huggingface"

# made in modal ui, storing aws secrets which will be access keys to authenticate as users with required policies attatched.
aws_secrets = modal.Secret.from_name("musify-secrets")

image = (
    modal.Image.debian_slim(force_build=False)
    .pip_install_from_requirements("requirements.txt")
    .apt_install("git")
    .apt_install("ffmpeg")
    .run_commands(
        [
            "pip install --upgrade pip",
            "pip install -U pip setuptools wheel",
            "git clone https://github.com/ace-step/ACE-Step.git tmp/ace-step",
            "cd tmp/ace-step && pip install . && ls",
            "pip list",
        ]
    )
    .env({"HF_HOME": cache_dir})
    .add_local_python_source("prompts")
)


@app.cls(
    image=image,
    volumes={"/models": aceStepVolume, "/hfmodels": hf_volume},
    scaledown_window=15,
    secrets=[aws_secrets],
)
class GeneratedMusicResponse(BaseModel):
    audio_str: str = modal.parameter()


class GeneratedMusicResponseS3(BaseModel):
    audio_str: str = modal.parameter()
    lyrics: str = modal.parameter()
    categories: list[str] = modal.parameter()


class BaseGenerationRequest(BaseModel):
    prompt: str = "Vintage retro keys sample Chick corea"
    lyrics: str = "[Instrumental]"
    audio_duration: int = random.randint(150, 210)
    infer_step: int = 60
    guidance_scale: int = 15
    scheduler_type: str = "euler"
    cfg_type: str = "apg"
    omega_scale: int = 10
    guidance_interval: float = 0.5
    guidance_interval_decay: float = 0
    min_guidance_scale: int = 3
    use_erg_tag: bool = True
    use_erg_lyric: bool = True
    use_erg_diffusion: bool = True
    save_path: str = "/outputs"

    def _format_prompt(self, prompt: str) -> str:
        from prompts import MUSIC_PROMPT_TEMPLATE_NO_LYRICS

        prompt = MUSIC_PROMPT_TEMPLATE_NO_LYRICS.format(prompt=prompt)
        return prompt

    def _format_lyrics(self, lyrics: str) -> str:
        # Additional formatting can be added here if needed
        return lyrics

    def _execute_prompt(self, prompt: str, lyrics: str) -> str:
        formatted_prompt = self._format_prompt(prompt)
        formatted_lyrics = self._format_lyrics(lyrics)
        full_prompt = f"{formatted_prompt}\n\n{formatted_lyrics}"
        return full_prompt


@app.cls(
    image=image,
    gpu="L40S",
    volumes={
        "/models": aceStepVolume,
        "/hfmodels": hf_volume,
    },
    scaledown_window=15,
    secrets=[aws_secrets],
)
class MusicModelServer:
    image_model_name: str = modal.parameter()
    llm_model_name: str = modal.parameter()

    def upload_to_s3(self, file_path: str, bucket_name: str, object_name: str):
        try:
            self.s3_client.upload_file(file_path, bucket_name, object_name)
            print(f"File {file_path} uploaded to {bucket_name}/{object_name}")
        except Exception as e:
            logger = logging.getLogger("Musify.MusicModelServer.upload_to_s3")
            logger.exception("Error uploading file to S3: %s", e)
            raise
    

    def upload_to_s3_walk(self, bucket_name, folder_path, s3_prefix=""):

        # Walk through all directories and files
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                local_path = os.path.join(root, file)

                # Create the relative S3 key
                relative_path = os.path.relpath(local_path, folder_path)
                s3_key = os.path.join(s3_prefix, relative_path).replace(
                    "\\", "/"
                )  # Ensure forward slashes

                print(f"Uploading {local_path} to s3://{bucket_name}/{s3_key}")
                self.s3_client.upload_file(local_path, bucket_name, s3_key)

    @modal.enter()
    def _init(self):
        logger = logging.getLogger("Musify.MusicModelServer._init")
        logger.setLevel(logging.INFO)
        self.s3_bucket_name = os.getenv("S3_BUCKET_NAME", "musify-bucket-001")
        self.aws_bucket_id = os.getenv("musify_backend_key_id")
        self.aws_bucket_secret = os.getenv("musify_backend_key_secret")

        print("Initializing ACEStepPipeline")
        self.music_model = ACEStepPipeline(
            checkpoint_dir="/models",
            dtype="bfloat16",
            torch_compile=False,
            cpu_offload=False,
            overlapped_decode=False,

        )
        print("ACEStepPipeline initialized")
        self.s3_client = boto3.client("s3", 
        aws_access_key_id=self.aws_bucket_id,
        aws_secret_access_key=self.aws_bucket_secret,
        region_name='eu-north-1')

        print("Loading LLM model")
        self.language_model = AutoModelForCausalLM.from_pretrained(
            self.llm_model_name, torch_dtype='auto', device_map='auto', cache_dir=cache_dir)
        print("LLM model loaded")

        print("Loading LLM tokenizer: %s", self.llm_model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(self.llm_model_name)
        

        # print("Loading image generation model (base): %s", self.image_model_name)
        self.image_model = AutoPipelineForText2Image.from_pretrained(
            self.image_model_name,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True,
        )
        print("Moving image model to GPU")
        self.image_model.to("cuda")

        print("Loading image refiner model")
        # self.image_refiner = AutoPipelineForText2Image.from_pretrained(
        #     "stabilityai/stable-diffusion-xl-refiner-1.0",
        #     text_encoder_2=self.image_model.text_encoder_2,
        #     vae=self.image_model.vae,
        #     torch_dtype=torch.float16,
        #     use_safetensors=True,
        #     variant="fp16",
        #     cache_dir=cache_dir
        # )
        # print("Moving image refiner to GPU")
        # self.image_refiner.to("cuda")
        print("MusicModelServer initialization complete")

    def generate_categories_from_prompt(self, prompt: str) -> list[str]:
        from prompts import CATEGORY_PROMPT_TEMPLATE

        formatted_prompt = CATEGORY_PROMPT_TEMPLATE.format(prompt=prompt)
        messages = [
            {"role": "system", "content": "You are a music categorization expert. Provide only a comma-separated list of music categories as strings that match the given prompt. Do not include explanations or other text."},
            {"role": "user", "content": formatted_prompt}
        ]
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.language_model.device)

        generated_ids = self.language_model.generate(
            **model_inputs,
            max_new_tokens=512
        )
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return [cat.strip() for cat in response.split(",") if cat.strip()]

    def format_img_prompt(self, prompt: str) -> str:
        return f"{prompt} ALBUM COVER ART"
    
    def format_music_prompt(self, prompt: str, lyrics: str) -> str:
        from prompts import MUSIC_PROMPT_TEMPLATE_NO_LYRICS

        print(f"format_music_prompt: Input prompt length: {len(prompt)}")
        formatted_prompt = MUSIC_PROMPT_TEMPLATE_NO_LYRICS.format(prompt=prompt)
        print(f"format_music_prompt: Formatted prompt created, length: {len(formatted_prompt)}")
        messages = [
            {"role": "system", "content": "You are the music generation prompt generator. you generate detailed music generation prompts based on user input."},
            {"role": "user", "content": formatted_prompt}
        ]
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        print(f"format_music_prompt: Chat template applied, text length: {len(text)}")
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.language_model.device)
        print(f"format_music_prompt: Model inputs prepared")

        generated_ids = self.language_model.generate(
            **model_inputs,
            max_new_tokens=512
        )
        print(f"format_music_prompt: Generation complete")
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        print(f"format_music_prompt: Response decoded, length: {len(response)}")

        full_prompt = f"{formatted_prompt}\n\n{lyrics}"
        return response  
    

    def format_lyrics(self, lyrics: str) -> str:
        from prompts import STRUCTURE_LYRICS_TEMPLATE

        print(f"format_lyrics: Input lyrics length: {len(lyrics)}")
        formatted_prompt = STRUCTURE_LYRICS_TEMPLATE.format(lyrics=lyrics)
        print(f"format_lyrics: Formatted prompt created")
        messages = [
            {"role": "system", "content": "You are the lyric generator. The user provides you with lyric ideas, and you generate full lyrics based on these ideas, with section formatting"},
            {"role": "user", "content": formatted_prompt}
        ]
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        print(f"format_lyrics: Chat template applied, text length: {len(text)}")
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.language_model.device)
        print(f"format_lyrics: Model inputs prepared")

        generated_ids = self.language_model.generate(
            **model_inputs,
            max_new_tokens=512
        )
        print(f"format_lyrics: Generation complete")
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        print(f"format_lyrics: Response decoded, length: {len(response)}")
        
        full_prompt = f"{formatted_prompt}\n\n{lyrics}"
        return response  

    @modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
    def generateAndPostToS3(
        self,
        prompt: str = "Vintage retro keys sample Chick corea",
        lyrics: str = "[Instrumental]",
        audio_duration: int = 180,
        infer_step: int = 60,
        guidance_scale: int = 15,
        scheduler_type: str = "euler",
        music_cloud_dir: str = "out",
        img_cloud_dir: str = "out",
    ) -> GeneratedMusicResponseS3:
        id = uuid.uuid4()
        music_out_name = f"{id}.wav"
        img_out_name = f"{id}.png"

        img_cloud_path: str = f"{img_cloud_dir}/{img_out_name}"
        music_cloud_path: str = f"{music_cloud_dir}/{music_out_name}"
        music_out_path: str = f"tmp/out/{music_out_name}"
        img_out_path: str = f"tmp/out/{img_out_name}"
        
        print(f"aws bucket key id: {os.getenv('musify_backend_key_id')}")

        formatted_prompt = self.format_music_prompt(prompt, lyrics)
        print(f"formatted_prompt: {formatted_prompt}")
        categories = self.generate_categories_from_prompt(prompt)
        print(f"categories: {categories}")
        formatted_lyrics = self.format_lyrics(lyrics) if lyrics != "[Instrumental]" else lyrics
        print(f"formatted_lyrics: {formatted_lyrics}")



        # generating music
        self.music_model(
            format="wav",
            audio_duration=audio_duration,
            prompt=formatted_prompt,
            lyrics=formatted_lyrics,
            infer_step=infer_step,
            scheduler_type=scheduler_type,
            guidance_scale=guidance_scale,
            save_path=music_out_path,
            
        )

        image = self.image_model(
            prompt=f"{prompt} ALBUM COVER ART",
            num_inference_steps=25,
            guidance_scale=7.5,
        ).images[0]

        image.save(img_out_path)

        print(f"getting bucket name")
        """
        created iam users in aws, and policys get and put object for these users. Access keys were created for each user, 
        these access key secrets are used to authenticate to aws.
        """
        print(f"bucket name retireved as: {self.s3_bucket_name}")
        print(f"starting s3 client")

        image_prompt = f"{prompt} album cover art"

        print(f"uploading files to s3 bucket: {self.s3_bucket_name}, from paths: {img_out_path}, {music_out_path}")
        self.upload_to_s3(img_out_path, self.s3_bucket_name, img_cloud_path)
        print(f"uploaded image to s3 at path: {img_cloud_path}")
        self.upload_to_s3(music_out_path, self.s3_bucket_name, music_cloud_path)
        print(f"uploaded music to s3 at path: {music_cloud_path}")
         # read the audio file and encode it to base64

        try:
            with open(music_out_path, "rb") as f:
                out_bytes = f.read()
            out_bytes = base64.b64encode(out_bytes)
            out_str = out_bytes.decode("utf-8")
            os.remove(img_out_path)
            os.remove(music_out_path)
        except Exception as e:
            logger = logging.getLogger("Musify.MusicModelServer.generateAndPostToS3")
            logger.exception("Error decoding audio file: %s", e)
            raise
        return GeneratedMusicResponseS3(audio_str=out_str, lyrics=formatted_lyrics, categories=categories)

@app.local_entrypoint()
def main():
    logger = logging.getLogger("Musify.main")
    logger.setLevel(logging.INFO)
    server = MusicModelServer(
        image_model_name="stabilityai/sdxl-turbo",
        llm_model_name="Qwen/Qwen2.5-7B-Instruct",
    )
    print(server.image_model_name)
    print(server.llm_model_name)

    print("Initializing MusicModelServer with parameters")
    # Pass parameters directly to the constructor (not with_options)

    endpoint_url = server.generateAndPostToS3.get_web_url()

    print("Generated endpoint URL: %s", endpoint_url)
    SendAndProcessRequest(endpoint_url, server.image_model_name, server.llm_model_name)


def SendAndProcessRequest(endpoint_url, image_model_name, llm_model_name):
    print("Sending request to endpoint: %s", endpoint_url)
    print("Using image model: %s", image_model_name)
    print("Using LLM model: %s", llm_model_name)

    logger = logging.getLogger("Musify.SendAndProcessRequest")
    logger.setLevel(logging.INFO)
    try:
        # print("MusicModelServer initialized with image_model_name and llm_model_name")
        # print("Retrieving endpoint URL for server.generate")

        print("Endpoint URL: %s", endpoint_url)

        print("Sending POST request to endpoint with parameters in URL")

        headers = {
            # "Content-Type": "application/json",
            "Modal-Key": "wk-aIgKfBM8NM1gBphvZVbU8Q",
            "Modal-Secret": "ws-ABk8JMBWAmquIJdhHjfjEl"
        }
        # For parametrized web endpoints, pass parameters as query parameters
        response = requests.post(
            endpoint_url,
            params={
                "image_model_name": image_model_name,
                "llm_model_name": llm_model_name,
            },
            headers=headers,
            timeout=(30, 300),
        )
        print(response.ok)
        print("Received response with status code: %s", response.status_code)
        # print("Response text: %s", response.text)

        # Check if response is successful before parsing JSON
        if not response.ok:
            logger.error(
                "Endpoint returned error status %s: %s",
                response.status_code,
                response.text,
            )
            raise ValueError(
                f"Endpoint error ({response.status_code}): {response.text}"
            )

        # NOTE: the code currently uses a placeholder GeneratedMusicResponse.
        # If the real endpoint returns audio, parse it here.
        if not response.text:
            logger.error(
                "Endpoint returned empty response body. Status: %s",
                response.status_code,
            )
            raise ValueError("Empty response from endpoint")

        try:
            response_json = response.json()
            # print("Response JSON: %s", response_json[:10])
        except Exception as e:
            logger.error(
                "Failed to parse response as JSON. Error: %s. Response text: %s",
                e,
                response.text,
            )
            raise
        # breakpoint()

        music_response = GeneratedMusicResponseS3(audio_str=response_json["audio_str"], lyrics=response_json["lyrics"], categories=response_json["categories"])

        if response.ok:
            out_fname = f"{uuid.uuid4()}.wav"
            # os.makedirs('/model_outputs/', exist_ok=True)
            print("Decoding audio string and writing to %s", out_fname)
            print(f"len audio str: {len(music_response.audio_str)}")
            res_bytes = base64.b64decode(music_response.audio_str)
            print(f"returned categories: {music_response.categories}")
            print(f"returned lyrics: {music_response.lyrics}")
            print(os.path.abspath(out_fname))
            with open(out_fname, "wb") as stream:
                stream.write(res_bytes)

            size = os.path.getsize(out_fname)

            print("Wrote audio file %s (%d bytes)", out_fname, size)
        else:
            logger.error(
                "Endpoint returned non-OK status: %s. Response text: %s",
                response.status_code,
                response.text,
            )
    except Exception as e:
        logger.exception("Error in generateMusic: %s", e)
        raise
    return True
