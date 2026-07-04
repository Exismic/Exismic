import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  requireApiUser,
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

const supportedLanguages = new Set([
  "auto",
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "hi",
  "ja",
  "ko",
  "zh",
  "ar",
  "ru",
]);

export async function POST(req: NextRequest) {
  const requestId = createVideoRequestId();
  try {
    const authUser = await requireApiUser();
    if (authUser instanceof NextResponse) return authUser;
    const limit = checkRateLimit(
      `video-subtitles:${authUser.id}:${getRequestIp(req)}`,
      10,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await req.formData();
    const file = formData.get("video") as File;
    const language = String(formData.get("language") || "auto");
    const burn = formData.get("burn") === "true";
    const fileError = validateUploadedFile(file, {
      maxBytes: 250 * 1024 * 1024,
      allowedMimePrefixes: ["video/"],
      label: "video file",
    });
    if (fileError) return fileError;
    await assertVideoSignature(file);
    if (!supportedLanguages.has(language)) {
      throw new VideoProcessingError("Choose a supported transcription language.", 400, "INVALID_LANGUAGE");
    }

    const baseUrl = process.env.MODAL_VIDEO_URL;
    if (!baseUrl) {
      throw new VideoProcessingError(
        "Subtitle generation is temporarily unavailable.",
        503,
        "VIDEO_BACKEND_UNAVAILABLE",
        true,
      );
    }

    const result = await callVideoModal(
      resolveVideoEndpoint(baseUrl, "/subtitles"),
      {
        file_name: file.name,
        file_data_base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
        language,
        burn,
      },
      requestId,
      15 * 60 * 1000,
    );
    if (!result.srt?.trim()) {
      throw new VideoProcessingError(
        "No speech was detected in this video.",
        422,
        "NO_SPEECH_DETECTED",
      );
    }
    if (burn && !result.file_data_base64) {
      throw new VideoProcessingError(
        "The subtitles were created, but the burned video could not be rendered.",
        502,
        "BURN_RENDER_FAILED",
        true,
      );
    }

    return NextResponse.json(
      {
        success: true,
        srt: result.srt,
        videoUrl: burn ? result.file_data_base64 : undefined,
        requestId,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Lumora-Request-Id": requestId,
        },
      },
    );
  } catch (error) {
    return videoErrorResponse(error, requestId);
  }
}
