"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Eraser, 
  Mic2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Wand2, 
  Image as ImageIcon,
  Check,
  RotateCcw,
  Upload,
  Music,
  Copy,
  Download,
  Activity,
  Zap,
  SlidersHorizontal,
  Layers,
  Sparkle,
  Radio,
  Sliders as SlidersIcon,
  RefreshCw,
  Maximize2,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

// Expanded preset prompt options with styles
const PRESET_PROMPTS = [
  {
    title: "Cyber Cat",
    text: "A cyberpunk mechanical cat sitting on a neon-lit server rack, glowing violet eyes, 8k render",
    image: "/generations/sandbox_cat.png",
    style: "Cyberpunk",
    time: "3.8s"
  },
  {
    title: "Crystal Bird",
    text: "An ethereal crystalline hummingbird hovering over a glowing cybernetic flower, raytraced glass",
    image: "/generations/sandbox_bird.png",
    style: "Fantasy",
    time: "4.1s"
  },
  {
    title: "Space Library",
    text: "A vintage retro spaceship docked in a neon space station library, dramatic volumetric cinematic lighting",
    image: "/generations/sandbox_space.png",
    style: "Sci-Fi",
    time: "4.5s"
  }
];

// Sample images for background eraser
const ERASER_SAMPLES = [
  {
    id: "jets",
    label: "Fighter Jets",
    original: "/generations/sandbox_original.png",
    cutout: "/generations/sandbox_cutout.png",
    subject: "Aircraft Squadron"
  }
];

export function InteractivePlayground() {
  const [activeTab, setActiveTab] = useState<"image" | "eraser" | "vocal">("image");

  // AI Image Gen State
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [customPromptText, setCustomPromptText] = useState(PRESET_PROMPTS[0].text);
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [selectedAspect, setSelectedAspect] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Background Remover State
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [bgMode, setBgMode] = useState<"grid" | "neon" | "black" | "white">("grid");
  const containerRef = useRef<HTMLDivElement>(null);

  // Vocal Splitter State
  const [isPlaying, setIsPlaying] = useState(false);
  const [vocalVolume, setVocalVolume] = useState(80); // 0-100%
  const [musicVolume, setMusicVolume] = useState(75); // 0-100%
  const [vocalMuted, setVocalMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // 0 - 100%
  const audioProgressInterval = useRef<any>(null);

  // Vocal Audio References
  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize audio elements with volume & mute
  useEffect(() => {
    if (vocalAudioRef.current) {
      vocalAudioRef.current.volume = vocalVolume / 100;
      vocalAudioRef.current.muted = vocalMuted || vocalVolume === 0;
    }
  }, [vocalVolume, vocalMuted]);

  useEffect(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = musicVolume / 100;
      musicAudioRef.current.muted = musicMuted || musicVolume === 0;
    }
  }, [musicVolume, musicMuted]);

  // Master Play / Pause Toggle Handler for Real Audio Stems
  const handleTogglePlay = () => {
    const vocalEl = vocalAudioRef.current;
    const musicEl = musicAudioRef.current;

    if (isPlaying) {
      setIsPlaying(false);
      if (vocalEl) vocalEl.pause();
      if (musicEl) musicEl.pause();
    } else {
      setIsPlaying(true);
      if (vocalEl) {
        vocalEl.volume = vocalVolume / 100;
        vocalEl.muted = vocalMuted || vocalVolume === 0;
        vocalEl.play().catch((err) => console.error("Vocal audio error:", err));
      }
      if (musicEl) {
        musicEl.volume = musicVolume / 100;
        musicEl.muted = musicMuted || musicVolume === 0;
        musicEl.play().catch((err) => console.error("Music audio error:", err));
      }
    }
  };

  // Stop audio playback when switching tabs
  useEffect(() => {
    if (activeTab !== "vocal") {
      setIsPlaying(false);
      if (vocalAudioRef.current) vocalAudioRef.current.pause();
      if (musicAudioRef.current) musicAudioRef.current.pause();
    }
  }, [activeTab]);

  // AI Generation simulation steps
  const generationSteps = [
    { title: "Reading your prompt...", percent: 20 },
    { title: "Setting up canvas...", percent: 45 },
    { title: "Creating artwork details...", percent: 75 },
    { title: "Polishing artwork...", percent: 95 },
    { title: "Artwork complete!", percent: 100 }
  ];

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setGenerationStep(0);
    setGenerationProgress(10);
    setShowResult(false);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < generationSteps.length) {
        setGenerationStep(currentStep);
        setGenerationProgress(generationSteps[currentStep].percent);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setShowResult(true);
      }
    }, 700);
  };

  // Select preset prompt
  const handleSelectPreset = (idx: number) => {
    if (isGenerating) return;
    setSelectedPromptIdx(idx);
    setCustomPromptText(PRESET_PROMPTS[idx].text);
    setShowResult(false);
  };

  // Copy prompt
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(customPromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Background remover slider interaction
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;

    if (percentage <= 3) percentage = 0;
    if (percentage >= 97) percentage = 100;

    percentage = Math.max(0, Math.min(100, percentage));
    setSliderPos(percentage);
  }, []);

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (e.clientX <= rect.left + 25) {
      setSliderPos(0);
    } else if (e.clientX >= rect.left + rect.width - 25) {
      setSliderPos(100);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };
    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleWindowTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMove]);

  return (
    <section className="py-14 sm:py-24 px-3 sm:px-6 max-w-7xl mx-auto w-full relative selection:bg-purple-500/30">
      
      {/* Audio Stems Preloaded Elements */}
      <audio
        ref={vocalAudioRef}
        src="/generations/macarena_vocals.mp3"
        preload="auto"
        loop
        onTimeUpdate={() => {
          if (vocalAudioRef.current && vocalAudioRef.current.duration) {
            setAudioProgress((vocalAudioRef.current.currentTime / vocalAudioRef.current.duration) * 100);
          }
        }}
      />
      <audio
        ref={musicAudioRef}
        src="/generations/macarena_instrumental.mp3"
        preload="auto"
        loop
      />
      
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06)_0%,rgba(99,102,241,0.03)_50%,transparent_75%)] pointer-events-none -z-10 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col items-center mb-8 sm:mb-12 text-center space-y-3 sm:space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border border-purple-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.15)]"
        >
          <Sparkles size={13} className="text-purple-400 animate-spin" style={{ animationDuration: "8s" }} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-purple-300">
            Interactive Studio Playground
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-1" />
        </motion.div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-[0.98]">
          Test-Drive the <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.3)]">
            AI Studio Tools.
          </span>
        </h2>

        <p className="text-zinc-400 font-medium text-xs sm:text-sm md:text-base max-w-xl leading-relaxed px-2">
          Experience real-time interactive previews of our flagship tools right here. No sign-up required.
        </p>
      </div>

      {/* Insane Glassmorphic Tab Selector Container */}
      <div className="max-w-4xl mx-auto mb-8 sm:mb-10 relative z-10">
        <div className="p-[1.5px] sm:p-[2px] rounded-2xl sm:rounded-[28px] bg-gradient-to-r from-purple-500/30 via-indigo-500/20 via-cyan-500/20 to-pink-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(168,85,247,0.12)]">
          <div className="bg-[#080911]/90 p-1.5 sm:p-2 rounded-[14px] sm:rounded-[26px] backdrop-blur-2xl border border-white/[0.05]">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
              {[
                { 
                  id: "image", 
                  label: "AI Image Gen", 
                  subtext: "Text to Artwork",
                  icon: Sparkles,
                  activeGradient: "from-purple-600 via-indigo-600 to-fuchsia-600",
                  activeGlow: "shadow-[0_10px_35px_rgba(168,85,247,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)]",
                  activeBorder: "border-purple-400/40",
                  iconBg: "bg-purple-500/15 border-purple-500/30 text-purple-300",
                  badge: "Ultra HD",
                  badgeColor: "bg-purple-950/80 text-purple-200 border-purple-500/40"
                },
                { 
                  id: "eraser", 
                  label: "BG Remover", 
                  subtext: "Instant Cutout",
                  icon: Eraser,
                  activeGradient: "from-cyan-600 via-teal-600 to-indigo-600",
                  activeGlow: "shadow-[0_10px_35px_rgba(6,182,212,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)]",
                  activeBorder: "border-cyan-400/40",
                  iconBg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
                  badge: "Smart Cut",
                  badgeColor: "bg-cyan-950/80 text-cyan-200 border-cyan-500/40"
                },
                { 
                  id: "vocal", 
                  label: "Vocal Splitter", 
                  subtext: "Voice & Music",
                  icon: Mic2,
                  activeGradient: "from-pink-600 via-rose-600 to-purple-600",
                  activeGlow: "shadow-[0_10px_35px_rgba(236,72,153,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)]",
                  activeBorder: "border-pink-400/40",
                  iconBg: "bg-pink-500/15 border-pink-500/30 text-pink-300",
                  badge: "Vocal & Music",
                  badgeColor: "bg-pink-950/80 text-pink-200 border-pink-500/40"
                }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "relative flex flex-col items-center justify-center py-2.5 sm:py-4 px-1.5 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-300 group cursor-pointer select-none overflow-hidden",
                      isActive 
                        ? "text-white scale-[1.01] sm:scale-[1.02]" 
                        : "text-zinc-400 hover:text-white bg-white/[0.015] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/10"
                    )}
                  >
                    {/* Active Background Animation */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSandboxTab"
                        className={cn(
                          "absolute inset-0 bg-gradient-to-r rounded-xl sm:rounded-2xl border backdrop-blur-md relative overflow-hidden",
                          tab.activeGradient,
                          tab.activeGlow,
                          tab.activeBorder
                        )}
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      >
                        {/* Light shimmer sweep */}
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.25)_50%,transparent_75%)] bg-[length:250%_100%] animate-[shimmer_4s_infinite]" />
                      </motion.div>
                    )}
                    
                    {/* Top Content Row */}
                    <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 w-full">
                      <div className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center transition-all duration-300 shrink-0",
                        isActive 
                          ? "bg-white/20 border-white/40 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] scale-105 sm:scale-110" 
                          : tab.iconBg
                      )}>
                        <Icon size={14} className="sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
                      </div>

                      <span className={cn(
                        "font-black text-[10px] sm:text-xs md:text-sm tracking-wider uppercase transition-colors truncate max-w-[85px] sm:max-w-none",
                        isActive ? "text-white drop-shadow-md" : "text-zinc-200 group-hover:text-white"
                      )}>
                        {tab.label}
                      </span>
                    </div>

                    {/* Subtext and Badge Row */}
                    <div className="relative z-10 hidden sm:flex items-center justify-center gap-2 mt-1.5">
                      <span className={cn(
                        "text-[9px] font-bold tracking-wide transition-colors",
                        isActive ? "text-white/90" : "text-zinc-500 group-hover:text-zinc-400"
                      )}>
                        {tab.subtext}
                      </span>

                      <span className={cn(
                        "text-[8px] font-black font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm transition-all",
                        isActive 
                          ? "bg-black/50 border-white/30 text-white shadow-inner" 
                          : tab.badgeColor
                      )}>
                        {tab.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Frame Container */}
      <div className="max-w-5xl mx-auto rounded-2xl sm:rounded-[2.5rem] bg-[#07080e]/90 border border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_40px_rgba(124,58,237,0.08)] overflow-hidden backdrop-blur-2xl relative">
        
        {/* Window Top Studio Status Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-zinc-950/80 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 border border-rose-400/30" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 border border-amber-400/30" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 border border-emerald-400/30" />
            </div>
            <div className="h-3 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-mono font-bold text-zinc-400 tracking-wider">
              <Activity size={12} className="text-emerald-400 animate-pulse shrink-0" />
              <span className="hidden xs:inline">EXISMIC STUDIO</span>
              <span className="text-zinc-600 xs:inline hidden">•</span>
              <span className="text-purple-400 uppercase">{activeTab} DEMO</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-mono font-bold text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="hidden xs:inline">REALTIME</span> SPEED
            </div>
          </div>
        </div>

        {/* Tab Content Screens */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: AI TEXT-TO-IMAGE GENERATOR */}
          {activeTab === "image" && (
            <motion.div
              key="image-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-4 sm:p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start"
            >
              {/* Left Controls Panel */}
              <div className="lg:col-span-6 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-5">
                  
                  {/* Prompt Showcase Box */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                        <Wand2 size={12} /> Sandbox Sample Prompt
                      </label>
                      <span className="text-[9px] font-mono text-zinc-500">Preset Prompt</span>
                    </div>

                    <div className="relative bg-zinc-950/70 border border-white/[0.08] rounded-2xl p-4 min-h-[90px] flex items-center justify-between gap-3">
                      <p className="text-xs sm:text-sm text-white font-medium leading-relaxed pr-12">
                        "{PRESET_PROMPTS[selectedPromptIdx].text}"
                      </p>
                      <button
                        onClick={handleCopyPrompt}
                        className="absolute bottom-3 right-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors border border-white/10 cursor-pointer"
                        title="Copy Prompt"
                      >
                        {copiedPrompt ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedPrompt ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Prompts */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        Select Inspiration Preset
                      </span>
                      <span className="text-[9px] font-semibold text-zinc-500">Click to switch</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {PRESET_PROMPTS.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectPreset(idx)}
                          disabled={isGenerating}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between h-20 cursor-pointer",
                            selectedPromptIdx === idx 
                              ? "bg-purple-500/15 border-purple-500/50 text-white shadow-[0_4px_20px_rgba(168,85,247,0.2)] scale-[1.02]" 
                              : "bg-zinc-950/40 border-white/[0.04] text-zinc-400 hover:border-white/10 hover:text-zinc-200 hover:bg-white/[0.02]"
                          )}
                        >
                          <span className="text-xs font-bold tracking-tight line-clamp-1 group-hover:text-purple-300">
                            {preset.title}
                          </span>
                          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                            <span>{preset.style}</span>
                            <span className="text-purple-400 font-bold">{preset.time}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Generate Action Button */}
                <button
                  onClick={handleStartGeneration}
                  disabled={isGenerating}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:brightness-110 text-white font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-[0_15px_35px_rgba(124,58,237,0.35)] relative overflow-hidden group cursor-pointer mt-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Wand2 size={16} className={isGenerating ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
                  <span>{isGenerating ? "Creating Artwork..." : "Generate AI Artwork"}</span>
                </button>
              </div>

              {/* Right Output Preview Canvas */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[420px]">
                <div className="aspect-square w-full max-w-[440px] rounded-3xl bg-zinc-950/80 border border-white/[0.08] overflow-hidden relative flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] group">
                  
                  {/* Subtle Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                  {/* Generation Loading State */}
                  {isGenerating && (
                    <div className="absolute inset-0 z-20 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 space-y-5">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-xs text-purple-300">
                          {generationProgress}%
                        </div>
                      </div>

                      <div className="text-center space-y-2 max-w-xs">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400">
                          Exismic AI Image Generator
                        </p>
                        <p className="text-xs font-semibold text-zinc-200 animate-pulse">
                          {generationSteps[generationStep]?.title}
                        </p>
                      </div>

                      <div className="w-48 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/10">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${generationProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Empty Ready State */}
                  {!isGenerating && !showResult && (
                    <div className="text-center p-8 space-y-4 max-w-xs">
                      <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                        <ImageIcon size={28} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Canvas Ready</p>
                        <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">
                          Pick a preset prompt and click "Generate AI Artwork" to view the sandbox demo.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rendered Result Image */}
                  {showResult && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={PRESET_PROMPTS[selectedPromptIdx].image}
                        alt="Generated AI Artwork"
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Top Overlay Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 shadow-lg truncate">
                          {PRESET_PROMPTS[selectedPromptIdx].title} • {PRESET_PROMPTS[selectedPromptIdx].style}
                        </span>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1 shrink-0">
                          <Zap size={10} /> {PRESET_PROMPTS[selectedPromptIdx].time}
                        </span>
                      </div>

                      {/* Bottom Control Bar */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[9px] font-mono text-zinc-300 truncate max-w-[70%]">
                          <span className="text-zinc-500">Preset:</span>
                          <span className="text-purple-300 font-bold">{PRESET_PROMPTS[selectedPromptIdx].title}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowResult(false)}
                            className="h-7 px-2.5 rounded-xl bg-black/80 hover:bg-black border border-white/10 text-zinc-300 hover:text-white text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Reset Canvas"
                          >
                            <RotateCcw size={11} />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AI BACKGROUND REMOVER */}
          {activeTab === "eraser" && (
            <motion.div
              key="eraser-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-4 sm:p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center"
            >
              {/* Left Side Controls */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    <Eraser size={14} /> AI Background Eraser
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Instant Precision Cutouts
                  </h3>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                    Remove photo backgrounds in seconds with clean transparency.
                  </p>
                </div>

                {/* Instructions Box */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.06] space-y-3">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <SlidersIcon size={13} />
                    </div>
                    <span>Interactive Comparison</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Drag the slider horizontally over the preview image to compare the original photo with the isolated AI cutout.
                  </p>
                </div>

                {/* Background Replacement Options */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">
                    Cutout Preview Background Mode
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "grid", label: "Dark Grid", icon: Layers },
                      { id: "neon", label: "Neon", icon: Sparkles },
                      { id: "black", label: "Black", icon: Moon },
                      { id: "white", label: "Studio", icon: Sun }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setBgMode(mode.id as any)}
                        className={cn(
                          "py-2 px-2 rounded-xl border text-[9px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                          bgMode === mode.id
                            ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-md"
                            : "bg-zinc-950/40 border-white/[0.05] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                        )}
                      >
                        <mode.icon size={12} />
                        <span>{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side Slider Canvas */}
              <div className="lg:col-span-7 flex justify-center">
                <div 
                  ref={containerRef}
                  className="aspect-square w-full rounded-3xl bg-zinc-950 border border-white/[0.08] overflow-hidden relative cursor-ew-resize select-none shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  onMouseDown={(e) => {
                    setIsDragging(true);
                    handleMove(e.clientX);
                  }}
                  onTouchStart={(e) => {
                    setIsDragging(true);
                    if (e.touches[0]) handleMove(e.touches[0].clientX);
                  }}
                  onMouseMove={(e) => handleMove(e.clientX)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Selected Cutout Underlay Background Options */}
                  {bgMode === "grid" && (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] bg-zinc-950" />
                  )}
                  {bgMode === "neon" && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-indigo-900 to-cyan-900" />
                  )}
                  {bgMode === "black" && (
                    <div className="absolute inset-0 bg-black" />
                  )}
                  {bgMode === "white" && (
                    <div className="absolute inset-0 bg-zinc-200" />
                  )}

                  {/* Underlay Cutout Image (AI Cutout) */}
                  <div className="absolute inset-0 z-10">
                    <img
                      src={ERASER_SAMPLES[selectedSampleIdx].cutout}
                      alt="Isolated Cutout"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay Original Image clipped by slider position */}
                  <div 
                    className="absolute inset-0 z-20 overflow-hidden"
                    style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                  >
                    <img
                      src={ERASER_SAMPLES[selectedSampleIdx].original}
                      alt="Original Image"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Glassmorphic Slider Line & Drag Handle */}
                  <div 
                    className="absolute inset-y-0 z-30 w-0.5 bg-gradient-to-b from-indigo-400 via-purple-400 to-cyan-400 shadow-[0_0_15px_rgba(124,58,237,0.9)]"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-zinc-900/90 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] pointer-events-none backdrop-blur-md">
                      <div className="flex gap-1 items-center">
                        <div className="w-0.5 h-4 bg-purple-400 rounded-full" />
                        <div className="w-0.5 h-4 bg-purple-400 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Status Badges */}
                  <div className="absolute top-4 left-4 z-40 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-300 pointer-events-none shadow-lg">
                    Original Photo
                  </div>
                  <div className="absolute top-4 right-4 z-40 bg-purple-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/30 text-[9px] font-mono font-bold uppercase tracking-wider text-purple-300 pointer-events-none shadow-lg flex items-center gap-1.5">
                    <Check size={10} className="text-emerald-400" /> Background Removed
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: AI VOCAL & AUDIO SPLITTER */}
          {activeTab === "vocal" && (
            <motion.div
              key="vocal-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-4 sm:p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center"
            >


              {/* Left Controls Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
                    <Mic2 size={14} /> AI Audio & Vocal Splitter
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Separate Vocal & Music
                  </h3>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                    Isolate vocal melodies or mute background music in real time with high-quality AI audio separation.
                  </p>
                </div>

                {/* Stem Control 1: Vocal Channel */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                        !vocalMuted && vocalVolume > 0 ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-zinc-900 text-zinc-600"
                      )}>
                        <Mic2 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white">Vocal Track</p>
                        <p className="text-[9px] text-zinc-500 font-mono">Clean Vocal Lead</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVocalMuted(!vocalMuted)}
                        className={cn(
                          "h-8 px-3 rounded-xl text-[9px] font-mono font-bold uppercase transition-all cursor-pointer",
                          !vocalMuted && vocalVolume > 0
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                            : "bg-zinc-900 text-zinc-500 border border-white/[0.05]"
                        )}
                      >
                        {vocalMuted || vocalVolume === 0 ? "Muted" : "Active"}
                      </button>
                    </div>
                  </div>

                  {/* Vocal Volume Slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <Volume2 size={12} className="text-zinc-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vocalMuted ? 0 : vocalVolume}
                      onChange={(e) => {
                        setVocalVolume(Number(e.target.value));
                        if (vocalMuted) setVocalMuted(false);
                      }}
                      className="w-full accent-purple-500 bg-zinc-900 h-1.5 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-purple-400 w-8 text-right">
                      {vocalMuted ? "0%" : `${vocalVolume}%`}
                    </span>
                  </div>
                </div>

                {/* Stem Control 2: Instrumental Channel */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                        !musicMuted && musicVolume > 0 ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-zinc-900 text-zinc-600"
                      )}>
                        <Music size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white">Instrumental Track</p>
                        <p className="text-[9px] text-zinc-500 font-mono">Background Music</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMusicMuted(!musicMuted)}
                        className={cn(
                          "h-8 px-3 rounded-xl text-[9px] font-mono font-bold uppercase transition-all cursor-pointer",
                          !musicMuted && musicVolume > 0
                            ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-zinc-900 text-zinc-500 border border-white/[0.05]"
                        )}
                      >
                        {musicMuted || musicVolume === 0 ? "Muted" : "Active"}
                      </button>
                    </div>
                  </div>

                  {/* Instrumental Volume Slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <Volume2 size={12} className="text-zinc-500" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicMuted ? 0 : musicVolume}
                      onChange={(e) => {
                        setMusicVolume(Number(e.target.value));
                        if (musicMuted) setMusicMuted(false);
                      }}
                      className="w-full accent-cyan-500 bg-zinc-900 h-1.5 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-cyan-400 w-8 text-right">
                      {musicMuted ? "0%" : `${musicVolume}%`}
                    </span>
                  </div>
                </div>

                {/* Master Play Button */}
                <button
                  onClick={handleTogglePlay}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg cursor-pointer",
                    isPlaying
                      ? "bg-zinc-900 text-zinc-200 border border-white/10 hover:bg-zinc-800"
                      : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-[0_15px_35px_rgba(124,58,237,0.3)] hover:brightness-110"
                  )}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPlaying ? "Pause Stem Playback" : "Play Audio Separation Simulation"}</span>
                </button>
              </div>

              {/* Right Side Spectrum Waveform Console */}
              <div className="lg:col-span-6 flex flex-col justify-between h-full bg-zinc-950/80 rounded-3xl border border-white/[0.08] p-6 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative">
                
                {/* Track Information Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400 block">
                      Track: Macarena (Slowed + Reverb)
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">Separated Audio Stems</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      {Math.floor((audioProgress * 0.3) / 60)}:{String(Math.floor((audioProgress * 0.3) % 60)).padStart(2, '0')} / 0:30
                    </span>
                  </div>
                </div>

                {/* Vocal Spectrum Waveform */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Mic2 size={10} /> Vocal Waveform
                    </span>
                    <span className={vocalMuted || vocalVolume === 0 ? "text-zinc-600" : "text-purple-400"}>
                      {vocalMuted || vocalVolume === 0 ? "MUTED" : `${vocalVolume}% VOL`}
                    </span>
                  </div>

                  <div className="h-20 flex items-center gap-1 bg-zinc-950 rounded-2xl px-4 border border-white/[0.04] overflow-hidden relative">
                    {Array.from({ length: 44 }).map((_, i) => {
                      const h = Math.abs(Math.sin(i * 0.3)) * 100;
                      const isActive = !vocalMuted && vocalVolume > 0;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 rounded-full transition-all duration-150",
                            isActive 
                              ? isPlaying 
                                ? "bg-gradient-to-t from-purple-600 to-indigo-400 animate-pulse" 
                                : "bg-purple-500/50"
                              : "bg-zinc-800"
                          )}
                          style={{ 
                            height: isActive ? `${Math.max(6, (h * (vocalVolume / 100)) * (isPlaying ? 0.7 + Math.random() * 0.3 : 0.6))}%` : "4px" 
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Instrumental Spectrum Waveform */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Music size={10} /> Instrumental Waveform
                    </span>
                    <span className={musicMuted || musicVolume === 0 ? "text-zinc-600" : "text-cyan-400"}>
                      {musicMuted || musicVolume === 0 ? "MUTED" : `${musicVolume}% VOL`}
                    </span>
                  </div>

                  <div className="h-20 flex items-center gap-1 bg-zinc-950 rounded-2xl px-4 border border-white/[0.04] overflow-hidden relative">
                    {Array.from({ length: 44 }).map((_, i) => {
                      const h = Math.abs(Math.cos(i * 0.25)) * 100;
                      const isActive = !musicMuted && musicVolume > 0;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 rounded-full transition-all duration-150",
                            isActive 
                              ? isPlaying 
                                ? "bg-gradient-to-t from-cyan-600 to-teal-400 animate-pulse" 
                                : "bg-cyan-500/50"
                              : "bg-zinc-800"
                          )}
                          style={{ 
                            height: isActive ? `${Math.max(6, (h * (musicVolume / 100)) * (isPlaying ? 0.7 + Math.random() * 0.3 : 0.6))}%` : "4px" 
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Playback Timeline Scrubber */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase">
                    <span>Playback Timeline</span>
                    <span>{Math.round(audioProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/10 relative cursor-pointer"
                       onClick={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const p = ((e.clientX - rect.left) / rect.width) * 100;
                         setAudioProgress(p);
                       }}>
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 rounded-full transition-all"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </section>
  );
}
