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
  return applyHairAccessories(base, params.accessories);
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
export function generateFaceBlueprint(style: string): TokenMatrix {
  switch (style) {
    case "soft-kpop":
      // 🍑 Soft K-Pop Boy: Warm peach shadow, straight brows, almond eyes with bridge separation, coral gradient lips
      return [
        "KKKKKKKK",
        ".BB..BB.",
        "sbb..bbs",
        "w*E..*Ew",
        "wPe..ePw",
        "srrkkrrs",
        "KKKllKKK",
        "dKKKKKKd",
      ];

    case "anime-expressive":
    case "feminine-soft":
    case "soft-cute":
      // 👁️ Anime Expressive: Winged eyeliner, dual catchlights, arched brows, rose blush
      return [
        "KKKKKKKK",
        ".BB..BB.",
        "bbb..bbb",
        "w*E..*Ew",
        "wEe..eEw",
        "srrkkrrs",
        "KKKllKKK",
        "dKKKKKKd",
      ];

    case "masculine-angular":
      // ⚔️ Masculine Angular: Low thick brows, focused 2x1 eyes, defined bridge, firm jaw
      return [
        "KKKKKKKK",
        "BBBBBBBB",
        "sbb..bbs",
        "w*E..E*w",
        "s..kk..s",
        "s..kk..s",
        "KKKllKKK",
        "dddddddd",
      ];

    case "sharp-cool":
      // 🗡️ Sharp Cool / Assassin: Menacing slanting brows, piercing eyes, cheek contour
      return [
        "KKKKKKKK",
        "sBB..BBs",
        "bbb..bbb",
        "w*E..E*w",
        "s..kk..s",
        "srrkkrrs",
        "KKKllKKK",
        "ddKKKKdd",
      ];

    case "mature-minimal":
      // ▪️ Mature Minimal: 1x2 vertical aperture eyes, clean brow, defined jaw
      return [
        "KKKKKKKK",
        "KKKKKKKK",
        ".BB..BB.",
        "K*E..E*K",
        "KEE..EEK",
        "s..kk..s",
        "KKKKKKKK",
        "dddddddd",
      ];

    case "masked-visor":
      // 🥽 Tactical Mask / Visor
      return [
        "KKKKKKKK",
        "BBBBBBBB",
        "bbbbbbbb",
        "A*AAAA*A",
        "AAAAAAAA",
        "dddddddd",
        "dddddddd",
        "dddddddd",
      ];

    case "clean-aesthetic":
    default:
      // ✨ NameMC Clean Aesthetic: 2x2 catchlight eyes, natural peach blush, clean chin
      return [
        "KKKKKKKK",
        ".BB..BB.",
        "sbb..bbs",
        "w*E..*Ew",
        "wEe..eEw",
        "srrkkrrs",
        "KKKllKKK",
        "dKKKKKKd",
      ];
  }
}
