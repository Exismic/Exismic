import { ALL_TOOLS, TOOLS } from "@/data/tools";

export const FAVORITES_CHANGED_EVENT = "exismic:favorites-changed";

const FAVORITE_TOOL_IDS = new Set((ALL_TOOLS || TOOLS).map((tool) => tool.id));

export function normalizeFavoriteToolId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const toolId = value.trim();
  if (FAVORITE_TOOL_IDS.has(toolId)) return toolId;
  const found = (ALL_TOOLS || TOOLS).find(
    (t) => t.id === toolId || t.href.endsWith(`/${toolId}`) || toolId.endsWith(`/${t.id}`)
  );
  return found ? found.id : null;
}

export function isFavoriteToolId(value: string): boolean {
  return Boolean(normalizeFavoriteToolId(value));
}

