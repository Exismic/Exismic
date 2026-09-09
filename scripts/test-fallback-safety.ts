import { createFallbackSkinDesign } from "../src/lib/minecraft-skin";

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

function runFallbackTest() {
  console.log("=== TESTING FALLBACK SAFETY ===");
  const design = createFallbackSkinDesign(EXACT_PROMPT);

  console.log("facialHair:", design.facialHair, "-> Expected: none. Safe?", design.facialHair === "none");
  console.log("hairStyle:", design.hairStyle, "-> Expected: short (NOT helmet). Safe?", design.hairStyle !== "helmet");
  console.log("emblem:", design.emblem, "-> Expected: not 'NOT'. Safe?", design.emblem !== "NOT");
  console.log("glasses:", design.glasses, "-> Expected: false. Safe?", design.glasses === false);
  console.log("crown:", design.crown, "-> Expected: false. Safe?", design.crown === false);

  if (
    design.facialHair === "none" &&
    design.hairStyle !== "helmet" &&
    design.emblem !== "NOT" &&
    design.glasses === false &&
    design.crown === false
  ) {
    console.log("\nALL FALLBACK NEGATION CHECKS PASSED!");
  } else {
    console.error("\nSOME FALLBACK CHECKS FAILED!");
    process.exit(1);
  }
}

runFallbackTest();
