import { detectDeviceCapabilities } from "@/lib/device-capability";
import type { LoggerMessage, Worker } from "tesseract.js";

/**
 * Checks if the user's device & file payload are eligible for local OCR execution.
 */
export function detectOcrCapabilities(file: File): boolean {
  if (typeof window === "undefined") return false;

  // 1. Device hardware capabilities check (CPU cores >= 4, WebGPU/WASM, fast connection)
  const isDeviceCapable = detectDeviceCapabilities();
  if (!isDeviceCapable) return false;

  // 2. Payload size check (files > 15MB are offloaded to cloud OCR to save client memory)
  const MAX_LOCAL_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  if (file.size > MAX_LOCAL_FILE_SIZE) {
    return false;
  }

  return true;
}

/**
 * Executes local OCR text extraction in a Tesseract Web Worker with a strict 20-second timeout.
 */
export async function processOcrLocally(
  file: File,
  language: string,
  onProgress?: (percent: number, statusMessage: string) => void,
  timeoutMs = 20000
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Client OCR is only available in browser environment.");
  }

  let activeWorker: Worker | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Local OCR timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });

  try {
    const ocrTaskPromise = (async () => {
      try {
        const { createWorker } = await import("tesseract.js");
        let currentPage = 0;
        let totalPages = 1;

        const worker = await createWorker(language, 1, {
          logger: (message: LoggerMessage) => {
            if (message.status === "recognizing text" && onProgress) {
              const overall =
                ((currentPage + Math.max(0, Math.min(1, message.progress))) /
                  totalPages) *
                100;
              const statusStr =
                totalPages > 1
                  ? `Reading page ${currentPage + 1} of ${totalPages}`
                  : `Recognizing text ${Math.round(message.progress * 100)}%`;
              onProgress(Math.round(overall), statusStr);
            }
          },
        });
        activeWorker = worker;

        let fullText = "";

        if (file.type === "application/pdf") {
          const pdfjsLib = (window as unknown as { pdfjsLib?: any }).pdfjsLib;
          if (!pdfjsLib) {
            throw new Error("PDF rendering engine not loaded.");
          }

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          totalPages = pdf.numPages;

          if (totalPages > 50) {
            throw new Error("PDF scan exceeds 50 pages limit.");
          }

          for (let i = 1; i <= totalPages; i++) {
            currentPage = i - 1;
            if (onProgress) onProgress(Math.round((currentPage / totalPages) * 100), `Rendering page ${i} of ${totalPages}`);
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Canvas context initialization failed.");

            canvas.height = Math.ceil(viewport.height);
            canvas.width = Math.ceil(viewport.width);
            await page.render({ canvasContext: context, viewport }).promise;

            const result = await worker.recognize(canvas);
            fullText += `Page ${i}\n${result.data.text.trim()}\n\n`;

            canvas.width = 1;
            canvas.height = 1;
          }
        } else {
          const result = await worker.recognize(file);
          fullText = result.data.text;
        }

        const trimmedText = fullText.trim();
        if (!trimmedText) {
          throw new Error("No readable text detected in document.");
        }

        return trimmedText;
      } finally {
        if (activeWorker) {
          try {
            await activeWorker.terminate();
          } catch {
            // ignore
          }
        }
      }
    })();

    const extractedText = await Promise.race([ocrTaskPromise, timeoutPromise]);
    return extractedText;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

