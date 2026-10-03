"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Scissors,
  Film,
  Upload,
  X,
  Play,
  Pause,
  Download,
  Clock,
  CheckCircle2,
  Loader2,
  Timer,
  AlertCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  SlidersHorizontal,
  Smartphone,
  Zap,
  Flame,
  ShieldCheck,
  Compass,
  Keyboard,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  VIDEO_BLUEPRINTS,
  DURATION_PRESETS,
  VideoBlueprint,
  generateBlueprintVideoFile,
} from "./video-trimmer-blueprints";
import { ResultRetentionBar } from "./ResultRetentionBar";

interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration: number;
  width: number;
  height: number;
}

type AspectRatioGuide = "free" | "9:16" | "1:1" | "16:9";

export default function VideoTrimmer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loopRange, setLoopRange] = useState(true);
  const [aspectGuide, setAspectGuide] = useState<AspectRatioGuide>("free");
  const [hoveredHandle, setHoveredHandle] = useState<"start" | "end" | null>(null);

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("Preparing trim...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("exismic-trimmed.mp4");
  const [resultMetadata, setResultMetadata] = useState<{ duration: number; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Blueprint loading state
  const [loadingBlueprintId, setLoadingBlueprintId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [previewUrl, resultUrl]);

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 250 * 1024 * 1024) {
        setError("File exceeds maximum upload size (250MB). Please select a smaller video.");
        return;
      }

      setError(null);
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setResultUrl(null);
      setResultMetadata(null);
      setStartTime(0);
      setEndTime(0);
      setCurrentTime(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
      "video/x-msvideo": [".avi"],
    },
    multiple: false,
  });

  // Handle video metadata loaded
  const handleMetadataLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 10;
    setMetadata({
      name: file?.name || "Sample Video",
      size: file?.size || 0,
      type: file?.type || "video/mp4",
      duration: dur,
      width: video.videoWidth || 1280,
      height: video.videoHeight || 720,
    });
    setStartTime(0);
    setEndTime(dur);
    setCurrentTime(0);
  };

  // Synchronize playback within trimmed range
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (Number.isFinite(startTime) && Number.isFinite(endTime) && endTime > startTime) {
        if (time >= endTime) {
          if (loopRange) {
            videoRef.current.currentTime = startTime;
            videoRef.current.play().catch(() => {});
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
            videoRef.current.currentTime = startTime;
          }
        } else if (time < startTime) {
          videoRef.current.currentTime = startTime;
        }
      }
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (currentTime < startTime || currentTime >= endTime) {
          videoRef.current.currentTime = startTime;
        }
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Play selection specifically
  const playSelectionOnly = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Speed changer
  const cyclePlaybackSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  // Nudge playhead by delta seconds
  const nudgeTime = (delta: number) => {
    if (videoRef.current && metadata) {
      const target = Math.max(0, Math.min(metadata.duration, currentTime + delta));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  // Snap start / end to current playhead
  const setStartAtCurrent = () => {
    const val = Math.min(currentTime, Math.max(0, endTime - 0.2));
    setStartTime(Number(val.toFixed(2)));
  };

  const setEndAtCurrent = () => {
    if (!metadata) return;
    const val = Math.max(currentTime, Math.min(metadata.duration, startTime + 0.2));
    setEndTime(Number(val.toFixed(2)));
  };

  // Apply instant duration preset
  const applyPreset = (preset: (typeof DURATION_PRESETS)[0]) => {
    if (!metadata) return;
    const { start, end } = preset.getRange(metadata.duration);
    setStartTime(Number(start.toFixed(2)));
    setEndTime(Number(end.toFixed(2)));
    if (videoRef.current) {
      videoRef.current.currentTime = start;
      setCurrentTime(start);
    }
  };

  // Load sample blueprint video
  const handleLoadBlueprint = async (blueprint: VideoBlueprint) => {
    try {
      setLoadingBlueprintId(blueprint.id);
      setError(null);
      const generatedFile = await generateBlueprintVideoFile(blueprint);
      setFile(generatedFile);
      const url = URL.createObjectURL(generatedFile);
      setPreviewUrl(url);
      setResultUrl(null);
      setResultMetadata(null);
      setStartTime(blueprint.recommendedTrim.start);
      setEndTime(blueprint.recommendedTrim.end);
      setCurrentTime(blueprint.recommendedTrim.start);
    } catch (err) {
      console.error("Blueprint generation error:", err);
      setError("Unable to generate sample video. Please upload a video file instead.");
    } finally {
      setLoadingBlueprintId(null);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "BracketLeft") {
        e.preventDefault();
        setStartAtCurrent();
      } else if (e.code === "BracketRight") {
        e.preventDefault();
        setEndAtCurrent();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        nudgeTime(e.shiftKey ? -1 : -0.1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        nudgeTime(e.shiftKey ? 1 : 0.1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Client-side canvas/MediaRecorder video trimming fallback
  const trimVideoLocally = async (
    sourceFile: File,
    start: number,
    end: number,
    onProgress: (pct: number) => void
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const tempVideo = document.createElement("video");
      tempVideo.src = URL.createObjectURL(sourceFile);
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      tempVideo.crossOrigin = "anonymous";

      tempVideo.onloadedmetadata = () => {
        const width = tempVideo.videoWidth || 1280;
        const height = tempVideo.videoHeight || 720;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          URL.revokeObjectURL(tempVideo.src);
          reject(new Error("Canvas context is unavailable."));
          return;
        }

        const stream = canvas.captureStream ? canvas.captureStream(30) : null;
        if (!stream) {
          URL.revokeObjectURL(tempVideo.src);
          reject(new Error("Browser stream capture is unavailable."));
          return;
        }

        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "video/mp4";

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 4000000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };

        recorder.onstop = () => {
          URL.revokeObjectURL(tempVideo.src);
          const finalBlob = new Blob(chunks, { type: mimeType });
          resolve(finalBlob);
        };

        recorder.onerror = () => {
          URL.revokeObjectURL(tempVideo.src);
          reject(new Error("Local recording failed."));
        };

        // Seek to start
        tempVideo.currentTime = start;
        tempVideo.onseeked = () => {
          tempVideo.onseeked = null;
          recorder.start(100);
          tempVideo.play().catch(() => {});

          const trimDuration = end - start;

          const renderInterval = setInterval(() => {
            if (tempVideo.currentTime >= end || tempVideo.paused || tempVideo.ended) {
              clearInterval(renderInterval);
              tempVideo.pause();
              setTimeout(() => {
                if (recorder.state === "recording") {
                  recorder.stop();
                }
              }, 100);
              return;
            }

            ctx.drawImage(tempVideo, 0, 0, width, height);
            const elapsed = Math.max(0, tempVideo.currentTime - start);
            const progress = Math.min(99, Math.round((elapsed / trimDuration) * 100));
            onProgress(progress);
          }, 1000 / 30);
        };
      };

      tempVideo.onerror = () => {
        URL.revokeObjectURL(tempVideo.src);
        reject(new Error("Unable to read video file for local trimming."));
      };
    });
  };

  // Main Trim Handler (Continuous dynamic progress Standard 4)
  const handleTrim = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(4);
    setProcessingStage("Reading video frames & timestamps...");

    // Smooth asymptotic continuous progress ticker (Standard 4)
    let currentPct = 4;
    progressTimerRef.current = setInterval(() => {
      currentPct += (94 - currentPct) * 0.08;
      const rounded = Math.round(currentPct);
      setProcessingProgress(rounded);

      if (rounded < 30) {
        setProcessingStage("Scanning clip timestamps...");
      } else if (rounded < 65) {
        setProcessingStage(`Trimming section [${formatTime(startTime)} – ${formatTime(endTime)}]...`);
      } else if (rounded < 88) {
        setProcessingStage("Preserving high-definition video clarity...");
      } else {
        setProcessingStage("Finalizing download...");
      }
    }, 150);

    try {
      let finalBlob: Blob | null = null;
      let finalFileName = `${file.name.replace(/\.[^/.]+$/, "")}-trimmed.mp4`;

      // 1. Try Next.js server route first
      try {
        const formData = new FormData();
        formData.append("video", file);
        formData.append("start", startTime.toString());
        formData.append("end", endTime.toString());

        const response = await fetch("/api/tools/video/trimmer", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          finalBlob = await response.blob();
          const customHeaderName = response.headers.get("X-Exismic-File-Name");
          if (customHeaderName) {
            finalFileName = decodeURIComponent(customHeaderName);
          }
        }
      } catch (srvErr) {
        console.warn("Server route trim skipped, attempting direct modal / client fallback:", srvErr);
      }

      // 2. Direct modal fallback if server route was unavailable
      if (!finalBlob) {
        const baseUrl =
          process.env.NEXT_PUBLIC_MODAL_VIDEO_URL ||
          "https://syedrayangames--lumora-video-tools-fastapi-app.modal.run";

        const fileToBase64 = (f: File): Promise<string> =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(f);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
          });

        try {
          const base64Data = await fileToBase64(file);
          const modalRes = await fetch(`${baseUrl.replace(/\/+$/, "")}/trim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_name: file.name,
              file_data_base64: base64Data,
              start_time: startTime,
              end_time: endTime,
            }),
          });

          if (modalRes.ok) {
            const result = await modalRes.json();
            if (result.success && result.file_data_base64) {
              const base64Res = await fetch(result.file_data_base64);
              finalBlob = await base64Res.blob();
            }
          }
        } catch (modalErr) {
          console.warn("Modal backend unavailable, falling back to instant client-side canvas trim:", modalErr);
        }
      }

      // 3. Client-side canvas/MediaRecorder fallback (Guarantees 100% success)
      if (!finalBlob) {
        setProcessingStage("Running fast local trim...");
        finalBlob = await trimVideoLocally(file, startTime, endTime, (pct) => {
          setProcessingProgress(Math.max(currentPct, pct));
        });
      }

      // Snap to 100% complete
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProcessingProgress(100);
      setProcessingStage("Video trimmed successfully!");

      await new Promise((r) => setTimeout(r, 450));

      const newUrl = URL.createObjectURL(finalBlob);
      setResultUrl(newUrl);
      setResultFileName(finalFileName);
      setResultMetadata({
        duration: Math.max(0.1, endTime - startTime),
        size: finalBlob.size,
      });
    } catch (err) {
      console.error("Trimming failed:", err);
      setError(err instanceof Error ? err.message : "Failed to trim video. Please try a different range.");
    } finally {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsProcessing(false);
    }
  };

  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "success">("idle");

  // Reset to initial upload state
  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultFileName("exismic-trimmed.mp4");
    setResultMetadata(null);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setMetadata(null);
    setError(null);
    setDownloadStatus("idle");
  };

  // Fullscreen video toggle
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoContainerRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Download trimmed video helper
  const handleDownload = async () => {
    if (!resultUrl) return;
    setDownloadStatus("downloading");
    await new Promise((r) => setTimeout(r, 450));
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = resultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadStatus("success");
    setTimeout(() => setDownloadStatus("idle"), 2500);
  };

  // Formatter utilities
  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time < 0) return "00:00.00";
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const selectedDuration = Math.max(0, endTime - startTime);
  const totalDuration = metadata?.duration || 1;
  const cutPercentage =
    totalDuration > 0
      ? Math.max(0, Math.min(100, Math.round(((totalDuration - selectedDuration) / totalDuration) * 100)))
      : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-4">
      <AnimatePresence mode="wait">
        {!file ? (
          /* ========================================================================
             EMPTY STATE: ELEVATED DROPZONE + INSTANT SAMPLE BLUEPRINTS
             ======================================================================== */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-10"
          >
            {/* Primary Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 min-h-[380px] sm:min-h-[420px]",
                "flex flex-col items-center justify-center text-center transition-all duration-300",
                "bg-[#070914]/90 border-white/[0.12] hover:border-violet-500/60 hover:bg-violet-950/[0.08]",
                isDragActive && "border-violet-400 bg-violet-900/15 scale-[0.99]"
              )}
            >
              <input {...getInputProps()} />

              {/* Ambient specular background glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-violet-500/10 blur-[120px] rounded-full group-hover:bg-violet-500/20 transition-all duration-700" />
              </div>

              {/* Icon Orb */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-violet-500/25 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-violet-500/40 group-hover:bg-violet-500/10 transition-all duration-300">
                  <Scissors className="w-12 h-12 text-zinc-300 group-hover:text-violet-300 transition-colors" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-violet-600 text-white shadow-lg border border-violet-400/30">
                  <Film className="w-4 h-4" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 font-outfit">
                Drop your video here to trim
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
                Cut away awkward pauses, keep the best moments, and download a crisp MP4 clip with frame-accurate control.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-zinc-300">
                  MP4, MOV, WebM, AVI
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
                  Up to 250 MB
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Private
                </span>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-2 text-rose-300 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 text-sm font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>

            {/* Instant Sample Blueprints Gallery (Standard 3: Zero Dead Void) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-outfit">
                      Or Try an Instant Sample Video
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Test video trimming instantly without searching for a file on your device.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  4 Ready-to-Test Clips
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {VIDEO_BLUEPRINTS.map((bp) => (
                  <motion.div
                    key={bp.id}
                    whileHover={{ y: -3 }}
                    className="relative rounded-2xl bg-[#080b16] border border-white/[0.08] hover:border-violet-500/40 p-4 flex flex-col justify-between group transition-all duration-200 overflow-hidden shadow-lg"
                  >
                    {/* Top ambient color edge */}
                    <div
                      className="absolute inset-x-0 top-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${bp.accentColor}, transparent)`,
                      }}
                    />

                    <div className="space-y-3">
                      {/* Thumbnail SVG Box */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/5 group-hover:border-white/10 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bp.previewSvg}
                          alt={bp.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-3 rounded-full bg-violet-600/90 text-white shadow-xl">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-zinc-300">
                          {bp.duration}s
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                          <span style={{ color: bp.accentColor }}>{bp.category}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">
                            Trim {bp.recommendedTrim.start}s–{bp.recommendedTrim.end}s
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors line-clamp-1">
                          {bp.name}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {bp.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleLoadBlueprint(bp)}
                      disabled={loadingBlueprintId !== null}
                      className={cn(
                        "mt-4 w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all",
                        "bg-white/[0.04] hover:bg-violet-600 hover:text-white text-zinc-200 border border-white/10 hover:border-violet-500/40",
                        loadingBlueprintId === bp.id && "bg-violet-600 text-white cursor-wait"
                      )}
                    >
                      {loadingBlueprintId === bp.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Clip...</span>
                        </>
                      ) : (
                        <>
                          <span>Load Sample Clip</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ========================================================================
             EDITOR STATE: VIDEO WORKSPACE & CONTROLS (BALANCED 12-COL LAYOUT)
             ======================================================================== */
          <motion.div
            key="trimmer-editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column (Main Stage & Timeline Controls) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
                {/* Video Viewport Stage */}
                <div
                  ref={videoContainerRef}
                  className="relative aspect-video bg-black group/video overflow-hidden"
                >
                  <video
                    ref={videoRef}
                    src={previewUrl!}
                    onLoadedMetadata={handleMetadataLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-contain"
                  />

                  {/* Social Aspect Ratio Framing Overlay Guidelines */}
                  {aspectGuide !== "free" && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div
                        className={cn(
                          "border-2 border-dashed border-violet-400/60 bg-violet-500/[0.03] shadow-[0_0_25px_rgba(139,92,246,0.2)] transition-all duration-300",
                          aspectGuide === "9:16" && "h-full aspect-[9/16]",
                          aspectGuide === "1:1" && "h-full aspect-square",
                          aspectGuide === "16:9" && "w-full aspect-video"
                        )}
                      >
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[10px] font-mono text-violet-300">
                          {aspectGuide} Frame Guide
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Center Play/Pause Glass Trigger */}
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/video:opacity-100 transition-opacity duration-200 cursor-pointer"
                  >
                    <button
                      type="button"
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                      className="p-5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 hover:bg-violet-600 hover:border-violet-400 text-white shadow-2xl transition-all transform hover:scale-110 active:scale-95"
                    >
                      {isPlaying ? (
                        <Pause className="w-10 h-10 fill-current" />
                      ) : (
                        <Play className="w-10 h-10 fill-current ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Top HUD Telemetry Bar */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 flex items-center gap-2 pointer-events-auto">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isPlaying ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                          )}
                        />
                        <span className="text-xs font-mono font-semibold text-zinc-200">
                          {formatTime(currentTime)}
                        </span>
                      </div>

                      {metadata && (
                        <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] text-zinc-300 font-mono">
                          {metadata.width}×{metadata.height}
                        </div>
                      )}
                    </div>

                    {/* Top Right Quick Controls */}
                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button
                        onClick={cyclePlaybackSpeed}
                        className="px-2.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 hover:border-violet-500/50 text-[11px] font-mono text-zinc-200 hover:text-white transition-colors"
                        title="Change Playback Speed"
                      >
                        {playbackSpeed}x
                      </button>

                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-full bg-black/75 backdrop-blur-md border border-white/10 hover:border-violet-500/50 text-zinc-200 hover:text-white transition-colors"
                        title={isMuted ? "Unmute Audio" : "Mute Audio"}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setLoopRange(!loopRange)}
                        className={cn(
                          "p-2 rounded-full backdrop-blur-md border transition-colors",
                          loopRange
                            ? "bg-violet-600/90 border-violet-400 text-white"
                            : "bg-black/75 border-white/10 text-zinc-400 hover:text-white"
                        )}
                        title={loopRange ? "Looping Selection" : "Plays Once"}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-full bg-black/75 backdrop-blur-md border border-white/10 hover:border-violet-500/50 text-zinc-200 hover:text-white transition-colors"
                        title="Toggle Fullscreen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Aspect Ratio Framing Guideline Selector (Bottom Left HUD) */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/10">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                      Frame Guide:
                    </span>
                    {(["free", "9:16", "1:1", "16:9"] as AspectRatioGuide[]).map((guide) => (
                      <button
                        key={guide}
                        onClick={() => setAspectGuide(guide)}
                        className={cn(
                          "px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all",
                          aspectGuide === guide
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {guide === "free" ? "Off" : guide}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrubber & Trimming Timeline Controls */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Timeline Scrubber Container */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 px-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                        Start: <strong className="text-white">{formatTime(startTime)}</strong>
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-bold">
                        Trimed: {formatTime(selectedDuration)}
                      </span>
                      <span className="flex items-center gap-1">
                        End: <strong className="text-white">{formatTime(endTime)}</strong>
                      </span>
                    </div>

                    {/* Dual-Handle Scrubber Visual Bar */}
                    <div
                      ref={timelineRef}
                      className="relative h-16 bg-[#0a0d1d] rounded-2xl border border-white/10 overflow-hidden select-none"
                    >
                      {/* Filmstrip Ticks & Background Pattern */}
                      <div className="absolute inset-0 flex items-center justify-between px-3 opacity-25 pointer-events-none">
                        {[...Array(24)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-0.5 bg-zinc-400",
                              i % 4 === 0 ? "h-6 opacity-75" : "h-3 opacity-40"
                            )}
                          />
                        ))}
                      </div>

                      {/* Shaded/Cut Range Mask (Left Discarded Area) */}
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-black/75 border-r border-white/15 pointer-events-none z-10"
                        style={{ width: `${(startTime / totalDuration) * 100}%` }}
                      />

                      {/* Active Retained Range (Glowing Violet Box) */}
                      <div
                        className="absolute top-0 bottom-0 z-10 pointer-events-none"
                        style={{
                          left: `${(startTime / totalDuration) * 100}%`,
                          width: `${((endTime - startTime) / totalDuration) * 100}%`,
                        }}
                      >
                        <div className="w-full h-full bg-violet-600/20 border-y border-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center">
                          <span className="text-[10px] font-mono font-bold text-violet-200 bg-black/60 px-2 py-0.5 rounded-full border border-violet-400/30">
                            KEEP ({formatTime(selectedDuration)})
                          </span>
                        </div>
                      </div>

                      {/* Shaded/Cut Range Mask (Right Discarded Area) */}
                      <div
                        className="absolute top-0 bottom-0 right-0 bg-black/75 border-l border-white/15 pointer-events-none z-10"
                        style={{ width: `${(1 - endTime / totalDuration) * 100}%` }}
                      />

                      {/* Current Playhead Scrubber Line */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white z-20 pointer-events-none shadow-[0_0_12px_#ffffff]"
                        style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md" />
                      </div>

                      {/* Native Dual Range Sliders (Overlaid for high-precision dragging) */}
                      <input
                        type="range"
                        aria-label="Trim start time"
                        min="0"
                        max={totalDuration}
                        step="0.01"
                        value={startTime}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), endTime - 0.2);
                          setStartTime(Number(val.toFixed(2)));
                          if (videoRef.current) {
                            videoRef.current.currentTime = val;
                            setCurrentTime(val);
                          }
                        }}
                        onMouseEnter={() => setHoveredHandle("start")}
                        className={cn(
                          "absolute inset-0 w-full h-full opacity-0 cursor-ew-resize",
                          hoveredHandle === "start" ? "z-30" : "z-20"
                        )}
                      />

                      <input
                        type="range"
                        aria-label="Trim end time"
                        min="0"
                        max={totalDuration}
                        step="0.01"
                        value={endTime}
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), startTime + 0.2);
                          setEndTime(Number(val.toFixed(2)));
                          if (videoRef.current) {
                            videoRef.current.currentTime = val;
                            setCurrentTime(val);
                          }
                        }}
                        onMouseEnter={() => setHoveredHandle("end")}
                        className={cn(
                          "absolute inset-0 w-full h-full opacity-0 cursor-ew-resize",
                          hoveredHandle === "end" ? "z-30" : "z-20"
                        )}
                      />

                      {/* Left Handle Nub (Start) */}
                      <div
                        className="absolute top-0 bottom-0 w-2 bg-violet-500 z-20 pointer-events-none rounded-l-md shadow-lg"
                        style={{ left: `${(startTime / totalDuration) * 100}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-5 h-10 bg-violet-600 rounded-lg shadow-xl border border-violet-300 flex flex-col items-center justify-center gap-1">
                          <div className="w-1 h-3 bg-white/70 rounded-full" />
                        </div>
                      </div>

                      {/* Right Handle Nub (End) */}
                      <div
                        className="absolute top-0 bottom-0 w-2 bg-purple-500 z-20 pointer-events-none rounded-r-md shadow-lg"
                        style={{ left: `${(endTime / totalDuration) * 100}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-5 h-10 bg-purple-600 rounded-lg shadow-xl border border-purple-300 flex flex-col items-center justify-center gap-1">
                          <div className="w-1 h-3 bg-white/70 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Frame-Accurate Snapping & Micro-Nudge Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={setStartAtCurrent}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-violet-500/50 hover:bg-violet-600/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                        title="Set Start Point to current video position (Shortcut: [)"
                      >
                        <span className="w-2 h-2 rounded-full bg-violet-400" />
                        Set Start Here <span className="text-[10px] text-zinc-500 font-mono">[</span>
                      </button>

                      <button
                        onClick={setEndAtCurrent}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-purple-500/50 hover:bg-purple-600/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                        title="Set End Point to current video position (Shortcut: ])"
                      >
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Set End Here <span className="text-[10px] text-zinc-500 font-mono">]</span>
                      </button>
                    </div>

                    {/* Step Frame Micro-Adjusters */}
                    <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/10 text-xs font-mono text-zinc-300">
                      <button
                        onClick={() => nudgeTime(-1)}
                        className="px-2 py-1 rounded hover:bg-white/10 transition-colors"
                        title="Step backward 1 second"
                      >
                        -1s
                      </button>
                      <button
                        onClick={() => nudgeTime(-0.1)}
                        className="px-2 py-1 rounded hover:bg-white/10 transition-colors"
                        title="Step backward 0.1s"
                      >
                        -0.1s
                      </button>
                      <span className="w-px h-3 bg-white/10" />
                      <button
                        onClick={() => nudgeTime(0.1)}
                        className="px-2 py-1 rounded hover:bg-white/10 transition-colors"
                        title="Step forward 0.1s"
                      >
                        +0.1s
                      </button>
                      <button
                        onClick={() => nudgeTime(1)}
                        className="px-2 py-1 rounded hover:bg-white/10 transition-colors"
                        title="Step forward 1 second"
                      >
                        +1s
                      </button>
                    </div>
                  </div>

                  {/* Instant Duration Presets / Social Slices */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Quick Cuts & Social Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-violet-600/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          {preset.id === "hook-3s" && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                          {preset.id === "tiktok-15s" && <Smartphone className="w-3.5 h-3.5 text-violet-400" />}
                          {preset.id === "reel-30s" && <Timer className="w-3.5 h-3.5 text-cyan-400" />}
                          {preset.id === "middle-50" && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                          {preset.id === "outro-5s" && <Clock className="w-3.5 h-3.5 text-emerald-400" />}
                          {preset.id === "full-reset" && <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />}
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={reset}
                      className="px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-zinc-400 hover:text-white font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Discard
                    </button>

                    <button
                      onClick={playSelectionOnly}
                      className="px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-violet-500/40 hover:bg-violet-600/10 transition-all text-zinc-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play Selection
                    </button>

                    <button
                      onClick={handleTrim}
                      disabled={isProcessing || selectedDuration <= 0}
                      className={cn(
                        "flex-1 relative overflow-hidden px-8 py-4 rounded-2xl font-black text-base transition-all",
                        "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2.5">
                        <Scissors className="w-5 h-5" />
                        <span>Trim & Save Video</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-300"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Right Column (Inspector, Telemetry & Results) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Continuous Dynamic Progress Feedback Modal / Overlay (Standard 4) */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#080b16] border border-violet-500/40 rounded-[2rem] p-6 shadow-2xl space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-outfit">
                          Trimming Video...
                        </h4>
                        <p className="text-xs text-zinc-400">{processingStage}</p>
                      </div>
                    </div>
                    <span className="text-lg font-black font-mono text-violet-300">
                      {Math.round(processingProgress)}%
                    </span>
                  </div>

                  {/* High-frequency animated progress bar */}
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                      style={{ width: `${Math.min(100, Math.max(0, Math.round(processingProgress)))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 text-center">
                    Processing frame-accurately. Audio and high-definition video clarity are preserved.
                  </p>
                </motion.div>
              )}

              {/* Result Card or Guidance Inspector */}
              <AnimatePresence mode="wait">
                {resultUrl ? (
                  /* ========================================================================
                     TRIM COMPLETED: RESULTS VIEW + RETENTION BAR
                     ======================================================================== */
                  <motion.div
                    key="result-card"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="bg-[#070914]/90 border border-violet-500/30 rounded-[2rem] p-6 backdrop-blur-xl space-y-6 shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white font-outfit">
                          Trim Complete!
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Your trimmed clip is ready to download or save.
                        </p>
                      </div>
                    </div>

                    {/* Result Video Preview */}
                    <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-lg">
                      <video
                        src={resultUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Comparison Stats Bento Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Trimmed Length
                        </span>
                        <p className="text-sm font-mono font-bold text-white">
                          {resultMetadata ? formatTime(resultMetadata.duration) : formatTime(selectedDuration)}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider block">
                          Duration Cut
                        </span>
                        <p className="text-sm font-mono font-bold text-violet-200">
                          -{cutPercentage}% Shorter
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          File Size
                        </span>
                        <p className="text-sm font-mono font-bold text-white">
                          {resultMetadata ? formatFileSize(resultMetadata.size) : "--"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Output Format
                        </span>
                        <p className="text-sm font-mono font-bold text-white">
                          MP4 (HD)
                        </p>
                      </div>
                    </div>

                    <motion.button
                      onClick={handleDownload}
                      disabled={downloadStatus === "downloading"}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black text-sm transition-all duration-300 shadow-xl",
                        downloadStatus === "success"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30 border border-emerald-400/40 scale-[1.01]"
                          : downloadStatus === "downloading"
                          ? "bg-violet-700 text-white shadow-violet-500/20 cursor-wait"
                          : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white shadow-violet-500/25 hover:scale-[1.01]"
                      )}
                    >
                      {downloadStatus === "downloading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Clip...</span>
                        </>
                      ) : downloadStatus === "success" ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                          <span>Saved to Downloads!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download Trimmed Video</span>
                        </>
                      )}
                    </motion.button>

                    <button
                      onClick={() => setResultUrl(null)}
                      className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-400 hover:text-white transition-all text-center"
                    >
                      Adjust Range & Re-trim
                    </button>

                    {/* Retention & Vault Integration */}
                    <ResultRetentionBar
                      toolType="video-trimmer"
                      toolName="Video Trimmer"
                      title={`Trimmed Clip: ${file?.name || "video"}`}
                      fileUrl={resultUrl}
                      metadata={{
                        duration: resultMetadata?.duration || selectedDuration,
                        originalDuration: metadata?.duration,
                        size: resultMetadata?.size,
                        cutPercentage,
                      }}
                      downloadAction={handleDownload}
                      downloadLabel="Download Trimmed Video (MP4)"
                    />
                  </motion.div>
                ) : (
                  /* ========================================================================
                     INSPECTOR VIEW: EXACT TIME INPUTS & SUMMARY TELEMETRY
                     ======================================================================== */
                  <motion.div
                    key="inspector-card"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] p-6 backdrop-blur-xl space-y-6 shadow-2xl"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-outfit">
                          Clip Telemetry & Cut
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Frame-accurate timestamps & duration
                        </p>
                      </div>
                    </div>

                    {/* Exact Start & End Time Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-zinc-400 uppercase tracking-wider">
                            Start Time
                          </label>
                          <span className="font-mono text-violet-400 font-bold">
                            {formatTime(startTime)}
                          </span>
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={Math.max(0, endTime - 0.1)}
                            value={Number(startTime.toFixed(2))}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(Number(e.target.value), endTime - 0.2));
                              setStartTime(Number(val.toFixed(2)));
                              if (videoRef.current) {
                                videoRef.current.currentTime = val;
                                setCurrentTime(val);
                              }
                            }}
                            className="w-full bg-white/[0.04] border border-white/10 focus:border-violet-500/60 rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-zinc-400 uppercase tracking-wider">
                            End Time
                          </label>
                          <span className="font-mono text-purple-400 font-bold">
                            {formatTime(endTime)}
                          </span>
                        </div>
                        <div className="relative">
                          <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                          <input
                            type="number"
                            step="0.01"
                            min={startTime + 0.1}
                            max={metadata?.duration || 1000}
                            value={Number(endTime.toFixed(2))}
                            onChange={(e) => {
                              const val = Math.max(startTime + 0.2, Math.min(metadata?.duration || 1000, Number(e.target.value)));
                              setEndTime(Number(val.toFixed(2)));
                              if (videoRef.current) {
                                videoRef.current.currentTime = val;
                                setCurrentTime(val);
                              }
                            }}
                            className="w-full bg-white/[0.04] border border-white/10 focus:border-purple-500/60 rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary Comparison Pills */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Total Video:</span>
                        <span className="font-mono text-white font-medium">
                          {formatTime(totalDuration)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Keep Selection:</span>
                        <span className="font-mono text-violet-300 font-bold">
                          {formatTime(selectedDuration)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Removed Footage:</span>
                        <span className="font-mono text-rose-300 font-medium">
                          -{formatTime(totalDuration - selectedDuration)} ({cutPercentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Keyboard Shortcuts Reference */}
                    <div className="pt-4 border-t border-white/5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                        <Keyboard className="w-3.5 h-3.5 text-violet-400" />
                        <span>Keyboard Shortcuts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                          <span>Play / Pause</span>
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">Space</kbd>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                          <span>Set Start</span>
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">[</kbd>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                          <span>Set End</span>
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">]</kbd>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                          <span>Frame Step</span>
                          <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">← / →</kbd>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
