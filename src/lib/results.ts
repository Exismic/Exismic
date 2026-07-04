export type ResultFileType = "image" | "audio" | "video" | "pdf" | "text";
export type ResultStatus = "completed" | "failed" | "processing";

const TOOL_TYPE_ALIASES: Record<string, string> = {
  "bg-remove": "image-eraser",
  "remove-bg": "image-eraser",
  "img-compressor": "image-compressor",
  "img-resizer": "image-resizer",
  "img-converter": "image-converter",
  "img-processing": "image-converter",
  "pdf-processing": "pdf-compressor",
  "code-generate": "ai-code",
  "screenshot-code": "screenshot-to-code",
  "social-caption": "social-caption-generator",
};

export function normalizeHistoryToolType(toolType: string) {
  return TOOL_TYPE_ALIASES[toolType] ?? toolType;
}

export function isDownloadableResultUrl(value?: string | null) {
  if (!value) return false;
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:");
}

export function inferResultFileType({
  mimeType,
  toolType,
  resultUrl,
}: {
  mimeType?: string | null;
  toolType?: string | null;
  resultUrl?: string | null;
}): ResultFileType {
  const normalizedTool = normalizeHistoryToolType(toolType ?? "");
  const value = `${mimeType ?? ""} ${normalizedTool} ${resultUrl ?? ""}`.toLowerCase();

  if (value.includes("image/") || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(resultUrl ?? "")) {
    return "image";
  }

  if (value.includes("audio/") || /\.(mp3|wav|ogg|m4a|flac)(\?|$)/i.test(resultUrl ?? "")) {
    return "audio";
  }

  if (value.includes("video/") || /\.(mp4|webm|mov|mkv|gif)(\?|$)/i.test(resultUrl ?? "")) {
    return "video";
  }

  if (value.includes("pdf") || /\.(pdf)(\?|$)/i.test(resultUrl ?? "")) {
    return "pdf";
  }

  if (normalizedTool.startsWith("image-") || normalizedTool === "watermark-remover") return "image";
  if (normalizedTool.startsWith("audio-")) return "audio";
  if (normalizedTool.startsWith("video-")) return "video";
  if (normalizedTool.startsWith("pdf-")) return "pdf";

  return "text";
}
