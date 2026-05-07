"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Cropper, { Area, Point } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize, 
  Upload, 
  X, 
  Crop as CropIcon, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Smartphone, 
  Monitor, 
  Video, 
  Camera, 
  Share2,
  Image as ImageIcon,
  Lock,
  Unlock,
  Settings2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AspectRatio {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
}

const ASPECT_RATIOS: AspectRatio[] = [
  { label: "Free", value: undefined, icon: <Maximize className="w-4 h-4" /> },
  { label: "1:1", value: 1, icon: <Camera className="w-4 h-4" /> },
  { label: "9:16", value: 9 / 16, icon: <Smartphone className="w-4 h-4" /> },
  { label: "16:9", value: 16 / 9, icon: <Video className="w-4 h-4" /> },
];

export default function ImageResizerCropper() {
  const [image, setImage] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [originalSize, setOriginalSize] = useState("");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFilename(file.name);
      setOriginalSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          setTargetWidth(img.width);
          setTargetHeight(img.height);
        };
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: false,
  });

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
    setTargetWidth(croppedAreaPixels.width);
    setTargetHeight(croppedAreaPixels.height);
  }, []);

  const handleResizeWidth = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && croppedAreaPixels) {
      const ratio = croppedAreaPixels.width / croppedAreaPixels.height;
      setTargetHeight(Math.round(val / ratio));
    }
  };

  const handleResizeHeight = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && croppedAreaPixels) {
      const ratio = croppedAreaPixels.width / croppedAreaPixels.height;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async () => {
    if (!image || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const img = await createImage(image);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        targetWidth,
        targetHeight
      );

      const base64Image = canvas.toDataURL(`image/${format}`, format === "png" ? 1.0 : 0.92);
      setCroppedImage(base64Image);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setCroppedImage(null);
    setCroppedAreaPixels(null);
    setAspect(undefined);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center md:justify-start gap-3 mb-4"
            >
              <div className="p-2 bg-purple-600/20 rounded-xl">
                <Maximize className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-400">
                Resizer & Cropper
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium"
            >
              Pixel-perfect precision for your social media and web content.
            </motion.p>
          </div>
          
          <div className="flex gap-3 justify-center">
             <button 
               onClick={reset}
               className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all"
             >
                <RefreshCw className="w-5 h-5" />
             </button>
             {croppedImage ? (
                <a 
                  href={croppedImage} 
                  download={`lumora-${filename.split('.')[0]}.${format === 'jpeg' ? 'jpg' : format}`}
                  className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 transition-all active:scale-95"
                >
                   <Download className="w-4 h-4" /> Download Result
                </a>
             ) : (
                <button 
                  onClick={getCroppedImg}
                  disabled={!image || isProcessing}
                  className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-900 disabled:text-zinc-700 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 transition-all active:scale-95"
                >
                   {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CropIcon className="w-4 h-4" />}
                   Apply Changes
                </button>
             )}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                <Settings2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">Precision Tools</h3>
              </div>

              <AnimatePresence mode="wait">
                {!image ? (
                   <motion.div
                     key="upload"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     {...getRootProps()}
                     className={cn(
                       "border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer h-64 flex flex-col items-center justify-center",
                       isDragActive ? "border-purple-500 bg-purple-500/5" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                     )}
                   >
                      <input {...getInputProps()} />
                      <Upload className="w-10 h-10 text-gray-500 mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Upload Source Image</p>
                      <span className="text-[9px] text-zinc-600 mt-2">JPG, PNG, WEBP UP TO 10MB</span>
                   </motion.div>
                ) : (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                  >
                    {/* Aspect Ratio Presets */}
                    <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">Aspect Constraints</label>
                       <div className="grid grid-cols-2 gap-3">
                          {ASPECT_RATIOS.map((r) => (
                            <button
                              key={r.label}
                              onClick={() => setAspect(r.value)}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                aspect === r.value 
                                  ? "bg-purple-600 border-purple-500 text-white" 
                                  : "border-white/5 bg-white/5 text-gray-500 hover:bg-white/10"
                              )}
                            >
                               {r.icon}
                               {r.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Resize Inputs */}
                    <div className="pt-6 border-t border-white/5">
                       <div className="flex items-center justify-between mb-4">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] italic">Output Dimensions</label>
                          <button 
                            onClick={() => setLockAspect(!lockAspect)}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              lockAspect ? "text-purple-400 bg-purple-500/10" : "text-gray-600 bg-white/5"
                            )}
                          >
                             {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <span className="text-[9px] font-black text-zinc-600 uppercase">Width</span>
                             <input 
                               type="number" 
                               value={targetWidth}
                               onChange={(e) => handleResizeWidth(parseInt(e.target.value))}
                               className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-bold focus:border-purple-500 outline-none transition-all"
                             />
                          </div>
                          <div className="space-y-2">
                             <span className="text-[9px] font-black text-zinc-600 uppercase">Height</span>
                             <input 
                               type="number" 
                               value={targetHeight}
                               onChange={(e) => handleResizeHeight(parseInt(e.target.value))}
                               className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs font-bold focus:border-purple-500 outline-none transition-all"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Output Format */}
                    <div className="pt-6 border-t border-white/5">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">Export Logic</label>
                       <div className="grid grid-cols-3 gap-2">
                          {["png", "jpeg", "webp"].map((f) => (
                            <button
                              key={f}
                              onClick={() => setFormat(f as any)}
                              className={cn(
                                "py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                format === f 
                                  ? "bg-white text-black border-white" 
                                  : "border-white/5 bg-white/5 text-gray-500 hover:bg-white/10"
                              )}
                            >
                               {f}
                            </button>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pro Tip */}
            <div className="p-8 rounded-[2.5rem] bg-purple-500/5 border border-purple-500/10 flex gap-4">
               <Sparkles className="w-6 h-6 text-purple-400 shrink-0" />
               <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
                  High-fidelity resampling is active. We use bilinear interpolation to maintain pixel density during upscaling and downscaling.
               </p>
            </div>
          </div>

          {/* Canvas Column */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
            <div className="flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span>Interactive Viewport</span>
               </div>
               {image && <span>Source: {filename} • {originalSize}</span>}
            </div>

            <div className="relative group min-h-[600px] bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {!image ? (
                   <motion.div
                     key="placeholder"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex flex-col items-center gap-4 text-gray-700"
                   >
                      <ImageIcon className="w-20 h-20 opacity-10" />
                      <p className="uppercase tracking-[0.5em] text-[10px] font-black italic">Waiting for content</p>
                   </motion.div>
                ) : croppedImage ? (
                   <motion.div
                     key="result"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="relative p-12 text-center flex flex-col items-center gap-8"
                   >
                      <div className="relative group/res">
                        <img src={croppedImage} className="max-w-full max-h-[450px] rounded-2xl shadow-2xl border border-white/10" alt="Cropped" />
                        <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover/res:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                           <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold uppercase italic tracking-tighter">RENDER COMPLETE</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{targetWidth} x {targetHeight} PX</p>
                      </div>
                      <button 
                        onClick={() => setCroppedImage(null)}
                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                         Discard & Edit Again
                      </button>
                   </motion.div>
                ) : (
                   <motion.div
                     key="cropper"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="absolute inset-0"
                   >
                      <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        classes={{
                           containerClassName: "rounded-[3rem]",
                           cropAreaClassName: "border-2 border-purple-500 shadow-[0_0_0_9999em_rgba(0,0,0,0.7)]",
                        }}
                      />
                      {/* Zoom Control Overlay */}
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
                         <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Zoom</span>
                         <input 
                           type="range"
                           min={1}
                           max={3}
                           step={0.1}
                           value={zoom}
                           onChange={(e) => setZoom(parseFloat(e.target.value))}
                           className="w-32 accent-purple-500 h-1 bg-white/10 rounded-full appearance-none"
                         />
                         <span className="text-[10px] font-bold w-8 text-center">{zoom.toFixed(1)}x</span>
                      </div>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Platform Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 shrink-0">
                     <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest mb-2 italic">Mobile Fidelity</h5>
                     <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-medium">
                        Optimized for modern mobile displays with high PPI. Use 9:16 for maximum vertical engagement.
                     </p>
                  </div>
               </div>
               <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 shrink-0">
                     <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest mb-2 italic">Desktop Precision</h5>
                     <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-medium">
                        Perfect for large hero sections and banner ads. 16:9 ensures safe zones are respected on all screens.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Atmospheric Background */}
      <div className="fixed top-0 right-0 -z-10 w-[800px] h-[800px] bg-purple-600/[0.04] blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[700px] h-[700px] bg-cyan-600/[0.03] blur-[160px] rounded-full pointer-events-none animate-pulse" />
    </div>
  );
}
