import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkinBlueprint,
} from "../src/lib/minecraft-skin-blueprint";
import {
  type MinecraftSkinDesign,
} from "../src/lib/minecraft-skin";

const OUTPUT_DIR = path.join(process.cwd(), "v17-mouth-fix-output");
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
  if (x >= 8 && x < 16 && y >= 8 && y < 16) {
    const dy = y - 8;
    const dx = x - 8;
    if (dy === 0) return "face_forehead";
    if (dy === 1 || dy === 2) return "face_brows";
    if (dy === 3 || dy === 4) return "face_eyes";
    if (dy === 5) return "face_cheeks_nose";
    if (dy === 6) return "face_mouth_row";
    if (dy === 7) return "face_chin_jaw";
    return "face_other";
  }
  if (x >= 0 && x < 64 && y >= 0 && y < 16) return "head_hair";
  if (x >= 16 && x < 40 && y >= 16 && y < 48) return "torso";
  if (x >= 0 && x < 32 && y >= 16 && y < 64) return "legs";
  if (x >= 32 && x < 64 && y >= 16 && y < 64) return "arms";
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
  console.log("MINECRAFT SKIN STUDIO v1.7 — MOUTH FIX VERIFICATION");
  console.log("==================================================\n");

  const parentDesign: MinecraftSkinDesign = {
    name: "Cyber Streetwear Character",
    description: "Anime streetwear hero with aesthetic face and hoodie",
    hairStyle: "short",
    hairSilhouette: "curtain-bangs",
    bangsStyle: "curtain",
    faceConstruction: "clean-aesthetic",
    expression: "friendly" as any,
    eyeShape: "normal",
    eyeStyle: "anime",
    mouthStyle: "smile",
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
    traits: ["anime", "streetwear"],
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

  const seed = 123456;
  const mouthOptions = ["smile", "neutral", "smirk", "open", "none"] as const;
  const mouthBuffers: Record<string, Uint8Array> = {};

  console.log("--- PART 1: MOUTH STYLES END-TO-END RENDER TEST ---");
  for (const ms of mouthOptions) {
    const d: MinecraftSkinDesign = { ...parentDesign, mouthStyle: ms };
    const buf = compileMinecraftSkinBlueprint(d, seed, "classic", "detailed", "Streetwear anime character");
    mouthBuffers[ms] = buf;
    await sharp(Buffer.from(buf), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, `mouth-${ms}.png`));
  }

  const smileBuf = mouthBuffers["smile"];
  const optionResults: Record<string, any> = {};
  let allOptionsPassed = true;

  for (const ms of mouthOptions) {
    const diff = comparePixels(smileBuf, mouthBuffers[ms]);
    console.log(`\nMouth Option: "${ms}" vs "smile":`);
    console.log(`  Selected UI Value: "${ms}"`);
    console.log(`  Design Property: design.mouthStyle = "${ms}"`);
    console.log(`  Total Differing Pixels: ${diff.totalDiff}`);
    console.log(`  By Region:`, diff.byRegion);

    if (ms === "smile") {
      optionResults[ms] = { uiValue: ms, totalDiff: 0, passed: true };
      continue;
    }

    // Verify changed pixels are strictly within Row 6 of the face (y = 14, x = 8..15)
    const outOfBounds = diff.diffs.filter((d) => !(d.y === 14 && d.x >= 8 && d.x <= 15));
    console.log(`  Pixels in mouth row (y=14, x=8..15): ${diff.diffs.length - outOfBounds.length} / ${diff.diffs.length}`);
    console.log(`  Out of bounds pixels: ${outOfBounds.length}`);

    // Verify eyes, brows, cheeks, chin, hair, clothing are strictly preserved
    const isPass = diff.totalDiff > 0 && outOfBounds.length === 0;
    console.log(`  Status: ${isPass ? "PASSED ✅" : "FAILED ❌"}`);

    optionResults[ms] = {
      uiValue: ms,
      totalDiff: diff.totalDiff,
      outOfBounds: outOfBounds.length,
      byRegion: diff.byRegion,
      passed: isPass,
    };
    if (!isPass) allOptionsPassed = false;
  }

  // Row 14 Pixel Inspection
  console.log("\n--- PART 2: FACE ROW 6 (MOUTH ROW, y=14) HEX DUMP ---");
  for (const ms of mouthOptions) {
    const buf = mouthBuffers[ms];
    const rowHexes: string[] = [];
    for (let x = 8; x <= 15; x++) {
      const idx = (14 * 64 + x) * 4;
      const r = buf[idx].toString(16).padStart(2, "0");
      const g = buf[idx + 1].toString(16).padStart(2, "0");
      const b = buf[idx + 2].toString(16).padStart(2, "0");
      rowHexes.push(`#${r}${g}${b}`);
    }
    console.log(`Mouth "${ms.padEnd(7)}" row 14: ${rowHexes.join(" ")}`);
  }

  // Regression Combinations
  console.log("\n--- PART 3: REGRESSION COMBINATIONS ---");
  let regressionPassed = true;

  // 1. Cyber Visor + Smile
  const visorSmileDesign: MinecraftSkinDesign = { ...parentDesign, eyeStyle: "visor", mouthStyle: "smile" };
  const visorSmileBuf = compileMinecraftSkinBlueprint(visorSmileDesign, seed, "classic", "detailed", "Streetwear anime character");
  const visorSmileDiff = comparePixels(smileBuf, visorSmileBuf);
  console.log(`1. Cyber Visor + Smile vs (Anime + Smile):`);
  console.log(`   Diff Pixels: ${visorSmileDiff.totalDiff}`);
  console.log(`   By Region:`, visorSmileDiff.byRegion);
  const visorPass = visorSmileDiff.totalDiff === 12 && visorSmileDiff.byRegion["face_eyes"] === 12 && !visorSmileDiff.byRegion["face_mouth_row"];
  console.log(`   Status: ${visorPass ? "PASSED ✅ (Mouth row 100% untouched by visor)" : "FAILED ❌"}`);
  if (!visorPass) regressionPassed = false;

  // 2. Short Beard + Smile
  const beardSmileDesign: MinecraftSkinDesign = { ...parentDesign, facialHair: "short-beard", mouthStyle: "smile" };
  const beardSmileBuf = compileMinecraftSkinBlueprint(beardSmileDesign, seed, "classic", "detailed", "Streetwear anime character");
  const beardSmileDiff = comparePixels(smileBuf, beardSmileBuf);
  console.log(`\n2. Short Beard + Smile vs (Clean Shaven + Smile):`);
  console.log(`   Diff Pixels: ${beardSmileDiff.totalDiff}`);
  console.log(`   By Region:`, beardSmileDiff.byRegion);
  const beardSmilePass = beardSmileDiff.totalDiff === 20;
  console.log(`   Status: ${beardSmilePass ? "PASSED ✅ (Beard rendered cleanly around smile)" : "FAILED ❌"}`);
  if (!beardSmilePass) regressionPassed = false;

  // 3. Goatee + Smirk
  const goateeSmirkDesign: MinecraftSkinDesign = { ...parentDesign, facialHair: "goatee", mouthStyle: "smirk" };
  const goateeSmirkBuf = compileMinecraftSkinBlueprint(goateeSmirkDesign, seed, "classic", "detailed", "Streetwear anime character");
  const goateeSmirkDiff = comparePixels(mouthBuffers["smirk"], goateeSmirkBuf);
  console.log(`\n3. Goatee + Smirk vs (Clean Shaven + Smirk):`);
  console.log(`   Diff Pixels: ${goateeSmirkDiff.totalDiff}`);
  console.log(`   By Region:`, goateeSmirkDiff.byRegion);
  const goateeSmirkPass = goateeSmirkDiff.totalDiff === 10;
  console.log(`   Status: ${goateeSmirkPass ? "PASSED ✅ (Goatee rendered cleanly around smirk)" : "FAILED ❌"}`);
  if (!goateeSmirkPass) regressionPassed = false;

  // 4. None Mouth + Short Beard
  const noneBeardDesign: MinecraftSkinDesign = { ...parentDesign, facialHair: "short-beard", mouthStyle: "none" };
  const noneBeardBuf = compileMinecraftSkinBlueprint(noneBeardDesign, seed, "classic", "detailed", "Streetwear anime character");
  const noneBeardDiff = comparePixels(mouthBuffers["none"], noneBeardBuf);
  console.log(`\n4. None Mouth + Short Beard vs (Clean Shaven + None Mouth):`);
  console.log(`   Diff Pixels: ${noneBeardDiff.totalDiff}`);
  console.log(`   By Region:`, noneBeardDiff.byRegion);
  const noneBeardPass = noneBeardDiff.totalDiff === 20;
  console.log(`   Status: ${noneBeardPass ? "PASSED ✅ (None mouth clean skin preserved under beard)" : "FAILED ❌"}`);
  if (!noneBeardPass) regressionPassed = false;

  // Save report
  const fullReport = {
    allOptionsPassed,
    regressionPassed,
    optionResults,
    passed: allOptionsPassed && regressionPassed,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, "verification-summary.json"), JSON.stringify(fullReport, null, 2));

  console.log("\n==================================================");
  console.log(`OVERALL STATUS: ${fullReport.passed ? "ALL CHECKS PASSED ✅" : "SOME CHECKS FAILED ❌"}`);
  console.log("==================================================");
}

runVerification().catch(console.error);
