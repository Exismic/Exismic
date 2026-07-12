import { TOOLS } from "@/data/tools";

export const FAVORITES_CHANGED_EVENT = "exismic:favorites-changed";

const FAVORITE_TOOL_IDS = new Set(TOOLS.map((tool) => tool.id));

export function normalizeFavoriteToolId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const toolId = value.trim();
  return FAVORITE_TOOL_IDS.has(toolId) ? toolId : null;
}

export function isFavoriteToolId(value: string): boolean {
  return FAVORITE_TOOL_IDS.has(value);
}
