# Minecraft Skin Studio v1.7 — Generation Control Technical Audit

> **Audit Date**: September 10, 2026  
> **Target**: Minecraft Skin Studio (`Exismic/Exismic`)  
> **Pipeline**: Groq Strict Semantic Extraction $\to$ Artist Blueprint Renderer $\to$ 64×64 RGBA PNG $\to$ Sharp $\to$ Supabase $\to$ Downstream Credit Deduction  
> **Renderer Status**: Production Active (`FEATURE_FLAG_BLUEPRINT_RENDERER="true"`) — **LOCKED & UNTOUCHED**.

---

## 1. Executive Summary & Audit Objectives

The purpose of this audit is to inspect the complete end-to-end Minecraft Skin Studio generation pipeline prior to implementing the **v1.7 Generation Control Update**.

The core objective of v1.7 is:
> **GIVE USERS MORE CONTROL OVER GENERATION WHILE PRESERVING THE NEW ARTIST BLUEPRINT PIPELINE.**

This audit verifies all 7 critical areas without making assumptions from memory:
1. How prompts become `MinecraftSkinDesign`.
2. How reference images are processed and fused.
3. How composition seeds are generated and applied.
4. How regeneration works currently.
5. How history metadata is stored and tracked.
6. How client-side edits and zero-credit recompilations function.
7. How credits are calculated, verified, and deducted.

---

## 2. Current Architecture & Behavioral Analysis

### A. How Prompts Become `MinecraftSkinDesign`

1. **Request Ingestion**:
   - In [`src/app/api/tools/image/minecraft-skin/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/tools/image/minecraft-skin/route.ts), incoming requests are validated with `requestSchema` (zod):
     - `prompt`: `z.string().trim().min(2).max(2000)`
     - `armModel`: `"classic" | "slim"` (default: `"classic"`)
     - `style`: `"balanced" | "pixel-detailed" | "minimal" | "high-contrast"` (default: `"balanced"`)
     - `targetPart`: `"all" | "head" | "torso" | "arms" | "legs"`
     - `seed`: optional `number`
     - `referenceImage`, `referenceMode`, `baseSkinUrl`
2. **Groq Strict Structured Output**:
   - `createAiDesign()` is invoked with `model: TEXT_MODEL` (`llama-3.3-70b-versatile`) or `VISION_MODEL` (`llama-3.2-11b-vision-preview`).
   - Uses `response_format: { type: "json_schema", json_schema: { name: "minecraft_skin_design", strict: true, schema: MINECRAFT_SKIN_JSON_SCHEMA } }`.
   - Temperature is set to `0.15` (or `0.20` for guided reference).
3. **Current Semantic Weaknesses Identified**:
   - **Layer Collapsing**: Prompts with complex nested layering (e.g. *"red bomber jacket over black hoodie with white undershirt"*) rely on system prompt hints, but the extraction layer does not guarantee discrete structural separation across `garmentType`, `placket`, `midLayer`, and `innerGarment` when users describe variations like denim over flannel, trench over vest, or cardigan over graphic tee.
   - **Negative Constraint Inversion Vulnerability**: Terms like *"no beard"*, *"clean shaven"*, *"not a helmet"*, *"no glasses"* are captured in `negativeConstraints` array, but regex fallbacks and default heuristics can inadvertently trigger if negative keywords match substrings.
   - **Palette Context Clashing**: In `route.ts` line 991, `imagePalette` directly overrides `aiDesign.palette`, overwriting user color requirements with heuristic color buckets.

---

### B. Reference Image Processing Pipeline

1. **Current Flow**:
   - Client optimizes image in `optimizeReferenceImage()`: checks aspect ratio; if square $\ge 64\times 64$, flags `looksLikeSkinLayout = true`.
   - API supports 3 modes:
     - `rebuild`: Bypasses Groq completely. Slices raw texture into standard Minecraft UVs via `rebuildReferenceTexture()` or `rebuildShowcaseTexture()`.
     - `guided`: Sends base64 image to Groq `VISION_MODEL`. Sets reference priority to replicate character identity while applying prompt adjustments.
     - `inspire`: Instructs Groq to use the image as aesthetic/color inspiration while treating prompt as primary.
2. **Current Deficiencies Identified**:
   - **Precedence Inversion**: `extractImagePalette()` computes dominant color buckets via crude pixel counts (Red Lava, Cyan Cyber, Purple Magic, Dark Obsidian) and **unconditionally overrides** `aiDesign.palette`:
     ```ts
     palette: {
       ...(aiDesign?.palette || {}),
       ...imagePalette, // OVERWRITES Groq and user prompt!
     }
     ```
     If a reference image is dark obsidian, and the user prompt explicitly specifies *"Make the jacket white"*, `extractImagePalette` forces `top` to `dominantDarkHex`, violating the principle: **USER PROMPT > REFERENCE > DEFAULTS**.
   - **Rigid Archetype Assumption**: Images that do not match the 4 hardcoded buckets return `{}`; images that barely match get forced into generic cyber/demon templates.

---

### C. Seed Generation & Composition Mechanics

1. **Current Generation Flow**:
   - In `route.ts`:
     ```ts
     const seed = getMinecraftSkinSeed(prompt, body.data.seed);
     ```
   - In `src/lib/minecraft-skin.ts`:
     - If `body.data.seed` is undefined, `getMinecraftSkinSeed(prompt)` computes a deterministic 32-bit FNV/DJB2 hash of the prompt string.
2. **Current Blueprint Usage**:
   - In `src/lib/minecraft-skin-blueprint.ts`:
     - `partOffset = ((seed % 100) / 100) * 0.4 - 0.2` ($\pm 0.2$ strand offset)
     - `foldBias = seed % 3 === 0 ? "left" : seed % 3 === 1 ? "right" : "center"`
     - `asymmetry = (seed % 100) / 100` (0.0 to 1.0)
     - `generateHairBlueprint({ seed, partOffset, asymmetry, ... })`
3. **Deficiencies Identified**:
   - Because `body.data.seed` is never passed from the UI on re-generation, running the same prompt always produces the **exact same seed**. The user cannot produce visual variations without manually editing their text prompt.

---

### D. Current Regeneration Behavior

1. **Full Skin Regeneration**:
   - Currently, clicking "Generate" with the same prompt repeats the exact same request with the same seed hash. Because Groq runs at temperature 0.15 and the seed is identical, the generated skin is nearly or completely identical to the previous one.
2. **Partial Body Part Regeneration**:
   - Works for `head`, `torso`, `arms`, `legs` via `mergeMinecraftSkinPart()` and `baseSkinUrl`.
   - However, there is **no dedicated "Regenerate Variation" workflow** that retains the exact concept while deliberately refreshing composition seed, hair flow, shading clusters, and accessory placement.

---

### E. Remix Workflow Audit

1. **Current State**:
   - **Does NOT exist as a first-class workflow**.
   - If a user wants to change an attribute (e.g. *"change the hoodie into a red bomber jacket"*), their only option is to rewrite the character brief from scratch.
   - Rewriting the brief resets the entire Groq generation: hair, facial features, colors, and clothing items not mentioned in the prompt are re-rolled randomly by the LLM.
2. **Legacy `applyPromptEditsToMinecraftSkin`**:
   - Located in `src/lib/minecraft-skin.ts` (lines 2897–2980).
   - Relies on crude regex matching (`colorNearContext`) and hardcoded coordinate face recoloring.
   - Incompatible with the Artist Blueprint Renderer and not wired to modern structured generation.

---

### F. History Metadata Storage

1. **Database Schema (`prisma.userFile`)**:
   - Stored in `metadata: Prisma.InputJsonObject`:
     ```json
     {
       "width": 64,
       "height": 64,
       "armModel": "classic",
       "targetPart": "all",
       "style": "balanced",
       "referenceMode": "guided",
       "referenceGuided": false,
       "seed": 184920482,
       "renderer": "blueprint",
       "design": { ... },
       "aiDirected": true
     }
     ```
2. **Missing Metadata Fields**:
   - `originalPrompt`: currently stored in `originalUrl` column rather than explicit metadata.
   - `parentGenerationId`: absent (cannot trace variation lineage or remix history).
   - `remixInstruction`: absent.
   - `isVariation`: absent.
   - `stylePreset`: limited to 4 legacy strings.

---

### G. Client-Side Instant Edits & Zero-Credit Recompilation

1. **Instant Facial Aesthetic Switching**:
   - In `MinecraftSkinMaker.tsx`, selecting `Eye Style` (Anime, Classic, Glowing, Minimal, Visor) or `Mouth Style` (Smile, Neutral, Smirk, Open, None) updates `result.design` and immediately runs `compileMinecraftSkinBlueprint(updatedDesign, result.seed, armModel, style, prompt)` on the client.
   - Uses an offscreen HTML5 `<canvas>` to generate a new base64 data URL in 0ms without server roundtrips.
   - **0 credits consumed**.
2. **Pixel Studio (`PUT /api/tools/image/minecraft-skin`)**:
   - Users paint individual pixels in 3D/2D editor.
   - Uploads PNG to Supabase and creates a `userFile` record with `edited: true`.
   - **0 credits consumed** (no `deductCredits` invocation).

---

### H. Credit Economy & Billing Isolation

1. **Pricing Matrix**:
   - Full skin generation: 24 credits (Free) / 16 credits (Pro).
   - Rebuild texture: 10 credits (Free) / 6 credits (Pro).
   - Single body part edit: 4 credits (Free) / 2 credits (Pro).
   - Prompt enhancement: 1 credit.
   - Client eye/mouth style switches & pixel edits: 0 credits (Free).
2. **Deduction Timing**:
   - Strict downstream execution: Line 1054 in `route.ts`.
   - Pre-check occurs at Line 966 before any AI or rendering work.
   - Actual debit occurs strictly after Sharp PNG compression and Supabase upload succeed.
   - Uses unique idempotency key: `"tool:minecraft-skin:${filename}"`.
   - If Groq fails, compilation throws, or upload fails, execution aborts to the catch block with **zero credit deduction**.

---

## 3. Reusable Components

| Component | File Path | Capability & Reusability |
|---|---|---|
| **`compileMinecraftSkinBlueprint`** | [`src/lib/minecraft-skin-blueprint.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-blueprint.ts) | Core production renderer. Accepts `design`, `seed`, `model`, `style`, `prompt`. Must be called for all new variations & remixes. |
| **`compileMinecraftSkin`** | [`src/lib/minecraft-skin.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin.ts) | Untouched legacy procedural fallback. Operates identically as emergency backup. |
| **`sanitizeSkinDesign`** | [`src/lib/minecraft-skin.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin.ts) | Ensures all fields conform to Minecraft skin bounds and defaults. |
| **`safeExtractBlueprintDesign`** | [`src/lib/minecraft-skin-blueprint.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-blueprint.ts) | Sanitizes palette and prevents keyword hijacking. |
| **`deductCredits`** | [`src/lib/credits.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/credits.ts) | Safe, idempotent transactional debit engine. |
| **`uploadProcessedFile`** | [`src/lib/server/storage.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/server/storage.ts) | Supabase storage uploader. |
| **`Minecraft3DStudioViewer`** | [`src/components/tool/Minecraft3DStudioViewer.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/Minecraft3DStudioViewer.tsx) | Live Three.js 3D character viewer. |

---

## 4. Missing Functionality to Implement in v1.7

1. **Enhanced Semantic Extraction Layer**:
   - Explicit prompt instructions distinguishing PRIMARY CONCEPT, SECONDARY DETAILS, CLOTHING LAYERS, ACCESSORIES, COLORS, HAIR, FACE, FOOTWEAR, PATTERNS, EMBLEMS, and NEGATIVE CONSTRAINTS.
   - Guaranteed multi-tier garment preservation (no flattening bomber over hoodie over undershirt into single generic top).
   - Strict negative constraint safety preventing negative phrases from toggling positive flags.
2. **5 Curated Generation Style Presets**:
   - `Balanced` (Default): Harmonious gradients, natural anime-expressive face, standard lighting.
   - `Detailed`: High texture density, explicit accessories, rich shading clusters, micro-accents.
   - `Anime`: Expressive face, clean anime blocks, vibrant palette, prominent hair silhouette.
   - `Pixel Artist`: Artisanal pixel readability, high contour contrast, clean form shadows without noise.
   - `Minimal`: Flat minimalist aesthetic, simplified face, understated palette, clean placket.
   - Mapped to existing Blueprint parameters and Groq semantic instructions without rewriting the renderer.
3. **"Regenerate Variation" Action**:
   - Dedicated button and API flow.
   - Preserves prompt, concept, clothing, style.
   - Generates fresh composition seed and subtle parameter variation.
   - Charges standard generation credit once downstream.
4. **"Remix" Workflow**:
   - Dedicated remix action & modal/input in studio.
   - Accepts `parentDesign` + `remixInstruction`.
   - Uses Groq structured semantic transformation: applies requested modifications while preserving all other attributes.
   - Recompiles via Blueprint, stores lineage metadata (`parentGenerationId`, `remixInstruction`), charges standard generation credit downstream.
5. **Reference Image Prompt Precedence**:
   - Enforce: `EXPLICIT PROMPT > REFERENCE IMAGE > DEFAULTS`.
   - Remove aggressive `imagePalette` clobbering.
   - Allow prompt to override reference colors, hair, or clothing while retaining general likeness.
6. **Lineage & History Metadata Preservation**:
   - Store `originalPrompt`, `style`, `seed`, `armModel`, `renderer`, `aiDirected`, `referenceUsage`, `parentGenerationId`, `remixInstruction`, `isVariation`.

---

## 5. Files Requiring Modification

| File | Scope of Changes | Risk Level |
|---|---|:---:|
| [`src/app/api/tools/image/minecraft-skin/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/tools/image/minecraft-skin/route.ts) | 1. Expand `requestSchema` with `style` presets, `action` (`"generate" \| "variation" \| "remix"`), `parentDesign`, `parentGenerationId`, `remixInstruction`.<br>2. Upgrade `createAiDesign` system prompt & schema for strict prompt preservation, multi-layer garment rules, and negative constraints.<br>3. Add `remixAiDesign()` structured transformer.<br>4. Fix reference palette clobbering to respect prompt precedence.<br>5. Store lineage metadata in `prisma.userFile.metadata`. | **Medium** (Core API, must maintain downstream billing & fallback gates) |
| [`src/components/tool/MinecraftSkinMaker.tsx`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/components/tool/MinecraftSkinMaker.tsx) | 1. Update style selector to 5 presets: `Balanced`, `Detailed`, `Anime`, `Pixel Artist`, `Minimal`.<br>2. Add **[ 🎲 Regenerate Variation ]** button with credit cost indicator.<br>3. Add **[ 🪄 Remix Character ]** interactive input drawer/modal with preset prompt suggestions.<br>4. Wire lineage metadata and refresh states.<br>5. Preserve 0-credit instant style recompilation. | **Low-Medium** (UI & client state) |
| [`src/lib/minecraft-skin-blueprint.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-blueprint.ts) | Wire the `style` parameter in `compileMinecraftSkinBlueprint()` to adjust Blueprint composition parameters (e.g. lighting direction, asymmetry, cluster density, contour contrast) for the 5 presets, without refactoring the renderer architecture. | **Low** (Parametric tuning only, renderer architecture strictly preserved) |
| [`src/lib/history.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/history.ts) | Update `getReplayUrl()` to carry over `style`, `parentGenerationId`, and `design` if available. | **Very Low** |

---

## 6. Risks & Mitigation Plan

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Accidental Double-Billing on Remix / Variation** | User loses credits twice for single action | Credits are deducted strictly once at line 1054 downstream of successful compilation and upload. Pre-check verifies balance; unique UUID filename guarantees single debit. |
| **Negative Constraint Hallucination** | User types "no beard", AI outputs a beard | Explicit system prompt instruction: negative qualifiers must set flag to `false`/`"none"`, append to `negativeConstraints`, and never set positive boolean flags. |
| **Reference Overrides User Prompt** | User asks for white jacket on dark reference, receives black jacket | Deprecate blind `imagePalette` clobbering. Structured Groq Vision extraction resolves prompt precedence before palette assignment. |
| **Renderer Architecture Breakage** | Regression in UV or rendering quality | The Expanded Artist Blueprint Renderer is **locked and untouched**. Only parametric input values (style mappings, seeds, structured designs) are tuned. Procedural fallback remains 100% active. |
| **Groq TPM Rate Limiting on Rapid Variations** | Request hangs or returns 429 | Retry logic across all available Groq API keys with fallback to `safeExtractBlueprintDesign` variation using seed offset if Groq fails. |

---

## 7. Proposed Implementation Steps (Phase 2 Roadmap)

1. **Step 1 — Semantic Prompt Extraction & Negative Constraints**:
   - Enhance Groq extraction prompt with explicit layer hierarchy rules and strict negative constraint directives.
2. **Step 2 — Reference Image Precedence Fix**:
   - Refactor `extractImagePalette` / `createAiDesign` so prompt overrides reference colors.
3. **Step 3 — 5 Generation Style Presets**:
   - Implement `Balanced`, `Detailed`, `Anime`, `Pixel Artist`, `Minimal` in schema, UI, and Blueprint parameter mapper.
4. **Step 4 — Regenerate Variation Engine**:
   - Implement server action & client button to generate genuine visual variations while keeping identity and clothing intact.
5. **Step 5 — Controlled Remix Engine**:
   - Implement structured remix endpoint & UI modal allowing users to modify specific attributes without losing the rest of the character.
6. **Step 6 — History Metadata & Actions**:
   - Record parent generation ID, remix instructions, and style presets in userFile metadata.
7. **Step 7 — Comprehensive QA & Test Matrix**:
   - Execute 15-test matrix verifying prompt preservation, reference override, variation, remix, credit safety, and UV compliance.
