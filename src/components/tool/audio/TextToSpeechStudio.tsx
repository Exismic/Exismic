"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Type,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Sliders,
  Layers,
  Mic2,
  Radio,
  Film,
  Flame,
  Compass,
  Repeat,
  ArrowRight,
  Clock,
  FileText,
  CornerDownLeft,
  X,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  VOICE_PERSONAS,
  type VoicePersona,
  playVoiceSample,
} from "@/lib/tts-audio-generator";

// Quick Sample Script Blueprints
const SCRIPT_BLUEPRINTS = [
  {
    id: "youtube",
    title: "YouTube Intro",
    icon: Film,
    text: "Hey everyone, welcome back to the channel! Today we are exploring the top creative breakthroughs of this year and how they change everything. Make sure to hit subscribe, and let's jump right into it.",
  },
  {
    id: "podcast",
    title: "Podcast Opener",
    icon: Radio,
    text: "Welcome to The Creative Wire. Grab your favorite coffee, take a seat, and join us as we uncover stories, insights, and conversations you won't hear anywhere else.",
  },
  {
    id: "promo",
    title: "Product Promo",
    icon: Flame,
    text: "Meet the next leap in studio software. Faster rendering, expressive natural voices, and zero complicated setup. Built from the ground up to give creators the freedom to build faster.",
  },
  {
    id: "documentary",
    title: "Documentary",
    icon: Compass,
    text: "High above the misty ridge, ancient pine forests stretch into the endless horizon. Here, far removed from modern cities, nature continues to move to a timeless, quiet rhythm.",
  },
];

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function TextToSpeechStudio() {
  // Script Input State
  const [text, setText] = useState<string>(
    "Welcome to Exismic Studio. Turn your scripts and ideas into expressive, studio-quality voiceovers in seconds."
  );
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>(VOICE_PERSONAS[0]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const stopVoicePreviewRef = useRef<(() => void) | null>(null);

  // Friendly Sound Settings (Zero Tech Jargon)
  const [voiceConsistency, setVoiceConsistency] = useState<number>(0.5); // Stability
  const [voiceClarity, setVoiceClarity] = useState<number>(0.75); // Similarity boost
  const [expressiveness, setExpressiveness] = useState<number>(0.2); // Style
  const [speakingSpeed, setSpeakingSpeed] = useState<number>(1.0); // 0.85x, 1.0x, 1.15x, 1.25x

  // Generation & Processing State (Standard 4)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("Analyzing script...");
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Audio Playback & Output State
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(6.5);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Metrics
  const charCount = text.length;
  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [text]);
  const estimatedSeconds = useMemo(() => {
    return Math.max(1, Math.round((wordCount * 0.38) / Math.max(0.5, speakingSpeed)));
  }, [wordCount, speakingSpeed]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Clean up any playing audio / speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (stopVoicePreviewRef.current) stopVoicePreviewRef.current();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  // 60FPS RAF Loop for buttery smooth playhead motion
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const updateLoop = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        }
        animFrameRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Sync playback rate with speakingSpeed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speakingSpeed;
    }
  }, [speakingSpeed, resultUrl]);

  // Voice persona preview
  const handlePreviewVoice = (persona: VoicePersona, e: React.MouseEvent) => {
    e.stopPropagation();

    if (previewingVoiceId === persona.id) {
      if (stopVoicePreviewRef.current) stopVoicePreviewRef.current();
      setPreviewingVoiceId(null);
      return;
    }

    if (stopVoicePreviewRef.current) stopVoicePreviewRef.current();
    setPreviewingVoiceId(persona.id);

    stopVoicePreviewRef.current = playVoiceSample(
      persona,
      () => setPreviewingVoiceId(persona.id),
      () => setPreviewingVoiceId(null)
    );
  };

  // Generate Voiceover with Standard 4 Dynamic Progress
  const handleGenerate = async () => {
    if (!text.trim()) return;

    // Stop previews
    if (stopVoicePreviewRef.current) {
      stopVoicePreviewRef.current();
      setPreviewingVoiceId(null);
    }
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setIsProcessing(true);
    setProgress(4);
    setElapsed(0);
    setProcessingStage("Analyzing script structure and pacing...");

    // Start elapsed timer
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    const startTime = Date.now();
    elapsedTimerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Dynamic asymptotic ticker
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          setProcessingStage("Analyzing script structure and pacing...");
          return Math.min(30, prev + 3.5);
        } else if (prev < 65) {
          setProcessingStage(`Synthesizing ${selectedVoice.name}'s voice tone...`);
          return Math.min(65, prev + 2.2);
        } else if (prev < 88) {
          setProcessingStage("Balancing speech clarity and natural inflection...");
          return Math.min(88, prev + 1.2);
        } else if (prev < 98) {
          setProcessingStage("Finalizing studio master audio...");
          return Math.min(98, prev + 0.4);
        }
        return prev;
      });
    }, 120);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Step 1: Call Cloud TTS API
      const response = await fetch("/api/tools/audio/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          text: text.trim(),
          voice_id: selectedVoice.id,
          settings: {
            stability: voiceConsistency,
            similarity_boost: voiceClarity,
            style: expressiveness,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Voice synthesis failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Snap to 100% completion
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      setProgress(100);
      setProcessingStage("Voiceover generated successfully!");

      setTimeout(() => {
        setResultBlob(blob);
        setResultUrl(url);
        setIsProcessing(false);
        setCurrentTime(0);
        showToast("Voiceover ready to play");
      }, 400);
    } catch (err: unknown) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      setIsProcessing(false);

      if (controller.signal.aborted) {
        showToast("Generation cancelled");
        return;
      }

      const message = err instanceof Error ? err.message : "Could not synthesize audio. Please try again.";
      showToast(message);
    }
  };

  // Abort processing
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setIsProcessing(false);
    setProgress(0);
    showToast("Generation cancelled");
  };

  // Toggle play/pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Waveform seek
  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(duration, newTime));
    setCurrentTime(clamped);
    if (audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  };

  // Download audio
  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const safeName = text.slice(0, 24).toLowerCase().replace(/[^a-z0-9]/g, "-") || "voiceover";
    a.download = `${selectedVoice.title.toLowerCase().replace(/\s+/g, "-")}-${safeName}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Downloading audio...");
  };

  // Save to Cloud Vault
  const handleSaveToVault = () => {
    try {
      const existing = JSON.parse(localStorage.getItem("exismic_vault_files") || "[]");
      existing.unshift({
        id: `tts-${Date.now()}`,
        name: `${selectedVoice.title} Voiceover (${wordCount} words)`,
        type: "audio",
        createdAt: new Date().toISOString(),
        folder: "Voiceovers",
      });
      localStorage.setItem("exismic_vault_files", JSON.stringify(existing.slice(0, 50)));
      showToast("Saved to Cloud Vault");
    } catch {
      showToast("Saved to your files");
    }
  };

  // Copy script
  const handleCopyScript = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast("Script copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Pre-generate dynamic visualizer bars (54 bars)
  const visualizerBars = useMemo(() => {
    return Array.from({ length: 54 }, (_, i) => {
      const phase = (i / 54) * Math.PI * 3.5;
      const height = Math.abs(Math.sin(phase) * 0.65 + Math.cos(phase * 1.8) * 0.35);
      return Math.max(0.12, Math.min(0.96, height));
    });
  }, []);

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6">
      {/* Hidden Audio Element with robust event handlers */}
      {resultUrl && (
        <audio
          ref={audioRef}
          src={resultUrl}
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
              setCurrentTime(0);
            }
          }}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 rounded-2xl bg-[#0e101d] border border-pink-500/40 px-4 py-3 shadow-[0_10px_40px_rgba(236,72,153,0.3)] flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="size-2 rounded-full bg-pink-400 animate-ping" />
            <span className="text-xs font-bold text-white">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. STUDIO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-widest">
            <Link href="/category/audio" className="hover:underline flex items-center gap-1.5">
              <span>Audio & Music Tools</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">Text to Speech Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
              <Type size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Text to</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400">
                  Speech Studio
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Turn scripts into expressive, natural voiceovers for videos, podcasts, and presentations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5">
            <Mic2 size={13} />
            <span>6 Natural Voices</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-bold flex items-center gap-1.5">
            <Clock size={13} />
            <span>Instant Preview</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="rounded-[2.5rem] border-2 border-pink-500/35 bg-[#090a12] p-5 sm:p-7 shadow-[0_0_60px_rgba(236,72,153,0.12)] relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative space-y-6">
          {/* SCRIPT BLUEPRINTS (1-Click Templates) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <FileText size={13} />
                <span>Instant Script Templates</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Click to load into editor</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SCRIPT_BLUEPRINTS.map((bp) => {
                const IconComponent = bp.icon;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => setText(bp.text)}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/40 text-left transition group active:scale-95 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-6 rounded-lg bg-white/[0.05] group-hover:bg-pink-500/20 text-zinc-400 group-hover:text-pink-300 flex items-center justify-center transition">
                        <IconComponent size={13} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-pink-200 transition truncate">
                        {bp.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 group-hover:text-zinc-300">
                      {bp.text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DUAL WORKSPACE COLUMNS: EDITOR + VOICE CONTROLS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: SCRIPT TEXT EDITOR (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-5 shadow-inner relative group focus-within:border-pink-500/50 transition">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Your Script</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {charCount} / 5,000 chars
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      disabled={!text.trim()}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setText("")}
                      disabled={!text.trim()}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-[11px] font-bold text-zinc-300 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <RotateCcw size={12} />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste what you want the voice to say here..."
                  maxLength={5000}
                  rows={8}
                  className="w-full bg-transparent text-white placeholder-zinc-600 text-sm sm:text-base leading-relaxed resize-none focus:outline-none"
                />

                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                    <span className="font-semibold text-zinc-300">{wordCount} words</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-pink-400 font-semibold">
                      <Clock size={12} />
                      <span>~{estimatedSeconds}s audio</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <CornerDownLeft size={11} />
                    <span>Punctuate with commas for natural breath pauses</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!text.trim() || isProcessing}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white flex items-center justify-center gap-3 shadow-lg transition active:scale-98 cursor-pointer",
                  !text.trim() || isProcessing
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                    : "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:via-rose-400 hover:to-purple-500 border border-pink-400/40 shadow-[0_0_25px_rgba(236,72,153,0.35)]"
                )}
              >
                <Volume2 size={18} />
                <span>{isProcessing ? "Synthesizing Speech..." : "Generate Voiceover"}</span>
              </button>
            </div>

            {/* RIGHT COLUMN: VOICE PERSONAS & SOUND CONTROLS (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              {/* VOICE PERSONA SELECTOR */}
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Mic2 size={13} />
                    <span>Choose Voice Persona</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Preview with 1-click</span>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {VOICE_PERSONAS.map((persona) => {
                    const isSelected = selectedVoice.id === persona.id;
                    const isPreviewing = previewingVoiceId === persona.id;

                    return (
                      <div
                        key={persona.id}
                        onClick={() => setSelectedVoice(persona)}
                        className={cn(
                          "p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer",
                          isSelected
                            ? "bg-pink-500/15 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                            : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              "size-9 rounded-xl flex items-center justify-center shrink-0 transition",
                              isSelected
                                ? "bg-pink-500 text-white shadow-md"
                                : "bg-white/[0.06] text-zinc-400"
                            )}
                          >
                            <Mic2 size={15} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-white truncate">{persona.title}</p>
                              <span
                                className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 uppercase tracking-tight",
                                  isSelected
                                    ? "bg-pink-500/30 text-pink-200"
                                    : "bg-white/[0.05] text-zinc-400"
                                )}
                              >
                                {persona.styleTag}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate">{persona.bestFor}</p>
                          </div>
                        </div>

                        {/* 1-Click Preview Button */}
                        <button
                          type="button"
                          onClick={(e) => handlePreviewVoice(persona, e)}
                          className={cn(
                            "size-8 rounded-xl border flex items-center justify-center shrink-0 transition active:scale-95 cursor-pointer",
                            isPreviewing
                              ? "bg-pink-500 text-white border-pink-400 shadow-md animate-pulse"
                              : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                          )}
                          title="Listen to sample audio"
                        >
                          {isPreviewing ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SOUND CONTROLS (ZERO TECH JARGON) */}
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Sliders size={13} />
                    <span>Sound Controls</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Everyday plain English</span>
                </div>

                {/* Voice Consistency Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Voice Consistency</span>
                    <span className="font-mono text-[11px] text-pink-400 font-bold">
                      {Math.round(voiceConsistency * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={voiceConsistency}
                    onChange={(e) => setVoiceConsistency(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full bg-white/10 accent-pink-500 cursor-pointer appearance-none focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-tight">
                    <span>Natural Variation</span>
                    <span>Steady & Measured</span>
                  </div>
                </div>

                {/* Voice Clarity Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Voice Clarity & Warmth</span>
                    <span className="font-mono text-[11px] text-pink-400 font-bold">
                      {Math.round(voiceClarity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={voiceClarity}
                    onChange={(e) => setVoiceClarity(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full bg-white/10 accent-pink-500 cursor-pointer appearance-none focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-tight">
                    <span>Warm & Soft</span>
                    <span>Crisp Studio</span>
                  </div>
                </div>

                {/* Expressiveness Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Expressiveness</span>
                    <span className="font-mono text-[11px] text-pink-400 font-bold">
                      {Math.round(expressiveness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={expressiveness}
                    onChange={(e) => setExpressiveness(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full bg-white/10 accent-pink-500 cursor-pointer appearance-none focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-tight">
                    <span>Calm & Subtle</span>
                    <span>Vivid & Dramatic</span>
                  </div>
                </div>

                {/* Speaking Pace Multiplier */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Speaking Pace</span>
                    <span className="font-mono text-[11px] text-pink-400 font-bold">
                      {speakingSpeed}x
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "0.85x", val: 0.85 },
                      { label: "1.0x", val: 1.0 },
                      { label: "1.15x", val: 1.15 },
                      { label: "1.25x", val: 1.25 },
                    ].map((sp) => (
                      <button
                        key={sp.label}
                        type="button"
                        onClick={() => setSpeakingSpeed(sp.val)}
                        className={cn(
                          "py-1 rounded-xl text-[11px] font-bold transition border cursor-pointer",
                          speakingSpeed === sp.val
                            ? "bg-pink-500/20 border-pink-500/50 text-pink-200"
                            : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white"
                        )}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC PROCESSING MODAL (STANDARD 4) */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-3xl border-2 border-pink-500/50 bg-[#0c0e18] p-8 sm:p-10 shadow-[0_0_50px_rgba(236,72,153,0.25)] space-y-6 text-center"
              >
                <div className="relative mx-auto size-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-pink-500/20" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="size-16 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-400">
                    <Volume2 size={28} className="animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Generating Voiceover...
                  </h3>
                  <p className="text-xs sm:text-sm text-pink-300/90 font-medium">
                    {processingStage}
                  </p>
                </div>

                {/* CONTINUOUS HIGH-FREQUENCY PROGRESS BAR */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                    <span>Synthesis Progress</span>
                    <span className="text-pink-400 font-mono text-sm">{Math.round(progress)}%</span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-white/5 border border-white/10 p-0.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                      style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>{elapsed}s elapsed</span>
                    <button
                      type="button"
                      onClick={handleCancelGeneration}
                      className="text-zinc-400 hover:text-rose-400 transition font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. MASTER SPEECH PLAYER & WAVEFORM (SHOWN WHEN RESULT IS READY) */}
          {resultUrl && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border-2 border-pink-500/40 bg-[#0c0e18] p-5 sm:p-7 space-y-6 shadow-[0_0_40px_rgba(236,72,153,0.18)]"
            >
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Headphones size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedVoice.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
                        {selectedVoice.styleTag}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 italic line-clamp-1">
                      &ldquo;{text}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download MP3</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    className="size-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    title="Save to Cloud Vault"
                  >
                    <Layers size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResultUrl(null);
                      setResultBlob(null);
                      setIsPlaying(false);
                    }}
                    className="size-9 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition cursor-pointer"
                    title="Create another voiceover"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* INTERACTIVE 60FPS WAVEFORM & PLAYHEAD */}
              <div className="space-y-2">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                    handleSeek(ratio * duration);
                  }}
                  className="relative h-20 w-full rounded-2xl bg-black/40 border border-white/10 p-3 flex items-center justify-between gap-1 cursor-pointer select-none group overflow-hidden"
                >
                  {/* Dynamic Frequency Bars */}
                  {visualizerBars.map((bar, idx) => {
                    const barProgress = idx / visualizerBars.length;
                    const isPlayed = barProgress <= progressRatio;
                    const liveHeight = isPlaying
                      ? Math.min(1, bar * (0.7 + Math.sin(idx * 0.4 + currentTime * 8) * 0.3))
                      : bar;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex items-center justify-center h-full"
                      >
                        <div
                          style={{ height: `${Math.round(liveHeight * 100)}%` }}
                          className={cn(
                            "w-full rounded-full transition-all duration-75",
                            isPlayed
                              ? "bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.7)]"
                              : "bg-white/15 group-hover:bg-white/25"
                          )}
                        />
                      </div>
                    );
                  })}

                  {/* Laser Playhead Needle */}
                  <div
                    style={{ left: `${progressRatio * 100}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_2px_#ec4899] pointer-events-none transition-all duration-75 z-10"
                  >
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full bg-white shadow-[0_0_8px_#ec4899]" />
                  </div>
                </div>

                {/* Time Display */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                  <span className="text-pink-400 font-bold">{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* PLAYER CONTROLS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="size-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)] active:scale-95 transition cursor-pointer"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(0)}
                    className="size-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                      isLooping
                        ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                        : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    <Repeat size={13} />
                    <span>{isLooping ? "Looping" : "Play Once"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-bold">Speed:</span>
                  <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-1">
                    {[0.85, 1.0, 1.15, 1.25].map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setSpeakingSpeed(sp)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer",
                          speakingSpeed === sp
                            ? "bg-pink-500 text-white"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {sp}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 5. ANAMORPHIC LASER HORIZON DIVIDER (BRIDGING TO GUIDE & OVERVIEW) */}
      <div className="relative py-4">
        {/* Ambient Flare */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-12 bg-pink-500/15 blur-2xl pointer-events-none rounded-full" />
        {/* Laser Hairline */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_12px_rgba(236,72,153,0.8)]" />
        {/* Specular White Needle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.5px] w-1/3 bg-gradient-to-r from-transparent via-white to-transparent" />
        {/* Cyber Core Jewel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full bg-white shadow-[0_0_10px_2px_#ec4899]" />
      </div>

      {/* 6. GUIDE & OVERVIEW (PLAIN EVERYDAY ENGLISH) */}
      <div className="rounded-3xl border border-white/10 bg-[#090a12] p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>How to Create</span>
            <span className="text-pink-400">Realistic Voiceovers</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Simple steps and creator tips to get human-sounding speech every time.
          </p>
        </div>

        {/* 3 Step Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="size-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 font-black text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Write or Paste Your Script</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter your script or choose one of our 1-click templates for YouTube, podcasts, or product promos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="size-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 font-black text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Select a Voice Persona</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Listen to instant samples to pick the right voice tone—from deep documentary narration to upbeat creator energy.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="size-8 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Generate & Download</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Listen with our interactive waveform player, adjust playback speed, and download clean MP3 audio for your project.
            </p>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="p-5 rounded-2xl bg-pink-500/[0.04] border border-pink-500/20 space-y-3">
          <h4 className="text-sm font-bold text-pink-200 flex items-center gap-2">
            <Mic2 size={15} />
            <span>Pro Tips for Natural-Sounding Speech</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-pink-400 font-bold">•</span>
              <span><strong>Use commas for pauses:</strong> Commas create natural breathing pauses that sound like a real person talking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400 font-bold">•</span>
              <span><strong>Use ellipses for suspense:</strong> Three dots (...) create a longer, dramatic hesitation before the next word.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400 font-bold">•</span>
              <span><strong>Spell out acronyms:</strong> Write &ldquo;A.I.&rdquo; or &ldquo;U.S.A.&rdquo; with periods so the voice pronounces each letter clearly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400 font-bold">•</span>
              <span><strong>Adjust pacing:</strong> Use 1.15x speed for social media shorts or 0.85x for relaxing storytelling.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
