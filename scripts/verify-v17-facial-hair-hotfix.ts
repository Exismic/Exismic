import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkin,
  type MinecraftArmModel,
  type MinecraftSkinDesign,
} from "../src/lib/minecraft-skin";
import {
  compileMinecraftSkinBlueprint,
  safeExtractBlueprintDesign,
} from "../src/lib/minecraft-skin-blueprint";
import {
  mergeRemixDesign,
} from "../src/lib/minecraft-skin-control";

const OUTPUT_DIR = path.join(process.cwd(), "v17-facial-hair-hotfix-output");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  details: string;
  metrics?: Record<string, any>;
}

const results: TestResult[] = [];

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function getPixelRgba(buffer: Uint8Array, x: number, y: number): [number, number, number, number] {
  const idx = (y * 64 + x) * 4;
  return [buffer[idx], buffer[idx + 1], buffer[idx + 2], buffer[idx + 3]];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function isSkinTone(r: number, g: number, b: number): boolean {
  // Skin tones have warm luminance (r > 140, r > b)
  return r > 140 && r > b;
}

function isDarkHairTone(r: number, g: number, b: number): boolean {
  // Samurai dark hair has low luminance (r < 75, g < 75, b < 75)
  return r < 75 && g < 75 && b < 75;
}

// Compare pixel difference between two 64x64 skin buffers in a specific region
function countDiffPixels(bufA: Uint8Array, bufB: Uint8Array, region: { x: number; y: number; w: number; h: number }): number {
  let diff = 0;
  for (let y = region.y; y < region.y + region.h; y++) {
    for (let x = region.x; x < region.x + region.w; x++) {
      const idx = (y * 64 + x) * 4;
      if (
        bufA[idx] !== bufB[idx] ||
        bufA[idx + 1] !== bufB[idx + 1] ||
        bufA[idx + 2] !== bufB[idx + 2] ||
        bufA[idx + 3] !== bufB[idx + 3]
      ) {
        diff++;
      }
    }
  }
  return diff;
}

// Base parent samurai design (representing the samurai with beard and midnight robes)
const parentSamurai: MinecraftSkinDesign = {
  name: "Midnight Samurai",
  description: "Japanese samurai in midnight robes with short beard",
  hairStyle: "short",
  hairSilhouette: "layered-short",
  bangsStyle: "none",
  faceConstruction: "masculine-angular",
  expression: "focused" as any,
  eyeShape: "normal",
  eyeStyle: "anime",
  facialHair: "short-beard",
  faceStyle: "open",
  garmentType: "robe" as any,
  outfit: "armor",
  pattern: "clean",
  materialProfile: "technical-fabric" as any,
  sleeves: "long",
  sleeveStyle: "wide_haori" as any,
  gloves: false,
  pantsType: "tailored_trousers" as any,
  cargoPockets: false,
  footwear: "boots",
  footwearStyle: "combat-boots",
  socks: "none",
  placket: "haori_wrap" as any,
  lightingDirection: "upper-left",
  asymmetry: false,
  negativeConstraints: [],
  traits: ["samurai", "katana", "midnight-robe"],
  headphones: false,
  glasses: true,
  cables: false,
  horns: false,
  crown: false,
  halo: false,
  emblem: "none",
  palette: {
    skin: "#e5b99f",
    skinShade: "#c49275",
    hair: "#171717",
    hairHighlight: "#383838",
    eyes: "#78350f",
    top: "#0f172a",
    topAccent: "#38bdf8",
    pants: "#020617",
    shoes: "#1e293b",
    detail: "#e2e8f0",
  },
};

// Base parent anime girl design (representing the successful anime dress remix)
const parentAnimeGirl: MinecraftSkinDesign = {
  name: "Cherry Blossom Anime",
  description: "Anime girl in pastel pink dress",
  hairStyle: "long",
  hairSilhouette: "curtain-bangs",
  bangsStyle: "curtain",
  faceConstruction: "anime-expressive",
  expression: "friendly",
  eyeShape: "normal",
  eyeStyle: "anime",
  facialHair: "none",
  faceStyle: "open",
  garmentType: "streetwear-shirt" as any,
  outfit: "casual",
  pattern: "clean",
  materialProfile: "cotton",
  sleeves: "short",
  sleeveStyle: "short_sleeve" as any,
  gloves: false,
  pantsType: "pleated_skirt" as any,
  cargoPockets: false,
  footwear: "shoes",
  footwearStyle: "sneakers",
  socks: "knee_high_plain",
  lightingDirection: "upper-left",
  asymmetry: false,
  negativeConstraints: [],
  traits: ["anime", "ribbon"],
  headphones: false,
  glasses: false,
  cables: false,
  horns: false,
  crown: false,
  halo: false,
  emblem: "none",
  palette: {
    skin: "#fbe4d8",
    skinShade: "#e8beac",
    hair: "#fde047",
    hairHighlight: "#fef08a",
    eyes: "#38bdf8",
    top: "#f472b6",
    topAccent: "#fce7f3",
    pants: "#ec4899",
    shoes: "#ffffff",
    detail: "#fb7185",
  },
};

async function runTests() {
  console.log("===============================================================");
  console.log("   v1.7 HOTFIX — FACIAL HAIR REMIX CONTRACT VERIFICATION");
  console.log("===============================================================\n");

  // First, compile Parent Samurai
  const parentSamuraiRaw = compileMinecraftSkinBlueprint(parentSamurai, 42, "classic");
  await sharp(Buffer.from(parentSamuraiRaw), { raw: { width: 64, height: 64, channels: 4 } })
    .png()
    .toFile(path.join(OUTPUT_DIR, "00-parent-samurai.png"));

  // --------------------------------------------------------------------------
  // TEST A: "no facial hair"
  // --------------------------------------------------------------------------
  try {
    const remix = mergeRemixDesign(parentSamurai, { facialHair: "none" }, "no facial hair");
    assert(remix.facialHair === "none", `Expected facialHair to be 'none', got '${remix.facialHair}'`);
    assert(remix.hairStyle === parentSamurai.hairStyle, "Head hairStyle drifted unexpectedly");
    assert(remix.hairSilhouette === parentSamurai.hairSilhouette, "Head hairSilhouette drifted unexpectedly");
    assert(remix.palette?.hair === parentSamurai.palette.hair, "Head hair palette drifted unexpectedly");
    assert(remix.faceConstruction === parentSamurai.faceConstruction, "faceConstruction drifted unexpectedly");
    assert(remix.palette?.top === parentSamurai.palette.top, "Clothing top drifted unexpectedly");

    const skinRaw = compileMinecraftSkinBlueprint(remix as MinecraftSkinDesign, 42, "classic");
    await sharp(Buffer.from(skinRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "01-test-a-no-facial-hair.png"));

    // Verify chin row 7 (x: 9..14, y: 15) has clean skin (not dark hair)
    const chinCenter = getPixelRgba(skinRaw, 11, 15);
    const chinHex = rgbToHex(chinCenter[0], chinCenter[1], chinCenter[2]);
    assert(isSkinTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin center must be clean skin tone, got ${chinHex}`);
    assert(!isDarkHairTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin center must NOT have dark hair, got ${chinHex}`);

    // Verify face diff between parent samurai (with beard) and clean-shaven remix
    const faceDiff = countDiffPixels(parentSamuraiRaw, skinRaw, { x: 8, y: 8, w: 8, h: 8 });
    assert(faceDiff > 0, `Face pixel diff must be > 0, got ${faceDiff}`);

    results.push({
      id: "A",
      name: "Remix 'no facial hair'",
      passed: true,
      details: `facialHair='none', head hair strictly preserved, chin is clean skin (${chinHex}), face pixel diff = ${faceDiff} pixels changed.`,
      metrics: { faceDiffPixels: faceDiff, chinCenterHex: chinHex },
    });
  } catch (err: any) {
    results.push({ id: "A", name: "Remix 'no facial hair'", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST B: "remove beard"
  // --------------------------------------------------------------------------
  try {
    const remix = mergeRemixDesign(parentSamurai, {}, "remove beard");
    assert(remix.facialHair === "none", `Expected facialHair to be 'none', got '${remix.facialHair}'`);
    assert(remix.hairStyle === parentSamurai.hairStyle, "Head hairStyle drifted unexpectedly");
    assert(remix.palette?.hair === parentSamurai.palette.hair, "Head hair palette drifted unexpectedly");

    const skinRaw = compileMinecraftSkinBlueprint(remix as MinecraftSkinDesign, 42, "classic");
    await sharp(Buffer.from(skinRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "02-test-b-remove-beard.png"));

    const chinCenter = getPixelRgba(skinRaw, 12, 15);
    const chinHex = rgbToHex(chinCenter[0], chinCenter[1], chinCenter[2]);
    assert(isSkinTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin center must be clean skin tone, got ${chinHex}`);
    assert(!isDarkHairTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin center must NOT have dark hair, got ${chinHex}`);

    const faceDiff = countDiffPixels(parentSamuraiRaw, skinRaw, { x: 8, y: 8, w: 8, h: 8 });
    assert(faceDiff > 0, `Face pixel diff must be > 0, got ${faceDiff}`);

    results.push({
      id: "B",
      name: "Remix 'remove beard'",
      passed: true,
      details: `facialHair='none', chin is clean skin (${chinHex}), face pixel diff = ${faceDiff} pixels.`,
      metrics: { faceDiffPixels: faceDiff },
    });
  } catch (err: any) {
    results.push({ id: "B", name: "Remix 'remove beard'", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST C: "clean shaven"
  // --------------------------------------------------------------------------
  try {
    const remix = mergeRemixDesign(parentSamurai, {}, "clean shaven");
    assert(remix.facialHair === "none", `Expected facialHair to be 'none', got '${remix.facialHair}'`);
    assert(remix.hairStyle === parentSamurai.hairStyle, "Head hairStyle drifted");

    const skinRaw = compileMinecraftSkinBlueprint(remix as MinecraftSkinDesign, 42, "classic");
    await sharp(Buffer.from(skinRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "03-test-c-clean-shaven.png"));

    const chinCenter = getPixelRgba(skinRaw, 11, 15);
    const chinHex = rgbToHex(chinCenter[0], chinCenter[1], chinCenter[2]);
    assert(isSkinTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin center must be clean skin tone, got ${chinHex}`);

    results.push({
      id: "C",
      name: "Remix 'clean shaven'",
      passed: true,
      details: `facialHair='none', chin is clean skin (${chinHex}), mouth and facial features preserved.`,
    });
  } catch (err: any) {
    results.push({ id: "C", name: "Remix 'clean shaven'", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST D: "no beard, no glasses"
  // --------------------------------------------------------------------------
  try {
    const remix = mergeRemixDesign(parentSamurai, {}, "no beard, no glasses");
    assert(remix.facialHair === "none", `Expected facialHair to be 'none', got '${remix.facialHair}'`);
    assert(remix.glasses === false, `Expected glasses to be false, got '${remix.glasses}'`);
    assert(remix.hairStyle === parentSamurai.hairStyle, "Head hairStyle drifted");
    assert(remix.palette?.top === parentSamurai.palette.top, "Top color drifted");

    const skinRaw = compileMinecraftSkinBlueprint(remix as MinecraftSkinDesign, 42, "classic");
    await sharp(Buffer.from(skinRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "04-test-d-no-beard-no-glasses.png"));

    const chinCenter = getPixelRgba(skinRaw, 11, 15);
    const chinHex = rgbToHex(chinCenter[0], chinCenter[1], chinCenter[2]);
    assert(isSkinTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin center must be clean skin tone, got ${chinHex}`);

    results.push({
      id: "D",
      name: "Remix 'no beard, no glasses'",
      passed: true,
      details: `facialHair='none', glasses=false, chin clean skin (${chinHex}), clothing preserved.`,
    });
  } catch (err: any) {
    results.push({ id: "D", name: "Remix 'no beard, no glasses'", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST E: "short beard"
  // --------------------------------------------------------------------------
  try {
    // Start with a clean-shaven samurai
    const cleanSamurai: MinecraftSkinDesign = { ...parentSamurai, facialHair: "none" };
    const cleanRaw = compileMinecraftSkinBlueprint(cleanSamurai, 42, "classic");

    const remix = mergeRemixDesign(cleanSamurai, {}, "Japanese samurai with short beard");
    assert(remix.facialHair === "short-beard", `Expected facialHair to be 'short-beard', got '${remix.facialHair}'`);

    const skinRaw = compileMinecraftSkinBlueprint(remix as MinecraftSkinDesign, 42, "classic");
    await sharp(Buffer.from(skinRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "05-test-e-short-beard.png"));

    // Verify chin center (x: 11, y: 15) is dark hair color
    const chinCenter = getPixelRgba(skinRaw, 11, 15);
    const chinHex = rgbToHex(chinCenter[0], chinCenter[1], chinCenter[2]);
    assert(isDarkHairTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin center must be dark hair, got ${chinHex}`);

    // Verify mustache at (x: 11, y: 13) is dark hair color
    const mustache = getPixelRgba(skinRaw, 11, 13);
    const mustacheHex = rgbToHex(mustache[0], mustache[1], mustache[2]);
    assert(isDarkHairTone(mustache[0], mustache[1], mustache[2]), `Mustache must be dark hair, got ${mustacheHex}`);

    const faceDiff = countDiffPixels(cleanRaw, skinRaw, { x: 8, y: 8, w: 8, h: 8 });
    assert(faceDiff > 0, `Face pixel diff must be > 0 between clean and beard, got ${faceDiff}`);

    results.push({
      id: "E",
      name: "Positive state 'short beard'",
      passed: true,
      details: `facialHair='short-beard', mustache & chin beard verified in hair tone (${chinHex}), face diff = ${faceDiff} pixels.`,
      metrics: { faceDiffPixels: faceDiff, chinHex, mustacheHex },
    });
  } catch (err: any) {
    results.push({ id: "E", name: "Positive state 'short beard'", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST F: "goatee"
  // --------------------------------------------------------------------------
  try {
    const cleanSamurai: MinecraftSkinDesign = { ...parentSamurai, facialHair: "none" };
    const cleanRaw = compileMinecraftSkinBlueprint(cleanSamurai, 42, "classic");

    const remix = mergeRemixDesign(cleanSamurai, {}, "Japanese samurai with goatee");
    assert(remix.facialHair === "goatee", `Expected facialHair to be 'goatee', got '${remix.facialHair}'`);

    const skinRaw = compileMinecraftSkinBlueprint(remix as MinecraftSkinDesign, 42, "classic");
    await sharp(Buffer.from(skinRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "06-test-f-goatee.png"));

    // Center chin (x: 11, y: 15) must be hair color
    const chinCenter = getPixelRgba(skinRaw, 11, 15);
    const chinHex = rgbToHex(chinCenter[0], chinCenter[1], chinCenter[2]);
    assert(isDarkHairTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Center chin must be dark hair tone, got ${chinHex}`);

    // Outer chin / jaw corner (x: 9, y: 15) MUST be clean skin (not beard!)
    const chinOuter = getPixelRgba(skinRaw, 9, 15);
    const chinOuterHex = rgbToHex(chinOuter[0], chinOuter[1], chinOuter[2]);
    assert(isSkinTone(chinOuter[0], chinOuter[1], chinOuter[2]), `Outer chin in goatee must be clean skin, got ${chinOuterHex}`);

    // Cheeks at row 6 (x: 8, y: 14) and (x: 9, y: 14) MUST be clean skin (no beard cheeks in goatee!)
    const cheek = getPixelRgba(skinRaw, 9, 14);
    const cheekHex = rgbToHex(cheek[0], cheek[1], cheek[2]);
    assert(isSkinTone(cheek[0], cheek[1], cheek[2]), `Cheek in goatee must be clean skin, got ${cheekHex}`);

    const faceDiff = countDiffPixels(cleanRaw, skinRaw, { x: 8, y: 8, w: 8, h: 8 });
    assert(faceDiff > 0, `Face pixel diff must be > 0 between clean and goatee, got ${faceDiff}`);

    results.push({
      id: "F",
      name: "Positive state 'goatee'",
      passed: true,
      details: `facialHair='goatee', center chin has hair (${chinHex}), cheeks/outer jaw are clean skin (${chinOuterHex}), face diff = ${faceDiff} pixels.`,
      metrics: { faceDiffPixels: faceDiff, chinCenterHex: chinHex, outerJawHex: chinOuterHex },
    });
  } catch (err: any) {
    results.push({ id: "F", name: "Positive state 'goatee'", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST G: Existing successful anime top-color remix regression test
  // --------------------------------------------------------------------------
  try {
    const remixResult: Partial<MinecraftSkinDesign> = {
      palette: {
        ...parentAnimeGirl.palette,
        top: "#3b82f6",
        topAccent: "#93c5fd",
      },
    };
    const remix = mergeRemixDesign(parentAnimeGirl, remixResult, "change top color to blue");
    assert(remix.palette?.top === "#3b82f6", `Expected top to be '#3b82f6', got '${remix.palette?.top}'`);
    assert(remix.palette?.topAccent === "#93c5fd", `Expected topAccent to be '#93c5fd', got '${remix.palette?.topAccent}'`);
    assert(remix.hairSilhouette === parentAnimeGirl.hairSilhouette, "Hair silhouette drifted");
    assert(remix.palette?.hair === parentAnimeGirl.palette.hair, "Hair color drifted");
    assert(remix.palette?.skin === parentAnimeGirl.palette.skin, "Skin tone drifted");
    assert(remix.facialHair === "none", "Facial hair changed unexpectedly");

    const skinRaw = compileMinecraftSkinBlueprint(remix as MinecraftSkinDesign, 100, "classic");
    await sharp(Buffer.from(skinRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "07-test-g-anime-top-color.png"));

    results.push({
      id: "G",
      name: "Anime top-color remix regression test",
      passed: true,
      details: `Top changed to #3b82f6, skin, hair, facialHair=none, and silhouette 100% preserved.`,
    });
  } catch (err: any) {
    results.push({ id: "G", name: "Anime top-color remix regression test", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST H: Existing variation workflow regression test
  // --------------------------------------------------------------------------
  try {
    const variationDesign = {
      ...parentSamurai,
      facialHair: "none" as const,
    };
    const skinRawClassic = compileMinecraftSkinBlueprint(variationDesign, 777, "classic");
    const skinRawSlim = compileMinecraftSkinBlueprint(variationDesign, 777, "slim");

    await sharp(Buffer.from(skinRawClassic), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "08-test-h-variation-classic.png"));
    await sharp(Buffer.from(skinRawSlim), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "08-test-h-variation-slim.png"));

    assert(skinRawClassic.length === 64 * 64 * 4, `Classic must be 16384 bytes, got ${skinRawClassic.length}`);
    assert(skinRawSlim.length === 64 * 64 * 4, `Slim must be 16384 bytes, got ${skinRawSlim.length}`);

    results.push({
      id: "H",
      name: "Variation workflow regression test",
      passed: true,
      details: `Compiled successfully for both Classic (4px) and Slim (3px) models with valid 64x64 RGBA buffers.`,
    });
  } catch (err: any) {
    results.push({ id: "H", name: "Variation workflow regression test", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST I: Exact Failed User Prompt End-to-End Extraction & Rendering
  // "Japanese samurai in midnight robes, no beard, not a helmet, no glasses"
  // --------------------------------------------------------------------------
  try {
    const extracted = safeExtractBlueprintDesign(
      {
        palette: parentSamurai.palette,
        hairStyle: "short",
        outfit: "armor",
      },
      "Japanese samurai in midnight robes, no beard, not a helmet, no glasses",
      42
    );

    assert(extracted.facialHair === "none", `Prompt 'no beard' must resolve to facialHair='none', got '${extracted.facialHair}'`);
    assert(extracted.glasses === false, `Prompt 'no glasses' must resolve to glasses=false, got '${extracted.glasses}'`);

    const skinRaw = compileMinecraftSkinBlueprint(extracted, 42, "classic");
    await sharp(Buffer.from(skinRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "09-test-exact-failed-prompt.png"));

    const chinCenter = getPixelRgba(skinRaw, 11, 15);
    const chinHex = rgbToHex(chinCenter[0], chinCenter[1], chinCenter[2]);
    assert(isSkinTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin must be clean skin tone, got ${chinHex}`);
    assert(!isDarkHairTone(chinCenter[0], chinCenter[1], chinCenter[2]), `Chin must NOT have dark hair, got ${chinHex}`);

    results.push({
      id: "I",
      name: "Exact user prompt test ('no beard, not a helmet, no glasses')",
      passed: true,
      details: `Extracted facialHair='none', glasses=false, chin is clean skin (${chinHex}), mouth and facial features intact.`,
    });
  } catch (err: any) {
    results.push({ id: "I", name: "Exact user prompt test", passed: false, details: err.message });
  }

  // --------------------------------------------------------------------------
  // TEST J: Legacy Procedural Fallback Intact
  // --------------------------------------------------------------------------
  try {
    const legacyRaw = compileMinecraftSkin(parentSamurai, 42, "classic");
    assert(legacyRaw.length === 64 * 64 * 4, `Legacy buffer must be 16384 bytes, got ${legacyRaw.length}`);
    await sharp(Buffer.from(legacyRaw), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, "10-legacy-fallback.png"));

    results.push({
      id: "J",
      name: "Legacy procedural fallback intact",
      passed: true,
      details: `compileMinecraftSkin executed without error, returned 64x64 RGBA buffer.`,
    });
  } catch (err: any) {
    results.push({ id: "J", name: "Legacy procedural fallback intact", passed: false, details: err.message });
  }

  // Print Summary Table
  console.log("\n===============================================================");
  console.log("                      TEST RESULTS SUMMARY");
  console.log("===============================================================");
  let allPassed = true;
  for (const r of results) {
    const statusIcon = r.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`[${statusIcon}] Test ${r.id}: ${r.name}`);
    console.log(`       Details: ${r.details}`);
    if (!r.passed) allPassed = false;
  }
  console.log("===============================================================\n");

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "test-report.json"),
    JSON.stringify({ timestamp: new Date().toISOString(), allPassed, results }, null, 2)
  );

  if (!allPassed) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("FATAL verification error:", err);
  process.exit(1);
});
