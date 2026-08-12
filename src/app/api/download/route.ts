import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fileUrl = searchParams.get("url");
  const fileName = searchParams.get("name") || "exismic-download.png";

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
  }

  try {
    // If data URI
    if (fileUrl.startsWith("data:")) {
      const parts = fileUrl.split(",");
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
      const base64Data = parts[1];
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Fetch remote URL
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const contentType = String(response.headers["content-type"] || "image/png");

    return new NextResponse(new Uint8Array(response.data), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: "Failed to download requested file" }, { status: 500 });
  }
}
