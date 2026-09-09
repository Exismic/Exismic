import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  compileMinecraftSkin,
  sanitizeSkinDesign,
  type MinecraftArmModel,
} from "../src/lib/minecraft-skin";
import { compileMinecraftSkinBlueprint } from "../src/lib/minecraft-skin-blueprint";

const ARTIFACTS_DIR = "C:\\Users\\rayan\\.gemini\\antigravity-ide\\brain\\fb4320e3-360a-4b23-8a36-661626629575\\comparison-generalization";

export interface BenchmarkTest {
  id: string;
  set: string;
  title: string;
  prompt: string;
  armModel: MinecraftArmModel;
  seed: number;
}

export const GENERALIZATION_TESTS: BenchmarkTest[] = [
  // SET 1: UNSEEN CLOTHING COMBINATIONS (Prompts 1-6)
  {
    id: "gen01_haori_cargo",
    set: "Set 1: Unseen Clothing Combinations",
    title: "1. Haori + Cargo (Wrap outerwear + turtleneck + cargo pockets)",
    prompt: "Oversized olive haori over black turtleneck, black cargo pants, platinum messy hair",
    armModel: "classic",
    seed: 101,
  },
  {
    id: "gen02_cropped_leather",
    set: "Set 1: Unseen Clothing Combinations",
    title: "2. Cropped Leather + Denim (Cropped jacket + inner tee + wide-leg jeans)",
    prompt: "Cropped black leather jacket, white tee, wide-leg denim jeans, silver curtain bangs",
    armModel: "classic",
    seed: 102,
  },
  {
    id: "gen03_pastel_cardigan",
    set: "Set 1: Unseen Clothing Combinations",
    title: "3. Pastel Cardigan + Skirt (Cardigan knit + pleated skirt + loafers)",
    prompt: "Pastel pink knit cardigan over pleated skirt, long blonde hair, loafers",
    armModel: "slim",
    seed: 103,
  },
  {
    id: "gen04_dark_academia",
    set: "Set 1: Unseen Clothing Combinations",
    title: "4. Dark Academia Trench (Double-breasted coat + turtleneck + oxfords)",
    prompt: "Dark academic brown trench coat, charcoal turtleneck, tailored trousers, leather oxfords",
    armModel: "classic",
    seed: 104,
  },
  {
    id: "gen05_white_utility",
    set: "Set 1: Unseen Clothing Combinations",
    title: "5. White Tech Utility (Safety harness + cargo pants + high-top sneakers)",
    prompt: "Futuristic white utility jacket with orange safety straps, gray cargo pants, high-top sneakers",
    armModel: "classic",
    seed: 105,
  },
  {
    id: "gen06_varsity_denim",
    set: "Set 1: Unseen Clothing Combinations",
    title: "6. Varsity Two-Tone (Varsity jacket + leather sleeves + raw indigo denim)",
    prompt: "Cream varsity jacket with red leather sleeves, dark indigo jeans, red skate sneakers",
    armModel: "classic",
    seed: 106,
  },

  // SET 2: UNSEEN CHARACTER CONCEPTS (Prompts 7-14)
  {
    id: "gen07_desert_traveler",
    set: "Set 2: Unseen Character Concepts",
    title: "7. Desert Traveler (Linen cloak + nomad scarf wrap + leather sandals)",
    prompt: "Desert traveler in layered sand linen cloak, wrapped nomad scarf, leather sandals",
    armModel: "classic",
    seed: 107,
  },
  {
    id: "gen08_cyber_detective",
    set: "Set 2: Unseen Character Concepts",
    title: "8. Cyberpunk Detective (Illuminated trench coat + fedora hair + cyber eye)",
    prompt: "Cyberpunk detective in illuminated neon trench coat, dark fedora brim hair, glowing cyber eye",
    armModel: "classic",
    seed: 108,
  },
  {
    id: "gen09_fantasy_ranger",
    set: "Set 2: Unseen Character Concepts",
    title: "9. Fantasy Ranger (Leather jerkin + olive tunic + fingerless gloves + boots)",
    prompt: "Forest ranger in hooded leather jerkin, olive tunic, archer fingerless gloves, woodland boots",
    armModel: "classic",
    seed: 109,
  },
  {
    id: "gen10_gothic_school",
    set: "Set 2: Unseen Character Concepts",
    title: "10. Gothic Schoolboy (Crest blazer + striped necktie + pleated trousers + creepers)",
    prompt: "Gothic schoolboy in black blazer with silver crest, striped necktie, pleated trousers, creepers",
    armModel: "classic",
    seed: 110,
  },
  {
    id: "gen11_future_mechanic",
    set: "Set 2: Unseen Character Concepts",
    title: "11. Spaceship Mechanic (Industrial jumpsuit + tool belt + steel-toed boots)",
    prompt: "Futuristic spaceship mechanic in orange jumpsuit with heavy tool belt and steel-toed boots",
    armModel: "classic",
    seed: 111,
  },
  {
    id: "gen12_winter_explorer",
    set: "Set 2: Unseen Character Concepts",
    title: "12. Arctic Explorer (Puffer down parka + fur-lined hood collar + snow boots)",
    prompt: "Arctic explorer in heavy down parka with fur-lined hood collar, snow goggles, insulated snow boots",
    armModel: "classic",
    seed: 112,
  },
  {
    id: "gen13_royal_mage",
    set: "Set 2: Unseen Character Concepts",
    title: "13. Royal Celestial Mage (Velvet robe + gold trim runes + silver circlet)",
    prompt: "Royal celestial mage in deep indigo velvet robe with gold trim runes, silver crystal circlet",
    armModel: "slim",
    seed: 113,
  },
  {
    id: "gen14_urban_skater",
    set: "Set 2: Unseen Character Concepts",
    title: "14. Layered Urban Skater (Striped long-sleeve under skate tee + ripped jeans)",
    prompt: "Urban skater in baggy striped long-sleeve under black skate tee, ripped jeans, chunky skate shoes",
    armModel: "classic",
    seed: 114,
  },

  // SET 3: UNSEEN MATERIAL & STRUCTURAL COMBINATIONS (Prompts 15-20)
  {
    id: "gen15_leather_knit",
    set: "Set 3: Unseen Material & Structural Combinations",
    title: "15. Leather Bomber over Cable-Knit (Cognac leather over chunky wool knit)",
    prompt: "Cognac brown leather bomber jacket over off-white chunky cable-knit sweater with dark trousers",
    armModel: "classic",
    seed: 115,
  },
  {
    id: "gen16_denim_metal",
    set: "Set 3: Unseen Material & Structural Combinations",
    title: "16. Denim Jacket + Steel Pauldrons (Heavy denim + steel armor plates)",
    prompt: "Armored street vigilante with heavy denim jacket reinforced with steel shoulder pauldrons, combat boots",
    armModel: "classic",
    seed: 116,
  },
  {
    id: "gen17_wool_techwear",
    set: "Set 3: Unseen Material & Structural Combinations",
    title: "17. Wool Peacoat + Chest Rig (Charcoal wool + tactical techwear straps)",
    prompt: "Charcoal wool peacoat equipped with black tactical techwear chest rig and magnetic FIDLOCK buckles",
    armModel: "classic",
    seed: 117,
  },
  {
    id: "gen18_cotton_armor",
    set: "Set 3: Unseen Material & Structural Combinations",
    title: "18. Padded Gambeson + Greaves (Quilted cotton gambeson + steel greaves)",
    prompt: "Medieval foot soldier in padded cotton gambeson with steel greaves and leather gauntlets",
    armModel: "classic",
    seed: 118,
  },
  {
    id: "gen19_oversized_formal",
    set: "Set 3: Unseen Material & Structural Combinations",
    title: "19. Oversized Tuxedo + High-Tops (Formal satin jacket + casual sneakers)",
    prompt: "Aesthetic boy in oversized black formal tuxedo jacket, relaxed satin trousers, white high-tops",
    armModel: "classic",
    seed: 119,
  },
  {
    id: "gen20_casual_gamer",
    set: "Set 3: Unseen Material & Structural Combinations",
    title: "20. Gamer Girl Hoodie + Knee-Highs (Lavender hoodie + cat-ear headphones + socks)",
    prompt: "Casual gamer girl in oversized pastel lavender hoodie with cat-ear headphones, striped knee-high socks",
    armModel: "slim",
    seed: 120,
  },
];

async function run() {
  const localOutputDir = path.join(process.cwd(), "comparison-generalization");
  if (!fs.existsSync(localOutputDir)) {
    fs.mkdirSync(localOutputDir, { recursive: true });
  }
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  console.log("=========================================================================");
  console.log("  GENERALIZATION BENCHMARK: 20 UNSEEN PROMPTS                            ");
  console.log("  CURRENT PROCEDURAL (Untouched) vs ARTIST BLUEPRINT (Parametric Grammar)");
  console.log("=========================================================================\n");

  const results: Array<{
    id: string;
    title: string;
    currentNonZero: number;
    blueprintNonZero: number;
    plateFile: string;
  }> = [];

  for (let i = 0; i < GENERALIZATION_TESTS.length; i++) {
    const test = GENERALIZATION_TESTS[i];
    console.log(`[${i + 1}/20] Evaluating: ${test.title}`);
    console.log(`       Prompt: "${test.prompt}"`);

    const design = sanitizeSkinDesign({}, test.prompt, test.seed);

    // 1. Control Baseline: Current Procedural Renderer (Untouched)
    const currentPixels = compileMinecraftSkin(design, test.seed, test.armModel, "balanced", test.prompt);

    // 2. Candidate: Experimental Parametric Artist Blueprint Renderer
    const blueprintPixels = compileMinecraftSkinBlueprint(design, test.seed, test.armModel, "balanced", test.prompt);

    const currentNonZero = currentPixels.filter((b) => b > 0).length;
    const blueprintNonZero = blueprintPixels.filter((b) => b > 0).length;

    // Save Raw 64x64 PNGs
    const currentRawPath = path.join(ARTIFACTS_DIR, `${test.id}_current_raw64.png`);
    const blueprintRawPath = path.join(ARTIFACTS_DIR, `${test.id}_blueprint_raw64.png`);
    const localCurrentRawPath = path.join(localOutputDir, `${test.id}_current_raw64.png`);
    const localBlueprintRawPath = path.join(localOutputDir, `${test.id}_blueprint_raw64.png`);

    const currentPng = await sharp(Buffer.from(currentPixels), { raw: { width: 64, height: 64, channels: 4 } }).png().toBuffer();
    const blueprintPng = await sharp(Buffer.from(blueprintPixels), { raw: { width: 64, height: 64, channels: 4 } }).png().toBuffer();

    fs.writeFileSync(currentRawPath, currentPng);
    fs.writeFileSync(blueprintRawPath, blueprintPng);
    fs.writeFileSync(localCurrentRawPath, currentPng);
    fs.writeFileSync(localBlueprintRawPath, blueprintPng);

    // Generate 8x Nearest-Neighbor Zoomed Textures (512x512)
    const currentZoom = await sharp(currentPng)
      .resize(512, 512, { kernel: "nearest" })
      .png()
      .toBuffer();

    const blueprintZoom = await sharp(blueprintPng)
      .resize(512, 512, { kernel: "nearest" })
      .png()
      .toBuffer();

    const currentZoomPath = path.join(ARTIFACTS_DIR, `${test.id}_current_zoom512.png`);
    const blueprintZoomPath = path.join(ARTIFACTS_DIR, `${test.id}_blueprint_zoom512.png`);
    fs.writeFileSync(currentZoomPath, currentZoom);
    fs.writeFileSync(blueprintZoomPath, blueprintZoom);

    // Composite Side-by-Side Comparison Plate: 1040x512 (Left: Current, Right: Blueprint)
    const compositePlate = await sharp({
      create: {
        width: 1040,
        height: 512,
        channels: 4,
        background: { r: 18, g: 18, b: 24, alpha: 1 },
      },
    })
      .composite([
        { input: currentZoom, top: 0, left: 0 },
        { input: blueprintZoom, top: 0, left: 528 },
      ])
      .png()
      .toBuffer();

    const sideBySidePath = path.join(ARTIFACTS_DIR, `${test.id}_side_by_side.png`);
    const localSideBySidePath = path.join(localOutputDir, `${test.id}_side_by_side.png`);

    fs.writeFileSync(sideBySidePath, compositePlate);
    fs.writeFileSync(localSideBySidePath, compositePlate);

    results.push({
      id: test.id,
      title: test.title,
      currentNonZero,
      blueprintNonZero,
      plateFile: `${test.id}_side_by_side.png`,
    });

    console.log(`       Done -> ${test.id}_side_by_side.png (Left: Current | Right: Blueprint)`);
  }

  console.log("\n=========================================================================");
  console.log("  ALL 20 GENERALIZATION COMPARISONS GENERATED SUCCESSFULLY!              ");
  console.log("=========================================================================");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
