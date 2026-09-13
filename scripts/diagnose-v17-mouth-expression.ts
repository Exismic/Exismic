import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkinBlueprint,
} from "../src/lib/minecraft-skin-blueprint";
import {
  compileMinecraftSkin,
  type MinecraftSkinDesign,
} from "../src/lib/minecraft-skin";

const OUTPUT_DIR = path.join(process.cwd(), "v17-mouth-diagnostic-output");
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

async function runDiagnostic() {
  console.log("==================================================");
  console.log("MINECRAFT SKIN STUDIO v1.7 — MOUTH DIAGNOSTIC SUITE");
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

  for (const ms of mouthOptions) {
    const diff = comparePixels(smileBuf, mouthBuffers[ms]);
    console.log(`\nMouth Option: "${ms}" vs "smile":`);
    console.log(`  Selected UI Value: "${ms}"`);
    console.log(`  Design Property: design.mouthStyle = "${ms}"`);
    console.log(`  Total Differing Pixels: ${diff.totalDiff}`);
    console.log(`  By Region:`, diff.byRegion);
    if (diff.totalDiff === 0 && ms !== "smile") {
      console.log(`  ⚠️ RESULT: UI state changes but renderer output does not.`);
    }

    optionResults[ms] = {
      uiValue: ms,
      designValue: ms,
      totalDiff: diff.totalDiff,
      byRegion: diff.byRegion,
      isIdenticalToParent: diff.totalDiff === 0,
    };
  }

  // Check face row 6 (mouth row: dy = 6, which is y = 14, x = 8..15)
  console.log("\n--- PART 2: FACE ROW 6 (MOUTH ROW, y=14) PIXEL INSPECTION ---");
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
    console.log(`Mouth "${ms}" row 14 (cols 0..7): ${rowHexes.join(" ")}`);
  }

  // Check interaction with facial hair
  console.log("\n--- PART 3: INTERACTION WITH FACIAL HAIR ---");
  const fhCombos = [
    { mouth: "smile", fh: "none" },
    { mouth: "neutral", fh: "short-beard" },
    { mouth: "smirk", fh: "goatee" },
    { mouth: "open", fh: "none" },
    { mouth: "none", fh: "short-beard" },
  ] as const;

  const comboResults: any[] = [];
  for (const c of fhCombos) {
    const d: MinecraftSkinDesign = { ...parentDesign, mouthStyle: c.mouth, facialHair: c.fh };
    const buf = compileMinecraftSkinBlueprint(d, seed, "classic", "detailed", "Streetwear anime character");
    await sharp(Buffer.from(buf), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, `combo-${c.mouth}-${c.fh}.png`));

    // Compare with parent (smile + none)
    const diff = comparePixels(smileBuf, buf);
    console.log(`Combo: Mouth="${c.mouth}" + FacialHair="${c.fh}":`);
    console.log(`  Total Differing Pixels vs (smile + none): ${diff.totalDiff}`);
    console.log(`  By Region:`, diff.byRegion);

    comboResults.push({
      mouth: c.mouth,
      facialHair: c.fh,
      totalDiff: diff.totalDiff,
      byRegion: diff.byRegion,
    });
  }

  // Check interaction with Eye Style (Cyber Visor + Smile)
  console.log("\n--- PART 4: INTERACTION WITH EYE STYLE (Cyber Visor + Smile) ---");
  const visorSmileDesign: MinecraftSkinDesign = { ...parentDesign, eyeStyle: "visor", mouthStyle: "smile" };
  const visorBuf = compileMinecraftSkinBlueprint(visorSmileDesign, seed, "classic", "detailed", "Streetwear anime character");
  await sharp(Buffer.from(visorBuf), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(path.join(OUTPUT_DIR, "combo-visor-smile.png"));

  const visorDiff = comparePixels(smileBuf, visorBuf);
  console.log(`Cyber Visor + Smile vs (Anime + Smile):`);
  console.log(`  Total Differing Pixels: ${visorDiff.totalDiff}`);
  console.log(`  By Region:`, visorDiff.byRegion);

  const report = {
    optionResults,
    comboResults,
    visorInteraction: {
      totalDiff: visorDiff.totalDiff,
      byRegion: visorDiff.byRegion,
    },
    rootCause: {
      classification: "D. Blueprint compiler & E. Face blueprint",
      summary: "design.mouthStyle is not extracted in safeExtractBlueprintDesign, is not passed to generateFaceBlueprint, and generateFaceBlueprint has no logic for mouthStyle, leaving row 6 hardcoded as KKKllKKK.",
    },
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, "diagnostic-summary.json"), JSON.stringify(report, null, 2));
  console.log(`\nDiagnostic summary written to: ${path.join(OUTPUT_DIR, "diagnostic-summary.json")}`);
}

runDiagnostic().catch(console.error);
