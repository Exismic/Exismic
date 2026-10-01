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
  GripVertical,
  RotateCcw,
  Files,
  Layers,
  Lock,
  ArrowUpDown,
  Zap,
  Trash2,
  Loader2
} from "lucide-react";
import { PdfThumbnail } from "./pdf/PdfThumbnail";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { MediaPipelineBar } from "./MediaPipelineBar";
import { generateDemoPdfs } from "@/lib/pdf-demo-generator";
import { readDownloadResponse } from "@/lib/pdf-client";

interface PdfFile {
  id: string;
  file: File;
}

const MERGER_STEPS = [
  { title: "Upload Documents", desc: "Select multiple PDF files you want to combine into one unified document." },
  { title: "Arrange Order", desc: "Drag and drop or use the arrow controls to set your exact page sequence." },
  { title: "Merge Pages", desc: "Exismic preserves full vector resolution and consolidates every page cleanly." },
  { title: "Download Master", desc: "Save your combined PDF instantly with zero server retention." }
];

export default function PdfMerger() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeStage, setMergeStage] = useState("Preparing document engine...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("merged-document.pdf");
  const [mergedPageCount, setMergedPageCount] = useState<number | null>(null);
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

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    noClick: false,
  });

  const handleLoadSamples = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingSamples(true);
    setError(null);

    try {
      const demoFiles = await generateDemoPdfs();
      const newItems = demoFiles.map(file => ({
        id: crypto.randomUUID(),
        file
      }));
      setFiles(newItems);
      setResultUrl(null);
    } catch (err) {
      console.error("Failed to generate demo PDFs:", err);
      setError("Unable to synthesize sample documents. You can still upload your own PDFs.");
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setResultUrl(null);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setResultUrl(null);
    setError(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const mergePdfFilesLocally = async (pdfFiles: File[], outputName = "merged-document.pdf") => {
    const { PDFDocument } = await import("pdf-lib");
    const merged = await PDFDocument.create();
    let totalPages = 0;

    for (const f of pdfFiles) {
      const buffer = await f.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { updateMetadata: false });
      const indices = doc.getPageIndices();
      totalPages += indices.length;
      const copiedPages = await merged.copyPages(doc, indices);
      copiedPages.forEach((p) => merged.addPage(p));
    }

    const bytes = await merged.save({ useObjectStreams: true });
    const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return { url, fileName: outputName, totalPages };
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setError(null);
    setMergeProgress(12);
    setMergeStage("Reading document structure & page trees...");

    const progressInterval = setInterval(() => {
      setMergeProgress((prev) => {
        if (prev < 40) {
          setMergeStage("Extracting high-resolution vector layers...");
          return prev + 6;
        }
        if (prev < 78) {
          setMergeStage("Combining pages in specified order...");
          return prev + 4;
        }
        if (prev < 92) {
          setMergeStage("Optimizing fonts & compiling master PDF...");
          return prev + 2;
        }
        return prev;
      });
    }, 120);

    try {
      const formData = new FormData();
      files.forEach(f => {
        formData.append("files", f.file);
      });

      const response = await fetch("/api/tools/pdf/merger", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Fallback to high-performance in-browser pdf-lib merge
        console.warn("[PdfMerger] API returned non-OK, fallback to in-browser merge...");
        const clientResult = await mergePdfFilesLocally(files.map(f => f.file), "merged-document.pdf");
        clearInterval(progressInterval);
        setMergeProgress(100);
        setMergeStage("Merge complete!");
        setTimeout(() => {
          setResultUrl(clientResult.url);
          setResultFileName(clientResult.fileName);
          setMergedPageCount(clientResult.totalPages);
          setIsProcessing(false);
        }, 250);
        return;
      }

      const artifact = await readDownloadResponse(response, "merged-document.pdf");
      const pageHeader = response.headers.get("X-Exismic-Page-Count");
      const count = pageHeader ? parseInt(pageHeader, 10) : undefined;

      clearInterval(progressInterval);
      setMergeProgress(100);
      setMergeStage("Merge complete!");
      setTimeout(() => {
        setResultUrl(artifact.url);
        setResultFileName(artifact.fileName);
        if (count) setMergedPageCount(count);
        setIsProcessing(false);
      }, 250);
    } catch (err: unknown) {
      console.warn("[PdfMerger] Server request failed, falling back to client-side merge:", err);
      try {
        const clientResult = await mergePdfFilesLocally(files.map(f => f.file), "merged-document.pdf");
        clearInterval(progressInterval);
        setMergeProgress(100);
        setMergeStage("Merge complete!");
        setTimeout(() => {
          setResultUrl(clientResult.url);
          setResultFileName(clientResult.fileName);
          setMergedPageCount(clientResult.totalPages);
          setIsProcessing(false);
        }, 250);
      } catch (clientErr) {
        clearInterval(progressInterval);
        console.error("[PdfMerger] Client fallback merge failed:", clientErr);
        setError(err instanceof Error ? err.message : "Failed to merge PDFs. Try using fewer documents.");
        setIsProcessing(false);
      }
    }
  };

  const totalSize = files.reduce((acc, curr) => acc + curr.file.size, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Interaction Area */}
        <div className="xl:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {files.length === 0 ? (
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
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-red-950/40 border border-red-500/35 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.25)] group-hover:scale-110 group-hover:rotate-1 transition-all duration-500">
                    <Files className="w-10 h-10 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                      PDF Merger <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">Studio</span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Drop your PDF reports, invoices, or scanned documents to merge into a single organized file
                    </p>
                  </div>

                  {/* Dual Action Buttons: Upload or Load Instant Samples */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={openFileDialog}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(239,68,68,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-white" />
                      Select Documents
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSamples}
                      disabled={isLoadingSamples}
                      className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/[0.04] border border-red-500/30 hover:border-red-400 hover:bg-red-500/10 active:scale-95 text-zinc-200 hover:text-white font-black text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isLoadingSamples ? (
                        <>
                          <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 text-red-400" />
                          Load Sample Documents
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
                      <span>Vector Sharp</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <ArrowUpDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Drag Reorder</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Instant Merge</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="stage"
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
                          Documents Merged Successfully
                        </h4>
                        <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-md mx-auto">
                          All pages have been compiled in your specified sequence and are ready for distribution.
                        </p>
                      </div>

                      {/* Summary Box */}
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center gap-6 w-full max-w-md">
                        <div className="text-center">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Source Files</p>
                          <p className="text-sm font-black text-white mt-0.5">{files.length} Files</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Total Weight</p>
                          <p className="text-sm font-black text-red-400 mt-0.5">{(totalSize / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {mergedPageCount && (
                          <>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Total Pages</p>
                              <p className="text-sm font-black text-white mt-0.5">{mergedPageCount} Pages</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Primary Download & Reset Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <a 
                          href={resultUrl} 
                          download={resultFileName}
                          className="px-10 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 shadow-[0_0_35px_rgba(239,68,68,0.4)]"
                        >
                          <Download className="w-4 h-4 text-white" />
                          Download Master PDF
                        </a>
                        <button 
                          onClick={clearAllFiles}
                          className="px-8 py-5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-black text-zinc-300 hover:text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          New Project
                        </button>
                      </div>

                      {/* Pipeline handoff to companion tools */}
                      <div className="w-full pt-8 mt-4 border-t border-white/5">
                        <MediaPipelineBar
                          imageUrl="/og-image.png"
                          imageName={resultFileName}
                          sourceToolId="pdf-merger"
                          sourceToolName="PDF Merger"
                          actions={["compressor", "resizer", "converter", "meme"]}
                          title="Next Action Pipeline"
                          subtitle="Send this document directly into companion tools with zero re-uploading"
                          accentColor="red"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 relative z-10">
                      {/* Stage Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                            <FileText className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase flex items-center gap-2.5">
                              Document Sequence
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 font-mono">
                                {files.length} {files.length === 1 ? 'file' : 'files'}
                              </span>
                            </h3>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                              Drag & drop or use arrows to set the exact document order
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button 
                            type="button"
                            onClick={openFileDialog}
                            className="px-4 py-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-red-400" />
                            Add More
                          </button>
                          <button 
                            type="button"
                            onClick={clearAllFiles}
                            className="px-3 py-2.5 bg-white/[0.03] border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Clear all documents"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Document List */}
                      <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2 no-scrollbar">
                        {files.map((f, index) => (
                          <motion.div 
                            key={f.id}
                            layout
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group flex items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-gradient-to-r from-zinc-900/80 to-[#0e0a10]/80 border border-white/5 rounded-2xl hover:border-red-500/30 hover:bg-zinc-900 transition-all relative overflow-hidden"
                          >
                            {/* Reorder Arrows */}
                            <div className="flex flex-col items-center gap-0.5 shrink-0 z-10">
                              <button 
                                type="button"
                                onClick={() => moveFile(index, 'up')} 
                                disabled={index === 0} 
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-0 transition-colors cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <GripVertical className="w-4 h-4 text-zinc-700" />
                              <button 
                                type="button"
                                onClick={() => moveFile(index, 'down')} 
                                disabled={index === files.length - 1} 
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-0 transition-colors cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Sequence Index Badge */}
                            <span className="flex size-7 items-center justify-center rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-[11px] font-black shrink-0">
                              #{index + 1}
                            </span>

                            {/* Document Thumbnail Preview */}
                            <PdfThumbnail file={f.file} className="w-16 h-22 rounded-xl shadow-lg border border-white/10 shrink-0" />

                            {/* Details */}
                            <div className="flex-1 min-w-0 z-10">
                              <h4 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
                                {f.file.name}
                              </h4>
                              <div className="flex items-center gap-2.5 mt-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-mono font-bold text-zinc-400 border border-white/5">
                                  {(f.file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                  Document {index + 1} of {files.length}
                                </span>
                              </div>
                            </div>

                            {/* Remove File Button */}
                            <button 
                              type="button"
                              onClick={() => removeFile(f.id)}
                              className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                              title="Remove document"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Sequence Summary Bar */}
                      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
                        <span className="font-medium">
                          {files.length} documents ready to combine • <strong className="text-white">{(totalSize / 1024 / 1024).toFixed(2)} MB</strong> total weight
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                          Preserves original vector page geometry
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dynamic High-Energy Merge Progress Overlay */}
                  <AnimatePresence>
                    {isProcessing && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[#070508]/96 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
                      >
                        <div className="relative mb-8">
                          {/* Outer Pulsing Aura */}
                          <div className="absolute inset-0 rounded-full bg-red-600/20 blur-2xl animate-pulse" />
                          <div className="w-24 h-24 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
                          <Layers className="absolute inset-0 m-auto w-8 h-8 text-red-400 animate-pulse" />
                        </div>

                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-red-500/15 border border-red-500/30 text-red-300 mb-3 font-mono">
                          [ {mergeProgress}% ]
                        </span>

                        <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                          Merging Documents...
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                          {mergeStage}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-64 h-1.5 rounded-full bg-white/5 border border-white/10 mt-6 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
                            initial={{ width: "10%" }}
                            animate={{ width: `${mergeProgress}%` }}
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

          {/* Category-Reactive Laser Horizon Divider bridging to SEO section */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent my-10 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        </div>

        {/* Sidebar Controls */}
        <div className="xl:col-span-4 space-y-6">
          {!resultUrl && (
            <PdfActionButton
              onClick={handleMerge}
              disabled={files.length < 2}
              isLoading={isProcessing}
              label={files.length === 0 ? "Upload PDFs" : files.length < 2 ? "Select More Files" : `Merge ${files.length} PDFs`}
              subLabel={files.length < 2 ? "Minimum 2 files required" : `${(totalSize / 1024 / 1024).toFixed(2)} MB Total`}
              themeColor="red"
            />
          )}

          <PdfSidebar 
            themeColor="red"
            accentColor="text-red-400"
            steps={MERGER_STEPS}
            stats={files.length > 0 ? [
              { label: "Selected Files", value: files.length },
              { label: "Project Weight", value: `${(totalSize / 1024 / 1024).toFixed(2)} MB` },
              { label: "Engine Mode", value: "Vector-Preserved" },
              { label: "Output Format", value: "Standard Master PDF" }
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
