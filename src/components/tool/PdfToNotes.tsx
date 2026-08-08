"use client";

import React, { useState, useRef } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  FileText,
  Upload,
  X,
  Download,
  Printer,
  FileCheck,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  GraduationCap,
  Check,
  ShieldCheck,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type InputMode = "upload" | "text";

interface StudyNotesResult {
  fileName: string;
  pageCount: number;
  characterCount: number;
  notes: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to generate study notes. Please try again.";
}

export default function PdfToNotes() {
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("Extracting document text layer...");
  const [result, setResult] = useState<StudyNotesResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMessage("Please select a valid PDF document (.pdf).");
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      setPdfFile(file);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMessage("Please drop a valid PDF document (.pdf).");
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      setPdfFile(file);
      setResult(null);
      setErrorMessage(null);
    }
  };

  const handleGenerate = async () => {
    if (inputMode === "upload" && !pdfFile) return;
    if (inputMode === "text" && !inputText.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStage("Phase 1/2: Extracting PDF text layer...");

    const stageTimer = setTimeout(() => {
      setProcessingStage("Phase 2/2: Synthesizing Academic Study Guide...");
    }, 1400);

    try {
      const formData = new FormData();
      if (inputMode === "upload" && pdfFile) {
        formData.append("file", pdfFile);
      } else {
        formData.append("text", inputText);
      }

      const response = await fetch("/api/tools/pdf/to-notes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to process PDF document.");
      }

      setResult({
        fileName: data.fileName || pdfFile?.name || "Textbook Material",
        pageCount: data.pageCount || 1,
        characterCount: data.characterCount || inputText.length,
        notes: data.notes,
      });
    } catch (err: unknown) {
      console.error("PDF to Notes Error:", err);
      setErrorMessage(getErrorMessage(err));
    } finally {
      clearTimeout(stageTimer);
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result?.notes) return;
    navigator.clipboard.writeText(result.notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!result?.notes) return;
    const blob = new Blob([result.notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^/.]+$/, "")}-exismic-study-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!result?.notes) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${result.fileName} - Exismic Study Notes</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #0f172a; max-width: 800px; margin: 0 auto; }
              h1, h2, h3 { color: #1e1b4b; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px; margin-top: 24px; }
              pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; font-size: 13px; white-space: pre-wrap; font-family: inherit; }
              .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
            </style>
          </head>
          <body>
            <h1>Exismic AI Study Notes: ${result.fileName}</h1>
            <pre>${result.notes}</pre>
            <div class="footer">Generated by Exismic AI Academic Study Suite</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const resetAll = () => {
    setPdfFile(null);
    setInputText("");
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* ERROR TOAST */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-950/90 p-4 text-xs font-semibold text-white shadow-2xl backdrop-blur-2xl max-w-md w-full"
          >
             <X size={16} className="text-red-400 shrink-0" />
             <span className="flex-1">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER STUDIO BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-[#0a0b14] to-black p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <GraduationCap size={14} className="text-amber-400" />
              <span>Exismic Academic Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              PDF to AI Study Notes
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
              Synthesize textbook chapters, lecture slides, and transcripts into structured study notes, core definition cards, and revision Q&As.
            </p>
          </div>

          {result && (
            <button 
              onClick={resetAll}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 shrink-0"
            >
               <RefreshCw size={14} /> New Document
            </button>
          )}
        </div>
      </div>

      {/* MAIN WORKSPACE STUDIO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
        
        {/* LEFT WORKSPACE: SOURCE UPLOADER / TEXT INPUT */}
        <div className="flex flex-col rounded-3xl border border-white/10 bg-[#090a12]/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
           
           {/* MODE TAB SWITCHER */}
           <div className="flex items-center justify-between border-b border-white/10 bg-black/50 p-2.5 sm:p-3">
              <div className="grid grid-cols-2 gap-1.5 w-full max-w-xs rounded-xl bg-black/60 p-1 border border-white/5">
                 <button
                   onClick={() => setInputMode("upload")}
                   className={cn(
                     "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all",
                     inputMode === "upload" 
                       ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-md" 
                       : "text-zinc-400 hover:text-white"
                   )}
                 >
                    <FileText size={14} />
                    <span>Upload PDF</span>
                 </button>
                 <button
                   onClick={() => setInputMode("text")}
                   className={cn(
                     "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all",
                     inputMode === "text" 
                       ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-md" 
                       : "text-zinc-400 hover:text-white"
                   )}
                 >
                    <BookOpen size={14} />
                    <span>Paste Text</span>
                 </button>
              </div>

              {pdfFile && inputMode === "upload" && (
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 truncate max-w-[130px]">
                  {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              )}
           </div>

           {/* CANVAS UPLOAD / TEXTAREA AREA */}
           <div className="flex-1 p-5 flex flex-col justify-center bg-black/30">
              {inputMode === "upload" ? (
                pdfFile ? (
                  <div className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-8 text-center my-auto">
                     <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.2)]">
                        <FileCheck size={32} />
                     </div>
                     
                     <div className="space-y-1">
                        <h3 className="text-sm font-black text-white truncate max-w-xs">{pdfFile.name}</h3>
                        <p className="text-xs text-zinc-400 font-medium">Ready for AI text extraction & study guide synthesis</p>
                     </div>

                     <button
                       onClick={() => setPdfFile(null)}
                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-[10px] font-bold text-red-300 hover:bg-red-500/20 transition-all"
                     >
                        <X size={12} /> Remove Document
                     </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="group relative flex min-h-[350px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-white/15 p-8 text-center transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/[0.03]"
                  >
                     <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.15)] group-hover:scale-110 transition-transform">
                        <Upload size={28} />
                     </div>

                     <div className="space-y-1 max-w-sm">
                        <h3 className="text-base font-black text-white group-hover:text-amber-200 transition-colors">
                          Drop PDF textbook or lecture slides here
                        </h3>
                        <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                          Drag and drop your PDF file or click to browse (up to 15MB)
                        </p>
                     </div>

                     <div className="flex items-center gap-2 pt-2">
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                           <FileText size={12} className="text-amber-400" /> Native PDF OCR Parsing
                        </span>
                     </div>

                     <input 
                       ref={fileInputRef} 
                       type="file" 
                       accept=".pdf,application/pdf" 
                       className="hidden" 
                       onChange={handleFileSelect} 
                     />
                  </div>
                )
              ) : (
                <div className="flex flex-col h-full space-y-2">
                   <textarea
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     placeholder="Paste textbook chapter, lecture transcript, or study notes here..."
                     className="w-full flex-1 min-h-[350px] rounded-2xl border border-white/10 bg-black/60 p-4 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none resize-none font-sans leading-relaxed"
                   />
                   <div className="flex justify-end text-[10px] font-bold text-zinc-500">
                      {inputText.length} characters
                   </div>
                </div>
              )}
           </div>

           {/* ACTION FOOTER */}
           <div className="border-t border-white/10 bg-black/50 p-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isProcessing || (inputMode === "upload" ? !pdfFile : !inputText.trim())}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 cursor-pointer active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin text-white" />
                    <span>{processingStage}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Convert to AI Study Notes</span>
                  </>
                )}
              </button>
           </div>
        </div>

        {/* RIGHT WORKSPACE: STUDY NOTES OUTPUT */}
        <div className="flex flex-col rounded-3xl border border-white/10 bg-[#090a12]/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
           
           {/* OUTPUT HEADER */}
           <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                 <BookOpen size={16} className="text-amber-400" />
                 <span className="text-xs font-black uppercase tracking-wider text-white">
                   Structured Study Guide
                 </span>
              </div>

              {result && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-300">
                   <span className="rounded-md bg-amber-400/10 px-2.5 py-1 border border-amber-400/30">
                     {result.pageCount} {result.pageCount === 1 ? 'Page' : 'Pages'}
                   </span>
                </div>
              )}
           </div>

           {/* OUTPUT VIEWPORT */}
           <div className="flex-1 p-5 overflow-y-auto bg-black/30 max-h-[510px]">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-20 text-center">
                   <div className="relative size-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
                      <Sparkles size={36} className="text-amber-400 animate-pulse" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Synthesizing Notes & Questions...</h4>
                      <p className="text-[11px] text-zinc-400 font-medium">{processingStage}</p>
                   </div>
                </div>
              ) : result?.notes ? (
                <div className="space-y-4">
                   <div className="whitespace-pre-wrap rounded-2xl bg-black/60 p-5 border border-white/10 text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans shadow-inner">
                      {result.notes}
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-24 text-center opacity-40">
                   <BookOpen size={40} className="text-amber-400" />
                   <div className="space-y-1 max-w-xs">
                      <p className="text-xs font-black text-white uppercase tracking-wider">Ready for PDF Synthesis</p>
                      <p className="text-[11px] text-zinc-400 font-medium">Upload a PDF or paste lecture text on the left to generate structured study guide.</p>
                   </div>
                </div>
              )}
           </div>

           {/* OUTPUT ACTIONS FOOTER */}
           {result?.notes && !isProcessing && (
             <div className="border-t border-white/10 bg-black/50 p-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                   {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                   <span>{copied ? "Copied to Clipboard!" : "Copy Notes"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  title="Download Markdown Document"
                  className="py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                   <Download size={15} />
                   <span>.MD</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  title="Print or Save as PDF"
                  className="py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                   <Printer size={15} />
                   <span>Print</span>
                </button>
             </div>
           )}
        </div>

      </div>

      {/* FOOTER STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         {[
           { label: "Document Extractor", value: "Native PDF OCR Text Parser", icon: FileText, color: "text-amber-400" },
           { label: "Academic AI Engine", value: "Exismic Neural Synthesizer", icon: Zap, color: "text-purple-400" },
           { label: "Revision Suite", value: "Automated Q&As & Definitions", icon: HelpCircle, color: "text-cyan-400" }
         ].map((stat, i) => (
           <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0c0d17]/80 p-4 backdrop-blur-2xl">
              <div className={cn("flex size-10 items-center justify-center rounded-xl bg-white/5 border border-white/10", stat.color)}>
                 <stat.icon size={18} />
              </div>
              <div>
                 <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                 <div className="text-xs text-white font-bold mt-0.5">{stat.value}</div>
              </div>
           </div>
         ))}
      </div>

    </div>
  );
}
