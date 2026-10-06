import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  getOptionalApiUser,
  validateUploadedFile,
} from "@/lib/api-security";
import {
  VideoProcessingError,
  assertVideoSignature,
  callVideoModal,
  createVideoRequestId,
  resolveVideoEndpoint,
  videoErrorResponse,
} from "@/lib/video-processing";

export const maxDuration = 300;

function getGroqApiKey() {
  return (
    process.env.GROQ_API_KEY ||
    process.env.GROQ_API_KEYS?.split(",").map((k) => k.trim()).find(Boolean)
  );
}

function formatSrtTimestamp(seconds: number): string {
  const pad = (n: number, z = 2) => String(Math.floor(n)).padStart(z, "0");
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

interface GroqSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
}

export async function POST(req: NextRequest) {
  const requestId = createVideoRequestId();
  try {
    const authUser = await getOptionalApiUser();
    const limit = await checkRateLimit(
      `video-subtitles:${authUser?.id || getRequestIp(req)}`,
      authUser ? 20 : 8,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter, limit.unavailable);

    const formData = await req.formData();
    const file = formData.get("video") as File;
    const requestedLanguage = String(formData.get("language") || "auto").trim();
    const burn = formData.get("burn") === "true";

    const fileError = validateUploadedFile(file, {
      maxBytes: 250 * 1024 * 1024,
      allowedMimePrefixes: ["video/", "audio/"],
      label: "media file",
    });
    if (fileError) return fileError;

    // Verify video signature if it's a video file and not a client-extracted audio WAV
    if (file.type.startsWith("video/")) {
      await assertVideoSignature(file);
    }

    const apiKey = getGroqApiKey();

    // 1. High-speed Groq Whisper LPU path (Sub-second transcription)
    // Groq accepts files up to 25MB (26,214,400 bytes).
    if (apiKey && file.size <= 25 * 1024 * 1024 && !burn) {
      try {
        const groqBody = new FormData();
        groqBody.append("file", file);
        groqBody.append("model", "whisper-large-v3-turbo");
        groqBody.append("response_format", "verbose_json");
        groqBody.append("temperature", "0");
        if (requestedLanguage && requestedLanguage !== "auto") {
          groqBody.append("language", requestedLanguage);
        }

        const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: groqBody,
          signal: AbortSignal.timeout(60_000),
        });

        if (groqRes.ok) {
          const result = (await groqRes.json()) as {
            text?: string;
            language?: string;
            duration?: number;
            segments?: GroqSegment[];
          };

          const segments = Array.isArray(result.segments) ? result.segments : [];
          const text = (result.text || "").trim();

          if (!text && segments.length === 0) {
            throw new VideoProcessingError(
              "No spoken dialogue was detected in this clip.",
              422,
              "NO_SPEECH_DETECTED"
            );
          }

          // Build clean, standard SRT
          const srtBlocks: string[] = [];
          if (segments.length > 0) {
            segments.forEach((seg, index) => {
              const segText = (seg.text || "").trim();
              if (segText) {
                srtBlocks.push(
                  `${index + 1}\n${formatSrtTimestamp(seg.start)} --> ${formatSrtTimestamp(seg.end)}\n${segText}`
                );
              }
            });
          } else if (text) {
            srtBlocks.push(`1\n00:00:00,500 --> 00:00:05,000\n${text}`);
          }

          const srt = srtBlocks.join("\n\n");

          return publicJson(
            {
              success: true,
              srt,
              language: result.language || "en",
              duration: result.duration || null,
              segments: segments.map((s, idx) => ({
                id: s.id ?? idx + 1,
                start: s.start,
                end: s.end,
                text: (s.text || "").trim(),
              })),
              requestId,
            },
            {
              headers: {
                "Cache-Control": "no-store",
                "X-Exismic-Request-Id": requestId,
              },
            }
          );
        } else {
          console.warn("[VideoSubtitles] Groq responded with status:", groqRes.status);
        }
      } catch (groqErr) {
        console.warn("[VideoSubtitles] Groq fast-path exception, falling back:", groqErr);
      }
    }

    // 2. Modal Backend Fallback (Handles files > 25MB or burned video request)
    const baseUrl = process.env.MODAL_VIDEO_URL;
    if (!baseUrl) {
      throw new VideoProcessingError(
        "Subtitle service is temporarily busy. Please try again with a shorter video.",
        503,
        "VIDEO_BACKEND_UNAVAILABLE",
        true
      );
    }

    const result = await callVideoModal(
      resolveVideoEndpoint(baseUrl, "/subtitles"),
      {
        file_name: file.name,
        file_data_base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
        language: requestedLanguage || "auto",
        burn,
      },
      requestId,
      15 * 60 * 1000
    );

    if (!result.srt?.trim()) {
      throw new VideoProcessingError(
        "No spoken dialogue was detected in this clip.",
        422,
        "NO_SPEECH_DETECTED"
      );
    }

    if (burn && !result.file_data_base64) {
      throw new VideoProcessingError(
        "The subtitles were created, but the burned video could not be rendered.",
        502,
        "BURN_RENDER_FAILED",
        true
      );
    }

    return publicJson(
      {
        success: true,
        srt: result.srt,
        videoUrl: burn ? result.file_data_base64 : undefined,
        requestId,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Exismic-Request-Id": requestId,
        },
      }
    );
  } catch (error) {
    return videoErrorResponse(error, requestId);
  }
}
