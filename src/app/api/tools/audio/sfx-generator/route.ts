import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";

/**
 * ElevenLabs Sound Generation API Route
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`sfx-gen:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 20 : 5, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const { prompt, duration, influence } = await req.json().catch(() => ({}));

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Please provide a sound description prompt." }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length < 3) {
      return NextResponse.json({ error: "Your prompt description is too short." }, { status: 400 });
    }
    if (cleanPrompt.length > 500) {
      return NextResponse.json({ error: "Prompt is too long. Maximum length is 500 characters." }, { status: 413 });
    }

    // Set duration bounds: 0.5 to 22.0 seconds
    const targetDuration = typeof duration === "number" 
      ? Math.min(22.0, Math.max(0.5, duration))
      : 3.0; // default to 3s

    // Set prompt influence bounds: 0.0 to 1.0
    const targetInfluence = typeof influence === "number"
      ? Math.min(1.0, Math.max(0.0, influence))
      : 0.3; // default to 0.3

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "The sound generation service is currently unavailable. Please configure API credentials." 
      }, { status: 500 });
    }

    console.log(`Generating AI Sound Effect: "${cleanPrompt}" (Duration: ${targetDuration}s, Influence: ${targetInfluence})`);

    const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: cleanPrompt,
        duration_seconds: targetDuration,
        prompt_influence: targetInfluence,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("ElevenLabs SFX Error Response:", errorData);
      
      const errorMessage = errorData?.detail?.message || errorData?.detail || "Failed to generate sound effect";

      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid ElevenLabs API key or missing permissions." }, { status: 401 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: "ElevenLabs monthly quota exceeded." }, { status: 429 });
      }
      if (response.status === 402) {
        return NextResponse.json({ error: "Sound generation is not enabled on your ElevenLabs tier." }, { status: 402 });
      }

      throw new Error(errorMessage);
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[SFX Generator Error]:", error);
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred during audio generation." 
    }, { status: 500 });
  }
}
