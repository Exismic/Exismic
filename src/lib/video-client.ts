export type VideoArtifact = {
  url: string;
  fileName: string;
  size: number;
  requestId?: string;
  headers: Headers;
};

export async function readVideoResponse(
  response: Response,
  fallbackFileName: string,
): Promise<VideoArtifact> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      requestId?: string;
    } | null;
    const error = new Error(
      payload?.error ||
        (response.status === 401
          ? "Sign in to process video."
          : "Video processing failed."),
    ) as Error & { requestId?: string };
    error.requestId =
      payload?.requestId ||
      response.headers.get("X-Lumora-Request-Id") ||
      undefined;
    throw error;
  }

  const blob = await response.blob();
  if (blob.size === 0) throw new Error("The processor returned an empty video.");
  const encodedName = response.headers.get("X-Lumora-File-Name");
  let fileName = fallbackFileName;
  if (encodedName) {
    try {
      fileName = decodeURIComponent(encodedName);
    } catch {
      fileName = fallbackFileName;
    }
  }
  return {
    url: URL.createObjectURL(blob),
    fileName,
    size: blob.size,
    requestId: response.headers.get("X-Lumora-Request-Id") || undefined,
    headers: response.headers,
  };
}
