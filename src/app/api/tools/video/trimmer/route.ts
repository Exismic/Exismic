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
  createVideoDownloadResponse,
  createVideoRequestId,
  decodeProviderFile,
  resolveVideoEndpoint,
  safeVideoStem,
  videoErrorResponse,
} from "@/lib/video-processing";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const requestId = createVideoRequestId();
  try {
    const authUser = await requireApiUser();
    if (authUser instanceof NextResponse) return authUser;
    const limit = checkRateLimit(
      `video-trimmer:${authUser.id}:${getRequestIp(req)}`,
      12,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await req.formData();
    const file = formData.get("video") as File;
    const startTime = Number(formData.get("start"));
    const endTime = Number(formData.get("end"));
    const duration = endTime - startTime;
    const fileError = validateUploadedFile(file, {
      maxBytes: 250 * 1024 * 1024,
      allowedMimePrefixes: ["video/"],
      label: "video file",
    });
    if (fileError) return fileError;
    await assertVideoSignature(file);
    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      startTime < 0 ||
      duration <= 0 ||
      duration > 60 * 60
    ) {
      throw new VideoProcessingError("Choose a valid trim range up to one hour.", 400, "INVALID_TRIM_RANGE");
    }

    const baseUrl = process.env.MODAL_VIDEO_URL;
    if (!baseUrl) {
      throw new VideoProcessingError(
        "Video trimming is temporarily unavailable.",
        503,
        "VIDEO_BACKEND_UNAVAILABLE",
        true,
      );
    }
    const result = await callVideoModal(
      resolveVideoEndpoint(baseUrl, "/trim"),
      {
        file_name: file.name,
        file_data_base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
        start_time: startTime,
        end_time: endTime,
      },
      requestId,
    );
    const { bytes, mimeType } = decodeProviderFile(result.file_data_base64);
    return createVideoDownloadResponse(bytes, {
      fileName: `${safeVideoStem(file.name)}-trimmed.mp4`,
      contentType: mimeType || "video/mp4",
      requestId,
    });
  } catch (error) {
    return videoErrorResponse(error, requestId);
  }
}
