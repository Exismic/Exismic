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
  Search,
  RotateCcw,
  Upload,
  Lock,
  Layers,
  Sparkles as SparklesProhibited,
  Loader2
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { MediaPipelineBar } from "./MediaPipelineBar";
import { detectOcrCapabilities, processOcrLocally } from "@/lib/client-ocr";
import { generateDemoPdfs } from "@/lib/pdf-demo-generator";

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
  { title: "Upload Source", desc: "Select a PDF document or scanned image containing text you want to extract." },
  { title: "Select Language", desc: "Choose the language of the text in your scan." },
  { title: "Extract Characters", desc: "Recognize visible text in the scan, then review it for errors." },
  { title: "Copy & Export", desc: "Copy extracted text to your clipboard with 1 click or download a clean .TXT file." }
];

export default function OcrExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
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

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { 
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"]
    },
    multiple: false,
    noClick: false,
  });

  const handleLoadSample = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingSample(true);
    setError(null);

    try {
      const demoFiles = await generateDemoPdfs();
      if (demoFiles[2]) {
        // Client_Invoice_INV-8492.pdf
        const sampleInvoice = demoFiles[2];
        setFile(sampleInvoice);
        setExtractedText("");
        setPreviewUrl(null);
      }
    } catch (err) {
      console.error("Failed to generate demo PDF:", err);
      setError("Unable to load sample document. You can still upload your own file.");
    } finally {
      setIsLoadingSample(false);
    }
  };

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
    link.download = `${file?.name.replace(/\.[^/.]+$/, "") || "exismic-ocr"}-text.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const runOCR = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(5);
    setStatus("Initializing optical recognition engine...");
    setError(null);

    const isCapable = detectOcrCapabilities(file);
    let resultText: string | null = null;

    if (isCapable) {
      try {
        resultText = await processOcrLocally(
          file,
          language,
          (percent, statusMsg) => {
            setProgress(percent);
            setStatus(statusMsg);
          },
          25000
        );
      } catch (clientErr) {
        console.warn("[OCR Tool] Local client worker OCR timed out, trying server endpoint:", clientErr);
        resultText = null;
      }
    }

    if (!resultText) {
      try {
        setStatus("Processing high-accuracy text recognition...");
        setProgress(35);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", language);

        const response = await fetch("/api/tools/ocr/extract", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Text recognition failed.");
        }

        resultText = data.text;
        setProgress(100);
      } catch (serverErr: unknown) {
        console.error("[OCR Tool] Cloud OCR fallback failed:", serverErr);
        setError(serverErr instanceof Error ? serverErr.message : "Text recognition failed. Ensure the document contains visible text.");
      }
    }

    if (resultText) {
      setExtractedText(resultText);
      setStatus("Extraction Complete!");
      setProgress(100);
    }

    setIsProcessing(false);
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

                {/* Ambient Radial Glow */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(239,68,68,0.12)_0%,transparent_65%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />

                <div className="relative z-10 flex flex-col items-center text-center max-w-xl space-y-7">
                  {/* Glowing Ruby Squircle Icon */}
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-red-950/40 border border-red-500/35 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.25)] group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                    <ScanText className="w-10 h-10 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                      OCR Text Extractor <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">Studio</span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Scan invoices, books, receipts, and PDF documents to extract editable text in seconds
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
                      Select Document or Image
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
                          Load Sample Invoice
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
                      <span>PDF & Image OCR</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <ScanText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Multi-Language</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>1-Click Copy</span>
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

                  {/* Result Success State: Extracted Text Editor */}
                  {extractedText ? (
                    <div className="space-y-6 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                              Extracted Text Output
                            </h3>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                              Ready to copy to your clipboard or download as text
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            {isCopied ? <ClipboardCheck size={16} /> : <Copy size={16} />}
                            {isCopied ? "Copied!" : "Copy Text"}
                          </button>
                          <button
                            type="button"
                            onClick={handleDownload}
                            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-black text-xs uppercase tracking-wider hover:bg-white/[0.08] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Download size={16} />
                            Download .TXT
                          </button>
                        </div>
                      </div>

                      {/* Text Display Box */}
                      <div className="relative rounded-2xl border border-red-500/30 bg-[#070508]/90 overflow-hidden shadow-inner">
                        <textarea 
                          readOnly
                          className="w-full min-h-[420px] bg-transparent p-6 text-zinc-200 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-none"
                          value={extractedText}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button 
                          onClick={() => { setFile(null); setExtractedText(""); }}
                          className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-black text-zinc-300 hover:text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Scan Another Document
                        </button>

                        <span className="text-[11px] text-zinc-500 font-mono">
                          {extractedText.length} characters extracted
                        </span>
                      </div>

                      {/* Pipeline Handoff */}
                      <div className="w-full pt-6 mt-4 border-t border-white/5">
                        <MediaPipelineBar
                          imageUrl="/og-image.png"
                          imageName="extracted-text.txt"
                          sourceToolId="pdf-ocr"
                          sourceToolName="OCR Text Extractor"
                          actions={["compressor", "resizer", "converter", "meme"]}
                          title="Next Action Pipeline"
                          subtitle="Take your extracted documents into companion tools"
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
                            <ScanText className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                              Active Document
                            </h3>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                              Ready for optical character recognition
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
                        {previewUrl ? (
                          <div className="w-24 h-32 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                            <img src={previewUrl} alt="Document" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-24 h-32 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                            <FileText size={38} />
                          </div>
                        )}
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
                              Ready to Scan
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recognition Language Selector */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                          Select Primary Document Language
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { id: "eng", name: "English" },
                            { id: "spa", name: "Spanish" },
                            { id: "fra", name: "French" },
                            { id: "deu", name: "German" }
                          ].map((lang) => (
                            <button 
                              key={lang.id}
                              type="button"
                              onClick={() => setLanguage(lang.id)}
                              className={cn(
                                "py-3.5 px-3 rounded-xl border font-black uppercase tracking-wider text-xs transition-all cursor-pointer",
                                language === lang.id
                                  ? "bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                  : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10"
                              )}
                            >
                              {lang.name}
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
                          <ScanText className="absolute inset-0 m-auto w-8 h-8 text-red-400 animate-pulse" />
                        </div>

                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-red-500/15 border border-red-500/30 text-red-300 mb-3 font-mono">
                          [ {progress}% ]
                        </span>

                        <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                          Recognizing Text...
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
          {!extractedText && (
            <PdfActionButton
              onClick={runOCR}
              isLoading={isProcessing}
              disabled={!file}
              label={!file ? "Upload Document" : "Extract Text"}
              subLabel={!file ? "Select a document to begin" : `${language.toUpperCase()} language model active`}
              icon={ScanText}
              themeColor="red"
            />
          )}

          <PdfSidebar 
            themeColor="red"
            accentColor="text-red-400"
            steps={OCR_STEPS}
            stats={file ? [
              { label: "Target Document", value: file.name.slice(0, 18) + (file.name.length > 18 ? "..." : "") },
              { label: "Language", value: language.toUpperCase() },
              { label: "Engine", value: "Tesseract OCR" }
            ] : []}
          />

          {!extractedText && error && (
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
