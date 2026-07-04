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
      `pdf-merger:${user.id}:${getRequestIp(request)}`,
      20,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (files.length < 2) {
      return NextResponse.json(
        { error: "Select at least two PDF files.", requestId },
        { status: 400 },
      );
    }
    if (files.length > 20) {
      return NextResponse.json(
        { error: "You can merge up to 20 PDFs at once.", requestId },
        { status: 400 },
      );
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > 160 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Combined PDFs are too large. Maximum total size is 160MB.",
          requestId,
        },
        { status: 413 },
      );
    }

    const merged = await PDFDocument.create();
    let totalPages = 0;

    for (const file of files) {
      const fileError = validateUploadedFile(file, {
        maxBytes: PDF_MAX_FILE_BYTES,
        allowedMimePrefixes: file.type ? ["application/pdf"] : undefined,
        label: "PDF file",
      });
      if (fileError) return fileError;
      await assertPdfSignature(file);

      const source = await PDFDocument.load(await file.arrayBuffer(), {
        updateMetadata: false,
      });
      const pageIndexes = source.getPageIndices();
      totalPages += pageIndexes.length;
      const copiedPages = await merged.copyPages(source, pageIndexes);
      copiedPages.forEach((page) => merged.addPage(page));
    }

    const bytes = await merged.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });
    const outputName = `${safeDownloadStem(files[0].name, "merged")}-merged.pdf`;

    return createDownloadResponse(bytes, {
      fileName: outputName,
      contentType: "application/pdf",
      requestId,
      headers: {
        "X-Lumora-File-Name": encodeURIComponent(outputName),
        "X-Lumora-Page-Count": String(totalPages),
        "X-Lumora-Source-Count": String(files.length),
      },
    });
  } catch (error) {
    return pdfErrorResponse(error, requestId);
  }
}
