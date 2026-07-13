import io
import logging
import os
import time
from typing import Callable

import modal

# Setup Modal Image with Python 3.10
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
        "numpy",
        "simple-lama-inpainting"
    )
    # Pre-download LaMa weights into the container image cache during built phase
    .run_commands(
        "python -c \"from simple_lama_inpainting import SimpleLama; SimpleLama()\""
    )
)

app = modal.App("lumora-inpainter")

@app.function(
    image=image,
    timeout=120,
    startup_timeout=300,
    scaledown_window=300,
    secrets=[modal.Secret.from_name("lumora-bg-remover")],
)
@modal.asgi_app(label="lumora-inpainter")
def fastapi_app() -> Callable:
    from fastapi import FastAPI, File, Form, Header, HTTPException, Request, UploadFile
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, Response
    from PIL import Image
    from simple_lama_inpainting import SimpleLama

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("lumora-inpainter")

    # Reuse existing API key configured in the Secret
    api_key = os.environ.get("BG_REMOVER_API_KEY")
    if not api_key:
        logger.warning("No API key found in Secret environment.")

    logger.info("Initializing SimpleLama...")
    # SimpleLama automatically runs on CPU/GPU depending on device.
    # Runs extremely fast on CPU (around 200ms - 500ms).
    lama = SimpleLama()
    logger.info("SimpleLama initialized successfully.")

    web_app = FastAPI(title="Lumora Inpainter", version="1.0.0")
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
        return {"status": "ready"}

    @web_app.post("/inpaint")
    async def inpaint_image(
        image_file: UploadFile = File(...),
        mask_file: UploadFile = File(...),
        x_api_key: str | None = Header(default=None),
    ):
        validate_api_key(x_api_key)

        started = time.perf_counter()
        
        try:
            img_bytes = await image_file.read()
            mask_bytes = await mask_file.read()
            
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            mask = Image.open(io.BytesIO(mask_bytes)).convert("L")
            
            logger.info("Running LaMa inpainting inference...")
            result_img = lama(img, mask)
            
            # Save output to PNG bytes
            out_io = io.BytesIO()
            result_img.save(out_io, format="PNG")
            output_bytes = out_io.getvalue()
        except Exception as exc:
            logger.exception("Inpainting failed")
            raise HTTPException(status_code=500, detail=f"Inpainting failed: {str(exc)}")

        elapsed_ms = round((time.perf_counter() - started) * 1000)
        logger.info("Inpainted image in %sms", elapsed_ms)

        return Response(
            content=output_bytes,
            media_type="image/png",
            headers={
                "X-Processing-Time-Ms": str(elapsed_ms),
                "Content-Disposition": 'inline; filename="inpainted.png"',
            },
        )

    @web_app.post("/remove-watermark")
    async def remove_watermark(
        file: UploadFile = File(...),
        region: str = Form(...),  # JSON string of NormalizedRegion
        strength: str = Form("74"),
        x_api_key: str | None = Header(default=None),
    ):
        validate_api_key(x_api_key)

        started = time.perf_counter()
        
        try:
            img_bytes = await file.read()
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            
            # Parse region JSON
            import json
            reg = json.loads(region)
            
            # Create black mask
            from PIL import ImageDraw
            mask = Image.new("L", img.size, 0)
            draw = ImageDraw.Draw(mask)
            
            # Calculate coordinates
            w, h = img.size
            x = reg.get("x", 0)
            y = reg.get("y", 0)
            width = reg.get("width", 0.1)
            height = reg.get("height", 0.1)
            
            left = int(x * w)
            top = int(y * h)
            right = int((x + width) * w)
            bottom = int((y + height) * h)
            
            draw.rectangle([left, top, right, bottom], fill=255)
            
            logger.info("Running LaMa watermark inpainting inference...")
            result_img = lama(img, mask)
            
            # Save output to PNG bytes
            out_io = io.BytesIO()
            result_img.save(out_io, format="PNG")
            output_bytes = out_io.getvalue()
        except Exception as exc:
            logger.exception("Watermark removal failed")
            raise HTTPException(status_code=500, detail=f"Watermark removal failed: {str(exc)}")

        elapsed_ms = round((time.perf_counter() - started) * 1000)
        logger.info("Watermark removed in %sms", elapsed_ms)

        return Response(
            content=output_bytes,
            media_type="image/png",
            headers={
                "X-Processing-Time-Ms": str(elapsed_ms),
                "Content-Disposition": 'inline; filename="cleaned.png"',
            },
        )

    return web_app
