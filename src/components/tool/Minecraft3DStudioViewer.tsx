"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  RotateCcw,
  Play,
  Pause,
  Sun,
  Flame,
  Layers,
  Camera,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Eye,
  EyeOff,
  Compass,
  User,
  Footprints,
  Zap,
  Hand,
  Shield,
  Waves,
  Moon,
  Orbit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MinecraftArmModel } from "@/lib/minecraft-skin";

export type SkinAnimationType = "idle" | "walk" | "run" | "fly" | "wave" | "crouch" | "swim";
export type SkinEnvironmentType = "studio" | "cyber" | "nether" | "end" | "meadow";

interface Minecraft3DStudioViewerProps {
  skinUrl: string;
  armModel: MinecraftArmModel;
  autoRotate: boolean;
  onAutoRotateChange?: (value: boolean) => void;
  className?: string;
}

const ANIMATION_OPTIONS: Array<{
  id: SkinAnimationType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "idle", label: "Idle Stance", icon: User },
  { id: "walk", label: "Walk Cycle", icon: Footprints },
  { id: "run", label: "Sprint Action", icon: Zap },
  { id: "fly", label: "Elytra Glide", icon: Compass },
  { id: "wave", label: "Wave Greeting", icon: Hand },
  { id: "crouch", label: "Sneak Crouch", icon: Shield },
  { id: "swim", label: "Water Swim", icon: Waves },
];

const ENVIRONMENT_OPTIONS: Array<{
  id: SkinEnvironmentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgHex: number;
  badgeColor: string;
  glow: string;
}> = [
  { id: "studio", label: "Studio Dark", icon: Moon, bgHex: 0x070810, badgeColor: "border-purple-500/30 text-purple-300", glow: "rgba(168,85,247,0.15)" },
  { id: "cyber", label: "Cyber Neon", icon: Zap, bgHex: 0x060514, badgeColor: "border-cyan-400/30 text-cyan-300", glow: "rgba(6,182,212,0.2)" },
  { id: "nether", label: "Nether Fire", icon: Flame, bgHex: 0x140404, badgeColor: "border-orange-500/30 text-orange-300", glow: "rgba(249,115,22,0.2)" },
  { id: "end", label: "End Void", icon: Orbit, bgHex: 0x05030e, badgeColor: "border-indigo-400/30 text-indigo-300", glow: "rgba(99,102,241,0.2)" },
  { id: "meadow", label: "Daylight Sun", icon: Sun, bgHex: 0x0a120a, badgeColor: "border-emerald-500/30 text-emerald-300", glow: "rgba(16,185,129,0.2)" },
];

export function Minecraft3DStudioViewer({
  skinUrl,
  armModel,
  autoRotate,
  onAutoRotateChange,
  className,
}: Minecraft3DStudioViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<import("skinview3d").SkinViewer | null>(null);

  const [animation, setAnimation] = useState<SkinAnimationType>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [environment, setEnvironment] = useState<SkinEnvironmentType>("studio");
  const [showOverlays, setShowOverlays] = useState(true);
  const [isAnimDropdownOpen, setIsAnimDropdownOpen] = useState(false);
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Initialize and update viewer
  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell || !skinUrl) return;

    let disposed = false;
    let observer: ResizeObserver | null = null;

    void import("skinview3d").then((skinview) => {
      if (disposed) return;

      const {
        SkinViewer,
        IdleAnimation,
        WalkingAnimation,
        RunningAnimation,
        FlyingAnimation,
        WaveAnimation,
        CrouchAnimation,
        SwimAnimation,
      } = skinview;

      const width = Math.max(280, shell.clientWidth);
      const height = Math.max(360, shell.clientHeight);

      // Select initial animation object
      const getAnimationInstance = (type: SkinAnimationType) => {
        switch (type) {
          case "walk": return new WalkingAnimation();
          case "run": return new RunningAnimation();
          case "fly": return new FlyingAnimation();
          case "wave": return new WaveAnimation();
          case "crouch": return new CrouchAnimation();
          case "swim": return new SwimAnimation();
          case "idle":
          default: return new IdleAnimation();
        }
      };

      const selectedEnv = ENVIRONMENT_OPTIONS.find((e) => e.id === environment) || ENVIRONMENT_OPTIONS[0];

      const viewer = new SkinViewer({
        canvas,
        width,
        height,
        skin: skinUrl,
        model: armModel === "slim" ? "slim" : "default",
        animation: isPaused ? undefined : getAnimationInstance(animation),
      });

      viewer.background = selectedEnv.bgHex;
      viewer.autoRotate = autoRotate;
      viewer.autoRotateSpeed = 0.6;
      viewer.controls.enablePan = false;
      viewer.controls.enableZoom = true;
      viewer.zoom = 0.8;

      // Apply overlay layer visibility
      if (viewer.playerObject?.skin) {
        viewer.playerObject.skin.setOuterLayerVisible(showOverlays);
      }

      viewerRef.current = viewer;

      const resize = () => {
        if (!viewer || !shell) return;
        viewer.setSize(Math.max(280, shell.clientWidth), Math.max(360, shell.clientHeight));
      };

      observer = new ResizeObserver(resize);
      observer.observe(shell);
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };
  }, [armModel]);

  // Dynamically load skin texture on the active viewer in real time
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !skinUrl) return;
    void viewer.loadSkin(skinUrl, { model: armModel === "slim" ? "slim" : "default" }).then(() => {
      if (viewer.playerObject?.skin) {
        viewer.playerObject.skin.setOuterLayerVisible(showOverlays);
      }
    });
  }, [skinUrl, showOverlays, armModel]);

  // Handle animation switch dynamically without recreating full canvas
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    void import("skinview3d").then((skinview) => {
      if (isPaused) {
        viewer.animation = null as any;
        return;
      }

      const {
        IdleAnimation,
        WalkingAnimation,
        RunningAnimation,
        FlyingAnimation,
        WaveAnimation,
        CrouchAnimation,
        SwimAnimation,
      } = skinview;

      switch (animation) {
        case "walk": viewer.animation = new WalkingAnimation(); break;
        case "run": viewer.animation = new RunningAnimation(); break;
        case "fly": viewer.animation = new FlyingAnimation(); break;
        case "wave": viewer.animation = new WaveAnimation(); break;
        case "crouch": viewer.animation = new CrouchAnimation(); break;
        case "swim": viewer.animation = new SwimAnimation(); break;
        case "idle":
        default: viewer.animation = new IdleAnimation(); break;
      }
    });
  }, [animation, isPaused]);

  // Handle environment / background changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const selectedEnv = ENVIRONMENT_OPTIONS.find((e) => e.id === environment) || ENVIRONMENT_OPTIONS[0];
    viewer.background = selectedEnv.bgHex;
  }, [environment]);

  // Handle autoRotate changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.autoRotate = autoRotate;
  }, [autoRotate]);

  // Handle overlay layer visibility changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer?.playerObject?.skin) return;
    viewer.playerObject.skin.setOuterLayerVisible(showOverlays);
  }, [showOverlays]);

  // Reset Camera View
  const handleResetView = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.resetCameraPose();
    viewer.zoom = 0.8;
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.zoom = Math.max(0.6, Math.min(2.5, viewer.zoom + delta));
  };

  // 3D Snapshot download
  const handleTakeSnapshot = () => {
    const viewer = viewerRef.current;
    const canvas = canvasRef.current;
    if (!viewer || !canvas) return;

    setIsCapturing(true);
    try {
      viewer.render();
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `minecraft-skin-3d-pose.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Snapshot error:", err);
    } finally {
      setTimeout(() => setIsCapturing(false), 600);
    }
  };

  const currentAnim = ANIMATION_OPTIONS.find((a) => a.id === animation) || ANIMATION_OPTIONS[0];
  const currentEnv = ENVIRONMENT_OPTIONS.find((e) => e.id === environment) || ENVIRONMENT_OPTIONS[0];

  const AnimIcon = currentAnim.icon;
  const EnvIcon = currentEnv.icon;

  return (
    <div
      ref={shellRef}
      className={cn(
        "relative h-[400px] min-h-[400px] sm:h-[580px] xl:h-[640px] w-full overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.7)] group/studio bg-[#06070e]",
        className
      )}
      style={{
        boxShadow: `0 0 60px -10px ${currentEnv.glow}`,
      }}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Minecraft Studio Viewport"
      />

      {/* Top Floating Control Dock */}
      <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Animation Selector */}
        <div className="relative pointer-events-auto">
          <button
            aria-label={`Character pose: ${currentAnim.label}`}
            onClick={() => {
              setIsAnimDropdownOpen(!isAnimDropdownOpen);
              setIsEnvDropdownOpen(false);
            }}
            className="min-h-11 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-xl transition-all cursor-pointer hover:border-cyan-400/40"
          >
            <AnimIcon className="size-3.5 text-cyan-300" />
            <span className="hidden sm:inline">{currentAnim.label}</span>
            <ChevronDown size={12} className={cn("text-zinc-400 transition-transform", isAnimDropdownOpen && "rotate-180 text-cyan-300")} />
          </button>

          {isAnimDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 max-h-[260px] overflow-y-auto w-48 rounded-2xl bg-[#090b14]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1.5 space-y-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 px-2.5 py-1 block">
                Character Poses
              </span>
              {ANIMATION_OPTIONS.map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = animation === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAnimation(opt.id);
                      setIsPaused(false);
                      setIsAnimDropdownOpen(false);
                    }}
                    className={cn(
                      "min-h-11 w-full px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors text-left cursor-pointer",
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                        : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <OptIcon className={cn("size-3.5 shrink-0", isSelected ? "text-cyan-300" : "text-zinc-400")} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Environment & Snapshot */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Environment Selector */}
          <div className="relative">
            <button
              aria-label={`Studio background: ${currentEnv.label}`}
              onClick={() => {
                setIsEnvDropdownOpen(!isEnvDropdownOpen);
                setIsAnimDropdownOpen(false);
              }}
              className="min-h-11 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-xl transition-all cursor-pointer hover:border-cyan-400/40"
            >
              <EnvIcon className="size-3.5 text-cyan-300" />
              <span className="hidden sm:inline">{currentEnv.label}</span>
              <ChevronDown size={12} className={cn("text-zinc-400 transition-transform", isEnvDropdownOpen && "rotate-180 text-cyan-300")} />
            </button>

            {isEnvDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 max-h-[260px] overflow-y-auto w-48 rounded-2xl bg-[#090b14]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1.5 space-y-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 px-2.5 py-1 block">
                  Studio Background
                </span>
                {ENVIRONMENT_OPTIONS.map((env) => {
                  const OptEnvIcon = env.icon;
                  const isSelected = environment === env.id;
                  return (
                    <button
                      key={env.id}
                      onClick={() => {
                        setEnvironment(env.id);
                        setIsEnvDropdownOpen(false);
                      }}
                      className={cn(
                        "min-h-11 w-full px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer",
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                          : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <OptEnvIcon className={cn("size-3.5 shrink-0", isSelected ? "text-cyan-300" : "text-zinc-400")} />
                        <span>{env.label}</span>
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: `#${env.bgHex.toString(16).padStart(6, '0')}` }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3D Snapshot Button */}
          <button
            onClick={handleTakeSnapshot}
            disabled={isCapturing}
            title="Download 3D Pose Snapshot (PNG)"
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-2.5 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-zinc-300 hover:text-cyan-300 shadow-xl transition-all cursor-pointer hover:border-cyan-400/40 active:scale-95 disabled:opacity-50"
          >
            <Camera size={14} className={cn(isCapturing && "animate-spin text-cyan-400")} />
          </button>
        </div>
      </div>

      {/* Right Side Vertical Studio Controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto z-20">
        {/* Play / Pause Animation */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          title={isPaused ? "Resume Animation" : "Pause Animation"}
          className="inline-flex min-h-11 min-w-11 items-center justify-center p-2.5 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-zinc-300 hover:text-white shadow-xl transition-all cursor-pointer hover:border-cyan-400/40 active:scale-95"
        >
          {isPaused ? <Play size={14} className="text-emerald-400" /> : <Pause size={14} className="text-amber-400" />}
        </button>

        {/* 3D Overlays Toggle */}
        <button
          onClick={() => setShowOverlays(!showOverlays)}
          title={showOverlays ? "Hide Outer Layer Details" : "Show Outer Layer Details"}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center p-2.5 rounded-xl backdrop-blur-xl border shadow-xl transition-all cursor-pointer active:scale-95",
            showOverlays
              ? "bg-cyan-500/25 border-cyan-400/50 text-cyan-200"
              : "bg-black/80 border-white/15 text-zinc-400 hover:text-white hover:border-white/30"
          )}
        >
          <Layers size={14} />
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => onAutoRotateChange?.(!autoRotate)}
          title={autoRotate ? "Stop Auto-Rotation" : "Enable Auto-Rotation"}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center p-2.5 rounded-xl backdrop-blur-xl border shadow-xl transition-all cursor-pointer active:scale-95",
            autoRotate
              ? "bg-cyan-500/25 border-cyan-400/50 text-cyan-200"
              : "bg-black/80 border-white/15 text-zinc-400 hover:text-white hover:border-white/30"
          )}
        >
          <Compass size={14} className={cn(autoRotate && "animate-spin [animation-duration:8s]")} />
        </button>

        {/* Reset Camera */}
        <button
          onClick={handleResetView}
          title="Reset Camera to Front"
          className="inline-flex min-h-11 min-w-11 items-center justify-center p-2.5 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-zinc-300 hover:text-white shadow-xl transition-all cursor-pointer hover:border-cyan-400/40 active:scale-95"
        >
          <RotateCcw size={14} />
        </button>

        {/* Zoom In / Out */}
        <button
          onClick={() => handleZoom(0.15)}
          title="Zoom In"
          className="min-h-11 min-w-11 items-center justify-center p-2.5 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-zinc-300 hover:text-white shadow-xl transition-all cursor-pointer hover:border-cyan-400/40 active:scale-95 hidden sm:flex"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          title="Zoom Out"
          className="min-h-11 min-w-11 items-center justify-center p-2.5 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-zinc-300 hover:text-white shadow-xl transition-all cursor-pointer hover:border-cyan-400/40 active:scale-95 hidden sm:flex"
        >
          <ZoomOut size={14} />
        </button>
      </div>

      {/* Bottom Interaction Hint */}
      <div className="pointer-events-none absolute inset-x-3 bottom-4 flex justify-center z-10">
        <span className="rounded-full border border-white/10 bg-black/75 max-w-full px-3 py-2 text-[11px] font-semibold text-zinc-400 backdrop-blur-md shadow-2xl flex items-center gap-2">
          <span className="sm:hidden">Drag to rotate</span><span className="hidden sm:inline">Click and drag to rotate</span>
          <span className="hidden sm:inline text-zinc-600">·</span>
          <span className="hidden sm:inline">Scroll to zoom</span>
        </span>
      </div>
    </div>
  );
}
