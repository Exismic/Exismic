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
  Layers,
  X,
  RotateCcw,
  Sparkles,
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
    <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-10 rounded-[3rem] glass-dark border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-purple/5 blur-[100px] -z-10" />
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="p-4 rounded-3xl bg-accent-purple/10 text-accent-purple shadow-inner">
                <Layers size={32} />
             </div>
             <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Bulk Compressor</h2>
                <p className="text-accent-purple text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                   <Sparkles size={12} /> Powered by Neural Compression Engine
                </p>
             </div>
          </div>
          <p className="text-zinc-500 font-medium text-sm max-w-md">Lossless and lossy batch image optimization. Reduce file size by up to 90% without quality loss.</p>
        </div>

        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-[2rem] border border-white/5">
           <div className="px-6 py-3 rounded-[1.5rem] bg-white/5 border border-white/5 text-center">
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Queue</p>
              <p className="text-xl font-black text-white">{stats.totalImages}</p>
           </div>
           <div className="px-6 py-3 rounded-[1.5rem] bg-accent-purple/10 border border-accent-purple/10 text-center">
              <p className="text-[8px] font-black text-accent-purple uppercase tracking-widest mb-1">Savings</p>
              <p className="text-xl font-black text-white">{stats.savings}%</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: OPTIMIZATION ENGINE */}
        <div className="xl:col-span-4 space-y-8">
           <div className="p-10 rounded-[3rem] glass-dark border border-white/10 space-y-10 shadow-4xl relative group">
              <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <Settings2 size={16} className="text-accent-purple" /> Optimization Engine
                 </h3>
                 <button onClick={() => { setQuality(80); setOutputFormat("original"); setMaxWidth(""); setMaxHeight(""); setRemoveMetadata(true); }} className="text-zinc-600 hover:text-white transition-colors">
                    <RotateCcw size={16} />
                 </button>
              </div>

              {/* QUALITY SLIDER */}
              <div className="space-y-6">
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
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group-hover:border-white/10 transition-all">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-white uppercase flex items-center gap-2">WebP Transcoding <Info size={10} className="text-zinc-600" /></p>
                       <p className="text-[8px] text-zinc-500 font-bold uppercase">Modern next-gen format</p>
                    </div>
                    <button 
                       onClick={() => setOutputFormat(format === "webp" ? "original" : "webp")}
                       className={cn(
                          "w-12 h-6 rounded-full transition-all relative p-1 flex items-center",
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

                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 group-hover:border-white/10 transition-all">
                    <p className="text-[10px] font-black text-white uppercase">Dimensions & Resizing</p>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-zinc-600 uppercase">Max Width</label>
                          <input 
                            type="number" value={maxWidth} onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : "")}
                            placeholder="Auto"
                            min={1}
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-accent-purple/50 outline-none transition-all"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black text-zinc-600 uppercase">Max Height</label>
                          <input 
                            type="number" value={maxHeight} onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : "")}
                            placeholder="Auto"
                            min={1}
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-accent-purple/50 outline-none transition-all"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 group-hover:border-white/10 transition-all">
                    <p className="text-[10px] font-black text-white uppercase">Output Format</p>
                    <div className="flex flex-wrap gap-2">
                       {["original", "jpg", "png", "webp"].map((f) => (
                          <button 
                             key={f}
                             onClick={() => setOutputFormat(f as OutputFormat)}
                             className={cn(
                                "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                                format === f ? "bg-accent-purple border-accent-purple text-white shadow-lg shadow-accent-purple/20" : "bg-black/20 border-white/5 text-zinc-500 hover:text-white"
                             )}
                          >
                             {f}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group-hover:border-white/10 transition-all">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-white uppercase">Strip Metadata</p>
                       <p className="text-[8px] text-zinc-500 font-bold uppercase italic">Remove EXIF, GPS, and tags</p>
                    </div>
                    <button 
                       onClick={() => setRemoveMetadata(!removeMetadata)}
                       className={cn(
                          "w-12 h-6 rounded-full transition-all relative p-1 flex items-center",
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

           <div className="p-8 rounded-[2.5rem] bg-accent-cyan/5 border border-accent-cyan/10 flex items-center gap-6 group hover:bg-accent-cyan/10 transition-all cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
                 <Database size={24} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-white uppercase tracking-widest">Total Optimization</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-accent-cyan">-{stats.savings}%</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase italic">Space Saved</span>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT PANEL: BATCH AREA */}
        <div className="xl:col-span-8 space-y-8">
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
               "relative rounded-[3.5rem] glass-dark border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center py-16 px-10 text-center shadow-2xl",
               files.length > 0 ? "border-white/10 min-h-[150px] py-10" : "border-white/5 min-h-[400px]"
             )}
           >
              <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*" onChange={(e) => handleUpload(e.target.files)} />
              
              <div className={cn(
                 "flex flex-col items-center gap-6",
                 files.length > 0 && "flex-row text-left"
              )}>
                 <div className={cn(
                   "rounded-[2.5rem] bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-accent-purple group-hover:scale-110 transition-all duration-700 shadow-3xl",
                   files.length > 0 ? "w-16 h-16" : "w-24 h-24"
                 )}>
                    <Upload size={files.length > 0 ? 24 : 40} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">
                       {files.length > 0 ? "Add more to batch" : "Load Compression Batch"}
                    </h4>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-loose">
                       {files.length > 0 ? "Drag more files or click to browse" : "Drag folder or images here or click to browse local files"}
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
                   <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-4">
                         <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Queue</h3>
                         <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-zinc-500 uppercase tracking-widest">{files.length} Images</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <button onClick={() => setFiles([])} className="text-[10px] font-black text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                            <Trash2 size={14} /> Clear All
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                      {files.map((item) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          className="relative p-4 rounded-3xl glass-dark border border-white/5 group hover:border-white/20 transition-all flex gap-4 overflow-hidden"
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
                              <img src={item.preview} className="w-full h-full rounded-2xl object-cover border border-white/10" alt="Preview" />
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
                             className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
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
             className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50"
           >
              <div className="p-6 rounded-[2.5rem] glass-dark border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-8">
                 <div className="flex-1 flex items-center gap-8 px-4">
                    <div className="text-left space-y-1">
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Original Total</p>
                       <p className="text-xl font-black text-white">{stats.originalSize}</p>
                    </div>
                    <div className="w-px h-10 bg-zinc-800" />
                    <div className="text-left space-y-1">
                       <p className="text-[10px] font-black text-accent-cyan uppercase tracking-widest">Optimized Total</p>
                       <p className="text-xl font-black text-white">{stats.doneCount > 0 ? stats.compressedSize : "---"}</p>
                    </div>
                    <div className="w-px h-10 bg-zinc-800" />
                    <div className="text-left space-y-1">
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Net Savings</p>
                       <p className="text-xl font-black text-emerald-500">{stats.savings}%</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 shrink-0">
                    {files.some(f => f.status === "done") && (
                       <button 
                         onClick={downloadZip}
                         className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                       >
                          <FileArchive size={20} /> Pack .ZIP
                       </button>
                    )}
                    <button 
                      onClick={compressAll}
                      disabled={isBulkProcessing || files.every(f => f.status === "done")}
                      className="flex items-center gap-4 px-12 py-5 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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

      <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-accent-cyan/[0.03] blur-[150px] -z-10 rounded-full" />
      <div className="fixed bottom-0 left-0 w-[50%] h-[50%] bg-accent-purple/[0.03] blur-[150px] -z-10 rounded-full" />
    </div>
  );
}
