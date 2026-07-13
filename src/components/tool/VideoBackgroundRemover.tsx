"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Download, Film, Loader2, RefreshCw, Sparkles, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { readVideoResponse } from "@/lib/video-client";

export default function VideoBackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("exismic-transparent-video.webm");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;
    if (selected.size > 180 * 1024 * 1024) {
      setError("Choose a video smaller than 180 MB.");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResultUrl(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "video/*": [".mp4", ".mov", ".webm", ".avi"] },
  });

  const processVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const fileToBase64 = (f: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };

      const base64Data = await fileToBase64(file);
      const baseUrl = process.env.NEXT_PUBLIC_MODAL_VIDEO_URL || "https://syedrayangames--lumora-video-tools-fastapi-app.modal.run";
      
      const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/bg-remover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_name: file.name,
          file_data_base64: base64Data,
        }),
      });

      if (!response.ok) {
        throw new Error("The video processor is busy or returned an error.");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to remove background.");
      }

      // Convert base64 data URI output to a Blob
      const base64Response = await fetch(result.file_data_base64);
      const blob = await base64Response.blob();

      setResultUrl(URL.createObjectURL(blob));
      setResultFileName("exismic-transparent-video.webm");
    } catch (processingError) {
      setError(
        processingError instanceof Error
          ? processingError.message
          : "The background could not be removed.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultFileName("exismic-transparent-video.webm");
    setError(null);
  };

  if (!file) {
    return (
      <motion.div
                {...(getRootProps() as unknown as import("framer-motion").HTMLMotionProps<"div">)}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative flex min-h-[360px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed p-6 text-center transition sm:min-h-[460px] sm:p-10",
          isDragActive
            ? "border-cyan-300/60 bg-cyan-300/[0.06]"
            : "border-white/15 bg-zinc-950/65 hover:border-cyan-300/35 hover:bg-cyan-300/[0.03]",
        )}
      >
        <input {...getInputProps()} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
        <div className="mb-6 flex size-20 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
          <Upload size={34} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Choose a video</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400 sm:text-base">
          Exismic isolates the subject frame by frame and returns a transparent WebM with audio preserved.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">MP4, MOV, WebM, AVI</span>
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">Up to 180 MB</span>
        </div>
        {error && <p className="mt-5 text-sm font-semibold text-red-300">{error}</p>}
      </motion.div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-950/65">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 px-4 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{file.name}</p>
            <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
            {resultUrl ? "Transparent result" : "Original"}
          </span>
        </header>
        <div
          className={cn(
            "relative flex min-h-[280px] items-center justify-center p-3 sm:min-h-[430px] sm:p-6",
            resultUrl && "bg-[linear-gradient(45deg,#141414_25%,transparent_25%),linear-gradient(-45deg,#141414_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#141414_75%),linear-gradient(-45deg,transparent_75%,#141414_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0]",
          )}
        >
          <video
            key={resultUrl || previewUrl}
            src={resultUrl || previewUrl || undefined}
            controls
            className="max-h-[520px] w-full rounded-md object-contain"
          />
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center backdrop-blur-md"
              >
                <Loader2 className="mb-5 size-12 animate-spin text-cyan-300" />
                <p className="text-lg font-black text-white">Isolating the subject</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                  Every frame is being processed. Longer clips take more time.
                </p>
                <div className="mt-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full w-2/5 rounded-full bg-gradient-to-r from-violet-500 via-cyan-300 to-fuchsia-400"
                    animate={{ x: ["-110%", "250%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <aside className="h-fit rounded-lg border border-white/10 bg-zinc-950/65 p-5 sm:p-6">
        <div className="mb-6 flex size-11 items-center justify-center rounded-md border border-violet-300/20 bg-violet-300/[0.07] text-violet-200">
          {resultUrl ? <CheckCircle2 size={21} /> : <Sparkles size={21} />}
        </div>
        <h3 className="text-xl font-black tracking-tight text-white">
          {resultUrl ? "Your transparent video is ready" : "Remove the background"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {resultUrl
            ? "Use the WebM in editors and web projects that support transparent video."
            : "The output keeps the full clip and available audio. No sample-frame shortcut is used."}
        </p>

        {error && (
          <div className="mt-5 rounded-md border border-red-400/20 bg-red-500/[0.06] p-4 text-sm font-semibold leading-6 text-red-200">
            {error}
          </div>
        )}

        <div className="mt-7 space-y-3">
          {resultUrl ? (
            <a
              href={resultUrl}
              download={resultFileName}
              className="premium-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-black text-white shadow-lg transition hover:brightness-110"
            >
              <Download size={18} />
              Download WebM
            </a>
          ) : (
            <button
              type="button"
              onClick={processVideo}
              disabled={isProcessing}
              className="premium-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-sm font-black text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Film size={18} />
              Remove background
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            disabled={isProcessing}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-5 text-sm font-bold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Choose another video
          </button>
        </div>
      </aside>
    </div>
  );
}
