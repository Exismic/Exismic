"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Check,
  Copy,
  Download,
  FileAudio,
  Loader2,
  Mic2,
  RotateCcw,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Transcription = {
  text: string;
  language?: string;
  duration?: number | null;
};

const LANGUAGES = [
  { value: "auto", label: "Detect automatically" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
] as const;

export function SpeechToText() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("auto");
  const [result, setResult] = useState<Transcription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    const nextFile = files[0];
    if (!nextFile) return;
    if (nextFile.size > 25 * 1024 * 1024) {
      setError("Recording is too large. Maximum size is 25MB.");
      return;
    }
    setFile(nextFile);
    setResult(null);
    setError(null);
  }, []);

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 25 * 1024 * 1024,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"],
      "video/mp4": [".mp4"],
    },
  });

  useEffect(() => {
    setCopied(false);
  }, [result]);

  const transcribe = async () => {
    if (!file || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      const response = await fetch("/api/tools/audio/stt", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Transcription failed.");
      setResult({
        text: data.text,
        language: data.language,
        duration: data.duration,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Transcription failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_800);
  };

  const downloadResult = () => {
    if (!result?.text) return;
    const url = URL.createObjectURL(new Blob([result.text], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${file?.name.replace(/\.[^.]+$/, "") || "transcript"}.txt`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="space-y-5 rounded-lg border border-white/10 bg-zinc-950/70 p-5 shadow-xl sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200">
            <Mic2 size={20} />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">Recording</h2>
            <p className="text-xs text-zinc-500">MP3, WAV, M4A, OGG, FLAC, WebM, or MP4</p>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-white/15 bg-black/30 p-6 text-center transition",
            isDragActive && "border-cyan-300/60 bg-cyan-300/[0.05]",
          )}
        >
          <input {...getInputProps()} />
          <span className="flex size-14 items-center justify-center rounded-md bg-white/[0.05] text-zinc-300">
            {file ? <FileAudio size={25} /> : <Upload size={25} />}
          </span>
          <div className="space-y-1">
            <p className="break-all text-sm font-bold text-white">
              {file?.name || "Drop a recording here"}
            </p>
            <p className="text-xs text-zinc-500">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or tap to choose a file, up to 25MB"}
            </p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            Spoken language
          </span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="min-h-12 w-full rounded-md border border-white/10 bg-black/50 px-4 text-sm font-bold text-white outline-none focus:border-cyan-300/40"
          >
            {LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <div className="flex gap-3">
          {file && (
            <button
              type="button"
              onClick={reset}
              className="flex min-h-12 items-center justify-center rounded-md border border-white/10 px-4 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Clear recording"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={transcribe}
            disabled={!file || isProcessing}
            className="premium-gradient flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md px-5 text-xs font-black uppercase tracking-widest text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Mic2 size={18} />}
            {isProcessing ? "Transcribing" : "Transcribe audio"}
          </button>
        </div>
        {error && (
          <p role="alert" className="rounded-md border border-red-400/20 bg-red-500/[0.06] p-4 text-sm font-medium text-red-200">
            {error}
          </p>
        )}
      </section>

      <section className="flex min-h-[520px] flex-col rounded-lg border border-white/10 bg-zinc-950/70 p-5 shadow-xl sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">Transcript</p>
            <p className="mt-1 text-xs text-zinc-500">
              {result?.duration ? `${Math.round(result.duration)} seconds` : "Your transcription will appear here"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!result}
              className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 px-4 text-xs font-bold text-zinc-300 transition hover:bg-white/5 disabled:opacity-30"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={downloadResult}
              disabled={!result}
              className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 px-4 text-xs font-bold text-zinc-300 transition hover:bg-white/5 disabled:opacity-30"
            >
              <Download size={16} />
              TXT
            </button>
          </div>
        </div>
        <div className="flex-1 whitespace-pre-wrap py-6 text-[15px] font-medium leading-8 text-zinc-200">
          {result?.text || (
            <span className="text-zinc-600">Upload a recording and Lumora will turn the speech into editable text.</span>
          )}
        </div>
      </section>
    </div>
  );
}
