"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Download,
  Eraser,
  Stamp,
  LocateFixed,
  RotateCcw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sliders,
  Eye,
  Camera,
  Layers,
  Sparkle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DemoBlueprint {
  id: string;
  name: string;
  badge: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  region: Region;
}

const DEMO_BLUEPRINTS: DemoBlueprint[] = [
  {
    id: "stock-photo",
    name: "Stock Watermark",
    badge: "CORNER LOGO",
    category: "Photography",
    icon: Stamp,
    description: "Remove stock photography copyright marks and diagonal grid text",
    region: { x: 0.54, y: 0.72, width: 0.40, height: 0.20 },
  },
  {
    id: "camera-timestamp",
    name: "Date & Time Stamp",
    badge: "DIGITAL CLOCK",
    category: "Travel & Snaps",
    icon: Camera,
    description: "Erase bright digital orange camera date codes without blurring background",
    region: { x: 0.58, y: 0.78, width: 0.38, height: 0.16 },
  },
  {
    id: "brand-emblem",
    name: "Brand Logo Overlay",
    badge: "CENTER BADGE",
    category: "Commercial",
    icon: Layers,
    description: "Clean out central semi-transparent sample stamps and agency watermarks",
    region: { x: 0.28, y: 0.36, width: 0.44, height: 0.26 },
  },
];

const PRESETS: Array<{ label: string; icon: React.ComponentType<{ size?: number; className?: string }>; region: Region }> = [
  { label: "Bottom Right Corner", icon: Stamp, region: { x: 0.56, y: 0.74, width: 0.40, height: 0.20 } },
  { label: "Bottom Full Bar", icon: Sliders, region: { x: 0.05, y: 0.80, width: 0.90, height: 0.16 } },
  { label: "Center Logo Stamp", icon: Layers, region: { x: 0.28, y: 0.36, width: 0.44, height: 0.26 } },
  { label: "Date / Time Stamp", icon: Camera, region: { x: 0.60, y: 0.80, width: 0.36, height: 0.15 } },
];

// Helper to generate photorealistic demonstration images with sample watermarks (100% Client-Side)
function generateDemoCanvas(type: string): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (type === "stock-photo") {
      // Sunset coastal landscape
      const skyGradient = ctx.createLinearGradient(0, 0, 0, 550);
      skyGradient.addColorStop(0, "#0f172a");
      skyGradient.addColorStop(0.35, "#312e81");
      skyGradient.addColorStop(0.65, "#c026d3");
      skyGradient.addColorStop(0.85, "#ea580c");
      skyGradient.addColorStop(1, "#facc15");
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, 1200, 550);

      // Sun disc
      ctx.beginPath();
      ctx.arc(600, 390, 55, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 40;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mountain ridge
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(240, 360);
      ctx.lineTo(460, 440);
      ctx.lineTo(600, 370);
      ctx.lineTo(820, 460);
      ctx.lineTo(1050, 340);
      ctx.lineTo(1200, 440);
      ctx.lineTo(1200, 550);
      ctx.lineTo(0, 550);
      ctx.fill();

      // Ocean floor
      const oceanGradient = ctx.createLinearGradient(0, 550, 0, 800);
      oceanGradient.addColorStop(0, "#0e7490");
      oceanGradient.addColorStop(0.4, "#0369a1");
      oceanGradient.addColorStop(1, "#082f49");
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 550, 1200, 250);

      // Water ripples reflection
      ctx.fillStyle = "rgba(250, 204, 21, 0.35)";
      for (let y = 560; y < 750; y += 14) {
        const spread = (y - 540) * 0.9;
        ctx.fillRect(600 - spread / 2, y, spread, 4);
      }

      // Sample Stock Watermark Overlay (in lower-right zone)
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 2;
      ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.strokeText("© EXISMIC STOCK PHOTO", 720, 680);
      ctx.fillText("© EXISMIC STOCK PHOTO", 720, 680);

      ctx.font = "bold 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.strokeText("PREVIEW ONLY · DO NOT DISTRIBUTE", 724, 715);
      ctx.fillText("PREVIEW ONLY · DO NOT DISTRIBUTE", 724, 715);
      ctx.restore();
    } else if (type === "camera-timestamp") {
      // Urban moody night street
      const bg = ctx.createLinearGradient(0, 0, 1200, 800);
      bg.addColorStop(0, "#030712");
      bg.addColorStop(0.5, "#111827");
      bg.addColorStop(1, "#1e293b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 800);

      // Architectural grid perspective
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      for (let x = 100; x < 1200; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x * 0.7 + 180, 800);
        ctx.stroke();
      }

      // Warm street lights bokeh
      const bokehColors = ["rgba(249, 115, 22, 0.35)", "rgba(6, 182, 212, 0.35)", "rgba(168, 85, 247, 0.3)"];
      for (let i = 0; i < 18; i++) {
        const bx = (i * 73) % 1100 + 50;
        const by = (i * 97) % 650 + 50;
        const br = 25 + (i % 5) * 12;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = bokehColors[i % bokehColors.length];
        ctx.fill();
      }

      // Digital Orange Camera Timestamp (Lower-Right)
      ctx.save();
      ctx.font = "bold 44px 'Courier New', monospace";
      ctx.fillStyle = "#f97316";
      ctx.shadowColor = "#ea580c";
      ctx.shadowBlur = 12;
      ctx.fillText("'26 09 21  18:42:09", 740, 720);
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      // Brand Emblem Studio Mockup
      const studioGradient = ctx.createRadialGradient(600, 400, 80, 600, 400, 650);
      studioGradient.addColorStop(0, "#1e1b4b");
      studioGradient.addColorStop(0.6, "#0f172a");
      studioGradient.addColorStop(1, "#020617");
      ctx.fillStyle = studioGradient;
      ctx.fillRect(0, 0, 1200, 800);

      // Geometric isometric cube centerpiece
      ctx.strokeStyle = "rgba(6, 182, 212, 0.45)";
      ctx.lineWidth = 3;
      ctx.strokeRect(400, 240, 400, 320);

      // Central Stamp / Badge
      ctx.save();
      ctx.fillStyle = "rgba(236, 72, 153, 0.18)";
      ctx.strokeStyle = "rgba(236, 72, 153, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(430, 350, 340, 100, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 24px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("WATERMARK SAMPLE", 600, 395);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("CONFIDENTIAL PROOF · DRAFT 1.0", 600, 425);
      ctx.restore();
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], `sample-${type}.jpg`, { type: "image/jpeg" }));
      }
    }, "image/jpeg", 0.95);
  });
}

export function WatermarkRemover() {
  const { isPro } = useCredits();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Region and placement parameters
  const [region, setRegion] = useState<Region>(PRESETS[0].region);
  const [strength, setStrength] = useState<number>(75);
  const [activePresetId, setActivePresetId] = useState<string>("Bottom Right Corner");

  // Interactive zoom and split view
  const [zoom, setZoom] = useState<number>(1);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [showOriginalPeek, setShowOriginalPeek] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"canvas" | "controls" | "presets">("canvas");

  const stageRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [isResizingBox, setIsResizingBox] = useState(false);
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });
  const isInteractingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const interactionTypeRef = useRef<"drag" | "resize" | null>(null);
  const resizeHandleRef = useRef<"se" | "nw">("se");
  const startRegionRef = useRef<Region>(PRESETS[0].region);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("data:")) URL.revokeObjectURL(preview);
      if (result && !result.startsWith("data:")) URL.revokeObjectURL(result);
    };
  }, [preview, result]);

  // Global Clipboard Paste Listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            loadFile(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const loadFile = useCallback((selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WebP, or AVIF).");
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
    setProgress(0);
    setSliderPos(50);
    setZoom(1);
  }, []);

  const handleSelectDemo = async (demo: DemoBlueprint) => {
    try {
      const demoFile = await generateDemoCanvas(demo.id);
      loadFile(demoFile);
      setRegion(demo.region);
      setActivePresetId(demo.name);
    } catch {
      setError("Failed to load demonstration photo.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => accepted[0] && loadFile(accepted[0]),
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".avif"] },
    multiple: false,
    noClick: Boolean(preview), // When preview is active, stage clicks position the box
  });

  // Center the removal zone on click ONLY if user didn't drag or resize
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (result || isInteractingRef.current || hasMovedRef.current || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    // Check if clicked inside the rendered photo
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      return;
    }
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    setRegion((curr) => ({
      ...curr,
      x: Math.max(0, Math.min(1 - curr.width, clickX - curr.width / 2)),
      y: Math.max(0, Math.min(1 - curr.height, clickY - curr.height / 2)),
    }));
  };

  // Dragging the removal zone
  const handleBoxStart = (clientX: number, clientY: number) => {
    if (result || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    isInteractingRef.current = true;
    hasMovedRef.current = false;
    interactionTypeRef.current = "drag";
    startRegionRef.current = { ...region };
    setIsDraggingBox(true);

    dragStartOffsetRef.current = {
      x: (clientX - rect.left) / rect.width - region.x,
      y: (clientY - rect.top) / rect.height - region.y,
    };
  };

  // Resizing the removal zone from corner handles
  const handleResizeStart = (clientX: number, clientY: number, handle: "se" | "nw") => {
    if (result || !imageContainerRef.current) return;
    isInteractingRef.current = true;
    hasMovedRef.current = false;
    interactionTypeRef.current = "resize";
    resizeHandleRef.current = handle;
    startRegionRef.current = { ...region };
    setIsResizingBox(true);
  };

  // Mouse move and Touch coordinates tracking for drag and resize
  useEffect(() => {
    if (!isDraggingBox && !isResizingBox) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!imageContainerRef.current || !isInteractingRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      const currentX = (clientX - rect.left) / rect.width;
      const currentY = (clientY - rect.top) / rect.height;

      hasMovedRef.current = true;

      if (interactionTypeRef.current === "drag") {
        setRegion((curr) => {
          const newX = Math.max(0, Math.min(1 - curr.width, currentX - dragStartOffsetRef.current.x));
          const newY = Math.max(0, Math.min(1 - curr.height, currentY - dragStartOffsetRef.current.y));
          return { ...curr, x: Number(newX.toFixed(4)), y: Number(newY.toFixed(4)) };
        });
      } else if (interactionTypeRef.current === "resize") {
        const initial = startRegionRef.current;
        if (resizeHandleRef.current === "se") {
          // Bottom-Right handle: top-left is fixed anchor
          const newW = Math.max(0.05, Math.min(1 - initial.x, currentX - initial.x));
          const newH = Math.max(0.04, Math.min(1 - initial.y, currentY - initial.y));
          setRegion((curr) => ({
            ...curr,
            width: Number(newW.toFixed(4)),
            height: Number(newH.toFixed(4)),
          }));
        } else if (resizeHandleRef.current === "nw") {
          // Top-Left handle: bottom-right is fixed anchor
          const anchorX = initial.x + initial.width;
          const anchorY = initial.y + initial.height;
          const newX = Math.max(0, Math.min(anchorX - 0.05, currentX));
          const newY = Math.max(0, Math.min(anchorY - 0.04, currentY));
          setRegion((curr) => ({
            ...curr,
            x: Number(newX.toFixed(4)),
            y: Number(newY.toFixed(4)),
            width: Number((anchorX - newX).toFixed(4)),
            height: Number((anchorY - newY).toFixed(4)),
          }));
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      isInteractingRef.current = false;
      interactionTypeRef.current = null;
      setIsDraggingBox(false);
      setIsResizingBox(false);
      // Keep hasMovedRef momentarily true so upcoming click event will NOT recenter the box!
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 160);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDraggingBox, isResizingBox]);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(12);
    setStatusMessage("Analyzing selected watermark zone...");
    setError(null);

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        if (prev >= 65) setStatusMessage("Blending seamless color transitions...");
        else if (prev >= 35) setStatusMessage("Reconstructing underlying texture...");
        return prev + 8;
      });
    }, 280);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("region", JSON.stringify(region));
      formData.append("strength", strength.toString());
      formData.append("priority", String(Boolean(isPro)));

      const response = await fetch("/api/tools/image/watermark-remover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Watermark removal failed. Please try again.");
      }

      const blob = await response.blob();
      setResult(URL.createObjectURL(blob));
      setProgress(100);
      setStatusMessage("Clean photo ready!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cleaning failed. Please try again.");
    } finally {
      window.clearInterval(interval);
      window.setTimeout(() => setIsProcessing(false), 250);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    setError(null);
    setRegion(PRESETS[0].region);
    setActivePresetId(PRESETS[0].label);
    setZoom(1);
  };

  const handleCopyCleanImage = async () => {
    if (!result) return;
    try {
      const res = await fetch(result);
      const blob = await res.blob();
      const pngBlob = blob.type === "image/png" ? blob : new Blob([blob], { type: "image/png" });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Unable to copy directly. Please use the Download button.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5 pb-20 sm:pb-24 lg:pb-0">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#090c16]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Eraser className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Watermark & Stamp Eraser</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                Clean Restoration
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Mark unwanted logos, timestamps, or watermarks to erase them seamlessly</p>
          </div>
        </div>

        {preview && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">New Photo</span>
          </button>
        )}
      </div>

      {!preview ? (
        /* INITIAL STUDIO SHOWCASE & DEMONSTRATION BLUEPRINTS */
        <div className="space-y-5">
          {/* Main Dropzone Hero */}
          <div
            {...getRootProps()}
            className={cn(
              "relative min-h-[380px] sm:min-h-[440px] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 sm:p-10 text-center cursor-pointer overflow-hidden shadow-2xl group",
              isDragActive
                ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_40px_rgba(6,182,212,0.25)]"
                : "border-white/[0.12] bg-[#090c16]/90 hover:border-cyan-400/50 hover:bg-[#0c101e]/90"
            )}
          >
            <input {...getInputProps()} />

            {/* Ambient Lighting Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-lg space-y-4">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.25)] group-hover:scale-105 transition-transform duration-300">
                <Upload size={32} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Upload Photo or Paste from Clipboard
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Drag and drop your image here, browse your files, or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs border border-white/15">Ctrl + V</kbd> to paste
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
                <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">PNG • JPG • WebP • AVIF</span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">Up to 20MB</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">Private & Secure</span>
              </div>

              <div className="pt-2">
                <span className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all">
                  Choose Image
                </span>
              </div>
            </div>
          </div>

          {/* Instant 1-Click Demonstration Blueprints */}
          <div className="p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <Stamp className="w-3.5 h-3.5 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Instant Test Examples (1-Click Try)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Try without uploading</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_BLUEPRINTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-400/40 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                        <Icon size={16} />
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                        {demo.badge}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {demo.name}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                        {demo.description}
                      </p>
                    </div>

                    <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Load Example</span>
                      <span>→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE EDITING STUDIO WORKSPACE */
        <div>
          {/* Mobile View Switcher */}
          <div className="lg:hidden grid grid-cols-2 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg mb-4">
            <button
              onClick={() => setActiveMobileTab("canvas")}
              className={cn(
                "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeMobileTab === "canvas"
                  ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preview & Presets</span>
            </button>
            <button
              onClick={() => setActiveMobileTab("controls")}
              className={cn(
                "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeMobileTab === "controls"
                  ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Eraser Controls</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ================================================================= */}
            {/* LEFT COLUMN: INTERACTIVE CANVAS STAGE */}
            {/* ================================================================= */}
            <div
              className={cn(
                "lg:col-span-7 space-y-4",
                activeMobileTab !== "canvas" ? "hidden lg:block" : "block"
              )}
            >
              <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-3">
                {/* Window Titlebar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-mono text-zinc-400 truncate max-w-[140px] sm:max-w-xs">
                      {file?.name || "photo.jpg"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Clean Zoom Controls Toolbar — OFF THE IMAGE */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-black/50 border border-white/[0.1]">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                        title="Zoom Out"
                        className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <span className="text-[11px] font-mono font-semibold text-zinc-300 px-1 min-w-[38px] text-center select-none">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(2))))}
                        title="Zoom In"
                        className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ZoomIn size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(1)}
                        title="Reset Zoom to 100%"
                        className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>

                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border",
                      result
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                    )}>
                      {result ? "Clean Result Ready" : "Position Removal Zone"}
                    </span>
                  </div>
                </div>

                {/* Interactive Stage Enclosure */}
                <div
                  ref={stageRef}
                  onClick={handleStageClick}
                  className="relative min-h-[380px] sm:min-h-[460px] max-h-[560px] w-full rounded-2xl bg-[#04060d] border border-white/[0.08] overflow-hidden flex items-center justify-center shadow-inner select-none cursor-crosshair p-2"
                >
                  <div
                    style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                    className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-100"
                  >
                    {!result || showOriginalPeek ? (
                      /* Source Mode: Image container with EXACT rendered dimensions */
                      <div
                        ref={imageContainerRef}
                        className="relative inline-block select-none max-w-full max-h-[520px]"
                      >
                        <img
                          src={preview}
                          alt="Source"
                          className="max-h-[520px] max-w-full w-auto h-auto object-contain block rounded-lg select-none pointer-events-none"
                          draggable={false}
                        />

                        {/* Interactive Drag & Resize Removal Zone */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleBoxStart(e.clientX, e.clientY);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            if (e.touches[0]) handleBoxStart(e.touches[0].clientX, e.touches[0].clientY);
                          }}
                          className="absolute border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_24px_rgba(6,182,212,0.45)] rounded-xl cursor-move group select-none transition-shadow"
                          style={{
                            left: `${region.x * 100}%`,
                            top: `${region.y * 100}%`,
                            width: `${region.width * 100}%`,
                            height: `${region.height * 100}%`,
                          }}
                        >
                          {/* Top Floating Badge */}
                          <div className="absolute -top-7 left-0 px-2 py-0.5 rounded bg-cyan-500 text-black text-[9px] font-black uppercase tracking-wider pointer-events-none select-none flex items-center gap-1 shadow-md whitespace-nowrap">
                            <Eraser size={10} />
                            <span>Eraser Zone</span>
                          </div>

                          {/* Dimensions Indicator */}
                          <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-cyan-200 bg-black/70 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none select-none">
                            {Math.round(region.width * 100)}% × {Math.round(region.height * 100)}%
                          </div>

                          {/* Corner Resize Handle - Bottom-Right (SE) */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleResizeStart(e.clientX, e.clientY, "se");
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              if (e.touches[0]) handleResizeStart(e.touches[0].clientX, e.touches[0].clientY, "se");
                            }}
                            className="absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-md bg-cyan-300 border-2 border-black shadow-lg cursor-se-resize flex items-center justify-center hover:scale-125 transition-transform z-20"
                            title="Drag to resize zone"
                          >
                            <div className="w-1.5 h-1.5 bg-black rounded-xs" />
                          </div>

                          {/* Corner Resize Handle - Top-Left (NW) */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleResizeStart(e.clientX, e.clientY, "nw");
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              if (e.touches[0]) handleResizeStart(e.touches[0].clientX, e.touches[0].clientY, "nw");
                            }}
                            className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-md bg-cyan-300 border-2 border-black shadow-lg cursor-nw-resize flex items-center justify-center hover:scale-125 transition-transform z-20"
                            title="Drag to resize zone"
                          >
                            <div className="w-1.5 h-1.5 bg-black rounded-xs" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Clean Result Mode: Interactive Split Before/After Slider */
                      <div
                        ref={imageContainerRef}
                        className="relative inline-block max-h-[520px] max-w-full select-none overflow-hidden rounded-lg cursor-ew-resize"
                        onMouseDown={(e) => {
                          const rect = imageContainerRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          setSliderPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
                        }}
                        onMouseMove={(e) => {
                          if (e.buttons !== 1) return;
                          const rect = imageContainerRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          setSliderPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
                        }}
                        onTouchMove={(e) => {
                          if (!e.touches[0]) return;
                          const rect = imageContainerRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          setSliderPos(Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100)));
                        }}
                      >
                        {/* Before (Original) Background */}
                        <img
                          src={preview}
                          alt="Original"
                          className="max-h-[520px] max-w-full w-auto h-auto object-contain block rounded-lg select-none pointer-events-none"
                          draggable={false}
                        />

                        {/* After (Cleaned) Foreground masked by split slider */}
                        <div
                          className="absolute inset-0 overflow-hidden select-none pointer-events-none"
                          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                        >
                          <img
                            src={result}
                            alt="Cleaned"
                            className="max-h-[520px] max-w-full w-auto h-auto object-contain block rounded-lg select-none pointer-events-none"
                            draggable={false}
                          />
                        </div>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 uppercase tracking-wider shadow-md pointer-events-none">
                          Cleaned
                        </div>
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 border border-white/20 text-[10px] font-bold text-zinc-300 uppercase tracking-wider shadow-md pointer-events-none">
                          Original
                        </div>

                        {/* Draggable Divider Line & Grip */}
                        <div
                          className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
                          style={{ left: `${sliderPos}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xl border border-black/20">
                            <Sliders size={14} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Processing Holographic Overlay */}
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 space-y-4"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>

                        <div className="text-center space-y-1.5 max-w-sm">
                          <p className="text-sm font-bold text-white tracking-tight">{statusMessage}</p>
                          <p className="text-[11px] font-mono text-cyan-300">{progress}% complete</p>
                        </div>

                        <div className="w-full max-w-xs h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            style={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300 rounded-full"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Result Peek Helper */}
                  {result && (
                    <div className="absolute bottom-3 left-3 z-30">
                      <button
                        type="button"
                        onMouseDown={() => setShowOriginalPeek(true)}
                        onMouseUp={() => setShowOriginalPeek(false)}
                        onTouchStart={() => setShowOriginalPeek(true)}
                        onTouchEnd={() => setShowOriginalPeek(false)}
                        className="px-2.5 py-1.5 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md text-[10px] font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                      >
                        <Eye size={12} className="text-cyan-400" />
                        <span>Hold to View Original</span>
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <span>⚠</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* 4 Clean Zone Presets Card — Directly below the Preview */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Clean Zone Presets
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Instant 1-click alignment</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESETS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = activePresetId === p.label;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setRegion(p.region);
                          setActivePresetId(p.label);
                          setResult(null);
                        }}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between gap-2.5 group",
                          isSelected
                            ? "bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-transparent border-cyan-400/50 shadow-xs text-white"
                            : "bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/[0.12] text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "w-7 h-7 rounded-xl flex items-center justify-center transition-colors",
                            isSelected ? "bg-cyan-500/20 text-cyan-300" : "bg-white/[0.04] text-zinc-400 group-hover:text-zinc-200"
                          )}>
                            <Icon size={14} />
                          </div>
                          {isSelected && <Check size={13} className="text-cyan-400" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold tracking-tight block text-zinc-200 group-hover:text-white">
                            {p.label}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500">
                            {Math.round(p.region.width * 100)}% × {Math.round(p.region.height * 100)}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* RIGHT COLUMN: CONTROLS, ZONE TUNING & PRESETS */}
            {/* ================================================================= */}
            <div
              className={cn(
                "lg:col-span-5 space-y-4",
                activeMobileTab === "canvas" ? "hidden lg:block" : "block"
              )}
            >
              {/* Main Controls Card */}
              <div className="p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Eraser Controls</span>
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500">Fine-tune removal</span>
                </div>

                {/* Slider 1: Zone Width */}
                <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-200">Zone Width</label>
                    <span className="text-xs font-bold font-mono text-cyan-400">
                      {Math.round(region.width * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="90"
                    value={Math.round(region.width * 100)}
                    onChange={(e) => {
                      const newW = Number(e.target.value) / 100;
                      setRegion((curr) => ({
                        ...curr,
                        width: newW,
                        x: Math.min(curr.x, 1 - newW),
                      }));
                      setResult(null);
                    }}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[
                      { label: "15% Small", val: 0.15 },
                      { label: "35% Mid", val: 0.35 },
                      { label: "60% Wide", val: 0.60 },
                      { label: "85% Bar", val: 0.85 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          setRegion((curr) => ({ ...curr, width: chip.val, x: Math.min(curr.x, 1 - chip.val) }));
                          setResult(null);
                        }}
                        className={cn(
                          "py-1 px-1 text-[10px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                          Math.abs(region.width - chip.val) < 0.05
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold"
                            : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white"
                        )}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider 2: Zone Height */}
                <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-200">Zone Height</label>
                    <span className="text-xs font-bold font-mono text-cyan-400">
                      {Math.round(region.height * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="60"
                    value={Math.round(region.height * 100)}
                    onChange={(e) => {
                      const newH = Number(e.target.value) / 100;
                      setRegion((curr) => ({
                        ...curr,
                        height: newH,
                        y: Math.min(curr.y, 1 - newH),
                      }));
                      setResult(null);
                    }}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[
                      { label: "10% Slim", val: 0.10 },
                      { label: "18% Norm", val: 0.18 },
                      { label: "30% Tall", val: 0.30 },
                      { label: "50% High", val: 0.50 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          setRegion((curr) => ({ ...curr, height: chip.val, y: Math.min(curr.y, 1 - chip.val) }));
                          setResult(null);
                        }}
                        className={cn(
                          "py-1 px-1 text-[10px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                          Math.abs(region.height - chip.val) < 0.04
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold"
                            : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white"
                        )}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider 3: Blending Strength */}
                <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-200">Blend Strength</label>
                    <span className="text-xs font-bold font-mono text-indigo-300">
                      {strength}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={strength}
                    onChange={(e) => setStrength(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[
                      { label: "50% Soft", val: 50 },
                      { label: "75% Balanced", val: 75 },
                      { label: "90% Strong", val: 90 },
                      { label: "100% Max", val: 100 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setStrength(chip.val)}
                        className={cn(
                          "py-1 px-1 text-[10px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                          strength === chip.val
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/50 font-bold"
                            : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white"
                        )}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button (Clean Watermark - Strictly Zero Sparkles) */}
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{progress}% Cleaning...</span>
                    </>
                  ) : (
                    <>
                      <Eraser size={16} />
                      <span>Clean Watermark</span>
                    </>
                  )}
                </button>

                {/* Secondary Actions when Result Ready */}
                {result && (
                  <div className="space-y-2 pt-1 border-t border-white/[0.08]">
                    <a
                      href={result}
                      download={`exismic-clean-${file?.name || "photo.jpg"}`}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
                    >
                      <Download size={15} />
                      <span>Download Clean Photo</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyCleanImage}
                      className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? "Copied to Clipboard!" : "Copy Picture to Clipboard"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Action HUD */}
      {preview && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-2.5 rounded-2xl bg-[#090b14]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? <Loader2 size={15} className="animate-spin" /> : <Eraser size={15} />}
            <span>{isProcessing ? `${progress}%` : "Clean Watermark"}</span>
          </button>

          {result && (
            <a
              href={result}
              download={`exismic-clean-${file?.name || "photo.jpg"}`}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 shadow-md shrink-0"
            >
              <Download size={14} />
              <span>Save</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default WatermarkRemover;
