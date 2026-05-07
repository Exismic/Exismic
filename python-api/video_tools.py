import modal
import os
import base64
import tempfile
import shutil
import subprocess
import json
from pydantic import BaseModel

# Define the Modal Image with FFmpeg and Whisper AI
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg")
    .pip_install("fastapi[standard]", "openai-whisper", "setuptools-rust", "python-multipart")
)

app = modal.App("lumora-video-tools")

# --- CUSTOM FASTAPI APP WITH CORS ---
@app.function(image=image)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    web_app = FastAPI()
    
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class MergeRequest(BaseModel):
        file_names: list[str]
        file_data_list: list[str]

    @web_app.post("/merge")
    async def merge_videos_endpoint(req: MergeRequest):
        return await enhance_video_logic(req, "merge")

    @web_app.post("/enhance")
    async def enhance_video_endpoint(req: dict):
        # We'll use a generic dict or specific model here
        return {"success": True, "message": "Hit enhance via CORS"}

    return web_app

# Models for standalone endpoints (keep these for direct Modal calls if needed)
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
    burn_subtitles: bool = False

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

@app.function(image=image, timeout=600)
@modal.fastapi_endpoint(method="POST")
async def compress_video(req: CompressRequest):
    file_name = req.file_name
    file_data_base64 = req.file_data_base64
    quality = req.quality
    target_format = req.format
    crf_map = {"low": "32", "medium": "26", "high": "21", "ultra": "18"}
    crf = crf_map.get(quality, "26")
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, f"input_{file_name}")
        if "," in file_data_base64: file_data_base64 = file_data_base64.split(",")[1]
        with open(input_path, "wb") as f: f.write(base64.b64decode(file_data_base64))
        output_name = f"compressed_{os.path.splitext(file_name)[0]}.{target_format}"
        output_path = os.path.join(temp_dir, output_name)
        cmd = ["ffmpeg", "-i", input_path]
        if target_format == "mp4":
            cmd += ["-c:v", "libx264", "-crf", crf, "-preset", "superfast", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"]
        elif target_format == "webm":
            cmd += ["-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-c:a", "libopus"]
        cmd += ["-y", output_path]
        subprocess.run(cmd, check=True)
        with open(output_path, "rb") as f: encoded_data = base64.b64encode(f.read()).decode('utf-8')
        return {"success": True, "file_name": output_name, "file_data_base64": f"data:video/{target_format};base64,{encoded_data}"}
    except Exception as e: return {"success": False, "error": str(e)}
    finally: shutil.rmtree(temp_dir)

@app.function(image=image, gpu="A10G", timeout=600)
@modal.fastapi_endpoint(method="POST")
async def generate_subtitles(req: SubtitleRequest):
    import whisper
    file_name = req.file_name
    file_data_base64 = req.file_data_base64
    language = req.language
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, f"input_{file_name}")
        if "," in file_data_base64: file_data_base64 = file_data_base64.split(",")[1]
        with open(input_path, "wb") as f: f.write(base64.b64decode(file_data_base64))
        audio_path = os.path.join(temp_dir, "audio.mp3")
        subprocess.run(["ffmpeg", "-i", input_path, "-q:a", "0", "-map", "a", audio_path, "-y"], check=True)
        model = whisper.load_model("base")
        result = model.transcribe(audio_path, language=language if language != "auto" else None)
        def format_timestamp(seconds: float):
            td = seconds
            hours = int(td // 3600); minutes = int((td % 3600) // 60); seconds = int(td % 60); ms = int((td % 1) * 1000)
            return f"{hours:02}:{minutes:02}:{seconds:02},{ms:03}"
        srt_content = ""
        for i, segment in enumerate(result['segments']):
            start = format_timestamp(segment['start']); end = format_timestamp(segment['end']); text = segment['text'].strip()
            srt_content += f"{i + 1}\n{start} --> {end}\n{text}\n\n"
        srt_path = os.path.join(temp_dir, "subs.srt")
        with open(srt_path, "w", encoding="utf-8") as f: f.write(srt_content)
        output_video_path = os.path.join(temp_dir, f"subtitled_{file_name}")
        escaped_srt_path = srt_path.replace("\\", "/").replace(":", "\\:")
        subtitle_filter = f"subtitles={escaped_srt_path}:force_style='FontSize=18,PrimaryColour=&H00FFFF,OutlineColour=&H000000,BorderStyle=3'"
        subprocess.run(["ffmpeg", "-i", input_path, "-vf", subtitle_filter, "-c:v", "libx264", "-preset", "superfast", "-crf", "23", "-c:a", "copy", "-y", output_video_path], check=True)
        with open(output_video_path, "rb") as f: final_video_base64 = base64.b64encode(f.read()).decode('utf-8')
        return {"success": True, "srt": srt_content, "file_data_base64": f"data:video/mp4;base64,{final_video_base64}"}
    except Exception as e: return {"success": False, "error": str(e)}
    finally: shutil.rmtree(temp_dir)

@app.function(image=image, timeout=600)
@modal.fastapi_endpoint(method="POST")
async def trim_video(req: TrimRequest):
    file_name = req.file_name; file_data_base64 = req.file_data_base64; start_time = req.start_time; end_time = req.end_time; duration = end_time - start_time
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, f"input_{file_name}")
        if "," in file_data_base64: file_data_base64 = file_data_base64.split(",")[1]
        with open(input_path, "wb") as f: f.write(base64.b64decode(file_data_base64))
        output_path = os.path.join(temp_dir, f"trimmed_{file_name}")
        subprocess.run(["ffmpeg", "-ss", str(start_time), "-i", input_path, "-t", str(duration), "-c:v", "libx264", "-preset", "superfast", "-crf", "23", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-y", output_path], check=True)
        with open(output_path, "rb") as f: encoded_data = base64.b64encode(f.read()).decode('utf-8')
        return {"success": True, "file_name": f"trimmed_{file_name}", "file_data_base64": f"data:video/mp4;base64,{encoded_data}"}
    except Exception as e: return {"success": False, "error": str(e)}
    finally: shutil.rmtree(temp_dir)

@app.function(image=image, timeout=600)
@modal.fastapi_endpoint(method="POST")
async def enhance_video(req: EnhanceRequest):
    file_name = req.file_name; file_data_base64 = req.file_data_base64; level = req.level; features = json.loads(req.features)
    use_stabilize = features.get("stabilize", False); use_sharpen = features.get("sharpen", True); use_denoise = features.get("noiseReduction", True); use_color = features.get("colorCorrection", True); natural_look = features.get("naturalLook", True)
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, f"input_{file_name}")
        if "," in file_data_base64: file_data_base64 = file_data_base64.split(",")[1]
        with open(input_path, "wb") as f: f.write(base64.b64decode(file_data_base64))
        output_path = os.path.join(temp_dir, f"enhanced_{file_name}")
        current_input = input_path
        if use_stabilize:
            transforms_path = os.path.join(temp_dir, "transforms.trf")
            subprocess.run(["ffmpeg", "-i", current_input, "-vf", "vidstabdetect=result=" + transforms_path + ":shakiness=6:accuracy=15", "-f", "null", "-"], check=True)
            stab_output = os.path.join(temp_dir, "stab_temp.mp4")
            subprocess.run(["ffmpeg", "-i", current_input, "-vf", f"vidstabtransform=input={transforms_path}:smoothing=20:relative=1:zoom=3:optzoom=1", "-c:v", "libx264", "-preset", "superfast", "-crf", "18", stab_output], check=True)
            current_input = stab_output
        vf_filters = []
        if use_denoise:
            if level == "light": denoise_params = "2:2:4:4" if natural_look else "2:2:3:3"
            elif level == "strong": denoise_params = "5:5:10:10" if natural_look else "6:6:9:9"
            else: denoise_params = "3:3:7:7" if natural_look else "4:4:6:6"
            vf_filters.append(f"hqdn3d={denoise_params}")
        if use_sharpen:
            s_map = {"light": {"x": 3, "y": 3, "amount": 0.3}, "medium": {"x": 3, "y": 3, "amount": 0.5}, "strong": {"x": 5, "y": 5, "amount": 0.7}}
            s_cfg = s_map.get(level, s_map["medium"])
            amount = s_cfg["amount"]
            if natural_look: amount = round(amount * 0.5, 2)
            vf_filters.append(f"unsharp={s_cfg['x']}:{s_cfg['y']}:{amount}:{s_cfg['x']}:{s_cfg['y']}:0.0")
        if use_color:
            c_map = {"light": "contrast=1.02:brightness=0.01:saturation=1.05", "medium": "contrast=1.05:brightness=0.02:saturation=1.1", "strong": "contrast=1.1:brightness=0.04:saturation=1.2"}
            vf_filters.append(f"eq={c_map.get(level, 'contrast=1.05:brightness=0.02:saturation=1.1')}")
        cmd = ["ffmpeg", "-i", current_input]
        if vf_filters: cmd += ["-vf", ",".join(vf_filters)]
        cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "copy", "-movflags", "+faststart", "-y", output_path]
        subprocess.run(cmd, check=True)
        with open(output_path, "rb") as f: encoded_data = base64.b64encode(f.read()).decode('utf-8')
        return {"success": True, "file_name": f"enhanced_{file_name}", "file_data_base64": f"data:video/mp4;base64,{encoded_data}"}
    except Exception as e: return {"success": False, "error": str(e)}
    finally: shutil.rmtree(temp_dir)

@app.function(image=image, timeout=600)
@modal.fastapi_endpoint(method="POST")
async def convert_to_gif(req: ConvertToGifRequest):
    file_name = req.file_name; file_data_base64 = req.file_data_base64; start_time = req.start_time; duration = req.duration; fps = req.fps; width = req.width
    temp_dir = tempfile.mkdtemp()
    try:
        input_path = os.path.join(temp_dir, f"input_{file_name}")
        if "," in file_data_base64: file_data_base64 = file_data_base64.split(",")[1]
        with open(input_path, "wb") as f: f.write(base64.b64decode(file_data_base64))
        palette_path = os.path.join(temp_dir, "palette.png"); output_path = os.path.join(temp_dir, "output.gif")
        subprocess.run(["ffmpeg", "-ss", str(start_time), "-t", str(duration), "-i", input_path, "-vf", f"fps={fps},scale={width}:-1:flags=lanczos,palettegen", "-y", palette_path], check=True)
        subprocess.run(["ffmpeg", "-ss", str(start_time), "-t", str(duration), "-i", input_path, "-i", palette_path, "-lavfi", f"fps={fps},scale={width}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=sierra2_4a", "-y", output_path], check=True)
        with open(output_path, "rb") as f: encoded_data = base64.b64encode(f.read()).decode('utf-8')
        return {"success": True, "file_name": f"{os.path.splitext(file_name)[0]}.gif", "file_data_base64": f"data:image/gif;base64,{encoded_data}"}
    except Exception as e: return {"success": False, "error": str(e)}
    finally: shutil.rmtree(temp_dir)

@app.function(image=image, timeout=1200)
@modal.fastapi_endpoint(method="POST")
async def merge_videos(req: MergeRequest):
    file_names = req.file_names; file_data_list = req.file_data_list
    temp_dir = tempfile.mkdtemp()
    try:
        input_paths = []
        for i, (name, data) in enumerate(zip(file_names, file_data_list)):
            input_path = os.path.join(temp_dir, f"clip_{i}_{name}")
            if "," in data: data = data.split(",")[1]
            with open(input_path, "wb") as f: f.write(base64.b64decode(data))
            input_paths.append(input_path)
        output_path = os.path.join(temp_dir, "merged_output.mp4")
        filter_complex = ""
        for i in range(len(input_paths)):
            filter_complex += f"[{i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v{i}];"
        for i in range(len(input_paths)):
            filter_complex += f"[v{i}][{i}:a]"
        filter_complex += f"concat=n={len(input_paths)}:v=1:a=1[outv][outa]"
        cmd = ["ffmpeg"]
        for path in input_paths: cmd += ["-i", path]
        cmd += ["-filter_complex", filter_complex, "-map", "[outv]", "-map", "[outa]", "-c:v", "libx264", "-preset", "superfast", "-crf", "23", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-y", output_path]
        subprocess.run(cmd, check=True)
        with open(output_path, "rb") as f: encoded_data = base64.b64encode(f.read()).decode('utf-8')
        return {"success": True, "file_name": "merged_video.mp4", "file_data_base64": f"data:video/mp4;base64,{encoded_data}"}
    except Exception as e: return {"success": False, "error": str(e)}
    finally: shutil.rmtree(temp_dir)
