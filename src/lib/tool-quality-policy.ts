export type OutputTier = "standard" | "hd";

export const QUALITY_TOOL_POLICIES = {
  "image-eraser": { hdCreditCost: 4, standardMaxEdge: 1280 },
  "image-compressor": { hdCreditCost: 2, standardMaxEdge: 1600 },
  "image-resizer": { hdCreditCost: 2, standardMaxEdge: 1600 },
  "image-converter": { hdCreditCost: 1, standardMaxEdge: 1600 },
  "image-restorer": { hdCreditCost: 12, standardMaxEdge: 1280 },
  "watermark-remover": { hdCreditCost: 10, standardMaxEdge: 1280 },
  "video-compressor": { hdCreditCost: 8, standardMaxEdge: 1080 },
  "video-enhancer": { hdCreditCost: 20, standardMaxEdge: 1080 },
} as const;

export type QualityToolId = keyof typeof QUALITY_TOOL_POLICIES;

export function isQualityUpgradeableTool(toolId: string): toolId is QualityToolId {
  return toolId in QUALITY_TOOL_POLICIES;
}

export function getQualityToolPolicy(toolId: string) {
  return isQualityUpgradeableTool(toolId)
    ? QUALITY_TOOL_POLICIES[toolId]
    : null;
}
