import io
import logging
import os
import time
from typing import Callable

import modal


MODEL_NAME = "u2net"
MAX_IMAGE_BYTES = 12 * 1024 * 1024

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libglib2.0-0", "libgomp1")
    .pip_install(
        "fastapi[standard]",
        "python-multipart",
        "pillow",
        "rembg",
        "onnxruntime",
    )
    .run_commands(
        "python -c \"from rembg import new_session; new_session('u2net')\""
    )
)

app = modal.App("lumora-bg-remover")


@app.function(
    image=image,
    timeout=60,
    startup_timeout=180,
    scaledown_window=300,
    cpu=2.0,
    memory=4096,
    secrets=[modal.Secret.from_name("lumora-bg-remover")],
)
@modal.asgi_app(label="lumora-bg-remover")
def fastapi_app() -> Callable:
    from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, Response
    from PIL import Image
    from rembg import new_session, remove

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("lumora-bg-remover")

    api_key = os.environ.get("BG_REMOVER_API_KEY")
    if not api_key:
        logger.warning("BG_REMOVER_API_KEY is not configured.")

    session = None

    def get_session():
        nonlocal session
        if session is None:
            logger.info("Loading rembg session: %s", MODEL_NAME)
            session = new_session(MODEL_NAME)
            logger.info("rembg session loaded.")
        return session

    web_app = FastAPI(title="Lumora Background Remover", version="1.0.0")
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["POST", "GET"],
        allow_headers=["*"],
    )

    def validate_api_key(x_api_key: str | None) -> None:
        if not api_key:
            raise HTTPException(status_code=500, detail="Server API key is not configured.")
        if not x_api_key or x_api_key != api_key:
            raise HTTPException(status_code=401, detail="Invalid API key.")

    @web_app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"error": "Background removal failed."})

    @web_app.get("/health")
    async def health():
        return {"status": "ready", "model": MODEL_NAME}

    @web_app.post("/remove-bg")
    async def remove_background(
        file: UploadFile = File(...),
        x_api_key: str | None = Header(default=None),
    ):
        validate_api_key(x_api_key)

        if file.content_type not in {"image/png", "image/jpeg", "image/webp"}:
            raise HTTPException(status_code=415, detail="Only PNG, JPEG, and WebP images are supported.")

        started = time.perf_counter()
        input_bytes = await file.read()
        if not input_bytes:
            raise HTTPException(status_code=400, detail="No image bytes received.")
        if len(input_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="Image is too large. Maximum size is 12MB.")

        try:
            with Image.open(io.BytesIO(input_bytes)) as input_image:
                input_image.verify()
        except Exception as exc:
            logger.warning("Invalid image upload: %s", exc)
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.") from exc

        logger.info(
            "Processing file=%s content_type=%s bytes=%s",
            file.filename,
            file.content_type,
            len(input_bytes),
        )

        try:
            output_bytes = remove(input_bytes, session=get_session())
        except Exception as exc:
            logger.exception("rembg inference failed")
            raise HTTPException(status_code=500, detail="Model inference failed.") from exc

        elapsed_ms = round((time.perf_counter() - started) * 1000)
        logger.info("Background removed in %sms; output_bytes=%s", elapsed_ms, len(output_bytes))

        return Response(
            content=output_bytes,
            media_type="image/png",
            headers={
                "X-Model": MODEL_NAME,
                "X-Processing-Time-Ms": str(elapsed_ms),
                "Content-Disposition": 'inline; filename="lumora-cutout.png"',
            },
        )

    return web_app
