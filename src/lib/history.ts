import {
  inferResultFileType,
  normalizeHistoryToolType,
  type ResultFileType,
  type ResultStatus,
} from "@/lib/results";

export async function saveFileHistory({
  toolType,
  originalName,
  originalUrl,
  resultUrl,
  fileType,
  status = "completed",
  metadata = {}
}: {
  toolType: string;
  originalName: string;
  originalUrl?: string;
  resultUrl?: string;
  fileType?: ResultFileType;
  status?: ResultStatus;
  metadata?: Record<string, unknown>;
}) {
  try {
    const normalizedToolType = normalizeHistoryToolType(toolType);
    const inferredFileType = fileType ?? inferResultFileType({ toolType: normalizedToolType, resultUrl });

    const response = await fetch("/api/files/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toolType: normalizedToolType,
        originalName,
        originalUrl,
        resultUrl,
        fileType: inferredFileType,
        status,
        metadata
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to save history:", error);
    return null;
  }
}
