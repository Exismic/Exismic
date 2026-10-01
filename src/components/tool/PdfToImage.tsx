"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Download, 
  X, 
  ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileText,
  RotateCcw,
  Upload,
  Lock,
  Zap,
  Sparkles as SparklesProhibited,
  Loader2
} from "lucide-react";
import JSZip from "jszip";
import { PdfThumbnail } from "./pdf/PdfThumbnail";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { MediaPipelineBar } from "./MediaPipelineBar";
import { generateDemoPdfs } from "@/lib/pdf-demo-generator";

interface BrowserPdfViewport {
  height: number;
  width: number;
}

interface BrowserPdfPage {
  getViewport(options: { scale: number }): BrowserPdfViewport;
  render(options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: BrowserPdfViewport;
  }): { promise: Promise<void> };
}

interface BrowserPdfDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<BrowserPdfPage>;
}

interface BrowserPdfJs {
  getDocument(options: { data: ArrayBuffer }): {
    promise: Promise<BrowserPdfDocument>;
  };
  GlobalWorkerOptions?: {
    workerSrc: string;
  };
}

declare const window: Window & { pdfjsLib?: BrowserPdfJs };

const TO_IMAGE_STEPS = [
  { title: "Upload PDF", desc: "Select the document you want to convert into high-resolution image files." },
  { title: "Choose Format", desc: "Select PNG for lossless vector graphics or JPG for compact web sharing." },
  { title: "Resolution", desc: "Render at crisp 2x Ultra HD or standard 1x resolution directly in your browser." },
  { title: "Download", desc: "Save individual image files or a clean ZIP folder with all pages included." }
];

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ url: string; count: number; format: string; isZip: boolean; previewUrl?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [quality, setQuality] = useState<"high" | "standard">("high");
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
      if (result?.previewUrl && result.previewUrl !== result.url) URL.revokeObjectURL(result.previewUrl);
    };
  }, [result?.url, result?.previewUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (typeof window.pdfjsLib !== "undefined") {
      setIsPdfJsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="pdf.min.js"]');
    if (existingScript) {
      const interval = setInterval(() => {
        if (typeof window.pdfjsLib !== "undefined") {
          setIsPdfJsLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        if (window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        setIsPdfJsLoaded(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

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

  const handleConvert = async () => {
    if (!file) return;
    if (!isPdfJsLoaded || !window.pdfjsLib) {
      setError("PDF engine is initializing in your browser. Please wait 2 seconds and try again.");
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatus("Reading document pages...");
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      if (numPages > 100) {
        throw new Error("PDF to Image supports up to 100 pages per conversion.");
      }

      const images: { name: string; blob: Blob; url: string }[] = [];

      for (let i = 1; i <= numPages; i++) {
        setStatus(`Rendering page ${i} of ${numPages} (${quality === "high" ? "2x Ultra HD" : "Standard"})...`);
        setProgress(Math.round(((i - 1) / numPages) * 90));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: quality === "high" ? 2.0 : 1.25 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = Math.ceil(viewport.height);
        canvas.width = Math.ceil(viewport.width);

        if (!context) throw new Error("Could not initialize browser drawing canvas");

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (value) => (value ? resolve(value) : reject(new Error(`Page ${i} could not be rendered.`))),
            `image/${format === "jpg" ? "jpeg" : "png"}`,
            format === "jpg" ? 0.92 : undefined,
          );
        });

        const url = URL.createObjectURL(blob);
        images.push({
          name: `page_${i}.${format}`,
          blob,
          url,
        });

        canvas.width = 1;
        canvas.height = 1;
        setProgress(Math.round((i / numPages) * 90));
      }

      setStatus("Packaging rendered assets...");

      let finalUrl = "";
      let isZip = false;

      if (images.length === 1) {
        finalUrl = images[0].url;
        isZip = false;
      } else {
        const zip = new JSZip();
        images.forEach((img) => {
          zip.file(img.name, img.blob);
        });
        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });
        finalUrl = URL.createObjectURL(zipBlob);
        isZip = true;
      }

      setResult({
        url: finalUrl,
        previewUrl: images[0]?.url,
        count: numPages,
        format: format.toUpperCase(),
        isZip,
      });

      setProgress(100);
      setStatus("Conversion Complete!");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to convert PDF to images.");
    } finally {
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

                {/* Ambient Glow */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(239,68,68,0.12)_0%,transparent_65%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />

                <div className="relative z-10 flex flex-col items-center text-center max-w-xl space-y-7">
                  {/* Glowing Ruby Icon */}
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-red-950/40 border border-red-500/35 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.25)] group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                    <ImageIcon className="w-10 h-10 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                      PDF to Image <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">Studio</span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Convert PDF pages into pixel-perfect PNG or JPG images at crystal-clear resolution
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
                      <span>100% In-Browser</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Layers className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>2x Ultra HD</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <ImageIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>PNG & JPG</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Fast Render</span>
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
                  {result ? (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 py-8 relative z-10">
                      {/* Image Preview Box */}
                      {result.previewUrl && (
                        <div className="w-48 h-64 rounded-2xl overflow-hidden bg-black/40 border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.25)] relative p-2">
                          <img 
                            src={result.previewUrl} 
                            alt="Rendered page preview" 
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                          {result.count} {result.count === 1 ? "Page" : "Pages"} Converted to {result.format}
                        </h4>
                        <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-md mx-auto">
                          {result.isZip
                            ? "All pages have been compiled into a high-resolution ZIP folder."
                            : "Your page has been rendered into a standalone image."}
                        </p>
                      </div>

                      {/* Download & Reset Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                        <a 
                          href={result.url} 
                          download={result.isZip ? `${file.name.replace(/\.pdf$/i, "")}_images.zip` : `${file.name.replace(/\.pdf$/i, "")}_page1.${format}`}
                          className="px-10 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 shadow-[0_0_35px_rgba(239,68,68,0.4)]"
                        >
                          <Download className="w-4 h-4 text-white" />
                          {result.isZip ? "Download ZIP Folder" : `Download ${result.format} Image`}
                        </a>
                        <button 
                          onClick={() => { setFile(null); setResult(null); }}
                          className="px-8 py-5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-black text-zinc-300 hover:text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Convert Another
                        </button>
                      </div>

                      {/* Pipeline Handoff */}
                      <div className="w-full pt-8 mt-4 border-t border-white/5">
                        <MediaPipelineBar
                          imageUrl={result.previewUrl || "/og-image.png"}
                          imageName={`${file.name.replace(/\.pdf$/i, "")}_page1.${format}`}
                          sourceToolId="pdf-to-img"
                          sourceToolName="PDF to Image"
                          actions={["compressor", "resizer", "converter", "meme"]}
                          title="Next Action Pipeline"
                          subtitle="Take your converted page images directly into companion tools"
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
                            <ImageIcon className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                              Active Document
                            </h3>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                              Ready for in-browser page rendering
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
                              Ready to Render
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Configuration Controls: Format & Resolution */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Format Selection */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                            Image Format
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setFormat("png")}
                              className={cn(
                                "py-4 px-4 rounded-xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                                format === "png"
                                  ? "bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                  : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10"
                              )}
                            >
                              PNG (Lossless)
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormat("jpg")}
                              className={cn(
                                "py-4 px-4 rounded-xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                                format === "jpg"
                                  ? "bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                  : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10"
                              )}
                            >
                              JPG (Compact)
                            </button>
                          </div>
                        </div>

                        {/* Quality Selection */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                            Render Quality
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setQuality("high")}
                              className={cn(
                                "py-4 px-4 rounded-xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                                quality === "high"
                                  ? "bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                  : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10"
                              )}
                            >
                              2x Ultra HD
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuality("standard")}
                              className={cn(
                                "py-4 px-4 rounded-xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                                quality === "standard"
                                  ? "bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                  : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10"
                              )}
                            >
                              1x Standard
                            </button>
                          </div>
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
                          <ImageIcon className="absolute inset-0 m-auto w-8 h-8 text-red-400 animate-pulse" />
                        </div>

                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-red-500/15 border border-red-500/30 text-red-300 mb-3 font-mono">
                          [ {progress}% ]
                        </span>

                        <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                          Rendering Pages...
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                          {status}
                        </p>

                        <div className="w-64 h-1.5 rounded-full bg-white/5 border border-white/10 mt-6 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
                            initial={{ width: "10%" }}
                            animate={{ width: `${progress}%` }}
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
              onClick={handleConvert}
              isLoading={isProcessing}
              disabled={!file}
              label={!file ? "Upload PDF" : `Convert to ${format.toUpperCase()}`}
              subLabel={!file ? "Select a document to begin" : `${quality === "high" ? "2x Ultra HD" : "Standard 1x"} scale`}
              icon={ImageIcon}
              themeColor="red"
            />
          )}

          <PdfSidebar 
            themeColor="red"
            accentColor="text-red-400"
            steps={TO_IMAGE_STEPS}
            stats={file ? [
              { label: "Target Document", value: file.name.slice(0, 18) + (file.name.length > 18 ? "..." : "") },
              { label: "Format", value: format.toUpperCase() },
              { label: "Resolution", value: quality === "high" ? "2x Ultra HD" : "Standard 1x" }
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
