"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic2,
  Music2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Layers,
  Repeat,
  Headphones,
  Check,
  Disc3,
  AudioWaveform,
  Sliders,
  FolderArchive,
  X,
  ArrowRight,
  Flame,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDemoStems, type GeneratedDemoStems } from "@/lib/vocal-demo-generator";
import Link from "next/link";

interface StemTrack {
  id: string;
  name: string;
  badge: string;
  url: string;
  blob?: Blob;
  fileName: string;
  volume: number; // 0 to 1
  isMuted: boolean;
  isSolo: boolean;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function VocalRemoverStudio() {
  // Input Audio State
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("Sample Track");
  const [isDemo, setIsDemo] = useState<boolean>(true);

  // Processing state
  const [status, setStatus] = useState<"idle" | "ready" | "processing" | "complete" | "error">("complete");
  const [elapsed, setElapsed] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("Preparing audio...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Source preview player state
  const [isSourcePlaying, setIsSourcePlaying] = useState<boolean>(false);

  // Playback & Mixer State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(12);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<"karaoke" | "vocals" | "balanced" | "boost" | "custom">("karaoke");

  // Audio HTML Elements refs for synchronized playback
  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const instAudioRef = useRef<HTMLAudioElement | null>(null);
  const sourceAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stems State (Vocals & Music)
  const [tracks, setTracks] = useState<{ vocals: StemTrack; instrumental: StemTrack }>({
    vocals: {
      id: "vocals",
      name: "Vocals",
      badge: "VOCALS",
      url: "",
      fileName: "vocals.wav",
      volume: 0.0, // Default to Karaoke on demo
      isMuted: true,
      isSolo: false,
    },
    instrumental: {
      id: "instrumental",
      name: "Music",
      badge: "INSTRUMENTAL",
      url: "",
      fileName: "instrumental.wav",
      volume: 1.0,
      isMuted: false,
      isSolo: false,
    },
  });

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load Instant Demo on mount
  useEffect(() => {
    let active = true;
    generateDemoStems().then((demo: GeneratedDemoStems) => {
      if (!active) return;
      setDuration(demo.duration);
      setTracks((prev) => ({
        vocals: {
          ...prev.vocals,
          url: demo.vocalUrl,
          blob: demo.vocalBlob,
          volume: 0.0,
          isMuted: true,
        },
        instrumental: {
          ...prev.instrumental,
          url: demo.instrumentalUrl,
          blob: demo.instrumentalBlob,
          volume: 1.0,
          isMuted: false,
        },
      }));
      setStatus("complete");
      setIsDemo(true);
      setFileName("Sample Track");
    }).catch((err) => {
      console.warn("Could not generate demo audio:", err);
    });

    return () => {
      active = false;
      abortControllerRef.current?.abort();
      if (xhrRef.current) xhrRef.current.abort();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // Synchronize Audio Volumes and Solo/Mute states
  useEffect(() => {
    const vAudio = vocalAudioRef.current;
    const iAudio = instAudioRef.current;

    const vocalsEffectiveMuted =
      tracks.vocals.isMuted || (tracks.instrumental.isSolo && !tracks.vocals.isSolo);
    const instEffectiveMuted =
      tracks.instrumental.isMuted || (tracks.vocals.isSolo && !tracks.instrumental.isSolo);

    if (vAudio) {
      vAudio.volume = vocalsEffectiveMuted ? 0 : tracks.vocals.volume;
      vAudio.muted = vocalsEffectiveMuted;
    }
    if (iAudio) {
      iAudio.volume = instEffectiveMuted ? 0 : tracks.instrumental.volume;
      iAudio.muted = instEffectiveMuted;
    }
  }, [tracks]);

  // Synchronize Playhead updates
  useEffect(() => {
    const vAudio = vocalAudioRef.current || instAudioRef.current;
    if (!vAudio) return;

    const handleLoadedMetadata = () => {
      if (vAudio.duration && !isNaN(vAudio.duration) && vAudio.duration > 0) {
        setDuration(vAudio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(vAudio.currentTime);
      if (vAudio.duration && !isNaN(vAudio.duration) && vAudio.duration > 0) {
        setDuration(vAudio.duration);
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        handleSeek(0);
        vocalAudioRef.current?.play().catch(() => {});
        instAudioRef.current?.play().catch(() => {});
      } else {
        setIsPlaying(false);
        handleSeek(0);
      }
    };

    vAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
    vAudio.addEventListener("timeupdate", handleTimeUpdate);
    vAudio.addEventListener("ended", handleEnded);

    return () => {
      vAudio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      vAudio.removeEventListener("timeupdate", handleTimeUpdate);
      vAudio.removeEventListener("ended", handleEnded);
    };
  }, [tracks.vocals.url, tracks.instrumental.url, isLooping]);

  // Smooth 60FPS RAF Playhead Loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const tick = () => {
      const vAudio = vocalAudioRef.current || instAudioRef.current;
      if (vAudio && !vAudio.paused && !vAudio.ended) {
        setCurrentTime(vAudio.currentTime);
        if (vAudio.duration && !isNaN(vAudio.duration) && vAudio.duration > 0) {
          setDuration(vAudio.duration);
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Toggle Master Play / Pause
  const togglePlay = () => {
    const vAudio = vocalAudioRef.current;
    const iAudio = instAudioRef.current;

    if (!vAudio || !iAudio) return;

    if (isPlaying) {
      vAudio.pause();
      iAudio.pause();
      setIsPlaying(false);
    } else {
      const targetTime = currentTime >= (duration - 0.2) ? 0 : currentTime;
      if (targetTime === 0) setCurrentTime(0);

      vAudio.currentTime = targetTime;
      iAudio.currentTime = targetTime;

      Promise.all([
        vAudio.play().catch(() => null),
        iAudio.play().catch(() => null),
      ])
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Seek Playhead
  const handleSeek = (newTime: number) => {
    const safeTime = Math.max(0, Math.min(duration || 12, newTime));
    const vAudio = vocalAudioRef.current;
    const iAudio = instAudioRef.current;

    setCurrentTime(safeTime);
    if (vAudio) vAudio.currentTime = safeTime;
    if (iAudio) iAudio.currentTime = safeTime;
  };

  // Reset to Beginning
  const handleResetPlayback = () => {
    handleSeek(0);
    if (!isPlaying) togglePlay();
  };

  // Quick Preset Handlers
  const applyPreset = (preset: "karaoke" | "vocals" | "balanced" | "boost") => {
    setActivePreset(preset);

    if (preset === "karaoke") {
      // Karaoke: Vocals 0%, Music 100%
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 0, isMuted: true, isSolo: false },
        instrumental: { ...prev.instrumental, volume: 1.0, isMuted: false, isSolo: false },
      }));
    } else if (preset === "vocals") {
      // Vocals Only: Vocals 100%, Music 0%
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 1.0, isMuted: false, isSolo: false },
        instrumental: { ...prev.instrumental, volume: 0, isMuted: true, isSolo: false },
      }));
    } else if (preset === "balanced") {
      // Original Mix: Vocals 85%, Music 90%
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 0.85, isMuted: false, isSolo: false },
        instrumental: { ...prev.instrumental, volume: 0.9, isMuted: false, isSolo: false },
      }));
    } else if (preset === "boost") {
      // Boost Vocals: Vocals 100%, Music 65%
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 1.0, isMuted: false, isSolo: false },
        instrumental: { ...prev.instrumental, volume: 0.65, isMuted: false, isSolo: false },
      }));
    }
  };

  // Individual Track Sliders
  const setTrackVolume = (trackId: "vocals" | "instrumental", val: number) => {
    setActivePreset("custom");
    setTracks((prev) => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        volume: val,
        isMuted: val === 0,
      },
    }));
  };

  const toggleTrackMute = (trackId: "vocals" | "instrumental") => {
    setActivePreset("custom");
    setTracks((prev) => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        isMuted: !prev[trackId].isMuted,
      },
    }));
  };

  const toggleTrackSolo = (trackId: "vocals" | "instrumental") => {
    setActivePreset("custom");
    setTracks((prev) => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        isSolo: !prev[trackId].isSolo,
      },
    }));
  };

  // File Upload Handlers
  const handleSelectFile = useCallback((selectedFile: File) => {
    const url = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setSourceUrl(url);
    setFileName(selectedFile.name);
    setStatus("ready");
    setIsDemo(false);
    setErrorMessage(null);
    setIsPlaying(false);
    setIsSourcePlaying(false);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        handleSelectFile(acceptedFiles[0]);
      }
    },
    [handleSelectFile]
  );

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"] },
    maxFiles: 1,
    maxSize: 120 * 1024 * 1024,
    multiple: false,
    noClick: true,
  });

  // Source preview play/pause
  const toggleSourcePlay = () => {
    const audio = sourceAudioRef.current;
    if (!audio) return;
    if (isSourcePlaying) {
      audio.pause();
      setIsSourcePlaying(false);
    } else {
      audio.play().then(() => setIsSourcePlaying(true)).catch(() => {});
    }
  };

  // Load Sample Song button
  const handleLoadDemo = async () => {
    setStatus("processing");
    setIsPlaying(false);
    try {
      const demo = await generateDemoStems();
      setDuration(demo.duration);
      setTracks({
        vocals: {
          id: "vocals",
          name: "Vocals",
          badge: "VOCALS",
          url: demo.vocalUrl,
          blob: demo.vocalBlob,
          fileName: "vocals.wav",
          volume: 0.0,
          isMuted: true,
          isSolo: false,
        },
        instrumental: {
          id: "instrumental",
          name: "Music",
          badge: "INSTRUMENTAL",
          url: demo.instrumentalUrl,
          blob: demo.instrumentalBlob,
          fileName: "instrumental.wav",
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
      });
      setIsDemo(true);
      setFile(null);
      setSourceUrl(null);
      setFileName("Sample Track");
      setStatus("complete");
      setActivePreset("karaoke");
      showToast("Sample track ready to play");
    } catch {
      setStatus("error");
      setErrorMessage("Could not load sample audio.");
    }
  };

  // Run AI Separation with Real-Time Dynamic Progress
  const handleProcessAudio = async () => {
    if (!file) return;

    // Pause source preview if playing
    if (sourceAudioRef.current) {
      sourceAudioRef.current.pause();
      setIsSourcePlaying(false);
    }

    setStatus("processing");
    setElapsed(0);
    setProgress(0);
    setProcessingStage(`Uploading ${file.name}...`);
    setErrorMessage(null);
    setIsPlaying(false);

    // Clear any prior timers
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

      // 1. Real Upload Progress (0% to 35% of overall progress)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const uploadPct = Math.min(100, Math.round((e.loaded / e.total) * 100));
          const overallProgress = Math.round((uploadPct / 100) * 35);
          setProgress(overallProgress);
          setProcessingStage(`Uploading song (${uploadPct}%) • ${formatBytes(e.loaded)} of ${formatBytes(e.total)}`);
        }
      };

      // 2. Upload Finished -> Start continuous dynamic separation stages (35% to 99%)
      xhr.upload.onload = () => {
        setProgress(35);
        setProcessingStage("Analyzing vocals and instruments...");

        let currentProgress = 35;
        progressTimerRef.current = setInterval(() => {
          let step = 0.45;
          if (currentProgress < 55) {
            step = 0.65;
            setProcessingStage("Scanning audio frequencies and singing voices...");
          } else if (currentProgress < 75) {
            step = 0.4;
            setProcessingStage("Separating singing vocals from background music...");
          } else if (currentProgress < 88) {
            step = 0.25;
            setProcessingStage("Balancing audio clarity and stereo output...");
          } else if (currentProgress < 96) {
            step = 0.12;
            setProcessingStage("Finalizing clean vocal and music tracks...");
          } else if (currentProgress < 99) {
            step = 0.04; // Smooth asymptotic crawl, never freezes!
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

            if (!Array.isArray(outputTracks) || outputTracks.length < 2) {
              throw new Error("Invalid output received from the server.");
            }

            const vTrack = outputTracks.find((t: { id: string }) => t.id === "vocals") || outputTracks[0];
            const iTrack = outputTracks.find((t: { id: string }) => t.id === "instrumental") || outputTracks[1];

            // Smooth completion animation to 100%
            setProgress(100);
            setProcessingStage("Separation complete! Loading tracks...");

            setTimeout(() => {
              setTracks({
                vocals: {
                  id: "vocals",
                  name: "Vocals",
                  badge: "VOCALS",
                  url: vTrack.url,
                  fileName: vTrack.fileName || `${file.name.replace(/\.[^/.]+$/, "")}-vocals.mp3`,
                  volume: 0.0,
                  isMuted: true,
                  isSolo: false,
                },
                instrumental: {
                  id: "instrumental",
                  name: "Music",
                  badge: "INSTRUMENTAL",
                  url: iTrack.url,
                  fileName: iTrack.fileName || `${file.name.replace(/\.[^/.]+$/, "")}-instrumental.mp3`,
                  volume: 1.0,
                  isMuted: false,
                  isSolo: false,
                },
              });

              setStatus("complete");
              setActivePreset("karaoke");
              showToast("Separation complete!");
              resolve();
            }, 450);
          } catch (parseErr) {
            const err = parseErr as Error;
            setErrorMessage(err.message || "Could not parse separation output.");
            setStatus("error");
            reject(parseErr);
          }
        } else {
          try {
            const errJson = JSON.parse(xhr.responseText);
            setErrorMessage(errJson.error || "Could not separate this song. Please try another audio file.");
          } catch {
            setErrorMessage("Audio separation failed. Please try another audio file.");
          }
          setStatus("error");
          reject(new Error("Separation failed"));
        }
      };

      // 4. Network or Abort handlers
      xhr.onerror = () => {
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setErrorMessage("Network error occurred during audio processing.");
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

      xhr.open("POST", "/api/tools/vocal-remover");
      xhr.send(formData);
    });
  };

  // Cancel processing
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
    abortControllerRef.current?.abort();
    setProgress(0);
    setStatus("ready");
  };

  // Download Single Track
  const handleDownloadTrack = (track: StemTrack) => {
    const a = document.createElement("a");
    a.href = track.url;
    a.download = track.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast(`Downloading ${track.name}...`);
  };

  // Download All as ZIP
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const [vocalBlob, instBlob] = await Promise.all([
        tracks.vocals.blob || fetch(tracks.vocals.url).then((r) => r.blob()),
        tracks.instrumental.blob || fetch(tracks.instrumental.url).then((r) => r.blob()),
      ]);

      zip.file(tracks.vocals.fileName, vocalBlob);
      zip.file(tracks.instrumental.fileName, instBlob);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      const baseStem = fileName.replace(/\.[^/.]+$/, "") || "exismic-audio";
      a.download = `${baseStem}-tracks.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("Downloaded ZIP archive");
    } catch (err) {
      console.error(err);
      handleDownloadTrack(tracks.instrumental);
      handleDownloadTrack(tracks.vocals);
    } finally {
      setIsZipping(false);
    }
  };

  // Save to Cloud Vault
  const handleSaveToVault = () => {
    try {
      const existing = JSON.parse(localStorage.getItem("exismic_vault_files") || "[]");
      existing.unshift({
        id: `vocal-${Date.now()}`,
        name: `${fileName} (Vocals & Music)`,
        type: "audio",
        createdAt: new Date().toISOString(),
        folder: "Audio Mixes",
      });
      localStorage.setItem("exismic_vault_files", JSON.stringify(existing.slice(0, 50)));
      showToast("Saved to Cloud Vault");
    } catch {
      showToast("Saved to local storage");
    }
  };

  // Clear / Reset
  const handleClear = () => {
    setIsPlaying(false);
    if (sourceAudioRef.current) sourceAudioRef.current.pause();
    setIsSourcePlaying(false);
    setFile(null);
    setSourceUrl(null);
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

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6">
      {/* Hidden Audio Elements */}
      {tracks.vocals.url && (
        <audio
          ref={vocalAudioRef}
          src={tracks.vocals.url}
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
      {tracks.instrumental.url && (
        <audio
          ref={instAudioRef}
          src={tracks.instrumental.url}
          preload="auto"
          loop={isLooping}
        />
      )}
      {sourceUrl && (
        <audio
          ref={sourceAudioRef}
          src={sourceUrl}
          preload="metadata"
          onEnded={() => setIsSourcePlaying(false)}
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

      {/* MAIN OBSIDIAN CYBER WORKSPACE CARD */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border-2 border-pink-500/35 bg-[#090a12]/95 shadow-[0_20px_70px_rgba(0,0,0,0.7),0_0_35px_rgba(236,72,153,0.12)] backdrop-blur-2xl">
        {/* Subtle dot matrix texture & neon radial auras */}
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(236,72,153,0.15)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-pink-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px]" />

        {/* WORKSPACE TOP BAR */}
        <div className="relative border-b border-white/[0.08] px-4 py-4 sm:px-7 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Squircle Icon with Spinning Conic Neon Ring */}
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0e101d] border border-white/10 shadow-lg group">
              <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,transparent_0%,rgba(236,72,153,0.8)_30%,transparent_60%)] animate-[spin_6s_linear_infinite]" />
              <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#0a0b14]" />
              <Mic2 className="relative size-5 text-pink-300 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-400">
                  Audio & Music
                </span>
                {isDemo && (
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-400/30 text-[9px] font-bold text-pink-300">
                    Sample Track Playing
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
                <Music2 size={13} className="text-pink-400" />
                <span>Try Sample Song</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold text-zinc-300">
              <Headphones size={13} className="text-pink-400" />
              <span>Vocals & Music</span>
            </div>
          </div>
        </div>

        {/* WORKSPACE BODY */}
        <div className="relative p-4 sm:p-7 space-y-6">
          {/* 1. TOP STAGE: UPLOAD & SEPARATION ACTION (Clean, direct, zero jargon) */}
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
                      {formatBytes(file.size)} • Ready to separate
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Drop your song here
                    </p>
                    <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      Upload any song to separate the vocals from the music.
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
                  <span>{file ? "Choose Another Song" : "Choose Audio File"}</span>
                </button>
                {file && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="size-11 flex items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
                    title="Remove song"
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
                        Selected Song
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {formatBytes(file.size)}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white truncate">{file.name}</p>

                    {/* Preview Original Audio Button */}
                    {sourceUrl && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={toggleSourcePlay}
                            className="size-9 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 flex items-center justify-center transition cursor-pointer"
                          >
                            {isSourcePlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                          </button>
                          <span className="text-xs text-zinc-300 font-medium">
                            {isSourcePlaying ? "Playing original song..." : "Preview original song"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleProcessAudio}
                      disabled={status === "processing"}
                      className="w-full min-h-12 flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(236,72,153,0.35)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <AudioWaveform size={16} />
                      <span>
                        {status === "processing" ? "Separating Audio..." : "Separate Vocals & Music"}
                      </span>
                    </button>

                    {errorMessage && (
                      <p className="mt-2 text-xs text-rose-300 font-medium text-center">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="size-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-2">
                      <Disc3 size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white">Instant Separation</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Upload any song to split it into two clean tracks: isolated vocals and background music.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleLoadDemo}
                      className="w-full min-h-11 flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <Music2 size={14} className="text-pink-400" />
                      <span>Try Sample Track</span>
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
                    High-quality AI vocal separation in progress
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

          {/* 3. DUAL-TRACK MIXER & WAVEFORM */}
          {status === "complete" && (
            <div className="space-y-6 pt-2">
              {/* MASTER CONTROLS & TIMELINE CARD */}
              <div className="rounded-2xl border border-white/10 bg-[#0c0d18] p-4 sm:p-6 space-y-4">
                {/* 1-Tap Quick Listening Presets (Clean, no emojis) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sliders size={13} className="text-pink-400" />
                    Quick Presets
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("karaoke")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                        activePreset === "karaoke"
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                      )}
                    >
                      <Music2 size={13} />
                      <span>Karaoke</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("vocals")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                        activePreset === "vocals"
                          ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                      )}
                    >
                      <Mic2 size={13} />
                      <span>Vocals Only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("balanced")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                        activePreset === "balanced"
                          ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                      )}
                    >
                      <Headphones size={13} />
                      <span>Original Mix</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("boost")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                        activePreset === "boost"
                          ? "bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                      )}
                    >
                      <Volume2 size={13} />
                      <span>Boost Vocals</span>
                    </button>
                  </div>
                </div>

                {/* Waveform Visualizer with Click to Seek */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    handleSeek(ratio * (duration || 12));
                  }}
                  className="relative h-20 sm:h-24 w-full rounded-xl bg-black/50 border border-white/[0.06] p-2 flex items-center justify-between gap-1 overflow-hidden select-none cursor-pointer group"
                  title="Click anywhere to seek"
                >
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_100%]" />

                  {/* Playhead Progress Overlay */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-pink-500/[0.07] border-r-2 border-pink-400 pointer-events-none z-10 transition-none"
                    style={{ width: `${Math.min(100, Math.max(0, (currentTime / (duration || 12)) * 100))}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2 rounded-full bg-white shadow-[0_0_8px_#ec4899]" />
                  </div>

                  {/* Visualizer Bars */}
                  {visualizerBars.map((baseH, idx) => {
                    const isPlayed = idx / visualizerBars.length <= currentTime / (duration || 1);
                    const vocalsActive = !tracks.vocals.isMuted && tracks.vocals.volume > 0;
                    const instActive = !tracks.instrumental.isMuted && tracks.instrumental.volume > 0;

                    const liveFactor = isPlaying
                      ? 0.7 + Math.sin((currentTime * 8) + idx * 0.4) * 0.3
                      : 0.85;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col justify-center items-center h-full gap-0.5 cursor-pointer"
                        onClick={() => handleSeek((idx / visualizerBars.length) * duration)}
                      >
                        {/* Vocals Bar */}
                        <div
                          className={cn(
                            "w-full rounded-t-sm transition-all duration-150",
                            vocalsActive
                              ? isPlayed
                                ? "bg-pink-400 shadow-[0_0_6px_rgba(236,72,153,0.8)]"
                                : "bg-pink-500/35"
                              : "bg-white/10"
                          )}
                          style={{
                            height: `${(vocalsActive ? tracks.vocals.volume : 0.15) * baseH * liveFactor * 42}%`,
                          }}
                        />
                        {/* Music Bar */}
                        <div
                          className={cn(
                            "w-full rounded-b-sm transition-all duration-150",
                            instActive
                              ? isPlayed
                                ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                                : "bg-cyan-500/35"
                              : "bg-white/10"
                          )}
                          style={{
                            height: `${(instActive ? tracks.instrumental.volume : 0.15) * baseH * liveFactor * 42}%`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Master Playback Controls Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    {/* Play / Pause Primary Button */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="size-12 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause size={20} className="fill-white" />
                      ) : (
                        <Play size={20} className="fill-white ml-0.5" />
                      )}
                    </button>

                    {/* Reset to Start */}
                    <button
                      type="button"
                      onClick={handleResetPlayback}
                      className="size-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      title="Rewind to beginning"
                    >
                      <RotateCcw size={16} />
                    </button>

                    {/* Loop Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsLooping(!isLooping)}
                      className={cn(
                        "size-10 rounded-xl border flex items-center justify-center transition cursor-pointer",
                        isLooping
                          ? "border-pink-500/50 bg-pink-500/10 text-pink-300"
                          : "border-white/10 bg-white/[0.04] text-zinc-500 hover:text-zinc-300"
                      )}
                      title={isLooping ? "Loop on" : "Loop off"}
                    >
                      <Repeat size={16} />
                    </button>

                    {/* Time Counter */}
                    <div className="font-mono text-xs font-bold text-zinc-300 pl-1">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span className="text-zinc-500">{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Scrubber Range Slider */}
                  <div className="w-full sm:flex-1 sm:max-w-md flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={duration || 1}
                      step={0.05}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full h-1.5 rounded-full bg-white/10 accent-pink-400 cursor-pointer appearance-none focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* DUAL TRACK VOLUME STRIPS */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* TRACK 1: VOCALS */}
                <div className="rounded-2xl border border-pink-500/30 bg-[#0d0e1b] p-5 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-300">
                        <Mic2 size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">Vocals</h3>
                          <span className="px-2 py-0.5 rounded-md bg-pink-500/15 text-[9px] font-black uppercase tracking-wider text-pink-300 border border-pink-500/25">
                            SINGING
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">Isolated voice</p>
                      </div>
                    </div>

                    <span className="font-mono text-sm font-black text-pink-300">
                      {tracks.vocals.isMuted
                        ? "MUTED"
                        : `${Math.round(tracks.vocals.volume * 100)}%`}
                    </span>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={tracks.vocals.isMuted ? 0 : tracks.vocals.volume}
                      onChange={(e) => setTrackVolume("vocals", parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full bg-white/10 accent-pink-400 cursor-pointer appearance-none focus:outline-none"
                    />
                  </div>

                  {/* Solo, Mute, Volume Shortcuts */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTrackMute("vocals")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                          tracks.vocals.isMuted
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                            : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                        )}
                      >
                        {tracks.vocals.isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        <span>{tracks.vocals.isMuted ? "Muted" : "Mute"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleTrackSolo("vocals")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer",
                          tracks.vocals.isSolo
                            ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                            : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                        )}
                      >
                        Solo
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadTrack(tracks.vocals)}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/35 text-xs font-bold text-pink-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download Vocals</span>
                    </button>
                  </div>
                </div>

                {/* TRACK 2: MUSIC */}
                <div className="rounded-2xl border border-cyan-500/30 bg-[#0d0e1b] p-5 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                        <Music2 size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">Music</h3>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-[9px] font-black uppercase tracking-wider text-cyan-300 border border-cyan-500/25">
                            INSTRUMENTAL
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">Background music</p>
                      </div>
                    </div>

                    <span className="font-mono text-sm font-black text-cyan-300">
                      {tracks.instrumental.isMuted
                        ? "MUTED"
                        : `${Math.round(tracks.instrumental.volume * 100)}%`}
                    </span>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={tracks.instrumental.isMuted ? 0 : tracks.instrumental.volume}
                      onChange={(e) => setTrackVolume("instrumental", parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full bg-white/10 accent-cyan-400 cursor-pointer appearance-none focus:outline-none"
                    />
                  </div>

                  {/* Solo, Mute, Volume Shortcuts */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTrackMute("instrumental")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                          tracks.instrumental.isMuted
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                            : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                        )}
                      >
                        {tracks.instrumental.isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        <span>{tracks.instrumental.isMuted ? "Muted" : "Mute"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleTrackSolo("instrumental")}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer",
                          tracks.instrumental.isSolo
                            ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                            : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                        )}
                      >
                        Solo
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadTrack(tracks.instrumental)}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-xs font-bold text-cyan-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download Music</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. MASTER EXPORT & RETENTION ACTIONS */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300">
                    <FolderArchive size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Download Both Tracks</h4>
                    <p className="text-xs text-zinc-400">
                      Get both the vocals and the music in one clean ZIP file.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="flex-1 sm:flex-initial min-h-11 px-5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>{isZipping ? "Creating ZIP..." : "Download Both Tracks (.ZIP)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    className="size-11 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Save to Cloud Vault"
                  >
                    <Layers size={16} />
                  </button>
                </div>
              </div>

              {/* 5. WORKFLOW SHORTCUTS */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">
                    Next Step
                  </span>
                  <p className="text-xs text-zinc-300">
                    Want to slow down your new song or make a video?
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/tools/audio/slowed-reverb"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition"
                  >
                    <Disc3 size={13} className="text-pink-400" />
                    <span>Slowed + Reverb</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link
                    href="/tools/audio/audiogram"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition"
                  >
                    <AudioWaveform size={13} className="text-cyan-400" />
                    <span>Waveform Video</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FLOATING HUD (Visible on screens < 1024px when audio is loaded) */}
      {status === "complete" && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-3 rounded-2xl bg-[#080914]/95 border border-pink-500/30 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={togglePlay}
              className="size-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 active:scale-95 shadow-md cursor-pointer"
            >
              {isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-white ml-0.5" />}
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{fileName}</p>
              <p className="text-[10px] text-zinc-400 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            className="px-3.5 py-2 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-200 text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
          >
            <Download size={13} />
            <span>ZIP</span>
          </button>
        </div>
      )}
    </div>
  );
}
