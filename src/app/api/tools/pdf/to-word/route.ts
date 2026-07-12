import { NextRequest } from "next/server";
import JSZip from "jszip";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  getOptionalApiUser,
  validateUploadedFile,
} from "@/lib/api-security";
import {
  PDF_MAX_FILE_BYTES,
  PdfProcessingError,
  assertPdfSignature,
  createDownloadResponse,
  createPdfRequestId,
  pdfErrorResponse,
  safeDownloadStem,
} from "@/lib/pdf-processing";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createParagraphXml(text: string) {
  if (!text.trim()) return "<w:p/>";
  return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

async function createEditableDocx(text: string, layout: string) {
  const zip = new JSZip();
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const sections = layout === "precise"
    ? normalized.split("\n")
    : normalized.split(/\n{2,}/).map((part) => part.replace(/\n/g, " "));
  const body = sections.map(createParagraphXml).join("");

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`,
  );
  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.folder("word")?.file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body>
</w:document>`,
  );
  zip.folder("word")?.file(
    "styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr>
  </w:style>
</w:styles>`,
  );
  zip.folder("word")?.folder("_rels")?.file(
    "document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
  );

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
}

export async function POST(req: NextRequest) {
  const requestId = createPdfRequestId();
  try {
    const user = await getOptionalApiUser();
    const limit = checkRateLimit(
      `pdf-to-word:${user?.id || "guest"}:${getRequestIp(req)}`,
      user ? 20 : 6,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const layout = formData.get("layout") === "standard" ? "standard" : "precise";
    const fileError = validateUploadedFile(file, {
      maxBytes: PDF_MAX_FILE_BYTES,
      allowedMimePrefixes: file?.type ? ["application/pdf"] : undefined,
      label: "PDF file",
    });
    if (fileError) return fileError;
    await assertPdfSignature(file!);

    const pdfBuffer = Buffer.from(await file!.arrayBuffer());
    const parsed = await pdfParse(pdfBuffer);
    const extractedText = parsed.text?.trim();
    if (!extractedText) {
      throw new PdfProcessingError(
        "This PDF has no extractable text. Use OCR for scanned documents.",
        422,
        "PDF_TEXT_NOT_FOUND",
      );
    }

    const docxBuffer = await createEditableDocx(extractedText, layout);
    const fileName = `${safeDownloadStem(file!.name)}-editable.docx`;
    return createDownloadResponse(docxBuffer, {
      fileName,
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      requestId,
      headers: {
        "X-Exismic-File-Name": encodeURIComponent(fileName),
        "X-Exismic-Page-Count": String(parsed.numpages),
        "X-Exismic-Character-Count": String(extractedText.length),
        "X-Exismic-Layout": layout,
      },
    });
  } catch (error: unknown) {
    return pdfErrorResponse(error, requestId);
  }
}
