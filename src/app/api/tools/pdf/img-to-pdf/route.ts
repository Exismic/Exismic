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
    const pageSize = formData.get("pageSize") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided." }, { status: 400 });
    }

    // Ensure storage directory exists
    try {
      await mkdir(STORAGE_PATH, { recursive: true });
    } catch (e) {}

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const contentType = file.type;
      
      let image;
      if (contentType === "image/png") {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else if (contentType === "image/jpeg" || contentType === "image/jpg") {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else {
        // Fallback for other formats - in a real app we'd convert them first
        // For now we'll skip or throw error
        continue;
      }

      const { width, height } = image.scale(1);
      
      let page;
      if (pageSize === "a4") {
        page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
        const scale = Math.min(595.28 / width, 841.89 / height) * 0.9;
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        page.drawImage(image, {
          x: (595.28 - scaledWidth) / 2,
          y: (841.89 - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      } else {
        page = pdfDoc.addPage([width, height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const jobId = uuidv4();
    const fileName = `images_${jobId}.pdf`;
    const fullPath = path.join(STORAGE_PATH, fileName);

    await writeFile(fullPath, pdfBytes);

    return NextResponse.json({
      success: true,
      resultUrl: `/results/${fileName}`
    });

  } catch (error: any) {
    console.error("Image to PDF Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create PDF" }, { status: 500 });
  }
}
