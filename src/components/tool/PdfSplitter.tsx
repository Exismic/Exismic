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
  FileText,
  RotateCcw,
  Upload,
  Lock,
  Zap,
  FolderArchive,
  Loader2
} from "lucide-react";
import { PdfThumbnail } from "./pdf/PdfThumbnail";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { MediaPipelineBar } from "./MediaPipelineBar";
import { generateDemoPdfs } from "@/lib/pdf-demo-generator";
import { readDownloadResponse } from "@/lib/pdf-client";

const SPLITTER_STEPS = [
  { title: "Upload PDF", desc: "Select the document you want to extract or split pages from." },
  { title: "Choose Mode", desc: "Extract every page into individual files or choose a custom page range." },
  { title: "Page Range", desc: "Specify exact pages you need (for example: 1-2, 4) or extract all." },
  { title: "Download", desc: "Download separate page PDFs in a ZIP or a PDF of the selected range." }
];

export default function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [splitStage, setSplitStage] = useState("Preparing document engine...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("split-pages.zip");
  const [extractedCount, setExtractedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<"all" | "range">("all");
  const [range, setRange] = useState("1-2");

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
        setFile(demoFiles[0]); // Q3_Financial_Summary.pdf (2 pages)
        setResultUrl(null);
      }
    } catch (err) {
      console.error("Failed to generate demo PDF:", err);
      setError("Unable to load sample document. You can still upload your own PDF.");
    } finally {
      setIsLoadingSample(false);
    }
  };

  const splitPdfLocally = async (pdfFile: File, mode: "all" | "range", pageRangeStr: string) => {
    const { PDFDocument } = await import("pdf-lib");
    const arrayBuffer = await pdfFile.arrayBuffer();
    const sourceDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
    const totalPages = sourceDoc.getPageCount();

    if (mode === "all") {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const baseStem = pdfFile.name.replace(/\.pdf$/i, "");

      for (let i = 0; i < totalPages; i++) {
        const singleDoc = await PDFDocument.create();
        const [copiedPage] = await singleDoc.copyPages(sourceDoc, [i]);
        singleDoc.addPage(copiedPage);
        const bytes = await singleDoc.save({ useObjectStreams: true });
        zip.file(`${baseStem}-page-${i + 1}.pdf`, bytes);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      return { url, fileName: `${baseStem}-pages.zip`, count: totalPages };
    } else {
      // Range mode
      const selectedIndices: number[] = [];
      const parts = pageRangeStr.split(",").map((s) => s.trim());
      for (const part of parts) {
        if (part.includes("-")) {
          const [startStr, endStr] = part.split("-").map((s) => parseInt(s.trim(), 10));
          if (!isNaN(startStr) && !isNaN(endStr)) {
            const start = Math.max(1, Math.min(startStr, endStr));
            const end = Math.min(totalPages, Math.max(startStr, endStr));
            for (let p = start; p <= end; p++) {
              if (!selectedIndices.includes(p - 1)) selectedIndices.push(p - 1);
            }
          }
        } else {
          const single = parseInt(part, 10);
          if (!isNaN(single) && single >= 1 && single <= totalPages) {
            if (!selectedIndices.includes(single - 1)) selectedIndices.push(single - 1);
          }
        }
      }

      const indicesToUse = selectedIndices.length > 0 ? selectedIndices : [0];
      const rangeDoc = await PDFDocument.create();
      const copiedPages = await rangeDoc.copyPages(sourceDoc, indicesToUse);
      copiedPages.forEach((p) => rangeDoc.addPage(p));
      const bytes = await rangeDoc.save({ useObjectStreams: true });
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const baseStem = pdfFile.name.replace(/\.pdf$/i, "");
      return { url, fileName: `${baseStem}-extracted.pdf`, count: indicesToUse.length };
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setSplitProgress(15);
    setSplitStage("Analyzing document pages...");

    const progressInterval = setInterval(() => {
      setSplitProgress((prev) => {
        if (prev < 45) {
          setSplitStage("Preparing the selected pages...");
          return prev + 8;
        }
        if (prev < 80) {
          setSplitStage(splitMode === "all" ? "Creating individual page files..." : "Compiling selected range...");
          return prev + 5;
        }
        if (prev < 94) {
          setSplitStage("Finalizing download package...");
          return prev + 2;
        }
        return prev;
      });
    }, 120);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", splitMode);
      if (splitMode === "range") {
        formData.append("range", range);
      }

      const response = await fetch("/api/tools/pdf/splitter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Fallback to high-performance in-browser pdf-lib + jszip split
        console.warn("[PdfSplitter] Server returned non-OK, performing client-side split...");
        const clientResult = await splitPdfLocally(file, splitMode, range);
        clearInterval(progressInterval);
        setSplitProgress(100);
        setSplitStage("Pages separated successfully!");
        setTimeout(() => {
          setResultUrl(clientResult.url);
          setResultFileName(clientResult.fileName);
          setExtractedCount(clientResult.count);
          setIsProcessing(false);
        }, 250);
        return;
      }

      const artifact = await readDownloadResponse(
        response,
        splitMode === "all" ? "split-pages.zip" : "extracted-pages.pdf",
      );

      clearInterval(progressInterval);
      setSplitProgress(100);
      setSplitStage("Pages separated successfully!");
      setTimeout(() => {
        setResultUrl(artifact.url);
        setResultFileName(artifact.fileName);
        setIsProcessing(false);
      }, 250);
    } catch (err: unknown) {
      console.warn("[PdfSplitter] Server split failed, executing client-side fallback:", err);
      try {
        const clientResult = await splitPdfLocally(file, splitMode, range);
        clearInterval(progressInterval);
        setSplitProgress(100);
        setSplitStage("Pages separated successfully!");
        setTimeout(() => {
          setResultUrl(clientResult.url);
          setResultFileName(clientResult.fileName);
          setExtractedCount(clientResult.count);
          setIsProcessing(false);
        }, 250);
      } catch (clientErr) {
        clearInterval(progressInterval);
        console.error("[PdfSplitter] Client fallback split failed:", clientErr);
        setError(err instanceof Error ? err.message : "Failed to split PDF. Please check your page range.");
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Interaction Area */}
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
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-red-950/40 border border-red-500/35 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.25)] group-hover:scale-110 group-hover:-rotate-2 transition-all duration-500">
                    <Scissors className="w-10 h-10 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                      PDF Splitter <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">Studio</span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Extract every single page into separate files, or select a targeted page range
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
                      <span>Online Processing</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Layers className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Vector Sharp</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <FolderArchive className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Clean ZIP Archive</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Instant Split</span>
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
                  {/* Subtle red ambient light */}
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
                          PDF Successfully Split
                        </h4>
                        <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-md mx-auto">
                          {splitMode === "all"
                            ? "All individual pages have been packaged cleanly into a ZIP archive."
                            : "Your selected page range has been extracted into a unified PDF."}
                        </p>
                      </div>

                      {/* Summary Box */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center gap-6 w-full max-w-md">
                        <div className="text-center">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Source Document</p>
                          <p className="text-sm font-black text-white mt-0.5 truncate max-w-[150px]">{file.name}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Output Mode</p>
                          <p className="text-sm font-black text-red-400 mt-0.5">
                            {splitMode === "all" ? "All Pages (ZIP)" : `Range (${range})`}
                          </p>
                        </div>
                        {extractedCount && (
                          <>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Extracted</p>
                              <p className="text-sm font-black text-white mt-0.5">{extractedCount} Pages</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Download & Reset Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <a 
                          href={resultUrl} 
                          download={resultFileName}
                          className="px-10 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 shadow-[0_0_35px_rgba(239,68,68,0.4)]"
                        >
                          <Download className="w-4 h-4 text-white" />
                          Download Result ({splitMode === "all" ? "ZIP" : "PDF"})
                        </a>
                        <button 
                          onClick={() => { setFile(null); setResultUrl(null); }}
                          className="px-8 py-5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-black text-zinc-300 hover:text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Split Another
                        </button>
                      </div>

                      {/* Pipeline Handoff */}
                      <div className="w-full pt-8 mt-4 border-t border-white/5">
                        <MediaPipelineBar
                          imageUrl="/og-image.png"
                          imageName={resultFileName}
                          sourceToolId="pdf-splitter"
                          sourceToolName="PDF Splitter"
                          actions={["compressor", "resizer", "converter", "meme"]}
                          title="Next Action Pipeline"
                          subtitle="Carry your extracted pages into companion tools with zero re-uploading"
                          accentColor="red"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 relative z-10">
                      {/* Document Card Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                            <FileText className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                              Active Document
                            </h3>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                              Ready for page extraction and splitting
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

                      {/* Document Preview Card */}
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
                              Ready to Split
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Split Mode Selector */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                          Select Splitting Configuration
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Mode 1: All Pages */}
                          <button 
                            type="button"
                            onClick={() => setSplitMode("all")}
                            className={cn(
                              "p-5 rounded-2xl border transition-all text-left space-y-3 cursor-pointer relative overflow-hidden",
                              splitMode === "all"
                                ? "bg-red-500/10 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30"
                                : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                            )}
                          >
                            <div className={cn(
                              "size-10 rounded-xl flex items-center justify-center transition-all",
                              splitMode === "all"
                                ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                                : "bg-white/5 text-zinc-400"
                            )}>
                              <Layers size={20} />
                            </div>
                            <div>
                              <h5 className={cn("text-sm font-black uppercase tracking-tight", splitMode === "all" ? "text-white" : "text-zinc-300")}>
                                Extract All Pages
                              </h5>
                              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-0.5">
                                Saves every individual page as a separate PDF inside a ZIP folder
                              </p>
                            </div>
                          </button>

                          {/* Mode 2: Custom Range */}
                          <button 
                            type="button"
                            onClick={() => setSplitMode("range")}
                            className={cn(
                              "p-5 rounded-2xl border transition-all text-left space-y-3 cursor-pointer relative overflow-hidden",
                              splitMode === "range"
                                ? "bg-red-500/10 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30"
                                : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                            )}
                          >
                            <div className={cn(
                              "size-10 rounded-xl flex items-center justify-center transition-all",
                              splitMode === "range"
                                ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                                : "bg-white/5 text-zinc-400"
                            )}>
                              <Scissors size={20} />
                            </div>
                            <div>
                              <h5 className={cn("text-sm font-black uppercase tracking-tight", splitMode === "range" ? "text-white" : "text-zinc-300")}>
                                Extract Specific Range
                              </h5>
                              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-0.5">
                                Select only the exact pages you want to keep into a unified PDF
                              </p>
                            </div>
                          </button>
                        </div>

                        {/* Range Input Field */}
                        <AnimatePresence>
                          {splitMode === "range" && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="p-5 rounded-2xl bg-white/[0.02] border border-red-500/20 space-y-2 mt-2"
                            >
                              <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block">
                                Target Page Numbers (e.g. 1-2, 4)
                              </label>
                              <input 
                                type="text" 
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-zinc-600"
                                placeholder="1-2"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                          <Scissors className="absolute inset-0 m-auto w-8 h-8 text-red-400 animate-pulse" />
                        </div>

                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-red-500/15 border border-red-500/30 text-red-300 mb-3 font-mono">
                          [ {splitProgress}% ]
                        </span>

                        <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                          Separating Pages...
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                          {splitStage}
                        </p>

                        <div className="w-64 h-1.5 rounded-full bg-white/5 border border-white/10 mt-6 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
                            initial={{ width: "10%" }}
                            animate={{ width: `${splitProgress}%` }}
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
              onClick={handleSplit}
              disabled={!file}
              isLoading={isProcessing}
              label={!file ? "Upload PDF" : splitMode === "all" ? "Extract All Pages" : "Extract Page Range"}
              subLabel={!file ? "Select a document to begin" : splitMode === "all" ? "Save each page to ZIP" : `Extracting pages: ${range}`}
              icon={Scissors}
              themeColor="red"
            />
          )}

          <PdfSidebar 
            themeColor="red"
            accentColor="text-red-400"
            steps={SPLITTER_STEPS}
            stats={file ? [
              { label: "Target Scope", value: splitMode === "all" ? "All Pages" : `Range: ${range}` },
              { label: "Extraction Format", value: splitMode === "all" ? "ZIP Archive" : "Unified PDF" },
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
