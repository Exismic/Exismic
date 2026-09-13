# v1.7 Hotfix Walkthrough — Facial Hair Remix Contract

## Executive Summary

We diagnosed and resolved the end-to-end failure where remixing a Minecraft character with instructions like **"remove facial hair"**, **"no beard"**, or **"clean shaven"** resulted in zero visible face changes.

This was isolated to three distinct architectural layers:
1. **Remix Intent Parsing Layer (`mergeRemixDesign`)**: `"facial hair"` was misclassified as head-hair because `mentionsHair` matched `"hair"`, while `mentionsFace` lacked `"facial"`. Consequently, facial hair modifications were clamped back to the parent design.
2. **Artist Blueprint Renderer Layer (`compileMinecraftSkinBlueprint`)**: `design.facialHair` was never consumed or stamped on the 64×64 skin canvas.
3. **Face Blueprint Construction Layer (`generateFaceBlueprint`)**: `masculine-angular` and `mature-minimal` had hardcoded `"dddddddd"` chin shadow across all 8 pixels, creating a persistent chin-strap/beard appearance even when clean-shaven. Furthermore, cheek blush defaulted to `#fb7185` (hot pink), which resembled red warpaint or facial marks on masculine/warrior skins.

All three root causes have been resolved with surgical precision. The legacy procedural renderer remains completely untouched, no credit or billing schemas were altered, and no procedural speckling or random noise was introduced.

---

## Exact Files Changed

| File | Purpose of Modification |
| :--- | :--- |
| [`src/lib/minecraft-skin-control.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-control.ts) | Strip `"facial hair"` from head-hair regex; detect `mentionsFacialHair` independently; handle removal words (`remove`, `no`, `without`, `clean-shaven`) setting `facialHair="none"`; clamp unmentioned face/hair attributes to parent. |
| [`src/lib/minecraft-skin-blueprint-hair.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-blueprint-hair.ts) | In `generateFaceBlueprint`, changed row 7 of `masculine-angular` and `mature-minimal` from `"dddddddd"` to `"dKKKKKKd"`, ensuring clean-shaven faces have a clean skin chin with corner jaw definition. |
| [`src/lib/minecraft-skin-blueprint.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-blueprint.ts) | Consumes `design.facialHair` with deliberate pixel clusters for `none`, `stubble`, `short-beard`, and `goatee`. Softened cheek blush `r` from garish `#fb7185` to subtle skin-harmonized subsurface flush (`shadeWithHueShift(baseHex, -0.07, "skin")`). Strictly enforced negative constraints in `safeExtractBlueprintDesign`. |
| [`src/app/api/tools/image/minecraft-skin/route.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/app/api/tools/image/minecraft-skin/route.ts) | Added explicit prompt directive in `remixAiDesign` instructing Groq to map facial hair modifications to `facialHair` without touching head hair, skin, or clothing. |

---

## Root Causes & Architectural Fixes

### 1. Remix Intent Separation
- **Before**: `mentionsHair = /\b(hair|...)\b/i.test("remove facial hair")` $\to$ **true**. `mentionsFace = /\b(face|...)\b/i.test("remove facial hair")` $\to$ **false**. `merged.facialHair` was forcibly clamped to `parent.facialHair`.
- **Fix**: We strip `\bfacial[- ]hair\b` from the instruction string before evaluating head-hair. We added a dedicated `mentionsFacialHair` matcher and isolated eye, mouth, facial hair, and general face fields so modifying facial hair cannot mutate or reset eyes, mouth, face structure, or head hair.

### 2. Visually Effective `facialHair` Implementation
- **Before**: `compileMinecraftSkinBlueprint` ignored `design.facialHair` completely.
- **Fix**: Step 5b in `compileMinecraftSkinBlueprint` renders deliberate pixel art clusters:
  - **`none`**: Zero facial hair pixels drawn. Chin remains clean base skin.
  - **`stubble`**: Subtle, non-procedural 5 o'clock shadow using harmonized skin shadow tone (`shadeWithHueShift(skinRamp.base, -0.16, "skin")`) on chin anchors `(10..13, 15)`, outer jaw `(9, 14)` & `(14, 14)`, and philtrum `(11..12, 13)`.
  - **`short-beard`**: Full trimmed beard in `hairRamp.base` across chin row 7 `(8..15, 15)`, sideburns at row 5 & 6, cheek frame at row 6, and neat mustache at row 5 `(10..13, 13)` while preserving the mouth at row 6 `(11..12, 14)`.
  - **`goatee`**: Centered mustache `(10..13, 13)`, soul patch connectors `(10, 14)` and `(13, 14)`, and chin block `(10..13, 15)`. Outer jaw and cheeks `(8..9)` and `(14..15)` remain 100% clean skin.

### 3. Decoupled Blush & Chin Shading
- **Before**: `masculine-angular` stamped row 7 as `"dddddddd"` (deep shadow on every pixel of the chin), making every masculine skin look like it had a chin strap. Token `r` defaulted to `#fb7185` (neon hot pink).
- **Fix**: Row 7 is now `"dKKKKKKd"` (corners are deep jaw shadow `d`, center 6 pixels are clean skin `K`). Token `r` defaults to a subtle natural peach subsurface flush (`shadeWithHueShift(skinRamp.base, -0.07, "skin")`), ensuring clean-shaven faces are clean of any beard-like markings.

---

## Before & After Face Matrix Comparison

### Head Front Face Layout (`x: 8..15, y: 8..15`)

#### Masculine Angular Face Blueprint (`faceBp`)

```
Row 0 (y=8):   K K K K K K K K  (Forehead base skin)
Row 1 (y=9):   B B B B B B B B  (Focused masculine brows)
Row 2 (y=10):  s b b . . b b s  (Upper eye crease & shadow)
Row 3 (y=11):  w * E . . E * w  (Focused 2x1 eyes)
Row 4 (y=12):  s . . k k . . s  (Nose bridge highlight)
Row 5 (y=13):  s . . k k . . s  (Philtrum / upper lip)
Row 6 (y=14):  K K K l l K K K  (Normal mouth lips 'l' at center)
```

**Row 7 (y=15, Chin):**
- **BEFORE (Buggy)**:
  `d d d d d d d d` *(All 8 pixels deep dark shadow — simulated chin strap beard)*
- **AFTER (Hotfix)**:
  `d K K K K K K d` *(Corners 0 & 7 are jaw definition; center 1..6 are clean base skin!)*

#### Applied Facial Hair Overlay Layers

| State | Chin Row 7 (`y=15`) | Mouth Row 6 (`y=14`) | Mustache Row 5 (`y=13`) | Cheeks / Outer Jaw |
| :--- | :--- | :--- | :--- | :--- |
| **`none`** | `d K K K K K K d` (Clean skin) | `K K K l l K K K` (Normal mouth) | `s . . k k . . s` (Clean philtrum) | 100% clean skin |
| **`stubble`** | 4-px center stubble anchor | Mouth preserved; jaw accents | Subtle upper-lip stubble | Clean cheeks |
| **`short-beard`** | Full 8-px beard mass in hair color | Beard cheeks; mouth framed | Neat mustache & sideburn connection | Full beard wrap |
| **`goatee`** | 4-px center goatee block in hair color | Goatee side brackets; mouth open | Centered goatee mustache | **100% clean skin** |

---

## Verification Test Results

We executed the comprehensive test suite (`scripts/verify-v17-facial-hair-hotfix.ts`):

```
===============================================================
   v1.7 HOTFIX — FACIAL HAIR REMIX CONTRACT VERIFICATION
===============================================================
[✅ PASS] Test A: Remix 'no facial hair'
       Details: facialHair='none', head hair strictly preserved, chin is clean skin (#ebccb7), face pixel diff = 20 pixels changed.
[✅ PASS] Test B: Remix 'remove beard'
       Details: facialHair='none', chin is clean skin (#dfa081), face pixel diff = 20 pixels.
[✅ PASS] Test C: Remix 'clean shaven'
       Details: facialHair='none', chin is clean skin (#ebccb7), mouth and facial features preserved.
[✅ PASS] Test D: Remix 'no beard, no glasses'
       Details: facialHair='none', glasses=false, chin clean skin (#ebccb7), clothing preserved.
[✅ PASS] Test E: Positive state 'short beard'
       Details: facialHair='short-beard', mustache & chin beard verified in hair tone (#262626), face diff = 20 pixels.
[✅ PASS] Test F: Positive state 'goatee'
       Details: facialHair='goatee', center chin has hair (#262626), cheeks/outer jaw are clean skin (#ebccb7), face diff = 10 pixels.
[✅ PASS] Test G: Anime top-color remix regression test
       Details: Top changed to #3b82f6, skin, hair, facialHair=none, and silhouette 100% preserved.
[✅ PASS] Test H: Variation workflow regression test
       Details: Compiled successfully for both Classic (4px) and Slim (3px) models with valid 64x64 RGBA buffers.
[✅ PASS] Test I: Exact user prompt test ('no beard, not a helmet, no glasses')
       Details: Extracted facialHair='none', glasses=false, chin is clean skin (#ebccb7), mouth and facial features intact.
[✅ PASS] Test J: Legacy procedural fallback intact
       Details: compileMinecraftSkin executed without error, returned 64x64 RGBA buffer.
===============================================================
```

### Full System Regression Suite
We additionally executed `scripts/verify-v17-generation-control.ts` covering presets, variation identity, billing, reference image prompt override, and UV dead zones:
**16 / 16 Passed (100%)**.

### TypeScript Validation
```bash
npx tsc --noEmit
# Exit code: 0 (Zero errors)
```

---

## Exact Pixel-Diff Results

### Parent Samurai (with Short Beard) $\to$ Remix "no facial hair" (Clean Shaven)
- **Face Area Evaluated**: Head Front Base `(x: 8..15, y: 8..15)`
- **Total Pixels Changed**: **20 pixels**
- **Detailed Pixel Breakdown**:
  - `(8, 13)` & `(15, 13)`: Beard sideburn anchors removed $\to$ restored to cheek contour skin tone.
  - `(10, 13)` & `(13, 13)`: Mustache outer edge removed $\to$ restored to clean skin.
  - `(11, 13)` & `(12, 13)`: Mustache center (`#262626`) removed $\to$ restored to clean skin (`#ebccb7`).
  - `(8, 14)`, `(9, 14)`, `(14, 14)`, `(15, 14)`: Cheeks beard mass removed $\to$ restored to clean skin.
  - `(10, 14)` & `(13, 14)`: Mouth framing beard shadow removed $\to$ restored to clean skin.
  - `(8..15, 15)`: Entire 8-pixel chin beard mass removed $\to$ restored to clean skin chin base (`#ebccb7` on illuminated side, `#dfa081` on shadow side) with jaw definition corners `(8, 15)` and `(15, 15)`.
- **Mouth & Lip Line**: Center mouth pixels `(11, 14)` and `(12, 14)` remain perfectly intact.
- **Unrelated Fields**: Midnight robes, hair silhouette, katana traits, and pants remained 100% identical.

---

## Remaining Scope Limitations

1. **3D Outer Layer Beard Geometry**: Facial hair clusters are currently rendered on the base head layer (`x: 8..15, y: 8..15`). If a user requests a giant 3D dwarf beard protruding from the outer head layer (`x: 40..47, y: 8..15`), this is treated as a 2D cluster on the base layer to avoid colliding with outer hoods or collars.
2. **Preset-Level Facial Hair Independence**: Facial hair remains an independent orthogonal property from style presets (`balanced`, `anime`, `minimal`, etc.). Style presets alter shader contrast, asymmetry, and palettes, but do not override the user's explicit `facialHair` setting.
