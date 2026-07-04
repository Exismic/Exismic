import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  requireApiUser,
  validateUploadedFile,
} from "@/lib/api-security";
import {
  PDF_MAX_FILE_BYTES,
  PdfProcessingError,
  assertPdfSignature,
  createDownloadResponse,
  createPdfRequestId,
  parsePageRange,
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
      `pdf-splitter:${user.id}:${getRequestIp(request)}`,
      20,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await request.formData();
    const entry = formData.get("file");
    const file = entry instanceof File ? entry : null;
    const mode = formData.get("mode") === "range" ? "range" : "all";
    const range = String(formData.get("range") || "");
    const fileError = validateUploadedFile(file, {
      maxBytes: PDF_MAX_FILE_BYTES,
      allowedMimePrefixes: file?.type ? ["application/pdf"] : undefined,
      label: "PDF file",
    });
    if (fileError) return fileError;
    await assertPdfSignature(file!);

    const source = await PDFDocument.load(await file!.arrayBuffer(), {
      updateMetadata: false,
    });
    const pageCount = source.getPageCount();
    if (pageCount === 0) {
      throw new PdfProcessingError(
        "This PDF does not contain any pages.",
        422,
        "EMPTY_PDF",
      );
    }

    const stem = safeDownloadStem(file!.name);
    if (mode === "all") {
      if (pageCount > 500) {
        throw new PdfProcessingError(
          "Splitting every page is limited to 500 pages per document.",
          413,
          "PDF_PAGE_LIMIT",
        );
      }

      const zip = new JSZip();
      const digits = String(pageCount).length;
      for (let index = 0; index < pageCount; index += 1) {
        const output = await PDFDocument.create();
        const [page] = await output.copyPages(source, [index]);
        output.addPage(page);
        zip.file(
          `page-${String(index + 1).padStart(digits, "0")}.pdf`,
          await output.save({ useObjectStreams: true }),
        );
      }
      const bytes = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      const fileName = `${stem}-split-pages.zip`;
      return createDownloadResponse(bytes, {
        fileName,
        contentType: "application/zip",
        requestId,
        headers: {
          "X-Lumora-File-Name": encodeURIComponent(fileName),
          "X-Lumora-Page-Count": String(pageCount),
          "X-Lumora-Output-Type": "zip",
        },
      });
    }

    const indexes = parsePageRange(range, pageCount);
    const output = await PDFDocument.create();
    const copiedPages = await output.copyPages(source, indexes);
    copiedPages.forEach((page) => output.addPage(page));
    const bytes = await output.save({ useObjectStreams: true });
    const fileName = `${stem}-pages.pdf`;

    return createDownloadResponse(bytes, {
      fileName,
      contentType: "application/pdf",
      requestId,
      headers: {
        "X-Lumora-File-Name": encodeURIComponent(fileName),
        "X-Lumora-Page-Count": String(indexes.length),
        "X-Lumora-Output-Type": "pdf",
      },
    });
  } catch (error) {
    return pdfErrorResponse(error, requestId);
  }
}
