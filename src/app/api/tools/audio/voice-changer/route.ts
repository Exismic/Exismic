import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  requireApiUser,
  validateUploadedFile,
} from "@/lib/api-security";

export const maxDuration = 300;

function providerErrorMessage(status: number) {
  if (status === 401 || status === 403) {
    return "Voice conversion is not configured correctly.";
  }
  if (status === 402) {
    return "Voice conversion capacity has been reached. Please try again later.";
  }
  if (status === 429) {
    return "The voice service is busy. Please wait a moment and retry.";
  }
  return "Voice conversion is temporarily unavailable.";
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();

  try {
    const user = await requireApiUser();
    if (user instanceof NextResponse) return user;

    const limit = checkRateLimit(
      `audio:voice-changer:${user.id}:${getRequestIp(request)}`,
      10,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const input = await request.formData();
    const entry = input.get("file");
    const file = entry instanceof File ? entry : null;
    const fileError = validateUploadedFile(file, {
      maxBytes: 50 * 1024 * 1024,
      allowedMimePrefixes: ["audio/"],
      label: "audio file",
    });
    if (fileError) return fileError;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Voice conversion is not configured yet.",
          code: "VOICE_PROVIDER_NOT_CONFIGURED",
          requestId,
          retryable: false,
        },
        { status: 503 },
      );
    }

    const voiceId =
      process.env.ELEVENLABS_VOICE_CHANGER_VOICE_ID ||
      "JBFqnCBsd6RMkjVDRZzb";
    const body = new FormData();
    body.append("audio", file!);
    body.append("model_id", "eleven_multilingual_sts_v2");
    body.append("remove_background_noise", "true");

    const response = await fetch(
      `https://api.elevenlabs.io/v1/speech-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": apiKey },
        body,
        signal: AbortSignal.timeout(4 * 60 * 1000),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        `[audio:${requestId}] ElevenLabs voice changer returned ${response.status}`,
      );
      return NextResponse.json(
        {
          error: providerErrorMessage(response.status),
          code: "VOICE_PROVIDER_ERROR",
          requestId,
          retryable: response.status !== 401 && response.status !== 403,
        },
        {
          status: response.status === 429 ? 429 : 503,
          headers: { "X-Lumora-Request-Id": requestId },
        },
      );
    }

    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.byteLength === 0) {
      throw new Error("Voice provider returned an empty audio file.");
    }

    const sourceStem =
      file!.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .slice(0, 80) || "lumora-voice";

    return NextResponse.json(
      {
        success: true,
        jobId: requestId,
        task: "voice-change",
        provider: "elevenlabs",
        result: {
          sourceFileName: file!.name,
          tracks: [
            {
              id: "converted",
              label: "Studio Voice",
              url: `data:audio/mpeg;base64,${audio.toString("base64")}`,
              fileName: `${sourceStem}-studio-voice.mp3`,
              mimeType: "audio/mpeg",
            },
          ],
        },
        meta: { requestId },
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Lumora-Request-Id": requestId,
        },
      },
    );
  } catch (error) {
    console.error(`[audio:${requestId}] voice conversion failed`, error);
    return NextResponse.json(
      {
        error: "The voice could not be converted. Try a shorter, clearer clip.",
        code: "VOICE_PROCESSING_FAILED",
        requestId,
        retryable: true,
      },
      {
        status: 500,
        headers: { "X-Lumora-Request-Id": requestId },
      },
    );
  }
}
