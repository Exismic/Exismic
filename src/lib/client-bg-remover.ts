/**
 * Client-side background removal helper using @imgly/background-removal.
 * Features:
 * - Uses 8-bit quantized model (isnet_quint8) for 3x smaller download (~15MB) and fastest CPU/WASM inference
 * - Offloads all ONNX inference to Web Workers (proxyToWorker: true) to keep UI main thread responsive
 * - Real-time progress reporting (download vs inference stages)
 * - Silent background preloading (preloadLocalModel)
 * - Timeout protection to catch hanging worker executions and trigger cloud fallback
 */

let isPreloaded = false;

const MODEL_CONFIG = {
  model: "isnet_quint8" as const, // 8-bit quantized model: ~15MB (much smaller and faster than 40MB fp16)
  proxyToWorker: true,            // Offload ALL inference & heavy processing to Web Worker (keeps UI silky smooth)
};

export type BgRemovalProgressCallback = (stage: string, percent: number) => void;

/**
 * Silently preloads the background removal model into browser cache.
 */
export async function preloadLocalModel(): Promise<void> {
  if (isPreloaded || typeof window === "undefined") return;

  try {
    const imgly = await import("@imgly/background-removal");
    if (typeof imgly.preload === "function") {
      await imgly.preload({
        model: MODEL_CONFIG.model,
        proxyToWorker: MODEL_CONFIG.proxyToWorker,
      });
      isPreloaded = true;
      console.log("[Client AI] Fast quantized model preloaded & cached successfully.");
    }
  } catch (error) {
    console.warn("[Client AI] Preload attempt failed (will fall back to cloud API if needed):", error);
  }
}

/**
 * Executes client-side background removal offloaded to Web Workers with progress reporting.
 * @param image Input File, Blob, or URL string
 * @param timeoutMs Timeout limit in milliseconds (default: 30000ms)
 * @param onProgress Optional callback receiving stage name and percentage (0-100)
 * @returns Object URL of the resulting transparent PNG
 */
export async function processBackgroundLocally(
  image: File | Blob | string,
  timeoutMs = 30000,
  onProgress?: BgRemovalProgressCallback
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Client-side background removal is only available in browser environment.");
  }

  const imgly = await import("@imgly/background-removal");
  const removeBgFn = imgly.removeBackground || imgly.default;

  if (typeof removeBgFn !== "function") {
    throw new Error("Invalid background removal module.");
  }

  // Create a timeout promise that rejects after timeoutMs
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Local background removal timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });

  try {
    const processingPromise = (async () => {
      const blob = await removeBgFn(image, {
        model: MODEL_CONFIG.model,
        proxyToWorker: MODEL_CONFIG.proxyToWorker,
        progress: (key: string, current: number, total: number) => {
          if (onProgress && total > 0) {
            const pct = Math.min(100, Math.round((current / total) * 100));
            const stage = key.toLowerCase().includes("fetch")
              ? "Preparing..."
              : "Removing background...";
            onProgress(stage, pct);
          }
        },
        output: {
          format: "image/png",
          quality: 1.0,
        },
      });
      return URL.createObjectURL(blob);
    })();

    const resultUrl = await Promise.race([processingPromise, timeoutPromise]);
    return resultUrl;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
