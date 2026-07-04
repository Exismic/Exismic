import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  requireApiUser,
  validateUploadedFile,
} from "@/lib/api-security";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function getGroqApiKey() {
  return (
    process.env.GROQ_API_KEY ||
    process.env.GROQ_API_KEYS?.split(",").map((key) => key.trim()).find(Boolean)
  );
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    if (user instanceof NextResponse) return user;

    const limit = checkRateLimit(
      `speech-to-text:${user.id}:${getRequestIp(req)}`,
      20,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const requestData = await req.formData();
    const file = requestData.get("file") as File | null;
    const language = String(requestData.get("language") || "auto").trim();
    const fileError = validateUploadedFile(file, {
      maxBytes: MAX_AUDIO_BYTES,
      allowedMimePrefixes: ["audio/", "video/"],
      label: "audio file",
    });
    if (fileError) return fileError;

    const apiKey = getGroqApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Speech transcription is not configured." },
        { status: 503 },
      );
    }

    const providerData = new FormData();
    providerData.append("file", file!);
    providerData.append("model", "whisper-large-v3-turbo");
    providerData.append("response_format", "verbose_json");
    providerData.append("temperature", "0");
    if (language !== "auto") providerData.append("language", language);

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: providerData,
        signal: AbortSignal.timeout(120_000),
      },
    );

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("[SpeechToText] Provider error", response.status, result);
      const providerMessage =
        result && typeof result === "object" && "error" in result
          ? (result.error as { message?: string })?.message
          : null;
      return NextResponse.json(
        { error: providerMessage || "The transcription service could not process this file." },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    const text =
      result && typeof result === "object" && "text" in result
        ? String(result.text || "").trim()
        : "";
    if (!text) {
      return NextResponse.json(
        { error: "No speech was detected in this recording." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      text,
      language:
        result && typeof result === "object" && "language" in result
          ? result.language
          : language,
      duration:
        result && typeof result === "object" && "duration" in result
          ? result.duration
          : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Transcription failed.";
    console.error("[SpeechToText]", error);
    return NextResponse.json(
      {
        error: message.includes("timeout")
          ? "Transcription timed out. Try a shorter recording."
          : "Transcription failed. Please try another recording.",
      },
      { status: message.includes("timeout") ? 504 : 500 },
    );
  }
}
