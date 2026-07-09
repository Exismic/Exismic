import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const VIDEO_MAX_BYTES = 250 * 1024 * 1024;

type ModalPayload = {
  success?: boolean;
  error?: string;
  file_data_base64?: string;
  file_name?: string;
  srt?: string;
};

export class VideoProcessingError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;

  constructor(
    message: string,
    status = 422,
    code = "VIDEO_PROCESSING_FAILED",
    retryable = false,
  ) {
    super(message);
    this.name = "VideoProcessingError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

export function createVideoRequestId() {
  return randomUUID();
}

export function safeVideoStem(fileName: string) {
  return (
    fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "exismic-video"
  );
}

export async function assertVideoSignature(file: File) {
  const header = Buffer.from(await file.slice(0, 16).arrayBuffer());
  const isIsoMedia = header.subarray(4, 8).toString("ascii") === "ftyp";
  const isWebm =
    header[0] === 0x1a &&
    header[1] === 0x45 &&
    header[2] === 0xdf &&
    header[3] === 0xa3;
  const isAvi =
    header.subarray(0, 4).toString("ascii") === "RIFF" &&
    header.subarray(8, 12).toString("ascii") === "AVI ";
  const isOgg = header.subarray(0, 4).toString("ascii") === "OggS";
  const isMpeg =
    header[0] === 0x00 &&
    header[1] === 0x00 &&
    header[2] === 0x01 &&
    (header[3] === 0xba || header[3] === 0xb3);

  if (!isIsoMedia && !isWebm && !isAvi && !isOgg && !isMpeg) {
    throw new VideoProcessingError(
      "This file is not a supported MP4, MOV, WebM, AVI, OGG, or MPEG video.",
      415,
      "INVALID_VIDEO",
    );
  }
}

export function resolveVideoEndpoint(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedBase.endsWith(normalizedPath)
    ? normalizedBase
    : `${normalizedBase}${normalizedPath}`;
}

export async function callVideoModal(
  endpoint: string,
  payload: Record<string, unknown>,
  requestId: string,
  timeoutMs = 10 * 60 * 1000,
) {
  const apiKey = process.env.MODAL_VIDEO_API_KEY;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      "X-Exismic-Request-Id": requestId,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`[video:${requestId}] provider returned ${response.status}`);
    throw new VideoProcessingError(
      response.status === 429
        ? "The video processor is busy. Please wait a moment and retry."
        : "The video processor is temporarily unavailable.",
      response.status === 429 ? 429 : 503,
      "VIDEO_PROVIDER_ERROR",
      true,
    );
  }

  const result = (await response.json()) as ModalPayload;
  if (!result.success) {
    throw new VideoProcessingError(
      result.error || "The video processor could not complete this job.",
      503,
      "VIDEO_PROVIDER_FAILED",
      true,
    );
  }
  return result;
}

export function decodeProviderFile(data: string | undefined) {
  if (!data) {
    throw new VideoProcessingError(
      "The video processor returned no output file.",
      502,
      "EMPTY_VIDEO_OUTPUT",
      true,
    );
  }
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(data);
  const mimeType = match?.[1] || "video/mp4";
  const encoded = match?.[2] || data;
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.byteLength === 0) {
    throw new VideoProcessingError(
      "The video processor returned an empty output file.",
      502,
      "EMPTY_VIDEO_OUTPUT",
      true,
    );
  }
  return { bytes, mimeType };
}

export function createVideoDownloadResponse(
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
      "X-Exismic-File-Name": encodeURIComponent(options.fileName),
      "X-Exismic-Request-Id": options.requestId,
      ...options.headers,
    },
  });
}

export function videoErrorResponse(error: unknown, requestId: string) {
  const known = error instanceof VideoProcessingError;
  const message = known
    ? error.message
    : "The video could not be processed. Please check the file and try again.";
  const status = known ? error.status : 500;

  if (!known) {
    console.error(`[video:${requestId}] processing failed`, error);
  }

  return NextResponse.json(
    {
      error: message,
      code: known ? error.code : "VIDEO_PROCESSING_FAILED",
      requestId,
      retryable: known ? error.retryable : true,
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
