import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

const SUPPORTED_INPUT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_OUTPUT_EDGE = 3200;

function clampNumber(value: FormDataEntryValue | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function getBoolean(formData: FormData, key: string, fallback = true) {
  const value = formData.get(key);
  if (value === null) return fallback;
  return value === "true";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function tryModalRestore(params: {
  buffer: Buffer;
  file: File;
  strength: number;
  faces: boolean;
  color: boolean;
  sharpen: boolean;
  denoise: boolean;
  upscale: number;
  priority: boolean;
}) {
  const modalUrl = params.priority
    ? process.env.MODAL_PHOTO_RESTORER_PRIORITY_URL || process.env.MODAL_PHOTO_RESTORER_URL
    : process.env.MODAL_PHOTO_RESTORER_NORMAL_URL || process.env.MODAL_PHOTO_RESTORER_URL;
  const modalApiKey = params.priority
    ? process.env.MODAL_PHOTO_RESTORER_PRIORITY_API_KEY || process.env.MODAL_PHOTO_RESTORER_API_KEY
    : process.env.MODAL_PHOTO_RESTORER_NORMAL_API_KEY || process.env.MODAL_PHOTO_RESTORER_API_KEY;

  if (!modalUrl || !modalApiKey) return null;

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(params.buffer)], { type: params.file.type }), params.file.name || "photo.png");
  formData.append("strength", String(params.strength));
  formData.append("faces", String(params.faces));
  formData.append("color", String(params.color));
  formData.append("sharpen", String(params.sharpen));
  formData.append("denoise", String(params.denoise));
  formData.append("upscale", String(params.upscale));
  formData.append("priority", String(params.priority));
  formData.append("queue", params.priority ? "priority" : "normal");

  const response = await fetch(`${modalUrl.replace(/\/$/, "")}/restore`, {
    method: "POST",
    headers: {
      "X-Api-Key": modalApiKey,
    },
    body: formData,
    signal: AbortSignal.timeout(params.priority ? 90000 : 120000),
  });

  if (!response.ok) {
    throw new Error(`Modal restoration failed with HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function getPriorityContext() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { priority: false, queue: "normal" as const };

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, subscriptionStatus: true },
    });

    const priority = dbUser?.plan === "pro" || dbUser?.subscriptionStatus === "active";
    return { priority, queue: priority ? "priority" as const : "normal" as const };
  } catch (error) {
    console.warn("Could not resolve Pro priority context:", getErrorMessage(error));
    return { priority: false, queue: "normal" as const };
  }
}

async function restoreWithSharp(params: {
  buffer: Buffer;
  strength: number;
  faces: boolean;
  color: boolean;
  sharpen: boolean;
  denoise: boolean;
  upscale: number;
}) {
  const metadata = await sharp(params.buffer).metadata();
  const sourceWidth = metadata.width || 0;
  const sourceHeight = metadata.height || 0;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Could not read image dimensions.");
  }

  const scale = params.upscale > 1 ? params.upscale : 1;
  const targetWidth = Math.min(MAX_OUTPUT_EDGE, Math.round(sourceWidth * scale));
  const targetHeight = Math.min(MAX_OUTPUT_EDGE, Math.round(sourceHeight * scale));
  const strengthFactor = params.strength / 100;

  let pipeline = sharp(params.buffer, { failOn: "none" })
    .rotate()
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: "inside",
      withoutEnlargement: scale === 1,
      kernel: sharp.kernel.lanczos3,
    });

  if (params.denoise) {
    pipeline = pipeline.median(params.strength > 65 ? 2 : 1);
  }

  if (params.color) {
    pipeline = pipeline
      .normalise()
      .modulate({
        brightness: 1.02 + strengthFactor * 0.06,
        saturation: 1.04 + strengthFactor * 0.22,
      })
      .linear(1.04 + strengthFactor * 0.12, -(4 + strengthFactor * 8));
  } else {
    pipeline = pipeline.linear(1.03 + strengthFactor * 0.08, -3);
  }

  if (params.faces) {
    pipeline = pipeline.gamma(1.02).tint({ r: 255, g: 248, b: 240 });
  }

  if (params.sharpen) {
    pipeline = pipeline.sharpen({
      sigma: 0.8 + strengthFactor * 1.1,
      m1: 0.5,
      m2: 2.5 + strengthFactor * 6,
      x1: 2,
      y2: 8 + strengthFactor * 8,
      y3: 14 + strengthFactor * 8,
    });
  }

  return pipeline.png({ quality: 100, compressionLevel: 9 }).toBuffer();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (!SUPPORTED_INPUT_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WebP, and AVIF images are supported." }, { status: 415 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image is too large. Maximum size is 20MB." }, { status: 413 });
    }

    const strength = clampNumber(formData.get("strength"), 70, 10, 100);
    const faces = getBoolean(formData, "faces", true);
    const color = getBoolean(formData, "color", true);
    const sharpen = getBoolean(formData, "sharpen", true);
    const denoise = getBoolean(formData, "denoise", true);
    const upscale = clampNumber(formData.get("upscale"), 1, 1, 2);
    const context = await getPriorityContext();
    const buffer = Buffer.from(await file.arrayBuffer());

    let provider = "sharp-local-restorer";
    let resultBuffer: Buffer | null = null;

    try {
      resultBuffer = await tryModalRestore({ buffer, file, strength, faces, color, sharpen, denoise, upscale, priority: context.priority });
      if (resultBuffer) provider = context.priority ? "modal-priority-gfpgan-codeformer" : "modal-gfpgan-codeformer";
    } catch (modalError) {
      console.error("Modal Photo Restore Failed:", getErrorMessage(modalError));
    }

    if (!resultBuffer) {
      resultBuffer = await restoreWithSharp({ buffer, strength, faces, color, sharpen, denoise, upscale });
    }

    const outputMetadata = await sharp(resultBuffer).metadata();

    return NextResponse.json({
      success: true,
      result: `data:image/png;base64,${resultBuffer.toString("base64")}`,
      size: resultBuffer.length,
      width: outputMetadata.width,
      height: outputMetadata.height,
      format: "png",
      provider,
      priority: context.priority,
      queue: context.queue,
      processingLabel: context.priority ? "Processing with Priority..." : "Processing...",
      options: { strength, faces, color, sharpen, denoise, upscale },
    });
  } catch (error: unknown) {
    console.error("Restorer API Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) || "Restoration failed." }, { status: 500 });
  }
}
