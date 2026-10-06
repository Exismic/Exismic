import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";

export async function POST(req: NextRequest) {
  try {
    const limit = await checkRateLimit(`qr:guest:${getRequestIp(req)}`, 30, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const prompt = file ? await file.text() : "";

    if (!prompt) {
      return publicJson({ error: "No URL or text provided" }, { status: 400 });
    }

    // Use a reliable QR Generation API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(prompt)}`;

    return publicJson({
      success: true,
      result: qrUrl
    });

  } catch (error: unknown) {
    console.error(`QR Gen Error:`, error);
    return publicJson({ error: "Internal server error" }, { status: 500 });
  }
}
