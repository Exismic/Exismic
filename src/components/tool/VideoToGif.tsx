"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Upload,
  Download,
  Loader2,
  Zap,
  Image as ImageIcon,
  AlertCircle,
  Scissors,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
  Compass,
  Film,
  Play,
  Pause,
  Layers,
  ShieldCheck,
  TrendingDown,
  Check,
} from "lucide-react";
import {
  GIF_BLUEPRINTS,
  GIF_RESOLUTIONS,
  GIF_FPS_PROFILES,
  GifBlueprint,
  generateGifSampleVideo,
} from "./video-to-gif-blueprints";
import { ResultRetentionBar } from "./ResultRetentionBar";
import { convertVideoToGifInBrowser } from "@/lib/client-gif-converter";

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("Preparing GIF conversion...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("exismic-animation.gif");
  const [resultFileSize, setResultFileSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingBlueprintId, setLoadingBlueprintId] = useState<string | null>(null);

  // Settings
  const [targetWidth, setTargetWidth] = useState(480);
  const [fps, setFps] = useState(30);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(3);
  const [duration, setDuration] = useState(3);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [previewUrl, resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 200 * 1024 * 1024) {
        setError("File exceeds 200 MB limit. Please select a smaller video.");
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setResultFileSize(null);
      setStartTime(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".webm"] },
    multiple: false,
  });

  const handleMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const d = e.currentTarget.duration || 3;
    setDuration(d);
    setEndTime(Math.min(d, 3.5));
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
        if (!isPlaying) videoRef.current.pause();
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Convert to GIF via Fast In-Browser Engine with Server Fallback
  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(4);
    setProcessingStage("Preparing video clip...");

    const gifDuration = Math.max(0.2, endTime - startTime);

    try {
      let finalBlob: Blob | null = null;
      const finalFileName = `${file.name.replace(/\.[^/.]+$/, "")}.gif`;

      // 1. Try High-Speed In-Browser Generation First (< 1.5s, 0 server upload wait)
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        try {
          finalBlob = await convertVideoToGifInBrowser({
            video: videoRef.current,
            startTime,
            duration: gifDuration,
            fps,
            targetWidth,
            onProgress: (pct, stage) => {
              setProcessingProgress(pct);
              setProcessingStage(stage);
            },
          });
        } catch (clientErr) {
          console.warn("In-browser GIF engine fallback to server:", clientErr);
        }
      }

      // 2. Server Route Fallback (if browser canvas cannot decode codec)
      if (!finalBlob) {
        setProcessingStage("Optimizing clip on server...");
        setProcessingProgress(35);

        // Server ticker for fallback
        let currentPct = 35;
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        progressTimerRef.current = setInterval(() => {
          currentPct += (92 - currentPct) * 0.08;
          const rounded = Math.round(currentPct);
          setProcessingProgress(rounded);
          if (rounded < 60) {
            setProcessingStage("Rendering animation loop...");
          } else if (rounded < 85) {
            setProcessingStage("Packaging animated GIF...");
          } else {
            setProcessingStage("Finalizing animated GIF...");
          }
        }, 200);

        try {
          const formData = new FormData();
          formData.append("video", file);
          formData.append("start", startTime.toString());
          formData.append("duration", gifDuration.toString());
          formData.append("fps", fps.toString());
          formData.append("width", targetWidth.toString());

          const response = await fetch("/api/tools/video/to-gif", {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(45000),
          });

          if (response.ok) {
            finalBlob = await response.blob();
          }
        } catch (srvErr) {
          console.warn("Server route to-gif fallback:", srvErr);
        }
      }

      if (!finalBlob) {
        throw new Error("Unable to create animated GIF. Please choose a shorter clip or adjust resolution.");
      }

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProcessingProgress(100);
      setProcessingStage("GIF ready to download!");

      await new Promise((r) => setTimeout(r, 200));

      const newUrl = URL.createObjectURL(finalBlob);
      setResultUrl(newUrl);
      setResultFileName(finalFileName);
      setResultFileSize(finalBlob.size);
    } catch (err: unknown) {
      console.error("GIF conversion error:", err);
      setError(err instanceof Error ? err.message : "Failed to create animated GIF. Please try again.");
    } finally {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsProcessing(false);
    }
  };

  const handleLoadBlueprint = async (blueprint: GifBlueprint) => {
    try {
      setLoadingBlueprintId(blueprint.id);
      setError(null);
      const generatedFile = await generateGifSampleVideo(blueprint);
      setFile(generatedFile);
      setPreviewUrl(URL.createObjectURL(generatedFile));
      setResultUrl(null);
      setResultFileSize(null);
      setStartTime(0);
      setEndTime(blueprint.duration);
    } catch (err) {
      console.error("Blueprint generation error:", err);
      setError("Unable to load sample video. Please upload a file instead.");
    } finally {
      setLoadingBlueprintId(null);
    }
  };

  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "success">("idle");

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultFileName("exismic-animation.gif");
    setResultFileSize(null);
    setError(null);
    setIsProcessing(false);
    setStartTime(0);
    setEndTime(3);
    setDownloadStatus("idle");
  };

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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const clipDuration = Math.max(0.1, endTime - startTime);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-4">
      <AnimatePresence mode="wait">
        {!file ? (
          /* ========================================================================
             EMPTY STATE: ELEVATED OBSIDIAN DROPZONE + INSTANT SAMPLE BLUEPRINTS
             ======================================================================== */
          <motion.div
            key="empty-upload"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-10"
          >
            {/* Primary Elevated Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "group relative min-h-[380px] sm:min-h-[420px] rounded-[2.5rem] p-8 sm:p-12 text-center cursor-pointer transition-all duration-300",
                "bg-[#070914]/90 border-2 border-dashed backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden shadow-2xl",
                isDragActive
                  ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                  : "border-white/10 hover:border-violet-500/50 hover:bg-[#090d1f]/90"
              )}
            >
              <input {...getInputProps()} />

              {/* Ambient Radial Gradient Halo */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/15 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 flex flex-col items-center max-w-lg space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:scale-110 group-hover:bg-violet-500/25 transition-all shadow-xl shadow-violet-500/10">
                    <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <div className="absolute -inset-1 rounded-3xl blur-lg bg-violet-500/20 group-hover:bg-violet-500/40 transition-colors pointer-events-none" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                    Convert Any Video to Animated GIF
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-400">
                    Turn video reactions and clip highlights into smooth, looping animated GIFs ready for Discord, Slack, and chats.
                  </p>
                </div>

                {/* Badges / Format Tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-zinc-300">
                    MP4, MOV, WebM, AVI
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
                    Up to 200 MB
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Private
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-6 flex items-center gap-2 text-rose-300 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 text-sm font-medium z-10">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
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
                      Or Test with an Instant Sample Video
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Generate animated GIFs instantly without uploading your own file.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  4 Ready-to-Test Clips
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {GIF_BLUEPRINTS.map((bp) => (
                  <motion.div
                    key={bp.id}
                    whileHover={{ y: -3 }}
                    className="relative rounded-2xl bg-[#080b16] border border-white/[0.08] hover:border-violet-500/40 p-4 flex flex-col justify-between group transition-all duration-200 overflow-hidden shadow-lg"
                  >
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
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-violet-300">
                          {bp.duration}s Clip
                        </span>
                      </div>

                      {/* Title & Details */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                          <span style={{ color: bp.accentColor }}>{bp.category}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">
                            {bp.duration}s
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
                          <span>Loading Sample...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5 text-violet-400 group-hover:text-white transition-colors" />
                          <span>Try This Clip</span>
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
            key="gif-editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Video Stage / GIF Preview */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Top Player Toolbar (Above Canvas) */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide flex items-center gap-2 transition-colors",
                          resultUrl
                            ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                            : "bg-white/[0.04] border-white/10 text-zinc-300"
                        )}
                      >
                        {resultUrl ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                            <span>Animated GIF Preview</span>
                          </>
                        ) : (
                          <>
                            <Film className="w-3.5 h-3.5 text-violet-400" />
                            <span>Video Trimming Range</span>
                          </>
                        )}
                      </div>
                      {resultUrl && (
                        <span className="hidden sm:inline text-xs font-mono text-zinc-400">
                          Ready for download
                        </span>
                      )}
                    </div>

                    <button
                      onClick={reset}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5 border border-white/5"
                      title="Upload or pick a different video"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Change Video</span>
                    </button>
                  </div>

                  {/* Clean Player Stage */}
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-lg flex items-center justify-center">
                    {!resultUrl ? (
                      <video
                        ref={videoRef}
                        src={previewUrl!}
                        onLoadedMetadata={handleMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resultUrl}
                        alt="Converted GIF Animation"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Visual Timeline Range Scrubber (Before Conversion) */}
                  {!resultUrl && (
                    <div className="space-y-4 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Scissors className="w-3.5 h-3.5 text-violet-400" />
                          <span className="font-semibold">GIF Range:</span>
                          <span className="font-mono text-white font-bold">
                            {startTime.toFixed(1)}s ➔ {endTime.toFixed(1)}s ({clipDuration.toFixed(1)}s loop)
                          </span>
                        </div>
                        <button
                          onClick={togglePlay}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{isPlaying ? "Pause Preview" : "Preview Loop"}</span>
                        </button>
                      </div>

                      {/* Dual-Handle Slider Range Track */}
                      <div className="space-y-2">
                        <div className="relative h-3 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 bg-violet-500/40 border-l-2 border-r-2 border-violet-400"
                            style={{
                              left: `${(startTime / (duration || 1)) * 100}%`,
                              width: `${((endTime - startTime) / (duration || 1)) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-zinc-400">
                              <span>Start Point</span>
                              <span className="font-mono text-white">{startTime.toFixed(1)}s</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={Math.max(0, endTime - 0.2)}
                              step={0.1}
                              value={startTime}
                              onChange={(e) => setStartTime(parseFloat(e.target.value))}
                              className="w-full accent-violet-500 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-zinc-400">
                              <span>End Point</span>
                              <span className="font-mono text-white">{endTime.toFixed(1)}s</span>
                            </div>
                            <input
                              type="range"
                              min={startTime + 0.2}
                              max={duration}
                              step={0.1}
                              value={endTime}
                              onChange={(e) => setEndTime(parseFloat(e.target.value))}
                              className="w-full accent-violet-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quick Duration Preset Pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => {
                            setStartTime(0);
                            setEndTime(Math.min(duration, 2));
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-violet-600/30 text-zinc-300 hover:text-white border border-white/5 transition-all"
                        >
                          First 2s Hook
                        </button>
                        <button
                          onClick={() => {
                            setStartTime(0);
                            setEndTime(Math.min(duration, 3));
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-violet-600/30 text-zinc-300 hover:text-white border border-white/5 transition-all"
                        >
                          First 3s Reaction
                        </button>
                        <button
                          onClick={() => {
                            setStartTime(0);
                            setEndTime(Math.min(duration, 5));
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-violet-600/30 text-zinc-300 hover:text-white border border-white/5 transition-all"
                        >
                          First 5s Clip
                        </button>
                        <button
                          onClick={() => {
                            setStartTime(0);
                            setEndTime(duration);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-violet-600/30 text-zinc-300 hover:text-white border border-white/5 transition-all"
                        >
                          Full Video
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Telemetry Bento Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Resolution
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-white">
                        {targetWidth}px Wide
                      </p>
                      <span className="text-[11px] text-zinc-500">Auto height</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Frame Rate
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-violet-300">
                        {fps} FPS
                      </p>
                      <span className="text-[11px] text-zinc-500">Smooth playback</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        {resultFileSize ? "Output Size" : "Duration"}
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-violet-200">
                        {resultFileSize ? formatSize(resultFileSize) : `${clipDuration.toFixed(1)}s`}
                      </p>
                      <span className="text-[11px] text-zinc-500">
                        {resultFileSize ? "Optimized GIF" : "Selected loop"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Processing Overlay (Standard 4) */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center p-8 z-50"
                    >
                      <div className="w-full max-w-sm text-center space-y-6">
                        <div className="relative inline-block">
                          <Loader2 className="w-14 h-14 text-violet-400 animate-spin" />
                          <div className="absolute inset-0 blur-2xl bg-violet-500/30 animate-pulse rounded-full" />
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xl font-bold tracking-tight text-white font-outfit">
                            {processingStage}
                          </h4>
                          <span className="text-2xl font-black font-mono text-violet-300 block">
                            {Math.round(processingProgress)}%
                          </span>

                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                              style={{ width: `${Math.min(100, Math.max(0, Math.round(processingProgress)))}%` }}
                            />
                          </div>
                          <p className="text-xs text-zinc-400">
                            Creating a smooth, lightweight animation loop for your clip.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Controls & Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-outfit">
                      GIF Export Settings
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Configure resolution and smoothness for your animated GIF.
                    </p>
                  </div>
                </div>

                {/* Target Resolution (Standard 1: Plain English) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Target Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {GIF_RESOLUTIONS.map((res) => {
                      const isSelected = targetWidth === res.width;
                      return (
                        <button
                          key={res.width}
                          onClick={() => setTargetWidth(res.width)}
                          disabled={isProcessing || !!resultUrl}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between",
                            isSelected
                              ? "bg-violet-500/15 border-violet-500/50 shadow-lg shadow-violet-500/10"
                              : "bg-white/[0.02] border-white/5 hover:border-white/15 text-zinc-400"
                          )}
                        >
                          <div>
                            <span
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wider block",
                                isSelected ? "text-violet-300" : "text-zinc-500"
                              )}
                            >
                              {res.tag}
                            </span>
                            <span className="font-extrabold text-sm text-white block mt-0.5">
                              {res.label}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shadow-[0_0_6px_#8b5cf6]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frame Rate Selection (Plain English) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                      Motion Smoothness (FPS)
                    </label>
                    <span className="text-xs font-mono text-violet-300 font-bold">{fps} FPS</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {GIF_FPS_PROFILES.map((f) => {
                      const isSelected = fps === f.fps;
                      return (
                        <button
                          key={f.fps}
                          onClick={() => setFps(f.fps)}
                          disabled={isProcessing || !!resultUrl}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between",
                            isSelected
                              ? "bg-violet-500/15 border-violet-500/50 shadow-lg shadow-violet-500/10"
                              : "bg-white/[0.02] border-white/5 hover:border-white/15 text-zinc-400"
                          )}
                        >
                          <div>
                            <span className="font-extrabold text-sm text-white block">
                              {f.label}
                            </span>
                            <span className="text-[10px] text-zinc-400 mt-0.5 block leading-tight">
                              {f.desc}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shadow-[0_0_6px_#8b5cf6]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  {!resultUrl ? (
                    <button
                      onClick={handleConvert}
                      disabled={!file || isProcessing}
                      className={cn(
                        "w-full relative overflow-hidden group py-4 px-6 rounded-2xl font-black text-base transition-all",
                        "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2.5">
                        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Create Animated GIF Now</span>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-3">
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
                            <span>Saving Animated GIF...</span>
                          </>
                        ) : downloadStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                            <span>Saved to Downloads!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Animated GIF</span>
                          </>
                        )}
                      </motion.button>

                      <button
                        onClick={reset}
                        className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-400 hover:text-white transition-all text-center"
                      >
                        Convert Another Video
                      </button>

                      {/* Retention & Vault Integration */}
                      <ResultRetentionBar
                        toolType="video-to-gif"
                        toolName="Video to GIF"
                        title={`GIF: ${file.name}`}
                        fileUrl={resultUrl}
                        metadata={{
                          targetWidth,
                          fps,
                          startTime,
                          endTime,
                          clipDuration,
                          fileSize: resultFileSize,
                        }}
                        downloadAction={handleDownload}
                        downloadLabel="Download Animated GIF"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Informative Guidance Card */}
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] p-6 flex gap-4">
                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 h-fit">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Smooth Loops & Instant Sharing
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Every GIF is optimized for smooth looping and lightweight file size, making your clips ready to share instantly on Discord, Slack, and social media.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
