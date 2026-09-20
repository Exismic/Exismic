"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  EyeOff,
  Copy,
  Check,
  Download,
  Upload,
  Sliders,
  RotateCcw,
  Trash2,
  Layers,
  Square,
  FileImage,
  Grid,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Key,
  CreditCard,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";
import { consumePipelineItem } from "@/lib/pipeline";

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export type RedactMode = "blur" | "pixelate" | "blackout" | "whiteout";

export interface RedactBox {
  id: string;
  x: number; // 0 to 1 relative to image width
  y: number; // 0 to 1 relative to image height
  width: number; // 0 to 1 relative
  height: number; // 0 to 1 relative
  mode: RedactMode;
  intensity: number;
}

// Generate realistic dark-mode developer cloud vault dashboard sample
function createSampleScreenshot(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Dark obsidian backdrop
  ctx.fillStyle = "#070a14";
  ctx.fillRect(0, 0, 1200, 720);

  // Background tech grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 1200; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 720);
    ctx.stroke();
  }
  for (let y = 0; y < 720; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }

  // Top macOS-style window title bar
  ctx.fillStyle = "#0c1020";
  ctx.fillRect(0, 0, 1200, 56);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.moveTo(0, 56);
  ctx.lineTo(1200, 56);
  ctx.stroke();

  // Traffic lights
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(32, 28, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(54, 28, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(76, 28, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Title
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("Exismic Cloud Console — Production Environment (CONFIDENTIAL)", 110, 33);

  // Status Badge
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.beginPath();
  ctx.roundRect(1010, 16, 160, 24, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.stroke();

  ctx.fillStyle = "#34d399";
  ctx.beginPath();
  ctx.arc(1026, 28, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6ee7b7";
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.fillText("US-EAST-1 (LIVE)", 1040, 32);

  // Cards layout
  const drawCard = (x: number, y: number, w: number, h: number, title: string, content: string, tag: string, tagColor: string) => {
    ctx.fillStyle = "#0d1326";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();

    // Tag badge
    ctx.fillStyle = tagColor === "emerald" ? "rgba(16, 185, 129, 0.15)" : tagColor === "indigo" ? "rgba(99, 102, 241, 0.15)" : "rgba(244, 63, 94, 0.15)";
    ctx.beginPath();
    ctx.roundRect(x + 24, y + 20, 130, 24, 6);
    ctx.fill();
    ctx.strokeStyle = tagColor === "emerald" ? "rgba(16, 185, 129, 0.35)" : tagColor === "indigo" ? "rgba(99, 102, 241, 0.35)" : "rgba(244, 63, 94, 0.35)";
    ctx.stroke();

    ctx.fillStyle = tagColor === "emerald" ? "#34d399" : tagColor === "indigo" ? "#818cf8" : "#fb7185";
    ctx.font = "bold 10.5px monospace";
    ctx.fillText(tag.toUpperCase(), x + 34, y + 36);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
    ctx.fillText(title, x + 24, y + 74);

    // Code container
    ctx.fillStyle = "#060914";
    ctx.beginPath();
    ctx.roundRect(x + 24, y + 90, w - 48, 42, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.stroke();

    ctx.fillStyle = "#93c5fd";
    ctx.font = "13px monospace";
    ctx.fillText(content, x + 38, y + 116);
  };

  drawCard(40, 85, 540, 160, "Root Administrator", "Email: admin.demo@company.internal  (Owner)", "Identity Profile", "indigo");
  drawCard(620, 85, 540, 160, "Production API Key Token", "demo_prod_key_77a90f238bc0091e4f21", "API Credentials", "rose");
  drawCard(40, 275, 540, 160, "Corporate Visa Platinum", "Card: 4242 •••• •••• 9104  (CVC: 842)", "Billing Details", "rose");
  drawCard(620, 275, 540, 160, "PostgreSQL Master Cluster", "postgres://admin:mock_secret_pass@127.0.0.1:5432", "Internal Database", "emerald");
  drawCard(40, 465, 540, 160, "Cloud S3 Bucket Storage", "s3_access_token: demo_mock_s3_key_00998811", "Cloud Storage", "emerald");
  drawCard(620, 465, 540, 160, "Production SSH Bastion", "ssh -i id_rsa root@192.168.1.104 -p 2200", "Infrastructure", "indigo");

  // Bottom watermark notice
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("🔒 100% Client-Side Private Test Screenshot — Click and drag selection boxes over tokens to redact", 40, 680);

  return canvas.toDataURL("image/png");
}

// Initial demo pre-drawn boxes so the user instantly sees blur & blackout working
function createDemoBoxes(): RedactBox[] {
  return [
    {
      id: "demo-box-1",
      x: 0.54,
      y: 0.22,
      width: 0.42,
      height: 0.08,
      mode: "pixelate",
      intensity: 14,
    },
    {
      id: "demo-box-2",
      x: 0.055,
      y: 0.485,
      width: 0.41,
      height: 0.075,
      mode: "blackout",
      intensity: 18,
    },
  ];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RedactBlurStudio() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("Sample_Server_Credentials.png");
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);

  // Redaction boxes state
  const [boxes, setBoxes] = useState<RedactBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // Tool Controls
  const [mode, setMode] = useState<RedactMode>("blur");
  const [blurIntensity, setBlurIntensity] = useState<number>(18); // 6 to 48
  const [pixelSize, setPixelSize] = useState<number>(14); // 6 to 36

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  // Canvas zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // UI state
  const [activeTab, setActiveTab] = useState<"canvas" | "styles" | "layers">("canvas");
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [pipelineUrl, setPipelineUrl] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

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
          setBoxes([]);
          return;
        }
      } catch {
        // ignore
      }

      if (mounted) {
        const sampleUrl = createSampleScreenshot();
        setImageSrc(sampleUrl);
        setImageName("Sample_Server_Credentials.png");
        setBoxes(createDemoBoxes());
      }
    }
    loadInitial();
    return () => {
      mounted = false;
    };
  }, []);

  // Global Ctrl+V / Cmd+V paste listener for screenshots
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
                setImageName(`clipboard-screenshot-${Date.now()}.png`);
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

  // Keyboard shortcut to delete selected box or undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBoxId) {
          e.preventDefault();
          setBoxes((prev) => prev.filter((b) => b.id !== selectedBoxId));
          setSelectedBoxId(null);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setBoxes((prev) => prev.slice(0, -1));
        setSelectedBoxId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBoxId]);

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
        } else if (box.mode === "whiteout") {
          // Solid White Out Tape
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, w, h);
        } else if (box.mode === "pixelate") {
          // Crisp 8-Bit Pixelate / Mosaic
          const pSize = Math.max(4, box.intensity);
          const scaledW = Math.max(1, Math.floor(w / pSize));
          const scaledH = Math.max(1, Math.floor(h / pSize));

          const offCanvas = document.createElement("canvas");
          offCanvas.width = scaledW;
          offCanvas.height = scaledH;
          const offCtx = offCanvas.getContext("2d");
          if (!offCtx) return;

          offCtx.drawImage(canvas, x, y, w, h, 0, 0, scaledW, scaledH);

          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(offCanvas, 0, 0, scaledW, scaledH, x, y, w, h);
          ctx.restore();
        } else {
          // Smooth Gaussian Blur
          const blurAmt = box.intensity || 18;

          const offCanvas = document.createElement("canvas");
          offCanvas.width = w;
          offCanvas.height = h;
          const offCtx = offCanvas.getContext("2d");
          if (!offCtx) return;

          offCtx.filter = `blur(${blurAmt}px)`;
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
  const handleProcessFile = (file: File) => {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
    e.target.value = "";
  };

  // Convert pointer event coordinates to normalized [0, 1] relative bounds
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

    if (width > 0.012 && height > 0.012) {
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

  // 1-Click Preset Redaction Rules
  const applyPresetRule = (type: "secret" | "card" | "face" | "email") => {
    if (type === "secret") {
      setMode("pixelate");
      setPixelSize(14);
    } else if (type === "card") {
      setMode("blackout");
    } else if (type === "face") {
      setMode("blur");
      setBlurIntensity(28);
    } else if (type === "email") {
      setMode("blur");
      setBlurIntensity(16);
    }
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

  // 1-Click Download Clean Image
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

  // Reload default sample image
  const handleResetSample = () => {
    const sampleUrl = createSampleScreenshot();
    setImageSrc(sampleUrl);
    setImageName("Sample_Server_Credentials.png");
    setBoxes(createDemoBoxes());
    setSelectedBoxId(null);
  };

  const selectedBox = boxes.find((b) => b.id === selectedBoxId);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5 pb-32 lg:pb-10">
      {/* ===================================================================== */}
      {/* TOP SECURITY VAULT BANNER */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-[#090d1a]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-72 h-16 bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Obsidian Privacy Vault</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                100% Client-Side
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              Photos & screenshots are processed locally in your browser memory and never touch any server.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300">
            <span className="font-mono text-[11px] font-bold text-emerald-400">Ctrl + V</span>
            <span className="text-[11px] text-zinc-400">Paste Clipboard Image</span>
          </div>

          <button
            type="button"
            onClick={handleResetSample}
            title="Reload interactive demo sample"
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* QUICK PRESETS CHIPS (1-TAP PRO CONVENIENCE) */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 flex items-center gap-1.5 mr-1">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Intent:</span>
        </span>

        <button
          type="button"
          onClick={() => applyPresetRule("secret")}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border flex items-center gap-1.5 transition-all cursor-pointer",
            mode === "pixelate"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border-white/[0.08]"
          )}
        >
          <Key className="w-3.5 h-3.5 text-indigo-400" />
          <span>API Key / Password (Mosaic)</span>
        </button>

        <button
          type="button"
          onClick={() => applyPresetRule("card")}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border flex items-center gap-1.5 transition-all cursor-pointer",
            mode === "blackout"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border-white/[0.08]"
          )}
        >
          <CreditCard className="w-3.5 h-3.5 text-rose-400" />
          <span>Credit Card & Numbers (Tape)</span>
        </button>

        <button
          type="button"
          onClick={() => applyPresetRule("face")}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border flex items-center gap-1.5 transition-all cursor-pointer",
            mode === "blur" && blurIntensity >= 24
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border-white/[0.08]"
          )}
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>Face / Profile (Heavy Blur)</span>
        </button>

        <button
          type="button"
          onClick={() => applyPresetRule("email")}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border flex items-center gap-1.5 transition-all cursor-pointer",
            mode === "blur" && blurIntensity < 24
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border-white/[0.08]"
          )}
        >
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Email & Names (Soft Blur)</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* MOBILE NAVIGATION SEGMENTED TABS */}
      {/* ===================================================================== */}
      <div className="lg:hidden grid grid-cols-3 p-1 rounded-2xl bg-[#090d1a] border border-white/[0.08] gap-1 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab("canvas")}
          className={cn(
            "py-2.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeTab === "canvas"
              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-xs"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Square className="w-3.5 h-3.5 text-emerald-400" />
          <span>Canvas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("styles")}
          className={cn(
            "py-2.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeTab === "styles"
              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-xs"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Styles</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("layers")}
          className={cn(
            "py-2.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeTab === "layers"
              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-xs"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Layers ({boxes.length})</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* MAIN TWO-COLUMN STUDIO GRID */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: REDACTION STYLES & INTENSITY CONTROLS */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-4 space-y-4",
            activeTab === "canvas" ? "hidden lg:block" : "block"
          )}
        >
          {/* Card 1: Redaction Modes */}
          <div className="p-5 rounded-3xl bg-[#090d1a]/95 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Choose Redaction Style</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded-md bg-white/[0.04]">
                4 Modes
              </span>
            </div>

            <div className="space-y-2">
              {/* Blur Mode */}
              <button
                type="button"
                onClick={() => setMode("blur")}
                className={cn(
                  "w-full p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3",
                  mode === "blur"
                    ? "bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.2)]"
                    : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                      mode === "blur"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                    )}
                  >
                    <EyeOff size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-tight">Smooth Gaussian Blur</div>
                    <div className="text-[11px] text-zinc-400 truncate">Soft frosted blur for faces & backgrounds</div>
                  </div>
                </div>
                {mode === "blur" && (
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Pixelate Mode */}
              <button
                type="button"
                onClick={() => setMode("pixelate")}
                className={cn(
                  "w-full p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3",
                  mode === "pixelate"
                    ? "bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.2)]"
                    : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                      mode === "pixelate"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                    )}
                  >
                    <Grid size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-tight">Pixelate / Mosaic</div>
                    <div className="text-[11px] text-zinc-400 truncate">8-bit pixel blocks for passwords & keys</div>
                  </div>
                </div>
                {mode === "pixelate" && (
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Blackout Mode */}
              <button
                type="button"
                onClick={() => setMode("blackout")}
                className={cn(
                  "w-full p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3",
                  mode === "blackout"
                    ? "bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.2)]"
                    : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                      mode === "blackout"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                    )}
                  >
                    <Square size={18} className="fill-zinc-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-tight">Black Out Tape</div>
                    <div className="text-[11px] text-zinc-400 truncate">Solid black censor bar for credit cards & documents</div>
                  </div>
                </div>
                {mode === "blackout" && (
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                )}
              </button>

              {/* Whiteout Mode */}
              <button
                type="button"
                onClick={() => setMode("whiteout")}
                className={cn(
                  "w-full p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3",
                  mode === "whiteout"
                    ? "bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.2)]"
                    : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                      mode === "whiteout"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                    )}
                  >
                    <Square size={18} className="fill-white text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-tight">White Out Tape</div>
                    <div className="text-[11px] text-zinc-400 truncate">Opaque white censor bar for light documents</div>
                  </div>
                </div>
                {mode === "whiteout" && (
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                )}
              </button>
            </div>

            {/* Tactile Range Sliders for Active Mode */}
            {mode === "blur" && (
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">Blur Radius</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">{blurIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="48"
                  step="2"
                  value={blurIntensity}
                  onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${((blurIntensity - 6) / 42) * 100}%, #27272a ${((blurIntensity - 6) / 42) * 100}%, #27272a 100%)`,
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1"
                />
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: "10px", val: 10 },
                    { label: "18px", val: 18 },
                    { label: "28px", val: 28 },
                    { label: "40px", val: 40 },
                  ].map((sc) => (
                    <button
                      key={sc.label}
                      type="button"
                      onClick={() => setBlurIntensity(sc.val)}
                      className={cn(
                        "py-1 px-1 text-[10px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                        blurIntensity === sc.val
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 font-bold shadow-xs"
                          : "bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 border-white/[0.05]"
                      )}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "pixelate" && (
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">Mosaic Pixel Size</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">{pixelSize}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="36"
                  step="2"
                  value={pixelSize}
                  onChange={(e) => setPixelSize(parseInt(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${((pixelSize - 6) / 30) * 100}%, #27272a ${((pixelSize - 6) / 30) * 100}%, #27272a 100%)`,
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1"
                />
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: "8px", val: 8 },
                    { label: "14px", val: 14 },
                    { label: "20px", val: 20 },
                    { label: "30px", val: 30 },
                  ].map((sc) => (
                    <button
                      key={sc.label}
                      type="button"
                      onClick={() => setPixelSize(sc.val)}
                      className={cn(
                        "py-1 px-1 text-[10px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                        pixelSize === sc.val
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 font-bold shadow-xs"
                          : "bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 border-white/[0.05]"
                      )}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Selected Box Live Inspector (If Selected) */}
          {selectedBox && (
            <div className="p-4 rounded-3xl bg-emerald-950/25 border border-emerald-500/40 backdrop-blur-xl shadow-lg space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Square className="w-3.5 h-3.5" />
                  <span>Selected Layer Settings</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteBox(selectedBox.id, e)}
                  className="px-2 py-1 text-[11px] font-bold text-rose-300 hover:text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                >
                  Delete Box
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {(["blur", "pixelate", "blackout", "whiteout"] as RedactMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setBoxes((prev) =>
                        prev.map((b) => (b.id === selectedBox.id ? { ...b, mode: m } : b))
                      );
                    }}
                    className={cn(
                      "py-1.5 text-[10px] font-bold uppercase rounded-lg border text-center transition-all cursor-pointer",
                      selectedBox.mode === m
                        ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/60 shadow-xs"
                        : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 border-white/[0.06]"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card 3: Active Redactions Layer Inspector */}
          <div className="p-5 rounded-3xl bg-[#090d1a]/95 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Active Redactions ({boxes.length})</span>
              </h3>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={boxes.length === 0}
                  title="Undo Last Box (Ctrl+Z)"
                  className="px-2.5 py-1 text-xs font-medium rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 disabled:opacity-30 border border-white/[0.08] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Undo</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={boxes.length === 0}
                  className="px-2.5 py-1 text-xs font-medium rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 disabled:opacity-30 border border-rose-500/25 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {boxes.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.08] text-center space-y-1.5">
                <Lock className="w-6 h-6 text-zinc-500 mx-auto stroke-[1.5]" />
                <div className="text-xs font-semibold text-zinc-300">No boxes drawn yet</div>
                <div className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Click and drag your mouse or finger across the image to blur any sensitive section.
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {boxes.map((box, idx) => {
                  const isSelected = selectedBoxId === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => setSelectedBoxId(box.id)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl text-xs border transition-colors cursor-pointer",
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-200 shadow-xs"
                          : "bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                          {box.mode === "blur" ? (
                            <EyeOff size={12} className="text-emerald-400" />
                          ) : box.mode === "pixelate" ? (
                            <Grid size={12} className="text-emerald-400" />
                          ) : box.mode === "whiteout" ? (
                            <Square size={12} className="text-white fill-white" />
                          ) : (
                            <Square size={12} className="text-zinc-400 fill-zinc-400" />
                          )}
                        </div>
                        <span className="font-semibold truncate">Area #{idx + 1}</span>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">
                          ({box.mode})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteBox(box.id, e)}
                        title="Delete this redaction box"
                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE CANVAS STAGE */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-8 space-y-4",
            activeTab !== "canvas" ? "hidden lg:block" : "block"
          )}
        >
          {/* Action Header: Image info & CTA Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-[#090d1a]/95 border border-white/[0.1] backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileImage className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[170px] sm:max-w-xs">
                  {imageName}
                </div>
                {naturalWidth > 0 && (
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {naturalWidth} × {naturalHeight} px • {boxes.length} active redactions
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono text-zinc-300 px-1 font-bold">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
                  title="Zoom In"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  title="Reset 100%"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              {/* Upload Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/[0.1] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload New</span>
              </button>

              {/* 1-Click Copy Picture */}
              <button
                type="button"
                onClick={handleCopyPicture}
                disabled={isCopying}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer",
                  copySuccess
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.12]"
                )}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Picture!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-300" />
                    <span>{isCopying ? "Copying..." : "Copy Picture"}</span>
                  </>
                )}
              </button>

              {/* Download Clean Image (Single-Tone Luminous Gradient) */}
              <button
                type="button"
                onClick={handleDownloadImage}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.35)] bg-no-repeat bg-clip-padding overflow-hidden flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Clean Image</span>
              </button>
            </div>
          </div>

          {/* Interactive Canvas Stage with Window Frame */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleProcessFile(file);
            }}
            className={cn(
              "p-3 sm:p-5 rounded-3xl bg-[#060812] border transition-all flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden",
              isDraggingFile ? "border-emerald-400 bg-emerald-950/20" : "border-white/[0.08]"
            )}
          >
            {/* Drag & Drop Prompt Overlay */}
            {isDraggingFile && (
              <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300 text-xs font-bold gap-2 z-20 pointer-events-none">
                <Upload className="w-8 h-8 animate-bounce" />
                <span>Drop any photo or screenshot to redact instantly</span>
              </div>
            )}

            {/* Canvas Container with Zoom Scale */}
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
              className="max-w-full flex justify-center"
            >
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
                className="relative max-w-full rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl cursor-crosshair select-none"
              >
                {/* Master Canvas */}
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto block object-contain"
                />

                {/* Drawn Redaction Boxes with Hover/Selected Handles */}
                {boxes.map((b, idx) => {
                  const isSelected = selectedBoxId === b.id;
                  return (
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
                        isSelected
                          ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          : "border-white/30 hover:border-emerald-400/70"
                      )}
                    >
                      {/* Top-Right Delete Action Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteBox(b.id, e)}
                        title="Delete this redaction box"
                        className={cn(
                          "absolute -top-3 -right-3 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-lg transition-opacity cursor-pointer z-10",
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        ×
                      </button>

                      {/* Area tag pill on selected */}
                      {isSelected && (
                        <span className="absolute -bottom-5 left-0 px-1.5 py-0.5 rounded bg-black/90 border border-emerald-400/50 text-[9px] font-mono text-emerald-300 font-bold whitespace-nowrap z-10">
                          Area #{idx + 1} ({b.mode})
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Active Drawing Preview Box */}
                {isDrawing && startPos && currentPos && (
                  <div
                    style={{
                      left: `${Math.min(startPos.x, currentPos.x) * 100}%`,
                      top: `${Math.min(startPos.y, currentPos.y) * 100}%`,
                      width: `${Math.abs(currentPos.x - startPos.x) * 100}%`,
                      height: `${Math.abs(currentPos.y - startPos.y) * 100}%`,
                    }}
                    className="absolute border-2 border-dashed border-emerald-400 bg-emerald-500/20 pointer-events-none"
                  />
                )}
              </div>
            </div>

            {/* Bottom hint banner */}
            <div className="mt-3 text-center text-[11px] text-zinc-500 font-medium">
              💡 Click and drag your mouse or finger across the image to blur sensitive passwords, emails, and card numbers.
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

      {/* ===================================================================== */}
      {/* MOBILE BOTTOM FLOATING ACTION HUD (STRICT RESPONSIVENESS) */}
      {/* ===================================================================== */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-2.5 rounded-2xl bg-[#090d1a]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode("blur")}
            className={cn(
              "p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer",
              mode === "blur"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-xs"
                : "bg-white/[0.04] text-zinc-400 border-white/[0.06]"
            )}
            title="Gaussian Blur"
          >
            <EyeOff size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMode("pixelate")}
            className={cn(
              "p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer",
              mode === "pixelate"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-xs"
                : "bg-white/[0.04] text-zinc-400 border-white/[0.06]"
            )}
            title="Pixelate"
          >
            <Grid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMode("blackout")}
            className={cn(
              "p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer",
              mode === "blackout"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-xs"
                : "bg-white/[0.04] text-zinc-400 border-white/[0.06]"
            )}
            title="Blackout Tape"
          >
            <Square size={16} className="fill-current" />
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={boxes.length === 0}
            className="p-2 rounded-xl bg-white/[0.04] text-zinc-300 border border-white/[0.06] disabled:opacity-30 cursor-pointer"
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyPicture}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] text-white border border-white/15 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Copy size={13} />
            <span>Copy</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/40 shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Download size={13} />
            <span>PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
