"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Download, 
  X, 
  FileText,
  ScanText,
  CheckCircle2,
  AlertCircle,
  Zap,
  Copy,
  ClipboardCheck,
  Search
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import type { LoggerMessage, Worker } from "tesseract.js";

interface OcrPdfViewport {
  height: number;
  width: number;
}

interface OcrPdfPage {
  getViewport(options: { scale: number }): OcrPdfViewport;
  render(options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: OcrPdfViewport;
  }): { promise: Promise<void> };
}

interface OcrPdfDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<OcrPdfPage>;
}

interface OcrPdfJs {
  getDocument(options: { data: ArrayBuffer }): {
    promise: Promise<OcrPdfDocument>;
  };
}

declare const pdfjsLib: OcrPdfJs;

const OCR_STEPS = [
  { title: "Upload Source", desc: "Select a PDF document or image file containing text you want to extract." },
  { title: "Select Language", desc: "Choose the primary language for better recognition accuracy." },
  { title: "Recognize Text", desc: "Tesseract OCR identifies characters using your selected language model." },
  { title: "Copy & Export", desc: "Get your extracted text instantly ready for your clipboard." }
];

export default function OcrExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("eng");
  const [isCopied, setIsCopied] = useState(false);
  const [isPdfEngineLoaded, setIsPdfEngineLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkLibs = setInterval(() => {
      const pdfLoaded = typeof pdfjsLib !== "undefined";
      if (pdfLoaded) {
        setIsPdfEngineLoaded(true);
        clearInterval(checkLibs);
      }
    }, 100);
    return () => clearInterval(checkLibs);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      const f = acceptedFiles[0];
      setFile(f);
      setExtractedText("");
      setError(null);
      
      if (f.type.startsWith("image/")) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(f));
      } else {
        setPreviewUrl(null);
      }
    }
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"]
    },
    multiple: false,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.replace(/\.[^/.]+$/, "") || "lumora-ocr"}-text.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const runOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setStatus("Loading OCR language data...");
    setError(null);

    let worker: Worker | null = null;
    try {
      const { createWorker } = await import("tesseract.js");
      let currentPage = 0;
      let totalPages = 1;
      worker = await createWorker(language, 1, {
        logger: (message: LoggerMessage) => {
          if (message.status === "recognizing text") {
            const overall =
              ((currentPage + Math.max(0, Math.min(1, message.progress))) /
                totalPages) *
              100;
            setProgress(Math.round(overall));
            setStatus(
              totalPages > 1
                ? `Reading page ${currentPage + 1} of ${totalPages}`
                : `Reading text ${Math.round(message.progress * 100)}%`,
            );
          }
        },
      });
      let fullText = "";

      if (file.type === "application/pdf") {
        if (!isPdfEngineLoaded) throw new Error("The PDF renderer is still loading. Try again in a moment.");
        setStatus("Rendering document layers...");
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        totalPages = pdf.numPages;
        if (totalPages > 50) {
          throw new Error("OCR supports up to 50 PDF pages per scan.");
        }

        for (let i = 1; i <= totalPages; i++) {
          currentPage = i - 1;
          setStatus(`Rendering page ${i} of ${totalPages}`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Could not initialize the page renderer.");
          canvas.height = Math.ceil(viewport.height);
          canvas.width = Math.ceil(viewport.width);
          await page.render({ canvasContext: context, viewport }).promise;
          const result = await worker.recognize(canvas);
          fullText += `Page ${i}\n${result.data.text.trim()}\n\n`;
          canvas.width = 1;
          canvas.height = 1;
        }
      } else {
        const result = await worker.recognize(file);
        fullText = result.data.text;
      }

      const normalizedText = fullText.trim();
      if (!normalizedText) {
        throw new Error("No readable text was detected in this file.");
      }
      setExtractedText(normalizedText);
      setStatus("Success!");
      setProgress(100);
    } catch (err: unknown) {
      console.error("OCR Error:", err);
      setError(err instanceof Error ? err.message : "Text recognition failed.");
    } finally {
      await worker?.terminate();
      setIsProcessing(false);
    }
  };

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
                  isDragActive ? "border-accent-cyan bg-accent-cyan/5 scale-[0.99]" : "hover:bg-white/[0.02] hover:border-white/10"
                )}
              >
                <input {...getInputProps()} />
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.03)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700">
                    <ScanText className={cn("w-10 h-10 transition-colors duration-500", isDragActive ? "text-accent-cyan" : "text-zinc-600 group-hover:text-white")} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">OCR Vision <span className="text-accent-cyan">Studio</span></h3>
                    <p className="text-zinc-500 font-medium text-lg uppercase tracking-widest text-[10px]">Extract editable text from any document</p>
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
                   {extractedText ? (
                      <div className="space-y-10">
                         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                               <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                                  <CheckCircle2 size={32} />
                               </div>
                               <div>
                                  <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter pr-4 px-4 -mx-4">TEXT EXTRACTED.</h4>
                                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Recognition complete · Review important details before use</p>
                               </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                              <button
                                onClick={handleDownload}
                                className="flex min-h-12 items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/[0.09]"
                              >
                                <Download size={18} />
                                Download TXT
                              </button>
                              <button
                                onClick={handleCopy}
                                className="flex min-h-12 items-center justify-center gap-3 rounded-lg bg-white px-6 text-xs font-black uppercase tracking-widest text-black shadow-2xl transition hover:bg-zinc-200"
                              >
                                {isCopied ? <ClipboardCheck size={18} /> : <Copy size={18} />}
                                {isCopied ? "Copied!" : "Copy Output"}
                              </button>
                            </div>
                         </div>

                         <div className="relative group">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-accent-cyan to-accent-purple rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                            <textarea 
                              readOnly
                              className="relative w-full min-h-[450px] bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 text-zinc-300 font-medium leading-relaxed outline-none focus:border-accent-cyan/30 transition-all resize-none shadow-inner custom-scrollbar"
                              value={extractedText}
                            />
                         </div>

                         <button 
                           onClick={() => { setFile(null); setExtractedText(""); }}
                           className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
                         >
                           Start New Scan
                         </button>
                      </div>
                   ) : (
                     <div className="space-y-12">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                                 <div className="p-2 bg-accent-cyan/10 rounded-xl"><Search className="w-5 h-5 text-accent-cyan" /></div>
                                 Pattern Analysis
                              </h3>
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Local OCR workspace ready</p>
                           </div>
                           <button 
                             onClick={() => setFile(null)}
                             className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all"
                           >
                              <X className="w-5 h-5" />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-8">
                              <div className="p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 space-y-6 group hover:bg-zinc-900 transition-all">
                                 <div className="w-20 h-20 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
                                    <FileText size={40} />
                                 </div>
                                 <div>
                                    <h4 className="text-xl font-black text-white truncate italic tracking-tighter pr-4 px-4 -mx-4">{file.name}</h4>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2">
                                       {file.type.toUpperCase() || "DOCUMENT"} • {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Primary Language</label>
                                 <div className="grid grid-cols-2 gap-4">
                                    {[
                                      { id: "eng", name: "English" },
                                      { id: "spa", name: "Spanish" },
                                      { id: "fra", name: "French" },
                                      { id: "deu", name: "German" }
                                    ].map((lang) => (
                                      <button 
                                        key={lang.id}
                                        onClick={() => setLanguage(lang.id)}
                                        className={cn(
                                          "py-4 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all",
                                          language === lang.id ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan shadow-lg" : "bg-white/5 border-white/5 text-zinc-600 hover:border-white/10"
                                        )}
                                      >
                                         {lang.name}
                                      </button>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="relative group rounded-[3rem] overflow-hidden bg-zinc-950 border border-white/5 aspect-square flex items-center justify-center shadow-3xl">
                              {previewUrl ? (
                                 <img src={previewUrl} className="w-full h-full object-contain p-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="Preview" />
                              ) : (
                                 <div className="flex flex-col items-center gap-6 opacity-20">
                                    <ScanText size={80} className="text-white" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Visual Preview</span>
                                 </div>
                              )}
                              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-10">
                                 <div className="flex items-center gap-3">
                                    <Zap size={16} className="text-accent-cyan animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Ready to recognize text</span>
                                 </div>
                              </div>
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
                             <div className="w-24 h-24 border-2 border-accent-cyan/20 border-t-accent-cyan rounded-full animate-spin" />
                             <ScanText className="absolute inset-0 m-auto w-8 h-8 text-accent-cyan animate-pulse" />
                          </div>
                          <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">{status}</h4>
                          <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-accent-cyan shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300"
                               style={{ width: `${progress}%` }}
                             />
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-6 font-black uppercase tracking-[0.4em]">OCR worker active</p>
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
           {!extractedText && (
             <PdfActionButton
               onClick={runOCR}
               isLoading={isProcessing}
               disabled={!file}
               label={!file ? "Select Document" : "Recognize Text"}
               subLabel={!file ? "Upload a file to begin" : `${language.toUpperCase()} model active`}
               icon={ScanText}
             />
           )}

           <PdfSidebar 
             accentColor="text-accent-cyan"
             steps={OCR_STEPS}
             stats={file ? [
               { label: "Engine", value: "Tesseract OCR" },
               { label: "Language", value: language.toUpperCase() },
               { label: "Confidence", value: "Adaptive" }
             ] : []}
           />

           {!extractedText && error && (
             <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
               <div className="space-y-1">
                  <p className="uppercase tracking-[0.2em]">Vision Error</p>
                  <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
