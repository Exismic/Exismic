import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const SUPPORTED_INPUT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"]);
const SUPPORTED_OUTPUT_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

function clampQuality(value: FormDataEntryValue | null) {
  const parsed = Number(value || 90);
  if (!Number.isFinite(parsed)) return 90;
  return Math.min(100, Math.max(1, Math.round(parsed)));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const targetFormat = (formData.get("targetFormat") as string || "webp").toLowerCase();
    const quality = clampQuality(formData.get("quality"));

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!SUPPORTED_INPUT_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WebP, AVIF, and GIF images are supported." }, { status: 415 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image is too large. Maximum size is 25MB." }, { status: 413 });
    }

    if (!SUPPORTED_OUTPUT_FORMATS.has(targetFormat)) {
      return NextResponse.json({ error: "Unsupported output format." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer);

    // Dynamic Format Conversion map
    switch (targetFormat) {
      case "webp":
        pipeline = pipeline.webp({ quality });
        break;
      case "png":
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      case "jpg":
      case "jpeg":
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case "gif":
        pipeline = pipeline.gif();
        break;
      default:
        return NextResponse.json({ error: "Unsupported output format." }, { status: 400 });
    }

    const resultBuffer = await pipeline.toBuffer();
    const outputMetadata = await sharp(resultBuffer).metadata();
    const mime = `image/${targetFormat === "jpg" ? "jpeg" : targetFormat}`;

    return NextResponse.json({
      success: true,
      result: `data:${mime};base64,${resultBuffer.toString("base64")}`,
      size: resultBuffer.length,
      format: targetFormat,
      width: outputMetadata.width,
      height: outputMetadata.height,
      quality,
    });

  } catch (error: unknown) {
    console.error("Converter API Error:", error);
    const message = error instanceof Error ? error.message : "Conversion failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
