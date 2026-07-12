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
  Zap,
  Layers,
  Maximize2
} from "lucide-react";
import JSZip from "jszip";
import { PdfThumbnail } from "./pdf/PdfThumbnail";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";

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
}

declare const pdfjsLib: BrowserPdfJs;

const TO_IMAGE_STEPS = [
  { title: "Upload PDF", desc: "Select the document you want to convert into high-quality image assets." },
  { title: "Select Format", desc: "Choose between PNG (lossless) or JPG (optimized) for your output." },
  { title: "Render Pages", desc: "Your browser renders each page at standard or high resolution." },
  { title: "Download", desc: "Get your images as a single file or a clean ZIP archive." }
];

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ url: string; count: number; format: string; isZip: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [quality, setQuality] = useState<"high" | "standard">("high");
  const [isPdfJsLoaded, setIsPdfJsLoaded] = useState(false);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  useEffect(() => {
    const checkPdfJs = setInterval(() => {
      if (typeof pdfjsLib !== 'undefined') {
        setIsPdfJsLoaded(true);
        clearInterval(checkPdfJs);
      }
    }, 100);
    return () => clearInterval(checkPdfJs);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file || !isPdfJsLoaded) return;
    setIsProcessing(true);
    setProgress(5);
    setStatus("Initializing PDF Engine...");
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      if (numPages > 100) {
        throw new Error("PDF to Image supports up to 100 pages per conversion.");
      }
      const images: { name: string; blob: Blob }[] = [];

      for (let i = 1; i <= numPages; i++) {
        setStatus(`Rendering Page ${i} of ${numPages}...`);
        setProgress(Math.round(((i - 1) / numPages) * 90));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: quality === "high" ? 2.5 : 1.5 });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = Math.ceil(viewport.height);
        canvas.width = Math.ceil(viewport.width);

        if (!context) throw new Error("Could not create canvas context");

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (value) =>
              value ? resolve(value) : reject(new Error(`Page ${i} could not be encoded.`)),
            `image/${format === "jpg" ? "jpeg" : "png"}`,
            format === "jpg" ? 0.9 : undefined,
          );
        });
        images.push({
          name: `page_${i}.${format}`,
          blob,
        });
        canvas.width = 1;
        canvas.height = 1;
        setProgress(Math.round((i / numPages) * 90));
      }

      setStatus("Finalizing assets...");
      
      let finalUrl = "";
      let isZip = false;

      if (images.length === 1) {
        finalUrl = URL.createObjectURL(images[0].blob);
        isZip = false;
      } else {
        const zip = new JSZip();
        images.forEach(img => {
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
        count: numPages,
        format: format.toUpperCase(),
        isZip
      });
      setProgress(100);
      setStatus("Conversion Complete!");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to convert PDF.");
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
                {...(getRootProps() as unknown as import("framer-motion").HTMLMotionProps<"div">)}
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
                  <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <ImageIcon className={cn("w-10 h-10 transition-colors duration-500", isDragActive ? "text-accent-cyan" : "text-zinc-600 group-hover:text-white")} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">PDF to Image <span className="text-accent-cyan">Studio</span></h3>
                    <p className="text-zinc-500 font-medium text-lg uppercase tracking-widest text-[10px]">Convert documents to pixel-perfect visuals</p>
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
                   {result ? (
                      <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-12 py-12">
                         <div className="relative group/preview w-full max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-3xl">
                            {!result.isZip ? (
                               <img src={result.url} className="w-full h-full object-contain" alt="Preview" />
                            ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                                  <div className="p-10 rounded-full bg-accent-cyan/10 text-accent-cyan">
                                     <Layers size={64} />
                                  </div>
                                  <p className="text-xl font-black text-white italic uppercase tracking-tighter">{result.count} ASSETS READY</p>
                               </div>
                            )}
                            <div className="absolute inset-0 bg-accent-cyan/20 opacity-0 group-hover/preview:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                               <CheckCircle2 size={64} className="text-white drop-shadow-2xl" />
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            <h4 className="text-5xl font-black text-white uppercase italic tracking-tighter pr-4 px-4 -mx-4">RENDER SUCCESSFUL.</h4>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Optimized {result.format} assets at high resolution</p>
                         </div>

                         <div className="flex flex-col sm:flex-row items-center gap-6">
                            <a 
                              href={result.url} 
                              download={result.isZip ? "rendered_pages.zip" : `page_1.${format}`}
                              className="px-14 py-7 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-3xl"
                            >
                              <Download className="w-5 h-5" />
                              {result.isZip ? "Download Assets (ZIP)" : "Download Image"}
                            </a>
                            <button 
                              onClick={() => { setFile(null); setResult(null); }}
                              className="px-10 py-7 rounded-2xl glass-dark border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-all"
                            >
                              Render New
                            </button>
                         </div>
                      </div>
                   ) : (
                     <div className="space-y-12">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                                 <div className="p-2 bg-accent-cyan/10 rounded-xl"><Maximize2 className="w-5 h-5 text-accent-cyan" /></div>
                                 Visual Scanning
                              </h3>
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Rasterization engine online</p>
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
                                 <div className="flex items-center gap-2 text-accent-cyan text-[10px] font-black uppercase tracking-widest italic">
                                    <Zap size={10} className="animate-pulse" />
                                    Source Verified
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Target Format</h4>
                              <div className="flex gap-4">
                                 {(["png", "jpg"] as const).map((f) => (
                                   <button 
                                     key={f}
                                     onClick={() => setFormat(f)}
                                     className={cn(
                                       "flex-1 py-5 rounded-2xl border font-black uppercase tracking-widest transition-all",
                                       format === f ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan shadow-lg" : "bg-white/5 border-white/5 text-zinc-600 hover:border-white/10"
                                     )}
                                   >
                                      {f}
                                   </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-6">
                              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Render Quality</h4>
                              <div className="flex gap-4">
                                 {(["high", "standard"] as const).map((q) => (
                                   <button 
                                     key={q}
                                     onClick={() => setQuality(q)}
                                     className={cn(
                                       "flex-1 py-5 rounded-2xl border font-black uppercase tracking-widest transition-all",
                                       quality === q ? "bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan shadow-lg" : "bg-white/5 border-white/5 text-zinc-600 hover:border-white/10"
                                     )}
                                   >
                                      {q}
                                   </button>
                                 ))}
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
                             <ImageIcon className="absolute inset-0 m-auto w-8 h-8 text-accent-cyan animate-pulse" />
                          </div>
                          <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">{status}</h4>
                          <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-accent-cyan shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300"
                               style={{ width: `${progress}%` }}
                             />
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-6 font-black uppercase tracking-[0.5em]">Rasterizing Vector Paths</p>
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
           {!result && (
             <PdfActionButton
               onClick={handleConvert}
               isLoading={isProcessing}
               disabled={!file}
               label={!file ? "Upload PDF" : `Convert to ${format.toUpperCase()}`}
               subLabel={!file ? "Select a document to begin" : quality === 'high' ? "High resolution (180 DPI)" : "Standard resolution (108 DPI)"}
               icon={ImageIcon}
             />
           )}

           <PdfSidebar 
             accentColor="text-accent-cyan"
             steps={TO_IMAGE_STEPS}
             stats={file ? [
               { label: "Target Format", value: format.toUpperCase() },
               { label: "Resolution", value: quality === 'high' ? '180 DPI' : '108 DPI' },
               { label: "Rendering", value: "Client-Side" }
             ] : []}
           />

           {!result && error && (
             <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
               <div className="space-y-1">
                  <p className="uppercase tracking-[0.2em]">Conversion Failed</p>
                  <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
