import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  getOptionalApiUser,
  validateUploadedFile,
} from "@/lib/api-security";
import {
  PdfProcessingError,
  createDownloadResponse,
  createPdfRequestId,
  pdfErrorResponse,
  safeDownloadStem,
} from "@/lib/pdf-processing";

export const maxDuration = 120;

const A4 = { width: 595.28, height: 841.89 };
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export async function POST(request: NextRequest) {
  const requestId = createPdfRequestId();

  try {
    const user = await getOptionalApiUser();
    const limit = checkRateLimit(
      `img-to-pdf:${user?.id || "guest"}:${getRequestIp(request)}`,
      user ? 20 : 6,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);
    const pageSize = formData.get("pageSize") === "a4" ? "a4" : "auto";

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Select at least one image.", requestId },
        { status: 400 },
      );
    }
    if (files.length > 40) {
      return NextResponse.json(
        { error: "You can convert up to 40 images at once.", requestId },
        { status: 400 },
      );
    }
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > 120 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Images are too large. Maximum combined size is 120MB.",
          requestId,
        },
        { status: 413 },
      );
    }

    const document = await PDFDocument.create();
    for (const file of files) {
      const fileError = validateUploadedFile(file, {
        maxBytes: 25 * 1024 * 1024,
        allowedMimePrefixes: file.type ? ["image/"] : undefined,
        label: "image file",
      });
      if (fileError) return fileError;
      if (file.type && !SUPPORTED_IMAGE_TYPES.has(file.type.toLowerCase())) {
        throw new PdfProcessingError(
          `${file.name} is not a supported PNG, JPG, WebP, AVIF, or HEIC image.`,
          415,
          "UNSUPPORTED_IMAGE",
        );
      }

      const source = Buffer.from(await file.arrayBuffer());
      const pipeline = sharp(source, {
        failOn: "error",
        limitInputPixels: 100_000_000,
      }).rotate();
      const metadata = await pipeline.metadata();
      if (!metadata.width || !metadata.height) {
        throw new PdfProcessingError(
          `${file.name} could not be decoded.`,
          422,
          "INVALID_IMAGE",
        );
      }

      const preserveAlpha = Boolean(metadata.hasAlpha);
      const normalized = preserveAlpha
        ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
        : await pipeline.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
      const image = preserveAlpha
        ? await document.embedPng(normalized)
        : await document.embedJpg(normalized);
      const { width, height } = image.scale(1);

      if (pageSize === "a4") {
        const page = document.addPage([A4.width, A4.height]);
        const scale = Math.min(
          (A4.width - 56) / width,
          (A4.height - 56) / height,
        );
        const drawWidth = width * scale;
        const drawHeight = height * scale;
        page.drawImage(image, {
          x: (A4.width - drawWidth) / 2,
          y: (A4.height - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight,
        });
      } else {
        const page = document.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }
    }

    const bytes = await document.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    const fileName = `${safeDownloadStem(files[0].name, "images")}-images.pdf`;
    return createDownloadResponse(bytes, {
      fileName,
      contentType: "application/pdf",
      requestId,
      headers: {
        "X-Exismic-File-Name": encodeURIComponent(fileName),
        "X-Exismic-Page-Count": String(files.length),
      },
    });
  } catch (error) {
    return pdfErrorResponse(error, requestId);
  }
}
