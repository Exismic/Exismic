import type { MinecraftSkinDesign, MinecraftArmModel, Face } from "./minecraft-skin";
import { shadeWithHueShift } from "./minecraft-skin";
import { sanitizeSkinPixelArt, type SkinArtRegion } from "./minecraft-skin-art-types";

type Color = [number, number, number];
const rgb = (hex: string): Color => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)) as Color;
const blend = (a: Color, b: Color, weight: number): Color => a.map((value, i) => Math.round(value + (b[i] - value) * weight)) as Color;
const distance = (a: Color, b: Color) => Math.hypot(...a.map((value, i) => value - b[i]));

export function skinArtFaces(model: MinecraftArmModel, outer = false): Record<SkinArtRegion, Face> {
  const faces = {} as Record<SkinArtRegion, Face>;
  const cube = (part: string, x: number, y: number, width: number, depth: number, height: number) => {
    const regions = {
      top: { x: x + depth, y, width, height: depth }, bottom: { x: x + depth + width, y, width, height: depth },
      right: { x, y: y + depth, width: depth, height }, front: { x: x + depth, y: y + depth, width, height },
      left: { x: x + depth + width, y: y + depth, width: depth, height }, back: { x: x + depth * 2 + width, y: y + depth, width, height },
    };
    for (const [plane, face] of Object.entries(regions)) faces[`${part}-${plane}` as SkinArtRegion] = face;
  };
  cube("head", outer ? 32 : 0, 0, 8, 8, 8);
  cube("torso", 16, outer ? 32 : 16, 8, 4, 12);
  cube("right-leg", 0, outer ? 32 : 16, 4, 4, 12);
  cube("left-leg", outer ? 0 : 16, 48, 4, 4, 12);
  cube("right-arm", 40, outer ? 32 : 16, model === "slim" ? 3 : 4, 4, 12);
  cube("left-arm", outer ? 48 : 32, 48, model === "slim" ? 3 : 4, 4, 12);
  return faces;
}

function paintContext(pixels: Uint8Array) {
  const put = (x: number, y: number, color: Color, alpha = 255) => {
    const offset = (y * 64 + x) * 4;
    pixels.set([...color, alpha], offset);
  };
  const get = (x: number, y: number): Color => Array.from(pixels.slice((y * 64 + x) * 4, (y * 64 + x) * 4 + 3)) as Color;
  const opaque = (x: number, y: number) => pixels[(y * 64 + x) * 4 + 3] === 255;
  const clear = (face: Face) => {
    for (let y = 0; y < face.height; y++) for (let x = 0; x < face.width; x++) put(face.x + x, face.y + y, [0, 0, 0], 0);
  };
  return { put, get, opaque, clear };
}

export function skinArtColors(design: MinecraftSkinDesign): Record<string, Color> {
  const p = design.palette;
  const ramp = (base: string, amount: number) => rgb(shadeWithHueShift(base, amount, "fabric"));
  return {
    K: rgb(p.skin), k: blend(rgb(p.skin), rgb(p.skinShade), 0.45), C: blend(rgb(p.skin), [255, 246, 225], 0.15), R: blend(rgb(p.skin), [180, 108, 108], 0.13),
    H: rgb(p.hair), h: rgb(p.hairHighlight), L: blend(rgb(p.hair), rgb(p.hairHighlight), 0.45), D: ramp(p.hair, -0.035),
    T: rgb(p.top), t: ramp(p.top, 0.04), S: ramp(p.top, -0.04), s: ramp(p.top, -0.07),
    A: rgb(p.topAccent), a: ramp(p.topAccent, 0.04), B: ramp(p.topAccent, -0.07),
    P: rgb(p.pants), p: ramp(p.pants, 0.05), Q: ramp(p.pants, -0.06),
    F: rgb(p.shoes), f: ramp(p.shoes, 0.04), g: ramp(p.shoes, -0.06),
    E: rgb(p.eyes), e: ramp(p.eyes, 0.06), W: [241, 240, 232], N: [22, 24, 30],
    X: rgb(p.detail), x: ramp(p.detail, 0.05), Y: ramp(p.detail, -0.05),
  };
}

function drawCharacterHead(pixels: Uint8Array, design: MinecraftSkinDesign, model: MinecraftArmModel) {
  const kind = design.characterType || "human";
  if (kind === "human") return;
  const { put, clear } = paintContext(pixels);
  const base = skinArtFaces(model), outer = skinArtFaces(model, true), colors = skinArtColors(design);
  const casing = kind === "tv" ? colors.H : colors.K;
  for (const [region, face] of Object.entries(base)) {
    if (!region.startsWith("head-")) continue;
    clear(outer[region as SkinArtRegion]);
    for (let y = 0; y < face.height; y++) for (let x = 0; x < face.width; x++) {
      const edge = x === 0 || x === 7 || y === 7;
      put(face.x + x, face.y + y, blend(casing, edge ? colors.N : colors.W, edge ? 0.10 : 0.035));
    }
  }
  const stamp = (region: SkinArtRegion, rows: string[], onOuter = false) => {
    const face = (onOuter ? outer : base)[region];
    rows.forEach((line, row) => [...line].forEach((token, col) => {
      if (colors[token]) put(face.x + col, face.y + row, colors[token]);
    }));
  };
  if (kind === "duck") {
    stamp("head-front", ["KKKCCKKK", "KKCCCCKK", "KKKKKKKK", "KWNKKNWK", "KNNKKNNK", "KAAAAAAK", "KABBBBAK", "KKAAAAKK"]);
    stamp("head-front", ["........", "........", "........", "........", "........", ".aaaaaa.", ".AAAAAA.", "..BBBB.."], true);
    // Nape color connects to the bill-side head without adding human hair.
    stamp("head-right", ["KKKKKKKK", "KKKCCKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKAA", "KKKKKAAA", "KKKKKKKK"]);
    stamp("head-left", ["KKKKKKKK", "KKKCCKKK", "KKKKKKKK", "KKKKKKKK", "KKKKKKKK", "AAKKKKKK", "AAAKKKKK", "KKKKKKKK"]);
  } else if (kind === "tv") {
    stamp("head-front", ["LLhhhhLL", "LDDDDDDL", "LDeeeeDL", "LDeEEEDL", "LDEEEEDL", "LDEEEEDL", "LDDDDDDL", "HHHXXHHH"]);
    stamp("head-front", [".hhhhhh.", "h......h", "h......h", "h......h", "h......h", "h......h", "h......h", ".HHHHHH."], true);
    stamp("head-back", ["HHHHHHHH", "HLLLLLLH", "HLDDDDLH", "HLDHHDLH", "HLDHHDLH", "HLDDDDLH", "HLLLLLLH", "HHHXXHHH"]);
    for (const region of ["head-right", "head-left"] as const) stamp(region, ["HHLLLLHH", "HHHHHHHH", "HDHDHDHH", "HHHHHHHH", "HDHDHDHH", "HHHHHHHH", "HHHHHHHH", "HHHXXHHH"]);
  } else if (kind === "robot") {
    stamp("head-front", ["CCCCCCCC", "kKKKKKKk", "kNNNNNNk", "kEeNNeEk", "kKKkkKKk", "kkXXXXkk", "kKYYYYKk", "kkkkkkkk"]);
    stamp("head-front", [".CCCCCC.", "........", "........", "........", "........", "........", "........", ".kkkkkk."], true);
    stamp("head-back", ["CCCCCCCC", "kKKKKKKk", "kKYYYYKk", "kKXXXXKk", "kKYYYYKk", "kKKKKKKk", "kKYYYYKk", "kkkkkkkk"]);
  } else if (kind === "creature" || kind === "cat") {
    stamp("head-front", kind === "cat" ? ["KCKKKKCK", "KKKKKKKK", "KKKKKKKK", "KWNKKNWK", "KKKKKKKK", "KKKRRKKK", "KKRKKRKK", "KKKKKKKK"]
      : ["KKKKKKKK", "KWWKKWWK", "KWEKKEWK", "KKKKKKKK", "KKKKKKKK", "KKXXXXKK", "KKKXXKKK", "KKKKKKKK"]);
    if (kind === "cat") stamp("head-top", [".C....C.", ".KK..KK.", ".kK..Kk.", "........", "........", "........", "........", "........"], true);
  }
}

function drawClothing(pixels: Uint8Array, design: MinecraftSkinDesign, seed: number, model: MinecraftArmModel) {
  const { put, get, opaque, clear } = paintContext(pixels);
  const colors = skinArtColors(design), top = colors.T;
  const fronts = skinArtFaces(model), overlays = skinArtFaces(model, true);
  const materialPixel = (color: Color) => distance(color, top) < 85 && distance(color, top) < distance(color, colors.K) && distance(color, top) < distance(color, colors.A);
  if (design.topPattern && design.topPattern !== "clean") {
    for (const outer of [false, true]) {
      const faces = outer ? overlays : fronts;
      for (const [region, face] of Object.entries(faces)) {
        if (!/^(torso|right-arm|left-arm)-/.test(region)) continue;
        const plane = region.split("-").at(-1);
        const wrapOffset = plane === "right" ? 0 : plane === "front" ? 4 : plane === "left" ? 12 : 16;
        for (let y = 0; y < face.height; y++) for (let x = 0; x < face.width; x++) {
          const color = get(face.x + x, face.y + y);
          if (!opaque(face.x + x, face.y + y) || !materialPixel(color)) continue;
          const horizontal = y % 4 === 1;
          const vertical = (x + wrapOffset) % 4 === 1;
          const weight = design.topPattern === "striped" ? (horizontal ? 0.55 : 0)
            : horizontal && vertical ? 0.65 : horizontal || vertical ? 0.32 : 0;
          if (weight) put(face.x + x, face.y + y, blend(color, horizontal && vertical ? colors.X : colors.A, weight));
          else if (design.topPattern === "plaid" && (x + wrapOffset) % 4 === 3) put(face.x + x, face.y + y, blend(color, colors.N, 0.15));
        }
      }
    }
  }
  const graphics: Record<string, string[]> = {
    skull: [".XXXX.", "XXXXXX", "X.XX.X", ".XXXX.", "..XX.."],
    heart: [".XX.XX", "XXXXXX", ".XXXX.", "..XX..", "......"],
    checker: ["XX..XX", "XX..XX", "..XX..", "..XX..", "XX..XX"],
    bolt: ["...XX.", "..XX..", ".XXXX.", "..XX..", ".XX..."],
  };
  const graphic = graphics[design.graphic || "none"];
  if (graphic) {
    for (const face of [fronts["torso-front"], overlays["torso-front"]]) {
      graphic.forEach((line, y) => [...line].forEach((token, x) => {
        if (token === "X") put(face.x + 1 + x, face.y + 3 + y, colors.X);
      }));
    }
  }
  if (design.pantsDetail === "ripped") {
    for (const [i, region] of (["right-leg-front", "left-leg-front"] as const).entries()) {
      const face = fronts[region], overlay = overlays[region], y = i === 0 ? 4 : 5;
      const width = 2 + ((seed + i) % 2);
      for (let x = 0; x < width; x++) {
        put(face.x + x, face.y + y, blend(colors.K, colors.N, 0.06));
        if (x < width - 1) put(face.x + x, face.y + y + 1, colors.K);
        put(face.x + x, face.y + y - 1, blend(colors.P, colors.W, 0.4));
      }
      clear({ x: overlay.x, y: overlay.y + y - 1, width, height: 3 });
    }
  } else if (design.pantsDetail === "patchwork") {
    const face = fronts["left-leg-front"], overlay = overlays["left-leg-front"];
    for (let y = 2; y <= 5; y++) for (let x = 1; x <= 3; x++) {
      const color = blend(colors.P, colors.A, y === 2 || y === 5 || x === 1 || x === 3 ? 0.3 : 0.6);
      put(face.x + x, face.y + y, color); put(overlay.x + x, overlay.y + y, color);
    }
  }
  if (design.outfit === "formal" || /\b(?:tie|tuxedo|suit)\b/i.test(design.description)) {
    const face = overlays["torso-front"];
    for (let y = 1; y < 8; y++) put(face.x + 3 + (y === 7 ? 1 : 0), face.y + y, y % 3 === 0 ? colors.B : colors.A);
  }
}

function drawGradient(pixels: Uint8Array, design: MinecraftSkinDesign, model: MinecraftArmModel, seed: number) {
  const { put, get, opaque } = paintContext(pixels), p = design.palette;
  const stops = [rgb(p.hair), rgb(p.topAccent), rgb(p.top), rgb(p.pants), rgb(p.shoes)];
  const human = !design.characterType || design.characterType === "human";
  const skin = rgb(p.skin), skinShade = rgb(p.skinShade);
  for (const outer of [false, true]) for (const [region, face] of Object.entries(skinArtFaces(model, outer))) {
    const head = region.startsWith("head-"), leg = region.includes("leg-");
    if (head && design.characterType !== "abstract") continue;
    const start = head ? 0 : leg ? 20 : 8, physicalHeight = head ? 8 : 12;
    const plane = region.split("-").at(-1);
    for (let y = 0; y < face.height; y++) for (let x = 0; x < face.width; x++) {
      if (!opaque(face.x + x, face.y + y)) continue;
      // Ordinary humans retain their face, hair, hands, and footwear.
      const current = get(face.x + x, face.y + y);
      const bareSkin = Math.min(distance(current, skin), distance(current, skinShade)) < 45;
      if (human && (bareSkin || (!leg && y >= 10) || (leg && y >= 8))) continue;
      const position = Math.min(3.999, ((start + (plane === "top" ? 0 : plane === "bottom" ? physicalHeight - 1 : y)) / 31) * 4);
      const color = blend(stops[Math.floor(position)], stops[Math.floor(position) + 1], position % 1);
      put(face.x + x, face.y + y, plane === "left" ? blend(color, [38, 32, 56], 0.08) : color);
    }
    if (plane === "front" || plane === "back") {
      // A few connected glint clusters, rather than per-pixel random noise.
      for (const [x, y] of [[1 + (seed % 2), 2], [face.width - 2, head ? 5 : 8]]) {
        if (human && ((!leg && y >= 10) || (leg && y >= 8))) continue;
        if (x >= 0 && x < face.width && y < face.height && opaque(face.x + x, face.y + y)) {
          const current = get(face.x + x, face.y + y);
          if (human && Math.min(distance(current, skin), distance(current, skinShade)) < 45) continue;
          put(face.x + x, face.y + y, blend(current, [255, 248, 228], 0.6));
        }
      }
    }
  }
}

export function applySkinPixelArt(pixels: Uint8Array, design: MinecraftSkinDesign, model: MinecraftArmModel): number {
  const { put } = paintContext(pixels), colors = skinArtColors(design);
  let painted = 0;
  for (const art of sanitizeSkinPixelArt(design.pixelArt, design.characterType || "human")) {
    const face = skinArtFaces(model, art.layer === "outer")[art.region];
    art.rows.forEach((line, y) => {
      for (let x = 0; x < face.width; x++) {
        const sourceX = line.length === face.width ? x : Math.min(line.length - 1, Math.floor((x + 0.5) * line.length / face.width));
        const token = line[sourceX];
        if (token === "." || !colors[token]) continue;
        // Human eye and mouth controls remain editable after AI surface painting.
        if ((design.characterType || "human") === "human" && art.region === "head-front" && (((y === 3 || y === 4) && x >= 1 && x <= 6) || (y === 6 && x >= 2 && x <= 5))) continue;
        if ((design.characterType || "human") === "human" && art.region === "head-front" && art.layer === "outer" && !"HhLD".includes(token)) continue;
        if ((design.characterType || "human") === "human" && art.region === "head-front" && art.layer === "outer" && y >= 3 && x >= 1 && x <= 6) continue;
        put(face.x + x, face.y + y, colors[token]); painted++;
      }
    });
  }
  return painted;
}

export function paintAdvancedMinecraftSkin(pixels: Uint8Array, design: MinecraftSkinDesign, seed: number, model: MinecraftArmModel) {
  drawClothing(pixels, design, seed, model);
  drawCharacterHead(pixels, design, model);
  if (design.colorTreatment === "gradient") drawGradient(pixels, design, model, seed);
  applySkinPixelArt(pixels, design, model);
}
