"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  AudioLines,
  Ban,
  Check,
  Download,
  FileAudio,
  Headphones,
  LoaderCircle,
  Mic2,
  Music2,
  RefreshCw,
  Sparkles,
  Split,
  Upload,
  WandSparkles,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AudioToolMode =
  | "vocal-remover"
  | "stem-splitter"
  | "noise-remover"
  | "voice-changer";

type AudioTrack = {
  id: string;
  label: string;
  url: string;
  fileName: string;
  mimeType: string;
};

type ToolStatus =
  | "idle"
  | "ready"
  | "uploading"
  | "processing"
  | "preparing"
  | "complete"
  | "error"
  | "cancelled";

type ToolError = {
  message: string;
  requestId?: string;
  retryable: boolean;
};

const TOOL_CONFIG = {
  "vocal-remover": {
    endpoint: "/api/tools/vocal-remover",
    action: "Separate audio",
    title: "Two clean mixes",
    description:
      "Separate the lead vocal from the instrumental while preserving the original timing.",
    output: "Vocals + instrumental",
    icon: Mic2,
    accent: "from-violet-500 via-fuchsia-500 to-cyan-400",
  },
  "stem-splitter": {
    endpoint: "/api/tools/audio/stem-splitter",
    action: "Split into stems",
    title: "Four-track separation",
    description:
      "Create individual vocal, drum, bass, and other tracks for remixing and practice.",
    output: "Vocals + drums + bass + other",
    icon: Split,
    accent: "from-cyan-400 via-blue-500 to-violet-500",
  },
  "noise-remover": {
    endpoint: "/api/tools/audio/noise-remover",
    action: "Clean audio",
    title: "Focused, cleaner sound",
    description:
      "Reduce steady room noise and distracting background sound without inventing a fake result.",
    output: "One cleaned master",
    icon: AudioLines,
    accent: "from-emerald-400 via-cyan-400 to-blue-500",
  },
  "voice-changer": {
    endpoint: "/api/tools/audio/voice-changer",
    action: "Transform voice",
    title: "Performance-preserving voice",
    description:
      "Convert spoken audio into a polished studio voice while keeping its timing and delivery.",
    output: "One converted voice",
    icon: WandSparkles,
    accent: "from-amber-300 via-fuchsia-500 to-violet-500",
  },
} as const;

const PROCESSING_STATUSES: ToolStatus[] = [
  "uploading",
  "processing",
  "preparing",
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function stageCopy(status: ToolStatus) {
  if (status === "uploading") {
    return ["Secure upload", "Sending the source audio to Exismic"];
  }
  if (status === "preparing") {
    return ["Preparing tracks", "Validating the audio and building your downloads"];
  }
  return ["AI processing", "The audio engine is separating and reconstructing the signal"];
}

async function getDownloadBlob(track: AudioTrack) {
  const response = await fetch(track.url);
  if (!response.ok) throw new Error("Could not prepare the download.");
  return response.blob();
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function CustomAudioPlayer({ src, accent }: { src: string; accent: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    // Sync state on src change
    setIsPlaying(false);
    setCurrentTime(0);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3.5 rounded-xl bg-white/[0.02] border border-white/5 p-3.5 w-full backdrop-blur-md">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Play / Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "flex size-9 items-center justify-center rounded-lg bg-linear-to-r text-white hover:brightness-110 active:scale-95 transition-all shrink-0 shadow-lg",
          accent
        )}
      >
        {isPlaying ? <Pause className="size-4 fill-white" /> : <Play className="size-4 fill-white ml-0.5" />}
      </button>

      {/* Timing */}
      <span className="text-xs font-mono text-zinc-400 shrink-0 select-none">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Progress Slider */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.05"
        value={currentTime}
        onChange={handleScrub}
        className="flex-1 h-1 rounded-full bg-white/10 accent-cyan-300 cursor-pointer appearance-none focus:outline-none"
      />

      {/* Volume Mute */}
      <button
        type="button"
        onClick={toggleMute}
        className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white transition-colors shrink-0"
      >
        {isMuted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  );
}

export function AudioProcessingTool({ mode }: { mode: AudioToolMode }) {
  const config = TOOL_CONFIG[mode];
  const Icon = config.icon;
  const controllerRef = useRef<AbortController | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [error, setError] = useState<ToolError | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const isProcessing = PROCESSING_STATUSES.includes(status);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      if (stageTimerRef.current) window.clearTimeout(stageTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!sourceUrl) return;
    return () => URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => {
    if (!isProcessing) return;
    const startedAt = Date.now() - elapsed * 1_000;
    const timer = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt) / 1_000)),
      1_000,
    );
    return () => window.clearInterval(timer);
  }, [isProcessing, elapsed]);

  const selectFile = useCallback((nextFile: File) => {
    setSourceUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(nextFile);
    });
    setFile(nextFile);
    setTracks([]);
    setError(null);
    setElapsed(0);
    setStatus("ready");
  }, []);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) selectFile(accepted[0]);
    },
    [selectFile],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"],
    },
    maxFiles: 1,
    maxSize: mode === "voice-changer" ? 50 * 1024 * 1024 : 120 * 1024 * 1024,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const rejectionMessage = useMemo(() => {
    const rejection = fileRejections[0];
    if (!rejection) return null;
    return rejection.errors[0]?.code === "file-too-large"
      ? `Keep this audio under ${mode === "voice-changer" ? "50" : "120"} MB.`
      : "Choose a supported MP3, WAV, M4A, AAC, FLAC, or OGG file.";
  }, [fileRejections, mode]);

  const processAudio = useCallback(async () => {
    if (!file || isProcessing) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setTracks([]);
    setError(null);
    setElapsed(0);
    setStatus("uploading");
    stageTimerRef.current = setTimeout(
      () => setStatus("processing"),
      650,
    );

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(config.endpoint, {
        method: "POST",
        body,
        signal: controller.signal,
      });
      setStatus("preparing");

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        requestId?: string;
        retryable?: boolean;
        result?: { tracks?: AudioTrack[] };
      } | null;

      if (!response.ok) {
        throw Object.assign(
          new Error(
            payload?.error ||
              (response.status === 401
                ? "Sign in to process audio."
                : "Audio processing failed."),
          ),
          {
            requestId:
              payload?.requestId ||
              response.headers.get("X-Exismic-Request-Id") ||
              undefined,
            retryable: payload?.retryable ?? response.status >= 500,
          },
        );
      }

      const nextTracks = payload?.result?.tracks;
      if (
        !Array.isArray(nextTracks) ||
        nextTracks.length === 0 ||
        nextTracks.some(
          (track) =>
            !track.id ||
            !track.label ||
            !track.url ||
            !track.fileName,
        )
      ) {
        throw Object.assign(new Error("The audio engine returned an invalid result."), {
          retryable: true,
        });
      }

      setTracks(nextTracks);
      setStatus("complete");
    } catch (caught) {
      if (controller.signal.aborted) {
        setStatus("cancelled");
        return;
      }

      const typed = caught as Error & {
        requestId?: string;
        retryable?: boolean;
      };
      setError({
        message: typed.message || "Audio processing failed.",
        requestId: typed.requestId,
        retryable: typed.retryable ?? true,
      });
      setStatus("error");
    } finally {
      if (stageTimerRef.current) window.clearTimeout(stageTimerRef.current);
      controllerRef.current = null;
    }
  }, [config.endpoint, file, isProcessing]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setSourceUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setFile(null);
    setTracks([]);
    setError(null);
    setElapsed(0);
    setStatus("idle");
  }, []);

  const downloadTrack = useCallback(async (track: AudioTrack) => {
    try {
      saveBlob(await getDownloadBlob(track), track.fileName);
    } catch {
      setError({
        message: `Could not download ${track.label}. Please retry.`,
        retryable: true,
      });
    }
  }, []);

  const downloadZip = useCallback(async () => {
    if (!file || tracks.length === 0 || isZipping) return;
    setIsZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      await Promise.all(
        tracks.map(async (track) => {
          zip.file(track.fileName, await getDownloadBlob(track));
        }),
      );
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      const stem = file.name.replace(/\.[^/.]+$/, "") || "exismic-audio";
      saveBlob(blob, `${stem}-exismic-tracks.zip`);
    } catch {
      setError({
        message: "The ZIP could not be prepared. Individual downloads still work.",
        retryable: true,
      });
    } finally {
      setIsZipping(false);
    }
  }, [file, isZipping, tracks]);

  const [stageTitle, stageDescription] = stageCopy(status);

  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-lg border border-white/10 bg-[#07080c]/95 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative border-b border-white/8 px-4 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045]">
              <div
                className={cn(
                  "absolute inset-x-2 bottom-1 h-4 rounded-full bg-linear-to-r opacity-50 blur-xl",
                  config.accent,
                )}
              />
              <Icon className="relative size-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/70">
                Exismic audio engine
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                {config.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-md border border-white/8 bg-white/[0.035] px-3 py-2 sm:self-auto">
            <Headphones className="size-4 text-cyan-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300">
              {config.output}
            </span>
          </div>
        </div>
      </div>

      <div className="relative grid gap-5 p-4 sm:p-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="min-w-0 space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-lg border border-dashed p-5 transition duration-300 sm:min-h-[360px] sm:p-7",
              isDragActive
                ? "border-cyan-300/70 bg-cyan-300/[0.06]"
                : "border-white/14 bg-white/[0.025] hover:border-white/25",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-11 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-cyan-200">
                <Upload className="size-5" />
              </div>
              <span className="rounded-md border border-white/8 bg-black/25 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Audio only
              </span>
            </div>

            <div className="py-8 text-center">
              {file ? (
                <>
                  <FileAudio className="mx-auto size-10 text-cyan-200" />
                  <p className="mx-auto mt-5 max-w-md break-words text-lg font-bold text-white sm:text-xl">
                    {file.name}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {formatBytes(file.size)} · Ready for secure processing
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Drop your audio here
                  </p>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500 sm:text-base">
                    {config.description}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openFileDialog}
                disabled={isProcessing}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/[0.06] px-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-cyan-300/30 hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="size-4" />
                {file ? "Replace file" : "Choose audio"}
              </button>
              {file && (
                <button
                  type="button"
                  onClick={reset}
                  disabled={isProcessing}
                  aria-label="Remove selected audio"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/10 px-5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="size-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {(rejectionMessage || error) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-400/20 bg-red-500/[0.06] p-4"
            >
              <div className="flex items-start gap-3">
                <Ban className="mt-0.5 size-5 shrink-0 text-red-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-red-100">
                    {rejectionMessage || error?.message}
                  </p>
                  {error?.requestId && (
                    <p className="mt-2 break-all text-[10px] uppercase tracking-[0.12em] text-red-200/45">
                      Request {error.requestId}
                    </p>
                  )}
                </div>
                {error?.retryable && file && !isProcessing && (
                  <button
                    type="button"
                    onClick={() => void processAudio()}
                    className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-red-300/20 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-red-100 transition hover:bg-red-300/10"
                  >
                    <RefreshCw className="size-3.5" />
                    Retry
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="min-w-0 rounded-lg border border-white/10 bg-black/25 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[300px] flex-col justify-between"
              >
                <div>
                  <div className="relative flex size-14 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200">
                    <LoaderCircle className="size-6 animate-spin" />
                  </div>
                  <p className="mt-7 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/70">
                    {stageTitle}
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-tight text-white">
                    Your audio is in motion
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                    {stageDescription}. Large or complex tracks can take a few
                    minutes.
                  </p>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className={cn(
                        "h-full w-1/3 rounded-full bg-linear-to-r",
                        config.accent,
                      )}
                      animate={{ x: ["-120%", "320%"] }}
                      transition={{
                        duration: 1.7,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                    <span>{elapsed}s elapsed</span>
                    <span>Live processing</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => controllerRef.current?.abort()}
                    className="min-h-11 w-full rounded-md border border-white/10 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : tracks.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between gap-4 pb-2">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                      <Check className="size-3.5" />
                      Ready
                    </p>
                    <h3 className="mt-2 text-xl font-black text-white">
                      Your processed tracks
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Process another audio file"
                    className="flex size-11 items-center justify-center rounded-md border border-white/10 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                </div>

                <div className="max-h-[440px] space-y-3 overflow-y-auto pr-1">
                  {tracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Music2 className="size-4 shrink-0 text-cyan-200" />
                          <p className="truncate text-sm font-bold text-white">
                            {track.label}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void downloadTrack(track)}
                          aria-label={`Download ${track.label}`}
                          className="flex size-10 shrink-0 items-center justify-center rounded-md border border-white/10 text-zinc-400 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.07] hover:text-cyan-100"
                        >
                          <Download className="size-4" />
                        </button>
                      </div>
                      <CustomAudioPlayer src={track.url} accent={config.accent} />
                    </motion.div>
                  ))}
                </div>

                {tracks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => void downloadZip()}
                    disabled={isZipping}
                    className={cn(
                      "inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-linear-to-r px-5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_40px_rgba(34,211,238,0.12)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60",
                      config.accent,
                    )}
                  >
                    {isZipping ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Archive className="size-4" />
                    )}
                    {isZipping ? "Building ZIP" : "Download all tracks"}
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[300px] flex-col justify-between"
              >
                <div>
                  <Sparkles className="size-7 text-violet-300" />
                  <h3 className="mt-6 text-2xl font-black tracking-tight text-white">
                    {file ? "Listen once, then process" : "Built for real output"}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {file
                      ? "Preview the source below. Exismic will keep the timing aligned across every result."
                      : "Upload audio to unlock a playable source preview, validated results, retries, and proper downloads."}
                  </p>
                </div>

                <div className="space-y-4 pt-8">
                  {sourceUrl && (
                    <div className="rounded-lg border border-white/8 bg-white/[0.025] p-3">
                      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
                        Original
                      </p>
                      <CustomAudioPlayer src={sourceUrl} accent={config.accent} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void processAudio()}
                    disabled={!file || status === "cancelled"}
                    className={cn(
                      "inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-md bg-linear-to-r px-5 text-xs font-black uppercase tracking-[0.17em] text-white shadow-[0_16px_45px_rgba(124,58,237,0.16)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0",
                      config.accent,
                    )}
                  >
                    <Icon className="size-4" />
                    {config.action}
                  </button>
                  {status === "cancelled" && (
                    <button
                      type="button"
                      onClick={() => setStatus("ready")}
                      className="min-h-11 w-full rounded-md border border-white/10 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Resume setup
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
