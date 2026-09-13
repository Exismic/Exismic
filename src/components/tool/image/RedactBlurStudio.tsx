"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  EyeOff,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  Sliders,
  RotateCcw,
  Trash2,
  Lock,
  Layers,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  FileImage,
  Sparkle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";
import { consumePipelineItem } from "@/lib/pipeline";

// ============================================================================
// TYPES & MODES (100% Plain English)
// ============================================================================

export type RedactMode = "blur" | "pixelate" | "blackout";

export interface RedactBox {
  id: string;
  x: number; // 0 to 1 relative to image width
  y: number; // 0 to 1 relative to image height
  width: number; // 0 to 1 relative
  height: number; // 0 to 1 relative
  mode: RedactMode;
  intensity: number;
}

// Generate demo screenshot in memory so users can test immediately
function createSampleScreenshot(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 700;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Dark studio backdrop
  ctx.fillStyle = "#0c101d";
  ctx.fillRect(0, 0, 1200, 700);

  // Top window header
  ctx.fillStyle = "#151b2e";
  ctx.fillRect(0, 0, 1200, 60);

  // Window dots
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(35, 30, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(58, 30, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(81, 30, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("Customer Account Settings — Confidentials", 120, 35);

  // Cards layout
  const drawCard = (x: number, y: number, w: number, h: number, title: string, content: string, label: string) => {
    ctx.fillStyle = "#11172a";
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(label.toUpperCase(), x + 24, y + 36);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(title, x + 24, y + 70);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "15px monospace";
    ctx.fillText(content, x + 24, y + 105);
  };

  drawCard(50, 100, 520, 140, "Syed Rayan (Owner)", "Email: syedrayan.dev@gmail.com", "User Profile");
  drawCard(630, 100, 520, 140, "Production API Secret", "sk_live_9847294829348923482348", "API Credentials");
  drawCard(50, 280, 520, 140, "Billing & Payment Method", "Visa ending in •••• 4242  (Exp: 09/28)", "Payment Info");
  drawCard(630, 280, 520, 140, "Server IP & Cluster", "Primary: 192.168.1.104:8080 (EU-West)", "Internal Network");

  // Bottom Notice
  ctx.fillStyle = "#3b82f6";
  ctx.font = "14px sans-serif";
  ctx.fillText("🔒 Drag boxes over private passwords, emails, and card numbers to test instant blur!", 50, 470);

  return canvas.toDataURL("image/png");
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RedactBlurStudio() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("screenshot.png");
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);

  // Redaction boxes
  const [boxes, setBoxes] = useState<RedactBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // Tool Controls
  const [mode, setMode] = useState<RedactMode>("blur");
  const [blurIntensity, setBlurIntensity] = useState<number>(18); // 6 to 36
  const [pixelSize, setPixelSize] = useState<number>(16); // 8 to 32

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"canvas" | "tools" | "info">("canvas");
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [pipelineUrl, setPipelineUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load incoming pipeline image or default demo
  useEffect(() => {
    let mounted = true;
    async function loadInitial() {
      try {
        const item = await consumePipelineItem();
        if (item && item.url && mounted) {
          setImageSrc(item.url);
          setImageName(item.name || "pipeline-image.png");
          return;
        }
      } catch {
        // ignore
      }

      // Default sample screenshot
      if (mounted) {
        const sampleUrl = createSampleScreenshot();
        setImageSrc(sampleUrl);
        setImageName("Sample_Dashboard_Screenshot.png");
      }
    }
    loadInitial();
    return () => {
      mounted = false;
    };
  }, []);

  // Window Ctrl+V / Cmd+V paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                setImageSrc(reader.result);
                setImageName(`pasted-screenshot-${Date.now()}.png`);
                setBoxes([]);
                setSelectedBoxId(null);
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Load image object whenever imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      renderRedactedCanvas(img, boxes);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Render the final redacted image onto canvas
  const renderRedactedCanvas = useCallback(
    (img: HTMLImageElement, currentBoxes: RedactBox[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // 1. Draw original base image
      ctx.filter = "none";
      ctx.drawImage(img, 0, 0);

      // 2. Apply each redaction box
      currentBoxes.forEach((box) => {
        const x = Math.round(box.x * canvas.width);
        const y = Math.round(box.y * canvas.height);
        const w = Math.round(box.width * canvas.width);
        const h = Math.round(box.height * canvas.height);

        if (w <= 0 || h <= 0) return;

        if (box.mode === "blackout") {
          // Solid Black Out Tape
          ctx.fillStyle = "#000000";
          ctx.fillRect(x, y, w, h);
        } else if (box.mode === "pixelate") {
          // Sharp 8-bit Pixelate / Mosaic
          const pSize = Math.max(4, box.intensity);
          const scaledW = Math.max(1, Math.floor(w / pSize));
          const scaledH = Math.max(1, Math.floor(h / pSize));

          // Offscreen tiny canvas for downsampling
          const offCanvas = document.createElement("canvas");
          offCanvas.width = scaledW;
          offCanvas.height = scaledH;
          const offCtx = offCanvas.getContext("2d");
          if (!offCtx) return;

          offCtx.drawImage(canvas, x, y, w, h, 0, 0, scaledW, scaledH);

          // Draw back scaled up with smoothing disabled
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(offCanvas, 0, 0, scaledW, scaledH, x, y, w, h);
          ctx.restore();
        } else {
          // Smooth Gaussian Blur
          const blurAmt = box.intensity || 18;

          // Temporary canvas for slice blur
          const offCanvas = document.createElement("canvas");
          offCanvas.width = w;
          offCanvas.height = h;
          const offCtx = offCanvas.getContext("2d");
          if (!offCtx) return;

          offCtx.filter = `blur(${blurAmt}px)`;
          // Draw with extra padding to prevent edge bleed
          offCtx.drawImage(canvas, x - 10, y - 10, w + 20, h + 20, 0, 0, w, h);

          ctx.drawImage(offCanvas, x, y, w, h);
        }
      });

      // Update pipeline preview URL
      try {
        const dataUrl = canvas.toDataURL("image/png");
        setPipelineUrl(dataUrl);
      } catch {
        // ignore
      }
    },
    []
  );

  // Re-render when boxes change
  useEffect(() => {
    if (imgRef.current) {
      renderRedactedCanvas(imgRef.current, boxes);
    }
  }, [boxes, renderRedactedCanvas]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
        setImageName(file.name);
        setBoxes([]);
        setSelectedBoxId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Convert client pointer event coordinates to normalized [0, 1] bounds
  const getNormalizedCoords = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return { x, y };
  };

  // Pointer Down (Start Drawing Box)
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!imageSrc) return;
    const coords = getNormalizedCoords(clientX, clientY);
    setIsDrawing(true);
    setStartPos(coords);
    setCurrentPos(coords);
  };

  // Pointer Move (Update Drawing Box)
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDrawing || !startPos) return;
    const coords = getNormalizedCoords(clientX, clientY);
    setCurrentPos(coords);
  };

  // Pointer Up (Finalize Drawing Box)
  const handlePointerUp = () => {
    if (!isDrawing || !startPos || !currentPos) {
      setIsDrawing(false);
      return;
    }

    const minX = Math.min(startPos.x, currentPos.x);
    const minY = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // Minimum box size threshold (e.g. 1.5% of canvas width)
    if (width > 0.015 && height > 0.015) {
      const newBox: RedactBox = {
        id: `box-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: minX,
        y: minY,
        width,
        height,
        mode,
        intensity: mode === "pixelate" ? pixelSize : blurIntensity,
      };
      setBoxes((prev) => [...prev, newBox]);
      setSelectedBoxId(newBox.id);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  // Delete specific box
  const handleDeleteBox = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBoxes((prev) => prev.filter((b) => b.id !== id));
    if (selectedBoxId === id) setSelectedBoxId(null);
  };

  // Clear all boxes
  const handleClearAll = () => {
    setBoxes([]);
    setSelectedBoxId(null);
  };

  // Undo last box
  const handleUndo = () => {
    setBoxes((prev) => prev.slice(0, -1));
    setSelectedBoxId(null);
  };

  // 1-Click Copy Picture to Clipboard
  const handleCopyPicture = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isCopying) return;
    setIsCopying(true);
    setCopySuccess(false);

    try {
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
        } else {
          handleDownloadImage();
        }
        setIsCopying(false);
      }, "image/png");
    } catch {
      handleDownloadImage();
      setIsCopying(false);
    }
  };

  // 1-Click Download High-Res Image
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    const baseName = imageName.replace(/\.[^/.]+$/, "");
    link.download = `${baseName}-redacted.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Top Banner / Privacy Guarantee */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b0f19]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">
            100% On-Device Privacy: Your photos never leave your device or touch any server.
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono">
            Ctrl + V
          </span>
          <span>Paste screenshot directly</span>
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="lg:hidden flex items-center p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1">
        <button
          onClick={() => setActiveTab("canvas")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "canvas"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Square className="w-3.5 h-3.5" />
          Canvas
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "tools"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          Blur Modes
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "info"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <FileImage className="w-3.5 h-3.5" />
          Image Info
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: BLUR TOOLS & INTENSITY CONTROLS */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-4 space-y-5",
            activeTab !== "tools" && activeTab !== "info" ? "hidden lg:block" : "block"
          )}
        >
          {/* Section 1: Redaction Modes */}
          <div className="p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              1. Choose Redaction Style
            </h3>

            <div className="space-y-2">
              {/* Blur Mode */}
              <button
                onClick={() => setMode("blur")}
                className={cn(
                  "w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all active:scale-95",
                  mode === "blur"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌫️</span>
                  <div>
                    <div className="text-xs font-bold text-white">Smooth Gaussian Blur</div>
                    <div className="text-[11px] text-zinc-400">Soft frosted blur for faces & backgrounds</div>
                  </div>
                </div>
                {mode === "blur" && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Pixelate Mode */}
              <button
                onClick={() => setMode("pixelate")}
                className={cn(
                  "w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all active:scale-95",
                  mode === "pixelate"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🟦</span>
                  <div>
                    <div className="text-xs font-bold text-white">Pixelate / Mosaic</div>
                    <div className="text-[11px] text-zinc-400">8-bit pixel blocks for passwords & phone numbers</div>
                  </div>
                </div>
                {mode === "pixelate" && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Blackout Mode */}
              <button
                onClick={() => setMode("blackout")}
                className={cn(
                  "w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all active:scale-95",
                  mode === "blackout"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⬛</span>
                  <div>
                    <div className="text-xs font-bold text-white">Black Out Tape</div>
                    <div className="text-[11px] text-zinc-400">Solid censor bar for credit cards & documents</div>
                  </div>
                </div>
                {mode === "blackout" && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Intensity Sliders */}
            {mode === "blur" && (
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Blur Strength</span>
                  <span className="font-mono text-emerald-300 font-bold">{blurIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="36"
                  step="2"
                  value={blurIntensity}
                  onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-white/[0.1] accent-emerald-400 cursor-pointer"
                />
              </div>
            )}

            {mode === "pixelate" && (
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Mosaic Block Size</span>
                  <span className="font-mono text-emerald-300 font-bold">{pixelSize}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  step="4"
                  value={pixelSize}
                  onChange={(e) => setPixelSize(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-white/[0.1] accent-emerald-400 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Section 2: Box Actions & Quick Help */}
          <div className="p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Active Redactions ({boxes.length})
              </h3>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUndo}
                  disabled={boxes.length === 0}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 disabled:opacity-40 transition-colors"
                >
                  Undo
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={boxes.length === 0}
                  className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 disabled:opacity-40 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {boxes.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] text-center space-y-1">
                <div className="text-xs font-medium text-zinc-300">No boxes drawn yet</div>
                <div className="text-[11px] text-zinc-500">
                  Click and drag your mouse or finger across the image to blur any sensitive section.
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {boxes.map((box, idx) => (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBoxId(box.id)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-xl text-xs border transition-colors cursor-pointer",
                      selectedBoxId === box.id
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                        : "bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{box.mode === "blur" ? "🌫️" : box.mode === "pixelate" ? "🟦" : "⬛"}</span>
                      <span className="font-medium">Redact Area #{idx + 1}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">({box.mode})</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteBox(box.id, e)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE CANVAS STAGE */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-8 space-y-5",
            activeTab !== "canvas" ? "hidden lg:block" : "block"
          )}
        >
          {/* Action Header: 1-Click Copy & Download */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-200 truncate max-w-[200px] sm:max-w-xs">
                {imageName}
              </span>
              {naturalWidth > 0 && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  {naturalWidth} × {naturalHeight}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Upload Another Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.1] flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload New
              </button>

              <button
                onClick={handleCopyPicture}
                disabled={isCopying}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all active:scale-95",
                  copySuccess
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.12]"
                )}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied Image!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-300" />
                    {isCopying ? "Copying..." : "Copy Picture"}
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadImage}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Download Clean Image
              </button>
            </div>
          </div>

          {/* Interactive Canvas Stage */}
          <div className="p-3 sm:p-6 rounded-3xl bg-[#070811] border border-white/[0.06] flex items-center justify-center overflow-hidden min-h-[420px]">
            <div
              ref={containerRef}
              onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
              onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onMouseUp={handlePointerUp}
              onTouchStart={(e) => {
                if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchEnd={handlePointerUp}
              style={{ touchAction: "none" }}
              className="relative max-w-full rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl cursor-crosshair select-none"
            >
              {/* The Master Offscreen/Onscreen Processed Canvas */}
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto block object-contain"
              />

              {/* Box Outline Overlays */}
              {boxes.map((b) => (
                <div
                  key={b.id}
                  style={{
                    left: `${b.x * 100}%`,
                    top: `${b.y * 100}%`,
                    width: `${b.width * 100}%`,
                    height: `${b.height * 100}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBoxId(b.id);
                  }}
                  className={cn(
                    "absolute border-2 transition-all group pointer-events-auto",
                    selectedBoxId === b.id
                      ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "border-white/30 hover:border-emerald-400/60"
                  )}
                >
                  <button
                    onClick={(e) => handleDeleteBox(b.id, e)}
                    className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Active Drawing Dragging Box Preview */}
              {isDrawing && startPos && currentPos && (
                <div
                  style={{
                    left: `${Math.min(startPos.x, currentPos.x) * 100}%`,
                    top: `${Math.min(startPos.y, currentPos.y) * 100}%`,
                    width: `${Math.abs(currentPos.x - startPos.x) * 100}%`,
                    height: `${Math.abs(currentPos.y - startPos.y) * 100}%`,
                  }}
                  className="absolute border-2 border-dashed border-emerald-400 bg-emerald-500/15 pointer-events-none"
                />
              )}
            </div>
          </div>

          {/* Media Pipeline Bar Integration */}
          {pipelineUrl && (
            <MediaPipelineBar
              imageUrl={pipelineUrl}
              imageName="redacted-image.png"
              sourceToolId="redact-blur"
              sourceToolName="Private Photo & Screen Blur Studio"
              actions={["compressor", "resizer", "converter", "meme"]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
