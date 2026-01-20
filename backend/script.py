import modal

app = modal.App("music generator")
image = (modal.Image.debian_slim().apt_install("git")
         .pip_install_from_requirements("requirements.txt")
         .add_local_python_source("stuff")
         .run_commands([
             'git clone https://github.com/ace-step/ACE-Step.git /tmp/ace-50'
             , 'cd /tmp/ace-50 && pip install -e .'
             ,'pip install -r requirements.txt'
             ])
         )
secrets = modal.Secret.from_name("my-secret")
modelsVolume = modal.Volume('models-volume',create_if_missing=True)

@app.function(image=image, timeout=300, gpu="A100", secrets=[secrets], volumes={"/models": modelsVolume})
def run_script():
    print("hello from modal!")

@app.local_entrypoint()

def main():

    run_script.remote()

