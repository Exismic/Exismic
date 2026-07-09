import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const PDF_MAX_FILE_BYTES = 80 * 1024 * 1024;

export class PdfProcessingError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(
    message: string,
    status = 422,
    code = "PDF_PROCESSING_FAILED",
  ) {
    super(message);
    this.name = "PdfProcessingError";
    this.status = status;
    this.code = code;
  }
}

export function createPdfRequestId() {
  return randomUUID();
}

export async function assertPdfSignature(file: File) {
  const signature = Buffer.from(await file.slice(0, 5).arrayBuffer()).toString(
    "ascii",
  );
  if (signature !== "%PDF-") {
    throw new PdfProcessingError(
      "This file is not a valid PDF document.",
      415,
      "INVALID_PDF",
    );
  }
}

export function safeDownloadStem(fileName: string, fallback = "exismic-document") {
  return (
    fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || fallback
  );
}

export function createDownloadResponse(
  bytes: Uint8Array | Buffer,
  options: {
    fileName: string;
    contentType: string;
    requestId: string;
    headers?: Record<string, string>;
  },
) {
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": options.contentType,
      "Content-Disposition": `attachment; filename="${options.fileName.replace(/["\r\n]/g, "")}"`,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Exismic-Request-Id": options.requestId,
      ...options.headers,
    },
  });
}

export function pdfErrorResponse(error: unknown, requestId: string) {
  const isKnown = error instanceof PdfProcessingError;
  const rawMessage = error instanceof Error ? error.message : "";
  const passwordProtected =
    /password|encrypted|encryption/i.test(rawMessage);
  const message = passwordProtected
    ? "Password-protected PDFs are not supported. Unlock the file and try again."
    : isKnown
      ? error.message
      : "The PDF could not be processed. Please check the file and try again.";
  const status = passwordProtected ? 422 : isKnown ? error.status : 500;
  const code = passwordProtected
    ? "PDF_PASSWORD_PROTECTED"
    : isKnown
      ? error.code
      : "PDF_PROCESSING_FAILED";

  if (!isKnown) {
    console.error(`[pdf:${requestId}] processing failed`, error);
  }

  return NextResponse.json(
    {
      error: message,
      code,
      requestId,
      retryable: status >= 500,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Exismic-Request-Id": requestId,
      },
    },
  );
}

export function parsePageRange(range: string, pageCount: number) {
  const normalized = range.trim();
  if (!normalized || normalized.length > 300) {
    throw new PdfProcessingError(
      "Enter a page range such as 1-3, 5, 8-10.",
      400,
      "INVALID_PAGE_RANGE",
    );
  }

  const indexes = new Set<number>();
  for (const rawPart of normalized.split(",")) {
    const part = rawPart.trim();
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part);
    if (!match) {
      throw new PdfProcessingError(
        `Invalid page range segment: "${part}".`,
        400,
        "INVALID_PAGE_RANGE",
      );
    }

    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 1 ||
      end < start ||
      end > pageCount
    ) {
      throw new PdfProcessingError(
        `Choose pages between 1 and ${pageCount}.`,
        400,
        "PAGE_RANGE_OUT_OF_BOUNDS",
      );
    }

    if (end - start > 2_000) {
      throw new PdfProcessingError(
        "That page range is too large.",
        400,
        "PAGE_RANGE_TOO_LARGE",
      );
    }

    for (let page = start; page <= end; page += 1) {
      indexes.add(page - 1);
    }
  }

  if (indexes.size === 0) {
    throw new PdfProcessingError(
      "Select at least one page.",
      400,
      "EMPTY_PAGE_RANGE",
    );
  }

  return [...indexes].sort((a, b) => a - b);
}
