import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const quality = parseInt(formData.get("quality") as string || "80");
    const toWebp = formData.get("toWebp") === "true";
    const format = formData.get("format") as string || "original";
    const maxWidth = formData.get("maxWidth") ? parseInt(formData.get("maxWidth") as string) : null;
    const maxHeight = formData.get("maxHeight") ? parseInt(formData.get("maxHeight") as string) : null;
    const removeMetadata = formData.get("removeMetadata") === "true";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer);

    // 1. Metadata Stripping
    if (removeMetadata) {
      // By default sharp doesn't keep metadata unless .withMetadata() is called.
      // So we just don't call it. 
    } else {
      pipeline = pipeline.withMetadata();
    }

    // 2. Resizing
    if (maxWidth || maxHeight) {
      pipeline = pipeline.resize({
        width: maxWidth || undefined,
        height: maxHeight || undefined,
        fit: "inside",
        withoutEnlargement: true
      });
    }

    // 3. Format Conversion & Compression
    let targetFormat = format;
    if (toWebp) targetFormat = "webp";
    
    if (targetFormat === "original") {
      const metadata = await sharp(buffer).metadata();
      targetFormat = metadata.format || "jpeg";
    }

    switch (targetFormat) {
      case "webp":
        pipeline = pipeline.webp({ quality, effort: 6 });
        break;
      case "png":
        pipeline = pipeline.png({ quality, compressionLevel: 9, palette: true });
        break;
      case "jpg":
      case "jpeg":
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality, effort: 4 });
        break;
      default:
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    const resultBuffer = await pipeline.toBuffer();
    const mime = `image/${targetFormat === "jpg" ? "jpeg" : targetFormat}`;

    return NextResponse.json({
      success: true,
      result: `data:${mime};base64,${resultBuffer.toString("base64")}`,
      size: resultBuffer.length,
      format: targetFormat
    });

  } catch (error: any) {
    console.error("Compression API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
