import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const language = (formData.get("language") as string) || "eng";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No document or image file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[Cloud OCR API] Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB, lang=${language})...`);

    worker = await createWorker(language, 1);
    const result = await worker.recognize(buffer);
    const text = result.data.text.trim();

    if (!text) {
      return NextResponse.json(
        { success: false, error: "No readable text was detected by server OCR." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      metadata: {
        fileName: file.name,
        confidence: result.data.confidence,
        language,
        provider: "server-ocr-tesseract",
      },
    });
  } catch (error: unknown) {
    console.error("[Cloud OCR API] Error during text recognition:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Cloud OCR recognition failed." },
      { status: 500 }
    );
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
