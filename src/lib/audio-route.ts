import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  requireApiUser,
  validateUploadedFile,
} from "@/lib/api-security";
import {
  AudioProviderUnavailableError,
  type AudioProcessingTask,
  runAudioProcessing,
} from "@/lib/audio-processing";

export async function handleAudioProcessingRequest(
  request: NextRequest,
  task: AudioProcessingTask,
) {
  const requestId = randomUUID();

  try {
    const user = await requireApiUser();
    if (user instanceof NextResponse) return user;

    const limit = checkRateLimit(
      `audio:${task}:${user.id}:${getRequestIp(request)}`,
      10,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await request.formData();
    const entry = formData.get("file");
    const file = entry instanceof File ? entry : null;
    const fileError = validateUploadedFile(file, {
      maxBytes: 120 * 1024 * 1024,
      allowedMimePrefixes: ["audio/"],
      label: "audio file",
    });
    if (fileError) return fileError;

    const result = await runAudioProcessing(file!, task, requestId);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-Lumora-Request-Id": requestId,
      },
    });
  } catch (error) {
    if (error instanceof AudioProviderUnavailableError) {
      console.error(`[audio:${requestId}] all providers failed`, error.attempts);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          requestId,
          retryable: error.retryable,
        },
        {
          status: 503,
          headers: { "X-Lumora-Request-Id": requestId },
        },
      );
    }

    console.error(`[audio:${requestId}] processing failed`, error);
    return NextResponse.json(
      {
        error: "The audio could not be processed. Please try another file.",
        code: "AUDIO_PROCESSING_FAILED",
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
