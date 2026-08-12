/**
 * Client-side background removal helper using @imgly/background-removal.
 * Features:
 * - Offloads all ONNX inference to Web Workers (proxyToWorker: true) to keep UI main thread responsive
 * - Silent background preloading (preloadLocalModel) using fp16 models
 * - Timeout protection to catch hanging worker executions and trigger cloud fallback
 */

let isPreloaded = false;

const MODEL_CONFIG = {
  model: "isnet_fp16" as const, // Uses fp16 half-precision model (~20MB) for fast download
  proxyToWorker: true,           // Offload ALL inference & heavy processing to Web Worker (prevents Page Unresponsive freeze)
};

/**
 * Silently preloads the background removal model into IndexedDB cache.
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
      console.log("[Client AI] Model preloaded in Web Worker and cached successfully.");
    }
  } catch (error) {
    console.warn("[Client AI] Preload attempt failed (will fall back to cloud API if needed):", error);
  }
}

/**
 * Executes client-side background removal offloaded to Web Workers with a strict timeout.
 * @param image Input File, Blob, or URL string
 * @param timeoutMs Timeout limit in milliseconds (default: 15000ms)
 * @returns Object URL of the resulting transparent PNG
 */
export async function processBackgroundLocally(
  image: File | Blob | string,
  timeoutMs = 15000
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


