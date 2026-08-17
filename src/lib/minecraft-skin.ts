export type MinecraftArmModel = "classic" | "slim";
export type MinecraftSkinPart = "all" | "head" | "torso" | "arms" | "legs";
export type MinecraftSkinStyle = "balanced" | "pixel-detailed" | "minimal" | "high-contrast";

export interface MinecraftSkinPalette {
  skin: string;
  skinShade: string;
  hair: string;
  hairHighlight: string;
  eyes: string;
  top: string;
  topAccent: string;
  pants: string;
  shoes: string;
  detail: string;
}

export interface MinecraftSkinDesign {
  name: string;
  description: string;
  hairStyle: "short" | "long" | "spiky" | "hood" | "helmet" | "bald";
  outfit: "casual" | "armor" | "royal" | "cyber" | "fantasy" | "formal" | "sport";
  expression: "neutral" | "friendly" | "serious";
  eyeShape: "normal" | "angry" | "soft";
  facialHair: "none" | "stubble" | "short-beard" | "goatee";
  faceStyle: "open" | "mask" | "visor";
  sleeves: "short" | "long" | "armored";
  gloves: boolean;
  footwear: "shoes" | "boots" | "armored";
  pattern: "clean" | "striped" | "paneled" | "armored" | "mystic" | "lightning" | "circuit";
  emblem: string;
  traits: string[];
  palette: MinecraftSkinPalette;
  headphones?: boolean;
  cables?: boolean;
  horns?: boolean;
  crown?: boolean;
  halo?: boolean;
  glasses?: boolean;
}

type Rgba = [number, number, number, number];
type Face = { x: number; y: number; width: number; height: number };
type ArmFaces = {
  top: Face;
  bottom: Face;
  right: Face;
  front: Face;
  left: Face;
  back: Face;
};

const DEFAULT_PALETTE: MinecraftSkinPalette = {
  skin: "#c98f68",
  skinShade: "#9d6248",
  hair: "#211a22",
  hairHighlight: "#49364f",
  eyes: "#43d9ff",
  top: "#42207a",
  topAccent: "#22d3ee",
  pants: "#171827",
  shoes: "#090b12",
  detail: "#d8b4fe",
};

const THEME_PALETTES: Array<{ match: RegExp; palette: Partial<MinecraftSkinPalette>; outfit: MinecraftSkinDesign["outfit"]; pattern: MinecraftSkinDesign["pattern"] }> = [
  {
    match: /demon|lava|fire|obsidian|dark|hell|shadow|reaper|monster|fiend|dragon/i,
    outfit: "armor",
    pattern: "armored",
    palette: {
      skin: "#181216",
      skinShade: "#0d0a0c",
      top: "#181216",
      topAccent: "#ff2200",
      pants: "#181216",
      shoes: "#ff2200",
      hair: "#120e10",
      hairHighlight: "#ff3300",
      eyes: "#ff0000",
      detail: "#ff2200",
    },
  },
  {
    match: /cyber|neon|future|tech|robot|android/i,
    outfit: "cyber",
    pattern: "paneled",
    palette: { top: "#25105f", topAccent: "#18d7ed", pants: "#101325", detail: "#c14cff", eyes: "#58f3ff" },
  },
  {
    match: /knight|armor|warrior|paladin|soldier/i,
    outfit: "armor",
    pattern: "armored",
    palette: { top: "#39404d", topAccent: "#aab4c5", pants: "#242936", shoes: "#12151d", detail: "#eabf52" },
  },
  {
    match: /wizard|mage|magic|mystic|witch|sorcer/i,
    outfit: "fantasy",
    pattern: "mystic",
    palette: { top: "#3b176f", topAccent: "#b471ff", pants: "#21133d", detail: "#4de8dd", eyes: "#bffcff" },
  },
  {
    match: /royal|king|queen|prince|princess|crown/i,
    outfit: "royal",
    pattern: "paneled",
    palette: { top: "#641f51", topAccent: "#f2c94c", pants: "#29172f", detail: "#f8e39b" },
  },
  {
    match: /forest|nature|ranger|elf|earth/i,
    outfit: "fantasy",
    pattern: "clean",
    palette: { top: "#245844", topAccent: "#83d483", pants: "#20382d", shoes: "#18251e", detail: "#d8c47a" },
  },
  {
    match: /sport|athlete|football|basketball|runner/i,
    outfit: "sport",
    pattern: "striped",
    palette: { top: "#1766b1", topAccent: "#f5f7ff", pants: "#14243b", detail: "#53d9ff" },
  },
];

function normalizeHex(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const normalized = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(normalized)) return `#${normalized.toLowerCase()}`;
  if (/^[0-9a-f]{3}$/i.test(normalized)) {
    return `#${normalized.split("").map((char) => char + char).join("").toLowerCase()}`;
  }
  return fallback;
}

function hexToRgba(hex: string, alpha = 255): Rgba {
  const normalized = normalizeHex(hex, "#000000").slice(1);
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
    alpha,
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hNorm = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const val = Math.round(l * 255);
    return [val, val, val];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);
  return [r, g, b];
}

export interface ShadingRamp {
  highlight: string;
  light: string;
  base: string;
  shadow: string;
  deepShadow: string;
}

export function getHueShiftRamp(hex: string, type: "skin" | "hair" | "fabric" | "metal" | "neon" = "fabric"): ShadingRamp {
  const [r, g, b] = hexToRgba(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  let warmHueShift = 10;
  let coolHueShift = -16;
  let satBoost = 0.08;

  if (type === "skin") {
    warmHueShift = 8;
    coolHueShift = -14;
    satBoost = 0.12;
  } else if (type === "neon") {
    warmHueShift = 4;
    coolHueShift = -6;
    satBoost = 0.02;
  }

  const toHex = ([rVal, gVal, bVal]: [number, number, number]) =>
    `#${[rVal, gVal, bVal].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;

  const highlight = toHex(hslToRgb(h + warmHueShift, Math.max(0, s - 0.06), Math.min(0.98, l + 0.22)));
  const light = toHex(hslToRgb(h + warmHueShift * 0.5, Math.max(0, s - 0.02), Math.min(0.94, l + 0.10)));
  const base = normalizeHex(hex, "#555555");
  const shadow = toHex(hslToRgb(h + coolHueShift, Math.min(1, s + satBoost), Math.max(0.04, l - 0.14)));
  const deepShadow = toHex(hslToRgb(h + coolHueShift * 1.5, Math.min(1, s + satBoost * 1.6), Math.max(0.02, l - 0.26)));

  return { highlight, light, base, shadow, deepShadow };
}

function shade(hex: string, amount: number) {
  const [red, green, blue] = hexToRgba(hex);
  const shift = (channel: number) => Math.max(0, Math.min(255, Math.round(channel + 255 * amount)));
  return `#${[shift(red), shift(green), shift(blue)].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

const PROMPT_COLORS: Array<[string, string]> = [
  ["dark purple", "#4c1d95"],
  ["neon purple", "#a855f7"],
  ["electric purple", "#9333ea"],
  ["purple", "#7c3aed"],
  ["violet", "#8b5cf6"],
  ["magenta", "#d946ef"],
  ["hot pink", "#ec4899"],
  ["pink", "#f472b6"],
  ["cyan", "#06b6d4"],
  ["turquoise", "#14b8a6"],
  ["light blue", "#60a5fa"],
  ["dark blue", "#1e3a8a"],
  ["blue", "#2563eb"],
  ["crimson", "#be123c"],
  ["red", "#dc2626"],
  ["lime", "#84cc16"],
  ["dark green", "#166534"],
  ["green", "#16a34a"],
  ["gold", "#eab308"],
  ["yellow", "#facc15"],
  ["orange", "#f97316"],
  ["silver", "#cbd5e1"],
  ["light gray", "#a1a1aa"],
  ["dark gray", "#27272a"],
  ["grey", "#52525b"],
  ["gray", "#52525b"],
  ["white", "#f4f4f5"],
  ["brown", "#7c4a2d"],
  ["black", "#0b0b10"],
];

function colorNearContext(prompt: string, contexts: string[]) {
  const contextPattern = contexts.map((context) => context.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  for (const [name, color] of PROMPT_COLORS) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `\\b(?:${escapedName})\\b[^,.]{0,30}\\b(?:${contextPattern})\\b|\\b(?:${contextPattern})\\b[^,.]{0,30}\\b(?:${escapedName})\\b`,
      "i"
    );
    if (pattern.test(prompt)) return color;
  }
  return undefined;
}

function extractPromptPalette(prompt: string): Partial<MinecraftSkinPalette> {
  const accent = colorNearContext(prompt, [
    "accent", "lightning", "trim", "line", "lines", "detail", "glow", "glowing",
    "cables?", "wires?", "headphones?", "headset", "leds?", "neon", "circuits?", "visor", "eyes"
  ]);
  const top = colorNearContext(prompt, [
    "hoodie", "jacket", "shirt", "top", "robe", "armor", "coat", "cyberpunk",
    "hacker", "cloak", "suit", "vest", "tunic", "torso", "chest"
  ]);
  const pants = colorNearContext(prompt, ["pants", "trousers", "jeans", "leggings", "legs", "bottom"]);
  const shoes = colorNearContext(prompt, ["shoes", "boots", "sneakers", "footwear", "feet"]);
  const hair = colorNearContext(prompt, ["hair", "bangs", "fringe", "locks"]);
  const eyes = colorNearContext(prompt, ["eyes", "visor", "goggles", "optics", "display", "lens"]);
  const skin = colorNearContext(prompt, ["skin", "complexion", "face", "tone", "body"]);

  let inferredAccent = accent;
  if (!inferredAccent) {
    for (const [name, color] of PROMPT_COLORS) {
      if (new RegExp(`\\b${name}\\b`, "i").test(prompt)) {
        inferredAccent = color;
        break;
      }
    }
  }

  return {
    ...(top ? { top } : {}),
    ...(inferredAccent ? { topAccent: inferredAccent, detail: shade(inferredAccent, 0.16) } : {}),
    ...(pants ? { pants } : {}),
    ...(shoes ? { shoes } : {}),
    ...(hair ? { hair, hairHighlight: shade(hair, 0.12) } : {}),
    ...(eyes ? { eyes } : inferredAccent ? { eyes: inferredAccent } : {}),
    ...(skin ? { skin, skinShade: shade(skin, -0.16) } : {}),
  };
}

function requestsAngryEyes(prompt: string) {
  return (
    /\b(angry|sharp|fierce|intense|menacing)\b[^,.]{0,28}\b(eyes?|eyebrows?)\b/i.test(prompt) ||
    /\b(eyes?|eyebrows?)\b[^,.]{0,36}\b(angry|sharp|fierce|intense|menacing|lowered)\b/i.test(prompt)
  );
}

function requestedFacialHair(prompt: string): MinecraftSkinDesign["facialHair"] {
  if (/\bstubble\b/i.test(prompt)) return "stubble";
  if (/\bgoatee\b/i.test(prompt)) return "goatee";
  if (/\bbeard\b/i.test(prompt)) return "short-beard";
  return "none";
}

function hashSeed(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed || 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

class SkinCanvas {
  readonly pixels = new Uint8Array(64 * 64 * 4);

  getPixel(x: number, y: number): Rgba {
    const offset = (y * 64 + x) * 4;
    return [
      this.pixels[offset],
      this.pixels[offset + 1],
      this.pixels[offset + 2],
      this.pixels[offset + 3],
    ];
  }

  setPixel(x: number, y: number, color: string | Rgba, alpha = 255) {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return;
    const rgba = typeof color === "string" ? hexToRgba(color, alpha) : color;
    const offset = (y * 64 + x) * 4;
    this.pixels[offset] = rgba[0];
    this.pixels[offset + 1] = rgba[1];
    this.pixels[offset + 2] = rgba[2];
    this.pixels[offset + 3] = rgba[3];
  }

  fill(
    face: Face,
    color: string,
    style: MinecraftSkinStyle = "balanced",
    random?: () => number,
    options?: {
      gradientScale?: number;
    }
  ) {
    const isMinimal = style === "minimal";
    const isDetailed = style === "pixel-detailed";
    const isHighContrast = style === "high-contrast";
    const gradScale = options?.gradientScale ?? 1.0;

    for (let y = face.y; y < face.y + face.height; y += 1) {
      for (let x = face.x; x < face.x + face.width; x += 1) {
        const normY = face.height > 1 ? (y - face.y) / (face.height - 1) : 0.5;

        let shadeAmount = 0;

        if (isMinimal) {
          // Clean flat anime block color: 0 random noise, crisp 1px bottom shadow
          if (y === face.y + face.height - 1) shadeAmount = -0.07;
        } else if (isHighContrast) {
          // High contrast: deep rich shadows, bright top rim edge
          shadeAmount = (0.45 - normY) * 0.22 * gradScale;
          if (y === face.y) shadeAmount += 0.12;
          if (y === face.y + face.height - 1) shadeAmount -= 0.16;
          if (x === face.x || x === face.x + face.width - 1) shadeAmount -= 0.08;
        } else if (isDetailed) {
          // Pixel-detailed: soft dither weave + ambient shading
          const grad = (0.5 - normY) * 0.16 * gradScale;
          const dither = ((x + y) % 2 === 0 ? 0.025 : -0.025);
          shadeAmount = grad + dither;
          if (x === face.x || x === face.x + face.width - 1) shadeAmount -= 0.06;
          if (y === face.y + face.height - 1) shadeAmount -= 0.1;
        } else {
          // Balanced (Default): Smooth modern directional gradient
          shadeAmount = (0.5 - normY) * 0.13 * gradScale;
          if (y === face.y) shadeAmount += 0.05;
          if (y === face.y + face.height - 1) shadeAmount -= 0.07;
          if ((x === face.x || x === face.x + face.width - 1) && (y === face.y || y === face.y + face.height - 1)) {
            shadeAmount -= 0.04;
          }
        }

        this.setPixel(x, y, shade(color, shadeAmount));
      }
    }
  }

  line(x: number, y: number, length: number, color: string, vertical = false) {
    for (let index = 0; index < length; index += 1) {
      this.setPixel(x + (vertical ? 0 : index), y + (vertical ? index : 0), color);
    }
  }

  copyRectFrom(source: Uint8Array, face: Face) {
    for (let y = face.y; y < face.y + face.height; y += 1) {
      for (let x = face.x; x < face.x + face.width; x += 1) {
        const offset = (y * 64 + x) * 4;
        this.pixels.set(source.subarray(offset, offset + 4), offset);
      }
    }
  }
}

function sanitizePalette(input?: Partial<MinecraftSkinPalette>): MinecraftSkinPalette {
  return Object.fromEntries(
    Object.entries(DEFAULT_PALETTE).map(([key, fallback]) => [
      key,
      normalizeHex(input?.[key as keyof MinecraftSkinPalette], fallback),
    ])
  ) as unknown as MinecraftSkinPalette;
}

export function createFallbackSkinDesign(prompt: string, seed = hashSeed(prompt)): MinecraftSkinDesign {
  const theme = THEME_PALETTES.find((entry) => entry.match.test(prompt));
  const lower = prompt.toLowerCase();
  const hairStyle: MinecraftSkinDesign["hairStyle"] =
    /helmet|robot|astronaut/.test(lower) ? "helmet"
      : /hood|assassin|rogue/.test(lower) ? "hood"
        : /long hair|princess|elf/.test(lower) ? "long"
          : /spiky|anime/.test(lower) ? "spiky"
            : /bald/.test(lower) ? "bald"
              : "short";

  const palettes = [
    { skin: "#e5b99f", skinShade: "#c28f73", hair: "#312a32", hairHighlight: "#59465f" },
    { skin: "#c98f68", skinShade: "#9d6248", hair: "#211a22", hairHighlight: "#49364f" },
    { skin: "#8f5f43", skinShade: "#68422f", hair: "#0e1117", hairHighlight: "#29303b" },
    { skin: "#6f4935", skinShade: "#4e3125", hair: "#171218", hairHighlight: "#3b2b3c" },
  ];
  const complexion = palettes[seed % palettes.length];
  const promptPalette = extractPromptPalette(prompt);
  const emblemMatch =
    prompt.match(/(?:emblem|logo|letters?|text)\s+(?:reading|saying|of)?\s*["']?([a-z0-9]{1,3})/i) ||
    prompt.match(/\b([A-Z0-9]{2,3})\b/);
  const pattern: MinecraftSkinDesign["pattern"] =
    /lightning|electric|thunder/.test(lower) ? "lightning"
      : /circuit|circuitry|tech lines/.test(lower) ? "circuit"
        : theme?.pattern ?? "clean";
  const faceStyle: MinecraftSkinDesign["faceStyle"] =
    /visor|goggles/.test(lower) ? "visor"
      : /mask|masked|face cover|ninja/.test(lower) ? "mask"
        : "open";
  const sleeves: MinecraftSkinDesign["sleeves"] =
    /armor|armored|gauntlet/.test(lower) ? "armored"
      : /short sleeve|t-?shirt/.test(lower) ? "short"
        : "long";
  const footwear: MinecraftSkinDesign["footwear"] =
    /armored (?:boot|feet)|metal boot/.test(lower) ? "armored"
      : /boot/.test(lower) ? "boots"
        : "shoes";
  const traitCandidates = [
    /hood/.test(lower) ? "hooded" : "",
    /glow|neon|emissive/.test(lower) ? "glowing accents" : "",
    /lightning|electric/.test(lower) ? "lightning details" : "",
    /cable|wire/.test(lower) ? "glowing cables" : "",
    /headphone|headset/.test(lower) ? "headphones" : "",
    /mask|masked/.test(lower) ? "face mask" : "",
    /visor/.test(lower) ? "visor" : "",
    /horn/.test(lower) ? "horns" : "",
    /crown/.test(lower) ? "crown" : "",
    requestsAngryEyes(prompt) ? "angry eyes" : "",
    requestedFacialHair(prompt) !== "none" ? "facial hair" : "",
    /armor/.test(lower) ? "armor plating" : "",
    emblemMatch?.[1] ? `${emblemMatch[1].toUpperCase()} emblem` : "",
  ].filter(Boolean);

  return {
    name: prompt.trim().split(/\s+/).slice(0, 5).join(" ") || "Exismic Skin",
    description: `A Minecraft-compatible character inspired by: ${prompt.trim() || "a modern adventurer"}.`,
    hairStyle,
    outfit: theme?.outfit ?? (/cyber|hacker/i.test(lower) ? "cyber" : "casual"),
    expression: /angry|villain|serious|warrior/.test(lower) ? "serious" : "friendly",
    eyeShape: requestsAngryEyes(prompt)
      ? "angry"
      : /soft eyes|friendly eyes/.test(lower)
        ? "soft"
        : "normal",
    facialHair: requestedFacialHair(prompt),
    faceStyle,
    sleeves,
    gloves: /glove|gauntlet|covered hands/.test(lower),
    footwear,
    pattern,
    emblem: emblemMatch?.[1]?.toUpperCase().slice(0, 3) || "",
    traits: traitCandidates.slice(0, 8),
    palette: sanitizePalette({ ...DEFAULT_PALETTE, ...complexion, ...theme?.palette, ...promptPalette }),
    headphones: /headphone|headset|earphone/i.test(lower),
    cables: /cable|wire|tech line|neon line|energy line/i.test(lower),
    horns: /horn|demon|oni/i.test(lower),
    crown: /crown|king|queen|royal|prince/i.test(lower),
    halo: /halo|angel|divine/i.test(lower),
  };
}

export function sanitizeSkinDesign(
  value: Partial<Omit<MinecraftSkinDesign, "palette">> & { palette?: Partial<MinecraftSkinPalette> },
  prompt: string,
  seed: number
): MinecraftSkinDesign {
  const fallback = createFallbackSkinDesign(prompt, seed);
  const hairStyles = ["short", "long", "spiky", "hood", "helmet", "bald"] as const;
  const outfits = ["casual", "armor", "royal", "cyber", "fantasy", "formal", "sport"] as const;
  const expressions = ["neutral", "friendly", "serious"] as const;
  const eyeShapes = ["normal", "angry", "soft"] as const;
  const facialHair = ["none", "stubble", "short-beard", "goatee"] as const;
  const faceStyles = ["open", "mask", "visor"] as const;
  const sleeves = ["short", "long", "armored"] as const;
  const footwear = ["shoes", "boots", "armored"] as const;
  const patterns = ["clean", "striped", "paneled", "armored", "mystic", "lightning", "circuit"] as const;
  const pick = <T extends string>(candidate: unknown, options: readonly T[], defaultValue: T) =>
    typeof candidate === "string" && options.includes(candidate as T) ? candidate as T : defaultValue;

  const lower = prompt.toLowerCase();

  return {
    name: typeof value.name === "string" ? value.name.trim().slice(0, 60) || fallback.name : fallback.name,
    description: typeof value.description === "string"
      ? value.description.trim().slice(0, 240) || fallback.description
      : fallback.description,
    hairStyle: pick(value.hairStyle, hairStyles, fallback.hairStyle),
    outfit: pick(value.outfit, outfits, fallback.outfit),
    expression: pick(value.expression, expressions, fallback.expression),
    eyeShape: pick(value.eyeShape, eyeShapes, fallback.eyeShape),
    facialHair: pick(value.facialHair, facialHair, fallback.facialHair),
    faceStyle: pick(value.faceStyle, faceStyles, fallback.faceStyle),
    sleeves: pick(value.sleeves, sleeves, fallback.sleeves),
    gloves: typeof value.gloves === "boolean" ? value.gloves : fallback.gloves,
    footwear: pick(value.footwear, footwear, fallback.footwear),
    pattern: pick(value.pattern, patterns, fallback.pattern),
    emblem: typeof value.emblem === "string"
      ? value.emblem.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 3)
      : fallback.emblem,
    traits: Array.isArray(value.traits)
      ? value.traits.filter((trait): trait is string => typeof trait === "string").map((trait) => trait.trim().slice(0, 40)).filter(Boolean).slice(0, 8)
      : fallback.traits,
    palette: sanitizePalette({ ...fallback.palette, ...(value.palette ?? {}) }),
    headphones: typeof value.headphones === "boolean" ? value.headphones : fallback.headphones || /headphone|headset/i.test(lower),
    cables: typeof value.cables === "boolean" ? value.cables : fallback.cables || /cable|wire/i.test(lower),
    horns: typeof value.horns === "boolean" ? value.horns : fallback.horns || /horn|demon|oni/i.test(lower),
    crown: typeof value.crown === "boolean" ? value.crown : fallback.crown || /crown|king|queen|royal/i.test(lower),
    halo: typeof value.halo === "boolean" ? value.halo : fallback.halo || /halo|angel/i.test(lower),
  };
}

function armFaces(model: MinecraftArmModel, side: "right" | "left", overlay = false): ArmFaces {
  const slim = model === "slim";
  const width = slim ? 3 : 4;

  if (side === "right") {
    const y = overlay ? 32 : 16;
    const bodyY = overlay ? 36 : 20;
    return {
      top: { x: 44, y, width, height: 4 },
      bottom: { x: 44 + width, y, width, height: 4 },
      right: { x: 40, y: bodyY, width: 4, height: 12 },
      front: { x: 44, y: bodyY, width, height: 12 },
      left: { x: 44 + width, y: bodyY, width: 4, height: 12 },
      back: { x: 48 + width, y: bodyY, width: 4, height: 12 },
    };
  }

  const y = 48;
  const bodyY = 52;
  const start = overlay ? 48 : 32;
  const topX = overlay ? 52 : 36;
  return {
    top: { x: topX, y, width, height: 4 },
    bottom: { x: topX + width, y, width, height: 4 },
    right: { x: start, y: bodyY, width: 4, height: 12 },
    front: { x: topX, y: bodyY, width: 4, height: 12 },
    left: { x: topX + width, y: bodyY, width: 4, height: 12 },
    back: { x: topX + width + 4, y: bodyY, width, height: 12 },
  };
}

const PIXEL_FONT: Record<string, readonly string[]> = {
  A: ["010", "101", "111", "101", "101"],
  B: ["110", "101", "110", "101", "110"],
  C: ["011", "100", "100", "100", "011"],
  D: ["110", "101", "101", "101", "110"],
  E: ["111", "100", "110", "100", "111"],
  F: ["111", "100", "110", "100", "100"],
  G: ["011", "100", "101", "101", "011"],
  H: ["101", "101", "111", "101", "101"],
  I: ["111", "010", "010", "010", "111"],
  J: ["001", "001", "001", "101", "010"],
  K: ["101", "101", "110", "101", "101"],
  L: ["100", "100", "100", "100", "111"],
  M: ["101", "111", "111", "101", "101"],
  N: ["101", "111", "111", "111", "101"],
  O: ["010", "101", "101", "101", "010"],
  P: ["110", "101", "110", "100", "100"],
  Q: ["010", "101", "101", "111", "011"],
  R: ["110", "101", "110", "101", "101"],
  S: ["011", "100", "010", "001", "110"],
  T: ["111", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "111"],
  V: ["101", "101", "101", "101", "010"],
  W: ["101", "101", "111", "111", "101"],
  X: ["101", "101", "010", "101", "101"],
  Y: ["101", "101", "010", "010", "010"],
  Z: ["111", "001", "010", "100", "111"],
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["110", "001", "010", "100", "111"],
  "3": ["110", "001", "010", "001", "110"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "110", "001", "110"],
  "6": ["011", "100", "111", "101", "111"],
  "7": ["111", "001", "010", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "110"],
};

function drawEmblem(canvas: SkinCanvas, text: string, color: string) {
  const characters = text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).split("");
  if (!characters.length) return;
  const y = 23;

  if (characters.length <= 2) {
    const totalWidth = characters.length * 3 + Math.max(0, characters.length - 1);
    const startX = 20 + Math.floor((8 - totalWidth) / 2);
    characters.forEach((character, index) => {
      const glyph = PIXEL_FONT[character];
      if (!glyph) return;
      glyph.forEach((row, rowIndex) => {
        row.split("").forEach((bit, columnIndex) => {
          if (bit === "1") canvas.setPixel(startX + index * 4 + columnIndex, y + rowIndex, color);
        });
      });
    });
    return;
  }

  const compactOffsets = [0, 2, 5];
  characters.forEach((character, index) => {
    const glyph = PIXEL_FONT[character];
    if (!glyph) return;
    glyph.forEach((row, rowIndex) => {
      row.split("").forEach((bit, columnIndex) => {
        if (bit === "1") canvas.setPixel(20 + compactOffsets[index] + columnIndex, y + rowIndex, color);
      });
    });
  });
}

function drawLightning(canvas: SkinCanvas, face: Face, color: string) {
  const center = face.x + Math.floor(face.width / 2);
  const points = [
    [center, face.y + 1],
    [Math.max(face.x, center - 1), face.y + 3],
    [Math.min(face.x + face.width - 1, center + 1), face.y + 5],
    [center, face.y + 7],
    [Math.max(face.x, center - 1), face.y + 9],
  ];
  points.filter(([, y]) => y < face.y + face.height).forEach(([x, y]) => canvas.setPixel(x, y, color));
}

function drawCircuit(canvas: SkinCanvas, face: Face, color: string) {
  const x = face.x + Math.floor(face.width / 2);
  canvas.line(x, face.y + 1, Math.max(2, face.height - 3), color, true);
  if (face.width >= 3) {
    canvas.line(Math.max(face.x, x - 1), face.y + 3, Math.min(3, face.width), color);
    canvas.setPixel(Math.min(face.x + face.width - 1, x + 1), face.y + Math.min(face.height - 1, 7), color);
  }
}

function paintHead(
  canvas: SkinCanvas,
  design: MinecraftSkinDesign,
  style: MinecraftSkinStyle = "balanced",
  prompt = "",
  random: () => number = () => 0.5
) {
  const palette = design.palette;
  const lower = (prompt + " " + (design.description || "") + " " + (design.traits || []).join(" ")).toLowerCase();

  const skinRamp = getHueShiftRamp(palette.skin, "skin");
  const hairRamp = getHueShiftRamp(palette.hair, "hair");
  const eyesRamp = getHueShiftRamp(palette.eyes, "neon");
  const topRamp = getHueShiftRamp(palette.top, "fabric");
  const accentRamp = getHueShiftRamp(palette.topAccent, "neon");

  const isDarkChar = /demon|shadow|monster|obsidian|fiend|reaper|robot|android|cyber/i.test(lower) &&
    (palette.skin.toLowerCase() === palette.top.toLowerCase() || palette.skin.toLowerCase() === "#181216" || palette.skin.toLowerCase() === "#0b0b10");

  const baseFaces: Record<string, Face> = {
    top: { x: 8, y: 0, width: 8, height: 8 },
    bottom: { x: 16, y: 0, width: 8, height: 8 },
    right: { x: 0, y: 8, width: 8, height: 8 },
    front: { x: 8, y: 8, width: 8, height: 8 },
    left: { x: 16, y: 8, width: 8, height: 8 },
    back: { x: 24, y: 8, width: 8, height: 8 },
  };

  // 1. Base Head Skin & Neck
  Object.values(baseFaces).forEach((face) => canvas.fill(face, palette.skin, "balanced", random));
  canvas.fill(baseFaces.bottom, skinRamp.shadow, "balanced", random);

  // 2. Base Hair Layer (Full back, sides, and top with strand texture)
  canvas.fill(baseFaces.top, hairRamp.base, "pixel-detailed", random);
  canvas.fill({ x: 24, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // back of head
  canvas.fill({ x: 0, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // right side hair
  canvas.fill({ x: 16, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // left side hair

  // Base forehead hairline (rows 8 & 9 covered by hair base)
  canvas.fill({ x: 8, y: 8, width: 8, height: 2 }, hairRamp.base, "pixel-detailed", random);

  const eyeY = 11;
  const hasVisor = /visor|goggles/i.test(lower) || design.faceStyle === "visor";
  const hasMask = /mask|face cover|ninja|facemask/i.test(lower) || design.faceStyle === "mask";

  if (hasVisor) {
    // Futuristic glowing visor
    canvas.fill({ x: 8, y: 10, width: 8, height: 3 }, eyesRamp.deepShadow, "minimal", random);
    canvas.line(9, 11, 6, eyesRamp.highlight);
    canvas.setPixel(10, 10, "#ffffff");
    canvas.setPixel(11, 11, "#ffffff");
  } else if (isDarkChar) {
    // Glowing Demon / Robot Eyes
    canvas.setPixel(9, eyeY, eyesRamp.highlight);
    canvas.setPixel(10, eyeY, eyesRamp.base);
    canvas.setPixel(13, eyeY, eyesRamp.base);
    canvas.setPixel(14, eyeY, eyesRamp.highlight);
    canvas.setPixel(10, eyeY + 1, accentRamp.highlight);
    canvas.setPixel(13, eyeY + 1, accentRamp.highlight);
  } else {
    // MASTER AESTHETIC ANIME EYES (Pro 2x3 Deep Shading)
    const lashColor = isDarkChar ? "#000000" : hairRamp.deepShadow;
    const pupilColor = eyesRamp.deepShadow || "#18181b";
    const irisMid = eyesRamp.base;
    const irisGlow = eyesRamp.highlight;

    // Left Eye (x: 9, 10, y: 10..12)
    canvas.setPixel(9, 10, lashColor); // Upper Lash Left
    canvas.setPixel(10, 10, lashColor); // Upper Lash Right
    canvas.setPixel(9, 11, pupilColor); // Dark Iris
    canvas.setPixel(10, 11, pupilColor); // Dark Iris
    canvas.setPixel(9, 12, "#ffffff"); // Specular Sparkle
    canvas.setPixel(10, 12, irisGlow); // Glowing Iris Bottom
    canvas.setPixel(10, 13, lashColor); // Lower Lash Outline

    // Right Eye (x: 13, 14, y: 10..12)
    canvas.setPixel(13, 10, lashColor); // Upper Lash Left
    canvas.setPixel(14, 10, lashColor); // Upper Lash Right
    canvas.setPixel(13, 11, pupilColor); // Dark Iris
    canvas.setPixel(14, 11, pupilColor); // Dark Iris
    canvas.setPixel(14, 12, "#ffffff"); // Specular Sparkle
    canvas.setPixel(13, 12, irisGlow); // Glowing Iris Bottom
    canvas.setPixel(13, 13, lashColor); // Lower Lash Outline
  }

  // 3D Tactical Face Mask
  if (hasMask) {
    canvas.fill({ x: 8, y: 12, width: 8, height: 4 }, topRamp.base, "minimal", random);
    canvas.line(9, 12, 6, topRamp.shadow);
  }

  // 4. MASTER 3D OUTER HAIR, STRANDS & CURTAIN BANGS LAYER (x: 32..63, y: 0..15)
  const hasHeadphones = /headphone|headset|earphone/i.test(lower) || design.headphones;
  const hasHorns = /horn|demon|oni/i.test(lower) || design.horns;
  const hasCrown = /crown|king|queen|royal|prince/i.test(lower) || design.crown;
  const hasHalo = /halo|angel|divine/i.test(lower) || design.halo;
  const hasHood = /hood|hoodie|assassin|rogue/i.test(lower) || design.hairStyle === "hood";

  if (hasHood) {
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.line(40, 8, 8, topRamp.light);
  } else if (design.hairStyle !== "bald") {
    // Top 3D Hair with Strand Shading
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random);
    canvas.line(41, 2, 6, hairRamp.light);

    // Back & Sides 3D Hair with Strand Texture
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random);

    // Front Aesthetic Curtain Bangs (x: 40..47, y: 8..15)
    canvas.fill({ x: 40, y: 8, width: 8, height: 2 }, hairRamp.base, "pixel-detailed", random);

    // Bangs Strands hanging over forehead
    canvas.setPixel(40, 10, hairRamp.base);
    canvas.setPixel(41, 10, hairRamp.light);
    canvas.setPixel(42, 10, hairRamp.shadow);
    canvas.setPixel(45, 10, hairRamp.shadow);
    canvas.setPixel(46, 10, hairRamp.light);
    canvas.setPixel(47, 10, hairRamp.base);

    // Center Part V-Split Strand
    canvas.setPixel(43, 9, hairRamp.shadow);
    canvas.setPixel(44, 9, hairRamp.shadow);

    // Lush Framing Side Locks hanging past cheeks
    canvas.line(40, 10, 6, hairRamp.base, true);
    canvas.line(47, 10, 6, hairRamp.base, true);
    canvas.setPixel(40, 11, hairRamp.light);
    canvas.setPixel(47, 11, hairRamp.light);
    canvas.setPixel(40, 14, hairRamp.shadow);
    canvas.setPixel(47, 14, hairRamp.shadow);

    // Side Overlay Lock Extensions (Draping over ears)
    canvas.line(39, 10, 5, hairRamp.base, true);
    canvas.line(48, 10, 5, hairRamp.base, true);
  }

  // 3D Eyeglasses & Spectacles Engine
  const hasGlasses = /glass|eyeglass|spectacle|monocle|shades|sunglasses/i.test(lower) || design.glasses;
  if (hasGlasses) {
    const isGold = /gold|golden|brass|wire/i.test(lower);
    const isSunglasses = /shades|sunglasses|tinted/i.test(lower);
    const frameColor = isGold ? "#d4af37" : isSunglasses ? "#18181b" : "#27272a";
    const lensColor = isSunglasses ? "#18181b" : "#f0f9ff";

    // Left eye frame on 3D overlay (x: 40..47, y: 8..15)
    canvas.setPixel(41, 10, frameColor);
    canvas.setPixel(42, 10, frameColor);
    canvas.setPixel(41, 11, frameColor);
    canvas.setPixel(42, 11, lensColor);

    // Right eye frame on 3D overlay
    canvas.setPixel(45, 10, frameColor);
    canvas.setPixel(46, 10, frameColor);
    canvas.setPixel(45, 11, lensColor);
    canvas.setPixel(46, 11, frameColor);

    // Bridge across nose
    canvas.setPixel(43, 10, frameColor);
    canvas.setPixel(44, 10, frameColor);

    // Frame temples extending along side overlays
    canvas.line(35, 10, 5, frameColor);
    canvas.line(48, 10, 5, frameColor);
  }

  // 3D Headphones with LED Ring
  if (hasHeadphones) {
    const bandColor = "#18181b";
    canvas.fill({ x: 40, y: 0, width: 8, height: 2 }, bandColor, "minimal", random);
    canvas.line(41, 0, 6, accentRamp.highlight);
    canvas.line(35, 8, 3, bandColor, true);
    canvas.line(52, 8, 3, bandColor, true);
    canvas.fill({ x: 33, y: 10, width: 4, height: 4 }, bandColor, "minimal", random);
    canvas.fill({ x: 34, y: 11, width: 2, height: 2 }, accentRamp.highlight, "minimal", random);
    canvas.fill({ x: 49, y: 10, width: 4, height: 4 }, bandColor, "minimal", random);
    canvas.fill({ x: 50, y: 11, width: 2, height: 2 }, accentRamp.highlight, "minimal", random);
  }

  // 3D Horns
  if (hasHorns) {
    canvas.setPixel(41, 0, accentRamp.highlight);
    canvas.setPixel(41, 1, accentRamp.base);
    canvas.setPixel(46, 0, accentRamp.highlight);
    canvas.setPixel(46, 1, accentRamp.base);
    canvas.setPixel(41, 8, accentRamp.shadow);
    canvas.setPixel(46, 8, accentRamp.shadow);
  }

  // 3D Royal Crown
  if (hasCrown) {
    canvas.line(40, 7, 8, "#facc15");
    canvas.setPixel(41, 6, "#facc15");
    canvas.setPixel(43, 6, "#facc15");
    canvas.setPixel(45, 6, "#facc15");
    canvas.setPixel(47, 6, "#facc15");
    canvas.setPixel(43, 7, "#ef4444");
    canvas.setPixel(45, 7, "#06b6d4");
  }

  // 3D Halo
  if (hasHalo) {
    canvas.line(41, 1, 6, "#fde047");
    canvas.line(41, 6, 6, "#fde047");
    canvas.line(41, 2, 4, "#fde047", true);
    canvas.line(46, 2, 4, "#fde047", true);
  }
}

function paintTorso(
  canvas: SkinCanvas,
  design: MinecraftSkinDesign,
  style: MinecraftSkinStyle = "balanced",
  prompt = "",
  random: () => number = () => 0.5
) {
  const palette = design.palette;
  const lower = (prompt + " " + (design.description || "") + " " + (design.traits || []).join(" ")).toLowerCase();

  const topRamp = getHueShiftRamp(palette.top, "fabric");
  const accentRamp = getHueShiftRamp(palette.topAccent, "neon");
  const pantsRamp = getHueShiftRamp(palette.pants, "fabric");
  const skinRamp = getHueShiftRamp(palette.skin, "skin");

  const faces = {
    top: { x: 20, y: 16, width: 8, height: 4 },
    bottom: { x: 28, y: 16, width: 8, height: 4 },
    right: { x: 16, y: 20, width: 4, height: 12 },
    front: { x: 20, y: 20, width: 8, height: 12 },
    left: { x: 28, y: 20, width: 4, height: 12 },
    back: { x: 32, y: 20, width: 8, height: 12 },
  };

  const isFormal = /gentleman|suit|tuxedo|formal|victorian|waistcoat|vest|tie|cravat|blazer|trench coat|aristocrat/i.test(lower) || design.outfit === "formal";
  const isArmor = /armor|knight|warrior|paladin|plate|chestplate|chainmail/i.test(lower) || design.outfit === "armor";
  const isCyber = /cyber|hacker|futuristic|tech|robot|neon/i.test(lower) || design.outfit === "cyber";
  const isAesthetic = /aesthetic|anime|goth|e-girl|e-boy|sweater|oversized|monochrome|cute/i.test(lower);

  // Base Torso Fill with fabric texture
  Object.values(faces).forEach((face) => canvas.fill(face, palette.top, "pixel-detailed", random));

  const ovFront = { x: 20, y: 36, width: 8, height: 12 };
  const ovBack = { x: 32, y: 36, width: 8, height: 12 };
  const ovRight = { x: 16, y: 36, width: 4, height: 12 };
  const ovLeft = { x: 28, y: 36, width: 4, height: 12 };

  if (isFormal) {
    // FORMAL / VICTORIAN GENTLEMAN
    canvas.fill({ x: 22, y: 20, width: 4, height: 4 }, "#ffffff", "minimal", random);
    const tieColor = /cravat|tie|crimson|burgundy|red/i.test(lower) ? (palette.topAccent || "#881337") : (palette.topAccent || "#1e293b");
    const tieRamp = getHueShiftRamp(tieColor, "fabric");
    canvas.setPixel(23, 21, tieRamp.light);
    canvas.setPixel(24, 21, tieRamp.base);
    canvas.setPixel(23, 22, tieRamp.highlight);
    canvas.setPixel(24, 22, tieRamp.base);

    // 3D Suit Coat
    canvas.fill(ovRight, topRamp.base, "minimal", random);
    canvas.fill(ovLeft, topRamp.base, "minimal", random);
    canvas.fill(ovBack, topRamp.base, "minimal", random);
    canvas.fill({ x: 20, y: 36, width: 2, height: 12 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 26, y: 36, width: 2, height: 12 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 20, y: 44, width: 8, height: 4 }, topRamp.base, "minimal", random);
    canvas.line(21, 36, 6, topRamp.light, true);
    canvas.line(26, 36, 6, topRamp.light, true);
    canvas.setPixel(22, 42, "#eab308");
    canvas.setPixel(25, 42, "#eab308");
  } else if (isAesthetic) {
    // AESTHETIC OVERSIZED SWEATER (Clean, knit-textured, high-contrast)
    // Minimal Crewneck Collar
    canvas.setPixel(23, 20, "#ffffff");
    canvas.setPixel(24, 20, "#ffffff");

    // White Undershirt Hem at bottom of sweater
    canvas.line(20, 31, 8, "#ffffff");

    // 3D Sweater Overlay with Knit Texture
    canvas.fill(ovRight, topRamp.base, "pixel-detailed", random);
    canvas.fill(ovLeft, topRamp.base, "pixel-detailed", random);
    canvas.fill(ovBack, topRamp.base, "pixel-detailed", random);
    canvas.fill(ovFront, topRamp.base, "pixel-detailed", random);

    // Subtle Knit Chest Shadow / Fold
    canvas.line(21, 41, 6, topRamp.shadow);
    canvas.line(22, 42, 4, topRamp.deepShadow);

    // White hem on 3D overlay bottom
    canvas.line(20, 47, 8, "#ffffff");
  } else {
    // Casual / Streetwear / Cyber
    canvas.fill({ x: 23, y: 20, width: 2, height: 3 }, skinRamp.base, "minimal", random);
    canvas.fill(ovRight, topRamp.base, "minimal", random);
    canvas.fill(ovLeft, topRamp.base, "minimal", random);
    canvas.fill(ovBack, topRamp.base, "minimal", random);
    canvas.fill({ x: 20, y: 36, width: 3, height: 12 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 25, y: 36, width: 3, height: 12 }, topRamp.base, "minimal", random);
  }

  // Emblem
  if (design.emblem) {
    drawEmblem(canvas, design.emblem, design.palette.detail);
  }
}

function paintArm(
  canvas: SkinCanvas,
  faces: ArmFaces,
  palette: MinecraftSkinPalette,
  random: () => number,
  design: MinecraftSkinDesign,
  style: MinecraftSkinStyle = "balanced",
  prompt = "",
  side: "right" | "left" = "right",
  model: MinecraftArmModel = "classic"
) {
  const lower = (prompt + " " + (design.description || "") + " " + (design.traits || []).join(" ")).toLowerCase();
  const faceList = Object.values(faces);
  const bodyFaces = [faces.right, faces.front, faces.left, faces.back];

  const topRamp = getHueShiftRamp(palette.top, "fabric");
  const accentRamp = getHueShiftRamp(palette.topAccent, "neon");
  const skinRamp = getHueShiftRamp(palette.skin, "skin");

  const isFormal = /gentleman|suit|tuxedo|formal|victorian/i.test(lower) || design.outfit === "formal";
  const isAesthetic = /aesthetic|anime|goth|e-girl|e-boy|sweater|oversized|monochrome|cute/i.test(lower);

  // Base Arm Fill
  faceList.forEach((face) => canvas.fill(face, palette.top, "minimal", random));

  const sleeveRows = isAesthetic ? 11 : design.sleeves === "short" ? 4 : design.sleeves === "long" ? 9 : 11;
  bodyFaces.forEach((face) => {
    if (sleeveRows < 12) {
      const skinStart = face.y + sleeveRows;
      canvas.fill({ x: face.x, y: skinStart, width: face.width, height: 12 - sleeveRows }, palette.skin, "minimal", random);
    }
  });

  // White Dress Shirt / Oversized Sweater Cuff at hand
  bodyFaces.forEach((face) => {
    canvas.line(face.x, face.y + 11, face.width, "#ffffff");
  });

  // 3D Sleeve Overlays
  const ovFaces = armFaces(model, side, true);
  [ovFaces.right, ovFaces.front, ovFaces.left, ovFaces.back].forEach((face) => {
    canvas.fill({ x: face.x, y: face.y, width: face.width, height: sleeveRows }, topRamp.base, "minimal", random);
    canvas.line(face.x, face.y + sleeveRows - 1, face.width, topRamp.light);
  });

  const hasCables = /cable|wire|tech line|cyber|circuit|neon/i.test(lower) || design.cables;
  if (hasCables) {
    canvas.line(ovFaces.front.x + 1, ovFaces.front.y + 1, 8, accentRamp.highlight, true);
    if (ovFaces.front.width >= 4) {
      canvas.setPixel(ovFaces.front.x + 2, ovFaces.front.y + 8, accentRamp.highlight);
    }
  }
}

function paintLeg(
  canvas: SkinCanvas,
  side: "right" | "left",
  design: MinecraftSkinDesign,
  style: MinecraftSkinStyle = "balanced",
  prompt = "",
  random: () => number = () => 0.5
) {
  const palette = design.palette;
  const lower = (prompt + " " + (design.description || "") + " " + (design.traits || []).join(" ")).toLowerCase();
  const isRight = side === "right";

  const pantsRamp = getHueShiftRamp(palette.pants, "fabric");
  const shoesRamp = getHueShiftRamp(palette.shoes, "fabric");
  const accentRamp = getHueShiftRamp(palette.topAccent, "neon");
  const isAesthetic = /aesthetic|anime|goth|e-girl|e-boy|sweater|stocking|socks|skirt|cute/i.test(lower);

  const faces = isRight
    ? {
        top: { x: 4, y: 16, width: 4, height: 4 },
        bottom: { x: 8, y: 16, width: 4, height: 4 },
        right: { x: 0, y: 20, width: 4, height: 12 },
        front: { x: 4, y: 20, width: 4, height: 12 },
        left: { x: 8, y: 20, width: 4, height: 12 },
        back: { x: 12, y: 20, width: 4, height: 12 },
      }
    : {
        top: { x: 20, y: 48, width: 4, height: 4 },
        bottom: { x: 24, y: 48, width: 4, height: 4 },
        right: { x: 16, y: 52, width: 4, height: 12 },
        front: { x: 20, y: 52, width: 4, height: 12 },
        left: { x: 24, y: 52, width: 4, height: 12 },
        back: { x: 28, y: 52, width: 4, height: 12 },
      };

  if (isAesthetic) {
    // AESTHETIC / E-GIRL / ANIME LEGS: Shorts/Hem -> Bare Skin Gap -> Thigh-High Stockings
    // 1. Top Hem / White Undershirt Overhang (Rows 0..2)
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      canvas.fill({ x: face.x, y: face.y, width: face.width, height: 2 }, "#ffffff", "minimal", random);
      // 2. Bare Skin Gap (Rows 2..4)
      canvas.fill({ x: face.x, y: face.y + 2, width: face.width, height: 3 }, palette.skin, "minimal", random);
      // 3. Dark Thigh-High Stockings / Boots (Rows 5..12)
      canvas.fill({ x: face.x, y: face.y + 5, width: face.width, height: 7 }, palette.pants, "minimal", random);
      canvas.line(face.x, face.y + 5, face.width, pantsRamp.deepShadow);
    });
  } else {
    // Base Pants Fill
    Object.values(faces).forEach((face) => canvas.fill(face, palette.pants, style, random));

    // Knee Crease Shading
    canvas.line(faces.front.x, faces.front.y + 5, 4, pantsRamp.shadow);
    canvas.line(faces.front.x + 1, faces.front.y + 6, 2, pantsRamp.light);

    // Footwear
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      canvas.fill({ x: face.x, y: face.y + 8, width: face.width, height: 4 }, palette.shoes, style, random);
      const isSneaker = /sneaker|shoe|trainer|runner|sport/i.test(lower);
      const soleColor = isSneaker ? "#ffffff" : shoesRamp.deepShadow;
      canvas.line(face.x, face.y + 11, face.width, soleColor);
    });
  }

  // Shoe Bottom Tread
  canvas.fill(faces.bottom, shoesRamp.deepShadow, "minimal", random);

  // 3D Pants / Shoe Overlays (x: 0..15 on right leg, x: 0..15 on left leg)
  const ovFront = isRight ? { x: 4, y: 36, width: 4, height: 12 } : { x: 4, y: 52, width: 4, height: 12 };

  if (isAesthetic) {
    // 3D Skirt / Sweater Hem Overhang
    canvas.fill({ x: ovFront.x, y: ovFront.y, width: 4, height: 3 }, palette.top, "minimal", random);
    canvas.line(ovFront.x, ovFront.y + 2, 4, "#ffffff");
  } else {
    canvas.fill({ x: ovFront.x, y: ovFront.y + 8, width: 4, height: 4 }, shoesRamp.base, style, random);
    canvas.line(ovFront.x, ovFront.y + 8, 4, shoesRamp.light);
  }

  // Cyber / Armor Accents
  if (/cyber|armor|robot|tech/i.test(lower)) {
    canvas.setPixel(ovFront.x + 1, ovFront.y + 4, accentRamp.highlight);
    canvas.setPixel(ovFront.x + 2, ovFront.y + 4, accentRamp.highlight);
  }
}

function detectReferenceEyeRow(canvas: SkinCanvas) {
  let bestRow = 11;
  let bestScore = -1;
  for (let y = 10; y <= 14; y += 1) {
    let score = 0;
    for (let x = 8; x < 16; x += 1) {
      const [red, green, blue, alpha] = canvas.getPixel(x, y);
      const purpleOrBlue = blue > 75 && blue > green * 1.25 && blue >= red * 0.85;
      const cyan = green > 105 && blue > 105 && red < 170;
      const white = red > 205 && green > 205 && blue > 205;
      if (alpha > 0 && (purpleOrBlue || cyan || white)) score += white ? 1 : 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestRow = y;
    }
  }
  return bestScore > 0 ? bestRow : 11;
}

function isLikelySkinColor(red: number, green: number, blue: number) {
  return red > 75 && red > green * 1.08 && green > blue * 1.08 && red - blue > 28;
}

function recolorFaces(canvas: SkinCanvas, faces: Face[], target: string, preserveSkin = false) {
  const counts = new Map<string, { count: number; color: Rgba }>();
  for (const face of faces) {
    for (let y = face.y; y < face.y + face.height; y += 1) {
      for (let x = face.x; x < face.x + face.width; x += 1) {
        const color = canvas.getPixel(x, y);
        const [red, green, blue, alpha] = color;
        if (alpha === 0 || (preserveSkin && isLikelySkinColor(red, green, blue))) continue;
        const key = `${red},${green},${blue}`;
        const current = counts.get(key);
        counts.set(key, { count: (current?.count || 0) + 1, color });
      }
    }
  }
  const dominant = [...counts.values()].sort((left, right) => right.count - left.count)[0]?.color;
  if (!dominant) return;

  for (const face of faces) {
    for (let y = face.y; y < face.y + face.height; y += 1) {
      for (let x = face.x; x < face.x + face.width; x += 1) {
        const [red, green, blue, alpha] = canvas.getPixel(x, y);
        if (alpha === 0 || (preserveSkin && isLikelySkinColor(red, green, blue))) continue;
        const distance = Math.sqrt(
          (red - dominant[0]) ** 2 +
          (green - dominant[1]) ** 2 +
          (blue - dominant[2]) ** 2
        );
        const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
        if (distance > 92 && luminance > 0.16) continue;
        const amount = Math.max(-0.2, Math.min(0.2, (luminance - 0.38) * 0.34));
        canvas.setPixel(x, y, shade(target, amount), alpha);
      }
    }
  }
}

export function applyPromptEditsToMinecraftSkin(
  base: Uint8Array,
  design: MinecraftSkinDesign,
  prompt: string,
  part: MinecraftSkinPart,
  model: MinecraftArmModel
) {
  if (base.length !== 64 * 64 * 4) throw new Error("Reference skin must be a 64x64 RGBA texture.");
  const canvas = new SkinCanvas();
  canvas.pixels.set(base);
  const lower = prompt.toLowerCase();
  const editHead = part === "all" || part === "head";
  const editTorso = part === "all" || part === "torso";
  const editArms = part === "all" || part === "arms";
  const editLegs = part === "all" || part === "legs";
  const topColor = colorNearContext(prompt, ["hoodie", "jacket", "shirt", "top", "robe", "armor", "coat"]);
  const pantsColor = colorNearContext(prompt, ["pants", "trousers", "jeans", "leggings"]);
  const footwearColor = colorNearContext(prompt, ["shoes", "boots", "sneakers", "footwear"]);
  const hairColor = colorNearContext(prompt, ["hair"]);

  if (editHead && hairColor) {
    recolorFaces(canvas, [
      { x: 8, y: 0, width: 8, height: 8 },
      { x: 24, y: 8, width: 8, height: 8 },
      { x: 8, y: 8, width: 8, height: 4 },
      { x: 0, y: 8, width: 8, height: 4 },
      { x: 16, y: 8, width: 8, height: 4 },
    ], hairColor, true);
  }

  if ((editTorso || editArms) && topColor) {
    if (editTorso) {
      recolorFaces(canvas, [
        { x: 20, y: 16, width: 8, height: 4 }, { x: 28, y: 16, width: 8, height: 4 },
        { x: 16, y: 20, width: 4, height: 12 }, { x: 20, y: 20, width: 8, height: 12 },
        { x: 28, y: 20, width: 4, height: 12 }, { x: 32, y: 20, width: 8, height: 12 },
        { x: 20, y: 32, width: 8, height: 4 }, { x: 28, y: 32, width: 8, height: 4 },
        { x: 16, y: 36, width: 4, height: 12 }, { x: 20, y: 36, width: 8, height: 12 },
        { x: 28, y: 36, width: 4, height: 12 }, { x: 32, y: 36, width: 8, height: 12 },
      ], topColor, true);
    }
    if (editArms) {
      for (const side of ["right", "left"] as const) {
        recolorFaces(canvas, Object.values(armFaces(model, side)), topColor, true);
        recolorFaces(canvas, Object.values(armFaces(model, side, true)), topColor, true);
      }
    }
  }

  if (editLegs && pantsColor) {
    recolorFaces(canvas, [
      { x: 4, y: 16, width: 4, height: 4 }, { x: 8, y: 16, width: 4, height: 4 },
      { x: 0, y: 20, width: 16, height: 12 }, { x: 20, y: 48, width: 4, height: 4 },
      { x: 24, y: 48, width: 4, height: 4 }, { x: 16, y: 52, width: 16, height: 12 },
      { x: 0, y: 32, width: 16, height: 16 }, { x: 0, y: 48, width: 16, height: 16 },
    ], pantsColor);
  }

  if (editLegs && footwearColor) {
    recolorFaces(canvas, [
      { x: 0, y: 28, width: 16, height: 4 },
      { x: 16, y: 60, width: 16, height: 4 },
      { x: 0, y: 44, width: 16, height: 4 },
      { x: 0, y: 60, width: 16, height: 4 },
    ], footwearColor);
  }

  if (editHead && requestsAngryEyes(prompt)) {
    const brow = canvas.getPixel(12, 8);
    const eyeY = detectReferenceEyeRow(canvas);
    const browY = Math.max(9, eyeY - 1);
    canvas.setPixel(9, Math.max(9, browY - 1), brow);
    canvas.setPixel(10, browY, brow);
    canvas.setPixel(13, browY, brow);
    canvas.setPixel(14, Math.max(9, browY - 1), brow);
    const requestedEyeColor = colorNearContext(prompt, ["eyes", "eye"]);
    if (requestedEyeColor) {
      canvas.setPixel(10, eyeY, requestedEyeColor);
      canvas.setPixel(11, eyeY, shade(requestedEyeColor, -0.12));
      canvas.setPixel(13, eyeY, shade(requestedEyeColor, -0.12));
      canvas.setPixel(14, eyeY, requestedEyeColor);
    }
  }

  if (editHead && requestedFacialHair(prompt) !== "none") {
    const beard = canvas.getPixel(12, 8);
    const eyeY = detectReferenceEyeRow(canvas);
    const cheekY = Math.min(14, eyeY + 1);
    const jawY = Math.min(15, eyeY + 2);
    if (/stubble/.test(lower)) {
      [[9, cheekY], [11, jawY], [13, jawY], [15, cheekY]].forEach(([x, y]) => canvas.setPixel(x, y, beard));
    } else if (/goatee/.test(lower)) {
      canvas.setPixel(11, cheekY, beard);
      canvas.setPixel(12, cheekY, beard);
      canvas.setPixel(12, jawY, beard);
      canvas.setPixel(13, jawY, beard);
    } else {
      canvas.setPixel(9, cheekY, beard);
      canvas.setPixel(14, cheekY, beard);
      canvas.setPixel(10, cheekY, beard);
      canvas.setPixel(13, cheekY, beard);
      canvas.setPixel(11, jawY, beard);
      canvas.setPixel(12, jawY, beard);
      canvas.setPixel(13, jawY, beard);
    }
  }

  if (editHead && /\b(add|wear|with|make)\b[^,.]{0,24}\b(mask|face covering)\b/.test(lower)) {
    const mask = shade(design.palette.top, -0.1);
    canvas.fill({ x: 8, y: 12, width: 8, height: 4 }, mask);
    canvas.line(9, 12, 6, design.palette.topAccent);
  }

  if (editHead && /\b(add|wear|with|make)\b[^,.]{0,24}\bvisor\b/.test(lower)) {
    canvas.fill({ x: 9, y: 10, width: 6, height: 2 }, shade(design.palette.eyes, -0.18));
    canvas.line(10, 10, 4, design.palette.eyes);
  }

  if (editTorso && /\b(add|change|replace|make)\b[^,.]{0,24}\b(emblem|logo|letters?|text)\b/.test(lower) && design.emblem) {
    drawEmblem(canvas, design.emblem, design.palette.detail);
  }

  if (editTorso && /lightning|electric|thunder/.test(lower)) {
    drawLightning(canvas, { x: 20, y: 20, width: 8, height: 12 }, design.palette.topAccent);
  } else if (editTorso && /circuit|circuitry|tech lines/.test(lower)) {
    drawCircuit(canvas, { x: 20, y: 20, width: 8, height: 12 }, design.palette.topAccent);
  }

  if (editArms && /glove|gauntlet|covered hands/.test(lower)) {
    for (const side of ["right", "left"] as const) {
      const faces = armFaces(model, side);
      for (const face of [faces.right, faces.front, faces.left, faces.back]) {
        canvas.fill({ x: face.x, y: face.y + 9, width: face.width, height: 3 }, design.palette.shoes);
        canvas.line(face.x, face.y + 9, face.width, design.palette.topAccent);
      }
    }
  }

  if ((editArms || editLegs) && /lightning|electric|thunder/.test(lower)) {
    if (editArms) {
      drawLightning(canvas, armFaces(model, "right").front, design.palette.topAccent);
      drawLightning(canvas, armFaces(model, "left").front, design.palette.topAccent);
    }
    if (editLegs) {
      drawLightning(canvas, { x: 4, y: 20, width: 4, height: 12 }, design.palette.topAccent);
      drawLightning(canvas, { x: 20, y: 52, width: 4, height: 12 }, design.palette.topAccent);
    }
  }

  return canvas.pixels;
}

export function compileMinecraftSkin(
  design: MinecraftSkinDesign,
  seed: number,
  model: MinecraftArmModel,
  style: MinecraftSkinStyle = "balanced",
  prompt = ""
) {
  const canvas = new SkinCanvas();
  const random = createRandom(seed);

  paintHead(canvas, design, style, prompt, random);
  paintTorso(canvas, design, style, prompt, random);
  paintArm(canvas, armFaces(model, "right"), design.palette, random, design, style, prompt, "right", model);
  paintArm(canvas, armFaces(model, "left"), design.palette, random, design, style, prompt, "left", model);
  paintLeg(canvas, "right", design, style, prompt, random);
  paintLeg(canvas, "left", design, style, prompt, random);

  return canvas.pixels;
}

const PART_RECTS: Record<Exclude<MinecraftSkinPart, "all">, Face[]> = {
  head: [{ x: 0, y: 0, width: 64, height: 16 }],
  torso: [
    { x: 16, y: 16, width: 24, height: 16 },
    { x: 16, y: 32, width: 32, height: 16 },
  ],
  arms: [
    { x: 40, y: 16, width: 16, height: 32 },
    { x: 32, y: 48, width: 32, height: 16 },
  ],
  legs: [
    { x: 0, y: 16, width: 16, height: 32 },
    { x: 0, y: 48, width: 32, height: 16 },
  ],
};

export function mergeMinecraftSkinPart(base: Uint8Array, generated: Uint8Array, part: MinecraftSkinPart) {
  if (part === "all") return generated;
  if (base.length !== 64 * 64 * 4 || generated.length !== 64 * 64 * 4) {
    throw new Error("Skin buffers must be 64x64 RGBA.");
  }
  const output = new SkinCanvas();
  output.pixels.set(base);
  PART_RECTS[part].forEach((face) => output.copyRectFrom(generated, face));
  return output.pixels;
}

export function getMinecraftSkinSeed(prompt: string, requestedSeed?: number) {
  if (Number.isInteger(requestedSeed) && requestedSeed! >= 0) return requestedSeed! >>> 0;
  return hashSeed(`${prompt}:${Date.now()}:${Math.random()}`);
}
