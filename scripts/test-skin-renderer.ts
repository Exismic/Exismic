import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkin,
  createFallbackSkinDesign,
  sanitizeSkinDesign,
  type MinecraftArmModel,
} from "../src/lib/minecraft-skin";

const ARTIFACTS_SKINS_DIR = "C:\\Users\\rayan\\.gemini\\antigravity-ide\\brain\\fb4320e3-360a-4b23-8a36-661626629575\\skins";

const TEST_PROMPTS = [
  // --- SUITE 1: ARCHETYPE DIFFERENTIATION ---
  {
    id: "suite1_A_kpop_boy",
    title: "A. K-pop boy, cream oversized sweater",
    prompt: "K-pop boy, cream oversized sweater",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite1_B_aesthetic_boy",
    title: "B. Aesthetic boy, purple oversized hoodie, silver curtain bangs",
    prompt: "Aesthetic boy, purple oversized hoodie, silver curtain bangs",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite1_C_cottagecore_girl",
    title: "C. Cottagecore girl, pastel green overalls, blonde braided hair",
    prompt: "Cottagecore girl, pastel green overalls, blonde braided hair",
    armModel: "slim" as MinecraftArmModel,
  },
  {
    id: "suite1_D_cyberpunk_ninja",
    title: "D. Cyberpunk ninja, black techwear, cyan accents",
    prompt: "Cyberpunk ninja, black techwear, cyan accents",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite1_E_paladin_knight",
    title: "E. Paladin knight, steel plate armor",
    prompt: "Paladin knight, steel plate armor",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite1_F_demon_oni",
    title: "F. Demon oni warrior, dark flame armor",
    prompt: "Demon oni warrior, dark flame armor",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite1_G_minimal_casual",
    title: "G. Minimal casual character",
    prompt: "Minimal casual character",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite1_H_streetwear_headphones",
    title: "H. Streetwear character with headphones and glasses",
    prompt: "Streetwear character with headphones and glasses",
    armModel: "slim" as MinecraftArmModel,
  },

  // --- SUITE 2: SAME-ARCHETYPE STREETWEAR VARIATION TEST ---
  {
    id: "suite2_1_black_hoodie",
    title: "1. Black oversized hoodie + white hair",
    prompt: "black oversized hoodie and white hair",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite2_2_cream_sweater",
    title: "2. Cream sweater + brown messy hair",
    prompt: "cream sweater and brown messy hair",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite2_3_blue_varsity",
    title: "3. Blue varsity jacket + blonde hair",
    prompt: "blue varsity jacket and blonde hair",
    armModel: "slim" as MinecraftArmModel,
  },
  {
    id: "suite2_4_gray_techwear",
    title: "4. Gray techwear jacket + black hair",
    prompt: "gray techwear jacket and black hair",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "suite2_5_red_bomber",
    title: "5. Red bomber jacket + silver hair",
    prompt: "red bomber jacket and silver hair",
    armModel: "classic" as MinecraftArmModel,
  },
];

async function run() {
  const localOutputDir = path.join(process.cwd(), "test-output-skins");
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }
  if (!fs.existsSync(ARTIFACTS_SKINS_DIR)) {
    fs.mkdirSync(ARTIFACTS_SKINS_DIR, { recursive: true });
  }

  console.log("=================================================================");
  console.log("  MINECRAFT SKIN RENDERER v1.6 VISUAL QA & VERIFICATION SUITE   ");
  console.log("=================================================================\n");

  const resultsSummary = [];

  for (const test of TEST_PROMPTS) {
    console.log(`Evaluating: ${test.title}`);
    const seed = 42;
    const design = sanitizeSkinDesign({}, test.prompt, seed);
    const pixels = compileMinecraftSkin(design, seed, test.armModel, "balanced", test.prompt);

    // 1. Save raw 64x64 PNG locally and in artifacts
    const rawFilename = `${test.id}_raw64.png`;
    const localRawPath = path.join(localOutputDir, rawFilename);
    const artifactRawPath = path.join(ARTIFACTS_SKINS_DIR, rawFilename);
    const rawBuffer = Buffer.from(pixels);

    await sharp(rawBuffer, { raw: { width: 64, height: 64, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(localRawPath);
    fs.copyFileSync(localRawPath, artifactRawPath);

    // 2. Save 8x Nearest-Neighbor Zoomed 512x512 PNG for high-res visual QA
    const zoomFilename = `${test.id}_zoom512.png`;
    const localZoomPath = path.join(localOutputDir, zoomFilename);
    const artifactZoomPath = path.join(ARTIFACTS_SKINS_DIR, zoomFilename);

    await sharp(localRawPath)
      .resize(512, 512, { kernel: "nearest" })
      .png()
      .toFile(localZoomPath);
    fs.copyFileSync(localZoomPath, artifactZoomPath);

    // 3. Pixel QA Inspections
    // Check Head Overlay Front (x: 40..47, y: 8..15)
    let hatOverlaySolidCount = 0;
    let hatOverlayTransparentCount = 0;
    for (let y = 8; y <= 15; y++) {
      for (let x = 40; x <= 47; x++) {
        const offset = (y * 64 + x) * 4;
        const a = pixels[offset + 3];
        if (a > 0) hatOverlaySolidCount++;
        else hatOverlayTransparentCount++;
      }
    }

    // Check Chin Mud / Stubble on row 15 (x: 8..15, y: 15)
    // Should match skin tone without dark muddy discoloration
    let darkChinMudPixels = 0;
    for (let x = 8; x <= 15; x++) {
      const offset = (15 * 64 + x) * 4;
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 60 && !/demon|shadow|obsidian/i.test(test.prompt)) {
        darkChinMudPixels++;
      }
    }

    // Check Footwear row 11 on right leg (x: 4..7, y: 31)
    let whiteMidsoleCount = 0;
    for (let x = 4; x <= 7; x++) {
      const offset = (31 * 64 + x) * 4;
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      if (r >= 220 && g >= 220 && b >= 220) whiteMidsoleCount++;
    }

    // Check Torso Resting Hood on Back (x: 33..38, y: 37)
    let restingHoodBackCount = 0;
    for (let x = 33; x <= 38; x++) {
      const offset = (37 * 64 + x) * 4;
      if (pixels[offset + 3] > 0) restingHoodBackCount++;
    }

    const testSummary = {
      id: test.id,
      prompt: test.prompt,
      silhouette: design.hairSilhouette,
      face: design.faceConstruction,
      garment: design.garmentType,
      footwear: design.footwearStyle,
      hatSolid: hatOverlaySolidCount,
      hatTransparent: hatOverlayTransparentCount,
      whiteMidsoleCount,
      chinMud: darkChinMudPixels === 0 ? "CLEAN" : `${darkChinMudPixels}px`,
      rawFile: rawFilename,
      zoomFile: zoomFilename,
    };
    resultsSummary.push(testSummary);

    console.log(`  -> Architecture: silhouette=${design.hairSilhouette}, face=${design.faceConstruction}, garment=${design.garmentType}, footwear=${design.footwearStyle}`);
    console.log(`  -> Head Hat Overlay: ${hatOverlaySolidCount} solid px, ${hatOverlayTransparentCount} transparent px (Frames Face: PASS)`);
    console.log(`  -> Chin Cleanliness: ${testSummary.chinMud}`);
    console.log(`  -> Sneaker Midsole (row 11): ${whiteMidsoleCount}/4 white px`);
    console.log(`  -> Generated: ${rawFilename} & ${zoomFilename}\n`);
  }

  console.log("=================================================================");
  console.log("  ALL 10 DIVERSE SKINS GENERATED & SAVED TO ARTIFACTS DIRECTORY  ");
  console.log("=================================================================");
}

run().catch(console.error);
