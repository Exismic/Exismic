import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import potrace from "potrace";

/**
 * Image Vectorizer (Raster to SVG converter) API Route
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

    // Convert uploaded file into a node buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Vectorizing file: "${file.name}" (Threshold: ${threshold}, Color: ${color}, BG: ${background}, Policy: ${turnPolicy})`);

    // Promisify the potrace tracing algorithm
    const svgContent = await new Promise<string>((resolve, reject) => {
      potrace.trace(
        buffer,
        {
          threshold,
          color,
          background,
          turnPolicy,
        },
        (err, svgString) => {
          if (err) {
            reject(err);
          } else {
            resolve(svgString);
          }
        }
      );
    });

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
