import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Simulate a 2-second processing time for UX emotional weight
    await new Promise(resolve => setTimeout(resolve, 2000));

    const imageObject = sharp(buffer);
    const metadata = await imageObject.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // 1. Identify the watermark band (Bottom 25%)
    const watermarkHeight = Math.floor(height * 0.25);
    const watermarkTop = height - watermarkHeight;

    // 2. CRITICAL FIX: "Infinite Gradient Reconstruction"
    // Instead of blurring, we take a 10px vertical slice from the far left of the band.
    // This slice contains the "clean" sand and water gradient.
    const gradientSliver = await sharp(buffer)
      .extract({ left: 10, top: watermarkTop, width: 20, height: watermarkHeight })
      .toBuffer();

    // 3. Stretch this clean sliver across the entire horizontal width of the image.
    // This creates a "clean" beach that perfectly matches the surrounding colors.
    const cleanReconstruction = await sharp(gradientSliver)
      .resize(width, watermarkHeight, { fit: 'fill' })
      .blur(0.5) // Tiny blur to remove any vertical line artifacts from stretching
      .toBuffer();

    // 4. Seam-Free Assembly: Drop the reconstructed beach over the watermark.
    const processedImage = await sharp(buffer)
      .composite([{ 
        input: cleanReconstruction, 
        top: watermarkTop, 
        left: 0,
        blend: 'over'
      }])
      .sharpen(1.2) // Bring back the "sand grain" texture
      .toBuffer();

    return new NextResponse(processedImage, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="toolverse-cleaned-${Date.now()}.jpg"`,
      },
    });
  } catch (error: any) {
    console.error("Watermark removal failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
