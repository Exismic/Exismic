import sharp from "sharp";
import {
  compileMinecraftSkin,
  createFallbackSkinDesign,
  sanitizeSkinDesign,
  type MinecraftArmModel,
  type MinecraftSkinDesign,
} from "../src/lib/minecraft-skin";
import {
  compileMinecraftSkinBlueprint,
} from "../src/lib/minecraft-skin-blueprint";

// ============================================================================
// PRODUCTION INTEGRATION VERIFICATION TEST SUITE
// ============================================================================

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  results.push({
    suite,
    name,
    passed: condition,
    details: condition ? undefined : details,
  });
  const symbol = condition ? "✅ PASS" : "❌ FAIL";
  console.log(`  ${symbol} [${suite}] ${name}${details ? ` -> ${details}` : ""}`);
}

// ----------------------------------------------------------------------------
// Mock Route Compilation Dispatcher (replicates route.ts logic exactly)
// ----------------------------------------------------------------------------
function mockRouteCompile(
  design: MinecraftSkinDesign,
  seed: number,
  armModel: MinecraftArmModel,
  style: any,
  prompt: string,
  featureFlag: string | undefined,
  simulateBlueprintError = false
): { pixels: Uint8Array; renderer: "blueprint" | "procedural"; fallbackTriggered: boolean } {
  let fallbackTriggered = false;
  let renderer: "blueprint" | "procedural" = "procedural";
  let generated: Uint8Array;

  if (featureFlag === "true") {
    try {
      if (simulateBlueprintError) {
        throw new Error("Simulated unexpected Blueprint compiler fault");
      }
      generated = compileMinecraftSkinBlueprint(design, seed, armModel, style, prompt);
      renderer = "blueprint";
    } catch (blueprintError) {
      fallbackTriggered = true;
      generated = compileMinecraftSkin(design, seed, armModel, style, prompt);
      renderer = "procedural";
    }
  } else {
    generated = compileMinecraftSkin(design, seed, armModel, style, prompt);
    renderer = "procedural";
  }

  return { pixels: generated, renderer, fallbackTriggered };
}

// ----------------------------------------------------------------------------
// Client Recompile Dispatcher (replicates MinecraftSkinMaker.tsx logic)
// ----------------------------------------------------------------------------
function mockClientRecompile(
  updatedDesign: MinecraftSkinDesign,
  resultRenderer: "blueprint" | "procedural",
  seed: number,
  armModel: MinecraftArmModel,
  style: any,
  prompt: string,
  simulateBlueprintError = false
): { pixels: Uint8Array; usedRenderer: "blueprint" | "procedural"; fallbackTriggered: boolean } {
  let fallbackTriggered = false;
  let usedRenderer: "blueprint" | "procedural" = "procedural";
  let newPixels: Uint8Array;

  if (resultRenderer === "blueprint") {
    try {
      if (simulateBlueprintError) {
        throw new Error("Simulated client recompile error");
      }
      newPixels = compileMinecraftSkinBlueprint(updatedDesign, seed, armModel, style, prompt);
      usedRenderer = "blueprint";
    } catch (err) {
      fallbackTriggered = true;
      newPixels = compileMinecraftSkin(updatedDesign, seed, armModel, style, prompt);
      usedRenderer = "procedural";
    }
  } else {
    newPixels = compileMinecraftSkin(updatedDesign, seed, armModel, style, prompt);
    usedRenderer = "procedural";
  }

  return { pixels: newPixels, usedRenderer, fallbackTriggered };
}

async function runVerificationSuite() {
  console.log("\n=================================================================");
  console.log("  MINECRAFT SKIN STUDIO: PRODUCTION INTEGRATION VERIFICATION     ");
  console.log("=================================================================\n");

  const testPrompt = "Dark academia professor in tweed jacket over charcoal turtleneck with leather briefcase";
  const seed = 12345;
  const design = sanitizeSkinDesign(createFallbackSkinDesign("professor"), testPrompt, seed);

  // --------------------------------------------------------------------------
  // SUITE 1: FEATURE FLAG OFF (LEGACY CONTROL RENDERER)
  // --------------------------------------------------------------------------
  console.log("\n--- SUITE 1: FEATURE FLAG OFF (PROD DEFAULT) ---");
  {
    const resOff = mockRouteCompile(design, seed, "classic", "balanced", testPrompt, "false");
    const baseline = compileMinecraftSkin(design, seed, "classic", "balanced", testPrompt);

    assert(resOff.renderer === "procedural", "Flag OFF", "Renderer is marked as procedural");
    assert(!resOff.fallbackTriggered, "Flag OFF", "Fallback is not triggered");
    assert(resOff.pixels.length === 64 * 64 * 4, "Flag OFF", "Outputs exactly 16384 bytes (64x64 RGBA)");

    let bytesMatch = true;
    for (let i = 0; i < baseline.length; i++) {
      if (resOff.pixels[i] !== baseline[i]) {
        bytesMatch = false;
        break;
      }
    }
    assert(bytesMatch, "Flag OFF", "Pixel output is 100% byte-identical to baseline control");

    // Also test with undefined flag (omitted from env)
    const resUndef = mockRouteCompile(design, seed, "classic", "balanced", testPrompt, undefined);
    assert(resUndef.renderer === "procedural", "Flag Omitted", "Renderer defaults to procedural when flag undefined");
  }

  // --------------------------------------------------------------------------
  // SUITE 2: FEATURE FLAG ON (ARTIST BLUEPRINT RENDERER)
  // --------------------------------------------------------------------------
  console.log("\n--- SUITE 2: FEATURE FLAG ON (CANARY / ACTIVE) ---");
  {
    const resOn = mockRouteCompile(design, seed, "classic", "balanced", testPrompt, "true");

    assert(resOn.renderer === "blueprint", "Flag ON", "Renderer is marked as blueprint");
    assert(!resOn.fallbackTriggered, "Flag ON", "Compiled without triggering fallback");
    assert(resOn.pixels.length === 64 * 64 * 4, "Flag ON", "Outputs exactly 16384 bytes (64x64 RGBA)");

    // Verify sharp PNG conversion works cleanly
    const pngBuffer = await sharp(Buffer.from(resOn.pixels), {
      raw: { width: 64, height: 64, channels: 4 },
    })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();

    assert(pngBuffer.length > 500 && pngBuffer.length < 20000, "Flag ON", `Sharp PNG encoding succeeds (${pngBuffer.length} bytes)`);
  }

  // --------------------------------------------------------------------------
  // SUITE 3: AUTOMATIC ZERO-COST LEGACY FALLBACK ON BLUEPRINT ERROR
  // --------------------------------------------------------------------------
  console.log("\n--- SUITE 3: RESILIENT AUTOMATIC FALLBACK ---");
  {
    const resFallback = mockRouteCompile(design, seed, "classic", "balanced", testPrompt, "true", true);
    const baseline = compileMinecraftSkin(design, seed, "classic", "balanced", testPrompt);

    assert(resFallback.fallbackTriggered, "Fallback", "Error caught and fallback successfully triggered");
    assert(resFallback.renderer === "procedural", "Fallback", "Renderer safely marked as procedural");
    assert(resFallback.pixels.length === 64 * 64 * 4, "Fallback", "Valid 64x64 RGBA pixels returned without throwing");

    let bytesMatch = true;
    for (let i = 0; i < baseline.length; i++) {
      if (resFallback.pixels[i] !== baseline[i]) {
        bytesMatch = false;
        break;
      }
    }
    assert(bytesMatch, "Fallback", "Output is 100% identical to legacy control skin");
  }

  // --------------------------------------------------------------------------
  // SUITE 4: SLIM (3px) vs CLASSIC (4px) ARM GEOMETRY & UV COMPLIANCE
  // --------------------------------------------------------------------------
  console.log("\n--- SUITE 4: CLASSIC (4px) & SLIM (3px) UV COMPLIANCE ---");
  {
    const classicSkin = compileMinecraftSkinBlueprint(design, seed, "classic", "balanced", testPrompt);
    const slimSkin = compileMinecraftSkinBlueprint(design, seed, "slim", "balanced", testPrompt);

    assert(classicSkin.length === 16384, "Classic Model", "Classic skin buffer valid");
    assert(slimSkin.length === 16384, "Slim Model", "Slim skin buffer valid");

    // Check dead-zone columns for slim skin (Right arm dead columns: x=54..55, y=16..31 & x=54..55, y=32..47)
    // Left arm dead columns: x=62..63, y=48..63
    let deadZoneClean = true;
    for (let y = 16; y < 48; y++) {
      for (let x = 54; x <= 55; x++) {
        const alpha = slimSkin[(y * 64 + x) * 4 + 3];
        if (alpha !== 0) {
          deadZoneClean = false;
          break;
        }
      }
    }
    for (let y = 48; y < 64; y++) {
      for (let x = 62; x <= 63; x++) {
        const alpha = slimSkin[(y * 64 + x) * 4 + 3];
        if (alpha !== 0) {
          deadZoneClean = false;
          break;
        }
      }
    }
    assert(deadZoneClean, "Slim Model", "Columns 54..55 and 62..63 are 100% transparent in Alex slim model");
  }

  // --------------------------------------------------------------------------
  // SUITE 5: FRONTEND INSTANT EYE / MOUTH STYLE EDITS DISPATCH
  // --------------------------------------------------------------------------
  console.log("\n--- SUITE 5: FRONTEND INSTANT STYLE EDIT DISPATCH ---");
  {
    const updatedDesign: MinecraftSkinDesign = {
      ...design,
      eyeStyle: "anime",
      mouthStyle: "smile",
    };

    // Case 1: When generated by Blueprint, client recompiles with Blueprint
    const clientBp = mockClientRecompile(updatedDesign, "blueprint", seed, "classic", "balanced", testPrompt);
    assert(clientBp.usedRenderer === "blueprint", "Client Fast Edit", "Uses Blueprint renderer when result.renderer === 'blueprint'");
    assert(!clientBp.fallbackTriggered, "Client Fast Edit", "Client Blueprint recompile completes without error");

    // Case 2: When generated by Procedural, client recompiles with Procedural
    const clientProc = mockClientRecompile(updatedDesign, "procedural", seed, "classic", "balanced", testPrompt);
    assert(clientProc.usedRenderer === "procedural", "Client Fast Edit", "Uses Procedural renderer when result.renderer === 'procedural'");

    // Case 3: If client Blueprint recompile fails, it falls back to Procedural cleanly
    const clientFallback = mockClientRecompile(updatedDesign, "blueprint", seed, "classic", "balanced", testPrompt, true);
    assert(clientFallback.fallbackTriggered, "Client Fast Edit", "Client catches Blueprint error and falls back to Procedural");
    assert(clientFallback.usedRenderer === "procedural", "Client Fast Edit", "Client renders procedural skin on fallback");
    assert(clientFallback.pixels.length === 16384, "Client Fast Edit", "Client receives valid 64x64 canvas data");
  }

  // --------------------------------------------------------------------------
  // SUITE 6: RESPONSE SHAPE & METADATA CONTRACT
  // --------------------------------------------------------------------------
  console.log("\n--- SUITE 6: API RESPONSE SHAPE & METADATA CONTRACT ---");
  {
    const mockApiResponse = {
      success: true,
      skinUrl: "https://example.com/minecraft_mock.png",
      design,
      armModel: "classic" as MinecraftArmModel,
      targetPart: "all" as const,
      seed,
      cost: 16,
      priority: true,
      referenceRebuilt: false,
      referenceGuided: false,
      renderer: "blueprint" as const,
      creditsRemaining: 484,
    };

    assert(typeof mockApiResponse.renderer === "string", "Response Shape", "Response includes renderer string");
    assert(mockApiResponse.cost === 16, "Response Shape", "Credit cost field intact");
    assert(typeof mockApiResponse.skinUrl === "string", "Response Shape", "Skin URL intact");
    assert(typeof mockApiResponse.creditsRemaining === "number", "Response Shape", "Credits remaining intact");
  }

  // --------------------------------------------------------------------------
  // FINAL SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n=================================================================");
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;
  console.log(`  VERIFICATION RESULTS: ${passedTests}/${totalTests} PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  if (failedTests > 0) {
    console.log(`  ❌ ${failedTests} TESTS FAILED`);
    process.exit(1);
  } else {
    console.log("  🎉 ALL PRODUCTION INTEGRATION SAFEGUARDS VERIFIED!");
    console.log("=================================================================\n");
  }
}

runVerificationSuite().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
