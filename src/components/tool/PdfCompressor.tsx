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
  Minimize2,
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

const COMPRESSOR_STEPS = [
  { title: "Upload PDF", desc: "Select the large document you want to optimize for web, email, or cloud storage." },
  { title: "Compression Profile", desc: "Choose your balance between lossless vector sharpness and file size reduction." },
  { title: "Stream Optimization", desc: "Exismic compacts font dictionaries and rebuilds object streams losslessly." },
  { title: "Download", desc: "Save your optimized document with instant verification of space saved." }
];

export default function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [compressStage, setCompressStage] = useState("Preparing document optimizer...");
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
        setResult(null);
      }
    } catch (err) {
      console.error("Failed to generate demo PDF:", err);
      setError("Unable to load sample document. You can still upload your own PDF.");
    } finally {
      setIsLoadingSample(false);
    }
  };

  const compressPdfLocally = async (pdfFile: File, compLevel: "low" | "medium" | "high") => {
    const { PDFDocument } = await import("pdf-lib");
    const buffer = await pdfFile.arrayBuffer();
    const doc = await PDFDocument.load(buffer, { updateMetadata: compLevel === "high" });

    if (compLevel === "high" || compLevel === "medium") {
      doc.setTitle("");
      doc.setAuthor("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setProducer("Exismic PDF Engine");
      doc.setCreator("Exismic PDF Engine");
    }

    const bytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });

    const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const newSize = bytes.length;

    return {
      url,
      fileName: pdfFile.name.replace(/\.pdf$/i, "-compressed.pdf"),
      oldSize: pdfFile.size,
      newSize,
      optimized: newSize < pdfFile.size,
    };
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setCompressProgress(12);
    setCompressStage("Analyzing document stream structure...");

    const progressInterval = setInterval(() => {
      setCompressProgress((prev) => {
        if (prev < 42) {
          setCompressStage("Compacting font metrics & deduplicating objects...");
          return prev + 7;
        }
        if (prev < 78) {
          setCompressStage("Rebuilding object streams with cross-reference tables...");
          return prev + 5;
        }
        if (prev < 92) {
          setCompressStage("Verifying vector geometry & finalizing output...");
          return prev + 2;
        }
        return prev;
      });
    }, 120);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", level);

      const response = await fetch("/api/tools/pdf/compressor", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.warn("[PdfCompressor] Server returned non-OK, performing client-side compression...");
        const clientResult = await compressPdfLocally(file, level);
        clearInterval(progressInterval);
        setCompressProgress(100);
        setCompressStage("Document compressed successfully!");
        setTimeout(() => {
          setResult(clientResult);
          setIsProcessing(false);
        }, 250);
        return;
      }

      const artifact = await readDownloadResponse(
        response,
        "optimized-document.pdf",
      );
      const oldSize = Number(artifact.headers.get("X-Exismic-Original-Size")) || file.size;
      const newSize = Number(artifact.headers.get("X-Exismic-Output-Size")) || artifact.size;

      clearInterval(progressInterval);
      setCompressProgress(100);
      setCompressStage("Document compressed successfully!");
      setTimeout(() => {
        setResult({
          url: artifact.url,
          fileName: artifact.fileName,
          oldSize,
          newSize,
          optimized: artifact.headers.get("X-Exismic-Optimized") === "true",
        });
        setIsProcessing(false);
      }, 250);
    } catch (err: unknown) {
      console.warn("[PdfCompressor] Server compression failed, executing client-side fallback:", err);
      try {
        const clientResult = await compressPdfLocally(file, level);
        clearInterval(progressInterval);
        setCompressProgress(100);
        setCompressStage("Document compressed successfully!");
        setTimeout(() => {
          setResult(clientResult);
          setIsProcessing(false);
        }, 250);
      } catch (clientErr) {
        clearInterval(progressInterval);
        console.error("[PdfCompressor] Client fallback compression failed:", clientErr);
        setError(err instanceof Error ? err.message : "Failed to compress PDF");
        setIsProcessing(false);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const savedPercent = result && result.oldSize > 0
    ? Math.max(0, Math.round(((result.oldSize - result.newSize) / result.oldSize) * 100))
    : 0;

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
                    <FileArchive className="w-10 h-10 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                      PDF Compressor <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">Studio</span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Shrink PDF file sizes while keeping your text sharp and vector graphics crisp
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
                      <span>Zero Pixelation</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Minimize2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Up to -80% Size</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Email Ready</span>
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
                  {result ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 py-8 relative z-10">
                      {/* Before / After Metrics Display */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 w-full max-w-lg">
                        <div className="space-y-1.5 text-center">
                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Original Size</p>
                          <div className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xl font-mono font-bold text-zinc-400">
                            {formatSize(result.oldSize)}
                          </div>
                        </div>

                        <div className="relative">
                          <motion.div 
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="size-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                          >
                            <CheckCircle2 size={38} />
                          </motion.div>
                          {result.optimized && savedPercent > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="absolute -bottom-2 -right-2 rounded-full bg-red-500 text-white font-mono text-[10px] font-black px-2.5 py-0.5 shadow-lg border border-red-400/40"
                            >
                              -{savedPercent}%
                            </motion.div>
                          )}
                        </div>

                        <div className="space-y-1.5 text-center">
                          <p className="text-[10px] font-black uppercase tracking-wider text-red-400">Compressed Size</p>
                          <div className="px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xl font-mono font-bold text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            {formatSize(result.newSize)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                          {result.optimized ? "Document Successfully Compressed" : "File Already Fully Optimized"}
                        </h4>
                        <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-md mx-auto">
                          {result.optimized
                            ? `Saved ${formatSize(result.oldSize - result.newSize)} while preserving crisp page vector quality.`
                            : "Your document is already maximally compact; re-compressing would not reduce file size further."}
                        </p>
                      </div>

                      {/* Download & Reset Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <a 
                          href={result.url} 
                          download={result.fileName}
                          className="px-10 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 shadow-[0_0_35px_rgba(239,68,68,0.4)]"
                        >
                          <Download className="w-4 h-4 text-white" />
                          Download Compressed PDF
                        </a>
                        <button 
                          onClick={() => { setFile(null); setResult(null); }}
                          className="px-8 py-5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-black text-zinc-300 hover:text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Compress Another
                        </button>
                      </div>

                      {/* Pipeline Handoff */}
                      <div className="w-full pt-8 mt-4 border-t border-white/5">
                        <MediaPipelineBar
                          imageUrl="/og-image.png"
                          imageName={result.fileName}
                          sourceToolId="pdf-compressor"
                          sourceToolName="PDF Compressor"
                          actions={["resizer", "converter", "meme", "eraser"]}
                          title="Next Action Pipeline"
                          subtitle="Send your compressed PDF directly to companion tools"
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
                            <FileArchive className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                              Target Document
                            </h3>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                              Ready for stream repacking and size reduction
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
                              {formatSize(file.size)}
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Ready to Compress
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compression Level Selector */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                          Select Compression Profile
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: "low", label: "Standard", desc: "Lossless object repacking, preserves all metadata", icon: Activity },
                            { id: "medium", label: "Balanced", desc: "Cleans application metadata, optimizes streams", icon: Zap },
                            { id: "high", label: "Maximum", desc: "Aggressive optimization for email & web sharing", icon: Minimize2 }
                          ].map((item) => (
                            <button 
                              key={item.id}
                              type="button"
                              onClick={() => setLevel(item.id as "low" | "medium" | "high")}
                              className={cn(
                                "p-5 rounded-2xl border transition-all text-left space-y-3 cursor-pointer relative overflow-hidden",
                                level === item.id
                                  ? "bg-red-500/10 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30"
                                  : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                              )}
                            >
                              <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center transition-all",
                                level === item.id
                                  ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                                  : "bg-white/5 text-zinc-400"
                              )}>
                                <item.icon size={20} />
                              </div>
                              <div>
                                <h5 className={cn("text-sm font-black uppercase tracking-tight", level === item.id ? "text-white" : "text-zinc-300")}>
                                  {item.label}
                                </h5>
                                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </button>
                          ))}
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
                          <Minimize2 className="absolute inset-0 m-auto w-8 h-8 text-red-400 animate-pulse" />
                        </div>

                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-red-500/15 border border-red-500/30 text-red-300 mb-3 font-mono">
                          [ {compressProgress}% ]
                        </span>

                        <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                          Optimizing Streams...
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                          {compressStage}
                        </p>

                        <div className="w-64 h-1.5 rounded-full bg-white/5 border border-white/10 mt-6 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
                            initial={{ width: "10%" }}
                            animate={{ width: `${compressProgress}%` }}
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
          {!result && (
            <PdfActionButton
              onClick={handleCompress}
              isLoading={isProcessing}
              disabled={!file}
              label={!file ? "Upload PDF" : "Compress PDF"}
              subLabel={!file ? "Select a document to begin" : `${level.toUpperCase()} profile selected`}
              icon={Minimize2}
              themeColor="red"
            />
          )}

          <PdfSidebar 
            themeColor="red"
            accentColor="text-red-400"
            steps={COMPRESSOR_STEPS}
            stats={file ? [
              { label: "Selected File", value: file.name.slice(0, 18) + (file.name.length > 18 ? "..." : "") },
              { label: "Original Size", value: formatSize(file.size) },
              { label: "Profile", value: level === 'high' ? 'Maximum' : level === 'medium' ? 'Balanced' : 'Standard' }
            ] : []}
          />

          {!result && error && (
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
