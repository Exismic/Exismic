import { detectDeviceCapabilities } from "@/lib/device-capability";

export interface VectorizerOptions {
  threshold?: number;
  color?: string;
  background?: string;
  turnPolicy?: string;
}

/**
 * Checks if user device & image payload are eligible for instant local vectorization.
 */
export function detectVectorizerCapabilities(file: File): boolean {
  if (typeof window === "undefined") return false;

  const isDeviceCapable = detectDeviceCapabilities();
  if (!isDeviceCapable) return false;

  const MAX_LOCAL_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_LOCAL_IMAGE_SIZE) return false;

  return true;
}

/**
 * Executes instant client-side SVG vectorization in browser memory with a strict 10-second timeout.
 */
export async function processVectorizeLocally(
  file: File,
  options: VectorizerOptions = {},
  timeoutMs = 10000
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Client vectorizer is only available in browser environment.");
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Local vectorization timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });

  try {
    const vectorTaskPromise = (async () => {
      const PotraceModule = await import("potrace");
      const Potrace = (PotraceModule as any).Potrace || PotraceModule.default?.Potrace || PotraceModule.default;
      const Bitmap = (PotraceModule as any).Bitmap || (require("potrace/lib/types/Bitmap") as any);

      if (!Potrace || !Bitmap) {
        throw new Error("Potrace library not loaded.");
      }

      // Load image into an HTMLImageElement
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image file."));
        img.src = objectUrl;
      });

      URL.revokeObjectURL(objectUrl);

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width <= 0 || height <= 0) {
        throw new Error("Invalid image dimensions.");
      }

      // Render image on offscreen canvas to get raw pixel data
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context.");

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      const rawPixels = imageData.data;

      // Convert RGBA pixels to Potrace Bitmap luminance array
      const bitmap = new Bitmap(width, height);
      const size = width * height;

      for (let i = 0; i < size; i++) {
        const idx = i * 4;
        const r = rawPixels[idx];
        const g = rawPixels[idx + 1];
        const b = rawPixels[idx + 2];
        const a = rawPixels[idx + 3] / 255.0;

        const blendedR = 255 + (r - 255) * a;
        const blendedG = 255 + (g - 255) * a;
        const blendedB = 255 + (b - 255) * a;

        const lum = 0.2126 * blendedR + 0.7152 * blendedG + 0.0722 * blendedB;
        bitmap.data[i] = Math.round(lum);
      }

      // Run Potrace tracing algorithm
      const traceInstance = new Potrace({
        threshold: options.threshold ?? 128,
        color: options.color ?? "#000000",
        background: options.background ?? "transparent",
        turnPolicy: options.turnPolicy ?? "minority",
      });

      traceInstance._luminanceData = bitmap;
      traceInstance._imageLoaded = true;
      traceInstance._processed = false;

      const svgString = traceInstance.getSVG();
      if (!svgString || typeof svgString !== "string") {
        throw new Error("Failed to generate SVG vector path.");
      }

      return svgString;
    })();

    const svgOutput = await Promise.race([vectorTaskPromise, timeoutPromise]);
    return svgOutput;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
