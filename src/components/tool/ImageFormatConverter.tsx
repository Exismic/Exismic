"use client";

import { useState, useMemo } from "react";
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
  FileImage,
  Layers,
  FileDigit,
  X,
  FileQuestion,
  ChevronDown,
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
  status: "idle" | "processing" | "done" | "error";
}

const FORMATS = ["JPG", "PNG", "WEBP", "GIF", "BMP"];

export function ImageFormatConverter() {
  const [files, setFiles] = useState<ConvFile[]>([]);
  const [targetFormat, setTargetFormat] = useState("WEBP");
  const [quality, setQuality] = useState(90);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleUpload = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const newEntries: ConvFile[] = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      originalSize: file.size,
      originalFormat: file.name.split('.').pop()?.toUpperCase() || "IMG",
      progress: 0,
      status: "idle"
    }));

    setFiles(prev => [...prev, ...newEntries]);
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
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "processing", progress: 20 } : f));
    
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
          resultFormat: targetFormat
        } : f));
      } else {
        throw new Error(data.error || "Conversion failed");
      }
    } catch (error: any) {
       console.error("Conversion failed:", error);
       setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "error" } : f));
    }
  };

  const convertAll = async () => {
    setIsBulkProcessing(true);
    const idleFiles = files.filter(f => f.status === "idle");
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
      zip.file(`converted_${f.file.name.split('.')[0]}.${targetFormat.toLowerCase()}`, blob);
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
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         
         {/* LEFT: SETTINGS */}
         <div className="lg:col-span-4 space-y-8">
            <div className="p-10 rounded-[3rem] glass-dark border border-white/5 space-y-10">
               <div className="space-y-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                     <Settings2 size={16} className="text-accent-purple" />
                     Conversion Studio
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Master your export profile</p>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">Target Format</label>
                     <div className="grid grid-cols-3 gap-2">
                        {FORMATS.map(fmt => (
                          <button 
                            key={fmt} onClick={() => setTargetFormat(fmt)}
                            className={cn(
                              "py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                              targetFormat === fmt ? "bg-accent-purple border-accent-purple text-white shadow-3xl" : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                            )}
                          >
                             {fmt}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4 pt-2">
                     <div className="flex justify-between items-end px-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-500">Master Quality</span>
                        <span className="text-accent-purple">{quality}%</span>
                     </div>
                     <input 
                       type="range" min="10" max="100" value={quality}
                       onChange={(e) => setQuality(parseInt(e.target.value))}
                       className="w-full accent-accent-purple h-1 bg-white/5 rounded-full"
                     />
                     <p className="text-[9px] text-zinc-600 font-bold uppercase text-center tracking-widest leading-loose">
                        Higher quality = Larger file size.<br/>WebP & JPG only.
                     </p>
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-accent-cyan/5 border border-accent-cyan/10 flex items-center gap-6">
               <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                  <RefreshCw size={24} />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Streamlined Flow</p>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Transcode all to {targetFormat}</p>
               </div>
            </div>
         </div>

         {/* RIGHT: WORKSPACE */}
         <div className="lg:col-span-8 space-y-8">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
              className="relative p-20 rounded-[4rem] glass-dark border-2 border-dashed border-white/5 hover:border-accent-purple/30 transition-all flex flex-col items-center justify-center text-center group min-h-[350px]"
            >
               <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUpload(e.target.files)} />
               <div className="w-24 h-24 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple mb-8 group-hover:scale-110 transition-transform shadow-4xl">
                  <Upload size={40} />
               </div>
               <h4 className="text-xl font-black text-white uppercase tracking-[0.2em]">Universal Ingestion</h4>
               <p className="text-zinc-500 text-xs mt-3 uppercase tracking-widest font-medium">Drop any images to begin transcoding</p>
            </div>

            <AnimatePresence>
               {files.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                   className="space-y-6"
                 >
                    <div className="flex items-center justify-between px-6">
                       <h5 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">{files.length} Assets Loaded</h5>
                       <div className="flex gap-6">
                          <button onClick={convertAll} disabled={isBulkProcessing || files.every(f => f.status === "done")} className="text-[10px] font-black text-accent-cyan hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                             {isBulkProcessing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                             Convert Batch
                          </button>
                          <button onClick={() => setFiles([])} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors">Abort All</button>
                       </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-3">
                       {files.map((item) => (
                         <motion.div 
                           key={item.id}
                           layout
                           className="flex items-center gap-8 p-5 rounded-[2.5rem] glass-dark border border-white/5 group relative overflow-hidden"
                         >
                            <img src={item.preview} className="w-20 h-20 rounded-3xl object-cover border border-white/10 shadow-2xl" alt="Preview" />
                            
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
                            </div>

                            <div className="flex items-center gap-3">
                               {item.status === "done" && (
                                 <button onClick={() => {
                                   const a = document.createElement("a");
                                   a.href = item.resultUrl!;
                                   a.download = `converted_${item.file.name.split('.')[0]}.${targetFormat.toLowerCase()}`;
                                   a.click();
                                 }} className="p-4 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all shadow-xl">
                                    <Download size={18} />
                                 </button>
                               )}
                               <button onClick={() => removeFile(item.id)} className="p-4 rounded-2xl hover:bg-red-500/10 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
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
                         className="py-7 rounded-[2rem] glass-dark border border-white/5 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/5 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                       >
                          <FileArchive size={20} className="text-accent-purple" />
                          Bundle as ZIP
                       </button>
                       <button 
                         onClick={convertAll}
                         disabled={isBulkProcessing || files.every(f => f.status === "done")}
                         className="py-7 rounded-[2rem] premium-gradient text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-4xl hover:scale-[1.03] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                       >
                          <Zap size={20} />
                          Finalize Batch
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
