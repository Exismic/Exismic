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
  outfit: "casual" | "streetwear" | "armor" | "royal" | "cyber" | "fantasy" | "formal" | "sport";
  expression: "neutral" | "friendly" | "serious" | "calm-confident";
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
  garmentType?: "hoodie" | "jacket" | "sweater" | "shirt" | "coat" | "armor" | "tunic" | "robe" | "oversized-hoodie" | "fitted-hoodie" | "bomber-jacket" | "varsity-jacket" | "oversized-sweater" | "streetwear-shirt" | "layered-shirt-jacket" | "techwear" | "denim-jacket" | "fantasy-robe" | "plate-armor";
  hoodState?: "none" | "down" | "up";
  fit?: "oversized" | "fitted" | "loose";
  bangsStyle?: "curtain" | "fringe" | "side-swept" | "straight" | "parted" | "none";
  hairSilhouette?: "curtain-bangs" | "messy-fringe" | "side-swept" | "wolf-cut" | "layered-short" | "middle-part-flow" | "long-layered" | "spiky-anime" | "high-ponytail" | "braided-buns";
  faceConstruction?: "clean-aesthetic" | "anime-expressive" | "masculine-angular" | "feminine-soft" | "soft-cute" | "masked-visor" | "mature-minimal" | "soft-kpop" | "sharp-cool";
  materialProfile?: "cotton" | "denim" | "leather" | "metal" | "wool" | "technical-fabric" | "skin" | "hair";
  hairLength?: "short" | "medium" | "long";
  collarStyle?: "hood-collar" | "crew" | "v-neck" | "turtleneck" | "open";
  footwearStyle?: "sneakers" | "high-tops" | "boots" | "combat-boots" | "armored" | "shoes" | "high-top-sneaker" | "low-sneaker" | "chunky-sneaker" | "chelsea-boots" | "fantasy-armored";
  drawstrings?: "none" | "thin" | "tied";
  placket?: "open_front" | "center_zip" | "pullover" | "buttons_single" | "buttons_double" | "haori_wrap" | "armor_fauld";
  midLayer?: "hoodie" | "sweater" | "vest" | "none";
  innerGarment?: "undershirt" | "crew_tee" | "graphic_tee" | "turtleneck" | "striped_undershirt" | "v_neck_tee" | "tunic" | "none";
  zipper?: "silver" | "gold" | "black" | "none";
  sleeveStyle?: "layered_undershirt" | "slouch_gather" | "short_sleeve" | "rolled_cuff" | "wide_haori" | "gauntlet_bracer";
  pantsType?: "wide_cargo" | "relaxed_jeans" | "tailored_trousers" | "pleated_skirt" | "jumpsuit_cuffed" | "shorts_knee_highs";
  cargoPockets?: boolean;
  socks?: "none" | "ankle" | "knee_high_plain" | "knee_high_striped";
  lightingDirection?: "upper-left" | "upper-right" | "front" | "top-down";
  asymmetry?: boolean;
  negativeConstraints?: string[];
}

type Rgba = [number, number, number, number];
export type Face = { x: number; y: number; width: number; height: number };
export type ArmFaces = {
  top: Face;
  bottom: Face;
  right: Face;
  front: Face;
  left: Face;
  back: Face;
};

const DEFAULT_PALETTE: MinecraftSkinPalette = {
  skin: "#f3cbb4",
  skinShade: "#d49f85",
  hair: "#1e1b24",
  hairHighlight: "#453e54",
  eyes: "#38bdf8",
  top: "#181824",
  topAccent: "#a855f7",
  pants: "#1c2030",
  shoes: "#0f172a",
  detail: "#c084fc",
};

const THEME_PALETTES: Array<{ match: RegExp; palette: Partial<MinecraftSkinPalette>; outfit: MinecraftSkinDesign["outfit"]; pattern: MinecraftSkinDesign["pattern"] }> = [
  {
    match: /streetwear|hoodie|oversized|casual|aesthetic|e-boy|e-girl|anime|sweater|urban/i,
    outfit: "casual",
    pattern: "clean",
    palette: {
      skin: "#f3cbb4",
      skinShade: "#d49f85",
      top: "#181824",
      topAccent: "#a855f7",
      pants: "#1c2030",
      shoes: "#0f172a",
      hair: "#1e1b24",
      hairHighlight: "#453e54",
      eyes: "#38bdf8",
      detail: "#c084fc",
    },
  },
  {
    match: /cottagecore|frog|cute|pastel|nature|strawberry|fairy|meadow/i,
    outfit: "casual",
    pattern: "clean",
    palette: {
      skin: "#fbe4d8",
      skinShade: "#e8beac",
      top: "#4d7c5f",
      topAccent: "#a7f3d0",
      pants: "#335541",
      shoes: "#78350f",
      hair: "#fde047",
      hairHighlight: "#fef08a",
      eyes: "#10b981",
      detail: "#fb7185",
    },
  },
  {
    match: /\b(military|soldier|airforce|army|camo|tactical fatigues|swat|commando|navy seal|sniper|veteran|usaf)\b|\bcombat\b(?!\s*boots?)/i,
    outfit: "armor",
    pattern: "armored",
    palette: {
      skin: "#e5b99f",
      skinShade: "#bd8c72",
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
    match: /demon|lava|fire|obsidian|dark|hell|shadow|reaper|monster|fiend|dragon|oni/i,
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
    match: /cyber|neon|future|tech|robot|android|mecha|cyborg|netrunner/i,
    outfit: "cyber",
    pattern: "paneled",
    palette: {
      skin: "#1e2238",
      skinShade: "#141726",
      top: "#0f172a",
      topAccent: "#06b6d4",
      pants: "#090d16",
      shoes: "#06b6d4",
      hair: "#1e293b",
      hairHighlight: "#38bdf8",
      detail: "#d946ef",
      eyes: "#22d3ee",
    },
  },
  {
    match: /ninja|shinobi|assassin|rogue|stealth|shadow/i,
    outfit: "armor",
    pattern: "paneled",
    palette: {
      skin: "#f3cbb4",
      skinShade: "#d49f85",
      top: "#111318",
      topAccent: "#ef4444",
      pants: "#0b0c10",
      shoes: "#090a0d",
      detail: "#dc2626",
      hair: "#0d0e12",
      eyes: "#ef4444",
    },
  },
  {
    match: /knight|crusader|paladin|templar|armor|plate|warrior|samurai|viking/i,
    outfit: "armor",
    pattern: "armored",
    palette: {
      skin: "#f3cbb4",
      skinShade: "#d49f85",
      top: "#475569",
      topAccent: "#94a3b8",
      pants: "#334155",
      shoes: "#1e293b",
      detail: "#f59e0b",
      hair: "#3e2723",
      hairHighlight: "#5d4037",
      eyes: "#60a5fa",
    },
  },
  {
    match: /wizard|mage|magic|mystic|witch|sorcer/i,
    outfit: "fantasy",
    pattern: "mystic",
    palette: {
      skin: "#fbe4d8",
      skinShade: "#e8beac",
      top: "#3b176f",
      topAccent: "#b471ff",
      pants: "#21133d",
      detail: "#4de8dd",
      eyes: "#bffcff",
      hair: "#2e1065",
      hairHighlight: "#7c3aed",
    },
  },
  {
    match: /royal|king|queen|prince|princess|crown/i,
    outfit: "royal",
    pattern: "paneled",
    palette: {
      skin: "#fbe4d8",
      skinShade: "#e8beac",
      top: "#641f51",
      topAccent: "#f2c94c",
      pants: "#29172f",
      detail: "#f8e39b",
      hair: "#fde047",
      hairHighlight: "#fef08a",
      eyes: "#38bdf8",
    },
  },
  {
    match: /forest|nature|ranger|elf|earth/i,
    outfit: "fantasy",
    pattern: "clean",
    palette: {
      skin: "#f3cbb4",
      skinShade: "#d49f85",
      top: "#245844",
      topAccent: "#83d483",
      pants: "#20382d",
      shoes: "#18251e",
      detail: "#d8c47a",
      hair: "#78350f",
      hairHighlight: "#a16207",
      eyes: "#34d399",
    },
  },
  {
    match: /sport|athlete|football|basketball|runner/i,
    outfit: "sport",
    pattern: "striped",
    palette: {
      skin: "#e5b99f",
      skinShade: "#bd8c72",
      top: "#1766b1",
      topAccent: "#f5f7ff",
      pants: "#14243b",
      detail: "#53d9ff",
      hair: "#171717",
      hairHighlight: "#404040",
      eyes: "#38bdf8",
    },
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

export function shadeWithHueShift(
  hex: string,
  amount: number,
  type: "skin" | "hair" | "fabric" | "metal" | "neon" = "fabric"
): string {
  const [r, g, b] = hexToRgba(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  let hueShift = 0;
  let satDelta = 0;

  if (type === "skin") {
    // Skin subsurface scattering:
    // Shadows shift toward rich reddish-plum/terracotta (-14°), +0.16 saturation
    // Highlights shift toward golden peach (+8°), -0.04 saturation
    if (amount < 0) {
      hueShift = -14 * Math.min(1, Math.abs(amount) * 3.5);
      satDelta = 0.16 * Math.min(1, Math.abs(amount) * 3.5);
    } else {
      hueShift = 8 * Math.min(1, amount * 3.5);
      satDelta = -0.04 * Math.min(1, amount * 3.5);
    }
  } else if (type === "hair") {
    // Hair shadows shift deeper cool tones, highlights get clean specular luster
    if (amount < 0) {
      hueShift = -12 * Math.min(1, Math.abs(amount) * 3);
      satDelta = 0.12 * Math.min(1, Math.abs(amount) * 3);
    } else {
      hueShift = 10 * Math.min(1, amount * 3);
      satDelta = -0.02 * Math.min(1, amount * 3);
    }
  } else if (type === "metal") {
    // High contrast sharp luminance
    if (amount < 0) {
      hueShift = -8 * Math.min(1, Math.abs(amount) * 3);
      satDelta = 0.05 * Math.min(1, Math.abs(amount) * 3);
    } else {
      hueShift = 4 * Math.min(1, amount * 3);
      satDelta = -0.15 * Math.min(1, amount * 3);
    }
  } else {
    // Fabric (cool shadows -12°, warm highlights +6°)
    if (amount < 0) {
      hueShift = -12 * Math.min(1, Math.abs(amount) * 3);
      satDelta = 0.09 * Math.min(1, Math.abs(amount) * 3);
    } else {
      hueShift = 6 * Math.min(1, amount * 3);
      satDelta = -0.04 * Math.min(1, amount * 3);
    }
  }

  const targetL = Math.max(0.02, Math.min(0.98, l + amount));
  const targetS = Math.max(0, Math.min(1, s + satDelta));
  const targetH = ((h + hueShift) % 360 + 360) % 360;

  const [newR, newG, newB] = hslToRgb(targetH, targetS, targetL);
  return `#${[newR, newG, newB].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;
}

export function getHueShiftRamp(hex: string, type: "skin" | "hair" | "fabric" | "metal" | "neon" = "fabric"): ShadingRamp {
  const highlight = shadeWithHueShift(hex, 0.22, type);
  const light = shadeWithHueShift(hex, 0.10, type);
  const base = normalizeHex(hex, "#555555");
  const shadow = shadeWithHueShift(hex, -0.14, type);
  const deepShadow = shadeWithHueShift(hex, -0.26, type);

  return { highlight, light, base, shadow, deepShadow };
}

function shade(hex: string, amount: number, type: "skin" | "hair" | "fabric" | "metal" | "neon" = "fabric") {
  return shadeWithHueShift(hex, amount, type);
}

const PROMPT_COLORS: Array<[string, string]> = [
  ["dark purple", "#4c1d95"],
  ["neon purple", "#a855f7"],
  ["electric purple", "#9333ea"],
  ["purple", "#7c3aed"],
  ["violet", "#8b5cf6"],
  ["lavender", "#d8b4fe"],
  ["magenta", "#d946ef"],
  ["hot pink", "#ec4899"],
  ["pastel pink", "#fbcfe8"],
  ["pink", "#f472b6"],
  ["cyan", "#06b6d4"],
  ["turquoise", "#14b8a6"],
  ["mint", "#6ee7b7"],
  ["pastel green", "#a7f3d0"],
  ["sage green", "#9caf88"],
  ["olive green", "#556b2f"],
  ["olive", "#556b2f"],
  ["lime", "#84cc16"],
  ["dark green", "#166534"],
  ["green", "#16a34a"],
  ["light blue", "#60a5fa"],
  ["sky blue", "#38bdf8"],
  ["navy blue", "#172554"],
  ["navy", "#1e293b"],
  ["dark blue", "#1e3a8a"],
  ["blue", "#2563eb"],
  ["crimson", "#be123c"],
  ["red", "#dc2626"],
  ["cream", "#faf5ef"],
  ["beige", "#e7d8c9"],
  ["khaki", "#c3b091"],
  ["gold", "#eab308"],
  ["yellow", "#facc15"],
  ["blonde", "#fde047"],
  ["orange", "#f97316"],
  ["peach", "#fed7aa"],
  ["silver", "#cbd5e1"],
  ["platinum", "#f1f5f9"],
  ["light gray", "#a1a1aa"],
  ["dark gray", "#27272a"],
  ["charcoal", "#27272a"],
  ["grey", "#52525b"],
  ["gray", "#52525b"],
  ["white", "#f8fafc"],
  ["brown", "#7c4a2d"],
  ["black", "#0b0b10"],
];

function colorNearContext(prompt: string, contexts: string[]) {
  const contextPattern = contexts.map((context) => context.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  let bestColor: string | undefined = undefined;
  let minDistance = Infinity;
  const clauseBreakers = /\b(with|and|having|plus|w\/)\b|[,.;+&]/i;

  for (const [name, color] of PROMPT_COLORS) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Case 1: Color precedes context noun (e.g. "black oversized hoodie", "red bomber jacket")
    const prePattern = new RegExp(`\\b(?:${escapedName})\\b([^,.]{0,35})\\b(?:${contextPattern})\\b`, "i");
    const preMatch = prePattern.exec(prompt);
    if (preMatch) {
      const gap = preMatch[1] ?? "";
      if (!clauseBreakers.test(gap)) {
        const distance = gap.trim().length;
        if (distance < minDistance) {
          minDistance = distance;
          bestColor = color;
        }
      }
    }

    // Case 2: Context noun precedes color with explicit linking or immediate qualification (e.g. "hoodie in black", "jacket colored red")
    const postPattern = new RegExp(`\\b(?:${contextPattern})\\b(?:\\s+(?:in|of|colored|dyed))?\\s+\\b(?:${escapedName})\\b`, "i");
    const postMatch = postPattern.exec(prompt);
    if (postMatch) {
      const distance = postMatch[0].length + 15;
      if (distance < minDistance) {
        minDistance = distance;
        bestColor = color;
      }
    }
  }
  return bestColor;
}

function extractPromptPalette(prompt: string): Partial<MinecraftSkinPalette> {
  const accent = colorNearContext(prompt, [
    "accent", "lightning", "trim", "line", "lines", "detail", "glow", "glowing",
    "cables?", "wires?", "headphones?", "headset", "leds?", "neon", "circuits?", "visor", "eyes"
  ]);
  const top = colorNearContext(prompt, [
    "hoodie", "jacket", "shirt", "top", "robe", "armor", "coat",
    "cloak", "suit", "vest", "tunic", "torso", "chest", "sweater", "sweatshirt", "cardigan", "pullover", "techwear"
  ]);
  const pants = colorNearContext(prompt, ["pants", "trousers", "jeans", "leggings", "legs", "bottom", "overalls?", "dungarees?"]);
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
  const isNegated = /\b(no|not|without|never|zero|free of)\b[^\n,.;]*\b(beard|stubble|moustache|goatee|facial hair)\b/i.test(prompt);
  if (isNegated) return "none";

  if (/\b(?:light )?stubble\b/i.test(prompt)) return "stubble";
  if (/\bgoatee\b/i.test(prompt)) return "goatee";
  if (/\b(?:full |short )?beard\b/i.test(prompt)) return "short-beard";
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

const BAYER_4X4: readonly (readonly number[])[] = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

function getBayerDither(x: number, y: number): number {
  return (BAYER_4X4[((y % 4) + 4) % 4][((x % 4) + 4) % 4] / 15 - 0.5); // Range: -0.5 to +0.5
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
      type?: "skin" | "hair" | "fabric" | "metal" | "neon";
      dither?: boolean;
    }
  ) {
    const isMinimal = style === "minimal";
    const isHighContrast = style === "high-contrast";
    const gradScale = options?.gradientScale ?? 1.0;
    const type = options?.type ?? "fabric";
    const useDither = options?.dither ?? false;

    for (let y = face.y; y < face.y + face.height; y += 1) {
      for (let x = face.x; x < face.x + face.width; x += 1) {
        const normY = face.height > 1 ? (y - face.y) / (face.height - 1) : 0.5;

        let shadeAmount = 0;

        if (isMinimal) {
          // Clean flat anime color: crisp 1px bottom shadow
          if (y === face.y + face.height - 1) shadeAmount = -0.06;
        } else if (isHighContrast) {
          // High contrast: deep rich shadows, bright top rim edge
          shadeAmount = (0.45 - normY) * 0.18 * gradScale;
          if (y === face.y) shadeAmount += 0.10;
          if (y === face.y + face.height - 1) shadeAmount -= 0.14;
          if (x === face.x || x === face.x + face.width - 1) shadeAmount -= 0.06;
        } else {
          // Clean artist lighting: soft top-to-bottom plane gradient with corner bevels, NO random noise
          shadeAmount = (0.5 - normY) * 0.10 * gradScale;
          if (y === face.y) shadeAmount += 0.04;
          if (y === face.y + face.height - 1) shadeAmount -= 0.06;
          if (x === face.x + face.width - 1) shadeAmount -= 0.03; // Subtle right-side shadow (key light from left)
        }

        if (useDither) {
          shadeAmount += getBayerDither(x, y) * 0.02;
        }

        this.setPixel(x, y, shadeWithHueShift(color, shadeAmount, type));
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

  bakeLayerDropShadows() {
    // Minecraft 1.8 64x64 Overlay to Base UV mapping
    const overlayRegions: Array<{
      overlay: Face;
      baseDx: number;
      baseDy: number;
    }> = [
      // Head: overlay x: 32..63, y: 0..15 -> base x: 0..31, y: 0..15 (dx = -32, dy = 0)
      { overlay: { x: 32, y: 0, width: 32, height: 16 }, baseDx: -32, baseDy: 0 },
      // Torso: overlay x: 16..39, y: 32..47 -> base x: 16..39, y: 16..31 (dx = 0, dy = -16)
      { overlay: { x: 16, y: 32, width: 24, height: 16 }, baseDx: 0, baseDy: -16 },
      // Right Arm: overlay x: 40..55, y: 32..47 -> base x: 40..55, y: 16..31 (dx = 0, dy = -16)
      { overlay: { x: 40, y: 32, width: 16, height: 16 }, baseDx: 0, baseDy: -16 },
      // Left Arm: overlay x: 48..63, y: 48..63 -> base x: 32..47, y: 48..63 (dx = -16, dy = 0)
      { overlay: { x: 48, y: 48, width: 16, height: 16 }, baseDx: -16, baseDy: 0 },
      // Right Leg: overlay x: 0..15, y: 32..47 -> base x: 0..15, y: 16..31 (dx = 0, dy = -16)
      { overlay: { x: 0, y: 32, width: 16, height: 16 }, baseDx: 0, baseDy: -16 },
      // Left Leg: overlay x: 0..15, y: 48..63 -> base x: 16..31, y: 48..63 (dx = +16, dy = 0)
      { overlay: { x: 0, y: 48, width: 16, height: 16 }, baseDx: 16, baseDy: 0 },
    ];

    for (const region of overlayRegions) {
      const { overlay, baseDx, baseDy } = region;
      for (let y = overlay.y; y < overlay.y + overlay.height; y += 1) {
        for (let x = overlay.x; x < overlay.x + overlay.width; x += 1) {
          const [, , , alpha] = this.getPixel(x, y);
          // If this overlay pixel is visible (part of outer hair, jacket, cuff, armor)
          if (alpha > 40) {
            const bx = x + baseDx;
            const by = y + baseDy;
            if (bx >= 0 && bx < 64 && by >= 0 && by < 64) {
              const [br, bg, bb, ba] = this.getPixel(bx, by);
              if (ba > 0) {
                // Soft ambient contact shadow directly underneath overlay element (13% shadow)
                const hex = `#${[br, bg, bb].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
                const shaded = shadeWithHueShift(hex, -0.13, "fabric");
                this.setPixel(bx, by, shaded, ba);
              }
            }

            // Drop shadow cast 1px below bottom edge of overlay cluster!
            const isBottomEdge = (y + 1 >= overlay.y + overlay.height) || (this.getPixel(x, y + 1)[3] <= 40);
            if (isBottomEdge) {
              const dropBx = x + baseDx;
              const dropBy = y + baseDy + 1;
              if (dropBx >= 0 && dropBx < 64 && dropBy >= 0 && dropBy < 64) {
                const [dBr, dBg, dBb, dBa] = this.getPixel(dropBx, dropBy);
                if (dBa > 0) {
                  const dHex = `#${[dBr, dBg, dBb].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
                  const shadedDrop = shadeWithHueShift(dHex, -0.20, "fabric");
                  this.setPixel(dropBx, dropBy, shadedDrop, dBa);
                }
              }
            }
          }
        }
      }
    }
  }
}

function applySeamAmbientOcclusion(canvas: SkinCanvas) {
  // 1. Neck contact shadow (Chin casts shadow onto torso top and upper chest)
  // Torso top (x: 20..27, y: 16..19) - center neck area (x: 22..25, y: 16..17)
  for (let y = 16; y <= 17; y += 1) {
    for (let x = 22; x <= 25; x += 1) {
      const [r, g, b, a] = canvas.getPixel(x, y);
      if (a > 0) {
        const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
        canvas.setPixel(x, y, shadeWithHueShift(hex, -0.24, "skin"), a);
      }
    }
  }
  // Torso front top row (y: 20, x: 22..25)
  for (let x = 22; x <= 25; x += 1) {
    const [r, g, b, a] = canvas.getPixel(x, 20);
    if (a > 0) {
      const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      canvas.setPixel(x, 20, shadeWithHueShift(hex, -0.16, "fabric"), a);
    }
  }

  // 2. Groin & inner leg shadow
  // Right leg left face (x: 8..11, y: 20..22) and Left leg right face (x: 16..19, y: 52..54)
  for (let y = 20; y <= 22; y += 1) {
    for (let x = 8; x <= 11; x += 1) {
      const [r, g, b, a] = canvas.getPixel(x, y);
      if (a > 0) {
        const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
        canvas.setPixel(x, y, shadeWithHueShift(hex, -0.14, "fabric"), a);
      }
    }
  }
  for (let y = 52; y <= 54; y += 1) {
    for (let x = 16; x <= 19; x += 1) {
      const [r, g, b, a] = canvas.getPixel(x, y);
      if (a > 0) {
        const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
        canvas.setPixel(x, y, shadeWithHueShift(hex, -0.14, "fabric"), a);
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

  const isExplicitHoodUp = /\b(hood up|wearing hood|cowl|hooded cloak)\b/i.test(lower);
  const isHoodieGarment = /\b(hoodie|oversized hoodie|sweatshirt)\b/i.test(lower);

  const hasNegatedHelmet = /\b(no|not|never|without|isn't|aren't|doesn't)\b[^\n,.;]*\bhelmet\b/i.test(lower);
  const isHelmet = !hasNegatedHelmet && /\b(wearing (?:a )?helmet|knight helmet|space helmet|combat helmet|full helm|greathelm|robot helmet)\b/i.test(lower);

  const hairStyle: MinecraftSkinDesign["hairStyle"] =
    isHelmet ? "helmet"
      : isExplicitHoodUp ? "hood"
        : /long hair|princess|elf/.test(lower) ? "long"
          : /spiky|anime/.test(lower) ? "spiky"
            : /bald/.test(lower) ? "bald"
              : "short";

  const hairSilhouette: MinecraftSkinDesign["hairSilhouette"] =
    /wolf[- ]cut|mullet|shag/i.test(lower) ? "wolf-cut"
      : /side[- ]swept|swept fringe|side part/i.test(lower) ? "side-swept"
        : /messy|fringe|textured fringe|shaggy/i.test(lower) ? "messy-fringe"
          : /middle[- ]part|k-?pop|flow/i.test(lower) ? "middle-part-flow"
            : /ponytail|high pony/i.test(lower) ? "high-ponytail"
              : /bun|buns|braid|space buns/i.test(lower) ? "braided-buns"
                : /spiky|anime hair|spike/i.test(lower) ? "spiky-anime"
                  : /long hair|flow.*locks|long layered/i.test(lower) ? "long-layered"
                    : /short crop|undercut|fade|layered short/i.test(lower) ? "layered-short"
                      : /knight|warrior|paladin|soldier|military/i.test(lower) ? "layered-short"
                        : /demon|oni|shadow|fiend/i.test(lower) ? "spiky-anime"
                          : /girl|female|woman|waifu/i.test(lower) ? "long-layered"
                            : "curtain-bangs";

  const faceConstruction: MinecraftSkinDesign["faceConstruction"] =
    /visor|goggles/i.test(lower) ? "masked-visor"
      : /mask|ninja|facemask|balaclava/i.test(lower) ? "masked-visor"
        : /cottagecore|frog|cute|chibi|pastel/i.test(lower) ? "soft-cute"
          : /k-?pop|soft boy|aesthetic boy/i.test(lower) ? "soft-kpop"
            : /sharp|cool|assassin|dark|demon|oni|edgy|fierce/i.test(lower) ? "sharp-cool"
              : /girl|female|woman|waifu|princess|maiden/i.test(lower) ? "feminine-soft"
                : /knight|warrior|soldier|military|gigachad|male|man/i.test(lower) ? "masculine-angular"
                  : /minimal|emo|indie|dot eyes/i.test(lower) ? "mature-minimal"
                    : /anime|manga/i.test(lower) ? "anime-expressive"
                      : "clean-aesthetic";

  const materialProfile: MinecraftSkinDesign["materialProfile"] =
    /metal|plate|armor|steel|iron|chainmail/i.test(lower) ? "metal"
      : /denim|jeans/i.test(lower) ? "denim"
        : /leather|bomber/i.test(lower) ? "leather"
          : /wool|sweater|cardigan|knit/i.test(lower) ? "wool"
            : /tech|techwear|cyber|nylon/i.test(lower) ? "technical-fabric"
              : "cotton";

  const garmentType: MinecraftSkinDesign["garmentType"] =
    /bomber/i.test(lower) ? "bomber-jacket"
      : /varsity/i.test(lower) ? "varsity-jacket"
        : /sweater|cardigan|pullover/i.test(lower) ? "oversized-sweater"
          : /techwear/i.test(lower) ? "techwear"
            : /denim jacket/i.test(lower) ? "denim-jacket"
              : /armor|plate|knight|paladin/i.test(lower) ? "plate-armor"
                : /overalls?|dungarees?/i.test(lower) ? "streetwear-shirt"
                  : /oversized hoodie|hoodie|sweatshirt/i.test(lower) ? "oversized-hoodie"
                    : /t-?shirt|graphic tee|skate/i.test(lower) ? "streetwear-shirt"
                      : isHoodieGarment ? "oversized-hoodie"
                        : /jacket/i.test(lower) ? "jacket"
                          : /robe/i.test(lower) ? "robe"
                            : /tunic/i.test(lower) ? "tunic"
                              : "oversized-hoodie";

  const hoodState: MinecraftSkinDesign["hoodState"] =
    isExplicitHoodUp ? "up"
      : isHoodieGarment ? "down"
        : "none";

  const fit: MinecraftSkinDesign["fit"] =
    /oversized|baggy|loose/i.test(lower) ? "oversized"
      : /fitted|tight|slim fit/i.test(lower) ? "fitted"
        : "loose";

  const bangsStyle: MinecraftSkinDesign["bangsStyle"] =
    /curtain bangs?|curtain/i.test(lower) ? "curtain"
      : /side[- ]swept/i.test(lower) ? "side-swept"
        : /parted|middle part/i.test(lower) ? "parted"
          : /fringe/i.test(lower) ? "fringe"
            : /straight bangs?/i.test(lower) ? "straight"
              : "curtain";

  const footwearStyle: MinecraftSkinDesign["footwearStyle"] =
    /chunky|platform|dad shoe/i.test(lower) ? "chunky-sneaker"
      : /combat boots?|doc martens?|tactical boots?/i.test(lower) ? "combat-boots"
        : /chelsea boots?|chelsea/i.test(lower) ? "chelsea-boots"
          : /armored boot|sabaton|greaves?|metal boot/i.test(lower) ? "fantasy-armored"
            : /low[- ](?:top|sneakers?)|skate shoes?|air force/i.test(lower) ? "low-sneaker"
              : /high[- ]tops?|jordans?|dunks?|sneakers?/i.test(lower) ? "high-top-sneaker"
                : "high-top-sneaker";

  const drawstrings: MinecraftSkinDesign["drawstrings"] =
    isHoodieGarment ? (/no drawstrings?/i.test(lower) ? "none" : "thin") : "none";

  const palettes = [
    { skin: "#e5b99f", skinShade: "#c28f73", hair: "#312a32", hairHighlight: "#59465f" },
    { skin: "#c98f68", skinShade: "#9d6248", hair: "#211a22", hairHighlight: "#49364f" },
    { skin: "#8f5f43", skinShade: "#68422f", hair: "#0e1117", hairHighlight: "#29303b" },
    { skin: "#6f4935", skinShade: "#4e3125", hair: "#171218", hairHighlight: "#3b2b3c" },
  ];
  const complexion = palettes[seed % palettes.length];
  const promptPalette = extractPromptPalette(prompt);

  // Safe emblem extraction: only extract if explicitly designated as emblem/logo/text or quoted
  let fallbackEmblem = "";
  const explicitEmblem = prompt.match(/(?:emblem|logo|crest|insignia|lettering|letters?|text|patch|badge|reads?|says?)\s+(?:reading|saying|of|with|is)?\s*["']?([a-z0-9]{1,3})["']?/i);
  const quotedEmblem = prompt.match(/["']([a-z0-9]{1,3})["']/i);
  if (explicitEmblem) {
    const candidate = explicitEmblem[1].toUpperCase();
    if (!/^(NO|NOT|THE|AND|FOR)$/.test(candidate)) {
      fallbackEmblem = candidate;
    }
  } else if (quotedEmblem) {
    const candidate = quotedEmblem[1].toUpperCase();
    if (!/^(NO|NOT|THE|AND|FOR)$/.test(candidate)) {
      fallbackEmblem = candidate;
    }
  }

  // Safe accessories extraction with explicit negation handling
  const hasNegatedGlasses = /\b(no|not|never|without)\b[^\n,.;]*\b(glasses|shades|sunglasses|spectacles)\b/i.test(lower);
  const isGlasses = !hasNegatedGlasses && (
    /\b(sunglasses|reading glasses|spectacles|aviators?|goggles)\b/i.test(lower) ||
    /\b(wearing|pair of|dark|tinted|cool)\s+shades\b/i.test(lower)
  );

  const hasNegatedCrown = /\b(no|not|never|without)\b[^\n,.;]*\bcrown\b/i.test(lower);
  const isAnatomicalCrown = /\b(?:layered crown|crown of (?:the )?head|head crown|hair crown)\b/i.test(lower);
  const isRoyalCrown = !hasNegatedCrown && !isAnatomicalCrown && (
    /\b(wearing (?:a )?crown|golden crown|royal crown|jeweled crown|tiara|circlet)\b/i.test(lower) ||
    (/\bcrown\b/i.test(lower) && /\b(king|queen|prince|princess|royal|monarch)\b/i.test(lower))
  );

  const hasNegatedHeadphones = /\b(no|not|never|without)\b[^\n,.;]*\b(headphones?|headset|earphones?)\b/i.test(lower);
  const isHeadphones = !hasNegatedHeadphones && /\b(headphone|headset|earphone)\b/i.test(lower);

  const hasNegatedCables = /\b(no|not|never|without)\b[^\n,.;]*\b(cables?|wires?)\b/i.test(lower);
  const isCables = !hasNegatedCables && /\b(cable|wire|tech line|neon line|energy line)\b/i.test(lower);

  const hasNegatedHorns = /\b(no|not|never|without)\b[^\n,.;]*\bhorns?\b/i.test(lower);
  const isHorns = !hasNegatedHorns && /\b(horns?|demon horns?|oni horns?)\b/i.test(lower);

  const hasNegatedHalo = /\b(no|not|never|without)\b[^\n,.;]*\bhalo\b/i.test(lower);
  const isHalo = !hasNegatedHalo && /\b(halo|angel halo|divine halo)\b/i.test(lower);

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
    isExplicitHoodUp ? "hooded cowl" : isHoodieGarment ? "oversized hoodie" : "",
    /curtain bangs?/i.test(lower) ? "curtain bangs" : "",
    /high[- ]tops?/i.test(lower) ? "high-top sneakers" : "",
    /glow|neon|emissive/.test(lower) ? "glowing accents" : "",
    /lightning|electric/.test(lower) ? "lightning details" : "",
    isCables ? "glowing cables" : "",
    isHeadphones ? "headphones" : "",
    isGlasses ? "glasses" : "",
    /mask|masked/.test(lower) ? "face mask" : "",
    /visor/.test(lower) ? "visor" : "",
    isHorns ? "horns" : "",
    isRoyalCrown ? "crown" : "",
    requestsAngryEyes(prompt) ? "angry eyes" : "",
    requestedFacialHair(prompt) !== "none" ? "facial hair" : "",
    /armor/.test(lower) ? "armor plating" : "",
    fallbackEmblem ? `${fallbackEmblem} emblem` : "",
  ].filter(Boolean);

  return {
    name: prompt.trim().split(/\s+/).slice(0, 5).join(" ") || "Exismic Skin",
    description: `A Minecraft-compatible character inspired by: ${prompt.trim() || "a modern adventurer"}.`,
    hairStyle,
    hairSilhouette,
    faceConstruction,
    materialProfile,
    garmentType,
    hoodState,
    fit,
    bangsStyle,
    footwearStyle,
    drawstrings,
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
    emblem: fallbackEmblem,
    traits: traitCandidates.slice(0, 8),
    palette: sanitizePalette({ ...DEFAULT_PALETTE, ...complexion, ...theme?.palette, ...promptPalette }),
    headphones: isHeadphones,
    glasses: isGlasses,
    cables: isCables,
    horns: isHorns,
    crown: isRoyalCrown,
    halo: isHalo,
    placket: /open front|open at front|unzipped/i.test(lower) ? "open_front" : "center_zip",
    midLayer: isHoodieGarment && /bomber|jacket|coat/i.test(lower) ? "hoodie" : "none",
    innerGarment: /undershirt|tee|t-shirt/i.test(lower) ? "undershirt" : "none",
    zipper: /silver zipper/i.test(lower) ? "silver" : /gold zipper/i.test(lower) ? "gold" : "none",
    sleeveStyle: /layered sleeves?|slouch/i.test(lower) ? "slouch_gather" : "short_sleeve",
    pantsType: /cargo/i.test(lower) ? "wide_cargo" : /jeans/i.test(lower) ? "relaxed_jeans" : "tailored_trousers",
    cargoPockets: /cargo pockets?/i.test(lower),
    socks: "none",
    lightingDirection: /upper-left|upper left/i.test(lower) ? "upper-left" : "front",
    asymmetry: /asymmetr/i.test(lower),
    negativeConstraints: [],
  };
}

export function sanitizeSkinDesign(
  value: Partial<Omit<MinecraftSkinDesign, "palette">> & { palette?: Partial<MinecraftSkinPalette> },
  prompt: string,
  seed: number
): MinecraftSkinDesign {
  const fallback = createFallbackSkinDesign(prompt, seed);
  const hairStyles = ["short", "long", "spiky", "hood", "helmet", "bald"] as const;
  const hairSilhouettes = [
    "curtain-bangs", "messy-fringe", "side-swept", "wolf-cut", "layered-short",
    "middle-part-flow", "long-layered", "spiky-anime", "high-ponytail", "braided-buns"
  ] as const;
  const faceConstructions = [
    "clean-aesthetic", "anime-expressive", "masculine-angular", "feminine-soft",
    "soft-cute", "masked-visor", "mature-minimal", "soft-kpop", "sharp-cool"
  ] as const;
  const materialProfiles = [
    "cotton", "denim", "leather", "metal", "wool", "technical-fabric", "skin", "hair"
  ] as const;
  const outfits = ["casual", "streetwear", "armor", "royal", "cyber", "fantasy", "formal", "sport"] as const;
  const expressions = ["neutral", "friendly", "serious", "calm-confident"] as const;
  const eyeShapes = ["normal", "angry", "soft"] as const;
  const eyeStyles = ["anime", "classic", "glowing", "minimal", "visor"] as const;
  const mouthStyles = ["smile", "neutral", "smirk", "open", "none"] as const;
  const facialHair = ["none", "stubble", "short-beard", "goatee"] as const;
  const faceStyles = ["open", "mask", "visor"] as const;
  const sleeves = ["short", "long", "armored"] as const;
  const footwear = ["shoes", "boots", "armored"] as const;
  const patterns = ["clean", "striped", "paneled", "armored", "mystic", "lightning", "circuit"] as const;
  const garmentTypes = [
    "hoodie", "jacket", "sweater", "shirt", "coat", "armor", "tunic", "robe",
    "oversized-hoodie", "fitted-hoodie", "bomber-jacket", "varsity-jacket", "oversized-sweater",
    "streetwear-shirt", "layered-shirt-jacket", "techwear", "denim-jacket", "fantasy-robe", "plate-armor"
  ] as const;
  const hoodStates = ["none", "down", "up"] as const;
  const fits = ["oversized", "fitted", "loose"] as const;
  const bangsStyles = ["curtain", "fringe", "side-swept", "straight", "parted", "none"] as const;
  const footwearStyles = [
    "sneakers", "high-tops", "boots", "combat-boots", "armored", "shoes",
    "high-top-sneaker", "low-sneaker", "chunky-sneaker", "chelsea-boots", "fantasy-armored"
  ] as const;
  const drawstringStyles = ["none", "thin", "tied"] as const;

  const pick = <T extends string>(candidate: unknown, options: readonly T[], defaultValue: T) =>
    typeof candidate === "string" && options.includes(candidate as T) ? candidate as T : defaultValue;

  return {
    name: typeof value.name === "string" ? value.name.trim().slice(0, 60) || fallback.name : fallback.name,
    description: typeof value.description === "string"
      ? value.description.trim().slice(0, 240) || fallback.description
      : fallback.description,
    hairStyle: pick(value.hairStyle, hairStyles, fallback.hairStyle),
    hairSilhouette: pick(value.hairSilhouette, hairSilhouettes, fallback.hairSilhouette || "curtain-bangs"),
    faceConstruction: pick(value.faceConstruction, faceConstructions, fallback.faceConstruction || "clean-aesthetic"),
    materialProfile: pick(value.materialProfile, materialProfiles, fallback.materialProfile || "cotton"),
    garmentType: pick(value.garmentType, garmentTypes, fallback.garmentType || "oversized-hoodie"),
    hoodState: pick(value.hoodState, hoodStates, fallback.hoodState || "none"),
    fit: pick(value.fit, fits, fallback.fit || "oversized"),
    bangsStyle: pick(value.bangsStyle, bangsStyles, fallback.bangsStyle || "curtain"),
    footwearStyle: pick(value.footwearStyle, footwearStyles, fallback.footwearStyle || "high-top-sneaker"),
    drawstrings: pick(value.drawstrings, drawstringStyles, fallback.drawstrings || "thin"),
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
    headphones: typeof value.headphones === "boolean" ? value.headphones : fallback.headphones,
    glasses: typeof value.glasses === "boolean" ? value.glasses : fallback.glasses,
    cables: typeof value.cables === "boolean" ? value.cables : fallback.cables,
    horns: typeof value.horns === "boolean" ? value.horns : fallback.horns,
    crown: typeof value.crown === "boolean" ? value.crown : fallback.crown,
    halo: typeof value.halo === "boolean" ? value.halo : fallback.halo,
    placket: value.placket ?? fallback.placket,
    midLayer: value.midLayer ?? fallback.midLayer,
    innerGarment: value.innerGarment ?? fallback.innerGarment,
    zipper: value.zipper ?? fallback.zipper,
    sleeveStyle: value.sleeveStyle ?? fallback.sleeveStyle,
    pantsType: value.pantsType ?? fallback.pantsType,
    cargoPockets: typeof value.cargoPockets === "boolean" ? value.cargoPockets : fallback.cargoPockets,
    socks: value.socks ?? fallback.socks,
    lightingDirection: value.lightingDirection ?? fallback.lightingDirection,
    asymmetry: typeof value.asymmetry === "boolean" ? value.asymmetry : fallback.asymmetry,
    negativeConstraints: Array.isArray(value.negativeConstraints) ? value.negativeConstraints : fallback.negativeConstraints,
  };
}

export function armFaces(model: MinecraftArmModel, side: "right" | "left", overlay = false): ArmFaces {
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

// ============================================================================
// ARTIST COMPONENT SUB-RENDERERS (Modular NameMC / SkinDex Artist Standard)
// ============================================================================

function paintHairSilhouette(
  canvas: SkinCanvas,
  design: MinecraftSkinDesign,
  hairRamp: ShadingRamp,
  skinRamp: ShadingRamp,
  random: () => number,
  isDarkChar: boolean,
  lowerPrompt: string
) {
  const silhouette = design.hairSilhouette || "curtain-bangs";
  const seedVal = random();
  const asymmetricFlip = seedVal > 0.5;

  // -------------------------------------------------------------
  // 1. BASE HEAD LAYER HAIR SCULPTING (x: 0..31, y: 0..15)
  // -------------------------------------------------------------
  const baseFaces = {
    top: { x: 8, y: 0, width: 8, height: 8 },
    bottom: { x: 16, y: 0, width: 8, height: 8 },
    right: { x: 0, y: 8, width: 8, height: 8 },
    front: { x: 8, y: 8, width: 8, height: 8 },
    left: { x: 16, y: 8, width: 8, height: 8 },
    back: { x: 24, y: 8, width: 8, height: 8 },
  };

  // Base crown: Directional lighting with top-left highlight cluster & natural parting
  canvas.fill(baseFaces.top, hairRamp.base, "balanced", random, { type: "hair" });
  canvas.setPixel(10, 1, hairRamp.light);
  canvas.setPixel(11, 1, hairRamp.highlight);
  canvas.setPixel(10, 2, hairRamp.highlight);
  canvas.setPixel(11, 2, hairRamp.light);
  canvas.setPixel(12, 1, hairRamp.shadow); // Natural parting crease
  canvas.setPixel(12, 2, hairRamp.shadow);
  canvas.setPixel(12, 3, hairRamp.shadow);

  // Back of head base hair: Deep root shadow and layered neckline
  canvas.fill(baseFaces.back, hairRamp.base, "balanced", random, { type: "hair" });
  canvas.line(24, 8, 8, hairRamp.shadow); // Upper root shadow
  canvas.line(24, 15, 8, hairRamp.deepShadow); // Neck crevice shadow
  // Reveal neck skin at lower back corners for natural nape taper
  if (!isDarkChar) {
    canvas.setPixel(24, 15, skinRamp.shadow);
    canvas.setPixel(31, 15, skinRamp.shadow);
  }

  // Sides of head base hair: Base fill with authentic ear cutout and sideburns
  canvas.fill(baseFaces.right, hairRamp.base, "balanced", random, { type: "hair" });
  canvas.fill(baseFaces.left, hairRamp.base, "balanced", random, { type: "hair" });

  // Natural ear reveals on base layer (rows 11..12) with shadow contour
  if (!isDarkChar) {
    // Right Ear
    canvas.setPixel(4, 11, skinRamp.shadow);
    canvas.setPixel(5, 11, skinRamp.base);
    canvas.setPixel(4, 12, skinRamp.base);
    canvas.setPixel(5, 12, skinRamp.shadow);
    // Left Ear
    canvas.setPixel(18, 11, skinRamp.base);
    canvas.setPixel(19, 11, skinRamp.shadow);
    canvas.setPixel(18, 12, skinRamp.shadow);
    canvas.setPixel(19, 12, skinRamp.base);
  }

  // Sideburn strands in front of ears
  canvas.line(6, 11, 2, hairRamp.shadow, true);
  canvas.setPixel(6, 12, hairRamp.deepShadow);
  canvas.line(17, 11, 2, hairRamp.shadow, true);
  canvas.setPixel(17, 12, hairRamp.deepShadow);

  // Front Base Hairline (Row 8) & Forehead Contact Shadows (Row 9)
  if (silhouette === "curtain-bangs" || silhouette === "middle-part-flow") {
    // Open center forehead showing skin tone under parting
    canvas.fill({ x: 8, y: 8, width: 3, height: 1 }, hairRamp.base);
    canvas.fill({ x: 13, y: 8, width: 3, height: 1 }, hairRamp.base);
    canvas.setPixel(11, 8, skinRamp.base);
    canvas.setPixel(12, 8, skinRamp.base);
    // Soft contact shadow under the outer bangs
    if (!isDarkChar) {
      canvas.setPixel(9, 9, skinRamp.shadow);
      canvas.setPixel(14, 9, skinRamp.shadow);
    }
  } else if (silhouette === "side-swept") {
    if (asymmetricFlip) {
      canvas.fill({ x: 8, y: 8, width: 5, height: 1 }, hairRamp.base);
      canvas.fill({ x: 13, y: 8, width: 3, height: 1 }, skinRamp.base);
      if (!isDarkChar) canvas.line(9, 9, 3, skinRamp.shadow);
    } else {
      canvas.fill({ x: 8, y: 8, width: 3, height: 1 }, skinRamp.base);
      canvas.fill({ x: 11, y: 8, width: 5, height: 1 }, hairRamp.base);
      if (!isDarkChar) canvas.line(12, 9, 3, skinRamp.shadow);
    }
  } else {
    canvas.fill({ x: 8, y: 8, width: 8, height: 1 }, hairRamp.base);
    if (!isDarkChar) {
      canvas.setPixel(9, 9, skinRamp.shadow);
      canvas.setPixel(11, 9, skinRamp.shadow);
      canvas.setPixel(13, 9, skinRamp.shadow);
      canvas.setPixel(14, 9, skinRamp.shadow);
    }
  }

  // -------------------------------------------------------------
  // 2. 3D HAT OVERLAY HAIR SCULPTING (x: 32..63, y: 0..15)
  // -------------------------------------------------------------
  // Top Overlay: Sculpted Crown Volume with Corner Bevels (NOT a flat 8x8 block!)
  canvas.fill({ x: 41, y: 1, width: 6, height: 6 }, hairRamp.base, "balanced", random, { type: "hair" });
  canvas.line(42, 0, 4, hairRamp.base); // Front edge volume
  canvas.line(42, 7, 4, hairRamp.shadow); // Rear edge shadow
  // Corners (40, 0), (47, 0), (40, 7), (47, 7) remain transparent for rounded silhouette!

  // Crown highlight cluster (key light top-left)
  canvas.setPixel(42, 2, hairRamp.light);
  canvas.setPixel(43, 2, hairRamp.highlight);
  canvas.setPixel(43, 3, hairRamp.light);
  canvas.setPixel(44, 2, hairRamp.shadow); // Subtle crown parting

  // Side Overlays: Tapered Side Locks (x: 32..39 and x: 48..55)
  // Upper volume at rows 8..9
  canvas.fill({ x: 34, y: 8, width: 5, height: 2 }, hairRamp.base);
  canvas.fill({ x: 49, y: 8, width: 5, height: 2 }, hairRamp.base);
  canvas.setPixel(36, 8, hairRamp.light);
  canvas.setPixel(51, 8, hairRamp.light);

  // Front side locks framing temples (leaves ear area transparent!)
  canvas.line(32, 8, 5, hairRamp.base, true); // Right side lock rows 8..12
  canvas.setPixel(32, 12, hairRamp.shadow);
  canvas.line(55, 8, 5, hairRamp.base, true); // Left side lock rows 8..12
  canvas.setPixel(55, 12, hairRamp.shadow);

  if (silhouette === "long-layered" || silhouette === "wolf-cut") {
    // Extended locks past the ear down to rows 13..14
    canvas.line(33, 10, 4, hairRamp.base, true);
    canvas.setPixel(33, 14, hairRamp.deepShadow);
    canvas.line(54, 10, 4, hairRamp.base, true);
    canvas.setPixel(54, 14, hairRamp.deepShadow);
  }

  // Back Overlay: Layered Back Volume (x: 56..63, y: 8..15)
  if (silhouette === "high-ponytail") {
    // Sleek pulled back head overlay
    canvas.fill({ x: 57, y: 8, width: 6, height: 2 }, hairRamp.base);
    const scrunchieColor = design.palette.detail || "#a855f7";
    // 3D Scrunchie Gather at (59..60, 9..10)
    canvas.fill({ x: 59, y: 9, width: 2, height: 2 }, scrunchieColor);
    // Flowing Ponytail down rows 11..15
    canvas.fill({ x: 58, y: 11, width: 4, height: 4 }, hairRamp.base);
    canvas.line(59, 11, 4, hairRamp.light, true); // Specular sheen streak
    canvas.setPixel(58, 15, hairRamp.shadow);
    canvas.setPixel(61, 15, hairRamp.shadow);
  } else if (silhouette === "long-layered" || silhouette === "wolf-cut") {
    // Cascading back volume with notched layered hem
    canvas.fill({ x: 57, y: 8, width: 6, height: 6 }, hairRamp.base);
    canvas.setPixel(57, 13, hairRamp.shadow);
    canvas.setPixel(62, 13, hairRamp.shadow);
    canvas.line(58, 14, 4, hairRamp.shadow);
    canvas.setPixel(59, 14, hairRamp.deepShadow);
    canvas.setPixel(60, 14, hairRamp.deepShadow);
  } else if (silhouette === "layered-short") {
    // Clean modern crop back overlay
    canvas.fill({ x: 57, y: 8, width: 6, height: 2 }, hairRamp.base);
    canvas.line(58, 10, 4, hairRamp.shadow);
  } else {
    // Medium layered length
    canvas.fill({ x: 57, y: 8, width: 6, height: 4 }, hairRamp.base);
    canvas.line(58, 12, 4, hairRamp.shadow);
    canvas.setPixel(57, 11, hairRamp.shadow);
    canvas.setPixel(62, 11, hairRamp.shadow);
  }

  // -------------------------------------------------------------
  // 3. FRONT BANGS & SILHOUETTE SCULPTING (x: 40..47, y: 8..15)
  // -------------------------------------------------------------
  if (silhouette === "messy-fringe") {
    // 🌪️ Authentic Messy Fringe: Directional Jagged Clusters
    // Left cluster
    canvas.setPixel(40, 8, hairRamp.base);
    canvas.setPixel(41, 8, hairRamp.light);
    canvas.setPixel(40, 9, hairRamp.base);
    canvas.setPixel(41, 9, hairRamp.shadow);
    canvas.setPixel(40, 10, hairRamp.deepShadow);
    // Center-left cluster
    canvas.setPixel(42, 8, hairRamp.base);
    canvas.setPixel(43, 8, hairRamp.light);
    canvas.setPixel(42, 9, hairRamp.base);
    canvas.setPixel(43, 9, hairRamp.shadow);
    canvas.setPixel(42, 10, hairRamp.deepShadow);
    // Center notch: (44, 9) transparent!
    // Right cluster
    canvas.setPixel(44, 8, hairRamp.base);
    canvas.setPixel(45, 8, hairRamp.light);
    canvas.setPixel(46, 8, hairRamp.base);
    canvas.setPixel(45, 9, hairRamp.base);
    canvas.setPixel(46, 9, hairRamp.shadow);
    canvas.setPixel(46, 10, hairRamp.deepShadow);
    canvas.setPixel(47, 8, hairRamp.base);
  } else if (silhouette === "side-swept") {
    // 🌊 Sleek Directional Side-Swept Fringe
    if (asymmetricFlip) {
      // Sweeps left to right
      canvas.fill({ x: 40, y: 8, width: 5, height: 1 }, hairRamp.base);
      canvas.setPixel(41, 8, hairRamp.light);
      canvas.setPixel(43, 8, hairRamp.light);
      canvas.line(41, 9, 4, hairRamp.base);
      canvas.setPixel(42, 9, hairRamp.light);
      canvas.setPixel(44, 9, hairRamp.shadow);
      canvas.line(43, 10, 3, hairRamp.shadow);
      canvas.setPixel(45, 10, hairRamp.deepShadow);
      canvas.setPixel(40, 9, hairRamp.base);
    } else {
      // Sweeps right to left
      canvas.fill({ x: 43, y: 8, width: 5, height: 1 }, hairRamp.base);
      canvas.setPixel(44, 8, hairRamp.light);
      canvas.setPixel(46, 8, hairRamp.light);
      canvas.line(43, 9, 4, hairRamp.base);
      canvas.setPixel(45, 9, hairRamp.light);
      canvas.setPixel(43, 9, hairRamp.shadow);
      canvas.line(42, 10, 3, hairRamp.shadow);
      canvas.setPixel(42, 10, hairRamp.deepShadow);
      canvas.setPixel(47, 9, hairRamp.base);
    }
  } else if (silhouette === "wolf-cut") {
    // 🐺 Modern Layered Wolf Cut with Shaggy Face Framing
    canvas.setPixel(40, 8, hairRamp.base);
    canvas.setPixel(41, 8, hairRamp.light);
    canvas.setPixel(42, 8, hairRamp.base);
    canvas.setPixel(45, 8, hairRamp.base);
    canvas.setPixel(46, 8, hairRamp.light);
    canvas.setPixel(47, 8, hairRamp.base);
    // Choppy fringe tips
    canvas.setPixel(41, 9, hairRamp.shadow);
    canvas.setPixel(42, 9, hairRamp.base);
    canvas.setPixel(45, 9, hairRamp.base);
    canvas.setPixel(46, 9, hairRamp.shadow);
    // Long 3D side locks hugging jawline down to row 12..13
    canvas.line(40, 9, 4, hairRamp.base, true);
    canvas.setPixel(40, 13, hairRamp.deepShadow);
    canvas.line(47, 9, 4, hairRamp.base, true);
    canvas.setPixel(47, 13, hairRamp.deepShadow);
  } else if (silhouette === "layered-short") {
    // ✂️ Clean Textured Crop Undercut Fringe
    canvas.fill({ x: 40, y: 8, width: 8, height: 1 }, hairRamp.base);
    canvas.setPixel(41, 8, hairRamp.light);
    canvas.setPixel(44, 8, hairRamp.light);
    canvas.setPixel(46, 8, hairRamp.light);
    // Serrated tips at row 9
    canvas.setPixel(40, 9, hairRamp.base);
    canvas.setPixel(42, 9, hairRamp.shadow);
    canvas.setPixel(45, 9, hairRamp.shadow);
    canvas.setPixel(47, 9, hairRamp.base);
  } else if (silhouette === "middle-part-flow") {
    // 💫 K-Pop Middle-Part Comma / Flow
    // Center (43, 44) completely open!
    canvas.setPixel(40, 8, hairRamp.base);
    canvas.setPixel(41, 8, hairRamp.light);
    canvas.setPixel(42, 8, hairRamp.base);
    canvas.setPixel(45, 8, hairRamp.base);
    canvas.setPixel(46, 8, hairRamp.light);
    canvas.setPixel(47, 8, hairRamp.base);
    // Left comma wisp: curves inward at row 10
    canvas.setPixel(40, 9, hairRamp.base);
    canvas.setPixel(41, 9, hairRamp.light);
    canvas.setPixel(42, 9, hairRamp.shadow);
    canvas.setPixel(41, 10, hairRamp.shadow);
    canvas.setPixel(42, 10, hairRamp.base); // Comma curl tip
    // Right sweeping flow: sweeps outward
    canvas.setPixel(46, 9, hairRamp.light);
    canvas.setPixel(47, 9, hairRamp.base);
    canvas.setPixel(46, 10, hairRamp.shadow);
    canvas.setPixel(47, 10, hairRamp.deepShadow);
  } else if (silhouette === "long-layered") {
    // 🌺 Long Flowing Locks Framing Face
    canvas.setPixel(40, 8, hairRamp.base);
    canvas.setPixel(41, 8, hairRamp.light);
    canvas.setPixel(42, 8, hairRamp.base);
    canvas.setPixel(45, 8, hairRamp.base);
    canvas.setPixel(46, 8, hairRamp.light);
    canvas.setPixel(47, 8, hairRamp.base);
    // Face-framing locks cascading down to row 14
    canvas.line(40, 9, 5, hairRamp.base, true);
    canvas.setPixel(41, 9, hairRamp.light);
    canvas.setPixel(41, 10, hairRamp.shadow);
    canvas.setPixel(40, 14, hairRamp.deepShadow);
    canvas.line(47, 9, 5, hairRamp.base, true);
    canvas.setPixel(46, 9, hairRamp.light);
    canvas.setPixel(46, 10, hairRamp.shadow);
    canvas.setPixel(47, 14, hairRamp.deepShadow);
  } else if (silhouette === "spiky-anime") {
    // ⚡ Angular Anime Spikes (protrudes onto crown and down over forehead)
    // Crown spikes
    canvas.setPixel(42, 0, hairRamp.highlight);
    canvas.setPixel(45, 0, hairRamp.highlight);
    // Front spikes with negative space
    canvas.setPixel(40, 8, hairRamp.base);
    canvas.setPixel(41, 8, hairRamp.highlight);
    canvas.setPixel(43, 8, hairRamp.base);
    canvas.setPixel(45, 8, hairRamp.highlight);
    canvas.setPixel(47, 8, hairRamp.base);
    // Sharp spike tips
    canvas.setPixel(41, 9, hairRamp.base);
    canvas.setPixel(41, 10, hairRamp.shadow);
    canvas.setPixel(44, 9, hairRamp.base);
    canvas.setPixel(44, 10, hairRamp.shadow);
    canvas.setPixel(46, 9, hairRamp.base);
    canvas.setPixel(47, 9, hairRamp.shadow);
  } else if (silhouette === "high-ponytail") {
    // 🎀 Sleek High Ponytail Front
    canvas.setPixel(40, 8, hairRamp.base);
    canvas.line(41, 8, 6, hairRamp.light);
    canvas.setPixel(47, 8, hairRamp.base);
    // Wispy baby hairs at temples
    canvas.setPixel(40, 9, hairRamp.shadow);
    canvas.setPixel(47, 9, hairRamp.shadow);
  } else if (silhouette === "braided-buns") {
    // 🌸 Braided Space Buns with Framing Tendrils
    canvas.setPixel(41, 8, hairRamp.light);
    canvas.setPixel(42, 8, hairRamp.base);
    canvas.setPixel(45, 8, hairRamp.base);
    canvas.setPixel(46, 8, hairRamp.light);
    // Dual 3D Space Buns on Top Overlay with woven braided texture
    canvas.setPixel(40, 0, hairRamp.highlight);
    canvas.setPixel(41, 0, hairRamp.base);
    canvas.setPixel(40, 1, hairRamp.base);
    canvas.setPixel(41, 1, hairRamp.shadow);
    canvas.setPixel(46, 0, hairRamp.highlight);
    canvas.setPixel(47, 0, hairRamp.base);
    canvas.setPixel(46, 1, hairRamp.base);
    canvas.setPixel(47, 1, hairRamp.shadow);
    // Delicate framing tendrils down to row 12
    canvas.line(40, 9, 3, hairRamp.base, true);
    canvas.setPixel(40, 12, hairRamp.shadow);
    canvas.line(47, 9, 3, hairRamp.base, true);
    canvas.setPixel(47, 12, hairRamp.shadow);
  } else {
    // ✨ Authentic NameMC Aesthetic Curtain Bangs (True Parted Curtains!)
    // Columns 43 and 44 are 100% TRANSPARENT from row 8 down to row 15!
    // Left Curtain: arches from (42, 8) down to temple/cheekbone (40, 11..12)
    canvas.setPixel(40, 8, hairRamp.base);
    canvas.setPixel(41, 8, hairRamp.light);
    canvas.setPixel(42, 8, hairRamp.base);
    canvas.setPixel(40, 9, hairRamp.base);
    canvas.setPixel(41, 9, hairRamp.light);
    canvas.setPixel(42, 9, hairRamp.shadow);
    canvas.setPixel(40, 10, hairRamp.base);
    canvas.setPixel(41, 10, hairRamp.shadow);
    canvas.setPixel(40, 11, hairRamp.deepShadow);

    // Right Curtain: arches from (45, 8) down to temple/cheekbone (47, 11..12)
    canvas.setPixel(45, 8, hairRamp.base);
    canvas.setPixel(46, 8, hairRamp.light);
    canvas.setPixel(47, 8, hairRamp.base);
    canvas.setPixel(45, 9, hairRamp.shadow);
    canvas.setPixel(46, 9, hairRamp.light);
    canvas.setPixel(47, 9, hairRamp.base);
    canvas.setPixel(46, 10, hairRamp.shadow);
    canvas.setPixel(47, 10, hairRamp.base);
    canvas.setPixel(47, 11, hairRamp.deepShadow);

    // Controlled Asymmetric Strand Length Variation (±1px)
    if (asymmetricFlip) {
      canvas.setPixel(40, 12, hairRamp.deepShadow);
    } else {
      canvas.setPixel(47, 12, hairRamp.deepShadow);
    }
  }
}

function paintFaceConstruction(
  canvas: SkinCanvas,
  design: MinecraftSkinDesign,
  skinRamp: ShadingRamp,
  hairRamp: ShadingRamp,
  eyesRamp: ShadingRamp,
  random: () => number,
  isDarkChar: boolean,
  lowerPrompt: string
) {
  const construction = design.faceConstruction || "clean-aesthetic";
  const palette = design.palette;
  const hasMask = /mask|face cover|ninja|facemask|balaclava/i.test(lowerPrompt) || design.faceStyle === "mask";
  const hasVisor = /visor|goggles/i.test(lowerPrompt) || design.faceStyle === "visor" || design.eyeStyle === "visor" || construction === "masked-visor";

  const browColor = isDarkChar ? "#000000" : hairRamp.shadow;
  const deepBrowColor = isDarkChar ? "#000000" : hairRamp.deepShadow;
  const lashColor = isDarkChar ? "#000000" : hairRamp.deepShadow;
  const pupilColor = eyesRamp.deepShadow || "#09090b";
  const irisGlow = eyesRamp.highlight;
  const irisBase = eyesRamp.base;

  if (hasVisor && !hasMask) {
    // 🥽 1. Glowing High-Tech Visor
    canvas.fill({ x: 8, y: 10, width: 8, height: 3 }, "#090d16");
    canvas.line(8, 11, 8, eyesRamp.base);
    canvas.line(9, 11, 6, eyesRamp.highlight);
    // Specular diagonal reflection gleam
    canvas.setPixel(10, 10, "#ffffff");
    canvas.setPixel(11, 11, "#ffffff");
    canvas.setPixel(14, 10, "#ffffff");
    return;
  }

  if (hasMask) {
    // 🥷 Tactical Ninja / Streetwear Half-Mask (Rows 12..15)
    const maskColor = palette.topAccent || "#18181b";
    const maskRamp = getHueShiftRamp(maskColor, "fabric");
    canvas.fill({ x: 8, y: 12, width: 8, height: 4 }, maskRamp.base);
    canvas.line(9, 12, 6, maskRamp.highlight); // Nose bridge seam
    canvas.line(8, 15, 8, maskRamp.deepShadow); // Jaw contour
    // Draw focused eyes above mask
    canvas.line(9, 9, 2, browColor);
    canvas.line(13, 9, 2, browColor);
    canvas.line(9, 10, 2, lashColor);
    canvas.line(13, 10, 2, lashColor);
    canvas.setPixel(9, 11, "#ffffff");
    canvas.setPixel(10, 11, irisBase);
    canvas.setPixel(13, 11, irisBase);
    canvas.setPixel(14, 11, "#ffffff");
    return;
  }

  // -------------------------------------------------------------
  // EYES & BROWS BY DISTINCT ARCHETYPE
  // -------------------------------------------------------------
  if (construction === "soft-kpop") {
    // 💫 Soft K-Pop Male: Almond Eyes with Warm Eye Shadow & Gradient Iris
    // Straight horizontal brows with delicate outer taper
    canvas.setPixel(9, 9, hairRamp.base);
    canvas.setPixel(10, 9, hairRamp.shadow);
    canvas.setPixel(11, 9, hairRamp.base);
    canvas.setPixel(13, 9, hairRamp.shadow);
    canvas.setPixel(14, 9, hairRamp.base);
    canvas.setPixel(15, 9, hairRamp.base);

    // Warm eye shadow wash along upper eyelid (Row 10)
    const eyeShadowColor = shadeWithHueShift(palette.skin, -0.06, "skin");
    canvas.setPixel(8, 10, eyeShadowColor);
    canvas.setPixel(9, 10, lashColor);
    canvas.setPixel(10, 10, lashColor);
    canvas.setPixel(13, 10, lashColor);
    canvas.setPixel(14, 10, lashColor);
    canvas.setPixel(15, 10, eyeShadowColor);

    // Left Eye: Almond shaped
    canvas.setPixel(9, 11, "#ffffff"); // Bright catchlight
    canvas.setPixel(10, 11, pupilColor);
    canvas.setPixel(9, 12, irisBase);
    canvas.setPixel(10, 12, irisGlow);

    // Right Eye
    canvas.setPixel(13, 11, "#ffffff");
    canvas.setPixel(14, 11, pupilColor);
    canvas.setPixel(13, 12, irisGlow);
    canvas.setPixel(14, 12, irisBase);

    // Sclera whites
    canvas.setPixel(8, 11, "#f8fafc");
    canvas.setPixel(15, 11, "#f8fafc");

    // Cheeks: Soft peach blush clusters under eyes
    const kpopBlush = shadeWithHueShift(palette.skin, -0.08, "skin");
    canvas.setPixel(8, 13, kpopBlush);
    canvas.setPixel(9, 13, kpopBlush);
    canvas.setPixel(14, 13, kpopBlush);
    canvas.setPixel(15, 13, kpopBlush);

    // Soft warm nose contour
    canvas.setPixel(11, 13, shadeWithHueShift(palette.skin, -0.05, "skin"));
    canvas.setPixel(12, 13, shadeWithHueShift(palette.skin, -0.05, "skin"));

    // Gradient lips: Darker center at (11..12, 14), softer edge at (10, 14)
    canvas.setPixel(10, 14, shadeWithHueShift(palette.skin, -0.05, "skin"));
    canvas.setPixel(11, 14, shadeWithHueShift(palette.skin, -0.12, "skin"));
    canvas.setPixel(12, 14, shadeWithHueShift(palette.skin, -0.12, "skin"));
    return;
  }

  if (construction === "sharp-cool") {
    // 🗡️ Sharp / Cool / Assassin / Demon: Menacing Angled Brows & Narrow Piercing Eyes
    // Slanted downward brows
    canvas.setPixel(8, 9, deepBrowColor);
    canvas.setPixel(9, 9, deepBrowColor);
    canvas.setPixel(10, 10, deepBrowColor);
    canvas.setPixel(14, 9, deepBrowColor);
    canvas.setPixel(15, 9, deepBrowColor);
    canvas.setPixel(13, 10, deepBrowColor);

    // Narrow 2x1 piercing eyes
    canvas.setPixel(9, 11, "#ffffff");
    canvas.setPixel(10, 11, pupilColor);
    canvas.setPixel(13, 11, pupilColor);
    canvas.setPixel(14, 11, "#ffffff");
    canvas.setPixel(8, 11, "#f8fafc");
    canvas.setPixel(15, 11, "#f8fafc");

    // High cheekbone shadow contouring
    canvas.setPixel(8, 13, skinRamp.shadow);
    canvas.setPixel(15, 13, skinRamp.shadow);

    // Asymmetric smirk at row 14
    canvas.setPixel(11, 14, shadeWithHueShift(palette.skin, -0.08, "skin"));
    canvas.setPixel(12, 14, shadeWithHueShift(palette.skin, -0.14, "skin"));
    canvas.setPixel(13, 14, shadeWithHueShift(palette.skin, -0.16, "skin"));
    return;
  }

  if (construction === "anime-expressive" || construction === "feminine-soft") {
    // 👁️ Winged Anime Eyes with Dual Specular Sparkle & Rose Blush
    canvas.setPixel(10, 9, browColor);
    canvas.setPixel(13, 9, browColor);

    // Winged eyeliner
    canvas.setPixel(8, 10, hairRamp.shadow);
    canvas.setPixel(9, 10, lashColor);
    canvas.setPixel(10, 10, lashColor);
    canvas.setPixel(13, 10, lashColor);
    canvas.setPixel(14, 10, lashColor);
    canvas.setPixel(15, 10, hairRamp.shadow);

    // Left Eye: Dual specular catchlights
    canvas.setPixel(9, 11, "#ffffff"); // Main catchlight
    canvas.setPixel(10, 11, pupilColor);
    canvas.setPixel(9, 12, irisBase);
    canvas.setPixel(10, 12, irisGlow); // Secondary sparkle

    // Right Eye
    canvas.setPixel(13, 11, "#ffffff");
    canvas.setPixel(14, 11, pupilColor);
    canvas.setPixel(13, 12, irisGlow);
    canvas.setPixel(14, 12, irisBase);

    // Sclera
    canvas.setPixel(8, 11, "#f8fafc");
    canvas.setPixel(8, 12, "#e2e8f0");
    canvas.setPixel(15, 11, "#f8fafc");
    canvas.setPixel(15, 12, "#e2e8f0");

    // Lower lash accent
    canvas.setPixel(9, 13, shadeWithHueShift(palette.skin, -0.06, "skin"));
    canvas.setPixel(14, 13, shadeWithHueShift(palette.skin, -0.06, "skin"));

    // Cute pink blush lines
    canvas.setPixel(8, 13, "#fb7185");
    canvas.setPixel(15, 13, "#fb7185");

    // Tiny rose gloss mouth
    canvas.setPixel(11, 14, "#f43f5e");
    canvas.setPixel(12, 14, "#f43f5e");
    return;
  }

  if (construction === "soft-cute") {
    // 🐸 Soft Cute / Chibi / Pastel: Big Rounded Dual-Sparkle Eyes & Cat Mouth
    canvas.setPixel(9, 9, browColor);
    canvas.setPixel(14, 9, browColor);

    // Left big rounded eye
    canvas.setPixel(9, 10, lashColor);
    canvas.setPixel(10, 10, lashColor);
    canvas.setPixel(9, 11, "#ffffff");
    canvas.setPixel(10, 11, pupilColor);
    canvas.setPixel(9, 12, irisBase);
    canvas.setPixel(10, 12, "#ffffff"); // Sparkle

    // Right big rounded eye
    canvas.setPixel(13, 10, lashColor);
    canvas.setPixel(14, 10, lashColor);
    canvas.setPixel(13, 11, "#ffffff");
    canvas.setPixel(14, 11, pupilColor);
    canvas.setPixel(13, 12, "#ffffff");
    canvas.setPixel(14, 12, irisBase);

    // Sclera
    canvas.setPixel(8, 11, "#f8fafc");
    canvas.setPixel(15, 11, "#f8fafc");

    // Wide horizontal rosy blush
    canvas.line(8, 13, 2, "#f472b6");
    canvas.line(14, 13, 2, "#f472b6");

    // Cute cat-mouth center
    canvas.setPixel(11, 14, "#e11d48");
    return;
  }

  if (construction === "masculine-angular") {
    // ⚔️ Focused Masculine Angular: Thick Low-Set Brows & Compact Eyes
    canvas.line(8, 9, 4, deepBrowColor);
    canvas.line(12, 9, 4, deepBrowColor);

    // Heavy straight upper lash
    canvas.line(9, 10, 2, lashColor);
    canvas.line(13, 10, 2, lashColor);

    // Focused 2x1 eye aperture
    canvas.setPixel(9, 11, "#ffffff");
    canvas.setPixel(10, 11, irisBase);
    canvas.setPixel(13, 11, irisBase);
    canvas.setPixel(14, 11, "#ffffff");

    canvas.setPixel(8, 11, "#f8fafc");
    canvas.setPixel(15, 11, "#f8fafc");

    // Angular jaw/cheekbone shadow along outer columns
    canvas.setPixel(8, 13, skinRamp.shadow);
    canvas.setPixel(8, 14, skinRamp.shadow);
    canvas.setPixel(15, 13, skinRamp.shadow);
    canvas.setPixel(15, 14, skinRamp.shadow);

    // Defined nose bridge
    canvas.line(11, 12, 2, skinRamp.shadow, true);

    // Firm lip line
    canvas.line(11, 14, 2, shadeWithHueShift(palette.skin, -0.09, "skin"));
    return;
  }

  if (construction === "mature-minimal") {
    // ▪️ Minimalist Indie / Emo: Understated 1x2 Vertical Eyes
    canvas.setPixel(10, 10, browColor);
    canvas.setPixel(13, 10, browColor);
    canvas.setPixel(10, 11, pupilColor);
    canvas.setPixel(10, 12, irisBase);
    canvas.setPixel(13, 11, pupilColor);
    canvas.setPixel(13, 12, irisBase);

    // Jawline shadow
    canvas.line(9, 15, 6, skinRamp.shadow);
    return;
  }

  // ✨ Default: Clean Aesthetic (NameMC Standard 2x2 Catchlight Eyes)
  canvas.setPixel(9, 9, browColor);
  canvas.setPixel(10, 9, browColor);
  canvas.setPixel(13, 9, browColor);
  canvas.setPixel(14, 9, browColor);

  canvas.setPixel(9, 10, lashColor);
  canvas.setPixel(10, 10, lashColor);
  canvas.setPixel(13, 10, lashColor);
  canvas.setPixel(14, 10, lashColor);

  // Left Eye
  canvas.setPixel(9, 11, "#ffffff");
  canvas.setPixel(10, 11, pupilColor);
  canvas.setPixel(9, 12, irisBase);
  canvas.setPixel(10, 12, irisGlow);

  // Right Eye
  canvas.setPixel(13, 11, "#ffffff");
  canvas.setPixel(14, 11, pupilColor);
  canvas.setPixel(13, 12, irisGlow);
  canvas.setPixel(14, 12, irisBase);

  // Sclera whites
  canvas.setPixel(8, 11, "#f8fafc");
  canvas.setPixel(8, 12, "#e2e8f0");
  canvas.setPixel(15, 11, "#f8fafc");
  canvas.setPixel(15, 12, "#e2e8f0");

  // Subtle cheek contour
  if (!isDarkChar) {
    const blushTint = shadeWithHueShift(palette.skin, -0.05, "skin");
    canvas.setPixel(8, 13, blushTint);
    canvas.setPixel(15, 13, blushTint);
    // Subtle nose bridge
    canvas.setPixel(11, 13, shadeWithHueShift(palette.skin, -0.06, "skin"));
    canvas.setPixel(12, 13, shadeWithHueShift(palette.skin, -0.06, "skin"));
    // Clean natural lips
    canvas.setPixel(11, 14, shadeWithHueShift(palette.skin, -0.09, "skin"));
    canvas.setPixel(12, 14, shadeWithHueShift(palette.skin, -0.09, "skin"));
  }
}

function paintGarmentTorso(
  canvas: SkinCanvas,
  design: MinecraftSkinDesign,
  topRamp: ShadingRamp,
  accentRamp: ShadingRamp,
  random: () => number,
  isDarkChar: boolean,
  lowerPrompt: string
) {
  const garment = design.garmentType || "oversized-hoodie";
  const palette = design.palette;

  const faces = {
    top: { x: 20, y: 16, width: 8, height: 4 },
    bottom: { x: 28, y: 16, width: 8, height: 4 },
    right: { x: 16, y: 20, width: 4, height: 12 },
    front: { x: 20, y: 20, width: 8, height: 12 },
    left: { x: 28, y: 20, width: 4, height: 12 },
    back: { x: 32, y: 20, width: 8, height: 12 },
  };

  const ovFront = { x: 20, y: 36, width: 8, height: 12 };
  const ovBack = { x: 32, y: 36, width: 8, height: 12 };
  const ovRight = { x: 16, y: 36, width: 4, height: 12 };
  const ovLeft = { x: 28, y: 36, width: 4, height: 12 };

  // -------------------------------------------------------------
  // 1. BASE TORSO ANATOMY & FABRIC FOLDS (x: 20..27, y: 20..31)
  // -------------------------------------------------------------
  // Clean base plane fill
  Object.values(faces).forEach((face) => canvas.fill(face, palette.top, "balanced", random, { type: "fabric" }));

  // Inner Tee / Undershirt Reveal at collar (Row 20)
  const innerTeeColor = isDarkChar ? "#18181b" : "#f8fafc";
  canvas.setPixel(23, 20, innerTeeColor);
  canvas.setPixel(24, 20, innerTeeColor);
  canvas.setPixel(23, 21, shadeWithHueShift(innerTeeColor, -0.10, "fabric"));
  canvas.setPixel(24, 21, shadeWithHueShift(innerTeeColor, -0.10, "fabric"));

  // Clavicle & Shoulder Highlight Clusters (Rows 20..21)
  canvas.setPixel(21, 20, topRamp.light);
  canvas.setPixel(22, 20, topRamp.light);
  canvas.setPixel(25, 20, topRamp.light);
  canvas.setPixel(26, 20, topRamp.light);

  // Armhole Seam Creases (Columns 20 and 27, Rows 21..23)
  canvas.line(20, 21, 3, topRamp.shadow, true);
  canvas.line(27, 21, 3, topRamp.shadow, true);

  // Deep Underarm Shadow Clusters
  canvas.setPixel(20, 23, topRamp.deepShadow);
  canvas.setPixel(21, 23, topRamp.deepShadow);
  canvas.setPixel(26, 23, topRamp.deepShadow);
  canvas.setPixel(27, 23, topRamp.deepShadow);

  // Diagonal Tension Fabric Folds across Front Torso (Rows 23..26)
  // Left-to-center diagonal fold
  canvas.setPixel(21, 23, topRamp.light);
  canvas.setPixel(22, 24, topRamp.light);
  canvas.setPixel(23, 25, topRamp.light);
  canvas.setPixel(21, 24, topRamp.shadow);
  canvas.setPixel(22, 25, topRamp.shadow);
  canvas.setPixel(23, 26, topRamp.deepShadow);

  // Asymmetric right tension fold
  canvas.setPixel(26, 24, topRamp.light);
  canvas.setPixel(25, 25, topRamp.light);
  canvas.setPixel(26, 25, topRamp.shadow);
  canvas.setPixel(25, 26, topRamp.shadow);

  // Fabric Sag Shadow above waistband (Row 29)
  canvas.line(21, 29, 6, topRamp.shadow);

  // Base Ribbed Elastic Hem (Rows 30..31) - Alternating 1px rib texture
  canvas.line(20, 30, 8, topRamp.base);
  canvas.line(20, 31, 8, topRamp.deepShadow);
  canvas.setPixel(21, 30, topRamp.light);
  canvas.setPixel(23, 30, topRamp.light);
  canvas.setPixel(25, 30, topRamp.light);
  canvas.setPixel(27, 30, topRamp.light);

  // Back Torso Base Shading: Shoulder blades & center back seam
  canvas.setPixel(33, 22, topRamp.light);
  canvas.setPixel(34, 22, topRamp.light);
  canvas.setPixel(37, 22, topRamp.light);
  canvas.setPixel(38, 22, topRamp.light);
  canvas.line(35, 22, 6, topRamp.shadow, true); // Center spine crease
  canvas.line(32, 29, 8, topRamp.shadow); // Lower back sag fold

  // -------------------------------------------------------------
  // 2. 3D OUTER OVERLAY GARMENT SCULPTING
  // -------------------------------------------------------------
  canvas.fill(ovRight, topRamp.base, "balanced", random, { type: "fabric" });
  canvas.fill(ovLeft, topRamp.base, "balanced", random, { type: "fabric" });
  canvas.fill(ovBack, topRamp.base, "balanced", random, { type: "fabric" });
  canvas.fill(ovFront, topRamp.base, "balanced", random, { type: "fabric" });

  if (garment === "bomber-jacket") {
    // 🛩️ Streetwear MA-1 Bomber Jacket
    // Ribbed baseball collar
    canvas.line(21, 36, 6, topRamp.shadow);
    canvas.setPixel(23, 36, topRamp.deepShadow);
    canvas.setPixel(24, 36, topRamp.deepShadow);

    // Front zipper track down row 23
    canvas.line(23, 37, 10, "#94a3b8", true);
    canvas.setPixel(23, 37, "#ffffff"); // Metallic zipper slider tab

    // Puffed chest panels (subtle highlight clusters)
    canvas.setPixel(21, 39, topRamp.light);
    canvas.setPixel(22, 39, topRamp.light);
    canvas.setPixel(25, 39, topRamp.light);
    canvas.setPixel(26, 39, topRamp.light);

    // Angled welt side pockets with snap buttons
    canvas.line(21, 43, 2, topRamp.deepShadow);
    canvas.setPixel(21, 43, "#cbd5e1"); // Silver snap button
    canvas.line(25, 43, 2, topRamp.deepShadow);
    canvas.setPixel(26, 43, "#cbd5e1");

    // Elastic ribbed hem
    canvas.line(20, 46, 8, topRamp.shadow);
    canvas.line(20, 47, 8, topRamp.deepShadow);
  } else if (garment === "varsity-jacket") {
    // 🏈 Two-Tone Classic Varsity Jacket
    // Striped ribbed collar
    canvas.line(20, 36, 8, topRamp.highlight);
    canvas.setPixel(22, 36, palette.detail || "#f59e0b");
    canvas.setPixel(25, 36, palette.detail || "#f59e0b");

    // Center snap button placket
    canvas.line(23, 37, 10, topRamp.shadow, true);
    canvas.setPixel(23, 38, "#ffffff"); // Snap button 1
    canvas.setPixel(23, 41, "#ffffff"); // Snap button 2
    canvas.setPixel(23, 44, "#ffffff"); // Snap button 3

    // Chenille chest letter patch
    const patchColor = palette.detail || palette.topAccent || "#f59e0b";
    canvas.setPixel(21, 39, patchColor);
    canvas.setPixel(22, 39, patchColor);
    canvas.setPixel(21, 40, patchColor);

    // Striped ribbed hem
    canvas.line(20, 46, 8, topRamp.highlight);
    canvas.line(20, 47, 8, patchColor);
  } else if (garment === "oversized-sweater") {
    // 🧶 Cozy Chunky Knit Sweater
    // Ribbed crewneck
    canvas.line(22, 36, 4, topRamp.highlight);
    canvas.setPixel(23, 36, topRamp.shadow);
    canvas.setPixel(24, 36, topRamp.shadow);

    // Vertical Cable-Knit Braided Columns (Columns 21, 23, 25, 27)
    for (let y = 38; y <= 45; y += 2) {
      canvas.setPixel(21, y, topRamp.light);
      canvas.setPixel(21, y + 1, topRamp.shadow);
      canvas.setPixel(23, y + 1, topRamp.light);
      canvas.setPixel(23, y, topRamp.shadow);
      canvas.setPixel(25, y, topRamp.light);
      canvas.setPixel(25, y + 1, topRamp.shadow);
      canvas.setPixel(27, y + 1, topRamp.light);
      canvas.setPixel(27, y, topRamp.shadow);
    }

    // Ribbed hem
    canvas.line(20, 47, 8, topRamp.shadow);
  } else if (garment === "techwear") {
    // ⚡ Modular Urban Techwear Jacket
    // High tactical funnel collar
    canvas.line(20, 36, 8, topRamp.deepShadow);
    canvas.setPixel(23, 36, accentRamp.highlight);
    canvas.setPixel(24, 36, accentRamp.highlight);

    // Asymmetric utility chest webbing & magnetic FIDLOCK buckle
    canvas.line(21, 38, 6, "#18181b");
    canvas.setPixel(22, 39, "#d4d4d8"); // Metallic buckle
    canvas.setPixel(23, 39, accentRamp.highlight);
    canvas.line(21, 42, 4, topRamp.deepShadow);

    // Neon tech accent lines
    canvas.setPixel(21, 44, accentRamp.highlight);
    canvas.setPixel(26, 44, accentRamp.highlight);
  } else if (garment === "denim-jacket") {
    // 👖 Classic Pointed Collar Denim Jacket
    canvas.line(21, 36, 6, topRamp.highlight);
    // Pointed collar tips
    canvas.setPixel(22, 37, topRamp.light);
    canvas.setPixel(25, 37, topRamp.light);

    // Dual buttoned flap chest pockets with copper rivet buttons
    canvas.line(21, 39, 2, topRamp.light);
    canvas.setPixel(21, 40, "#d97706"); // Copper rivet
    canvas.line(25, 39, 2, topRamp.light);
    canvas.setPixel(26, 40, "#d97706");

    // Vertical seam lines
    canvas.line(22, 41, 6, topRamp.shadow, true);
    canvas.line(25, 41, 6, topRamp.shadow, true);
  } else {
    // 🛹 Default: Modern Streetwear Oversized Hoodie (NameMC Standard)
    // 1. 3D Resting Hood bunched across upper back
    if (design.hoodState !== "up") {
      canvas.line(33, 36, 6, topRamp.light);
      canvas.setPixel(32, 36, topRamp.base);
      canvas.setPixel(39, 36, topRamp.base);
      canvas.line(33, 37, 6, topRamp.highlight);
      canvas.setPixel(32, 38, topRamp.shadow);
      canvas.setPixel(39, 38, topRamp.shadow);
      canvas.line(33, 39, 6, topRamp.shadow);
      canvas.line(34, 40, 4, topRamp.deepShadow);
    }

    // 2. 3D Hood Collar framing the neck
    canvas.line(20, 36, 8, topRamp.highlight);
    canvas.setPixel(23, 36, topRamp.deepShadow);
    canvas.setPixel(24, 36, topRamp.deepShadow);

    // 3. Delicate 1px Drawstrings with Metallic Aglet Tips
    if (design.drawstrings !== "none" && !/no drawstrings?/i.test(lowerPrompt)) {
      const stringColor = palette.detail && palette.detail !== palette.top
        ? shadeWithHueShift(palette.detail, 0.12, "fabric")
        : "#e2e8f0";

      const leftLen = random() > 0.5 ? 4 : 3;
      const rightLen = leftLen === 4 ? 3 : 4; // Intentional artist asymmetry

      for (let i = 0; i < leftLen; i++) {
        canvas.setPixel(22, 38 + i, stringColor);
      }
      canvas.setPixel(22, 38 + leftLen, "#ffffff"); // Metallic aglet

      for (let i = 0; i < rightLen; i++) {
        canvas.setPixel(25, 38 + i, stringColor);
      }
      canvas.setPixel(25, 38 + rightLen, "#ffffff"); // Metallic aglet
    }

    // 4. 3D Kangaroo Pouch with Angled Entry Openings
    canvas.line(21, 42, 6, topRamp.light); // Top pocket rim
    canvas.fill({ x: 21, y: 43, width: 6, height: 2 }, topRamp.base, "balanced", random, { type: "fabric" });
    canvas.setPixel(20, 43, topRamp.deepShadow); // Left side entry
    canvas.setPixel(20, 44, topRamp.deepShadow);
    canvas.setPixel(27, 43, topRamp.deepShadow); // Right side entry
    canvas.setPixel(27, 44, topRamp.deepShadow);
    canvas.line(21, 45, 6, topRamp.shadow); // Bottom pocket seam

    // 5. 3D Ribbed Bottom Hem
    canvas.line(20, 46, 8, topRamp.base);
    canvas.line(20, 47, 8, topRamp.deepShadow);
    canvas.setPixel(21, 46, topRamp.light);
    canvas.setPixel(23, 46, topRamp.light);
    canvas.setPixel(25, 46, topRamp.light);
    canvas.setPixel(27, 46, topRamp.light);
  }
}

function paintFootwearLeg(
  canvas: SkinCanvas,
  side: "right" | "left",
  design: MinecraftSkinDesign,
  style: MinecraftSkinStyle = "balanced",
  lowerPrompt: string,
  random: () => number
) {
  const palette = design.palette;
  const isRight = side === "right";
  const footwear = design.footwearStyle || "high-top-sneaker";

  const pantsRamp = getHueShiftRamp(palette.pants, "fabric");
  const shoesRamp = getHueShiftRamp(palette.shoes, "fabric");

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

  const ovFront = isRight ? { x: 4, y: 36, width: 4, height: 12 } : { x: 4, y: 52, width: 4, height: 12 };
  const ovSide = isRight ? { x: 0, y: 36, width: 4, height: 12 } : { x: 8, y: 52, width: 4, height: 12 };

  // -------------------------------------------------------------
  // 1. BASE PANTS ANATOMY & KNEE FOLDS
  // -------------------------------------------------------------
  Object.values(faces).forEach((face) => canvas.fill(face, palette.pants, "balanced", random, { type: "fabric" }));

  // Waistband at Row 0 (faces.front.y)
  canvas.line(faces.front.x, faces.front.y, 4, pantsRamp.shadow);
  canvas.setPixel(faces.front.x + (isRight ? 3 : 0), faces.front.y, pantsRamp.deepShadow); // Fly seam

  // Diagonal Hip Tension Crease (Rows 1..2)
  canvas.setPixel(faces.front.x + (isRight ? 0 : 3), faces.front.y + 1, pantsRamp.shadow);
  canvas.setPixel(faces.front.x + (isRight ? 1 : 2), faces.front.y + 2, pantsRamp.shadow);

  // Articulated Knee Tension Fold Cluster (Rows 5..6)
  canvas.line(faces.front.x + 1, faces.front.y + 5, 2, pantsRamp.light);
  canvas.line(faces.front.x, faces.front.y + 6, 4, pantsRamp.shadow);
  canvas.setPixel(faces.front.x + (isRight ? 1 : 2), faces.front.y + 6, pantsRamp.deepShadow);

  // Pant Cuff Break Crease (Row 7)
  [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
    canvas.line(face.x, face.y + 7, face.width, pantsRamp.shadow);
  });

  // -------------------------------------------------------------
  // 2. FOOTWEAR COMPONENT (Rows 8..11)
  // -------------------------------------------------------------
  if (footwear === "combat-boots") {
    // 🥾 Rugged Combat Boots
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      canvas.fill({ x: face.x, y: face.y + 7, width: face.width, height: 4 }, shoesRamp.base, "balanced", random);
      // Goodyear yellow welt stitch line
      canvas.line(face.x, face.y + 10, face.width, "#eab308");
      // Heavy lugged outsole
      canvas.line(face.x, face.y + 11, face.width, "#09090b");
    });
    // Front eyelet lacing
    canvas.setPixel(faces.front.x + 1, faces.front.y + 8, "#d4d4d8");
    canvas.setPixel(faces.front.x + 2, faces.front.y + 8, "#d4d4d8");
    canvas.setPixel(faces.front.x + 1, faces.front.y + 9, "#d4d4d8");
    canvas.setPixel(faces.front.x + 2, faces.front.y + 9, "#d4d4d8");
  } else if (footwear === "chelsea-boots") {
    // 👞 Sleek Leather Chelsea Boots
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      canvas.fill({ x: face.x, y: face.y + 7, width: face.width, height: 4 }, shoesRamp.base, "balanced", random);
      canvas.line(face.x, face.y + 11, face.width, "#271c19"); // Stacked wood heel
    });
    // Elastic side gore gusset on sides
    canvas.fill({ x: faces.right.x + 1, y: faces.right.y + 7, width: 2, height: 3 }, shoesRamp.deepShadow);
    canvas.fill({ x: faces.left.x + 1, y: faces.left.y + 7, width: 2, height: 3 }, shoesRamp.deepShadow);
  } else if (footwear === "chunky-sneaker") {
    // 👟 Chunky Sculpted Dad Sneakers
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      canvas.line(face.x, face.y + 8, face.width, shoesRamp.highlight);
      canvas.line(face.x, face.y + 9, face.width, shoesRamp.base);
      canvas.line(face.x, face.y + 10, face.width, "#f1f5f9"); // Chunky upper midsole
      canvas.line(face.x, face.y + 11, face.width, "#cbd5e1"); // Lower sculpted sole
    });
    // 3D chunky heel flare on overlay
    canvas.line(ovSide.x, ovSide.y + 10, 4, "#f1f5f9");
    canvas.line(ovSide.x, ovSide.y + 11, 4, "#cbd5e1");
  } else if (footwear === "low-sneaker") {
    // 🛹 Low-Profile Skate Sneakers / Cupsole
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      // Row 8 shows white ankle sock
      canvas.line(face.x, face.y + 8, face.width, "#f8fafc");
      // Shoe body
      canvas.line(face.x, face.y + 9, face.width, shoesRamp.base);
      canvas.line(face.x, face.y + 10, face.width, shoesRamp.shadow);
      // Crisp white rubber cupsole
      canvas.line(face.x, face.y + 11, face.width, "#ffffff");
      canvas.setPixel(face.x, face.y + 11, "#e2e8f0");
      canvas.setPixel(face.x + face.width - 1, face.y + 11, "#e2e8f0");
    });
  } else {
    // 👟 Default: Modern High-Top Sneakers (Jordan 1 / Dunk Style)
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      // Row 8: Padded sneaker collar in shoe highlight
      canvas.line(face.x, face.y + 8, face.width, shoesRamp.highlight);
      // Row 9: Shoe body with white lace knot
      canvas.line(face.x, face.y + 9, face.width, shoesRamp.base);
      canvas.setPixel(face.x + 1, face.y + 9, "#f8fafc");
      canvas.setPixel(face.x + 2, face.y + 9, "#f8fafc");
      // Row 10: Contrast toe box cap & accent side panel
      canvas.line(face.x, face.y + 10, face.width, shoesRamp.shadow);
      // Row 11: BRIGHT PURE WHITE FOAM MIDSOLE
      canvas.line(face.x, face.y + 11, face.width, "#ffffff");
      canvas.setPixel(face.x, face.y + 11, "#e2e8f0"); // Subtle corner bevel
      canvas.setPixel(face.x + face.width - 1, face.y + 11, "#e2e8f0");
    });
  }

  // Dark High-Traction Outsole Tread on bottom face
  canvas.fill(faces.bottom, "#09090b", "minimal", random);

  // 3D Cargo Pocket & Rolled Hem Overlays
  canvas.fill({ x: ovSide.x + 1, y: ovSide.y + 3, width: 2, height: 3 }, pantsRamp.deepShadow, "minimal", random);
  canvas.setPixel(ovSide.x + 1, ovSide.y + 3, pantsRamp.highlight);
  canvas.setPixel(ovSide.x + 2, ovSide.y + 3, pantsRamp.highlight);

  // 3D Rolled Hem at row 7
  canvas.line(ovFront.x, ovFront.y + 7, 4, pantsRamp.light);
  canvas.line(ovSide.x, ovSide.y + 7, 4, pantsRamp.light);

  // 3D Sneaker Collar & Tongue (Rows 8..9 - leaves row 11 white midsole unobstructed!)
  if (footwear === "high-top-sneaker" || footwear === "chunky-sneaker") {
    canvas.fill({ x: ovFront.x, y: ovFront.y + 8, width: 4, height: 2 }, shoesRamp.base, "minimal", random);
    canvas.setPixel(ovFront.x + 1, ovFront.y + 8, shoesRamp.highlight);
    canvas.setPixel(ovFront.x + 2, ovFront.y + 8, shoesRamp.highlight);
    canvas.fill({ x: ovSide.x + 1, y: ovSide.y + 8, width: 2, height: 2 }, shoesRamp.base, "minimal", random);
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
  const isMilitary = ((design.outfit === "armor" && /camo|military|army|soldier/i.test(lower)) || /\b(military|soldier|airforce|army|camo|tactical fatigues|swat|commando|navy seal|sniper|veteran|usaf)\b|\bcombat\b(?!\s*boots?)/i.test(lower)) && !/streetwear|hoodie|bomber/i.test(lower);
  const isKnight = /knight|crusader|paladin|templar|armor|plate|warrior|samurai|viking/i.test(lower);
  const isNinja = /ninja|shinobi|assassin|rogue|stealth|shadow/i.test(lower);

  const baseFaces: Record<string, Face> = {
    top: { x: 8, y: 0, width: 8, height: 8 },
    bottom: { x: 16, y: 0, width: 8, height: 8 },
    right: { x: 0, y: 8, width: 8, height: 8 },
    front: { x: 8, y: 8, width: 8, height: 8 },
    left: { x: 16, y: 8, width: 8, height: 8 },
    back: { x: 24, y: 8, width: 8, height: 8 },
  };

  // 1. Base Head Skin & Neck with authentic warm skin hue ramp
  Object.values(baseFaces).forEach((face) => canvas.fill(face, palette.skin, "balanced", random, { type: "skin" }));
  // Natural neck contact shadow on head bottom
  canvas.fill(baseFaces.bottom, shade(palette.skin, -0.12, "skin"), "balanced", random, { type: "skin" });

  // STRICT HOOD-UP DETECTION: A bare "hoodie" is clothing for the torso, NOT a head covering cowl!
  const isExplicitHoodUp = (
    design.hoodState === "up" ||
    (design.hairStyle === "hood" && !/\b(curtain|bangs|hair)\b/i.test(lower)) ||
    /\b(hood up|wearing hood|cowl|hooded cloak)\b/i.test(lower)
  ) && !/\b(hood down|hair showing|curtain bangs)\b/i.test(lower);

  if (isMilitary && (/helmet|tactical|swat|commando|soldier/i.test(lower) || design.hairStyle === "helmet")) {
    const helmRamp = getHueShiftRamp(palette.top, "metal");
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, helmRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, helmRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, helmRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, helmRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 40, y: 8, width: 8, height: 2 }, helmRamp.base, "pixel-detailed", random);
    canvas.setPixel(43, 8, "#18181b");
    canvas.setPixel(44, 8, "#18181b");
    canvas.setPixel(43, 9, "#3f3f46");
    canvas.setPixel(44, 9, "#3f3f46");
    canvas.line(40, 9, 8, helmRamp.light);
  } else if (isKnight && /greathelm|closed helmet|full helm/i.test(lower)) {
    const steelRamp = getHueShiftRamp(palette.topAccent || "#94a3b8", "metal");
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 40, y: 8, width: 8, height: 2 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 40, y: 10, width: 1, height: 4 }, steelRamp.base, "pixel-detailed", random);
    canvas.fill({ x: 47, y: 10, width: 1, height: 4 }, steelRamp.base, "pixel-detailed", random);
    canvas.line(40, 8, 8, palette.detail || "#f59e0b");
  } else if (isExplicitHoodUp) {
    canvas.fill({ x: 40, y: 0, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 32, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 48, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.fill({ x: 56, y: 8, width: 8, height: 8 }, topRamp.base, "minimal", random);
    canvas.line(40, 8, 8, topRamp.light);
  } else if (design.hairStyle !== "bald") {
    // 2. Pro Artist Hair Sculpting & Dimensional Bangs
    paintHairSilhouette(canvas, design, hairRamp, skinRamp, random, isDarkChar, lower);
  }

  // 3. Pro Artist Face Construction
  paintFaceConstruction(canvas, design, skinRamp, hairRamp, eyesRamp, random, isDarkChar, lower);

  // 3D Tactical Face Mask / Ninja Mask
  const hasMask = /mask|face cover|ninja|facemask|balaclava/i.test(lower) || design.faceStyle === "mask";
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

  // 3D Pilot Aviators / Sunglasses
  const hasAviators = isMilitary || /aviator|pilot|sunglasses|shades/i.test(lower) || design.glasses;
  if (hasAviators && !isKnight) {
    const goldFrame = "#d4af37";
    const darkLens = "#1e293b";
    canvas.setPixel(41, 10, goldFrame);
    canvas.setPixel(42, 10, goldFrame);
    canvas.setPixel(41, 11, darkLens);
    canvas.setPixel(42, 11, darkLens);
    canvas.setPixel(41, 12, goldFrame);
    canvas.setPixel(42, 12, darkLens);
    canvas.setPixel(41, 11, "#ffffff");
    canvas.setPixel(45, 10, goldFrame);
    canvas.setPixel(46, 10, goldFrame);
    canvas.setPixel(45, 11, darkLens);
    canvas.setPixel(46, 11, darkLens);
    canvas.setPixel(45, 12, darkLens);
    canvas.setPixel(46, 12, goldFrame);
    canvas.setPixel(45, 11, "#ffffff");
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

  const faces = {
    top: { x: 20, y: 16, width: 8, height: 4 },
    bottom: { x: 28, y: 16, width: 8, height: 4 },
    right: { x: 16, y: 20, width: 4, height: 12 },
    front: { x: 20, y: 20, width: 8, height: 12 },
    left: { x: 28, y: 20, width: 4, height: 12 },
    back: { x: 32, y: 20, width: 8, height: 12 },
  };

  const isDarkChar = /demon|shadow|monster|obsidian|fiend|reaper|robot|android|cyber/i.test(lower);
  const isDedicatedGarment = [
    "oversized-hoodie", "bomber-jacket", "varsity-jacket", "oversized-sweater",
    "streetwear-shirt", "layered-shirt-jacket", "techwear", "denim-jacket"
  ].includes(design.garmentType || "");
  const isMilitary = ((design.outfit === "armor" && /camo|military|army|soldier/i.test(lower)) || /\b(military|soldier|airforce|army|camo|tactical fatigues|swat|commando|navy seal|sniper|veteran|usaf)\b|\bcombat\b(?!\s*boots?)/i.test(lower)) && !/streetwear|hoodie|bomber|jacket/i.test(lower);
  const isArmor = design.garmentType === "plate-armor" || (!isDedicatedGarment && (/knight|paladin|plate armor|chestplate|chainmail|samurai/i.test(lower) || (design.outfit === "armor" && !/streetwear|hoodie|jacket|sweater|shirt/i.test(lower))));
  const isCyber = !isDedicatedGarment && (/cyber|hacker|futuristic|tech|robot|neon|mecha/i.test(lower) || design.outfit === "cyber");
  const isFormal = !isDedicatedGarment && (/gentleman|suit|tuxedo|formal|victorian|waistcoat|vest|tie|cravat|blazer/i.test(lower) || design.outfit === "formal");

  const ovFront = { x: 20, y: 36, width: 8, height: 12 };
  const ovBack = { x: 32, y: 36, width: 8, height: 12 };
  const ovRight = { x: 16, y: 36, width: 4, height: 12 };
  const ovLeft = { x: 28, y: 36, width: 4, height: 12 };

  if (isMilitary) {
    Object.values(faces).forEach((face) => drawCamouflage(canvas, face, palette.top, palette.topAccent));
    canvas.fill({ x: 23, y: 20, width: 2, height: 3 }, "#18181b", "minimal", random);
    canvas.line(23, 20, 3, "#d4af37", true);

    const vestRamp = getHueShiftRamp(palette.topAccent || "#1b241a", "fabric");
    canvas.fill(ovRight, vestRamp.base, "pixel-detailed", random);
    canvas.fill(ovLeft, vestRamp.base, "pixel-detailed", random);
    canvas.fill(ovBack, vestRamp.base, "pixel-detailed", random);
    canvas.fill(ovFront, vestRamp.base, "pixel-detailed", random);

    canvas.fill({ x: 21, y: 41, width: 6, height: 3 }, vestRamp.deepShadow, "minimal", random);
    canvas.setPixel(22, 41, vestRamp.highlight);
    canvas.setPixel(24, 41, vestRamp.highlight);
    canvas.setPixel(25, 41, vestRamp.highlight);

    canvas.setPixel(ovFront.x + 1, ovFront.y + 1, "#18181b");
    canvas.setPixel(ovFront.x + 1, ovFront.y + 2, "#3f3f46");
    canvas.setPixel(ovFront.x + 1, ovFront.y, accentRamp.highlight);

    canvas.setPixel(25, 38, "#ef4444");
    canvas.setPixel(26, 38, "#3b82f6");
    canvas.setPixel(25, 39, "#ffffff");
    canvas.setPixel(26, 39, "#d4af37");

    canvas.line(20, 47, 8, "#18181b");
    canvas.setPixel(23, 47, "#d4af37");
    canvas.setPixel(24, 47, "#d4af37");
  } else if (isArmor) {
    // ⚔️ MASTER MEDIEVAL & KNIGHT PLATE ARMOR
    Object.values(faces).forEach((face) => canvas.fill(face, "#334155", "pixel-detailed", random));
    const metalRamp = getHueShiftRamp(palette.topAccent || "#94a3b8", "metal");
    canvas.fill(ovRight, metalRamp.base, "pixel-detailed", random);
    canvas.fill(ovLeft, metalRamp.base, "pixel-detailed", random);
    canvas.fill(ovBack, metalRamp.base, "pixel-detailed", random);
    canvas.fill(ovFront, metalRamp.base, "pixel-detailed", random);

    canvas.line(21, 37, 6, metalRamp.highlight);
    canvas.line(20, 36, 12, metalRamp.shadow, true);
    canvas.line(27, 36, 12, metalRamp.shadow, true);

    const crestColor = palette.detail || palette.topAccent || "#f59e0b";
    const hasCross = /cross|crusader|templar|paladin|holy/i.test(lower);
    const hasDragon = /dragon|beast|monster|demon|fire/i.test(lower);

    if (hasCross) {
      canvas.line(23, 39, 4, crestColor, true);
      canvas.line(22, 40, 4, crestColor);
    } else if (hasDragon) {
      canvas.setPixel(23, 39, crestColor);
      canvas.setPixel(24, 39, crestColor);
      canvas.setPixel(22, 40, crestColor);
      canvas.setPixel(25, 40, crestColor);
      canvas.setPixel(23, 41, accentRamp.highlight);
      canvas.setPixel(24, 41, accentRamp.highlight);
    } else {
      canvas.line(23, 38, 5, metalRamp.highlight, true);
      canvas.setPixel(22, 39, metalRamp.light);
      canvas.setPixel(25, 39, metalRamp.light);
      canvas.setPixel(21, 41, metalRamp.light);
      canvas.setPixel(26, 41, metalRamp.light);
    }

    canvas.line(20, 46, 8, "#1e293b");
    canvas.setPixel(23, 46, crestColor);
    canvas.setPixel(24, 46, crestColor);
  } else if (isDedicatedGarment) {
    paintGarmentTorso(canvas, design, topRamp, accentRamp, random, isDarkChar, lower);
  } else if (isCyber) {
    // ⚡ MASTER CYBERPUNK & MECHA EXOSKELETON
    Object.values(faces).forEach((face) => canvas.fill(face, "#090d16", "pixel-detailed", random));
    canvas.fill(ovRight, topRamp.base, "minimal", random);
    canvas.fill(ovLeft, topRamp.base, "minimal", random);
    canvas.fill(ovBack, topRamp.base, "minimal", random);
    canvas.fill(ovFront, topRamp.base, "minimal", random);

    canvas.setPixel(23, 39, "#ffffff");
    canvas.setPixel(24, 39, "#ffffff");
    canvas.setPixel(23, 40, accentRamp.highlight);
    canvas.setPixel(24, 40, accentRamp.highlight);
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
    // 🛹 Pro Artist Garment Torso Sub-Renderer (Hoodie, Bomber, Varsity, Sweater, Techwear, Denim)
    paintGarmentTorso(canvas, design, topRamp, accentRamp, random, isDarkChar, lower);
  }

  // Chest Emblem when present
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
  const isMilitary = ((design.outfit === "armor" && /camo|military|army|soldier/i.test(lower)) || /\b(military|soldier|airforce|army|camo|tactical fatigues|swat|commando|navy seal|sniper|veteran|usaf)\b|\bcombat\b(?!\s*boots?)/i.test(lower)) && !/streetwear|hoodie|bomber/i.test(lower);
  const isArmor = /armor|knight|warrior|paladin|plate|samurai/i.test(lower) || design.outfit === "armor" || design.garmentType === "plate-armor";
  const isCyber = /cyber|hacker|futuristic|tech|robot|neon|mecha/i.test(lower);
  const garment = design.garmentType || "oversized-hoodie";

  // Base Arm Fill
  if (isMilitary) {
    faceList.forEach((face) => drawCamouflage(canvas, face, palette.top, palette.topAccent));
  } else if (garment === "varsity-jacket") {
    // Varsity leather sleeves (contrasting color)
    faceList.forEach((face) => canvas.fill(face, palette.topAccent || "#f8fafc", "balanced", random, { type: "fabric" }));
  } else {
    faceList.forEach((face) => canvas.fill(face, palette.top, "balanced", random, { type: "fabric" }));
  }

  const isOversized = design.fit === "oversized" || /oversized|baggy/i.test(lower);
  const sleeveRows = isMilitary ? 9 : design.sleeves === "short" ? 4 : isOversized ? 10 : design.sleeves === "long" ? 9 : 11;
  bodyFaces.forEach((face) => {
    if (sleeveRows < 12) {
      const skinStart = face.y + sleeveRows;
      canvas.fill({ x: face.x, y: skinStart, width: face.width, height: 12 - sleeveRows }, palette.skin, "balanced", random, { type: "skin" });
    }
  });

  // Modern Bare Hands or Tactical Gloves with Knuckle Shading
  bodyFaces.forEach((face) => {
    if (isMilitary) {
      canvas.line(face.x, face.y + 11, face.width, "#18181b");
    } else if (isArmor) {
      canvas.line(face.x, face.y + 11, face.width, "#334155");
    } else if (design.gloves) {
      canvas.line(face.x, face.y + 11, face.width, "#18181b");
    } else {
      // Natural bare skin hand with warm knuckle contrast
      const handShade = shadeWithHueShift(palette.skin, -0.07, "skin");
      canvas.setPixel(face.x + 1, face.y + 11, handShade);
      if (face.width >= 4) {
        canvas.setPixel(face.x + 2, face.y + 11, handShade);
      }
    }
  });

  // 3D Sleeve Overlays with Folded Cuff Depth
  const ovFaces = armFaces(model, side, true);
  const sleeveColor = garment === "varsity-jacket" ? (palette.topAccent || "#f8fafc") : topRamp.base;
  const sleeveHighlight = garment === "varsity-jacket" ? shadeWithHueShift(sleeveColor, 0.1, "fabric") : topRamp.light;

  [ovFaces.right, ovFaces.front, ovFaces.left, ovFaces.back].forEach((face) => {
    canvas.fill({ x: face.x, y: face.y, width: face.width, height: sleeveRows }, sleeveColor, "balanced", random, { type: "fabric" });
    canvas.line(face.x, face.y + sleeveRows - 1, face.width, sleeveHighlight); // 3D Cuff fold highlight
    // Subtle elbow crease shadow at row 5
    if (sleeveRows >= 8) {
      canvas.setPixel(face.x + 1, face.y + 5, topRamp.shadow);
    }
  });

  // Garment-Specific Arm Details
  if (garment === "bomber-jacket" && side === "left") {
    // 🛩️ MA-1 Utility Zip Pocket on Left Upper Arm with Bright Red Flight Tag Pull!
    canvas.fill({ x: ovFaces.left.x + 1, y: ovFaces.left.y + 3, width: 2, height: 3 }, topRamp.deepShadow);
    canvas.setPixel(ovFaces.left.x + 1, ovFaces.left.y + 3, "#94a3b8"); // Silver zipper tab
    canvas.setPixel(ovFaces.left.x + 2, ovFaces.left.y + 5, "#ef4444"); // Red flight tag ribbon!
    canvas.setPixel(ovFaces.left.x + 2, ovFaces.left.y + 6, "#ef4444");
  } else if (garment === "varsity-jacket") {
    // Striped ribbed wrist cuffs
    [ovFaces.right, ovFaces.front, ovFaces.left, ovFaces.back].forEach((face) => {
      canvas.line(face.x, face.y + sleeveRows - 1, face.width, palette.detail || "#f59e0b");
    });
  }

  if (isMilitary) {
    if (side === "right") {
      canvas.setPixel(ovFaces.right.x + 1, ovFaces.right.y + 2, "#d4af37");
      canvas.setPixel(ovFaces.right.x + 2, ovFaces.right.y + 2, "#3b82f6");
    }
  } else if (isArmor) {
    canvas.fill({ x: ovFaces.top.x, y: ovFaces.top.y, width: ovFaces.top.width, height: 4 }, palette.topAccent || "#94a3b8", "pixel-detailed", random);
    canvas.line(ovFaces.front.x, ovFaces.front.y, ovFaces.front.width, "#f59e0b");
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

  const isMilitary = ((design.outfit === "armor" && /camo|military|army|soldier/i.test(lower)) || /\b(military|soldier|airforce|army|camo|tactical fatigues|swat|commando|navy seal|sniper|veteran|usaf)\b|\bcombat\b(?!\s*boots?)/i.test(lower)) && !/streetwear|hoodie|bomber/i.test(lower);
  const isArmor = /armor|knight|warrior|paladin|plate|samurai/i.test(lower) || design.outfit === "armor" || design.garmentType === "plate-armor";

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

  const ovFront = isRight ? { x: 4, y: 36, width: 4, height: 12 } : { x: 4, y: 52, width: 4, height: 12 };

  if (isMilitary) {
    Object.values(faces).forEach((face) => drawCamouflage(canvas, face, palette.pants, palette.topAccent));
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      canvas.fill({ x: face.x, y: face.y + 8, width: face.width, height: 4 }, "#18181b", "pixel-detailed", random);
      canvas.setPixel(face.x + 1, face.y + 9, "#71717a");
      canvas.setPixel(face.x + 2, face.y + 9, "#71717a");
      canvas.line(face.x, face.y + 11, face.width, "#09090b");
    });
    canvas.fill(faces.bottom, "#09090b", "minimal", random);
    canvas.fill({ x: ovFront.x, y: ovFront.y + 4, width: 4, height: 3 }, "#18181b", "minimal", random);
    canvas.line(ovFront.x + 1, ovFront.y + 5, 2, "#3f3f46");
    if (isRight) {
      canvas.fill({ x: ovFront.x + 2, y: ovFront.y + 1, width: 2, height: 3 }, "#09090b", "minimal", random);
      canvas.setPixel(ovFront.x + 2, ovFront.y + 1, "#d4af37");
    }
  } else if (isArmor) {
    Object.values(faces).forEach((face) => canvas.fill(face, palette.pants || "#334155", style, random, { type: "metal" }));
    const steelRamp = getHueShiftRamp(palette.topAccent || "#94a3b8", "metal");
    [faces.right, faces.front, faces.left, faces.back].forEach((face) => {
      canvas.fill({ x: face.x, y: face.y + 7, width: face.width, height: 5 }, steelRamp.base, "pixel-detailed", random);
      canvas.line(face.x, face.y + 7, face.width, "#f59e0b");
      canvas.line(face.x, face.y + 11, face.width, steelRamp.deepShadow);
    });
    canvas.fill(faces.bottom, "#09090b", "minimal", random);
    canvas.fill({ x: ovFront.x, y: ovFront.y + 8, width: 4, height: 4 }, steelRamp.base, "pixel-detailed", random);
    canvas.line(ovFront.x, ovFront.y + 8, 4, "#f59e0b");
  } else {
    // 👟 Pro Artist Footwear & Pants Sub-Renderer (High-Tops, Low-Sneakers, Chunky, Boots, Chelsea)
    paintFootwearLeg(canvas, side, design, style, lower, random);
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

  // Apply contact shadows and under-overlay drop shadows
  applySeamAmbientOcclusion(canvas);
  canvas.bakeLayerDropShadows();

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

  // 1. Bake contact seam ambient occlusion (under chin, neck, groin, joints)
  applySeamAmbientOcclusion(canvas);

  // 2. Bake 3D under-overlay contact shadows & 1px drop shadows onto base layer
  canvas.bakeLayerDropShadows();

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
