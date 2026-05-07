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
  fileType: "image" | "audio" | "video" | "pdf" | "text";
  status?: "completed" | "failed" | "processing";
  metadata?: any;
}) {
  try {
    const response = await fetch("/api/files/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toolType,
        originalName,
        originalUrl,
        resultUrl,
        fileType,
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
