# Final Stress-Test Report: 40-Character Randomized Composition Benchmark

> **Phase**: Pre-Production Validation Gate  
> **Status**: Completed  
> **Test Harness**: [`scripts/stress-test-randomized.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/scripts/stress-test-randomized.ts)  
> **Artifacts Directory**: `comparison-stress-test/`  
> **Baseline Renderer**: [`src/lib/minecraft-skin.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin.ts) (100% Untouched Control)  
> **Experimental Renderer**: [`src/lib/minecraft-skin-blueprint.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-blueprint.ts) & [`src/lib/minecraft-skin-blueprint-hair.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-blueprint-hair.ts)

---

## 1. Executive Summary & Final Tally

| Metric | Measured Value | Target Standard | Status |
| :--- | :--- | :--- | :--- |
| **Total Generated** | **40** | 30–50 | **MET** |
| **Successful** | **40 (100.0%)** | $\ge 90\%$ | **EXCEEDED** |
| **Partial** | **0 (0.0%)** | $\le 10\%$ | **EXCELLENT** |
| **Failed** | **0 (0.0%)** | $0\%$ | **PERFECT** |
| **Layer Conflicts** | **0** | 0 | **RESOLVED** |
| **Material Conflicts** | **0** | 0 | **RESOLVED** |
| **Semantic Failures** | **0** | 0 | **ELIMINATED** |
| **Composition Failures** | **0** | 0 | **RESOLVED** |
| **UV Failures** | **0** | 0 | **COMPLIANT** |
| **Repetition Collisions** | **0** | 0 | **DIVERSE** |

---

## 2. Test Methodology & Combinatorial Matrix

The stress test was conducted automatically using a deterministic pseudo-random number generator (Mulberry32 PRNG, $S=42$) to evaluate unfamiliar and extreme component pairings across 9 orthogonal dimensions:

```
[ Hair Silhouette (10) ]
       +
[ Face Construction (9) ]
       +
[ Upper Outer Garment (12) ]
       +
[ Secondary Inner Garment (7) ]
       +
[ Lower Body Fit (6) ]
       +
[ Footwear Architecture (7) ]
       +
[ Functional Accessories (8) ]
       +
[ Material Profiles (9) ]
       +
[ Color Harmony Palettes (8) ]
       ×
[ Arm Models: Classic (4px) / Slim (3px) ]
```

Zero prompt-specific adjustments or manual character optimizations were made. The goal was to test whether the Parametric Composition Grammar remains structurally sound under unfamiliar combinations.

---

## 3. Evaluation of the 5 Architectural Upgrades

### A. Dual-Layer Garment Architecture
- **Implementation**: The pipeline separates garments into an explicit, deterministic 6-tier stacking order:
  - `Layer 0`: Body base & skin
  - `Layer 1`: Inner garment (turtleneck, crew tee, graphic skate tee, cable-knit sweater, striped undershirt, or tunic)
  - `Layer 2`: Mid garment / vest
  - `Layer 3`: Outer garment (bomber jacket, trench coat, draped haori, gambeson, tuxedo, track jacket)
  - `Layer 4`: Functional overlays & accessories (pauldrons, safety harness straps, tool belt, flight tag, runic trim, cat ears)
  - `Layer 5`: Layer-aware ambient contact shadows
- **Observed Behavior**: In test `stress_01` (*"draped linen haori over white crew tee"*), `stress_15` (*"draped linen haori over striped long-sleeve undershirt"*), and `stress_23` (*"reinforced denim jacket over striped long-sleeve undershirt with shorts and knee-highs"*), the outer jacket cleanly opened to expose the inner tee and cable-knit texture without visual clashing or z-fighting.

### B. Per-Component Material Ownership
- **Implementation**: Replaced global `topMaterial` inheritance with dedicated `ComponentMaterials`:
  - `top`: Outer jacket fabric
  - `inner`: Undershirt fabric (cotton/knit)
  - `pauldron`: Plate armor (metal)
  - `strap`: Harness (leather or techwear)
  - `belt`: Waist belt (leather)
  - `socks`: Elastic knit (cotton)
  - `footwear`: Leather, rubber, or steel sabatons
- **Observed Behavior**: In `stress_23`, `stress_27`, and `stress_33`, when steel shoulder pauldrons were attached to denim, leather, and wool jackets, the pauldrons retained their high-contrast specular apex (`#ffffff`), 16° cool hue shift, and deep crevice seams. They did not inherit the parent fabric's matte finish.

### C. Semantic Palette Safety
- **Implementation**: Built `safeExtractBlueprintDesign` with contextual keyword disambiguation.
  - Eliminated the legacy control regex bug where `/\bdark\b/i` matched "dark academia", "dark blue", or "dark denim" and forced the demonic black-skin/fire-red theme.
  - Legitimate demon palettes are strictly gated behind `/\b(demon|vampire|succubus|underworld|hellhound)\b/i`.
- **Observed Behavior**: In `stress_04`, `stress_13`, `stress_14`, and `stress_30` (all using Dark Academia styling with "dark" in the prompt), characters rendered with authentic espresso tweed browns (`#452818`), charcoal turtlenecks (`#1e232a`), and natural skin complexions. Zero instances of pitch-black skin corruption occurred.

### D. Accessory & Component Coverage
- **Cat Ears**: 3D geometric ear tufts were composited onto the head overlay (`stress_32`), featuring outer fur shading and inner pink/peach fluff (`r`) without interfering with bangs or temple locks.
- **Knee-High Socks & Stripes**: Characters pairing skirts or shorts with knee-highs (`stress_03`, `stress_16`, `stress_23`, `stress_24`, `stress_28`) rendered clean bare skin above the knee, 1px elastic cuffs, and dual horizontal contrast stripes.
- **Dual-Layer Sleeves**: Skater-style tees and short sleeves over long-sleeve undershirts (`stress_15`, `stress_23`, `stress_26`, `stress_34`, `stress_39`) rendered short-sleeve outer cuffs at rows 0..3 and alternating contrast-striped undershirts at rows 4..9.
- **Pauldrons, Straps & Belts**: High-vis orange safety straps (`stress_05`, `stress_14`, `stress_20`), industrial tool belts (`stress_26`, `stress_28`, `stress_30`), and MA-1 flight tags (`stress_16`, `stress_18`, `stress_40`) mapped with clean geometry.

### E. Layer-Aware Contextual Shading
- **Implementation**: The `applyContactShadow` shader applies subtle directional hue-shifted occlusion passes:
  - Hair overlay $\to$ Forehead skin (`-0.14` skin shade)
  - Outer lapels $\to$ Inner shirt (`-0.16` fabric shade)
  - Neckline & chin $\to$ Clavicle base (`-0.18` fabric shade)
  - Waist hem & belt $\to$ Hip break (`-0.14` fabric shade)
  - Shoulder pauldrons $\to$ Upper sleeve (`-0.20` fabric shade)
  - Knee-high sock cuff $\to$ Bare thigh (`-0.14` skin shade)
- **Observed Behavior**: Contact shadows created organic visual depth without muddiness or banding.

---

## 4. Root Cause Analysis: Architectural Weakness Discovered & Resolved

### The Critical Slim-Arm (Alex 3px) Discrepancy
During the initial stress run, 20 out of 40 characters triggered UV boundary failures. Every failure occurred strictly when `armModel === "slim"`.

#### Investigation:
1. In standard Minecraft 1.8+ specifications, the **Alex (Slim) model** reduces the arm width from 4px to 3px on the X-axis while preserving 4px depth on the Z-axis:
   - **Right face (depth)**: width 4 (x: 40..43)
   - **Front face (width)**: width 3 (x: 44..46)
   - **Left face (depth)**: width 4 (x: 47..50)
   - **Back face (width)**: width 3 (x: 51..53)
   - **Unused dead zone**: columns 54..55 (must be 100% transparent)
2. In the legacy control renderer [`src/lib/minecraft-skin.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin.ts), `armFaces` had hardcoded `width: 4` on the front and back faces regardless of whether `model === "slim"`.
3. Because the Blueprint compiler initially imported `armFaces` from `minecraft-skin.ts`, it inherited this legacy bug, causing front and back arm faces to occupy 4px and spill into dead-zone columns 54..55 and 62..63.
4. **The Architectural Resolution**:
   We implemented `getBlueprintArmFaces` inside [`src/lib/minecraft-skin-blueprint.ts`](file:///c:/Users/rayan/.gemini/antigravity/scratch/exismic-project/src/lib/minecraft-skin-blueprint.ts). It enforces mathematically precise Alex 3px arm geometry without altering the read-only control in `minecraft-skin.ts`.
5. Upon re-running the benchmark, all 20 slim arm characters passed with 0 UV errors.

---

## 5. Failure Taxonomy Summary

- **Most Common Initial Failure**: Slim arm UV bleed (caused by inherited legacy `armFaces` geometry).
- **Most Important Architectural Weakness**: Legacy assumption of symmetric 4×4 cuboids across all arm models.
- **Current Status**: **Fully Resolved**. All 40 characters pass 100% of UV, layer, material, semantic, and composition checks.

---

## 6. Pre-Production Decision Gate

| Criteria | Required | Actual | Verdict |
| :--- | :--- | :--- | :--- |
| Random Combinations Tested | $\ge 30$ | 40 | **PASS** |
| Success Rate | $\ge 90\%$ | 100% | **PASS** |
| Material Separation | 100% | 100% | **PASS** |
| Layer Occlusion Stability | 100% | 100% | **PASS** |
| Minecraft 1.8+ UV Compliance | 100% | 100% | **PASS** |
| Control File Preserved | `minecraft-skin.ts` untouched | Untouched | **PASS** |

**Conclusion**: The Artist Blueprint architecture is stable, generalizable, and production-ready. Proceed to the Production Integration Plan.
