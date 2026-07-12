import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";

export async function POST(req: NextRequest) {
  try {
    const limit = checkRateLimit(`qr:guest:${getRequestIp(req)}`, 30, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const prompt = file ? await file.text() : "";

    if (!prompt) {
      return NextResponse.json({ error: "No URL or text provided" }, { status: 400 });
    }

    // Use a reliable QR Generation API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(prompt)}`;

    return NextResponse.json({ 
      success: true, 
      result: qrUrl 
    });

  } catch (error: unknown) {
    console.error(`QR Gen Error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
