"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Download, 
  X, 
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity,
  Minimize2
} from "lucide-react";
import { PdfThumbnail } from "./pdf/PdfThumbnail";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { readDownloadResponse } from "@/lib/pdf-client";

const COMPRESSOR_STEPS = [
  { title: "Upload PDF", desc: "Select the large document you want to optimize for web or email." },
  { title: "Select Mode", desc: "Choose how aggressively document metadata should be cleaned." },
  { title: "Repack Streams", desc: "Lumora rebuilds internal PDF objects without rasterizing your pages." },
  { title: "Download", desc: "Download the smaller file, or the original when it is already optimized." }
];

export default function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; fileName: string; oldSize: number; newSize: number; optimized: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("level", level);

    try {
      const response = await fetch("/api/tools/pdf/compressor", {
        method: "POST",
        body: formData,
      });

      const artifact = await readDownloadResponse(
        response,
        "optimized-document.pdf",
      );
      const oldSize = Number(artifact.headers.get("X-Lumora-Original-Size")) || file.size;
      const newSize = Number(artifact.headers.get("X-Lumora-Output-Size")) || artifact.size;
      setResult({
        url: artifact.url,
        fileName: artifact.fileName,
        oldSize,
        newSize,
        optimized: artifact.headers.get("X-Lumora-Optimized") === "true",
      });
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to compress PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const savedPercent = result
    ? Math.max(0, Math.round(((result.oldSize - result.newSize) / result.oldSize) * 100))
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        {/* Main Area */}
        <div className="xl:col-span-8 space-y-10">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                {...getRootProps()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "relative h-[500px] rounded-[4rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 group overflow-hidden",
                  isDragActive ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]" : "hover:bg-white/[0.02] hover:border-white/10"
                )}
              >
                <input {...getInputProps()} />
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <FileArchive className={cn("w-10 h-10 transition-colors duration-500", isDragActive ? "text-emerald-500" : "text-zinc-600 group-hover:text-white")} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">PDF Compressor <span className="text-emerald-500">Studio</span></h3>
                    <p className="text-zinc-500 font-medium text-lg uppercase tracking-widest text-[10px]">Optimize your document weight instantly</p>
                  </div>
                  <div className="px-10 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl group-hover:scale-105 transition-transform">
                    Select Document
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="interface"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl relative min-h-[600px] overflow-hidden">
                   {result ? (
                      <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-12 py-12">
                         <div className="flex flex-col md:flex-row items-center gap-12 justify-center w-full">
                            <div className="space-y-3 group">
                               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Original Weight</p>
                               <div className="px-8 py-5 rounded-2xl bg-white/5 border border-white/5 text-2xl font-black text-zinc-500 transition-all group-hover:bg-white/10">
                                  {formatSize(result.oldSize)}
                               </div>
                            </div>
                            
                            <div className="relative">
                               <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-32 h-32 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.2)]"
                               >
                                 <CheckCircle2 size={64} />
                               </motion.div>
                               <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-4 -right-4 rounded-full bg-emerald-500 px-4 py-2 text-[11px] font-black tracking-tight text-black shadow-2xl"
                               >
                                 {result.optimized ? `-${savedPercent}% SAVED` : "ALREADY OPTIMIZED"}
                               </motion.div>
                            </div>

                            <div className="space-y-3 group">
                               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimized Weight</p>
                               <div className="px-8 py-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-2xl font-black text-emerald-500 transition-all group-hover:bg-emerald-500/20">
                                  {formatSize(result.newSize)}
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h4 className="text-5xl font-black text-white uppercase italic tracking-tighter pr-4 px-4 -mx-4">
                              {result.optimized ? "OPTIMIZATION READY." : "FILE ALREADY EFFICIENT."}
                            </h4>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                              {result.optimized
                                ? `Saved ${formatSize(result.oldSize - result.newSize)} without rasterizing pages`
                                : "Lumora kept the original because rebuilding it would make the file larger"}
                            </p>
                         </div>

                         <div className="flex flex-col sm:flex-row items-center gap-6">
                            <a 
                              href={result.url} 
                              download={result.fileName}
                              className="px-14 py-7 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-3xl"
                            >
                              <Download className="w-5 h-5" />
                              Download Result
                            </a>
                            <button 
                              onClick={() => { setFile(null); setResult(null); }}
                              className="px-10 py-7 rounded-2xl glass-dark border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-all"
                            >
                              Compress Another
                            </button>
                         </div>
                      </div>
                   ) : (
                     <div className="space-y-12">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                                 <div className="p-2 bg-emerald-500/10 rounded-xl"><Minimize2 className="w-5 h-5 text-emerald-500" /></div>
                                 Optimization Target
                              </h3>
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">High-fidelity scanning ready</p>
                           </div>
                           <button 
                             onClick={() => setFile(null)}
                             className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all"
                           >
                              <X className="w-5 h-5" />
                           </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-10 p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 group hover:bg-zinc-900 transition-all">
                           <PdfThumbnail file={file} className="w-32 h-44 shadow-2xl shrink-0" />
                           <div className="flex-1 min-w-0">
                              <h4 className="text-2xl font-black text-white truncate italic tracking-tighter mb-4 pr-4 px-4 -mx-4">{file.name}</h4>
                              <div className="flex items-center gap-6">
                                 <span className="px-3 py-1.5 rounded-xl bg-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border border-white/5">
                                    {formatSize(file.size)}
                                 </span>
                                 <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest italic">
                                    <Zap size={10} className="animate-pulse" />
                                    Original Volume
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-8">
                           <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Compression Intensity</h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {[
                                { id: "low", label: "Preserve", desc: "Keep all metadata", icon: Activity },
                                { id: "medium", label: "Balanced", desc: "Clean app metadata", icon: Zap },
                                { id: "high", label: "Metadata", desc: "Remove document details", icon: Minimize2 }
                              ].map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => setLevel(item.id as "low" | "medium" | "high")}
                                    className={cn(
                                        "p-10 rounded-[2.5rem] border transition-all text-left space-y-6 relative overflow-hidden group/opt",
                                        level === item.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", level === item.id ? "bg-emerald-500 text-white shadow-lg" : "bg-zinc-800 text-zinc-600 group-hover/opt:text-white")}>
                                        <item.icon size={28} />
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className={cn("text-xl font-black uppercase tracking-tight italic", level === item.id ? "text-white" : "text-zinc-500")}>{item.label}</h5>
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
                                    </div>
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}

                   <AnimatePresence>
                     {isProcessing && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
                        >
                          <div className="relative mb-12">
                             <div className="w-24 h-24 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                             <Zap className="absolute inset-0 m-auto w-8 h-8 text-emerald-500 animate-pulse" />
                          </div>
                          <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">Optimizing Streams...</h4>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] animate-pulse">Repacking document objects</p>
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Controls */}
        <div className="xl:col-span-4 space-y-8">
           {!result && (
             <PdfActionButton
               onClick={handleCompress}
               isLoading={isProcessing}
               disabled={!file}
               label={!file ? "Upload PDF" : "Optimize PDF"}
               subLabel={!file ? "Select a document to begin" : `${level.toUpperCase()} mode active`}
               icon={Minimize2}
             />
           )}

           <PdfSidebar 
             accentColor="text-accent-cyan"
             steps={COMPRESSOR_STEPS}
             stats={file ? [
               { label: "Selected File", value: file.name.slice(0, 15) + "..." },
               { label: "File Size", value: `${(file.size / 1024 / 1024).toFixed(2)} MB` },
               { label: "Mode", value: level === 'high' ? 'Metadata Clean' : level === 'medium' ? 'Balanced' : 'Preserve' }
             ] : []}
           />
 
           {!result && error && (
             <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
               <div className="space-y-1">
                  <p className="uppercase tracking-[0.2em]">Optimization Failed</p>
                  <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
