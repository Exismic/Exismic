import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  validateUploadedFile,
} from "@/lib/api-security";
import { chargeToolAccess, isToolAccessResponse, resolveToolAccess } from "@/lib/tool-access";
import {
  VIDEO_MAX_BYTES,
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
    const formData = await req.formData();
    const access = await resolveToolAccess(req, { toolId: "video-compressor", mode: "free-quality", creditCost: 8, formData });
    if (isToolAccessResponse(access)) return access;
    const limit = checkRateLimit(
      `video-compressor:${access.authUser?.id || "guest"}:${getRequestIp(req)}`,
      access.isAuthenticated ? 8 : 3,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);
    const file = formData.get("video") as File;
    const requestedQuality = String(formData.get("quality") || "medium");
    const quality = access.outputTier === "standard" ? "medium" : requestedQuality;
    const format = String(formData.get("format") || "mp4");

    const fileError = validateUploadedFile(file, {
      maxBytes: VIDEO_MAX_BYTES,
      allowedMimePrefixes: ["video/"],
      label: "video file",
    });
    if (fileError) return fileError;
    await assertVideoSignature(file);

    if (!["low", "medium", "high", "ultra"].includes(quality)) {
      throw new VideoProcessingError("Choose a valid compression quality.", 400, "INVALID_QUALITY");
    }
    if (!["mp4", "webm"].includes(format)) {
      throw new VideoProcessingError("Choose MP4 or WebM output.", 400, "INVALID_FORMAT");
    }

    const baseUrl = process.env.MODAL_VIDEO_URL;
    if (!baseUrl) {
      throw new VideoProcessingError(
        "Video compression is temporarily unavailable.",
        503,
        "VIDEO_BACKEND_UNAVAILABLE",
        true,
      );
    }

    const result = await callVideoModal(
      resolveVideoEndpoint(baseUrl, "/compress"),
      {
        file_name: file.name,
        file_data_base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
        quality,
        format,
      },
      requestId,
    );
    const { bytes, mimeType } = decodeProviderFile(result.file_data_base64);
    const debit = await chargeToolAccess(access, "video-compressor", `tool:${requestId}`);
    if (!debit.success) return NextResponse.json({ error: debit.error }, { status: 402 });
    const fileName = `${safeVideoStem(file.name)}-compressed.${format}`;

    return createVideoDownloadResponse(bytes, {
      fileName,
      contentType: mimeType || (format === "webm" ? "video/webm" : "video/mp4"),
      requestId,
    });
  } catch (error) {
    return videoErrorResponse(error, requestId);
  }
}
