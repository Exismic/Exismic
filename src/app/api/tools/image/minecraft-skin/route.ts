import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  requireApiUser,
} from "@/lib/api-security";
import {
  applyPromptEditsToMinecraftSkin,
  compileMinecraftSkin,
  createFallbackSkinDesign,
  getMinecraftSkinSeed,
  mergeMinecraftSkinPart,
  sanitizeSkinDesign,
  type MinecraftArmModel,
  type MinecraftSkinDesign,
  type MinecraftSkinPart,
} from "@/lib/minecraft-skin";

export const runtime = "nodejs";
export const maxDuration = 45;

const OUTPUT_DIRECTORY = path.join(process.cwd(), "public", "generations");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEXT_MODEL = "llama-3.3-70b-versatile";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const requestSchema = z.object({
  prompt: z.string().trim().min(3).max(600),
  armModel: z.enum(["classic", "slim"]).default("classic"),
  style: z.enum(["balanced", "pixel-detailed", "minimal", "high-contrast"]).default("balanced"),
  targetPart: z.enum(["all", "head", "torso", "arms", "legs"]).default("all"),
  seed: z.number().int().min(0).max(4294967295).optional(),
  baseSkinUrl: z.string().trim().max(220).optional(),
  referenceImage: z.string().max(6_000_000).optional(),
  referenceMode: z.enum(["inspire", "guided", "rebuild"]).default("guided"),
});

const editRequestSchema = z.object({
  skinDataUrl: z.string().max(200_000).regex(/^data:image\/png;base64,/i),
  name: z.string().trim().min(1).max(80),
  armModel: z.enum(["classic", "slim"]),
});

type UvFace = { x: number; y: number; width: number; height: number };

const BASE_UV_FACES: UvFace[] = [
  { x: 8, y: 0, width: 8, height: 8 }, { x: 16, y: 0, width: 8, height: 8 },
  { x: 0, y: 8, width: 8, height: 8 }, { x: 8, y: 8, width: 8, height: 8 },
  { x: 16, y: 8, width: 8, height: 8 }, { x: 24, y: 8, width: 8, height: 8 },
  { x: 20, y: 16, width: 8, height: 4 }, { x: 28, y: 16, width: 8, height: 4 },
  { x: 16, y: 20, width: 4, height: 12 }, { x: 20, y: 20, width: 8, height: 12 },
  { x: 28, y: 20, width: 4, height: 12 }, { x: 32, y: 20, width: 8, height: 12 },
  { x: 4, y: 16, width: 4, height: 4 }, { x: 8, y: 16, width: 4, height: 4 },
  { x: 0, y: 20, width: 4, height: 12 }, { x: 4, y: 20, width: 4, height: 12 },
  { x: 8, y: 20, width: 4, height: 12 }, { x: 12, y: 20, width: 4, height: 12 },
  { x: 20, y: 48, width: 4, height: 4 }, { x: 24, y: 48, width: 4, height: 4 },
  { x: 16, y: 52, width: 4, height: 12 }, { x: 20, y: 52, width: 4, height: 12 },
  { x: 24, y: 52, width: 4, height: 12 }, { x: 28, y: 52, width: 4, height: 12 },
];

const OVERLAY_UV_FACES: UvFace[] = [
  { x: 40, y: 0, width: 8, height: 8 }, { x: 48, y: 0, width: 8, height: 8 },
  { x: 32, y: 8, width: 8, height: 8 }, { x: 40, y: 8, width: 8, height: 8 },
  { x: 48, y: 8, width: 8, height: 8 }, { x: 56, y: 8, width: 8, height: 8 },
  { x: 20, y: 32, width: 8, height: 4 }, { x: 28, y: 32, width: 8, height: 4 },
  { x: 16, y: 36, width: 4, height: 12 }, { x: 20, y: 36, width: 8, height: 12 },
  { x: 28, y: 36, width: 4, height: 12 }, { x: 32, y: 36, width: 8, height: 12 },
  { x: 4, y: 32, width: 4, height: 4 }, { x: 8, y: 32, width: 4, height: 4 },
  { x: 0, y: 36, width: 4, height: 12 }, { x: 4, y: 36, width: 4, height: 12 },
  { x: 8, y: 36, width: 4, height: 12 }, { x: 12, y: 36, width: 4, height: 12 },
  { x: 4, y: 48, width: 4, height: 4 }, { x: 8, y: 48, width: 4, height: 4 },
  { x: 0, y: 52, width: 4, height: 12 }, { x: 4, y: 52, width: 4, height: 12 },
  { x: 8, y: 52, width: 4, height: 12 }, { x: 12, y: 52, width: 4, height: 12 },
];

function armUvFaces(model: MinecraftArmModel, overlay: boolean): UvFace[] {
  const width = model === "slim" ? 3 : 4;
  const rightY = overlay ? 32 : 16;
  const rightBodyY = overlay ? 36 : 20;
  const leftStart = overlay ? 48 : 32;
  const leftTop = overlay ? 52 : 36;
  return [
    { x: 44, y: rightY, width, height: 4 },
    { x: 44 + width, y: rightY, width, height: 4 },
    { x: 40, y: rightBodyY, width: 4, height: 12 },
    { x: 44, y: rightBodyY, width, height: 12 },
    { x: 44 + width, y: rightBodyY, width: 4, height: 12 },
    { x: 48 + width, y: rightBodyY, width, height: 12 },
    { x: leftTop, y: 48, width, height: 4 },
    { x: leftTop + width, y: 48, width, height: 4 },
    { x: leftStart, y: 52, width: 4, height: 12 },
    { x: leftTop, y: 52, width, height: 12 },
    { x: leftTop + width, y: 52, width: 4, height: 12 },
    { x: leftTop + width + 4, y: 52, width, height: 12 },
  ];
}

function markFaces(mask: Uint8Array, faces: UvFace[]) {
  for (const face of faces) {
    for (let y = face.y; y < face.y + face.height; y += 1) {
      for (let x = face.x; x < face.x + face.width; x += 1) {
        mask[y * 64 + x] = 1;
      }
    }
  }
}

async function rebuildReferenceTexture(referenceImage: string, model: MinecraftArmModel) {
  const match = referenceImage.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
  if (!match) throw new Error("The reference image could not be decoded.");
  const source = Buffer.from(match[2], "base64");
  const metadata = await sharp(source).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 64 || metadata.height < 64) {
    throw new Error("Skin texture references must be at least 64×64 pixels.");
  }
  const ratio = metadata.width / metadata.height;
  if (ratio < 0.92 || ratio > 1.08) {
    throw new Error("Rebuild mode needs a square Minecraft skin-layout image. Use inspiration mode for character art.");
  }

  const resized = sharp(source)
    .rotate()
    .resize(64, 64, { fit: "fill", kernel: sharp.kernel.nearest })
    .modulate({ saturation: 1.12, brightness: 1.03 });
  const normalized = metadata.width === 64 && metadata.height === 64
    ? await resized.png().toBuffer()
    : await resized
        .png({ palette: true, colours: 24, dither: 0 })
        .toBuffer();
  const { data } = await sharp(normalized)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const output = new Uint8Array(data);
  const baseMask = new Uint8Array(64 * 64);
  const usedMask = new Uint8Array(64 * 64);
  const baseFaces = [...BASE_UV_FACES, ...armUvFaces(model, false)];
  const overlayFaces = [...OVERLAY_UV_FACES, ...armUvFaces(model, true)];
  markFaces(baseMask, baseFaces);
  markFaces(usedMask, [...baseFaces, ...overlayFaces]);

  for (let pixel = 0; pixel < 64 * 64; pixel += 1) {
    const offset = pixel * 4;
    if (!usedMask[pixel]) {
      output[offset + 3] = 0;
      continue;
    }
    if (baseMask[pixel]) {
      output[offset + 3] = 255;
      continue;
    }
    const isBackgroundBlack = output[offset] <= 3 && output[offset + 1] <= 3 && output[offset + 2] <= 3;
    output[offset + 3] = isBackgroundBlack ? 0 : 255;
  }
  return output;
}

function getGroqKeys() {
  return (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function extractJson(content: string) {
  try {
    return JSON.parse(content) as Partial<MinecraftSkinDesign>;
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("Invalid design response.");
    return JSON.parse(content.slice(start, end + 1)) as Partial<MinecraftSkinDesign>;
  }
}

function buildDesignInstruction(
  prompt: string,
  style: string,
  targetPart: MinecraftSkinPart,
  referenceMode: "inspire" | "guided" | "rebuild"
) {
  const referencePriority = referenceMode === "guided"
    ? "Treat the reference as the character identity. Preserve its hair, face covering, garment type, dominant colors, sleeve length, footwear, symbols, and accent placement unless the prompt explicitly changes one of them."
    : "Treat the written prompt as primary. Use the reference only for useful color, silhouette, and material cues.";
  return [
    `Create a coherent Minecraft skin design specification for: "${prompt}".`,
    `Visual treatment: ${style}.`,
    referencePriority,
    "Explicit prompt instructions override conflicting reference details, but unspecified reference traits must remain intact.",
    "Never replace a hoodie, jacket, robe, mask, visor, gloves, or emblem with a tie or unrelated generic clothing.",
    targetPart === "all"
      ? "Design the complete character."
      : `Refresh the ${targetPart} while keeping it compatible with the original character.`,
    "Return only JSON with this exact structure:",
    JSON.stringify({
      name: "short character name",
      description: "one sentence visual summary",
      hairStyle: "short | long | spiky | hood | helmet | bald",
      outfit: "casual | armor | royal | cyber | fantasy | formal | sport",
      expression: "neutral | friendly | serious",
      eyeShape: "normal | angry | soft",
      facialHair: "none | stubble | short-beard | goatee",
      faceStyle: "open | mask | visor",
      sleeves: "short | long | armored",
      gloves: true,
      footwear: "shoes | boots | armored",
      pattern: "clean | striped | paneled | armored | mystic | lightning | circuit",
      emblem: "zero to three visible letters, blank when absent",
      traits: ["four to eight short visual traits actually observed or requested"],
      palette: {
        skin: "#RRGGBB",
        skinShade: "#RRGGBB",
        hair: "#RRGGBB",
        hairHighlight: "#RRGGBB",
        eyes: "#RRGGBB",
        top: "#RRGGBB",
        topAccent: "#RRGGBB",
        pants: "#RRGGBB",
        shoes: "#RRGGBB",
        detail: "#RRGGBB",
      },
    }),
    "Sample colors from the reference when present. Record short visible emblem text exactly. Use readable contrast and a restrained palette. Do not include prose or markdown.",
  ].join("\n");
}

async function createAiDesign(
  prompt: string,
  style: string,
  targetPart: MinecraftSkinPart,
  referenceMode: "inspire" | "guided" | "rebuild",
  referenceImage?: string
) {
  const keys = getGroqKeys();
  if (!keys.length) return null;

  const hasValidReference = Boolean(
    referenceImage && /^data:image\/(png|jpe?g|webp);base64,/i.test(referenceImage)
  );
  const instruction = buildDesignInstruction(prompt, style, targetPart, referenceMode);
  const userContent = hasValidReference
    ? [
        {
          type: "text",
          text: `${instruction}\nAnalyze the attached image carefully before writing JSON. Read short chest emblems when legible and describe only visual traits supported by the image or prompt.`,
        },
        { type: "image_url", image_url: { url: referenceImage } },
      ]
    : instruction;

  let lastError: unknown = null;
  for (const key of keys) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: hasValidReference ? VISION_MODEL : TEXT_MODEL,
          temperature: referenceMode === "guided" ? 0.28 : 0.48,
          max_tokens: 1250,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are Lumora's Minecraft skin reconstruction director. First identify the reference character's defining visual traits, then convert them into the exact structured fields requested. Respect prompt-over-reference precedence only where the prompt is explicit. Produce practical pixel-character specifications for a strict 64x64 UV map.",
            },
            { role: "user", content: userContent },
          ],
        }),
        signal: AbortSignal.timeout(18_000),
      });

      if (!response.ok) {
        lastError = new Error(`Design provider returned ${response.status}.`);
        continue;
      }

      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error("Design provider returned an empty response.");
        continue;
      }
      return extractJson(content);
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("[Minecraft Skin] AI design fallback used:", lastError);
  return null;
}

async function loadBaseSkin(baseSkinUrl: string | undefined) {
  if (!baseSkinUrl) throw new Error("Generate a complete skin before regenerating individual parts.");
  if (!/^\/generations\/minecraft_[a-z0-9-]+\.png$/i.test(baseSkinUrl)) {
    throw new Error("The selected base skin is invalid.");
  }

  const filename = path.basename(baseSkinUrl);
  const filePath = path.join(OUTPUT_DIRECTORY, filename);
  const input = await readFile(filePath);
  const image = sharp(input);
  const metadata = await image.metadata();
  if (metadata.width !== 64 || metadata.height !== 64) {
    throw new Error("The selected base skin is not a valid 64x64 texture.");
  }
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) throw new Error("The selected skin has an unsupported pixel format.");
  return new Uint8Array(data);
}

async function ensureDatabaseUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (existing) return existing;
  if (!user.email) throw new Error("Your account does not have a verified email.");

  return prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      name: typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email.split("@")[0],
      plan: "free",
      dailyCredits: 50,
      aiGenerationsLimit: 5,
      nextResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
}

export async function PUT(request: NextRequest) {
  const apiUser = await requireApiUser();
  if (apiUser instanceof NextResponse) return apiUser;

  const rateLimit = checkRateLimit(
    `minecraft-skin-edit:${apiUser.id}:${getRequestIp(request)}`,
    30,
    10 * 60 * 1000
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter);

  let outputPath: string | null = null;
  try {
    const parsed = editRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "The edited skin data is invalid." },
        { status: 400 }
      );
    }

    await ensureDatabaseUser(apiUser);
    const source = Buffer.from(parsed.data.skinDataUrl.split(",")[1], "base64");
    const image = sharp(source);
    const metadata = await image.metadata();
    if (metadata.width !== 64 || metadata.height !== 64) {
      return NextResponse.json({ error: "Edited skins must remain exactly 64x64 pixels." }, { status: 400 });
    }

    const png = await image
      .ensureAlpha()
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();
    await mkdir(OUTPUT_DIRECTORY, { recursive: true });
    const filename = `minecraft_${uuidv4()}.png`;
    outputPath = path.join(OUTPUT_DIRECTORY, filename);
    await writeFile(outputPath, png);
    const resultUrl = `/generations/${filename}`;

    await prisma.userFile.create({
      data: {
        userId: apiUser.id,
        toolType: "minecraft-skin-maker",
        originalName: `${parsed.data.name} - pixel edit`,
        originalUrl: null,
        resultUrl,
        fileType: "image/png",
        status: "completed",
        metadata: {
          width: 64,
          height: 64,
          armModel: parsed.data.armModel,
          edited: true,
          editor: "pixel-studio",
        },
      },
    });

    outputPath = null;
    return NextResponse.json({ success: true, skinUrl: resultUrl });
  } catch (error) {
    if (outputPath) await unlink(outputPath).catch(() => undefined);
    console.error("[Minecraft Skin] Pixel edit save failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The edited skin could not be saved." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const apiUser = await requireApiUser();
  if (apiUser instanceof NextResponse) return apiUser;

  const rateLimit = checkRateLimit(
    `minecraft-skin:${apiUser.id}:${getRequestIp(request)}`,
    12,
    10 * 60 * 1000
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter);

  let outputPath: string | null = null;
  try {
    const body = requestSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json(
        { error: body.error.issues[0]?.message || "Check the skin settings and try again." },
        { status: 400 }
      );
    }

    const {
      prompt,
      armModel,
      style,
      targetPart,
      baseSkinUrl,
      referenceImage,
      referenceMode,
    } = body.data;
    const seed = getMinecraftSkinSeed(prompt, body.data.seed);
    const user = await ensureDatabaseUser(apiUser);
    const isPro = user.plan === "pro" || user.subscriptionStatus === "active";
    const referenceRebuilt = referenceMode === "rebuild" && Boolean(referenceImage);
    const cost = referenceRebuilt
      ? (isPro ? 1 : 2)
      : targetPart === "all"
        ? (isPro ? 8 : 12)
        : (isPro ? 2 : 4);
    const availableCredits = (user.dailyCredits ?? 0) + (user.lifetimeCredits ?? 0);

    if (availableCredits < cost) {
      return NextResponse.json(
        {
          error: `This generation needs ${cost} credits. Your current balance is ${availableCredits}.`,
          needsUpgrade: !isPro,
        },
        { status: 403 }
      );
    }

    const aiDesign = referenceRebuilt
      ? null
      : await createAiDesign(prompt, style, targetPart, referenceMode, referenceImage);
    const design = aiDesign
      ? sanitizeSkinDesign(aiDesign, prompt, seed)
      : createFallbackSkinDesign(prompt, seed);
    let referenceGuided = false;
    let generated: Uint8Array;
    if (referenceRebuilt) {
      generated = await rebuildReferenceTexture(referenceImage!, armModel as MinecraftArmModel);
    } else if (referenceMode === "guided" && referenceImage) {
      try {
        const referenceBase = await rebuildReferenceTexture(referenceImage, armModel as MinecraftArmModel);
        generated = applyPromptEditsToMinecraftSkin(
          referenceBase,
          design,
          prompt,
          targetPart,
          armModel as MinecraftArmModel
        );
        referenceGuided = true;
      } catch (referenceError) {
        console.info("[Minecraft Skin] Guided reference is not a UV sheet; using AI-directed compilation.", referenceError);
        generated = compileMinecraftSkin(design, seed, armModel as MinecraftArmModel);
      }
    } else {
      generated = compileMinecraftSkin(design, seed, armModel as MinecraftArmModel);
    }
    const pixels = targetPart === "all"
      ? generated
      : mergeMinecraftSkinPart(await loadBaseSkin(baseSkinUrl), generated, targetPart);
    const png = await sharp(Buffer.from(pixels), {
      raw: { width: 64, height: 64, channels: 4 },
    })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();

    await mkdir(OUTPUT_DIRECTORY, { recursive: true });
    const filename = `minecraft_${uuidv4()}.png`;
    outputPath = path.join(OUTPUT_DIRECTORY, filename);
    await writeFile(outputPath, png);
    const resultUrl = `/generations/${filename}`;

    const updated = await prisma.$transaction(async (transaction) => {
      const latest = await transaction.user.findUnique({
        where: { id: apiUser.id },
        select: { dailyCredits: true, lifetimeCredits: true },
      });
      if (!latest) throw new Error("Your Lumora account could not be found.");

      const latestDaily = latest.dailyCredits ?? 0;
      const latestLifetime = latest.lifetimeCredits ?? 0;
      if (latestDaily + latestLifetime < cost) throw new Error("Your credit balance changed. Please try again.");

      const lifetimeSpend = Math.min(latestLifetime, cost);
      const dailySpend = cost - lifetimeSpend;
      const updatedUser = await transaction.user.update({
        where: { id: apiUser.id },
        data: {
          lifetimeCredits: { decrement: lifetimeSpend },
          dailyCredits: { decrement: dailySpend },
          aiGenerationsUsed: { increment: 1 },
        },
        select: { dailyCredits: true, lifetimeCredits: true },
      });

      await transaction.userFile.create({
        data: {
          userId: apiUser.id,
          toolType: "minecraft-skin-maker",
          originalName: design.name,
          originalUrl: prompt,
          resultUrl,
          fileType: "image/png",
          status: "completed",
          metadata: {
            width: 64,
            height: 64,
            armModel,
            targetPart,
            style,
            referenceMode,
            referenceGuided,
            seed,
            design: JSON.parse(JSON.stringify(design)) as Prisma.InputJsonObject,
            aiDirected: Boolean(aiDesign),
          } satisfies Prisma.InputJsonObject,
        },
      });

      return updatedUser;
    });

    outputPath = null;
    return NextResponse.json({
      success: true,
      skinUrl: resultUrl,
      design,
      armModel,
      targetPart,
      seed,
      cost,
      priority: isPro,
      referenceRebuilt,
      referenceGuided,
      creditsRemaining: updated.dailyCredits + updated.lifetimeCredits,
    });
  } catch (error) {
    if (outputPath) {
      await unlink(outputPath).catch(() => undefined);
    }
    const message = error instanceof Error ? error.message : "Skin generation failed.";
    console.error("[Minecraft Skin] Generation failed:", error);
    return NextResponse.json(
      { error: message === "fetch failed" ? "The design service is temporarily unavailable." : message },
      { status: 500 }
    );
  }
}
