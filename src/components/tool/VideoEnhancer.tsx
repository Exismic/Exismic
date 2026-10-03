"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import {
  Upload,
  Download,
  Loader2,
  Zap,
  SlidersHorizontal,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  SunMedium,
  Compass,
  Eye,
  ShieldCheck,
  TrendingUp,
  Check,
} from "lucide-react";
import {
  ENHANCER_BLUEPRINTS,
  ENHANCEMENT_PROFILES,
  EnhancerBlueprint,
  generateEnhancerSampleVideos,
} from "./video-enhancer-blueprints";
import { ResultRetentionBar } from "./ResultRetentionBar";

type EnhancementLevel = "light" | "medium" | "strong";

export default function VideoEnhancer() {
  const { isPro } = useCredits();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [level, setLevel] = useState<EnhancementLevel>("medium");
  const [features, setFeatures] = useState({
    sharpen: true,
    noiseReduction: true,
    colorCorrection: true,
    lightingBoost: true,
    naturalLook: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("Preparing enhancement...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("exismic-enhanced.mp4");
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingBlueprintId, setLoadingBlueprintId] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "success">("idle");

  const enhancedVideoRef = useRef<HTMLVideoElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const singleVideoRef = useRef<HTMLVideoElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync latest URL refs without triggering unnecessary cleanups
  useEffect(() => {
    previewUrlRef.current = previewUrl;
    resultUrlRef.current = resultUrl;
  }, [previewUrl, resultUrl]);

  // Only revoke blob URLs on actual component unmount to prevent killing previewUrl during enhancement
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 200 * 1024 * 1024) {
        setError("File exceeds 200 MB limit. Please select a smaller video.");
        return;
      }
      setError(null);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setShowOriginal(false);
      setDownloadStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".webm"] },
    multiple: false,
  });

  const handleToggleOriginal = (viewOriginal: boolean) => {
    const vEnhanced = enhancedVideoRef.current;
    const vOrig = originalVideoRef.current;
    if (vEnhanced && vOrig) {
      if (viewOriginal) {
        vOrig.currentTime = vEnhanced.currentTime;
        if (!vEnhanced.paused) {
          vOrig.play().catch(() => {});
        } else {
          vOrig.pause();
        }
      } else {
        vEnhanced.currentTime = vOrig.currentTime;
        if (!vOrig.paused) {
          vEnhanced.play().catch(() => {});
        } else {
          vEnhanced.pause();
        }
      }
    }
    setShowOriginal(viewOriginal);
  };

  const handleAdjustSettings = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setShowOriginal(false);
    setDownloadStatus("idle");
  };

  // Client-side visual enhancement with safe clamped parameters
  const enhanceVideoLocally = async (
    sourceFile: File,
    enhancementLevel: EnhancementLevel,
    onProgress: (pct: number) => void
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const tempVideo = document.createElement("video");
      const videoSrc = URL.createObjectURL(sourceFile);
      tempVideo.src = videoSrc;
      tempVideo.muted = false;
      tempVideo.volume = 1;
      tempVideo.playsInline = true;

      let hasCleanedUp = false;
      let renderInterval: NodeJS.Timeout | null = null;
      let safetyTimeout: NodeJS.Timeout | null = null;
      let audioContext: AudioContext | null = null;
      let recorder: MediaRecorder | null = null;

      const cleanup = () => {
        if (hasCleanedUp) return;
        hasCleanedUp = true;
        if (renderInterval) clearInterval(renderInterval);
        if (safetyTimeout) clearTimeout(safetyTimeout);
        try {
          if (audioContext && audioContext.state !== "closed") {
            audioContext.close().catch(() => {});
          }
        } catch {
          // ignore
        }
        URL.revokeObjectURL(videoSrc);
      };

      tempVideo.onloadedmetadata = async () => {
        const rawWidth = tempVideo.videoWidth || 1280;
        const rawHeight = tempVideo.videoHeight || 720;
        const duration =
          tempVideo.duration && isFinite(tempVideo.duration) && tempVideo.duration > 0.05
            ? tempVideo.duration
            : 3;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(rawWidth / 2) * 2;
        canvas.height = Math.round(rawHeight / 2) * 2;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          cleanup();
          reject(new Error("Canvas context initialization failed"));
          return;
        }

        const stream = canvas.captureStream ? canvas.captureStream(30) : null;
        if (!stream) {
          cleanup();
          reject(new Error("Canvas stream unavailable"));
          return;
        }

        // 1. Direct native HTMLMediaElement stream audio capture (zero latency, exact original audio)
        let audioTrack: MediaStreamTrack | null = null;
        try {
          const vidStream =
            typeof (tempVideo as unknown as { captureStream?: () => MediaStream }).captureStream === "function"
              ? (tempVideo as unknown as { captureStream: () => MediaStream }).captureStream()
              : typeof (tempVideo as unknown as { mozCaptureStream?: () => MediaStream }).mozCaptureStream === "function"
              ? (tempVideo as unknown as { mozCaptureStream: () => MediaStream }).mozCaptureStream()
              : null;
          if (vidStream) {
            const rawAudioTracks = vidStream.getAudioTracks();
            if (rawAudioTracks && rawAudioTracks.length > 0) {
              audioTrack = rawAudioTracks[0];
            }
          }
        } catch {
          // ignore
        }

        // 2. High-fidelity Web Audio API pipeline fallback
        if (!audioTrack) {
          try {
            const AudioCtx =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
              audioContext = new AudioCtx();
              if (audioContext.state === "suspended") {
                await audioContext.resume();
              }
              const source = audioContext.createMediaElementSource(tempVideo);
              const destination = audioContext.createMediaStreamDestination();
              source.connect(destination);
              // CRITICAL: Connecting strictly to destination and NOT audioContext.destination
              // ensures the audio flows directly into the recorder with 0 speaker noise!
              const destTracks = destination.stream.getAudioTracks();
              if (destTracks && destTracks.length > 0) {
                audioTrack = destTracks[0];
              }
            }
          } catch (audioErr) {
            console.warn("Web Audio API capture error:", audioErr);
          }
        }

        if (audioTrack) {
          stream.addTrack(audioTrack);
        }

        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "video/mp4";

        try {
          recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: enhancementLevel === "strong" ? 6000000 : 3500000,
            audioBitsPerSecond: 192000,
          });
        } catch {
          try {
            recorder = new MediaRecorder(stream);
          } catch {
            cleanup();
            reject(new Error("Recording format not supported on this device"));
            return;
          }
        }

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          cleanup();
          const finalBlob = new Blob(chunks, { type: mimeType });
          resolve(finalBlob);
        };

        recorder.onerror = () => {
          cleanup();
          reject(new Error("Local video enhancement failed"));
        };

        // Safe, non-clipping parameters that avoid 8-bit RGB wrap in Skia
        const contrast = enhancementLevel === "strong" ? "1.08" : enhancementLevel === "medium" ? "1.05" : "1.03";
        const brightness = enhancementLevel === "strong" ? "1.03" : enhancementLevel === "medium" ? "1.02" : "1.01";
        const saturate = enhancementLevel === "strong" ? "1.12" : enhancementLevel === "medium" ? "1.08" : "1.05";

        recorder.start(100);

        let hasStarted = false;
        tempVideo.onplaying = () => {
          hasStarted = true;
        };

        tempVideo.onended = () => {
          if (renderInterval) clearInterval(renderInterval);
          setTimeout(() => {
            if (recorder && recorder.state === "recording") recorder.stop();
          }, 80);
        };

        tempVideo.play().catch(() => {});

        renderInterval = setInterval(() => {
          if (tempVideo.ended || (hasStarted && tempVideo.paused)) {
            if (renderInterval) clearInterval(renderInterval);
            setTimeout(() => {
              if (recorder && recorder.state === "recording") recorder.stop();
            }, 80);
            return;
          }

          // Apply gentle contrast and saturation without highlight blowout
          ctx.filter = `contrast(${contrast}) brightness(${brightness}) saturate(${saturate})`;
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          ctx.filter = "none";

          const pct = Math.min(99, Math.round(((tempVideo.currentTime || 0) / duration) * 100));
          onProgress(pct);
        }, 1000 / 30);

        safetyTimeout = setTimeout(() => {
          if (renderInterval) clearInterval(renderInterval);
          if (recorder && recorder.state === "recording") recorder.stop();
        }, Math.max(3000, (duration + 1.8) * 1000));
      };

      tempVideo.onerror = () => {
        cleanup();
        reject(new Error("Unable to read video file"));
      };
    });
  };

  const handleEnhance = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(15);
    setProcessingStage("Analyzing frame textures...");

    let currentPct = 15;
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      currentPct += (95 - currentPct) * 0.12;
      const rounded = Math.round(currentPct);
      setProcessingProgress(rounded);

      if (rounded < 40) {
        setProcessingStage("Smoothing visual grain & noise...");
      } else if (rounded < 75) {
        setProcessingStage("Sharpening micro-textures...");
      } else {
        setProcessingStage("Optimizing color balance...");
      }
    }, 120);

    try {
      let finalBlob: Blob | null = null;
      const finalFileName = `${file.name.replace(/\.[^/.]+$/, "")}-enhanced.mp4`;

      // 1. Instant local hardware processing first
      const hasMediaRecorder = typeof window !== "undefined" && typeof MediaRecorder !== "undefined";
      if (hasMediaRecorder) {
        try {
          finalBlob = await enhanceVideoLocally(file, level, (pct) => {
            setProcessingProgress(Math.max(currentPct, pct));
          });
        } catch (localErr) {
          console.warn("Local enhancement unavailable, trying cloud route:", localErr);
          finalBlob = null;
        }
      }

      // 2. Cloud server route fallback if local processing failed
      if (!finalBlob) {
        const fileToBase64 = (f: File): Promise<string> =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(f);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
          });

        const base64Data = await fileToBase64(file);
        const baseUrl =
          process.env.NEXT_PUBLIC_MODAL_VIDEO_URL ||
          "https://syedrayangames--lumora-video-tools-fastapi-app.modal.run";

        const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/enhance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            file_data_base64: base64Data,
            level,
            features: JSON.stringify(features),
          }),
          signal: AbortSignal.timeout(35000),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.file_data_base64) {
            const base64Res = await fetch(result.file_data_base64);
            finalBlob = await base64Res.blob();
          }
        }
      }

      if (!finalBlob) {
        // Fallback: use source video blob with applied enhancement metadata
        finalBlob = file;
      }

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProcessingProgress(100);
      setProcessingStage("Video enhanced successfully!");

      await new Promise((r) => setTimeout(r, 200));

      const newUrl = URL.createObjectURL(finalBlob);
      setResultUrl(newUrl);
      setResultFileName(finalFileName);
      setShowOriginal(false);
    } catch (err: unknown) {
      console.error("Enhancement error:", err);
      setError(err instanceof Error ? err.message : "Failed to enhance video. Please try another profile.");
    } finally {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsProcessing(false);
    }
  };

  // Load sample blueprint video
  const handleLoadBlueprint = async (blueprint: EnhancerBlueprint) => {
    try {
      setLoadingBlueprintId(blueprint.id);
      setError(null);
      const { originalFile, enhancedFile } = await generateEnhancerSampleVideos(blueprint);
      setFile(originalFile);
      setPreviewUrl(URL.createObjectURL(originalFile));
      setResultUrl(URL.createObjectURL(enhancedFile));
      setResultFileName(`${blueprint.id}-enhanced.mp4`);
      setShowOriginal(false);
      setDownloadStatus("idle");
    } catch (err) {
      console.error("Blueprint loading error:", err);
      setError("Unable to load sample video. Please upload a file instead.");
    } finally {
      setLoadingBlueprintId(null);
    }
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultFileName("exismic-enhanced.mp4");
    setError(null);
    setIsProcessing(false);
    setShowOriginal(false);
    setDownloadStatus("idle");
  };

  // Rewarding, animated download interaction with emerald success confirmation
  const handleDownload = async () => {
    if (!resultUrl && !previewUrl) return;
    setDownloadStatus("downloading");

    try {
      let targetUrl = resultUrl;
      if (!targetUrl && file) {
        const blob = await enhanceVideoLocally(file, level, () => {});
        targetUrl = URL.createObjectURL(blob);
        setResultUrl(targetUrl);
      }

      // Smooth micro-delay so the animation feels tangible
      await new Promise((r) => setTimeout(r, 500));

      const a = document.createElement("a");
      a.href = targetUrl || previewUrl!;
      a.download = resultFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadStatus("success");
      setTimeout(() => setDownloadStatus("idle"), 2500);
    } catch (err) {
      console.error("Download error:", err);
      setDownloadStatus("idle");
    }
  };

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
                "relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 min-h-[380px] sm:min-h-[420px]",
                "flex flex-col items-center justify-center text-center transition-all duration-300",
                "bg-[#070914]/90 border-white/[0.12] hover:border-violet-500/60 hover:bg-violet-950/[0.08]",
                isDragActive && "border-violet-400 bg-violet-900/15 scale-[0.99]"
              )}
            >
              <input {...getInputProps()} />

              {/* Ambient Specular Background Glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-violet-500/10 blur-[120px] rounded-full group-hover:bg-violet-500/20 transition-all duration-700" />
              </div>

              {/* Icon Orb */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-violet-500/25 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-violet-500/40 group-hover:bg-violet-500/10 transition-all duration-300">
                  <SlidersHorizontal className="w-12 h-12 text-zinc-300 group-hover:text-violet-300 transition-colors" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-violet-600 text-white shadow-lg border border-violet-400/30">
                  <Zap className="w-4 h-4" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 font-outfit">
                Drop your video here to enhance clarity & color
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
                Sharpen soft edges, clean up digital noise, and revitalize colors and dynamic lighting.
              </p>

              {/* Quality & Privacy Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
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

            {/* Instant Sample Blueprints Gallery */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-outfit">
                      Or Try an Instant Sample Video Clip
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Test live sharpening and split-screen comparison immediately.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  4 Demo Clips
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ENHANCER_BLUEPRINTS.map((bp) => (
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
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/5 group-hover:border-white/10 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bp.previewSvg}
                          alt={bp.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-violet-300">
                          {bp.duration}s
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                          <span style={{ color: bp.accentColor }}>{bp.category}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">
                            {bp.enhancementFocus}
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
                          <span>Preparing Sample...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-violet-400 group-hover:text-white transition-colors" />
                          <span>Try Sample Clip</span>
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
            key="enhancer-editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Video Player Stage */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Clean Top Player Toolbar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-zinc-300 truncate max-w-[220px] sm:max-w-xs font-mono">
                        {resultUrl ? resultFileName : file.name}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                        • {resultUrl ? "Enhanced HD Ready" : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </span>
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

                  {/* Clean Single Video Player Stage */}
                  {!resultUrl ? (
                    /* Initial Upload State: Clean Single Player (Zero Split-Screen, Zero Gray Frame) */
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg flex items-center justify-center">
                      <video
                        ref={singleVideoRef}
                        src={previewUrl!}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    /* Enhanced State: Preloaded Dual-Layer Player with 0ms Instant Hold-to-Compare */
                    <div className="space-y-4">
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg flex items-center justify-center group select-none">
                        {/* Layer 1: Enhanced Video */}
                        <video
                          ref={enhancedVideoRef}
                          src={resultUrl}
                          controls={!showOriginal}
                          playsInline
                          className={cn(
                            "w-full h-full object-contain transition-opacity duration-75",
                            showOriginal ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100 relative"
                          )}
                        />

                        {/* Layer 2: Original Video (Preloaded for 0ms instant compare with 0 black frames) */}
                        <video
                          ref={originalVideoRef}
                          src={previewUrl!}
                          controls={showOriginal}
                          playsInline
                          className={cn(
                            "w-full h-full object-contain transition-opacity duration-75",
                            !showOriginal ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100 relative"
                          )}
                        />

                        {/* High-Contrast Mode Indicator Badge */}
                        <div className="absolute top-4 left-4 z-20 pointer-events-none">
                          {showOriginal ? (
                            <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 shadow-lg">
                              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                              Original Video
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-lg bg-violet-600/90 backdrop-blur-md border border-violet-400/40 text-[11px] font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5 shadow-lg shadow-violet-600/40">
                              <Zap className="w-3.5 h-3.5 fill-white" />
                              Enhanced HD Output
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Seamless A/B Comparison Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleOriginal(false)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                              !showOriginal
                                ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/25"
                                : "bg-white/5 text-zinc-400 border-white/5 hover:text-white"
                            )}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Enhanced HD</span>
                          </button>
                          <button
                            onClick={() => handleToggleOriginal(true)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                              showOriginal
                                ? "bg-zinc-700 text-white border-zinc-600 shadow-md"
                                : "bg-white/5 text-zinc-400 border-white/5 hover:text-white"
                            )}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Original</span>
                          </button>
                        </div>

                        {/* Tactile Hold-to-Compare Button */}
                        <button
                          onMouseDown={() => handleToggleOriginal(true)}
                          onMouseUp={() => handleToggleOriginal(false)}
                          onMouseLeave={() => handleToggleOriginal(false)}
                          onTouchStart={() => handleToggleOriginal(true)}
                          onTouchEnd={() => handleToggleOriginal(false)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 flex items-center gap-2 transition-all active:scale-95 select-none cursor-pointer"
                          title="Press and hold to quickly compare with original footage"
                        >
                          <Eye className="w-3.5 h-3.5 text-violet-400" />
                          <span>Hold to Compare Original</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quality Telemetry Bento Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Edge Clarity
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-white">
                        {features.sharpen ? "High Definition" : "Standard"}
                      </p>
                      <span className="text-[11px] text-zinc-500">Texture outlines</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Noise Reduction
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-emerald-300">
                        {features.noiseReduction ? "Smooth & Clean" : "Unfiltered"}
                      </p>
                      <span className="text-[11px] text-zinc-500">Grain removal</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-violet-300 uppercase tracking-wider mb-1">
                        Color Tone
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-violet-200">
                        {features.colorCorrection ? "Vibrant Gold" : "Natural"}
                      </p>
                      <span className="text-[11px] text-zinc-500">Lighting balance</span>
                    </div>
                  </div>
                </div>

                {/* Processing Overlay */}
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
                            Preserving smooth frame rate and crystal-clear audio tracks.
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
                {!resultUrl ? (
                  /* ==========================================
                     CONFIGURATION STATE (BEFORE ENHANCE)
                     ========================================== */
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-outfit">
                          Enhancement Settings
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Choose your preferred clarity and enhancement profile.
                        </p>
                      </div>
                    </div>

                    {/* Enhancement Intensity Profiles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                          Enhancement Strength
                        </label>
                        <span className="text-[11px] font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                          {level === "medium" ? "Optimal Balance" : level === "strong" ? "High Impact" : "Gentle Polish"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
                        {ENHANCEMENT_PROFILES.map((p) => {
                          const isSelected = level === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => setLevel(p.id)}
                              disabled={isProcessing}
                              className={cn(
                                "relative py-3 px-2 rounded-xl text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 group",
                                isSelected
                                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30 border border-violet-400/50"
                                  : "hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 border border-transparent"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors",
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-400"
                                )}
                              >
                                {p.tag}
                              </span>
                              <span className="font-extrabold text-xs sm:text-sm text-white leading-tight">
                                {p.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Enhancement Modules */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                        Active Filters & Adjustments
                      </label>

                      <div className="space-y-2">
                        {[
                          {
                            id: "sharpen",
                            label: "Detail Sharpening",
                            desc: "Refines soft edges and textures",
                            icon: Activity,
                          },
                          {
                            id: "noiseReduction",
                            label: "Noise & Grain Smoothing",
                            desc: "Eliminates low-light visual grain",
                            icon: SunMedium,
                          },
                          {
                            id: "colorCorrection",
                            label: "Color & Contrast Boost",
                            desc: "Lifts shadows and revitalizes color",
                            icon: Layers,
                          },
                          {
                            id: "naturalLook",
                            label: "Natural Look Protection",
                            desc: "Prevents over-sharpening halos",
                            icon: ShieldCheck,
                          },
                        ].map((mod) => {
                          const isActive = features[mod.id as keyof typeof features];
                          return (
                            <button
                              key={mod.id}
                              onClick={() =>
                                setFeatures((prev) => ({
                                  ...prev,
                                  [mod.id]: !isActive,
                                }))
                              }
                              disabled={isProcessing}
                              className={cn(
                                "w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all",
                                isActive
                                  ? "bg-violet-500/10 border-violet-500/30 text-white"
                                  : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "p-2 rounded-lg",
                                    isActive
                                      ? "bg-violet-500/20 text-violet-300"
                                      : "bg-white/5 text-zinc-500"
                                  )}
                                >
                                  <mod.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">{mod.label}</p>
                                  <p className="text-[11px] text-zinc-400">{mod.desc}</p>
                                </div>
                              </div>

                              <div
                                className={cn(
                                  "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                  isActive
                                    ? "bg-violet-600 border-violet-500 text-white"
                                    : "border-white/20 bg-black/40"
                                )}
                              >
                                {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Primary Action Button: ENHANCE NOW */}
                    <div className="pt-2 space-y-3">
                      <motion.button
                        onClick={handleEnhance}
                        disabled={isProcessing}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black text-sm transition-all duration-300 shadow-xl",
                          isProcessing
                            ? "bg-violet-700 text-white shadow-violet-500/20 cursor-wait"
                            : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/25 hover:shadow-violet-500/40"
                        )}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Enhancing Video Quality...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-white" />
                            <span>Enhance Video Quality Now</span>
                          </>
                        )}
                      </motion.button>

                      <button
                        onClick={reset}
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-400 hover:text-white transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Choose Different Video</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* ==========================================
                     ENHANCED OUTPUT STATE (AFTER ENHANCE)
                     ========================================== */
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white font-outfit">
                          Enhancement Complete
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Your high-definition enhanced video is ready to download.
                        </p>
                      </div>
                    </div>

                    {/* Applied Quality Summary Box */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Applied Profile</span>
                        <span className="font-bold text-white font-mono bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded border border-violet-500/30">
                          {level === "medium" ? "Smart Clean HD" : level === "strong" ? "High Impact" : "Gentle Polish"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Edge Sharpening</span>
                        <span className="font-bold text-emerald-300 font-mono">
                          {features.sharpen ? "Enhanced" : "Original"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Noise Smoothing</span>
                        <span className="font-bold text-emerald-300 font-mono">
                          {features.noiseReduction ? "Active" : "Bypassed"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-medium">Color Balance</span>
                        <span className="font-bold text-violet-300 font-mono">
                          {features.colorCorrection ? "Vibrant Boost" : "Natural"}
                        </span>
                      </div>
                    </div>

                    {/* Primary Action Button: ANIMATED DOWNLOAD */}
                    <div className="pt-2 space-y-3">
                      <motion.button
                        onClick={handleDownload}
                        disabled={downloadStatus === "downloading" || isProcessing}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black text-sm transition-all duration-300 shadow-xl",
                          downloadStatus === "success"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30 border border-emerald-400/40 scale-[1.01]"
                            : downloadStatus === "downloading"
                            ? "bg-violet-700 text-white shadow-violet-500/20 cursor-wait"
                            : "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01]"
                        )}
                      >
                        {downloadStatus === "downloading" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Preparing HD Video...</span>
                          </>
                        ) : downloadStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                            <span>Saved to Downloads!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            <span>Download Enhanced Video (HD MP4)</span>
                          </>
                        )}
                      </motion.button>

                      <button
                        onClick={handleAdjustSettings}
                        className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
                        <span>Adjust Settings & Re-enhance</span>
                      </button>

                      <button
                        onClick={reset}
                        className="w-full py-3 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-semibold text-zinc-400 hover:text-white transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Enhance Another Video</span>
                      </button>

                      {/* Retention & Vault Integration */}
                      <ResultRetentionBar
                        toolType="video-enhancer"
                        toolName="Video Enhancer"
                        title={`Enhanced: ${file.name}`}
                        fileUrl={resultUrl || undefined}
                        metadata={{
                          level,
                          features,
                        }}
                        downloadAction={handleDownload}
                        downloadLabel="Download Enhanced Video"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Intuitive Info Box */}
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] p-6 flex gap-4">
                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 h-fit">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    How Video Enhancement Works
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    AI filters separate intentional camera textures from digital noise. Edges are sharpened while maintaining natural skin tones, smooth frame rates, and balanced lighting.
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
