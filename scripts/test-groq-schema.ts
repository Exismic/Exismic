import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { DEFAULT_GROQ_TEXT_MODEL } from "../src/lib/ai-models";

const EXACT_PROMPT = `Create a high-quality 64x64 Minecraft skin of a stylish young male streetwear character. Make it look hand-crafted by an experienced Minecraft skin artist, NOT procedural.

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

const FULL_MINECRAFT_SCHEMA = {
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
      enum: ["open_front", "center_zip", "pullover", "buttons_single", "buttons_double", "haori_wrap", "armor_fauld"],
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
      enum: ["undershirt", "crew_tee", "graphic_tee", "turtleneck", "striped_undershirt", "v_neck_tee", "tunic", "none"],
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
      enum: ["layered_undershirt", "slouch_gather", "short_sleeve", "rolled_cuff", "wide_haori", "gauntlet_bracer"],
    },
    gloves: {
      type: "boolean",
    },
    outfit: {
      type: "string",
      enum: ["casual", "armor", "royal", "cyber", "fantasy", "formal", "sport"],
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
      enum: ["wide_cargo", "relaxed_jeans", "tailored_trousers", "pleated_skirt", "jumpsuit_cuffed", "shorts_knee_highs"],
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

async function runTest() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log("Model:", DEFAULT_GROQ_TEXT_MODEL);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_GROQ_TEXT_MODEL,
      temperature: 0.15,
      max_tokens: 3000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "minecraft_skin_design",
          strict: true,
          schema: FULL_MINECRAFT_SCHEMA,
        },
      },
      messages: [
        {
          role: "system",
          content: [
            "You are Exismic's professional Minecraft skin director. Deconstruct the user's character prompt into strict structured design tokens.",
            "RULES FOR EXTRACTION:",
            "- Garment layering: If open at front, set placket='open_front'. If a hoodie is worn under an open bomber/jacket, set garmentType='bomber-jacket', midLayer='hoodie', hoodState='down'. If undershirt is visible, set innerGarment='undershirt'.",
            "- Details: Extract zippers ('silver'/'gold'/'none'), cargo pockets (cargoPockets=true), emblems ('crescent', etc.), and footwear style ('chunky-sneaker' or 'high-top-sneaker').",
            "- Asymmetry: If asymmetry between arms, legs, or bangs is mentioned, set asymmetry=true.",
            "- Hair: Curtain bangs -> bangsStyle='curtain', hairSilhouette='curtain-bangs'.",
            "- Negative constraints: Strictly honor negative instructions ('NO beard, stubble' -> facialHair='none'; 'NOT look like a helmet' -> hairStyle='short' or 'long', never helmet; 'NOT procedural' is quality guidance, not an emblem; 'multiple shades' refers to color tones, NOT glasses so glasses=false; 'crown of head' refers to skull anatomy, NOT a royal crown so crown=false). Add explicitly forbidden traits to negativeConstraints.",
            "- Palette: Extract hex codes faithfully for all 10 palette fields.",
          ].join("\n"),
        },
        { role: "user", content: EXACT_PROMPT },
      ],
    }),
  });

  console.log("Status:", res.status);
  const data = await res.json();
  if (res.status !== 200) {
    console.error("Error response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const content = JSON.parse(data.choices[0].message.content);
  console.log("\n=== EXTRACTED MINECRAFT SKIN DESIGN ===");
  console.log(JSON.stringify(content, null, 2));
}

runTest().catch(console.error);
