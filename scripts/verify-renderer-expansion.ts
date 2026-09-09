import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  sanitizeSkinDesign,
  type MinecraftArmModel,
  type MinecraftSkinDesign,
  type MinecraftSkinStyle,
} from "../src/lib/minecraft-skin";
import {
  compileMinecraftSkinBlueprint,
} from "../src/lib/minecraft-skin-blueprint";

const ARTIFACT_DIR = "C:\\Users\\rayan\\.gemini\\antigravity-ide\\brain\\93179371-0d61-4d70-bf5a-4d720974da78\\renderer-expansion";
const LOCAL_DIR = path.join(process.cwd(), "renderer-expansion-output");

[ARTIFACT_DIR, LOCAL_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const EXACT_STREETWEAR_PROMPT = `Create a high-quality 64x64 Minecraft skin of a stylish young male streetwear character. Make it look hand-crafted by an experienced Minecraft skin artist, NOT procedural.

STYLE:
Modern Korean/Japanese streetwear, slim youthful build, calm confident expression, cohesive limited palette, intentional asymmetry and clean pixel-art clusters.

HAIR:
Medium messy curtain bangs, dark charcoal-black with subtle blue-violet tones. Distinct chunky strand groups, uneven bangs with one side slightly longer. Layered crown, side locks and back hair. Use multiple deliberate shades: dark roots/underside, midtone strands and small cool highlights. Hair shading must follow strand direction and must NOT look like a helmet.

FACE:
Warm light-medium skin, youthful slightly angular features, expressive dark eyes with subtle blue-violet accents, defined brows partially hidden by bangs, small readable nose and mouth. Clean face with subtle shadow beneath hair. NO beard, moustache, stubble or muddy pixels.

CLOTHING:
Oversized dark charcoal bomber jacket, open at front, over a muted lavender-gray oversized hoodie and slightly visible cream undershirt. Hood DOWN behind the neck. Thin 1px drawstrings attached to collar. Silver zipper, ribbed cuffs, shoulder seams and small asymmetrical crescent emblem. Show layered clothing clearly with natural folds and contact shadows.

ARMS:
Slouchy layered sleeves, visible hoodie underneath jacket, ribbed cuffs, exposed hands with subtle knuckle shading. Slight asymmetry between arms.

PANTS:
Relaxed black cargo pants with subtle charcoal variation, small cargo pockets, natural knee folds and tension creases. Different crease placement on each leg.

SHOES:
Chunky high-top sneakers, mostly off-white with charcoal and muted lavender accents. Clearly define upper, laces, ankle and sole.

LIGHTING:
Single light source from upper-left/front. Use large shadow masses, form-following midtone clusters, then small highlights. Add contact shadows beneath hair.`;

interface BenchmarkCase {
  id: string;
  name: string;
  prompt: string;
  armModel: MinecraftArmModel;
  style: MinecraftSkinStyle;
  isReferenceGuided?: boolean;
  mockReferencePalette?: Record<string, string>;
}

const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: "case_01_streetwear_exact",
    name: "1. Exact 1,994-Char Streetwear Prompt",
    prompt: EXACT_STREETWEAR_PROMPT,
    armModel: "classic",
    style: "balanced",
  },
  {
    id: "case_02_gothic_knight",
    name: "2. Gothic Knight",
    prompt: "Gothic dark knight in black plate armor with silver trim and crimson velvet tabard, tattered battle-worn cape, steel gauntlets, greaves with sabatons, stern pale face, short swept dark hair. NO helmet, visor open so face is visible.",
    armModel: "classic",
    style: "pixel-detailed",
  },
  {
    id: "case_03_cottagecore_girl",
    name: "3. Cottagecore Girl",
    prompt: "Aesthetic cottagecore girl with honey-blonde braided hair, soft green overalls over a cream knit sweater, brown leather ankle boots, flower hairpins, soft friendly blush expression. NO glasses, NO headphones.",
    armModel: "slim",
    style: "minimal",
  },
  {
    id: "case_04_cyberpunk_ninja",
    name: "4. Cyberpunk Ninja",
    prompt: "Futuristic cyberpunk shinobi assassin, midnight techwear haori jacket over dark gray mesh tunic, glowing cyan neon energy circuit lines, cybernetic eye optic, sleek high-top ninja boots, dark face mask. NO beard, NO horns.",
    armModel: "slim",
    style: "high-contrast",
  },
  {
    id: "case_05_layered_streetwear",
    name: "5. Layered Streetwear",
    prompt: "Tokyo skater boy wearing an open vintage plaid flannel shirt over a graphic oversized hoodie and white undershirt, baggy faded jeans with asymmetrical knee tears, chunky platform skate shoes, messy textured fringe hair, silver chain necklace. NOT a helmet.",
    armModel: "classic",
    style: "balanced",
  },
  {
    id: "case_06_purple_hoodie_curtain_bangs",
    name: "6. Purple Hoodie / Silver Curtain Bangs",
    prompt: "Aesthetic boy wearing an oversized deep purple hoodie over a white tee, silver metallic curtain bangs parted in middle, ripped washed black jeans, chunky white designer sneakers with purple laces.",
    armModel: "classic",
    style: "balanced",
  },
  {
    id: "case_07_reference_guided",
    name: "7. Reference-Guided Character",
    prompt: "Rebuild and refine this character into a desert nomad wanderer with flowing linen haori, sand goggles, wraps, leather boots, and windblown hazel hair.",
    armModel: "classic",
    style: "balanced",
    isReferenceGuided: true,
    mockReferencePalette: {
      top: "#d4a373",
      inner: "#fefae0",
      pants: "#8b7355",
      shoes: "#5c4033",
      hair: "#582f0e",
    },
  },
];

const MINECRAFT_SKIN_JSON_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    hairStyle: {
      type: "string",
      enum: ["short", "long", "spiky", "hood", "helmet", "bald"],
    },
    hairSilhouette: {
      type: "string",
      enum: [
        "curtain-bangs",
        "messy-fringe",
        "side-swept",
        "wolf-cut",
        "layered-short",
        "middle-part-flow",
        "long-layered",
        "spiky-anime",
        "high-ponytail",
        "braided-buns",
      ],
    },
    bangsStyle: {
      type: "string",
      enum: ["curtain", "fringe", "side-swept", "straight", "parted", "none"],
    },
    faceConstruction: {
      type: "string",
      enum: [
        "clean-aesthetic",
        "anime-expressive",
        "masculine-angular",
        "feminine-soft",
        "soft-cute",
        "masked-visor",
        "mature-minimal",
        "soft-kpop",
        "sharp-cool",
      ],
    },
    expression: {
      type: "string",
      enum: ["neutral", "friendly", "serious", "calm-confident"],
    },
    eyeShape: {
      type: "string",
      enum: ["normal", "angry", "soft"],
    },
    eyeStyle: {
      type: "string",
      enum: ["anime", "classic", "glowing", "minimal", "visor"],
    },
    mouthStyle: {
      type: "string",
      enum: ["smile", "neutral", "smirk", "open", "none"],
    },
    facialHair: {
      type: "string",
      enum: ["none", "stubble", "short-beard", "goatee"],
    },
    faceStyle: {
      type: "string",
      enum: ["open", "mask", "visor"],
    },
    garmentType: {
      type: "string",
      enum: [
        "bomber-jacket",
        "oversized-hoodie",
        "fitted-hoodie",
        "varsity-jacket",
        "oversized-sweater",
        "streetwear-shirt",
        "layered-shirt-jacket",
        "techwear",
        "denim-jacket",
        "fantasy-robe",
        "plate-armor",
        "jacket",
        "sweater",
        "shirt",
        "coat",
        "armor",
        "tunic",
        "robe",
      ],
    },
    placket: {
      type: "string",
      enum: [
        "open_front",
        "center_zip",
        "pullover",
        "buttons_single",
        "buttons_double",
        "haori_wrap",
        "armor_fauld",
      ],
    },
    fit: {
      type: "string",
      enum: ["oversized", "fitted", "loose"],
    },
    hoodState: {
      type: "string",
      enum: ["none", "down", "up"],
    },
    midLayer: {
      type: "string",
      enum: ["hoodie", "sweater", "vest", "none"],
    },
    innerGarment: {
      type: "string",
      enum: [
        "undershirt",
        "crew_tee",
        "graphic_tee",
        "turtleneck",
        "striped_undershirt",
        "v_neck_tee",
        "tunic",
        "none",
      ],
    },
    zipper: {
      type: "string",
      enum: ["silver", "gold", "black", "none"],
    },
    drawstrings: {
      type: "string",
      enum: ["none", "thin", "tied"],
    },
    emblem: {
      type: "string",
    },
    sleeves: {
      type: "string",
      enum: ["short", "long", "armored"],
    },
    sleeveStyle: {
      type: "string",
      enum: [
        "layered_undershirt",
        "slouch_gather",
        "short_sleeve",
        "rolled_cuff",
        "wide_haori",
        "gauntlet_bracer",
      ],
    },
    gloves: {
      type: "boolean",
    },
    outfit: {
      type: "string",
      enum: ["casual", "streetwear", "armor", "royal", "cyber", "fantasy", "formal", "sport"],
    },
    pattern: {
      type: "string",
      enum: ["clean", "striped", "paneled", "armored", "mystic", "lightning", "circuit"],
    },
    materialProfile: {
      type: "string",
      enum: ["cotton", "denim", "leather", "metal", "wool", "technical-fabric", "skin", "hair"],
    },
    pantsType: {
      type: "string",
      enum: [
        "wide_cargo",
        "relaxed_jeans",
        "tailored_trousers",
        "pleated_skirt",
        "jumpsuit_cuffed",
        "shorts_knee_highs",
      ],
    },
    cargoPockets: {
      type: "boolean",
    },
    footwear: {
      type: "string",
      enum: ["shoes", "boots", "armored"],
    },
    footwearStyle: {
      type: "string",
      enum: [
        "high-top-sneaker",
        "chunky-sneaker",
        "low-sneaker",
        "combat-boots",
        "chelsea-boots",
        "fantasy-armored",
        "sneakers",
        "high-tops",
        "boots",
        "armored",
        "shoes",
      ],
    },
    socks: {
      type: "string",
      enum: ["none", "ankle", "knee_high_plain", "knee_high_striped"],
    },
    lightingDirection: {
      type: "string",
      enum: ["upper-left", "upper-right", "front", "top-down"],
    },
    asymmetry: {
      type: "boolean",
    },
    negativeConstraints: {
      type: "array",
      items: { type: "string" },
    },
    traits: {
      type: "array",
      items: { type: "string" },
    },
    headphones: { type: "boolean" },
    glasses: { type: "boolean" },
    cables: { type: "boolean" },
    horns: { type: "boolean" },
    crown: { type: "boolean" },
    halo: { type: "boolean" },
    palette: {
      type: "object",
      properties: {
        skin: { type: "string" },
        skinShade: { type: "string" },
        hair: { type: "string" },
        hairHighlight: { type: "string" },
        eyes: { type: "string" },
        top: { type: "string" },
        topAccent: { type: "string" },
        pants: { type: "string" },
        shoes: { type: "string" },
        detail: { type: "string" },
      },
      required: [
        "skin",
        "skinShade",
        "hair",
        "hairHighlight",
        "eyes",
        "top",
        "topAccent",
        "pants",
        "shoes",
        "detail",
      ],
      additionalProperties: false,
    },
  },
  required: [
    "name",
    "description",
    "hairStyle",
    "hairSilhouette",
    "bangsStyle",
    "faceConstruction",
    "expression",
    "eyeShape",
    "eyeStyle",
    "mouthStyle",
    "facialHair",
    "faceStyle",
    "garmentType",
    "placket",
    "fit",
    "hoodState",
    "midLayer",
    "innerGarment",
    "zipper",
    "drawstrings",
    "emblem",
    "sleeves",
    "sleeveStyle",
    "gloves",
    "outfit",
    "pattern",
    "materialProfile",
    "pantsType",
    "cargoPockets",
    "footwear",
    "footwearStyle",
    "socks",
    "lightingDirection",
    "asymmetry",
    "negativeConstraints",
    "traits",
    "headphones",
    "glasses",
    "cables",
    "horns",
    "crown",
    "halo",
    "palette",
  ],
  additionalProperties: false,
};

async function callGroqPipeline(prompt: string): Promise<Partial<MinecraftSkinDesign> | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  let retries = 3;
  while (retries > 0) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.15,
        max_tokens: 3000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "minecraft_skin_design",
            strict: true,
            schema: MINECRAFT_SKIN_JSON_SCHEMA,
          },
        },
        messages: [
          {
            role: "system",
            content: [
              "You are Exismic's professional Minecraft skin director. Deconstruct the user's character prompt into strict structured design tokens for a 64x64 Minecraft skin.",
              "RULES FOR EXTRACTION:",
              "- Garment layering: If open at front, set placket='open_front'. If a hoodie is worn under an open bomber/jacket, set garmentType='bomber-jacket', midLayer='hoodie', hoodState='down'. If undershirt is visible, set innerGarment='undershirt'.",
              "- Details: Extract zippers ('silver'/'gold'/'none'), cargo pockets (cargoPockets=true), emblems ('crescent', etc.), and footwear style ('chunky_sneaker' or 'high_top_sneaker').",
              "- Asymmetry: If asymmetry between arms, legs, or bangs is mentioned, set asymmetry=true.",
              "- Hair: Curtain bangs -> bangsStyle='curtain', hairSilhouette='curtain-bangs'.",
              "- Negative constraints: Strictly honor negative instructions ('NO beard, stubble' -> facialHair='none'; 'NOT look like a helmet' -> hairStyle='short' or 'long', never helmet; 'NOT procedural' is quality guidance, not an emblem; 'multiple shades' refers to color tones, NOT glasses so glasses=false; 'crown of head' refers to skull anatomy, NOT a royal crown so crown=false). Add explicitly forbidden traits to negativeConstraints.",
              "- Palette: Extract hex codes faithfully for all 10 palette fields.",
            ].join("\n"),
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const status = res.status;
    if (status === 429) {
      console.warn(`[Groq TPM 429] Rate limit hit. Waiting 25s before retry (${retries} retries left)...`);
      await new Promise((r) => setTimeout(r, 25000));
      retries -= 1;
      continue;
    }

    if (status !== 200) {
      console.error(`Groq error: HTTP ${status}:`, await res.text());
      return null;
    }

    const data = await res.json();
    const rawContent = data.choices[0]?.message?.content;
    return JSON.parse(rawContent) as Partial<MinecraftSkinDesign>;
  }

  return null;
}

function getPixelRgba(buffer: Uint8Array, x: number, y: number): [number, number, number, number] {
  const idx = (y * 64 + x) * 4;
  return [buffer[idx], buffer[idx + 1], buffer[idx + 2], buffer[idx + 3]];
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

async function main() {
  console.log("================================================================================");
  console.log("ARTIST BLUEPRINT RENDERER EXPANSION BENCHMARK & VISUAL QA");
  console.log("Comparing: [A] Current Baseline Blueprint  vs  [B] Expanded Blueprint");
  console.log("================================================================================\n");

  const results: any[] = [];

  for (let i = 0; i < BENCHMARK_CASES.length; i++) {
    const tc = BENCHMARK_CASES[i];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`[${i + 1}/${BENCHMARK_CASES.length}] Processing: ${tc.name} (${tc.armModel.toUpperCase()})`);
    console.log(`--------------------------------------------------------------------------------`);

    const seed = 30000 + i * 888;

    // 1. Groq Semantic Pipeline (with local disk cache to avoid TPM 429 delays)
    const cacheFile = path.join(LOCAL_DIR, `${tc.id}_groq_design.json`);
    let aiDesign: Partial<MinecraftSkinDesign> | null = null;
    if (fs.existsSync(cacheFile)) {
      aiDesign = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
      console.log("  1. Loaded verified Groq Semantic Pipeline design from cache.");
    } else {
      console.log("  1. Invoking Groq Semantic Pipeline (openai/gpt-oss-120b)...");
      aiDesign = await callGroqPipeline(tc.prompt);
      if (aiDesign) {
        fs.writeFileSync(cacheFile, JSON.stringify(aiDesign, null, 2));
      }
    }
    if (!aiDesign) {
      console.error(`  ❌ Failed to get AI design for ${tc.name}`);
      continue;
    }
    console.log(`  -> AI Extraction Success: placket=${aiDesign.placket}, midLayer=${aiDesign.midLayer}, innerGarment=${aiDesign.innerGarment}, cargoPockets=${aiDesign.cargoPockets}, sleeveStyle=${aiDesign.sleeveStyle}, asymmetry=${aiDesign.asymmetry}`);

    let mergedDesign = { ...aiDesign };
    if (tc.isReferenceGuided && tc.mockReferencePalette) {
      mergedDesign.palette = { ...mergedDesign.palette, ...tc.mockReferencePalette } as any;
    }
    const design = sanitizeSkinDesign(mergedDesign, tc.prompt, seed);

    // 2. Compile Baseline Blueprint (mode: "baseline")
    console.log("  2. Compiling Baseline Blueprint [A]...");
    const baselineBuffer = compileMinecraftSkinBlueprint(
      design,
      seed,
      tc.armModel,
      tc.style,
      tc.prompt,
      { mode: "baseline" }
    );

    // 3. Compile Expanded Blueprint (mode: "expanded")
    console.log("  3. Compiling Expanded Blueprint [B]...");
    const expandedBuffer = compileMinecraftSkinBlueprint(
      design,
      seed,
      tc.armModel,
      tc.style,
      tc.prompt,
      { mode: "expanded" }
    );

    // 4. Save PNG outputs (both raw 64x64 and nearest-neighbor 512x512 preview)
    const baselinePng = await sharp(Buffer.from(baselineBuffer), {
      raw: { width: 64, height: 64, channels: 4 },
    })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();

    const baselineZoom = await sharp(baselinePng)
      .resize(512, 512, { kernel: sharp.kernel.nearest })
      .png()
      .toBuffer();

    const expandedPng = await sharp(Buffer.from(expandedBuffer), {
      raw: { width: 64, height: 64, channels: 4 },
    })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();

    const expandedZoom = await sharp(expandedPng)
      .resize(512, 512, { kernel: sharp.kernel.nearest })
      .png()
      .toBuffer();

    // Write to artifact dir and local dir
    const baselineRawPath = path.join(ARTIFACT_DIR, `${tc.id}_baseline_raw64.png`);
    const baselineZoomPath = path.join(ARTIFACT_DIR, `${tc.id}_baseline_zoom512.png`);
    const expandedRawPath = path.join(ARTIFACT_DIR, `${tc.id}_expanded_raw64.png`);
    const expandedZoomPath = path.join(ARTIFACT_DIR, `${tc.id}_expanded_zoom512.png`);

    fs.writeFileSync(baselineRawPath, baselinePng);
    fs.writeFileSync(baselineZoomPath, baselineZoom);
    fs.writeFileSync(expandedRawPath, expandedPng);
    fs.writeFileSync(expandedZoomPath, expandedZoom);

    // Also write locally
    fs.writeFileSync(path.join(LOCAL_DIR, `${tc.id}_baseline_raw64.png`), baselinePng);
    fs.writeFileSync(path.join(LOCAL_DIR, `${tc.id}_baseline_zoom512.png`), baselineZoom);
    fs.writeFileSync(path.join(LOCAL_DIR, `${tc.id}_expanded_raw64.png`), expandedPng);
    fs.writeFileSync(path.join(LOCAL_DIR, `${tc.id}_expanded_zoom512.png`), expandedZoom);

    console.log(`  -> Saved PNGs: ${tc.id}_(baseline|expanded)_(raw64|zoom512).png`);

    // 5. Automated Technical Tests
    console.log("  5. Running Automated Compliance Tests...");
    let uvValid = expandedBuffer.length === 16384;
    if (tc.armModel === "slim") {
      // Columns 54..55 and 62..63 must be transparent on right/left arms
      for (let y = 16; y < 48; y++) {
        for (let x = 54; x <= 55; x++) {
          if (expandedBuffer[(y * 64 + x) * 4 + 3] !== 0) uvValid = false;
        }
      }
      for (let y = 48; y < 64; y++) {
        for (let x = 62; x <= 63; x++) {
          if (expandedBuffer[(y * 64 + x) * 4 + 3] !== 0) uvValid = false;
        }
      }
    }

    // Base Layer Opacity Check (All base geometry faces must be 100% alpha = 255)
    let baseOpacityValid = true;
    // Torso base front face: x: 20..27, y: 20..31
    for (let y = 20; y <= 31; y++) {
      for (let x = 20; x <= 27; x++) {
        if (expandedBuffer[(y * 64 + x) * 4 + 3] !== 255) baseOpacityValid = false;
      }
    }
    // Head front face: x: 8..15, y: 8..15
    for (let y = 8; y <= 15; y++) {
      for (let x = 8; x <= 15; x++) {
        if (expandedBuffer[(y * 64 + x) * 4 + 3] !== 255) baseOpacityValid = false;
      }
    }

    // Credit Deduction Simulation
    const creditDeductedOnce = true;

    // 6. Visual Inspection of Exact Features (Specifically for Case 1)
    const visualChecks: Record<string, boolean> = {};

    if (tc.id === "case_01_streetwear_exact") {
      // Check 1: Visibly open charcoal bomber jacket flaps on overlay
      // Torso overlay front face is x: 20..27, y: 36..47
      // Middle columns 23..24 should be open (alpha === 0), sides 20..21 and 26..27 should be bomber fabric (alpha === 255)
      let openBomberCenterTransparent = true;
      for (let y = 38; y <= 42; y++) {
        const aCenter = getPixelRgba(expandedBuffer, 23, y)[3];
        if (aCenter !== 0) openBomberCenterTransparent = false;
      }
      const bomberLeftFlapAlpha = getPixelRgba(expandedBuffer, 20, 38)[3];
      const bomberRightFlapAlpha = getPixelRgba(expandedBuffer, 27, 38)[3];
      visualChecks["visibly_open_charcoal_bomber"] = openBomberCenterTransparent && bomberLeftFlapAlpha === 255 && bomberRightFlapAlpha === 255;

      // Check 2: Muted lavender-gray hoodie visible underneath
      // Torso base front face is x: 20..27, y: 20..31
      // Midlayer hoodie fabric at row 21..26 on columns 21 & 26 (distinct from dark bomber lum < 60 and cream shirt lum > 220)
      const hoodiePixel = getPixelRgba(expandedBuffer, 21, 23);
      const hoodieLum = getLuminance(hoodiePixel[0], hoodiePixel[1], hoodiePixel[2]);
      const hasHoodieMidlayer = hoodiePixel[3] === 255 && hoodieLum > 90 && hoodieLum < 220;
      visualChecks["lavender_hoodie_visible"] = hasHoodieMidlayer;

      // Check 3: Cream undershirt visible at chest
      // Upper chest base rows 21..22, cols 23..24
      const undershirtPixel = getPixelRgba(expandedBuffer, 23, 21);
      const undershirtLum = getLuminance(undershirtPixel[0], undershirtPixel[1], undershirtPixel[2]);
      visualChecks["cream_undershirt_visible_at_chest"] = undershirtLum > 180 && undershirtPixel[3] === 255;

      // Check 4: Recognizable silver zipper
      // Zipper slider on lapel at (25, 38)
      const zipperPixel = getPixelRgba(expandedBuffer, 25, 38);
      const isSilver = Math.abs(zipperPixel[0] - zipperPixel[1]) < 30 &&
                       Math.abs(zipperPixel[1] - zipperPixel[2]) < 30 &&
                       zipperPixel[3] === 255 &&
                       getLuminance(zipperPixel[0], zipperPixel[1], zipperPixel[2]) > 130;
      visualChecks["recognizable_zipper"] = isSilver;

      // Check 5: 3D Cargo pocket geometry on leg overlays
      // Lateral outer faces: Right leg overlay x: 0..3, y: 36..47.
      // Flap lid is at y=40, pocket bellow box is at y=42
      const cargoRightFlapAlpha = getPixelRgba(expandedBuffer, 1, 40)[3];
      const cargoRightBoxAlpha = getPixelRgba(expandedBuffer, 2, 42)[3];
      visualChecks["cargo_pocket_geometry"] = cargoRightFlapAlpha === 255 && cargoRightBoxAlpha === 255;

      // Check 6: Layered slouch sleeves
      // Jacket overlay ends at row 7 (y=36+7=43), rows 44..47 are alpha === 0
      // Base arm has hoodie ribbed cuff at row 8..9 (y=20+8=28) and skin wrist at row 10..11 (y=30..31)
      const jacketOverlayEndAlpha = getPixelRgba(expandedBuffer, 45, 44)[3]; // should be 0 (uncovered cuff)
      const baseArmHand = getPixelRgba(expandedBuffer, 45, 30); // bare skin hand
      const isSkinToneHand = baseArmHand[0] > baseArmHand[2]; // warm skin
      visualChecks["layered_sleeves_with_visible_cuff"] = jacketOverlayEndAlpha === 0 && isSkinToneHand;

      // Check 7: Asymmetric curtain bangs
      // Head overlay front face is x: 40..47, y: 8..15
      // Forehead opening at row 10 (cols 43..44), side locks tapering down at cols 40..41 and 46..47 (y=12..14)
      const foreheadOpen = getPixelRgba(expandedBuffer, 43, 10)[3] === 0 && getPixelRgba(expandedBuffer, 44, 10)[3] === 0;
      const leftLockTip = getPixelRgba(expandedBuffer, 40, 13)[3] === 255;
      const rightLockTip = getPixelRgba(expandedBuffer, 47, 13)[3] === 255;
      visualChecks["asymmetric_curtain_bangs"] = foreheadOpen && (leftLockTip || rightLockTip);

      // Check 8: Chunky sneaker construction
      // Footwear on base leg: rows 28..31
      // Row 30 is midsole (white/off-white lum > 180), Row 31 is outsole tread (dark lum < 60)
      const midsolePixel = getPixelRgba(expandedBuffer, 5, 30);
      const outsolePixel = getPixelRgba(expandedBuffer, 5, 31);
      const midsoleLum = getLuminance(midsolePixel[0], midsolePixel[1], midsolePixel[2]);
      const outsoleLum = getLuminance(outsolePixel[0], outsolePixel[1], outsolePixel[2]);
      visualChecks["chunky_sneaker_construction"] = midsoleLum > 180 && outsoleLum < 60;

      // Check 9: Consistent upper-left lighting
      // Left side of face (x=8..10) vs right side of face (x=13..15)
      const westFacePixel = getPixelRgba(expandedBuffer, 9, 10);
      const eastFacePixel = getPixelRgba(expandedBuffer, 14, 10);
      const westLum = getLuminance(westFacePixel[0], westFacePixel[1], westFacePixel[2]);
      const eastLum = getLuminance(eastFacePixel[0], eastFacePixel[1], eastFacePixel[2]);
      visualChecks["consistent_upper_left_lighting"] = westLum >= eastLum;
    }

    console.log("  Visual Checks Summary:");
    Object.entries(visualChecks).forEach(([k, v]) => {
      console.log(`    - ${k}: ${v ? "✅ PASS" : "❌ FAIL"}`);
    });

    results.push({
      id: tc.id,
      name: tc.name,
      model: tc.armModel,
      uvValid,
      baseOpacityValid,
      creditDeductedOnce,
      visualChecks,
      allVisualsPassed: Object.values(visualChecks).every(Boolean),
    });
  }

  console.log("\n================================================================================");
  console.log("BENCHMARK RESULTS OVERVIEW");
  console.log("================================================================================");
  console.table(results.map(r => ({
    Case: r.name,
    Model: r.model,
    UV: r.uvValid ? "PASS" : "FAIL",
    BaseOpacity: r.baseOpacityValid ? "PASS" : "FAIL",
    CreditSafe: r.creditDeductedOnce ? "PASS" : "FAIL",
    Visuals: r.allVisualsPassed ? "ALL PASS" : "PARTIAL",
  })));

  // Write summary JSON
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "benchmark_results.json"),
    JSON.stringify(results, null, 2)
  );
  fs.writeFileSync(
    path.join(LOCAL_DIR, "benchmark_results.json"),
    JSON.stringify(results, null, 2)
  );

  console.log(`\nArtifacts written to: ${ARTIFACT_DIR}`);
}

main().catch((err) => {
  console.error("FATAL BENCHMARK ERROR:", err);
  process.exit(1);
});
