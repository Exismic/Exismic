export type TokenMatrix = string[];

export interface HairBlueprintParams {
  silhouette: string;
  partOffset: number; // -1 (left) to 1 (right)
  asymmetry: number; // 0 to 1
  length: number; // 0 to 1
  seed: number;
  accessories?: {
    catEars?: boolean;
    horns?: boolean;
    headband?: boolean;
    headphones?: boolean;
  };
}

export interface HairBlueprint {
  front: TokenMatrix;
  top: TokenMatrix;
  right: TokenMatrix;
  left: TokenMatrix;
  back: TokenMatrix;
}

function setToken(matrix: TokenMatrix, row: number, col: number, token: string): TokenMatrix {
  if (row < 0 || row >= matrix.length) return matrix;
  const line = matrix[row];
  if (col < 0 || col >= line.length) return matrix;
  const copy = [...matrix];
  copy[row] = line.slice(0, col) + token + line.slice(col + 1);
  return copy;
}

export function applyHairAccessories(
  bp: HairBlueprint,
  accessories?: HairBlueprintParams["accessories"]
): HairBlueprint {
  if (!accessories) return bp;
  let res: HairBlueprint = {
    front: [...bp.front],
    top: [...bp.top],
    right: [...bp.right],
    left: [...bp.left],
    back: [...bp.back],
  };

  // 1. Cat Ears Primitive (3D faceted ear geometry on head overlay)
  if (accessories.catEars) {
    // Top face of head: ear apex tips at (1, 0), (6, 0) and bases at rows 1..2
    res.top = setToken(res.top, 0, 1, "h");
    res.top = setToken(res.top, 0, 6, "h");
    res.top = setToken(res.top, 1, 1, "H");
    res.top = setToken(res.top, 1, 2, "h");
    res.top = setToken(res.top, 1, 5, "h");
    res.top = setToken(res.top, 1, 6, "H");
    res.top = setToken(res.top, 2, 1, "S");
    res.top = setToken(res.top, 2, 2, "H");
    res.top = setToken(res.top, 2, 5, "H");
    res.top = setToken(res.top, 2, 6, "S");

    // Front face: ear upright tips & inner pink fluff 'r'
    res.front = setToken(res.front, 0, 1, "h");
    res.front = setToken(res.front, 0, 6, "h");
    res.front = setToken(res.front, 1, 1, "H");
    res.front = setToken(res.front, 1, 2, "r");
    res.front = setToken(res.front, 1, 5, "r");
    res.front = setToken(res.front, 1, 6, "H");

    // Back face: ear back fur & shadow
    res.back = setToken(res.back, 0, 1, "H");
    res.back = setToken(res.back, 0, 6, "H");
    res.back = setToken(res.back, 1, 1, "S");
    res.back = setToken(res.back, 1, 2, "H");
    res.back = setToken(res.back, 1, 5, "H");
    res.back = setToken(res.back, 1, 6, "S");
  }

  // 2. Headband Primitive
  if (accessories.headband) {
    for (let c = 0; c < 8; c++) {
      res.front = setToken(res.front, 1, c, "A");
      res.right = setToken(res.right, 1, c, "A");
      res.back = setToken(res.back, 1, c, "A");
      res.left = setToken(res.left, 1, c, "A");
    }
  }

  // 3. Horns Primitive
  if (accessories.horns) {
    res.front = setToken(res.front, 0, 1, "*");
    res.front = setToken(res.front, 0, 6, "*");
    res.front = setToken(res.front, 1, 0, "*");
    res.front = setToken(res.front, 1, 7, "*");
    res.top = setToken(res.top, 1, 1, "*");
    res.top = setToken(res.top, 1, 6, "*");
  }

  // 4. Over-Ear Headphones Primitive (Streetwear & Gaming Headset)
  if (accessories.headphones) {
    // Top face: Headband arching across the crown (row 3) connecting directly to side ear cups
    for (let c = 1; c <= 6; c++) {
      res.top = setToken(res.top, 3, c, "C");
    }
    res.top = setToken(res.top, 3, 0, "A");
    res.top = setToken(res.top, 3, 7, "A");
    res.top = setToken(res.top, 2, 2, "c");
    res.top = setToken(res.top, 2, 3, "C");
    res.top = setToken(res.top, 2, 4, "C");
    res.top = setToken(res.top, 2, 5, "c");

    // Right face (Overlay x: 32..39, y: 8..15): Headband slider + 3D ear cup
    res.right = setToken(res.right, 0, 3, "C");
    res.right = setToken(res.right, 0, 4, "A");
    res.right = setToken(res.right, 1, 3, "C");
    res.right = setToken(res.right, 1, 4, "A");
    // Right Ear Cup (rows 2..5, centered at cols 3..4 over the base ear)
    res.right = setToken(res.right, 2, 3, "C");
    res.right = setToken(res.right, 2, 4, "C");
    res.right = setToken(res.right, 2, 2, "A");
    res.right = setToken(res.right, 2, 5, "A");
    res.right = setToken(res.right, 3, 2, "C");
    res.right = setToken(res.right, 3, 3, "c");
    res.right = setToken(res.right, 3, 4, "c");
    res.right = setToken(res.right, 3, 5, "C");
    res.right = setToken(res.right, 4, 2, "C");
    res.right = setToken(res.right, 4, 3, "c");
    res.right = setToken(res.right, 4, 4, "c");
    res.right = setToken(res.right, 4, 5, "C");
    res.right = setToken(res.right, 5, 3, "C");
    res.right = setToken(res.right, 5, 4, "C");
    res.right = setToken(res.right, 5, 2, "A");
    res.right = setToken(res.right, 5, 5, "A");

    // Left face (Overlay x: 48..55, y: 8..15): Headband slider + 3D ear cup
    res.left = setToken(res.left, 0, 3, "A");
    res.left = setToken(res.left, 0, 4, "C");
    res.left = setToken(res.left, 1, 3, "A");
    res.left = setToken(res.left, 1, 4, "C");
    // Left Ear Cup (rows 2..5, centered at cols 3..4 over the base ear)
    res.left = setToken(res.left, 2, 3, "C");
    res.left = setToken(res.left, 2, 4, "C");
    res.left = setToken(res.left, 2, 2, "A");
    res.left = setToken(res.left, 2, 5, "A");
    res.left = setToken(res.left, 3, 2, "C");
    res.left = setToken(res.left, 3, 3, "c");
    res.left = setToken(res.left, 3, 4, "c");
    res.left = setToken(res.left, 3, 5, "C");
    res.left = setToken(res.left, 4, 2, "C");
    res.left = setToken(res.left, 4, 3, "c");
    res.left = setToken(res.left, 4, 4, "c");
    res.left = setToken(res.left, 4, 5, "C");
    res.left = setToken(res.left, 5, 3, "C");
    res.left = setToken(res.left, 5, 4, "C");
    res.left = setToken(res.left, 5, 2, "A");
    res.left = setToken(res.left, 5, 5, "A");
  }

  return res;
}

/**
 * Hair Blueprint Generator
 * Produces directional cluster matrices for Head Overlay (Front 8x8, Top 8x8, Left 8x8, Right 8x8, Back 8x8)
 * Tokens:
 *   . = Transparent / negative space
 *   D = Deep root / parting shadow
 *   S = Form shadow cluster
 *   H = Hair base mass
 *   L = Midtone light cluster
 *   h = Highlight sheen cluster
 *   * = Specular glint / horn apex
 *   r = Inner ear fluff / blush
 *   A = Accessory accent (headband)
 */
export function generateHairBlueprint(params: HairBlueprintParams): HairBlueprint {
  const base = generateBaseHairBlueprint(params);
  const varied = applySeedHairVariation(base, params);
  return applyHairAccessories(varied, params.accessories);
}

function applySeedHairVariation(base: HairBlueprint, params: HairBlueprintParams): HairBlueprint {
  const seed = params.seed || 12345;
  const top = [...base.top];
  const front = [...base.front];
  const right = [...base.right];
  const left = [...base.left];
  const back = [...base.back];

  const setChar = (matrix: string[], r: number, c: number, ch: string) => {
    if (r < 0 || r >= matrix.length || c < 0 || c >= 8) return;
    const row = matrix[r];
    matrix[r] = row.slice(0, c) + ch + row.slice(c + 1);
  };

  const getChar = (matrix: string[], r: number, c: number) => {
    if (r < 0 || r >= matrix.length || c < 0 || c >= 8) return ".";
    return matrix[r][c];
  };

  // 1. Crown Sheen Shift on top face (Rows 1..4)
  const sheenShift = ((seed % 3) - 1); // -1, 0, +1
  if (sheenShift !== 0) {
    for (let r = 1; r <= 4; r++) {
      const row = top[r];
      if (sheenShift === 1 && row[6] !== "L" && row[6] !== "h" && row[7] !== "L") {
        let newRow = row[0];
        for (let c = 1; c <= 6; c++) {
          newRow += (row[c - 1] === "L" || row[c - 1] === "h") ? row[c - 1] : (row[c] === "L" || row[c] === "h" ? "H" : row[c]);
        }
        newRow += row[7];
        top[r] = newRow;
      } else if (sheenShift === -1 && row[1] !== "L" && row[1] !== "h" && row[0] !== "L") {
        let newRow = row[0];
        for (let c = 1; c <= 6; c++) {
          newRow += (row[c + 1] === "L" || row[c + 1] === "h") ? row[c + 1] : (row[c] === "L" || row[c] === "h" ? "H" : row[c]);
        }
        newRow += row[7];
        top[r] = newRow;
      }
    }
  }

  // 2. Front Fringe & Bang Strand Variation (Rows 1..3 only - Rows 4..7 are untouched for face/eyes!)
  const frontVariant = Math.abs(seed) % 5;
  if (frontVariant === 1) {
    // Left-leaning fringe flow
    if (getChar(front, 2, 2) === "H") setChar(front, 2, 2, "h");
    if (getChar(front, 1, 3) === "H") setChar(front, 1, 3, "L");
    if (getChar(front, 3, 0) === ".") setChar(front, 3, 0, "H");
  } else if (frontVariant === 2) {
    // Right-leaning fringe flow
    if (getChar(front, 2, 5) === "H") setChar(front, 2, 5, "h");
    if (getChar(front, 1, 4) === "H") setChar(front, 1, 4, "L");
    if (getChar(front, 3, 7) === ".") setChar(front, 3, 7, "H");
  } else if (frontVariant === 3) {
    // Micro-parted textured bangs
    if (getChar(front, 1, 2) === "H") setChar(front, 1, 2, "h");
    if (getChar(front, 1, 5) === "H") setChar(front, 1, 5, "h");
    if (getChar(front, 2, 3) === ".") setChar(front, 2, 3, "H");
  } else if (frontVariant === 4) {
    // Soft sweeping fringe
    if (getChar(front, 1, 3) === "L") setChar(front, 1, 3, "h");
    if (getChar(front, 2, 4) === ".") setChar(front, 2, 4, "H");
    if (getChar(front, 3, 1) === ".") setChar(front, 3, 1, "H");
  }

  // 3. Sideburn & Temple Flow on Left & Right Faces (Rows 2..4)
  const sideVariant = Math.floor(seed / 7) % 3;
  if (sideVariant === 1) {
    if (getChar(right, 4, 1) === ".") setChar(right, 4, 1, "H");
    if (getChar(left, 3, 6) === "H") setChar(left, 3, 6, "h");
  } else if (sideVariant === 2) {
    if (getChar(left, 4, 6) === ".") setChar(left, 4, 6, "H");
    if (getChar(right, 3, 1) === "H") setChar(right, 3, 1, "h");
  }

  // 4. Back Nape Taper (Rows 5..7)
  const backVariant = Math.floor(seed / 13) % 3;
  if (backVariant === 1) {
    if (getChar(back, 5, 3) === "H") setChar(back, 5, 3, "D");
    if (getChar(back, 5, 4) === "H") setChar(back, 5, 4, "D");
  } else if (backVariant === 2) {
    if (getChar(back, 5, 2) === "H") setChar(back, 5, 2, "h");
    if (getChar(back, 5, 5) === "H") setChar(back, 5, 5, "h");
  }

  return { top, front, right, left, back };
}

function generateBaseHairBlueprint(params: HairBlueprintParams): HairBlueprint {
  const isLeftBiased = params.partOffset < 0;
  const asymShift = params.asymmetry > 0.3;
  const isLong = params.length > 0.6;

  // 1. Middle Part Flow (K-Pop comma hair with inward-sweeping fringe)
  if (params.silhouette === "middle-part-flow") {
    return {
      top: [
        ".HHHHHH.",
        "HHhLLhHH",
        "HhhLLhhH",
        "HhhDLhhH",
        "HhhDLhhH",
        "HhDDDLhH",
        "HSDDLDSH",
        ".SDDDDS.",
      ],
      front: [
        "hHhDDhHh",
        "LHLDDLHL",
        "HHH..HHH",
        "HH....HH",
        "HS....SH",
        "........",
        "........",
        "........",
      ],
      right: [
        "HHHHHHHH",
        "HhhLHHHH",
        "HhLH....",
        "HHH.....",
        "HS......",
        "........",
        "........",
        "........",
      ],
      left: [
        "HHHHHHHH",
        "HHHHhhLH",
        "....HLhH",
        ".....HHH",
        "......SH",
        "........",
        "........",
        "........",
      ],
      back: [
        "HHHHHHHH",
        "HhhLhhHH",
        "HHHHHHHH",
        "HSSSSSSH",
        ".SDDDDS.",
        "........",
        "........",
        "........",
      ],
    };
  }

  // 2. Messy Fringe (Jagged negative space & asymmetric strand notches)
  if (params.silhouette === "messy-fringe") {
    return {
      top: [
        ".HHHHHH.",
        "HhLhhLHH",
        "HhLhhLHH",
        "HHhLhhHH",
        "HHHhLHHH",
        "HSSDDSSH",
        "HSDDDSSH",
        ".SDDDDS.",
      ],
      front: [
        "hHhhLHhH",
        "HhLhLHHh",
        "HH.HL.HH",
        "HS..S.SH",
        "D.....D.",
        "........",
        "........",
        "........",
      ],
      right: [
        "HHHHHHHH",
        "HhhLHHHH",
        "HhLH....",
        "HH......",
        "HS......",
        "........",
        "........",
        "........",
      ],
      left: [
        "HHHHHHHH",
        "HHHHhhLH",
        "....HLhH",
        "......HH",
        "......SH",
        "........",
        "........",
        "........",
      ],
      back: [
        "HHHHHHHH",
        "HhhLhhHH",
        "HHHHHHHH",
        "HSSSSSSH",
        ".SDDDDS.",
        "........",
        "........",
        "........",
      ],
    };
  }

  // 3. Spiky Anime Hair (Upward crowns, jagged angular spikes)
  if (params.silhouette === "spiky-anime") {
    return {
      top: [
        "..hhhh..",
        ".Hh**hH.",
        "HHhLLhHH",
        "HHhLLhHH",
        "HSSDDSSH",
        "HSDDDSSH",
        ".SDDDDS.",
        "........",
      ],
      front: [
        "h*hh*hhh",
        "HHhLLhHH",
        "HH.HH.HH",
        "HS..H.SH",
        "D.....D.",
        "........",
        "........",
        "........",
      ],
      right: [
        "hHHHHHHH",
        "HhLHHHHH",
        "HhLH....",
        "HHH.....",
        "HD......",
        "........",
        "........",
        "........",
      ],
      left: [
        "HHHHHHHh",
        "HHHHHhLH",
        "....HLhH",
        ".....HHH",
        "......DH",
        "........",
        "........",
        "........",
      ],
      back: [
        "HHHHHHHH",
        "Hh*hh*HH",
        "HHHHHHHH",
        "HSSDDSSH",
        ".SDDDDS.",
        "........",
        "........",
        "........",
      ],
    };
  }

  // 4. Layered Short Crop (Clean soldier/formal/knight cut)
  if (params.silhouette === "layered-short") {
    return {
      top: [
        ".HHHHHH.",
        "HHhhLLHH",
        "HHhhLLHH",
        "HHSSDDHH",
        "HHSSDDHH",
        "HSSDDSSH",
        "HSDDDSSH",
        ".SDDDDS.",
      ],
      front: [
        "HhLhhLHH",
        "HHHHHHHH",
        "HH....HH",
        "H......H",
        "........",
        "........",
        "........",
        "........",
      ],
      right: [
        "HHHHHHHH",
        "HhLHHHHH",
        "HH......",
        "H.......",
        "........",
        "........",
        "........",
        "........",
      ],
      left: [
        "HHHHHHHH",
        "HHHHHhLH",
        "......HH",
        ".......H",
        "........",
        "........",
        "........",
        "........",
      ],
      back: [
        "HHHHHHHH",
        "HhhLhhHH",
        "HHHHHHHH",
        "HSSSSSSH",
        ".SDDDDS.",
        "........",
        "........",
        "........",
      ],
    };
  }

  // 5. Wolf Cut / Shag (Flared layers framing ears and neck)
  if (params.silhouette === "wolf-cut") {
    return {
      top: [
        ".HHHHHH.",
        "HHhLLhHH",
        "HhhLLhhH",
        "HhhDLhhH",
        "HSSDDSSH",
        "HSDDDSSH",
        "HSDDDSSH",
        ".SDDDDS.",
      ],
      front: [
        "hHhDDhHh",
        "LHLDDLHL",
        "HH.LL.HH",
        "HH....HH",
        "HS....SH",
        "HH....HH",
        "SD....DS",
        "........",
      ],
      right: [
        "HHHHHHHH",
        "HhhLHHHH",
        "HhLH....",
        "HHHH....",
        "HSHH....",
        "H.HS....",
        "........",
        "........",
      ],
      left: [
        "HHHHHHHH",
        "HHHHhhLH",
        "....HLhH",
        "....HHHH",
        "....HHSH",
        "....SH.H",
        "........",
        "........",
      ],
      back: [
        "HHHHHHHH",
        "HhhLhhHH",
        "HHHHHHHH",
        "HSSSSSSH",
        "HSDDDDSH",
        "H.SDDS.H",
        "........",
        "........",
      ],
    };
  }

  // 6. Long Layered / Braided Buns
  if (params.silhouette === "long-layered" || params.silhouette === "braided-buns" || isLong) {
    return {
      top: [
        ".HHHHHH.",
        "HHhLLhHH",
        "HhhLLhhH",
        "HhhDLhhH",
        "HhhDLhhH",
        "HhDDDLhH",
        "HSSDDSSH",
        ".SDDDDS.",
      ],
      front: [
        "hHhDDhHh",
        "LHLDDLHL",
        "HHH..HHH",
        "HH....HH",
        "HS....SH",
        "HS....SH",
        "HD....DH",
        "........",
      ],
      right: [
        "HHHHHHHH",
        "HhhLHHHH",
        "HhLH....",
        "HHHH....",
        "HSHH....",
        "HSHH....",
        "HDHH....",
        "........",
      ],
      left: [
        "HHHHHHHH",
        "HHHHhhLH",
        "....HLhH",
        "....HHHH",
        "....HHSH",
        "....HHSH",
        "....HHDH",
        "........",
      ],
      back: [
        "HHHHHHHH",
        "HhhLhhHH",
        "HHHHHHHH",
        "HHHHHHHH",
        "HSSSSSSH",
        "HSDDDDSH",
        "H.DDDD.H",
        "........",
      ],
    };
  }

  // 7. Side Swept
  if (params.silhouette === "side-swept") {
    return {
      top: [
        ".HHHHHH.",
        "HHhLLhHH",
        "HhhLLhhH",
        "DhhhLhhH",
        "DDhhLhhH",
        "DDDhhLhH",
        "HSSDDSSH",
        ".SDDDDS.",
      ],
      front: [
        "DhHhLhHh",
        "DDHLHLHL",
        "DDD...HH",
        "DD.....H",
        "D......H",
        "........",
        "........",
        "........",
      ],
      right: [
        "HHHHHHHH",
        "HhhLHHHH",
        "HhLH....",
        "HH......",
        "H.......",
        "........",
        "........",
        "........",
      ],
      left: [
        "HHHHHHHH",
        "HHHHhhLH",
        "....HLhH",
        "....HHHH",
        ".....HSH",
        "........",
        "........",
        "........",
      ],
      back: [
        "HHHHHHHH",
        "HhhLhhHH",
        "HHHHHHHH",
        "HSSSSSSH",
        ".SDDDDS.",
        "........",
        "........",
        "........",
      ],
    };
  }

  // ✨ Sculpted Curtain Bangs with Hierarchical Clustering & 1px Tapered Strand Endings
  // Large silhouette mass -> Medium strand masses -> Small strand accents -> Sparse highlights
  const partCol = isLeftBiased ? 3 : 4;

  // Front Face Rows 0..5 (Curtain bangs arching from part line, framing face with 1px tapers)
  const frontRow0 = isLeftBiased ? "LhhDLhHL" : "LHhLDhhL";
  const frontRow1 = isLeftBiased ? "HHhD..HH" : "HH..DhHH"; // Center part exposes forehead at apex
  const frontRow2 = isLeftBiased ? "HHS...HH" : "HH...SHH"; // Form-following medium strand masses
  const frontRow3 = isLeftBiased ? "HS.....H" : "H.....SH"; // Tapering inward strands
  const frontRow4 = asymShift
    ? (isLeftBiased ? "S......H" : "H......S") // 1px tapered endpoint on biased side
    : (isLeftBiased ? "S......S" : "S......S");
  const frontRow5 = asymShift
    ? (isLeftBiased ? ".......D" : "D.......") // Controlled 1px asymmetric length flick
    : "........";

  // Top Face with directional lighting (Upper-Left highlight bias)
  const topFace: TokenMatrix = [
    ".HHHHHH.",
    "Hh**hLHH", // Crisp specular glint at upper-left crown
    "HhhLLhhH",
    "HhhDLhhH",
    "HhhDLhhH",
    "HhDDDLSH",
    "HSSDDSSH",
    ".SDDDDS.",
  ];

  return {
    top: topFace,
    front: [
      frontRow0,
      frontRow1,
      frontRow2,
      frontRow3,
      frontRow4,
      frontRow5,
      "........",
      "........",
    ],
    right: [
      "HHHHHHHH",
      "HhhLHHHH",
      "HhLH....",
      "HHH.....",
      "HS......",
      asymShift ? "D......." : "........",
      "........",
      "........",
    ],
    left: [
      "HHHHHHHH",
      "HHHHhhLH",
      "....HLhH",
      ".....HHH",
      "......SH",
      asymShift ? "......DH" : "........",
      "........",
      "........",
    ],
    back: [
      "HHHHHHHH",
      "HhhLhhHH",
      "HHHHHHHH",
      "HSSSSSSH",
      ".SDDDDS.",
      "........",
      "........",
      "........",
    ],
  };
}

/**
 * Face Blueprint Generator (Base Head Front 8x8)
 * 
 * CRITICAL ARCHITECTURAL RULE:
 * In 8px face grids, cols 1-2 are left eye, cols 3-4 are ALWAYS skin/nose-bridge (k/K/.),
 * and cols 5-6 are right eye. Iris tokens must NEVER bridge across cols 3-4,
 * otherwise the eyes fuse into an unintended visor or cyclops bar.
 * 
 * Tokens:
 *   K = Skin base mass
 *   k = Soft skin highlight (nose bridge / forehead)
 *   s = Cheek contour / eye socket shadow
 *   d = Deep jawline / chin shadow
 *   B = Eyebrow
 *   b = Eyelash / eye crease
 *   w = Sclera white
 *   E = Eye iris base
 *   e = Eye iris secondary / glow
 *   * = Specular catchlight / sparkle
 *   p = Eye pupil
 *   r = Cheek blush (peach / rose)
 *   l = Lip line / coral gloss
 *   A = Accent / Visor glow
 */
export function generateFaceBlueprint(style: string, eyeStyle?: string, mouthStyle?: string): TokenMatrix {
  let matrix: TokenMatrix;
  switch (style) {
    case "soft-kpop":
      // 🍑 Soft K-Pop Boy: Warm peach shadow, straight brows, almond eyes with bridge separation, coral gradient lips
      matrix = [
        "KKKKKKKK",
        ".BB..BB.",
        "sbb..bbs",
        "w*E..*Ew",
        "wPe..ePw",
        "srrkkrrs",
        "KKKllKKK",
        "dKKKKKKd",
      ];
      break;

    case "anime-expressive":
    case "feminine-soft":
    case "soft-cute":
      // 👁️ Anime Expressive: Winged eyeliner, dual catchlights, arched brows, rose blush
      matrix = [
        "KKKKKKKK",
        ".BB..BB.",
        "bbb..bbb",
        "w*E..*Ew",
        "wEe..eEw",
        "srrkkrrs",
        "KKKllKKK",
        "dKKKKKKd",
      ];
      break;

    case "masculine-angular":
      // ⚔️ Masculine Angular: Low thick brows, focused 2x1 eyes, defined bridge, firm jaw
      matrix = [
        "KKKKKKKK",
        "BBBBBBBB",
        "sbb..bbs",
        "w*E..E*w",
        "s..kk..s",
        "s..kk..s",
        "KKKllKKK",
        "dKKKKKKd",
      ];
      break;

    case "sharp-cool":
      // 🗡️ Sharp Cool / Assassin: Menacing slanting brows, piercing eyes, cheek contour
      matrix = [
        "KKKKKKKK",
        "sBB..BBs",
        "bbb..bbb",
        "w*E..E*w",
        "s..kk..s",
        "srrkkrrs",
        "KKKllKKK",
        "ddKKKKdd",
      ];
      break;

    case "mature-minimal":
      // ▪️ Mature Minimal: 1x2 vertical aperture eyes, clean brow, defined jaw
      matrix = [
        "KKKKKKKK",
        "KKKKKKKK",
        ".BB..BB.",
        "K*E..E*K",
        "KEE..EEK",
        "s..kk..s",
        "KKKKKKKK",
        "dKKKKKKd",
      ];
      break;

    case "masked-visor":
      // 🥽 Tactical Visor with preserved mouth and chin
      matrix = [
        "KKKKKKKK",
        ".BB..BB.",
        "sbb..bbs",
        "A*AAAA*A",
        "AAAAAAAA",
        "srrkkrrs",
        "KKKllKKK",
        "dKKKKKKd",
      ];
      break;

    case "clean-aesthetic":
    default:
      // ✨ NameMC Clean Aesthetic: 2x2 catchlight eyes, natural peach blush, clean chin
      matrix = [
        "KKKKKKKK",
        ".BB..BB.",
        "sbb..bbs",
        "w*E..*Ew",
        "wEe..eEw",
        "srrkkrrs",
        "KKKllKKK",
        "dKKKKKKd",
      ];
      break;
  }

  if (eyeStyle) {
    matrix = applyEyeStyleToFaceBlueprint(matrix, eyeStyle);
  }
  if (mouthStyle) {
    matrix = applyMouthStyleToFaceBlueprint(matrix, mouthStyle);
  }
  return matrix;
}

/**
 * Applies intentional eye-style variations to Rows 3 & 4 of the face blueprint.
 * Brows (Rows 1..2), blush (Row 5), mouth (Row 6), and chin (Row 7) are strictly preserved.
 */
export function applyEyeStyleToFaceBlueprint(bp: TokenMatrix, eyeStyle: string): TokenMatrix {
  const result = [...bp];
  switch (eyeStyle) {
    case "classic":
      // Classic Steve 2x1: Row 3 clean skin, Row 4 Steve 2x1 (white sclera outer, iris inner)
      result[3] = "KKKkkKKK";
      result[4] = "KwEkkEwK";
      break;

    case "glowing":
      // Glowing Solid: Solid luminous emissive core on 2x2 zones without dark pupils
      result[3] = "K**kk**K";
      result[4] = "Kee..eeK";
      break;

    case "minimal":
      // Minimal Dot / 1x2 Vertical Aperture: 1px aperture on cols 2 & 5, clean skin on cols 1 & 6
      result[3] = "K.EkkE.K";
      result[4] = "K.pkkp.K";
      break;

    case "visor":
      // Cyber Visor: High-tech glowing visor band on Rows 3 & 4 only
      result[3] = "A*AAAA*A";
      result[4] = "AAAAAAAA";
      break;

    case "anime":
    default:
      // Anime / Aesthetic 2x2 Catchlight
      result[3] = "w*E..*Ew";
      result[4] = "wEe..eEw";
      break;
  }
  return result;
}

/**
 * Applies intentional mouth-style variations strictly to Row 6 of the face blueprint.
 * Brows (Rows 1..2), eyes (Rows 3..4), blush/cheeks (Row 5), and chin (Row 7) are strictly preserved.
 */
export function applyMouthStyleToFaceBlueprint(bp: TokenMatrix, mouthStyle: string): TokenMatrix {
  const result = [...bp];
  switch (mouthStyle) {
    case "neutral":
      // Neutral: Understated, clean 2px horizontal lip line
      result[6] = "KKKllKKK";
      break;

    case "smirk":
      // Smirk: Asymmetric smile with right corner lifted into a confident smirk
      result[6] = "KKKlllKK";
      break;

    case "open":
      // Open: Energetic open mouth with dark mouth cavity framed by lip corners
      result[6] = "KKlpplKK";
      break;

    case "none":
      // None / Masked: Removes the lip line entirely, producing clean base skin
      result[6] = "KKKKKKKK";
      break;

    case "smile":
    default:
      // Smile: Soft warm smile with subtle upturned crease corners
      result[6] = "KKsllsKK";
      break;
  }
  return result;
}
