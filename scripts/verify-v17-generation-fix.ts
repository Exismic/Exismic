import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkinBlueprint,
  type BlueprintSkinStyle,
} from "../src/lib/minecraft-skin-blueprint";
import { type MinecraftArmModel } from "../src/lib/minecraft-skin";

const OUTPUT_DIR = path.join(process.cwd(), "v17-fix-output");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface PixelRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
  hex: string;
}

function getPixel(buffer: Uint8Array, x: number, y: number): PixelRGBA {
  const idx = (y * 64 + x) * 4;
  const r = buffer[idx];
  const g = buffer[idx + 1];
  const b = buffer[idx + 2];
  const a = buffer[idx + 3];
  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  return { r, g, b, a, hex };
}

function isCyan(p: PixelRGBA): boolean {
  return p.a === 255 && p.g > 160 && p.b > 180 && p.r < 120;
}

function isRed(p: PixelRGBA): boolean {
  return p.a === 255 && p.r > 160 && p.g < 70 && p.b < 70;
}

function isDarkCharcoalOrBlack(p: PixelRGBA): boolean {
  return p.a === 255 && p.r < 75 && p.g < 75 && p.b < 75;
}

function isWhiteOrLight(p: PixelRGBA): boolean {
  return p.a === 255 && p.r > 190 && p.g > 190 && p.b > 190;
}

async function savePreviewPng(buffer: Uint8Array, filename: string) {
  const rawPath = path.join(OUTPUT_DIR, `${filename}.png`);
  const upscalePath = path.join(OUTPUT_DIR, `${filename}-8x.png`);
  await sharp(Buffer.from(buffer), {
    raw: { width: 64, height: 64, channels: 4 },
  }).png().toFile(rawPath);

  await sharp(rawPath)
    .resize(512, 512, { kernel: sharp.kernel.nearest })
    .png()
    .toFile(upscalePath);
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    throw new Error(msg);
  }
  passedTests++;
  console.log(`  ✓ ${msg}`);
}

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 EXISMIC v1.7 BLUEPRINT GENERATION FIX — SEMANTIC PIXEL SUITE");
  console.log("==================================================================");

  // -------------------------------------------------------------------------
  // TEST 1: Exact Failed User Generation (Streetwear Boy)
  // -------------------------------------------------------------------------
  console.log("\n[TEST 1] Exact Failed Streetwear Prompt (cmtvjb0q90009jz04pfox6d5s)");
  const streetwearPrompt = "Streetwear boy with messy silver hair, black oversized hoodie under a red bomber jacket, wide cargo pants, white chunky sneakers, and cyan headphones.";
  const streetwearDesign: any = {
    fit: "oversized",
    halo: false,
    name: "Streetwear Boy",
    crown: false,
    horns: false,
    socks: "none",
    cables: false,
    emblem: "",
    gloves: false,
    outfit: "streetwear",
    traits: ["high-contrast"],
    zipper: "silver",
    glasses: false,
    palette: {
      top: "#ff0000",
      eyes: "#00bfff",
      hair: "#c0c0c0",
      skin: "#f5c6a5",
      pants: "#2f2f2f",
      shoes: "#ffffff",
      detail: "#00ffff",
      skinShade: "#d9a58f",
      topAccent: "#000000",
      hairHighlight: "#e0e0e0",
    },
    pattern: "clean",
    placket: "center_zip",
    sleeves: "long",
    eyeShape: "normal",
    eyeStyle: "glowing",
    footwear: "shoes",
    midLayer: "hoodie",
    asymmetry: false,
    faceStyle: "open",
    hairStyle: "long",
    hoodState: "down",
    pantsType: "wide_cargo",
    bangsStyle: "none",
    expression: "neutral",
    facialHair: "none",
    headphones: true,
    mouthStyle: "neutral",
    description: "A streetwear teen with messy silver hair, wearing a black oversized hoodie under a bright red bomber jacket, wide cargo pants, white chunky sneakers, and cyan headphones. High‑contrast visual style.",
    drawstrings: "none",
    garmentType: "bomber-jacket",
    sleeveStyle: "rolled_cuff",
    cargoPockets: true,
    innerGarment: "none",
    footwearStyle: "chunky-sneaker",
    hairSilhouette: "messy-fringe",
    materialProfile: "technical-fabric",
    faceConstruction: "masculine-angular",
    lightingDirection: "front",
    negativeConstraints: [],
  };

  const streetwearBuffer = compileMinecraftSkinBlueprint(
    streetwearDesign,
    3665656355,
    "classic",
    "high-contrast",
    streetwearPrompt
  );

  await savePreviewPng(streetwearBuffer, "test1-streetwear-fixed");

  // Assertion 1.1: Headphone headband pixels on top overlay (x: 41..46, y: 3)
  let cyanHeadbandPixels = 0;
  for (let x = 41; x <= 46; x++) {
    const p = getPixel(streetwearBuffer, x, 3);
    if (isCyan(p)) cyanHeadbandPixels++;
  }
  assert(cyanHeadbandPixels >= 4, `Headphone headband must contain >= 4 cyan pixels on top overlay row 3 (found ${cyanHeadbandPixels})`);

  // Assertion 1.2: Headphone ear cups on right overlay (x: 34..37, y: 10..13) and left overlay (x: 50..53, y: 10..13)
  let rightEarCupCyan = 0;
  for (let y = 10; y <= 13; y++) {
    for (let x = 34; x <= 37; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (isCyan(p)) rightEarCupCyan++;
    }
  }
  assert(rightEarCupCyan >= 4, `Right ear cup must contain >= 4 cyan pixels on overlay (found ${rightEarCupCyan})`);

  let leftEarCupCyan = 0;
  for (let y = 10; y <= 13; y++) {
    for (let x = 50; x <= 53; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (isCyan(p)) leftEarCupCyan++;
    }
  }
  assert(leftEarCupCyan >= 4, `Left ear cup must contain >= 4 cyan pixels on overlay (found ${leftEarCupCyan})`);

  // Assertion 1.3: Headphone ear cups must NOT overwrite face eyes or nose bridge
  const leftEyePixel = getPixel(streetwearBuffer, 10, 11);
  const rightEyePixel = getPixel(streetwearBuffer, 13, 11);
  const noseBridge = getPixel(streetwearBuffer, 11, 11);
  assert(isCyan(leftEyePixel) || leftEyePixel.b > 180, `Left eye must remain intact and blue/cyan (got ${leftEyePixel.hex})`);
  assert(isCyan(rightEyePixel) || rightEyePixel.b > 180, `Right eye must remain intact and blue/cyan (got ${rightEyePixel.hex})`);
  assert(noseBridge.r > 200 && noseBridge.g > 150, `Nose bridge between eyes must remain skin tone (got ${noseBridge.hex})`);

  // Assertion 1.4: Torso mid-layer hoodie on torso base (x: 20..27, y: 20..31)
  let hoodieDarkPixelsOnBase = 0;
  for (let y = 20; y <= 31; y++) {
    for (let x = 20; x <= 27; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (isDarkCharcoalOrBlack(p)) hoodieDarkPixelsOnBase++;
    }
  }
  assert(hoodieDarkPixelsOnBase >= 40, `Torso base must contain >= 40 dark hoodie pixels (found ${hoodieDarkPixelsOnBase} of 96)`);

  // Assertion 1.5: Torso outer red bomber jacket on torso overlay (x: 20..27, y: 36..47)
  let bomberRedPixelsOnOverlay = 0;
  for (let y = 36; y <= 47; y++) {
    for (let x = 20; x <= 27; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (isRed(p)) bomberRedPixelsOnOverlay++;
    }
  }
  assert(bomberRedPixelsOnOverlay >= 20, `Torso overlay must contain red bomber jacket flaps (found ${bomberRedPixelsOnOverlay} red pixels)`);

  // Assertion 1.6: Center of torso overlay must be open/transparent, revealing hoodie
  let transparentCenterOverlayPixels = 0;
  for (let y = 37; y <= 43; y++) {
    for (let x = 22; x <= 24; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (p.a === 0) transparentCenterOverlayPixels++;
    }
  }
  assert(transparentCenterOverlayPixels >= 10, `Torso overlay center must be open/transparent to reveal underlying hoodie (found ${transparentCenterOverlayPixels})`);

  // Assertion 1.7: Zipper slider present on overlay
  const zipperPixel = getPixel(streetwearBuffer, 25, 39);
  assert(isWhiteOrLight(zipperPixel), `Zipper slider must be present at (25, 39) on bomber overlay (got ${zipperPixel.hex})`);

  // Assertion 1.8: Sleeve mid-layer hoodie cuffs underneath outer bomber sleeves
  // Right Arm Base: rows 8-9 (y = 28, 29, x = 40..55) must be dark hoodie cuff
  let rightArmUnderSleeveDark = 0;
  for (let y = 28; y <= 29; y++) {
    for (let x = 44; x <= 47; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (isDarkCharcoalOrBlack(p)) rightArmUnderSleeveDark++;
    }
  }
  assert(rightArmUnderSleeveDark >= 6, `Right arm base rows 8-9 must contain dark hoodie under-sleeve cuffs (found ${rightArmUnderSleeveDark})`);

  // Right Arm Overlay: rows 0-6 (y = 36..42) red bomber, rows 7-11 (y = 43..47) transparent
  let rightArmOverlayRed = 0;
  for (let y = 36; y <= 42; y++) {
    for (let x = 44; x <= 47; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (isRed(p)) rightArmOverlayRed++;
    }
  }
  assert(rightArmOverlayRed >= 15, `Right arm overlay rows 0-6 must contain red bomber outer sleeve (found ${rightArmOverlayRed})`);

  let rightArmOverlayTransparent = 0;
  for (let y = 43; y <= 47; y++) {
    for (let x = 44; x <= 47; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (p.a === 0) rightArmOverlayTransparent++;
    }
  }
  assert(rightArmOverlayTransparent >= 15, `Right arm overlay rows 7-11 must be transparent to expose hoodie cuff and wrist (found ${rightArmOverlayTransparent})`);

  // Assertion 1.9: Chunky sneakers on legs (rows 28..31 on right leg base, x: 0..15)
  let whiteShoePixels = 0;
  for (let y = 28; y <= 31; y++) {
    for (let x = 0; x <= 15; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (isWhiteOrLight(p)) whiteShoePixels++;
    }
  }
  assert(whiteShoePixels >= 20, `Leg base rows 28-31 must contain white chunky sneaker pixels (found ${whiteShoePixels})`);

  // Assertion 1.10: Messy silver hair
  let silverHairPixels = 0;
  for (let y = 0; y <= 7; y++) {
    for (let x = 8; x <= 15; x++) {
      const p = getPixel(streetwearBuffer, x, y);
      if (p.a === 255 && Math.abs(p.r - p.g) < 15 && Math.abs(p.g - p.b) < 15 && p.r > 150) {
        silverHairPixels++;
      }
    }
  }
  assert(silverHairPixels >= 30, `Head top base must contain silver hair pixels (found ${silverHairPixels})`);

  // -------------------------------------------------------------------------
  // TEST 2: Negative Assertion — headphones: false
  // -------------------------------------------------------------------------
  console.log("\n[TEST 2] Negative Assertion — headphones: false");
  const noHeadphonesDesign: any = {
    ...streetwearDesign,
    headphones: false,
  };
  const noHeadphonesBuffer = compileMinecraftSkinBlueprint(
    noHeadphonesDesign,
    3665656355,
    "classic",
    "high-contrast",
    streetwearPrompt
  );

  let noHeadphonesCyan = 0;
  for (let x = 41; x <= 46; x++) {
    const p = getPixel(noHeadphonesBuffer, x, 3);
    if (isCyan(p)) noHeadphonesCyan++;
  }
  assert(noHeadphonesCyan === 0, `When headphones: false, top overlay row 3 must NOT contain cyan headphone pixels (found ${noHeadphonesCyan})`);

  let noHeadphonesEarCupsCyan = 0;
  for (let y = 10; y <= 13; y++) {
    for (let x = 34; x <= 37; x++) {
      const p = getPixel(noHeadphonesBuffer, x, y);
      if (isCyan(p)) noHeadphonesEarCupsCyan++;
    }
  }
  assert(noHeadphonesEarCupsCyan === 0, `When headphones: false, right overlay must NOT contain cyan ear cup pixels (found ${noHeadphonesEarCupsCyan})`);

  // -------------------------------------------------------------------------
  // TEST 3: Negative Assertion — midLayer: "none"
  // -------------------------------------------------------------------------
  console.log("\n[TEST 3] Negative Assertion — midLayer: 'none'");
  const singleLayerDesign: any = {
    ...streetwearDesign,
    midLayer: "none",
  };
  const singleLayerBuffer = compileMinecraftSkinBlueprint(
    singleLayerDesign,
    3665656355,
    "classic",
    "high-contrast",
    "Streetwear boy with red bomber jacket and wide cargo pants."
  );

  // When midLayer is none, torso base color should be topRamp (red), NOT black hoodie
  let singleLayerRedOnBase = 0;
  for (let y = 20; y <= 31; y++) {
    for (let x = 20; x <= 27; x++) {
      const p = getPixel(singleLayerBuffer, x, y);
      if (isRed(p)) singleLayerRedOnBase++;
    }
  }
  assert(singleLayerRedOnBase >= 40, `When midLayer: 'none', torso base must render outer garment (found ${singleLayerRedOnBase} red pixels)`);

  // -------------------------------------------------------------------------
  // TEST 4: Archetype 1 — Gothic Knight / Paladin
  // -------------------------------------------------------------------------
  console.log("\n[TEST 4] Real Archetype 1 — Gothic Knight / Paladin");
  const knightPrompt = "Gothic paladin in dark steel plate armor with silver pauldrons, chainmail under-tunic, and armored sabatons.";
  const knightDesign: any = {
    fit: "standard",
    halo: false,
    name: "Gothic Paladin",
    crown: false,
    horns: false,
    socks: "none",
    cables: false,
    emblem: "",
    gloves: true,
    outfit: "fantasy-armor",
    traits: ["detailed"],
    zipper: "none",
    glasses: false,
    palette: {
      top: "#334155",
      eyes: "#94a3b8",
      hair: "#0f172a",
      skin: "#f8fafc",
      pants: "#1e293b",
      shoes: "#475569",
      detail: "#e2e8f0",
      topAccent: "#e2e8f0",
    },
    pattern: "clean",
    placket: "armor_fauld",
    sleeves: "long",
    eyeShape: "normal",
    eyeStyle: "realistic",
    footwear: "boots",
    midLayer: "none",
    asymmetry: false,
    faceStyle: "open",
    hairStyle: "short",
    hoodState: "none",
    pantsType: "tailored_trousers",
    bangsStyle: "none",
    expression: "stoic",
    facialHair: "none",
    headphones: false,
    mouthStyle: "neutral",
    description: "Dark steel paladin armor with silver pauldrons.",
    drawstrings: "none",
    garmentType: "armor-cuirass",
    sleeveStyle: "gauntlet_bracer",
    cargoPockets: false,
    innerGarment: "tunic",
    footwearStyle: "armored-sabaton",
    hairSilhouette: "military-crop",
    materialProfile: "metal",
    faceConstruction: "masculine-angular",
    lightingDirection: "upper-left",
    negativeConstraints: [],
  };

  const knightBuffer = compileMinecraftSkinBlueprint(
    knightDesign,
    777777,
    "classic",
    "detailed",
    knightPrompt
  );
  await savePreviewPng(knightBuffer, "test4-paladin-armor");
  // Pauldron metal pixels on top of shoulders (x: 44..47, y: 32..35)
  let pauldronPixels = 0;
  for (let y = 32; y <= 35; y++) {
    for (let x = 44; x <= 47; x++) {
      const p = getPixel(knightBuffer, x, y);
      if (p.a === 255) pauldronPixels++;
    }
  }
  assert(pauldronPixels >= 10, `Paladin armor must render pauldrons on shoulder overlays (found ${pauldronPixels})`);

  // -------------------------------------------------------------------------
  // TEST 5: Archetype 2 — Cottagecore Girl / Cable-Knit & Skirt
  // -------------------------------------------------------------------------
  console.log("\n[TEST 5] Real Archetype 2 — Cottagecore Girl");
  const cottagePrompt = "Cottagecore girl with braided brown hair, cozy cream cable-knit sweater, pleated plaid skirt, and floral headband.";
  const cottageDesign: any = {
    fit: "standard",
    halo: false,
    name: "Cottagecore Girl",
    crown: false,
    horns: false,
    socks: "knee_high_plain",
    cables: false,
    emblem: "",
    gloves: false,
    outfit: "cottagecore",
    traits: ["soft-shaded"],
    zipper: "none",
    glasses: false,
    palette: {
      top: "#fef3c7",
      eyes: "#059669",
      hair: "#78350f",
      skin: "#fed7aa",
      pants: "#854d0e",
      shoes: "#451a03",
      detail: "#fbbf24",
      topAccent: "#d97706",
    },
    pattern: "clean",
    placket: "pullover",
    sleeves: "long",
    eyeShape: "large",
    eyeStyle: "anime",
    footwear: "shoes",
    midLayer: "none",
    asymmetry: false,
    faceStyle: "open",
    hairStyle: "long",
    hoodState: "none",
    pantsType: "pleated_skirt",
    bangsStyle: "straight",
    expression: "smile",
    facialHair: "none",
    headphones: false,
    mouthStyle: "smile",
    description: "Cream cable-knit sweater, pleated skirt, floral headband.",
    drawstrings: "none",
    garmentType: "knit-sweater",
    sleeveStyle: "slouch_gather",
    cargoPockets: false,
    innerGarment: "cable_knit",
    footwearStyle: "loafer-oxford",
    hairSilhouette: "curtain-bangs",
    materialProfile: "knit",
    faceConstruction: "feminine-soft",
    lightingDirection: "upper-left",
    negativeConstraints: [],
  };

  const cottageBuffer = compileMinecraftSkinBlueprint(
    cottageDesign,
    888888,
    "slim",
    "balanced",
    cottagePrompt
  );
  await savePreviewPng(cottageBuffer, "test5-cottagecore");
  assert(cottageBuffer.length === 64 * 64 * 4, "Cottagecore skin must compile successfully to 16,384 bytes");

  // -------------------------------------------------------------------------
  // TEST 6: Archetype 3 — Cyberpunk Visor Runner
  // -------------------------------------------------------------------------
  console.log("\n[TEST 6] Real Archetype 3 — Cyberpunk Visor Runner");
  const cyberPrompt = "Cyberpunk runner with neon magenta visor, black techwear jacket with high-vis safety straps, cargo pants, and high-top sneakers.";
  const cyberDesign: any = {
    fit: "standard",
    halo: false,
    name: "Cyber Runner",
    crown: false,
    horns: false,
    socks: "none",
    cables: false,
    emblem: "",
    gloves: true,
    outfit: "techwear",
    traits: ["high-contrast"],
    zipper: "black",
    glasses: false,
    palette: {
      top: "#18181b",
      eyes: "#f43f5e",
      hair: "#09090b",
      skin: "#f43f5e",
      pants: "#18181b",
      shoes: "#09090b",
      detail: "#f43f5e",
      topAccent: "#f43f5e",
    },
    pattern: "clean",
    placket: "center_zip",
    sleeves: "long",
    eyeShape: "normal",
    eyeStyle: "visor",
    footwear: "boots",
    midLayer: "none",
    asymmetry: false,
    faceStyle: "open",
    hairStyle: "short",
    hoodState: "none",
    pantsType: "wide_cargo",
    bangsStyle: "none",
    expression: "neutral",
    facialHair: "none",
    headphones: false,
    mouthStyle: "none",
    description: "Cyberpunk visor runner with high-vis straps.",
    drawstrings: "none",
    garmentType: "techwear-jacket",
    sleeveStyle: "straight",
    cargoPockets: true,
    innerGarment: "none",
    footwearStyle: "high-top-sneaker",
    hairSilhouette: "military-crop",
    materialProfile: "plastic",
    faceConstruction: "masked-visor",
    lightingDirection: "front",
    negativeConstraints: [],
  };

  const cyberBuffer = compileMinecraftSkinBlueprint(
    cyberDesign,
    999999,
    "classic",
    "high-contrast",
    cyberPrompt
  );
  await savePreviewPng(cyberBuffer, "test6-cyber-runner");
  // Visor pixels across eyes (x: 9..14, y: 11..12)
  let visorPixels = 0;
  for (let y = 11; y <= 12; y++) {
    for (let x = 9; x <= 14; x++) {
      const p = getPixel(cyberBuffer, x, y);
      if (p.r > 180 && p.b > 80) visorPixels++;
    }
  }
  assert(visorPixels >= 8, `Cyberpunk runner must render glowing visor band across face (found ${visorPixels})`);

  // -------------------------------------------------------------------------
  // TEST 7: Archetype 4 — Desert Nomad / Scarf & Haori
  // -------------------------------------------------------------------------
  console.log("\n[TEST 7] Real Archetype 4 — Desert Nomad");
  const nomadPrompt = "Desert wanderer in sandy haori wrap robe, wrapped linen scarf collar, and leather sandals wrap.";
  const nomadDesign: any = {
    fit: "standard",
    halo: false,
    name: "Desert Nomad",
    crown: false,
    horns: false,
    socks: "none",
    cables: false,
    emblem: "",
    gloves: false,
    outfit: "fantasy-armor",
    traits: ["detailed"],
    zipper: "none",
    glasses: false,
    palette: {
      top: "#d4a373",
      eyes: "#3a5a40",
      hair: "#582f0e",
      skin: "#e07a5f",
      pants: "#ccd5ae",
      shoes: "#7f4f24",
      detail: "#e9edc9",
      topAccent: "#faedcd",
    },
    pattern: "clean",
    placket: "haori_wrap",
    sleeves: "long",
    eyeShape: "normal",
    eyeStyle: "realistic",
    footwear: "shoes",
    midLayer: "none",
    asymmetry: false,
    faceStyle: "open",
    hairStyle: "medium",
    hoodState: "none",
    pantsType: "tailored_trousers",
    bangsStyle: "none",
    expression: "stoic",
    facialHair: "none",
    headphones: false,
    mouthStyle: "neutral",
    description: "Desert nomad with haori wrap and wrapped scarf.",
    drawstrings: "none",
    garmentType: "haori-wrap",
    sleeveStyle: "wide_haori",
    cargoPockets: false,
    innerGarment: "crew_tee",
    footwearStyle: "sandals-wrap",
    hairSilhouette: "messy-fringe",
    materialProfile: "cotton",
    faceConstruction: "masculine-angular",
    lightingDirection: "upper-left",
    negativeConstraints: [],
  };

  const nomadBuffer = compileMinecraftSkinBlueprint(
    nomadDesign,
    111222,
    "classic",
    "detailed",
    nomadPrompt
  );
  await savePreviewPng(nomadBuffer, "test7-desert-nomad");
  assert(nomadBuffer.length === 64 * 64 * 4, "Desert nomad skin must compile successfully to 16,384 bytes");

  // -------------------------------------------------------------------------
  // TEST 8: Archetype 5 — Layered Skater Tee over Striped Long-Sleeve
  // -------------------------------------------------------------------------
  console.log("\n[TEST 8] Real Archetype 5 — Layered Skater Tee");
  const skaterPrompt = "90s skater boy wearing a black oversized graphic t-shirt over a striped long-sleeve undershirt, baggy jeans, and low-top skate shoes.";
  const skaterDesign: any = {
    fit: "oversized",
    halo: false,
    name: "90s Skater",
    crown: false,
    horns: false,
    socks: "ankle",
    cables: false,
    emblem: "",
    gloves: false,
    outfit: "streetwear",
    traits: ["detailed"],
    zipper: "none",
    glasses: false,
    palette: {
      top: "#18181b",
      eyes: "#10b981",
      hair: "#fbbf24",
      skin: "#fde68a",
      pants: "#3b82f6",
      shoes: "#09090b",
      detail: "#ef4444",
      topAccent: "#f87171",
    },
    pattern: "clean",
    placket: "closed",
    sleeves: "long",
    eyeShape: "normal",
    eyeStyle: "expressive",
    footwear: "shoes",
    midLayer: "none",
    asymmetry: false,
    faceStyle: "open",
    hairStyle: "medium",
    hoodState: "none",
    pantsType: "relaxed_jeans",
    bangsStyle: "side_swept",
    expression: "smirk",
    facialHair: "none",
    headphones: false,
    mouthStyle: "smirk",
    description: "Black graphic t-shirt over striped long-sleeve undershirt.",
    drawstrings: "none",
    garmentType: "graphic-tee",
    sleeveStyle: "layered_undershirt",
    cargoPockets: false,
    innerGarment: "striped_undershirt",
    footwearStyle: "low-top-skate",
    hairSilhouette: "middle-part-flow",
    materialProfile: "cotton",
    faceConstruction: "anime-expressive",
    lightingDirection: "upper-left",
    negativeConstraints: [],
  };

  const skaterBuffer = compileMinecraftSkinBlueprint(
    skaterDesign,
    333444,
    "classic",
    "detailed",
    skaterPrompt
  );
  await savePreviewPng(skaterBuffer, "test8-layered-skater");
  let skaterArmStripes = 0;
  for (let y = 24; y <= 29; y++) {
    for (let x = 44; x <= 47; x++) {
      const p = getPixel(skaterBuffer, x, y);
      if (p.a === 255) skaterArmStripes++;
    }
  }
  assert(skaterArmStripes >= 20, `Layered skater must have under-sleeve on arm base (found ${skaterArmStripes})`);

  console.log("\n==================================================================");
  console.log(`🎉 ALL ${passedTests}/${totalTests} SEMANTIC PIXEL ASSERTIONS PASSED!`);
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
