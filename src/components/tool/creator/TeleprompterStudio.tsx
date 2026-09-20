"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  FlipHorizontal,
  FlipVertical,
  Camera,
  CameraOff,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Check,
  Copy,
  Trash2,
  Timer,
  SlidersHorizontal,
  FileText,
  Film,
  Rocket,
  Mic,
  BookOpen,
  ClipboardCopy,
  MonitorPlay,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// SCRIPT PRESETS (Plain Everyday English, Authentic Lucide Icons)
// ============================================================================

interface ScriptPreset {
  id: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: "viral-hook",
    title: "Viral Video Hook",
    badge: "SHORTS & REELS",
    icon: Film,
    text: `Stop scrolling.

If you are creating content or building an audience in 2026, here is the number one mistake that is killing your retention.

Most creators spend eighty percent of their energy perfecting the video, and zero percent on the first three seconds.

Here are the three golden rules you need to follow:

Rule number one: Never start with an introduction. Nobody cares who you are until you have given them real value.

Rule number two: State the stakes in your first sentence. Tell them exactly what they will lose if they look away.

And rule number three: Cut out all breath pauses. Pacing is everything.

Try this on your next three videos and watch your watch-time double.`,
  },
  {
    id: "product-launch",
    title: "Product Launch Pitch",
    badge: "KEYNOTE & DEMO",
    icon: Rocket,
    text: `Good morning everyone, and thank you for being here today.

Six months ago, our team set out to solve a frustrating problem that every creator deals with every single day:

Why are creative tools still so slow, so clunky, and filled with overpriced monthly subscriptions?

Today, we are proud to officially unveil Exismic 2.0.

Everything runs entirely inside your browser.
Zero server wait times.
Zero watermarks.
And zero subscription paywalls.

Whether you are generating social mockups, editing audio, or preparing scripts, the entire studio is right at your fingertips.

We cannot wait to see what you build with it.`,
  },
  {
    id: "podcast-intro",
    title: "Podcast Episode Intro",
    badge: "INTERVIEW & SHOW",
    icon: Mic,
    text: `Welcome back to the studio, everybody.

Today's conversation is one I have been looking forward to for months.

We are joined by visionary founders and builders who are redefining what it means to build software in the age of intelligent creative technology.

We are going to dive deep into lessons learned, mistakes made, and the raw truth about what it actually takes to build something that matters.

Grab your favorite drink, get comfortable, and let's jump straight into the episode.`,
  },
  {
    id: "tutorial-guide",
    title: "Tutorial & Explainer",
    badge: "STEP-BY-STEP",
    icon: BookOpen,
    text: `In this quick step-by-step walkthrough, I will show you how to master this workflow in under three minutes.

Step one: Gather your assets and prepare your outline before you hit record.

Step two: Set your teleprompter to a natural conversational pace, around 130 words per minute. Keep your eyes locked on the glowing laser guide to maintain direct eye contact with your camera lens.

Step three: Review your recording, trim dead pauses, and export your high-definition video.

If you found this helpful, be sure to save this guide and share it with your team.`,
  },
];

// Color Theme Definitions
export type PrompterTheme = "pure-black" | "obsidian" | "broadcast-yellow" | "paper-white";

// Quick Pacing Speeds
const PACING_PRESETS = [
  { label: "Relaxed", speed: 1.8, wpm: "85 WPM" },
  { label: "Conversational", speed: 3.5, wpm: "130 WPM" },
  { label: "Energetic", speed: 5.2, wpm: "170 WPM" },
  { label: "Rapid", speed: 7.5, wpm: "225 WPM" },
];

// Web Audio API Beep Generator for 3-Second Countdown
function playCountdownBeep(freq = 520, duration = 0.12) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TeleprompterStudio() {
  // Script content
  const [scriptText, setScriptText] = useState<string>(SCRIPT_PRESETS[0].text);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Auto-scroll State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(3.5); // 1 to 10
  const [fontSize, setFontSize] = useState<number>(44); // 24 to 80 px
  const [columnWidth, setColumnWidth] = useState<number>(720); // 500 to 1000 px
  const [lineHeight, setLineHeight] = useState<number>(1.6); // 1.3, 1.6, 2.0
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [isUppercase, setIsUppercase] = useState<boolean>(false);

  // Hardware Mirror & Optics
  const [mirrorX, setMirrorX] = useState<boolean>(false);
  const [mirrorY, setMirrorY] = useState<boolean>(false);
  const [showFocusLine, setShowFocusLine] = useState<boolean>(true);
  const [focusLinePosition, setFocusLinePosition] = useState<"upper" | "center" | "lower">("center");

  // Countdown & Audio
  const [countdownEnabled, setCountdownEnabled] = useState<boolean>(true);
  const [countdownAudio, setCountdownAudio] = useState<boolean>(true);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  // Recording Stopwatch (Elapsed Time)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Webcam PiP
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Theme & Stage View
  const [theme, setTheme] = useState<PrompterTheme>("obsidian");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);

  // Mobile segmented tab switcher ("stage" | "script" | "controls")
  const [mobileTab, setMobileTab] = useState<"stage" | "script" | "controls">("stage");

  // DOM Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --------------------------------------------------------------------------
  // CALCULATED METRICS (Zero Tech Jargon)
  // --------------------------------------------------------------------------
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  // Dynamic words per minute calibrated to speed
  const calculatedWpm = Math.round(40 + speed * 26);
  const estimatedSeconds = wordCount > 0 ? Math.ceil((wordCount / calculatedWpm) * 60) : 0;
  const formattedEstimatedTime =
    estimatedSeconds >= 60
      ? `${Math.floor(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`
      : `${estimatedSeconds}s`;

  // Format elapsed stopwatch timer as MM:SS
  const formatStopwatch = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --------------------------------------------------------------------------
  // RECORDING STOPWATCH TICKER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isPlaying) {
      stopwatchIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    }
    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // --------------------------------------------------------------------------
  // START / PAUSE PLAYBACK WITH OPTIONAL 3-SECOND COUNTDOWN
  // --------------------------------------------------------------------------
  const startPlayback = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (countdownEnabled) {
      setCountdownValue(3);
      if (countdownAudio) playCountdownBeep(520, 0.12);

      let currentCount = 3;
      countdownTimerRef.current = setInterval(() => {
        currentCount -= 1;
        if (currentCount > 0) {
          setCountdownValue(currentCount);
          if (countdownAudio) playCountdownBeep(520, 0.12);
        } else {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setCountdownValue(null);
          if (countdownAudio) playCountdownBeep(880, 0.22);
          setIsPlaying(true);
        }
      }, 900);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying, countdownEnabled, countdownAudio]);

  const pausePlayback = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownValue(null);
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying || countdownValue !== null) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, countdownValue, pausePlayback, startPlayback]);

  // Reset prompter to start
  const handleReset = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownValue(null);
    setIsPlaying(false);
    setElapsedSeconds(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // --------------------------------------------------------------------------
  // AUTO-SCROLL ANIMATION FRAME LOOP
  // --------------------------------------------------------------------------
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let animId: number;
    let lastTime: number | null = null;

    const scrollLoop = (time: number) => {
      if (lastTime === null) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying && scrollContainer) {
        // Calibrated pixels per second (speed 1 = ~24px/s, speed 10 = ~240px/s)
        const pixelsPerSecond = speed * 24;
        scrollContainer.scrollTop += pixelsPerSecond * delta;

        // Auto pause when reached end of text
        const atBottom =
          scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 8;
        if (atBottom) {
          setIsPlaying(false);
        }
      }

      animId = requestAnimationFrame(scrollLoop);
    };

    animId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  // --------------------------------------------------------------------------
  // WEBCAM SELFIE MONITOR (PiP)
  // --------------------------------------------------------------------------
  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setCameraError(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
        setCameraError(null);
      } catch {
        setCameraError("Camera permission blocked or not detected.");
      }
    }
  };

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // FULLSCREEN HANDLER
  // --------------------------------------------------------------------------
  const toggleFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Auto-hide floating transport HUD during active scrolling when mouse is idle
  const handleStageMouseMove = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3200);
    }
  };

  // --------------------------------------------------------------------------
  // KEYBOARD SHORTCUTS (Space, Arrows, R, F, M, C)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      if (activeTag === "TEXTAREA" || activeTag === "INPUT") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setSpeed((prev) => Math.min(10, Math.round((prev + 0.5) * 10) / 10));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setSpeed((prev) => Math.max(1, Math.round((prev - 0.5) * 10) / 10));
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReset();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setMirrorX((prev) => !prev);
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        setShowFocusLine((prev) => !prev);
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        void toggleCamera();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, handleReset]);

  // Copy script text
  const handleCopyScript = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(scriptText);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  // Paste from clipboard
  const handlePasteScript = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setScriptText(text);
          handleReset();
        }
      } catch {
        // Clipboard read permission might be blocked
      }
    }
  };

  // --------------------------------------------------------------------------
  // THEME COLOR SCHEMES
  // --------------------------------------------------------------------------
  const themeStyles = {
    "pure-black": {
      stageBg: "bg-black",
      textColor: "text-white",
      accentBorder: "border-sky-500/40",
      guideLine: "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]",
      guidePill: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      hudBg: "bg-black/90 border-white/10",
    },
    obsidian: {
      stageBg: "bg-[#070913]",
      textColor: "text-cyan-50",
      accentBorder: "border-cyan-500/40",
      guideLine: "bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.85)]",
      guidePill: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      hudBg: "bg-[#090d1a]/95 border-cyan-500/30",
    },
    "broadcast-yellow": {
      stageBg: "bg-black",
      textColor: "text-[#fde047]",
      accentBorder: "border-yellow-500/40",
      guideLine: "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.85)]",
      guidePill: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      hudBg: "bg-zinc-950/95 border-yellow-500/30",
    },
    "paper-white": {
      stageBg: "bg-[#f8fafc]",
      textColor: "text-[#0f172a]",
      accentBorder: "border-blue-500/40",
      guideLine: "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.85)]",
      guidePill: "bg-blue-600/15 text-blue-800 border-blue-600/40",
      hudBg: "bg-white/95 border-slate-300",
    },
  }[theme];

  // Focus line vertical positioning
  const focusPositionClass = {
    upper: "top-[32%]",
    center: "top-[48%]",
    lower: "top-[64%]",
  }[focusLinePosition];

  // ==========================================================================
  // RENDER UI
  // ==========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* ==================================================================== */}
      {/* 1. TOP STATUS & SPEECH PACING BAR                                     */}
      {/* ==================================================================== */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#090d1a]/90 border border-white/[0.08] p-3 sm:p-4 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Studio Status Dot & Title */}
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                isPlaying
                  ? "bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.9)]"
                  : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
              )}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white">
                  {isPlaying ? "Live Broadcast Recording" : "Studio Prompter Ready"}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                    isPlaying
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  )}
                >
                  {isPlaying ? `ON AIR · ${formatStopwatch(elapsedSeconds)}` : "STANDBY"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                100% in-browser reader with mirror flip, camera monitor, and calibrated speech pacing.
              </p>
            </div>
          </div>

          {/* Right: Live Speech Analytics */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {/* Word Count */}
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">Words</span>
              <span className="font-mono text-zinc-200 font-bold">{wordCount}</span>
            </div>

            {/* Estimated Speaking Time */}
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">Est. Time</span>
              <span className="font-mono text-cyan-300 font-bold">{formattedEstimatedTime}</span>
            </div>

            {/* Reading Pacing WPM */}
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">Pacing</span>
              <span className="font-mono text-purple-300 font-bold">~{calculatedWpm} WPM</span>
            </div>

            {/* Timer Counter */}
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-medium">Elapsed</span>
              <span className="font-mono text-emerald-300 font-bold">{formatStopwatch(elapsedSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Script Inspiration Templates Bar */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
            <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-zinc-300 text-[11px]">Instant Blueprints:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {SCRIPT_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setScriptText(preset.text);
                    handleReset();
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-300 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <Icon className="w-3 h-3 text-cyan-400" />
                  <span>{preset.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MOBILE SEGMENTED TAB SWITCHER (< lg screens)                      */}
      {/* ==================================================================== */}
      <div className="lg:hidden flex items-center p-1 rounded-2xl bg-[#090d1a] border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("stage")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5",
            mobileTab === "stage"
              ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          Prompter Stage
        </button>

        <button
          onClick={() => setMobileTab("script")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5",
            mobileTab === "script"
              ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          Script Text
        </button>

        <button
          onClick={() => setMobileTab("controls")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5",
            mobileTab === "controls"
              ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Controls
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 3. MAIN WORKSPACE: DUAL-PANE DESKTOP / TABBED MOBILE                 */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================== */}
        {/* LEFT COLUMN: SCRIPT CONSOLE & TUNING CONTROLS (Desktop 5-cols)     */}
        {/* ================================================================== */}
        <div
          className={cn(
            "lg:col-span-5 space-y-4",
            mobileTab === "stage" && "hidden lg:block",
            mobileTab === "controls" && "hidden lg:block"
          )}
        >
          {/* Card A: Script Editor */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090d1a]/95 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Your Script Text</h2>
              </div>

              {/* Quick Script Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePasteScript}
                  title="Paste from Clipboard"
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all active:scale-95 flex items-center gap-1"
                >
                  <ClipboardCopy className="w-3 h-3 text-cyan-400" />
                  Paste
                </button>

                <button
                  onClick={handleCopyScript}
                  title="Copy Script Text"
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all active:scale-95 flex items-center gap-1"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedScript ? "Copied" : "Copy"}
                </button>

                <button
                  onClick={() => {
                    setScriptText("");
                    handleReset();
                  }}
                  title="Clear Script"
                  className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Script Textarea */}
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={10}
              placeholder="Paste or type your video presentation script here..."
              className="w-full p-3.5 text-sm rounded-2xl bg-black/40 border border-white/[0.08] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans leading-relaxed resize-y scrollbar-none"
            />

            {/* Mobile-only CTA to switch directly to prompter */}
            <div className="lg:hidden pt-1">
              <button
                onClick={() => setMobileTab("stage")}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MonitorPlay className="w-4 h-4" />
                Open Prompter Stage
              </button>
            </div>
          </div>

          {/* Card B: Reading Speed & Pacing Controller */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090d1a]/95 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Reading Speed & Pacing</h3>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-300">{speed.toFixed(1)}x Speed</span>
            </div>

            {/* Speed Range Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="1"
                max="10"
                step="0.2"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg bg-white/[0.1] accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>1.0x (Slow / Calm)</span>
                <span className="text-cyan-300 font-semibold">~{calculatedWpm} Words / Min</span>
                <span>10.0x (Rapid)</span>
              </div>
            </div>

            {/* Quick Speed Preset Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {PACING_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setSpeed(preset.speed)}
                  className={cn(
                    "py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all active:scale-95 text-center",
                    Math.abs(speed - preset.speed) < 0.2
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-zinc-400 hover:text-white"
                  )}
                >
                  <div className="font-medium truncate">{preset.label}</div>
                  <div className="text-[9px] text-zinc-400">{preset.wpm}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Card C: Typography & Display Formatting */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090d1a]/95 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Text Size & Layout</h3>
              </div>
              <span className="font-mono text-xs font-bold text-zinc-300">{fontSize}px</span>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="24"
                max="80"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg bg-white/[0.1] accent-emerald-400 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { label: "28px Small", val: 28 },
                  { label: "44px Studio", val: 44 },
                  { label: "58px Large", val: 58 },
                  { label: "72px Giant", val: 72 },
                ].map((chip) => (
                  <button
                    key={chip.val}
                    onClick={() => setFontSize(chip.val)}
                    className={cn(
                      "flex-1 py-1 text-[10px] font-semibold rounded-lg border transition-all",
                      fontSize === chip.val
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment & Lettercase row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
              {/* Text Alignment */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
                <button
                  onClick={() => setTextAlign("left")}
                  title="Align Left"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    textAlign === "left" ? "bg-white/[0.15] text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign("center")}
                  title="Align Center"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    textAlign === "center" ? "bg-white/[0.15] text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTextAlign("right")}
                  title="Align Right"
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    textAlign === "right" ? "bg-white/[0.15] text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Uppercase Toggle */}
              <button
                onClick={() => setIsUppercase(!isUppercase)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5",
                  isUppercase
                    ? "bg-purple-500/20 text-purple-200 border-purple-500/40"
                    : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white"
                )}
              >
                <Type className="w-3 h-3" />
                <span>ALL CAPS</span>
              </button>

              {/* Line Spacing */}
              <div className="flex items-center gap-1">
                {[
                  { label: "1.3x", val: 1.3 },
                  { label: "1.6x", val: 1.6 },
                  { label: "2.0x", val: 2.0 },
                ].map((lh) => (
                  <button
                    key={lh.val}
                    onClick={() => setLineHeight(lh.val)}
                    className={cn(
                      "px-2 py-1 text-[10px] font-mono rounded-lg border transition-all",
                      lineHeight === lh.val
                        ? "bg-white/[0.15] text-white border-white/[0.2]"
                        : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white"
                    )}
                  >
                    {lh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Column Width (Margins) */}
            <div className="pt-2 border-t border-white/[0.06] space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Reading Column Width</span>
                <span className="font-mono text-zinc-300">{columnWidth}px</span>
              </div>
              <input
                type="range"
                min="440"
                max="980"
                step="20"
                value={columnWidth}
                onChange={(e) => setColumnWidth(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-white/[0.1] accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Card D: Hardware Rig, Optics & Theme */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090d1a]/95 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              Hardware Mirror & Optics
            </h3>

            {/* Mirror Flips */}
            <div className="grid grid-cols-2 gap-2">
              {/* Horizontal Mirror (for Glass Prompters) */}
              <button
                onClick={() => setMirrorX(!mirrorX)}
                className={cn(
                  "p-2.5 rounded-2xl border transition-all text-left space-y-1 active:scale-95",
                  mirrorX
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                    : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <FlipHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Glass Mirror</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">Flips text for physical prompter glass</p>
              </button>

              {/* Vertical Flip */}
              <button
                onClick={() => setMirrorY(!mirrorY)}
                className={cn(
                  "p-2.5 rounded-2xl border transition-all text-left space-y-1 active:scale-95",
                  mirrorY
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <FlipVertical className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Ceiling Invert</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">Inverts text vertically for top-down rigs</p>
              </button>
            </div>

            {/* Focus Laser Eyeline & Position */}
            <div className="pt-2 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Eye Contact Laser Guide
                </span>
                <button
                  onClick={() => setShowFocusLine(!showFocusLine)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all",
                    showFocusLine
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-white/[0.03] border-white/[0.08] text-zinc-500"
                  )}
                >
                  {showFocusLine ? "ON" : "OFF"}
                </button>
              </div>

              {showFocusLine && (
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "upper", label: "Upper 35%" },
                    { id: "center", label: "Center 50%" },
                    { id: "lower", label: "Lower 65%" },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setFocusLinePosition(pos.id as "upper" | "center" | "lower")}
                      className={cn(
                        "py-1 text-[10px] font-semibold rounded-lg border transition-all",
                        focusLinePosition === pos.id
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white"
                      )}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3-Second Countdown & Camera Monitor Toggles */}
            <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2">
              {/* Countdown */}
              <button
                onClick={() => setCountdownEnabled(!countdownEnabled)}
                className={cn(
                  "p-2.5 rounded-2xl border transition-all text-left space-y-1",
                  countdownEnabled
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                    : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Timer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3s Countdown</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">3-2-1 timer before scrolling begins</p>
              </button>

              {/* Camera Selfie Monitor */}
              <button
                onClick={toggleCamera}
                className={cn(
                  "p-2.5 rounded-2xl border transition-all text-left space-y-1",
                  cameraActive
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  {cameraActive ? (
                    <Camera className="w-3.5 h-3.5 text-purple-300" />
                  ) : (
                    <CameraOff className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>Camera Monitor</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">In-prompter selfie feed for eye alignment</p>
              </button>
            </div>

            {/* Prompter Stage Themes */}
            <div className="pt-2 border-t border-white/[0.06] space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block">Display Color Theme</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: "obsidian", label: "Obsidian Cyber", color: "bg-[#070913] border-cyan-400" },
                  { id: "pure-black", label: "OLED Black", color: "bg-black border-white" },
                  { id: "broadcast-yellow", label: "Broadcast Yellow", color: "bg-black border-yellow-400" },
                  { id: "paper-white", label: "Paper White", color: "bg-white border-slate-900" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as PrompterTheme)}
                    className={cn(
                      "p-2 rounded-xl border text-[10px] font-semibold text-center transition-all flex flex-col items-center gap-1",
                      theme === item.id
                        ? "bg-white/[0.1] border-cyan-400/80 text-white shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                        : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white"
                    )}
                  >
                    <span className={cn("w-4 h-4 rounded-full border", item.color)} />
                    <span className="truncate w-full">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: THE LIVE TELEPROMPTER STAGE (Desktop 7-cols)        */}
        {/* ================================================================== */}
        <div
          className={cn(
            "lg:col-span-7",
            mobileTab === "script" && "hidden lg:block",
            mobileTab === "controls" && "hidden lg:block"
          )}
        >
          {/* Prompter Monitor Enclosure */}
          <div
            ref={stageRef}
            onMouseMove={handleStageMouseMove}
            className={cn(
              "relative w-full rounded-3xl overflow-hidden border transition-all select-none shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col",
              themeStyles.stageBg,
              isFullscreen
                ? "fixed inset-0 z-[99999] rounded-none border-none h-screen w-screen"
                : "min-h-[580px] h-[680px] border-white/[0.12]"
            )}
          >
            {/* -------------------------------------------------------------- */}
            {/* Top Stage Hardware Bezel                                       */}
            {/* -------------------------------------------------------------- */}
            <div className="relative z-30 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
              {/* Left Indicator */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isPlaying ? "bg-rose-500 animate-ping" : "bg-zinc-600"
                  )}
                />
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  {isPlaying ? "LIVE SCROLLING" : "STAGE READY"}
                </span>
              </div>

              {/* Center Eye Guide Interactive Toggle */}
              <button
                onClick={() => setShowFocusLine(!showFocusLine)}
                title={showFocusLine ? "Hide Eye-Contact Guide (E)" : "Show Eye-Contact Guide (E)"}
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono transition-all active:scale-95",
                  showFocusLine
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    : "bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white"
                )}
              >
                <Eye className="w-3 h-3" />
                <span>EYE GUIDE: {showFocusLine ? "ON" : "OFF"}</span>
              </button>
              <div className="flex items-center gap-1.5">
                {/* Audio Beep Toggle */}
                {countdownEnabled && (
                  <button
                    onClick={() => setCountdownAudio(!countdownAudio)}
                    title={countdownAudio ? "Mute Countdown Beeps" : "Unmute Countdown Beeps"}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    {countdownAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen (F)" : "Full Studio Screen (F)"}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Atmospheric Gradient Fades (Top and Bottom)                    */}
            {/* -------------------------------------------------------------- */}
            <div
              className={cn(
                "absolute top-12 left-0 right-0 h-32 pointer-events-none z-20",
                theme === "paper-white"
                  ? "bg-gradient-to-b from-[#f8fafc] via-[#f8fafc]/70 to-transparent"
                  : "bg-gradient-to-b from-black via-black/60 to-transparent"
              )}
            />
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-36 pointer-events-none z-20",
                theme === "paper-white"
                  ? "bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/80 to-transparent"
                  : "bg-gradient-to-t from-black via-black/80 to-transparent"
              )}
            />

            {/* -------------------------------------------------------------- */}
            {/* Optical Eye-Contact Eyeline (Subtle Laser + Edge Pointers, Zero Center Obstruction) */}
            {showFocusLine && (
              <div
                className={cn(
                  "absolute left-0 right-0 -translate-y-1/2 pointer-events-none z-20 transition-all duration-300",
                  focusPositionClass
                )}
              >
                {/* Full-width translucent laser hairline */}
                <div className="relative w-full flex items-center">
                  <div
                    className={cn(
                      "w-full h-[1px]",
                      theme === "broadcast-yellow"
                        ? "bg-gradient-to-r from-yellow-400/60 via-yellow-400/20 to-yellow-400/60"
                        : theme === "paper-white"
                        ? "bg-gradient-to-r from-blue-600/40 via-blue-600/15 to-blue-600/40"
                        : "bg-gradient-to-r from-cyan-400/60 via-cyan-400/20 to-cyan-400/60"
                    )}
                  />

                  {/* Left Broadcast Eyeline Pointer (Pinned to far left margin) */}
                  <div className="absolute left-2 sm:left-4 flex items-center gap-1.5">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center border shadow-lg backdrop-blur-md",
                        theme === "broadcast-yellow"
                          ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                          : theme === "paper-white"
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                          : "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      )}
                    >
                      <span className="text-[11px] font-black leading-none">▶</span>
                    </div>
                    <span
                      className={cn(
                        "hidden sm:inline-block text-[9px] font-mono tracking-widest uppercase font-bold px-1.5 py-0.5 rounded border backdrop-blur-xs",
                        theme === "broadcast-yellow"
                          ? "bg-yellow-500/15 text-yellow-300/90 border-yellow-500/30"
                          : theme === "paper-white"
                          ? "bg-blue-500/15 text-blue-700/90 border-blue-500/30"
                          : "bg-cyan-500/15 text-cyan-300/90 border-cyan-500/30"
                      )}
                    >
                      Eye-Line
                    </span>
                  </div>

                  {/* Right Broadcast Eyeline Pointer (Pinned to far right margin) */}
                  <div className="absolute right-2 sm:right-4 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "hidden sm:inline-block text-[9px] font-mono tracking-widest uppercase font-bold px-1.5 py-0.5 rounded border backdrop-blur-xs",
                        theme === "broadcast-yellow"
                          ? "bg-yellow-500/15 text-yellow-300/90 border-yellow-500/30"
                          : theme === "paper-white"
                          ? "bg-blue-500/15 text-blue-700/90 border-blue-500/30"
                          : "bg-cyan-500/15 text-cyan-300/90 border-cyan-500/30"
                      )}
                    >
                      Eye-Line
                    </span>
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center border shadow-lg backdrop-blur-md",
                        theme === "broadcast-yellow"
                          ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                          : theme === "paper-white"
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                          : "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      )}
                    >
                      <span className="text-[11px] font-black leading-none">◀</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* 3-2-1 Giant Animated Countdown Overlay                         */}
            {/* -------------------------------------------------------------- */}
            {countdownValue !== null && (
              <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto">
                <div className="w-32 h-32 rounded-full border-4 border-cyan-400/60 bg-cyan-500/10 flex items-center justify-center shadow-[0_0_50px_rgba(0,240,255,0.4)] animate-pulse">
                  <span className="text-7xl font-black font-mono text-cyan-300">{countdownValue}</span>
                </div>
                <p className="mt-4 text-xs font-mono uppercase tracking-widest text-zinc-300">
                  Look into the camera lens...
                </p>
                <button
                  onClick={pausePlayback}
                  className="mt-6 px-4 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.1] hover:bg-white/[0.2] text-zinc-300 transition-colors"
                >
                  Cancel Countdown
                </button>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* Draggable / Top-Right Selfie Camera Monitor (PiP)              */}
            {/* -------------------------------------------------------------- */}
            {cameraActive && (
              <div className="absolute top-16 right-4 z-30 w-36 sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_15px_35px_rgba(0,0,0,0.8)] bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SELFIE CAM
                </div>
                <button
                  onClick={toggleCamera}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-zinc-300 hover:text-white"
                  title="Close Camera"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Camera Permission Error Notice */}
            {cameraError && (
              <div className="absolute top-16 left-4 right-4 z-30 p-2.5 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs text-center flex items-center justify-between">
                <span>{cameraError}</span>
                <button onClick={() => setCameraError(null)} className="ml-2 font-bold">
                  ✕
                </button>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* The Actual Scrolling Text Glass Surface                        */}
            {/* -------------------------------------------------------------- */}
            <div
              ref={scrollContainerRef}
              className="w-full h-full overflow-y-scroll scrollbar-none px-4 sm:px-8 pt-[320px] pb-[380px]"
            >
              <div
                style={{
                  maxWidth: `${columnWidth}px`,
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  textAlign: textAlign,
                  transform: `${mirrorX ? "scaleX(-1)" : ""} ${mirrorY ? "scaleY(-1)" : ""}`.trim() || undefined,
                }}
                className={cn(
                  "mx-auto font-sans font-semibold tracking-normal transition-transform duration-200 whitespace-pre-line break-words",
                  isUppercase && "uppercase tracking-wider",
                  themeStyles.textColor
                )}
              >
                {scriptText || "Your script is currently empty. Type or paste your script in the left panel to begin."}
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* FLOATING LUXURY TRANSPORT HUD (Auto-hides on idle)             */}
            {/* -------------------------------------------------------------- */}
            <div
              className={cn(
                "absolute bottom-5 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 w-[94%] max-w-xl",
                controlsVisible || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              )}
            >
              <div
                className={cn(
                  "p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-between gap-2 sm:gap-3",
                  themeStyles.hudBg
                )}
              >
                {/* Play / Pause Primary CTA */}
                <button
                  onClick={togglePlayPause}
                  className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-lg",
                    isPlaying
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)]"
                      : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 text-black font-bold shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                  )}
                  title={isPlaying ? "Pause (Space)" : "Start (Space)"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current text-white" />
                  ) : (
                    <Play className="w-6 h-6 fill-current text-black ml-0.5" />
                  )}
                </button>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  title="Reset to Top (R)"
                  className="p-2.5 sm:p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 hover:text-white transition-all active:scale-95 shrink-0"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Speed Controls (- / + and readout) */}
                <div className="flex-1 flex items-center justify-center gap-2 px-2 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <button
                    onClick={() => setSpeed((prev) => Math.max(1, Math.round((prev - 0.5) * 10) / 10))}
                    className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] active:scale-90 font-bold"
                    title="Decrease Speed (Down Arrow)"
                  >
                    –
                  </button>

                  <div className="text-center px-1">
                    <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300 block">
                      {speed.toFixed(1)}x
                    </span>
                    <span className="text-[9px] text-zinc-400 hidden sm:block">~{calculatedWpm} WPM</span>
                  </div>

                  <button
                    onClick={() => setSpeed((prev) => Math.min(10, Math.round((prev + 0.5) * 10) / 10))}
                    className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] active:scale-90 font-bold"
                    title="Increase Speed (Up Arrow)"
                  >
                    +
                  </button>
                </div>

                {/* Quick Mirror Toggle */}
                <button
                  onClick={() => setMirrorX(!mirrorX)}
                  title="Glass Mirror Flip (M)"
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl border transition-all active:scale-95 shrink-0",
                    mirrorX
                      ? "bg-cyan-500/25 border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                      : "bg-white/[0.06] border-white/[0.08] text-zinc-300 hover:text-white"
                  )}
                >
                  <FlipHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Eye Guide Quick Toggle */}
                <button
                  onClick={() => setShowFocusLine(!showFocusLine)}
                  title={showFocusLine ? "Turn Off Eyeline Guide (E)" : "Turn On Eyeline Guide (E)"}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl border transition-all active:scale-95 shrink-0",
                    showFocusLine
                      ? "bg-cyan-500/25 border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                      : "bg-white/[0.06] border-white/[0.08] text-zinc-300 hover:text-white"
                  )}
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Camera Quick Toggle */}
                <button
                  onClick={toggleCamera}
                  title="Camera Monitor (C)"
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl border transition-all active:scale-95 shrink-0",
                    cameraActive
                      ? "bg-purple-500/25 border-purple-500/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                      : "bg-white/[0.06] border-white/[0.08] text-zinc-300 hover:text-white"
                  )}
                >
                  {cameraActive ? (
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <CameraOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                {/* Fullscreen Quick Toggle */}
                <button
                  onClick={toggleFullscreen}
                  title="Fullscreen (F)"
                  className="p-2.5 sm:p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-white transition-all active:scale-95 shrink-0"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Helper Bar (Desktop only) */}
          <div className="hidden lg:flex items-center justify-between text-[11px] text-zinc-500 px-3 py-2">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px] text-zinc-300">
                Space
              </kbd>
              Play/Pause
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px] text-zinc-300">
                ↑/↓
              </kbd>
              Speed
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px] text-zinc-300">
                R
              </kbd>
              Reset to Start
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px] text-zinc-300">
                M
              </kbd>
              Glass Mirror
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px] text-zinc-300">
                E
              </kbd>
              Eye Guide
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px] text-zinc-300">
                F
              </kbd>
              Fullscreen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
