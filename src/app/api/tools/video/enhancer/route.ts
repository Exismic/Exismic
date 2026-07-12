import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRequestIp,
  rateLimitResponse,
  validateUploadedFile,
} from "@/lib/api-security";
import { chargeToolAccess, isToolAccessResponse, resolveToolAccess } from "@/lib/tool-access";
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
export const dynamic = "force-dynamic";

const enhancementLevels = new Set(["light", "medium", "strong"]);
const enhancementKeys = new Set([
  "noiseReduction",
  "sharpen",
  "colorCorrection",
  "stabilize",
  "naturalLook",
]);

function parseFeatures(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(value || "{}")) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([key]) => enhancementKeys.has(key))
        .map(([key, enabled]) => [key, Boolean(enabled)]),
    );
  } catch {
    throw new VideoProcessingError("Enhancement settings are invalid.", 400, "INVALID_ENHANCEMENT_SETTINGS");
  }
}

export async function POST(req: NextRequest) {
  const requestId = createVideoRequestId();
  try {
    const formData = await req.formData();
    const access = await resolveToolAccess(req, { toolId: "video-enhancer", mode: "free-quality", creditCost: 20, formData });
    if (isToolAccessResponse(access)) return access;
    const limit = checkRateLimit(
      `video-enhancer:${access.authUser?.id || "guest"}:${getRequestIp(req)}`,
      access.isAuthenticated ? 8 : 2,
      60 * 60 * 1000,
    );
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);
    const file = formData.get("video") as File;
    const requestedLevel = String(formData.get("level") || "medium");
    const level = access.outputTier === "standard" ? "light" : requestedLevel;
    const requestedFeatures = parseFeatures(formData.get("features"));
    const features = access.outputTier === "standard"
      ? { noiseReduction: Boolean(requestedFeatures.noiseReduction), naturalLook: true }
      : requestedFeatures;
    const fileError = validateUploadedFile(file, {
      maxBytes: 250 * 1024 * 1024,
      allowedMimePrefixes: ["video/"],
      label: "video file",
    });
    if (fileError) return fileError;
    await assertVideoSignature(file);
    if (!enhancementLevels.has(level)) {
      throw new VideoProcessingError("Choose a valid enhancement level.", 400, "INVALID_ENHANCEMENT_LEVEL");
    }

    const priority = access.isPro;
    const queue = priority ? "priority" : "normal";
    const baseUrl = priority
      ? process.env.MODAL_VIDEO_ENHANCER_PRIORITY_URL ||
        process.env.MODAL_VIDEO_PRIORITY_URL ||
        process.env.MODAL_VIDEO_ENHANCER_URL ||
        process.env.MODAL_VIDEO_URL
      : process.env.MODAL_VIDEO_ENHANCER_NORMAL_URL ||
        process.env.MODAL_VIDEO_ENHANCER_URL ||
        process.env.MODAL_VIDEO_URL;

    if (!baseUrl) {
      throw new VideoProcessingError(
        "Video enhancement is temporarily unavailable.",
        503,
        "VIDEO_BACKEND_UNAVAILABLE",
        true,
      );
    }

    const result = await callVideoModal(
      resolveVideoEndpoint(baseUrl, "/enhance"),
      {
        file_name: file.name,
        file_data_base64: Buffer.from(await file.arrayBuffer()).toString("base64"),
        level,
        features: JSON.stringify(features),
        priority,
        queue,
      },
      requestId,
    );
    const { bytes, mimeType } = decodeProviderFile(result.file_data_base64);
    const debit = await chargeToolAccess(access, "video-enhancer", `tool:${requestId}`);
    if (!debit.success) return NextResponse.json({ error: debit.error }, { status: 402 });
    return createVideoDownloadResponse(bytes, {
      fileName: `${safeVideoStem(file.name)}-enhanced.mp4`,
      contentType: mimeType || "video/mp4",
      requestId,
      headers: {
        "X-Exismic-Priority": String(priority),
        "X-Exismic-Queue": queue,
      },
    });
  } catch (error) {
    return videoErrorResponse(error, requestId);
  }
}
