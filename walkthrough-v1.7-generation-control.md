# Minecraft Skin Studio v1.7 — Generation Control Update Walkthrough

## Executive Summary
Minecraft Skin Studio v1.7 delivers enhanced user generation control without destabilizing or refactoring the core Artist Blueprint Renderer. The update introduces five composition style presets, structured character remixes with strict field-level delta preservation, deterministic identity-anchored seed variation, reference image prompt precedence, and complete lineage tracking in user history.

All existing production guarantees remain intact:
- **Renderer Architecture Preserved**: The Artist Blueprint Renderer was not refactored or expanded; style presets map directly to existing Blueprint composition parameters (`asymmetry`, `foldBias`, `ambientLighting`, `contourEmphasis`).
- **Emergency Procedural Fallback**: Untouched and operational (`src/lib/minecraft-skin.ts` control file unmodified).
- **Credit Billing Isolation**: Exact production pricing (25 credits free, 16 credits Pro) is preserved. Client-side re-renders cost 0 credits. Failed generations charge 0 credits.
- **Verification Suite**: All 16 automated tests in `scripts/verify-v17-generation-control.ts` passed (100% pass rate).

---

## Key Architectural Implementations

### 1. Multi-Tier Garment & Prompt Preservation
- **System Prompt Enhancement**: The Groq semantic extraction system prompt was upgraded to enforce multi-tier garment layering (`garmentType`, `placket`, `midLayer`, `innerGarment`).
  - Example: An instruction like `"red bomber jacket over black hoodie with white undershirt"` cleanly resolves to `garmentType: "bomber-jacket"`, `placket: "open"`, `midLayer: "hoodie"`, and `innerGarment: "undershirt"`.
- **Negative Constraint Isolation**: Prompts containing phrases such as `"no beard"`, `"not a helmet"`, or `"no glasses"` are explicitly mapped to negative constraint arrays and verified so that negative keywords never falsely activate positive attributes (`facialHair: "none"`, `glasses: false`, `hairStyle != "helmet"`).

### 2. Five Generation Style Presets
Style presets map exclusively to existing Blueprint composition parameters without expanding renderer code:
1. **Balanced** (Default): Canonical artist styling with natural strand flow, medium asymmetry, and standard directional lighting.
2. **Detailed**: Enhanced micro-clustering, boosted asymmetry ($\times 1.3$), and crisp contour definition on armor and garments.
3. **Anime**: Softer asymmetry ($\times 0.6$), warm ambient lighting, gradient anime eyes, and lush curtain/fringe silhouettes.
4. **Pixel Artist**: High-contrast contouring with emphasized pixel block boundaries and crisp shading transitions.
5. **Minimal**: Strict symmetry (`asymmetry: 0`), flat front ambient lighting, and clean readouts without micro-noise.

### 3. Regenerate Variation (Parent Identity Preservation)
- Rather than issuing an unconstrained Groq extraction that causes character drift, **Regenerate Variation** directly anchors to the parent `MinecraftSkinDesign`.
- It preserves all 7 primary identity pillars:
  - Character concept
  - Skin tone & shading ramp
  - Major hair color & silhouette
  - Outfit archetype & garment type
  - Clothing layers (`midLayer`, `innerGarment`)
  - Major accessories (`headphones`, `glasses`)
  - Footwear archetype
- It generates a fresh composition seed (`seed1 != seed2`) to vary strand flow, asymmetry, and tension fold bunching, providing visual variety with zero prompt drift and zero additional LLM latency.

### 4. Remix: Field-Level Delta Modification
- Structured low-temperature Groq modification (`temperature: 0.12`) receives the full parent `MinecraftSkinDesign` and the user's remix instruction.
- **Deterministic Reconciliation (`mergeRemixDesign`)**:
  - Unmentioned fields are systematically clamped to the parent design:
    - `"Change hoodie to red"` $\to$ modifies only `palette.top` / `topAccent` / `garmentType`; strictly preserves hair, eyes, face construction, skin tone, pants, shoes, and accessories.
    - `"Make hair silver and shorter"` $\to$ modifies only `palette.hair` / `hairStyle`; strictly preserves clothing, skin, eyes, face, and footwear.
    - `"Add headphones and remove glasses"` $\to$ sets `headphones: true`, `glasses: false`; clamps all other fields to parent.

### 5. Reference Image Prompt Precedence
- Enforces strict hierarchy: **USER PROMPT > REFERENCE IMAGE > DEFAULTS**.
- The reference image provides color palette, silhouette, and material ownership cues, but explicit user text overrides take absolute precedence (e.g. prompt `"make jacket white"` overrides a black reference jacket).
- Color blending was corrected so Groq-extracted prompt overrides are merged on top of image-derived colors (`{ ...imagePalette, ...(aiDesign?.palette || {}) }`), preventing reference palette clobbering.

### 6. Lineage Metadata & History Storage
- Generation metadata in Supabase / Prisma `userFile.metadata` records full lineage:
  - `parentGenerationId`: Links variations and remixes to the parent asset.
  - `action`: `"generate" | "variation" | "remix"`.
  - `remixInstruction`: Specific modification instruction.
  - `isVariation`: Boolean flag for fast UI identification.
  - `originalPrompt`: Preserved root prompt.
  - `style`: Selected generation style preset.
  - `design`: Full structured `MinecraftSkinDesign` JSON (~1–2 KB, safe for Prisma `Json?`).

### 7. UI Enhancements (`MinecraftSkinMaker.tsx`)
- **Obsidian Glass Generation Controls**: Dropdown supporting the 5 presets with instant preview tooltips.
- **Action Bar**:
  - `[ 🎲 Regenerate Variation ]`: Re-seeds the active design with zero credit re-prompting.
  - `[ 🪄 Remix Character ]`: Opens a modal with prompt suggestions (`Change hoodie to red`, `Make hair silver and shorter`, `Add glowing visor`) and live credit indicator.
  - `[ 💾 Download Skin ]`: Direct export of canonical 64x64 PNG.
- **Lineage Badges**: Displays `🎲 Variation` and `🪄 Remixed` badges on active skins with tooltip displaying original root lineage.

---

## Verification Test Matrix (16/16 Passed)

| ID | Test Case | Category | Result | Details |
|---|---|---|---|---|
| **01** | Simple Character (`cyberpunk hacker with blue visor`) | Preset | **✅ PASS** | Valid 64x64 PNG buffer, 100% opaque base layer, visor and cyberpunk accents compiled. |
| **02** | Layered Streetwear (`bomber over hoodie with undershirt`) | Preset | **✅ PASS** | Multi-tier garment layering preserved. Distinct outer, midlayer, and inner garment tiers rendered. |
| **03** | Anime Character (`anime girl with messy pink hair`) | Preset | **✅ PASS** | Anime style maps to softer asymmetry, warm highlights, and gradient expressive eyes. |
| **04** | Armor Archetype (`obsidian knight with cyan runes`) | Preset | **✅ PASS** | Detailed style successfully enhances asymmetry, plate creases, and rune micro-clusters. |
| **05** | Cyberpunk (`cyberpunk mercenary with circuit pattern`) | Preset | **✅ PASS** | Pixel Artist style successfully activates crisp contours and high-clarity color blocks. |
| **06** | Cottagecore (`cottagecore girl with floral apron`) | Preset | **✅ PASS** | Minimal style maps to zero asymmetry and soft ambient lighting with clean readable clusters. |
| **07** | Reference-Guided Generation | Reference | **✅ PASS** | Reference palette correctly parsed and rendered via Blueprint compiler. |
| **08** | Prompt Override Against Reference (Precedence) | Reference | **✅ PASS** | Verified: USER PROMPT > REFERENCE IMAGE > DEFAULTS. Reference top (#0a0a0c) overridden by #ffffff. |
| **09** | Regenerate Variation (Parent Identity Preservation) | Variation | **✅ PASS** | Character identity 100% preserved. Seed variation yielded 31 altered pixel clusters without LLM drift. |
| **10** | Remix Clothing (`change hoodie to red bomber jacket`) | Remix | **✅ PASS** | Top changed to red bomber jacket. Hair, skin, eyes, face, pants, shoes 100% preserved. |
| **11** | Remix Hair (`make hair silver and shorter`) | Remix | **✅ PASS** | Hair modified to silver/short. Outfit, face, skin tone, pants, shoes 100% preserved. |
| **12** | Remix Accessory (`add headphones, remove glasses`) | Remix | **✅ PASS** | Headphones added and glasses removed. All other fields clamped to parent. |
| **13** | Negative Constraint Isolation (`no beard, not a helmet`) | Negative | **✅ PASS** | Negative tokens isolated. `facialHair='none'`, `glasses=false`, `hairStyle!='helmet'`. No false positives. |
| **14** | Classic Model (4px arms, 100% opaque base layer) | UV Model | **✅ PASS** | Head, torso, 4px arms, and legs base faces are 100% opaque. 64x64 valid Minecraft texture format. |
| **15** | Slim Model (3px arms, transparent dead-zones) | UV Model | **✅ PASS** | Slim 3px arm geometry verified. Dead-zone columns (55, 63) are strictly transparent (alpha=0). |
| **16** | Billing Isolation & Credit Safety | Billing | **✅ PASS** | Production pricing confirmed: 25 credits (16 Pro). Client-side recompile = 0 credits. Failed generations = 0 credits. |

---

## Billing & Credit Safety Verification

| Scenario | Expected Behavior | Verification Status |
|---|---|---|
| **Standard Generation** | Deducts 25 credits (16 for Pro) | Verified via `getToolCreditCost("image-minecraft-skin")` |
| **Regenerate Variation** | Deducts standard generation cost upon API generation | Verified |
| **Character Remix** | Deducts standard generation cost upon API remix | Verified |
| **Client-Side Eye/Mouth Edit** | 0 credits deducted (client canvas recompile) | Verified |
| **Client-Side 3D Preview Rotate** | 0 credits deducted | Verified |
| **Validation / Groq API Failure** | 0 credits deducted (deduction occurs post-generation) | Verified in `route.ts` line 1250 |
| **Duplicate Generation Safety** | Single deduction per successful generation ID | Verified |

---

## Limitations & Known Boundaries
1. **Renderer Scope**: The Artist Blueprint Renderer geometry primitives (64x64 Minecraft UV standard) remain fixed. New clothing silhouettes must map to supported grammar primitives (`oversized_sag`, `cropped`, `cinched_belt`, `long_drape`, `tucked`).
2. **Extreme Asymmetry**: Asymmetry is bounded between 0.0 and 1.0 to ensure player skins remain readable and faithful to Minecraft aesthetic conventions.
3. **Reference Textures**: Non-standard texture ratios uploaded by users are resampled via Sharp nearest-neighbor to 64x64 RGBA before analysis.

---

## Files Modified & Created

- `src/lib/minecraft-skin-blueprint.ts` (Modified: Added `style` parameter mapping, fixed `length` propagation).
- `src/lib/minecraft-skin-control.ts` (Created: Shared JSON schema, legacy mapping, instruction builder, deterministic `mergeRemixDesign`).
- `src/app/api/tools/image/minecraft-skin/route.ts` (Modified: Added style/action/remix handling, negative constraint isolation, lineage metadata persistence).
- `src/components/tool/MinecraftSkinMaker.tsx` (Modified: 5 style presets, variation & remix buttons, remix modal with suggestion chips, lineage badges).
- `src/lib/history.ts` (Modified: Added `parentGenerationId` replay param propagation).
- `scripts/verify-v17-generation-control.ts` (Created: 16-test comprehensive automated verification test harness).
- `v17-generation-control-output/` (Created: Contains 16 generated test PNG textures and `verification-report.json`).
