"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Download, 
  X, 
  FileEdit, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  AlignLeft, 
  Type,
  FileText,
  RotateCcw,
  Upload,
  Lock,
  Layers,
  Sparkles as SparklesProhibited,
  Loader2
} from "lucide-react";
import { PdfThumbnail } from "./pdf/PdfThumbnail";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { MediaPipelineBar } from "./MediaPipelineBar";
import { generateDemoPdfs } from "@/lib/pdf-demo-generator";
import { readDownloadResponse } from "@/lib/pdf-client";

const TO_WORD_STEPS = [
  { title: "Upload PDF", desc: "Select the document you want to convert into an editable Microsoft Word document." },
  { title: "Select Formatting", desc: "Choose continuous paragraph flow or line-preserving layout for tables and receipts." },
  { title: "Text Extraction", desc: "Exismic recovers embedded typography and structures an authentic DOCX file." },
  { title: "Download", desc: "Open and edit your converted file directly in Microsoft Word, Google Docs, or Pages." }
];

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [status, setStatus] = useState("Preparing document engine...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("editable-document.docx");
  const [error, setError] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<"standard" | "precise">("precise");

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

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    noClick: false,
  });

  const handleLoadSample = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingSample(true);
    setError(null);

    try {
      const demoFiles = await generateDemoPdfs();
      if (demoFiles[0]) {
        setFile(demoFiles[0]); // Q3_Financial_Summary.pdf
        setResultUrl(null);
      }
    } catch (err) {
      console.error("Failed to generate demo PDF:", err);
      setError("Unable to load sample document. You can still upload your own PDF.");
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setConvertProgress(12);
    setStatus("Reading document structure & paragraphs...");
    setError(null);

    const progressInterval = setInterval(() => {
      setConvertProgress((prev) => {
        if (prev < 42) {
          setStatus("Extracting text streams & font dictionaries...");
          return prev + 7;
        }
        if (prev < 78) {
          setStatus("Rebuilding typography in Microsoft Word format...");
          return prev + 5;
        }
        if (prev < 92) {
          setStatus("Packaging .docx file...");
          return prev + 2;
        }
        return prev;
      });
    }, 120);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("layout", layoutMode);

    try {
      const response = await fetch("/api/tools/pdf/to-word", {
        method: "POST",
        body: formData,
      });

      const artifact = await readDownloadResponse(
        response,
        "editable-document.docx",
      );

      clearInterval(progressInterval);
      setConvertProgress(100);
      setStatus("Conversion Complete!");
      setTimeout(() => {
        setResultUrl(artifact.url);
        setResultFileName(artifact.fileName);
        setIsProcessing(false);
      }, 250);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to convert PDF to Word document.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Area */}
        <div className="xl:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                {...(getRootProps() as unknown as import("framer-motion").HTMLMotionProps<"div">)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={cn(
                  "relative min-h-[520px] rounded-[2.5rem] border-2 border-dashed border-red-500/25 bg-[#090a12]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 sm:p-12 text-center transition-all duration-500 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] cursor-pointer group",
                  isDragActive
                    ? "border-red-400 bg-red-500/10 scale-[0.99] shadow-[0_0_50px_rgba(239,68,68,0.35)]"
                    : "hover:border-red-500/40 hover:bg-[#0b0c16]/95"
                )}
              >
                <input {...getInputProps()} />

                {/* Subtle Ambient Radial Glow */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(239,68,68,0.12)_0%,transparent_65%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />

                <div className="relative z-10 flex flex-col items-center text-center max-w-xl space-y-7">
                  {/* Glowing Ruby Squircle Icon */}
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-red-950/40 border border-red-500/35 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.25)] group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                    <FileEdit className="w-10 h-10 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                      PDF to Word <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">Studio</span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Convert PDF files into fully editable Microsoft Word (.docx) documents with intact layout
                    </p>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={openFileDialog}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(239,68,68,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-white" />
                      Select Document
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSample}
                      disabled={isLoadingSample}
                      className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/[0.04] border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 active:scale-95 text-zinc-200 hover:text-white font-black text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isLoadingSample ? (
                        <>
                          <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 text-red-400" />
                          Load Sample PDF
                        </>
                      )}
                    </button>
                  </div>

                  {/* 4 Feature Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/5 w-full">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>100% In-Memory</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Layers className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Editable DOCX</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <AlignLeft className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Format Intact</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Instant Export</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="interface"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="rounded-[2.5rem] border-2 border-red-500/25 bg-[#090a12]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative min-h-[560px] overflow-hidden">
                  <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />

                  {/* Result Success State */}
                  {resultUrl ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 py-8 relative z-10">
                      <motion.div 
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                      >
                        <CheckCircle2 size={54} />
                      </motion.div>

                      <div className="space-y-2">
                        <h4 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                          Editable Word Document Ready
                        </h4>
                        <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-md mx-auto">
                          Your document has been compiled into a clean .docx file ready for editing in Word, Docs, or Pages.
                        </p>
                      </div>

                      {/* Download & Reset Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <a 
                          href={resultUrl} 
                          download={resultFileName}
                          className="px-10 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 shadow-[0_0_35px_rgba(239,68,68,0.4)]"
                        >
                          <Download className="w-4 h-4 text-white" />
                          Download Word (.docx)
                        </a>
                        <button 
                          onClick={() => { setFile(null); setResultUrl(null); }}
                          className="px-8 py-5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-black text-zinc-300 hover:text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Convert Another
                        </button>
                      </div>

                      {/* Pipeline Handoff */}
                      <div className="w-full pt-8 mt-4 border-t border-white/5">
                        <MediaPipelineBar
                          imageUrl="/og-image.png"
                          imageName={resultFileName}
                          sourceToolId="pdf-to-word"
                          sourceToolName="PDF to Word"
                          actions={["compressor", "resizer", "converter", "meme"]}
                          title="Next Action Pipeline"
                          subtitle="Take your converted document assets into companion tools"
                          accentColor="red"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 relative z-10">
                      {/* Active File Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                            <FileEdit className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                              Active Document
                            </h3>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                              Ready for text extraction and Word formatting
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => setFile(null)}
                          className="p-2.5 bg-white/[0.03] border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                          title="Change file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Document Details Card */}
                      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-zinc-900/80 to-[#0e0a10]/80 border border-white/5">
                        <PdfThumbnail file={file} className="w-24 h-32 rounded-xl border border-white/10 shadow-lg shrink-0" />
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h4 className="text-lg font-bold text-white truncate">
                            {file.name}
                          </h4>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono font-bold text-zinc-300 border border-white/5">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Ready to Convert
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Text Layout Mode Selector */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                          Select Text Layout Flow
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => setLayoutMode("precise")}
                            className={cn(
                              "p-5 rounded-2xl border transition-all text-left space-y-3 cursor-pointer relative overflow-hidden",
                              layoutMode === "precise"
                                ? "bg-red-500/10 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30"
                                : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                            )}
                          >
                            <div className={cn(
                              "size-10 rounded-xl flex items-center justify-center transition-all",
                              layoutMode === "precise"
                                ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                                : "bg-white/5 text-zinc-400"
                            )}>
                              <Type size={20} />
                            </div>
                            <div>
                              <h5 className={cn("text-sm font-black uppercase tracking-tight", layoutMode === "precise" ? "text-white" : "text-zinc-300")}>
                                Line Preserving (Recommended)
                              </h5>
                              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-0.5">
                                Preserves precise line breaks, headers, invoice tables, and structured text
                              </p>
                            </div>
                          </button>

                          <button 
                            type="button"
                            onClick={() => setLayoutMode("standard")}
                            className={cn(
                              "p-5 rounded-2xl border transition-all text-left space-y-3 cursor-pointer relative overflow-hidden",
                              layoutMode === "standard"
                                ? "bg-red-500/10 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30"
                                : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                            )}
                          >
                            <div className={cn(
                              "size-10 rounded-xl flex items-center justify-center transition-all",
                              layoutMode === "standard"
                                ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                                : "bg-white/5 text-zinc-400"
                            )}>
                              <AlignLeft size={20} />
                            </div>
                            <div>
                              <h5 className={cn("text-sm font-black uppercase tracking-tight", layoutMode === "standard" ? "text-white" : "text-zinc-300")}>
                                Continuous Paragraphs
                              </h5>
                              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-0.5">
                                Merges adjacent lines into natural flowing paragraphs for essays and articles
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Progress Overlay */}
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[#070508]/96 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
                      >
                        <div className="relative mb-8">
                          <div className="absolute inset-0 rounded-full bg-red-600/20 blur-2xl animate-pulse" />
                          <div className="w-24 h-24 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                          <FileEdit className="absolute inset-0 m-auto w-8 h-8 text-red-400 animate-pulse" />
                        </div>

                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-red-500/15 border border-red-500/30 text-red-300 mb-3 font-mono">
                          [ {convertProgress}% ]
                        </span>

                        <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                          Converting to Word...
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                          {status}
                        </p>

                        <div className="w-64 h-1.5 rounded-full bg-white/5 border border-white/10 mt-6 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
                            initial={{ width: "10%" }}
                            animate={{ width: `${convertProgress}%` }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Laser Horizon Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent my-10 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        </div>

        {/* Sidebar Controls */}
        <div className="xl:col-span-4 space-y-6">
          {!resultUrl && (
            <PdfActionButton
              onClick={handleConvert}
              isLoading={isProcessing}
              disabled={!file}
              label={!file ? "Upload PDF" : "Convert to Word"}
              subLabel={!file ? "Select a document to begin" : `${layoutMode === "precise" ? "Line Preserving" : "Paragraph Flow"} mode`}
              icon={FileEdit}
              themeColor="red"
            />
          )}

          <PdfSidebar 
            themeColor="red"
            accentColor="text-red-400"
            steps={TO_WORD_STEPS}
            stats={file ? [
              { label: "Target Format", value: ".DOCX (Word)" },
              { label: "Layout Mode", value: layoutMode === "precise" ? "Line Preserving" : "Paragraph Flow" },
              { label: "Original Size", value: `${(file.size / 1024 / 1024).toFixed(2)} MB` }
            ] : []}
          />

          {!resultUrl && error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-xs font-bold flex items-start gap-3.5 backdrop-blur-md"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.14em] text-[10px] text-red-400 font-black">Notice</p>
                <p className="font-medium text-zinc-300 leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
