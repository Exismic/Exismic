import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const SUPPORTED_INPUT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const SUPPORTED_OUTPUT_FORMATS = new Set(["original", "jpg", "jpeg", "png", "webp", "avif"]);
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

class ValidationError extends Error {}

function parsePositiveInteger(value: FormDataEntryValue | null, field: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ValidationError(`${field} must be a positive whole number.`);
  }
  return parsed;
}

function clampQuality(value: FormDataEntryValue | null) {
  const parsed = Number(value || 80);
  if (!Number.isFinite(parsed)) return 80;
  return Math.min(100, Math.max(1, Math.round(parsed)));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const quality = clampQuality(formData.get("quality"));
    const toWebp = formData.get("toWebp") === "true";
    const format = ((formData.get("format") as string) || "original").toLowerCase();
    const maxWidth = parsePositiveInteger(formData.get("maxWidth"), "Max width");
    const maxHeight = parsePositiveInteger(formData.get("maxHeight"), "Max height");
    const removeMetadata = formData.get("removeMetadata") === "true";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!SUPPORTED_INPUT_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WebP, and AVIF images are supported." }, { status: 415 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image is too large. Maximum size is 25MB." }, { status: 413 });
    }

    if (!SUPPORTED_OUTPUT_FORMATS.has(format)) {
      return NextResponse.json({ error: "Unsupported output format." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer);
    const inputMetadata = await sharp(buffer).metadata();

    // 1. Metadata Stripping
    if (removeMetadata) {
      // By default sharp doesn't keep metadata unless .withMetadata() is called.
      // So we just don't call it. 
    } else {
      pipeline = pipeline.withMetadata();
    }

    // 2. Resizing
    if (maxWidth || maxHeight) {
      pipeline = pipeline.resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true
      });
    }

    // 3. Format Conversion & Compression
    let targetFormat = format;
    if (toWebp) targetFormat = "webp";
    
    if (targetFormat === "original") {
      targetFormat = inputMetadata.format || "jpeg";
    }

    switch (targetFormat) {
      case "webp":
        pipeline = pipeline.webp({ quality, effort: 6 });
        break;
      case "png":
        pipeline = pipeline.png({ quality, compressionLevel: 9, palette: true });
        break;
      case "jpg":
      case "jpeg":
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality, effort: 4 });
        break;
      default:
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
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
      originalWidth: inputMetadata.width,
      originalHeight: inputMetadata.height,
      quality,
      metadataRemoved: removeMetadata,
    });

  } catch (error: unknown) {
    console.error("Compression API Error:", error);
    const message = error instanceof Error ? error.message : "Compression failed.";
    return NextResponse.json({ error: message }, { status: error instanceof ValidationError ? 400 : 500 });
  }
}
