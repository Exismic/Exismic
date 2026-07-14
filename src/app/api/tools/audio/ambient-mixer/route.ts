import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { Client } from "@gradio/client";

/**
 * AI Music Backing Track Generator Endpoint
 * Connects to Hugging Face MusicGen streaming GPU worker
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`ambient-mixer:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 30 : 10, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const body = await req.json().catch(() => ({}));
    const { 
      prompt, 
      duration = 15,
      seed = 5
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Please enter a visual music prompt description." }, { status: 400 });
    }

    const numericSeed = Math.max(0, Math.min(10, parseInt(seed) || 5));
    const numericDuration = Math.max(10, Math.min(30, parseInt(duration) || 15));

    console.log(`[Ambient Mixer] Generating music loops for: "${prompt}" (Seed: ${numericSeed}, Duration: ${numericDuration}s)`);

    // 1. Connect to active Hugging Face MusicGen Space
    const app = await Client.connect("sanchit-gandhi/musicgen-streaming");

    // 2. Predict on `/generate_audio`
    // Inputs: [Prompt (textbox), Length (slider), Interval (slider), Seed (slider)]
    const result: any = await app.predict("/generate_audio", [
      prompt,
      numericDuration,
      1.5,
      numericSeed
    ]);

    const resultList = result?.data;
    if (!resultList || resultList.length === 0 || !resultList[0]?.url) {
      throw new Error("Gradio Space did not return a valid audio stream path.");
    }

    const streamUrl = resultList[0].url;

    return NextResponse.json({
      url: streamUrl,
      seed: numericSeed
    });

  } catch (error: any) {
    console.error("[Ambient Mixer Route Error]:", error);
    return NextResponse.json({ 
      error: error?.message || "Failed to generate AI background music loop. GPU workers may be busy, please try again." 
    }, { status: 500 });
  }
}
