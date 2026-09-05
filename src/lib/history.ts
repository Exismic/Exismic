import {
  inferResultFileType,
  normalizeHistoryToolType,
  type ResultFileType,
  type ResultStatus,
} from "@/lib/results";

export const HISTORY_UPDATED_EVENT = "exismic:history-updated";
const GUEST_HISTORY_KEY = "exismic_guest_history";

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
  metadata?: Record<string, unknown>;
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
