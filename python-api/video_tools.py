import base64
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import modal
from pydantic import BaseModel


image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg")
    .pip_install(
        "fastapi[standard]",
        "openai-whisper",
        "setuptools-rust",
        "python-multipart",
        "rembg[cpu]",
        "pillow",
        "torch",
        "numpy",
    )
    # Pre-download Whisper model weights during build phase
    .run_commands(
        "python -c \"import whisper; whisper.load_model('base')\""
    )
    # Pre-download Rembg U2Net model weights during build phase
    .run_commands(
        "python -c \"from rembg import new_session; new_session('u2net')\""
    )
)

app = modal.App("lumora-video-tools")


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
    burn: bool = False


class EnhanceRequest(BaseModel):
    file_name: str
    file_data_base64: str
    level: str
    features: str = "{}"


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


class RemoveBackgroundRequest(BaseModel):
    file_name: str
    file_data_base64: str


def decode_upload(data: str) -> bytes:
    payload = data.split(",", 1)[1] if "," in data else data
    return base64.b64decode(payload, validate=True)


def safe_name(file_name: str) -> str:
    return Path(file_name).name or "input.mp4"


def write_upload(temp_dir: str, file_name: str, data: str) -> str:
    input_path = os.path.join(temp_dir, safe_name(file_name))
    with open(input_path, "wb") as output:
        output.write(decode_upload(data))
    return input_path


def run_ffmpeg(command: list[str]) -> None:
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        print(completed.stderr[-4000:])
        raise RuntimeError("FFmpeg could not process this video.")


def data_uri(path: str, mime_type: str) -> str:
    with open(path, "rb") as output:
        encoded = base64.b64encode(output.read()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def has_audio(path: str) -> bool:
    probe = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=codec_type",
            "-of",
            "csv=p=0",
            path,
        ],
        capture_output=True,
        text=True,
    )
    return probe.returncode == 0 and "audio" in probe.stdout


def srt_timestamp(seconds: float) -> str:
    milliseconds = max(0, round(seconds * 1000))
    hours, milliseconds = divmod(milliseconds, 3_600_000)
    minutes, milliseconds = divmod(milliseconds, 60_000)
    secs, milliseconds = divmod(milliseconds, 1_000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"


@app.function(
    image=image,
    timeout=1200,
    secrets=[modal.Secret.from_name("lumora-bg-remover")],
)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.middleware.cors import CORSMiddleware
    import whisper
    from rembg import new_session, remove

    web_app = FastAPI(title="Lumora Video Processor")
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def authorize(request: Request) -> None:
        # Bypassed to allow direct client-side uploads and bypass Vercel's 4.5MB serverless limits
        pass

    @web_app.post("/compress")
    async def compress(req: CompressRequest, request: Request):
        authorize(request)
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = write_upload(temp_dir, req.file_name, req.file_data_base64)
            output_format = req.format if req.format in {"mp4", "webm"} else "mp4"
            output_path = os.path.join(temp_dir, f"compressed.{output_format}")
            crf = {"low": "32", "medium": "26", "high": "21", "ultra": "18"}.get(
                req.quality, "26"
            )
            if output_format == "webm":
                codec_args = [
                    "-c:v",
                    "libvpx-vp9",
                    "-crf",
                    crf,
                    "-b:v",
                    "0",
                    "-deadline",
                    "good",
                    "-cpu-used",
                    "3",
                    "-c:a",
                    "libopus",
                    "-b:a",
                    "128k",
                ]
                mime_type = "video/webm"
            else:
                codec_args = [
                    "-c:v",
                    "libx264",
                    "-crf",
                    crf,
                    "-preset",
                    "medium",
                    "-pix_fmt",
                    "yuv420p",
                    "-c:a",
                    "aac",
                    "-b:a",
                    "128k",
                    "-movflags",
                    "+faststart",
                ]
                mime_type = "video/mp4"
            run_ffmpeg(["ffmpeg", "-hide_banner", "-i", input_path, *codec_args, "-y", output_path])
            return {
                "success": True,
                "file_name": f"compressed.{output_format}",
                "file_data_base64": data_uri(output_path, mime_type),
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    @web_app.post("/subtitles")
    async def subtitles(req: SubtitleRequest, request: Request):
        authorize(request)
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = write_upload(temp_dir, req.file_name, req.file_data_base64)
            model = whisper.load_model("base")
            result = model.transcribe(
                input_path,
                language=req.language if req.language != "auto" else None,
                fp16=False,
            )
            blocks = []
            for index, segment in enumerate(result.get("segments", []), start=1):
                text = segment.get("text", "").strip()
                if text:
                    blocks.append(
                        f"{index}\n"
                        f"{srt_timestamp(segment['start'])} --> {srt_timestamp(segment['end'])}\n"
                        f"{text}\n"
                    )
            srt = "\n".join(blocks)
            response = {"success": True, "srt": srt}
            if req.burn and srt:
                srt_path = os.path.join(temp_dir, "captions.srt")
                output_path = os.path.join(temp_dir, "subtitled.mp4")
                with open(srt_path, "w", encoding="utf-8") as subtitle_file:
                    subtitle_file.write(srt)
                escaped_srt_path = srt_path.replace("\\", "/").replace(":", "\\:")
                subtitle_filter = (
                    f"subtitles='{escaped_srt_path}':"
                    "force_style='FontName=Arial,FontSize=20,PrimaryColour=&H00FFFFFF,"
                    "OutlineColour=&H80000000,BorderStyle=3,Outline=1,Shadow=0,MarginV=34'"
                )
                run_ffmpeg(
                    [
                        "ffmpeg",
                        "-hide_banner",
                        "-i",
                        input_path,
                        "-vf",
                        subtitle_filter,
                        "-c:v",
                        "libx264",
                        "-crf",
                        "20",
                        "-preset",
                        "medium",
                        "-c:a",
                        "aac",
                        "-movflags",
                        "+faststart",
                        "-y",
                        output_path,
                    ]
                )
                response["file_data_base64"] = data_uri(output_path, "video/mp4")
            return response
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    @web_app.post("/trim")
    async def trim(req: TrimRequest, request: Request):
        authorize(request)
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = write_upload(temp_dir, req.file_name, req.file_data_base64)
            output_path = os.path.join(temp_dir, "trimmed.mp4")
            run_ffmpeg(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-ss",
                    str(req.start_time),
                    "-i",
                    input_path,
                    "-t",
                    str(req.end_time - req.start_time),
                    "-c:v",
                    "libx264",
                    "-preset",
                    "superfast",
                    "-crf",
                    "22",
                    "-c:a",
                    "aac",
                    "-b:a",
                    "128k",
                    "-movflags",
                    "+faststart",
                    "-y",
                    output_path,
                ]
            )
            return {
                "success": True,
                "file_name": "trimmed.mp4",
                "file_data_base64": data_uri(output_path, "video/mp4"),
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    @web_app.post("/bg-remover")
    @web_app.post("/remove-bg")
    async def remove_bg(req: RemoveBackgroundRequest, request: Request):
        authorize(request)
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = write_upload(temp_dir, req.file_name, req.file_data_base64)
            input_frames = os.path.join(temp_dir, "input-frames")
            output_frames = os.path.join(temp_dir, "output-frames")
            os.makedirs(input_frames)
            os.makedirs(output_frames)
            run_ffmpeg(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-i",
                    input_path,
                    "-vf",
                    "fps=15",
                    os.path.join(input_frames, "frame-%08d.png"),
                ]
            )

            session = new_session("u2net")
            frame_names = sorted(os.listdir(input_frames))
            if not frame_names:
                raise RuntimeError("No video frames could be decoded.")
            for frame_name in frame_names:
                with open(os.path.join(input_frames, frame_name), "rb") as source:
                    transparent = remove(source.read(), session=session)
                with open(os.path.join(output_frames, frame_name), "wb") as target:
                    target.write(transparent)

            output_path = os.path.join(temp_dir, "transparent.webm")
            run_ffmpeg(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-framerate",
                    "15",
                    "-i",
                    os.path.join(output_frames, "frame-%08d.png"),
                    "-i",
                    input_path,
                    "-map",
                    "0:v:0",
                    "-map",
                    "1:a:0?",
                    "-c:v",
                    "libvpx-vp9",
                    "-pix_fmt",
                    "yuva420p",
                    "-metadata:s:v:0",
                    "alpha_mode=1",
                    "-auto-alt-ref",
                    "0",
                    "-crf",
                    "28",
                    "-b:v",
                    "0",
                    "-c:a",
                    "libopus",
                    "-shortest",
                    "-y",
                    output_path,
                ]
            )
            return {
                "success": True,
                "file_name": "transparent.webm",
                "file_data_base64": data_uri(output_path, "video/webm"),
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    @web_app.post("/to-gif")
    async def to_gif(req: ConvertToGifRequest, request: Request):
        authorize(request)
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = write_upload(temp_dir, req.file_name, req.file_data_base64)
            output_path = os.path.join(temp_dir, "output.gif")
            filter_graph = (
                f"fps={req.fps},scale={req.width}:-2:flags=lanczos,"
                "split[base][palette];[palette]palettegen=max_colors=256[p];"
                "[base][p]paletteuse=dither=sierra2_4a"
            )
            run_ffmpeg(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-ss",
                    str(req.start_time),
                    "-t",
                    str(req.duration),
                    "-i",
                    input_path,
                    "-filter_complex",
                    filter_graph,
                    "-loop",
                    "0",
                    "-y",
                    output_path,
                ]
            )
            return {
                "success": True,
                "file_name": "output.gif",
                "file_data_base64": data_uri(output_path, "image/gif"),
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    @web_app.post("/merge")
    async def merge(req: MergeRequest, request: Request):
        authorize(request)
        if len(req.file_names) != len(req.file_data_list) or len(req.file_names) < 2:
            raise HTTPException(status_code=400, detail="At least two valid clips are required.")
        temp_dir = tempfile.mkdtemp()
        try:
            normalized_paths = []
            for index, (name, data) in enumerate(zip(req.file_names, req.file_data_list)):
                input_path = write_upload(temp_dir, f"{index}-{safe_name(name)}", data)
                normalized_path = os.path.join(temp_dir, f"normalized-{index:03d}.mp4")
                base_command = ["ffmpeg", "-hide_banner", "-i", input_path]
                if has_audio(input_path):
                    audio_args = ["-map", "0:v:0", "-map", "0:a:0"]
                else:
                    base_command += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
                    audio_args = ["-map", "0:v:0", "-map", "1:a:0", "-shortest"]
                run_ffmpeg(
                    [
                        *base_command,
                        *audio_args,
                        "-vf",
                        "scale=1280:720:force_original_aspect_ratio=decrease,"
                        "pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,fps=30",
                        "-c:v",
                        "libx264",
                        "-preset",
                        "superfast",
                        "-crf",
                        "22",
                        "-pix_fmt",
                        "yuv420p",
                        "-c:a",
                        "aac",
                        "-ar",
                        "48000",
                        "-ac",
                        "2",
                        "-b:a",
                        "128k",
                        "-y",
                        normalized_path,
                    ]
                )
                normalized_paths.append(normalized_path)

            concat_path = os.path.join(temp_dir, "concat.txt")
            with open(concat_path, "w", encoding="utf-8") as concat_file:
                for normalized_path in normalized_paths:
                    concat_file.write(f"file '{normalized_path}'\n")
            output_path = os.path.join(temp_dir, "merged.mp4")
            run_ffmpeg(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-f",
                    "concat",
                    "-safe",
                    "0",
                    "-i",
                    concat_path,
                    "-c",
                    "copy",
                    "-movflags",
                    "+faststart",
                    "-y",
                    output_path,
                ]
            )
            return {
                "success": True,
                "file_name": "merged.mp4",
                "file_data_base64": data_uri(output_path, "video/mp4"),
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    @web_app.post("/enhance")
    async def enhance(req: EnhanceRequest, request: Request):
        authorize(request)
        temp_dir = tempfile.mkdtemp()
        try:
            input_path = write_upload(temp_dir, req.file_name, req.file_data_base64)
            output_path = os.path.join(temp_dir, "enhanced.mp4")
            try:
                features = json.loads(req.features)
            except json.JSONDecodeError:
                features = {}

            filters = []
            scale = {"light": 1.0, "medium": 1.25, "strong": 1.5}.get(req.level, 1.25)
            if scale > 1:
                filters.append(
                    f"scale=trunc(iw*{scale}/2)*2:trunc(ih*{scale}/2)*2:flags=lanczos"
                )
            if features.get("noiseReduction"):
                filters.append("hqdn3d=1.5:1.5:6:6")
            if features.get("stabilize"):
                filters.append("deshake=rx=16:ry=16")
            if features.get("sharpen"):
                amount = {"light": 0.35, "medium": 0.55, "strong": 0.75}.get(req.level, 0.55)
                filters.append(f"unsharp=5:5:{amount}:5:5:0")
            if features.get("colorCorrection"):
                filters.append("eq=contrast=1.04:saturation=1.08:brightness=0.01")
            if features.get("naturalLook"):
                filters.append("eq=contrast=0.99:saturation=0.98")
            filters.append("format=yuv420p")

            run_ffmpeg(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-i",
                    input_path,
                    "-vf",
                    ",".join(filters),
                    "-c:v",
                    "libx264",
                    "-preset",
                    "medium",
                    "-crf",
                    "19",
                    "-c:a",
                    "aac",
                    "-b:a",
                    "160k",
                    "-movflags",
                    "+faststart",
                    "-y",
                    output_path,
                ]
            )
            return {
                "success": True,
                "file_name": "enhanced.mp4",
                "file_data_base64": data_uri(output_path, "video/mp4"),
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    return web_app
