"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Download, 
  X, 
  Scissors,
  CheckCircle2,
  AlertCircle,
  Layers,
  Files
} from "lucide-react";
import { PdfThumbnail } from "./pdf/PdfThumbnail";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { readDownloadResponse } from "@/lib/pdf-client";

const SPLITTER_STEPS = [
  { title: "Upload PDF", desc: "Select the document you want to split or extract pages from." },
  { title: "Select Mode", desc: "Choose between extracting every page or defining a custom range." },
  { title: "Set Range", desc: "Specify exactly which pages you need (e.g., 1-5, 8, 12)." },
  { title: "Download", desc: "Get your pages delivered in a high-fidelity ZIP archive." }
];

export default function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("split-pages.zip");
  const [error, setError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<"all" | "range">("all");
  const [range, setRange] = useState("1-3");

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setResultUrl(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", splitMode);
    if (splitMode === "range") {
      formData.append("range", range);
    }

    try {
      const response = await fetch("/api/tools/pdf/splitter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Split failed. The PDF might be protected or too large.");
      }

      const artifact = await readDownloadResponse(
        response,
        splitMode === "all" ? "split-pages.zip" : "extracted-pages.pdf",
      );
      setResultUrl(artifact.url);
      setResultFileName(artifact.fileName);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to split PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        {/* Main Interaction Area */}
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
                  isDragActive ? "border-accent-purple bg-accent-purple/5 scale-[0.99]" : "hover:bg-white/[0.02] hover:border-white/10"
                )}
              >
                <input {...getInputProps()} />
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700">
                    <Scissors className={cn("w-10 h-10 transition-colors duration-500", isDragActive ? "text-accent-purple" : "text-zinc-600 group-hover:text-white")} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">PDF Splitter <span className="text-accent-purple">Studio</span></h3>
                    <p className="text-zinc-500 font-medium text-lg uppercase tracking-widest text-[10px]">Select a document to deconstruct</p>
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
                            <h4 className="text-5xl font-black text-white uppercase italic tracking-tighter pr-4 px-4 -mx-4">PDF DECONSTRUCTED.</h4>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Individual pages are ready for download</p>
                         </div>
                         <div className="flex flex-col sm:flex-row items-center gap-6">
                            <a 
                              href={resultUrl} 
                              download={resultFileName}
                              className="px-14 py-7 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-3xl"
                            >
                              <Download className="w-5 h-5" />
                              Download Result (ZIP)
                            </a>
                            <button 
                              onClick={() => { setFile(null); setResultUrl(null); }}
                              className="px-10 py-7 rounded-2xl glass-dark border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-all"
                            >
                              Split Another
                            </button>
                         </div>
                      </div>
                   ) : (
                     <div className="space-y-12">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                                 <div className="p-2 bg-accent-purple/10 rounded-xl"><Files className="w-5 h-5 text-accent-purple" /></div>
                                 Source Document
                              </h3>
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Binary analysis ready</p>
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
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                 </span>
                                 <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Ready
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-8">
                           <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Splitting Configuration</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <button 
                                onClick={() => setSplitMode("all")}
                                className={cn(
                                    "p-10 rounded-[2.5rem] border transition-all text-left space-y-6 relative overflow-hidden group/opt",
                                    splitMode === "all" ? "bg-accent-purple/10 border-accent-purple/30" : "bg-white/5 border-white/5 hover:border-white/10"
                                )}
                              >
                                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", splitMode === "all" ? "bg-accent-purple text-white shadow-lg" : "bg-zinc-800 text-zinc-600 group-hover/opt:text-white")}>
                                    <Layers size={28} />
                                 </div>
                                 <div className="space-y-2">
                                    <h5 className={cn("text-xl font-black uppercase tracking-tight italic", splitMode === "all" ? "text-white" : "text-zinc-500")}>Full Extraction</h5>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">Save every page as a separate document</p>
                                 </div>
                              </button>

                              <button 
                                onClick={() => setSplitMode("range")}
                                className={cn(
                                    "p-10 rounded-[2.5rem] border transition-all text-left space-y-6 relative overflow-hidden group/opt",
                                    splitMode === "range" ? "bg-accent-purple/10 border-accent-purple/30" : "bg-white/5 border-white/5 hover:border-white/10"
                                )}
                              >
                                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", splitMode === "range" ? "bg-accent-purple text-white shadow-lg" : "bg-zinc-800 text-zinc-600 group-hover/opt:text-white")}>
                                    <Scissors size={28} />
                                 </div>
                                 <div className="space-y-2">
                                    <h5 className={cn("text-xl font-black uppercase tracking-tight italic", splitMode === "range" ? "text-white" : "text-zinc-500")}>Surgical Split</h5>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">Extract a specific range of selected pages</p>
                                 </div>
                              </button>
                           </div>

                           <AnimatePresence>
                              {splitMode === "range" && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-10 rounded-[2.5rem] bg-black/40 border border-white/5 space-y-6"
                                >
                                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Page Range (e.g. 1-5, 8, 11-13)</label>
                                   <input 
                                     type="text" 
                                     value={range}
                                     onChange={(e) => setRange(e.target.value)}
                                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-2xl font-black text-white outline-none focus:border-accent-purple/50 focus:ring-4 focus:ring-accent-purple/5 transition-all italic placeholder:text-zinc-800"
                                     placeholder="1-3"
                                   />
                                </motion.div>
                              )}
                           </AnimatePresence>
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
                             <Scissors className="absolute inset-0 m-auto w-8 h-8 text-accent-purple animate-pulse" />
                          </div>
                          <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">Slicing PDF Layers...</h4>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.5em] animate-pulse">Binary Extraction in Progress</p>
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
               onClick={handleSplit}
               disabled={!file}
               isLoading={isProcessing}
               label={!file ? "Upload PDF" : splitMode === 'all' ? "Universal Split" : "Surgical Split"}
               subLabel={!file ? "Select a document to begin" : splitMode === 'all' ? "Extract all pages" : `Range: ${range}`}
               icon={Scissors}
             />
           )}

           <PdfSidebar 
             accentColor="text-accent-purple"
             steps={SPLITTER_STEPS}
             stats={file ? [
               { label: "Target Pages", value: splitMode === 'all' ? "All" : range },
               { label: "Split Mode", value: splitMode === 'all' ? "Sequential" : "Selective" },
               { label: "Processor", value: "PDF-lib" }
             ] : []}
           />
 
           {!resultUrl && error && (
             <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
               <div className="space-y-1">
                  <p className="uppercase tracking-[0.2em]">Split Failed</p>
                  <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
