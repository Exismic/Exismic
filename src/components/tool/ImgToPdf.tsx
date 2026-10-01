"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Download, 
  FileText,
  ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  GripVertical, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Layout, 
  RotateCcw,
  Upload,
  Lock,
  Layers,
  Zap,
  Plus,
  Loader2
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
import { MediaPipelineBar } from "./MediaPipelineBar";
import { readDownloadResponse } from "@/lib/pdf-client";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

const TO_PDF_STEPS = [
  { title: "Upload Images", desc: "Select the photos, slides, or graphics you want to compile into a PDF." },
  { title: "Arrange Order", desc: "Drag and drop or use the arrow controls to set your exact page sequence." },
  { title: "Select Layout", desc: "Choose between 'Auto' (matches image dimensions) or 'A4 Document'." },
  { title: "Compile & Download", desc: "Exismic embeds each image into vector-sharp pages with zero quality loss." }
];

export default function ImgToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileStage, setCompileStage] = useState("Preparing image embedding engine...");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("compiled-images.pdf");
  const [compiledCount, setCompiledCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<"auto" | "a4">("auto");
  const imagesRef = useRef<ImageFile[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => {
      const combined = [...prev, ...newImages];
      if (combined.length > 40) {
        newImages
          .slice(Math.max(0, 40 - prev.length))
          .forEach((image) => URL.revokeObjectURL(image.preview));
        setError("You can convert up to 40 images at once.");
      }
      return combined.slice(0, 40);
    });
    setResultUrl(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/avif": [".avif"],
      "image/heic": [".heic", ".heif"],
    },
    multiple: true,
    noClick: false,
  });

  const handleLoadSamples = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingSamples(true);
    setError(null);

    try {
      const titles = [
        { title: "Executive Strategy Deck", subtitle: "Slide 1: Business Growth Overview", color: "#ef4444" },
        { title: "Financial KPI Breakdown", subtitle: "Slide 2: Regional Performance & Net Margins", color: "#f43f5e" },
        { title: "2026 Delivery Roadmap", subtitle: "Slide 3: Systems Architecture Milestones", color: "#dc2626" },
      ];

      const sampleFiles: File[] = [];
      for (let i = 0; i < titles.length; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 1200, 800);
          grad.addColorStop(0, "#090a12");
          grad.addColorStop(1, "#180d12");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1200, 800);

          ctx.fillStyle = titles[i].color;
          ctx.fillRect(0, 0, 1200, 14);

          ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
          ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(80, 90, 1040, 620, 20);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 44px sans-serif";
          ctx.fillText(titles[i].title, 140, 230);

          ctx.fillStyle = "#f87171";
          ctx.font = "600 24px sans-serif";
          ctx.fillText(titles[i].subtitle, 140, 290);

          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.font = "18px sans-serif";
          ctx.fillText("High-Resolution Vector Slide Asset  •  Compiled by Exismic Studio", 140, 600);

          const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
          sampleFiles.push(new File([blob], `Slide_0${i + 1}_Deck.png`, { type: "image/png" }));
        }
      }

      const newImages = sampleFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));

      setImages(newImages);
      setResultUrl(null);
    } catch (err) {
      console.error("Failed to generate sample images:", err);
      setError("Unable to generate sample images. You can still upload your own files.");
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResultUrl(null);
    setError(null);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const compileImagesLocally = async (imageFiles: File[], layout: "auto" | "a4") => {
    const { PDFDocument } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.create();

    for (const imgFile of imageFiles) {
      const bytes = await imgFile.arrayBuffer();
      let embeddedImg;

      if (imgFile.type === "image/png") {
        embeddedImg = await pdfDoc.embedPng(bytes);
      } else {
        try {
          embeddedImg = await pdfDoc.embedJpg(bytes);
        } catch {
          const img = new Image();
          const url = URL.createObjectURL(imgFile);
          img.src = url;
          await new Promise((res) => { img.onload = res; });
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const pngBlob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/png"));
          const pngBytes = await pngBlob.arrayBuffer();
          embeddedImg = await pdfDoc.embedPng(pngBytes);
          URL.revokeObjectURL(url);
        }
      }

      const imgWidth = embeddedImg.width;
      const imgHeight = embeddedImg.height;

      if (layout === "a4") {
        const page = pdfDoc.addPage([595.28, 841.89]);
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const scale = Math.min((pageWidth - 48) / imgWidth, (pageHeight - 48) / imgHeight);
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;
        page.drawImage(embeddedImg, {
          x: (pageWidth - drawWidth) / 2,
          y: (pageHeight - drawHeight) / 2,
          width: drawWidth,
          height: drawHeight,
        });
      } else {
        const page = pdfDoc.addPage([imgWidth, imgHeight]);
        page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        });
      }
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return { url, fileName: "compiled-images.pdf", count: imageFiles.length };
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setCompileProgress(15);
    setCompileStage("Reading image byte streams...");

    const progressInterval = setInterval(() => {
      setCompileProgress((prev) => {
        if (prev < 45) {
          setCompileStage("Encoding high-resolution image pages...");
          return prev + 8;
        }
        if (prev < 80) {
          setCompileStage("Applying page layout geometry...");
          return prev + 5;
        }
        if (prev < 92) {
          setCompileStage("Finalizing unified PDF document...");
          return prev + 2;
        }
        return prev;
      });
    }, 120);

    try {
      const formData = new FormData();
      images.forEach(img => formData.append("files", img.file));
      formData.append("pageSize", pageSize);

      const response = await fetch("/api/tools/pdf/img-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.warn("[ImgToPdf] Server returned non-OK, performing client-side compilation...");
        const clientResult = await compileImagesLocally(images.map(img => img.file), pageSize);
        clearInterval(progressInterval);
        setCompileProgress(100);
        setCompileStage("PDF compiled successfully!");
        setTimeout(() => {
          setResultUrl(clientResult.url);
          setResultFileName(clientResult.fileName);
          setCompiledCount(clientResult.count);
          setIsProcessing(false);
        }, 250);
        return;
      }

      const artifact = await readDownloadResponse(
        response,
        "compiled-images.pdf",
      );

      clearInterval(progressInterval);
      setCompileProgress(100);
      setCompileStage("PDF compiled successfully!");
      setTimeout(() => {
        setResultUrl(artifact.url);
        setResultFileName(artifact.fileName);
        setCompiledCount(images.length);
        setIsProcessing(false);
      }, 250);
    } catch (err: unknown) {
      console.warn("[ImgToPdf] Server request failed, performing client-side fallback:", err);
      try {
        const clientResult = await compileImagesLocally(images.map(img => img.file), pageSize);
        clearInterval(progressInterval);
        setCompileProgress(100);
        setCompileStage("PDF compiled successfully!");
        setTimeout(() => {
          setResultUrl(clientResult.url);
          setResultFileName(clientResult.fileName);
          setCompiledCount(clientResult.count);
          setIsProcessing(false);
        }, 250);
      } catch (clientErr) {
        clearInterval(progressInterval);
        console.error("[ImgToPdf] Client fallback compile failed:", clientErr);
        setError(err instanceof Error ? err.message : "Failed to compile PDF from images.");
        setIsProcessing(false);
      }
    }
  };

  const totalSize = images.reduce((acc, curr) => acc + curr.file.size, 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Area */}
        <div className="xl:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {images.length === 0 ? (
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
                    <ImageIcon className="w-10 h-10 text-red-400 group-hover:text-red-300 transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                      Image to PDF <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">Studio</span>
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Convert photos, presentations, or scanned receipts into a clean, unified PDF document
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
                      Select Images
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
                          Load Sample Images
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
                      <span>Zero Quality Loss</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Layout className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Auto & A4 Fits</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Instant Compile</span>
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
                          {compiledCount || images.length} Images Compiled into PDF
                        </h4>
                        <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-md mx-auto">
                          All image assets have been embedded into a consolidated PDF document with pristine clarity.
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
                          Download Compiled PDF
                        </a>
                        <button 
                          onClick={clearAll}
                          className="px-8 py-5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-black text-zinc-300 hover:text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Compile Another Set
                        </button>
                      </div>

                      {/* Pipeline Handoff */}
                      <div className="w-full pt-8 mt-4 border-t border-white/5">
                        <MediaPipelineBar
                          imageUrl={images[0]?.preview || "/og-image.png"}
                          imageName={resultFileName}
                          sourceToolId="pdf-img-to-pdf"
                          sourceToolName="Image to PDF"
                          actions={["compressor", "resizer", "converter", "meme"]}
                          title="Next Action Pipeline"
                          subtitle="Send your compiled PDF directly into companion tools"
                          accentColor="red"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 relative z-10">
                      {/* Active Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                            <ImageIcon className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase flex items-center gap-2.5">
                              Image Sequence
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 font-mono">
                                {images.length} {images.length === 1 ? 'image' : 'images'}
                              </span>
                            </h3>
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                              Drag & drop or use arrows to adjust the PDF page sequence
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button 
                            type="button"
                            onClick={openFileDialog}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-red-400" />
                            Add More
                          </button>
                          <button 
                            type="button"
                            onClick={clearAll}
                            className="px-3 py-2 bg-white/[0.03] border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-zinc-400 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Clear all images"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Layout Selection */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-white">Page Layout Sizing</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">Select how each image is framed inside the PDF</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPageSize("auto")}
                            className={cn(
                              "px-3.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                              pageSize === "auto"
                                ? "bg-red-500/15 border-red-500/40 text-red-300"
                                : "bg-white/[0.02] border-white/5 text-zinc-400"
                            )}
                          >
                            Auto (Match Image)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPageSize("a4")}
                            className={cn(
                              "px-3.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                              pageSize === "a4"
                                ? "bg-red-500/15 border-red-500/40 text-red-300"
                                : "bg-white/[0.02] border-white/5 text-zinc-400"
                            )}
                          >
                            A4 Document
                          </button>
                        </div>
                      </div>

                      {/* Images List */}
                      <div className="space-y-3 max-h-[540px] overflow-y-auto pr-2 no-scrollbar">
                        {images.map((img, index) => (
                          <motion.div 
                            key={img.id}
                            layout
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group flex items-center gap-4 sm:gap-6 p-3.5 sm:p-4 bg-gradient-to-r from-zinc-900/80 to-[#0e0a10]/80 border border-white/5 rounded-2xl hover:border-red-500/30 hover:bg-zinc-900 transition-all relative overflow-hidden"
                          >
                            <div className="flex flex-col items-center gap-0.5 shrink-0 z-10">
                              <button 
                                type="button"
                                onClick={() => moveImage(index, 'up')} 
                                disabled={index === 0} 
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-0 transition-colors cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <GripVertical className="w-4 h-4 text-zinc-700" />
                              <button 
                                type="button"
                                onClick={() => moveImage(index, 'down')} 
                                disabled={index === images.length - 1} 
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-0 transition-colors cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>

                            <span className="flex size-7 items-center justify-center rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-[11px] font-black shrink-0">
                              #{index + 1}
                            </span>

                            <div className="size-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                              <img src={img.preview} alt="Thumbnail" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 min-w-0 z-10">
                              <h4 className="text-sm font-bold text-white truncate">
                                {img.file.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-mono font-bold text-zinc-400 border border-white/5">
                                  {(img.file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                  Page {index + 1}
                                </span>
                              </div>
                            </div>

                            <button 
                              type="button"
                              onClick={() => removeImage(img.id)}
                              className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
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
                          [ {compileProgress}% ]
                        </span>

                        <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                          Compiling PDF...
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium max-w-sm mx-auto leading-relaxed">
                          {compileStage}
                        </p>

                        <div className="w-64 h-1.5 rounded-full bg-white/5 border border-white/10 mt-6 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
                            initial={{ width: "10%" }}
                            animate={{ width: `${compileProgress}%` }}
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
              disabled={images.length === 0}
              label={images.length === 0 ? "Upload Images" : `Compile ${images.length} Images`}
              subLabel={images.length === 0 ? "Select photos to begin" : `${pageSize.toUpperCase()} layout • ${(totalSize / 1024 / 1024).toFixed(2)} MB`}
              icon={FileText}
              themeColor="red"
            />
          )}

          <PdfSidebar 
            themeColor="red"
            accentColor="text-red-400"
            steps={TO_PDF_STEPS}
            stats={images.length > 0 ? [
              { label: "Selected Images", value: images.length },
              { label: "Layout Mode", value: pageSize === "auto" ? "Original Fit" : "A4 Standard" },
              { label: "Total Size", value: `${(totalSize / 1024 / 1024).toFixed(2)} MB` }
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
