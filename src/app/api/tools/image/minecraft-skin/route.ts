import { publicJson } from "@/lib/public-json";
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
  type MinecraftSkinStyle,
} from "@/lib/minecraft-skin";
import { compileMinecraftSkinBlueprint } from "@/lib/minecraft-skin-blueprint";
import {
  MINECRAFT_SKIN_JSON_SCHEMA,
  MINECRAFT_ARTWORK_JSON_SCHEMA,
  MINECRAFT_REMIX_JSON_SCHEMA,
  MINECRAFT_SKIN_ART_INSTRUCTION,
  LEGACY_STYLE_MAP,
  buildDesignInstruction,
  buildSkinArtConstraints,
  mergeRemixDesign,
  mergeMinecraftRemixPixels,
  minecraftRemixParts,
} from "@/lib/minecraft-skin-control";
import { DEFAULT_GROQ_TEXT_MODEL, DEFAULT_GROQ_VISION_MODEL } from "@/lib/ai-models";
import { sanitizeSkinPixelArt } from "@/lib/minecraft-skin-art-types";

export const runtime = "nodejs";
export const maxDuration = 45;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEXT_MODEL = DEFAULT_GROQ_TEXT_MODEL;
const VISION_MODEL = DEFAULT_GROQ_VISION_MODEL;

const requestSchema = z.object({
  prompt: z.string().trim().min(2).max(2000),
  armModel: z.enum(["classic", "slim"]).default("classic"),
  style: z
    .enum([
      "balanced",
      "detailed",
      "anime",
      "pixel-artist",
      "minimal",
      "pixel-detailed",
      "high-contrast",
    ])
    .default("balanced"),
  eyeStyle: z.enum(["anime", "classic", "glowing", "minimal", "visor"]).optional(),
  mouthStyle: z.enum(["smile", "neutral", "smirk", "open", "none", "masked"]).optional(),
  targetPart: z.enum(["all", "head", "torso", "arms", "legs"]).default("all"),
  seed: z.number().int().min(0).max(4294967295).optional(),
  baseSkinUrl: z.string().max(6_000_000).optional(),
  referenceImage: z.string().max(6_000_000).optional(),
  referenceMode: z.enum(["inspire", "guided", "rebuild"]).default("guided"),
  action: z.enum(["generate", "variation", "remix"]).default("generate"),
  parentDesign: z.record(z.string(), z.unknown()).optional(),
  parentGenerationId: z.string().max(120).optional(),
  remixInstruction: z.string().trim().min(2).max(1000).optional(),
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

function extractJson(content: string): Partial<MinecraftSkinDesign> {
  try {
    return JSON.parse(content) as Partial<MinecraftSkinDesign>;
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("Invalid design response.");
    return JSON.parse(content.slice(start, end + 1)) as Partial<MinecraftSkinDesign>;
  }
}

function getGroqKeys(): string[] {
  return (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

async function refineAiArtwork(design: Partial<MinecraftSkinDesign>, prompt: string, usedKey: string, deadline: number): Promise<Partial<MinecraftSkinDesign> | null> {
  const { pixelArt: existingArt, ...character } = design;
  const instruction = [
    `Draw original coordinated Minecraft pixel artwork for: ${prompt}`,
    `FIXED CHARACTER SETTINGS AND MAIN PALETTE: ${JSON.stringify(character)}`,
    MINECRAFT_SKIN_ART_INSTRUCTION,
    "Return ONLY pixelArt and artColors. Choose four #rrggbb artColors U/V/O/Z for explicitly requested secondary colors and motifs (e.g. burgundy sleeve panels, gold embroidery, silver seams). Their lowercase tokens are shadows. Do not alter the main palette or character identity.",
    "Compose 6-10 faces with exact dimensions. Clothing faces MUST leave at least half their pixels as dots; draw requested motifs, connected folds and stitches on the correct material. Human hair requires three H/h/L/D tones and negative space around both eyes. No flat slabs. Each face MUST use a region from the schema; each row MUST have the schema instruction's exact width.",
  ].join("\n");
  // Prefer a different key after the initial design request, within the same
  // overall response deadline. Provider failure remains a free failed request.
  const keys = getGroqKeys();
  const ordered = [...keys.filter((key) => key !== usedKey), ...keys.filter((key) => key === usedKey)];
  for (const key of ordered) {
    const remaining = deadline - Date.now();
    if (remaining < 1000) break;
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: TEXT_MODEL, temperature: 0.3, reasoning_effort: "low", max_tokens: 2500,
          response_format: { type: "json_schema", json_schema: { name: "minecraft_artwork", strict: true, schema: MINECRAFT_ARTWORK_JSON_SCHEMA } },
          messages: [{ role: "system", content: "You are a Minecraft pixel artist. This pass is exclusively for original connected drawings; character settings are final. Return every required artwork field." }, { role: "user", content: instruction }],
        }),
        signal: AbortSignal.timeout(Math.min(12_000, remaining)),
      });
      if (!response.ok) continue;
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) continue;
      const artwork = extractJson(content);
      const accepted = sanitizeSkinPixelArt(artwork.pixelArt, design.characterType);
      const validColors = ["U", "V", "O", "Z"].every((token) => /^#[a-f0-9]{6}$/i.test(artwork.artColors?.[token as "U" | "V" | "O" | "Z"] || ""));
      if (accepted.length < 2 || !validColors) continue;
      // Keep existing accepted motifs on faces the artist pass did not redraw.
      const revisedFaces = new Set(accepted.map((face) => `${face.region}:${face.layer}`));
      return { ...design, artColors: artwork.artColors, pixelArt: [...sanitizeSkinPixelArt(existingArt, design.characterType).filter((face) => !revisedFaces.has(`${face.region}:${face.layer}`)), ...accepted] };
    } catch { /* Try the next configured key within the remaining deadline. */ }
  }
  return null;
}

async function createAiDesign(
  prompt: string,
  style: string,
  targetPart: MinecraftSkinPart,
  referenceMode: "inspire" | "guided" | "rebuild",
  referenceImage?: string,
  parentDesign?: Partial<MinecraftSkinDesign>,
): Promise<Partial<MinecraftSkinDesign> | null> {
  const keys = getGroqKeys();
  if (!keys.length) {
    console.warn("[Minecraft Skin] No Groq API keys available; skipping AI direction.");
    return null;
  }

  const hasValidReference = Boolean(
    referenceImage && /^data:image\/(png|jpe?g|webp);base64,/i.test(referenceImage)
  );
  const instruction = buildDesignInstruction(prompt, style, targetPart, referenceMode) + (parentDesign
    ? `\nCURRENT CHARACTER: ${JSON.stringify(parentDesign)}\nApply only the requested change. Keep the existing outfit structure, colors and features unless explicitly changed. Keep artColors U/V/O/Z and their roles unchanged unless recoloring their specific embroidery/panels/markings; return all four artColors when supplied. A skin reference is a flat 64x64 Minecraft UV texture atlas, not a portrait.`
    : "");
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
  const deadline = Date.now() + 36_000;
  for (const key of keys) {
    if (deadline - Date.now() < 1000) break;
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: hasValidReference ? VISION_MODEL : TEXT_MODEL,
          reasoning_effort: hasValidReference ? "none" : "low",
          temperature: referenceMode === "guided" ? 0.20 : 0.15,
          max_tokens: 4000,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "minecraft_skin_design",
              strict: true,
              schema: targetPart !== "all" && Object.keys(parentDesign?.artColors || {}).length ? MINECRAFT_REMIX_JSON_SCHEMA : MINECRAFT_SKIN_JSON_SCHEMA,
            },
          },
          messages: [
            {
              role: "system",
              content: [
                "You are Exismic's Minecraft pixel artist. Return a complete schema-valid 64x64 skin specification AND original composed pixel drawings for its distinguishing features.",
                "Keep every requested color, garment, expression and accessory. Use faithful #rrggbb palette colors. Draw motifs with pixelArt; emblem is short requested LETTERING only, otherwise an empty string.",
                "CLOTHING: outer garment=garmentType, open jacket=placket open_front, separate middle hoodie/sweater=midLayer, inner tee=innerGarment. Hoodie worn alone has midLayer none, placket pullover, zipper none unless zip-up. Cargo pants do not add torso pockets. Layered hair does not imply layered sleeves; hoodies have long sleeves unless requested otherwise.",
                "HAIR: choose the requested silhouette and bangs; use asymmetry when requested. NEGATIVES MUST STAY ABSENT: clean shaven=no facial hair; no helmet=normal hair; no glasses/horns/headphones/hat disables those features. Include forbidden concepts in negativeConstraints, never enable them from their mention.",
                "STYLE: balanced=harmonious shading; detailed/pixel-artist=connected material shading and purposeful detail; anime=expressive face and bold strands; minimal=quiet shapes with few accents. Return every required field with neutral values for unused features.",
              ].join("\n"),
            },
            { role: "user", content: userContent },
          ],
        }),
        signal: AbortSignal.timeout(Math.min(28_000, deadline - Date.now())),
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
      const design = extractJson(content);
      if (targetPart === "all" && ["detailed", "pixel-artist", "pixel-detailed", "high-contrast"].includes(style)) {
        return refineAiArtwork(design, prompt, key, deadline);
      }
      return design;
    } catch (error) {
      console.error("[Minecraft Skin] Groq invocation failed:", error);
      lastError = error;
    }
  }

  console.error("[Minecraft Skin] AI design creation failed on all API keys. Root cause:", lastError);
  return null;
}

async function remixAiDesign(
  parentDesign: Partial<MinecraftSkinDesign>,
  remixInstruction: string,
  style: string
): Promise<Partial<MinecraftSkinDesign> | null> {
  const keys = getGroqKeys();
  if (!keys.length) return null;

  const remixPrompt = [
    `You are Exismic's Minecraft skin modification director. You are given an EXISTING complete MinecraftSkinDesign specification and a user remix modification request.`,
    `EXISTING DESIGN:`,
    JSON.stringify(parentDesign, null, 2),
    `USER REMIX INSTRUCTION: "${remixInstruction}"`,
    `STYLE: ${style}`,
    ``,
    `CRITICAL FIELD-LEVEL PRESERVATION RULES:`,
    `1. Apply ONLY the specific modifications directly requested by the user.`,
    `2. You MUST strictly PRESERVE all other fields from the existing design exactly as they are without drift:`,
    `   - If user asks to change top/jacket color (e.g. 'change hoodie to red'), change ONLY palette.top (or topAccent/garmentType) and keep skin, hair, eyes, pants, shoes, and accessories identical.`,
    `   - If user asks to change hair (e.g. 'make hair shorter' or 'silver hair'), change ONLY hairStyle/hairSilhouette/hairLength or palette.hair/hairHighlight, preserving outfit, skin, and face.`,
    `   - If user asks to add an accessory (e.g. 'add headphones'), set headphones=true, preserving everything else.`,
    `   - If user asks to remove an accessory (e.g. 'remove glasses'), set glasses=false, preserving everything else.`,
    `   - If user asks to modify or remove facial hair (e.g. 'remove facial hair', 'clean shaven', 'no beard', 'goatee'), set facialHair accordingly ('none', 'stubble', 'short-beard', 'goatee') and NEVER alter head hair, eyes, skin, or clothing.`,
    `   - If user asks for a broad style change (e.g. 'make the outfit cyberpunk'), change outfit, garmentType, pattern, and accent colors, but PRESERVE the character's skin tone, face construction, and general identity.`,
    `3. NEVER reset unspecified fields to generic defaults.`,
    MINECRAFT_SKIN_ART_INSTRUCTION,
    buildSkinArtConstraints(remixInstruction),
    `4. Preserve existing pixelArt for all unchanged parts; palette recolors should retain the same pixel pattern.`,
    `5. Preserve artColors U/V/O/Z exactly unless the user specifically recolors their embroidery, panels or markings. Return all four hex colors; for a legacy skin without artColors use its detail color as their neutral default.`,
  ].join("\n");

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
          model: TEXT_MODEL,
          temperature: 0.12,
          reasoning_effort: "low",
          max_tokens: 4000,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "minecraft_skin_design",
              strict: true,
              schema: MINECRAFT_REMIX_JSON_SCHEMA,
            },
          },
          messages: [
            {
              role: "system",
              content: "You are Exismic's Minecraft skin modification director. Perform surgical, field-level modifications to the provided skin design according to the user instruction, while strictly preserving all unmentioned attributes.",
            },
            { role: "user", content: remixPrompt },
          ],
        }),
        signal: AbortSignal.timeout(28_000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`Groq HTTP ${response.status}: ${errorText}`);
        continue;
      }

      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) continue;
      return extractJson(content);
    } catch (error) {
      lastError = error;
    }
  }

  console.error("[Minecraft Skin] AI remix failed on all API keys. Root cause:", lastError);
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

  const rateLimit = await checkRateLimit(
    `minecraft-skin-edit:${apiUser.id}`,
    30,
    10 * 60 * 1000
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter, rateLimit.unavailable);

  try {
    const parsed = editRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return publicJson(
        { error: parsed.error.issues[0]?.message || "The edited skin data is invalid." },
        { status: 400 }
      );
    }

    await ensureDatabaseUser(apiUser);
    const source = Buffer.from(parsed.data.skinDataUrl.split(",")[1], "base64");
    const image = sharp(source);
    const metadata = await image.metadata();
    if (metadata.width !== 64 || metadata.height !== 64) {
      return publicJson({ error: "Edited skins must remain exactly 64x64 pixels." }, { status: 400 });
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
          sizeBytes: png.length,
          editor: "pixel-studio",
        },
      },
    });

    return publicJson({ success: true, skinUrl: resultUrl });
  } catch (error) {
    console.error("[Minecraft Skin] Pixel edit save failed:", error);
    return publicJson(
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

  const rateLimit = await checkRateLimit(
    `minecraft-skin:${apiUser?.id || getRequestIp(request)}`,
    apiUser ? 12 : 3,
    10 * 60 * 1000
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter, rateLimit.unavailable);

  try {
    const body = requestSchema.safeParse(await request.json());
    if (!body.success) {
      return publicJson(
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
      action,
      parentDesign,
      parentGenerationId,
      remixInstruction,
    } = body.data;

    if (action === "remix" && !minecraftRemixParts(remixInstruction || prompt).length) {
      return publicJson({ error: "Describe something you want to change, such as the jacket color." }, { status: 400 });
    }

    let seed = getMinecraftSkinSeed(prompt, body.data.seed);
    const user = apiUser ? await ensureDatabaseUser(apiUser) : null;
    const isPro = Boolean(user && (user.plan === "pro" || user.subscriptionStatus === "active"));
    const referenceRebuilt = referenceMode === "rebuild" && Boolean(referenceImage);
    const baseCost = getToolCreditCost("image-minecraft-skin", 25);
    const cost = referenceRebuilt
      ? (isPro ? 6 : 10)
      : targetPart === "all"
        ? (isPro ? 16 : baseCost)
        : (isPro ? 2 : 4);
    const availableCredits = user ? getCreditTotal(user) : 0;

    if (user && availableCredits < cost) {
      return publicJson(
        {
          error: `This generation needs ${cost} credits. Your current balance is ${availableCredits}.`,
          needsUpgrade: !isPro,
        },
        { status: 403 }
      );
    }

    const imagePalette = referenceImage ? await extractImagePalette(referenceImage) : {};

    let aiDesign: Partial<MinecraftSkinDesign> | null = null;
    let effectivePrompt = prompt;

    if (referenceRebuilt) {
      aiDesign = null;
    } else if (action === "variation") {
      // 🎲 REGENERATE VARIATION: Preserve parent MinecraftSkinDesign as primary anchor
      // Generate a genuinely distinct composition seed to vary hair flow, asymmetry, and clusters
      seed = ((body.data.seed || seed) + Math.floor(Math.random() * 999999) + 1) % 4294967296;
      if (parentDesign && typeof parentDesign === "object") {
        const parent = parentDesign as Partial<MinecraftSkinDesign>;
        effectivePrompt = parent.description || prompt;
        const variation = await remixAiDesign(parent,
          "Draw a fresh original variation of the sparse pixelArt: change connected hair highlight clusters, small cloth fold highlights, seam stitches and screen artwork. Keep character type, all palette colors, garment types, facial features and accessories unchanged. Provide 2-6 new valid sparse face drawings, not flat material fills.", style);
        if (variation) {
          aiDesign = {
            ...parent,
            pixelArt: variation.pixelArt?.length ? variation.pixelArt : parent.pixelArt,
            lightingDirection: parent.lightingDirection === "upper-left" ? "upper-right" : "upper-left",
          };
        }
      } else {
        aiDesign = await createAiDesign(prompt, style, targetPart, referenceMode, referenceImage);
      }
    } else if (action === "remix") {
      // 🪄 REMIX: Apply requested modifications while strictly preserving unmentioned attributes
      const instruction = remixInstruction || prompt;
      effectivePrompt = instruction;
      if (parentDesign && typeof parentDesign === "object") {
        const rawRemix = await remixAiDesign(parentDesign as Partial<MinecraftSkinDesign>, instruction, style);
        if (rawRemix) aiDesign = mergeRemixDesign(parentDesign as Partial<MinecraftSkinDesign>, rawRemix, instruction);
      } else {
        aiDesign = await createAiDesign(instruction, style, targetPart, referenceMode, referenceImage);
      }
    } else {
      // Standard Generation
      aiDesign = await createAiDesign(prompt, style, targetPart, referenceMode, referenceImage, parentDesign as Partial<MinecraftSkinDesign> | undefined);
      if (aiDesign && parentDesign && targetPart !== "all") {
        aiDesign = mergeRemixDesign(parentDesign as Partial<MinecraftSkinDesign>, aiDesign, prompt);
      }
    }

    if (!referenceRebuilt && !aiDesign) {
      // Do not store or charge for a basic fallback presented as a successful AI edit.
      return publicJson({ error: "The AI could not finish this skin. Your credits were not used. Please try again shortly." }, { status: 503 });
    }

    // Palette Precedence: Groq extraction (honoring prompt overrides) takes precedence over image color counts
    const design = sanitizeSkinDesign(
      {
        ...(aiDesign || {}),
        ...(eyeStyle ? { eyeStyle } : {}),
        ...(mouthStyle ? { mouthStyle } : {}),
        palette: {
          ...imagePalette,
          ...(aiDesign?.palette || {}),
        },
      },
      effectivePrompt,
      seed
    );

    const referenceGuided = Boolean(referenceImage && referenceMode === "guided" && !referenceRebuilt);
    const renderPrompt = parentDesign && (action === "remix" || targetPart !== "all")
      ? `${typeof parentDesign.description === "string" ? parentDesign.description : prompt}. ${effectivePrompt}`
      : effectivePrompt;
    let generated: Uint8Array;
    let renderer: "blueprint" | "procedural" = "procedural";

    const legacyStyle: MinecraftSkinStyle =
      style === "detailed" || style === "pixel-artist"
        ? "pixel-detailed"
        : style === "anime"
          ? "balanced"
          : (style as MinecraftSkinStyle);

    if (referenceRebuilt) {
      generated = await rebuildReferenceTexture(referenceImage!, armModel as MinecraftArmModel);
    } else if (process.env.FEATURE_FLAG_BLUEPRINT_RENDERER !== "false") {
      try {
        generated = compileMinecraftSkinBlueprint(
          design,
          seed,
          armModel as MinecraftArmModel,
          style as any,
          renderPrompt
        );
        renderer = "blueprint";
      } catch (blueprintError) {
        console.error("[Minecraft Skin] Blueprint compilation failed, falling back to legacy:", blueprintError);
        generated = compileMinecraftSkin(design, seed, armModel as MinecraftArmModel, legacyStyle, renderPrompt);
        renderer = "procedural";
      }
    } else {
      generated = compileMinecraftSkin(design, seed, armModel as MinecraftArmModel, legacyStyle, renderPrompt);
    }
    const pixels = action === "remix" && baseSkinUrl
      ? mergeMinecraftRemixPixels(await loadBaseSkin(baseSkinUrl), generated, remixInstruction || prompt)
      : targetPart === "all"
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
      return publicJson({
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
        action,
        parentGenerationId: parentGenerationId || null,
        remixInstruction: remixInstruction || null,
        isVariation: action === "variation",
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
      return publicJson(
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
          originalName: action === "remix" ? `${design.name} (Remix)` : design.name,
          originalUrl: effectivePrompt,
          resultUrl,
          fileType: "image/png",
          status: "completed",
          metadata: {
            width: 64,
            height: 64,
            sizeBytes: png.length,
            armModel,
            targetPart,
            style,
            referenceMode,
            referenceGuided,
            seed,
            renderer,
            originalPrompt: prompt,
            action,
            parentGenerationId: parentGenerationId || null,
            remixInstruction: remixInstruction || null,
            isVariation: action === "variation",
            design: JSON.parse(JSON.stringify(design)) as Prisma.InputJsonObject,
            aiDirected: Boolean(aiDesign),
          } satisfies Prisma.InputJsonObject,
        },
      }),
    ]);

    return publicJson({
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
      action,
      parentGenerationId: parentGenerationId || null,
      remixInstruction: remixInstruction || null,
      isVariation: action === "variation",
      creditsRemaining: getCreditTotal(debit.data),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Skin generation failed.";
    console.error("[Minecraft Skin] Generation failed:", error);
    return publicJson(
      { error: message === "fetch failed" ? "The design service is temporarily unavailable." : message },
      { status: 500 }
    );
  }
}
