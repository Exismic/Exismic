import modal
import os
import base64
import tempfile
import shutil

# Define the Modal Image
# We need torch, demucs, and ffmpeg
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg")
    .pip_install("demucs", "torch", "torchaudio", "numpy", "fastapi[standard]", "torchcodec")
)

app = modal.App("lumora-vocal-remover")

from pydantic import BaseModel

class SeparationRequest(BaseModel):
    file_name: str
    file_data_base64: str
    stems: int = 2

@app.function(image=image, gpu="any", timeout=600)
@modal.fastapi_endpoint(method="POST")
async def separate(req: SeparationRequest):
    """
    Modal endpoint for high-speed AI vocal separation.
    """
    file_name = req.file_name
    file_data_base64 = req.file_data_base64
    num_stems = int(req.stems)
    
    print(f"Separation requested for {file_name} with {num_stems} stems")
    
    import torch
    from demucs.pretrained import get_model
    from demucs.apply import apply_model
    from demucs.audio import AudioFile, save_audio

    temp_dir = tempfile.mkdtemp()
    try:
        # 1. Decode and Save Input
        input_path = os.path.join(temp_dir, file_name)
        if "," in file_data_base64:
            file_data_base64 = file_data_base64.split(",")[1]
            
        with open(input_path, "wb") as f:
            f.write(base64.b64decode(file_data_base64))

        # 2. Load Model
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")
        model = get_model("htdemucs")
        model.to(device)

        # 3. Read Audio
        wav = AudioFile(input_path).read(
            streams=0, 
            samplerate=model.samplerate, 
            channels=model.audio_channels
        )

        # 4. Apply Model
        print("Running Demucs model...")
        sources = apply_model(model, wav[None], device=device)[0]
        print(f"Model sources: {model.sources}")

        # 5. Save and Encode Stems
        result_stems = {}
        
        # Helper to save as MP3 and encode
        def process_stem(source, name):
            print(f"Processing stem: {name}")
            wav_path = os.path.join(temp_dir, f"{name}.wav")
            mp3_path = os.path.join(temp_dir, f"{name}.mp3")
            save_audio(source, wav_path, samplerate=model.samplerate)
            
            import subprocess
            subprocess.run([
                "ffmpeg", "-i", wav_path, 
                "-codec:a", "libmp3lame", 
                "-b:a", "192k", 
                mp3_path
            ], check=True)
            
            with open(mp3_path, "rb") as f:
                return f"data:audio/mpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"

        if num_stems == 4:
            for name, source in zip(model.sources, sources):
                result_stems[name] = process_stem(source, name)
        else:
            # Default 2-stem output
            vocal_idx = model.sources.index("vocals")
            vocal_source = sources[vocal_idx]
            
            instrumental_source = None
            for i, source in enumerate(sources):
                if i == vocal_idx: continue
                if instrumental_source is None: instrumental_source = source
                else: instrumental_source += source

            result_stems["vocals"] = process_stem(vocal_source, "vocals")
            result_stems["instrumental"] = process_stem(instrumental_source, "instrumental")

        print(f"Returning stems: {list(result_stems.keys())}")
        return {
            "success": True,
            "result": {
                **result_stems,
                "fileName": file_name
            }
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        shutil.rmtree(temp_dir)
