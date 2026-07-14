import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import sharp from "sharp";

// Import Potrace classes directly
const Potrace = require("potrace").Potrace;
const Bitmap = require("potrace/lib/types/Bitmap");

/**
 * Image Vectorizer (Raster to SVG converter) API Route
 * Bypasses Jimp using sharp for high-performance pixel extraction.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`vectorizer:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 50 : 15, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid form data submission." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image file uploaded." }, { status: 400 });
    }

    // Read and bound trace threshold: 0 to 255
    const thresholdVal = formData.get("threshold");
    const threshold = thresholdVal ? Math.min(255, Math.max(0, Number(thresholdVal))) : 128;

    // Read vector path & background colors
    const colorVal = formData.get("color");
    const color = typeof colorVal === "string" ? colorVal.trim() : "#000000";

    const bgVal = formData.get("background");
    const background = typeof bgVal === "string" ? bgVal.trim() : "transparent";

    // Read turn policy optimization parameters
    const turnVal = formData.get("turnPolicy");
    const turnPolicy = typeof turnVal === "string" ? turnVal.trim() : "minority";

    // Convert uploaded file into a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Vectorizing file: "${file.name}" (Threshold: ${threshold}, Color: ${color}, BG: ${background}, Policy: ${turnPolicy})`);

    // 1. Extract raw pixels, width, and height using sharp
    const { data: rawPixels, info } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    // 2. Instantiate Potrace's internal Bitmap class
    const bitmap = new Bitmap(width, height);

    // 3. Convert raw RGB/RGBA pixels to grayscale luminance values
    for (let i = 0; i < bitmap.size; i++) {
      const idx = i * channels;
      const r = rawPixels[idx];
      const g = rawPixels[idx + 1];
      const b = rawPixels[idx + 2];
      
      // Blend background (assuming white background behind transparency)
      let opacity = 1;
      if (channels === 4) {
        opacity = rawPixels[idx + 3] / 255;
      }
      
      const blendedR = 255 + (r - 255) * opacity;
      const blendedG = 255 + (g - 255) * opacity;
      const blendedB = 255 + (b - 255) * opacity;
      
      // Grayscale luminance formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
      const lum = 0.2126 * blendedR + 0.7152 * blendedG + 0.0722 * blendedB;
      bitmap.data[i] = Math.round(lum);
    }

    // 4. Instantiate Potrace and trace the bitmap directly
    const traceInstance = new Potrace({
      threshold,
      color,
      background,
      turnPolicy,
    });

    // Manually assign computed luminance data to bypass potrace's internal Jimp loaders
    traceInstance._luminanceData = bitmap;
    traceInstance._imageLoaded = true;
    traceInstance._processed = false;

    // 5. Get the SVG output string
    const svgContent = traceInstance.getSVG();

    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Length": Buffer.byteLength(svgContent).toString(),
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}.svg"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error: any) {
    console.error("[Vectorizer Server Error]:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred during image vectorization." 
    }, { status: 500 });
  }
}
