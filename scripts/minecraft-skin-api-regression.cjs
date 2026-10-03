// Exercise the real route with mocked account/storage/provider boundaries. No server or credits used.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const sharp = require("sharp");
const root = path.resolve(__dirname, "..");
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);
const skin = require("../src/lib/minecraft-skin.ts");
const blueprint = require("../src/lib/minecraft-skin-blueprint.ts");
const control = require("../src/lib/minecraft-skin-control.ts");
const models = require("../src/lib/ai-models.ts");
let debits = 0, uploads = [], files = [], calls = [], fail = false, providerDesign;
const user = { id: "fixture", plan: "pro", dailyCredits: 500 };
class NextResponse {
  static json(body, options = {}) { return { body, status: options.status || 200 }; }
}
const mocks = {
  "next/server": { NextResponse },
  "uuid": { v4: () => "fixture-id" },
  "@/lib/prisma": { prisma: {
    user: { findUnique: async () => user, update: async () => user },
    userFile: { create: async ({ data }) => { files.push(data); return data; } },
    $transaction: async (operations) => Promise.all(operations),
  } },
  "@/lib/credits": { getCreditTotal: (value) => value.dailyCredits, deductCredits: async (_, cost) => {
    debits += cost; return { success: true, data: { dailyCredits: 500 - cost } };
  } },
  "@/lib/credit-policy": { getToolCreditCost: () => 25 },
  "@/lib/server/storage": { uploadProcessedFile: async (png) => { uploads.push(png); return "https://fixture.invalid/skin.png"; } },
  "@/lib/api-security": { getOptionalApiUser: async () => user, requireApiUser: async () => user,
    getRequestIp: () => "fixture", checkRateLimit: () => ({ allowed: true }) },
};
const sandbox = {
  exports: {}, Buffer, Uint8Array, AbortSignal,
  process: { env: { GROQ_API_KEY: "mock-only-key" } },
  console: { error() {}, warn() {}, log() {} },
  require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : name.startsWith("@/")
    ? require(path.join(root, "src", name.slice(2) + ".ts")) : require(name),
  fetch: async (_, init) => {
    calls.push(JSON.parse(init.body));
    return fail ? { ok: false, status: 400, text: async () => "provider unavailable" }
      : { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(providerDesign) } }] }) };
  },
};
vm.createContext(sandbox);
const filename = path.join(root, "src/app/api/tools/image/minecraft-skin/route.ts");
vm.runInContext(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, sandbox);
const post = (body) => sandbox.exports.POST({ json: async () => body });
const reset = () => { debits = 0; uploads = []; files = []; calls = []; };
const changed = (a, b) => [...Array(4096).keys()].filter(i => a.slice(i * 4, i * 4 + 4).some((v, c) => v !== b[i * 4 + c])).length;
async function checkEditorRace() {
  const editorFile = path.join(root, "src/components/tool/MinecraftSkinEditor.tsx");
  const source = ts.createSourceFile(editorFile, fs.readFileSync(editorFile, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ["save", "runAiEdit"].includes(node.name.getText(source))) declarations.push(`const ${node.getText(source)};`);
    ts.forEachChild(node, visit);
  }
  visit(source);
  let finish, saveCalls = 0, aiCalls = 0, busy = false;
  const state = {
    disabled: false, operationRef: { current: false }, pixels: new Uint8ClampedArray(64 * 64 * 4), validation: { valid: true },
    skinName: "Fixture", armModel: "slim", aiCommand: "make jacket green", part: "torso",
    pixelsToDataUrl: () => "fixture-texture", partToApi: (part) => part,
    onBusyChange: (value) => { busy = value; },
    setIsSaving() {}, setError() {}, setOriginalPixels() {}, setUndoStack() {}, setRedoStack() {}, setMessage() {}, onSaved() {},
    setIsAiEditing() {}, setAiCommand() {},
    onAiEdit: async () => { aiCalls++; await new Promise(resolve => { finish = resolve; }); },
    fetch: async () => { saveCalls++; await new Promise(resolve => { finish = resolve; }); return { ok: true, json: async () => ({ success: true, skinUrl: "fixture-new" }) }; },
  };
  vm.createContext(state);
  vm.runInContext(ts.transpileModule(declarations.join("\n") + "\nglobalThis.handlers = { save, runAiEdit };", {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText, state);
  const ai = state.handlers.runAiEdit();
  assert.equal(busy, true);
  await state.handlers.save();
  await state.handlers.runAiEdit();
  assert.equal(saveCalls, 0, "Save overlapped an active AI edit");
  assert.equal(aiCalls, 1, "Double click created two AI requests");
  finish(); await ai;
  assert.equal(busy, false);
  const save = state.handlers.save();
  await state.handlers.runAiEdit();
  await state.handlers.save();
  assert.equal(aiCalls, 1, "AI edit overlapped an active save");
  assert.equal(saveCalls, 1, "Double click created two saves");
  finish(); await save;
  assert.equal(busy, false);
  state.disabled = true;
  await state.handlers.save(); await state.handlers.runAiEdit();
  assert.equal(saveCalls, 1, "Disabled editor still saved");
}
async function main() {
  await checkEditorRace();
  const parent = skin.sanitizeSkinDesign({ garmentType: "jacket", placket: "open_front", innerGarment: "undershirt", topPattern: "plaid" }, "brown plaid jacket over cream undershirt and blue jeans", 42);
  providerDesign = { ...parent, garmentType: "shirt", placket: "pullover", palette: { ...parent.palette, top: "#2f5d46", hair: "#ffffff", pants: "#ffffff" } };
  fail = true;
  for (const action of ["generate", "remix", "variation"]) {
    reset();
    const response = await post({ prompt: "green jacket", action, parentDesign: parent, remixInstruction: "make jacket green" });
    assert.equal(response.status, 503);
    assert.equal(debits, 0, "Failed provider request consumed credits");
    assert.equal(uploads.length, 0, "Fallback texture stored as AI success");
    assert.equal(files.length, 0, "Failed request added to history");
  }
  fail = false;
  reset();
  assert.equal((await post({ prompt: "preserve everything", action: "remix", parentDesign: parent })).status, 400);
  assert.equal(calls.length, 0, "Preservation-only instruction called provider");
  for (const model of ["classic", "slim"]) {
    const base = blueprint.compileMinecraftSkinBlueprint(parent, 42, model, "pixel-artist", parent.description);
    base.set([255, 0, 255, 255], (8 * 64 + 11) * 4);
    const png = await sharp(Buffer.from(base), { raw: { width: 64, height: 64, channels: 4 } }).png().toBuffer();
    const dataUrl = "data:image/png;base64," + png.toString("base64");
    reset();
    const response = await post({ prompt: "Change the torso jacket to forest green. Keep my hair, face, jeans and shoes.",
      armModel: model, targetPart: "torso", parentDesign: parent, seed: 42, referenceImage: dataUrl, baseSkinUrl: dataUrl });
    assert.equal(response.status, 200);
    assert.equal(calls[0].model, models.DEFAULT_GROQ_VISION_MODEL);
    assert.equal(calls[0].reasoning_effort, "none");
    assert.ok(calls[0].messages[1].content[0].text.includes("CURRENT CHARACTER"));
    assert.equal(response.body.design.garmentType, parent.garmentType);
    assert.equal(response.body.design.placket, parent.placket);
    assert.equal(response.body.design.palette.top, "#2f5d46");
    const output = new Uint8Array(await sharp(uploads[0]).ensureAlpha().raw().toBuffer());
    assert.ok(changed(base, output) > 30, "Jacket edit did not change meaningful pixels");
    assert.deepEqual(skin.mergeMinecraftSkinPart(output, base, "torso"), base, "Torso edit modified protected pixels");
    assert.equal(debits, 2);
    assert.equal(files[0].metadata.sizeBytes, uploads[0].length);
    reset();
    const remix = await post({ prompt: "brown plaid jacket", action: "remix", remixInstruction: "Make the jacket forest green. Preserve my hair, face, jeans, shoes and all other details.",
      armModel: model, parentDesign: parent, baseSkinUrl: dataUrl, seed: 42 });
    assert.equal(remix.status, 200);
    const remixedPixels = new Uint8Array(await sharp(uploads[0]).ensureAlpha().raw().toBuffer());
    assert.ok(changed(base, remixedPixels) > 30);
    const restored = control.mergeMinecraftRemixPixels(remixedPixels, base, "change jacket color");
    assert.deepEqual(restored, base, "Jacket remix modified head or legs");
    assert.equal(remix.body.seed, 42);
  }
  reset();
  providerDesign = { ...parent, pixelArt: [{ region: "torso-back", layer: "outer", rows: ["........", "........", "...XX...", "..XxxX..", ".XX..XX.", "..XxxX..", "...XX...", "........", "........", "........", "........", "........"] }] };
  const variation = await post({ prompt: parent.description, parentDesign: parent, seed: 42, action: "variation" });
  assert.equal(variation.status, 200);
  assert.notEqual(variation.body.seed, 42);
  assert.deepEqual(JSON.parse(JSON.stringify(variation.body.design.palette)), parent.palette);
  const original = blueprint.compileMinecraftSkinBlueprint(parent, 42, "classic", "balanced", parent.description);
  const varied = new Uint8Array(await sharp(uploads[0]).ensureAlpha().raw().toBuffer());
  assert.ok(changed(original, varied) > 100, "Variation barely differs from original");
  assert.equal(variation.body.renderer, "blueprint", "Advanced renderer disabled when flag unset");
  console.log("PASS: editor Save/AI race and duplicate clicks, provider failure billing, preservation-only rejection, both arm models, vision editor, remix protection, meaningful variation, advanced renderer default and file metadata.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
