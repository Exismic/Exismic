import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sanitizeSkinDesign, type MinecraftSkinDesign } from "../src/lib/minecraft-skin";

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
Single light source from upper-left/front. Use large shadow masses, form-following midtone clusters, then small highlights. Add contact shadows beneath hair`;

const PROMPTS = [
  {
    name: "1. Exact Failed Streetwear Character",
    prompt: EXACT_STREETWEAR_PROMPT,
  },
  {
    name: "2. Gothic Knight",
    prompt: "Gothic dark knight in black plate armor with silver trim and crimson velvet tabard, tattered battle-worn cape, steel gauntlets, greaves with sabatons, stern pale face, short swept dark hair. NO helmet, visor open so face is visible.",
  },
  {
    name: "3. Cottagecore Girl",
    prompt: "Aesthetic cottagecore girl with honey-blonde braided hair, soft green overalls over a cream knit sweater, brown leather ankle boots, flower hairpins, soft friendly blush expression. NO glasses, NO headphones.",
  },
  {
    name: "4. Cyberpunk Ninja",
    prompt: "Futuristic cyberpunk shinobi assassin, midnight techwear haori jacket over dark gray mesh tunic, glowing cyan neon energy circuit lines, cybernetic eye optic, sleek high-top ninja boots, dark face mask. NO beard, NO horns.",
  },
  {
    name: "5. Layered Streetwear Character",
    prompt: "Tokyo skater boy wearing an open vintage plaid flannel shirt over a graphic oversized hoodie and white undershirt, baggy faded jeans with asymmetrical knee tears, chunky platform skate shoes, messy textured fringe hair, silver chain necklace. NOT a helmet.",
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

async function callGroqPipeline(prompt: string) {
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
              "- Details: Extract zippers ('silver'/'gold'/'none'), cargo pockets (cargoPockets=true), emblems ('crescent', etc.), and footwear style ('chunky-sneaker' or 'high-top-sneaker').",
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
      const errorBody = await res.text();
      return { success: false, status, error: errorBody, aiDesign: null };
    }

    const data = await res.json();
    const rawContent = data.choices[0]?.message?.content;
    const aiDesign = JSON.parse(rawContent) as Partial<MinecraftSkinDesign>;
    return { success: true, status, error: null, aiDesign };
  }

  return { success: false, status: 429, error: "Rate limit retries exhausted", aiDesign: null };
}

async function main() {
  console.log("================================================================================");
  console.log("SEMANTIC-DESIGN PIPELINE VERIFICATION BENCHMARK");
  console.log("Model: openai/gpt-oss-120b | Mode: Strict Structured Output (JSON Schema)");
  console.log("================================================================================\n");

  const results = [];

  for (let i = 0; i < PROMPTS.length; i++) {
    const item = PROMPTS[i];
    console.log(`\n--- [${i + 1}/${PROMPTS.length}] RUNNING: ${item.name} ---`);
    console.log(`Prompt Preview: "${item.prompt.slice(0, 110)}..." (${item.prompt.length} chars)`);

    const start = Date.now();
    const { success, status, error, aiDesign } = await callGroqPipeline(item.prompt);
    const elapsed = Date.now() - start;

    const aiDirected = Boolean(success && aiDesign);
    const fallbackUsed = !aiDirected;

    const design = sanitizeSkinDesign(
      aiDesign || {},
      item.prompt,
      12345 + i
    );

    console.log(`Status: HTTP ${status} | Success: ${success} | Elapsed: ${elapsed}ms`);
    console.log(`aiDirected: ${aiDirected} | Fallback Used: ${fallbackUsed}`);

    if (error) {
      console.error(`Error details: ${error}`);
    } else {
      console.log("Extracted Design Highlights:");
      console.log(`  - Character: "${design.name}"`);
      console.log(`  - Garment: ${design.garmentType} (placket: ${design.placket}, midLayer: ${design.midLayer}, inner: ${design.innerGarment})`);
      console.log(`  - Hair: ${design.hairStyle} / silhouette: ${design.hairSilhouette} / bangs: ${design.bangsStyle}`);
      console.log(`  - Face/Expression: ${design.faceConstruction} / ${design.expression}`);
      console.log(`  - Facial Hair: ${design.facialHair}`);
      console.log(`  - Lower: ${design.pantsType} (cargoPockets: ${design.cargoPockets}) | Footwear: ${design.footwearStyle}`);
      console.log(`  - Details: zipper=${design.zipper}, drawstrings=${design.drawstrings}, emblem="${design.emblem}", asymmetry=${design.asymmetry}`);
      console.log(`  - Accessories: glasses=${design.glasses}, crown=${design.crown}, headphones=${design.headphones}, cables=${design.cables}, horns=${design.horns}`);
      console.log(`  - Negative Constraints: [${design.negativeConstraints?.join(", ") || "none"}]`);
      console.log(`  - Palette top: ${design.palette.top}, pants: ${design.palette.pants}, hair: ${design.palette.hair}, skin: ${design.palette.skin}`);
    }

    results.push({
      index: i + 1,
      name: item.name,
      status,
      success,
      aiDirected,
      fallbackUsed,
      design,
      elapsed,
    });

    if (i < PROMPTS.length - 1) {
      console.log("Pacing Groq requests (22s delay to refill TPM bucket)...");
      await new Promise((r) => setTimeout(r, 22000));
    }
  }

  console.log("\n================================================================================");
  console.log("FINAL SUMMARY OF SEMANTIC-DESIGN PIPELINE BENCHMARK");
  console.log("================================================================================");
  for (const r of results) {
    console.log(`${r.index}. ${r.name}: Groq HTTP ${r.status} | aiDirected=${r.aiDirected} | fallbackUsed=${r.fallbackUsed} (${r.elapsed}ms)`);
  }

  const allPassed = results.every((r) => r.success && r.aiDirected && !r.fallbackUsed);
  console.log(`\nOVERALL PIPELINE HEALTH: ${allPassed ? "100% HEALTHY (ALL PASSED)" : "FAILURES DETECTED"}`);
}

main().catch(console.error);
