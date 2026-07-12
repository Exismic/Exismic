import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  requireProApiUser,
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
    const authUser = await requireProApiUser();
    if (authUser instanceof NextResponse) return authUser;
    const limit = checkRateLimit(
      `video-bg-remover:${authUser.id}:${getRequestIp(req)}`,
      6,
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

    const baseUrl = process.env.MODAL_VIDEO_URL;
    if (!baseUrl) {
      throw new VideoProcessingError(
        "Video background removal is temporarily unavailable.",
        503,
        "VIDEO_BACKEND_UNAVAILABLE",
        true,
      );
    }

    const result = await callVideoModal(
      resolveVideoEndpoint(baseUrl, "/remove-bg"),
      {
        file_name: file.name,
        file_data_base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      },
      requestId,
      15 * 60 * 1000,
    );
    const { bytes, mimeType } = decodeProviderFile(result.file_data_base64);
    return createVideoDownloadResponse(bytes, {
      fileName: `${safeVideoStem(file.name)}-transparent.webm`,
      contentType: mimeType || "video/webm",
      requestId,
    });
  } catch (error) {
    return videoErrorResponse(error, requestId);
  }
}
