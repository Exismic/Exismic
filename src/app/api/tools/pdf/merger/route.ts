import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const STORAGE_PATH = path.join(process.cwd(), "public", "results");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length < 2) {
      return NextResponse.json({ error: "At least two files are required for merging." }, { status: 400 });
    }

    // Ensure storage directory exists
    try {
      await mkdir(STORAGE_PATH, { recursive: true });
    } catch (e) {}

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const jobId = uuidv4();
    const fileName = `merged_${jobId}.pdf`;
    const fullPath = path.join(STORAGE_PATH, fileName);

    await writeFile(fullPath, mergedPdfBytes);

    return NextResponse.json({
      success: true,
      resultUrl: `/results/${fileName}`
    });

  } catch (error: any) {
    console.error("PDF Merge Error:", error);
    return NextResponse.json({ error: error.message || "Failed to merge PDFs" }, { status: 500 });
  }
}
