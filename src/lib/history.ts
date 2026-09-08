import {
  inferResultFileType,
  normalizeHistoryToolType,
  type ResultFileType,
  type ResultStatus,
} from "@/lib/results";
import { TOOLS } from "@/data/tools";

export const HISTORY_UPDATED_EVENT = "exismic:history-updated";
const GUEST_HISTORY_KEY = "exismic_guest_history";

export interface ToolHistoryMetadata {
  prompt?: string;
  settings?: Record<string, any>;
  inputs?: Record<string, any>;
  aspectRatio?: string;
  style?: string;
  model?: string;
  quality?: number | string;
  targetHref?: string;
  toolName?: string;
  originalFileUrl?: string;
  templateId?: string;
  topText?: string;
  bottomText?: string;
  [key: string]: unknown;
}

export interface GuestHistoryItem {
  id: string;
  toolType: string;
  originalName: string;
  originalUrl?: string;
  resultUrl?: string;
  fileType: ResultFileType;
  status: ResultStatus;
  createdAt: string;
  timestamp: string;
  metadata?: ToolHistoryMetadata;
  isGuest?: boolean;
}

/**
 * Retrieves items saved in the local browser for guest/unauthenticated sessions.
 */
export function getGuestFileHistory(): GuestHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(GUEST_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read guest history from localStorage:", err);
    return [];
  }
}

/**
 * Saves or updates a single item in the local guest history.
 */
export function saveGuestFileHistoryItem(item: Omit<GuestHistoryItem, "id" | "createdAt" | "timestamp"> & { id?: string }): GuestHistoryItem {
  if (typeof window === "undefined") {
    return {
      ...item,
      id: item.id || `guest_${Date.now()}`,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      isGuest: true,
    };
  }

  const now = new Date().toISOString();
  const newItem: GuestHistoryItem = {
    ...item,
    id: item.id || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    timestamp: now,
    isGuest: true,
  };

  try {
    const existing = getGuestFileHistory();
    // Keep max 25 items in guest cache to prevent storage bloat
    const updated = [newItem, ...existing.filter((i) => i.id !== newItem.id)].slice(0, 25);
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save guest history to localStorage:", err);
  }

  return newItem;
}

/**
 * Clears local guest history.
 */
export function clearGuestFileHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_HISTORY_KEY);
  } catch (err) {
    console.warn("Failed to clear guest history:", err);
  }
}

/**
 * Universal save function that records to the backend for authenticated users
 * and guarantees persistence in local storage for guest sessions.
 */
export async function saveFileHistory({
  toolType,
  originalName,
  originalUrl,
  resultUrl,
  fileType,
  status = "completed",
  metadata = {}
}: {
  toolType: string;
  originalName: string;
  originalUrl?: string;
  resultUrl?: string;
  fileType?: ResultFileType;
  status?: ResultStatus;
  metadata?: Record<string, unknown>;
}) {
  const normalizedToolType = normalizeHistoryToolType(toolType);
  const inferredFileType = fileType ?? inferResultFileType({ toolType: normalizedToolType, resultUrl });

  // 1. Always write to local guest history first as an instant optimistic cache
  let localSavedItem: GuestHistoryItem | null = null;
  if (typeof window !== "undefined") {
    localSavedItem = saveGuestFileHistoryItem({
      toolType: normalizedToolType,
      originalName,
      originalUrl,
      resultUrl,
      fileType: inferredFileType,
      status,
      metadata,
    });
  }

  // 2. Attempt server-side save for authenticated accounts
  let serverData = null;
  try {
    const response = await fetch("/api/files/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toolType: normalizedToolType,
        originalName,
        originalUrl,
        resultUrl,
        fileType: inferredFileType,
        status,
        metadata
      })
    });

    if (response.ok) {
      serverData = await response.json();
    }
  } catch (error) {
    console.warn("Server-side history recording bypassed/failed:", error);
  }

  // 3. Notify all listening dashboard and history UI components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT, {
      detail: serverData || localSavedItem,
    }));
  }

  return serverData || localSavedItem;
}

/**
 * Builds the replay URL to re-run or edit a previous history action.
 */
export function getReplayUrl(
  toolType: string,
  metadata?: ToolHistoryMetadata | Record<string, any>,
  mode: "run" | "edit" = "edit"
): string {
  const normalizedToolType = normalizeHistoryToolType(toolType);
  
  // Specific alias routes table
  const SPECIAL_TOOL_ROUTES: Record<string, string> = {
    "minecraft-skin-maker": "/tools/image/minecraft-skin",
    "image-minecraft-skin": "/tools/image/minecraft-skin",
    "minecraft-skin": "/tools/image/minecraft-skin",
    
    "image-eraser": "/tools/image/eraser",
    "eraser": "/tools/image/eraser",
    "bg-remove": "/tools/image/eraser",
    "remove-bg": "/tools/image/eraser",
    "background-remover": "/tools/image/eraser",
    
    "image-compressor": "/tools/image/compressor",
    "compressor": "/tools/image/compressor",
    "bulk-image-compressor": "/tools/image/compressor",
    
    "image-resizer": "/tools/image/resizer",
    "resizer": "/tools/image/resizer",
    "img-resizer": "/tools/image/resizer",
    
    "image-converter": "/tools/image/converter",
    "converter": "/tools/image/converter",
    "img-converter": "/tools/image/converter",
    
    "ai-img-gen": "/tools/ai/img-gen",
    "image-generator": "/tools/ai/img-gen",
    "img-gen": "/tools/ai/img-gen",
    
    "ai-writer": "/tools/ai/writer",
    "writer": "/tools/ai/writer",
    "prompt-optimizer": "/tools/ai/writer",
    
    "audio-vocal-remover": "/tools/audio/vocal-remover",
    "vocal-remover": "/tools/audio/vocal-remover",
    
    "meme-generator": "/tools/meme-generator",
    
    "hook-script-generator": "/tools/creator/hook-script-generator",
    "social-caption-generator": "/tools/social-caption-generator",
    "math-solver": "/tools/math-solver",
    
    "cloud-drive": "/library",
    "drive": "/library",
  };

  let baseHref = (metadata?.targetHref as string) || "";
  if (!baseHref) {
    if (SPECIAL_TOOL_ROUTES[toolType]) {
      baseHref = SPECIAL_TOOL_ROUTES[toolType];
    } else if (SPECIAL_TOOL_ROUTES[normalizedToolType]) {
      baseHref = SPECIAL_TOOL_ROUTES[normalizedToolType];
    } else {
      const matched = TOOLS.find(
        (t) =>
          t.id === toolType ||
          t.id === normalizedToolType ||
          t.href.endsWith(`/${toolType}`) ||
          t.href.endsWith(`/${normalizedToolType}`)
      );
      if (matched) {
        baseHref = matched.href;
      } else {
        baseHref = "/tools";
      }
    }
  }

  // Extract prompt safely from all metadata permutations (including Minecraft Skin designs)
  const metaPrompt =
    metadata?.prompt ||
    metadata?.design?.description ||
    metadata?.design?.name ||
    metadata?.description ||
    "";

  const params = new URLSearchParams();
  if (metaPrompt) params.set("prompt", String(metaPrompt));
  if (metadata) {
    if (metadata.aspectRatio) params.set("aspectRatio", String(metadata.aspectRatio));
    if (metadata.style) params.set("style", String(metadata.style));
    if (metadata.armModel) params.set("armModel", String(metadata.armModel));
    if (metadata.model) params.set("model", String(metadata.model));
    if (metadata.quality) params.set("quality", String(metadata.quality));
    if (metadata.topText) params.set("topText", String(metadata.topText));
    if (metadata.bottomText) params.set("bottomText", String(metadata.bottomText));
    if (metadata.templateId) params.set("templateId", String(metadata.templateId));
    if (metadata.tier) params.set("tier", String(metadata.tier));
  }

  if (mode === "run") {
    params.set("autorun", "1");
  }

  const queryString = params.toString();
  return queryString ? `${baseHref}?${queryString}` : baseHref;
}
