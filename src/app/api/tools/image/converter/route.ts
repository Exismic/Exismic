import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const targetFormat = (formData.get("targetFormat") as string || "webp").toLowerCase();
    const quality = parseInt(formData.get("quality") as string || "90");

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer);

    // Dynamic Format Conversion map
    switch (targetFormat) {
      case "webp":
        pipeline = pipeline.webp({ quality });
        break;
      case "png":
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      case "jpg":
      case "jpeg":
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case "gif":
        pipeline = pipeline.gif();
        break;
      case "bmp":
        return NextResponse.json({ 
          success: false, 
          error: "BMP format is currently not supported by our Neural Engine. Please use WEBP or PNG for high-fidelity lossless conversion." 
        }, { status: 400 });
      default:
        pipeline = pipeline.webp({ quality });
    }

    const resultBuffer = await pipeline.toBuffer();
    const mime = `image/${targetFormat === "jpg" ? "jpeg" : targetFormat}`;

    return NextResponse.json({
      success: true,
      result: `data:${mime};base64,${resultBuffer.toString("base64")}`,
      size: resultBuffer.length
    });

  } catch (error: any) {
    console.error("Converter API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
