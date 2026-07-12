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
  createVideoDownloadResponse,
  createVideoRequestId,
  decodeProviderFile,
  resolveVideoEndpoint,
  safeVideoStem,
  videoErrorResponse,
} from "@/lib/video-processing";

export const maxDuration = 300;

function boundedNumber(value: FormDataEntryValue | null, min: number, max: number, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new VideoProcessingError(`${label} must be between ${min} and ${max}.`, 400, "INVALID_GIF_SETTINGS");
  }
  return parsed;
}

export async function POST(req: NextRequest) {
  const requestId = createVideoRequestId();
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(
      `video-to-gif:${authUser?.id || "guest"}:${getRequestIp(req)}`,
      authUser ? 10 : 3,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await req.formData();
    const file = formData.get("video") as File;
    const fileError = validateUploadedFile(file, {
      maxBytes: 180 * 1024 * 1024,
      allowedMimePrefixes: ["video/"],
      label: "video file",
    });
    if (fileError) return fileError;
    await assertVideoSignature(file);

    const startTime = boundedNumber(formData.get("start"), 0, 60 * 60, "Start time");
    const duration = boundedNumber(formData.get("duration"), 0.1, 30, "GIF duration");
    const fps = Math.round(boundedNumber(formData.get("fps"), 5, 30, "Frame rate"));
    const width = Math.round(boundedNumber(formData.get("width"), 240, 1280, "Width"));

    const baseUrl = process.env.MODAL_VIDEO_URL;
    if (!baseUrl) {
      throw new VideoProcessingError(
        "GIF conversion is temporarily unavailable.",
        503,
        "VIDEO_BACKEND_UNAVAILABLE",
        true,
      );
    }

    const result = await callVideoModal(
      resolveVideoEndpoint(baseUrl, "/to-gif"),
      {
        file_name: file.name,
        file_data_base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
        start_time: startTime,
        duration,
        fps,
        width,
      },
      requestId,
    );
    const { bytes } = decodeProviderFile(result.file_data_base64);
    return createVideoDownloadResponse(bytes, {
      fileName: `${safeVideoStem(file.name)}.gif`,
      contentType: "image/gif",
      requestId,
    });
  } catch (error) {
    return videoErrorResponse(error, requestId);
  }
}
