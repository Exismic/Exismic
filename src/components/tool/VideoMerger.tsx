"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Upload,
  Download,
  Loader2,
  Plus,
  Trash2,
  Film,
  Clock,
  Layers,
  Play,
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Maximize2,
  X,
  Compass,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Check,
} from "lucide-react";
import {
  MERGER_BLUEPRINTS,
  MergerSequenceBlueprint,
  generateMergerClip,
} from "./video-merger-blueprints";
import { ResultRetentionBar } from "./ResultRetentionBar";

interface Clip {
  id: string;
  file: File;
  preview: string;
  duration: number;
}

// Workaround for Chrome WebM duration: Infinity bug
async function resolveVideoDuration(videoElement: HTMLVideoElement): Promise<number> {
  const rawDuration = videoElement.duration;
  if (Number.isFinite(rawDuration) && rawDuration > 0 && rawDuration !== Infinity) {
    return rawDuration;
  }

  return new Promise<number>((resolve) => {
    let finished = false;
    const cleanup = () => {
      videoElement.removeEventListener("seeked", handleSeeked);
      videoElement.removeEventListener("error", handleError);
    };

    const handleSeeked = () => {
      if (finished) return;
      finished = true;
      cleanup();
      const realDur = videoElement.currentTime;
      videoElement.currentTime = 0;
      if (Number.isFinite(realDur) && realDur > 0) {
        resolve(realDur);
      } else {
        resolve(0);
      }
    };

    const handleError = () => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(0);
    };

    videoElement.addEventListener("seeked", handleSeeked, { once: true });
    videoElement.addEventListener("error", handleError, { once: true });

    try {
      videoElement.currentTime = 1e9;
    } catch {
      handleError();
    }

    setTimeout(() => {
      if (finished) return;
      finished = true;
      cleanup();
      const d = videoElement.duration;
      if (Number.isFinite(d) && d > 0 && d !== Infinity) {
        resolve(d);
      } else {
        resolve(0);
      }
    }, 500);
  });
}

function probeFileDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(0);
      return;
    }
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    const url = URL.createObjectURL(file);
    v.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      v.remove();
    };

    v.onloadedmetadata = async () => {
      try {
        const d = await resolveVideoDuration(v);
        cleanup();
        resolve(d);
      } catch {
        cleanup();
        resolve(0);
      }
    };

    v.onerror = () => {
      cleanup();
      resolve(0);
    };

    setTimeout(() => {
      cleanup();
      resolve(0);
    }, 1500);
  });
}

export default function VideoMerger() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("Preparing video merge...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("exismic-merged-video.mp4");
  const [error, setError] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [loadingBlueprintId, setLoadingBlueprintId] = useState<string | null>(null);

  const clipsRef = useRef<Clip[]>([]);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    clipsRef.current = clips;
  }, [clips]);

  useEffect(() => {
    return () => {
      clipsRef.current.forEach((clip) => URL.revokeObjectURL(clip.preview));
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const availableSlots = Math.max(0, 10 - clipsRef.current.length);
    const newClips = acceptedFiles.slice(0, availableSlots).map((file) => {
      const id = crypto.randomUUID();
      probeFileDuration(file).then((dur) => {
        if (Number.isFinite(dur) && dur > 0) {
          setClips((prev) => prev.map((c) => (c.id === id ? { ...c, duration: dur } : c)));
        }
      });
      return {
        id,
        file,
        preview: URL.createObjectURL(file),
        duration: 0,
      };
    });
    setClips((prev) => [...prev, ...newClips]);
    setResultUrl(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".webm"] },
    multiple: true,
  });

  const removeClip = (id: string) => {
    setClips((prev) => {
      const removed = prev.find((clip) => clip.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((c) => c.id !== id);
    });
    setResultUrl(null);
  };

  const moveClip = (index: number, direction: "up" | "down") => {
    const newClips = [...clips];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newClips.length) return;
    [newClips[index], newClips[targetIndex]] = [newClips[targetIndex], newClips[index]];
    setClips(newClips);
  };

  // Client-side sequential canvas concatenation with full audio preservation
  const mergeClipsLocally = async (
    clipList: Clip[],
    onProgress: (pct: number) => void
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (clipList.length < 2) {
        reject(new Error("At least two video clips are required to merge."));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        reject(new Error("Canvas initialization failed"));
        return;
      }

      const stream = canvas.captureStream ? canvas.captureStream(30) : null;
      if (!stream) {
        reject(new Error("Stream capture unavailable"));
        return;
      }

      // Initialize Web Audio graph for combining audio
      let audioCtx: AudioContext | null = null;
      let audioDest: MediaStreamAudioDestinationNode | null = null;
      try {
        const AudioC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioC) {
          audioCtx = new AudioC();
          if (audioCtx.state === "suspended") {
            audioCtx.resume().catch(() => {});
          }
          audioDest = audioCtx.createMediaStreamDestination();
          const track = audioDest.stream.getAudioTracks()[0];
          if (track) stream.addTrack(track);
        }
      } catch (audioInitErr) {
        console.warn("AudioContext init notice:", audioInitErr);
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 4000000,
          audioBitsPerSecond: 192000,
        });
      } catch {
        recorder = new MediaRecorder(stream);
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const totalDuration = clipList.reduce((acc, c) => acc + (c.duration || 2.5), 0);
      let recordedDuration = 0;
      let currentClipIdx = 0;
      let activeVideo: HTMLVideoElement | null = null;
      let activeInterval: NodeJS.Timeout | null = null;
      let currentSrcNode: MediaElementAudioSourceNode | null = null;

      const finishMerge = () => {
        if (activeInterval) clearInterval(activeInterval);
        if (currentSrcNode) {
          try { currentSrcNode.disconnect(); } catch {}
          currentSrcNode = null;
        }
        if (activeVideo) {
          activeVideo.pause();
          URL.revokeObjectURL(activeVideo.src);
        }
        try {
          if (audioCtx && audioCtx.state !== "closed") audioCtx.close().catch(() => {});
        } catch {}
        if (recorder.state === "recording") recorder.stop();
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType });
        resolve(finalBlob);
      };

      recorder.onerror = () => reject(new Error("Merging recording failed"));
      recorder.start(100);

      const playNextClip = () => {
        if (currentClipIdx >= clipList.length) {
          setTimeout(finishMerge, 120);
          return;
        }

        const clip = clipList[currentClipIdx];
        const v = document.createElement("video");
        v.src = URL.createObjectURL(clip.file);
        v.playsInline = true;
        v.crossOrigin = "anonymous";
        // Unmute video so Web Audio captures sound; audio is routed to audioDest (NOT speakers)
        v.muted = false;
        v.volume = 1.0;
        activeVideo = v;

        let clipDuration = clip.duration && isFinite(clip.duration) && clip.duration > 0.05 ? clip.duration : 2.5;
        let clipFinished = false;
        let clipWatchdog: NodeJS.Timeout | null = null;

        const advanceClip = () => {
          if (clipFinished) return;
          clipFinished = true;
          if (activeInterval) clearInterval(activeInterval);
          if (clipWatchdog) clearTimeout(clipWatchdog);
          if (currentSrcNode) {
            try { currentSrcNode.disconnect(); } catch {}
            currentSrcNode = null;
          }
          recordedDuration += clipDuration;
          currentClipIdx++;
          URL.revokeObjectURL(v.src);
          playNextClip();
        };

        v.onloadedmetadata = async () => {
          const resolved = await resolveVideoDuration(v);
          if (Number.isFinite(resolved) && resolved > 0.05) {
            clipDuration = resolved;
          }
          clipWatchdog = setTimeout(advanceClip, (clipDuration + 2.0) * 1000);

          if (audioCtx && audioDest) {
            try {
              if (audioCtx.state === "suspended") {
                audioCtx.resume().catch(() => {});
              }
              currentSrcNode = audioCtx.createMediaElementSource(v);
              currentSrcNode.connect(audioDest);
            } catch (srcErr) {
              console.warn("Audio connection notice:", srcErr);
            }
          }

          v.play().catch(() => {
            // If browser blocks unmuted playback, retry muted to ensure video frames still merge
            v.muted = true;
            v.play().catch(() => {});
          });

          activeInterval = setInterval(() => {
            if (v.ended || (v.currentTime >= clipDuration - 0.04 && v.currentTime > 0)) {
              advanceClip();
              return;
            }

            // Draw letterboxed/aspect-fitted frame
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const vW = v.videoWidth || 1280;
            const vH = v.videoHeight || 720;
            const scale = Math.min(canvas.width / vW, canvas.height / vH);
            const drawW = vW * scale;
            const drawH = vH * scale;
            const drawX = (canvas.width - drawW) / 2;
            const drawY = (canvas.height - drawH) / 2;

            ctx.drawImage(v, drawX, drawY, drawW, drawH);

            const progress = Math.min(
              99,
              Math.round(((recordedDuration + (v.currentTime || 0)) / totalDuration) * 100)
            );
            onProgress(progress);
          }, 1000 / 30);
        };

        v.onerror = () => {
          advanceClip();
        };
      };

      playNextClip();
    });
  };

  const handleMerge = async () => {
    if (clips.length < 2) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(6);
    setProcessingStage("Preparing video clips & audio...");

    // Continuous dynamic progress ticker
    let currentPct = 6;
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      currentPct += (94 - currentPct) * 0.08;
      const rounded = Math.round(currentPct);
      setProcessingProgress(rounded);

      if (rounded < 30) {
        setProcessingStage("Preparing video clips...");
      } else if (rounded < 65) {
        setProcessingStage("Combining video and audio tracks...");
      } else if (rounded < 90) {
        setProcessingStage("Joining scenes into single video...");
      } else {
        setProcessingStage("Finalizing merged video...");
      }
    }, 150);

    try {
      let finalBlob: Blob | null = null;

      // 1. Try fast local client concatenation with full audio preservation
      const hasMediaRecorder = typeof window !== "undefined" && typeof MediaRecorder !== "undefined";
      if (hasMediaRecorder) {
        try {
          finalBlob = await mergeClipsLocally(clips, (pct) => {
            setProcessingProgress(Math.round(Math.max(currentPct, pct)));
          });
        } catch (localErr) {
          console.warn("Local merge failed, falling back to server route:", localErr);
          finalBlob = null;
        }
      }

      // 2. Server route fallback if client recorder unavailable
      if (!finalBlob) {
        const formData = new FormData();
        for (const clip of clips) {
          formData.append("clips", clip.file);
        }

        const response = await fetch("/api/tools/video/merger", {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(60000),
        });

        if (response.ok) {
          finalBlob = await response.blob();
        }
      }

      if (!finalBlob) {
        throw new Error("Unable to merge video clips. Please try again with different clips.");
      }

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProcessingProgress(100);
      setProcessingStage("Video sequence merged successfully!");

      await new Promise((r) => setTimeout(r, 200));

      const isMp4 = finalBlob.type.includes("mp4");
      const ext = isMp4 ? "mp4" : "webm";
      const finalFileName = `merged-video-${Date.now()}.${ext}`;

      const newUrl = URL.createObjectURL(finalBlob);
      setResultUrl(newUrl);
      setResultFileName(finalFileName);
    } catch (err: unknown) {
      console.error("Merge error:", err);
      setError(err instanceof Error ? err.message : "Failed to merge videos. Please try again.");
    } finally {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsProcessing(false);
    }
  };

  // Load sample multi-clip sequence blueprint
  const handleLoadBlueprint = async (blueprint: MergerSequenceBlueprint) => {
    try {
      setLoadingBlueprintId(blueprint.id);
      setError(null);

      // Generate all clips concurrently
      const generatedFiles = await Promise.all(
        blueprint.clips.map((clip) => generateMergerClip(blueprint.id, clip))
      );

      const newClips: Clip[] = generatedFiles.map((file, idx) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        duration: blueprint.clips[idx].duration,
      }));

      setClips(newClips);
      setResultUrl(null);
    } catch (err) {
      console.error("Blueprint generation error:", err);
      setError("Unable to generate sample sequence. Please upload clips instead.");
    } finally {
      setLoadingBlueprintId(null);
    }
  };

  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "success">("idle");

  const reset = () => {
    clips.forEach((clip) => URL.revokeObjectURL(clip.preview));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setClips([]);
    setResultUrl(null);
    setResultFileName("exismic-merged-video.mp4");
    setError(null);
    setIsProcessing(false);
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

  const totalDuration = clips.reduce((acc, curr) => {
    const d = Number.isFinite(curr.duration) && curr.duration > 0 ? curr.duration : 0;
    return acc + d;
  }, 0);
  const totalSize = clips.reduce((acc, curr) => acc + curr.file.size, 0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-4">
      {/* Clip Quick-Preview Modal */}
      <AnimatePresence>
        {activePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl"
            onClick={() => setActivePreview(null)}
          >
            <div
              className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <video src={activePreview} controls autoPlay className="w-full h-full object-contain" />
              <button
                onClick={() => setActivePreview(null)}
                aria-label="Close clip preview"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-black/70 text-white hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {clips.length === 0 ? (
          /* ========================================================================
             EMPTY STATE: ELEVATED OBSIDIAN DROPZONE + MULTI-SCENE BLUEPRINTS
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
                    <Film className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <div className="absolute -inset-1 rounded-3xl blur-lg bg-violet-500/20 group-hover:bg-violet-500/40 transition-colors pointer-events-none" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-outfit">
                    Merge Multiple Video Clips into One
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-400">
                    Combine scenes, arrange your video storyline, and export a seamless movie or reel in minutes.
                  </p>
                </div>

                {/* Badges / Format Tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-zinc-300">
                    MP4, MOV, WebM, AVI
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300">
                    Multiple Clips
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

            {/* Instant Multi-Scene Sequence Blueprints (Standard 3: Zero Dead Void) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-outfit">
                      Or Try an Instant Multi-Scene Sequence
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Test multi-clip merging and storyline sequencing immediately with ready-to-merge scenes.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  3 Ready Sequences
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {MERGER_BLUEPRINTS.map((bp) => (
                  <motion.div
                    key={bp.id}
                    whileHover={{ y: -3 }}
                    className="relative rounded-2xl bg-[#080b16] border border-white/[0.08] hover:border-violet-500/40 p-5 flex flex-col justify-between group transition-all duration-200 overflow-hidden shadow-lg"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${bp.accentColor}, transparent)`,
                      }}
                    />

                    <div className="space-y-4">
                      {/* Scene Strip Cards */}
                      <div className="flex gap-2">
                        {bp.clips.map((clip, i) => (
                          <div
                            key={clip.id}
                            className="flex-1 p-2 rounded-xl border flex flex-col items-center justify-center text-center space-y-1"
                            style={{
                              backgroundColor: `${clip.color}15`,
                              borderColor: `${clip.color}35`,
                            }}
                          >
                            <span className="text-[10px] font-mono font-bold text-zinc-400">
                              #{i + 1}
                            </span>
                            <span
                              className="text-[11px] font-bold truncate max-w-full"
                              style={{ color: clip.color }}
                            >
                              {clip.duration}s
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Title & Details */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                          <span style={{ color: bp.accentColor }}>{bp.category}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">
                            {bp.totalDurationDisplay}
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
                        "mt-5 w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all",
                        "bg-white/[0.04] hover:bg-violet-600 hover:text-white text-zinc-200 border border-white/10 hover:border-violet-500/40",
                        loadingBlueprintId === bp.id && "bg-violet-600 text-white cursor-wait"
                      )}
                    >
                      {loadingBlueprintId === bp.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading Storyboard...</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-3.5 h-3.5 text-violet-400 group-hover:text-white transition-colors" />
                          <span>Load {bp.clipCount} Scenes</span>
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
             EDITOR STATE: STORYBOARD TIMELINE & MERGER WORKSPACE (BALANCED LAYOUT)
             ======================================================================== */
          <motion.div
            key="merger-editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Storyboard Scene Timeline & Merged Player */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Top Toolbar */}
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
                            <span>Merged Video Master</span>
                          </>
                        ) : (
                          <>
                            <Layers className="w-3.5 h-3.5 text-violet-400" />
                            <span>Scene Storyboard ({clips.length} Scenes)</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!resultUrl && (
                        <button
                          {...getRootProps()}
                          className="text-xs text-violet-300 hover:text-white bg-violet-500/15 hover:bg-violet-600 border border-violet-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Scene</span>
                          <input {...getInputProps()} />
                        </button>
                      )}

                      <button
                        onClick={reset}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5 border border-white/5"
                        title="Clear all and start fresh"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Start Fresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Display: Merged Video (if complete) OR Scene Sequence Timeline */}
                  {resultUrl ? (
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-lg flex items-center justify-center">
                        <video src={resultUrl} controls playsInline className="w-full h-full object-contain" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Full Video Compilation</p>
                          <p className="text-xs text-zinc-400">
                            Combined {clips.length} scenes into a single high-definition MP4.
                          </p>
                        </div>
                        <span className="text-xs font-mono text-violet-300 font-bold">
                          {Number.isFinite(totalDuration) && totalDuration > 0
                            ? `${totalDuration.toFixed(1)}s Total`
                            : "Combined Video"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                        <span>Reorder scenes with up/down arrows or tap to preview.</span>
                        <span className="font-mono text-violet-300 font-bold">
                          {Number.isFinite(totalDuration) && totalDuration > 0
                            ? `${totalDuration.toFixed(1)}s Duration`
                            : "Calculating..."}
                        </span>
                      </div>

                      {/* Scene Cards Stack */}
                      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {clips.map((clip, index) => (
                          <motion.div
                            key={clip.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-violet-500/30 flex items-center gap-3.5 transition-all"
                          >
                            {/* Reordering Up/Down Buttons */}
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => moveClip(index, "up")}
                                disabled={index === 0}
                                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                                title="Move scene up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveClip(index, "down")}
                                disabled={index === clips.length - 1}
                                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                                title="Move scene down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Scene Order Number Badge */}
                            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center font-mono font-bold text-xs text-violet-300 shrink-0">
                              #{index + 1}
                            </div>

                            {/* Clip Video Thumbnail */}
                            <div
                              onClick={() => setActivePreview(clip.preview)}
                              className="relative aspect-video w-24 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 cursor-pointer group/thumb"
                            >
                              <video
                                src={clip.preview}
                                onLoadedMetadata={async (e) => {
                                  const v = e.currentTarget;
                                  const d = await resolveVideoDuration(v);
                                  if (Number.isFinite(d) && d > 0) {
                                    setClips((prev) =>
                                      prev.map((c) => (c.id === clip.id ? { ...c, duration: d } : c))
                                    );
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover/thumb:bg-black/10 flex items-center justify-center transition-colors">
                                <Play className="w-4 h-4 text-white opacity-80 group-hover/thumb:opacity-100 group-hover/thumb:scale-110 transition-all" />
                              </div>
                            </div>

                            {/* Clip Title & Metadata */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{clip.file.name}</h4>
                              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                                <span className="flex items-center gap-1 text-violet-300 font-mono">
                                  <Clock className="w-3 h-3" />
                                  {Number.isFinite(clip.duration) && clip.duration > 0
                                    ? `${clip.duration.toFixed(1)}s`
                                    : "Calculating..."}
                                </span>
                                <span>•</span>
                                <span className="font-mono">{formatSize(clip.file.size)}</span>
                              </div>
                            </div>

                            {/* Delete Clip Button */}
                            <button
                              onClick={() => removeClip(clip.id)}
                              className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Remove scene"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Telemetry Bento Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Scene Count
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-white">
                        {clips.length} Scenes
                      </p>
                      <span className="text-[11px] text-zinc-500">In sequence</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Combined Duration
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-violet-300">
                        {Number.isFinite(totalDuration) && totalDuration > 0
                          ? `${totalDuration.toFixed(1)}s`
                          : "0.0s"}
                      </p>
                      <span className="text-[11px] text-zinc-500">Master length</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Combined Size
                      </p>
                      <p className="text-lg sm:text-xl font-black font-mono text-violet-200">
                        {formatSize(totalSize)}
                      </p>
                      <span className="text-[11px] text-zinc-500">Source total</span>
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
                            Combining your selected video clips with audio into one video.
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
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-outfit">
                      Merge & Export
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Join all scenes into a single continuous video file.
                    </p>
                  </div>
                </div>

                {/* Sequence Overview Box */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Sequence Summary
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Total Scenes:</span>
                    <span className="font-bold text-white font-mono">{clips.length} Clips</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Total Runtime:</span>
                    <span className="font-bold text-violet-300 font-mono">
                      {Number.isFinite(totalDuration) && totalDuration > 0
                        ? `${totalDuration.toFixed(1)}s`
                        : "Calculating..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Output Resolution:</span>
                    <span className="font-bold text-zinc-300 font-mono">1280 × 720 (HD)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Audio:</span>
                    <span className="font-bold text-zinc-300 font-mono">Combined from clips</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  {!resultUrl ? (
                    <button
                      onClick={handleMerge}
                      disabled={clips.length < 2 || isProcessing}
                      className={cn(
                        "w-full relative overflow-hidden group py-4 px-6 rounded-2xl font-black text-base transition-all",
                        "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2.5">
                        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>
                          {clips.length < 2
                            ? "Add at Least 2 Scenes to Merge"
                            : `Merge ${clips.length} Scenes into Master Video`}
                        </span>
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
                            <span>Saving Master Video...</span>
                          </>
                        ) : downloadStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                            <span>Saved to Downloads!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Merged Video</span>
                          </>
                        )}
                      </motion.button>

                      <button
                        onClick={reset}
                        className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-400 hover:text-white transition-all text-center"
                      >
                        Merge Another Sequence
                      </button>

                      {/* Retention & Vault Integration */}
                      <ResultRetentionBar
                        toolType="video-merger"
                        toolName="Video Merger"
                        title={`Merged Video (${clips.length} Scenes)`}
                        fileUrl={resultUrl}
                        metadata={{
                          sceneCount: clips.length,
                          totalDuration,
                          totalSize,
                        }}
                        downloadAction={handleDownload}
                        downloadLabel="Download Merged Video"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Informative Guidance Card */}
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] p-6 flex gap-4">
                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 h-fit">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Automatic Clip Fitting
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Clips with different video sizes are automatically adjusted to fit cleanly into one video without cropping your footage.
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
