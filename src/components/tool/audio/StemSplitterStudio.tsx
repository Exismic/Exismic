"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Mic2,
  Disc3,
  Zap,
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
  Clock,
  X,
  FolderArchive,
  AudioWaveform,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateFourTrackDemoStems,
  type GeneratedFourTrackDemoStems,
} from "@/lib/vocal-demo-generator";

type StemId = "vocals" | "drums" | "bass" | "other";

interface StemTrackItem {
  id: StemId;
  name: string;
  description: string;
  badge: string;
  url: string;
  blob?: Blob;
  fileName: string;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  isSolo: boolean;
  color: {
    primaryHex: string;
    border: string;
    borderHover: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    sliderAccent: string;
    glow: string;
  };
  icon: React.ElementType;
}

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

export function StemSplitterStudio() {
  // Source Audio File State
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("Sample Song");
  const [isDemo, setIsDemo] = useState<boolean>(true);

  // Processing & Dynamic Progress State (Standard 4)
  const [status, setStatus] = useState<"idle" | "ready" | "processing" | "complete" | "error">("complete");
  const [elapsed, setElapsed] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("Preparing song...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Source preview player state
  const [isSourcePlaying, setIsSourcePlaying] = useState<boolean>(false);

  // Playback & Master Console State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(12);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<"drums" | "rhythm" | "backing" | "vocals" | "full" | "custom">("full");

  // Audio HTML Elements refs for the 4 synchronized stems
  const vocalsAudioRef = useRef<HTMLAudioElement | null>(null);
  const drumsAudioRef = useRef<HTMLAudioElement | null>(null);
  const bassAudioRef = useRef<HTMLAudioElement | null>(null);
  const otherAudioRef = useRef<HTMLAudioElement | null>(null);
  const sourceAudioRef = useRef<HTMLAudioElement | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 4-Track Stems State
  const [tracks, setTracks] = useState<Record<StemId, StemTrackItem>>({
    vocals: {
      id: "vocals",
      name: "Vocals",
      description: "Lead & background singing voices",
      badge: "VOCALS",
      url: "",
      fileName: "vocals.wav",
      volume: 1.0,
      isMuted: false,
      isSolo: false,
      color: {
        primaryHex: "#ec4899",
        border: "border-pink-500/20",
        borderHover: "hover:border-pink-500/50",
        badgeBg: "bg-pink-500/15",
        badgeBorder: "border-pink-500/30",
        badgeText: "text-pink-300",
        sliderAccent: "accent-pink-500",
        glow: "shadow-[0_0_15px_rgba(236,72,153,0.3)]",
      },
      icon: Mic2,
    },
    drums: {
      id: "drums",
      name: "Drums",
      description: "Kick, snare, hi-hats, and percussion",
      badge: "DRUMS",
      url: "",
      fileName: "drums.wav",
      volume: 1.0,
      isMuted: false,
      isSolo: false,
      color: {
        primaryHex: "#06b6d4",
        border: "border-cyan-500/20",
        borderHover: "hover:border-cyan-500/50",
        badgeBg: "bg-cyan-500/15",
        badgeBorder: "border-cyan-500/30",
        badgeText: "text-cyan-300",
        sliderAccent: "accent-cyan-400",
        glow: "shadow-[0_0_15px_rgba(6,182,212,0.3)]",
      },
      icon: Disc3,
    },
    bass: {
      id: "bass",
      name: "Bass",
      description: "Basslines, 808s, and sub-frequencies",
      badge: "BASS",
      url: "",
      fileName: "bass.wav",
      volume: 1.0,
      isMuted: false,
      isSolo: false,
      color: {
        primaryHex: "#a855f7",
        border: "border-purple-500/20",
        borderHover: "hover:border-purple-500/50",
        badgeBg: "bg-purple-500/15",
        badgeBorder: "border-purple-500/30",
        badgeText: "text-purple-300",
        sliderAccent: "accent-purple-400",
        glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      },
      icon: Zap,
    },
    other: {
      id: "other",
      name: "Instruments",
      description: "Melodies, synths, guitars, and keys",
      badge: "INSTRUMENTS",
      url: "",
      fileName: "instruments.wav",
      volume: 1.0,
      isMuted: false,
      isSolo: false,
      color: {
        primaryHex: "#f59e0b",
        border: "border-amber-500/20",
        borderHover: "hover:border-amber-500/50",
        badgeBg: "bg-amber-500/15",
        badgeBorder: "border-amber-500/30",
        badgeText: "text-amber-300",
        sliderAccent: "accent-amber-400",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      },
      icon: Music2,
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Load Instant $0 Compute 4-Track Demo on Mount
  useEffect(() => {
    let active = true;
    generateFourTrackDemoStems().then((demo: GeneratedFourTrackDemoStems) => {
      if (!active) return;
      setDuration(demo.duration);
      setTracks((prev) => ({
        vocals: {
          ...prev.vocals,
          url: demo.vocalsUrl,
          blob: demo.vocalsBlob,
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
        drums: {
          ...prev.drums,
          url: demo.drumsUrl,
          blob: demo.drumsBlob,
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
        bass: {
          ...prev.bass,
          url: demo.bassUrl,
          blob: demo.bassBlob,
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
        other: {
          ...prev.other,
          url: demo.otherUrl,
          blob: demo.otherBlob,
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
      }));
      setStatus("complete");
      setIsDemo(true);
      setFileName("Sample Groove (Am - F - C - G)");
      setActivePreset("full");
    }).catch((err) => {
      console.warn("Could not generate 4-track demo audio:", err);
    });

    return () => {
      active = false;
      if (xhrRef.current) xhrRef.current.abort();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // 2. Synchronize Volume, Solo, and Mute for all 4 Stems
  useEffect(() => {
    const audioElements: Record<StemId, HTMLAudioElement | null> = {
      vocals: vocalsAudioRef.current,
      drums: drumsAudioRef.current,
      bass: bassAudioRef.current,
      other: otherAudioRef.current,
    };

    const hasAnySolo = Object.values(tracks).some((t) => t.isSolo);

    (Object.keys(tracks) as StemId[]).forEach((id) => {
      const audio = audioElements[id];
      const track = tracks[id];
      if (!audio) return;

      const isSilenced = track.isMuted || (hasAnySolo && !track.isSolo);
      audio.volume = isSilenced ? 0 : Math.max(0, Math.min(1, track.volume));
    });
  }, [tracks]);

  // 3. Robust Master Timeline & 60FPS RAF Playhead Loop
  useEffect(() => {
    const master = vocalsAudioRef.current || drumsAudioRef.current;
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
        const audios = [
          vocalsAudioRef.current,
          drumsAudioRef.current,
          bassAudioRef.current,
          otherAudioRef.current,
        ].filter(Boolean) as HTMLAudioElement[];
        audios.forEach((a) => a.play().catch(() => {}));
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
  }, [tracks.vocals.url, tracks.drums.url, isLooping]);

  // Smooth 60FPS Playhead & Waveform Animation
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const tick = () => {
      const master = vocalsAudioRef.current || drumsAudioRef.current;
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

  // Toggle Master Play / Pause across all 4 Stems
  const togglePlay = () => {
    const audios = [
      vocalsAudioRef.current,
      drumsAudioRef.current,
      bassAudioRef.current,
      otherAudioRef.current,
    ].filter(Boolean) as HTMLAudioElement[];

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

  // Seek Playhead across all 4 Stems
  const handleSeek = (newTime: number) => {
    const safeTime = Math.max(0, Math.min(duration || 12, newTime));
    setCurrentTime(safeTime);
    [vocalsAudioRef, drumsAudioRef, bassAudioRef, otherAudioRef].forEach((ref) => {
      if (ref.current) ref.current.currentTime = safeTime;
    });
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

  // Individual Track Controls
  const handleVolumeChange = (id: StemId, val: number) => {
    setActivePreset("custom");
    setTracks((prev) => ({
      ...prev,
      [id]: { ...prev[id], volume: val, isMuted: val === 0 },
    }));
  };

  const toggleMute = (id: StemId) => {
    setActivePreset("custom");
    setTracks((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMuted: !prev[id].isMuted },
    }));
  };

  const toggleSolo = (id: StemId) => {
    setActivePreset("custom");
    setTracks((prev) => {
      const currentSolo = prev[id].isSolo;
      const updated = { ...prev };
      // Toggle solo off, or solo this track and unsolo others
      (Object.keys(updated) as StemId[]).forEach((key) => {
        updated[key] = {
          ...updated[key],
          isSolo: key === id ? !currentSolo : false,
        };
      });
      return updated;
    });
  };

  // 1-Tap Presets (Clean English, Authentic Icons)
  const applyPreset = (preset: "drums" | "rhythm" | "backing" | "vocals" | "full") => {
    setActivePreset(preset);

    if (preset === "drums") {
      // Drums Only
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 0, isMuted: true, isSolo: false },
        drums: { ...prev.drums, volume: 1.0, isMuted: false, isSolo: true },
        bass: { ...prev.bass, volume: 0, isMuted: true, isSolo: false },
        other: { ...prev.other, volume: 0, isMuted: true, isSolo: false },
      }));
    } else if (preset === "rhythm") {
      // Bass & Drums (Rhythm Section)
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 0, isMuted: true, isSolo: false },
        drums: { ...prev.drums, volume: 1.0, isMuted: false, isSolo: false },
        bass: { ...prev.bass, volume: 1.0, isMuted: false, isSolo: false },
        other: { ...prev.other, volume: 0, isMuted: true, isSolo: false },
      }));
    } else if (preset === "backing") {
      // Backing Track (No Vocals)
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 0, isMuted: true, isSolo: false },
        drums: { ...prev.drums, volume: 1.0, isMuted: false, isSolo: false },
        bass: { ...prev.bass, volume: 1.0, isMuted: false, isSolo: false },
        other: { ...prev.other, volume: 1.0, isMuted: false, isSolo: false },
      }));
    } else if (preset === "vocals") {
      // Vocals Only (Acapella)
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 1.0, isMuted: false, isSolo: true },
        drums: { ...prev.drums, volume: 0, isMuted: true, isSolo: false },
        bass: { ...prev.bass, volume: 0, isMuted: true, isSolo: false },
        other: { ...prev.other, volume: 0, isMuted: true, isSolo: false },
      }));
    } else if (preset === "full") {
      // Full Mix (All 4 tracks active)
      setTracks((prev) => ({
        vocals: { ...prev.vocals, volume: 1.0, isMuted: false, isSolo: false },
        drums: { ...prev.drums, volume: 1.0, isMuted: false, isSolo: false },
        bass: { ...prev.bass, volume: 1.0, isMuted: false, isSolo: false },
        other: { ...prev.other, volume: 1.0, isMuted: false, isSolo: false },
      }));
    }
  };

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const picked = acceptedFiles[0];

    // Cleanup previous source preview
    if (sourceUrl && !isDemo) {
      URL.revokeObjectURL(sourceUrl);
    }

    const objectUrl = URL.createObjectURL(picked);
    setFile(picked);
    setSourceUrl(objectUrl);
    setFileName(picked.name);
    setStatus("ready");
    setErrorMessage(null);
    setIsPlaying(false);
    setIsSourcePlaying(false);
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

  // Toggle Source Audio preview
  const toggleSourcePlay = () => {
    if (!sourceAudioRef.current) return;
    if (isSourcePlaying) {
      sourceAudioRef.current.pause();
      setIsSourcePlaying(false);
    } else {
      // Pause stems if playing
      if (isPlaying) togglePlay();
      sourceAudioRef.current.play()
        .then(() => setIsSourcePlaying(true))
        .catch(() => setIsSourcePlaying(false));
    }
  };

  // Load Demo Song
  const handleLoadDemo = async () => {
    setIsPlaying(false);
    try {
      const demo = await generateFourTrackDemoStems();
      setDuration(demo.duration);
      setTracks((prev) => ({
        vocals: {
          ...prev.vocals,
          url: demo.vocalsUrl,
          blob: demo.vocalsBlob,
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
        drums: {
          ...prev.drums,
          url: demo.drumsUrl,
          blob: demo.drumsBlob,
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
        bass: {
          ...prev.bass,
          url: demo.bassUrl,
          blob: demo.bassBlob,
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
        other: {
          ...prev.other,
          url: demo.otherUrl,
          blob: demo.otherBlob,
          volume: 1.0,
          isMuted: false,
          isSolo: false,
        },
      }));
      setIsDemo(true);
      setFile(null);
      setSourceUrl(null);
      setFileName("Sample Groove (Am - F - C - G)");
      setStatus("complete");
      setActivePreset("full");
      showToast("Sample track ready to play");
    } catch {
      setStatus("error");
      setErrorMessage("Could not load sample audio.");
    }
  };

  // Run AI 4-Track Separation with Real-Time Dynamic Progress (Standard 4)
  const handleProcessAudio = async () => {
    if (!file) return;

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
          setProcessingStage(`Uploading song (${uploadPct}%) • ${formatBytes(e.loaded)} of ${formatBytes(e.total)}`);
        }
      };

      // 2. Upload Finished -> Start continuous dynamic separation stages (35% to 99%)
      xhr.upload.onload = () => {
        setProgress(35);
        setProcessingStage("Analyzing song frequencies and layers...");

        let currentProgress = 35;
        progressTimerRef.current = setInterval(() => {
          let step = 0.45;
          if (currentProgress < 50) {
            step = 0.6;
            setProcessingStage("Isolating singing vocal melodies...");
          } else if (currentProgress < 70) {
            step = 0.4;
            setProcessingStage("Extracting drum beats and percussion...");
          } else if (currentProgress < 85) {
            step = 0.25;
            setProcessingStage("Separating basslines and instruments...");
          } else if (currentProgress < 95) {
            step = 0.12;
            setProcessingStage("Finalizing all 4 high-quality tracks...");
          } else if (currentProgress < 99) {
            step = 0.04; // Smooth asymptotic crawl, never freezes!
            setProcessingStage("Preparing your 4-track studio console...");
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
            const dTrack = outputTracks.find((t: { id: string }) => t.id === "drums") || outputTracks[1];
            const bTrack = outputTracks.find((t: { id: string }) => t.id === "bass") || outputTracks[2] || outputTracks[1];
            const oTrack = outputTracks.find((t: { id: string }) => t.id === "other") || outputTracks[3] || outputTracks[0];

            setProgress(100);
            setProcessingStage("Separation complete! Loading 4 tracks...");

            setTimeout(() => {
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              setTracks((prev) => ({
                vocals: {
                  ...prev.vocals,
                  url: vTrack.url,
                  fileName: vTrack.fileName || `${baseName}-vocals.mp3`,
                  volume: 1.0,
                  isMuted: false,
                  isSolo: false,
                },
                drums: {
                  ...prev.drums,
                  url: dTrack.url,
                  fileName: dTrack.fileName || `${baseName}-drums.mp3`,
                  volume: 1.0,
                  isMuted: false,
                  isSolo: false,
                },
                bass: {
                  ...prev.bass,
                  url: bTrack.url,
                  fileName: bTrack.fileName || `${baseName}-bass.mp3`,
                  volume: 1.0,
                  isMuted: false,
                  isSolo: false,
                },
                other: {
                  ...prev.other,
                  url: oTrack.url,
                  fileName: oTrack.fileName || `${baseName}-instruments.mp3`,
                  volume: 1.0,
                  isMuted: false,
                  isSolo: false,
                },
              }));

              setStatus("complete");
              setActivePreset("full");
              showToast("4 tracks separated cleanly!");
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
            setErrorMessage(errJson.error || "Could not split this song. Please try another audio file.");
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
        setErrorMessage("Network error occurred during audio separation.");
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

      xhr.open("POST", "/api/tools/audio/stem-splitter");
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

  // Download Single Track
  const handleDownloadTrack = (track: StemTrackItem) => {
    const a = document.createElement("a");
    a.href = track.url;
    a.download = track.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast(`Downloading ${track.name}...`);
  };

  // Download All 4 Tracks as ZIP
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const fetchPromises = (Object.values(tracks) as StemTrackItem[]).map(async (t) => {
        let blob = t.blob;
        if (!blob && t.url) {
          const res = await fetch(t.url);
          blob = await res.blob();
        }
        if (blob) {
          zip.file(t.fileName, blob);
        }
      });

      await Promise.all(fetchPromises);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, "")}-4-tracks.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showToast("Downloaded all 4 tracks as ZIP");
    } catch {
      showToast("Download failed. Please try saving individual tracks.");
    } finally {
      setIsZipping(false);
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
      {/* Hidden Audio Elements for the 4 synchronized stems */}
      {tracks.vocals.url && (
        <audio
          ref={vocalsAudioRef}
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
      {tracks.drums.url && (
        <audio
          ref={drumsAudioRef}
          src={tracks.drums.url}
          preload="auto"
          loop={isLooping}
        />
      )}
      {tracks.bass.url && (
        <audio
          ref={bassAudioRef}
          src={tracks.bass.url}
          preload="auto"
          loop={isLooping}
        />
      )}
      {tracks.other.url && (
        <audio
          ref={otherAudioRef}
          src={tracks.other.url}
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

      {/* MAIN OBSIDIAN CYBER WORKSPACE CARD (Signature Category Pink Theme) */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border-2 border-pink-500/35 bg-[#090a12]/95 shadow-[0_20px_70px_rgba(0,0,0,0.7),0_0_35px_rgba(236,72,153,0.12)] backdrop-blur-2xl">
        {/* Subtle dot matrix texture & neon radial auras */}
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(236,72,153,0.15)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-pink-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px]" />

        {/* WORKSPACE TOP BAR */}
        <div className="relative border-b border-white/[0.08] px-4 py-4 sm:px-7 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Squircle Icon with Spinning Conic Neon Pink Ring */}
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0e101d] border border-white/10 shadow-lg group">
              <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,transparent_0%,rgba(236,72,153,0.8)_30%,transparent_60%)] animate-[spin_6s_linear_infinite]" />
              <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#0a0b14]" />
              <Sliders className="relative size-5 text-pink-300 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
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
              <Layers size={13} className="text-pink-400" />
              <span>4 Stems: Vocals, Drums, Bass, Instruments</span>
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
                      {formatBytes(file.size)} • Ready to split into 4 tracks
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Drop your song here
                    </p>
                    <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      Split any song into 4 clean individual tracks: Vocals, Drums, Bass, and Instruments.
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

                  {/* Primary Action Button (Category Pink Glow) */}
                  <div>
                    <button
                      type="button"
                      onClick={handleProcessAudio}
                      disabled={status === "processing"}
                      className="w-full min-h-12 flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(236,72,153,0.35)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Layers size={16} />
                      <span>
                        {status === "processing" ? "Splitting Song..." : "Split into 4 Tracks"}
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
                      <Layers size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white">4-Track Isolation</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Upload any song to split it into 4 dedicated audio stems: singing vocals, drum beats, basslines, and melody instruments.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleLoadDemo}
                      className="w-full min-h-11 flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <Music2 size={14} className="text-pink-400" />
                      <span>Try Sample Groove</span>
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
                    High-quality AI 4-track separation in progress
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

          {/* 3. 4-TRACK MASTER MIXER & TIMELINE */}
          {status === "complete" && (
            <div className="space-y-6 pt-2">
              {/* MASTER CONTROLS & TIMELINE CARD */}
              <div className="rounded-2xl border border-white/10 bg-[#0c0d18] p-4 sm:p-6 space-y-4">
                {/* 1-Tap Quick Listening Presets */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Sliders size={13} className="text-pink-400" />
                    Instant Presets
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("drums")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                        activePreset === "drums"
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                      )}
                    >
                      <Disc3 size={13} />
                      <span>Drums Only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("rhythm")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                        activePreset === "rhythm"
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                      )}
                    >
                      <Zap size={13} />
                      <span>Bass & Drums</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("backing")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                        activePreset === "backing"
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                      )}
                    >
                      <Music2 size={13} />
                      <span>Backing Track</span>
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
                      onClick={() => applyPreset("full")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                        activePreset === "full"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10"
                      )}
                    >
                      <Headphones size={13} />
                      <span>Full Mix</span>
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
                      handleSeek(ratio * (duration || 12));
                    }}
                    className="relative flex items-center justify-between gap-1 h-10 px-4 py-1.5 rounded-xl bg-black/60 border border-white/10 flex-1 max-w-md w-full overflow-hidden cursor-pointer group select-none shadow-inner"
                    title="Click anywhere to seek"
                  >
                    {/* Laser Playhead Needle */}
                    <div
                      className="absolute top-1 bottom-1 w-[2px] bg-white shadow-[0_0_10px_2px_#ec4899] pointer-events-none z-10 transition-none"
                      style={{
                        left: `${Math.min(99.5, Math.max(0.5, ((currentTime / (duration || 12)) * 100)))}%`,
                      }}
                    >
                      <div className="absolute -top-1 -left-1 size-2 rounded-full bg-pink-300 shadow-[0_0_8px_#ffffff]" />
                    </div>

                    {visualizerBars.map((baseH, idx) => {
                      const barRatio = idx / visualizerBars.length;
                      const progressRatio = duration > 0 ? currentTime / duration : 0;
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
                              ? "bg-gradient-to-t from-pink-500 via-rose-400 to-cyan-300 shadow-[0_0_8px_rgba(236,72,153,0.7)] opacity-100"
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
                      max={duration || 12}
                      step={0.01}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none bg-white/10 accent-pink-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4 INDEPENDENT STEM FADER STRIPS */}
              <div className="grid gap-4 md:grid-cols-2">
                {(Object.values(tracks) as StemTrackItem[]).map((track) => {
                  const Icon = track.icon;
                  const isSilenced =
                    track.isMuted ||
                    (Object.values(tracks).some((t) => t.isSolo) && !track.isSolo);

                  return (
                    <div
                      key={track.id}
                      className={cn(
                        "relative overflow-hidden rounded-2xl border bg-[#0b0c16] p-4 sm:p-5 transition-all duration-300",
                        track.color.border,
                        track.color.borderHover,
                        isSilenced ? "opacity-50" : "opacity-100"
                      )}
                    >
                      {/* Stem Header */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "flex size-10 items-center justify-center rounded-xl border transition",
                              track.color.badgeBg,
                              track.color.badgeBorder,
                              track.color.badgeText
                            )}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white tracking-tight">
                                {track.name}
                              </h4>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                  track.color.badgeBg,
                                  track.color.badgeBorder,
                                  track.color.badgeText
                                )}
                              >
                                {track.badge}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 truncate">
                              {track.description}
                            </p>
                          </div>
                        </div>

                        {/* Solo & Mute Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleSolo(track.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer border",
                              track.isSolo
                                ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                                : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/10"
                            )}
                            title={`Solo ${track.name}`}
                          >
                            SOLO
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleMute(track.id)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer border",
                              track.isMuted
                                ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                                : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/10"
                            )}
                            title={`Mute ${track.name}`}
                          >
                            MUTE
                          </button>
                        </div>
                      </div>

                      {/* Volume Slider & Download */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                            {track.isMuted || track.volume === 0 ? (
                              <VolumeX size={14} className="text-zinc-500" />
                            ) : (
                              <Volume2 size={14} className={track.color.badgeText} />
                            )}
                            Volume
                          </span>
                          <span className="font-mono font-bold text-zinc-300">
                            {track.isMuted ? "0%" : `${Math.round(track.volume * 100)}%`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={track.isMuted ? 0 : track.volume}
                            onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                            className={cn(
                              "w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer",
                              track.color.sliderAccent
                            )}
                          />

                          {/* 1-Click Track Download */}
                          <button
                            type="button"
                            onClick={() => handleDownloadTrack(track)}
                            className="shrink-0 size-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                            title={`Download ${track.name} (WAV/MP3)`}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM EXPORT DOCK */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-[#0c0d18]">
                <div>
                  <h4 className="text-sm font-bold text-white">Save Your Separated Tracks</h4>
                  <p className="text-xs text-zinc-400">
                    Download individual audio files or get all 4 stems bundled in a single ZIP archive.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="flex-1 sm:flex-none min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs px-5 shadow-[0_0_20px_rgba(236,72,153,0.35)] transition cursor-pointer disabled:opacity-50"
                  >
                    <FolderArchive size={15} />
                    <span>{isZipping ? "Packing ZIP..." : "Download All 4 Tracks (ZIP)"}</span>
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
