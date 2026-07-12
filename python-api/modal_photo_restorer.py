import io
import logging
import os
import time
from typing import Callable

import modal

# Setup Modal Image with Python 3.10 (very stable for PyTorch + GFPGAN/basicsr)
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("libgl1-mesa-glx", "libglib2.0-0", "libgomp1")
    .run_commands(
        "pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu",
        "pip install setuptools wheel"
    )
    .pip_install(
        "fastapi[standard]",
        "python-multipart",
        "pillow",
        "opencv-python-headless",
        "gfpgan",
        "basicsr",
        "facexlib"
    )
    # Pre-download the GFP-GAN v1.3 model weights into the container image to prevent slow downloads at runtime
    .run_commands(
        "python -c \"import urllib.request; urllib.request.urlretrieve('https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth', 'GFPGANv1.3.pth')\""
    )
)

app = modal.App("lumora-photo-restorer")

@app.function(
    image=image,
    timeout=120,
    startup_timeout=300,
    scaledown_window=300,
    secrets=[modal.Secret.from_name("lumora-bg-remover")],
)
@modal.asgi_app(label="lumora-photo-restorer")
def fastapi_app() -> Callable:
    import torch
    from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, Response
    import numpy as np
    import cv2
    from PIL import Image
    from gfpgan import GFPGANer

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("lumora-photo-restorer")

    # Reuse existing API keys configured in the Secret
    api_key = os.environ.get("PHOTO_RESTORER_API_KEY") or os.environ.get("BG_REMOVER_API_KEY")
    if not api_key:
        logger.warning("No API key found in Secret environment.")

    # Initialize the GFPGAN model
    logger.info("Initializing GFPGANer...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    restorer = GFPGANer(
        model_path='GFPGANv1.3.pth',
        upscale=2,
        arch='clean',
        channel_multiplier=2,
        bg_upsampler=None,
        device=device
    )
    logger.info(f"GFPGANer initialized successfully on: {device}")

    web_app = FastAPI(title="Lumora Photo Restorer", version="1.0.0")
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["POST", "GET"],
        allow_headers=["*"],
    )

    def validate_api_key(x_api_key: str | None) -> None:
        if not api_key:
            return  # Allow skip if not set for easier local development
        if not x_api_key or x_api_key != api_key:
            raise HTTPException(status_code=401, detail="Invalid API key.")

    @web_app.get("/health")
    async def health():
        return {"status": "ready", "device": device}

    @web_app.post("/restore")
    async def restore_photo(
        file: UploadFile = File(...),
        strength: str = Form("70"),
        faces: str = Form("true"),
        color: str = Form("true"),
        sharpen: str = Form("true"),
        denoise: str = Form("true"),
        upscale: str = Form("1"),
        x_api_key: str | None = Header(default=None),
    ):
        validate_api_key(x_api_key)

        started = time.perf_counter()
        input_bytes = await file.read()
        if not input_bytes:
            raise HTTPException(status_code=400, detail="No image bytes received.")

        try:
            nparr = np.frombuffer(input_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Decode returned empty image.")
        except Exception as e:
            logger.warning("Invalid image upload: %s", e)
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")

        logger.info(
            "Processing file=%s content_type=%s bytes=%s",
            file.filename,
            file.content_type,
            len(input_bytes),
        )

        try:
            # Run GFPGAN face restoration
            # arch='clean' matches the GFPGANv1.3 architecture
            _, _, restored_img = restorer.enhance(
                img,
                has_aligned=False,
                only_center_face=False,
                paste_back=True
            )
            
            # Encode back to PNG bytes
            _, encoded_img = cv2.imencode(".png", restored_img)
            output_bytes = encoded_img.tobytes()
        except Exception as exc:
            logger.exception("GFP-GAN enhancement failed")
            raise HTTPException(status_code=500, detail="Photo restoration failed.") from exc

        elapsed_ms = round((time.perf_counter() - started) * 1000)
        logger.info("Photo restored in %sms", elapsed_ms)

        return Response(
            content=output_bytes,
            media_type="image/png",
            headers={
                "X-Processing-Time-Ms": str(elapsed_ms),
                "Content-Disposition": 'inline; filename="restored.png"',
            },
        )

    return web_app
