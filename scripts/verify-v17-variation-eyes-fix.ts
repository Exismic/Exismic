import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkinBlueprint,
} from "../src/lib/minecraft-skin-blueprint";
import {
  generateFaceBlueprint,
  applyEyeStyleToFaceBlueprint,
} from "../src/lib/minecraft-skin-blueprint-hair";
import {
  compileMinecraftSkin,
  type MinecraftSkinDesign,
} from "../src/lib/minecraft-skin";

const OUTPUT_DIR = path.join(process.cwd(), "v17-fix-output");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface PixelDiff {
  x: number;
  y: number;
  colorA: string;
  colorB: string;
  region: string;
}

function getRegion(x: number, y: number): string {
  if (x >= 0 && x < 64 && y >= 0 && y < 16) return "head";
  if (x >= 16 && x < 40 && y >= 16 && y < 32) return "torso_base";
  if (x >= 16 && x < 40 && y >= 32 && y < 48) return "torso_overlay";
  if (x >= 0 && x < 16 && y >= 16 && y < 32) return "right_leg_base";
  if (x >= 0 && x < 16 && y >= 32 && y < 48) return "right_leg_overlay";
  if (x >= 16 && x < 32 && y >= 48 && y < 64) return "left_leg_base";
  if (x >= 0 && x < 16 && y >= 48 && y < 64) return "left_leg_overlay";
  if (x >= 40 && x < 56 && y >= 16 && y < 32) return "right_arm_base";
  if (x >= 40 && x < 56 && y >= 32 && y < 48) return "right_arm_overlay";
  if (x >= 32 && x < 48 && y >= 48 && y < 64) return "left_arm_base";
  if (x >= 48 && x < 64 && y >= 48 && y < 64) return "left_arm_overlay";
  return "other";
}

function comparePixels(bufA: Uint8Array, bufB: Uint8Array): {
  totalDiff: number;
  diffs: PixelDiff[];
  byRegion: Record<string, number>;
} {
  const diffs: PixelDiff[] = [];
  const byRegion: Record<string, number> = {};

  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const idx = (y * 64 + x) * 4;
      const rA = bufA[idx];
      const gA = bufA[idx + 1];
      const bA = bufA[idx + 2];
      const aA = bufA[idx + 3];

      const rB = bufB[idx];
      const gB = bufB[idx + 1];
      const bB = bufB[idx + 2];
      const aB = bufB[idx + 3];

      if (rA !== rB || gA !== gB || bA !== bB || aA !== aB) {
        const region = getRegion(x, y);
        byRegion[region] = (byRegion[region] || 0) + 1;
        diffs.push({
          x,
          y,
          colorA: `rgba(${rA},${gA},${bA},${aA})`,
          colorB: `rgba(${rB},${gB},${bB},${aB})`,
          region,
        });
      }
    }
  }

  return { totalDiff: diffs.length, diffs, byRegion };
}

async function runVerification() {
  console.log("==================================================");
  console.log("MINECRAFT SKIN STUDIO v1.7 — FIX VERIFICATION SUITE");
  console.log("==================================================\n");

  const results: any = {
    variation: {},
    eyeStyles: {},
    facialHairRegression: {},
    passed: true,
  };

  // -------------------------------------------------------------
  // PART A: REGENERATE VARIATION VERIFICATION
  // -------------------------------------------------------------
  console.log("--- PART A: REGENERATE VARIATION VERIFICATION ---");
  const parentDesign: MinecraftSkinDesign = {
    name: "Cyber Streetwear Hacker",
    description: "Cyberpunk urban streetwear hacker with oversized hoodie and sneakers",
    hairStyle: "short",
    hairSilhouette: "curtain-bangs",
    bangsStyle: "curtain",
    faceConstruction: "clean-aesthetic",
    expression: "friendly" as any,
    eyeShape: "normal",
    eyeStyle: "anime",
    facialHair: "none",
    faceStyle: "open",
    garmentType: "streetwear-hoodie" as any,
    outfit: "casual",
    pattern: "clean",
    materialProfile: "cotton",
    sleeves: "long",
    sleeveStyle: "straight" as any,
    gloves: false,
    pantsType: "tailored_trousers" as any,
    cargoPockets: false,
    footwear: "shoes",
    footwearStyle: "chunky-sneaker",
    socks: "none",
    lightingDirection: "upper-left",
    asymmetry: false,
    negativeConstraints: [],
    traits: ["cyberpunk", "hacker"],
    headphones: false,
    glasses: false,
    cables: false,
    horns: false,
    crown: false,
    halo: false,
    emblem: "none",
    palette: {
      skin: "#fbd38d",
      skinShade: "#d4a373",
      hair: "#1e293b",
      hairHighlight: "#334155",
      eyes: "#06b6d4",
      top: "#334155",
      topAccent: "#06b6d4",
      pants: "#0f172a",
      shoes: "#f8fafc",
      detail: "#cbd5e1",
    },
  };

  const parentSeed = 123456;
  const var1Seed = 334567;
  const var2Seed = 791356;

  const parentBuf = compileMinecraftSkinBlueprint(parentDesign, parentSeed, "classic", "detailed", "Cyberpunk hacker");
  const var1Buf = compileMinecraftSkinBlueprint(parentDesign, var1Seed, "classic", "detailed", "Cyberpunk hacker");
  const var2Buf = compileMinecraftSkinBlueprint(parentDesign, var2Seed, "classic", "detailed", "Cyberpunk hacker");

  await sharp(Buffer.from(parentBuf), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, "parent-skin.png"));
  await sharp(Buffer.from(var1Buf), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, "variation-1.png"));
  await sharp(Buffer.from(var2Buf), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, "variation-2.png"));

  const parentVsVar1 = comparePixels(parentBuf, var1Buf);
  const var1VsVar2 = comparePixels(var1Buf, var2Buf);

  console.log(`Parent (seed: ${parentSeed}) vs Variation 1 (seed: ${var1Seed}):`);
  console.log(`  Total Differing Pixels: ${parentVsVar1.totalDiff}`);
  console.log(`  Breakdown by Region:`, parentVsVar1.byRegion);

  console.log(`\nVariation 1 (seed: ${var1Seed}) vs Variation 2 (seed: ${var2Seed}):`);
  console.log(`  Total Differing Pixels: ${var1VsVar2.totalDiff}`);
  console.log(`  Breakdown by Region:`, var1VsVar2.byRegion);

  const varPass = parentVsVar1.totalDiff >= 40 && var1VsVar2.totalDiff >= 40;
  console.log(`\nVariation Diff Test: ${varPass ? "PASSED (Deliberate, multi-region variations)" : "FAILED"}`);
  results.variation = {
    parentVsVar1: { totalDiff: parentVsVar1.totalDiff, byRegion: parentVsVar1.byRegion },
    var1VsVar2: { totalDiff: var1VsVar2.totalDiff, byRegion: var1VsVar2.byRegion },
    passed: varPass,
  };
  if (!varPass) results.passed = false;

  // -------------------------------------------------------------
  // PART B: EYE STYLES VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- PART B: EYE STYLES VERIFICATION (0-CREDIT INSTANT COMPILATION) ---");
  const eyeStyles = ["anime", "classic", "glowing", "minimal", "visor"] as const;
  const eyeBuffers: Record<string, Uint8Array> = {};

  for (const es of eyeStyles) {
    const d: MinecraftSkinDesign = { ...parentDesign, eyeStyle: es };
    const buf = compileMinecraftSkinBlueprint(d, parentSeed, "classic", "detailed", "Cyberpunk hacker");
    eyeBuffers[es] = buf;
    await sharp(Buffer.from(buf), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, `eye-style-${es}.png`));
  }

  // Compare each eye style against parent "anime"
  const animeBuf = eyeBuffers["anime"];
  let eyeStylesPass = true;

  for (const es of eyeStyles) {
    if (es === "anime") continue;
    const diff = comparePixels(animeBuf, eyeBuffers[es]);
    console.log(`\nEye Style: "${es}" vs "anime":`);
    console.log(`  Differing Pixels: ${diff.totalDiff}`);

    // Verify all changed pixels are strictly within front face eye region (x: 8..15, y: 11..12)
    const outOfBounds = diff.diffs.filter((d) => {
      const inEyeZone = d.x >= 8 && d.x <= 15 && (d.y === 11 || d.y === 12);
      return !inEyeZone;
    });

    console.log(`  Pixels in eye zone (x:8..15, y:11..12): ${diff.diffs.length - outOfBounds.length} / ${diff.diffs.length}`);
    console.log(`  Out of bounds pixels: ${outOfBounds.length}`);

    // Verify mouth at (11..12, 14) is intact
    const mouthIdx1 = (14 * 64 + 11) * 4;
    const mouthIdx2 = (14 * 64 + 12) * 4;
    const mouthIntact =
      eyeBuffers[es][mouthIdx1] === animeBuf[mouthIdx1] &&
      eyeBuffers[es][mouthIdx1 + 1] === animeBuf[mouthIdx1 + 1] &&
      eyeBuffers[es][mouthIdx1 + 2] === animeBuf[mouthIdx1 + 2] &&
      eyeBuffers[es][mouthIdx2] === animeBuf[mouthIdx2] &&
      eyeBuffers[es][mouthIdx2 + 1] === animeBuf[mouthIdx2 + 1] &&
      eyeBuffers[es][mouthIdx2 + 2] === animeBuf[mouthIdx2 + 2];
    console.log(`  Mouth preserved at row 14: ${mouthIntact ? "YES" : "NO"}`);

    // Verify chin at row 15 is intact
    let chinIntact = true;
    for (let cx = 8; cx <= 15; cx++) {
      const cIdx = (15 * 64 + cx) * 4;
      if (
        eyeBuffers[es][cIdx] !== animeBuf[cIdx] ||
        eyeBuffers[es][cIdx + 1] !== animeBuf[cIdx + 1] ||
        eyeBuffers[es][cIdx + 2] !== animeBuf[cIdx + 2]
      ) {
        chinIntact = false;
        break;
      }
    }
    console.log(`  Chin preserved at row 15: ${chinIntact ? "YES" : "NO"}`);

    const isStylePass = diff.totalDiff > 0 && outOfBounds.length === 0 && mouthIntact && chinIntact;
    console.log(`  Status: ${isStylePass ? "PASSED" : "FAILED"}`);

    results.eyeStyles[es] = {
      totalDiff: diff.totalDiff,
      outOfBounds: outOfBounds.length,
      mouthIntact,
      chinIntact,
      passed: isStylePass,
    };
    if (!isStylePass) eyeStylesPass = false;
  }

  if (!eyeStylesPass) results.passed = false;

  // -------------------------------------------------------------
  // PART C: FACIAL HAIR REGRESSION VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- PART C: FACIAL HAIR REGRESSION VERIFICATION ---");
  const fhTypes = ["none", "short-beard", "goatee"] as const;
  const fhBuffers: Record<string, Uint8Array> = {};

  for (const fh of fhTypes) {
    const d: MinecraftSkinDesign = { ...parentDesign, facialHair: fh };
    const buf = compileMinecraftSkinBlueprint(d, parentSeed, "classic", "detailed", "Cyberpunk hacker");
    fhBuffers[fh] = buf;
    await sharp(Buffer.from(buf), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, `facial-hair-${fh}.png`));
  }

  const noneVsBeard = comparePixels(fhBuffers["none"], fhBuffers["short-beard"]);
  const noneVsGoatee = comparePixels(fhBuffers["none"], fhBuffers["goatee"]);
  const beardVsGoatee = comparePixels(fhBuffers["short-beard"], fhBuffers["goatee"]);

  console.log(`none vs short-beard diff: ${noneVsBeard.totalDiff} px`);
  console.log(`none vs goatee diff: ${noneVsGoatee.totalDiff} px`);
  console.log(`short-beard vs goatee diff: ${beardVsGoatee.totalDiff} px`);

  const fhPass = noneVsBeard.totalDiff >= 10 && noneVsGoatee.totalDiff >= 6 && beardVsGoatee.totalDiff >= 6;
  console.log(`Facial Hair Regression Status: ${fhPass ? "PASSED" : "FAILED"}`);
  results.facialHairRegression = {
    noneVsBeard: noneVsBeard.totalDiff,
    noneVsGoatee: noneVsGoatee.totalDiff,
    beardVsGoatee: beardVsGoatee.totalDiff,
    passed: fhPass,
  };
  if (!fhPass) results.passed = false;

  // Write full summary json
  fs.writeFileSync(path.join(OUTPUT_DIR, "verification-summary.json"), JSON.stringify(results, null, 2));

  console.log("\n==================================================");
  console.log(`OVERALL STATUS: ${results.passed ? "ALL CHECKS PASSED ✅" : "SOME CHECKS FAILED ❌"}`);
  console.log("==================================================");
}

runVerification().catch(console.error);
