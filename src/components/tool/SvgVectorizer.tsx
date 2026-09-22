"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  Trash2, 
  Download, 
  Sliders, 
  AlertCircle,
  RefreshCw,
  Palette,
  Eye,
  Check,
  Spline,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Copy,
  Code2,
  Layers,
  ArrowRight,
  Zap,
  Camera,
  FileImage
} from "lucide-react";
import axios from "axios";
import { detectVectorizerCapabilities, processVectorizeLocally } from "@/lib/client-vectorizer";
import { consumePipelineItem, pipelineUrlToFile, sendToTool } from "@/lib/pipeline";
import { saveFileHistory } from "@/lib/history";

interface CurvePolicy {
  value: string;
  label: string;
  desc: string;
  badge: string;
}

const CURVE_POLICIES: CurvePolicy[] = [
  { value: "minority", label: "Smooth Curves", desc: "Soft, flowing organic outlines", badge: "Most Popular" },
  { value: "majority", label: "Balanced", desc: "Natural blend of curves & corners", badge: "Standard" },
  { value: "black", label: "Sharp Corners", desc: "Crisp angles & tight geometric edges", badge: "Logos" },
  { value: "white", label: "Airy Outlines", desc: "Open curves with light emphasis", badge: "Sketches" },
];

interface DemoBlueprint {
  id: "emblem" | "monogram" | "sketch";
  name: string;
  badge: string;
  description: string;
  highlight: string;
  icon: typeof Spline;
}

const DEMO_BLUEPRINTS: DemoBlueprint[] = [
  {
    id: "emblem",
    name: "Geometric Brand Emblem",
    badge: "Brand Logo",
    description: "High-contrast geometric crest with concentric rings, diamond core & bold typography.",
    highlight: "Sharp Logo Vector",
    icon: Spline,
  },
  {
    id: "monogram",
    name: "Flowing Signature Monogram",
    badge: "Typography",
    description: "Elegant calligraphic lettermark with flowing ribbon curves & smooth flourishes.",
    highlight: "Smooth Curves Test",
    icon: Layers,
  },
  {
    id: "sketch",
    name: "Mascot Sticker Line Art",
    badge: "Line Art",
    description: "Crisp cartoon mascot illustration with bold outlines, sunglasses & playful details.",
    highlight: "Clean Sticker Vector",
    icon: Camera,
  },
];

// Client-side canvas synthesizer ($0 compute, 100% in-browser)
function generateDemoImageFile(type: "emblem" | "monogram" | "sketch"): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(new File(["demo"], `sample-${type}.png`, { type: "image/png" }));
      return;
    }

    // High-contrast clean white background for flawless edge tracing
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1000, 1000);
    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";

    if (type === "emblem") {
      // Geometric Emblem
      ctx.save();
      ctx.translate(500, 460);

      // Outer Hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = 340 * Math.cos(angle);
        const y = 340 * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.lineWidth = 26;
      ctx.stroke();

      // Middle Ring
      ctx.beginPath();
      ctx.arc(0, 0, 240, 0, Math.PI * 2);
      ctx.lineWidth = 14;
      ctx.stroke();

      // Inner Solid Diamond
      ctx.beginPath();
      ctx.moveTo(0, -170);
      ctx.lineTo(170, 0);
      ctx.lineTo(0, 170);
      ctx.lineTo(-170, 0);
      ctx.closePath();
      ctx.fill();

      // Center Cutout Circle
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.fill();

      // Core Solid Dot
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Typography
      ctx.fillStyle = "#000000";
      ctx.font = "900 48px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EXISMIC APEX", 500, 890);

      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("PRECISION VECTOR CREST", 500, 930);

      canvas.toBlob((blob) => {
        resolve(new File([blob || "demo"], "brand-emblem-sample.png", { type: "image/png" }));
      }, "image/png");

    } else if (type === "monogram") {
      // Signature Typography Monogram
      ctx.save();
      ctx.translate(500, 480);

      // Stylized Letter "E" with flowing calligraphy curves
      ctx.lineWidth = 42;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Curved spine
      ctx.beginPath();
      ctx.arc(40, -120, 180, Math.PI * 0.75, Math.PI * 1.75, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(40, 120, 180, Math.PI * 0.25, Math.PI * 1.25, false);
      ctx.stroke();

      // Middle horizontal sweep
      ctx.beginPath();
      ctx.moveTo(-160, 0);
      ctx.lineTo(130, 0);
      ctx.stroke();

      // Dynamic dots
      ctx.beginPath();
      ctx.arc(170, -120, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(170, 120, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Typography
      ctx.fillStyle = "#000000";
      ctx.font = "900 42px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("STUDIO SIGNATURE", 500, 890);

      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("SMOOTH CURVES & CALLIGRAPHY", 500, 930);

      canvas.toBlob((blob) => {
        resolve(new File([blob || "demo"], "signature-monogram-sample.png", { type: "image/png" }));
      }, "image/png");

    } else {
      // Mascot Sticker Line Art
      ctx.save();
      ctx.translate(500, 470);

      // Character Face Outline
      ctx.lineWidth = 26;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.arc(0, 0, 300, 0, Math.PI * 2);
      ctx.stroke();

      // Cool Sunglasses
      ctx.beginPath();
      ctx.roundRect(-220, -100, 190, 110, 24);
      ctx.roundRect(30, -100, 190, 110, 24);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-30, -50);
      ctx.lineTo(30, -50);
      ctx.lineWidth = 18;
      ctx.stroke();

      // Big Happy Smile
      ctx.beginPath();
      ctx.arc(0, 70, 130, 0.15 * Math.PI, 0.85 * Math.PI, false);
      ctx.lineWidth = 22;
      ctx.stroke();

      // Cheek Accents
      ctx.beginPath();
      ctx.arc(-180, 80, 24, 0, Math.PI * 2);
      ctx.arc(180, 80, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Mascot Typography
      ctx.fillStyle = "#000000";
      ctx.font = "900 44px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MASCOT STICKER", 500, 890);

      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("LINE ART ILLUSTRATION", 500, 930);

      canvas.toBlob((blob) => {
        resolve(new File([blob || "demo"], "mascot-sticker-sample.png", { type: "image/png" }));
      }, "image/png");
    }
  });
}

export default function SvgVectorizer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  
  // Customization controls
  const [threshold, setThreshold] = useState(128);
  const [color, setColor] = useState("#000000");
  const [background, setBackground] = useState("transparent");
  const [turnPolicy, setTurnPolicy] = useState("minority");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<"split" | "vector" | "original">("split");
  const [activeMobileTab, setActiveMobileTab] = useState<"stage" | "controls">("stage");
  const [zoomScale, setZoomScale] = useState(100);
  const [copiedType, setCopiedType] = useState<"svg" | "png" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consume incoming pipeline asset (e.g. from Background Remover or Format Converter)
  useEffect(() => {
    const item = consumePipelineItem();
    if (item && item.url) {
      pipelineUrlToFile(item.url, item.name || "input-graphic.png")
        .then((f) => {
          setFile(f);
          setOriginalUrl(URL.createObjectURL(f));
        })
        .catch((err) => console.warn("Failed to load pipeline asset:", err));
    }
  }, []);

  // Global Clipboard Paste Listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            handleNewFile(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Clean URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrl && !originalUrl.startsWith("data:")) {
        URL.revokeObjectURL(originalUrl);
      }
    };
  }, [originalUrl]);

  const handleNewFile = useCallback((newFile: File) => {
    setError(null);
    setSvgOutput(null);
    setFile(newFile);
    setZoomScale(100);
    
    if (originalUrl && !originalUrl.startsWith("data:")) {
      URL.revokeObjectURL(originalUrl);
    }
    setOriginalUrl(URL.createObjectURL(newFile));
  }, [originalUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploaded = acceptedFiles[0];
    if (uploaded) handleNewFile(uploaded);
  }, [handleNewFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false
  });

  const handleSelectDemo = async (demo: DemoBlueprint) => {
    try {
      const demoFile = await generateDemoImageFile(demo.id);
      handleNewFile(demoFile);
    } catch (err) {
      console.error("Failed to load demo artwork:", err);
    }
  };

  const handleClear = () => {
    if (originalUrl && !originalUrl.startsWith("data:")) {
      URL.revokeObjectURL(originalUrl);
    }
    setFile(null);
    setOriginalUrl(null);
    setSvgOutput(null);
    setError(null);
    setZoomScale(100);
  };

  // Tracing core execution
  const handleVectorize = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const isCapable = detectVectorizerCapabilities(file);
    let resultSvg: string | null = null;

    // 1. Attempt client-side vectorization if device capabilities pass
    if (isCapable) {
      try {
        resultSvg = await processVectorizeLocally(
          file,
          { threshold, color, background, turnPolicy },
          10000
        );
      } catch (clientErr) {
        console.warn("[Vectorizer Tool] Client vectorizer fell back to cloud API:", clientErr);
        resultSvg = null;
      }
    }

    // 2. Server API fallback if device is weak or client timed out
    if (!resultSvg) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("threshold", threshold.toString());
        formData.append("color", color);
        formData.append("background", background);
        formData.append("turnPolicy", turnPolicy);

        const response = await axios.post("/api/tools/image/vectorizer", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        resultSvg = response.data;
      } catch (err: any) {
        console.error("[Vectorizer Tool] Cloud API fallback error:", err);
        const errMsg = err.response?.data?.error || err.message || "Failed to trace image outlines.";
        setError(errMsg);
      }
    }

    if (resultSvg) {
      setSvgOutput(resultSvg);
      
      // Auto-save to creation history
      const svgBlob = new Blob([resultSvg], { type: "image/svg+xml" });
      const svgDataUrl = URL.createObjectURL(svgBlob);
      saveFileHistory({
        originalName: `${file.name.replace(/\.[^/.]+$/, "")}_vector.svg`,
        toolType: "svg-vectorizer",
        fileType: "image",
        resultUrl: svgDataUrl,
        metadata: {
          prompt: `Vectorized: ${file.name}`,
          targetFormat: "SVG",
          targetHref: "/tools/image/vectorizer",
          settings: { threshold, color, background, turnPolicy }
        }
      }).catch((histErr) => console.warn("History save note:", histErr));
    }

    setIsProcessing(false);
  }, [file, threshold, color, background, turnPolicy]);

  // Debounced auto-run when sliders/settings change and file is present
  useEffect(() => {
    if (file) {
      const timer = setTimeout(() => {
        handleVectorize();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [file, threshold, color, background, turnPolicy, handleVectorize]);

  // 1-Click SVG File Download
  const handleDownload = () => {
    if (!svgOutput || !file) return;
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}_vectorized.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // 1-Click Copy SVG Code to Clipboard
  const handleCopySvgCode = async () => {
    if (!svgOutput) return;
    try {
      await navigator.clipboard.writeText(svgOutput);
      setCopiedType("svg");
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Failed to copy SVG code:", err);
    }
  };

  // 1-Click Copy Raster Picture (PNG) to Clipboard
  const handleCopyPicture = async () => {
    if (!svgOutput) return;
    try {
      const img = new Image();
      const svgBlob = new Blob([svgOutput], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to render SVG to image"));
        img.src = url;
      });

      const cvs = document.createElement("canvas");
      cvs.width = img.naturalWidth || 1200;
      cvs.height = img.naturalHeight || 1200;
      const ctx = cvs.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const pngBlob = await new Promise<Blob | null>((resolve) => {
        cvs.toBlob(resolve, "image/png");
      });

      URL.revokeObjectURL(url);

      if (pngBlob) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
        setCopiedType("png");
        setTimeout(() => setCopiedType(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy picture:", err);
    }
  };

  const currentPolicyLabel = useMemo(() => {
    return CURVE_POLICIES.find(p => p.value === turnPolicy)?.label || "Smooth Curves";
  }, [turnPolicy]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 animate-in fade-in duration-500 pb-10">
      
      {/* 1. HEADER LIVE STATS BANNER (Plain English, Zero Tech Buzzwords) */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.1] bg-[#090c16]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.25)]">
            <Spline size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Image</span>
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Vectorizer</span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Turn low-res logos, sketches, and pictures into infinitely scalable vector graphics (SVG) that never blur.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-left min-w-[95px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Output</p>
            <p className="mt-0.5 text-base font-black text-cyan-200 font-mono">Vector SVG</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-3.5 py-2 text-left min-w-[110px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Curve Style</p>
            <p className="mt-0.5 text-xs font-bold text-white truncate">{currentPolicyLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-3.5 py-2 text-left min-w-[105px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Status</p>
            <p className="mt-0.5 text-xs font-bold text-cyan-300 truncate">
              {isProcessing ? "Tracing..." : svgOutput ? "Traced & Ready" : file ? "Ready" : "Drop an Image"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MOBILE VIEW SWITCHER */}
      <div className="lg:hidden grid grid-cols-2 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveMobileTab("stage")}
          className={cn(
            "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeMobileTab === "stage"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vector Stage</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("controls")}
          className={cn(
            "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeMobileTab === "controls"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Styling & Colors</span>
        </button>
      </div>

      {/* 3. DUAL COLUMN LUXURY STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: VECTOR STAGE & 3 INSTANT DEMONSTRATION BLUEPRINTS */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 xl:col-span-7", activeMobileTab !== "stage" ? "hidden lg:block" : "block")}>
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            
            {/* macOS Window Titlebar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500/70" />
                  <span className="size-2.5 rounded-full bg-amber-500/70" />
                  <span className="size-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="ml-2 text-xs font-bold text-zinc-400 tracking-wider">
                  VECTOR STAGE
                </span>
                {file && (
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                    {file.name}
                  </span>
                )}
              </div>

              {/* Titlebar Stage Controls */}
              <div className="flex items-center gap-2">
                {file && (
                  <>
                    {/* Zoom HUD */}
                    <div className="hidden sm:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
                      <button
                        type="button"
                        onClick={() => setZoomScale(prev => Math.max(50, prev - 25))}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10"
                        title="Zoom Out"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <span className="px-1 text-[10px] font-mono text-cyan-300 font-bold min-w-[36px] text-center">
                        {zoomScale}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomScale(prev => Math.min(250, prev + 25))}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10"
                        title="Zoom In"
                      >
                        <ZoomIn size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomScale(100)}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10 ml-0.5"
                        title="Reset Zoom to 100%"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Hidden File Input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleNewFile(f);
              }} 
            />

            {/* Main Stage Content: Dropzone or Interactive Vector Canvas */}
            {!file ? (
              <div 
                {...(getRootProps() as unknown as React.HTMLAttributes<HTMLDivElement>)}
                className={cn(
                  "group relative flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-all cursor-pointer",
                  isDragActive 
                    ? "border-cyan-400/60 bg-cyan-500/[0.08] shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                    : "border-white/15 bg-black/40 hover:border-cyan-400/40 hover:bg-cyan-500/[0.02]"
                )}
              >
                <input {...getInputProps()} />

                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-transform duration-300 group-hover:scale-110">
                  <Upload size={28} />
                </div>
                
                <h4 className="text-base font-bold text-white tracking-tight">
                  Choose an image to vectorize
                </h4>
                
                <p className="mt-1.5 text-xs text-zinc-400 max-w-sm leading-relaxed">
                  Drop any logo, drawing, or picture here, browse from your computer, or paste directly with <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-cyan-200 font-mono">Ctrl + V</kbd>.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">PNG Logos</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">JPG Photos</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">Sketches</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">WebP</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* View Mode Switcher */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
                    {[
                      { id: "split", label: "Side-by-Side" },
                      { id: "vector", label: "Vector SVG Only" },
                      { id: "original", label: "Original Photo" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setActiveViewMode(mode.id as any)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                          activeViewMode === mode.id
                            ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-xs"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400">
                    {(file.size / 1024).toFixed(1)} KB Input
                  </span>
                </div>

                {/* Interactive Canvas Stage */}
                <div className={cn(
                  "grid gap-3 transition-all",
                  activeViewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}>
                  {/* Left: Original Photo */}
                  {(activeViewMode === "split" || activeViewMode === "original") && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                        <FileImage size={12} className="text-zinc-500" />
                        Original Picture
                      </span>
                      <div className="relative h-80 w-full rounded-2xl border border-white/10 bg-black/60 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                        {originalUrl && (
                          <img 
                            src={originalUrl} 
                            alt="Original Graphic" 
                            style={{ transform: `scale(${zoomScale / 100})` }}
                            className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-200" 
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Right: Scalable Vector SVG */}
                  {(activeViewMode === "split" || activeViewMode === "vector") && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Spline size={12} className={cn("text-cyan-400", isProcessing && "animate-spin")} />
                          Infinite Vector Graphic (SVG)
                        </span>
                        {svgOutput && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            &bull; 100% Scalable
                          </span>
                        )}
                      </div>

                      {/* Vector Enclosure with Transparency Grid */}
                      <div 
                        className={cn(
                          "relative h-80 w-full rounded-2xl border flex items-center justify-center p-4 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.06)]",
                          background === "transparent"
                            ? "bg-[linear-gradient(45deg,#131622_25%,transparent_25%),linear-gradient(-45deg,#131622_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#131622_75%),linear-gradient(-45deg,transparent_75%,#131622_75%)] bg-[size:16px_16px] bg-[#090b14] border-cyan-500/30"
                            : background === "#ffffff"
                            ? "bg-white border-white/30"
                            : "bg-black border-white/20"
                        )}
                      >
                        {svgOutput ? (
                          <div 
                            style={{ transform: `scale(${zoomScale / 100})` }}
                            className="w-full h-full flex items-center justify-center transition-transform duration-200 [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
                            dangerouslySetInnerHTML={{ __html: svgOutput }}
                          />
                        ) : (
                          <div className="text-zinc-400 text-xs font-bold flex flex-col items-center gap-3">
                            <RefreshCw className="animate-spin text-cyan-400" size={24} />
                            <span className="uppercase tracking-wider text-[10px]">
                              Tracing vector contours...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Notice if any */}
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                    <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Tracing Warning</p>
                      <p className="mt-0.5 opacity-90">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3 INSTANT 1-CLICK DEMONSTRATION BLUEPRINTS ($0 COMPUTE CLIENT CANVAS) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <Spline size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Instant Test Samples
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Test vector tracing in 1-click with zero setup ($0 server compute)
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                100% In-Browser
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_BLUEPRINTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-black/40 p-3 text-left transition-all hover:border-cyan-400/40 hover:bg-cyan-500/[0.04] cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-zinc-300 transition-colors group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
                          <Icon size={14} />
                        </div>
                        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">
                          {demo.badge}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                        {demo.name}
                      </h5>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {demo.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px]">
                      <span className="font-semibold text-cyan-300">{demo.highlight}</span>
                      <span className="text-zinc-500 group-hover:text-white transition-colors">Trace &rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: VECTOR STYLING & TUNING CONSOLE */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 xl:col-span-5", activeMobileTab !== "controls" ? "hidden lg:block" : "block")}>
          
          {/* Detail & Line Threshold */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <Sliders size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Line Detail & Threshold
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Adjust edge thickness and detail sensitivity
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-black text-cyan-300">
                {threshold}
              </span>
            </div>

            <div className="space-y-2">
              <input 
                type="range"
                min="10"
                max="245"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 transition-all focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-semibold px-0.5">
                <span>Light (64)</span>
                <span>Balanced (128)</span>
                <span>Bold (180)</span>
                <span>Max Contrast</span>
              </div>
            </div>

            {/* 4 Tactile Quick-Chips */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { val: 64, label: "Light Outlines" },
                { val: 128, label: "Balanced" },
                { val: 180, label: "Bold Lines" },
                { val: 220, label: "High Contrast" },
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setThreshold(chip.val)}
                  className={cn(
                    "rounded-xl border py-1.5 text-center text-[10px] font-bold transition-all cursor-pointer",
                    threshold === chip.val
                      ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-200 shadow-xs"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:border-white/20 hover:text-white"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Curve & Corner Geometry Style */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <Spline size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Curve & Corner Style
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Select path geometry and corner smoothing
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                {currentPolicyLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CURVE_POLICIES.map((p) => {
                const isSelected = turnPolicy === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setTurnPolicy(p.value)}
                    className={cn(
                      "relative flex flex-col justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-cyan-400/60 bg-gradient-to-b from-cyan-500/[0.15] to-cyan-500/[0.03] shadow-[0_0_20px_rgba(6,182,212,0.18)]"
                        : "border-white/[0.08] bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-black tracking-wide", isSelected ? "text-cyan-200" : "text-white")}>
                          {p.label}
                        </span>
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold border border-white/10 bg-white/5 text-zinc-400">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-end">
                      <div className={cn(
                        "size-3.5 rounded-full border flex items-center justify-center",
                        isSelected ? "border-cyan-400 bg-cyan-400" : "border-white/20"
                      )}>
                        {isSelected && <span className="size-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color & Canvas Background */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  <Palette size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Vector Colors & Canvas
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Customize SVG fill color and backdrop
                  </p>
                </div>
              </div>
            </div>

            {/* Path Color */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Vector Path Color</span>
                <span className="font-mono text-cyan-300 uppercase">{color}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <input 
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="size-9 rounded-xl bg-transparent border border-white/20 cursor-pointer overflow-hidden outline-none shrink-0"
                  title="Pick custom color"
                />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {["#000000", "#ffffff", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6"].map((c) => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "size-7 rounded-xl border border-white/20 transition-transform active:scale-95 cursor-pointer shadow-xs",
                        color === c && "ring-2 ring-cyan-400 scale-105"
                      )}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas Background */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                SVG Canvas Background
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "transparent", label: "Transparent" },
                  { id: "#ffffff", label: "White" },
                  { id: "#000000", label: "Black" }
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBackground(bg.id)}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center whitespace-nowrap",
                      background === bg.id 
                        ? "bg-cyan-400/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-2.5">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!svgOutput || isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:opacity-95 hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] active:scale-[0.99] disabled:opacity-40 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Tracing Vector Contours...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download Vector SVG</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopySvgCode}
                disabled={!svgOutput}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                {copiedType === "svg" ? <Check size={14} className="text-emerald-400" /> : <Code2 size={14} className="text-cyan-400" />}
                <span>{copiedType === "svg" ? "SVG Copied!" : "Copy SVG Code"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPicture}
                disabled={!svgOutput}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                {copiedType === "png" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-purple-400" />}
                <span>{copiedType === "png" ? "Picture Copied!" : "Copy Picture"}</span>
              </button>
            </div>

            {/* Pipeline Tool Integration */}
            {svgOutput && file && (
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Continue editing:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const svgBlob = new Blob([svgOutput], { type: "image/svg+xml" });
                      const svgUrl = URL.createObjectURL(svgBlob);
                      sendToTool("/tools/image/converter", {
                        name: `${file.name.replace(/\.[^/.]+$/, "")}.svg`,
                        url: svgUrl,
                        fileType: "image",
                        sourceToolId: "svg-vectorizer"
                      });
                    }}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <span>Converter</span>
                    <ArrowRight size={11} className="text-cyan-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const svgBlob = new Blob([svgOutput], { type: "image/svg+xml" });
                      const svgUrl = URL.createObjectURL(svgBlob);
                      sendToTool("/tools/image/resizer", {
                        name: `${file.name.replace(/\.[^/.]+$/, "")}.svg`,
                        url: svgUrl,
                        fileType: "image",
                        sourceToolId: "svg-vectorizer"
                      });
                    }}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <span>Resizer</span>
                    <ArrowRight size={11} className="text-purple-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. MOBILE FLOATING ACTION HUD (< lg viewports) */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-50 rounded-2xl border border-white/15 bg-black/90 p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            {file ? file.name : "No image selected"}
          </p>
          <p className="text-xs font-bold text-white truncate">
            {svgOutput ? "Vector Output Ready" : isProcessing ? "Tracing..." : "Drop or select image"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {svgOutput && (
            <button
              type="button"
              onClick={handleCopySvgCode}
              className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white"
              title="Copy SVG Code"
            >
              <Code2 size={16} className="text-cyan-400" />
            </button>
          )}

          <button
            type="button"
            onClick={svgOutput ? handleDownload : () => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-2.5 text-xs font-black text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)] disabled:opacity-40"
          >
            {isProcessing ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : svgOutput ? (
              <Download size={14} />
            ) : (
              <Upload size={14} />
            )}
            <span>{svgOutput ? "Download SVG" : "Choose File"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
