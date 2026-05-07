import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";

const STORAGE_PATH = path.join(process.cwd(), "public", "results");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string;
    const range = formData.get("range") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Ensure storage directory exists
    try {
      await mkdir(STORAGE_PATH, { recursive: true });
    } catch (e) {}

    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = srcDoc.getPageCount();

    const jobId = uuidv4();
    let fileName = "";
    let fileContent: Buffer | Uint8Array;

    if (mode === "all") {
      // Create a ZIP with all pages
      const zip = new JSZip();
      
      for (let i = 0; i < pageCount; i++) {
        const newDoc = await PDFDocument.create();
        const [page] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(page);
        const pdfBytes = await newDoc.save();
        zip.file(`page_${i + 1}.pdf`, pdfBytes);
      }
      
      fileContent = await zip.generateAsync({ type: "nodebuffer" });
      fileName = `split_${jobId}.zip`;
    } else {
      // Extract specific range
      // Range format: "1-3, 5, 7-10"
      const pagesToExtract: number[] = [];
      const parts = range.split(",").map(p => p.trim());
      
      for (const part of parts) {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map(Number);
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= pageCount) pagesToExtract.push(i - 1);
          }
        } else {
          const p = Number(part);
          if (p > 0 && p <= pageCount) pagesToExtract.push(p - 1);
        }
      }

      if (pagesToExtract.length === 0) {
        return NextResponse.json({ error: "Invalid page range." }, { status: 400 });
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, pagesToExtract);
      copiedPages.forEach(page => newDoc.addPage(page));
      
      fileContent = await newDoc.save();
      fileName = `extracted_${jobId}.pdf`;
    }

    const fullPath = path.join(STORAGE_PATH, fileName);
    await writeFile(fullPath, fileContent);

    return NextResponse.json({
      success: true,
      resultUrl: `/results/${fileName}`
    });

  } catch (error: any) {
    console.error("PDF Split Error:", error);
    return NextResponse.json({ error: error.message || "Failed to split PDF" }, { status: 500 });
  }
}
