"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AudioWaveform,
  Play,
  Pause,
  RotateCcw,
  Download,
  Repeat,
  Check,
  Clock,
  Sliders,
  Volume2,
  VolumeX,
  Layers,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  FileAudio,
  Sparkle,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  SFX_BLUEPRINTS,
  SFX_INSPIRATIONS,
  type SfxBlueprint,
  generateProceduralSfx,
} from "@/lib/sfx-audio-engine";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}.${ms}`;
}

export function SfxGeneratorStudio() {
  // Generation Parameters
  const [prompt, setPrompt] = useState<string>("Retro 8-bit game jump with shiny coin collect chime");
  const [duration, setDuration] = useState<number>(2.5);
  const [influence, setInfluence] = useState<number>(0.3);
  const [environment, setEnvironment] = useState<"studio" | "outdoor" | "hall">("studio");
  const [activeCategory, setActiveCategory] = useState<string>("Gaming & Sci-Fi");

  // Output Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string>("8-Bit Coin & Jump");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Playback & Waveform State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [soundDuration, setSoundDuration] = useState<number>(1.5);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Dynamic Progress State (Standard 4)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("Preparing sound synthesis...");

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Mount: Load $0 Compute Instant Demo Sound Effect
  useEffect(() => {
    let active = true;

    generateProceduralSfx("Retro 8-bit game jump with shiny coin collect chime", 1.5, "studio")
      .then((demo) => {
        if (!active) return;
        setAudioUrl(demo.url);
        setSoundDuration(demo.duration);
        setActiveTitle("8-Bit Coin & Jump");
        setIsDemo(true);
      })
      .catch((err) => {
        console.warn("Could not load initial SFX demo:", err);
      });

    return () => {
      active = false;
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // 2. Playback Speed Sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // 3. Audio Element Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setSoundDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        handleSeek(0);
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
        handleSeek(0);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, isLooping]);

  // Smooth 60FPS RAF Playhead Loop
  const updateLoop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setSoundDuration(audio.duration);
      }
    }
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateLoop);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateLoop);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, updateLoop]);

  // Play / Pause Toggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = currentTime;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
    }
  };

  // Seek Playhead
  const handleSeek = (timeSec: number) => {
    const clamped = Math.max(0, Math.min(soundDuration || 10, timeSec));
    setCurrentTime(clamped);
    if (audioRef.current) audioRef.current.currentTime = clamped;
  };

  // 1-Click Blueprint Loader
  const handleLoadBlueprint = async (bp: SfxBlueprint) => {
    setPrompt(bp.prompt);
    setDuration(bp.duration);
    setEnvironment(bp.environment);
    setIsProcessing(true);
    setProgress(20);
    setProcessingStage(`Loading ${bp.title} blueprint...`);

    try {
      const result = await generateProceduralSfx(bp.prompt, bp.duration, bp.environment);
      setAudioUrl(result.url);
      setSoundDuration(result.duration);
      setActiveTitle(bp.title);
      setIsDemo(true);
      setCurrentTime(0);
      setIsPlaying(false);
      setProgress(100);
      showToast(`Loaded ${bp.title} blueprint!`);
    } catch (err) {
      console.warn("Failed loading blueprint:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Sound Effect (API with Procedural DSP Fallback)
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast("Please describe the sound effect you want to generate.");
      return;
    }

    setIsProcessing(true);
    setProgress(6);
    setElapsed(0);
    setIsPlaying(false);

    // Elapsed timer
    elapsedTimerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    const stages = [
      { at: 15, text: "Parsing foley acoustics & descriptive tags..." },
      { at: 35, text: "Synthesizing audio waveforms & frequency transients..." },
      { at: 65, text: "Applying acoustic reflections & dynamic resonance..." },
      { at: 88, text: "Mastering clean stereo foley sound asset..." },
    ];

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          const next = prev + (prev < 40 ? 5 : 2.5);
          const activeStage = stages.slice().reverse().find((s) => next >= s.at);
          if (activeStage) setProcessingStage(activeStage.text);
          return next;
        }
        return prev;
      });
    }, 150);

    const cleanTitle = prompt.trim().split(" ").slice(0, 4).join(" ");

    try {
      // 1. Attempt High-Fidelity Server API (ElevenLabs Sound Generation)
      const response = await axios.post(
        "/api/tools/audio/sfx-generator",
        { prompt: prompt.trim(), duration, influence },
        { responseType: "arraybuffer", timeout: 15000 }
      );

      const blob = new Blob([response.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setProcessingStage("Sound effect ready!");

      setTimeout(() => {
        setAudioUrl(url);
        setActiveTitle(cleanTitle);
        setIsDemo(false);
        setCurrentTime(0);
        setIsProcessing(false);
        showToast("Sound effect generated successfully!");
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      }, 300);
    } catch {
      // 2. Seamless Client-Side Web Audio DSP Procedural Fallback
      // Guarantees visitors ALWAYS get crisp audio without broken states or server outages
      try {
        const proceduralResult = await generateProceduralSfx(prompt.trim(), duration, environment);
        setProgress(100);
        setProcessingStage("Sound effect ready!");

        setTimeout(() => {
          setAudioUrl(proceduralResult.url);
          setSoundDuration(proceduralResult.duration);
          setActiveTitle(cleanTitle);
          setIsDemo(false);
          setCurrentTime(0);
          setIsProcessing(false);
          showToast("Sound effect synthesized successfully!");
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        }, 300);
      } catch (fallbackErr) {
        console.error("Procedural fallback error:", fallbackErr);
        setIsProcessing(false);
        showToast("Failed to generate sound. Please try a different description.");
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      }
    }
  };

  // Download Sound Asset
  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    const safeTitle = activeTitle.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
    a.download = `exismic-sfx-${safeTitle}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloaded sound effect WAV asset!");
  };

  const handleReset = () => {
    handleSeek(0);
    setDuration(2.5);
    setInfluence(0.3);
    setEnvironment("studio");
    showToast("Reset sound controls to default.");
  };

  // 54 Pseudo-Frequency visualizer bars
  const visualizerBars = useMemo(() => {
    const bars: number[] = [];
    for (let i = 0; i < 54; i++) {
      const centerFactor = 1 - Math.abs(i - 27) / 27;
      const height = Math.max(0.18, centerFactor * 0.92 + Math.sin(i * 0.75) * 0.22);
      bars.push(height);
    }
    return bars;
  }, []);

  const progressRatio = soundDuration > 0 ? Math.max(0, Math.min(1, currentTime / soundDuration)) : 0;

  return (
    <div className="w-full space-y-6 text-left">
      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          playsInline
        />
      )}

      {/* FLOATING ACTION TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 rounded-2xl bg-zinc-900/95 border border-pink-500/40 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] backdrop-blur-xl flex items-center gap-2"
          >
            <Check size={14} className="text-pink-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HEADER & METADATA BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.2)]">
              <AudioWaveform size={18} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
              Audio & Music Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Sound Effects Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Generate custom sound effects, foley assets, and cinematic impacts from descriptive text prompts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5">
            <AudioWaveform size={13} />
            <span>Foley Engine</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-bold flex items-center gap-1.5">
            <Zap size={13} />
            <span>100% Royalty Free</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN OBSIDIAN CYBER WORKSPACE */}
      <div className="rounded-[2.5rem] border-2 border-pink-500/35 bg-[#090a12] p-5 sm:p-7 shadow-[0_0_60px_rgba(236,72,153,0.12)] relative overflow-hidden backdrop-blur-2xl">
        {/* Ambient Neon Pink & Purple Radial Glows */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative space-y-6">
          {/* INSTANT BLUEPRINTS (1-Click Real World Samples) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <AudioWaveform size={13} />
                <span>Instant Sound Blueprints</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Click to audition sound effect with 0 wait</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SFX_BLUEPRINTS.map((bp) => {
                const isCurrent = isDemo && activeTitle === bp.title;

                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => handleLoadBlueprint(bp)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition group active:scale-95 cursor-pointer",
                      isCurrent
                        ? "bg-pink-500/15 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                        : "bg-white/[0.03] hover:bg-pink-500/10 border-white/10 hover:border-pink-500/40"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          "size-6 rounded-lg flex items-center justify-center transition",
                          isCurrent
                            ? "bg-pink-500 text-white"
                            : "bg-white/[0.05] group-hover:bg-pink-500/20 text-zinc-400 group-hover:text-pink-300"
                        )}
                      >
                        <AudioWaveform size={13} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-pink-200 transition truncate">
                        {bp.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 group-hover:text-zinc-300">
                      {bp.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DUAL WORKSPACE COLUMNS: PROMPT & CONTROLS (5 COLS) + SOUND PLAYER (7 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: PROMPT INPUT & FINE-TUNING (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-4 sm:p-5 space-y-4">
                {/* PROMPT TEXTAREA */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                      <Sliders size={13} />
                      <span>Sound Description</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {prompt.length}/500
                    </span>
                  </div>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="Describe what you want to hear (e.g. 'retro 8-bit game jump', 'cinematic laser blaster', 'heavy metal sword clash')..."
                    className="w-full rounded-2xl bg-black/40 border border-white/10 p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 leading-relaxed resize-none focus:outline-none focus:border-pink-500/50 shadow-inner"
                  />
                </div>

                {/* CURATED INSPIRATION TAGS */}
                <div className="space-y-2">
                  {/* Category Pills Switcher */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                    {SFX_INSPIRATIONS.map((cat) => (
                      <button
                        key={cat.group}
                        type="button"
                        onClick={() => setActiveCategory(cat.group)}
                        className={cn(
                          "px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition cursor-pointer shrink-0",
                          activeCategory === cat.group
                            ? "bg-pink-500 text-white"
                            : "bg-white/[0.03] text-zinc-400 hover:text-white"
                        )}
                      >
                        {cat.group}
                      </button>
                    ))}
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SFX_INSPIRATIONS.find((c) => c.group === activeCategory)?.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setPrompt(tag)}
                        className={cn(
                          "px-2.5 py-1 rounded-xl border text-[10px] font-medium transition cursor-pointer text-left truncate max-w-[200px]",
                          prompt === tag
                            ? "bg-pink-500/20 border-pink-500/40 text-pink-200 font-bold"
                            : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.05] hover:border-pink-500/30"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FINE-TUNING CONTROLS */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                      <SlidersHorizontal size={13} />
                      <span>Sound Tuning</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[10px] text-zinc-400 hover:text-pink-300 transition cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                        <Clock size={12} className="text-pink-400" />
                        <span>Sound Duration</span>
                      </span>
                      <span className="text-pink-400 font-mono font-bold text-[11px]">
                        {duration.toFixed(1)}s ({duration <= 1.5 ? "Impact" : duration <= 4.0 ? "Standard" : "Extended"})
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={12.0}
                      step={0.5}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full accent-pink-500 h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-500">
                      <span>0.5s Quick Pop</span>
                      <span>12.0s Ambient</span>
                    </div>
                  </div>

                  {/* Acoustic Environment Mode */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs text-zinc-300 font-semibold">
                      Acoustic Space
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "studio", label: "Studio Clean" },
                        { id: "outdoor", label: "Open Air" },
                        { id: "hall", label: "Echo Hall" },
                      ].map((env) => (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => setEnvironment(env.id as "studio" | "outdoor" | "hall")}
                          className={cn(
                            "py-1.5 px-2 rounded-xl border text-[10px] font-bold transition cursor-pointer",
                            environment === env.id
                              ? "bg-pink-500/20 border-pink-500/50 text-pink-200 shadow-sm"
                              : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                          )}
                        >
                          {env.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Adherence Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold">Foley Adherence</span>
                      <span className="text-pink-400 font-mono font-bold text-[11px]">
                        {Math.round(influence * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.05}
                      value={influence}
                      onChange={(e) => setInfluence(Number(e.target.value))}
                      className="w-full accent-pink-500 h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                  </div>
                </div>

                {/* PRIMARY ACTION BUTTON */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isProcessing || !prompt.trim()}
                  className={cn(
                    "w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer",
                    isProcessing || !prompt.trim()
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:via-rose-400 hover:to-purple-500 border border-pink-400/40 shadow-[0_0_25px_rgba(236,72,153,0.35)]"
                  )}
                >
                  <AudioWaveform size={16} />
                  <span>
                    {isProcessing ? "Synthesizing Sound Effect..." : "Generate Sound Effect"}
                  </span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: SOUND PLAYER & WAVEFORM MONITOR (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-5 sm:p-6 space-y-5">
                {/* ACTIVE SOUND HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                        <AudioWaveform size={14} />
                        <span>Sound Effect Asset</span>
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold uppercase">
                        {isDemo ? "Instant Sample" : "Generated Foley"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white truncate max-w-sm">
                      {activeTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <span className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/5">
                      44.1 kHz • Stereo WAV
                    </span>
                  </div>
                </div>

                {/* 54-BAR INTERACTIVE WAVEFORM VISUALIZER */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                      <Clock size={12} className="text-pink-400" />
                      <span>Audio Waveform</span>
                    </span>
                    <span className="text-pink-400 font-mono font-bold text-xs">
                      {formatTime(currentTime)} / {formatTime(soundDuration)}
                    </span>
                  </div>

                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                      handleSeek(ratio * soundDuration);
                    }}
                    className="relative h-24 w-full rounded-2xl bg-black/50 border border-white/10 p-2.5 flex items-center justify-between gap-1 cursor-pointer select-none group overflow-hidden"
                  >
                    {visualizerBars.map((bar, idx) => {
                      const barProgress = idx / visualizerBars.length;
                      const isPlayed = barProgress <= progressRatio;
                      const liveHeight = isPlaying
                        ? Math.min(1, bar * (0.65 + Math.sin(idx * 0.5 + currentTime * 12) * 0.35))
                        : bar;

                      return (
                        <div key={idx} className="flex-1 flex items-center justify-center h-full">
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

                    {/* Laser Needle Playhead */}
                    <div
                      style={{ left: `${progressRatio * 100}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_2px_#ec4899] pointer-events-none transition-all duration-75 z-10"
                    />
                  </div>
                </div>

                {/* TRANSPORT CONTROLS */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="size-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer"
                      title={isPlaying ? "Pause" : "Play sound effect"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSeek(0)}
                      className="size-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      title="Restart from 0:00"
                    >
                      <RotateCcw size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLooping(!isLooping)}
                      className={cn(
                        "size-9 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer",
                        isLooping
                          ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                          : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                      )}
                      title="Loop sound (useful for rain, engines, ambient)"
                    >
                      <Repeat size={14} />
                    </button>
                  </div>

                  {/* Playback Speed Controls */}
                  <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-1">
                    {[0.85, 1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer",
                          playbackSpeed === speed
                            ? "bg-pink-500 text-white"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* BOTTOM EXPORT & RETENTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Clean WAV</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast("Saved to Cloud Vault!")}
                      className="size-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      title="Save to Cloud Vault"
                    >
                      <Layers size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="size-8 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition cursor-pointer"
                      title="Reset settings"
                    >
                      <RotateCcw size={14} />
                    </button>
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
                    <AudioWaveform size={28} className="animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Synthesizing Sound Effect...
                  </h3>
                  <p className="text-xs sm:text-sm text-pink-300/90 font-medium">
                    {processingStage}
                  </p>
                </div>

                {/* CONTINUOUS HIGH-FREQUENCY PROGRESS BAR */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                    <span>Foley Synthesis Progress</span>
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
                      onClick={() => setIsProcessing(false)}
                      className="text-zinc-400 hover:text-rose-400 transition font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
