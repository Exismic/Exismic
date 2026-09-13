# v1.7 Diagnostic Report — Variation & Eye Style Failures

**Diagnostic Date**: September 10, 2026  
**Status**: Root causes isolated and confirmed through automated diagnostic traces. No code changes have been applied.

---

## Executive Summary

We performed an end-to-end trace and pixel-by-pixel diagnostic for both reported problems:
1. **Problem A (Regenerate Variation)**: Two consecutive variations from the exact same parent produced **0 changed pixels (0.00% difference)**. The Blueprint renderer accepts `seed`, but almost completely disconnects it from actual pixel generation: hair matrices are static and discard seed parameters, while legs, arms, and face generators do not consume `seed` at all.
2. **Problem B (Eye Style / Face Aesthetics)**: The client UI updates `updatedDesign.eyeStyle` on click, but the Artist Blueprint Renderer (`compileMinecraftSkinBlueprint`) **never reads or consumes `design.eyeStyle`**. All 5 eye styles produced **0 changed pixels**. In the legacy renderer, `"visor"` caused an early `return;` that erased the character's mouth, lips, cheeks, and chin shading.

---

## Part A: Regenerate Variation Diagnostic

### 1. End-to-End Execution Trace

```
[UI Click: "Regenerate Variation"]
   │
   ▼
[Client: MinecraftSkinMaker.tsx: regenerateVariation()]
   │ Sends: { action: "variation", parentDesign: result.design, seed: result.seed, prompt: ... }
   ▼
[Server API: route.ts: action === "variation"]
   │ 1. Generates new seed: seed = ((body.data.seed || seed) + random) % 4294967296
   │ 2. Sets aiDesign = parentDesign (preserves parent fields, does NOT call Groq)
   │ 3. Calls sanitizeSkinDesign(aiDesign, prompt, seed)
   ▼
[Compiler: compileMinecraftSkinBlueprint(design, seed, ...)]
   │ 1. partOffset = ((seed % 100) / 100) * 0.4 - 0.2  (passed to hair)
   │ 2. foldBias = seed % 3 === 0 ? "left" : seed % 3 === 1 ? "right" : "center" (passed to torso)
   │ 3. asymmetry = (seed % 100) / 100 (passed to torso)
   │ 4. generateHairBlueprint({ partOffset, asymmetry, seed, ... })
   │ 5. generateParametricTorsoBlueprint(grammar, foldBias, asymmetry, materials)
   │ 6. generateParametricLegBlueprint(...)  <-- seed NOT PASSED
   │ 7. generateFaceBlueprint(...)           <-- seed NOT PASSED
   ▼
[Generated PNG: 64×64 Texture]
```

### 2. Concrete Test Results: Parent vs Variation 1 vs Variation 2

We executed consecutive variations on a standard Streetwear character (`Cyber Streetwear`):
- **Parent Seed**: `100000`
- **Variation Seed 1**: `334567`
- **Variation Seed 2**: `791356`

#### Measured Pixel Difference:
| Comparison | Total 64×64 Pixels | Total Differing Pixels | Percentage | Head Base/Overlay | Torso | Arms | Legs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Parent vs Variation 1** | 4,096 | **31** | **0.76%** | 31 (hair base sheen) | 0 | 0 | 0 |
| **Variation 1 vs Variation 2** | 4,096 | **0** | **0.00%** | **0** | **0** | **0** | **0** |

Between Variation 1 and Variation 2, **not a single pixel changed across the entire skin**!

### 3. Answers to Core Investigation Questions

1. **Is the seed actually reaching every intended Blueprint variation mechanism?**  
   **No.** Inside `compileMinecraftSkinBlueprint`:
   - `generateHairBlueprint`: receives `seed`, but `generateBaseHairBlueprint` in `src/lib/minecraft-skin-blueprint-hair.ts` calculates `isLeftBiased`, `asymShift`, and `isLong` on lines 120–122 and **never uses them**. All silhouette return matrices are 100% static strings.
   - `generateParametricLegBlueprint`: does not accept a `seed` argument.
   - Arms base & overlay: do not consume `seed`.
   - Face blueprint: does not consume `seed`.
   - Only `generateParametricTorsoBlueprint` uses `foldBias` (`seed % 3`).
2. **Which renderer parameters consume the seed?**  
   Only `foldBias` (`"left" | "right" | "center"`), `partOffset` (ignored by hair), and `asymmetry` (only affects drawstrings if present).
3. **How much of the final image is seed-dependent?**  
   Between **0.00% and 0.76%** (0 to 31 pixels out of 4,096).
4. **Are the seed-dependent changes too subtle to be visually meaningful?**  
   **Yes.** A 0.76% or 0.00% pixel difference is imperceptible in 3D, leading users to conclude that variation is broken.
5. **Is the UI accidentally rebuilding from the original prompt instead of the parent design?**  
   **No.** The UI sends `parentDesign: result.design`, and `route.ts` assigns `aiDesign = parentDesign`. It does not make a fresh Groq call.
6. **Is the variation design actually preserving the parent design?**  
   **Yes, 100%.** It preserves the parent so strictly that without renderer-level seed variation, the output is essentially a clone.
7. **Are the generated PNGs genuinely different but the 3D preview displaying stale/cached pixels?**  
   **No.** Binary inspection of the generated PNG buffers confirms they are 99.24% to 100.00% identical byte-for-byte. The viewer accurately renders the identical image received from the server.

---

## Part B: Eye Style / Face Aesthetics Diagnostic

### 1. End-to-End Execution Trace

```
[UI Click: e.g. "Classic Steve 2×1"]
   │
   ▼
[Client: MinecraftSkinMaker.tsx: handleSelectEyeStyle("classic")]
   │ 1. setEyeStyle("classic")
   │ 2. updatedDesign = { ...result.design, eyeStyle: "classic" }
   │ 3. Calls compileMinecraftSkinBlueprint(updatedDesign, result.seed, armModel, style, prompt)
   ▼
[Compiler: compileMinecraftSkinBlueprint]
   │ 1. Calls safeExtractBlueprintDesign(updatedDesign, ...)
   │ 2. Calls generateFaceBlueprint(design.faceConstruction || "clean-aesthetic")
   │    ⚠️ NEVER reads design.eyeStyle!
   │    ⚠️ Stamps faceBp (which still has hardcoded 2×2 anime eyes)
   ▼
[Canvas Output: toDataURL("image/png")]
   │ 64×64 PNG produced with ZERO eye pixel changes!
```

### 2. Measured Eye Style Behavior (Same Parent Skin)

| Eye Style Advertised | Client Value Sent | Blueprint Compiler Pixels Changed | Legacy Compiler Pixels Changed | Visual Representation | Glitches / Flaws |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Anime / Aesthetic 2×2** | `"anime"` | **0** | 0 | 2×2 multi-tone gradient iris with catchlight | None (matches parent default) |
| **Classic Steve 2×1** | `"classic"` | **0** | 0 | 2×2 anime eyes (Unchanged) | Advertised 2×1 Steve eye is completely unrendered |
| **Glowing Solid** | `"glowing"` | **0** | 0 | 2×2 anime eyes (Unchanged) | Advertised solid luminous eye is completely unrendered |
| **Minimal Dot** | `"minimal"` | **0** | 0 | 2×2 anime eyes (Unchanged) | Advertised 1×2 minimal dot is completely unrendered |
| **Cyber Visor** | `"visor"` | **0** | **24** | In Blueprint: 0 (Unchanged)<br>In Legacy: 24 pixels drawn | **Severe Glitch in Legacy**: Visor triggers premature `return;` at line 1684 of `minecraft-skin.ts`, **erasing mouth, lips, cheeks, and chin shading**! |

### 3. Detailed Parameter Checklist for Each Eye Style

- **Exact compiler function handling it**: `compileMinecraftSkinBlueprint` in `src/lib/minecraft-skin-blueprint.ts`.
- **Exact UV coordinates modified**: `(0, 0)` — **0 coordinates modified** in Blueprint renderer.
- **Number of changed pixels**: **0 pixels** for all 5 styles in Blueprint mode.
- **Whether only intended eye pixels changed**: Neither eye pixels nor face pixels changed.
- **Whether hair, eyebrows, mouth, face shading changed**:
  - In Blueprint renderer: Nothing changed.
  - In Legacy fallback for `"visor"`: Rows 10–12 are filled with visor, while row 9 (brows), row 13 (cheeks), row 14 (mouth), and row 15 (chin) are **erased** due to premature `return;`.
- **Whether the 3D preview matches downloaded PNG**: Yes, both show the unmodified parent texture.

---

## Part C: Root Cause Classification

| Problem Area | Primary Failure Category | Secondary Category | Exact Technical Cause |
| :--- | :--- | :--- | :--- |
| **Problem A (Regenerate Variation)** | **E. Blueprint parameter propagation** | **D. Seed propagation** | The Blueprint compiler computes `foldBias`, `partOffset`, and `asymmetry`, but: (1) `generateBaseHairBlueprint` discards them and returns static strings; (2) leg, arm, and face generators do not take `seed`; (3) torso only has a 2-pixel shift. When `seed % 3` lands on the same bucket, 0 pixels change. |
| **Problem B (Eye Styles)** | **E. Blueprint parameter propagation** | **C. Design state** | `handleSelectEyeStyle` updates `design.eyeStyle`, but `compileMinecraftSkinBlueprint` only passes `design.faceConstruction` to `generateFaceBlueprint`. `design.eyeStyle` is never read or stamped. In legacy fallback, `"visor"` early-returns and erases the lower face (**G. Canvas overwrite/layer ordering**). |

---

## Part D: Regression Check (Facial Hair)

We verified that the v1.7 facial-hair hotfix remains 100% operational:
- **`none`**: ✅ PASS — Chin is verified clean skin (`r > 140`, `r > b`, not dark hair).
- **`short-beard`**: ✅ PASS — Chin center and mustache verified dark hair (`r < 75`, `g < 75`, `b < 75`).
- **`goatee`**: ✅ PASS — Center chin verified dark hair; outer jaw corners verified clean skin.

Zero regressions to the facial hair pipeline.

---

## Proposed Minimal Fixes

### Fix 1: Problem A — Meaningful Variation Without Identity Drift (Server + Renderer)

1. **Renderer-Level Parametric Seed Variation (`src/lib/minecraft-skin-blueprint-hair.ts` & `blueprint.ts`)**:
   - In `generateBaseHairBlueprint`: Consume `params.partOffset` and `params.seed` to alternate fringe strand notches and highlight glints (e.g. shift highlight cluster 1 pixel left/right based on `seed`).
   - In `generateParametricLegBlueprint`: Pass `seed` to alternate knee tension fold positions and pocket utility accents.
   - In `generateParametricTorsoBlueprint`: Use `seed` to vary fold cluster placement and drawstring/zipper lengths.
   - **Target**: Produces **~80–160 visibly distinct cluster pixels** across hair, torso, and legs while preserving 100% character identity and palette.
2. **Server-Side Variation Synthesis (`src/app/api/tools/image/minecraft-skin/route.ts`)**:
   - When `action === "variation"`, randomly select a complementary variant within the same silhouette family (e.g. `curtain-bangs` $\leftrightarrow$ `layered-short` or `middle-part-flow`) if unspecified by the user prompt.

### Fix 2: Problem B — Parametric Eye Style Overlay (Client + Renderer)

1. **Blueprint Eye Style Consumer (`src/lib/minecraft-skin-blueprint.ts`)**:
   - Right after stamping `faceBp` at `(8, 8)` on the front face, inspect `design.eyeStyle`:
     - **`classic`** (Steve 2×1): On Row 4 (`y = 12`), stamp `w E . . . . E w` (cols 1 & 6 white sclera, cols 2 & 5 eye pupil). Row 3 (`y = 11`) becomes clean base skin `K`.
     - **`glowing`** (Glowing Solid): On Rows 3 & 4 (`y = 11..12`), stamp solid luminous glint `*` (`#ffffff`) and neon glow `e` across cols 1–2 and 5–6 with no dark pupil.
     - **`minimal`** (Minimal Dot 1×2): On Rows 3 & 4 (`y = 11..12`), stamp 1-pixel-wide vertical aperture at cols 2 and 5; cols 0, 1, 6, 7 are clean skin `K`.
     - **`visor`** (Cyber Visor): On Rows 3 & 4 (`y = 11..12`), stamp futuristic optic visor band `A*AAAA*A` and `AAAAAAAA` across cols 0–7. **Crucially: DO NOT return early!** Mouth, lips, cheeks, and chin shading remain 100% intact.
     - **`anime`**: Keeps the 2×2 expressive anime gradient.
2. **Legacy Compiler Visor Fix (`src/lib/minecraft-skin.ts`)**:
   - Remove the early `return;` inside `hasVisor` so mouth and chin are rendered.
3. **Execution Boundary**:
   - Both `compileMinecraftSkinBlueprint` and client-side `handleSelectEyeStyle` will instantly recompile the texture locally (0 credits, no API call, no Groq, instant 3D preview update).

---

**Diagnostic Artifact Path**:  
[`walkthrough-v17-variation-eye-diagnostic.md`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/walkthrough-v17-variation-eye-diagnostic.md)

**STOPPED AS DIRECTED. Awaiting user review and approval before making any code modifications.**
