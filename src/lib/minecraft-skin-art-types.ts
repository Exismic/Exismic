export const SKIN_CHARACTER_TYPES = ["human", "duck", "tv", "robot", "creature", "cat", "abstract"] as const;
export type SkinCharacterType = typeof SKIN_CHARACTER_TYPES[number];
// Original fallback colors for custom heads; explicit prompt/AI colors take precedence.
export const SKIN_CHARACTER_PALETTES: Partial<Record<SkinCharacterType, Record<string, string>>> = {
  duck: { skin: "#287c73", skinShade: "#1e5b56", topAccent: "#eab34f", top: "#252b33", pants: "#303641", eyes: "#20252d" },
  tv: { hair: "#a3abb7", hairHighlight: "#d0d6df", eyes: "#538acd", top: "#282b34", topAccent: "#a786c0", pants: "#343744" },
  robot: { skin: "#9caeb8", skinShade: "#778d9a", eyes: "#50d5d0", detail: "#57687b", top: "#364657", topAccent: "#64bcc4" },
  creature: { skin: "#22212c", skinShade: "#15151d", eyes: "#f1efe6", detail: "#d59fae", top: "#24232e", pants: "#292834" },
  cat: { skin: "#30303d", skinShade: "#20212b", eyes: "#b3d0a2", detail: "#d5a4b3" },
  abstract: { hair: "#7dc9d1", hairHighlight: "#bde2df", topAccent: "#b5a0d5", top: "#dda8bc", pants: "#dbcc8c", shoes: "#a3c5a1" },
};
export const SKIN_ART_PARTS = ["head", "torso", "right-arm", "left-arm", "right-leg", "left-leg"] as const;
export const SKIN_ART_PLANES = ["top", "bottom", "right", "front", "left", "back"] as const;
export type SkinArtRegion = `${typeof SKIN_ART_PARTS[number]}-${typeof SKIN_ART_PLANES[number]}`;
export const SKIN_ART_REGIONS = SKIN_ART_PARTS.flatMap((part) => SKIN_ART_PLANES.map((plane) => `${part}-${plane}` as SkinArtRegion));

export interface SkinPixelArtFace {
  region: SkinArtRegion;
  layer: "base" | "outer";
  rows: string[];
}

export function inferSkinArt(prompt: string) {
  // Exclude explicitly rejected concepts before classifying the character.
  const text = prompt.toLowerCase().replace(/\b(?:no|without|not a|not an)\s+(?:duck|tv|robot|monster|cat|plaid|rips?|gradient)\b/g, "");
  const characterType: SkinCharacterType = /\b(?:duck|mallard|duckling)\b/.test(text) ? "duck"
    : /\b(?:tv[- ]?head|television[- ]?head|monitor[- ]?head|screen[- ]?head)\b/.test(text) ? "tv"
      : /\b(?:robot|android|mecha)\b/.test(text) ? "robot"
        : /\b(?:cat[- ]?(?:person|face|head)|black cat|kitty)\b/.test(text) ? "cat"
          : /\b(?:monster|creature|voidling|shadow beast)\b/.test(text) ? "creature"
            : /\babstract\b/.test(text) || (/\b(?:galaxy|rainbow gradient|pastel gradient) (?:character|entity|skin)\b/.test(text) && !/\b(?:human|boy|girl|man|woman|hair)\b/.test(text)) ? "abstract" : "human";
  const topPattern = /\b(?:plaid|tartan|flannel)\b/.test(text) ? "plaid" as const
    : /\b(?:striped (?:shirt|sweater|hoodie|jacket)|horizontal stripes)\b/.test(text) ? "striped" as const : "clean" as const;
  const pantsDetail = /\b(?:ripped|torn|distressed|frayed)\b/.test(text) ? "ripped" as const
    : /\bpatchwork\b/.test(text) ? "patchwork" as const : "clean" as const;
  const graphic = /\bskull\b/.test(text) ? "skull" as const : /\bheart (?:print|graphic|logo)\b/.test(text) ? "heart" as const
    : /\bchecker(?:board)? (?:print|graphic|logo)\b/.test(text) ? "checker" as const
      : /\b(?:lightning|bolt) (?:print|graphic|logo)\b/.test(text) ? "bolt" as const : "none" as const;
  return { characterType, topPattern, pantsDetail, graphic, colorTreatment: /\b(?:gradient|iridescent|rainbow|galaxy)\b/.test(text) ? "gradient" as const : "solid" as const };
}

export const SKIN_ART_TOKENS = ".KkCHhLD TtSsAaBPpQFfgEeWNXxYR".replace(/ /g, "");

export function sanitizeSkinPixelArt(input: unknown, characterType?: SkinCharacterType): SkinPixelArtFace[] {
  if (!Array.isArray(input)) return [];
  const result: SkinPixelArtFace[] = [];
  const seen = new Set<string>();
  for (const entry of input.slice(0, 32)) {
    if (!entry || typeof entry !== "object") continue;
    const { region, layer, rows } = entry;
    if (!SKIN_ART_REGIONS.includes(region) || !["base", "outer"].includes(layer) || !Array.isArray(rows)) continue;
    const part = region.replace(/-(top|bottom|right|front|left|back)$/, "");
    const plane = region.split("-").at(-1);
    const width = part === "head" ? 8 : part === "torso" && !["left", "right"].includes(plane) ? 8 : 4;
    const height = part === "head" ? 8 : ["top", "bottom"].includes(plane) ? 4 : 12;
    // Reject the whole face, rather than quietly stretching a malformed drawing.
    if (rows.length !== height || !rows.every((row: unknown) => typeof row === "string" && row.length === width && [...row].every((token) => SKIN_ART_TOKENS.includes(token)))) continue;
    const tokens = rows.join("");
    // Reject broad material fills that would erase the renderer's cloth folds.
    if (part !== "head" && [...tokens].filter((token) => "TtSsPpQFfg".includes(token)).length > tokens.length * 0.65 && [...tokens].filter((token) => token === ".").length < tokens.length * 0.3) continue;
    if (characterType === "human" && region === "head-front" && layer === "outer" && [...tokens].some((token) => !".HhLD".includes(token))) continue;
    if (characterType === "duck" && region === "head-front" && layer === "base") {
      const hasEye = (start: number) => rows.slice(2, 5).some((row: string) => [...row.slice(start, start + 2)].some((token) => "EWNe".includes(token)));
      if (!hasEye(1) || !hasEye(5)) continue;
    }
    const key = `${region}:${layer}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ region, layer, rows: [...rows] });
  }
  return result;
}
