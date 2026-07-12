import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { chargeToolAccess, isToolAccessResponse, resolveToolAccess } from "@/lib/tool-access";

const SUPPORTED_INPUT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const SUPPORTED_OUTPUT_FORMATS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_OUTPUT_DIMENSION = 8000;

class ValidationError extends Error {}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

function parsePositiveInteger(value: FormDataEntryValue | null, field: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_OUTPUT_DIMENSION) {
    throw new ValidationError(`${field} must be between 1 and ${MAX_OUTPUT_DIMENSION}px.`);
  }
  return parsed;
}

function parseQuality(value: FormDataEntryValue | null) {
  const parsed = Number(value || 90);
  if (!Number.isFinite(parsed)) return 90;
  return Math.min(100, Math.max(1, Math.round(parsed)));
}

function parseCrop(value: FormDataEntryValue | null): CropData {
  if (typeof value !== "string") {
    throw new ValidationError("Crop data is required.");
  }

  let crop: Partial<CropData>;
  try {
    crop = JSON.parse(value);
  } catch {
    throw new ValidationError("Crop data is invalid.");
  }

  const fields: Array<keyof CropData> = ["x", "y", "width", "height"];
  for (const field of fields) {
    if (!Number.isFinite(crop[field])) {
      throw new ValidationError(`Crop ${field} must be a number.`);
    }
  }

  if ((crop.width ?? 0) <= 0 || (crop.height ?? 0) <= 0) {
    throw new ValidationError("Crop width and height must be positive.");
  }

  return crop as CropData;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const access = await resolveToolAccess(req, { toolId: "image-resizer", mode: "free-quality", creditCost: 2, formData });
    if (isToolAccessResponse(access)) return access;
    const file = formData.get("file") as File;
    const cropData = parseCrop(formData.get("crop"));
    const requestedWidth = parsePositiveInteger(formData.get("width"), "Width");
    const requestedHeight = parsePositiveInteger(formData.get("height"), "Height");
    const standardScale = access.outputTier === "standard"
      ? Math.min(1, 1600 / Math.max(requestedWidth, requestedHeight))
      : 1;
    const targetWidth = Math.max(1, Math.round(requestedWidth * standardScale));
    const targetHeight = Math.max(1, Math.round(requestedHeight * standardScale));
    const format = ((formData.get("format") as string) || "jpg").toLowerCase();
    const requestedQuality = parseQuality(formData.get("quality"));
    const quality = access.outputTier === "standard" ? Math.min(requestedQuality, 78) : requestedQuality;

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
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
    const metadata = await sharp(buffer).metadata();
    const sourceWidth = metadata.width || 0;
    const sourceHeight = metadata.height || 0;

    if (!sourceWidth || !sourceHeight) {
      throw new ValidationError("Could not read image dimensions.");
    }

    const left = Math.max(0, Math.min(Math.round(cropData.x), sourceWidth - 1));
    const top = Math.max(0, Math.min(Math.round(cropData.y), sourceHeight - 1));
    const cropWidth = Math.max(1, Math.min(Math.round(cropData.width), sourceWidth - left));
    const cropHeight = Math.max(1, Math.min(Math.round(cropData.height), sourceHeight - top));

    let pipeline = sharp(buffer);

    // 1. Perform the Crop (extracting pixels relative to original image size)
    pipeline = pipeline.extract({
      left,
      top,
      width: cropWidth,
      height: cropHeight
    });

    // 2. Perform the Resize to target dimensions
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      fit: "fill" // Since we already cropped to the desired ratio
    });

    // 3. Encoder Settings
    if (format === "webp") {
      pipeline = pipeline.webp({ quality });
    } else if (format === "png") {
      pipeline = pipeline.png({ quality: quality, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    const resultBuffer = await pipeline.toBuffer();
    const debit = await chargeToolAccess(access, "image-resizer", `tool:${randomUUID()}`);
    if (!debit.success) return NextResponse.json({ error: debit.error }, { status: 402 });
    const outputMetadata = await sharp(resultBuffer).metadata();

    return NextResponse.json({
      success: true,
      result: `data:image/${format === "jpg" ? "jpeg" : format};base64,${resultBuffer.toString("base64")}`,
      size: resultBuffer.length,
      width: outputMetadata.width,
      height: outputMetadata.height,
      format,
      quality,
      crop: { x: left, y: top, width: cropWidth, height: cropHeight }
      ,outputTier: access.outputTier,
      creditsCharged: access.creditCost,
    });

  } catch (error: unknown) {
    console.error("Resizer API Error:", error);
    const message = error instanceof Error ? error.message : "Resize failed.";
    return NextResponse.json({ error: message }, { status: error instanceof ValidationError ? 400 : 500 });
  }
}
