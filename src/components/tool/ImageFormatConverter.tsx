"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { 
  Upload, 
  Download, 
  FileArchive, 
  RefreshCw, 
  Trash2, 
  Sliders, 
  Check, 
  Loader2, 
  ArrowRight, 
  Plus,
  Eye,
  Copy,
  X,
  Layers,
  Camera,
  ImageIcon,
  Zap,
  RotateCcw,
  Info,
  FileType,
  ArrowRightLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { consumePipelineItem, pipelineUrlToFile, sendToTool } from "@/lib/pipeline";
import { saveFileHistory } from "@/lib/history";

interface ConvFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  originalFormat: string;
  compressedSize?: number;
  progress: number;
  resultUrl?: string;
  resultFormat?: string;
  width?: number;
  height?: number;
  error?: string;
  status: "idle" | "processing" | "done" | "error";
}

type TargetFormat = "WEBP" | "PNG" | "JPG" | "GIF";

interface FormatInfo {
  id: TargetFormat;
  name: string;
  badge: string;
  badgeClass: string;
  desc: string;
  details: string;
  supportsAlpha: boolean;
}

const FORMAT_OPTIONS: FormatInfo[] = [
  {
    id: "WEBP",
    name: "Modern WebP",
    badge: "Recommended",
    badgeClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    desc: "Up to 40% smaller than JPG with crystal clarity.",
    details: "Best for websites, apps & fast sharing. Keeps transparency.",
    supportsAlpha: true,
  },
  {
    id: "PNG",
    name: "Lossless PNG",
    badge: "Maximum Clarity",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    desc: "Pixel-perfect quality with full transparent backgrounds.",
    details: "Best for logos, screenshots, graphics & illustrations.",
    supportsAlpha: true,
  },
  {
    id: "JPG",
    name: "Universal JPG",
    badge: "Most Compatible",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    desc: "Works everywhere on every phone, PC, TV & email.",
    details: "Best for camera photos and digital photo albums. No transparency.",
    supportsAlpha: false,
  },
  {
    id: "GIF",
    name: "Web GIF",
    badge: "Graphic Clip",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    desc: "Universal animated clips and graphic frames.",
    details: "Supported everywhere across Discord, social apps & messaging.",
    supportsAlpha: true,
  },
];

interface DemoBlueprint {
  id: "landscape" | "graphic" | "badge";
  name: string;
  badge: string;
  description: string;
  highlight: string;
  icon: typeof Camera;
}

const DEMO_BLUEPRINTS: DemoBlueprint[] = [
  {
    id: "landscape",
    name: "Scenic Sunset Photo",
    badge: "Camera Photo",
    description: "1600×1000 scenic gradient landscape with mountain layers & water reflections.",
    highlight: "JPG → Ultra-Light WebP",
    icon: Camera,
  },
  {
    id: "graphic",
    name: "Modern Vector Artwork",
    badge: "Digital Art",
    description: "1400×900 cyber graphic with isometric rings, glowing gradients & studio logo.",
    highlight: "Crisp High-Res Export",
    icon: Layers,
  },
  {
    id: "badge",
    name: "Transparent Studio Logo",
    badge: "Transparent Alpha",
    description: "1200×1200 geometric emblem on transparent canvas to test alpha transparency.",
    highlight: "PNG / WebP Transparency",
    icon: ImageIcon,
  },
];

// Client-side demo canvas synthesizer ($0 compute, 100% in-browser)
function generateDemoImageFile(type: "landscape" | "graphic" | "badge"): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(new File(["demo"], `sample-${type}.jpg`, { type: "image/jpeg" }));
      return;
    }

    if (type === "landscape") {
      canvas.width = 1600;
      canvas.height = 1000;

      // Sunset Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, 700);
      sky.addColorStop(0, "#0a0f1d");
      sky.addColorStop(0.3, "#312e81");
      sky.addColorStop(0.6, "#c026d3");
      sky.addColorStop(0.85, "#f97316");
      sky.addColorStop(1, "#fde047");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 1600, 700);

      // Glowing Sun
      ctx.beginPath();
      ctx.arc(800, 520, 95, 0, Math.PI * 2);
      ctx.fillStyle = "#fffbeb";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 80;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mountain layers
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.moveTo(0, 620);
      ctx.lineTo(350, 480);
      ctx.lineTo(600, 560);
      ctx.lineTo(950, 450);
      ctx.lineTo(1300, 580);
      ctx.lineTo(1600, 520);
      ctx.lineTo(1600, 700);
      ctx.lineTo(0, 700);
      ctx.fill();

      // Mountain foreground
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(0, 670);
      ctx.lineTo(250, 580);
      ctx.lineTo(550, 650);
      ctx.lineTo(850, 560);
      ctx.lineTo(1200, 640);
      ctx.lineTo(1600, 590);
      ctx.lineTo(1600, 700);
      ctx.lineTo(0, 700);
      ctx.fill();

      // Water reflection
      const lake = ctx.createLinearGradient(0, 700, 0, 1000);
      lake.addColorStop(0, "#082f49");
      lake.addColorStop(0.5, "#0369a1");
      lake.addColorStop(1, "#021a2e");
      ctx.fillStyle = lake;
      ctx.fillRect(0, 700, 1600, 300);

      // Water light ripples
      ctx.fillStyle = "rgba(253, 224, 71, 0.4)";
      for (let y = 720; y < 980; y += 14) {
        const spread = (y - 700) * 1.8;
        ctx.fillRect(800 - spread / 2, y, spread, 3.5);
      }

      canvas.toBlob((blob) => {
        resolve(new File([blob || "demo"], "sunset-camera-sample.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.95);

    } else if (type === "graphic") {
      canvas.width = 1400;
      canvas.height = 900;

      // Dark futuristic mesh background
      const darkBg = ctx.createLinearGradient(0, 0, 1400, 900);
      darkBg.addColorStop(0, "#020617");
      darkBg.addColorStop(0.5, "#090d1e");
      darkBg.addColorStop(1, "#170e2b");
      ctx.fillStyle = darkBg;
      ctx.fillRect(0, 0, 1400, 900);

      // Ambient glow circles
      const glow1 = ctx.createRadialGradient(400, 350, 20, 400, 350, 450);
      glow1.addColorStop(0, "rgba(6, 182, 212, 0.25)");
      glow1.addColorStop(1, "transparent");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 1400, 900);

      const glow2 = ctx.createRadialGradient(1000, 550, 20, 1000, 550, 450);
      glow2.addColorStop(0, "rgba(168, 85, 247, 0.22)");
      glow2.addColorStop(1, "transparent");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 1400, 900);

      // Geometric isometric circles
      for (let r = 90; r <= 380; r += 55) {
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.12 + (r / 380) * 0.3})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(700, 450, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Modern Centerpiece Card
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(450, 310, 500, 280, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 34px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EXISMIC STUDIO", 700, 430);

      ctx.fillStyle = "#06b6d4";
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("DIGITAL ARTWORK & VECTOR SAMPLE", 700, 475);

      canvas.toBlob((blob) => {
        resolve(new File([blob || "demo"], "modern-vector-graphic.png", { type: "image/png" }));
      }, "image/png");

    } else {
      // Badge with 100% transparent canvas
      canvas.width = 1200;
      canvas.height = 1200;
      ctx.clearRect(0, 0, 1200, 1200);

      // Transparent emblem geometry
      ctx.save();
      ctx.translate(600, 600);

      // Outer Hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = 380 * Math.cos(angle);
        const y = 380 * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 14;
      ctx.shadowColor = "rgba(6, 182, 212, 0.7)";
      ctx.shadowBlur = 35;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner Diamond
      ctx.beginPath();
      ctx.moveTo(0, -220);
      ctx.lineTo(220, 0);
      ctx.lineTo(0, 220);
      ctx.lineTo(-220, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(168, 85, 247, 0.25)";
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 10;
      ctx.fill();
      ctx.stroke();

      // Center Core
      ctx.beginPath();
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 40;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TRANSPARENT CREST", 600, 1080);

      canvas.toBlob((blob) => {
        resolve(new File([blob || "demo"], "transparent-logo-sample.png", { type: "image/png" }));
      }, "image/png");
    }
  });
}

export function ImageFormatConverter() {
  const [files, setFiles] = useState<ConvFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("WEBP");
  const [quality, setQuality] = useState(90);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"queue" | "settings">("queue");
  const [previewModalItem, setPreviewModalItem] = useState<ConvFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consume pipeline asset if passed from another tool (e.g. Background Remover)
  useEffect(() => {
    const item = consumePipelineItem();
    if (item && item.url) {
      pipelineUrlToFile(item.url, item.name || "input-image.png")
        .then((file) => {
          const entry: ConvFile = {
            id: Math.random().toString(36).substring(2, 9),
            file,
            preview: URL.createObjectURL(file),
            originalSize: file.size,
            originalFormat: file.name.split(".").pop()?.toUpperCase() || "PNG",
            progress: 0,
            status: "idle",
          };
          setFiles((prev) => {
            if (prev.some((p) => p.file.name === file.name && p.originalSize === file.size)) {
              return prev;
            }
            return [...prev, entry];
          });
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
            handleUpload([pastedFile] as unknown as FileList);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Reset status on format or quality change
  useEffect(() => {
    setFiles(prev => prev.map(file => {
      if (file.status === "idle" || file.status === "processing") return file;
      return {
        ...file,
        compressedSize: undefined,
        progress: 0,
        resultUrl: undefined,
        resultFormat: undefined,
        width: undefined,
        height: undefined,
        error: undefined,
        status: "idle",
      };
    }));
  }, [targetFormat, quality]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview && !f.preview.startsWith("data:")) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  const handleUpload = useCallback((newFiles: FileList | File[] | null) => {
    if (!newFiles) return;

    const fileList = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);
    const imageFiles = fileList.filter(file => file.type.startsWith("image/"));
    const newEntries: ConvFile[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
      originalFormat: file.name.split('.').pop()?.toUpperCase() || "IMG",
      progress: 0,
      status: "idle"
    }));

    if (newEntries.length > 0) {
      setFiles(prev => [...prev, ...newEntries]);
    }
  }, []);

  const handleSelectDemo = async (demo: DemoBlueprint) => {
    try {
      const demoFile = await generateDemoImageFile(demo.id);
      handleUpload([demoFile]);
    } catch (err) {
      console.error("Failed to load demo photo:", err);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const found = prev.find(f => f.id === id);
      if (found && found.preview && !found.preview.startsWith("data:")) {
        URL.revokeObjectURL(found.preview);
      }
      return filtered;
    });
    if (previewModalItem?.id === id) {
      setPreviewModalItem(null);
    }
  };

  const convertFile = async (item: ConvFile) => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "processing", progress: 25, error: undefined } : f));
    
    try {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("targetFormat", targetFormat.toLowerCase());
      formData.append("quality", quality.toString());

      const response = await fetch("/api/tools/image/converter", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        saveFileHistory({
          originalName: `converted_${item.file.name.split('.')[0]}.${(data.format || targetFormat).toLowerCase()}`,
          toolType: "image-converter",
          fileType: "image",
          resultUrl: data.result,
          metadata: {
            prompt: `Converted to ${(data.format || targetFormat).toUpperCase()}: ${item.file.name}`,
            targetFormat: (data.format || targetFormat).toUpperCase(),
            targetHref: "/tools/image/converter",
            settings: {
              format: (data.format || targetFormat).toUpperCase(),
              quality,
            },
          },
        }).catch((err) => console.warn("Failed to auto-save converted file to history:", err));

        setFiles(prev => prev.map(f => f.id === item.id ? { 
          ...f, 
          status: "done", 
          progress: 100, 
          resultUrl: data.result,
          compressedSize: data.size,
          width: data.width,
          height: data.height,
          resultFormat: data.format?.toUpperCase() || targetFormat,
          error: undefined,
        } : f));
      } else {
        throw new Error(data.error || "Conversion failed");
      }
    } catch (error: unknown) {
      console.error("Conversion failed:", error);
      const message = error instanceof Error ? error.message : "Conversion failed";
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "error", progress: 0, error: message } : f));
    }
  };

  const convertAll = async () => {
    setIsBulkProcessing(true);
    const pendingFiles = files.filter(f => f.status === "idle" || f.status === "error");
    for (const file of pendingFiles) {
      await convertFile(file);
    }
    setIsBulkProcessing(false);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const readyFiles = files.filter(f => f.resultUrl);
    
    for (const f of readyFiles) {
      const response = await fetch(f.resultUrl!);
      const blob = await response.blob();
      const ext = (f.resultFormat || targetFormat).toLowerCase();
      const baseName = f.file.name.replace(/\.[^/.]+$/, "");
      zip.file(`converted_${baseName}.${ext}`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exismic_converted_${targetFormat.toLowerCase()}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleCopyPicture = async (item: ConvFile) => {
    if (!item.resultUrl) return;
    try {
      const res = await fetch(item.resultUrl);
      const blob = await res.blob();
      const pngBlob = await new Promise<Blob>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          const cvs = document.createElement("canvas");
          cvs.width = img.naturalWidth || img.width;
          cvs.height = img.naturalHeight || img.height;
          const ctx = cvs.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          cvs.toBlob((b) => resolve(b || blob), "image/png");
        };
        img.onerror = () => resolve(blob);
      });

      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy picture:", err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Stats calculation
  const stats = useMemo(() => {
    const doneCount = files.filter(f => f.status === "done").length;
    const isAllDone = files.length > 0 && doneCount === files.length;
    return {
      total: files.length,
      doneCount,
      isAllDone,
      statusLabel: isAllDone 
        ? "All Converted" 
        : isBulkProcessing 
        ? "Converting..." 
        : files.length > 0 
        ? "Ready to Convert" 
        : "No Photos Added",
    };
  }, [files, isBulkProcessing]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 animate-in fade-in duration-500 pb-10">
      
      {/* 1. HEADER LIVE STATS BANNER (Plain English, Zero Tech Jargon) */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.1] bg-[#090c16]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.25)]">
            <FileType size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Image Format</span>
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Converter</span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Transform photos between WebP, PNG, JPG, and GIF with crystal clarity and zero quality loss.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-3.5 py-2 text-left min-w-[95px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Photos</p>
            <p className="mt-0.5 text-base font-black text-white font-mono">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-left min-w-[105px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Target</p>
            <p className="mt-0.5 text-base font-black text-cyan-200 font-mono">{targetFormat}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-3.5 py-2 text-left min-w-[110px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Status</p>
            <p className="mt-0.5 text-xs font-bold text-cyan-300 truncate">
              {stats.statusLabel}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MOBILE VIEW SWITCHER */}
      <div className="lg:hidden grid grid-cols-2 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveMobileTab("queue")}
          className={cn(
            "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeMobileTab === "queue"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Photos & Queue ({files.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("settings")}
          className={cn(
            "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeMobileTab === "settings"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Format & Quality</span>
        </button>
      </div>

      {/* 3. DUAL COLUMN LUXURY STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: BATCH STAGE, QUEUE & 3 INSTANT BLUEPRINTS */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 xl:col-span-7", activeMobileTab !== "queue" ? "hidden lg:block" : "block")}>
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
                  CONVERSION STAGE
                </span>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {files.length} {files.length === 1 ? "Photo" : "Photos"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <Plus size={13} className="text-cyan-400" />
                  <span>Add More</span>
                </button>
                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hidden File Input */}
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*"
              className="hidden" 
              onChange={(e) => handleUpload(e.target.files)} 
            />

            {/* Workspace: Dropzone or Queue List */}
            {files.length === 0 ? (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex min-h-[290px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/40 px-5 py-8 text-center transition-all hover:border-cyan-400/50 hover:bg-cyan-500/[0.02] cursor-pointer"
              >
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-transform duration-300 group-hover:scale-110">
                  <Upload size={28} />
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Choose photos to convert
                </h4>
                <p className="mt-1.5 text-xs text-zinc-400 max-w-sm leading-relaxed">
                  Drop images here, browse from your computer, or paste directly with <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-cyan-200 font-mono">Ctrl + V</kbd>.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">PNG</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">JPG</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">WebP</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">AVIF</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">GIF</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Batch Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                  <span className="text-zinc-400 font-medium">
                    {stats.doneCount} of {files.length} converted to <span className="font-bold text-cyan-300">{targetFormat}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={convertAll}
                      disabled={isBulkProcessing || files.every(f => f.status === "done")}
                      className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-200 transition-all hover:bg-cyan-500/25 disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    >
                      {isBulkProcessing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                      <span>Convert All</span>
                    </button>
                    {files.some(f => f.status === "done") && (
                      <button
                        type="button"
                        onClick={downloadZip}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/10 cursor-pointer"
                      >
                        <FileArchive size={13} className="text-purple-400" />
                        <span>Download ZIP</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* File List */}
                <div className="custom-scrollbar max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
                  {files.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      className="group relative flex flex-col sm:flex-row sm:items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-3 transition-all hover:border-cyan-500/30 hover:bg-black/60"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Thumbnail with Inspect overlay */}
                        <div 
                          onClick={() => setPreviewModalItem(item)}
                          className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 cursor-pointer group/thumb shadow-md"
                          title="Click to inspect photo"
                        >
                          <img 
                            src={item.resultUrl || item.preview} 
                            className="size-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" 
                            alt={item.file.name} 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover/thumb:opacity-100 flex items-center justify-center">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[240px]">
                              {item.file.name}
                            </p>
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 uppercase">
                              {item.originalFormat}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400">
                            <span>{formatSize(item.originalSize)}</span>
                            {item.status === "done" && (
                              <>
                                <ArrowRight size={11} className="text-cyan-400 shrink-0" />
                                <span className="font-bold text-cyan-300">
                                  {formatSize(item.compressedSize || 0)} ({item.resultFormat})
                                </span>
                              </>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {item.status === "processing" && (
                            <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" 
                                initial={{ width: 0 }} 
                                animate={{ width: `${item.progress}%` }} 
                              />
                            </div>
                          )}

                          {/* Error Notice */}
                          {item.status === "error" && (
                            <p className="mt-1 text-[10px] font-semibold text-rose-400">
                              {item.error || "Failed to convert"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {item.status === "done" ? (
                          <>
                            {/* Copy Picture */}
                            <button
                              type="button"
                              onClick={() => handleCopyPicture(item)}
                              className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
                              title="Copy photo to clipboard"
                            >
                              {copiedId === item.id ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                            </button>

                            {/* Download Single Image */}
                            <button
                              type="button"
                              onClick={() => {
                                const a = document.createElement("a");
                                a.href = item.resultUrl!;
                                const baseName = item.file.name.replace(/\.[^/.]+$/, "");
                                a.download = `converted_${baseName}.${(item.resultFormat || targetFormat).toLowerCase()}`;
                                a.click();
                              }}
                              className="flex size-9 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-300 cursor-pointer"
                              title="Download converted photo"
                            >
                              <Download size={15} />
                            </button>

                            {/* Pipeline: Send to Compressor */}
                            <button
                              type="button"
                              onClick={() => sendToTool("/tools/image/compressor", {
                                name: `converted-${item.file.name}`,
                                url: item.resultUrl!,
                                fileType: "image",
                                sourceToolId: "image-converter"
                              })}
                              className="hidden sm:flex size-9 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-300 transition-all hover:bg-amber-500/20 cursor-pointer"
                              title="Send to Bulk Compressor"
                            >
                              <Zap size={14} />
                            </button>

                            {/* Pipeline: Send to Resizer */}
                            <button
                              type="button"
                              onClick={() => sendToTool("/tools/image/resizer", {
                                name: `converted-${item.file.name}`,
                                url: item.resultUrl!,
                                fileType: "image",
                                sourceToolId: "image-converter"
                              })}
                              className="hidden sm:flex size-9 items-center justify-center rounded-lg border border-purple-500/25 bg-purple-500/10 text-purple-300 transition-all hover:bg-purple-500/20 cursor-pointer"
                              title="Send to Resizer & Cropper"
                            >
                              <ArrowRight size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => convertFile(item)}
                            disabled={item.status === "processing"}
                            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-500/20 cursor-pointer disabled:opacity-40"
                          >
                            {item.status === "processing" ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <RefreshCw size={13} />
                            )}
                            <span>Convert</span>
                          </button>
                        )}

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3 INSTANT 1-CLICK DEMONSTRATION BLUEPRINTS ($0 COMPUTE CLIENT CANVAS) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <ArrowRightLeft size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Instant Test Samples
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Try format conversion in 1-click with zero setup ($0 server compute)
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
                      <span className="text-zinc-500 group-hover:text-white transition-colors">Load &rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: FORMAT CONSOLE, QUALITY SLIDER & INTELLIGENCE */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 xl:col-span-5", activeMobileTab !== "settings" ? "hidden lg:block" : "block")}>
          
          {/* Target Format Selector */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <FileType size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Target Format
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Choose output format for your converted pictures
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                {targetFormat}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FORMAT_OPTIONS.map((fmt) => {
                const isSelected = targetFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTargetFormat(fmt.id)}
                    className={cn(
                      "relative flex flex-col justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-cyan-400/60 bg-gradient-to-b from-cyan-500/[0.15] to-cyan-500/[0.03] shadow-[0_0_20px_rgba(6,182,212,0.18)]"
                        : "border-white/[0.08] bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-black tracking-wide", isSelected ? "text-cyan-200" : "text-white")}>
                          {fmt.name}
                        </span>
                        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold border", fmt.badgeClass)}>
                          {fmt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {fmt.desc}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px]">
                      <span className={cn(
                        "font-medium",
                        fmt.supportsAlpha ? "text-emerald-400" : "text-zinc-500"
                      )}>
                        {fmt.supportsAlpha ? "Supports Transparency" : "No Transparency"}
                      </span>
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

          {/* Image Quality Tuning */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  <Sliders size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Image Quality
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Adjust compression balance & file size
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-black text-cyan-300">
                {quality}%
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input 
                type="range" 
                min="20" 
                max="100" 
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 transition-all focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-semibold px-0.5">
                <span>20% (Compact)</span>
                <span>80% (Balanced)</span>
                <span>100% (Maximum Clarity)</span>
              </div>
            </div>

            {/* 4 Tactile Quick-Chips */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { val: 60, label: "60% Compact" },
                { val: 80, label: "80% Balanced" },
                { val: 90, label: "90% High" },
                { val: 100, label: "100% Best" },
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setQuality(chip.val)}
                  className={cn(
                    "rounded-xl border py-1.5 text-center text-[10px] font-bold transition-all cursor-pointer",
                    quality === chip.val
                      ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-200 shadow-xs"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:border-white/20 hover:text-white"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-zinc-400 bg-white/[0.02] border border-white/[0.06] rounded-xl p-2.5 leading-relaxed">
              {targetFormat === "PNG" ? (
                <span><strong>Note:</strong> PNG uses lossless compression. The quality parameter optimizes encoding compression without losing any pixels.</span>
              ) : targetFormat === "WEBP" ? (
                <span><strong>Recommended:</strong> 90% WebP delivers near-lossless clarity while slashing file size by up to 50% compared to JPG.</span>
              ) : targetFormat === "JPG" ? (
                <span><strong>Tip:</strong> 85%–90% is the sweet spot for crisp photo prints and website galleries.</span>
              ) : (
                <span><strong>Tip:</strong> GIFs are optimized for simple graphic animations and social clips.</span>
              )}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-3">
            <button
              type="button"
              onClick={convertAll}
              disabled={isBulkProcessing || files.length === 0 || files.every(f => f.status === "done")}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:opacity-95 hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] active:scale-[0.99] disabled:opacity-40 cursor-pointer"
            >
              {isBulkProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Converting Photos...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Convert All to {targetFormat}</span>
                </>
              )}
            </button>

            {files.some(f => f.status === "done") && (
              <button
                type="button"
                onClick={downloadZip}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-white/10 cursor-pointer"
              >
                <FileArchive size={15} className="text-purple-400" />
                <span>Download All Converted (ZIP)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. MOBILE FLOATING ACTION HUD (< lg viewports) */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-50 rounded-2xl border border-white/15 bg-black/90 p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Target: <span className="text-cyan-300">{targetFormat}</span> &bull; {files.length} {files.length === 1 ? "Photo" : "Photos"}
          </p>
          <p className="text-xs font-bold text-white truncate">
            {stats.statusLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {files.some(f => f.status === "done") && (
            <button
              type="button"
              onClick={downloadZip}
              className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white"
              title="Download ZIP"
            >
              <FileArchive size={16} className="text-purple-400" />
            </button>
          )}

          <button
            type="button"
            onClick={convertAll}
            disabled={isBulkProcessing || files.length === 0 || files.every(f => f.status === "done")}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-3.5 py-2.5 text-xs font-black text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)] disabled:opacity-40"
          >
            {isBulkProcessing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>Convert</span>
          </button>
        </div>
      </div>

      {/* 5. 100% ZOOM QUALITY INSPECTION MODAL */}
      <AnimatePresence>
        {previewModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-white/15 bg-[#090c16] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <Eye size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white truncate max-w-[220px] sm:max-w-md">
                      {previewModalItem.file.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      {previewModalItem.status === "done" 
                        ? `Converted to ${previewModalItem.resultFormat || targetFormat} (${formatSize(previewModalItem.compressedSize || 0)})`
                        : `Original ${previewModalItem.originalFormat} (${formatSize(previewModalItem.originalSize)})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {previewModalItem.status === "done" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopyPicture(previewModalItem)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
                      >
                        {copiedId === previewModalItem.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>Copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = previewModalItem.resultUrl!;
                          const baseName = previewModalItem.file.name.replace(/\.[^/.]+$/, "");
                          a.download = `converted_${baseName}.${(previewModalItem.resultFormat || targetFormat).toLowerCase()}`;
                          a.click();
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-cyan-400 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-cyan-300"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewModalItem(null)}
                    className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Image Area (Checkered pattern for transparency check) */}
              <div 
                className="relative flex-1 min-h-[300px] sm:min-h-[450px] overflow-auto flex items-center justify-center p-4 bg-[linear-gradient(45deg,#131622_25%,transparent_25%),linear-gradient(-45deg,#131622_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#131622_75%),linear-gradient(-45deg,transparent_75%,#131622_75%)] bg-[size:20px_20px] bg-black"
              >
                <img 
                  src={previewModalItem.resultUrl || previewModalItem.preview} 
                  alt={previewModalItem.file.name} 
                  className="max-h-[70vh] max-w-full rounded-lg shadow-2xl object-contain"
                />
              </div>

              {/* Modal Footer Specs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3 bg-black/40 text-xs">
                <div className="flex items-center gap-4 text-zinc-400">
                  <span>Source: <strong className="text-white font-mono">{formatSize(previewModalItem.originalSize)}</strong></span>
                  {previewModalItem.status === "done" && (
                    <span>Output: <strong className="text-cyan-300 font-mono">{formatSize(previewModalItem.compressedSize || 0)}</strong></span>
                  )}
                  {previewModalItem.width && previewModalItem.height && (
                    <span>Dimensions: <strong className="text-white font-mono">{previewModalItem.width}&times;{previewModalItem.height}</strong></span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-500">
                  Press Esc or click &times; to close
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
