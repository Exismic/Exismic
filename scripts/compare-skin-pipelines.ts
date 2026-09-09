import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkin,
  sanitizeSkinDesign,
  type MinecraftArmModel,
} from "../src/lib/minecraft-skin";
import { compileMinecraftSkinBlueprint } from "../src/lib/minecraft-skin-blueprint";

const ARTIFACTS_DIR = "C:\\Users\\rayan\\.gemini\\antigravity-ide\\brain\\fb4320e3-360a-4b23-8a36-661626629575\\comparison";

const TEST_PROMPTS = [
  {
    id: "01_kpop_sweater",
    title: "1. K-pop boy, cream oversized sweater",
    prompt: "K-pop boy, cream oversized sweater",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "02_aesthetic_purple_hoodie",
    title: "2. Aesthetic boy, purple oversized hoodie, silver curtain bangs",
    prompt: "Aesthetic boy, purple oversized hoodie, silver curtain bangs",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "03_cottagecore_girl",
    title: "3. Cottagecore girl, pastel green overalls, blonde braided hair",
    prompt: "Cottagecore girl, pastel green overalls, blonde braided hair",
    armModel: "slim" as MinecraftArmModel,
  },
  {
    id: "04_cyberpunk_ninja",
    title: "4. Cyberpunk ninja, black techwear, cyan accents",
    prompt: "Cyberpunk ninja, black techwear, cyan accents",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "05_paladin_knight",
    title: "5. Paladin knight, steel plate armor",
    prompt: "Paladin knight, steel plate armor",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "06_demon_oni",
    title: "6. Demon oni warrior, dark flame armor",
    prompt: "Demon oni warrior, dark flame armor",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "07_minimal_casual",
    title: "7. Minimal casual character",
    prompt: "Minimal casual character",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "08_streetwear_headphones",
    title: "8. Streetwear character with headphones and glasses",
    prompt: "Streetwear character with headphones and glasses",
    armModel: "slim" as MinecraftArmModel,
  },
  {
    id: "09_black_hoodie_white_hair",
    title: "9. Black oversized hoodie + white hair",
    prompt: "black oversized hoodie and white hair",
    armModel: "classic" as MinecraftArmModel,
  },
  {
    id: "10_red_bomber_silver_hair",
    title: "10. Red bomber jacket + silver hair",
    prompt: "red bomber jacket and silver hair",
    armModel: "classic" as MinecraftArmModel,
  },
];

async function run() {
  const localOutputDir = path.join(process.cwd(), "test-output-comparison");
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  console.log("=========================================================================");
  console.log("  PIPELINE COMPARISON: CURRENT PROCEDURAL vs ARTIST BLUEPRINT (v1.7)     ");
  console.log("=========================================================================\n");

  for (const test of TEST_PROMPTS) {
    console.log(`Evaluating: ${test.title}`);
    const seed = 42;
    const design = sanitizeSkinDesign({}, test.prompt, seed);

    // 1. Generate via Current Procedural Renderer
    const currentPixels = compileMinecraftSkin(design, seed, test.armModel, "balanced", test.prompt);

    // 2. Generate via Experimental Artist Blueprint Renderer
    const blueprintPixels = compileMinecraftSkinBlueprint(design, seed, test.armModel, "balanced", test.prompt);

    // Save Raw 64x64 PNGs
    const currentRawPath = path.join(ARTIFACTS_DIR, `${test.id}_current_raw64.png`);
    const blueprintRawPath = path.join(ARTIFACTS_DIR, `${test.id}_blueprint_raw64.png`);

    await sharp(Buffer.from(currentPixels), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(currentRawPath);
    await sharp(Buffer.from(blueprintPixels), { raw: { width: 64, height: 64, channels: 4 } }).png().toFile(blueprintRawPath);

    // Generate 8x Nearest-Neighbor Zoomed Textures (512x512)
    const currentZoomBuffer = await sharp(Buffer.from(currentPixels), { raw: { width: 64, height: 64, channels: 4 } })
      .resize(512, 512, { kernel: "nearest" })
      .png()
      .toBuffer();

    const blueprintZoomBuffer = await sharp(Buffer.from(blueprintPixels), { raw: { width: 64, height: 64, channels: 4 } })
      .resize(512, 512, { kernel: "nearest" })
      .png()
      .toBuffer();

    // Composite Side-by-Side Comparison Plate: 1040x512 (512 + 16 gap + 512)
    const compositePlate = await sharp({
      create: {
        width: 1040,
        height: 512,
        channels: 4,
        background: { r: 15, g: 15, b: 20, alpha: 1 },
      },
    })
      .composite([
        { input: currentZoomBuffer, top: 0, left: 0 },
        { input: blueprintZoomBuffer, top: 0, left: 528 },
      ])
      .png()
      .toBuffer();

    const sideBySidePath = path.join(ARTIFACTS_DIR, `${test.id}_side_by_side.png`);
    const localSideBySidePath = path.join(localOutputDir, `${test.id}_side_by_side.png`);

    fs.writeFileSync(sideBySidePath, compositePlate);
    fs.writeFileSync(localSideBySidePath, compositePlate);

    console.log(`  -> Side-by-Side Plate: ${test.id}_side_by_side.png [Left: Current | Right: Blueprint]`);
  }

  console.log("\n=========================================================================");
  console.log("  ALL 10 COMPARISONS COMPLETE & PLATES SAVED TO ARTIFACTS DIRECTORY       ");
  console.log("=========================================================================");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
