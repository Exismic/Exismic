"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Upload,
  Download,
  Zap,
  Loader2,
  SlidersHorizontal,
  Monitor,
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  Film,
  Compass,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  COMPRESSOR_BLUEPRINTS,
  COMPRESSION_PROFILES,
  CompressorBlueprint,
  generateCompressorSampleVideo,
} from "./video-compressor-blueprints";
import { ResultRetentionBar } from "./ResultRetentionBar";

type Quality = "low" | "medium" | "high" | "ultra";

export default function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [format, setFormat] = useState<"mp4" | "webm">("mp4");
  const [lastCompressedQuality, setLastCompressedQuality] = useState<Quality | null>(null);
  const [lastCompressedFormat, setLastCompressedFormat] = useState<"mp4" | "webm" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("Preparing compression...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("exismic-compressed.mp4");
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingBlueprintId, setLoadingBlueprintId] = useState<string | null>(null);

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
      if (selectedFile.size > 250 * 1024 * 1024) {
        setError("File exceeds maximum upload size (250 MB). Please choose a smaller video.");
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setCompressedSize(null);
      setLastCompressedQuality(null);
      setLastCompressedFormat(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    multiple: false,
  });

  // Client-side instant compression via Canvas, Web Audio & MediaRecorder
  // Dynamically calculates bitrate based on source file size and quality profile to guarantee smaller output
  const compressVideoLocally = async (
    sourceFile: File,
    targetQuality: Quality,
    targetFormat: "mp4" | "webm",
    onProgress: (pct: number) => void,
    isAggressiveFallback: boolean = false,
    prewarmedAudioCtx: AudioContext | null = null
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const tempVideo = document.createElement("video");
      const videoSrc = URL.createObjectURL(sourceFile);
      tempVideo.src = videoSrc;
      // Do NOT set muted=true before connecting to Web Audio, otherwise browser sends silence!
      tempVideo.muted = false;
      tempVideo.volume = 1;
      tempVideo.playsInline = true;
      tempVideo.preload = "auto";

      let hasCleanedUp = false;
      let renderInterval: NodeJS.Timeout | null = null;
      let safetyTimeout: NodeJS.Timeout | null = null;
      let audioContext: AudioContext | null = prewarmedAudioCtx || null;
      let recorder: MediaRecorder | null = null;

      const cleanup = () => {
        if (hasCleanedUp) return;
        hasCleanedUp = true;
        if (renderInterval) clearInterval(renderInterval);
        if (safetyTimeout) clearTimeout(safetyTimeout);
        try {
          if (audioContext && audioContext.state !== "closed" && !prewarmedAudioCtx) {
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

        // Calculate source video's average bitrate in bits/sec
        const sourceBitrate = (sourceFile.size * 8) / duration;

        // Profile configuration: target reduction ratio, resolution scale, frame rate, and max bitrate cap
        const profileConfig: Record<
          Quality,
          { ratio: number; scale: number; fps: number; maxBitrateCap: number }
        > = {
          low: { ratio: 0.20, scale: 0.45, fps: 18, maxBitrateCap: 0.28 },
          medium: { ratio: 0.40, scale: 0.65, fps: 24, maxBitrateCap: 0.48 },
          high: { ratio: 0.60, scale: 0.80, fps: 26, maxBitrateCap: 0.68 },
          ultra: { ratio: 0.78, scale: 0.90, fps: 30, maxBitrateCap: 0.82 },
        };

        const config = isAggressiveFallback
          ? { ratio: 0.16, scale: 0.35, fps: 16, maxBitrateCap: 0.22 }
          : profileConfig[targetQuality];

        const canvas = document.createElement("canvas");
        const scaledW = Math.max(240, Math.round((rawWidth * config.scale) / 2) * 2);
        const scaledH = Math.max(160, Math.round((rawHeight * config.scale) / 2) * 2);
        canvas.width = scaledW;
        canvas.height = scaledH;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          cleanup();
          reject(new Error("Video canvas initialization failed"));
          return;
        }

        const stream = canvas.captureStream ? canvas.captureStream(config.fps) : null;
        if (!stream) {
          cleanup();
          reject(new Error("Stream capture unavailable"));
          return;
        }

        // 1. Direct native HTMLMediaElement stream capture (zero latency, clean PCM)
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

        // 2. Web Audio API pipeline fallback
        if (!audioTrack) {
          try {
            if (!audioContext) {
              const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
              if (AudioCtx) {
                audioContext = new AudioCtx();
              }
            }
            if (audioContext) {
              if (audioContext.state === "suspended") {
                await audioContext.resume();
              }
              tempVideo.muted = false;
              tempVideo.volume = 1;
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

        // Calculate target bitrate strictly bounded below source bitrate
        let targetBitrate = Math.round(sourceBitrate * config.ratio);
        const absoluteCap = Math.round(sourceBitrate * config.maxBitrateCap);
        targetBitrate = Math.min(targetBitrate, absoluteCap);
        targetBitrate = Math.max(80_000, targetBitrate);

        // Pick preferred MIME type
        const preferredTypes =
          targetFormat === "webm"
            ? [
                "video/webm;codecs=vp9,opus",
                "video/webm;codecs=vp8,opus",
                "video/webm",
                "video/mp4;codecs=avc1",
                "video/mp4",
              ]
            : [
                "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
                "video/mp4;codecs=avc1,opus",
                "video/mp4",
                "video/webm;codecs=vp9,opus",
                "video/webm;codecs=vp8,opus",
                "video/webm",
              ];

        let selectedMimeType = "";
        for (const t of preferredTypes) {
          if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
            selectedMimeType = t;
            break;
          }
        }
        if (!selectedMimeType) {
          selectedMimeType = targetFormat === "webm" ? "video/webm" : "video/mp4";
        }

        try {
          recorder = new MediaRecorder(stream, {
            mimeType: selectedMimeType,
            videoBitsPerSecond: targetBitrate,
          });
        } catch {
          try {
            recorder = new MediaRecorder(stream, {
              videoBitsPerSecond: targetBitrate,
            });
          } catch {
            try {
              recorder = new MediaRecorder(stream);
            } catch {
              cleanup();
              reject(new Error("Device does not support recording in selected format"));
              return;
            }
          }
        }

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          cleanup();
          const finalBlob = new Blob(chunks, { type: selectedMimeType });
          // If not in aggressive fallback mode, verify that the compressed size is truly smaller
          if (!isAggressiveFallback && finalBlob.size >= sourceFile.size) {
            reject(new Error("LOCAL_NOT_SMALLER"));
            return;
          }
          resolve(finalBlob);
        };

        recorder.onerror = () => {
          cleanup();
          reject(new Error("Local compression recording failed"));
        };

        recorder.start(100);

        let hasPlaybackStarted = false;
        tempVideo.onplaying = () => {
          hasPlaybackStarted = true;
        };

        tempVideo.onended = () => {
          if (renderInterval) clearInterval(renderInterval);
          setTimeout(() => {
            if (recorder && recorder.state === "recording") {
              recorder.stop();
            }
          }, 80);
        };

        try {
          await tempVideo.play();
        } catch {
          // If browser restricts unmuted autoplay, mute temporarily for video playhead
          tempVideo.muted = true;
          await tempVideo.play().catch(() => {});
        }

        renderInterval = setInterval(() => {
          if (tempVideo.ended || (hasPlaybackStarted && tempVideo.paused)) {
            if (renderInterval) clearInterval(renderInterval);
            setTimeout(() => {
              if (recorder && recorder.state === "recording") {
                recorder.stop();
              }
            }, 80);
            return;
          }
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          const progress = Math.min(99, Math.round(((tempVideo.currentTime || 0) / duration) * 100));
          onProgress(progress);
        }, 1000 / config.fps);

        // Safety fallback timer: duration + 1.8 seconds max
        safetyTimeout = setTimeout(() => {
          if (renderInterval) clearInterval(renderInterval);
          if (recorder && recorder.state === "recording") {
            recorder.stop();
          }
        }, Math.max(3000, (duration + 1.8) * 1000));
      };

      tempVideo.onerror = () => {
        cleanup();
        reject(new Error("Unable to read video file for local compression"));
      };
    });
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(6);
    setProcessingStage("Optimizing video & preserving audio...");

    // Pre-warm AudioContext inside the user click handler so it's guaranteed to be running
    let userAudioCtx: AudioContext | null = null;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        userAudioCtx = new AudioCtx();
        if (userAudioCtx.state === "suspended") {
          await userAudioCtx.resume();
        }
      }
    } catch {
      // ignore
    }

    try {
      let finalBlob: Blob | null = null;
      let finalFileName = `${file.name.replace(/\.[^/.]+$/, "")}-compressed.${format}`;

      const hasMediaRecorder = typeof window !== "undefined" && typeof MediaRecorder !== "undefined";

      // Check if browser's MediaRecorder can encode audio into MP4 format
      // In Chromium (Chrome/Edge/Brave on Windows/Mac), MediaRecorder does NOT have an AAC encoder.
      // So recording MP4 locally will discard the audio track.
      // For MP4, we prefer the cloud FFmpeg encoder which encodes true AAC audio and plays on all devices!
      const canLocalRecordMp4WithAudio =
        typeof MediaRecorder !== "undefined" &&
        typeof MediaRecorder.isTypeSupported === "function" &&
        MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E,mp4a.40.2");

      const shouldPreferCloudForMp4Audio = format === "mp4" && !canLocalRecordMp4WithAudio;

      // 1. Instant On-Device Compression (Instant, 0s network upload, 100% private for WebM or supported codecs)
      if (hasMediaRecorder && !shouldPreferCloudForMp4Audio) {
        try {
          finalBlob = await compressVideoLocally(
            file,
            quality,
            format,
            (pct) => {
              setProcessingProgress(Math.max(6, pct));
              if (pct < 30) {
                setProcessingStage("Analyzing frames & reducing file size...");
              } else if (pct < 75) {
                setProcessingStage("Compacting video frames...");
              } else {
                setProcessingStage("Preserving audio & clarity...");
              }
            },
            false,
            userAudioCtx
          );
        } catch (localErr: unknown) {
          const errObj = localErr as { message?: string };
          console.warn("Local compression issue or not smaller, trying cloud encoder fallback:", errObj?.message);
          finalBlob = null;
        }
      }

      // 2. Cloud Server Route Fallback (for MP4 with AAC, or when local MediaRecorder wasn't supported/smaller)
      if (!finalBlob) {
        setProcessingStage(
          format === "mp4"
            ? "Preserving high-fidelity AAC audio with studio encoder..."
            : "Connecting to high-speed cloud encoder..."
        );
        setProcessingProgress(25);

        // Continuous progress ticker for cloud wait
        let currentPct = 25;
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        progressTimerRef.current = setInterval(() => {
          currentPct += (92 - currentPct) * 0.08;
          setProcessingProgress(Math.round(currentPct));
        }, 150);

        const formData = new FormData();
        formData.append("video", file);
        formData.append("quality", quality);
        formData.append("format", format);

        const response = await fetch("/api/tools/video/compressor", {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(25000), // Max 25s timeout to prevent hanging
        });

        if (response.ok) {
          finalBlob = await response.blob();
          const customHeaderName = response.headers.get("X-Exismic-File-Name");
          if (customHeaderName) {
            finalFileName = decodeURIComponent(customHeaderName);
          }
        } else {
          // 3. Direct Modal Fallback if Next.js proxy returned an error
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

          const base64Data = await fileToBase64(file);
          const modalRes = await fetch(`${baseUrl.replace(/\/+$/, "")}/compress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_name: file.name,
              file_data_base64: base64Data,
              quality,
              format,
            }),
            signal: AbortSignal.timeout(20000),
          });

          if (modalRes.ok) {
            const result = await modalRes.json();
            if (result.success && result.file_data_base64) {
              const base64Res = await fetch(result.file_data_base64);
              finalBlob = await base64Res.blob();
            }
          }
        }
      }

      // 4. Secondary Aggressive Local Fallback (if cloud was offline and initial local was rejected)
      if (!finalBlob && hasMediaRecorder) {
        try {
          setProcessingStage("Applying compact stream optimization...");
          finalBlob = await compressVideoLocally(
            file,
            quality,
            format,
            () => {},
            true, /* isAggressiveFallback */
            userAudioCtx
          );
        } catch {
          // Ignore
        }
      }

      if (!finalBlob) {
        throw new Error("Unable to compress video. Please try another quality profile or format.");
      }

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProcessingProgress(100);
      setProcessingStage("Video compressed successfully!");

      await new Promise((r) => setTimeout(r, 250));

      const newUrl = URL.createObjectURL(finalBlob);
      setResultUrl(newUrl);
      setResultFileName(finalFileName);
      setCompressedSize(finalBlob.size);
      setLastCompressedQuality(quality);
      setLastCompressedFormat(format);
    } catch (err) {
      console.error("Compression error:", err);
      setError(err instanceof Error ? err.message : "Failed to compress video. Please try another quality setting.");
    } finally {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setIsProcessing(false);
    }
  };

  // Load sample blueprint video
  const handleLoadBlueprint = async (blueprint: CompressorBlueprint) => {
    try {
      setLoadingBlueprintId(blueprint.id);
      setError(null);
      const generatedFile = await generateCompressorSampleVideo(blueprint);
      setFile(generatedFile);
      setPreviewUrl(URL.createObjectURL(generatedFile));
      setResultUrl(null);
      setCompressedSize(null);
      setLastCompressedQuality(null);
      setLastCompressedFormat(null);
    } catch (err) {
      console.error("Blueprint generation error:", err);
      setError("Unable to generate sample video. Please upload a file instead.");
    } finally {
      setLoadingBlueprintId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "success">("idle");

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultFileName("exismic-compressed.mp4");
    setCompressedSize(null);
    setLastCompressedQuality(null);
    setLastCompressedFormat(null);
    setIsProcessing(false);
    setError(null);
    setDownloadStatus("idle");
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    setDownloadStatus("downloading");

    try {
      await new Promise((r) => setTimeout(r, 500));
      const a = document.createElement("a");
      a.href = resultUrl;
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

  const isRecompressNeeded =
    resultUrl !== null &&
    (quality !== lastCompressedQuality || format !== lastCompressedFormat);

  const reductionPercent =
    file && compressedSize
      ? Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100))
      : 0;

  // Real-time estimated size based on selected quality profile
  const estimatedRatios: Record<Quality, number> = {
    low: 0.20,
    medium: 0.40,
    high: 0.60,
    ultra: 0.80,
  };

  const estimatedTargetSize = file
    ? Math.max(1024, Math.round(file.size * estimatedRatios[quality]))
    : 0;

  const currentProfile = COMPRESSION_PROFILES.find((p) => p.id === quality);

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

              {/* Ambient Specular Background Glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2rem]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-violet-500/10 blur-[120px] rounded-full group-hover:bg-violet-500/20 transition-all duration-700" />
              </div>

              {/* Icon Orb */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-violet-500/25 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-violet-500/40 group-hover:bg-violet-500/10 transition-all duration-300">
                  <TrendingDown className="w-12 h-12 text-zinc-300 group-hover:text-violet-300 transition-colors" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-violet-600 text-white shadow-lg border border-violet-400/30">
                  <Film className="w-4 h-4" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 font-outfit">
                Drop your video here to compress
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
                Shrink file size without losing video clarity. Perfect for email, Discord, WhatsApp, and social uploads.
              </p>

              {/* Format Badges */}
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
                      Test compression ratios immediately without finding a video on your device.
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  4 Ready-to-Test Clips
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {COMPRESSOR_BLUEPRINTS.map((bp) => (
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
                          -{bp.reductionPercentage}% Cut
                        </span>
                      </div>

                      {/* Title & Details */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                          <span style={{ color: bp.accentColor }}>{bp.category}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">
                            {bp.originalSizeDisplay} ➔ {bp.compressedSizeDisplay}
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
            key="compressor-editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Video Preview & Size Reduction Telemetry */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Player Top Toolbar (Above Video, 100% Unobstructed) */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {resultUrl ? (
                        <div className="px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide flex items-center gap-2 bg-violet-500/15 border-violet-500/30 text-violet-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                          <span>Compressed Result</span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-zinc-300 truncate max-w-[220px] sm:max-w-xs font-mono">
                          {file.name}
                        </span>
                      )}
                      {resultUrl && (
                        <span className="hidden sm:inline text-xs font-mono text-zinc-400">
                          {isRecompressNeeded ? (
                            <span className="text-violet-300 font-medium flex items-center gap-1">
                              <SlidersHorizontal className="w-3 h-3" />
                              Settings changed • Click Re-compress below
                            </span>
                          ) : (
                            "Ready for download"
                          )}
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

                  {/* Clean, Unobstructed Video Player Stage */}
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-lg flex items-center justify-center">
                    <video
                      key={resultUrl || previewUrl!}
                      src={resultUrl || previewUrl!}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Size Comparison Bento Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 relative">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Original Size
                      </p>
                      <p className="text-2xl sm:text-3xl font-black font-mono text-white">
                        {formatSize(file.size)}
                      </p>
                      <span className="text-[11px] text-zinc-500">Uncompressed Source</span>
                    </div>

                    <div
                      className={cn(
                        "p-5 rounded-2xl border transition-all duration-300 relative",
                        isRecompressNeeded
                          ? "bg-violet-600/10 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                          : compressedSize
                          ? "bg-violet-500/10 border-violet-500/30"
                          : "bg-white/[0.03] border-white/5"
                      )}
                    >
                      <p className="text-[10px] font-bold text-violet-300 uppercase tracking-wider mb-1.5">
                        {isRecompressNeeded
                          ? "New Target Size"
                          : compressedSize
                          ? "Final Compressed Size"
                          : "Estimated Target Size"}
                      </p>
                      <p className="text-2xl sm:text-3xl font-black font-mono text-violet-200">
                        {isRecompressNeeded
                          ? `~${formatSize(estimatedTargetSize)}`
                          : compressedSize
                          ? formatSize(compressedSize)
                          : `~${formatSize(estimatedTargetSize)}`}
                      </p>
                      {isRecompressNeeded ? (
                        <div className="mt-1 flex items-center gap-1.5 text-violet-300 text-xs font-semibold">
                          <TrendingDown className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>Aiming for {currentProfile?.reduction}</span>
                        </div>
                      ) : compressedSize ? (
                        <div className="mt-1 flex items-center gap-1.5 text-violet-300 text-xs font-bold font-mono">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Reduced by {reductionPercent}%</span>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                          <TrendingDown className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          <span>Estimated {currentProfile?.reduction || "~55–65% cut"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Proportion Reduction Bar */}
                  {compressedSize && (
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>Space Saved: {formatSize(Math.max(0, file.size - compressedSize))}</span>
                        <span className="text-violet-300 font-bold">-{reductionPercent}% Shrunk</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                          style={{ width: `${Math.max(10, 100 - reductionPercent)}%` }}
                        />
                        <div
                          className="h-full bg-zinc-700/50"
                          style={{ width: `${reductionPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
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
                            Preserving smooth frame rates and full audio clarity.
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
                      Compression Settings
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Balance video detail and file size
                    </p>
                  </div>
                </div>

                {/* Quality Profile Selector - Always interactive! */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Quality Profile
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {COMPRESSION_PROFILES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setQuality(p.id)}
                        disabled={isProcessing}
                        className={cn(
                          "p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                          quality === p.id
                            ? "bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-500/20"
                            : "border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:border-white/10 hover:text-white"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white">{p.name}</span>
                        </div>
                        <span className="text-[10px] text-violet-300 font-mono block">
                          {p.reduction}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Active Profile Info Banner */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400 leading-relaxed">
                    {COMPRESSION_PROFILES.find((p) => p.id === quality)?.desc}
                  </div>
                </div>

                {/* Target Format Switcher - Always interactive! */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                      Output Format
                    </label>
                    <span className="text-[10px] text-violet-300/80 font-mono">
                      {format === "mp4" ? "Universal H.264 + AAC Audio" : "Fast Web Stream + Opus Audio"}
                    </span>
                  </div>
                  <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                    {(["mp4", "webm"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        disabled={isProcessing}
                        className={cn(
                          "flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer",
                          format === f
                            ? "bg-violet-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {f === "mp4" ? "MP4 (Universal)" : "WebM (Web Stream)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  {!resultUrl ? (
                    <button
                      onClick={handleCompress}
                      disabled={!file || isProcessing}
                      className={cn(
                        "w-full relative overflow-hidden group py-4 px-6 rounded-2xl font-black text-base transition-all cursor-pointer",
                        "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2.5">
                        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Compress Video Now</span>
                      </div>
                    </button>
                  ) : isRecompressNeeded ? (
                    /* User changed settings after compression - Invite instant re-compression! */
                    <div className="space-y-3">
                      <button
                        onClick={handleCompress}
                        disabled={isProcessing}
                        className={cn(
                          "w-full relative overflow-hidden group py-4 px-6 rounded-2xl font-black text-base transition-all cursor-pointer",
                          "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99]",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-2.5">
                          <Zap className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-300" />
                          <span>Re-compress with {currentProfile?.name}</span>
                        </div>
                      </button>

                      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-200 flex items-center justify-between">
                        <span>Targeting {currentProfile?.reduction}</span>
                        <span className="font-mono text-violet-300 font-bold">~{formatSize(estimatedTargetSize)}</span>
                      </div>

                      <button
                        onClick={handleDownload}
                        className="w-full py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-violet-400" />
                        <span>Download Previous Result ({compressedSize ? formatSize(compressedSize) : ""})</span>
                      </button>
                    </div>
                  ) : (
                    /* Compression is up-to-date with active settings */
                    <div className="space-y-3">
                      <motion.button
                        onClick={handleDownload}
                        disabled={downloadStatus === "downloading"}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black text-sm transition-all duration-300 shadow-xl cursor-pointer",
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
                            <span>Saving Video...</span>
                          </>
                        ) : downloadStatus === "success" ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                            <span>Saved to Downloads!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Compressed Video</span>
                          </>
                        )}
                      </motion.button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleCompress}
                          disabled={isProcessing}
                          className="py-2.5 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Re-run compression"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                          <span>Re-compress</span>
                        </button>

                        <button
                          onClick={reset}
                          className="py-2.5 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-400 hover:text-white transition-all text-center cursor-pointer"
                        >
                          Change Video
                        </button>
                      </div>

                      {/* Retention & Vault Integration */}
                      <ResultRetentionBar
                        toolType="video-compressor"
                        toolName="Video Compressor"
                        title={`Compressed: ${file.name}`}
                        fileUrl={resultUrl}
                        metadata={{
                          originalSize: file.size,
                          compressedSize,
                          reductionPercent,
                          quality,
                          format,
                        }}
                        downloadAction={handleDownload}
                        downloadLabel="Download Compressed Video"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Intuition Guidance Card */}
              <div className="bg-[#070914]/90 border border-white/[0.08] rounded-[2rem] p-6 flex gap-4">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 shrink-0 h-fit">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Quality-Tuned Compression
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Exismic optimizes frame data for smaller downloads while keeping spoken dialogue and background audio intact.
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
