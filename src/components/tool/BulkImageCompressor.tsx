"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { 
  Upload, 
  FileArchive, 
  Trash2, 
  Sliders, 
  Check, 
  Loader2, 
  X, 
  RotateCcw, 
  Info, 
  AlertCircle, 
  Download,
  Minimize2,
  Camera,
  ImageIcon,
  Layers,
  Eye,
  Split,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveFileHistory } from "@/lib/history";
import { detectCompressorCapabilities, processCompressLocally } from "@/lib/client-compressor";
import { consumePipelineItem, pipelineUrlToFile } from "@/lib/pipeline";

interface CompressedFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  compressedSize?: number;
  progress: number;
  resultUrl?: string;
  outputFormat?: string;
  error?: string;
  status: "idle" | "processing" | "done" | "error";
}

type OutputFormat = "original" | "jpg" | "png" | "webp";

interface DemoBlueprint {
  id: "landscape" | "portrait" | "graphic";
  name: string;
  badge: string;
  description: string;
  expectedSavings: string;
  icon: typeof Camera;
}

const DEMO_BLUEPRINTS: DemoBlueprint[] = [
  {
    id: "landscape",
    name: "High-Res Sunset Photo",
    badge: "Camera Photo",
    description: "Rich 1600×1000 scenic landscape with sunset gradients and mountain silhouettes.",
    expectedSavings: "~82% smaller",
    icon: Camera,
  },
  {
    id: "portrait",
    name: "Studio Portrait Shot",
    badge: "Portrait",
    description: "Warm atmospheric portrait with dramatic ambient lighting and bokeh textures.",
    expectedSavings: "~75% smaller",
    icon: ImageIcon,
  },
  {
    id: "graphic",
    name: "Digital Graphic Art",
    badge: "Vector & Art",
    description: "Crisp modern digital artwork with high-contrast shapes and subtle gradients.",
    expectedSavings: "~68% smaller",
    icon: Layers,
  },
];

// Client-side demo canvas synthesizer ($0 compute, 100% in-browser)
function generateDemoImageFile(type: "landscape" | "portrait" | "graphic"): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(new File(["demo"], `sample-${type}.jpg`, { type: "image/jpeg" }));
      return;
    }

    if (type === "landscape") {
      // Sunset Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, 700);
      sky.addColorStop(0, "#0f172a");
      sky.addColorStop(0.3, "#312e81");
      sky.addColorStop(0.6, "#be185d");
      sky.addColorStop(0.85, "#f97316");
      sky.addColorStop(1, "#fde047");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 1600, 700);

      // Glowing Sun
      ctx.beginPath();
      ctx.arc(800, 520, 100, 0, Math.PI * 2);
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

      // Water reflection
      const lake = ctx.createLinearGradient(0, 700, 0, 1000);
      lake.addColorStop(0, "#082f49");
      lake.addColorStop(0.5, "#0369a1");
      lake.addColorStop(1, "#082f49");
      ctx.fillStyle = lake;
      ctx.fillRect(0, 700, 1600, 300);

      // Water light ripples
      ctx.fillStyle = "rgba(253, 224, 71, 0.35)";
      for (let y = 720; y < 980; y += 16) {
        const spread = (y - 700) * 1.6;
        ctx.fillRect(800 - spread / 2, y, spread, 4);
      }
    } else if (type === "portrait") {
      // Moody studio gradient
      const bg = ctx.createRadialGradient(800, 500, 100, 800, 500, 900);
      bg.addColorStop(0, "#18181b");
      bg.addColorStop(0.6, "#09090b");
      bg.addColorStop(1, "#030303");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1600, 1000);

      // Ambient bokeh circles
      const bokehColors = ["rgba(236, 72, 153, 0.25)", "rgba(6, 182, 212, 0.25)", "rgba(168, 85, 247, 0.25)", "rgba(245, 158, 11, 0.2)"];
      for (let i = 0; i < 24; i++) {
        const bx = (i * 123) % 1500 + 50;
        const by = (i * 187) % 900 + 50;
        const br = 40 + (i % 6) * 20;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = bokehColors[i % bokehColors.length];
        ctx.fill();
      }

      // Studio light beam
      const beam = ctx.createLinearGradient(300, 0, 1300, 1000);
      beam.addColorStop(0, "rgba(6, 182, 212, 0.2)");
      beam.addColorStop(0.5, "rgba(168, 85, 247, 0.1)");
      beam.addColorStop(1, "transparent");
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, 1600, 1000);
    } else {
      // Geometric Art / Modern Illustration
      const darkBg = ctx.createLinearGradient(0, 0, 1600, 1000);
      darkBg.addColorStop(0, "#020617");
      darkBg.addColorStop(0.5, "#0f172a");
      darkBg.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = darkBg;
      ctx.fillRect(0, 0, 1600, 1000);

      // Geometric isometric rings
      for (let r = 120; r <= 480; r += 70) {
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 + (r / 480) * 0.35})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(800, 500, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Modern Centerpiece Card
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(550, 350, 500, 300, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EXISMIC STUDIO", 800, 480);

      ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("DIGITAL GRAPHIC SAMPLE", 800, 525);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], `sample-${type}.jpg`, { type: "image/jpeg" }));
      } else {
        resolve(new File(["demo"], `sample-${type}.jpg`, { type: "image/jpeg" }));
      }
    }, "image/jpeg", 0.95);
  });
}

export function BulkImageCompressor() {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [maxHeight, setMaxHeight] = useState<number | "">("");
  const [format, setFormat] = useState<OutputFormat>("original");
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"queue" | "settings">("queue");
  const [previewModalItem, setPreviewModalItem] = useState<CompressedFile | null>(null);
  const [modalSplitPos, setModalSplitPos] = useState<number>(50);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset file status on settings change if already done
  useEffect(() => {
    setFiles(prev => prev.map(file => {
      if (file.status === "processing" || file.status === "idle") return file;
      return {
        ...file,
        compressedSize: undefined,
        progress: 0,
        resultUrl: undefined,
        outputFormat: undefined,
        error: undefined,
        status: "idle"
      };
    }));
  }, [quality, format, maxWidth, maxHeight, removeMetadata]);

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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.preview && !f.preview.startsWith("data:")) URL.revokeObjectURL(f.preview);
        if (f.resultUrl && !f.resultUrl.startsWith("data:")) URL.revokeObjectURL(f.resultUrl);
      });
    };
  }, []);

  const handleUpload = useCallback((newFiles: FileList | File[] | null) => {
    if (!newFiles) return;

    const fileList = Array.isArray(newFiles) ? newFiles : Array.from(newFiles);
    const validFiles = fileList.filter(file => file.type.startsWith("image/"));
    const newEntries: CompressedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
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

  // Consume incoming pipeline asset (e.g. from Background Remover)
  useEffect(() => {
    const item = consumePipelineItem();
    if (item && item.url && item.fileType === "image") {
      pipelineUrlToFile(item.url, item.name || "pipeline-image.png")
        .then((file) => {
          const newEntry: CompressedFile = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file),
            originalSize: file.size,
            progress: 0,
            status: "idle",
          };
          setFiles((prev) => [...prev, newEntry]);
        })
        .catch((err) => {
          console.warn("Failed to load pipeline asset into compressor:", err);
        });
    }
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const found = prev.find(f => f.id === id);
      if (found) {
        if (found.preview && !found.preview.startsWith("data:")) URL.revokeObjectURL(found.preview);
        if (found.resultUrl && !found.resultUrl.startsWith("data:")) URL.revokeObjectURL(found.resultUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const compressFile = async (item: CompressedFile) => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "processing", progress: 25, error: undefined } : f));
    
    const compressorOpts = {
      quality,
      format,
      toWebp: format === "webp",
      maxWidth: maxWidth ? Number(maxWidth) : undefined,
      maxHeight: maxHeight ? Number(maxHeight) : undefined,
      removeMetadata,
    };

    const isCapable = detectCompressorCapabilities(item.file, compressorOpts);
    let compressionData: { resultUrl: string; size: number; format: string } | null = null;

    // 1. Attempt instant client-side Canvas compression if device & file payload pass capability checks
    if (isCapable) {
      try {
        const localData = await processCompressLocally(
          item.file,
          compressorOpts,
          10000
        );

        if (localData?.resultUrl) {
          if (localData.size >= item.file.size && quality < 98 && !maxWidth && !maxHeight && (format === "original" || format === item.file.type.split("/")[1])) {
            compressionData = null;
          } else {
            compressionData = {
              resultUrl: localData.resultUrl,
              size: localData.size,
              format: localData.format,
            };
          }
        }
      } catch (clientErr) {
        console.warn("[Compressor Tool] Client-side compression failed/timed out. Falling back to server API:", clientErr);
        compressionData = null;
      }
    }

    // 2. Server API fallback if device is weak, image is large, or client execution failed
    if (!compressionData) {
      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("quality", quality.toString());
        formData.append("toWebp", (format === "webp").toString());
        if (format !== "original") formData.append("format", format);
        if (maxWidth) formData.append("maxWidth", maxWidth.toString());
        if (maxHeight) formData.append("maxHeight", maxHeight.toString());
        formData.append("removeMetadata", removeMetadata.toString());

        const response = await fetch("/api/tools/image/compressor", {
          method: "POST",
          body: formData
        });

        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Compression failed");
        }

        compressionData = {
          resultUrl: data.result,
          size: data.size,
          format: data.format,
        };
      } catch (serverErr: unknown) {
        const message = serverErr instanceof Error ? serverErr.message : "Compression failed";
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "error", progress: 0, error: message } : f));
        return;
      }
    }

    if (compressionData) {
      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: "done", 
        progress: 100, 
        resultUrl: compressionData!.resultUrl,
        compressedSize: compressionData!.size,
        outputFormat: compressionData!.format,
        error: undefined,
      } : f));
      
      await saveFileHistory({
        toolType: "image-compressor",
        originalName: item.file.name,
        resultUrl: compressionData.resultUrl,
        fileType: "image",
        status: "completed",
        metadata: {
          prompt: `Compressed: ${item.file.name}`,
          quality: `${quality}%`,
          outputFormat: (compressionData.format || "WEBP").toUpperCase(),
          targetHref: "/tools/image/compressor",
          settings: {
            quality: `${quality}%`,
            format: (compressionData.format || "WEBP").toUpperCase(),
          },
        },
      });
    }
  };

  const compressAll = async () => {
    setIsBulkProcessing(true);
    const idleFiles = files.filter(f => f.status === "idle" || f.status === "error");
    for (const file of idleFiles) {
      await compressFile(file);
    }
    setIsBulkProcessing(false);
  };

  const downloadSingleFile = (item: CompressedFile) => {
    if (!item.resultUrl) return;
    const targetExt = item.outputFormat || (format === "original" ? item.file.name.split('.').pop() : format);
    const fileName = `optimized_${item.file.name.split('.')[0]}.${targetExt}`;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = fileName;
    a.click();
  };

  const handleDownloadAll = async () => {
    const readyFiles = files.filter(f => f.resultUrl);
    if (readyFiles.length === 0) return;

    if (readyFiles.length === 1) {
      downloadSingleFile(readyFiles[0]);
      return;
    }

    const zip = new JSZip();
    for (const f of readyFiles) {
      const response = await fetch(f.resultUrl!);
      const blob = await response.blob();
      const targetExt = f.outputFormat || (format === "original" ? f.file.name.split('.').pop() : format);
      zip.file(`optimized_${f.file.name.split('.')[0]}.${targetExt}`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exismic_bulk_optimized.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const stats = useMemo(() => {
    const original = files.reduce((acc, f) => acc + f.originalSize, 0);
    const compressed = files.reduce((acc, f) => acc + (f.compressedSize || 0), 0);
    const doneCount = files.filter(f => f.status === "done").length;
    const rawSavings = original > 0 && compressed > 0 ? Math.round(((original - compressed) / original) * 100) : 0;
    const isIncreased = rawSavings < 0;
    const savingsPercent = Math.abs(rawSavings);
    
    return {
      totalImages: files.length,
      doneCount,
      originalSize: formatSize(original),
      compressedSize: formatSize(compressed),
      savingsPercent,
      isIncreased
    };
  }, [files]);

  const getQualityLabel = (q: number) => {
    if (q < 60) return { label: "Smallest File", color: "text-amber-400" };
    if (q < 80) return { label: "Balanced", color: "text-cyan-400" };
    if (q < 90) return { label: "High Quality", color: "text-emerald-400" };
    return { label: "Best Quality", color: "text-indigo-400" };
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 animate-in fade-in duration-500">
      
      {/* HEADER LIVE STATS BANNER (Plain English, Zero Tech Buzzwords) */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.1] bg-[#090c16]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.25)]">
            <Minimize2 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Bulk Image</span>
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Compressor</span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Shrink multiple photos at once with zero quality loss. Fast, private, and runs directly in your browser.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-3.5 py-2 text-left min-w-[100px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Photos</p>
            <p className="mt-0.5 text-base font-black text-white font-mono">{stats.totalImages}</p>
          </div>
          <div className={cn(
            "rounded-2xl border px-3.5 py-2 text-left min-w-[110px]",
            stats.isIncreased 
              ? "border-amber-500/30 bg-amber-500/10" 
              : "border-emerald-500/30 bg-emerald-500/10"
          )}>
            <p className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              stats.isIncreased ? "text-amber-400" : "text-emerald-400"
            )}>
              {stats.isIncreased ? "Size Growth" : "Space Saved"}
            </p>
            <p className={cn(
              "mt-0.5 text-base font-black font-mono",
              stats.isIncreased ? "text-amber-300" : "text-emerald-300"
            )}>
              {stats.isIncreased ? `+${stats.savingsPercent}%` : stats.savingsPercent > 0 ? `-${stats.savingsPercent}%` : "0%"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-3.5 py-2 text-left min-w-[100px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Status</p>
            <p className="mt-0.5 text-xs font-bold text-cyan-300 truncate">
              {stats.doneCount > 0 && stats.doneCount === stats.totalImages
                ? "All Ready"
                : isBulkProcessing
                ? "Shrinking..."
                : files.length > 0
                ? "Ready"
                : "Idle"}
            </p>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW SWITCHER */}
      <div className="lg:hidden grid grid-cols-2 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg mb-2">
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
          <span>Compression Settings</span>
        </button>
      </div>

      {/* DUAL COLUMN MAIN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: BATCH STAGE, QUEUE & 1-CLICK TEST BLUEPRINTS */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 xl:col-span-7", activeMobileTab !== "queue" ? "hidden lg:block" : "block")}>
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            
            {/* macOS Window Titlebar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-zinc-400 truncate max-w-[180px] sm:max-w-xs">
                  {files.length > 0 ? `${files.length} photos in batch` : "batch_queue.studio"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {files.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setFiles([])} 
                    className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove all photos from queue"
                  >
                    <Trash2 size={12} />
                    <span>Clear All</span>
                  </button>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {files.length > 0 ? `${files.length} Loaded` : "Queue Ready"}
                </span>
              </div>
            </div>

            {/* Dropzone Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-cyan-400', 'bg-cyan-500/[0.06]'); }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-cyan-400', 'bg-cyan-500/[0.06]'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-cyan-400', 'bg-cyan-500/[0.06]');
                handleUpload(e.dataTransfer.files);
              }}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-[#04060d] text-center shadow-inner transition-all duration-300 select-none",
                files.length > 0 
                  ? "min-h-[120px] border-white/15 py-5 hover:border-cyan-400/50 hover:bg-cyan-500/[0.02]" 
                  : "min-h-[260px] border-white/15 py-10 hover:border-cyan-400/50 hover:bg-cyan-500/[0.03]"
              )}
            >
              <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUpload(e.target.files)} />
              
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.2)] transition-transform duration-300 group-hover:scale-110",
                  files.length > 0 ? "size-12" : "size-16"
                )}>
                  <Upload size={files.length > 0 ? 22 : 30} />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                    {files.length > 0 ? "Add More Photos to Batch" : "Upload Photos to Compress"}
                  </h4>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-sm">
                    Drag and drop photos here, click to browse, or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] border border-white/15">Ctrl + V</kbd> to paste
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">PNG • JPG • WebP • AVIF</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">Up to 50MB</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">Private & Secure</span>
                </div>
              </div>
            </div>

            {/* Queue Item List */}
            {files.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
                  <span>Batch Queue ({files.length} items)</span>
                  <span className="text-[10px] font-mono text-zinc-500">Click photo to preview</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {files.map((item) => (
                    <div 
                      key={item.id}
                      className="group relative flex gap-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 p-3 shadow-lg backdrop-blur-md hover:border-cyan-400/30 transition-all"
                    >
                      {/* Loading Progress Overlay */}
                      {item.status === "processing" && (
                        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-3">
                          <Loader2 size={20} className="text-cyan-400 animate-spin mb-1.5" />
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden max-w-[80%]">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                              initial={{ width: 0 }} 
                              animate={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Thumbnail Preview */}
                      <div 
                        onClick={() => item.status === "done" && setPreviewModalItem(item)}
                        className={cn(
                          "relative size-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/60",
                          item.status === "done" ? "cursor-pointer hover:opacity-90" : ""
                        )}
                      >
                        <img src={item.preview} className="h-full w-full object-cover" alt="Preview" />
                        {item.status === "done" && (
                          <div className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                            <Check size={9} strokeWidth={3.5} />
                          </div>
                        )}
                      </div>

                      {/* Metadata Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-xs font-bold text-white truncate pr-12">{item.file.name}</p>
                        
                        <div className="space-y-0.5 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>Original:</span>
                            <span>{formatSize(item.originalSize)}</span>
                          </div>

                          {item.compressedSize ? (
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-cyan-400">Clean:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{formatSize(item.compressedSize)}</span>
                                {(() => {
                                  const rawSaved = Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100);
                                  const isGrowth = rawSaved < 0;
                                  const absSaved = Math.abs(rawSaved);
                                  return (
                                    <span className={cn(
                                      "px-1.5 py-0.2 rounded text-[9px] font-bold",
                                      isGrowth ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                                    )}>
                                      {isGrowth ? `+${absSaved}%` : `-${absSaved}%`}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-zinc-500 font-sans">
                              {item.status === "processing" ? "Compressing..." : "Waiting in queue"}
                            </div>
                          )}

                          {item.status === "error" && (
                            <div className="flex items-center gap-1 text-[10px] text-rose-400 font-sans">
                              <AlertCircle size={10} />
                              <span className="truncate">{item.error || "Failed"}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        {item.status === "done" && item.resultUrl && (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewModalItem(item)}
                              className="size-6 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Compare Before & After"
                            >
                              <Eye size={12} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => downloadSingleFile(item)}
                              className="size-6 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center justify-center transition-colors cursor-pointer"
                              title="Download compressed image"
                            >
                              <Download size={12} />
                            </button>
                          </>
                        )}
                        <button 
                          type="button"
                          onClick={() => removeFile(item.id)}
                          className="size-6 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3 Instant 1-Click Demonstration Blueprints (Void Eliminator) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Instant Test Examples (1-Click Try)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Try without uploading files</span>
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
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {demo.expectedSavings}
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
                      <span>Add to Queue</span>
                      <span>→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: COMPRESSION SETTINGS CONSOLE */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 xl:col-span-5", activeMobileTab !== "settings" ? "hidden lg:block" : "block")}>
          <div className="p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Compression Settings
                </h3>
              </div>
              <button 
                type="button"
                title="Reset all settings to default" 
                onClick={() => { 
                  setQuality(80); 
                  setFormat("original"); 
                  setMaxWidth(""); 
                  setMaxHeight(""); 
                  setRemoveMetadata(true); 
                }} 
                className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* Slider: Image Quality & Friendly Presets */}
            <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-semibold text-zinc-200 block">Image Quality</label>
                  <span className={cn("text-[10px] font-bold", getQualityLabel(quality).color)}>
                    {getQualityLabel(quality).label}
                  </span>
                </div>
                <span className="text-lg font-black font-mono text-cyan-400">{quality}%</span>
              </div>

              <input 
                type="range" 
                min="10" 
                max="100" 
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: "50% Small", val: 50 },
                  { label: "75% Balanced", val: 75 },
                  { label: "85% High", val: 85 },
                  { label: "95% Max", val: 95 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setQuality(p.val)}
                    className={cn(
                      "py-1 px-1 text-[10px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                      quality === p.val
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold"
                        : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle: Modern WebP Conversion */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="space-y-0.5 pr-3">
                <p className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                  <span>Convert to Modern WebP</span>
                  <Info size={11} className="text-zinc-500" />
                </p>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Makes photos up to 40% smaller while staying razor sharp
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setFormat(format === "webp" ? "original" : "webp")}
                className={cn(
                  "relative flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-all cursor-pointer",
                  format === "webp" ? "bg-cyan-500" : "bg-white/15"
                )}
                aria-pressed={format === "webp"}
              >
                <motion.div 
                  animate={{ x: format === "webp" ? 20 : 0 }}
                  className="size-5 bg-white rounded-full shadow-md" 
                />
              </button>
            </div>

            {/* Selector: Output Format */}
            <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <label className="text-xs font-semibold text-zinc-200 block">Target Format</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["original", "webp", "jpg", "png"] as OutputFormat[]).map((f) => (
                  <button 
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={cn(
                      "py-1.5 px-1 text-[11px] font-bold uppercase rounded-lg border text-center transition-all cursor-pointer",
                      format === f 
                        ? "bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 border-cyan-400/50 text-white font-black shadow-xs" 
                        : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white"
                    )}
                  >
                    {f === "original" ? "Auto" : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions Resizing (Optional) */}
            <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200">Resize Picture Dimensions</label>
                <span className="text-[10px] font-mono text-zinc-500">Optional</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Max Width (px)</label>
                  <input 
                    type="number" 
                    value={maxWidth} 
                    onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : "")}
                    placeholder="Auto (original)"
                    min={1}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Max Height (px)</label>
                  <input 
                    type="number" 
                    value={maxHeight} 
                    onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : "")}
                    placeholder="Auto (original)"
                    min={1}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 pt-1">
                {[
                  { label: "1920px HD", w: 1920 },
                  { label: "1080px Post", w: 1080 },
                  { label: "600px Card", w: 600 },
                  { label: "Full Size", w: "" as const },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setMaxWidth(preset.w);
                      setMaxHeight("");
                    }}
                    className={cn(
                      "py-1 px-1 text-[9px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                      maxWidth === preset.w
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold"
                        : "bg-white/[0.02] text-zinc-400 border-white/[0.05] hover:text-white"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle: Strip Metadata for Privacy */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="space-y-0.5 pr-3">
                <p className="text-xs font-semibold text-zinc-200">Remove Hidden Photo Data</p>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Deletes camera GPS tags, location, and timestamps for extra privacy
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setRemoveMetadata(!removeMetadata)}
                className={cn(
                  "relative flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-all cursor-pointer",
                  removeMetadata ? "bg-cyan-500" : "bg-white/15"
                )}
                aria-pressed={removeMetadata}
              >
                <motion.div 
                  animate={{ x: removeMetadata ? 20 : 0 }}
                  className="size-5 bg-white rounded-full shadow-md" 
                />
              </button>
            </div>

            {/* Primary Action Button (Compress All - Strictly Zero Sparkles) */}
            <button
              type="button"
              onClick={compressAll}
              disabled={isBulkProcessing || files.length === 0 || files.every(f => f.status === "done")}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isBulkProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Shrinking Photos...</span>
                </>
              ) : (
                <>
                  <Minimize2 size={16} />
                  <span>Compress All Photos {files.length > 0 ? `(${files.length})` : ""}</span>
                </>
              )}
            </button>

            {/* Secondary Actions when Ready */}
            {files.some(f => f.status === "done") && (
              <div className="space-y-2 pt-1 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] cursor-pointer"
                >
                  {files.filter(f => f.resultUrl).length === 1 ? (
                    <>
                      <Download size={15} />
                      <span>Download Clean Photo</span>
                    </>
                  ) : (
                    <>
                      <FileArchive size={15} />
                      <span>Download All as ZIP ({files.filter(f => f.resultUrl).length} Files)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      {files.length > 0 && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-3 rounded-2xl bg-[#090b14]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-3">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              {stats.doneCount} of {stats.totalImages} Done
            </span>
            <span className="text-xs font-black font-mono text-emerald-400">
              {stats.savingsPercent > 0 ? `-${stats.savingsPercent}% Space Saved` : "Ready"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {files.some(f => f.status === "done") && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Download size={14} />
                <span>Save</span>
              </button>
            )}
            <button
              type="button"
              onClick={compressAll}
              disabled={isBulkProcessing || files.every(f => f.status === "done")}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isBulkProcessing ? <Loader2 size={14} className="animate-spin" /> : <Minimize2 size={14} />}
              <span>{isBulkProcessing ? "Shrinking..." : "Compress"}</span>
            </button>
          </div>
        </div>
      )}

      {/* BEFORE / AFTER QUALITY COMPARISON MODAL */}
      <AnimatePresence>
        {previewModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setPreviewModalItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-3xl bg-[#090c16] border border-white/15 p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Split className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Quality Inspection (Before vs After)</h3>
                  <span className="text-xs text-zinc-400 font-mono">({previewModalItem.file.name})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModalItem(null)}
                  className="size-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Comparison Split Slider */}
              <div 
                className="relative w-full h-[360px] sm:h-[460px] rounded-2xl bg-[#04060d] border border-white/[0.08] overflow-hidden flex items-center justify-center select-none cursor-ew-resize"
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setModalSplitPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
                }}
                onMouseMove={(e) => {
                  if (e.buttons !== 1) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setModalSplitPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
                }}
              >
                {/* Original (Before) */}
                <img 
                  src={previewModalItem.preview} 
                  alt="Original" 
                  className="max-h-full max-w-full object-contain pointer-events-none select-none" 
                />

                {/* Compressed (After) masked */}
                {previewModalItem.resultUrl && (
                  <div 
                    className="absolute inset-0 overflow-hidden pointer-events-none select-none"
                    style={{ clipPath: `inset(0 ${100 - modalSplitPos}% 0 0)` }}
                  >
                    <img 
                      src={previewModalItem.resultUrl} 
                      alt="Compressed" 
                      className="max-h-full max-w-full object-contain pointer-events-none select-none" 
                    />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-[10px] font-black text-black uppercase tracking-wider shadow-md pointer-events-none">
                  Optimized ({formatSize(previewModalItem.compressedSize || 0)})
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 border border-white/20 text-[10px] font-bold text-zinc-300 uppercase tracking-wider shadow-md pointer-events-none">
                  Original ({formatSize(previewModalItem.originalSize)})
                </div>

                {/* Draggable Divider Line & Grip */}
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
                  style={{ left: `${modalSplitPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xl border border-black/20">
                    <Sliders size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400">
                  Drag the slider left and right to inspect clarity at 100% zoom.
                </span>
                <button
                  type="button"
                  onClick={() => downloadSingleFile(previewModalItem)}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download This Photo</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default BulkImageCompressor;
