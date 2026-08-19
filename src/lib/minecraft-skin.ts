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
  eyeStyle?: "anime" | "classic" | "glowing" | "minimal" | "visor";
  mouthStyle?: "smile" | "neutral" | "smirk" | "open" | "none";
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
    match: /military|soldier|airforce|pilot|army|camo|tactical|swat|commando|navy|seal|combat|operator|sniper|veteran|flight|top gun|usaf/i,
    outfit: "armor",
    pattern: "armored",
    palette: {
      skin: "#c98f68",
      skinShade: "#9d6248",
      top: "#2d382c",
      topAccent: "#1b241a",
      pants: "#232d22",
      shoes: "#15171b",
      hair: "#1c1815",
      hairHighlight: "#362f2a",
      eyes: "#38bdf8",
      detail: "#d4af37",
    },
  },
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
    match: /cyber|neon|future|tech|robot|android|mecha|cyborg/i,
    outfit: "cyber",
    pattern: "paneled",
    palette: { top: "#0f172a", topAccent: "#06b6d4", pants: "#090d16", shoes: "#06b6d4", detail: "#d946ef", eyes: "#22d3ee" },
  },
  {
    match: /ninja|shinobi|assassin|rogue|stealth|shadow/i,
    outfit: "armor",
    pattern: "paneled",
    palette: { top: "#111318", topAccent: "#ef4444", pants: "#0b0c10", shoes: "#090a0d", detail: "#dc2626", skin: "#c98f68", hair: "#0d0e12", eyes: "#ef4444" },
  },
  {
    match: /knight|crusader|paladin|templar|armor|plate|warrior|samurai|viking/i,
    outfit: "armor",
    pattern: "armored",
    palette: { top: "#475569", topAccent: "#94a3b8", pants: "#334155", shoes: "#1e293b", detail: "#f59e0b", hair: "#3e2723", eyes: "#60a5fa" },
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
          // Pixel-detailed: smooth directional lighting with soft ambient micro-contrast
          const grad = (0.5 - normY) * 0.15 * gradScale;
          const noise = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) * 0.02 - 0.01;
          shadeAmount = grad + noise;
          if (x === face.x || x === face.x + face.width - 1) shadeAmount -= 0.05;
          if (y === face.y + face.height - 1) shadeAmount -= 0.08;
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
    eyeStyle: /glowing eyes?|herobrine|demon eyes?|enderman/i.test(lower)
      ? "glowing"
      : /classic eyes?|steve|alex|simple eyes?/i.test(lower)
        ? "classic"
        : /minimal eyes?|dot eyes?|indie|emo/i.test(lower)
          ? "minimal"
          : /visor|goggles/i.test(lower)
            ? "visor"
            : "anime",
    mouthStyle: /smirk|grin|cocky/i.test(lower)
      ? "smirk"
      : /open mouth|laugh|shout/i.test(lower)
        ? "open"
        : /no mouth|faceless/i.test(lower)
          ? "none"
          : /neutral mouth|serious/i.test(lower)
            ? "neutral"
            : "smile",
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
  const eyeStyles = ["anime", "classic", "glowing", "minimal", "visor"] as const;
  const mouthStyles = ["smile", "neutral", "smirk", "open", "none"] as const;
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
    eyeStyle: pick(value.eyeStyle, eyeStyles, fallback.eyeStyle || "anime"),
    mouthStyle: pick(value.mouthStyle, mouthStyles, fallback.mouthStyle || "smile"),
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

function drawCamouflage(
  canvas: SkinCanvas,
  face: Face,
  baseColor: string,
  accentColor: string
) {
  const baseRamp = getHueShiftRamp(baseColor, "fabric");
  const darkRamp = getHueShiftRamp(accentColor, "fabric");
  const colors = [baseRamp.base, baseRamp.shadow, darkRamp.base, darkRamp.deepShadow, baseRamp.light];

  for (let y = face.y; y < face.y + face.height; y += 1) {
    for (let x = face.x; x < face.x + face.width; x += 1) {
      const noise = (Math.sin(x * 1.7 + y * 2.3) + Math.cos(x * 3.1 - y * 1.9) + 2) / 4;
      const idx = Math.floor(noise * colors.length) % colors.length;
      canvas.setPixel(x, y, colors[idx]);
    }
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
  const isMilitary = /military|soldier|airforce|pilot|army|camo|tactical|swat|commando|navy|seal|combat|operator|sniper|veteran|flight|top gun|usaf/i.test(lower);
  const isKnight = /knight|crusader|paladin|templar|armor|plate|warrior|samurai|viking/i.test(lower);
  const isNinja = /ninja|shinobi|assassin|rogue|stealth|shadow/i.test(lower);
  const isCyber = /cyber|hacker|futuristic|tech|robot|mecha|android|neon/i.test(lower);

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
  // Natural neck shadow on head bottom (subtle 8% shadow, no discoloration)
  canvas.fill(baseFaces.bottom, shade(palette.skin, -0.08), "balanced", random);

  // 2. Base Hair Layer
  canvas.fill(baseFaces.top, hairRamp.base, "pixel-detailed", random);
  canvas.fill({ x: 24, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // back
  canvas.fill({ x: 0, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // right side
  canvas.fill({ x: 16, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // left side
  canvas.fill({ x: 8, y: 8, width: 8, height: 1 }, hairRamp.base, "pixel-detailed", random); // forehead hairline row 8

  const hasVisor = /visor|goggles/i.test(lower) || design.faceStyle === "visor" || design.eyeStyle === "visor";
  const hasMask = /mask|face cover|ninja|facemask|balaclava/i.test(lower) || design.faceStyle === "mask";

  const resolvedEyeStyle = design.eyeStyle || (
    hasVisor ? "visor"
    : isDarkChar || /glowing eyes?|herobrine|enderman|demon eyes?/i.test(lower) ? "glowing"
    : /classic eyes?|steve|alex|simple eyes?/i.test(lower) ? "classic"
    : /minimal eyes?|dot eyes?|indie|emo/i.test(lower) ? "minimal"
    : "anime"
  );

  const browColor = isDarkChar ? "#000000" : hairRamp.shadow;
  const lashColor = isDarkChar ? "#000000" : hairRamp.deepShadow;
  const pupilColor = eyesRamp.deepShadow || "#09090b";
  const irisGlow = eyesRamp.highlight;
  const irisBase = eyesRamp.base;

  if (resolvedEyeStyle === "visor") {
    // 🥽 1. Glowing Tech Visor / Cyber Optic
    canvas.fill({ x: 8, y: 10, width: 8, height: 3 }, eyesRamp.deepShadow, "minimal", random);
    canvas.line(9, 11, 6, eyesRamp.highlight);
    canvas.setPixel(10, 10, "#ffffff");
    canvas.setPixel(11, 11, "#ffffff");
  } else if (resolvedEyeStyle === "glowing") {
    // ⚡ 2. Solid Luminous Glowing Eyes (Herobrine / Demon / Shadow - Image 1)
    const glowSolid = eyesRamp.highlight || "#ffffff";
    const glowAccent = eyesRamp.base || glowSolid;
    // Left Eye
    canvas.setPixel(9, 11, glowSolid);
    canvas.setPixel(10, 11, glowSolid);
    canvas.setPixel(9, 12, glowAccent);
    canvas.setPixel(10, 12, glowAccent);
    // Right Eye
    canvas.setPixel(13, 11, glowSolid);
    canvas.setPixel(14, 11, glowSolid);
    canvas.setPixel(13, 12, glowAccent);
    canvas.setPixel(14, 12, glowAccent);
  } else if (resolvedEyeStyle === "classic") {
    // 🔲 3. Classic 2×1 Minecraft Steve/Alex Style (Image 3)
    // Left Brow & Eye
    canvas.setPixel(9, 10, browColor);
    canvas.setPixel(10, 10, browColor);
    canvas.setPixel(9, 11, "#ffffff"); // Sclera White
    canvas.setPixel(10, 11, irisBase); // Pupil/Iris
    // Right Brow & Eye
    canvas.setPixel(13, 10, browColor);
    canvas.setPixel(14, 10, browColor);
    canvas.setPixel(13, 11, irisBase); // Pupil/Iris
    canvas.setPixel(14, 11, "#ffffff"); // Sclera White
  } else if (resolvedEyeStyle === "minimal") {
    // ▪️ 4. Minimalist 1×2 Aesthetic / Emo Dot Eyes
    canvas.setPixel(10, 10, browColor);
    canvas.setPixel(13, 10, browColor);
    canvas.setPixel(10, 11, pupilColor);
    canvas.setPixel(10, 12, irisGlow);
    canvas.setPixel(13, 11, pupilColor);
    canvas.setPixel(13, 12, irisGlow);
  } else {
    // ✨ 5. Pro High-Definition Aesthetic / Anime 2×2 Eyes (Image 2)
    // Eyebrows (y: 9)
    canvas.setPixel(9, 9, browColor);
    canvas.setPixel(10, 9, browColor);
    canvas.setPixel(13, 9, browColor);
    canvas.setPixel(14, 9, browColor);

    // Left Eye (x: 9..10, y: 10..12)
    canvas.setPixel(9, 10, lashColor);
    canvas.setPixel(10, 10, lashColor);
    canvas.setPixel(9, 11, "#ffffff"); // Specular Catchlight
    canvas.setPixel(10, 11, pupilColor); // Pupil
    canvas.setPixel(9, 12, irisBase); // Iris
    canvas.setPixel(10, 12, irisGlow); // Iris Glow

    // Right Eye (x: 13..14, y: 10..12)
    canvas.setPixel(13, 10, lashColor);
    canvas.setPixel(14, 10, lashColor);
    canvas.setPixel(13, 11, "#ffffff"); // Specular Catchlight
    canvas.setPixel(14, 11, pupilColor); // Pupil
    canvas.setPixel(13, 12, irisGlow); // Iris Glow
    canvas.setPixel(14, 12, irisBase); // Iris

    // Outer Sclera Whites
    canvas.setPixel(8, 11, "#f8fafc");
    canvas.setPixel(8, 12, "#e2e8f0");
    canvas.setPixel(15, 11, "#f8fafc");
    canvas.setPixel(15, 12, "#e2e8f0");
  }

  // 3. Cheeks & Nose (y: 13) - Strictly 100% clean skin gap between eyes (y: 12) and mouth (y: 14)

  // 4. Natural Expressive Mouth & Lips (Strictly row y: 14, NEVER row y: 13)
  const resolvedMouthStyle = design.mouthStyle || (
    hasMask ? "none"
    : /smirk|grin|cocky|confident/i.test(lower) ? "smirk"
    : /open mouth|laugh|screaming|shout/i.test(lower) ? "open"
    : /no mouth|faceless/i.test(lower) ? "none"
    : /neutral mouth|serious/i.test(lower) ? "neutral"
    : "smile"
  );

  if (!hasMask && resolvedMouthStyle !== "none" && !isDarkChar) {
    const lipColor = shade(palette.skin, -0.18);
    const darkLip = shade(palette.skin, -0.28);
    const softLip = shade(palette.skin, -0.09);

    if (resolvedMouthStyle === "smile") {
      // 4-pixel centered gentle smile
      canvas.setPixel(10, 14, softLip);
      canvas.setPixel(11, 14, lipColor);
      canvas.setPixel(12, 14, lipColor);
      canvas.setPixel(13, 14, softLip);
    } else if (resolvedMouthStyle === "smirk") {
      // Centered asymmetric smirk: neutral left (11), deeper shadow on right (12)
      canvas.setPixel(11, 14, lipColor);
      canvas.setPixel(12, 14, darkLip);
    } else if (resolvedMouthStyle === "open") {
      // Centered 2px open mouth in deep warm tone
      canvas.setPixel(11, 14, "#4a1c1c");
      canvas.setPixel(12, 14, "#4a1c1c");
    } else {
      // Centered neutral 2px lip line
      canvas.setPixel(11, 14, lipColor);
      canvas.setPixel(12, 14, lipColor);
    }
  }

  // 3D Tactical Face Mask / Ninja Mask
  if (hasMask || isNinja) {
    const maskColor = isNinja ? "#111318" : topRamp.base;
    canvas.fill({ x: 8, y: 13, width: 8, height: 3 }, maskColor, "minimal", random);
    canvas.line(9, 13, 6, topRamp.shadow);
  }

  // 3D OVERLAYS (x: 32..63, y: 0..15)
  const hasHeadphones = /headphone|headset|earphone|radio/i.test(lower) || design.headphones;
  const hasHorns = /horn|demon|oni/i.test(lower) || design.horns;
  const hasCrown = /crown|king|queen|royal|prince/i.test(lower) || design.crown;
  const hasHalo = /halo|angel|divine/i.test(lower) || design.halo;
  const hasHood = /hood|hoodie|assassin|rogue/i.test(lower) || design.hairStyle === "hood";

  if (isMilitary && (/helmet|tactical|swat|commando|soldier/i.test(lower) || design.hairStyle === "helmet")) {
    // 3D Tactical Combat / Flight Helmet with Open Face
    const helmRamp = getHueShiftRamp(palette.top, "metal");
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, helmRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, helmRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, helmRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, helmRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 40, y: 8, width: 8, height: 2 }, helmRamp.base, "pixel-detailed", random);
    // Front NVG Mount Bracket
    canvas.setPixel(43, 8, "#18181b");
    canvas.setPixel(44, 8, "#18181b");
    canvas.setPixel(43, 9, "#3f3f46");
    canvas.setPixel(44, 9, "#3f3f46");
    // Helmet Rim Ridge
    canvas.line(40, 9, 8, helmRamp.light);
  } else if (isKnight) {
    // 3D Heroic Open-Faced Barbute Knight Helmet
    const steelRamp = getHueShiftRamp(palette.topAccent || "#94a3b8", "metal");
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, steelRamp.base, "pixel-detailed", random);
    // Forehead Plate Brow & Side Cheek Guards (leaving eyes, mouth & hair bangs visible!)
    canvas.fill({ x: 40, y: 8, width: 8, height: 2 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 40, y: 10, width: 1, height: 4 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 47, y: 10, width: 1, height: 4 }, steelRamp.base, "pixel-detailed", random);
    // Gold Battle Crest Trim on Forehead
    canvas.line(40, 8, 8, palette.detail || "#f59e0b");
  } else if (hasHood) {
    // 3D Assassin / Streetwear Hood
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.line(40, 8, 8, topRamp.light);
  } else if (design.hairStyle !== "bald") {
    // 3D Detailed Aesthetic Hair & Bangs (Foreground bangs at y: 8..9, no face obscuring)
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random);
    canvas.line(41, 2, 6, hairRamp.light);
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // back hair
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // right side hair
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, hairRamp.base, "pixel-detailed", random); // left side hair
    // Front Hair Bangs (y: 8..9 only - leaving eyes at row 10..12 fully unobstructed!)
    canvas.fill({ x: 40, y: 8, width: 8, height: 2 }, hairRamp.base, "pixel-detailed", random);
    canvas.setPixel(41, 9, hairRamp.light);
    canvas.setPixel(44, 9, hairRamp.light);
    canvas.setPixel(46, 9, hairRamp.shadow);
    // Outer Border Sideburn Locks (x: 40 and 47 only)
    canvas.line(40, 10, 3, hairRamp.base, true);
    canvas.line(47, 10, 3, hairRamp.base, true);
  }

  // 3D Pilot Aviators / Sunglasses
  const hasAviators = isMilitary || /aviator|pilot|sunglasses|shades/i.test(lower) || design.glasses;
  if (hasAviators && !isKnight) {
    const goldFrame = "#d4af37";
    const darkLens = "#1e293b";
    // Left Lens
    canvas.setPixel(41, 10, goldFrame);
    canvas.setPixel(42, 10, goldFrame);
    canvas.setPixel(41, 11, darkLens);
    canvas.setPixel(42, 11, darkLens);
    canvas.setPixel(41, 12, goldFrame);
    canvas.setPixel(42, 12, darkLens);
    canvas.setPixel(41, 11, "#ffffff"); // Specular Reflection
    // Right Lens
    canvas.setPixel(45, 10, goldFrame);
    canvas.setPixel(46, 10, goldFrame);
    canvas.setPixel(45, 11, darkLens);
    canvas.setPixel(46, 11, darkLens);
    canvas.setPixel(45, 12, darkLens);
    canvas.setPixel(46, 12, goldFrame);
    canvas.setPixel(45, 11, "#ffffff"); // Specular Reflection
    // Bridge & Temples
    canvas.setPixel(43, 10, goldFrame);
    canvas.setPixel(44, 10, goldFrame);
    canvas.line(35, 10, 5, goldFrame);
    canvas.line(48, 10, 5, goldFrame);
  }

  // 3D Tactical Headset / Headphones with Boom Mic
  if (hasHeadphones || (isMilitary && /pilot|airforce|operator|comms/i.test(lower))) {
    const bandColor = "#18181b";
    canvas.fill({ x: 40, y: 0, width: 8, height: 2 }, bandColor, "minimal", random);
    canvas.line(41, 0, 6, accentRamp.highlight);
    canvas.fill({ x: 33, y: 10, width: 4, height: 4 }, bandColor, "minimal", random);
    canvas.fill({ x: 34, y: 11, width: 2, height: 2 }, accentRamp.highlight, "minimal", random);
    canvas.fill({ x: 49, y: 10, width: 4, height: 4 }, bandColor, "minimal", random);
    canvas.fill({ x: 50, y: 11, width: 2, height: 2 }, accentRamp.highlight, "minimal", random);
    // Boom mic on left cheek
    canvas.line(41, 13, 3, "#27272a");
    canvas.setPixel(43, 13, accentRamp.highlight);
  }

  // 3D Horns / Crown / Halo
  if (hasHorns) {
    canvas.setPixel(41, 0, accentRamp.highlight);
    canvas.setPixel(41, 1, accentRamp.base);
    canvas.setPixel(46, 0, accentRamp.highlight);
    canvas.setPixel(46, 1, accentRamp.base);
  }
  if (hasCrown) {
    canvas.line(40, 7, 8, "#facc15");
    canvas.setPixel(41, 6, "#facc15");
    canvas.setPixel(43, 6, "#facc15");
    canvas.setPixel(45, 6, "#facc15");
    canvas.setPixel(47, 6, "#facc15");
  }
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
  const skinRamp = getHueShiftRamp(palette.skin, "skin");

  const faces = {
    top: { x: 20, y: 16, width: 8, height: 4 },
    bottom: { x: 28, y: 16, width: 8, height: 4 },
    right: { x: 16, y: 20, width: 4, height: 12 },
    front: { x: 20, y: 20, width: 8, height: 12 },
    left: { x: 28, y: 20, width: 4, height: 12 },
    back: { x: 32, y: 20, width: 8, height: 12 },
  };

  const isMilitary = /military|soldier|airforce|pilot|army|camo|tactical|swat|commando|navy|seal|combat|operator|sniper|veteran|flight|top gun|usaf/i.test(lower);
  const isArmor = /armor|knight|warrior|paladin|plate|chestplate|chainmail|samurai/i.test(lower) || design.outfit === "armor";
  const isCyber = /cyber|hacker|futuristic|tech|robot|neon|mecha/i.test(lower) || design.outfit === "cyber";
  const isFormal = /gentleman|suit|tuxedo|formal|victorian|waistcoat|vest|tie|cravat|blazer/i.test(lower) || design.outfit === "formal";
  const isNinja = /ninja|shinobi|assassin|rogue|stealth/i.test(lower);
  const isAesthetic = /aesthetic|anime|goth|e-girl|e-boy|sweater|oversized|monochrome/i.test(lower);

  const ovFront = { x: 20, y: 36, width: 8, height: 12 };
  const ovBack = { x: 32, y: 36, width: 8, height: 12 };
  const ovRight = { x: 16, y: 36, width: 4, height: 12 };
  const ovLeft = { x: 28, y: 36, width: 4, height: 12 };

  if (isMilitary) {
    // 🪖 MASTER TACTICAL MILITARY & AIRFORCE ENGINE
    // Base Camo Uniform / Flight Suit
    Object.values(faces).forEach((face) => drawCamouflage(canvas, face, palette.top, palette.topAccent));
    // Flight Suit / Tactical Undershirt Neck Zip
    canvas.fill({ x: 23, y: 20, width: 2, height: 3 }, "#18181b", "minimal", random);
    canvas.line(23, 20, 3, "#d4af37", true); // Gold zipper line

    // 3D Tactical MOLLE Plate Carrier Vest
    const vestRamp = getHueShiftRamp(palette.topAccent || "#1b241a", "fabric");
    canvas.fill(ovRight, vestRamp.base, "pixel-detailed", random);
    canvas.fill(ovLeft, vestRamp.base, "pixel-detailed", random);
    canvas.fill(ovBack, vestRamp.base, "pixel-detailed", random);
    canvas.fill(ovFront, vestRamp.base, "pixel-detailed", random);

    // Front Magazine Ammo Pouches (x: 21..26, y: 41..43)
    canvas.fill({ x: 21, y: 41, width: 6, height: 3 }, vestRamp.deepShadow, "minimal", random);
    canvas.setPixel(22, 41, vestRamp.highlight);
    canvas.setPixel(24, 41, vestRamp.highlight);
    canvas.setPixel(25, 41, vestRamp.highlight);

    // Shoulder Radio Comms Unit with Antenna on Left Shoulder
    canvas.setPixel(ovFront.x + 1, ovFront.y + 1, "#18181b");
    canvas.setPixel(ovFront.x + 1, ovFront.y + 2, "#3f3f46");
    canvas.setPixel(ovFront.x + 1, ovFront.y, accentRamp.highlight); // LED Antenna

    // Squadron / Flag Patch on Right Chest (x: 25..26, y: 38..39)
    canvas.setPixel(25, 38, "#ef4444");
    canvas.setPixel(26, 38, "#3b82f6");
    canvas.setPixel(25, 39, "#ffffff");
    canvas.setPixel(26, 39, "#d4af37");

    // Tactical Utility Belt with Steel Buckle (y: 47)
    canvas.line(20, 47, 8, "#18181b");
    canvas.setPixel(23, 47, "#d4af37"); // Steel / Gold buckle
    canvas.setPixel(24, 47, "#d4af37");
  } else if (isArmor) {
    // ⚔️ MASTER MEDIEVAL & KNIGHT PLATE ARMOR
    // Chainmail Base Underlay
    Object.values(faces).forEach((face) => canvas.fill(face, "#334155", "pixel-detailed", random));
    // 3D Polished Plate Breastplate with Specular Bevels
    const metalRamp = getHueShiftRamp(palette.topAccent || "#94a3b8", "metal");
    canvas.fill(ovRight, metalRamp.base, "pixel-detailed", random);
    canvas.fill(ovLeft, metalRamp.base, "pixel-detailed", random);
    canvas.fill(ovBack, metalRamp.base, "pixel-detailed", random);
    canvas.fill(ovFront, metalRamp.base, "pixel-detailed", random);

    // Specular Light Bevel Highlights
    canvas.line(21, 37, 6, metalRamp.highlight);
    canvas.line(20, 36, 12, metalRamp.shadow, true);
    canvas.line(27, 36, 12, metalRamp.shadow, true);

    // Dynamic Heraldic Emblems & Breastplate Engravings
    const crestColor = palette.detail || palette.topAccent || "#f59e0b";
    const hasCross = /cross|crusader|templar|paladin|holy/i.test(lower);
    const hasDragon = /dragon|beast|monster|demon|fire/i.test(lower);
    const hasGem = /gem|crystal|ruby|sapphire|emerald|diamond|rune/i.test(lower);

    if (hasCross) {
      canvas.line(23, 39, 4, crestColor, true); // vertical beam
      canvas.line(22, 40, 4, crestColor); // horizontal cross
    } else if (hasDragon) {
      canvas.setPixel(23, 39, crestColor);
      canvas.setPixel(24, 39, crestColor);
      canvas.setPixel(22, 40, crestColor);
      canvas.setPixel(25, 40, crestColor);
      canvas.setPixel(23, 41, accentRamp.highlight);
      canvas.setPixel(24, 41, accentRamp.highlight);
    } else if (hasGem) {
      canvas.setPixel(23, 39, "#ffffff");
      canvas.setPixel(24, 39, "#ffffff");
      canvas.setPixel(23, 40, accentRamp.highlight);
      canvas.setPixel(24, 40, accentRamp.highlight);
    } else {
      // Sleek Master Cuirass Center Rib & Filigree
      canvas.line(23, 38, 5, metalRamp.highlight, true);
      canvas.setPixel(22, 39, metalRamp.light);
      canvas.setPixel(25, 39, metalRamp.light);
      canvas.setPixel(21, 41, metalRamp.light);
      canvas.setPixel(26, 41, metalRamp.light);
    }

    // Plate Belt at waist
    canvas.line(20, 46, 8, "#1e293b");
    canvas.setPixel(23, 46, crestColor);
    canvas.setPixel(24, 46, crestColor);
  } else if (isCyber) {
    // ⚡ MASTER CYBERPUNK & MECHA EXOSKELETON
    Object.values(faces).forEach((face) => canvas.fill(face, "#090d16", "pixel-detailed", random));
    // 3D Exoskeleton Armor Plating
    canvas.fill(ovRight, topRamp.base, "minimal", random);
    canvas.fill(ovLeft, topRamp.base, "minimal", random);
    canvas.fill(ovBack, topRamp.base, "minimal", random);
    canvas.fill(ovFront, topRamp.base, "minimal", random);

    // Glowing Arc Reactor Core at center of chest (x: 23..24, y: 39..40)
    canvas.setPixel(23, 39, "#ffffff");
    canvas.setPixel(24, 39, "#ffffff");
    canvas.setPixel(23, 40, accentRamp.highlight);
    canvas.setPixel(24, 40, accentRamp.highlight);
    // Neon Energy Conduits
    canvas.line(21, 41, 2, accentRamp.base);
    canvas.line(25, 41, 2, accentRamp.base);
    canvas.line(23, 41, 4, accentRamp.highlight, true);
  } else if (isFormal) {
    // 🎩 MASTER FORMAL SUIT & TUXEDO
    canvas.fill({ x: 22, y: 20, width: 4, height: 4 }, "#ffffff", "minimal", random);
    const tieColor = palette.topAccent || "#881337";
    const tieRamp = getHueShiftRamp(tieColor, "fabric");
    canvas.setPixel(23, 21, tieRamp.light);
    canvas.setPixel(24, 21, tieRamp.base);
    canvas.setPixel(23, 22, tieRamp.highlight);
    canvas.setPixel(24, 22, tieRamp.base);

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
  } else {
    // 🛹 MASTER STREETWEAR & HOODIE
    canvas.fill({ x: 23, y: 20, width: 2, height: 2 }, skinRamp.base, "minimal", random);
    Object.values(faces).forEach((face) => canvas.fill(face, palette.top, "pixel-detailed", random));
    canvas.fill(ovRight, topRamp.base, "pixel-detailed", random);
    canvas.fill(ovLeft, topRamp.base, "pixel-detailed", random);
    canvas.fill(ovBack, topRamp.base, "pixel-detailed", random);
    canvas.fill(ovFront, topRamp.base, "pixel-detailed", random);

    // 3D Hoodie Kangaroo Pocket (x: 21..26, y: 43..45)
    canvas.fill({ x: 21, y: 43, width: 6, height: 3 }, topRamp.shadow, "minimal", random);
    canvas.line(22, 43, 4, topRamp.highlight);

    // Twin Drawstrings hanging down chest
    canvas.setPixel(22, 38, "#ffffff");
    canvas.setPixel(22, 39, "#ffffff");
    canvas.setPixel(25, 38, "#ffffff");
    canvas.setPixel(25, 39, "#ffffff");
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
  const isMilitary = /military|soldier|airforce|pilot|army|camo|tactical|swat|commando|navy|seal|combat|operator/i.test(lower);
  const isArmor = /armor|knight|warrior|paladin|plate|samurai/i.test(lower) || design.outfit === "armor";
  const isCyber = /cyber|hacker|futuristic|tech|robot|neon|mecha/i.test(lower);

  // Base Arm Fill
  if (isMilitary) {
    faceList.forEach((face) => drawCamouflage(canvas, face, palette.top, palette.topAccent));
  } else {
    faceList.forEach((face) => canvas.fill(face, palette.top, "minimal", random));
  }

  const sleeveRows = isMilitary ? 9 : design.sleeves === "short" ? 4 : design.sleeves === "long" ? 9 : 11;
  bodyFaces.forEach((face) => {
    if (sleeveRows < 12) {
      const skinStart = face.y + sleeveRows;
      canvas.fill({ x: face.x, y: skinStart, width: face.width, height: 12 - sleeveRows }, palette.skin, "minimal", random);
    }
  });

  // Tactical Gloves / Hand Cuffs
  bodyFaces.forEach((face) => {
    const gloveColor = isMilitary ? "#18181b" : isArmor ? "#334155" : "#ffffff";
    canvas.line(face.x, face.y + 11, face.width, gloveColor);
  });

  // 3D Sleeve Overlays & Pauldrons
  const ovFaces = armFaces(model, side, true);
  [ovFaces.right, ovFaces.front, ovFaces.left, ovFaces.back].forEach((face) => {
    canvas.fill({ x: face.x, y: face.y, width: face.width, height: sleeveRows }, topRamp.base, "minimal", random);
    canvas.line(face.x, face.y + sleeveRows - 1, face.width, topRamp.light);
  });

  if (isMilitary) {
    // Tactical Unit / Squadron Patch on upper right arm
    if (side === "right") {
      canvas.setPixel(ovFaces.right.x + 1, ovFaces.right.y + 2, "#d4af37");
      canvas.setPixel(ovFaces.right.x + 2, ovFaces.right.y + 2, "#3b82f6");
    }
  } else if (isArmor) {
    // 3D Steel Pauldron Shoulder Plate
    canvas.fill({ x: ovFaces.top.x, y: ovFaces.top.y, width: ovFaces.top.width, height: 4 }, palette.topAccent || "#94a3b8", "pixel-detailed", random);
    canvas.line(ovFaces.front.x, ovFaces.front.y, ovFaces.front.width, "#f59e0b"); // Gold Trim
  } else if (isCyber) {
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
  const isMilitary = /military|soldier|airforce|pilot|army|camo|tactical|swat|commando|navy|seal|combat|operator/i.test(lower);
  const isArmor = /armor|knight|warrior|paladin|plate|samurai/i.test(lower) || design.outfit === "armor";

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

  if (isMilitary) {
    // 🪖 Military Camo Fatigues
    Object.values(faces).forEach((face) => drawCamouflage(canvas, face, palette.pants, palette.topAccent));
    // Heavy Combat Boots (Rows 8..11)
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      canvas.fill({ x: face.x, y: face.y + 8, width: face.width, height: 4 }, "#18181b", "pixel-detailed", random);
      canvas.setPixel(face.x + 1, face.y + 9, "#71717a"); // Boot eyelets
      canvas.setPixel(face.x + 2, face.y + 9, "#71717a");
      canvas.line(face.x, face.y + 11, face.width, "#09090b"); // Rubber tread
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
      const isSneaker = /sneaker|shoe|trainer|runner|sport|streetwear|hoodie/i.test(lower);
      const soleColor = isSneaker ? "#ffffff" : shoesRamp.deepShadow;
      canvas.line(face.x, face.y + 11, face.width, soleColor);
    });
  }

  // Shoe Bottom Tread
  canvas.fill(faces.bottom, "#09090b", "minimal", random);

  // 3D Pants / Boot Overlays
  const ovFront = isRight ? { x: 4, y: 36, width: 4, height: 12 } : { x: 4, y: 52, width: 4, height: 12 };

  if (isMilitary) {
    // 3D Reinforced Knee Pads on Front (y: 44..46)
    canvas.fill({ x: ovFront.x, y: ovFront.y + 4, width: 4, height: 3 }, "#18181b", "minimal", random);
    canvas.line(ovFront.x + 1, ovFront.y + 5, 2, "#3f3f46");
    // 3D Drop-Leg Holster with Sidearm on Right Leg
    if (isRight) {
      canvas.fill({ x: ovFront.x + 2, y: ovFront.y + 1, width: 2, height: 3 }, "#09090b", "minimal", random);
      canvas.setPixel(ovFront.x + 2, ovFront.y + 1, "#d4af37"); // Pistol Grip
    }
  } else if (isArmor) {
    // 3D Steel Plate Greaves & Sabatons
    canvas.fill({ x: ovFront.x, y: ovFront.y + 8, width: 4, height: 4 }, palette.topAccent || "#94a3b8", "pixel-detailed", random);
    canvas.line(ovFront.x, ovFront.y + 8, 4, "#f59e0b");
  } else {
    canvas.fill({ x: ovFront.x, y: ovFront.y + 8, width: 4, height: 4 }, shoesRamp.base, style, random);
    canvas.line(ovFront.x, ovFront.y + 8, 4, shoesRamp.light);
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
