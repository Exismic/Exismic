import {
  type MinecraftSkinDesign,
  type MinecraftArmModel,
  type MinecraftSkinStyle,
  type MinecraftSkinPalette,
  type Face,
  type ArmFaces,
  shadeWithHueShift,
  armFaces,
} from "./minecraft-skin";
import {
  generateHairBlueprint,
  generateFaceBlueprint,
} from "./minecraft-skin-blueprint-hair";

// ============================================================================
// 1. ARTIST COMPOSITION BLUEPRINT & CLUSTER INTERFACES
// ============================================================================

export type PixelClusterType =
  | "shadow_mass"
  | "form_shadow"
  | "fold"
  | "strand"
  | "highlight"
  | "rim_light"
  | "contact_shadow"
  | "accent"
  | "texture";

export interface PixelRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PixelCluster {
  type: PixelClusterType;
  region: PixelRegion;
  direction?: number; // Flow angle in degrees (-180 to 180)
  density: number; // 0.0 to 1.0
  paletteRamp: string;
  irregularity: number; // 0.0 to 1.0 for organic edges
  importance: number; // 1 to 10
}

export type MaterialType =
  | "skin"
  | "cotton"
  | "knit"
  | "denim"
  | "leather"
  | "metal"
  | "hair"
  | "plastic"
  | "rubber"
  | "wool"
  | "techwear"
  | "technical-fabric"
  | "bomber"
  | "hoodie"
  | "undershirt";

export interface ComponentMaterials {
  top: MaterialType;          // Outer jacket / hoodie / robe / coat
  mid: MaterialType;          // Midlayer hoodie / sweater / vest
  inner: MaterialType;        // Inner tee / turtleneck / shirt
  pauldron: MaterialType;     // Armor shoulder plates (always metal or hardened leather)
  strap: MaterialType;        // Harness / straps (leather or techwear)
  belt: MaterialType;         // Waist belt (leather)
  pants: MaterialType;        // Lower garment
  footwear: MaterialType;     // Shoes / boots
  socks: MaterialType;        // Socks (cotton)
  hair: MaterialType;         // Hair
  skin: MaterialType;         // Skin
}

export interface ArtistCompositionBlueprint {
  lightDirection: "NW" | "NE" | "W" | "E" | "TOP";

  silhouette: {
    headShape: string;
    hairShape: string;
    torsoShape: string;
    armShape: string;
    legShape: string;
  };

  focalPoints: Array<{
    region: "hair" | "face" | "torso" | "arms" | "legs" | "accessory";
    importance: number;
  }>;

  shadowMasses: PixelRegion[];
  highlightMasses: PixelRegion[];
  creaseClusters: PixelRegion[];
  detailClusters: PixelRegion[];

  asymmetry: {
    enabled: boolean;
    strength: number;
    partOffset: number; // -1.0 (left) to 1.0 (right)
    foldBias: "left" | "right" | "center";
  };

  materials: ComponentMaterials;
}

// 2D Token Matrix representation (rows of string characters)
export type TokenMatrix = string[];

// ============================================================================
// 2. MATERIAL-DRIVEN PALETTE RAMPS WITH DYNAMIC HUE-SHIFTING
// ============================================================================

export interface MaterialRamp {
  deepShadow: string;
  shadow: string;
  base: string;
  light: string;
  highlight: string;
  specular?: string;
  accent?: string;
}

export function buildMaterialRamp(
  baseHex: string,
  material: string = "cotton",
  accentHex?: string
): MaterialRamp {
  switch (material) {
    case "metal":
      // Metal: high-contrast specular spikes (#ffffff), deep plate crevices (-16°), crisp edge highlights
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.42, "metal"),
        shadow: shadeWithHueShift(baseHex, -0.26, "metal"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.20, "metal"),
        highlight: shadeWithHueShift(baseHex, 0.38, "metal"),
        specular: "#ffffff",
        accent: accentHex || "#f59e0b",
      };

    case "leather":
      // Leather: rich warm cognac/burgundy shadows (-8°), directional creases, tight specular highlights
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.34, "fabric"),
        shadow: shadeWithHueShift(baseHex, -0.18, "fabric"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.14, "fabric"),
        highlight: shadeWithHueShift(baseHex, 0.28, "fabric"),
        specular: shadeWithHueShift(baseHex, 0.38, "fabric"),
        accent: accentHex,
      };

    case "knit":
    case "wool":
      // Knit / Wool: corded structural clusters, deep crevices (-10°), very matte, low specular
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.28, "fabric"),
        shadow: shadeWithHueShift(baseHex, -0.15, "fabric"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.08, "fabric"),
        highlight: shadeWithHueShift(baseHex, 0.16, "fabric"),
        accent: accentHex,
      };

    case "denim":
      // Denim: deep indigo shadows (-15°), faded desaturated highlights (+5°, -20% sat), copper rivets
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.32, "fabric"),
        shadow: shadeWithHueShift(baseHex, -0.18, "fabric"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.12, "fabric"),
        highlight: shadeWithHueShift(baseHex, 0.22, "fabric"),
        accent: accentHex || "#d97706", // Copper rivet
      };

    case "plastic":
    case "vinyl":
    case "techwear":
    case "technical-fabric":
    case "bomber":
      // Bomber / Technical Fabric: broad smooth folds, sharper seam accents (-0.34), subtle cool highlights (+0.16 cool tone)
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.36, "fabric"),
        shadow: shadeWithHueShift(baseHex, -0.22, "fabric"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.14, "neon"),
        highlight: shadeWithHueShift(baseHex, 0.26, "neon"),
        specular: "#ffffff",
        accent: accentHex || "#06b6d4", // Cool cyan/silver accent
      };

    case "undershirt":
      // Undershirt: clean crisp light-colored core, minimal internal shading
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.10, "fabric"),
        shadow: shadeWithHueShift(baseHex, -0.05, "fabric"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.03, "fabric"),
        highlight: shadeWithHueShift(baseHex, 0.06, "fabric"),
        specular: "#ffffff",
        accent: accentHex,
      };

    case "rubber":
      // Rubber / Outsole: matte, high friction absorption, deep contact darks
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.30, "fabric"),
        shadow: shadeWithHueShift(baseHex, -0.16, "fabric"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.06, "fabric"),
        highlight: shadeWithHueShift(baseHex, 0.12, "fabric"),
        accent: accentHex,
      };

    case "hair":
      // Hair: 6 tiers including dark roots (-14°), glossy sheen band, and specular luster
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.36, "hair"),
        shadow: shadeWithHueShift(baseHex, -0.20, "hair"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.14, "hair"),
        highlight: shadeWithHueShift(baseHex, 0.26, "hair"),
        specular: shadeWithHueShift(baseHex, 0.40, "hair"),
        accent: accentHex,
      };

    case "skin":
      // Skin: subsurface scattering with warm terracotta shadows (-14°, +16% sat) and golden peach highlights (+8°)
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.28, "skin"),
        shadow: shadeWithHueShift(baseHex, -0.14, "skin"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.07, "skin"),
        highlight: shadeWithHueShift(baseHex, 0.14, "skin"),
        accent: accentHex || "#fb7185", // Peach/rose blush
      };

    case "hoodie":
    case "cotton":
    default:
      // Hoodie / Cotton: softer broad folds (-0.16), ribbed collar/cuff clusters (+0.12), soft shadow transitions
      return {
        deepShadow: shadeWithHueShift(baseHex, -0.26, "fabric"),
        shadow: shadeWithHueShift(baseHex, -0.14, "fabric"),
        base: baseHex,
        light: shadeWithHueShift(baseHex, 0.10, "fabric"),
        highlight: shadeWithHueShift(baseHex, 0.18, "fabric"),
        specular: shadeWithHueShift(baseHex, 0.24, "fabric"),
        accent: accentHex,
      };
  }
}

// ============================================================================
// 3. SEMANTIC PALETTE SAFETY & ROBUST FALLBACK NORMALIZATION
// ============================================================================

/**
 * Normalizes input designs and extracts color palettes with strict semantic safety.
 * CRITICAL ARCHITECTURAL RULE:
 * Broad keywords like "dark" must NEVER trigger demonic / halloween fire palettes
 * when used in natural character descriptions like "dark academia", "dark indigo",
 * "dark brown", or "dark gray".
 */
export function safeExtractBlueprintDesign(
  designInput: Partial<MinecraftSkinDesign>,
  prompt = "",
  seed = 12345
): MinecraftSkinDesign {
  const lower = prompt.toLowerCase();

  // If structured semantic palette was already supplied (e.g. by Groq), prioritize it directly
  if (designInput.palette && designInput.palette.top && designInput.palette.skin) {
    const pal = designInput.palette;
    return {
      ...designInput,
      name: designInput.name || "Custom Skin",
      description: designInput.description || prompt,
      hairStyle: designInput.hairStyle || "short",
      hairSilhouette: designInput.hairSilhouette || "curtain-bangs",
      faceConstruction: designInput.faceConstruction || "clean-aesthetic",
      outfit: designInput.outfit || "casual",
      expression: designInput.expression || "friendly",
      eyeShape: designInput.eyeShape || "normal",
      eyeStyle: designInput.eyeStyle || "anime",
      facialHair: designInput.facialHair || "none",
      faceStyle: designInput.faceStyle || "open",
      sleeves: designInput.sleeves || "long",
      gloves: designInput.gloves || false,
      footwear: designInput.footwear || "shoes",
      pattern: designInput.pattern || "clean",
      emblem: designInput.emblem || "",
      traits: designInput.traits || [],
      palette: {
        skin: pal.skin || "#fbe4d8",
        skinShade: pal.skinShade || shadeWithHueShift(pal.skin || "#fbe4d8", -0.16, "skin"),
        hair: pal.hair || "#332219",
        hairHighlight: pal.hairHighlight || shadeWithHueShift(pal.hair || "#332219", 0.18, "hair"),
        eyes: pal.eyes || "#38bdf8",
        top: pal.top || "#3b82f6",
        topAccent: pal.topAccent || "#e2e8f0",
        pants: pal.pants || "#1e293b",
        shoes: pal.shoes || "#0f172a",
        detail: pal.detail || "#94a3b8",
      },
      hoodState: designInput.hoodState || "none",
      fit: designInput.fit || "oversized",
      bangsStyle: designInput.bangsStyle || "curtain",
      placket: designInput.placket,
      midLayer: designInput.midLayer,
      innerGarment: designInput.innerGarment,
      zipper: designInput.zipper,
      cargoPockets: designInput.cargoPockets,
      sleeveStyle: designInput.sleeveStyle,
      asymmetry: designInput.asymmetry,
      lightingDirection: designInput.lightingDirection || "upper-left",
      negativeConstraints: designInput.negativeConstraints,
      garmentType: designInput.garmentType,
      materialProfile: designInput.materialProfile,
      hairLength: designInput.hairLength,
      collarStyle: designInput.collarStyle,
      footwearStyle: designInput.footwearStyle,
      pantsType: designInput.pantsType,
      drawstrings: designInput.drawstrings,
      socks: designInput.socks,
    };
  }

  // Fallback Semantic Extraction (safe from keyword hijacking)
  const isTrueDemon = /\b(demon|vampire|succubus|underworld|hellhound|satan|fiend)\b/i.test(lower);
  const isDarkAcademia = /\b(dark academic|dark academia|tweed|charcoal turtleneck)\b/i.test(lower);
  const isCyber = /\b(cyber|neon|futuristic|techwear|hacker)\b/i.test(lower);
  const isMilitary = /\b(military|tactical|camo|soldier|airforce)\b/i.test(lower);
  const isDesert = /\b(desert|nomad|sand|linen)\b/i.test(lower);
  const isRoyal = /\b(royal|celestial|velvet|mage|wizard|prince|princess)\b/i.test(lower);

  let skinHex = "#fbe4d8";
  let hairHex = "#332219";
  let topHex = "#3b82f6";
  let topAccentHex = "#e2e8f0";
  let pantsHex = "#1e293b";
  let shoesHex = "#0f172a";
  let eyeHex = "#38bdf8";

  if (isTrueDemon) {
    skinHex = "#1e141a";
    hairHex = "#120e10";
    topHex = "#181216";
    topAccentHex = "#ff2200";
    pantsHex = "#120e10";
    shoesHex = "#ff2200";
    eyeHex = "#ff2200";
  } else if (isDarkAcademia) {
    // Rich espresso brown trench, charcoal turtleneck, slate trousers, oxfords
    skinHex = "#f8dfd3";
    hairHex = "#2c1c14";
    topHex = "#452818";
    topAccentHex = "#1e232a";
    pantsHex = "#2d3748";
    shoesHex = "#27170f";
    eyeHex = "#5c4033";
  } else if (isCyber) {
    skinHex = "#f5d0be";
    hairHex = "#0f172a";
    topHex = "#0f172a";
    topAccentHex = "#06b6d4";
    pantsHex = "#1e293b";
    shoesHex = "#06b6d4";
    eyeHex = "#22d3ee";
  } else if (isMilitary) {
    skinHex = "#e8c3b0";
    hairHex = "#1f1a16";
    topHex = "#3f4c38";
    topAccentHex = "#263022";
    pantsHex = "#2c3627";
    shoesHex = "#1c1917";
    eyeHex = "#64748b";
  } else if (isDesert) {
    skinHex = "#deb887";
    hairHex = "#5c4033";
    topHex = "#d2b48c";
    topAccentHex = "#c2a649";
    pantsHex = "#8b7355";
    shoesHex = "#5c4033";
    eyeHex = "#4a3b32";
  } else if (isRoyal) {
    skinHex = "#fde2d2";
    hairHex = "#fef08a";
    topHex = "#31184e";
    topAccentHex = "#f59e0b";
    pantsHex = "#1e1035";
    shoesHex = "#170c29";
    eyeHex = "#38bdf8";
  }

  // Dynamic Prompt Color Overrides (checks explicit color words)
  if (/\b(white tee|white t-?shirt|white utility|white shirt)\b/i.test(lower)) {
    if (/\b(white utility)\b/i.test(lower)) topHex = "#f8fafc";
    else topAccentHex = "#f8fafc";
  }
  if (/\b(olive)\b/i.test(lower)) topHex = "#4d5b38";
  if (/\b(pink|pastel pink)\b/i.test(lower)) topHex = "#f472b6";
  if (/\b(lavender|pastel lavender)\b/i.test(lower)) topHex = "#c084fc";
  if (/\b(orange safety straps?|orange jumpsuit)\b/i.test(lower)) {
    if (/\bjumpsuit\b/i.test(lower)) {
      topHex = "#ea580c";
      pantsHex = "#c2410c";
    } else {
      topAccentHex = "#ea580c";
    }
  }
  if (/\b(indigo|dark indigo)\b/i.test(lower)) pantsHex = "#1e1b4b";
  if (/\b(platinum|silver)\b/i.test(lower)) hairHex = "#e2e8f0";
  if (/\b(blonde|gold hair)\b/i.test(lower)) hairHex = "#fde047";
  if (/\b(red leather sleeves?|red skate)\b/i.test(lower)) {
    if (/\bred skate\b/i.test(lower)) shoesHex = "#dc2626";
    if (/\bred leather\b/i.test(lower)) topAccentHex = "#dc2626";
  }

  return {
    ...designInput,
    name: designInput.name || "Parametric Skin",
    description: prompt,
    hairStyle: designInput.hairStyle || "short",
    hairSilhouette: (designInput.hairSilhouette as any) || (
      /wolf[- ]cut/i.test(lower) ? "wolf-cut"
        : /side[- ]swept/i.test(lower) ? "side-swept"
          : /messy|fringe/i.test(lower) ? "messy-fringe"
            : /middle[- ]part|k-?pop/i.test(lower) ? "middle-part-flow"
              : /ponytail/i.test(lower) ? "high-ponytail"
                : /braid|bun/i.test(lower) ? "braided-buns"
                  : /spiky/i.test(lower) ? "spiky-anime"
                    : /long/i.test(lower) ? "long-layered"
                      : "curtain-bangs"
    ),
    faceConstruction: (designInput.faceConstruction as any) || (
      /visor|goggles/i.test(lower) ? "masked-visor"
        : /cute|pastel/i.test(lower) ? "soft-cute"
          : /k-?pop|soft boy/i.test(lower) ? "soft-kpop"
            : /sharp|assassin|dark fedora/i.test(lower) ? "sharp-cool"
              : /anime/i.test(lower) ? "anime-expressive"
                : "clean-aesthetic"
    ),
    outfit: designInput.outfit || "casual",
    expression: designInput.expression || "friendly",
    eyeShape: designInput.eyeShape || "normal",
    eyeStyle: designInput.eyeStyle || "anime",
    facialHair: designInput.facialHair || "none",
    faceStyle: designInput.faceStyle || "open",
    sleeves: designInput.sleeves || "long",
    gloves: designInput.gloves || false,
    footwear: designInput.footwear || "shoes",
    pattern: designInput.pattern || "clean",
    emblem: designInput.emblem || "",
    traits: designInput.traits || [],
    palette: {
      skin: skinHex,
      skinShade: shadeWithHueShift(skinHex, -0.16, "skin"),
      hair: hairHex,
      hairHighlight: shadeWithHueShift(hairHex, 0.20, "hair"),
      eyes: eyeHex,
      top: topHex,
      topAccent: topAccentHex,
      pants: pantsHex,
      shoes: shoesHex,
      detail: "#94a3b8",
    },
    hoodState: designInput.hoodState || (/\b(hood up)\b/i.test(lower) ? "up" : /\b(hoodie|hooded)\b/i.test(lower) ? "down" : "none"),
    fit: designInput.fit || "oversized",
    bangsStyle: designInput.bangsStyle || "curtain",
    placket: designInput.placket,
    midLayer: designInput.midLayer,
    innerGarment: designInput.innerGarment,
    zipper: designInput.zipper,
    cargoPockets: designInput.cargoPockets,
    sleeveStyle: designInput.sleeveStyle,
    asymmetry: designInput.asymmetry,
    lightingDirection: designInput.lightingDirection || "upper-left",
    negativeConstraints: designInput.negativeConstraints,
    garmentType: designInput.garmentType,
    materialProfile: designInput.materialProfile,
    hairLength: designInput.hairLength,
    collarStyle: designInput.collarStyle,
    footwearStyle: designInput.footwearStyle,
    pantsType: designInput.pantsType,
    drawstrings: designInput.drawstrings,
    socks: designInput.socks,
  };
}

// ============================================================================
// 4. PARAMETRIC COMPOSITION GRAMMAR (PRIMITIVE GENERATORS)
// ============================================================================

export interface GarmentGrammar {
  neckline: "crew" | "v_neck" | "turtleneck" | "hood_cowl" | "open_lapel" | "haori_wrap" | "pointed_collar" | "fur_collar" | "scarf_wrap";
  placket: "closed" | "center_zip" | "buttons_single" | "buttons_double" | "haori_wrap" | "open_front" | "armor_fauld" | "quilted_gambeson" | "pullover";
  midLayer: "hoodie" | "sweater" | "vest" | "none";
  silhouette: "oversized_sag" | "cropped" | "tucked" | "long_drape" | "cinched_belt";
  utility: "none" | "kangaroo_pocket" | "cargo_pockets" | "chest_flaps" | "safety_straps" | "tool_belt" | "flight_tag" | "cable_knit" | "runic_trim" | "pauldrons";
  sleeve: "straight" | "slouch_gather" | "wide_haori" | "rolled_cuff" | "gauntlet_bracer" | "short_sleeve" | "layered_undershirt";
  innerGarment: "none" | "undershirt" | "crew_tee" | "turtleneck" | "graphic_tee" | "cable_knit" | "v_neck_tee" | "striped_undershirt" | "tunic";
  innerRevealed: boolean;
  zipper: "silver" | "gold" | "black" | "none";
  cargoPockets: boolean;
  asymmetry: boolean;
  lightingDirection: "upper-left" | "upper-right" | "front" | "top-down";
  accessories: {
    catEars?: boolean;
    pauldrons?: boolean;
    safetyStraps?: boolean;
    toolBelt?: boolean;
    flightTag?: boolean;
    runicTrim?: boolean;
    nomadScarf?: boolean;
    headband?: boolean;
  };
}

export interface LowerBodyGrammar {
  fit: "relaxed_jeans" | "wide_cargo" | "tailored_trousers" | "pleated_skirt" | "jumpsuit_cuffed" | "shorts_knee_highs";
  cargoPockets: boolean;
  footwear: "high_top_sneaker" | "low_top_skate" | "combat_boot" | "loafer_oxford" | "sandals_wrap" | "snow_boot" | "armored_sabaton" | "chunky_sneaker";
  socks: "none" | "ankle" | "knee_high_plain" | "knee_high_striped";
}

/**
 * Decomposes any character description into composable structural primitives
 */
export function analyzeGarmentGrammar(prompt: string, design: MinecraftSkinDesign, seed: number): GarmentGrammar {
  const lower = prompt.toLowerCase();

  // 1. Neckline Primitive
  const neckline: GarmentGrammar["neckline"] =
    design.collarStyle === "turtleneck" || /\b(turtleneck|roll[- ]neck|high[- ]neck|funnel[- ]neck)\b/i.test(lower) ? "turtleneck"
      : /\b(scarf|wrapped scarf|nomad|desert)\b/i.test(lower) ? "scarf_wrap"
        : /\b(fur|fur[- ]lined|arctic|parka)\b/i.test(lower) ? "fur_collar"
          : /\b(haori|kimono|yukata)\b/i.test(lower) ? "haori_wrap"
            : design.collarStyle === "v-neck" || /\b(v[- ]neck|cardigan)\b/i.test(lower) ? "v_neck"
              : design.collarStyle === "hood-collar" || design.midLayer === "hoodie" || /\b(hoodie|hooded|cowl|hood)\b/i.test(lower) ? "hood_cowl"
                : design.placket === "open_front" || /\b(blazer|trench|coat|jacket|tuxedo|suit)\b/i.test(lower) ? "open_lapel"
                  : /\b(pointed collar|button[- ]down|oxford shirt)\b/i.test(lower) ? "pointed_collar"
                    : "crew";

  // 2. Placket / Fastening Primitive (Prioritize verified semantic design field)
  const placket: GarmentGrammar["placket"] =
    design.placket ? design.placket
      : /\b(armor|plate|knight|paladin|greaves)\b/i.test(lower) ? "armor_fauld"
        : /\b(gambeson|quilted|padded cotton)\b/i.test(lower) ? "quilted_gambeson"
          : /\b(haori|kimono|yukata)\b/i.test(lower) ? "haori_wrap"
            : /\b(double[- ]breasted|trench|peacoat)\b/i.test(lower) ? "buttons_double"
              : /\b(cardigan|blazer|tuxedo|button)\b/i.test(lower) ? "buttons_single"
                : /\b(open|over (?:black|white|charcoal|a|the)?\s*(?:tee|t-?shirt|turtleneck|sweater|cable[- ]knit|hoodie))\b/i.test(lower) ? "open_front"
                  : /\b(zip|zipper|bomber|track jacket)\b/i.test(lower) ? "center_zip"
                    : "pullover";

  // 3. Mid Layer Primitive
  const midLayer: GarmentGrammar["midLayer"] =
    design.midLayer ? design.midLayer
      : /\b(hoodie|hooded sweatshirt)\b/i.test(lower) ? "hoodie"
        : /\b(sweater|cardigan)\b/i.test(lower) ? "sweater"
          : /\b(vest)\b/i.test(lower) ? "vest"
            : "none";

  // 4. Silhouette Primitive
  const silhouette: GarmentGrammar["silhouette"] =
    design.fit === "oversized" ? "oversized_sag"
      : /\b(cropped|short jacket)\b/i.test(lower) ? "cropped"
        : /\b(tool belt|belted|cinched|sash)\b/i.test(lower) ? "cinched_belt"
          : /\b(trench|coat|robe|cloak|drape)\b/i.test(lower) ? "long_drape"
            : /\b(tucked|formal|tuxedo|slacks)\b/i.test(lower) ? "tucked"
              : "oversized_sag";

  // 5. Utility / Detail Primitive
  const hasPauldrons = /\b(pauldrons?|shoulder guards?|shoulder plates?|armor shoulder)\b/i.test(lower);
  const utility: GarmentGrammar["utility"] =
    hasPauldrons ? "pauldrons"
      : /\b(safety straps?|utility straps?|orange straps?|harness|chest rig)\b/i.test(lower) ? "safety_straps"
        : /\b(tool belt|mechanic|wrenches?|pouches?)\b/i.test(lower) ? "tool_belt"
          : /\b(cable[- ]knit|chunky knit|cable)\b/i.test(lower) ? "cable_knit"
            : design.cargoPockets || /\b(cargo|tactical)\b/i.test(lower) ? "cargo_pockets"
              : /\b(runes?|magic|celestial|circlet)\b/i.test(lower) ? "runic_trim"
                : /\b(bomber|flight tag)\b/i.test(lower) ? "flight_tag"
                  : midLayer === "hoodie" || /\b(hoodie|sweatshirt)\b/i.test(lower) ? "kangaroo_pocket"
                    : /\b(denim|flaps?)\b/i.test(lower) ? "chest_flaps"
                      : "none";

  // 6. Dual-Layer Garment Undershirt Primitive (Prioritize verified semantic design field)
  const isLayeredSleeves = design.sleeveStyle === "layered_undershirt" || /\b(striped long-sleeve|long-sleeve under|layered long-sleeve|skater|layered)\b/i.test(lower);
  const innerGarment: GarmentGrammar["innerGarment"] =
    design.innerGarment ? design.innerGarment
      : /\b(cable[- ]knit|chunky knit)\b/i.test(lower) ? "cable_knit"
        : /\bturtleneck\b/i.test(lower) ? "turtleneck"
          : isLayeredSleeves ? "striped_undershirt"
            : /\b(graphic tee|skate tee)\b/i.test(lower) ? "graphic_tee"
              : /\b(v[- ]neck)\b/i.test(lower) ? "v_neck_tee"
                : /\b(tunic)\b/i.test(lower) ? "tunic"
                  : /\b(undershirt)\b/i.test(lower) ? "undershirt"
                    : /\b(tee|t-?shirt|white tee|shirt)\b/i.test(lower) ? "crew_tee"
                      : placket === "open_front" || placket === "haori_wrap" ? "crew_tee"
                        : "none";

  // 7. Sleeve Dynamics (Prioritize verified semantic design field)
  const sleeve: GarmentGrammar["sleeve"] =
    design.sleeveStyle ? design.sleeveStyle
      : isLayeredSleeves ? "layered_undershirt"
        : /\b(haori|kimono|robe)\b/i.test(lower) ? "wide_haori"
          : /\b(gauntlet|bracer|armor)\b/i.test(lower) ? "gauntlet_bracer"
            : /\b(rolled|cuffed sleeve)\b/i.test(lower) ? "rolled_cuff"
              : /\b(short sleeve|t-?shirt|skate tee)\b/i.test(lower) ? "short_sleeve"
                : "slouch_gather";

  const innerRevealed = innerGarment !== "none" || placket === "open_front" || placket === "haori_wrap" || placket === "buttons_single";

  const zipper: GarmentGrammar["zipper"] =
    design.zipper ? design.zipper
      : /\b(silver zip|silver zipper|silver hardware)\b/i.test(lower) ? "silver"
        : /\b(gold zip|gold zipper|brass zip)\b/i.test(lower) ? "gold"
          : /\b(black zip|black zipper)\b/i.test(lower) ? "black"
            : placket === "center_zip" || placket === "open_front" ? "silver"
              : "none";

  const cargoPockets = Boolean(design.cargoPockets || /\bcargos?\b/i.test(lower));
  const asymmetry = Boolean(design.asymmetry ?? (/asymmetr/i.test(lower)));
  const lightingDirection = design.lightingDirection || "upper-left";

  // 8. Explicit Accessories
  const accessories = {
    catEars: Boolean(design.traits?.includes("cat-ears")) || /\b(cat[- ]ears?|cat headphones?|kitty ears?)\b/i.test(lower),
    pauldrons: hasPauldrons,
    safetyStraps: utility === "safety_straps",
    toolBelt: utility === "tool_belt" || /\b(tool belt)\b/i.test(lower),
    flightTag: utility === "flight_tag" || /\b(flight tag|bomber)\b/i.test(lower),
    runicTrim: utility === "runic_trim" || /\b(runes?|mystic trim)\b/i.test(lower),
    nomadScarf: neckline === "scarf_wrap",
    headband: /\b(headband|bandana)\b/i.test(lower),
  };

  return {
    neckline,
    placket,
    midLayer,
    silhouette,
    utility,
    sleeve,
    innerGarment,
    innerRevealed,
    zipper,
    cargoPockets,
    asymmetry,
    lightingDirection,
    accessories,
  };
}

export function analyzeLowerBodyGrammar(prompt: string, design: MinecraftSkinDesign): LowerBodyGrammar {
  const lower = prompt.toLowerCase();

  const cargoPockets = Boolean(design.cargoPockets || /\bcargos?\b/i.test(lower));

  const fit: LowerBodyGrammar["fit"] =
    design.pantsType ? design.pantsType
      : cargoPockets || /\b(cargo|cargos)\b/i.test(lower) ? "wide_cargo"
        : /\b(skirt|pleated)\b/i.test(lower) ? "pleated_skirt"
          : /\b(shorts|knee[- ]highs?)\b/i.test(lower) ? "shorts_knee_highs"
            : /\b(jumpsuit|overalls?)\b/i.test(lower) ? "jumpsuit_cuffed"
              : /\b(trousers|slacks|chinos|tailored|formal|tuxedo|academia)\b/i.test(lower) ? "tailored_trousers"
                : "relaxed_jeans";

  const footwear: LowerBodyGrammar["footwear"] =
    design.footwearStyle === "chunky-sneaker" || /\b(chunky[- ]sneaker|chunky|dunk|thick sole)\b/i.test(lower) ? "chunky_sneaker"
      : /\b(sandals?|wraps?|tabi|barefoot)\b/i.test(lower) ? "sandals_wrap"
        : /\b(snow boot|insulated|winter boot)\b/i.test(lower) ? "snow_boot"
          : /\b(sabaton|greaves?|armored boot)\b/i.test(lower) ? "armored_sabaton"
            : /\b(loafer|oxford|dress shoe|creepers?)\b/i.test(lower) ? "loafer_oxford"
              : /\b(combat boot|doc marten|tactical boot)\b/i.test(lower) ? "combat_boot"
                : /\b(skate shoe|low[- ]top|vans|sneakers?)\b/i.test(lower) && !/\bhigh[- ]top\b/i.test(lower) ? "low_top_skate"
                  : "high_top_sneaker";

  const hasKneeHighs = design.socks === "knee_high_striped" || design.socks === "knee_high_plain" || /\b(knee[- ]highs?|striped socks?|thigh[- ]highs?|tube socks?)\b/i.test(lower);
  const socks: LowerBodyGrammar["socks"] =
    design.socks ? design.socks
      : hasKneeHighs && /striped/i.test(lower) ? "knee_high_striped"
        : hasKneeHighs ? "knee_high_plain"
          : fit === "pleated_skirt" || fit === "shorts_knee_highs" ? "knee_high_striped"
            : "none";

  return { fit, cargoPockets, footwear, socks };
}

// ============================================================================
// 5. GENERATIVE TORSO BLUEPRINT (SYNTHESIZED FROM PRIMITIVES)
// ============================================================================

export function generateParametricTorsoBlueprint(
  grammar: GarmentGrammar,
  foldBias: "left" | "right" | "center",
  asymmetry: number,
  materials: ComponentMaterials
): {
  base: TokenMatrix;
  overlay: TokenMatrix;
} {
  const biasLeft = foldBias === "left";
  const rowsBase: string[] = [];
  const rowsOverlay: string[] = [];
  const isThreeTier = grammar.placket === "open_front" && grammar.midLayer !== "none";

  // ROW 0: Neckline & Collar
  if (isThreeTier) {
    // Three-tier: Outer collar edges, middle hoodie cowl, center inner undershirt
    rowsBase.push("KKVIIVKK"); // Hoodie cowl framing throat with cream undershirt core
    rowsOverlay.push("FF....FF"); // Open bomber jacket collar rim
  } else if (grammar.innerGarment === "turtleneck" || grammar.neckline === "turtleneck") {
    rowsBase.push("KKIIIIKK"); // Inner turtleneck throat wrap
    rowsOverlay.push(grammar.innerRevealed ? "FF....FF" : "CCCCCCCC");
  } else if (grammar.neckline === "hood_cowl") {
    rowsBase.push("KKCCCCKK");
    rowsOverlay.push("CCCCCCCC"); // 3D Hood Collar
  } else if (grammar.innerGarment === "v_neck_tee" || grammar.neckline === "v_neck") {
    rowsBase.push("KK.II.KK"); // Angled V-neck inner reveal
    rowsOverlay.push("FF....FF");
  } else if (grammar.neckline === "fur_collar") {
    rowsBase.push("KKCCCCKK");
    rowsOverlay.push("cCCcCCcC"); // Fluffy fur trim
  } else if (grammar.neckline === "scarf_wrap") {
    rowsBase.push("KKCCCCKK");
    rowsOverlay.push("zzZZzzZZ"); // Nomad wrapped scarf
  } else if (grammar.neckline === "pointed_collar") {
    rowsBase.push("KKCCCCKK");
    rowsOverlay.push("CKCCCCKC"); // Folded collar tips
  } else {
    // Standard crew inner collar
    rowsBase.push(grammar.innerRevealed ? "KKIIIIKK" : "KKCCCCKK");
    rowsOverlay.push("FF....FF");
  }

  // ROW 1..2: Upper Chest & Shoulders (Garment Stacking)
  if (isThreeTier) {
    // Three-tier: Bomber jacket open on sides, hoodie across chest, cream undershirt visible at center
    // Row 1: Undershirt visible at cols 3..4, hoodie at 1..2 and 5..6
    rowsBase.push("MMMIIMMM");
    // Row 2: Undershirt neckline curve at cols 3..4, hoodie soft tension folds
    rowsBase.push("MMnIInMM");
    // Overlay: Open bomber flaps with silver zipper slider on left lapel
    rowsOverlay.push("FFF..FFF");
    rowsOverlay.push("FF...ZFF");
  } else if (grammar.placket === "haori_wrap") {
    // Open wrap outerwear: inner shirt clearly exposed in center
    rowsBase.push(grammar.innerGarment === "turtleneck" ? "KIIIIIIK" : "KFFFFFFK");
    rowsBase.push(grammar.innerGarment === "turtleneck" ? "GIIIIffG" : "GFFFFFFG");
    rowsOverlay.push("FFF..FFF");
    rowsOverlay.push("FF....FF");
  } else if (grammar.placket === "open_front") {
    // Open coat / jacket / cardigan: inner tee/cable-knit clearly exposed
    rowsBase.push(grammar.innerGarment !== "none" ? "KIIIIIIK" : "KFFFFFFK");
    rowsBase.push(grammar.innerGarment === "cable_knit" ? "GIiIIiIG" : "Gff..ffG");
    rowsOverlay.push("FFF..FFF");
    rowsOverlay.push("FF....FF");
  } else if (grammar.placket === "armor_fauld") {
    // Steel breastplate specular apex
    rowsBase.push("KFFFFFFK");
    rowsBase.push("GFFFFFFG");
    rowsOverlay.push("CACCCCAC");
    rowsOverlay.push("FFF**FFF");
  } else if (grammar.accessories.safetyStraps) {
    // High-vis safety straps across chest (Layer 4 accessory over Layer 3 outer)
    rowsBase.push("KFFFFFFK");
    rowsBase.push("GFFFFFFG");
    rowsOverlay.push("FFUUUUFF");
    rowsOverlay.push("FFuZZuFF");
  } else {
    // Standard upper chest
    rowsBase.push("KFFFFFFK");
    rowsBase.push("Gff..ffG"); // Clavicle highlights
    rowsOverlay.push("FF....FF");
    rowsOverlay.push("FF..*ZFF"); // Metallic zipper or snap at row 2
  }

  // ROW 3..7: Mid Torso / Placket / Folds / Inner Graphics / Utility
  for (let r = 3; r <= 7; r++) {
    // Form-following tension folds on base
    const foldLeft = biasLeft && r === 4 ? "FFgGgFFF" : biasLeft && r === 5 ? "FFfgGgFF" : "FFFFFFFF";
    const foldRight = !biasLeft && r === 4 ? "FFFgGgFF" : !biasLeft && r === 5 ? "FFgGgfFF" : "FFFFFFFF";
    const foldBase = biasLeft ? foldLeft : foldRight;

    if (isThreeTier) {
      // Three-tier Base: Lavender hoodie body with drawstrings, soft folds, and kangaroo pocket
      if (r === 3) {
        // Drawstrings descending from hood cowl
        rowsBase.push(asymmetry > 0.3 ? "MMzMM*MM" : "MMzMMzMM");
      } else if (r === 4) {
        // Soft cotton fabric tension folds
        rowsBase.push(biasLeft ? "MMmnMMMM" : "MMMMnmMM");
      } else if (r === 5) {
        // Kangaroo pocket top ribbed welt
        rowsBase.push("Mvv..vvM");
      } else if (r === 6) {
        // Angled entry slits and pocket body
        rowsBase.push("Mmn..nmM");
      } else {
        // Lower kangaroo pouch shadow
        rowsBase.push("MMnnnnMM");
      }

      // Three-tier Overlay: Charcoal bomber jacket hanging open down the sides
      if (r === 3) {
        rowsOverlay.push("FF...ZFF"); // Zipper teeth continuation on left lapel
      } else if (r === 4) {
        rowsOverlay.push(grammar.asymmetry ? "FF.....F" : "FF....FF");
      } else if (r === 6 && grammar.asymmetry) {
        rowsOverlay.push("FFF...FF");
      } else {
        rowsOverlay.push("FF....FF");
      }
      continue;
    }

    if (grammar.innerGarment === "cable_knit") {
      rowsBase.push(r % 2 === 0 ? "IiIiIiII" : "IjIjIjII");
    } else if (grammar.innerGarment === "graphic_tee" && (r === 4 || r === 5)) {
      rowsBase.push(r === 4 ? "IIXXXXII" : "IIxxxxII");
    } else if (grammar.innerGarment === "striped_undershirt") {
      rowsBase.push(r % 2 === 0 ? "IIIIIIII" : "XXXXXXXX");
    } else if (grammar.placket === "quilted_gambeson") {
      rowsBase.push(r % 2 === 0 ? "FgFgFgFg" : "gFfGfFfG");
    } else {
      rowsBase.push(foldBase);
    }

    // Overlay detailing for rows 3..7 (non-three-tier)
    if (grammar.placket === "open_front") {
      // When placket is open front, keep overlay open!
      rowsOverlay.push("FF....FF");
    } else if (grammar.accessories.safetyStraps) {
      if (r === 4) rowsOverlay.push("UUFFFFUU");
      else if (r === 5) rowsOverlay.push("UUUbbUUU");
      else rowsOverlay.push("FFFFFFFF");
    } else if (grammar.utility === "kangaroo_pocket") {
      if (r === 5) rowsOverlay.push("FffffffF");
      else if (r === 6) rowsOverlay.push("GfFFFFfG");
      else if (r === 7) rowsOverlay.push("GfFFFFfG");
      else if (r === 3 || r === 4) rowsOverlay.push(asymmetry > 0.3 && r === 4 ? "FFz..*FF" : "FFz..zFF");
      else rowsOverlay.push("FFFFFFFF");
    } else if (grammar.utility === "cargo_pockets") {
      if (r === 5) rowsOverlay.push("FGGFFGGF");
      else if (r === 6) rowsOverlay.push("FGGFFGGF");
      else rowsOverlay.push("FFFFFFFF");
    } else if (grammar.utility === "chest_flaps") {
      if (r === 3) rowsOverlay.push("Ff*ff*fF");
      else if (r === 4) rowsOverlay.push("FgGffGgF");
      else rowsOverlay.push("FFFFFFFF");
    } else if (grammar.placket === "buttons_double") {
      rowsOverlay.push(r === 3 || r === 5 || r === 7 ? "FF*FF*FF" : "FFF..FFF");
    } else if (grammar.placket === "buttons_single") {
      rowsOverlay.push(r === 3 || r === 5 || r === 7 ? "FFF*FFFF" : "FFFFFFFF");
    } else if (grammar.placket === "center_zip") {
      rowsOverlay.push("FFFZFFFF");
    } else if (grammar.placket === "armor_fauld") {
      if (r === 3) rowsOverlay.push("FFPPPPFF");
      else if (r === 4) rowsOverlay.push("FpPqqPpF");
      else if (r === 5) rowsOverlay.push("qqqqqqqq");
      else if (r === 6) rowsOverlay.push("FpPqqPpF");
      else rowsOverlay.push("qqqqqqqq");
    } else if (grammar.placket === "haori_wrap") {
      rowsOverlay.push("FFF..FFF");
    } else if (grammar.accessories.toolBelt && r === 7) {
      rowsOverlay.push("UBBZZBBU");
    } else {
      rowsOverlay.push("FFFFFFFF");
    }
  }

  // ROW 8..9: Lower Torso / Waist / Belt
  if (isThreeTier) {
    // Three-tier: Hoodie body sag on base, bomber gathered waist on overlay sides
    rowsBase.push("MMMMMMMM");
    rowsBase.push("Mmn..nmM");
    rowsOverlay.push("cc....cc");
    rowsOverlay.push("cc....cc");
  } else if (grammar.silhouette === "cropped") {
    rowsBase.push(grammar.innerGarment !== "none" ? "IIIIIIII" : "FFFFFFFF");
    rowsBase.push(grammar.innerGarment !== "none" ? "IIIIIIII" : "FFFFFFFF");
    rowsOverlay.push("cccccccc");
    rowsOverlay.push("........");
  } else if (grammar.accessories.toolBelt || grammar.silhouette === "cinched_belt") {
    rowsBase.push("FFFFFFFF");
    rowsBase.push("FFFFFFFF");
    rowsOverlay.push("BBbZZbBB");
    rowsOverlay.push("FFFFFFFF");
  } else if (grammar.accessories.runicTrim) {
    rowsBase.push("FFFFFFFF");
    rowsBase.push("FFFFFFFF");
    rowsOverlay.push("FAAAAAAF");
    rowsOverlay.push("FAAAAAAF");
  } else {
    rowsBase.push("FFFFFFFF");
    rowsBase.push("Gff..ffG");
    rowsOverlay.push(grammar.placket === "open_front" ? "FF....FF" : "FFFFFFFF");
    rowsOverlay.push(grammar.placket === "open_front" ? "cc....cc" : "FFFFFFFF");
  }

  // ROW 10..11: Bottom Hem & Ribbing
  if (isThreeTier) {
    // Three-tier: Extended hoodie ribbed hem on base, bomber outer hem tabs on overlay
    rowsBase.push("vvvvvvvv"); // Ribbed hem highlight
    rowsBase.push("nnnnnnnn"); // Ribbed hem shadow
    rowsOverlay.push("cc....cc");
    rowsOverlay.push("CC....CC");
  } else if (grammar.silhouette === "cropped") {
    rowsBase.push("cccccccc");
    rowsBase.push("CCCCCCCC");
    rowsOverlay.push("........");
    rowsOverlay.push("........");
  } else if (grammar.silhouette === "long_drape") {
    rowsBase.push("FFFFFFFF");
    rowsBase.push("GGGGGGGG");
    rowsOverlay.push("FFFFFFFF");
    rowsOverlay.push("GGGGGGGG");
  } else {
    rowsBase.push("cccccccc");
    rowsBase.push("CCCCCCCC");
    rowsOverlay.push(grammar.placket === "open_front" ? "cc....cc" : "cccccccc");
    rowsOverlay.push(grammar.placket === "open_front" ? "CC....CC" : "CCCCCCCC");
  }

  return { base: rowsBase, overlay: rowsOverlay };
}

export function generateParametricLegBlueprint(
  grammar: LowerBodyGrammar,
  isRight: boolean,
  materials: ComponentMaterials
): {
  base: TokenMatrix;
  overlay: TokenMatrix;
} {
  const flyCol = isRight ? "FFFG" : "GFFF";
  const rowsBase: string[] = [];
  const rowsOverlay: string[] = [];

  // Rows 0..3: Hip & Fly Seams
  rowsBase.push(flyCol);
  rowsBase.push("FFFF");
  rowsBase.push("FFFF");

  // If shorts or pleated skirt, reveal skin at row 3
  if (grammar.fit === "pleated_skirt" || grammar.fit === "shorts_knee_highs") {
    rowsBase.push("KKKK"); // Bare thigh
  } else {
    rowsBase.push("FFFF");
  }

  // Rows 4..6: Knee Articulation / Pockets / Skirt Hem / Knee-High Socks
  if (grammar.socks === "knee_high_striped") {
    rowsBase.push("wwww"); // White / light elastic cuff
    rowsBase.push("YYYY"); // Accent contrast stripe
    rowsBase.push("WWWW"); // Sock body
  } else if (grammar.socks === "knee_high_plain") {
    rowsBase.push("wwww"); // Cuff
    rowsBase.push("WWWW"); // Sock
    rowsBase.push("WWWW");
  } else if (grammar.fit === "pleated_skirt") {
    rowsBase.push("FfFf");
    rowsBase.push("FgFg");
    rowsBase.push("CCCC"); // Skirt hem
  } else if (grammar.cargoPockets || grammar.fit === "wide_cargo") {
    // Base fabric behind cargo pockets with knee crease
    rowsBase.push(isRight ? "GGFF" : "FFGG");
    rowsBase.push(isRight ? "GFFG" : "GFFG");
    rowsBase.push("FFFF");
  } else {
    // Relaxed denim/trouser knee tension crease
    rowsBase.push("FffF"); // Knee fold highlight
    rowsBase.push("FggF"); // Knee fold shadow
    rowsBase.push("FFFF");
  }

  // Row 7: Ankle Break / Sock Bottom / Cuff
  if (grammar.socks === "knee_high_striped") {
    rowsBase.push("YYYY"); // Second contrast stripe above shoe
  } else if (grammar.socks === "knee_high_plain") {
    rowsBase.push("WWWW");
  } else if (grammar.fit === "pleated_skirt") {
    rowsBase.push("KKKK");
  } else {
    rowsBase.push("GGGG");
  }

  // Rows 8..11: Footwear Primitives
  if (grammar.footwear === "sandals_wrap") {
    rowsBase.push("KzKz"); // Ankle cord
    rowsBase.push("zKzK"); // Vamp cord
    rowsBase.push("OOOO"); // Leather sole
    rowsBase.push("OOOO");
  } else if (grammar.footwear === "loafer_oxford") {
    rowsBase.push("SLLS"); // Vamp
    rowsBase.push("SSSS"); // Clean toe
    rowsBase.push("OOOO"); // Low heel block
    rowsBase.push("OOOO");
  } else if (grammar.footwear === "combat_boot") {
    rowsBase.push("SLLS");
    rowsBase.push("SLLS");
    rowsBase.push("****"); // Yellow welt stitch
    rowsBase.push("OOOO"); // Lugged rubber tread
  } else if (grammar.footwear === "snow_boot") {
    rowsBase.push("cccc"); // Fleece trim
    rowsBase.push("SSSS"); // Waterproof shell
    rowsBase.push("MMMM"); // Thick insulating midsole
    rowsBase.push("OOOO");
  } else if (grammar.footwear === "armored_sabaton") {
    rowsBase.push("****"); // Greave ridge
    rowsBase.push("S**S");
    rowsBase.push("M**M"); // Steel toe cap
    rowsBase.push("OOOO");
  } else if (grammar.footwear === "low_top_skate") {
    rowsBase.push(grammar.socks !== "none" ? "WWWW" : "KKKK"); // Ankle reveal or sock
    rowsBase.push("SLLS"); // Skate upper
    rowsBase.push("MMMM"); // 1px white cupsole
    rowsBase.push("OOOO");
  } else if (grammar.footwear === "chunky_sneaker") {
    // 👟 Chunky Sneaker Architecture: Padded collar, tongue, crossed laces, sculpted midsole, lugged tread
    rowsBase.push("SLLS"); // Padded ankle collar & tongue apex
    rowsBase.push("S*LS"); // Eyestay & crossed laces with specular sparkle
    rowsBase.push("MMMM"); // Sculpted thick white midsole
    rowsBase.push("OdOd"); // Dark lugged outsole with deep tread crevices
  } else {
    // High-Top Sneaker
    rowsBase.push("SLLS"); // Padded ankle collar & tongue
    rowsBase.push("SLLS"); // Laces
    rowsBase.push("MMMM"); // 1px pure white midsole
    rowsBase.push("OOOO"); // Dark rubber tread
  }

  // Overlay Rows 0..11: 3D Cargo Pocket Front-Face Wrap
  for (let r = 0; r < 12; r++) {
    if (grammar.cargoPockets) {
      if (isRight) {
        // Right leg front face outer wrap (col 0 connects to lateral pocket)
        if (r === 4) rowsOverlay.push("c...");
        else if (r === 5) rowsOverlay.push("G...");
        else if (r === 6) rowsOverlay.push("F...");
        else if (r === 7) rowsOverlay.push("G...");
        else rowsOverlay.push("....");
      } else {
        // Left leg front face outer wrap (col 3 connects to lateral pocket)
        if (r === 6) rowsOverlay.push("...c");
        else if (r === 7) rowsOverlay.push("...G");
        else if (r === 8) rowsOverlay.push("...F");
        else if (r === 9) rowsOverlay.push("...G");
        else rowsOverlay.push("....");
      }
    } else {
      rowsOverlay.push("....");
    }
  }

  return { base: rowsBase, overlay: rowsOverlay };
}

// ============================================================================
// 7. BLUEPRINT CANVAS, CONTEXTUAL SHADING & MASTER COMPILER
// ============================================================================

export class BlueprintCanvas {
  readonly pixels = new Uint8Array(64 * 64 * 4);

  getPixel(x: number, y: number): [number, number, number, number] {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return [0, 0, 0, 0];
    const offset = (y * 64 + x) * 4;
    return [
      this.pixels[offset],
      this.pixels[offset + 1],
      this.pixels[offset + 2],
      this.pixels[offset + 3],
    ];
  }

  hasPixel(x: number, y: number): boolean {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return false;
    return this.pixels[(y * 64 + x) * 4 + 3] > 0;
  }

  setPixel(x: number, y: number, hex: string, alpha = 255) {
    if (x < 0 || x >= 64 || y < 0 || y >= 64) return;
    const cleanHex = hex.replace(/^#/, "");
    const r = Number.parseInt(cleanHex.slice(0, 2), 16);
    const g = Number.parseInt(cleanHex.slice(2, 4), 16);
    const b = Number.parseInt(cleanHex.slice(4, 6), 16);
    const offset = (y * 64 + x) * 4;
    this.pixels[offset] = r;
    this.pixels[offset + 1] = g;
    this.pixels[offset + 2] = b;
    this.pixels[offset + 3] = alpha;
  }

  stamp(
    startX: number,
    startY: number,
    matrix: TokenMatrix,
    resolver: (token: string, x: number, y: number) => { hex: string; alpha: number } | null
  ) {
    for (let row = 0; row < matrix.length; row++) {
      const line = matrix[row];
      for (let col = 0; col < line.length; col++) {
        const token = line[col];
        if (token === "." || token === " ") continue;
        const result = resolver(token, col, row);
        if (result && result.alpha > 0) {
          this.setPixel(startX + col, startY + row, result.hex, result.alpha);
        }
      }
    }
  }
}

/**
 * Layer-Aware Contact Shadow Composer
 * Casts subtle directional contact occlusion from upper layers onto lower surfaces.
 */
export function applyContactShadow(
  canvas: BlueprintCanvas,
  x: number,
  y: number,
  depth = 0.15,
  materialType: "fabric" | "skin" | "metal" = "fabric"
) {
  const [r, g, b, a] = canvas.getPixel(x, y);
  if (a > 0) {
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    canvas.setPixel(x, y, shadeWithHueShift(hex, -depth, materialType), a);
  }
}

/**
 * Directional Global Lighting Processor
 * Applies form-following directional shading based on design.lightingDirection.
 * Protects specular whites, deep blacks, and eye irises from distortion.
 */
export function applyDirectionalLighting(
  canvas: BlueprintCanvas,
  lightDirection: "upper-left" | "upper-right" | "front" | "top-down" = "upper-left",
  model: MinecraftArmModel = "classic"
) {
  if (lightDirection === "front") return; // Balanced even ambient lighting

  const armW = model === "slim" ? 3 : 4;
  const isUpperLeft = lightDirection === "upper-left";

  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const [r, g, b, a] = canvas.getPixel(x, y);
      if (a === 0) continue;

      // Protect pure catchlights / sclera whites
      if (r >= 250 && g >= 250 && b >= 250) continue;
      // Protect pure shadow crevices / pupils
      if (r <= 10 && g <= 10 && b <= 10) continue;
      // Protect front face eye region (x: 8..15, y: 10..13)
      if (x >= 8 && x < 16 && y >= 10 && y <= 13) continue;

      let shift = 0;

      if (isUpperLeft) {
        // Top-facing head and shoulder planes (light directly from above)
        if (y < 8) shift += 0.05;

        // West-facing surfaces (Viewer's left)
        const isWestFacing =
          (x >= 0 && x < 8 && y >= 8 && y < 16) ||   // Right lateral of head
          (x >= 8 && x < 12 && y >= 8 && y < 16) ||  // Left side of front face
          (x >= 20 && x < 24 && y >= 20 && y < 32) || // Left side of front torso base
          (x >= 20 && x < 24 && y >= 36 && y < 48) || // Left side of front torso overlay
          (x >= 4 && x < 6 && y >= 20 && y < 32) ||   // Left side of right leg
          (x >= 40 && x < 44 && y >= 20 && y < 32);   // Right arm outer face

        // East-facing surfaces (Viewer's right / shadow side)
        const isEastFacing =
          (x >= 16 && x < 24 && y >= 8 && y < 16) ||  // Left lateral of head
          (x >= 12 && x < 16 && y >= 8 && y < 16) ||  // Right side of front face
          (x >= 24 && x < 28 && y >= 20 && y < 32) || // Right side of front torso base
          (x >= 24 && x < 28 && y >= 36 && y < 48) || // Right side of front torso overlay
          (x >= 6 && x < 8 && y >= 20 && y < 32) ||   // Right side of right leg
          (x >= 22 && x < 24 && y >= 52 && y < 64) || // Right side of left leg
          (x >= 32 + armW && x < 36 + armW && y >= 52 && y < 64); // Left arm outer face

        if (isWestFacing) shift += 0.06;
        if (isEastFacing) shift -= 0.07;

        // Subtle lower-body ground shadow
        if (y >= 44 && !isWestFacing) shift -= 0.04;
      } else if (lightDirection === "upper-right") {
        if (y < 8) shift += 0.05;
        const isEastFacing = (x >= 12 && x < 16 && y >= 8 && y < 16) || (x >= 24 && x < 28);
        const isWestFacing = (x >= 8 && x < 12 && y >= 8 && y < 16) || (x >= 20 && x < 24);
        if (isEastFacing) shift += 0.06;
        if (isWestFacing) shift -= 0.07;
      } else if (lightDirection === "top-down") {
        if (y < 8) shift += 0.08;
        if (y > 40) shift -= 0.06;
      }

      if (shift !== 0) {
        const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
        canvas.setPixel(x, y, shadeWithHueShift(hex, shift, "fabric"), a);
      }
    }
  }
}

export function getBlueprintArmFaces(
  model: MinecraftArmModel,
  side: "right" | "left",
  overlay = false
): ArmFaces {
  const slim = model === "slim";
  const armWidth = slim ? 3 : 4;
  const depth = 4;

  if (side === "right") {
    const y = overlay ? 32 : 16;
    const bodyY = overlay ? 36 : 20;
    return {
      top: { x: 44, y, width: armWidth, height: depth },
      bottom: { x: 44 + armWidth, y, width: armWidth, height: depth },
      right: { x: 40, y: bodyY, width: depth, height: 12 },
      front: { x: 44, y: bodyY, width: armWidth, height: 12 },
      left: { x: 44 + armWidth, y: bodyY, width: depth, height: 12 },
      back: { x: 44 + armWidth + depth, y: bodyY, width: armWidth, height: 12 },
    };
  }

  const y = 48;
  const bodyY = 52;
  const start = overlay ? 48 : 32;
  const topX = overlay ? 52 : 36;
  return {
    top: { x: topX, y, width: armWidth, height: depth },
    bottom: { x: topX + armWidth, y, width: armWidth, height: depth },
    right: { x: start, y: bodyY, width: depth, height: 12 },
    front: { x: topX, y: bodyY, width: armWidth, height: 12 },
    left: { x: topX + armWidth, y: bodyY, width: depth, height: 12 },
    back: { x: topX + armWidth + depth, y: bodyY, width: armWidth, height: 12 },
  };
}

export interface BlueprintCompileOptions {
  mode?: "baseline" | "expanded";
}

export function compileMinecraftSkinBlueprint(
  designInput: Partial<MinecraftSkinDesign>,
  seed = 12345,
  model: MinecraftArmModel = "classic",
  style: MinecraftSkinStyle = "balanced",
  prompt = "",
  options?: BlueprintCompileOptions
): Uint8Array {
  const isBaseline = options?.mode === "baseline";

  // 1. Safe Semantic Palette & Design Extraction (Eliminating keyword hijacking)
  const design = safeExtractBlueprintDesign(designInput, prompt, seed);
  const palette = design.palette;
  const canvas = new BlueprintCanvas();

  // 2. Synthesize Parametric Composition Grammars from Prompt & Design
  const garmentGrammar = analyzeGarmentGrammar(prompt, design, seed);
  const lowerGrammar = analyzeLowerBodyGrammar(prompt, design);

  if (isBaseline) {
    garmentGrammar.midLayer = "none";
    garmentGrammar.innerGarment = "none";
    garmentGrammar.placket = "closed";
    garmentGrammar.sleeve = "straight";
    lowerGrammar.cargoPockets = false;
    lowerGrammar.footwear = "low_top_skate";
  }

  // 3. Per-Component Material Ownership (Independent profiles, no unwanted inheritance)
  const lowerPrompt = prompt.toLowerCase();
  const hasMidLayer = garmentGrammar.midLayer !== "none";
  const hasInner = garmentGrammar.innerGarment !== "none";
  const isThreeTier = garmentGrammar.placket === "open_front" && hasMidLayer;

  const topMaterial: MaterialType =
    /\b(metal|plate|armor|steel|iron)\b/i.test(lowerPrompt) ? "metal"
      : /\b(leather)\b/i.test(lowerPrompt) ? "leather"
        : /\b(denim|jeans)\b/i.test(lowerPrompt) ? "denim"
          : /\b(bomber|flight jacket)\b/i.test(lowerPrompt) || design.garmentType === "bomber-jacket" ? "technical-fabric"
            : /\b(knit|wool|sweater|cardigan)\b/i.test(lowerPrompt) ? "knit"
              : /\b(techwear|utility|plastic|vinyl|nylon)\b/i.test(lowerPrompt) ? "plastic"
                : "cotton";

  const midMaterial: MaterialType =
    garmentGrammar.midLayer === "hoodie" ? "hoodie"
      : garmentGrammar.midLayer === "sweater" ? "knit"
        : "cotton";

  const innerMaterial: MaterialType =
    garmentGrammar.innerGarment === "cable_knit" ? "knit"
      : garmentGrammar.innerGarment === "turtleneck" ? "knit"
        : "undershirt";

  const pauldronMaterial: MaterialType = "metal"; // Explicit pauldron ownership: always metal
  const strapMaterial: MaterialType = garmentGrammar.accessories.safetyStraps ? "plastic" : "leather";
  const beltMaterial: MaterialType = "leather";

  const pantsMaterial: MaterialType =
    /\b(leather)\b/i.test(lowerPrompt) ? "leather"
      : /\b(denim|jeans)\b/i.test(lowerPrompt) ? "denim"
        : /\b(metal|greaves?)\b/i.test(lowerPrompt) ? "metal"
          : "cotton";

  const footwearMaterial: MaterialType =
    lowerGrammar.footwear === "armored_sabaton" ? "metal"
      : lowerGrammar.footwear === "sandals_wrap" || lowerGrammar.footwear === "combat_boot" ? "leather"
        : "rubber";

  const componentMaterials: ComponentMaterials = {
    top: topMaterial,
    mid: midMaterial,
    inner: innerMaterial,
    pauldron: pauldronMaterial,
    strap: strapMaterial,
    belt: beltMaterial,
    pants: pantsMaterial,
    footwear: footwearMaterial,
    socks: "cotton",
    hair: "hair",
    skin: "skin",
  };

  // 4. Build Independent Material Ramps per Component
  const innerHex = (hasMidLayer && hasInner) || /\bcream\b/i.test(prompt)
    ? "#faf5ee"
    : /\bwhite\b/i.test(prompt)
      ? "#f8fafc"
      : (palette.topAccent && palette.topAccent !== palette.top) ? "#faf5ee" : "#f1f5f9";

  const zipperColor = garmentGrammar.zipper === "gold" ? "#f59e0b" : "#cbd5e1";

  const skinRamp = buildMaterialRamp(palette.skin, "skin");
  const hairRamp = buildMaterialRamp(palette.hair, "hair");
  const topRamp = buildMaterialRamp(palette.top, topMaterial, palette.topAccent);
  const midRamp = buildMaterialRamp(palette.topAccent || "#c084fc", midMaterial, palette.top);
  const innerRamp = buildMaterialRamp(innerHex, "undershirt", palette.topAccent);
  const pauldronRamp = buildMaterialRamp("#94a3b8", pauldronMaterial, "#f59e0b");
  const strapRamp = buildMaterialRamp(garmentGrammar.accessories.safetyStraps ? "#ea580c" : "#451a03", strapMaterial, "#f59e0b");
  const beltRamp = buildMaterialRamp("#292524", beltMaterial, "#cbd5e1");
  const sockRamp = buildMaterialRamp("#f8fafc", "cotton", palette.topAccent || palette.top);
  const pantsRamp = buildMaterialRamp(palette.pants, pantsMaterial);
  const shoesRamp = buildMaterialRamp(palette.shoes, footwearMaterial);

  // 5. Composition Parameters
  const partOffset = ((seed % 100) / 100) * 0.4 - 0.2;
  const foldBias = seed % 3 === 0 ? "left" : seed % 3 === 1 ? "right" : "center";
  const asymmetry = (seed % 100) / 100;

  // 6. Generate Component Blueprints
  const hairBp = generateHairBlueprint({
    silhouette: design.hairSilhouette || "curtain-bangs",
    partOffset,
    asymmetry,
    length: 0.8,
    seed,
    accessories: {
      catEars: garmentGrammar.accessories.catEars,
      headband: garmentGrammar.accessories.headband,
    },
  });

  const faceBp = generateFaceBlueprint(design.faceConstruction || "clean-aesthetic");

  const torsoBp = generateParametricTorsoBlueprint(garmentGrammar, foldBias, asymmetry, componentMaterials);
  const rightLegBp = generateParametricLegBlueprint(lowerGrammar, true, componentMaterials);
  const leftLegBp = generateParametricLegBlueprint(lowerGrammar, false, componentMaterials);

  // -------------------------------------------------------------
  // RENDER HEAD BASE & FACE
  // -------------------------------------------------------------
  // 1. Neck contact shadow
  for (let dy = 0; dy < 8; dy++) {
    for (let dx = 0; dx < 8; dx++) {
      canvas.setPixel(16 + dx, 0 + dy, shadeWithHueShift(skinRamp.base, -0.16, "skin"));
    }
  }

  // 2. Base hair on top of head with crown sheen
  for (let dy = 0; dy < 8; dy++) {
    for (let dx = 0; dx < 8; dx++) {
      canvas.setPixel(8 + dx, 0 + dy, hairRamp.base);
    }
  }
  canvas.setPixel(10, 2, hairRamp.light);
  canvas.setPixel(11, 2, hairRamp.highlight);
  canvas.setPixel(11, 3, hairRamp.light);

  // 3. Base hair on back of head
  for (let dy = 0; dy < 8; dy++) {
    for (let dx = 0; dx < 8; dx++) {
      canvas.setPixel(24 + dx, 8 + dy, dy >= 5 ? hairRamp.shadow : hairRamp.base);
    }
  }

  // 4. Base hair on sides of head with ear reveals
  for (let dy = 0; dy < 8; dy++) {
    for (let dx = 0; dx < 8; dx++) {
      canvas.setPixel(0 + dx, 8 + dy, dy >= 5 ? hairRamp.shadow : hairRamp.base);
      canvas.setPixel(16 + dx, 8 + dy, dy >= 5 ? hairRamp.shadow : hairRamp.base);
    }
  }
  canvas.setPixel(3, 11, skinRamp.base);
  canvas.setPixel(4, 11, skinRamp.base);
  canvas.setPixel(3, 12, skinRamp.shadow);
  canvas.setPixel(4, 12, skinRamp.shadow);
  canvas.setPixel(19, 11, skinRamp.base);
  canvas.setPixel(20, 11, skinRamp.base);
  canvas.setPixel(19, 12, skinRamp.shadow);
  canvas.setPixel(20, 12, skinRamp.shadow);

  // 5. Base skin on front face
  for (let dy = 0; dy < 8; dy++) {
    for (let dx = 0; dx < 8; dx++) {
      canvas.setPixel(8 + dx, 8 + dy, skinRamp.base);
    }
  }
  for (let dx = 0; dx < 8; dx++) {
    canvas.setPixel(8 + dx, 8, hairRamp.shadow);
  }
  canvas.setPixel(8, 9, hairRamp.base);
  canvas.setPixel(8, 10, hairRamp.shadow);
  canvas.setPixel(15, 9, hairRamp.base);
  canvas.setPixel(15, 10, hairRamp.shadow);

  // Stamp Face Blueprint onto front face (with 2px nose bridge eye separation)
  canvas.stamp(8, 8, faceBp, (tok) => {
    switch (tok) {
      case "K": return { hex: skinRamp.base, alpha: 255 };
      case "k": return { hex: skinRamp.highlight, alpha: 255 };
      case "s": return { hex: skinRamp.shadow, alpha: 255 };
      case "d": return { hex: skinRamp.deepShadow, alpha: 255 };
      case "B": return { hex: hairRamp.shadow, alpha: 255 };
      case "b": return { hex: hairRamp.deepShadow, alpha: 255 };
      case "w": return { hex: "#f8fafc", alpha: 255 };
      case "E": return { hex: palette.eyes || "#38bdf8", alpha: 255 };
      case "e": return { hex: shadeWithHueShift(palette.eyes || "#38bdf8", 0.15, "neon"), alpha: 255 };
      case "*": return { hex: "#ffffff", alpha: 255 };
      case "p": return { hex: hairRamp.deepShadow, alpha: 255 };
      case "r": return { hex: skinRamp.accent || "#fb7185", alpha: 255 };
      case "l": return { hex: shadeWithHueShift(skinRamp.base, -0.09, "skin"), alpha: 255 };
      case "A": return { hex: palette.topAccent || "#06b6d4", alpha: 255 };
      default: return null;
    }
  });

  // -------------------------------------------------------------
  // RENDER HAIR OVERLAY (Front, Top, Left, Right, Back)
  // -------------------------------------------------------------
  const hairResolver = (tok: string) => {
    switch (tok) {
      case "H": return { hex: hairRamp.base, alpha: 255 };
      case "L": return { hex: hairRamp.light, alpha: 255 };
      case "h": return { hex: hairRamp.highlight, alpha: 255 };
      case "*": return { hex: hairRamp.specular || "#ffffff", alpha: 255 };
      case "S": return { hex: hairRamp.shadow, alpha: 255 };
      case "D": return { hex: hairRamp.deepShadow, alpha: 255 };
      case "r": return { hex: skinRamp.accent || "#fb7185", alpha: 255 }; // Cat ear inner fluff
      case "A": return { hex: palette.topAccent || "#06b6d4", alpha: 255 }; // Headband
      default: return null;
    }
  };

  canvas.stamp(40, 0, hairBp.top, hairResolver);
  canvas.stamp(40, 8, hairBp.front, hairResolver);
  canvas.stamp(32, 8, hairBp.right, hairResolver);
  canvas.stamp(48, 8, hairBp.left, hairResolver);
  canvas.stamp(56, 8, hairBp.back, hairResolver);

  // -------------------------------------------------------------
  // RENDER TORSO BASE & OVERLAY (With Per-Component Material Ownership)
  // -------------------------------------------------------------
  const torsoBaseFaces = [
    { x: 20, y: 16, w: 8, h: 4 },
    { x: 28, y: 16, w: 8, h: 4 },
    { x: 16, y: 20, w: 4, h: 12 },
    { x: 20, y: 20, w: 8, h: 12 },
    { x: 28, y: 20, w: 4, h: 12 },
    { x: 32, y: 20, w: 8, h: 12 },
  ];
  const torsoBaseColor = (hasMidLayer && garmentGrammar.placket === "open_front")
    ? midRamp.base
    : topRamp.base;
  torsoBaseFaces.forEach((f) => {
    for (let dy = 0; dy < f.h; dy++) {
      for (let dx = 0; dx < f.w; dx++) {
        canvas.setPixel(f.x + dx, f.y + dy, torsoBaseColor);
      }
    }
  });

  const torsoResolver = (tok: string) => {
    switch (tok) {
      // Outer garment tokens (topRamp)
      case "F": return { hex: topRamp.base, alpha: 255 };
      case "f": return { hex: topRamp.light, alpha: 255 };
      case "g": return { hex: topRamp.shadow, alpha: 255 };
      case "G": return { hex: topRamp.deepShadow, alpha: 255 };
      case "C": return { hex: topRamp.deepShadow, alpha: 255 };
      case "c": return { hex: topRamp.highlight, alpha: 255 };
      case "*": return { hex: topRamp.specular || "#ffffff", alpha: 255 };

      // Mid garment tokens (midRamp) - Three-Tier Garment Composition
      case "M": return { hex: midRamp.base, alpha: 255 };
      case "m": return { hex: midRamp.light, alpha: 255 };
      case "n": return { hex: midRamp.shadow, alpha: 255 };
      case "N": return { hex: midRamp.deepShadow, alpha: 255 };
      case "V": return { hex: midRamp.deepShadow, alpha: 255 }; // Mid hood cowl collar
      case "v": return { hex: midRamp.highlight, alpha: 255 };  // Mid ribbed pocket welt / hem highlight

      // Inner garment tokens (innerRamp) - Dual & Three-Tier Core
      case "I": return { hex: innerRamp.base, alpha: 255 };
      case "i": return { hex: innerRamp.light, alpha: 255 };
      case "j": return { hex: innerRamp.shadow, alpha: 255 };
      case "X": return { hex: innerRamp.accent || "#06b6d4", alpha: 255 }; // Graphic print or stripe

      // Pauldron tokens (pauldronRamp) - Explicit Metal Plate Ownership
      case "P": return { hex: pauldronRamp.base, alpha: 255 };
      case "p": return { hex: pauldronRamp.specular || "#ffffff", alpha: 255 };
      case "q": return { hex: pauldronRamp.shadow, alpha: 255 };

      // Utility Strap tokens (strapRamp) - Explicit Leather / Techwear Ownership
      case "U": return { hex: strapRamp.base, alpha: 255 };
      case "u": return { hex: strapRamp.light, alpha: 255 };
      case "v": return { hex: strapRamp.shadow, alpha: 255 };

      // Belt, Hardware & Buckle tokens
      case "B": return { hex: beltRamp.base, alpha: 255 };
      case "b": return { hex: pauldronRamp.specular || "#ffffff", alpha: 255 }; // Metal buckle
      case "Z": return { hex: zipperColor, alpha: 255 }; // Metal zipper teeth / slider
      case "z": return { hex: "#faf5ee", alpha: 255 }; // Hoodie drawstring cord
      case "A": return { hex: topRamp.accent || "#06b6d4", alpha: 255 };
      case "K": return { hex: skinRamp.base, alpha: 255 };
      default: return null;
    }
  };

  canvas.stamp(20, 20, torsoBp.base, torsoResolver);
  canvas.stamp(20, 36, torsoBp.overlay, torsoResolver);

  // Wrap Torso Overlay Sides & Back
  for (let dy = 0; dy < 12; dy++) {
    for (let dx = 0; dx < 4; dx++) {
      canvas.setPixel(16 + dx, 36 + dy, dy >= 10 ? topRamp.deepShadow : topRamp.base);
      canvas.setPixel(28 + dx, 36 + dy, dy >= 10 ? topRamp.deepShadow : topRamp.base);
    }
  }
  for (let dy = 0; dy < 12; dy++) {
    for (let dx = 0; dx < 8; dx++) {
      canvas.setPixel(32 + dx, 36 + dy, dy >= 10 ? topRamp.deepShadow : topRamp.base);
    }
  }

  // 3D Resting Hood on back overlay
  if (garmentGrammar.neckline === "hood_cowl" && design.hoodState !== "up") {
    for (let dx = 1; dx <= 6; dx++) {
      canvas.setPixel(32 + dx, 36, topRamp.light);
      canvas.setPixel(32 + dx, 37, topRamp.highlight);
      canvas.setPixel(32 + dx, 38, topRamp.shadow);
    }
    canvas.setPixel(32, 37, topRamp.base);
    canvas.setPixel(39, 37, topRamp.base);
    for (let dx = 2; dx <= 5; dx++) {
      canvas.setPixel(32 + dx, 39, topRamp.deepShadow);
    }
  }

  // -------------------------------------------------------------
  // RENDER LEGS & FOOTWEAR (With Socks & Knee-High Stripes)
  // -------------------------------------------------------------
  const isCombat = lowerGrammar.footwear === "combat_boot";
  const shoeMidColor = isCombat ? "#eab308" : "#f8fafc";
  const shoeOutColor = "#09090b";

  const rightLegFaceList = [
    { x: 0, y: 20, w: 4, h: 12 },
    { x: 4, y: 20, w: 4, h: 12 },
    { x: 8, y: 20, w: 4, h: 12 },
    { x: 12, y: 20, w: 4, h: 12 },
  ];
  rightLegFaceList.forEach((f) => {
    for (let dy = 0; dy < 12; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        if (dy < 7) {
          canvas.setPixel(f.x + dx, f.y + dy, pantsRamp.base);
        } else if (dy === 7) {
          canvas.setPixel(f.x + dx, f.y + dy, pantsRamp.shadow);
        } else if (dy < 10) {
          canvas.setPixel(f.x + dx, f.y + dy, shoesRamp.base);
        } else if (dy === 10) {
          canvas.setPixel(f.x + dx, f.y + dy, shoeMidColor);
        } else {
          canvas.setPixel(f.x + dx, f.y + dy, shoeOutColor);
        }
      }
    }
  });

  const legResolver = (tok: string) => {
    switch (tok) {
      case "F": return { hex: pantsRamp.base, alpha: 255 };
      case "f": return { hex: pantsRamp.light, alpha: 255 };
      case "g": return { hex: pantsRamp.shadow, alpha: 255 };
      case "G": return { hex: pantsRamp.deepShadow, alpha: 255 };
      case "c": return { hex: pantsRamp.highlight, alpha: 255 }; // Cargo flap highlight
      case "C": return { hex: pantsRamp.light, alpha: 255 };     // Cargo flap top
      // Socks tokens (sockRamp)
      case "W": return { hex: sockRamp.base, alpha: 255 };
      case "w": return { hex: sockRamp.light, alpha: 255 };
      case "Y": return { hex: sockRamp.accent || "#06b6d4", alpha: 255 }; // Contrast horizontal stripe
      // Footwear tokens
      case "S": return { hex: shoesRamp.base, alpha: 255 };
      case "L": return { hex: "#cbd5e1", alpha: 255 }; // Laces / tongue
      case "M": return { hex: "#f8fafc", alpha: 255 }; // Midsole
      case "m": return { hex: "#cbd5e1", alpha: 255 }; // Midsole accent / air unit
      case "O": return { hex: "#09090b", alpha: 255 }; // Outsole tread
      case "d": return { hex: "#000000", alpha: 255 }; // Deep tread crevice darks
      case "*": return { hex: "#ffffff", alpha: 255 }; // Crisp lace / eyelet glint
      case "K": return { hex: skinRamp.base, alpha: 255 };
      case "z": return { hex: "#78350f", alpha: 255 }; // Leather cord
      default: return null;
    }
  };

  canvas.stamp(4, 20, rightLegBp.base, legResolver);

  const leftLegFaceList = [
    { x: 16, y: 52, w: 4, h: 12 },
    { x: 20, y: 52, w: 4, h: 12 },
    { x: 24, y: 52, w: 4, h: 12 },
    { x: 28, y: 52, w: 4, h: 12 },
  ];
  leftLegFaceList.forEach((f) => {
    for (let dy = 0; dy < 12; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        if (dy < 7) {
          canvas.setPixel(f.x + dx, f.y + dy, pantsRamp.base);
        } else if (dy === 7) {
          canvas.setPixel(f.x + dx, f.y + dy, pantsRamp.shadow);
        } else if (dy < 10) {
          canvas.setPixel(f.x + dx, f.y + dy, shoesRamp.base);
        } else if (dy === 10) {
          canvas.setPixel(f.x + dx, f.y + dy, shoeMidColor);
        } else {
          canvas.setPixel(f.x + dx, f.y + dy, shoeOutColor);
        }
      }
    }
  });

  canvas.stamp(20, 52, leftLegBp.base, legResolver);

  // Stamp front face overlays
  canvas.stamp(4, 36, rightLegBp.overlay, legResolver);
  canvas.stamp(4, 52, leftLegBp.overlay, legResolver);

  // 3D Cargo Pocket Overlays on lateral outer faces
  if (lowerGrammar.cargoPockets) {
    // Right Leg Outer Lateral Face Overlay (x: 0..3, y: 36..47)
    canvas.stamp(0, 36, [
      "....",
      "....",
      "....",
      "....",
      "cCCc", // Pocket flap top lid
      "gGGg", // Pocket flap edge + shadow slit
      "FffF", // Pocket pouch bellow
      "GGGG", // Bottom drop shadow
      "....",
      "....",
      "....",
      "....",
    ], legResolver);

    // Left Leg Outer Lateral Face Overlay (x: 8..11, y: 52..63)
    const leftLateralPouch = garmentGrammar.asymmetry
      ? [
          "....",
          "....",
          "....",
          "....",
          "UUUU", // Asymmetric utility strap
          "uuZZ", // Strap buckle
          "cCCc", // Lower cargo pocket flap lid
          "gGGg", // Flap shadow slit
          "FffF", // Pocket pouch bellow
          "GGGG", // Bottom drop shadow
          "....",
          "....",
        ]
      : [
          "....",
          "....",
          "....",
          "....",
          "cCCc",
          "gGGg",
          "FffF",
          "GGGG",
          "....",
          "....",
          "....",
          "....",
        ];
    canvas.stamp(8, 52, leftLateralPouch, (tok) => {
      if (tok === "U") return { hex: strapRamp.base, alpha: 255 };
      if (tok === "u") return { hex: strapRamp.light, alpha: 255 };
      if (tok === "Z") return { hex: pauldronRamp.specular || "#cbd5e1", alpha: 255 };
      return legResolver(tok);
    });
  }

  // -------------------------------------------------------------
  // RENDER ARMS & HANDS (Dual-Layer Sleeves & Pauldrons)
  // -------------------------------------------------------------
  const rightArmFaces = getBlueprintArmFaces(model, "right");
  const leftArmFaces = getBlueprintArmFaces(model, "left");
  const rightOvArmFaces = getBlueprintArmFaces(model, "right", true);
  const leftOvArmFaces = getBlueprintArmFaces(model, "left", true);

  const isVarsity = /\bvarsity\b/i.test(prompt);
  const armSleeveColor = isVarsity ? (palette.topAccent || "#faf5ef") : topRamp.base;
  const isLayeredUndershirt = garmentGrammar.sleeve === "layered_undershirt";
  const isShortSleeve = garmentGrammar.sleeve === "short_sleeve";
  const isSlouchGather = garmentGrammar.sleeve === "slouch_gather";

  // When slouch_gather with a midLayer hoodie, outer jacket sleeve gathers at row 7
  const outerSleeveRows = isLayeredUndershirt ? 4
    : isShortSleeve ? 4
      : (isSlouchGather && hasMidLayer) ? 7
        : 10;

  // Render Right Arm Base
  Object.values(rightArmFaces).forEach((f: Face) => {
    for (let dy = 0; dy < f.height; dy++) {
      for (let dx = 0; dx < f.width; dx++) {
        if (isSlouchGather && hasMidLayer) {
          if (dy < 8) {
            // Under-sleeve: Lavender hoodie sleeve with soft tension folds
            const fold = (dy === 4 || dy === 6) ? midRamp.shadow : (dy === 2) ? midRamp.light : midRamp.base;
            canvas.setPixel(f.x + dx, f.y + dy, fold);
          } else if (dy < 10) {
            // Visible extended ribbed hoodie cuff extending past jacket
            const cuffColor = dy === 8 ? midRamp.highlight : midRamp.shadow;
            canvas.setPixel(f.x + dx, f.y + dy, cuffColor);
          } else {
            // Bare skin wrist and hands
            canvas.setPixel(f.x + dx, f.y + dy, skinRamp.base);
          }
        } else if (dy < outerSleeveRows) {
          canvas.setPixel(f.x + dx, f.y + dy, armSleeveColor);
        } else if (isLayeredUndershirt && dy < 10) {
          const isStripe = dy % 2 === 1;
          const innerColor = isStripe ? (innerRamp.accent || "#06b6d4") : innerRamp.base;
          canvas.setPixel(f.x + dx, f.y + dy, innerColor);
        } else {
          canvas.setPixel(f.x + dx, f.y + dy, skinRamp.base);
        }
      }
    }
    // Palm / knuckle shadow
    canvas.setPixel(f.x + 1, f.y + 11, skinRamp.shadow);
    if (f.width >= 4) canvas.setPixel(f.x + 2, f.y + 11, skinRamp.shadow);
  });

  // Render Left Arm Base
  Object.values(leftArmFaces).forEach((f: Face) => {
    for (let dy = 0; dy < f.height; dy++) {
      for (let dx = 0; dx < f.width; dx++) {
        if (isSlouchGather && hasMidLayer) {
          if (dy < 8) {
            const fold = (dy === 4 || dy === 6) ? midRamp.shadow : (dy === 2) ? midRamp.light : midRamp.base;
            canvas.setPixel(f.x + dx, f.y + dy, fold);
          } else if (dy < 10) {
            const cuffColor = dy === 8 ? midRamp.highlight : midRamp.shadow;
            canvas.setPixel(f.x + dx, f.y + dy, cuffColor);
          } else {
            canvas.setPixel(f.x + dx, f.y + dy, skinRamp.base);
          }
        } else if (dy < outerSleeveRows) {
          canvas.setPixel(f.x + dx, f.y + dy, armSleeveColor);
        } else if (isLayeredUndershirt && dy < 10) {
          const isStripe = dy % 2 === 1;
          const innerColor = isStripe ? (innerRamp.accent || "#06b6d4") : innerRamp.base;
          canvas.setPixel(f.x + dx, f.y + dy, innerColor);
        } else {
          canvas.setPixel(f.x + dx, f.y + dy, skinRamp.base);
        }
      }
    }
    canvas.setPixel(f.x + 1, f.y + 11, skinRamp.shadow);
    if (f.width >= 4) canvas.setPixel(f.x + 2, f.y + 11, skinRamp.shadow);
  });

  // Render 3D Outer Sleeve Overlays & Pauldrons
  [rightOvArmFaces, leftOvArmFaces].forEach((armGroup, armIdx) => {
    [armGroup.right, armGroup.front, armGroup.left, armGroup.back].forEach((f) => {
      // 1. Sleeve overlay
      for (let dy = 0; dy < outerSleeveRows; dy++) {
        for (let dx = 0; dx < f.width; dx++) {
          if (isSlouchGather && hasMidLayer && dy === outerSleeveRows - 1) {
            // Gathered elastic jacket cuff band
            canvas.setPixel(f.x + dx, f.y + dy, dx % 2 === 0 ? topRamp.deepShadow : topRamp.highlight);
          } else {
            canvas.setPixel(f.x + dx, f.y + dy, armSleeveColor);
          }
        }
      }
      if (outerSleeveRows >= 8) {
        for (let dx = 0; dx < f.width; dx++) {
          canvas.setPixel(f.x + dx, f.y + outerSleeveRows - 1, topRamp.light);
        }
        canvas.setPixel(f.x + 1, f.y + 5, topRamp.shadow);
      } else if (isSlouchGather && hasMidLayer) {
        // Slouch gather tension folds on outer jacket overlay
        canvas.setPixel(f.x + 1, f.y + 3, topRamp.shadow);
        canvas.setPixel(f.x + 2, f.y + 4, topRamp.light);
      }

      // 2. Pauldron Component Ownership: Always rendered with metalSpecular spikes & plate creases
      if (garmentGrammar.accessories.pauldrons) {
        for (let dx = 0; dx < f.width; dx++) {
          canvas.setPixel(f.x + dx, f.y + 0, pauldronRamp.specular || "#ffffff"); // Specular apex ridge
          canvas.setPixel(f.x + dx, f.y + 1, pauldronRamp.base);                  // Metal body
          canvas.setPixel(f.x + dx, f.y + 2, pauldronRamp.shadow);                // Crevice shadow
        }
        // Also cap top shoulder plate
        for (let tdy = 0; tdy < armGroup.top.height; tdy++) {
          for (let tdx = 0; tdx < armGroup.top.width; tdx++) {
            canvas.setPixel(
              armGroup.top.x + tdx,
              armGroup.top.y + tdy,
              tdy === 1 ? (pauldronRamp.specular || "#ffffff") : pauldronRamp.base
            );
          }
        }
      }
    });
  });

  // MA-1 Flight Tag on left sleeve outer overlay
  if (garmentGrammar.accessories.flightTag) {
    canvas.setPixel(leftOvArmFaces.left.x + 1, leftOvArmFaces.left.y + 3, "#94a3b8");
    canvas.setPixel(leftOvArmFaces.left.x + 1, leftOvArmFaces.left.y + 4, topRamp.deepShadow);
    canvas.setPixel(leftOvArmFaces.left.x + 2, leftOvArmFaces.left.y + 5, "#ef4444");
    canvas.setPixel(leftOvArmFaces.left.x + 2, leftOvArmFaces.left.y + 6, "#ef4444");
  }

  // -------------------------------------------------------------
  // LAYER-AWARE CONTEXTUAL SHADING PASS
  // -------------------------------------------------------------
  // 1. Hair -> Forehead Soft Contact Shadow
  for (let col = 0; col < 8; col++) {
    for (let row = 7; row >= 0; row--) {
      if (hairBp.front[row]?.[col] && hairBp.front[row][col] !== ".") {
        const contactY = 8 + row + 1;
        if (contactY <= 15) {
          applyContactShadow(canvas, 8 + col, contactY, 0.14, "skin");
        }
        break;
      }
    }
  }

  // 2. Outer Garment / Lapel -> Inner / Mid Garment Contact Shadow
  if (garmentGrammar.placket === "open_front") {
    for (let y = 21; y <= 27; y++) {
      applyContactShadow(canvas, 22, y, 0.16, "fabric");
      applyContactShadow(canvas, 25, y, 0.16, "fabric");
    }
  }

  // 3. Mid Hoodie -> Inner Undershirt Contact Shadow
  if (hasMidLayer && hasInner) {
    for (let y = 20; y <= 22; y++) {
      applyContactShadow(canvas, 23, y, 0.14, "fabric");
      applyContactShadow(canvas, 24, y, 0.14, "fabric");
    }
  }

  // 4. Neckline & Chin -> Clavicle Contact Shadow
  for (let x = 22; x <= 25; x++) {
    applyContactShadow(canvas, x, 20, 0.18, "fabric");
  }

  // 5. Waist Hem / Belt -> Lower Body Contact Shadow
  for (let y = 20; y <= 21; y++) {
    for (let x = 4; x <= 7; x++) {
      applyContactShadow(canvas, x, y, 0.14, "fabric");
    }
  }
  for (let y = 52; y <= 53; y++) {
    for (let x = 20; x <= 23; x++) {
      applyContactShadow(canvas, x, y, 0.14, "fabric");
    }
  }

  // 6. Pauldron -> Upper Sleeve Contact Shadow
  if (garmentGrammar.accessories.pauldrons) {
    [rightArmFaces.front, rightArmFaces.right, leftArmFaces.front, leftArmFaces.left].forEach((f) => {
      for (let dx = 0; dx < f.width; dx++) {
        applyContactShadow(canvas, f.x + dx, f.y + 3, 0.20, "fabric");
      }
    });
  }

  // 7. Bomber Sleeve Cuff -> Underlying Hoodie Cuff Contact Shadow
  if (isSlouchGather && hasMidLayer) {
    [rightArmFaces.front, rightArmFaces.right, leftArmFaces.front, leftArmFaces.left].forEach((f) => {
      for (let dx = 0; dx < f.width; dx++) {
        applyContactShadow(canvas, f.x + dx, f.y + 7, 0.20, "fabric");
      }
    });
  }

  // 8. Cargo Pocket Flap -> Leg Base Contact Shadow
  if (lowerGrammar.cargoPockets) {
    for (let dx = 0; dx < 4; dx++) {
      applyContactShadow(canvas, dx, 25, 0.16, "fabric");
      applyContactShadow(canvas, 24 + dx, 59, 0.16, "fabric");
    }
  }

  // 9. Knee-High Socks -> Bare Thigh Contact Shadow
  if (lowerGrammar.socks !== "none") {
    for (let dx = 0; dx < 4; dx++) {
      applyContactShadow(canvas, 4 + dx, 23, 0.14, "skin");
      applyContactShadow(canvas, 20 + dx, 55, 0.14, "skin");
    }
  }

  // -------------------------------------------------------------
  // DIRECTIONAL LIGHTING PASS (design.lightingDirection)
  // -------------------------------------------------------------
  if (!isBaseline) {
    applyDirectionalLighting(canvas, garmentGrammar.lightingDirection, model);
  }

  return canvas.pixels;
}
