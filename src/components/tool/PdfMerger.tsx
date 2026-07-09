"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  Download, 
  Plus, 
  X, 
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Zap,
  GripVertical
} from "lucide-react";
import { PdfThumbnail } from "./pdf/PdfThumbnail";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { readDownloadResponse } from "@/lib/pdf-client";

interface PdfFile {
  id: string;
  file: File;
}

const MERGER_STEPS = [
  { title: "Upload Documents", desc: "Select multiple PDF files you want to combine into one." },
  { title: "Arrange Order", desc: "Drag and drop or use arrows to set the perfect document sequence." },
  { title: "Merge Pages", desc: "Exismic copies every page into one document in your selected order." },
  { title: "Download", desc: "Save your combined document instantly to your local storage." }
];

export default function PdfMerger() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("merged-document.pdf");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file
    }));
    setFiles(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > 20) {
        setError("You can merge up to 20 PDFs at once.");
      }
      return combined.slice(0, 20);
    });
    setResultUrl(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setResultUrl(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    files.forEach(f => {
      formData.append("files", f.file);
    });

    try {
      const response = await fetch("/api/tools/pdf/merger", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Merge failed. Try using fewer files.");
      }

      const artifact = await readDownloadResponse(response, "merged-document.pdf");
      setResultUrl(artifact.url);
      setResultFileName(artifact.fileName);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to merge PDFs");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSize = files.reduce((acc, curr) => acc + curr.file.size, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        {/* Main Interaction Area */}
        <div className="xl:col-span-8 space-y-10">
          <AnimatePresence mode="wait">
            {files.length === 0 ? (
              <motion.div
                key="empty"
                {...getRootProps()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "relative h-[500px] rounded-[4rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 group overflow-hidden",
                  isDragActive ? "border-accent-cyan bg-accent-cyan/5 scale-[0.99]" : "hover:bg-white/[0.02] hover:border-white/10"
                )}
              >
                <input {...getInputProps()} />
                
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                    <Upload className={cn("w-10 h-10 transition-colors duration-500", isDragActive ? "text-accent-cyan" : "text-zinc-600 group-hover:text-white")} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">PDF Merger <span className="text-accent-cyan">Studio</span></h3>
                    <p className="text-zinc-500 font-medium text-lg uppercase tracking-widest text-[10px]">Drag & Drop your PDFs here to begin</p>
                  </div>
                  <div className="px-8 py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl group-hover:scale-105 transition-transform">
                    Select Documents
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="storyboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl relative min-h-[600px] overflow-hidden">
                  {/* Result Success State */}
                  {resultUrl ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-12 py-12">
                       <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.2)]"
                       >
                         <CheckCircle2 size={64} />
                       </motion.div>
                       <div className="space-y-4">
                          <h4 className="text-5xl font-black text-white uppercase italic tracking-tighter pr-4 px-4 -mx-4">DOCUMENTS MERGED.</h4>
                          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Optimized for distribution & storage</p>
                       </div>
                       <div className="flex flex-col sm:flex-row items-center gap-6">
                          <a 
                            href={resultUrl} 
                            download={resultFileName}
                            className="px-14 py-7 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-3xl"
                          >
                            <Download className="w-5 h-5" />
                            Download Master
                          </a>
                          <button 
                            onClick={() => { setFiles([]); setResultUrl(null); }}
                            className="px-10 py-7 rounded-2xl glass-dark border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-all"
                          >
                            New Project
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                               <div className="p-2 bg-accent-cyan/10 rounded-xl"><FileText className="w-5 h-5 text-accent-cyan" /></div>
                               Document Sequence
                            </h3>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Arrange your files in order</p>
                         </div>
                         <button 
                           {...getRootProps()}
                           className="group px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
                         >
                            <Plus className="w-4 h-4 text-accent-cyan group-hover:rotate-90 transition-transform" />
                            Add More
                            <input {...getInputProps()} />
                         </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 max-h-[650px] overflow-y-auto pr-4 no-scrollbar">
                        {files.map((f, index) => (
                          <motion.div 
                            key={f.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group flex items-center gap-6 p-6 bg-zinc-900/50 border border-white/5 rounded-3xl hover:bg-zinc-900 transition-all relative overflow-hidden"
                          >
                            <div className="flex flex-col gap-1 z-10 shrink-0">
                               <button onClick={() => moveFile(index, 'up')} disabled={index === 0} className="p-1.5 text-zinc-600 hover:text-accent-cyan disabled:opacity-0 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                               <GripVertical className="w-4 h-4 text-zinc-800 mx-auto" />
                               <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="p-1.5 text-zinc-600 hover:text-accent-cyan disabled:opacity-0 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                            </div>

                            <PdfThumbnail file={f.file} className="w-20 h-28 shrink-0 shadow-2xl" />

                            <div className="flex-1 min-w-0 z-10">
                               <h4 className="text-base font-black text-white truncate italic tracking-tight">{f.file.name}</h4>
                               <div className="flex items-center gap-3 mt-2">
                                  <span className="px-2 py-1 rounded-md bg-white/5 text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-white/5">
                                     {(f.file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                  <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Index {index + 1}</span>
                               </div>
                            </div>

                            <button 
                              onClick={() => removeFile(f.id)}
                              className="p-4 bg-red-500/5 text-zinc-700 rounded-2xl group-hover:text-red-500 group-hover:bg-red-500/10 transition-all hover:scale-110"
                            >
                               <X className="w-5 h-5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Processing Overlay */}
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
                      >
                        <div className="relative mb-12">
                           <div className="w-24 h-24 border-2 border-accent-cyan/20 border-t-accent-cyan rounded-full animate-spin" />
                           <Zap className="absolute inset-0 m-auto w-8 h-8 text-accent-cyan animate-pulse" />
                        </div>
                        <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">Merging PDFs...</h4>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.5em] animate-pulse">Compiling Document Layers</p>
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
          {!resultUrl && (
            <PdfActionButton
              onClick={handleMerge}
              disabled={files.length < 2}
              isLoading={isProcessing}
              label={files.length === 0 ? "Upload PDFs" : files.length < 2 ? "Select More Files" : `Merge ${files.length} PDFs`}
              subLabel={files.length < 2 ? "Minimum 2 files required" : `${(totalSize / 1024 / 1024).toFixed(2)} MB Total`}
            />
          )}

          <PdfSidebar 
            accentColor="text-accent-cyan"
            steps={MERGER_STEPS}
            stats={files.length > 0 ? [
              { label: "Selected Files", value: files.length },
              { label: "Project Weight", value: `${(totalSize / 1024 / 1024).toFixed(2)} MB` },
              { label: "Output Format", value: "Standard PDF" }
            ] : []}
          />
          
          {!resultUrl && error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div className="space-y-1">
                 <p className="uppercase tracking-[0.2em]">Merge Failed</p>
                 <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
