import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { chargeToolAccess, isToolAccessResponse, resolveToolAccess } from "@/lib/tool-access";

const SUPPORTED_INPUT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

interface NormalizedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function parseStrength(value: FormDataEntryValue | null) {
  const parsed = Number(value || 70);
  if (!Number.isFinite(parsed)) return 70;
  return clamp(Math.round(parsed), 10, 100);
}

function parseRegion(value: FormDataEntryValue | null): NormalizedRegion {
  if (typeof value !== "string") {
    return { x: 0.05, y: 0.72, width: 0.9, height: 0.18 };
  }

  try {
    const parsed = JSON.parse(value) as Partial<NormalizedRegion>;
    const x = clamp(Number(parsed.x), 0, 0.98);
    const y = clamp(Number(parsed.y), 0, 0.98);
    const width = clamp(Number(parsed.width), 0.02, 1 - x);
    const height = clamp(Number(parsed.height), 0.02, 1 - y);
    return { x, y, width, height };
  } catch {
    return { x: 0.05, y: 0.72, width: 0.9, height: 0.18 };
  }
}

async function tryModalWatermarkRemoval(params: {
  buffer: Buffer;
  file: File;
  region: NormalizedRegion;
  strength: number;
  priority: boolean;
}) {
  const modalUrl = params.priority
    ? process.env.MODAL_WATERMARK_REMOVER_PRIORITY_URL || process.env.MODAL_WATERMARK_REMOVER_URL
    : process.env.MODAL_WATERMARK_REMOVER_NORMAL_URL || process.env.MODAL_WATERMARK_REMOVER_URL;
  const modalApiKey = params.priority
    ? process.env.MODAL_WATERMARK_REMOVER_PRIORITY_API_KEY || process.env.MODAL_WATERMARK_REMOVER_API_KEY
    : process.env.MODAL_WATERMARK_REMOVER_NORMAL_API_KEY || process.env.MODAL_WATERMARK_REMOVER_API_KEY;
  if (!modalUrl || !modalApiKey) return null;

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(params.buffer)], { type: params.file.type }), params.file.name || "image.png");
  formData.append("region", JSON.stringify(params.region));
  formData.append("strength", String(params.strength));
  formData.append("priority", String(params.priority));
  formData.append("queue", params.priority ? "priority" : "normal");

  const response = await fetch(`${modalUrl.replace(/\/$/, "")}/remove-watermark`, {
    method: "POST",
    headers: { "X-Api-Key": modalApiKey },
    body: formData,
    signal: AbortSignal.timeout(params.priority ? 60000 : 90000),
  });

  if (!response.ok) {
    throw new Error(`Modal watermark removal failed with HTTP ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function buildReplacementPatch(buffer: Buffer, rect: { left: number; top: number; width: number; height: number }, imageWidth: number, imageHeight: number, strength: number) {
  const pad = Math.max(12, Math.round(Math.max(rect.width, rect.height) * 0.18));
  const candidateSources = [
    { left: rect.left, top: rect.top - rect.height - pad, width: rect.width, height: rect.height },
    { left: rect.left, top: rect.top + rect.height + pad, width: rect.width, height: rect.height },
    { left: rect.left - rect.width - pad, top: rect.top, width: rect.width, height: rect.height },
    { left: rect.left + rect.width + pad, top: rect.top, width: rect.width, height: rect.height },
  ];

  const source = candidateSources.find((candidate) =>
    candidate.left >= 0 &&
    candidate.top >= 0 &&
    candidate.left + candidate.width <= imageWidth &&
    candidate.top + candidate.height <= imageHeight
  );

  if (source) {
    return sharp(buffer)
      .extract(source)
      .resize(rect.width, rect.height, { fit: "fill" })
      .blur(strength > 70 ? 0.7 : 0.35)
      .sharpen({ sigma: 0.8 })
      .toBuffer();
  }

  const expanded = {
    left: clamp(rect.left - pad, 0, imageWidth - 1),
    top: clamp(rect.top - pad, 0, imageHeight - 1),
    width: Math.min(imageWidth - clamp(rect.left - pad, 0, imageWidth - 1), rect.width + pad * 2),
    height: Math.min(imageHeight - clamp(rect.top - pad, 0, imageHeight - 1), rect.height + pad * 2),
  };

  return sharp(buffer)
    .extract(expanded)
    .resize(rect.width, rect.height, { fit: "fill" })
    .blur(4 + strength / 18)
    .modulate({ saturation: 1.02 })
    .toBuffer();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const access = await resolveToolAccess(req, { toolId: "watermark-remover", mode: "free-quality", creditCost: 10, formData });
    if (isToolAccessResponse(access)) return access;
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!SUPPORTED_INPUT_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WebP, and AVIF images are supported." }, { status: 415 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image is too large. Maximum size is 20MB." }, { status: 413 });
    }

    const region = parseRegion(formData.get("region"));
    const strength = parseStrength(formData.get("strength"));
    const priority = access.isPro;
    const queue = priority ? "priority" as const : "normal" as const;
    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const imageWidth = metadata.width || 0;
    const imageHeight = metadata.height || 0;

    if (!imageWidth || !imageHeight) {
      return NextResponse.json({ error: "Could not read image dimensions." }, { status: 400 });
    }

    let provider = "local-region-reconstruction";
    let outputBuffer: Buffer | null = null;

    // Optimize performance: Downscale standard quality inputs to 1280px before sending to Modal/AI
    let modalBuffer = buffer;
    try {
      if (access.outputTier === "standard") {
        modalBuffer = await sharp(buffer)
          .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
          .toBuffer();
      }
    } catch (resizeErr) {
      console.error("Failed to downscale watermark input:", resizeErr);
    }

    try {
      outputBuffer = await tryModalWatermarkRemoval({ buffer: modalBuffer, file, region, strength, priority });
      if (outputBuffer) provider = priority ? "modal-priority-inpainting" : "modal-inpainting";
    } catch (modalError) {
      console.error("Modal watermark removal failed:", getErrorMessage(modalError));
    }

    if (!outputBuffer) {
      const rect = {
        left: clamp(Math.round(region.x * imageWidth), 0, imageWidth - 1),
        top: clamp(Math.round(region.y * imageHeight), 0, imageHeight - 1),
        width: Math.max(2, Math.min(Math.round(region.width * imageWidth), imageWidth)),
        height: Math.max(2, Math.min(Math.round(region.height * imageHeight), imageHeight)),
      };
      rect.width = Math.min(rect.width, imageWidth - rect.left);
      rect.height = Math.min(rect.height, imageHeight - rect.top);

      const replacementPatch = await buildReplacementPatch(buffer, rect, imageWidth, imageHeight, strength);
      outputBuffer = await sharp(buffer)
        .composite([{ input: replacementPatch, left: rect.left, top: rect.top, blend: "over" }])
        .sharpen({ sigma: 0.5 })
        .jpeg({ quality: 94, mozjpeg: true })
        .toBuffer();
    }
    if (access.outputTier === "standard") {
      outputBuffer = await sharp(outputBuffer)
        .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
    }

    const debit = await chargeToolAccess(access, "watermark-remover", `tool:${randomUUID()}`);
    if (!debit.success) return NextResponse.json({ error: debit.error }, { status: 402 });

    const outputMetadata = await sharp(outputBuffer).metadata();

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="exismic-watermark-cleaned-${Date.now()}.jpg"`,
        "X-Exismic-Provider": provider,
        "X-Exismic-Width": String(outputMetadata.width || ""),
        "X-Exismic-Height": String(outputMetadata.height || ""),
        "X-Exismic-Priority": priority ? "true" : "false",
        "X-Exismic-Queue": queue,
        "X-Exismic-Output-Tier": access.outputTier,
        "X-Exismic-Credits-Charged": String(access.creditCost),
      },
    });
  } catch (error: unknown) {
    console.error("Watermark removal failed:", error);
    return NextResponse.json({ error: getErrorMessage(error) || "Processing failed." }, { status: 500 });
  }
}
