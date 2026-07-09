import { getEngineRoute } from "@/config/engine";

export type AudioProcessingTask =
  | "vocal-separation"
  | "stem-separation"
  | "denoise";

export type AudioProvider = "modal" | "engine" | "huggingface";

export interface AudioTrack {
  id: string;
  label: string;
  url: string;
  fileName: string;
  mimeType: string;
}

export interface AudioProcessingResult {
  success: true;
  jobId: string;
  task: AudioProcessingTask;
  provider: AudioProvider;
  result: {
    sourceFileName: string;
    tracks: AudioTrack[];
  };
  meta: {
    requestId: string;
    elapsedMs: number;
  };
}

type ProviderPayload = {
  success?: boolean;
  result?: Record<string, unknown>;
  data?: unknown[];
  error?: string;
};

type ProviderAttempt = {
  provider: AudioProvider;
  run: () => Promise<ProviderPayload>;
};

const AUDIO_TIMEOUT_MS = 8 * 60 * 1000;

export class AudioProviderUnavailableError extends Error {
  readonly code = "AUDIO_PROVIDER_UNAVAILABLE";
  readonly retryable = true;
  readonly attempts: string[];

  constructor(attempts: string[]) {
    super("Audio processing is temporarily unavailable. Please try again shortly.");
    this.name = "AudioProviderUnavailableError";
    this.attempts = attempts;
  }
}

function safeFileStem(fileName: string) {
  return (
    fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "exismic-audio"
  );
}

function isSafeAudioUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  return (
    value.startsWith("data:audio/") ||
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

function readResultUrl(result: Record<string, unknown>, key: string) {
  const value = result[key];
  if (isSafeAudioUrl(value)) return value;
  if (
    value &&
    typeof value === "object" &&
    "url" in value &&
    isSafeAudioUrl((value as { url?: unknown }).url)
  ) {
    return (value as { url: string }).url;
  }
  return null;
}

function createTrack(
  id: string,
  label: string,
  url: string,
  sourceFileName: string,
) {
  return {
    id,
    label,
    url,
    fileName: `${safeFileStem(sourceFileName)}-${id}.mp3`,
    mimeType: "audio/mpeg",
  } satisfies AudioTrack;
}

function normalizeTracks(
  payload: ProviderPayload,
  task: AudioProcessingTask,
  sourceFileName: string,
) {
  if (!payload.success || !payload.result) return null;

  if (task === "vocal-separation") {
    const vocals = readResultUrl(payload.result, "vocals");
    const instrumental =
      readResultUrl(payload.result, "instrumental") ||
      readResultUrl(payload.result, "accompaniment");

    if (!vocals || !instrumental || vocals === instrumental) return null;
    return [
      createTrack("vocals", "Vocals", vocals, sourceFileName),
      createTrack("instrumental", "Instrumental", instrumental, sourceFileName),
    ];
  }

  if (task === "stem-separation") {
    const required = [
      ["vocals", "Vocals"],
      ["drums", "Drums"],
      ["bass", "Bass"],
      ["other", "Other"],
    ] as const;

    const tracks = required.map(([id, label]) => {
      const url = readResultUrl(payload.result!, id);
      return url ? createTrack(id, label, url, sourceFileName) : null;
    });

    return tracks.every(Boolean) ? (tracks as AudioTrack[]) : null;
  }

  const cleaned =
    readResultUrl(payload.result, "cleaned") ||
    readResultUrl(payload.result, "denoised") ||
    readResultUrl(payload.result, "audio");
  return cleaned
    ? [createTrack("cleaned", "Clean Audio", cleaned, sourceFileName)]
    : null;
}

async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs = AUDIO_TIMEOUT_MS,
) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as ProviderPayload;
}

function getModalAttempt(
  file: File,
  buffer: Buffer,
  task: Exclude<AudioProcessingTask, "denoise">,
): ProviderAttempt | null {
  const baseUrl =
    process.env.MODAL_AUDIO_PRIORITY_URL ||
    process.env.MODAL_AUDIO_URL ||
    process.env.MODAL_AUDIO_NORMAL_URL;
  if (!baseUrl) return null;

  const apiKey =
    process.env.MODAL_AUDIO_PRIORITY_API_KEY ||
    process.env.MODAL_AUDIO_API_KEY ||
    process.env.MODAL_AUDIO_NORMAL_API_KEY;
  const endpoint = `${baseUrl.replace(/\/$/, "")}/process`;

  return {
    provider: "modal",
    run: () =>
      fetchJson(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          file_name: file.name,
          file_data_base64: buffer.toString("base64"),
          stems: task === "stem-separation" ? 4 : 2,
          task: "separate",
        }),
      }),
  };
}

function getEngineAttempt(
  file: File,
  task: AudioProcessingTask,
): ProviderAttempt {
  const route =
    task === "denoise"
      ? "/api/noise-remover"
      : task === "stem-separation"
        ? "/separate?stems=4"
        : "/separate";

  return {
    provider: "engine",
    run: async () => {
      const body = new FormData();
      body.append("file", file);
      if (task === "stem-separation") body.append("stems", "4");
      return fetchJson(
        getEngineRoute(route),
        {
          method: "POST",
          body,
        },
        task === "denoise" ? 3 * 60 * 1000 : AUDIO_TIMEOUT_MS,
      );
    },
  };
}

function getHuggingFaceDenoiseAttempt(
  file: File,
  buffer: Buffer,
): ProviderAttempt | null {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) return null;

  return {
    provider: "huggingface",
    run: async () => {
      const payload = await fetchJson(
        "https://r3gm-audio-separator.hf.space/api/predict",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: [
              {
                name: file.name,
                data: `data:${file.type || "audio/mpeg"};base64,${buffer.toString("base64")}`,
              },
              "UVR-DeNoise",
              "Clean",
              "v3",
            ],
          }),
        },
        90_000,
      );

      const first = payload.data?.[0];
      const url =
        typeof first === "string"
          ? first
          : first &&
              typeof first === "object" &&
              "url" in first &&
              typeof (first as { url?: unknown }).url === "string"
            ? (first as { url: string }).url
            : null;

      return url
        ? { success: true, result: { cleaned: url } }
        : { success: false, error: "Invalid provider output" };
    },
  };
}

export async function runAudioProcessing(
  file: File,
  task: AudioProcessingTask,
  requestId: string,
): Promise<AudioProcessingResult> {
  const startedAt = Date.now();
  const buffer = Buffer.from(await file.arrayBuffer());
  const attempts: ProviderAttempt[] = [];

  if (task !== "denoise") {
    const modalAttempt = getModalAttempt(file, buffer, task);
    if (modalAttempt) attempts.push(modalAttempt);
  }

  attempts.push(getEngineAttempt(file, task));

  if (task === "denoise") {
    const huggingFaceAttempt = getHuggingFaceDenoiseAttempt(file, buffer);
    if (huggingFaceAttempt) attempts.push(huggingFaceAttempt);
  }

  const failures: string[] = [];
  for (const attempt of attempts) {
    try {
      const payload = await attempt.run();
      const tracks = normalizeTracks(payload, task, file.name);
      if (!tracks) {
        failures.push(`${attempt.provider}: invalid output`);
        continue;
      }

      return {
        success: true,
        jobId: requestId,
        task,
        provider: attempt.provider,
        result: {
          sourceFileName: file.name,
          tracks,
        },
        meta: {
          requestId,
          elapsedMs: Date.now() - startedAt,
        },
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      failures.push(`${attempt.provider}: ${reason.slice(0, 80)}`);
      console.warn(`[audio:${requestId}] ${attempt.provider} failed: ${reason}`);
    }
  }

  throw new AudioProviderUnavailableError(failures);
}
