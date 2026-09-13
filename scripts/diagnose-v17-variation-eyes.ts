import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkin,
  sanitizeSkinDesign,
  type MinecraftArmModel,
  type MinecraftSkinDesign,
} from "../src/lib/minecraft-skin";
import {
  compileMinecraftSkinBlueprint,
  safeExtractBlueprintDesign,
} from "../src/lib/minecraft-skin-blueprint";
import {
  generateFaceBlueprint,
} from "../src/lib/minecraft-skin-blueprint-hair";

const DIAG_DIR = path.join(process.cwd(), "v17-diagnostic-output");
if (!fs.existsSync(DIAG_DIR)) {
  fs.mkdirSync(DIAG_DIR, { recursive: true });
}

// Region definitions on 64x64 Minecraft Skin
const REGIONS = {
  headBase: { x: 0, y: 0, w: 32, h: 16 },
  headOverlay: { x: 32, y: 0, w: 32, h: 16 },
  frontFace: { x: 8, y: 8, w: 8, h: 8 },
  torso: { x: 16, y: 16, w: 24, h: 16 },
  rightArm: { x: 40, y: 16, w: 16, h: 16 },
  leftArm: { x: 32, y: 48, w: 16, h: 16 },
  rightLeg: { x: 0, y: 16, w: 16, h: 16 },
  leftLeg: { x: 16, y: 48, w: 16, h: 16 },
};

function getPixelRgba(buf: Uint8Array, x: number, y: number): [number, number, number, number] {
  const idx = (y * 64 + x) * 4;
  return [buf[idx], buf[idx + 1], buf[idx + 2], buf[idx + 3]];
}

function countDiffsInRegion(bufA: Uint8Array, bufB: Uint8Array, reg: { x: number; y: number; w: number; h: number }) {
  let diff = 0;
  const changedCoords: Array<{ x: number; y: number }> = [];
  for (let y = reg.y; y < reg.y + reg.h; y++) {
    for (let x = reg.x; x < reg.x + reg.w; x++) {
      const idx = (y * 64 + x) * 4;
      if (
        bufA[idx] !== bufB[idx] ||
        bufA[idx + 1] !== bufB[idx + 1] ||
        bufA[idx + 2] !== bufB[idx + 2] ||
        bufA[idx + 3] !== bufB[idx + 3]
      ) {
        diff++;
        changedCoords.push({ x, y });
      }
    }
  }
  return { diff, changedCoords };
}

// Parent character (Modern Streetwear Anime Character)
const parentDesign: MinecraftSkinDesign = {
  name: "Cyber Streetwear",
  description: "Cyberpunk urban streetwear hero with oversized hoodie, layered accessories, and anime eyes",
  hairStyle: "short",
  hairSilhouette: "curtain-bangs",
  bangsStyle: "curtain",
  faceConstruction: "clean-aesthetic",
  expression: "friendly",
  eyeShape: "normal",
  eyeStyle: "anime",
  facialHair: "none",
  faceStyle: "open",
  garmentType: "oversized-hoodie" as any,
  midLayer: "hoodie" as any,
  innerGarment: "undershirt" as any,
  placket: "pullover" as any,
  outfit: "streetwear",
  pattern: "clean",
  materialProfile: "cotton",
  sleeves: "long",
  sleeveStyle: "ribbed-cuff" as any,
  gloves: false,
  pantsType: "techwear-joggers" as any,
  cargoPockets: true,
  footwear: "shoes",
  footwearStyle: "chunky-sneakers" as any,
  socks: "none",
  lightingDirection: "upper-left",
  asymmetry: true,
  negativeConstraints: [],
  traits: ["cyberpunk", "hoodie", "sneakers"],
  headphones: true,
  glasses: false,
  cables: false,
  horns: false,
  crown: false,
  halo: false,
  emblem: "none",
  palette: {
    skin: "#fbe4d8",
    skinShade: "#e8beac",
    hair: "#1e1b24",
    hairHighlight: "#453e54",
    eyes: "#38bdf8",
    top: "#181824",
    topAccent: "#a855f7",
    pants: "#1c2030",
    shoes: "#0f172a",
    detail: "#c084fc",
  },
};

async function diagnose() {
  console.log("================================================================================");
  console.log("🔬 DIAGNOSTIC SUITE: PROBLEM A (VARIATION) & PROBLEM B (EYE STYLES)");
  console.log("================================================================================\n");

  // ============================================================================
  // PART A: VARIATION TRACE & COMPARISON
  // ============================================================================
  console.log("--- PART A: VARIATION TRACE ---");
  const parentSeed = 100000;
  // Simulating exact server variation seed generation:
  // seed = ((body.data.seed || seed) + Math.floor(Math.random() * 999999) + 1) % 4294967296;
  const variationSeed1 = (parentSeed + 234567) % 4294967296;
  const variationSeed2 = (variationSeed1 + 456789) % 4294967296;

  console.log(`Parent Seed:      ${parentSeed}`);
  console.log(`Variation Seed 1: ${variationSeed1}`);
  console.log(`Variation Seed 2: ${variationSeed2}`);

  // Compile parent
  const parentBuf = compileMinecraftSkinBlueprint(parentDesign, parentSeed, "classic", "balanced", parentDesign.description);
  await sharp(Buffer.from(parentBuf), { raw: { width: 64, height: 64, channels: 4 } })
    .png()
    .toFile(path.join(DIAG_DIR, "partA-parent.png"));

  // Compile Variation 1
  const var1Buf = compileMinecraftSkinBlueprint(parentDesign, variationSeed1, "classic", "balanced", parentDesign.description);
  await sharp(Buffer.from(var1Buf), { raw: { width: 64, height: 64, channels: 4 } })
    .png()
    .toFile(path.join(DIAG_DIR, "partA-variation1.png"));

  // Compile Variation 2
  const var2Buf = compileMinecraftSkinBlueprint(parentDesign, variationSeed2, "classic", "balanced", parentDesign.description);
  await sharp(Buffer.from(var2Buf), { raw: { width: 64, height: 64, channels: 4 } })
    .png()
    .toFile(path.join(DIAG_DIR, "partA-variation2.png"));

  // Measure diffs: Parent vs Var 1
  const totalDiff_P_V1 = countDiffsInRegion(parentBuf, var1Buf, { x: 0, y: 0, w: 64, h: 64 });
  const headDiff_P_V1 = countDiffsInRegion(parentBuf, var1Buf, { x: 0, y: 0, w: 64, h: 16 });
  const torsoDiff_P_V1 = countDiffsInRegion(parentBuf, var1Buf, { x: 16, y: 16, w: 24, h: 16 });
  const rightArmDiff_P_V1 = countDiffsInRegion(parentBuf, var1Buf, { x: 40, y: 16, w: 24, h: 16 });
  const leftArmDiff_P_V1 = countDiffsInRegion(parentBuf, var1Buf, { x: 32, y: 48, w: 16, h: 16 });
  const legsDiff_P_V1 = countDiffsInRegion(parentBuf, var1Buf, { x: 0, y: 16, w: 16, h: 32 });

  // Measure diffs: Var 1 vs Var 2
  const totalDiff_V1_V2 = countDiffsInRegion(var1Buf, var2Buf, { x: 0, y: 0, w: 64, h: 64 });
  const headDiff_V1_V2 = countDiffsInRegion(var1Buf, var2Buf, { x: 0, y: 0, w: 64, h: 16 });
  const torsoDiff_V1_V2 = countDiffsInRegion(var1Buf, var2Buf, { x: 16, y: 16, w: 24, h: 16 });
  const armsDiff_V1_V2 = countDiffsInRegion(var1Buf, var2Buf, { x: 40, y: 16, w: 24, h: 16 });
  const legsDiff_V1_V2 = countDiffsInRegion(var1Buf, var2Buf, { x: 0, y: 16, w: 16, h: 32 });

  console.log("\n[PIXEL DIFF REPORT: Parent vs Variation 1]");
  console.log(`Total 64x64 Pixels: 4096`);
  console.log(`Total Changed Pixels: ${totalDiff_P_V1.diff} (${((totalDiff_P_V1.diff / 4096) * 100).toFixed(2)}%)`);
  console.log(`- Head (Base + Overlay): ${headDiff_P_V1.diff} pixels`);
  console.log(`- Torso:                 ${torsoDiff_P_V1.diff} pixels`);
  console.log(`- Right Arm:             ${rightArmDiff_P_V1.diff} pixels`);
  console.log(`- Left Arm:              ${leftArmDiff_P_V1.diff} pixels`);
  console.log(`- Legs:                  ${legsDiff_P_V1.diff} pixels`);

  console.log("\n[PIXEL DIFF REPORT: Variation 1 vs Variation 2]");
  console.log(`Total Changed Pixels: ${totalDiff_V1_V2.diff} (${((totalDiff_V1_V2.diff / 4096) * 100).toFixed(2)}%)`);
  console.log(`- Head:                  ${headDiff_V1_V2.diff} pixels`);
  console.log(`- Torso:                 ${torsoDiff_V1_V2.diff} pixels`);
  console.log(`- Arms:                  ${armsDiff_V1_V2.diff} pixels`);
  console.log(`- Legs:                  ${legsDiff_V1_V2.diff} pixels`);

  // ============================================================================
  // PART B: EYE STYLE TRACE & COMPARISON
  // ============================================================================
  console.log("\n\n--- PART B: EYE STYLE TRACE ---");
  const eyeStyles = ["anime", "classic", "glowing", "minimal", "visor"] as const;

  const eyeResults: Record<string, any> = {};

  for (const es of eyeStyles) {
    const updatedDesign: MinecraftSkinDesign = {
      ...parentDesign,
      eyeStyle: es,
    };

    // 1. Blueprint Compilation (what client calls)
    const bpBuf = compileMinecraftSkinBlueprint(updatedDesign, parentSeed, "classic", "balanced", parentDesign.description);
    await sharp(Buffer.from(bpBuf), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(DIAG_DIR, `partB-bp-${es}.png`));

    // 2. Legacy Procedural Compilation (fallback)
    const legBuf = compileMinecraftSkin(updatedDesign, parentSeed, "classic", "balanced", parentDesign.description);
    await sharp(Buffer.from(legBuf), { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(path.join(DIAG_DIR, `partB-legacy-${es}.png`));

    // Compare bpBuf against parentBuf
    const totalDiffAgainstParent = countDiffsInRegion(parentBuf, bpBuf, { x: 0, y: 0, w: 64, h: 64 });
    const faceDiffAgainstParent = countDiffsInRegion(parentBuf, bpBuf, REGIONS.frontFace);
    const headOverlayDiff = countDiffsInRegion(parentBuf, bpBuf, REGIONS.headOverlay);

    // Inspect front face pixels (x: 8..15, y: 8..15)
    console.log(`\n------------------------------------------------------------`);
    console.log(`Eye Style: "${es}"`);
    console.log(`- Total pixels changed vs Parent in Blueprint renderer: ${totalDiffAgainstParent.diff}`);
    console.log(`- Face (8,8 -> 15,15) pixels changed:                   ${faceDiffAgainstParent.diff}`);
    console.log(`- Head Overlay (32,0 -> 63,15) pixels changed:          ${headOverlayDiff.diff}`);
    if (faceDiffAgainstParent.diff > 0) {
      console.log(`- Changed Face Coordinates:`, faceDiffAgainstParent.changedCoords);
    } else {
      console.log(`⚠️ ZERO face pixels changed! The renderer completely ignored eyeStyle="${es}"!`);
    }

    eyeResults[es] = {
      eyeStyle: es,
      totalDiff: totalDiffAgainstParent.diff,
      faceDiff: faceDiffAgainstParent.diff,
      changedFaceCoords: faceDiffAgainstParent.changedCoords,
    };
  }

  // Check what generateFaceBlueprint actually produces
  console.log("\n\n--- FACE BLUEPRINT MATRIX INSPECTION ---");
  const faceConstructions = [
    "clean-aesthetic",
    "anime-expressive",
    "masculine-angular",
    "sharp-cool",
    "mature-minimal",
    "masked-visor",
    "soft-kpop",
  ];
  // ============================================================================
  // PART D: FACIAL HAIR REGRESSION CHECK
  // ============================================================================
  console.log("\n\n--- PART D: FACIAL HAIR REGRESSION CHECK ---");
  const facialHairStates = ["none", "short-beard", "goatee"] as const;
  const facialHairResults: Record<string, boolean> = {};

  for (const fh of facialHairStates) {
    const fhDesign: MinecraftSkinDesign = {
      ...parentDesign,
      facialHair: fh,
    };
    const fhBuf = compileMinecraftSkinBlueprint(fhDesign, 42, "classic", "balanced", parentDesign.description);
    const chinCenter = getPixelRgba(fhBuf, 11, 15);
    const isDarkHair = chinCenter[0] < 75 && chinCenter[1] < 75 && chinCenter[2] < 75;
    const isSkin = chinCenter[0] > 140 && chinCenter[0] > chinCenter[2];

    let passed = false;
    if (fh === "none") {
      passed = isSkin && !isDarkHair;
    } else if (fh === "short-beard") {
      passed = isDarkHair;
    } else if (fh === "goatee") {
      // Center chin is dark hair, outer jaw is skin
      const outerJaw = getPixelRgba(fhBuf, 9, 15);
      const outerIsSkin = outerJaw[0] > 140 && outerJaw[0] > outerJaw[2];
      passed = isDarkHair && outerIsSkin;
    }

    console.log(`Facial Hair: "${fh}" -> Passed: ${passed ? "✅ YES" : "❌ NO"}`);
    facialHairResults[fh] = passed;
  }

  // Save full diagnostic JSON
  fs.writeFileSync(
    path.join(DIAG_DIR, "diagnostic-summary.json"),
    JSON.stringify(
      {
        variation: {
          parentSeed,
          variationSeed1,
          variationSeed2,
          totalDiff_P_V1: totalDiff_P_V1.diff,
          headDiff_P_V1: headDiff_P_V1.diff,
          torsoDiff_P_V1: torsoDiff_P_V1.diff,
          totalDiff_V1_V2: totalDiff_V1_V2.diff,
        },
        eyeStyles: eyeResults,
        facialHairRegression: facialHairResults,
      },
      null,
      2
    )
  );
  console.log(`\nDiagnostic summary written to: ${path.join(DIAG_DIR, "diagnostic-summary.json")}`);
}

diagnose().catch((err) => {
  console.error("DIAGNOSTIC ERROR:", err);
  process.exit(1);
});
