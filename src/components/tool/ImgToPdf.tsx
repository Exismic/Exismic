"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  Download, 
  Loader2, 
  X, 
  ArrowRight,
  FileText,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Zap,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layout,
  Maximize2
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

const TO_PDF_STEPS = [
  { title: "Upload Images", desc: "Select the photos or graphics you want to compile into a PDF." },
  { title: "Arrange Order", desc: "Drag and drop or use arrows to set the perfect page sequence." },
  { title: "Select Layout", desc: "Choose between 'Auto' (matches image size) or 'A4' (standard document)." },
  { title: "Compile", desc: "Our engine embeds the images into a high-fidelity PDF container." }
];

export default function ImgToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<"auto" | "a4">("auto");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
    setResultUrl(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
  });

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setStatus("Preparing image buffers...");
    setError(null);

    const formData = new FormData();
    images.forEach(img => formData.append("files", img.file));
    formData.append("pageSize", pageSize);

    try {
      const response = await fetch("/api/tools/pdf/img-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Conversion failed.");
      }

      const data = await response.json();
      setResultUrl(data.resultUrl);
      setStatus("Document Created!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        {/* Main Area */}
        <div className="xl:col-span-8 space-y-10">
          <AnimatePresence mode="wait">
            {images.length === 0 ? (
              <motion.div
                key="empty"
                {...getRootProps()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "relative h-[500px] rounded-[4rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 group overflow-hidden",
                  isDragActive ? "border-accent-purple bg-accent-purple/5 scale-[0.99]" : "hover:bg-white/[0.02] hover:border-white/10"
                )}
              >
                <input {...getInputProps()} />
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700">
                    <ImageIcon className={cn("w-10 h-10 transition-colors duration-500", isDragActive ? "text-accent-purple" : "text-zinc-600 group-hover:text-white")} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">Image to PDF <span className="text-accent-purple">Studio</span></h3>
                    <p className="text-zinc-500 font-medium text-lg uppercase tracking-widest text-[10px]">Compile your visual assets into a document</p>
                  </div>
                  <div className="px-10 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl group-hover:scale-105 transition-transform">
                    Select Images
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
                   {resultUrl ? (
                      <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-12 py-12">
                         <motion.div 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-32 h-32 rounded-[2.5rem] bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple shadow-[0_0_60px_rgba(168,85,247,0.2)]"
                         >
                           <CheckCircle2 size={64} />
                         </motion.div>
                         <div className="space-y-4">
                            <h4 className="text-5xl font-black text-white uppercase italic tracking-tighter pr-4 px-4 -mx-4">PDF COMPILED.</h4>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Successfully converted {images.length} assets into a master document</p>
                         </div>
                         <div className="flex flex-col sm:flex-row items-center gap-6">
                            <a 
                              href={resultUrl} 
                              download="compiled_images.pdf"
                              className="px-14 py-7 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-3xl"
                            >
                              <Download className="w-5 h-5" />
                              Download PDF
                            </a>
                            <button 
                              onClick={() => { setImages([]); setResultUrl(null); }}
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
                                 <div className="p-2 bg-accent-purple/10 rounded-xl"><Layout className="w-5 h-5 text-accent-purple" /></div>
                                 Storyboard Order
                              </h3>
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Arrange your visual sequence</p>
                           </div>
                           <button 
                             {...getRootProps()}
                             className="group px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
                           >
                              <Plus className="w-4 h-4 text-accent-purple group-hover:rotate-90 transition-transform" />
                              Add More
                              <input {...getInputProps()} />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 max-h-[650px] overflow-y-auto pr-4 no-scrollbar">
                           {images.map((img, idx) => (
                             <motion.div 
                               layout
                               key={img.id}
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               className="group flex items-center gap-6 p-6 bg-zinc-900/50 border border-white/5 rounded-3xl hover:bg-zinc-900 transition-all relative overflow-hidden"
                             >
                                <div className="flex flex-col gap-1 z-10 shrink-0">
                                   <button onClick={() => moveImage(idx, 'up')} disabled={idx === 0} className="p-1.5 text-zinc-600 hover:text-accent-purple disabled:opacity-0 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                                   <GripVertical className="w-4 h-4 text-zinc-800 mx-auto" />
                                   <button onClick={() => moveImage(idx, 'down')} disabled={idx === images.length - 1} className="p-1.5 text-zinc-600 hover:text-accent-purple disabled:opacity-0 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                                </div>

                                <div className="w-20 h-28 rounded-xl overflow-hidden bg-black/40 border border-white/5 shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                   <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0 z-10">
                                   <h4 className="text-base font-black text-white truncate italic tracking-tight">{img.file.name}</h4>
                                   <div className="flex items-center gap-3 mt-2">
                                      <span className="px-2 py-1 rounded-md bg-white/5 text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-white/5">
                                         {(img.file.size / 1024 / 1024).toFixed(2)} MB
                                      </span>
                                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Page {idx + 1}</span>
                                   </div>
                                </div>

                                <button 
                                  onClick={() => removeImage(img.id)}
                                  className="p-4 bg-red-500/5 text-zinc-700 rounded-2xl group-hover:text-red-500 group-hover:bg-red-500/10 transition-all hover:scale-110"
                                >
                                   <Trash2 className="w-5 h-5" />
                                </button>
                             </motion.div>
                           ))}
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
                             <div className="w-24 h-24 border-2 border-accent-purple/20 border-t-accent-purple rounded-full animate-spin" />
                             <Maximize2 className="absolute inset-0 m-auto w-8 h-8 text-accent-purple animate-pulse" />
                          </div>
                          <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">Compiling Document...</h4>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.5em] animate-pulse">Embedding visual assets into vector container</p>
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
               onClick={handleConvert}
               isLoading={isProcessing}
               disabled={images.length === 0}
               label={images.length === 0 ? "Upload Images" : `Compile ${images.length} Images`}
               subLabel={images.length === 0 ? "Select photos to begin" : `${pageSize.toUpperCase()} layout active`}
               icon={FileText}
             />
           )}

           <PdfSidebar 
             accentColor="text-accent-purple"
             steps={TO_PDF_STEPS}
             stats={images.length > 0 ? [
               { label: "Assets Selected", value: images.length },
               { label: "Project Weight", value: `${(images.reduce((acc, curr) => acc + curr.file.size, 0) / 1024 / 1024).toFixed(2)} MB` },
               { label: "Layout Mode", value: pageSize.toUpperCase() }
             ] : []}
           />

           {!resultUrl && (
             <div className="mt-8 space-y-8">
               {images.length > 0 && (
                 <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">Layout Engine</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setPageSize("auto")}
                         className={cn(
                           "p-6 rounded-[2rem] border text-left transition-all",
                           pageSize === "auto" ? "bg-accent-purple/10 border-accent-purple/30" : "bg-white/5 border-white/5"
                         )}
                       >
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", pageSize === "auto" ? "text-accent-purple" : "text-zinc-600")}>Auto</span>
                          <p className="text-[9px] text-zinc-700 font-bold mt-1">Match Image</p>
                       </button>
                       <button 
                         onClick={() => setPageSize("a4")}
                         className={cn(
                           "p-6 rounded-[2rem] border text-left transition-all",
                           pageSize === "a4" ? "bg-accent-purple/10 border-accent-purple/30" : "bg-white/5 border-white/5"
                         )}
                       >
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", pageSize === "a4" ? "text-accent-purple" : "text-zinc-600")}>A4</span>
                          <p className="text-[9px] text-zinc-700 font-bold mt-1">Standard</p>
                       </button>
                    </div>
                 </div>
               )}
 
               {error && (
                 <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4">
                   <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
                   <div className="space-y-1">
                      <p className="uppercase tracking-[0.2em]">Compiler Error</p>
                      <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
                   </div>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
