"use client";

export interface PipelinePayload {
  name: string;
  url: string; // data URL, blob URL, or public URL
  fileType: "image" | "audio" | "video" | "pdf" | "document" | "code" | "other";
  sourceToolId: string;
  sourceToolName?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = "exismic_pipeline_pending_item";
const DB_NAME = "exismic_pipeline_db";
const STORE_NAME = "pipeline_store";
const ASSET_KEY = "pending_pipeline_asset";

function openPipelineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not supported in this environment"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeBlobInDB(blob: Blob, meta: PipelinePayload): Promise<void> {
  try {
    const db = await openPipelineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ blob, meta, timestamp: Date.now() }, ASSET_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[Pipeline] IndexedDB store failed:", err);
  }
}

async function retrieveBlobFromDB(): Promise<{ blob: Blob; meta: PipelinePayload } | null> {
  try {
    const db = await openPipelineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ASSET_KEY);
      req.onsuccess = () => {
        const data = req.result;
        if (data && data.blob) {
          // Valid for up to 3 minutes to safely survive StrictMode double-mounts
          if (data.timestamp && Date.now() - data.timestamp < 3 * 60 * 1000) {
            resolve(data);
            return;
          }
        }
        resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("[Pipeline] IndexedDB retrieve failed:", err);
    return null;
  }
}

/**
 * Completely clears pipeline storage once a target tool has successfully loaded the asset into state.
 */
export async function clearPipelineItem(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    const db = await openPipelineDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(ASSET_KEY);
  } catch (err) {
    console.warn("[Pipeline] Clear failed:", err);
  }
}

/**
 * Stores an asset in the pipeline and redirects to the target tool.
 * Captures in-memory blobs into IndexedDB before page navigation so they survive page unload.
 */
export async function sendToTool(targetHref: string, payload: PipelinePayload) {
  if (typeof window === "undefined") return;

  try {
    // If URL exists, capture binary blob in IndexedDB before navigating
    if (payload.url) {
      try {
        const response = await fetch(payload.url);
        const blob = await response.blob();
        await storeBlobInDB(blob, payload);
      } catch (fetchErr) {
        console.warn("[Pipeline] Could not capture blob for IndexedDB persistence:", fetchErr);
      }
    }

    const fullPayload: PipelinePayload = {
      ...payload,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fullPayload));
  } catch (error) {
    console.warn("[Pipeline] Failed to store pipeline payload in sessionStorage:", error);
  }

  // Navigate to target tool
  window.location.href = targetHref;
}

/**
 * Retrieves the pending pipeline asset on destination tool mount.
 * Returns null if no pipeline asset is pending or if it has expired (> 3 minutes).
 * Does not delete immediately to safely support React StrictMode double-mounting.
 */
export function consumePipelineItem(): PipelinePayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PipelinePayload;

    // Check expiration (3 minutes limit to prevent stale state)
    if (parsed.timestamp && Date.now() - parsed.timestamp > 3 * 60 * 1000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("[Pipeline] Failed to parse pipeline payload:", error);
    return null;
  }
}

/**
 * Converts a data URL, remote URL, or pending IndexedDB pipeline asset into a browser File object.
 */
export async function pipelineUrlToFile(url: string, filename: string, mimeType = "image/png"): Promise<File> {
  // First check if a fresh binary blob was stored in IndexedDB before page navigation
  const dbData = await retrieveBlobFromDB();
  if (dbData && dbData.blob) {
    return new File([dbData.blob], filename || dbData.meta?.name || "pipeline-image.png", {
      type: dbData.blob.type || mimeType,
    });
  }

  // Fallback to fetch (for data URLs or remote public URLs)
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || mimeType });
}
