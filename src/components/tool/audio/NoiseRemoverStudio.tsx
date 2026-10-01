"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  VolumeX,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Repeat,
  Check,
  Clock,
  X,
  AudioWaveform,
  Sliders,
  Mic2,
  Wind,
  Zap,
  Sparkles,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateNoiseDemoAudio,
  type GeneratedNoiseDemoAudio,
} from "@/lib/vocal-demo-generator";

type NoiseProfile = "speech" | "fans" | "hiss" | "max";
type ActiveTrackMode = "clean" | "original";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function NoiseRemoverStudio() {
  // Source Audio File State
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("Sample Recording");
  const [isDemo, setIsDemo] = useState<boolean>(true);

  // Active Listening Mode: A/B comparison between Clean Audio and Original Audio
  const [activeMode, setActiveMode] = useState<ActiveTrackMode>("clean");
  const [activeProfile, setActiveProfile] = useState<NoiseProfile>("speech");

  // Processing & Dynamic Progress State (Standard 4)
  const [status, setStatus] = useState<"idle" | "ready" | "processing" | "complete" | "error">("complete");
  const [elapsed, setElapsed] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("Preparing audio...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Playback & Master Console State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Audio HTML Elements refs for Clean & Original tracks
  const cleanAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Load Instant $0 Compute Demo on Mount
  useEffect(() => {
    let active = true;
    generateNoiseDemoAudio().then((demo: GeneratedNoiseDemoAudio) => {
      if (!active) return;
      setDuration(demo.duration);
      setCleanedUrl(demo.cleanUrl);
      setSourceUrl(demo.noisyUrl);
      setStatus("complete");
      setIsDemo(true);
      setFileName("Sample Voice (AC Hum & Room Noise)");
      setActiveMode("clean");
    }).catch((err) => {
      console.warn("Could not generate noise demo audio:", err);
    });

    return () => {
      active = false;
      if (xhrRef.current) xhrRef.current.abort();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // 2. Synchronize Volume between Cleaned and Original depending on activeMode
  useEffect(() => {
    const cAudio = cleanAudioRef.current;
    const oAudio = originalAudioRef.current;
    if (cAudio) cAudio.volume = activeMode === "clean" ? 1.0 : 0.0;
    if (oAudio) oAudio.volume = activeMode === "original" ? 1.0 : 0.0;
  }, [activeMode]);

  // 3. Robust Master Timeline & 60FPS RAF Playhead Loop
  useEffect(() => {
    const master = cleanAudioRef.current || originalAudioRef.current;
    if (!master) return;

    const handleLoadedMetadata = () => {
      if (master.duration && !isNaN(master.duration) && master.duration > 0) {
        setDuration(master.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(master.currentTime);
      if (master.duration && !isNaN(master.duration) && master.duration > 0) {
        setDuration(master.duration);
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        handleSeek(0);
        cleanAudioRef.current?.play().catch(() => {});
        originalAudioRef.current?.play().catch(() => {});
      } else {
        setIsPlaying(false);
        handleSeek(0);
      }
    };

    master.addEventListener("loadedmetadata", handleLoadedMetadata);
    master.addEventListener("timeupdate", handleTimeUpdate);
    master.addEventListener("ended", handleEnded);

    return () => {
      master.removeEventListener("loadedmetadata", handleLoadedMetadata);
      master.removeEventListener("timeupdate", handleTimeUpdate);
      master.removeEventListener("ended", handleEnded);
    };
  }, [cleanedUrl, sourceUrl, isLooping]);

  // 60FPS Smooth RAF Playhead Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const tick = () => {
      const master = cleanAudioRef.current || originalAudioRef.current;
      if (master && !master.paused && !master.ended) {
        setCurrentTime(master.currentTime);
        if (master.duration && !isNaN(master.duration) && master.duration > 0) {
          setDuration(master.duration);
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Toggle Master Play / Pause
  const togglePlay = () => {
    const audios = [cleanAudioRef.current, originalAudioRef.current].filter(Boolean) as HTMLAudioElement[];
    if (audios.length === 0) return;

    if (isPlaying) {
      audios.forEach((a) => a.pause());
      setIsPlaying(false);
    } else {
      const targetTime = currentTime >= (duration - 0.2) ? 0 : currentTime;
      if (targetTime === 0) setCurrentTime(0);

      audios.forEach((a) => {
        a.currentTime = targetTime;
      });

      Promise.all(audios.map((a) => a.play().catch(() => null)))
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Seek Playhead
  const handleSeek = (newTime: number) => {
    const safeTime = Math.max(0, Math.min(duration || 10, newTime));
    setCurrentTime(safeTime);
    if (cleanAudioRef.current) cleanAudioRef.current.currentTime = safeTime;
    if (originalAudioRef.current) originalAudioRef.current.currentTime = safeTime;
  };

  // Reset Playhead to 0:00
  const handleResetPlayback = () => {
    handleSeek(0);
    if (!isPlaying) togglePlay();
  };

  // Toggle Loop
  const toggleLoop = () => {
    setIsLooping((prev) => !prev);
    showToast(!isLooping ? "Looping enabled" : "Looping disabled");
  };

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const picked = acceptedFiles[0];

    if (sourceUrl && !isDemo) {
      URL.revokeObjectURL(sourceUrl);
    }

    const objectUrl = URL.createObjectURL(picked);
    setFile(picked);
    setSourceUrl(objectUrl);
    setCleanedUrl(null);
    setFileName(picked.name);
    setStatus("ready");
    setErrorMessage(null);
    setIsPlaying(false);
    setIsDemo(false);
  }, [sourceUrl, isDemo]);

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".flac", ".ogg", ".aac", ".webm"],
    },
    maxFiles: 1,
    noClick: false,
    noKeyboard: true,
  });

  // Load Demo Audio
  const handleLoadDemo = async () => {
    setIsPlaying(false);
    try {
      const demo = await generateNoiseDemoAudio();
      setDuration(demo.duration);
      setCleanedUrl(demo.cleanUrl);
      setSourceUrl(demo.noisyUrl);
      setIsDemo(true);
      setFile(null);
      setFileName("Sample Voice (AC Hum & Room Noise)");
      setStatus("complete");
      setActiveMode("clean");
      showToast("Sample recording loaded");
    } catch {
      setStatus("error");
      setErrorMessage("Could not load sample audio.");
    }
  };

  // Run AI Noise Removal with Real-Time Dynamic Progress (Standard 4)
  const handleProcessAudio = async () => {
    if (!file) return;

    setStatus("processing");
    setElapsed(0);
    setProgress(0);
    setProcessingStage(`Uploading ${file.name}...`);
    setErrorMessage(null);
    setIsPlaying(false);

    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }

    elapsedTimerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      // 1. Real Upload Progress (0% to 35%)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const uploadPct = Math.min(100, Math.round((e.loaded / e.total) * 100));
          const overallProgress = Math.round((uploadPct / 100) * 35);
          setProgress(overallProgress);
          setProcessingStage(`Uploading audio (${uploadPct}%) • ${formatBytes(e.loaded)} of ${formatBytes(e.total)}`);
        }
      };

      // 2. Upload Finished -> Start continuous dynamic stages (35% to 99%)
      xhr.upload.onload = () => {
        setProgress(35);
        setProcessingStage("Analyzing background noise & room acoustics...");

        let currentProgress = 35;
        progressTimerRef.current = setInterval(() => {
          let step = 0.5;
          if (currentProgress < 50) {
            step = 0.65;
            setProcessingStage("Detecting air conditioner hum and mic hiss...");
          } else if (currentProgress < 70) {
            step = 0.45;
            setProcessingStage("Separating spoken voice from ambient noise...");
          } else if (currentProgress < 85) {
            step = 0.3;
            setProcessingStage("Polishing vocal tone and smoothing pauses...");
          } else if (currentProgress < 95) {
            step = 0.15;
            setProcessingStage("Finalizing studio-clean recording...");
          } else if (currentProgress < 99) {
            step = 0.04;
            setProcessingStage("Preparing your studio audio player...");
          }

          currentProgress = Math.min(99, +(currentProgress + step).toFixed(1));
          setProgress(currentProgress);
        }, 150);
      };

      // 3. Response Received
      xhr.onload = () => {
        if (elapsedTimerRef.current) {
          clearInterval(elapsedTimerRef.current);
          elapsedTimerRef.current = null;
        }
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            const outputTracks = json?.result?.tracks;

            if (!Array.isArray(outputTracks) || outputTracks.length === 0) {
              throw new Error("Invalid output received from the server.");
            }

            const cleanTrack = outputTracks[0];
            setProgress(100);
            setProcessingStage("Audio cleaned successfully!");

            setTimeout(() => {
              setCleanedUrl(cleanTrack.url);
              setStatus("complete");
              setActiveMode("clean");
              showToast("Background noise removed cleanly!");
              resolve();
            }, 450);
          } catch (parseErr) {
            const err = parseErr as Error;
            setErrorMessage(err.message || "Could not parse cleaning output.");
            setStatus("error");
            reject(parseErr);
          }
        } else {
          try {
            const errJson = JSON.parse(xhr.responseText);
            setErrorMessage(errJson.error || "Could not clean this audio file. Please try another recording.");
          } catch {
            setErrorMessage("Audio cleaning failed. Please try another audio file.");
          }
          setStatus("error");
          reject(new Error("Cleaning failed"));
        }
      };

      // 4. Network or Abort handlers
      xhr.onerror = () => {
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setErrorMessage("Network error occurred during audio cleaning.");
        setStatus("error");
        reject(new Error("Network error"));
      };

      xhr.onabort = () => {
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setProgress(0);
        setStatus("ready");
        resolve();
      };

      const formData = new FormData();
      formData.append("file", file);

      xhr.open("POST", "/api/tools/audio/noise-remover");
      xhr.send(formData);
    });
  };

  // Cancel Processing
  const handleCancelProcessing = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    setProgress(0);
    setStatus("ready");
  };

  // Download Cleaned Track
  const handleDownload = () => {
    if (!cleanedUrl) return;
    const a = document.createElement("a");
    a.href = cleanedUrl;
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    a.download = `${baseName}-cleaned.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Downloading studio-clean audio...");
  };

  // Clear / Reset
  const handleClear = () => {
    setIsPlaying(false);
    setFile(null);
    setSourceUrl(null);
    setCleanedUrl(null);
    setStatus("idle");
    setErrorMessage(null);
  };

  // Pre-generate dynamic visualizer bars
  const visualizerBars = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const phase = (i / 48) * Math.PI * 4;
      const height = Math.abs(Math.sin(phase) * 0.7 + Math.cos(phase * 1.5) * 0.3);
      return Math.max(0.15, Math.min(0.95, height));
    });
  }, []);

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6">
      {/* Hidden Audio Elements for Clean & Original tracks */}
      {cleanedUrl && (
        <audio
          ref={cleanAudioRef}
          src={cleanedUrl}
          preload="auto"
          loop={isLooping}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (!isNaN(el.currentTime)) setCurrentTime(el.currentTime);
            if (el.duration && !isNaN(el.duration) && el.duration > 0) setDuration(el.duration);
          }}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            if (el.duration && !isNaN(el.duration) && el.duration > 0) setDuration(el.duration);
          }}
          onEnded={() => {
            if (!isLooping) {
              setIsPlaying(false);
              handleSeek(0);
            }
          }}
        />
      )}
      {sourceUrl && (
        <audio
          ref={originalAudioRef}
          src={sourceUrl}
          preload="auto"
          loop={isLooping}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0e101a]/95 border border-pink-500/40 text-pink-200 text-xs font-bold shadow-[0_10px_30px_rgba(236,72,153,0.3)] backdrop-blur-xl"
          >
            <Check size={14} className="text-pink-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN OBSIDIAN CYBER WORKSPACE CARD (Signature Category Pink Theme) */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border-2 border-pink-500/35 bg-[#090a12]/95 shadow-[0_20px_70px_rgba(0,0,0,0.7),0_0_35px_rgba(236,72,153,0.12)] backdrop-blur-2xl">
        {/* Subtle dot matrix texture & neon radial auras */}
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(236,72,153,0.15)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-pink-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px]" />

        {/* WORKSPACE TOP BAR */}
        <div className="relative border-b border-white/[0.08] px-4 py-4 sm:px-7 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Squircle Icon with Spinning Conic Neon Pink Ring */}
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0e101d] border border-white/10 shadow-lg group">
              <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,transparent_0%,rgba(236,72,153,0.8)_30%,transparent_60%)] animate-[spin_6s_linear_infinite]" />
              <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#0a0b14]" />
              <VolumeX className="relative size-5 text-pink-300 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-400">
                  Audio & Music
                </span>
                {isDemo && (
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-400/30 text-[9px] font-bold text-pink-300">
                    Sample Voice Playing
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                {fileName}
              </h2>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isDemo && (
              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <Headphones size={13} className="text-pink-400" />
                <span>Try Sample Audio</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold text-zinc-300">
              <CheckCircle2 size={13} className="text-pink-400" />
              <span>Studio Noise Clean</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE BODY */}
        <div className="relative p-4 sm:p-7 space-y-6">
          {/* 1. TOP STAGE: UPLOAD & ACTION (Clean, direct, zero jargon) */}
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left Box: Audio Upload */}
            <div
              {...getRootProps()}
              className={cn(
                "relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl border-2 border-dashed p-5 transition duration-300 sm:p-6",
                isDragActive
                  ? "border-pink-400/80 bg-pink-500/[0.08]"
                  : "border-white/15 bg-white/[0.02] hover:border-pink-500/40 hover:bg-white/[0.04]"
              )}
            >
              <input {...getInputProps()} />

              <div className="flex items-start justify-between gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                  <Upload size={18} />
                </div>
                <span className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  MP3, WAV, M4A, FLAC
                </span>
              </div>

              <div className="py-3 text-center">
                {file ? (
                  <div className="space-y-1.5">
                    <p className="mx-auto max-w-sm font-bold text-white text-base truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatBytes(file.size)} • Ready to remove background noise
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Drop your recording here
                    </p>
                    <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      Upload audio to remove air conditioner hums, fan noise, microphone hiss, and room echo.
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Action Row */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="flex-1 min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] px-4 text-xs font-bold text-white transition cursor-pointer"
                >
                  <Upload size={14} />
                  <span>{file ? "Choose Another Audio File" : "Choose Audio File"}</span>
                </button>
                {file && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="size-11 flex items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Box: Action Card (When file is chosen vs idle preview) */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              {file ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-pink-400">
                        Selected Recording
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {formatBytes(file.size)}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white truncate">{file.name}</p>

                    {/* Cleaning Profile Selector */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                        Target Noise Profile
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "speech" as NoiseProfile, name: "Voice & Speech", icon: Mic2 },
                          { id: "fans" as NoiseProfile, name: "Fan & AC Hum", icon: Wind },
                          { id: "hiss" as NoiseProfile, name: "Mic Hiss & Buzz", icon: Zap },
                          { id: "max" as NoiseProfile, name: "Max Silence", icon: VolumeX },
                        ].map((p) => {
                          const Icon = p.icon;
                          const isSel = activeProfile === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setActiveProfile(p.id)}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer",
                                isSel
                                  ? "bg-pink-500/20 border-pink-500/50 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                              )}
                            >
                              <Icon size={13} className={isSel ? "text-pink-400" : "text-zinc-500"} />
                              <span className="truncate">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button (Category Pink Theme) */}
                  <div>
                    <button
                      type="button"
                      onClick={handleProcessAudio}
                      disabled={status === "processing"}
                      className="w-full min-h-12 flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(236,72,153,0.35)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <AudioWaveform size={16} />
                      <span>
                        {status === "processing" ? "Cleaning Audio..." : "Remove Background Noise"}
                      </span>
                    </button>

                    {errorMessage && (
                      <p className="mt-2 text-center text-xs text-rose-400">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="size-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-2">
                      <AudioWaveform size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white">Voice & Noise Isolation</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Silence background humming, fan noise, microphone hiss, and room echo while keeping your spoken voice natural and crisp.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleLoadDemo}
                      className="w-full min-h-11 flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <Headphones size={14} className="text-pink-400" />
                      <span>Try Sample Audio</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. IN-FLIGHT PROGRESS BAR (Dynamic, Real-time % & continuous stages) */}
          <AnimatePresence>
            {status === "processing" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="relative overflow-hidden rounded-2xl border border-pink-500/30 bg-[#0c0d18] p-5 sm:p-6 shadow-[0_10px_40px_rgba(236,72,153,0.15)] space-y-4"
              >
                {/* Header: Stage info + Digital Percentage */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300">
                      <div className="absolute inset-0 rounded-xl bg-pink-500/20 animate-ping opacity-30" />
                      <AudioWaveform size={18} className="relative animate-pulse text-pink-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {processingStage}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <Clock size={12} className="text-pink-400" />
                        <span>Elapsed: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Exact Numeric Percentage Badge */}
                  <div className="flex items-baseline gap-1 shrink-0 px-3.5 py-1.5 rounded-xl bg-black/60 border border-pink-500/30 shadow-inner">
                    <span className="font-mono text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300">
                      {Math.round(progress)}
                    </span>
                    <span className="font-mono text-xs font-bold text-pink-400">%</span>
                  </div>
                </div>

                {/* The Dynamic Animated Progress Track */}
                <div className="relative w-full h-3 rounded-full bg-black/70 border border-white/10 p-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-400 transition-all duration-200 ease-out relative"
                    style={{ width: `${Math.max(3, Math.min(100, progress))}%` }}
                  >
                    {/* Continuous Shimmer Light Sheen */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                    {/* Glowing Leading Needle Jewel */}
                    <div className="absolute right-0.5 top-1/2 -translate-y-1/2 size-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                  </div>
                </div>

                {/* Footer Controls: Plain English, Cancel action */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="size-1.5 rounded-full bg-pink-400 animate-pulse" />
                    High-quality AI voice cleaning in progress
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelProcessing}
                    className="text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:underline transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. STUDIO CONSOLE & A/B COMPARISON PLAYER */}
          {status === "complete" && (cleanedUrl || sourceUrl) && (
            <div className="space-y-6 pt-2">
              <div className="rounded-2xl border border-white/10 bg-[#0c0d18] p-4 sm:p-6 space-y-4">
                {/* Instant A/B Comparison Switch: Clean Audio vs Original Audio */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sliders size={13} className="text-pink-400" />
                    Instant A/B Audio Comparison
                  </span>

                  <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/60 border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("clean");
                        showToast("Listening to Clean Audio");
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer",
                        activeMode === "clean"
                          ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Volume2 size={14} />
                      <span>Clean Audio (Noise Removed)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("original");
                        showToast("Listening to Original Noisy Audio");
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer",
                        activeMode === "original"
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <VolumeX size={14} />
                      <span>Original Audio (Noisy)</span>
                    </button>
                  </div>
                </div>

                {/* Master Transport & Waveform Display */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                  {/* Transport Play / Pause & Loop */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleResetPlayback}
                      className="size-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      title="Reset to beginning"
                    >
                      <RotateCcw size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="size-14 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.5)] transition hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleLoop}
                      className={cn(
                        "size-10 rounded-xl border transition flex items-center justify-center cursor-pointer",
                        isLooping
                          ? "border-pink-500/40 bg-pink-500/15 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                          : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
                      )}
                      title={isLooping ? "Looping enabled" : "Looping disabled"}
                    >
                      <Repeat size={16} />
                    </button>
                  </div>

                  {/* Interactive Reactive Soundwave Visualizer Bars with Laser Playhead */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      handleSeek(ratio * (duration || 10));
                    }}
                    className="relative flex items-center justify-between gap-1 h-10 px-4 py-1.5 rounded-xl bg-black/60 border border-white/10 flex-1 max-w-md w-full overflow-hidden cursor-pointer group select-none shadow-inner"
                    title="Click anywhere to seek"
                  >
                    {/* Laser Playhead Needle */}
                    <div
                      className="absolute top-1 bottom-1 w-[2px] bg-white shadow-[0_0_10px_2px_#ec4899] pointer-events-none z-10 transition-none"
                      style={{
                        left: `${Math.min(99.5, Math.max(0.5, ((currentTime / (duration || 10)) * 100)))}%`,
                      }}
                    >
                      <div className="absolute -top-1 -left-1 size-2 rounded-full bg-pink-300 shadow-[0_0_8px_#ffffff]" />
                    </div>

                    {visualizerBars.map((baseH, idx) => {
                      const barRatio = idx / visualizerBars.length;
                      const isPlayed = barRatio <= progressRatio;
                      const dynamicWave = isPlaying
                        ? Math.sin(currentTime * 8 + idx * 0.45) * 0.22 + Math.cos(currentTime * 5 + idx * 0.3) * 0.12
                        : 0;
                      const finalH = Math.max(16, Math.min(100, Math.round((baseH + dynamicWave) * 100)));

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "w-1 rounded-full transition-all duration-75",
                            isPlayed
                              ? activeMode === "clean"
                                ? "bg-gradient-to-t from-pink-500 via-rose-400 to-cyan-300 shadow-[0_0_8px_rgba(236,72,153,0.7)] opacity-100"
                                : "bg-gradient-to-t from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.7)] opacity-100"
                              : "bg-white/20 opacity-35 group-hover:opacity-50"
                          )}
                          style={{
                            height: `${finalH}%`,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Master Time Readout */}
                  <div className="font-mono text-sm font-bold text-zinc-300 tracking-wider">
                    <span className="text-white">{formatTime(currentTime)}</span>
                    <span className="text-zinc-600 mx-1">/</span>
                    <span className="text-zinc-400">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Master Seek Timeline Bar */}
                <div className="pt-2">
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 10}
                      step={0.01}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none bg-white/10 accent-pink-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM DOWNLOAD DOCK */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-[#0c0d18]">
                <div>
                  <h4 className="text-sm font-bold text-white">Save Your Cleaned Recording</h4>
                  <p className="text-xs text-zinc-400">
                    Export high-fidelity studio audio with background noise eliminated.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!cleanedUrl}
                    className="flex-1 sm:flex-none min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs px-6 shadow-[0_0_20px_rgba(236,72,153,0.35)] transition cursor-pointer disabled:opacity-50"
                  >
                    <Download size={15} />
                    <span>Download Clean Audio</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
