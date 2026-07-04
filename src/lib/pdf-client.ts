export type DownloadArtifact = {
  url: string;
  fileName: string;
  size: number;
  requestId?: string;
  headers: Headers;
};

export class PdfRequestError extends Error {
  constructor(
    message: string,
    readonly requestId?: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "PdfRequestError";
  }
}

export async function readDownloadResponse(
  response: Response,
  fallbackFileName: string,
): Promise<DownloadArtifact> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      requestId?: string;
      retryable?: boolean;
    } | null;
    throw new PdfRequestError(
      payload?.error ||
        (response.status === 401
          ? "Sign in to use this tool."
          : "The document could not be processed."),
      payload?.requestId ||
        response.headers.get("X-Lumora-Request-Id") ||
        undefined,
      payload?.retryable ?? response.status >= 500,
    );
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new PdfRequestError(
      "The document processor returned an empty file.",
      response.headers.get("X-Lumora-Request-Id") || undefined,
      true,
    );
  }

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
    requestId:
      response.headers.get("X-Lumora-Request-Id") || undefined,
    headers: response.headers,
  };
}
