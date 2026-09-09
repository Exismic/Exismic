import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkinBlueprint,
  type MaterialType,
} from "../src/lib/minecraft-skin-blueprint";
import { type MinecraftArmModel } from "../src/lib/minecraft-skin";

const OUTPUT_DIR = path.join(__dirname, "..", "comparison-stress-test");
const BRAIN_DIR = "C:\\Users\\rayan\\.gemini\\antigravity-ide\\brain\\93179371-0d61-4d70-bf5a-4d720974da78\\comparison-stress-test";

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(BRAIN_DIR)) fs.mkdirSync(BRAIN_DIR, { recursive: true });

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function createPrng(seed: number) {
  let s = seed;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createPrng(42);

function pickRandom<T>(arr: readonly T[]): T {
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

// Composition Pools
const HAIR_SILHOUETTES = [
  "curtain-bangs", "messy-fringe", "middle-part-flow", "wolf-cut",
  "side-swept", "spiky-anime", "long-layered", "high-ponytail",
  "braided-buns", "layered-short",
] as const;

const FACE_CONSTRUCTIONS = [
  "clean-aesthetic", "soft-kpop", "anime-expressive", "feminine-soft",
  "soft-cute", "masculine-angular", "sharp-cool", "mature-minimal", "masked-visor",
] as const;

const UPPER_GARMENTS = [
  { name: "oversized hoodie", material: "cotton" },
  { name: "leather bomber jacket", material: "leather" },
  { name: "double-breasted trench coat", material: "cotton" },
  { name: "draped linen haori", material: "cotton" },
  { name: "tailored school blazer", material: "wool" },
  { name: "tactical utility vest", material: "techwear" },
  { name: "reinforced denim jacket", material: "denim" },
  { name: "charcoal wool peacoat", material: "wool" },
  { name: "quilted padded gambeson", material: "cotton" },
  { name: "oversized tuxedo jacket", material: "cotton" },
  { name: "retro track jacket", material: "techwear" },
  { name: "biker leather jacket", material: "leather" },
] as const;

const SECONDARY_GARMENTS = [
  "charcoal turtleneck",
  "white crew tee",
  "angled v-neck tee",
  "graphic skate tee",
  "chunky cable-knit sweater",
  "striped long-sleeve undershirt",
  "none",
] as const;

const LOWER_GARMENTS = [
  { name: "wide-leg denim jeans", material: "denim" },
  { name: "baggy cargo pants", material: "cotton" },
  { name: "tailored slate trousers", material: "wool" },
  { name: "pleated skirt", material: "cotton" },
  { name: "cuffed utility jumpsuit", material: "techwear" },
  { name: "shorts with knee-highs", material: "cotton" },
] as const;

const FOOTWEAR = [
  "high-top sneakers",
  "low-top skate shoes",
  "combat boots",
  "loafer oxfords",
  "sandals wrap",
  "snow boots",
  "armored sabatons",
] as const;

const ACCESSORIES = [
  "cat-ear headphones",
  "steel shoulder pauldrons",
  "orange safety harness straps",
  "heavy mechanic tool belt",
  "red flight tag ribbon",
  "gold runic trim",
  "wrapped nomad scarf",
  "none",
] as const;

const PALETTES = [
  { name: "Cyber Neon", top: "#0f172a", topAccent: "#06b6d4", pants: "#1e293b", shoes: "#06b6d4", hair: "#0f172a", skin: "#fbe4d8" },
  { name: "Dark Academia", top: "#452818", topAccent: "#1e232a", pants: "#2d3748", shoes: "#27170f", hair: "#2c1c14", skin: "#f8dfd3" },
  { name: "Pastel Anime", top: "#f472b6", topAccent: "#fbcfe8", pants: "#38bdf8", shoes: "#f8fafc", hair: "#fde047", skin: "#fdf2f8" },
  { name: "Desert Traveler", top: "#d2b48c", topAccent: "#c2a649", pants: "#8b7355", shoes: "#5c4033", hair: "#5c4033", skin: "#deb887" },
  { name: "Tactical Military", top: "#3f4c38", topAccent: "#263022", pants: "#2c3627", shoes: "#1c1917", hair: "#1f1a16", skin: "#e8c3b0" },
  { name: "Royal Celestial", top: "#31184e", topAccent: "#f59e0b", pants: "#1e1035", shoes: "#170c29", hair: "#fef08a", skin: "#fde2d2" },
  { name: "Monochrome Gothic", top: "#18181b", topAccent: "#e4e4e7", pants: "#27272a", shoes: "#09090b", hair: "#e2e8f0", skin: "#fafafa" },
  { name: "Urban Streetwear", top: "#ea580c", topAccent: "#f8fafc", pants: "#1e1b4b", shoes: "#dc2626", hair: "#312a32", skin: "#e5b99f" },
] as const;

export interface StressCharacter {
  id: string;
  hair: string;
  face: string;
  upper: string;
  secondary: string;
  lower: string;
  footwear: string;
  accessory: string;
  paletteName: string;
  armModel: MinecraftArmModel;
  seed: number;
  prompt: string;
}

export interface ValidationRecord {
  character: StressCharacter;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  uvPassed: boolean;
  layerConflicts: string[];
  materialConflicts: string[];
  semanticFailures: string[];
  compositionFailures: string[];
  uvFailures: string[];
}

// ---------------------------------------------------------------------------
// MINECRAFT 1.8+ STANDARD UV MAP VALIDATOR (64x64)
// ---------------------------------------------------------------------------
function validateMinecraftUvMap(
  pixels: Uint8Array,
  model: MinecraftArmModel
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Strictly defined illegal dead zones in standard 64x64 Minecraft skin UV
  const DEAD_ZONES = [
    { name: "Head Top Dead Zone Left", x0: 0, x1: 7, y0: 0, y1: 7 },
    { name: "Head Top Dead Zone Right", x0: 24, x1: 31, y0: 0, y1: 7 },
    { name: "Head Overlay Top Dead Zone Left", x0: 32, x1: 39, y0: 0, y1: 7 },
    { name: "Head Overlay Top Dead Zone Right", x0: 56, x1: 63, y0: 0, y1: 7 },
    { name: "Right Leg Overlay Dead Zone Left", x0: 0, x1: 3, y0: 32, y1: 35 },
    { name: "Right Leg Overlay Dead Zone Right", x0: 12, x1: 15, y0: 32, y1: 35 },
    { name: "Torso Overlay Dead Zone Top", x0: 16, x1: 19, y0: 32, y1: 35 },
    { name: "Left Arm Overlay Dead Zone Left", x0: 48, x1: 51, y0: 48, y1: 51 },
    { name: "Left Arm Overlay Dead Zone Right", x0: 60, x1: 63, y0: 48, y1: 51 },
  ];

  DEAD_ZONES.forEach((zone) => {
    for (let y = zone.y0; y <= zone.y1; y++) {
      for (let x = zone.x0; x <= zone.x1; x++) {
        const offset = (y * 64 + x) * 4;
        const alpha = pixels[offset + 3];
        if (alpha > 0) {
          errors.push(`Illegal pixel bleed at (${x},${y}) inside ${zone.name} (alpha=${alpha})`);
        }
      }
    }
  });

  // Slim Arm (3px width) validation: In Minecraft 1.8+, Alex slim arms have unused 2-pixel columns at:
  // - Right arm base: x: 54..55, y: 20..31
  // - Right arm overlay: x: 54..55, y: 36..47
  // - Left arm base: x: 46..47, y: 52..63
  // - Left arm overlay: x: 62..63, y: 52..63
  if (model === "slim") {
    for (let y = 20; y < 32; y++) {
      for (let x = 54; x <= 55; x++) {
        const alpha = pixels[(y * 64 + x) * 4 + 3];
        if (alpha > 0) {
          errors.push(`Slim arm right base dead zone (${x},${y}) contains non-transparent pixel (alpha=${alpha})`);
        }
      }
    }
    for (let y = 36; y < 48; y++) {
      for (let x = 54; x <= 55; x++) {
        const alpha = pixels[(y * 64 + x) * 4 + 3];
        if (alpha > 0) {
          errors.push(`Slim arm right overlay dead zone (${x},${y}) contains non-transparent pixel (alpha=${alpha})`);
        }
      }
    }
    for (let y = 52; y < 64; y++) {
      for (let x = 46; x <= 47; x++) {
        const alpha = pixels[(y * 64 + x) * 4 + 3];
        if (alpha > 0) {
          errors.push(`Slim arm left base dead zone (${x},${y}) contains non-transparent pixel (alpha=${alpha})`);
        }
      }
      for (let x = 62; x <= 63; x++) {
        const alpha = pixels[(y * 64 + x) * 4 + 3];
        if (alpha > 0) {
          errors.push(`Slim arm left overlay dead zone (${x},${y}) contains non-transparent pixel (alpha=${alpha})`);
        }
      }
    }
  }

  // Base head front face (8..15, 8..15) must be 100% opaque
  for (let y = 8; y < 16; y++) {
    for (let x = 8; x < 16; x++) {
      const alpha = pixels[(y * 64 + x) * 4 + 3];
      if (alpha !== 255) {
        errors.push(`Base head front pixel at (${x},${y}) is missing/transparent (alpha=${alpha})`);
      }
    }
  }

  // Base torso front face (20..27, 20..31) must be 100% opaque
  for (let y = 20; y < 32; y++) {
    for (let x = 20; x < 28; x++) {
      const alpha = pixels[(y * 64 + x) * 4 + 3];
      if (alpha !== 255) {
        errors.push(`Base torso front pixel at (${x},${y}) is missing/transparent (alpha=${alpha})`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// AUTOMATED 40-CHARACTER STRESS TEST RUNNER
// ---------------------------------------------------------------------------
async function runStressTest() {
  console.log("=========================================================================");
  console.log("  30-50 CHARACTER RANDOMIZED COMPOSITION STRESS TEST (40 CHARACTERS)      ");
  console.log("  Parametric Grammar Stability, Material Ownership & Layer Validation    ");
  console.log("=========================================================================\n");

  const TOTAL_TESTS = 40;
  const characters: StressCharacter[] = [];

  for (let i = 0; i < TOTAL_TESTS; i++) {
    const charId = `stress_${String(i + 1).padStart(2, "0")}`;
    const hair = pickRandom(HAIR_SILHOUETTES);
    const face = pickRandom(FACE_CONSTRUCTIONS);
    const upperObj = pickRandom(UPPER_GARMENTS);
    const secondary = pickRandom(SECONDARY_GARMENTS);
    const lowerObj = pickRandom(LOWER_GARMENTS);
    const footwear = pickRandom(FOOTWEAR);
    const accessory = pickRandom(ACCESSORIES);
    const palette = pickRandom(PALETTES);
    const armModel: MinecraftArmModel = i % 2 === 0 ? "classic" : "slim";
    const seed = 5000 + i * 37;

    // Compose authentic combinatorial prompt
    const parts: string[] = [upperObj.name];
    if (secondary !== "none") parts.push(`over ${secondary}`);
    parts.push(lowerObj.name);
    parts.push(`${hair} hair`);
    parts.push(footwear);
    if (accessory !== "none") parts.push(`with ${accessory}`);

    const prompt = parts.join(", ");

    characters.push({
      id: charId,
      hair,
      face,
      upper: upperObj.name,
      secondary,
      lower: lowerObj.name,
      footwear,
      accessory,
      paletteName: palette.name,
      armModel,
      seed,
      prompt,
    });
  }

  const validations: ValidationRecord[] = [];
  let successfulCount = 0;
  let partialCount = 0;
  let failedCount = 0;

  const totalLayerConflicts: string[] = [];
  const totalMaterialConflicts: string[] = [];
  const totalSemanticFailures: string[] = [];
  const totalCompositionFailures: string[] = [];
  const totalUvFailures: string[] = [];

  const hashes = new Set<string>();
  let duplicateCompositions = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    console.log(`[${i + 1}/${TOTAL_TESTS}] Testing: ${char.id} (${char.paletteName} | ${char.armModel})`);
    console.log(`       Prompt: "${char.prompt}"`);

    const layerConflicts: string[] = [];
    const materialConflicts: string[] = [];
    const semanticFailures: string[] = [];
    const compositionFailures: string[] = [];
    const uvFailures: string[] = [];

    // Compile Skin via Upgraded Parametric Blueprint Compiler
    let pixels: Uint8Array;
    try {
      pixels = compileMinecraftSkinBlueprint(
        {
          hairSilhouette: char.hair as any,
          faceConstruction: char.face as any,
        },
        char.seed,
        char.armModel,
        "balanced",
        char.prompt
      );
    } catch (err: any) {
      console.error(`       [CRASH] Compilation error: ${err.message}`);
      failedCount++;
      validations.push({
        character: char,
        status: "FAILED",
        uvPassed: false,
        layerConflicts: ["Compiler thrown exception"],
        materialConflicts: [],
        semanticFailures: [],
        compositionFailures: ["Crash: " + err.message],
        uvFailures: [],
      });
      continue;
    }

    // 1. UV Map Boundary Check
    const uvCheck = validateMinecraftUvMap(pixels, char.armModel);
    if (!uvCheck.valid) {
      uvFailures.push(...uvCheck.errors);
      totalUvFailures.push(...uvCheck.errors);
      console.log(`       [UV ERROR SAMPLE] ${uvCheck.errors[0]}`);
    }

    // 2. Semantic Palette Safety Check
    // Verify that Dark Academia or natural dark items did not trigger demon palette
    if (char.prompt.includes("dark") && !char.prompt.includes("demon")) {
      // Check skin pixel at (12, 12)
      const offset = (12 * 64 + 12) * 4;
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      // In demon palette, skin is #181216 (r=24, g=18, b=22)
      if (r <= 25 && g <= 20 && b <= 25) {
        const fail = `Demon pitch-black skin incorrectly applied to prompt with "dark": "${char.prompt}"`;
        semanticFailures.push(fail);
        totalSemanticFailures.push(fail);
      }
    }

    // 3. Material Ownership Check
    // If steel pauldrons are active, check outer arm overlay for high-contrast metal specular spike (#ffffff)
    if (char.accessory.includes("pauldrons")) {
      const frontR = pixels[(36 * 64 + 44) * 4];
      const frontG = pixels[(36 * 64 + 44) * 4 + 1];
      const frontB = pixels[(36 * 64 + 44) * 4 + 2];
      const topR = pixels[(33 * 64 + 44) * 4];
      const topG = pixels[(33 * 64 + 44) * 4 + 1];
      const topB = pixels[(33 * 64 + 44) * 4 + 2];
      const hasMetalSpecular = (frontR >= 220 && frontG >= 220 && frontB >= 220) || (topR >= 220 && topG >= 220 && topB >= 220);
      if (!hasMetalSpecular) {
        const fail = `Steel pauldron inherited lower-brightness fabric ramp instead of metal specular apex on character ${char.id}`;
        materialConflicts.push(fail);
        totalMaterialConflicts.push(fail);
      }
    }

    // 4. Layer & Component Conflict Check
    // Verify that inner garment is revealed if haori or open front is selected
    if (char.upper.includes("haori") || char.prompt.includes("over ")) {
      // Check chest center at (23, 22) vs lapel edge at (21, 22)
      const innerA = pixels[(22 * 64 + 23) * 4 + 3];
      if (innerA === 0) {
        const fail = `Inner garment missing beneath open outerwear at (23, 22)`;
        layerConflicts.push(fail);
        totalLayerConflicts.push(fail);
      }
    }

    // 5. Repetition / Hash Diversity Check
    // Compute simple color/silhouette fingerprint
    let hashSum = 0;
    for (let p = 0; p < pixels.length; p += 16) {
      hashSum = (hashSum * 31 + pixels[p]) >>> 0;
    }
    const hashStr = hashSum.toString(16);
    if (hashes.has(hashStr)) {
      duplicateCompositions++;
      compositionFailures.push(`Identical pixel fingerprint collision detected with another character`);
    } else {
      hashes.add(hashStr);
    }

    // Determine status
    const isFailed = uvFailures.length > 0 || compositionFailures.length > 0;
    const isPartial = !isFailed && (layerConflicts.length > 0 || materialConflicts.length > 0 || semanticFailures.length > 0);
    const isSuccess = !isFailed && !isPartial;

    if (isSuccess) successfulCount++;
    else if (isPartial) partialCount++;
    else failedCount++;

    const status = isSuccess ? "SUCCESS" : isPartial ? "PARTIAL" : "FAILED";

    validations.push({
      character: char,
      status,
      uvPassed: uvCheck.valid,
      layerConflicts,
      materialConflicts,
      semanticFailures,
      compositionFailures,
      uvFailures,
    });

    // Save Raw 64x64 PNG & 512x512 Nearest-Neighbor upscale
    const png64 = await sharp(Buffer.from(pixels), { raw: { width: 64, height: 64, channels: 4 } }).png().toBuffer();
    const png512 = await sharp(png64).resize(512, 512, { kernel: "nearest" }).png().toBuffer();

    fs.writeFileSync(path.join(OUTPUT_DIR, `${char.id}_raw64.png`), png64);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${char.id}_zoom512.png`), png512);
    fs.writeFileSync(path.join(BRAIN_DIR, `${char.id}_raw64.png`), png64);
    fs.writeFileSync(path.join(BRAIN_DIR, `${char.id}_zoom512.png`), png512);

    console.log(`       Status: ${status} | UV: ${uvCheck.valid ? "PASS" : "FAIL"} | Saved: ${char.id}_zoom512.png`);
  }

  // -------------------------------------------------------------------------
  // STATISTICAL REPORT GENERATION
  // -------------------------------------------------------------------------
  console.log("\n=========================================================================");
  console.log("  FINAL STRESS TEST SUMMARY RESULTS                                      ");
  console.log("=========================================================================");
  console.log(`Total generated:          ${TOTAL_TESTS}`);
  console.log(`Successful:               ${successfulCount} (${((successfulCount / TOTAL_TESTS) * 100).toFixed(1)}%)`);
  console.log(`Partial:                  ${partialCount} (${((partialCount / TOTAL_TESTS) * 100).toFixed(1)}%)`);
  console.log(`Failed:                   ${failedCount} (${((failedCount / TOTAL_TESTS) * 100).toFixed(1)}%)`);
  console.log(`Layer conflicts:          ${totalLayerConflicts.length}`);
  console.log(`Material conflicts:       ${totalMaterialConflicts.length}`);
  console.log(`Semantic failures:        ${totalSemanticFailures.length}`);
  console.log(`Composition failures:     ${totalCompositionFailures.length}`);
  console.log(`UV failures:              ${totalUvFailures.length}`);
  console.log(`Repetition collisions:    ${duplicateCompositions}`);
  console.log("=========================================================================\n");

  return {
    total: TOTAL_TESTS,
    successfulCount,
    partialCount,
    failedCount,
    totalLayerConflicts,
    totalMaterialConflicts,
    totalSemanticFailures,
    totalCompositionFailures,
    totalUvFailures,
    duplicateCompositions,
    validations,
  };
}

runStressTest().catch((err) => {
  console.error("Fatal stress test error:", err);
  process.exit(1);
});
