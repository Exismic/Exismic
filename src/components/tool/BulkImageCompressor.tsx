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
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveFileHistory } from "@/lib/history";

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
      
      if (data.success) {
        setFiles(prev => prev.map(f => f.id === item.id ? { 
          ...f, 
          status: "done", 
          progress: 100, 
          resultUrl: data.result,
          compressedSize: data.size,
          outputFormat: data.format,
          error: undefined,
        } : f));
        
        await saveFileHistory({
          toolType: "image-compressor",
          originalName: item.file.name,
          resultUrl: data.result,
          fileType: "image",
          status: "completed"
        });
      } else {
        throw new Error(data.error || "Compression failed");
      }
    } catch (error) {
       const message = error instanceof Error ? error.message : "Compression failed";
       setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "error", progress: 0, error: message } : f));
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

  const downloadZip = async () => {
    const zip = new JSZip();
    const readyFiles = files.filter(f => f.resultUrl);
    
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
    a.download = "lumora_bulk_optimized.zip";
    a.click();
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
    const savings = original > 0 && compressed > 0 ? Math.round(((original - compressed) / original) * 100) : 0;
    
    return {
      totalImages: files.length,
      doneCount,
      originalSize: formatSize(original),
      compressedSize: formatSize(compressed),
      savings
    };
  }, [files]);

  const getQualityLabel = (q: number) => {
    if (q < 30) return { label: "Low", color: "text-red-400" };
    if (q < 60) return { label: "Balanced", color: "text-amber-400" };
    if (q < 85) return { label: "High", color: "text-emerald-400" };
    return { label: "Ultra", color: "text-accent-cyan" };
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:ml-auto sm:w-fit">
        <div className="min-w-32 bg-zinc-950/90 px-5 py-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Images queued</p>
          <p className="mt-1 text-xl font-bold text-white">{stats.totalImages}</p>
        </div>
        <div className="min-w-32 bg-zinc-950/90 px-5 py-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">Space saved</p>
          <p className="mt-1 text-xl font-bold text-white">{stats.savings}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        
        {/* LEFT PANEL: OPTIMIZATION ENGINE */}
        <div className="space-y-4 xl:col-span-4">
           <div className="group relative space-y-7 rounded-lg border border-white/10 bg-zinc-950/65 p-5 shadow-xl sm:p-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <Settings2 size={16} className="text-accent-purple" /> Optimization Engine
                 </h3>
                 <button title="Reset compression settings" onClick={() => { setQuality(80); setOutputFormat("original"); setMaxWidth(""); setMaxHeight(""); setRemoveMetadata(true); }} className="flex size-11 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-white">
                    <RotateCcw size={16} />
                 </button>
              </div>

              {/* QUALITY SLIDER */}
              <div className="space-y-5">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Compression Quality</label>
                       <div className={cn("text-xs font-black uppercase", getQualityLabel(quality).color)}>
                          {getQualityLabel(quality).label} Mode
                       </div>
                    </div>
                    <span className="text-2xl font-black text-white font-mono">{quality}%</span>
                 </div>
                 <input 
                    type="range" min="5" max="100" value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-accent-purple h-1.5 bg-zinc-800 rounded-full cursor-pointer appearance-none"
                 />
                 <div className="flex justify-between text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                    <span>Smallest Size</span>
                    <span>Best Quality</span>
                 </div>
              </div>

              {/* CONTROLS GRID */}
              <div className="grid grid-cols-1 gap-4">
                 <div className="flex min-h-16 items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-4 transition-all">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-white uppercase flex items-center gap-2">WebP Transcoding <Info size={10} className="text-zinc-600" /></p>
                       <p className="text-[8px] text-zinc-500 font-bold uppercase">Modern next-gen format</p>
                    </div>
                    <button 
                       onClick={() => setOutputFormat(format === "webp" ? "original" : "webp")}
                       className={cn(
                          "relative flex h-7 w-12 items-center rounded-full p-1 transition-all",
                          format === "webp" ? "bg-accent-purple" : "bg-zinc-800"
                       )}
                       aria-pressed={format === "webp"}
                    >
                       <motion.div 
                          animate={{ x: format === "webp" ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-lg" 
                       />
                    </button>
                 </div>

                 <div className="space-y-4 rounded-md border border-white/10 bg-white/[0.03] p-4 transition-all">
                    <p className="text-[10px] font-black text-white uppercase">Dimensions & Resizing</p>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-zinc-600 uppercase">Max Width</label>
                          <input 
                            type="number" value={maxWidth} onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : "")}
                            placeholder="Auto"
                            min={1}
                            className="min-h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none transition-all focus:border-cyan-300/50"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-zinc-600 uppercase">Max Height</label>
                          <input 
                            type="number" value={maxHeight} onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : "")}
                            placeholder="Auto"
                            min={1}
                            className="min-h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none transition-all focus:border-cyan-300/50"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 rounded-md border border-white/10 bg-white/[0.03] p-4 transition-all">
                    <p className="text-[10px] font-black text-white uppercase">Output Format</p>
                    <div className="flex flex-wrap gap-2">
                       {["original", "jpg", "png", "webp"].map((f) => (
                          <button 
                             key={f}
                             onClick={() => setOutputFormat(f as OutputFormat)}
                             className={cn(
                                "min-h-11 rounded-md border px-4 text-[10px] font-bold uppercase tracking-wider transition-all",
                                format === f ? "bg-accent-purple border-accent-purple text-white shadow-lg shadow-accent-purple/20" : "bg-black/20 border-white/5 text-zinc-500 hover:text-white"
                             )}
                          >
                             {f}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex min-h-16 items-center justify-between rounded-md border border-white/10 bg-white/[0.03] p-4 transition-all">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-white uppercase">Strip Metadata</p>
                       <p className="text-[8px] text-zinc-500 font-bold uppercase italic">Remove EXIF, GPS, and tags</p>
                    </div>
                    <button 
                       onClick={() => setRemoveMetadata(!removeMetadata)}
                       className={cn(
                          "relative flex h-7 w-12 items-center rounded-full p-1 transition-all",
                          removeMetadata ? "bg-accent-purple" : "bg-zinc-800"
                       )}
                    >
                       <motion.div 
                          animate={{ x: removeMetadata ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-lg" 
                       />
                    </button>
                 </div>
              </div>
           </div>

           <div className="group flex items-center gap-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] p-4 transition-all">
              <div className="flex size-11 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-200">
                 <Database size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-white uppercase tracking-widest">Total Optimization</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-cyan-200">-{stats.savings}%</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase italic">Space Saved</span>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT PANEL: BATCH AREA */}
        <div className="space-y-5 xl:col-span-8">
           {/* DROPZONE */}
           <div 
             onClick={() => fileInputRef.current?.click()}
             onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-accent-purple/30', 'bg-accent-purple/5'); }}
             onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-accent-purple/30', 'bg-accent-purple/5'); }}
             onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-accent-purple/30', 'bg-accent-purple/5');
                handleUpload(e.dataTransfer.files);
             }}
             className={cn(
               "group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-zinc-950/65 px-5 text-center shadow-xl transition-all",
               files.length > 0 ? "min-h-[128px] border-white/15 py-5" : "min-h-[320px] border-white/15 py-10 hover:border-cyan-300/40 hover:bg-cyan-300/[0.03]"
             )}
           >
              <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUpload(e.target.files)} />
              
              <div className={cn(
                 "flex flex-col items-center gap-5",
                 files.length > 0 && "sm:flex-row sm:text-left"
              )}>
                 <div className={cn(
                   "flex items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] text-cyan-200 shadow-lg transition-all duration-300 group-hover:border-cyan-300/30",
                   files.length > 0 ? "size-14" : "size-16"
                 )}>
                    <Upload size={files.length > 0 ? 24 : 40} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">
                       {files.length > 0 ? "Add more images" : "Choose images to compress"}
                    </h4>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-loose">
                       {files.length > 0 ? "Drop more files here or browse" : "Drop images here or browse from your device"}
                    </p>
                 </div>
              </div>
           </div>

           {/* FILE GRID */}
           <AnimatePresence>
              {files.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="space-y-6"
                >
                   <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                      <div className="flex items-center gap-4">
                         <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Queue</h3>
                         <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-zinc-500 uppercase tracking-widest">{files.length} Images</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => setFiles([])} className="flex min-h-11 items-center gap-2 rounded-md px-3 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300">
                            <Trash2 size={14} /> Clear All
                         </button>
                      </div>
                   </div>

                   <div className="custom-scrollbar grid max-h-[600px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                      {files.map((item) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          className="group relative flex gap-3 overflow-hidden rounded-lg border border-white/10 bg-zinc-950/65 p-3 transition-all hover:border-white/20"
                        >
                           {/* PROGRESS OVERLAY */}
                           {item.status === "processing" && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4">
                                 <Loader2 size={24} className="text-accent-purple animate-spin mb-2" />
                                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden max-w-[80%]">
                                    <motion.div 
                                      className="h-full bg-accent-purple"
                                      initial={{ width: 0 }} animate={{ width: `${item.progress}%` }}
                                    />
                                 </div>
                              </div>
                           )}

                           <div className="relative w-20 h-20 shrink-0">
                              <img src={item.preview} className="h-full w-full rounded-md border border-white/10 object-cover" alt="Preview" />
                              {item.status === "done" && (
                                 <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl border-2 border-zinc-900">
                                    <Check size={12} strokeWidth={4} />
                                 </div>
                              )}
                           </div>

                           <div className="flex-1 min-w-0 space-y-2">
                              <p className="text-[10px] font-black text-white truncate uppercase tracking-widest pr-6">{item.file.name}</p>
                              <div className="space-y-1">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black text-zinc-500 uppercase">Original</span>
                                    <span className="text-[10px] font-bold text-zinc-400">{formatSize(item.originalSize)}</span>
                                 </div>
                                 {item.compressedSize && (
                                   <div className="flex items-center justify-between animate-in slide-in-from-left-2">
                                      <span className="text-[8px] font-black text-accent-purple uppercase">Reduced</span>
                                      <div className="flex items-center gap-2">
                                         <span className="text-[10px] font-black text-white">{formatSize(item.compressedSize)}</span>
                                         <span className="text-[10px] font-black text-emerald-400">-{Math.round((1 - item.compressedSize/item.originalSize) * 100)}%</span>
                                      </div>
                                   </div>
                                 )}
                                 {item.status === "error" && (
                                   <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/15 px-3 py-2 text-[9px] font-bold text-red-300 leading-relaxed">
                                      <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                      <span className="line-clamp-2">{item.error || "Compression failed"}</span>
                                   </div>
                                 )}
                              </div>
                           </div>

                           <button 
                             onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                             className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-md bg-black/50 text-zinc-500 transition-all hover:bg-red-400/10 hover:text-red-300 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                             title="Remove image"
                           >
                              <X size={12} />
                           </button>
                        </motion.div>
                      ))}
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <AnimatePresence>
         {files.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
             className="sticky bottom-3 z-40 mx-auto w-full max-w-4xl"
           >
              <div className="flex flex-col gap-4 rounded-lg border border-white/15 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl md:flex-row md:items-center">
                 <div className="grid flex-1 grid-cols-3 gap-2 sm:gap-3">
                    <div className="text-left space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-wider text-zinc-500 sm:text-[10px] sm:tracking-widest">Original Total</p>
                       <p className="text-base font-black text-white sm:text-xl">{stats.originalSize}</p>
                    </div>
                    <div className="text-left space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-wider text-accent-cyan sm:text-[10px] sm:tracking-widest">Optimized Total</p>
                       <p className="text-base font-black text-white sm:text-xl">{stats.doneCount > 0 ? stats.compressedSize : "---"}</p>
                    </div>
                    <div className="text-left space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-wider text-emerald-500 sm:text-[10px] sm:tracking-widest">Net Savings</p>
                       <p className="text-base font-black text-emerald-500 sm:text-xl">{stats.savings}%</p>
                    </div>
                 </div>

                 <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    {files.some(f => f.status === "done") && (
                       <button 
                         onClick={downloadZip}
                         className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-5 text-xs font-bold text-white transition-all hover:bg-white/10"
                       >
                          <FileArchive size={20} /> Pack .ZIP
                       </button>
                    )}
                    <button 
                      onClick={compressAll}
                      disabled={isBulkProcessing || files.every(f => f.status === "done")}
                      className="premium-gradient flex min-h-12 items-center justify-center gap-2 rounded-md px-6 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                    >
                       {isBulkProcessing ? (
                          <>
                             <Loader2 size={20} className="animate-spin" /> Optimizing...
                          </>
                       ) : (
                          <>
                             <Zap size={20} /> Compress All
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
