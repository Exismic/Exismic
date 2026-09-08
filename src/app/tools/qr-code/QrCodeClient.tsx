"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { QRCodeCanvas } from "qrcode.react";
import { 
  QrCode, 
  Upload, 
  Download, 
  Copy, 
  Star, 
  Settings2, 
  Maximize, 
  Trash2, 
  CheckCircle2,
  Smartphone,
  Info,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorLevel = "L" | "M" | "Q" | "H";

export default function QRCodeGenerator() {
  const [value, setValue] = useState("https://exismic.in");
  const [qrColor, setQrColor] = useState("#a855f7");
  const [bgColor, setBgColor] = useState("#050505");
  const [logo, setLogo] = useState<string | null>(null);
  const [addLogo, setAddLogo] = useState(true);
  const [size, setSize] = useState(500);
  const [level, setLevel] = useState<ErrorLevel>("H");
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (logo) URL.revokeObjectURL(logo);
  }, [logo]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (logo) URL.revokeObjectURL(logo);
      setLogo(URL.createObjectURL(file));
      setAddLogo(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const downloadPNG = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `exismic-qr-${Date.now()}.png`;
      a.click();
    }
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          } catch (err) {
            console.error("Copy failed", err);
          }
        }
      });
    }
  };

  return (
    <div className="w-full space-y-8">
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                <Settings2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">Config Console</h3>
              </div>

              <div className="space-y-10">
                {/* Text / URL Input */}
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">Content Protocol</label>
                   <div className="relative group">
                      <input 
                        type="text" 
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 pl-14 text-sm font-bold focus:border-purple-500 outline-none transition-all shadow-inner group-hover:border-white/20"
                        placeholder="https://exismic.in"
                      />
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>

                {/* Color Configuration */}
                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">QR Matrix</label>
                      <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                        <input 
                          type="color" 
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                        />
                        <span className="text-[10px] font-bold uppercase text-gray-500">{qrColor}</span>
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">Environment</label>
                      <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                        <input 
                          type="color" 
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                        />
                        <span className="text-[10px] font-bold uppercase text-gray-500">{bgColor}</span>
                      </div>
                   </div>
                </div>

                {/* Logo Section */}
                <div className="pt-6 border-t border-white/5">
                   <div className="flex items-center justify-between mb-6">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] italic">Identity Overlay</label>
                      <button 
                        onClick={() => setAddLogo(!addLogo)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                          addLogo ? "bg-purple-500 text-white" : "bg-white/5 text-gray-500"
                        )}
                      >
                         {addLogo ? "Active" : "Disabled"}
                      </button>
                   </div>
                   
                   <div 
                     {...getRootProps()}
                     className={cn(
                       "relative h-40 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                       isDragActive ? "border-purple-500 bg-purple-500/5 scale-[0.98]" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                     )}
                   >
                     <input {...getInputProps()} />
                     {logo ? (
                       <div className="relative group">
                          <img src={logo} className="w-16 h-16 rounded-xl object-contain shadow-2xl" alt="Logo preview" />
                          <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Trash2 className="w-5 h-5 text-red-500" onClick={(e) => { e.stopPropagation(); setLogo(null); }} />
                          </div>
                       </div>
                     ) : (
                       <>
                         <Upload className="w-8 h-8 text-gray-600 mb-2 group-hover:text-purple-400 transition-colors" />
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Drop Brand Logo</p>
                       </>
                     )}
                   </div>
                </div>

                {/* Technical Specs */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">Resolution</label>
                      <select 
                        value={size}
                        onChange={(e) => setSize(parseInt(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest outline-none"
                      >
                         <option value={300}>300px (S)</option>
                         <option value={500}>500px (M)</option>
                         <option value={800}>800px (L)</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 italic">Redundancy</label>
                      <select 
                        value={level}
                        onChange={(e) => setLevel(e.target.value as ErrorLevel)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest outline-none"
                      >
                         <option value="L">Low (7%)</option>
                         <option value="M">Medium (15%)</option>
                         <option value="Q">Quartile (25%)</option>
                         <option value="H">High (30%)</option>
                      </select>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-8">
            <div className="flex items-center justify-between px-8">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Vector Engine Active</span>
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 transition-colors"
                  >
                     {isCopied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                     {isCopied ? "Copied Matrix" : "Copy PNG"}
                  </button>
               </div>
            </div>

            <div className="relative group">
              <motion.div 
                layout
                className="relative bg-white/5 border border-white/10 rounded-[3rem] p-12 md:p-24 flex flex-col items-center justify-center backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* Decorative Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                
                <motion.div
                  ref={canvasRef}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={`${value}-${qrColor}-${bgColor}-${logo}-${addLogo}`}
                  className="relative p-8 bg-white rounded-[2rem] shadow-2xl"
                >
                  <QRCodeCanvas
                    value={value}
                    size={size}
                    level={level}
                    bgColor={bgColor}
                    fgColor={qrColor}
                    marginSize={4}
                    style={{ width: "min(100%, 420px)", height: "auto" }}
                    imageSettings={addLogo && logo ? {
                      src: logo,
                      x: undefined,
                      y: undefined,
                      height: 60,
                      width: 60,
                      excavate: true,
                    } : undefined}
                  />
                </motion.div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button 
                    onClick={downloadPNG}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download PNG
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-black uppercase tracking-wider border border-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "Copied" : "Copy Image"}
                  </button>
                </div>

                <div className="mt-8 text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Live Scan Ready</p>
                   <p className="text-xs text-zinc-400">Point your smartphone camera to test scan immediately</p>
                </div>

                {/* Floating Glow */}
                <div 
                  className="absolute -bottom-1/4 -right-1/4 w-full h-full rounded-full blur-[120px] opacity-20 pointer-events-none"
                  style={{ backgroundColor: qrColor }}
                />
              </motion.div>
              
              {/* Feature Hint */}
              <div className="absolute -bottom-4 right-8 px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-full shadow-2xl flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-white" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white">Error Correction Level {level}</span>
              </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex gap-4 items-start">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                     <Info className="w-5 h-5" />
                  </div>
                  <div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest mb-2">Contrast Tips</h5>
                     <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        Always maintain strong contrast between QR pixels and the background. Dark codes on light surfaces provide the fastest camera detection.
                     </p>
                  </div>
               </div>
               <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex gap-4 items-start">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                     <Maximize className="w-5 h-5" />
                  </div>
                  <div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest mb-2">High Resolution</h5>
                     <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        Rendered with clean vector edges to ensure high-fidelity scanning on digital displays, brochures, business cards, and packaging.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </main>
    </div>
  );
}
