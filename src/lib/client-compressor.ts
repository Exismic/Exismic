import { detectDeviceCapabilities } from "@/lib/device-capability";

export interface CompressorOptions {
  quality?: number; // 1 to 100
  format?: "original" | "jpg" | "jpeg" | "png" | "webp";
  toWebp?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  removeMetadata?: boolean;
}

export interface CompressedResult {
  resultUrl: string;
  size: number;
  format: string;
  width: number;
  height: number;
}

/**
 * Checks if user device & image file payload are eligible for local client-side compression.
 */
export function detectCompressorCapabilities(file: File, options: CompressorOptions = {}): boolean {
  if (typeof window === "undefined") return false;

  const isDeviceCapable = detectDeviceCapabilities();
  if (!isDeviceCapable) return false;

  const MAX_LOCAL_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
  if (file.size > MAX_LOCAL_IMAGE_SIZE) return false;

  // HTML5 Canvas ignores quality argument for PNG images.
  // If target format is PNG without WebP transcoding, and user requested compression,
  // route to Sharp backend for libimagequant palette quantization.
  const isPng = options.format === "png" || ((!options.format || options.format === "original") && file.type === "image/png");
  if (isPng && !options.toWebp && (options.quality ?? 80) < 100 && !options.maxWidth && !options.maxHeight) {
    return false;
  }

  return true;
}

/**
 * Executes local client-side image compression in browser memory with a 10-second timeout.
 */
export async function processCompressLocally(
  file: File,
  options: CompressorOptions = {},
  timeoutMs = 10000
): Promise<CompressedResult> {
  if (typeof window === "undefined") {
    throw new Error("Client compressor is only available in browser environment.");
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Local compression timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });

  try {
    const compressionTaskPromise = (async (): Promise<CompressedResult> => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load input image file."));
        img.src = objectUrl;
      });

      URL.revokeObjectURL(objectUrl);

      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;

      if (originalWidth <= 0 || originalHeight <= 0) {
        throw new Error("Invalid image dimensions.");
      }

      // Calculate target dimensions (respecting maxWidth and maxHeight while maintaining aspect ratio)
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      if (options.maxWidth || options.maxHeight) {
        const widthScale = options.maxWidth ? options.maxWidth / originalWidth : 1;
        const heightScale = options.maxHeight ? options.maxHeight / originalHeight : 1;
        const scale = Math.min(widthScale, heightScale, 1);

        targetWidth = Math.round(originalWidth * scale);
        targetHeight = Math.round(originalHeight * scale);
      }

      // Render to OffscreenCanvas or HTMLCanvasElement
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context.");

      // Clear & draw image
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Determine output format & MIME type
      let outputFormat = (options.format || "original").toLowerCase();
      if (options.toWebp) outputFormat = "webp";

      if (outputFormat === "original") {
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        if (fileExt === "png") outputFormat = "png";
        else if (fileExt === "webp") outputFormat = "webp";
        else outputFormat = "jpeg";
      } else if (outputFormat === "jpg") {
        outputFormat = "jpeg";
      }

      const mimeType = `image/${outputFormat}`;
      const qualityFactor = Math.min(1.0, Math.max(0.01, (options.quality ?? 80) / 100));

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), mimeType, qualityFactor);
      });

      if (!blob) {
        throw new Error("Canvas blob conversion failed.");
      }

      const reader = new FileReader();
      const base64DataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to encode compressed image buffer."));
        reader.readAsDataURL(blob);
      });

      return {
        resultUrl: base64DataUrl,
        size: blob.size,
        format: outputFormat,
        width: targetWidth,
        height: targetHeight,
      };
    })();

    const result = await Promise.race([compressionTaskPromise, timeoutPromise]);
    return result;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
