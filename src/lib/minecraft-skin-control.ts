import type { MinecraftSkinDesign, MinecraftSkinPart, MinecraftSkinStyle } from "./minecraft-skin";

export const MINECRAFT_SKIN_JSON_SCHEMA = {
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
      enum: ["open", "zipper", "closed"],
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
      description: "Middle garment layer worn under the outer jacket (e.g., 'hoodie', 'sweater', 'flannel', 'none')",
    },
    innerGarment: {
      type: "string",
      description: "Innermost base garment visible at collar/chest (e.g., 'white undershirt', 't-shirt', 'tank-top', 'none')",
    },
    zipper: { type: "boolean" },
    drawstrings: { type: "boolean" },
    emblem: { type: "string" },
    sleeves: {
      type: "string",
      enum: ["short", "long", "armored"],
    },
    sleeveStyle: {
      type: "string",
      enum: ["ribbed-cuff", "loose", "rolled", "armored", "straight"],
    },
    gloves: { type: "boolean" },
    outfit: {
      type: "string",
      enum: [
        "casual",
        "streetwear",
        "armor",
        "royal",
        "cyber",
        "fantasy",
        "formal",
        "sport",
      ],
    },
    pattern: {
      type: "string",
      enum: [
        "clean",
        "striped",
        "paneled",
        "armored",
        "mystic",
        "lightning",
        "circuit",
      ],
    },
    materialProfile: {
      type: "string",
      enum: [
        "cotton",
        "denim",
        "leather",
        "metal",
        "wool",
        "technical-fabric",
        "skin",
        "hair",
      ],
    },
    pantsType: {
      type: "string",
      enum: [
        "relaxed-cargo",
        "baggy-jeans",
        "ripped-denim",
        "techwear-joggers",
        "armored-greaves",
        "tailored-trousers",
        "shorts",
        "skirt",
      ],
    },
    cargoPockets: { type: "boolean" },
    footwear: {
      type: "string",
      enum: ["shoes", "boots", "armored"],
    },
    footwearStyle: {
      type: "string",
      enum: [
        "chunky-sneakers",
        "high-top-skate",
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

export const LEGACY_STYLE_MAP: Record<string, MinecraftSkinStyle> = {
  balanced: "balanced",
  detailed: "pixel-detailed",
  anime: "balanced",
  "pixel-artist": "pixel-detailed",
  minimal: "minimal",
  "pixel-detailed": "pixel-detailed",
  "high-contrast": "high-contrast",
};

export function buildDesignInstruction(
  prompt: string,
  style: string,
  targetPart: MinecraftSkinPart,
  referenceMode: "inspire" | "guided" | "rebuild"
): string {
  const wantsExactRef = /\b(exact|same|this|inspiration|reference|image|picture|like this|copy)\b/i.test(prompt);
  const referencePriority = (referenceMode === "guided" || wantsExactRef)
    ? [
        "CRITICAL REFERENCE GUIDANCE:",
        "- Treat the reference image as the primary character identity anchor.",
        "- STRICT PROMPT PRECEDENCE: If the written prompt explicitly modifies, adds, removes, or overrides ANY attribute from the reference image (e.g. 'make the jacket white' when reference is black, 'give them blue hair', 'remove hat'), THE WRITTEN USER PROMPT TAKES ABSOLUTE PRECEDENCE over the reference image for those specific attributes.",
        "- For any attributes not mentioned in the prompt, faithfully replicate the reference image's traits, silhouette, and palette.",
      ].join("\n")
    : "Treat the written prompt as primary. Use the reference for useful color, silhouette, and material cues.";
  return [
    `Create a coherent Minecraft skin design specification for: "${prompt}".`,
    `Visual style treatment: ${style}.`,
    referencePriority,
    targetPart === "all"
      ? "Design the complete character."
      : `Refresh the ${targetPart} while keeping it compatible with the original character.`,
  ].join("\n");
}

/**
 * Deterministic reconciliation for remix operations.
 * Enforces field-level preservation so unmentioned attributes (skin tone, eye color,
 * face construction, unmentioned clothing, accessories) strictly remain clamped to parent.
 */
export function mergeRemixDesign(
  parent: Partial<MinecraftSkinDesign>,
  remixResult: Partial<MinecraftSkinDesign>,
  remixInstruction: string
): Partial<MinecraftSkinDesign> {
  const instructionLower = remixInstruction.toLowerCase();

  // Strip "facial hair" / "facial-hair" before checking for head-hair keywords so facial hair is NEVER treated as head hair
  const headHairInstruction = instructionLower.replace(/\bfacial[- ]hair\b/gi, "");
  const mentionsHair = /\b(hair|bangs|fringe|ponytail|buns|cut|bald|blonde|brunette|locks|silver hair|black hair|brown hair|red hair)\b/i.test(headHairInstruction);

  // Dedicated facial-hair detection matching removal, clean-shaven, and specific styles
  const mentionsFacialHair = /\b(facial[- ]hair|beard|stubble|goatee|mustache|moustache|clean[- ]shaven|shaved?)\b/i.test(instructionLower);
  const mentionsEyes = /\b(eye|eyes|eyebrow|brows?|pupil)\b/i.test(instructionLower);
  const mentionsMouth = /\b(mouth|lips?|smile|frown|smirk)\b/i.test(instructionLower);
  const mentionsFaceGeneral = /\b(face|expression|mask|visor)\b/i.test(instructionLower);

  const mentionsTop = /\b(hoodie|jacket|shirt|bomber|sweater|tunic|robe|top|undershirt|vest|sleeves|zipper)\b/i.test(instructionLower);
  const mentionsPants = /\b(pants|jeans|cargo|shorts|skirt|trousers|pockets)\b/i.test(instructionLower);
  const mentionsFootwear = /\b(shoes|boots|sneakers|high-tops|footwear|socks)\b/i.test(instructionLower);
  const mentionsHeadphones = /\bheadphones?\b/i.test(instructionLower);
  const mentionsGlasses = /\bglasses|sunglasses\b/i.test(instructionLower);
  const mentionsHorns = /\bhorns?\b/i.test(instructionLower);
  const mentionsCrown = /\bcrown\b/i.test(instructionLower);
  const mentionsHalo = /\bhalo\b/i.test(instructionLower);

  const merged: Partial<MinecraftSkinDesign> = {
    ...parent,
    ...remixResult,
    palette: {
      ...(parent.palette || {}),
      ...(remixResult.palette || {}),
    } as any,
  };

  // If instruction didn't mention head hair, strictly lock head hair fields to parent
  if (!mentionsHair && parent.hairStyle) {
    merged.hairStyle = parent.hairStyle;
    merged.hairSilhouette = parent.hairSilhouette;
    merged.bangsStyle = parent.bangsStyle;
    if (parent.palette?.hair) merged.palette!.hair = parent.palette.hair;
    if (parent.palette?.hairHighlight) merged.palette!.hairHighlight = parent.palette.hairHighlight;
  }

  // If instruction didn't mention skin tone, lock skin tone to parent
  if (!instructionLower.includes("skin") && parent.palette?.skin) {
    merged.palette!.skin = parent.palette.skin;
    if (parent.palette?.skinShade) merged.palette!.skinShade = parent.palette.skinShade;
  }

  // Handle facial hair specifically:
  if (mentionsFacialHair) {
    const wantsRemoval = /\b(remove|no|without|clean[- ]shaven|shaved?|zero|none|clear|eliminate|delete)\b/i.test(instructionLower);
    if (wantsRemoval) {
      merged.facialHair = "none";
    } else if (/\bgoatee\b/i.test(instructionLower)) {
      merged.facialHair = "goatee";
    } else if (/\bstubble\b/i.test(instructionLower)) {
      merged.facialHair = "stubble";
    } else if (/\b(short[- ]beard|beard)\b/i.test(instructionLower)) {
      merged.facialHair = "short-beard";
    } else if (remixResult.facialHair) {
      merged.facialHair = remixResult.facialHair;
    }
  } else {
    // Unmentioned facial hair strictly stays locked to parent
    if (parent.facialHair) merged.facialHair = parent.facialHair;
  }

  // If instruction didn't mention eyes, lock eye fields to parent
  if (!mentionsEyes) {
    if (parent.eyeShape) merged.eyeShape = parent.eyeShape;
    if (parent.eyeStyle) merged.eyeStyle = parent.eyeStyle;
    if (parent.palette?.eyes) merged.palette!.eyes = parent.palette.eyes;
  }

  // If instruction didn't mention mouth, lock mouthStyle to parent
  if (!mentionsMouth) {
    if (parent.mouthStyle) merged.mouthStyle = parent.mouthStyle;
  }

  // If instruction didn't mention general face, lock faceConstruction & expression to parent
  if (!mentionsFaceGeneral) {
    if (parent.faceConstruction) merged.faceConstruction = parent.faceConstruction;
    if (parent.faceStyle) merged.faceStyle = parent.faceStyle;
    if (parent.expression) merged.expression = parent.expression;
  }

  // If instruction didn't mention pants/lower body, lock pants
  if (!mentionsPants && !instructionLower.includes("outfit")) {
    if (parent.pantsType) merged.pantsType = parent.pantsType;
    if (typeof parent.cargoPockets === "boolean") merged.cargoPockets = parent.cargoPockets;
    if (parent.palette?.pants) merged.palette!.pants = parent.palette.pants;
  }

  // If instruction didn't mention footwear, lock footwear
  if (!mentionsFootwear && !instructionLower.includes("outfit")) {
    if (parent.footwear) merged.footwear = parent.footwear;
    if (parent.footwearStyle) merged.footwearStyle = parent.footwearStyle;
    if (parent.socks) merged.socks = parent.socks;
    if (parent.palette?.shoes) merged.palette!.shoes = parent.palette.shoes;
  }

  // If instruction didn't mention accessories, lock accessories
  if (!mentionsHeadphones && typeof parent.headphones === "boolean") merged.headphones = parent.headphones;
  if (!mentionsGlasses) {
    if (typeof parent.glasses === "boolean") merged.glasses = parent.glasses;
  } else {
    // If glasses mentioned with negative modifier, set to false
    if (/\b(no|remove|without)\s*(glasses|sunglasses)\b/i.test(instructionLower)) {
      merged.glasses = false;
    }
  }
  if (!mentionsHorns && typeof parent.horns === "boolean") merged.horns = parent.horns;
  if (!mentionsCrown && typeof parent.crown === "boolean") merged.crown = parent.crown;
  if (!mentionsHalo && typeof parent.halo === "boolean") merged.halo = parent.halo;

  return merged;
}
