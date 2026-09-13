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
  Sliders,
  Type,
  AlignJustify,
  Sun,
  Moon,
  Sparkles,
  Keyboard,
  ArrowUp,
  ArrowDown,
  Eye,
  Settings,
  ChevronDown,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// PRESET SCRIPTS (100% Plain Everyday English)
// ============================================================================

interface ScriptPreset {
  id: string;
  title: string;
  badge: string;
  icon: string;
  text: string;
}

const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: "viral-hook",
    title: "Viral Video Hook",
    badge: "TIKTOK & REELS",
    icon: "🎬",
    text: `Stop scrolling.

If you're creating content or building an audience in 2026, here is the number one mistake that is killing your retention.

Most creators spend eighty percent of their energy perfecting the video, and zero percent on the first three seconds.

Here are the three golden rules you need to follow:

Rule number one: Never start with an introduction. Nobody cares what your name is until you've given them value.

Rule number two: State the stakes in your first sentence. Tell them what they will lose if they look away.

And rule number three: Cut out all breath pauses. Pacing is everything.

Try this on your next three videos and watch your watch-time double.`,
  },
  {
    id: "product-launch",
    title: "Product Launch Pitch",
    badge: "KEYNOTE & SAAS",
    icon: "🚀",
    text: `Good morning everyone, and thank you for being here today.

Six months ago, our team set out to solve a frustrating problem that every creator deals with every single day:

Why are creative tools still so slow, so clunky, and filled with overpriced monthly subscriptions?

Today, we're proud to officially unveil Exismic 2.0.

Everything runs entirely in your browser.
Zero server wait times.
Zero watermarks.
And zero subscription paywalls.

Whether you're generating social mockups, editing audio, or preparing scripts, the entire studio is right at your fingertips.

We can't wait to see what you build with it.`,
  },
  {
    id: "podcast-intro",
    title: "Podcast Episode Intro",
    badge: "EPISODE INTRO",
    icon: "🎙️",
    text: `Welcome back to the studio, everybody.

Today's conversation is one I have been looking forward to for months.

We are joined by visionary founders and builders who are redefining what it means to build software in the age of intelligent agentic AI.

We're going to dive deep into lessons learned, mistakes made, and the raw truth about what it actually takes to build something that matters.

Grab your favorite drink, settle in, and let's jump straight into the episode.`,
  },
];

// Color Theme Options
export type PrompterTheme = "pure-black" | "high-contrast-yellow" | "obsidian" | "clean-white";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TeleprompterStudio() {
  // Script text state
  const [scriptText, setScriptText] = useState<string>(SCRIPT_PRESETS[0].text);

  // Auto-scroll State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(4); // 1 to 10
  const [fontSize, setFontSize] = useState<number>(44); // 24 to 76 px
  const [columnWidth, setColumnWidth] = useState<number>(680); // 400 to 1100 px
  const [lineHeight, setLineHeight] = useState<number>(1.6); // 1.3 to 2.0

  // Mirror Modes
  const [mirrorX, setMirrorX] = useState<boolean>(false);
  const [mirrorY, setMirrorY] = useState<boolean>(false);

  // Webcam PiP
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Visual Styling
  const [theme, setTheme] = useState<PrompterTheme>("pure-black");
  const [showFocusLine, setShowFocusLine] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);

  // Editor vs Prompter mode
  const [viewMode, setViewMode] = useState<"edit" | "prompter">("prompter");

  // DOM Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start / Stop Camera
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
        setCameraError("Camera access was blocked or not found.");
      }
    }
  };

  // Sync video element when cameraActive becomes true
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Fullscreen toggle
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

  // Listen for fullscreen change event
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Smooth Auto-Scroll Loop
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollLoop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying && scrollContainer) {
        // Speed formula: calibrated pixels per second (1 = 20px/s, 10 = 200px/s)
        const pixelsPerSecond = speed * 22;
        scrollContainer.scrollTop += pixelsPerSecond * delta;

        // Auto pause if reached bottom
        const atBottom =
          scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 5;
        if (atBottom) {
          setIsPlaying(false);
        }
      }

      animFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    animFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  // Reset scroll position to top
  const handleReset = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsPlaying(false);
  };

  // Keyboard Shortcuts (Space to play/pause, Arrow keys for speed, R to reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when actively typing in text editor
      if (viewMode === "edit" || (e.target as HTMLElement)?.tagName === "TEXTAREA" || (e.target as HTMLElement)?.tagName === "INPUT") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setSpeed((prev) => Math.min(10, prev + 0.5));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setSpeed((prev) => Math.max(1, prev - 0.5));
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReset();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode]);

  // Auto-hide controls during active presentation when mouse is idle
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  };

  // Theme Styling
  const themeStyles = {
    "pure-black": {
      bg: "bg-black",
      text: "text-white",
      subtext: "text-zinc-400",
      line: "border-sky-500/40 bg-sky-500/10",
      pill: "bg-white/10 text-white",
      card: "bg-zinc-950 border-zinc-800",
    },
    "high-contrast-yellow": {
      bg: "bg-black",
      text: "text-[#fef08a]",
      subtext: "text-amber-200/70",
      line: "border-amber-400/50 bg-amber-400/10",
      pill: "bg-amber-400/20 text-amber-300",
      card: "bg-zinc-950 border-amber-500/30",
    },
    obsidian: {
      bg: "bg-[#080914]",
      text: "text-zinc-100",
      subtext: "text-zinc-400",
      line: "border-purple-500/40 bg-purple-500/10",
      pill: "bg-purple-500/20 text-purple-300",
      card: "bg-[#0d1020] border-purple-500/20",
    },
    "clean-white": {
      bg: "bg-white",
      text: "text-zinc-950",
      subtext: "text-zinc-600",
      line: "border-blue-500/40 bg-blue-500/10",
      pill: "bg-black/10 text-black",
      card: "bg-zinc-50 border-zinc-200",
    },
  }[theme];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Top Banner / Sample Script Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b0f19]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">Script Inspiration:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SCRIPT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setScriptText(preset.text);
                handleReset();
              }}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white transition-all active:scale-95 flex items-center gap-1"
            >
              <span>{preset.icon}</span>
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher: Script Editor vs Live Prompter */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-[#090b14] border border-white/[0.08]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("prompter")}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5",
              viewMode === "prompter"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Prompter View
          </button>
          <button
            onClick={() => setViewMode("edit")}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5",
              viewMode === "edit"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Type className="w-3.5 h-3.5" />
            Edit Script Text
          </button>
        </div>

        {/* Keyboard Shortcut Hint Pill */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 pr-2">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px]">
              Space
            </kbd>
            Play/Pause
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px]">
              ↑/↓
            </kbd>
            Speed
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px]">
              F
            </kbd>
            Fullscreen
          </span>
        </div>
      </div>

      {/* Script Editor Drawer (Visible when viewMode === "edit") */}
      {viewMode === "edit" ? (
        <div className="p-5 rounded-3xl bg-[#090b14]/95 border border-white/[0.08] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              Type or Paste Your Script
            </h3>
            <span className="text-xs text-zinc-500">
              {scriptText.split(/\s+/).filter(Boolean).length} words · ~
              {Math.ceil(scriptText.split(/\s+/).filter(Boolean).length / 130)} min read
            </span>
          </div>

          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            rows={12}
            placeholder="Type or paste your video script here..."
            className="w-full p-4 text-base rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400 transition-colors leading-relaxed font-sans resize-y"
          />

          <div className="flex justify-end">
            <button
              onClick={() => {
                setViewMode("prompter");
                handleReset();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-cyan-400 hover:opacity-90 text-white shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              Save & Launch Teleprompter
            </button>
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* LIVE PROMPTER STAGE & FLOATING HUD */
        /* ================================================================= */
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          className={cn(
            "relative w-full rounded-3xl overflow-hidden border transition-all select-none min-h-[550px] h-[680px] flex flex-col items-center justify-center",
            themeStyles.bg,
            isFullscreen ? "fixed inset-0 z-[99999] rounded-none border-none h-screen" : "border-white/[0.08]"
          )}
        >
          {/* Top & Bottom Atmospheric Reading Fades */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

          {/* Center Focus Eye Line Indicator */}
          {showFocusLine && (
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-between px-6">
              <div className="h-[2px] w-12 bg-purple-400/80 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <div className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-purple-500/20 border border-purple-500/40 text-purple-300 backdrop-blur-md">
                ▶ EYE CONTACT ZONE ◀
              </div>
              <div className="h-[2px] w-12 bg-purple-400/80 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </div>
          )}

          {/* Draggable / Floating Selfie Camera Preview */}
          {cameraActive && (
            <div className="absolute top-6 right-6 z-30 w-36 sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden border-2 border-purple-400/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                CAM LIVE
              </div>
            </div>
          )}

          {/* The Actual Scrolling Text Container */}
          <div
            ref={scrollContainerRef}
            className="w-full h-full overflow-y-scroll scrollbar-none px-4 sm:px-8 pt-[320px] pb-[360px]"
          >
            <div
              style={{
                maxWidth: `${columnWidth}px`,
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                transform: `${mirrorX ? "scaleX(-1)" : ""} ${mirrorY ? "scaleY(-1)" : ""}`.trim() || undefined,
              }}
              className={cn(
                "mx-auto font-sans font-semibold tracking-normal text-center transition-transform duration-200 whitespace-pre-line break-words",
                themeStyles.text
              )}
            >
              {scriptText}
            </div>
          </div>

          {/* =============================================================== */}
          {/* FLOATING HUD CONTROLS (Auto-hides on idle when playing) */}
          {/* =============================================================== */}
          <div
            className={cn(
              "absolute bottom-6 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 w-[94%] max-w-2xl",
              controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className="p-3.5 sm:p-4 rounded-3xl bg-[#090b14]/90 border border-white/[0.12] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-3">
              {/* Primary Controls Row: Play/Pause, Reset, Speed Slider */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Master Play / Pause */}
                  <button
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 text-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  {/* Reset to Top */}
                  <button
                    onClick={handleReset}
                    title="Reset to Top"
                    className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Slider */}
                <div className="flex-1 max-w-[200px] sm:max-w-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400 font-medium">Scroll Speed</span>
                    <span className="font-mono text-purple-300 font-bold">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-lg bg-white/[0.1] accent-purple-400 cursor-pointer"
                  />
                </div>

                {/* Quick Toggle Cluster */}
                <div className="flex items-center gap-1.5">
                  {/* Mirror Horizontal */}
                  <button
                    onClick={() => setMirrorX(!mirrorX)}
                    title="Mirror Horizontal (For teleprompter glass)"
                    className={cn(
                      "p-2.5 rounded-xl border transition-all active:scale-95",
                      mirrorX
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"
                        : "bg-white/[0.06] border-white/[0.08] text-zinc-400 hover:text-white"
                    )}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>

                  {/* Camera Selfie PiP */}
                  <button
                    onClick={toggleCamera}
                    title={cameraActive ? "Turn Off Camera" : "Turn On Camera Preview"}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all active:scale-95",
                      cameraActive
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-white/[0.06] border-white/[0.08] text-zinc-400 hover:text-white"
                    )}
                  >
                    {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </button>

                  {/* Fullscreen Mode */}
                  <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white transition-all active:scale-95"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secondary Tuning Row: Font Size & Reading Column Width */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-4 text-xs">
                {/* Font Size */}
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-zinc-400 shrink-0 text-[11px]">Text Size:</span>
                  <input
                    type="range"
                    min="24"
                    max="76"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-1 rounded-lg bg-white/[0.1] accent-purple-400 cursor-pointer"
                  />
                  <span className="font-mono text-zinc-300 text-[11px] shrink-0">{fontSize}px</span>
                </div>

                {/* Column Width */}
                <div className="hidden sm:flex items-center gap-2 flex-1">
                  <span className="text-zinc-400 shrink-0 text-[11px]">Margin:</span>
                  <input
                    type="range"
                    min="420"
                    max="1000"
                    step="20"
                    value={columnWidth}
                    onChange={(e) => setColumnWidth(parseInt(e.target.value))}
                    className="w-full h-1 rounded-lg bg-white/[0.1] accent-cyan-400 cursor-pointer"
                  />
                  <span className="font-mono text-zinc-300 text-[11px] shrink-0">{columnWidth}px</span>
                </div>

                {/* Theme Selector Pills */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setTheme("pure-black")}
                    title="Pitch Black OLED"
                    className={cn(
                      "w-5 h-5 rounded-full border transition-all",
                      theme === "pure-black" ? "border-cyan-400 scale-110" : "border-zinc-700 bg-black"
                    )}
                  />
                  <button
                    onClick={() => setTheme("high-contrast-yellow")}
                    title="High-Contrast Yellow"
                    className={cn(
                      "w-5 h-5 rounded-full border bg-black transition-all",
                      theme === "high-contrast-yellow" ? "border-amber-400 scale-110 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "border-zinc-700"
                    )}
                  >
                    <span className="block w-2.5 h-2.5 mx-auto rounded-full bg-yellow-300" />
                  </button>
                  <button
                    onClick={() => setTheme("obsidian")}
                    title="Obsidian Cyber"
                    className={cn(
                      "w-5 h-5 rounded-full border bg-[#080914] transition-all",
                      theme === "obsidian" ? "border-purple-400 scale-110" : "border-zinc-700"
                    )}
                  />
                  <button
                    onClick={() => setTheme("clean-white")}
                    title="Clean White"
                    className={cn(
                      "w-5 h-5 rounded-full border bg-white transition-all",
                      theme === "clean-white" ? "border-zinc-900 scale-110" : "border-zinc-400"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
