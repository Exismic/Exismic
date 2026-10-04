// Offline renderer checks. No server, account, external API, or credits required.
// Pass an optional output directory to save original 64x64 PNGs for inspection.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const sharp = require("sharp");
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { sanitizeSkinDesign, createFallbackSkinDesign, compileMinecraftSkin, mergeMinecraftSkinPart, mergeMinecraftFaceStyleChange } = require("../src/lib/minecraft-skin.ts");
const { compileMinecraftSkinBlueprint, getBlueprintArmFaces, analyzeGarmentGrammar, BlueprintCanvas, applyDirectionalLighting } = require("../src/lib/minecraft-skin-blueprint.ts");
const { MINECRAFT_SKIN_JSON_SCHEMA } = require("../src/lib/minecraft-skin-control.ts");
const palette = { skin: "#edc6b0", skinShade: "#bc8f7b", hair: "#352823", hairHighlight: "#674e3d", eyes: "#57a5cc", top: "#343941", topAccent: "#36aea7", pants: "#adb0b5", shoes: "#e9e8e2", detail: "#ced8df" };
const fixtures = [
  ["streetwear", "Messy layered dark brown hair, charcoal hoodie with teal lining and drawstrings, gray cargo pants and white sneakers", { hairSilhouette: "messy-fringe", garmentType: "oversized-hoodie", hoodState: "down", midLayer: "none", drawstrings: "thin", cargoPockets: true, footwearStyle: "chunky-sneaker" }],
  ["layered", "Open charcoal bomber jacket over a lavender hoodie and cream undershirt, black trousers", { garmentType: "bomber-jacket", placket: "open_front", midLayer: "hoodie", innerGarment: "undershirt", zipper: "silver", palette: { ...palette, topAccent: "#ad98c5" } }],
  ["knight", "Steel plate armor with pauldrons, gauntlets and armored boots", { garmentType: "plate-armor", placket: "armor_fauld", sleeves: "armored", gloves: true, footwearStyle: "fantasy-armored", palette: { ...palette, top: "#9babb7" } }],
  ["summer", "Short sleeve green shirt, shorts, plain knee high socks and sandals", { sleeves: "short", sleeveStyle: "short_sleeve", pantsType: "shorts_knee_highs", socks: "knee_high_plain", palette: { ...palette, top: "#708c68" } }],
  ["dark-skin", "Dark skinned character with a cream wool sweater and denim jeans", { hairSilhouette: "curtain-bangs", garmentType: "oversized-sweater", palette: { ...palette, skin: "#67412f", top: "#ded1bb", pants: "#45576f" } }],
  ["light-hair", "Long silver hair, pale blue jacket, white shoes", { hairSilhouette: "long-layered", hairLength: "long", placket: "open_front", innerGarment: "crew_tee", palette: { ...palette, hair: "#cdd1df", hairHighlight: "#eef0f5", top: "#abc5d7" } }],
  ["cyber", "Techwear ninja with a blue glowing visor and black clothes", { faceConstruction: "masked-visor", eyeStyle: "visor", garmentType: "techwear", palette: { ...palette, top: "#151b25", hair: "#10151e" } }],
  ["no-cords", "Blue hoodie without drawstrings and dark pants", { garmentType: "oversized-hoodie", drawstrings: "none", palette: { ...palette, top: "#536f9f" } }],
  ["duck", "Teal duck with a golden bill wearing an open charcoal suit, cream undershirt and gold tie", { characterType: "duck", outfit: "formal", garmentType: "jacket", placket: "open_front", innerGarment: "undershirt", palette: { ...palette, skin: "#287c73", skinShade: "#1e5b56", top: "#252b33", topAccent: "#eab34f", pants: "#303641" } }],
  ["tv", "TV-head character with silver casing, a blue screen, open charcoal suit and purple tie", { characterType: "tv", outfit: "formal", garmentType: "jacket", placket: "open_front", innerGarment: "undershirt", palette: { ...palette, hair: "#a3abb7", hairHighlight: "#d0d6df", eyes: "#538acd", top: "#282b34", topAccent: "#a786c0", pants: "#343744" } }],
  ["monster", "Black creature with wide white eyes, pink mouth and black clothes", { characterType: "creature", palette: { ...palette, skin: "#22212c", skinShade: "#15151d", eyes: "#f1efe6", detail: "#d59fae", top: "#24232e", pants: "#292834" } }],
  ["robot", "Silver robot with turquoise lights and blue workwear", { characterType: "robot", palette: { ...palette, skin: "#9caeb8", skinShade: "#778d9a", eyes: "#50d5d0", detail: "#57687b", top: "#364657", topAccent: "#64bcc4" } }],
  ["plaid", "Red hair, open brown plaid flannel jacket, cream undershirt and ripped blue jeans", { hairSilhouette: "messy-fringe", topPattern: "plaid", pantsDetail: "ripped", garmentType: "jacket", placket: "open_front", innerGarment: "undershirt", pantsType: "relaxed_jeans", palette: { ...palette, hair: "#8a3338", hairHighlight: "#b25750", top: "#745143", topAccent: "#b18b6d", pants: "#627a95" } }],
  ["ripped", "Silver-haired streetwear character with a black sweater, torn pale jeans and white sneakers", { hairSilhouette: "curtain-bangs", hairLength: "medium", garmentType: "oversized-sweater", pantsType: "relaxed_jeans", pantsDetail: "ripped", palette: { ...palette, hair: "#c4c6d0", hairHighlight: "#e7e9ec", top: "#272934", pants: "#c3c8d0" } }],
  ["graphic", "Black-haired character with a black hoodie with a white skull graphic, gray jeans and white sneakers", { graphic: "skull", garmentType: "oversized-hoodie", drawstrings: "none", palette: { ...palette, hair: "#23252d", top: "#272934", pants: "#808894", detail: "#e1e2dd" } }],
  ["gradient", "Abstract pastel gradient character cyan lavender pink yellow and sage, tiny glints", { characterType: "abstract", colorTreatment: "gradient", palette: { ...palette, hair: "#7dc9d1", topAccent: "#b5a0d5", top: "#dda8bc", pants: "#dbcc8c", shoes: "#a3c5a1" } }],
];
const pixel = (pixels, x, y) => Array.from(pixels.slice((y * 64 + x) * 4, (y * 64 + x) * 4 + 4));
function cube(x, y, w, h, d) {
  return [
    { x: x + d, y, width: w, height: d }, { x: x + d + w, y, width: w, height: d },
    { x, y: y + d, width: d, height: h }, { x: x + d, y: y + d, width: w, height: h },
    { x: x + d + w, y: y + d, width: d, height: h }, { x: x + d * 2 + w, y: y + d, width: w, height: h },
  ];
}
function baseFaces(model) {
  return [...cube(0, 0, 8, 8, 8), ...cube(16, 16, 8, 12, 4), ...cube(0, 16, 4, 12, 4), ...cube(16, 48, 4, 12, 4), ...Object.values(getBlueprintArmFaces(model, "right")), ...Object.values(getBlueprintArmFaces(model, "left"))];
}
function checkTexture(pixels, model) {
  assert.equal(pixels.length, 64 * 64 * 4);
  const used = new Set();
  const mark = (face, base) => {
    for (let row = 0; row < face.height; row++) for (let col = 0; col < face.width; col++) {
      const index = (face.y + row) * 64 + face.x + col;
      used.add(index);
      if (base) assert.equal(pixels[index * 4 + 3], 255, `Missing base pixel ${face.x + col},${face.y + row} (${model})`);
    }
  };
  baseFaces(model).forEach((face) => mark(face, true));
  [...cube(32, 0, 8, 8, 8), ...cube(16, 32, 8, 12, 4), ...cube(0, 32, 4, 12, 4), ...cube(0, 48, 4, 12, 4), ...Object.values(getBlueprintArmFaces(model, "right", true)), ...Object.values(getBlueprintArmFaces(model, "left", true))].forEach((face) => mark(face, false));
  for (let index = 0; index < 4096; index++) {
    assert.ok(pixels[index * 4 + 3] === 0 || pixels[index * 4 + 3] === 255, "Non-binary skin alpha");
    if (!used.has(index)) assert.equal(pixels[index * 4 + 3], 0, `Paint leaked into unused texture space at ${index % 64},${Math.floor(index / 64)}`);
  }
}
async function main() {
  const { SKIN_ART_REGIONS, inferSkinArt, sanitizeSkinPixelArt } = require("../src/lib/minecraft-skin-art-types.ts");
  const { skinArtFaces, applySkinPixelArt, skinArtColors, paintAdvancedMinecraftSkin } = require("../src/lib/minecraft-skin-art.ts");
  const { mergeRemixDesign, minecraftRemixParts } = require("../src/lib/minecraft-skin-control.ts");
  assert.deepEqual(minecraftRemixParts("Make only the jacket navy blue. Preserve hair, face, trousers and shoes."), ["torso", "arms"]);
  assert.deepEqual(minecraftRemixParts("Keep my face and jeans but change the jacket to green"), ["torso", "arms"]);
  assert.deepEqual(minecraftRemixParts("Keep everything unchanged"), []);
  const independent = sanitizeSkinDesign({ characterType: "duck", outfit: "formal", garmentType: "jacket", placket: "open_front", innerGarment: "undershirt", pixelArt: [] }, "Teal duck with a golden bill, emerald tie and cream undershirt", 42);
  assert.equal(independent.palette.skin, "#287c73", "Teal duck color was lost");
  assert.deepEqual(independent.featureColors, { bill: "#eab308", tie: "#15805d", inner: "#faf5ef" });
  const independentPixels = compileMinecraftSkinBlueprint(independent, 42, "classic", "balanced", independent.description);
  assert.deepEqual(pixel(independentPixels, 10, 13).slice(0, 3), [234, 179, 8], "Duck bill inherited tie color");
  assert.deepEqual(pixel(independentPixels, 23, 37).slice(0, 3), [21, 128, 93], "Tie inherited duck bill color");
  const accented = { ...independent, pixelArt: [{ region: "torso-front", layer: "outer", rows: ["........", "...A....", ...Array(10).fill("........")] }] };
  const accentedPixels = compileMinecraftSkinBlueprint(accented, 42, "classic", "balanced", independent.description);
  assert.deepEqual(pixel(accentedPixels, 23, 37).slice(0, 3), [21, 128, 93], "Sparse AI accent overwrote requested tie color");
  assert.deepEqual(sanitizeSkinDesign({ featureColors: { bill: "invalid", tie: "#15805d" } }, "character", 42).featureColors, { tie: "#15805d" });
  assert.deepEqual(sanitizeSkinDesign({ artColors: { U: "#800020", V: "unsafe", O: "#C0C0C0" } }, "character", 42).artColors, { U: "#800020", O: "#c0c0c0" });
  assert.deepEqual(skinArtColors(sanitizeSkinDesign({ artColors: { U: "#800020" } }, "character", 42)).U, [128, 0, 32]);
  assert.notDeepEqual(skinArtColors(sanitizeSkinDesign({ artColors: { U: "#800020" } }, "character", 42)).u, [128, 0, 32]);
  assert.equal(sanitizeSkinDesign({}, "Teal duck with emerald green tie", 42).featureColors.tie, "#15805d", "Generic green hijacked compound emerald green");
  for (const sentinel of ["none", "null", "n/a", "no emblem", "undefined", "crescent"]) {
    const absent = sanitizeSkinDesign({ emblem: sentinel, traits: ["NON emblem", "Duck"] }, "duck character", 42);
    assert.equal(absent.emblem, "", "Absent/motif emblem became truncated lettering");
    assert.deepEqual(absent.traits, ["Duck"]);
  }
  assert.equal(sanitizeSkinDesign({ emblem: "EX" }, "No lettering or emblem on the jacket", 42).emblem, "");
  assert.equal(sanitizeSkinDesign({ emblem: "NON" }, 'Logo reads "NON"', 42).emblem, "NON", "Valid explicitly requested lettering was lost");
  assert.equal(createFallbackSkinDesign("jacket emblem none", 42).emblem, "");
  assert.deepEqual(Object.keys(MINECRAFT_SKIN_JSON_SCHEMA.properties).sort(), [...MINECRAFT_SKIN_JSON_SCHEMA.required].sort(), "Strict AI schema omitted required properties");
  const drawing = { region: "torso-front", layer: "outer", rows: ["........", "........", "...XX...", "..XxxX..", ".XX..XX.", "..XxxX..", "...XX...", "........", "........", "........", "........", "........"] };
  assert.deepEqual(sanitizeSkinPixelArt([drawing, drawing]), [drawing], "Duplicate art faces survived");
  const flat = { ...drawing, rows: Array(12).fill("TTTTTTTT") };
  assert.deepEqual(sanitizeSkinPixelArt([flat]), [], "Flat AI fill would erase cloth folds");
  const recoverable = { ...flat, rows: ["TTTTTTTT", "TTttTTTT", "TTTTTTTT", "TTSSSSTT", "TTSSSSTT", "TTTTTTTT", "TTXXTTTT", "TTXXTTTT", "TTTTTTTT", "TTTTTTTT", "........", "........"] };
  const recovered = sanitizeSkinPixelArt([recoverable]);
  assert.equal(recovered.length, 1, "Useful folds/markings discarded with their background");
  assert.equal(recovered[0].rows[6], "..XX....");
  assert.deepEqual(sanitizeSkinPixelArt(recovered), recovered, "Drawing cleanup not stable across saves/renders");
  const blackSlab = { ...flat, mode: "replace", rows: Array(12).fill("NNNNNNNN") };
  assert.deepEqual(sanitizeSkinPixelArt([blackSlab]), [], "Charcoal fill bypassed cloth safety");
  assert.deepEqual(sanitizeSkinPixelArt([{ ...blackSlab, rows: Array(12).fill("OOOOOOOO") }]), [], "Extra accent color bypassed cloth safety");
  const hairSlab = { region: "head-front", layer: "outer", mode: "replace", rows: Array(8).fill("HHHHHHHH") };
  assert.deepEqual(sanitizeSkinPixelArt([hairSlab], "human"), [], "Flat custom hair erased shaded locks");
  assert.deepEqual(sanitizeSkinPixelArt([{ ...hairSlab, rows: ["........", "........", "..HHHH..", ".HHHHHH.", ".HHHHHH.", "..HHHH..", "........", "........"] }], "human"), [], "Sparse flat hair replaced the whole shaded silhouette");
  assert.deepEqual(sanitizeSkinPixelArt([{ ...hairSlab, layer: "base", rows: ["........", "........", "..EE....", "........", "........", "........", "........", "........"] }], "human"), [], "Misplaced extra human eye accepted");
  const authoredHair = { ...hairSlab, rows: [".DHhhHD.", "DHhLLHHD", ".HH..HH.", "........", "........", "........", "........", "........"] };
  assert.deepEqual(sanitizeSkinPixelArt([authoredHair], "human"), [authoredHair]);
  const faceSchema = MINECRAFT_SKIN_JSON_SCHEMA.properties.pixelArt.items;
  assert.deepEqual(Object.keys(faceSchema.properties).sort(), [...faceSchema.required].sort());
  assert.deepEqual(sanitizeSkinPixelArt([{ region: "head-front", layer: "outer", rows: Array(8).fill("HHHEEEHH") }], "human"), [], "AI eyes were accepted on outer human hair layer");
  assert.deepEqual(sanitizeSkinPixelArt([{ region: "head-front", layer: "base", rows: ["KKKKKKKK", "KKKKKKKK", "KKEEKKKK", "KKEEKKKK", "KKKKKKKK", "KAAAAAAK", "KAAAAAAK", "KKKKKKKK"] }], "duck"), [], "Single misplaced duck eye survived");
  assert.equal(inferSkinArt("Human boy in a pastel gradient hoodie").characterType, "human", "Gradient clothes turned a human into an abstract head");
  for (const invalid of [{ ...drawing, region: "torso-outside" }, { ...drawing, layer: "evil" }, { ...drawing, rows: ["XX"] }, { ...drawing, rows: drawing.rows.map(() => "!!!!!!!!") }, { ...drawing, rows: drawing.rows.map(() => " XXXXXX ") }]) {
    assert.deepEqual(sanitizeSkinPixelArt([invalid]), [], "Unsafe or malformed drawing survived");
  }
  assert.equal(inferSkinArt("Human without duck, no robot, no plaid and no gradient").characterType, "human");
  assert.equal(inferSkinArt("Human without duck, no robot, no plaid and no gradient").colorTreatment, "solid");
  const parent = sanitizeSkinDesign({ pixelArt: [drawing] }, "brown hoodie", 42);
  const artParent = { ...parent, artColors: { U: "#800020", V: "#eab308" } };
  assert.deepEqual(mergeRemixDesign(artParent, { artColors: { U: "#0000ff", V: "#ffffff" } }, "make hoodie blue").artColors, artParent.artColors, "Jacket recolor drifted unrelated embroidery colors");
  assert.equal(mergeRemixDesign(artParent, { artColors: { U: "#0000ff", V: "#eab308" } }, "make embroidery blue").artColors.U, "#0000ff", "Independent accent could not be recolored");
  assert.equal(mergeRemixDesign(artParent, { artColors: artParent.artColors }, "change burgundy sleeve panels to navy blue").artColors.U, "#172554", "Explicit source-to-target detail recolor ignored");
  const grayAccentParent = { ...artParent, artColors: { ...artParent.artColors, Z: "#555555" } };
  const correctedAccent = mergeRemixDesign(grayAccentParent, { artColors: grayAccentParent.artColors }, "change burgundy sleeve panels to navy blue");
  assert.equal(correctedAccent.artColors.U, "#172554", "Neutral gray confused burgundy color matching");
  assert.equal(correctedAccent.artColors.Z, "#555555", "Detail recolor affected neutral seams");
  assert.deepEqual(mergeRemixDesign(parent, { pixelArt: [], palette: { top: "#f02a33" } }, "make hoodie red").pixelArt, [drawing], "Color remix erased artwork");
  assert.deepEqual(mergeRemixDesign(parent, { pixelArt: [] }, "remove the graphic from my hoodie").pixelArt, [], "Graphic removal kept artwork");
  assert.deepEqual(mergeRemixDesign(parent, { pixelArt: [] }, "make my hair longer").pixelArt, [drawing], "Hair remix erased torso artwork");
  const newDrawing = { ...drawing, rows: [...drawing.rows] };
  newDrawing.rows[2] = "..XXXX..";
  assert.deepEqual(mergeRemixDesign(parent, { pixelArt: [newDrawing] }, "add a custom logo").pixelArt, [newDrawing], "Logo remix did not update torso artwork");
  for (const model of ["classic", "slim"]) {
    const hairDesign = sanitizeSkinDesign({ pixelArt: [authoredHair] }, "silver wolf cut hair", 42);
    const replaceCanvas = compileMinecraftSkinBlueprint({ ...hairDesign, pixelArt: [] }, 42, model, "balanced", "silver wolf cut hair");
    const baseHead = Array.from(replaceCanvas.slice((8 * 64 + 8) * 4, (8 * 64 + 16) * 4));
    applySkinPixelArt(replaceCanvas, hairDesign, model);
    assert.equal(pixel(replaceCanvas, 40, 8)[3], 0, "Authored gap retained the old hair wall");
    assert.deepEqual(Array.from(replaceCanvas.slice((8 * 64 + 8) * 4, (8 * 64 + 16) * 4)), baseHead, "Outer hair replacement erased required head pixels");
    const accessoryCanvas = new Uint8Array(64 * 64 * 4);
    accessoryCanvas.set([12, 34, 56, 255], (8 * 64 + 40) * 4);
    applySkinPixelArt(accessoryCanvas, { ...hairDesign, headphones: true }, model);
    assert.deepEqual(pixel(accessoryCanvas, 40, 8), [12, 34, 56, 255], "Hair replacement erased headphones");
    // Custom cloth shading retains inner garments and bare skin and uses the
    // existing pattern as its foundation rather than replacing it with top color.
    const cloth = sanitizeSkinDesign({ palette, garmentType: "jacket", placket: "open_front", innerGarment: "undershirt" }, "jacket", 42);
    const clothCanvas = new Uint8Array(64 * 64 * 4);
    clothCanvas.set([250, 245, 239, 255], (22 * 64 + 23) * 4);
    clothCanvas.set([52, 57, 65, 255], (22 * 64 + 20) * 4);
    const foldArt = { region: "torso-front", layer: "base", mode: "accent", rows: Array.from({ length: 12 }, (_, y) => y === 2 ? "S..S...." : "........") };
    applySkinPixelArt(clothCanvas, { ...cloth, pixelArt: [foldArt] }, model);
    assert.deepEqual(pixel(clothCanvas, 23, 22), [250, 245, 239, 255], "Jacket folds painted over inner shirt");
    assert.notDeepEqual(pixel(clothCanvas, 20, 22), [52, 57, 65, 255], "Connected cloth fold was lost");
    for (const silhouette of MINECRAFT_SKIN_JSON_SCHEMA.properties.hairSilhouette.enum) for (const eyeStyle of ["classic", "anime", "glowing", "minimal", "visor"]) {
      const visible = compileMinecraftSkinBlueprint(sanitizeSkinDesign({ hairSilhouette: silhouette, eyeStyle }, "character", 42), 42, model, "balanced", "character");
      const cols = eyeStyle === "minimal" ? [2, 5] : [1, 2, 5, 6];
      for (const x of cols) assert.equal(pixel(visible, 40 + x, 12)[3], 0, `${silhouette} concealed ${eyeStyle} eye`);
      checkTexture(visible, model);
    }
    for (const characterType of MINECRAFT_SKIN_JSON_SCHEMA.properties.characterType.enum) {
      const prompt = `${characterType} character`;
      checkTexture(compileMinecraftSkinBlueprint(sanitizeSkinDesign({ characterType }, prompt, 42), 42, model, "balanced", prompt), model);
    }
    // Every allowed drawing surface must stay within the Minecraft UV layout.
    for (const outer of [false, true]) {
      const faces = skinArtFaces(model, outer);
      assert.equal(Object.keys(faces).length, 36);
      for (const region of SKIN_ART_REGIONS) {
        const face = faces[region];
        const width = region.startsWith("head-") || (region.startsWith("torso-") && !/-(left|right)$/.test(region)) ? 8 : 4;
        const rowCount = region.startsWith("head-") ? 8 : /-(top|bottom)$/.test(region) ? 4 : 12;
        const design = sanitizeSkinDesign({ pixelArt: [{ region, layer: outer ? "outer" : "base", rows: Array(rowCount).fill("X".repeat(width)) }] }, "character", 42);
        const pixels = compileMinecraftSkinBlueprint(design, 42, model, "balanced", "character");
        checkTexture(pixels, model);
        assert.ok(face.x + face.width <= 64 && face.y + face.height <= 64);
      }
    }
    const colored = sanitizeSkinDesign({ pixelArt: [drawing], palette: { detail: "#dc3862" } }, "hoodie", 42);
    const pixels = new Uint8Array(64 * 64 * 4);
    const count = applySkinPixelArt(pixels, colored, model);
    assert.ok(count > 10, "Drawing was ignored");
    assert.deepEqual(pixel(pixels, 23, 38).slice(0, 3), skinArtColors(colored).X, "Drawing did not use semantic detail color");
    assert.equal(pixel(pixels, 20, 36)[3], 0, "Dot filled transparent space");
    colored.palette.detail = "#539fcc";
    applySkinPixelArt(pixels, colored, model);
    assert.deepEqual(pixel(pixels, 23, 38).slice(0, 3), skinArtColors(colored).X, "Artwork could not be recolored");
    const summer = sanitizeSkinDesign({ sleeves: "short", sleeveStyle: "short_sleeve", gloves: false, characterType: "human", colorTreatment: "gradient" }, "short sleeve shirt", 42);
    const solid = compileMinecraftSkinBlueprint({ ...summer, colorTreatment: "solid" }, 42, model, "balanced", "short sleeve shirt");
    const gradient = compileMinecraftSkinBlueprint(summer, 42, model, "balanced", "short sleeve shirt");
    for (const face of baseFaces(model).slice(0, 6)) for (let y = 0; y < face.height; y++) for (let x = 0; x < face.width; x++) assert.deepEqual(pixel(gradient, face.x + x, face.y + y), pixel(solid, face.x + x, face.y + y), "Gradient repainted human head");
    const arm = getBlueprintArmFaces(model, "right").front;
    assert.deepEqual(pixel(gradient, arm.x + 1, arm.y + 7), pixel(solid, arm.x + 1, arm.y + 7), "Gradient repainted bare arm");
    const headArt = { region: "head-front", layer: "outer", rows: Array(8).fill("HHHHHHHH") };
    const headPainted = new Uint8Array(64 * 64 * 4);
    applySkinPixelArt(headPainted, sanitizeSkinDesign({ characterType: "human", pixelArt: [headArt] }, "human", 42), model);
    for (const [x, y] of [[41, 11], [46, 12], [43, 14]]) assert.equal(pixel(headPainted, x, y)[3], 0, "AI hair covered protected human facial controls");
    const noArt = sanitizeSkinDesign({}, "character", 42), untouched = new Uint8Array(64 * 64 * 4);
    paintAdvancedMinecraftSkin(untouched, noArt, 42, model);
    assert.ok(untouched.every((value) => value === 0), "Ordinary design painted new pixels without art features");
  }
  // All AI clothing enum values must survive the sanitation boundary unchanged.
  for (const key of ["hairLength", "collarStyle", "placket", "midLayer", "innerGarment", "zipper", "drawstrings", "sleeveStyle", "pantsType", "footwearStyle", "socks", "characterType", "topPattern", "pantsDetail", "graphic", "colorTreatment"]) {
    for (const value of MINECRAFT_SKIN_JSON_SCHEMA.properties[key].enum) {
      assert.equal(sanitizeSkinDesign({ [key]: value }, "character", 42)[key], value, `AI ${key}=${value} was dropped`);
    }
  }
  const migrated = sanitizeSkinDesign({ placket: "open", zipper: false, drawstrings: false, pantsType: "relaxed-cargo", sleeveStyle: "ribbed-cuff", footwearStyle: "chunky-sneakers" }, "hoodie", 42);
  assert.equal(migrated.placket, "open_front"); assert.equal(migrated.zipper, "none"); assert.equal(migrated.drawstrings, "none");
  assert.equal(migrated.pantsType, "wide_cargo"); assert.equal(migrated.sleeveStyle, "slouch_gather"); assert.equal(migrated.footwearStyle, "chunky-sneaker");
  const oldSavedDesign = { ...migrated, placket: "open", zipper: false, drawstrings: false, sleeveStyle: "ribbed-cuff", pantsType: "relaxed-cargo", footwearStyle: "chunky-sneakers", hairLength: "long", collarStyle: "turtleneck" };
  const canonicalDesign = sanitizeSkinDesign(oldSavedDesign, "character", 42);
  assert.deepEqual(compileMinecraftSkinBlueprint(oldSavedDesign, 42, "slim", "balanced", "character"), compileMinecraftSkinBlueprint(canonicalDesign, 42, "slim", "balanced", "character"), "Saved legacy design lost its controls");
  const hoodie = createFallbackSkinDesign(fixtures[0][1], 42);
  assert.equal(hoodie.placket, "pullover"); assert.equal(hoodie.sleeveStyle, "slouch_gather");
  assert.equal(analyzeGarmentGrammar(fixtures[0][1], hoodie, 42).utility, "kangaroo_pocket");
  assert.equal(analyzeGarmentGrammar("layered hair and a hoodie", hoodie, 42).innerGarment, "none");
  assert.equal(analyzeGarmentGrammar("hoodie without drawstrings", { ...hoodie, drawstrings: "thin" }, 42).drawstrings, "none");
  // Equal physical faces receive equal light regardless of their UV row.
  for (const model of ["classic", "slim"]) for (const direction of ["upper-left", "upper-right", "top-down"]) {
    const canvas = new BlueprintCanvas();
    const arms = [getBlueprintArmFaces(model, "right"), getBlueprintArmFaces(model, "left")];
    for (const arm of arms) for (const face of Object.values(arm)) for (let y = 0; y < face.height; y++) for (let x = 0; x < face.width; x++) canvas.setPixel(face.x + x, face.y + y, "#65758d");
    applyDirectionalLighting(canvas, direction, model);
    for (const plane of Object.keys(arms[0])) for (let y = 0; y < arms[0][plane].height; y++) for (let x = 0; x < arms[0][plane].width; x++) {
      assert.deepEqual(canvas.getPixel(arms[0][plane].x + x, arms[0][plane].y + y), canvas.getPixel(arms[1][plane].x + x, arms[1][plane].y + y), `Unequal ${plane} lighting (${direction})`);
    }
  }
  const outputDir = process.argv[2] && path.resolve(process.argv[2]);
  if (outputDir) fs.mkdirSync(outputDir, { recursive: true });
  // Exercise the actual preset compiler without React, a browser or a server.
  const vm = require("node:vm");
  const componentPath = path.join(__dirname, "../src/components/tool/MinecraftSkinMaker.tsx");
  const source = ts.createSourceFile(componentPath, fs.readFileSync(componentPath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const presetCode = source.statements.filter((node) => (ts.isFunctionDeclaration(node) && node.name?.text === "compileBlueprintToSkin") || (ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) => declaration.name.getText(source) === "MINECRAFT_BLUEPRINTS"))).map((node) => node.getText(source)).join("\n");
  let presetPixels;
  const presetContext = { exports: {}, createFallbackSkinDesign, compileMinecraftSkinBlueprint: (...args) => { presetPixels = compileMinecraftSkinBlueprint(...args); return presetPixels; }, compileMinecraftSkin: () => { throw new Error("Preset fell back to old renderer"); } };
  vm.createContext(presetContext);
  vm.runInContext(ts.transpileModule(presetCode, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, presetContext);
  assert.equal(presetContext.exports.MINECRAFT_BLUEPRINTS.length, 10);
  for (const preset of presetContext.exports.MINECRAFT_BLUEPRINTS) {
    const result = presetContext.compileBlueprintToSkin(preset);
    checkTexture(presetPixels, preset.armModel);
    assert.equal(result.renderer, "blueprint");
    if (preset.id === "duck-in-a-suit") assert.equal(result.design.characterType, "duck");
    if (preset.id === "screen-head") assert.equal(result.design.characterType, "tv");
    if (preset.id === "pastel-drift") assert.equal(result.design.colorTreatment, "gradient");
  }
  let renders = 0;
  for (const [name, prompt, fields] of fixtures) for (const model of ["classic", "slim"]) {
    const design = sanitizeSkinDesign({ palette, ...fields }, prompt, 42);
    for (const style of ["balanced", "detailed", "anime", "pixel-artist", "minimal"]) for (const seed of [42, 9187, 12345]) {
      const pixels = compileMinecraftSkinBlueprint(design, seed, model, style, prompt);
      checkTexture(pixels, model);
      assert.deepEqual(pixels, compileMinecraftSkinBlueprint(design, seed, model, style, prompt), "Seed is not deterministic");
      renders++;
    }
    const pixels = compileMinecraftSkinBlueprint(design, 42, model, "balanced", prompt);
    if (name === "streetwear") {
      const skin = pixel(pixels, 11, 13).slice(0, 3), cheek = pixel(pixels, 8, 13).slice(0, 3);
      assert.ok(cheek.every((channel, i) => Math.abs(channel - skin[i]) < 45), "Harsh cheek contour");
      for (const x of [11, 12]) assert.notDeepEqual(pixel(pixels, x, 11).slice(0, 3), [87, 165, 204], "Eyes crossed nose bridge");
      const elbow = getBlueprintArmFaces(model, "right", true).front;
      assert.equal(pixel(pixels, elbow.x, elbow.y + 7)[3], 255, "Hoodie sleeve stopped at elbow");
      const colors = new Set();
      for (let y = 38; y < 46; y++) for (let x = 20; x < 28; x++) colors.add(pixel(pixels, x, y).join(","));
      assert.ok(colors.size >= 5, "Outer layer erased clothing folds");
    }
    const png = await sharp(Buffer.from(pixels), { raw: { width: 64, height: 64, channels: 4 } }).png().toBuffer();
    const metadata = await sharp(png).metadata();
    assert.equal(metadata.width, 64); assert.equal(metadata.height, 64);
    assert.deepEqual(await sharp(png).ensureAlpha().raw().toBuffer(), Buffer.from(pixels), "PNG changed texture pixels");
    if (outputDir) fs.writeFileSync(path.join(outputDir, `${name}-${model}.png`), png);
  }
  const base = Buffer.alloc(64 * 64 * 4, 127), generated = Buffer.alloc(64 * 64 * 4, 235);
  const legs = mergeMinecraftSkinPart(base, generated, "legs");
  assert.deepEqual(pixel(legs, 8, 8), pixel(base, 8, 8), "Leg edit changed head");
  assert.deepEqual(pixel(legs, 20, 20), pixel(base, 20, 20), "Leg edit changed torso");
  assert.deepEqual(pixel(legs, 4, 20), pixel(generated, 4, 20), "Leg edit did not replace leg");
  for (const model of ["classic", "slim"]) {
    const parts = {
      head: [...cube(0, 0, 8, 8, 8), ...cube(32, 0, 8, 8, 8)],
      torso: [...cube(16, 16, 8, 12, 4), ...cube(16, 32, 8, 12, 4)],
      arms: [...Object.values(getBlueprintArmFaces(model, "right")), ...Object.values(getBlueprintArmFaces(model, "left")), ...Object.values(getBlueprintArmFaces(model, "right", true)), ...Object.values(getBlueprintArmFaces(model, "left", true))],
      legs: [...cube(0, 16, 4, 12, 4), ...cube(16, 48, 4, 12, 4), ...cube(0, 32, 4, 12, 4), ...cube(0, 48, 4, 12, 4)],
    };
    for (const selected of Object.keys(parts)) {
      const edited = mergeMinecraftSkinPart(base, generated, selected);
      for (const [part, faces] of Object.entries(parts)) for (const face of faces) {
        for (let y = face.y; y < face.y + face.height; y++) for (let x = face.x; x < face.x + face.width; x++) {
          assert.deepEqual(pixel(edited, x, y), pixel(part === selected ? generated : base, x, y), `${selected} edit damaged ${part} (${model}) at ${x},${y}`);
        }
      }
    }
  }
  const beforeFace = new Uint8Array(base), afterFace = new Uint8Array(base);
  afterFace.set([12, 34, 56, 255], (11 * 64 + 10) * 4);
  afterFace.set([99, 99, 99, 255], (40 * 64 + 44) * 4);
  const manuallyEdited = new Uint8Array(base);
  manuallyEdited.set([60, 70, 80, 255], (10 * 64 + 8) * 4);
  manuallyEdited.set([20, 30, 40, 255], (40 * 64 + 44) * 4);
  const faceEdit = mergeMinecraftFaceStyleChange(manuallyEdited, beforeFace, afterFace);
  assert.deepEqual(pixel(faceEdit, 10, 11), pixel(afterFace, 10, 11), "Face control failed to change eyes");
  assert.deepEqual(pixel(faceEdit, 8, 10), pixel(manuallyEdited, 8, 10), "Face control erased manual face artwork");
  assert.deepEqual(pixel(faceEdit, 44, 40), pixel(manuallyEdited, 44, 40), "Face control erased manually edited clothes");
  // Explicit mouth choices must produce distinct visible fronts in both renderers,
  // including the default visor. Selection state alone is insufficient evidence.
  for (const compile of [compileMinecraftSkinBlueprint, compileMinecraftSkin]) {
    const mouthDesign = { ...createFallbackSkinDesign("Cyber samurai with a visor", 998877), characterType: "human", palette };
    const fronts = new Set();
    let reference;
    for (const mouthStyle of ["none", "smile", "neutral", "smirk", "open", "masked"]) {
      const pixels = compile({ ...mouthDesign, mouthStyle }, 998877, "classic", "balanced", "Cyber samurai with a visor");
      const mouth = [];
      for (let y = 13; y <= 15; y++) for (let x = 8; x <= 15; x++) mouth.push(...pixel(pixels, x, y));
      fronts.add(JSON.stringify(mouth));
      if (reference) {
        assert.deepEqual(pixels.slice(16 * 64 * 4), reference.slice(16 * 64 * 4), "Mouth option changed body");
        for (let y = 8; y < 13; y++) for (let x = 8; x < 16; x++) assert.deepEqual(pixel(pixels, x, y), pixel(reference, x, y), "Mouth option changed eyes");
      }
      reference = pixels;
    }
    assert.equal(fronts.size, 6, "Mouth options produced identical expressions");
  }
  console.log(`PASS: ${renders} renders; 72 drawing surfaces per model, 10 actual UI presets, both arm models, 5 styles, 3 seeds, opaque base faces, valid transparency, art safety/quality, remix preservation, deterministic output, AI schema, legacy designs, lighting parity, PNG roundtrips, and part editing.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
