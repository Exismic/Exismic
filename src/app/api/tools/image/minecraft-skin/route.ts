import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deductCredits, getCreditTotal } from "@/lib/credits";
import { getToolCreditCost } from "@/lib/credit-policy";
import { uploadProcessedFile } from "@/lib/server/storage";
import {
  checkRateLimit,
  getOptionalApiUser,
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
  type MinecraftSkinPalette,
  type MinecraftSkinPart,
} from "@/lib/minecraft-skin";
import { compileMinecraftSkinBlueprint } from "@/lib/minecraft-skin-blueprint";
import { DEFAULT_GROQ_TEXT_MODEL, DEFAULT_GROQ_VISION_MODEL } from "@/lib/ai-models";

export const runtime = "nodejs";
export const maxDuration = 45;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEXT_MODEL = DEFAULT_GROQ_TEXT_MODEL;
const VISION_MODEL = DEFAULT_GROQ_VISION_MODEL;

const requestSchema = z.object({
  prompt: z.string().trim().min(2).max(2000),
  armModel: z.enum(["classic", "slim"]).default("classic"),
  style: z.enum(["balanced", "pixel-detailed", "minimal", "high-contrast"]).default("balanced"),
  eyeStyle: z.enum(["anime", "classic", "glowing", "minimal", "visor"]).optional(),
  mouthStyle: z.enum(["smile", "neutral", "smirk", "open", "none"]).optional(),
  targetPart: z.enum(["all", "head", "torso", "arms", "legs"]).default("all"),
  seed: z.number().int().min(0).max(4294967295).optional(),
  baseSkinUrl: z.string().max(6_000_000).optional(),
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

async function rebuildShowcaseTexture(source: Buffer, model: MinecraftArmModel): Promise<Uint8Array> {
  const { data } = await sharp(source)
    .resize(128, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const canvas = new Uint8Array(64 * 64 * 4);
  const armW = model === "slim" ? 3 : 4;

  const isBgPixel = (r: number, g: number, b: number, a: number) => {
    if (a < 50) return true;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    if (max <= 48 && diff < 24) return true; // Container dark gray backdrop
    if (min >= 220 && diff < 24) return true; // White backdrop
    return false;
  };

  const copyPixel = (srcX: number, srcY: number, dstX: number, dstY: number) => {
    const sX = Math.max(0, Math.min(127, Math.floor(srcX)));
    const sY = Math.max(0, Math.min(63, Math.floor(srcY)));
    const srcOff = (sY * 128 + sX) * 4;
    const dX = Math.max(0, Math.min(63, Math.floor(dstX)));
    const dY = Math.max(0, Math.min(63, Math.floor(dstY)));
    const dstOff = (dY * 64 + dX) * 4;

    const r = data[srcOff];
    const g = data[srcOff + 1];
    const b = data[srcOff + 2];
    const a = data[srcOff + 3];

    if (!isBgPixel(r, g, b, a)) {
      canvas[dstOff] = r;
      canvas[dstOff + 1] = g;
      canvas[dstOff + 2] = b;
      canvas[dstOff + 3] = 255;
    }
  };

  const copyRegion = (sX: number, sY: number, sW: number, sH: number, dX: number, dY: number, dW: number, dH: number) => {
    for (let y = 0; y < dH; y += 1) {
      for (let x = 0; x < dW; x += 1) {
        const srcX = sX + (x / dW) * sW;
        const srcY = sY + (y / dH) * sH;
        copyPixel(srcX, srcY, dX + x, dY + y);
      }
    }
  };

  // Front View Slicing
  copyRegion(8, 4, 16, 16, 8, 8, 8, 8); // Head Front
  copyRegion(8, 0, 16, 8, 8, 0, 8, 8); // Head Top
  copyRegion(0, 4, 8, 16, 0, 8, 8, 8); // Head Right
  copyRegion(24, 4, 8, 16, 16, 8, 8, 8); // Head Left
  copyRegion(8, 20, 16, 24, 20, 20, 8, 12); // Torso Front
  copyRegion(8, 18, 16, 4, 20, 16, 8, 4); // Torso Top
  copyRegion(0, 20, 8, 24, 44, 20, armW, 12); // Right Arm Front
  copyRegion(24, 20, 8, 24, 36, 52, armW, 12); // Left Arm Front
  copyRegion(8, 44, 8, 20, 4, 20, 4, 12); // Right Leg Front
  copyRegion(16, 44, 8, 20, 20, 52, 4, 12); // Left Leg Front

  // Back View Slicing
  copyRegion(72, 4, 16, 16, 24, 8, 8, 8); // Head Back
  copyRegion(72, 20, 16, 24, 32, 20, 8, 12); // Torso Back
  copyRegion(64, 20, 8, 24, 48 + armW, 20, armW, 12); // Right Arm Back
  copyRegion(88, 20, 8, 24, 44, 52, armW, 12); // Left Arm Back
  copyRegion(72, 44, 8, 20, 12, 20, 4, 12); // Right Leg Back
  copyRegion(80, 44, 8, 20, 28, 52, 4, 12); // Left Leg Back

  return canvas;
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
    return rebuildShowcaseTexture(source, model);
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

const MINECRAFT_SKIN_JSON_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    hairStyle: {
      type: "string",
      enum: ["short", "long", "spiky", "hood", "helmet", "bald"],
    },
    hairSilhouette: {
      type: "string",
      enum: [
        "curtain-bangs",
        "messy-fringe",
        "side-swept",
        "wolf-cut",
        "layered-short",
        "middle-part-flow",
        "long-layered",
        "spiky-anime",
        "high-ponytail",
        "braided-buns",
      ],
    },
    bangsStyle: {
      type: "string",
      enum: ["curtain", "fringe", "side-swept", "straight", "parted", "none"],
    },
    faceConstruction: {
      type: "string",
      enum: [
        "clean-aesthetic",
        "anime-expressive",
        "masculine-angular",
        "feminine-soft",
        "soft-cute",
        "masked-visor",
        "mature-minimal",
        "soft-kpop",
        "sharp-cool",
      ],
    },
    expression: {
      type: "string",
      enum: ["neutral", "friendly", "serious", "calm-confident"],
    },
    eyeShape: {
      type: "string",
      enum: ["normal", "angry", "soft"],
    },
    eyeStyle: {
      type: "string",
      enum: ["anime", "classic", "glowing", "minimal", "visor"],
    },
    mouthStyle: {
      type: "string",
      enum: ["smile", "neutral", "smirk", "open", "none"],
    },
    facialHair: {
      type: "string",
      enum: ["none", "stubble", "short-beard", "goatee"],
    },
    faceStyle: {
      type: "string",
      enum: ["open", "mask", "visor"],
    },
    garmentType: {
      type: "string",
      enum: [
        "bomber-jacket",
        "oversized-hoodie",
        "fitted-hoodie",
        "varsity-jacket",
        "oversized-sweater",
        "streetwear-shirt",
        "layered-shirt-jacket",
        "techwear",
        "denim-jacket",
        "fantasy-robe",
        "plate-armor",
        "jacket",
        "sweater",
        "shirt",
        "coat",
        "armor",
        "tunic",
        "robe",
      ],
    },
    placket: {
      type: "string",
      enum: [
        "open_front",
        "center_zip",
        "pullover",
        "buttons_single",
        "buttons_double",
        "haori_wrap",
        "armor_fauld",
      ],
    },
    fit: {
      type: "string",
      enum: ["oversized", "fitted", "loose"],
    },
    hoodState: {
      type: "string",
      enum: ["none", "down", "up"],
    },
    midLayer: {
      type: "string",
      enum: ["hoodie", "sweater", "vest", "none"],
    },
    innerGarment: {
      type: "string",
      enum: [
        "undershirt",
        "crew_tee",
        "graphic_tee",
        "turtleneck",
        "striped_undershirt",
        "v_neck_tee",
        "tunic",
        "none",
      ],
    },
    zipper: {
      type: "string",
      enum: ["silver", "gold", "black", "none"],
    },
    drawstrings: {
      type: "string",
      enum: ["none", "thin", "tied"],
    },
    emblem: {
      type: "string",
    },
    sleeves: {
      type: "string",
      enum: ["short", "long", "armored"],
    },
    sleeveStyle: {
      type: "string",
      enum: [
        "layered_undershirt",
        "slouch_gather",
        "short_sleeve",
        "rolled_cuff",
        "wide_haori",
        "gauntlet_bracer",
      ],
    },
    gloves: {
      type: "boolean",
    },
    outfit: {
      type: "string",
      enum: ["casual", "streetwear", "armor", "royal", "cyber", "fantasy", "formal", "sport"],
    },
    pattern: {
      type: "string",
      enum: ["clean", "striped", "paneled", "armored", "mystic", "lightning", "circuit"],
    },
    materialProfile: {
      type: "string",
      enum: ["cotton", "denim", "leather", "metal", "wool", "technical-fabric", "skin", "hair"],
    },
    pantsType: {
      type: "string",
      enum: [
        "wide_cargo",
        "relaxed_jeans",
        "tailored_trousers",
        "pleated_skirt",
        "jumpsuit_cuffed",
        "shorts_knee_highs",
      ],
    },
    cargoPockets: {
      type: "boolean",
    },
    footwear: {
      type: "string",
      enum: ["shoes", "boots", "armored"],
    },
    footwearStyle: {
      type: "string",
      enum: [
        "high-top-sneaker",
        "chunky-sneaker",
        "low-sneaker",
        "combat-boots",
        "chelsea-boots",
        "fantasy-armored",
        "sneakers",
        "high-tops",
        "boots",
        "armored",
        "shoes",
      ],
    },
    socks: {
      type: "string",
      enum: ["none", "ankle", "knee_high_plain", "knee_high_striped"],
    },
    lightingDirection: {
      type: "string",
      enum: ["upper-left", "upper-right", "front", "top-down"],
    },
    asymmetry: {
      type: "boolean",
    },
    negativeConstraints: {
      type: "array",
      items: { type: "string" },
    },
    traits: {
      type: "array",
      items: { type: "string" },
    },
    headphones: { type: "boolean" },
    glasses: { type: "boolean" },
    cables: { type: "boolean" },
    horns: { type: "boolean" },
    crown: { type: "boolean" },
    halo: { type: "boolean" },
    palette: {
      type: "object",
      properties: {
        skin: { type: "string" },
        skinShade: { type: "string" },
        hair: { type: "string" },
        hairHighlight: { type: "string" },
        eyes: { type: "string" },
        top: { type: "string" },
        topAccent: { type: "string" },
        pants: { type: "string" },
        shoes: { type: "string" },
        detail: { type: "string" },
      },
      required: [
        "skin",
        "skinShade",
        "hair",
        "hairHighlight",
        "eyes",
        "top",
        "topAccent",
        "pants",
        "shoes",
        "detail",
      ],
      additionalProperties: false,
    },
  },
  required: [
    "name",
    "description",
    "hairStyle",
    "hairSilhouette",
    "bangsStyle",
    "faceConstruction",
    "expression",
    "eyeShape",
    "eyeStyle",
    "mouthStyle",
    "facialHair",
    "faceStyle",
    "garmentType",
    "placket",
    "fit",
    "hoodState",
    "midLayer",
    "innerGarment",
    "zipper",
    "drawstrings",
    "emblem",
    "sleeves",
    "sleeveStyle",
    "gloves",
    "outfit",
    "pattern",
    "materialProfile",
    "pantsType",
    "cargoPockets",
    "footwear",
    "footwearStyle",
    "socks",
    "lightingDirection",
    "asymmetry",
    "negativeConstraints",
    "traits",
    "headphones",
    "glasses",
    "cables",
    "horns",
    "crown",
    "halo",
    "palette",
  ],
  additionalProperties: false,
};

function buildDesignInstruction(
  prompt: string,
  style: string,
  targetPart: MinecraftSkinPart,
  referenceMode: "inspire" | "guided" | "rebuild"
) {
  const wantsExactRef = /\b(exact|same|this|inspiration|reference|image|picture|like this|copy)\b/i.test(prompt);
  const referencePriority = (referenceMode === "guided" || wantsExactRef)
    ? "CRITICAL: Treat the reference image as the primary character identity! Faithfully replicate its character traits, outfit type, and color palette."
    : "Treat the written prompt as primary. Use the reference for useful color, silhouette, and material cues.";
  return [
    `Create a coherent Minecraft skin design specification for: "${prompt}".`,
    `Visual treatment: ${style}.`,
    referencePriority,
    targetPart === "all"
      ? "Design the complete character."
      : `Refresh the ${targetPart} while keeping it compatible with the original character.`,
  ].join("\n");
}

async function createAiDesign(
  prompt: string,
  style: string,
  targetPart: MinecraftSkinPart,
  referenceMode: "inspire" | "guided" | "rebuild",
  referenceImage?: string
): Promise<Partial<MinecraftSkinDesign> | null> {
  const keys = getGroqKeys();
  if (!keys.length) {
    console.warn("[Minecraft Skin] No Groq API keys available; skipping AI direction.");
    return null;
  }

  const hasValidReference = Boolean(
    referenceImage && /^data:image\/(png|jpe?g|webp);base64,/i.test(referenceImage)
  );
  const instruction = buildDesignInstruction(prompt, style, targetPart, referenceMode);
  const userContent = hasValidReference
    ? [
        {
          type: "text",
          text: `${instruction}\nAnalyze the attached image carefully before writing JSON specifications.`,
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
          temperature: referenceMode === "guided" ? 0.20 : 0.15,
          max_tokens: 3000,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "minecraft_skin_design",
              strict: true,
              schema: MINECRAFT_SKIN_JSON_SCHEMA,
            },
          },
          messages: [
            {
              role: "system",
              content: [
                "You are Exismic's professional Minecraft skin director. Deconstruct the user's character prompt into strict structured design tokens for a 64x64 Minecraft skin.",
                "RULES FOR EXTRACTION:",
                "- Garment layering: If open at front, set placket='open_front'. If a hoodie is worn under an open bomber/jacket, set garmentType='bomber-jacket', midLayer='hoodie', hoodState='down'. If undershirt is visible, set innerGarment='undershirt'.",
                "- Details: Extract zippers ('silver'/'gold'/'none'), cargo pockets (cargoPockets=true), emblems ('crescent', etc.), and footwear style ('chunky-sneaker' or 'high-top-sneaker').",
                "- Asymmetry: If asymmetry between arms, legs, or bangs is mentioned, set asymmetry=true.",
                "- Hair: Curtain bangs -> bangsStyle='curtain', hairSilhouette='curtain-bangs'.",
                "- Negative constraints: Strictly honor negative instructions ('NO beard, stubble' -> facialHair='none'; 'NOT look like a helmet' -> hairStyle='short' or 'long', never helmet; 'NOT procedural' is quality guidance, not an emblem; 'multiple shades' refers to color tones, NOT glasses so glasses=false; 'crown of head' refers to skull anatomy, NOT a royal crown so crown=false). Add explicitly forbidden traits to negativeConstraints.",
                "- Palette: Extract hex codes faithfully for all 10 palette fields.",
              ].join("\n"),
            },
            { role: "user", content: userContent },
          ],
        }),
        signal: AbortSignal.timeout(28_000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Minecraft Skin] Groq API returned HTTP ${response.status}:`, errorText);
        lastError = new Error(`Groq HTTP ${response.status}: ${errorText}`);
        continue;
      }

      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error("Groq API returned an empty choices content.");
        continue;
      }
      return extractJson(content);
    } catch (error) {
      console.error("[Minecraft Skin] Groq invocation failed:", error);
      lastError = error;
    }
  }

  console.error("[Minecraft Skin] AI design creation failed on all API keys. Root cause:", lastError);
  return null;
}

async function loadBaseSkin(baseSkinUrl: string | undefined): Promise<Uint8Array> {
  if (!baseSkinUrl) throw new Error("Generate a complete skin before regenerating individual parts.");
  let input: Buffer;
  if (baseSkinUrl.startsWith("data:image/")) {
    const base64Data = baseSkinUrl.replace(/^data:image\/[a-z0-9-+.]+;base64,/i, "");
    input = Buffer.from(base64Data, "base64");
  } else {
    const response = await fetch(baseSkinUrl);
    if (!response.ok) throw new Error("Could not load base skin from storage.");
    const arrayBuffer = await response.arrayBuffer();
    input = Buffer.from(arrayBuffer);
  }

  const image = sharp(input);
  const { data, info } = await image
    .resize(64, 64, { fit: "fill", kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
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
    const filename = `minecraft_${uuidv4()}.png`;
    const resultUrl = await uploadProcessedFile(png, filename, "image/png");

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

    return NextResponse.json({ success: true, skinUrl: resultUrl });
  } catch (error) {
    console.error("[Minecraft Skin] Pixel edit save failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The edited skin could not be saved." },
      { status: 500 }
    );
  }
}

function shadeHex(hex: string, amount: number) {
  const normalized = hex.trim().replace(/^#/, "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized.padStart(6, "0");
  const r = Number.parseInt(value.slice(0, 2), 16) || 0;
  const g = Number.parseInt(value.slice(2, 4), 16) || 0;
  const b = Number.parseInt(value.slice(4, 6), 16) || 0;
  const shift = (c: number) => Math.max(0, Math.min(255, Math.round(c + 255 * amount)));
  return `#${[shift(r), shift(g), shift(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

async function extractImagePalette(referenceImage: string): Promise<Partial<MinecraftSkinPalette>> {
  try {
    const match = referenceImage.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
    if (!match) return {};
    const source = Buffer.from(match[2], "base64");
    const { data } = await sharp(source)
      .resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let redLavaCount = 0;
    let cyanNeonCount = 0;
    let purpleMagicCount = 0;
    let darkObsidianCount = 0;
    let totalValidPixels = 0;

    let dominantRedHex = "#ff2200";
    let dominantCyanHex = "#00f3ff";
    let dominantPurpleHex = "#a855f7";
    let dominantDarkHex = "#181216";

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 50) continue;

      totalValidPixels += 1;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const val = max / 255;

      const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

      if (r > 110 && r > g * 1.25 && r > b * 1.25) {
        redLavaCount += 1;
        if (r > 170) dominantRedHex = hex;
      } else if (g > 130 && b > 130 && r < 110) {
        cyanNeonCount += 1;
        dominantCyanHex = hex;
      } else if (r > 110 && b > 130 && g < 110) {
        purpleMagicCount += 1;
        dominantPurpleHex = hex;
      } else if (val < 0.28) {
        darkObsidianCount += 1;
        if (val < 0.18) dominantDarkHex = hex;
      }
    }

    if (!totalValidPixels) return {};

    // 1. Red & Black Lava Demon Archetype
    if (redLavaCount / totalValidPixels > 0.03 || (redLavaCount >= 10 && darkObsidianCount >= 25)) {
      return {
        skin: dominantDarkHex,
        skinShade: shadeHex(dominantDarkHex, -0.15),
        top: dominantDarkHex,
        topAccent: dominantRedHex,
        pants: dominantDarkHex,
        shoes: dominantRedHex,
        hair: dominantDarkHex,
        hairHighlight: dominantRedHex,
        eyes: dominantRedHex,
        detail: dominantRedHex,
      };
    }

    // 2. Cyan Cyber / Tech Archetype
    if (cyanNeonCount / totalValidPixels > 0.04) {
      return {
        skin: "#1a1c2e",
        skinShade: "#101220",
        top: "#141624",
        topAccent: dominantCyanHex,
        pants: "#0d0f19",
        shoes: dominantCyanHex,
        hair: "#1a1c2e",
        hairHighlight: dominantCyanHex,
        eyes: dominantCyanHex,
        detail: dominantCyanHex,
      };
    }

    // 3. Purple Magic / Mystic Archetype
    if (purpleMagicCount / totalValidPixels > 0.04) {
      return {
        skin: "#21133d",
        skinShade: "#150a29",
        top: "#2a154c",
        topAccent: dominantPurpleHex,
        pants: "#1b0c33",
        shoes: dominantPurpleHex,
        hair: "#2a154c",
        hairHighlight: dominantPurpleHex,
        eyes: dominantPurpleHex,
        detail: dominantPurpleHex,
      };
    }

    // 4. Dark Armor Archetype
    if (darkObsidianCount / totalValidPixels > 0.3) {
      return {
        skin: dominantDarkHex,
        skinShade: shadeHex(dominantDarkHex, -0.15),
        top: dominantDarkHex,
        topAccent: "#eab308",
        pants: dominantDarkHex,
        shoes: "#333333",
        hair: dominantDarkHex,
        hairHighlight: "#555555",
        eyes: "#eab308",
        detail: "#eab308",
      };
    }

    return {};
  } catch (e) {
    console.warn("[Minecraft Skin] Palette extraction bypass:", e);
    return {};
  }
}

export async function POST(request: NextRequest) {
  const apiUser = await getOptionalApiUser();

  const rateLimit = checkRateLimit(
    `minecraft-skin:${apiUser?.id || "guest"}:${getRequestIp(request)}`,
    apiUser ? 12 : 3,
    10 * 60 * 1000
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter);

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
      eyeStyle,
      mouthStyle,
      targetPart,
      baseSkinUrl,
      referenceImage,
      referenceMode,
    } = body.data;
    const seed = getMinecraftSkinSeed(prompt, body.data.seed);
    const user = apiUser ? await ensureDatabaseUser(apiUser) : null;
    const isPro = Boolean(user && (user.plan === "pro" || user.subscriptionStatus === "active"));
    const referenceRebuilt = referenceMode === "rebuild" && Boolean(referenceImage);
    const baseCost = getToolCreditCost("image-minecraft-skin", 24);
    const cost = referenceRebuilt
      ? (isPro ? 6 : 10)
      : targetPart === "all"
        ? (isPro ? 16 : baseCost)
        : (isPro ? 2 : 4);
    const availableCredits = user ? getCreditTotal(user) : 0;

    if (user && availableCredits < cost) {
      return NextResponse.json(
        {
          error: `This generation needs ${cost} credits. Your current balance is ${availableCredits}.`,
          needsUpgrade: !isPro,
        },
        { status: 403 }
      );
    }

    const imagePalette = referenceImage ? await extractImagePalette(referenceImage) : {};

    const aiDesign = referenceRebuilt
      ? null
      : await createAiDesign(prompt, style, targetPart, referenceMode, referenceImage);

    if (!referenceRebuilt && !aiDesign) {
      console.warn("[Minecraft Skin] AI-directed design extraction was unsuccessful; fallback design was used. aiDirected = false");
    }

    const design = sanitizeSkinDesign(
      {
        ...(aiDesign || {}),
        ...(eyeStyle ? { eyeStyle } : {}),
        ...(mouthStyle ? { mouthStyle } : {}),
        palette: {
          ...(aiDesign?.palette || {}),
          ...imagePalette,
        },
      },
      prompt,
      seed
    );

    let referenceGuided = Boolean(referenceImage && !referenceRebuilt);
    let generated: Uint8Array;
    let renderer: "blueprint" | "procedural" = "procedural";

    if (referenceRebuilt) {
      generated = await rebuildReferenceTexture(referenceImage!, armModel as MinecraftArmModel);
    } else if (process.env.FEATURE_FLAG_BLUEPRINT_RENDERER === "true") {
      try {
        generated = compileMinecraftSkinBlueprint(
          design,
          seed,
          armModel as MinecraftArmModel,
          style,
          prompt
        );
        renderer = "blueprint";
      } catch (blueprintError) {
        console.error("[Minecraft Skin] Blueprint compilation failed, falling back to legacy:", blueprintError);
        generated = compileMinecraftSkin(design, seed, armModel as MinecraftArmModel, style, prompt);
        renderer = "procedural";
      }
    } else {
      generated = compileMinecraftSkin(design, seed, armModel as MinecraftArmModel, style, prompt);
    }
    const pixels = targetPart === "all"
      ? generated
      : mergeMinecraftSkinPart(await loadBaseSkin(baseSkinUrl), generated, targetPart);
    const png = await sharp(Buffer.from(pixels), {
      raw: { width: 64, height: 64, channels: 4 },
    })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();

    const filename = `minecraft_${uuidv4()}.png`;
    const resultUrl = await uploadProcessedFile(png, filename, "image/png");

    if (!apiUser) {
      return NextResponse.json({
        success: true,
        skinUrl: resultUrl,
        design,
        armModel,
        targetPart,
        seed,
        cost: 0,
        priority: false,
        referenceRebuilt,
        referenceGuided,
        renderer,
        outputTier: "standard",
        creditsRemaining: null,
      });
    }

    const debit = await deductCredits(
      apiUser.id,
      cost,
      "image-minecraft-skin",
      `tool:minecraft-skin:${filename}`,
    );
    if (!debit.success || !debit.data) {
      return NextResponse.json(
        { error: debit.error || "Your credit balance changed. Please try again." },
        { status: 402 },
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: apiUser.id },
        data: { aiGenerationsUsed: { increment: 1 } },
      }),
      prisma.userFile.create({
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
            renderer,
            design: JSON.parse(JSON.stringify(design)) as Prisma.InputJsonObject,
            aiDirected: Boolean(aiDesign),
          } satisfies Prisma.InputJsonObject,
        },
      }),
    ]);

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
      renderer,
      creditsRemaining: getCreditTotal(debit.data),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Skin generation failed.";
    console.error("[Minecraft Skin] Generation failed:", error);
    return NextResponse.json(
      { error: message === "fetch failed" ? "The design service is temporarily unavailable." : message },
      { status: 500 }
    );
  }
}
