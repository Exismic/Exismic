import type { MinecraftSkinDesign, MinecraftSkinPart, MinecraftSkinStyle } from "./minecraft-skin";
import { extractMinecraftCharacterPalette, mergeMinecraftSkinPart } from "./minecraft-skin";
import { SKIN_ART_REGIONS, SKIN_CHARACTER_TYPES, sanitizeSkinPixelArt } from "./minecraft-skin-art-types";

export const MINECRAFT_SKIN_ART_INSTRUCTION = [
  "ART DIRECTION: choose characterType human/duck/tv/robot/creature/cat/abstract; never add human hair to a screen, animal, robot, or abstract head.",
  "Choose topPattern clean/plaid/striped, pantsDetail clean/ripped/patchwork, graphic none/skull/heart/checker/bolt, and colorTreatment solid/gradient to match the prompt. Keep these on the correct body part.",
  "You can draw ORIGINAL custom pixel details in pixelArt. Provide 2-6 deliberately composed faces only where they improve the design; use [] when the semantic patterns suffice. Each entry is {region,layer,rows}. Existing templates already render faces, hair, plaid, tears, clothes and folds: do not replace these with flat filled rectangles.",
  "Regions name a cube face, e.g. head-front, head-back, head-top, torso-front, torso-back, right-arm-front, left-leg-front. layer is base or outer. Never return a full UV atlas or coordinates.",
  "Dimensions MUST be exact: every head face 8 characters x 8 rows; torso front/back 8 x 12; torso top/bottom 8 x 4; torso sides 4 x 12; arm/leg front/back/sides 4 x 12; arm/leg top/bottom 4 x 4. Always draw arms at width 4; the renderer adapts slim arms.",
  "One character is one pixel. Color tokens: K skin, k skin shadow, C skin light, R soft blush; H hair/head casing, h hair highlight, L hair mid-light, D hair root shadow; T top, t top light, S top shadow, s top deep shadow; A topAccent, a accent light, B accent shadow; P pants, p pants light, Q pants shadow; F shoes, f shoe light, g shoe shadow; E eyes/screen, e eye light; W off-white, N charcoal; X detail, x detail light, Y detail shadow. Dot . means keep the existing pixel/transparent outer space.",
  "Think like a pixel artist: connected 2-4 pixel shadow masses, directional strands, quiet fabric areas, 1px seam highlights, and intentional negative space. No scattered random noise or repeating every color. Connect color masses across front, side, and back. Use the outer layer sparingly for hair edges, a screen rim, a bill, collar, or pockets.",
  "Human eyes are centered at columns 1-2 and 5-6, rows 3-4; nose bridge columns 3-4. Eye/mouth controls are protected on both layers. Human head-front outer art is HAIR ONLY: use H/h/L/D above or beside the face and dots over the whole face. NEVER draw eyes or skin onto a human outer hair face.",
  "For clothing art, use dots for at least half the face so existing folds, lapels and pockets remain visible. Use sparse X/W/N markings for logos, tiny patches, stitched trim or seams. Do not paint broad T/P rectangles. For a custom nonhuman head, a base drawing can cover the full face, but use at least 3 tones and recognizable features. Duck eyes must be a separated pair at columns 1-2 and 5-6, with a 4-6px wide bill lower down; not a single eye in the center. TV screen symbols go inside its rim. Connect casing/feathers around side and back faces.",
  'Original sparse human fringe EXAMPLE: {"region":"head-front","layer":"outer","rows":["DHHLLHHD","HHhLLhHH",".HH..HH.","........","........","........","........","........"]}. Original tiny jacket patch EXAMPLE: {"region":"torso-back","layer":"outer","rows":["........","........","...XX...","..X..X..","...XX...","........","........","........","........","........","........","........"]}. Compose different original motifs for the request instead of copying these examples.',
  "For gradients use hair as head/start color, topAccent as shoulder color, top as chest color, pants as leg color, shoes as the final color. For duck/creature/robot head use skin for the head color, topAccent for bill/feature, eyes for eyes, detail for markings. For TV heads use hair for the case, eyes for the screen.",
].join("\n");

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
    hairLength: { type: "string", enum: ["short", "medium", "long"] },
    collarStyle: { type: "string", enum: ["hood-collar", "crew", "v-neck", "turtleneck", "open"] },
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
      enum: ["smile", "neutral", "smirk", "open", "none", "masked"],
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
      enum: ["open_front", "center_zip", "pullover", "buttons_single", "buttons_double", "haori_wrap", "armor_fauld"],
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
      description: "A separate garment under an outer jacket. A hoodie worn alone has midLayer='none'.",
    },
    innerGarment: {
      type: "string",
      enum: ["undershirt", "crew_tee", "graphic_tee", "turtleneck", "striped_undershirt", "v_neck_tee", "tunic", "none"],
    },
    zipper: { type: "string", enum: ["silver", "gold", "black", "none"] },
    drawstrings: { type: "string", enum: ["none", "thin", "tied"] },
    emblem: { type: "string" },
    sleeves: {
      type: "string",
      enum: ["short", "long", "armored"],
    },
    sleeveStyle: {
      type: "string",
      enum: ["layered_undershirt", "slouch_gather", "short_sleeve", "rolled_cuff", "wide_haori", "gauntlet_bracer"],
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
        "wide_cargo",
        "relaxed_jeans",
        "tailored_trousers",
        "pleated_skirt",
        "jumpsuit_cuffed",
        "shorts_knee_highs",
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
        "chunky-sneaker",
        "high-top-sneaker",
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
    characterType: { type: "string", enum: [...SKIN_CHARACTER_TYPES] },
    topPattern: { type: "string", enum: ["clean", "plaid", "striped"] },
    pantsDetail: { type: "string", enum: ["clean", "ripped", "patchwork"] },
    graphic: { type: "string", enum: ["none", "skull", "heart", "checker", "bolt"] },
    colorTreatment: { type: "string", enum: ["solid", "gradient"] },
    pixelArt: {
      type: "array",
      items: {
        type: "object",
        properties: { region: { type: "string", enum: SKIN_ART_REGIONS }, layer: { type: "string", enum: ["base", "outer"] }, rows: { type: "array", items: { type: "string" } } },
        required: ["region", "layer", "rows"], additionalProperties: false,
      },
    },
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
    "hairLength",
    "collarStyle",
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
    "characterType",
    "topPattern",
    "pantsDetail",
    "graphic",
    "colorTreatment",
    "pixelArt",
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

export function buildSkinArtConstraints(prompt: string): string {
  return [
    "Use only these exact enum values (for plaid set topPattern=plaid and pattern=clean): " + Object.entries(MINECRAFT_SKIN_JSON_SCHEMA.properties).filter(([, property]) => "enum" in property).map(([key, property]) => `${key}=${("enum" in property ? property.enum : []).join("|")}`).join("; "),
    "Allowed pixelArt regions: " + SKIN_ART_REGIONS.join(", "),
    "Explicit custom-character color anchors (honor these requested colors): " + JSON.stringify(extractMinecraftCharacterPalette(prompt)),
  ].join("\n");
}

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
    MINECRAFT_SKIN_ART_INSTRUCTION,
    buildSkinArtConstraints(prompt),
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
export function minecraftChangeInstruction(instruction: string): string {
  // Preservation clauses describe boundaries, not requested changes.
  return instruction.toLowerCase().replace(
    /\b(?:preserve|keep|retain|maintain|leave|do not (?:change|alter|add)|don't (?:change|alter|add))\b[^.;!?]*(?=[.;!?]|$)/gi,
    (clause) => {
      const change = clause.search(/\b(?:but|then|and)\s+(?:change|make|add|remove|recolor|replace)\b/i);
      return change < 0 ? "" : clause.slice(change);
    },
  ).trim();
}

export function minecraftRemixParts(instruction: string): Exclude<MinecraftSkinPart, "all">[] {
  const text = minecraftChangeInstruction(instruction);
  if (!text.replace(/[\s.,;!?]/g, "")) return [];
  if (/\b(?:whole|entire|full)\s+(?:skin|character|body)\b|\b(?:gradient|rainbow)\b/.test(text)) return ["head", "torso", "arms", "legs"];
  const parts = new Set<Exclude<MinecraftSkinPart, "all">>();
  if (/\b(?:head|hair|bangs|fringe|face|skin tone|eyes?|mouth|lips?|smile|smirk|beard|stubble|goatee|mask|visor|glasses|horns?|halo|crown|duck|tv|robot|cat)\b/.test(text)) parts.add("head");
  if (/\b(?:torso|chest|back|hoodie|jacket|shirt|bomber|sweater|robe|tunic|top|vest|coat|collar|tie|graphic|logo|plaid|pattern|outfit|clothes|costume)\b/.test(text)) parts.add("torso");
  if (/\b(?:arms?|sleeves?|cuffs?|gloves?|hoodie|jacket|shirt|bomber|sweater|robe|tunic|coat|outfit|clothes|costume)\b/.test(text)) parts.add("arms");
  if (/\b(?:legs?|pants|jeans|cargo|trousers|shorts|skirt|shoes|boots|sneakers|footwear|socks|outfit|clothes|costume)\b/.test(text)) parts.add("legs");
  return parts.size ? [...parts] : ["head", "torso", "arms", "legs"];
}

export function mergeMinecraftRemixPixels(base: Uint8Array, generated: Uint8Array, instruction: string): Uint8Array {
  let pixels: Uint8Array = new Uint8Array(base);
  for (const part of minecraftRemixParts(instruction)) pixels = mergeMinecraftSkinPart(pixels, generated, part);
  return pixels;
}

export function mergeRemixDesign(
  parent: Partial<MinecraftSkinDesign>,
  remixResult: Partial<MinecraftSkinDesign>,
  remixInstruction: string
): Partial<MinecraftSkinDesign> {
  const instructionLower = minecraftChangeInstruction(remixInstruction);

  // Strip "facial hair" / "facial-hair" before checking for head-hair keywords so facial hair is NEVER treated as head hair
  const headHairInstruction = instructionLower.replace(/\bfacial[- ]hair\b/gi, "");
  const mentionsHair = /\b(hair|bangs|fringe|ponytail|buns|cut|bald|blonde|brunette|locks|silver hair|black hair|brown hair|red hair)\b/i.test(headHairInstruction);

  // Dedicated facial-hair detection matching removal, clean-shaven, and specific styles
  const mentionsFacialHair = /\b(facial[- ]hair|beard|stubble|goatee|mustache|moustache|clean[- ]shaven|shaved?)\b/i.test(instructionLower);
  const mentionsEyes = /\b(eye|eyes|eyebrow|brows?|pupil)\b/i.test(instructionLower);
  const mentionsMouth = /\b(mouth|lips?|smile|frown|smirk)\b/i.test(instructionLower);
  const mentionsFaceGeneral = /\b(face|expression|mask|visor)\b/i.test(instructionLower);

  const mentionsTop = /\b(hoodie|jacket|shirt|bomber|sweater|tunic|robe|top|undershirt|vest|sleeves|zipper|graphic|print|logo|patch|pattern|plaid|flannel|tartan|stripe|striped|chest|collar|tie)\b/i.test(instructionLower);
  const mentionsPants = /\b(pants|jeans|cargo|shorts|skirt|trousers|pockets|rips?|ripped|torn|distressed|frayed|patchwork)\b/i.test(instructionLower);
  const mentionsFootwear = /\b(shoes|boots|sneakers|high-tops|footwear|socks)\b/i.test(instructionLower);
  const mentionsHeadphones = /\bheadphones?\b/i.test(instructionLower);
  const mentionsGlasses = /\bglasses|sunglasses\b/i.test(instructionLower);
  const mentionsHorns = /\bhorns?\b/i.test(instructionLower);
  const mentionsCrown = /\bcrown\b/i.test(instructionLower);
  const mentionsHalo = /\bhalo\b/i.test(instructionLower);
  const mentionsCharacter = /\b(?:duck|tv|television|robot|creature|monster|cat|abstract|human|head)\b/i.test(instructionLower);
  const broadOutfit = /\b(?:outfit|clothes|style|costume)\b/i.test(instructionLower);

  const merged: Partial<MinecraftSkinDesign> = {
    ...parent,
    ...remixResult,
    palette: {
      ...(parent.palette || {}),
      ...(remixResult.palette || {}),
    } as any,
  };

  // If instruction didn't mention head hair, strictly lock head hair fields to parent
  if (!mentionsHair && !mentionsCharacter && parent.hairStyle) {
    merged.hairStyle = parent.hairStyle;
    merged.hairSilhouette = parent.hairSilhouette;
    merged.bangsStyle = parent.bangsStyle;
    if (parent.palette?.hair) merged.palette!.hair = parent.palette.hair;
    if (parent.palette?.hairHighlight) merged.palette!.hairHighlight = parent.palette.hairHighlight;
  }

  // If instruction didn't mention skin tone, lock skin tone to parent
  if (!instructionLower.includes("skin") && !mentionsCharacter && parent.palette?.skin) {
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
  if (!mentionsEyes && !mentionsCharacter) {
    if (parent.eyeShape) merged.eyeShape = parent.eyeShape;
    if (parent.eyeStyle) merged.eyeStyle = parent.eyeStyle;
    if (parent.palette?.eyes) merged.palette!.eyes = parent.palette.eyes;
  }

  // If instruction didn't mention mouth, lock mouthStyle to parent
  if (!mentionsMouth) {
    if (parent.mouthStyle) merged.mouthStyle = parent.mouthStyle;
  }

  // If instruction didn't mention general face, lock faceConstruction & expression to parent
  if (!mentionsFaceGeneral && !mentionsCharacter) {
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

  if (!mentionsCharacter) merged.characterType = parent.characterType;
  if (!/\b(?:plaid|flannel|tartan|stripe|striped|pattern)\b/i.test(instructionLower) && !broadOutfit) merged.topPattern = parent.topPattern;
  if (!/\b(?:rip|ripped|torn|distressed|patchwork|frayed)\b/i.test(instructionLower) && !broadOutfit) merged.pantsDetail = parent.pantsDetail;
  if (!/\b(?:graphic|print|skull|heart|checker|bolt|logo)\b/i.test(instructionLower) && !broadOutfit) merged.graphic = parent.graphic;
  if (!/\b(?:gradient|solid|rainbow|galaxy)\b/i.test(instructionLower) && !broadOutfit) merged.colorTreatment = parent.colorTreatment;
  const parentArt = sanitizeSkinPixelArt(parent.pixelArt), newArt = sanitizeSkinPixelArt(remixResult.pixelArt);
  const changedRegion = (region: string) => region.startsWith("head-") ? mentionsHair || mentionsFaceGeneral || mentionsCharacter
    : region.startsWith("torso-") ? mentionsTop || broadOutfit
      : region.includes("arm-") ? mentionsTop || broadOutfit : mentionsPants || mentionsFootwear || broadOutfit;
  const recolorOnly = /\b(?:color|colour|recolor|recolour)\b|\b(?:make|change|turn)\b.*\b(?:red|blue|navy|green|black|white|purple|pink|gold|yellow|teal|gray|grey|brown)\b/i.test(instructionLower) && !/\b(?:add|remove|replace|pattern|print|graphic|shape|style|longer|shorter)\b/i.test(instructionLower);
  const changedArt = newArt.filter((art) => changedRegion(art.region));
  const removesArt = /\b(?:remove|clear|without|no)\b.*\b(?:graphic|print|logo|pattern|marking|pixel|detail)\b/i.test(instructionLower);
  merged.pixelArt = recolorOnly ? parentArt : [
    ...parentArt.filter((art) => !changedRegion(art.region) || (!removesArt && !mentionsCharacter && !broadOutfit && !changedArt.some((next) => next.region === art.region && next.layer === art.layer))),
    ...changedArt,
  ];

  if (recolorOnly) {
    const palette = { ...parent.palette } as MinecraftSkinDesign["palette"];
    const copy = (keys: Array<keyof MinecraftSkinDesign["palette"]>) => {
      for (const key of keys) if (remixResult.palette?.[key]) palette[key] = remixResult.palette[key]!;
    };
    if (mentionsHair) copy(["hair", "hairHighlight"]);
    if (/\bskin\b/.test(instructionLower)) copy(["skin", "skinShade"]);
    if (mentionsEyes) copy(["eyes"]);
    if (mentionsTop) copy(["top"]);
    if (/\b(?:accent|lining|trim|tie|bill|beak)\b/.test(instructionLower)) copy(["topAccent"]);
    if (mentionsPants) copy(["pants"]);
    if (mentionsFootwear) copy(["shoes"]);
    return { ...parent, palette, pixelArt: parentArt };
  }
  return merged;
}
