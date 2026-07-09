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
  videoErrorResponse,
} from "@/lib/video-processing";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const requestId = createVideoRequestId();
  try {
    const authUser = await requireApiUser();
    if (authUser instanceof NextResponse) return authUser;
    const limit = checkRateLimit(
      `video-merger:${authUser.id}:${getRequestIp(req)}`,
      8,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const formData = await req.formData();
    const clips = formData.getAll("clips").filter((clip): clip is File => clip instanceof File);
    if (clips.length < 2) {
      throw new VideoProcessingError("Add at least two videos to merge.", 400, "TOO_FEW_CLIPS");
    }
    if (clips.length > 8) {
      throw new VideoProcessingError("You can merge up to 8 videos at once.", 400, "TOO_MANY_CLIPS");
    }
    if (clips.reduce((sum, clip) => sum + clip.size, 0) > 300 * 1024 * 1024) {
      throw new VideoProcessingError(
        "Combined videos are too large. The maximum total size is 300 MB.",
        413,
        "VIDEO_TOO_LARGE",
      );
    }

    for (const clip of clips) {
      const fileError = validateUploadedFile(clip, {
        maxBytes: 250 * 1024 * 1024,
        allowedMimePrefixes: ["video/"],
        label: "video clip",
      });
      if (fileError) return fileError;
      await assertVideoSignature(clip);
    }

    const baseUrl = process.env.MODAL_VIDEO_MERGER_URL || process.env.MODAL_VIDEO_URL;
    if (!baseUrl) {
      throw new VideoProcessingError(
        "Video merging is temporarily unavailable.",
        503,
        "VIDEO_BACKEND_UNAVAILABLE",
        true,
      );
    }

    const result = await callVideoModal(
      resolveVideoEndpoint(baseUrl, "/merge"),
      {
        file_names: clips.map((clip) => clip.name),
        file_data_list: await Promise.all(
          clips.map(async (clip) => Buffer.from(await clip.arrayBuffer()).toString("base64")),
        ),
      },
      requestId,
    );
    const { bytes, mimeType } = decodeProviderFile(result.file_data_base64);
    return createVideoDownloadResponse(bytes, {
      fileName: "exismic-merged-video.mp4",
      contentType: mimeType || "video/mp4",
      requestId,
    });
  } catch (error) {
    return videoErrorResponse(error, requestId);
  }
}
