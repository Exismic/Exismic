"use client";

import { useEffect, useState } from "react";
import { 
  Upload, 
  Download, 
  FileArchive, 
  RefreshCw,
  Trash2, 
  Settings2, 
  Zap,
  Check,
  Loader2,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

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
  error?: string;
  status: "idle" | "processing" | "done" | "error";
}

type TargetFormat = "JPG" | "PNG" | "WEBP" | "GIF";

const FORMATS: TargetFormat[] = ["JPG", "PNG", "WEBP", "GIF"];

export function ImageFormatConverter() {
  const [files, setFiles] = useState<ConvFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("WEBP");
  const [quality, setQuality] = useState(90);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    setFiles(prev => prev.map(file => {
      if (file.status === "idle" || file.status === "processing") return file;
      return {
        ...file,
        compressedSize: undefined,
        progress: 0,
        resultUrl: undefined,
        resultFormat: undefined,
        error: undefined,
        status: "idle",
      };
    }));
  }, [targetFormat, quality]);

  const handleUpload = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const imageFiles = Array.from(newFiles).filter(file => file.type.startsWith("image/"));
    const newEntries: ConvFile[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
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
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const found = prev.find(f => f.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return filtered;
    });
  };

  const convertFile = async (item: ConvFile) => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "processing", progress: 20, error: undefined } : f));
    
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
        setFiles(prev => prev.map(f => f.id === item.id ? { 
          ...f, 
          status: "done", 
          progress: 100, 
          resultUrl: data.result,
          compressedSize: data.size,
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
    const idleFiles = files.filter(f => f.status === "idle" || f.status === "error");
    for (const file of idleFiles) {
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
      zip.file(`converted_${f.file.name.split('.')[0]}.${(f.resultFormat || targetFormat).toLowerCase()}`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toolverse_converted_${targetFormat.toLowerCase()}.zip`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-10">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
         
         {/* LEFT: SETTINGS */}
         <div className="space-y-4 lg:col-span-4">
            <div className="space-y-7 rounded-lg border border-white/10 bg-zinc-950/65 p-5 shadow-xl sm:p-6">
               <div className="space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Settings2 size={16} className="text-accent-purple" />
                     Export settings
                  </h3>
                  <p className="text-xs font-medium text-zinc-500">Choose one format for the entire batch.</p>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">Target Format</label>
                     <div className="grid grid-cols-3 gap-2">
                        {FORMATS.map(fmt => (
                          <button 
                            key={fmt} onClick={() => setTargetFormat(fmt)}
                            className={cn(
                              "min-h-11 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-all",
                              targetFormat === fmt ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100 shadow-sm" : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
                            )}
                          >
                             {fmt}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4 pt-2">
                     <div className="flex justify-between items-end px-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-500">Quality</span>
                        <span className="text-cyan-200">{quality}%</span>
                     </div>
                     <input 
                       type="range" min="10" max="100" value={quality}
                       onChange={(e) => setQuality(parseInt(e.target.value))}
                       className="h-1.5 w-full cursor-pointer rounded-full bg-white/5 accent-cyan-300"
                     />
                     <p className="text-[9px] text-zinc-600 font-bold uppercase text-center tracking-widest leading-loose">
                        Higher quality = Larger file size.<br/>WebP & JPG only.
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
               <div className="flex size-11 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-200">
                  <RefreshCw size={24} />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white">Batch output</p>
                  <p className="text-xs font-medium text-zinc-500">Every image will export as {targetFormat}.</p>
               </div>
            </div>
         </div>

         {/* RIGHT: WORKSPACE */}
         <div className="space-y-5 lg:col-span-8">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
              className="group relative flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-zinc-950/65 px-5 py-10 text-center shadow-xl transition-all hover:border-cyan-300/40 hover:bg-cyan-300/[0.03]"
            >
               <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e.target.files)} />
               <div className="mb-5 flex size-16 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] text-cyan-200 shadow-lg transition-all group-hover:border-cyan-300/30">
                  <Upload size={28} />
               </div>
               <h4 className="text-lg font-bold text-white">Choose images to convert</h4>
               <p className="mt-2 text-sm font-medium text-zinc-500">Drop images here or browse from your device.</p>
            </div>

            <AnimatePresence>
               {files.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                   className="space-y-6"
                 >
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                       <h5 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">{files.length} Assets Loaded</h5>
                       <div className="flex gap-2">
                          <button onClick={convertAll} disabled={isBulkProcessing || files.every(f => f.status === "done")} className="flex min-h-11 items-center gap-2 rounded-md px-3 text-[10px] font-bold uppercase tracking-wider text-cyan-200 transition-colors hover:bg-cyan-300/10 hover:text-white">
                             {isBulkProcessing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                             Convert Batch
                          </button>
                          <button onClick={() => setFiles([])} className="min-h-11 rounded-md px-3 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300">Clear all</button>
                       </div>
                    </div>

                    <div className="custom-scrollbar max-h-[600px] space-y-3 overflow-y-auto pr-1">
                       {files.map((item) => (
                         <motion.div 
                           key={item.id}
                           layout
                           className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-white/10 bg-zinc-950/65 p-3 transition-all hover:border-white/20 sm:gap-4"
                         >
                            <img src={item.preview} className="size-16 shrink-0 rounded-md border border-white/10 object-cover shadow-lg sm:size-20" alt="Preview" />
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-3">
                                  <p className="text-xs font-black text-white truncate uppercase tracking-widest">{item.file.name}</p>
                                  <span className="px-3 py-1 rounded-full bg-white/5 text-[8px] font-black text-zinc-500 uppercase">{item.originalFormat}</span>
                               </div>
                               
                               <div className="flex items-center gap-6 mt-4">
                                  <div className="flex flex-col">
                                     <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Source</span>
                                     <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{formatSize(item.originalSize)}</span>
                                  </div>

                                  {item.status === "done" && (
                                    <>
                                       <ArrowRight size={14} className="text-zinc-800" />
                                       <div className="flex flex-col">
                                          <span className="text-[8px] font-bold text-accent-purple uppercase tracking-widest mb-1">{item.resultFormat} Export</span>
                                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{formatSize(item.compressedSize || 0)}</span>
                                       </div>
                                    </>
                                  )}
                               </div>

                          {item.status === "processing" && (
                                 <div className="w-full h-1.5 bg-white/5 rounded-full mt-5 overflow-hidden">
                                    <motion.div 
                                      className="h-full bg-accent-purple" 
                                      initial={{ width: 0 }} animate={{ width: `${item.progress}%` }} 
                                    />
                                 </div>
                               )}
                               {item.status === "error" && (
                                 <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-[10px] font-bold text-red-300 leading-relaxed">
                                   {item.error || "Conversion failed"}
                                 </div>
                               )}
                            </div>

                            <div className="flex items-center gap-3">
                               {item.status === "done" && (
                                 <button onClick={() => {
                                   const a = document.createElement("a");
                                   a.href = item.resultUrl!;
                                   a.download = `converted_${item.file.name.split('.')[0]}.${(item.resultFormat || targetFormat).toLowerCase()}`;
                                   a.click();
                                 }} className="flex size-11 items-center justify-center rounded-md bg-white text-black shadow-lg transition-all hover:bg-zinc-200" title="Download converted image">
                                    <Download size={18} />
                                 </button>
                               )}
                               <button onClick={() => removeFile(item.id)} className="flex size-11 items-center justify-center rounded-md text-zinc-600 transition-all hover:bg-red-500/10 hover:text-red-400 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100" title="Remove image">
                                  <Trash2 size={18} />
                               </button>
                            </div>

                            {item.status === "done" && (
                               <div className="absolute top-0 right-0 p-2 opacity-20">
                                  <Check size={40} className="text-emerald-500" />
                               </div>
                            )}
                         </motion.div>
                       ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <button 
                         onClick={downloadZip}
                         disabled={!files.some(f => f.status === "done")}
                         className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-5 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:opacity-50"
                       >
                          <FileArchive size={20} className="text-accent-purple" />
                          Download ZIP
                       </button>
                       <button 
                         onClick={convertAll}
                         disabled={isBulkProcessing || files.every(f => f.status === "done")}
                         className="premium-gradient flex min-h-12 items-center justify-center gap-2 rounded-md px-5 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                       >
                          <Zap size={20} />
                          Convert batch
                       </button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
