import modal
import os
import base64
import tempfile
import shutil
import subprocess
import json
from pydantic import BaseModel

# Define the Modal Image
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg")
    .pip_install("fastapi[standard]", "openai-whisper", "setuptools-rust", "python-multipart", "rembg", "pillow", "torch", "numpy")
)

app = modal.App("lumora-video-tools")

# Models
class TrimRequest(BaseModel):
    file_name: str
    file_data_base64: str
    start_time: float
    end_time: float

class CompressRequest(BaseModel):
    file_name: str
    file_data_base64: str
    quality: str
    format: str

class SubtitleRequest(BaseModel):
    file_name: str
    file_data_base64: str
    language: str

class EnhanceRequest(BaseModel):
    file_name: str
    file_data_base64: str
    level: str
    features: str

class ConvertToGifRequest(BaseModel):
    file_name: str
    file_data_base64: str
    start_time: float
    duration: float
    fps: int
    width: int

class MergeRequest(BaseModel):
    file_names: list[str]
    file_data_list: list[str]

# --- UNIFIED VIDEO API ---
@app.function(image=image, gpu="any", timeout=1200)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import whisper
    from rembg import remove
    from PIL import Image

    web_app = FastAPI()
    web_app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

    @web_app.post("/compress")
    async def compress(req: CompressRequest):
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = os.path.join(temp_dir, req.file_name)
            data = req.file_data_base64.split(",")[1] if "," in req.file_data_base64 else req.file_data_base64
            with open(input_path, "wb") as f: f.write(base64.b64decode(data))
            out_name = f"compressed_{req.file_name}"
            out_path = os.path.join(temp_dir, out_name)
            crf = {"low": "32", "medium": "26", "high": "21", "ultra": "18"}.get(req.quality, "26")
            cmd = ["ffmpeg", "-i", input_path, "-c:v", "libx264", "-crf", crf, "-preset", "superfast", "-y", out_path]
            subprocess.run(cmd, check=True)
            with open(out_path, "rb") as f: enc = base64.b64encode(f.read()).decode('utf-8')
            return {"success": True, "file_data_base64": f"data:video/mp4;base64,{enc}"}
        finally: shutil.rmtree(temp_dir)

    @web_app.post("/subtitles")
    async def subtitles(req: SubtitleRequest):
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = os.path.join(temp_dir, req.file_name)
            data = req.file_data_base64.split(",")[1] if "," in req.file_data_base64 else req.file_data_base64
            with open(input_path, "wb") as f: f.write(base64.b64decode(data))
            model = whisper.load_model("base")
            res = model.transcribe(input_path, language=req.language if req.language != "auto" else None)
            srt = ""
            for i, s in enumerate(res['segments']):
                srt += f"{i+1}\n{s['start']} --> {s['end']}\n{s['text'].strip()}\n\n"
            return {"success": True, "srt": srt}
        finally: shutil.rmtree(temp_dir)

    @web_app.post("/trim")
    async def trim(req: TrimRequest):
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = os.path.join(temp_dir, req.file_name)
            data = req.file_data_base64.split(",")[1] if "," in req.file_data_base64 else req.file_data_base64
            with open(input_path, "wb") as f: f.write(base64.b64decode(data))
            out_path = os.path.join(temp_dir, f"trim_{req.file_name}")
            subprocess.run(["ffmpeg", "-ss", str(req.start_time), "-i", input_path, "-t", str(req.end_time - req.start_time), "-c", "copy", "-y", out_path], check=True)
            with open(out_path, "rb") as f: enc = base64.b64encode(f.read()).decode('utf-8')
            return {"success": True, "file_data_base64": f"data:video/mp4;base64,{enc}"}
        finally: shutil.rmtree(temp_dir)

    @web_app.post("/remove-bg")
    async def remove_bg(req: dict):
        temp_dir = tempfile.mkdtemp()
        try:
            file_name = req.get("file_name")
            data = req.get("file_data_base64")
            input_path = os.path.join(temp_dir, file_name)
            data = data.split(",")[1] if "," in data else data
            with open(input_path, "wb") as f: f.write(base64.b64decode(data))
            
            f_in = os.path.join(temp_dir, "in"); f_out = os.path.join(temp_dir, "out")
            os.makedirs(f_in); os.makedirs(f_out)
            subprocess.run(["ffmpeg", "-i", input_path, "-vf", "fps=15", f"{f_in}/f_%04d.png"], check=True)
            
            for f in sorted(os.listdir(f_in)):
                with open(os.path.join(f_in, f), "rb") as rb:
                    with open(os.path.join(f_out, f), "wb") as wb:
                        wb.write(remove(rb.read()))
            
            out_path = os.path.join(temp_dir, "out.mp4")
            subprocess.run(["ffmpeg", "-i", f"{f_out}/f_%04d.png", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "superfast", "-y", out_path], check=True)
            with open(out_path, "rb") as f: enc = base64.b64encode(f.read()).decode('utf-8')
            return {"success": True, "file_data_base64": f"data:video/mp4;base64,{enc}"}
        finally: shutil.rmtree(temp_dir)

    @web_app.post("/to-gif")
    async def to_gif(req: ConvertToGifRequest):
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = os.path.join(temp_dir, req.file_name)
            data = req.file_data_base64.split(",")[1] if "," in req.file_data_base64 else req.file_data_base64
            with open(input_path, "wb") as f: f.write(base64.b64decode(data))
            out_path = os.path.join(temp_dir, "out.gif")
            subprocess.run(["ffmpeg", "-ss", str(req.start_time), "-t", str(req.duration), "-i", input_path, "-vf", f"fps={req.fps},scale={req.width}:-1", "-y", out_path], check=True)
            with open(out_path, "rb") as f: enc = base64.b64encode(f.read()).decode('utf-8')
            return {"success": True, "file_data_base64": f"data:image/gif;base64,{enc}"}
        finally: shutil.rmtree(temp_dir)

    return web_app
