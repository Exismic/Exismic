"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Upload, 
  FileArchive, 
  Trash2, 
  Settings2, 
  Zap,
  Check,
  Loader2,
  X,
  RotateCcw,
  Info,
  Database,
  AlertCircle,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveFileHistory } from "@/lib/history";
import { detectCompressorCapabilities, processCompressLocally } from "@/lib/client-compressor";

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

export function BulkImageCompressor() {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [maxHeight, setMaxHeight] = useState<number | "">("");
  const [format, setFormat] = useState<OutputFormat>("original");
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const setOutputFormat = (nextFormat: OutputFormat) => {
    setFormat(nextFormat);
  };

  const handleUpload = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles = Array.from(newFiles).filter(file => file.type.startsWith("image/"));
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
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const found = prev.find(f => f.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const compressFile = async (item: CompressedFile) => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "processing", progress: 20, error: undefined } : f));
    
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
        console.log(`[Compressor Tool] Device & image capability verified. Compressing "${item.file.name}" locally...`);
        const localData = await processCompressLocally(
          item.file,
          compressorOpts,
          10000
        );

        if (localData?.resultUrl) {
          // If local canvas compression produced 0 reduction or increased file size,
          // fall back to Sharp cloud backend for advanced palette quantization / mozjpeg encoding
          if (localData.size >= item.file.size && quality < 98 && !maxWidth && !maxHeight && (format === "original" || format === item.file.type.split("/")[1])) {
            console.log(`[Compressor Tool] Local canvas gave zero space reduction (${localData.size} >= ${item.file.size}). Triggering Sharp backend fallback...`);
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

    // 2. Server API fallback if device is weak, image is large, or client execution failed/timed out
    if (!compressionData) {
      try {
        console.log(`[Compressor Tool] Compressing "${item.file.name}" via cloud API fallback...`);
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
        console.error("[Compressor Tool] Cloud API fallback error:", serverErr);
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
        status: "completed"
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
    if (q < 30) return { label: "Low", color: "text-red-400" };
    if (q < 60) return { label: "Balanced", color: "text-amber-400" };
    if (q < 85) return { label: "High", color: "text-emerald-400" };
    return { label: "Ultra", color: "text-accent-cyan" };
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER STATS BANNER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white uppercase italic py-1 leading-normal">
              Bulk Image <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent pb-1 inline-block">Compressor</span>
            </h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Instant local client memory optimization & next-gen format conversion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-left min-w-[120px]">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Images Queued</p>
            <p className="mt-0.5 text-lg font-black text-white">{stats.totalImages}</p>
          </div>
          <div className={cn(
            "rounded-xl border px-4 py-2.5 text-left min-w-[120px]",
            stats.isIncreased 
              ? "border-amber-500/20 bg-amber-500/10" 
              : "border-emerald-500/20 bg-emerald-500/10"
          )}>
            <p className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              stats.isIncreased ? "text-amber-400" : "text-emerald-400"
            )}>
              {stats.isIncreased ? "Size Growth" : "Total Savings"}
            </p>
            <p className={cn(
              "mt-0.5 text-lg font-black",
              stats.isIncreased ? "text-amber-300" : "text-emerald-300"
            )}>
              {stats.isIncreased ? `+${stats.savingsPercent}%` : `-${stats.savingsPercent}%`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        
        {/* LEFT PANEL: OPTIMIZATION ENGINE */}
        <div className="space-y-5 xl:col-span-4">
           <div className="relative space-y-6 rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
                    <Settings2 size={16} className="text-purple-400" /> Optimization Engine
                 </h3>
                 <button 
                   title="Reset compression settings" 
                   onClick={() => { setQuality(80); setOutputFormat("original"); setMaxWidth(""); setMaxHeight(""); setRemoveMetadata(true); }} 
                   className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
                 >
                    <RotateCcw size={14} />
                 </button>
              </div>

              {/* QUALITY SLIDER & PRESETS */}
              <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Target Quality</label>
                       <div className={cn("text-xs font-black uppercase tracking-wider", getQualityLabel(quality).color)}>
                          {getQualityLabel(quality).label} Quality
                       </div>
                    </div>
                    <span className="text-2xl font-black font-mono text-white tracking-tight">{quality}%</span>
                 </div>

                 <input 
                    type="range" min="5" max="100" value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-full cursor-pointer appearance-none"
                 />

                 {/* Preset Quick Buttons */}
                 <div className="flex items-center justify-between gap-1.5 pt-1">
                    {[
                      { label: "Max Compress (50%)", val: 50 },
                      { label: "Balanced (80%)", val: 80 },
                      { label: "Ultra (95%)", val: 95 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => setQuality(p.val)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all border",
                          quality === p.val
                            ? "bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                            : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                 </div>
              </div>

              {/* CONTROLS GRID */}
              <div className="grid grid-cols-1 gap-4">
                 
                 {/* WebP Transcoding */}
                 <div className="flex min-h-16 items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-purple-400/30">
                    <div className="space-y-0.5">
                       <p className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                         WebP Transcoding <Info size={11} className="text-zinc-500" />
                       </p>
                       <p className="text-[9px] text-zinc-400 font-medium">Next-gen 40% size reduction</p>
                    </div>
                    <button 
                       onClick={() => setOutputFormat(format === "webp" ? "original" : "webp")}
                       className={cn(
                          "relative flex h-7 w-12 items-center rounded-full p-1 transition-all cursor-pointer",
                          format === "webp" ? "bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "bg-zinc-800"
                       )}
                       aria-pressed={format === "webp"}
                    >
                       <motion.div 
                          animate={{ x: format === "webp" ? 20 : 0 }}
                          className="size-5 bg-white rounded-full shadow-lg" 
                       />
                    </button>
                 </div>

                 {/* Dimensions Resizing */}
                 <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-purple-400/30">
                    <p className="text-[11px] font-black text-white uppercase tracking-wider">Dimension Resizing</p>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Max Width</label>
                          <input 
                            type="number" value={maxWidth} onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : "")}
                            placeholder="Auto (px)"
                            min={1}
                            className="min-h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-xs font-bold text-white outline-none transition-all focus:border-cyan-400/50"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Max Height</label>
                          <input 
                            type="number" value={maxHeight} onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : "")}
                            placeholder="Auto (px)"
                            min={1}
                            className="min-h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-xs font-bold text-white outline-none transition-all focus:border-cyan-400/50"
                          />
                       </div>
                    </div>
                 </div>

                 {/* Output Format Options */}
                 <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-purple-400/30">
                    <p className="text-[11px] font-black text-white uppercase tracking-wider">Output Format</p>
                    <div className="grid grid-cols-4 gap-2">
                       {["original", "jpg", "png", "webp"].map((f) => (
                          <button 
                             key={f}
                             onClick={() => setOutputFormat(f as OutputFormat)}
                             className={cn(
                                "min-h-10 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                format === f 
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                             )}
                          >
                             {f}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Strip Metadata Toggle */}
                 <div className="flex min-h-16 items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4 transition-all hover:border-purple-400/30">
                    <div className="space-y-0.5">
                       <p className="text-[11px] font-black text-white uppercase tracking-wider">Strip EXIF Metadata</p>
                       <p className="text-[9px] text-zinc-400 font-medium">Removes camera tags, location & timestamps</p>
                    </div>
                    <button 
                       onClick={() => setRemoveMetadata(!removeMetadata)}
                       className={cn(
                          "relative flex h-7 w-12 items-center rounded-full p-1 transition-all cursor-pointer",
                          removeMetadata ? "bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "bg-zinc-800"
                       )}
                    >
                       <motion.div 
                          animate={{ x: removeMetadata ? 20 : 0 }}
                          className="size-5 bg-white rounded-full shadow-lg" 
                       />
                    </button>
                 </div>
              </div>
           </div>

           {/* Total Optimization Card */}
           <div className="flex items-center gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-300">
                 <Database size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Optimized Output Ratio</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {stats.isIncreased ? `+${stats.savingsPercent}%` : `-${stats.savingsPercent}%`}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">
                      {stats.isIncreased ? "Size Increase (Format Lossless)" : "Space Reduction Ratio"}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT PANEL: BATCH QUEUE */}
        <div className="space-y-5 xl:col-span-8">
           
           {/* DROPZONE */}
           <div 
             onClick={() => fileInputRef.current?.click()}
             onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-cyan-400/50', 'bg-cyan-400/5'); }}
             onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-cyan-400/50', 'bg-cyan-400/5'); }}
             onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-cyan-400/50', 'bg-cyan-400/5');
                handleUpload(e.dataTransfer.files);
             }}
             className={cn(
               "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-zinc-950/80 px-6 text-center shadow-2xl backdrop-blur-xl transition-all duration-300",
               files.length > 0 ? "min-h-[140px] border-white/15 py-6" : "min-h-[340px] border-white/15 py-12 hover:border-cyan-400/50 hover:bg-cyan-400/[0.03]"
             )}
           >
              <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUpload(e.target.files)} />
              
              <div className={cn(
                 "flex flex-col items-center gap-4",
                 files.length > 0 && "sm:flex-row sm:text-left"
              )}>
                 <div className={cn(
                   "flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-transform duration-300 group-hover:scale-110",
                   files.length > 0 ? "size-14" : "size-20"
                 )}>
                    <Upload size={files.length > 0 ? 26 : 38} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xl font-black text-white tracking-tight">
                       {files.length > 0 ? "Add More Photos" : "Upload Image Batch"}
                    </h4>
                    <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                       {files.length > 0 ? "Drag & drop additional files or click to browse" : "Drag & drop photos or click to browse. Supports PNG, JPG, WebP, AVIF."}
                    </p>
                 </div>
              </div>
           </div>

           {/* FILE QUEUE LIST */}
           <AnimatePresence>
              {files.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="space-y-4"
                >
                   <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                         <h3 className="text-xs font-black text-white uppercase tracking-widest">Batch Queue</h3>
                         <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                           {files.length} {files.length === 1 ? "File" : "Files"}
                         </span>
                      </div>
                      <button 
                        onClick={() => setFiles([])} 
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                         <Trash2 size={13} /> Clear Queue
                      </button>
                   </div>

                   <div className="custom-scrollbar grid max-h-[580px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                      {files.map((item) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          className="group relative flex gap-3.5 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 shadow-xl backdrop-blur-xl transition-all hover:border-purple-400/40"
                        >
                           {/* PROGRESS OVERLAY */}
                           {item.status === "processing" && (
                              <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
                                 <Loader2 size={24} className="text-cyan-400 animate-spin mb-2" />
                                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[80%]">
                                    <motion.div 
                                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                                      initial={{ width: 0 }} animate={{ width: `${item.progress}%` }}
                                    />
                                 </div>
                              </div>
                           )}

                           {/* IMAGE PREVIEW THUMBNAIL */}
                           <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
                              <img src={item.preview} className="h-full w-full object-cover" alt="Preview" />
                              {item.status === "done" && (
                                 <div className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                                    <Check size={11} strokeWidth={3.5} />
                                 </div>
                              )}
                           </div>

                           {/* ITEM METADATA */}
                           <div className="flex-1 min-w-0 space-y-1.5">
                              <p className="text-[11px] font-black text-white truncate uppercase tracking-wider pr-6">{item.file.name}</p>
                              
                              <div className="space-y-1">
                                 <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-zinc-500">Original:</span>
                                    <span className="font-bold text-zinc-300">{formatSize(item.originalSize)}</span>
                                 </div>

                                 {item.compressedSize && (
                                   <div className="flex items-center justify-between text-[10px] animate-in slide-in-from-left-2">
                                      <span className="font-black text-purple-400 uppercase">Optimized:</span>
                                      <div className="flex items-center gap-1.5">
                                         <span className="font-black text-white">{formatSize(item.compressedSize)}</span>
                                         {(() => {
                                            const rawSaved = Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100);
                                            const isItemGrowth = rawSaved < 0;
                                            const absSaved = Math.abs(rawSaved);
                                            return (
                                               <span className={cn(
                                                  "rounded-md border px-1.5 py-0.5 text-[9px] font-black",
                                                  isItemGrowth 
                                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                               )}>
                                                  {isItemGrowth ? `+${absSaved}%` : `-${absSaved}%`}
                                               </span>
                                            );
                                         })()}
                                      </div>
                                   </div>
                                 )}

                                 {item.status === "error" && (
                                   <div className="flex items-start gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-[9px] font-bold text-red-300 leading-tight">
                                      <AlertCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
                                      <span className="line-clamp-2">{item.error || "Compression failed"}</span>
                                   </div>
                                 )}
                              </div>
                           </div>

                           {/* ACTION BUTTONS */}
                           <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                              {item.status === "done" && item.resultUrl && (
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); downloadSingleFile(item); }}
                                   className="flex size-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 transition-all hover:bg-emerald-500/20 cursor-pointer"
                                   title="Download optimized image"
                                 >
                                    <Download size={13} />
                                 </button>
                              )}
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                                className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-zinc-400 transition-all hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                                title="Remove image"
                              >
                                 <X size={13} />
                              </button>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <AnimatePresence>
         {files.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
             className="sticky bottom-4 z-40 mx-auto w-full max-w-4xl"
           >
              <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
                 
                 <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1">
                    <div className="text-left space-y-0.5">
                       <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Original Total</p>
                       <p className="text-base font-black text-white sm:text-lg">{stats.originalSize}</p>
                    </div>
                    <div className="text-left space-y-0.5">
                       <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Optimized Total</p>
                       <p className="text-base font-black text-white sm:text-lg">{stats.doneCount > 0 ? stats.compressedSize : "---"}</p>
                    </div>
                    <div className="text-left space-y-0.5">
                       <p className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          stats.isIncreased ? "text-amber-400" : "text-emerald-400"
                       )}>
                          {stats.isIncreased ? "Size Growth" : "Net Savings"}
                       </p>
                       <p className={cn(
                          "text-base font-black sm:text-lg",
                          stats.isIncreased ? "text-amber-300" : "text-emerald-400"
                       )}>
                          {stats.isIncreased ? `+${stats.savingsPercent}%` : `-${stats.savingsPercent}%`}
                       </p>
                    </div>
                 </div>

                 <div className="flex shrink-0 items-center gap-3">
                    {files.some(f => f.status === "done") && (
                       <button 
                         onClick={handleDownloadAll}
                         className="flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 cursor-pointer"
                       >
                          {files.filter(f => f.resultUrl).length === 1 ? (
                            <>
                              <Download size={18} /> Download Image
                            </>
                          ) : (
                            <>
                              <FileArchive size={18} /> Pack .ZIP ({files.filter(f => f.resultUrl).length})
                            </>
                          )}
                       </button>
                    )}
                    <button 
                      onClick={compressAll}
                      disabled={isBulkProcessing || files.every(f => f.status === "done")}
                      className={cn(
                        "flex min-h-12 items-center justify-center gap-2 rounded-xl px-7 text-xs font-black uppercase tracking-wider text-white shadow-2xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                        "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 shadow-purple-500/20 hover:brightness-110 active:scale-[0.98]"
                      )}
                    >
                       {isBulkProcessing ? (
                          <>
                             <Loader2 size={18} className="animate-spin" /> Optimizing...
                          </>
                       ) : (
                          <>
                             <Zap size={18} /> Compress All
                          </>
                       )}
                    </button>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}

