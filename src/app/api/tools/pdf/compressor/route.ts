import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  requireApiUser,
  validateUploadedFile,
} from "@/lib/api-security";
import {
  PDF_MAX_FILE_BYTES,
  assertPdfSignature,
  createDownloadResponse,
  createPdfRequestId,
  pdfErrorResponse,
  safeDownloadStem,
} from "@/lib/pdf-processing";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const requestId = createPdfRequestId();

  try {
    const user = await requireApiUser();
    if (user instanceof NextResponse) return user;
    const limit = checkRateLimit(
      `pdf-compressor:${user.id}:${getRequestIp(request)}`,
      20,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await request.formData();
    const entry = formData.get("file");
    const file = entry instanceof File ? entry : null;
    const requestedLevel = String(formData.get("level") || "medium");
    const level = ["low", "medium", "high"].includes(requestedLevel)
      ? requestedLevel
      : "medium";
    const fileError = validateUploadedFile(file, {
      maxBytes: PDF_MAX_FILE_BYTES,
      allowedMimePrefixes: file?.type ? ["application/pdf"] : undefined,
      label: "PDF file",
    });
    if (fileError) return fileError;
    await assertPdfSignature(file!);

    const original = Buffer.from(await file!.arrayBuffer());
    const document = await PDFDocument.load(original, {
      updateMetadata: false,
    });

    if (level === "medium" || level === "high") {
      document.setCreator("");
      document.setProducer("Lumora PDF Optimizer");
    }
    if (level === "high") {
      document.setTitle("");
      document.setAuthor("");
      document.setSubject("");
      document.setKeywords([]);
    }

    const optimized = await document.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
      objectsPerTick: 50,
    });
    const output =
      optimized.byteLength < original.byteLength ? optimized : original;
    const didOptimize = output.byteLength < original.byteLength;
    const fileName = `${safeDownloadStem(file!.name)}-optimized.pdf`;

    return createDownloadResponse(output, {
      fileName,
      contentType: "application/pdf",
      requestId,
      headers: {
        "X-Lumora-File-Name": encodeURIComponent(fileName),
        "X-Lumora-Original-Size": String(original.byteLength),
        "X-Lumora-Output-Size": String(output.byteLength),
        "X-Lumora-Optimized": String(didOptimize),
        "X-Lumora-Compression-Mode": level,
      },
    });
  } catch (error) {
    return pdfErrorResponse(error, requestId);
  }
}
