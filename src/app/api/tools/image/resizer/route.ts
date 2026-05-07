import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const cropData = JSON.parse(formData.get("crop") as string);
    const targetWidth = parseInt(formData.get("width") as string);
    const targetHeight = parseInt(formData.get("height") as string);
    const format = formData.get("format") as string;
    const quality = parseInt(formData.get("quality") as string);

    if (!file || !cropData) {
      return NextResponse.json({ error: "File and crop data are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer);

    // 1. Perform the Crop (extracting pixels relative to original image size)
    pipeline = pipeline.extract({
      left: Math.round(cropData.x),
      top: Math.round(cropData.y),
      width: Math.round(cropData.width),
      height: Math.round(cropData.height)
    });

    // 2. Perform the Resize to target dimensions
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      fit: "fill" // Since we already cropped to the desired ratio
    });

    // 3. Encoder Settings
    if (format === "webp") {
      pipeline = pipeline.webp({ quality });
    } else if (format === "png") {
      pipeline = pipeline.png({ quality: quality, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    const resultBuffer = await pipeline.toBuffer();

    return NextResponse.json({
      success: true,
      result: `data:image/${format === "jpg" ? "jpeg" : format};base64,${resultBuffer.toString("base64")}`,
      size: resultBuffer.length
    });

  } catch (error: any) {
    console.error("Resizer API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
