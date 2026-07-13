"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Laugh, 
  Download, 
  Star, 
  Layout, 
  Palette, 
  RotateCcw, 
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

const MEME_TEMPLATES: MemeTemplate[] = [
  { id: "drake", name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg" },
  { id: "distracted", name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { id: "change-mind", name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
  { id: "two-buttons", name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
  { id: "batman", name: "Batman Slapping Robin", url: "https://i.imgflip.com/9ehk.jpg" },
  { id: "spongebob", name: "Mocking Spongebob", url: "https://i.imgflip.com/1otk96.jpg" },
  { id: "harold", name: "Hide the Pain Harold", url: "https://i.imgflip.com/gk5el.jpg" },
  { id: "grumpy", name: "Grumpy Cat", url: "https://i.imgflip.com/8p0a.jpg" },
  { id: "woman-yelling-cat", name: "Woman Yelling at Cat", url: "https://i.imgflip.com/345v97.jpg" },
  { id: "bern-sanders", name: "Bernie Sanders I Am Once Again", url: "https://i.imgflip.com/3oevdk.jpg" },
  { id: "doge", name: "Buff Doge vs Cheems", url: "https://i.imgflip.com/43a45p.png" },
  { id: "gigachad", name: "Gigachad", url: "https://i.imgflip.com/51s92s.jpg" },
  { id: "disaster-girl", name: "Disaster Girl", url: "https://i.imgflip.com/23ls.jpg" },
  { id: "always-has-been", name: "Always Has Been", url: "https://i.imgflip.com/46e43q.png" },
  { id: "waiting-skeleton", name: "Waiting Skeleton", url: "https://i.imgflip.com/2fm6x.jpg" },
  { id: "panik-kalm", name: "Panik Kalm Panik", url: "https://i.imgflip.com/3qqcim.png" },
  { id: "leo-dicaprio", name: "Leonardo DiCaprio Laughing", url: "https://i.imgflip.com/39t1o.jpg" },
  { id: "think-mark", name: "Think Mark Think", url: "https://i.imgflip.com/58jiim.png" },
  { id: "trade-offer", name: "Trade Offer", url: "https://i.imgflip.com/54hjww.jpg" },
];

const FONTS = [
  { id: "Impact", name: "Impact (Classic)" },
  { id: "Arial Black", name: "Arial Black (Modern)" },
  { id: "Comic Sans MS", name: "Comic Sans (Fun)" },
  { id: "Courier New", name: "Courier New (Retro)" },
  { id: "Trebuchet MS", name: "Trebuchet (Clean)" },
  { id: "Georgia", name: "Georgia (Serif)" },
];

export default function MemeGenerator() {
  const { isPro } = usePro();
  const [topText, setTopText] = useState("WHEN THE CODE");
  const [bottomText, setBottomText] = useState("FINALLY WORKS");
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(MEME_TEMPLATES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Typography state
  const [fontFamily, setFontFamily] = useState("Impact");
  const [fontSize, setFontSize] = useState(44);
  const [textColor, setTextColor] = useState("#ffffff");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [outlineWidth, setOutlineWidth] = useState(6);
  const [isUppercase, setIsUppercase] = useState(true);
  const [textAlign, setTextAlign] = useState<"center" | "left" | "right">("center");

  // Layout Tuning offsets
  const [topOffset, setTopOffset] = useState(25);
  const [bottomOffset, setBottomOffset] = useState(25);

  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const customUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    const targetUrl = customImage || selectedTemplate.url;
    img.src = targetUrl.startsWith("http")
      ? `/api/proxy?url=${encodeURIComponent(targetUrl)}`
      : targetUrl;
    img.onload = () => {
      // Set canvas size matching template aspect ratio
      const aspectRatio = img.width / img.height;
      canvas.width = 600;
      canvas.height = 600 / aspectRatio;

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply typography styles
      ctx.fillStyle = textColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineWidth;
      ctx.textAlign = textAlign;
      
      // Load selected font
      ctx.font = `900 ${fontSize}px "${fontFamily}", sans-serif`;

      // 1. Draw Top Text
      ctx.textBaseline = "top";
      const rawTop = isUppercase ? topText.toUpperCase() : topText;
      const topWords = rawTop.split("\n");
      
      topWords.forEach((word, i) => {
        let textX = canvas.width / 2;
        if (textAlign === "left") textX = 28;
        if (textAlign === "right") textX = canvas.width - 28;

        ctx.strokeText(word, textX, topOffset + i * (fontSize + 6));
        ctx.fillText(word, textX, topOffset + i * (fontSize + 6));
      });

      // 2. Draw Bottom Text
      ctx.textBaseline = "bottom";
      const rawBottom = isUppercase ? bottomText.toUpperCase() : bottomText;
      const bottomWords = rawBottom.split("\n");
      
      // Reverse array to draw bottom-most line at the absolute bottom
      bottomWords.reverse().forEach((word, i) => {
        let textX = canvas.width / 2;
        if (textAlign === "left") textX = 28;
        if (textAlign === "right") textX = canvas.width - 28;

        ctx.strokeText(word, textX, canvas.height - bottomOffset - i * (fontSize + 6));
        ctx.fillText(word, textX, canvas.height - bottomOffset - i * (fontSize + 6));
      });
      setError("");
    };
    img.onerror = () => {
      setError("Failed to load meme template. Check internet connection.");
    };
  }, [
    topText, 
    bottomText, 
    selectedTemplate, 
    customImage, 
    fontSize, 
    textColor, 
    fontFamily, 
    outlineColor, 
    outlineWidth, 
    isUppercase, 
    textAlign, 
    topOffset, 
    bottomOffset
  ]);

  const onCustomDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, or WebP).");
      return;
    }

    if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current);
    const url = URL.createObjectURL(file);
    customUrlRef.current = url;
    setCustomImage(url);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onCustomDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `exismic-meme-${Date.now()}.png`;
    a.click();
  };

  const handleRandom = () => {
    setCustomImage(null);
    const randomIndex = Math.floor(Math.random() * MEME_TEMPLATES.length);
    setSelectedTemplate(MEME_TEMPLATES[randomIndex]);
  };

  const reset = () => {
    setTopText("");
    setBottomText("");
    setCustomImage(null);
    setFontSize(44);
    setFontFamily("Impact");
    setTextColor("#ffffff");
    setOutlineColor("#000000");
    setOutlineWidth(6);
    setIsUppercase(true);
    setTextAlign("center");
    setTopOffset(25);
    setBottomOffset(25);
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-6 pt-24 font-sans text-white selection:bg-purple-500/30 sm:px-6 md:px-12 md:pb-12 md:pt-28" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center md:justify-start gap-3 mb-4"
            >
              <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/20 shadow-lg">
                <Laugh className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-400">
                Meme Studio
              </h1>
            </motion.div>
            <motion.p
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-base md:text-lg max-w-2xl font-medium"
            >
              Create viral memes with new templates, advanced custom fonts, alignments, and outline styling.
            </motion.p>
          </div>
          
          <div className="flex gap-3 justify-center">
             <button 
               onClick={() => setIsFavorite(!isFavorite)}
               className={cn(
                 "p-4 rounded-2xl border transition-all duration-300",
                 isFavorite ? "bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-600/20 animate-pulse" : "bg-white/5 border-white/10 text-gray-500"
               )}
             >
                <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
             </button>
             <button 
               onClick={handleDownload}
               className="flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-white/5 active:scale-95"
             >
                <Download className="w-4 h-4" /> Export PNG
             </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-100">
            {error}
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Layout className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">Architect</h3>
                </div>
                <button 
                  onClick={handleRandom}
                  className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-purple-400"
                  title="Random Template"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Template Selection */}
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 italic">Core Template</label>
                   <div className="h-48 overflow-y-auto pr-2 custom-scrollbar mb-4">
                     <div className="grid grid-cols-5 gap-2">
                       {MEME_TEMPLATES.map((t) => (
                         <button
                           key={t.id}
                           onClick={() => {
                             setCustomImage(null);
                             setSelectedTemplate(t);
                           }}
                           className={cn(
                             "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                             !customImage && selectedTemplate.id === t.id ? "border-purple-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                           )}
                         >
                            <img src={t.url.startsWith("http") ? `/api/proxy?url=${encodeURIComponent(t.url)}` : t.url} className="w-full h-full object-cover" alt={t.name} />
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Custom upload area */}
                   <div
                     {...getRootProps()}
                     className={cn(
                       "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all",
                       isDragActive ? "border-purple-400 bg-purple-500/10" : "border-white/10 bg-black/20 hover:border-white/20"
                     )}
                   >
                     <input {...getInputProps()} />
                     <div className="flex items-center justify-center gap-2">
                       <ImageIcon className="w-4 h-4 text-gray-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                         {customImage ? "Change Uploaded Image" : "Upload Custom Template"}
                       </span>
                     </div>
                     {customImage && (
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           setCustomImage(null);
                         }}
                         className="mt-2 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300"
                       >
                         Remove Custom Image
                       </button>
                     )}
                   </div>
                </div>

                {/* Text Inputs */}
                <div className="space-y-5">
                   <div>
                      <div className="flex items-center justify-between mb-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block italic">Headline (Top)</label>
                         <div className="flex gap-2">
                           <button 
                             onClick={() => setTextAlign("left")}
                             className={cn("p-1 rounded hover:bg-white/5", textAlign === "left" ? "text-purple-400" : "text-gray-500")}
                           >
                             <AlignLeft className="w-3.5 h-3.5" />
                           </button>
                           <button 
                             onClick={() => setTextAlign("center")}
                             className={cn("p-1 rounded hover:bg-white/5", textAlign === "center" ? "text-purple-400" : "text-gray-500")}
                           >
                             <AlignCenter className="w-3.5 h-3.5" />
                           </button>
                           <button 
                             onClick={() => setTextAlign("right")}
                             className={cn("p-1 rounded hover:bg-white/5", textAlign === "right" ? "text-purple-400" : "text-gray-500")}
                           >
                             <AlignRight className="w-3.5 h-3.5" />
                           </button>
                         </div>
                      </div>
                      <textarea 
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-purple-500 outline-none transition-all resize-none h-16"
                        placeholder="TOP TEXT..."
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 italic">Punchline (Bottom)</label>
                      <textarea 
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-purple-500 outline-none transition-all resize-none h-16"
                        placeholder="BOTTOM TEXT..."
                      />
                   </div>

                   <div className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-2xl">
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Force Uppercase Text</span>
                     <button
                       onClick={() => setIsUppercase(!isUppercase)}
                       className={cn(
                         "w-12 h-6 rounded-full p-1 transition-all duration-300",
                         isUppercase ? "bg-purple-600 flex justify-end" : "bg-zinc-800 flex justify-start"
                       )}
                     >
                       <span className="w-4 h-4 rounded-full bg-white block" />
                     </button>
                   </div>
                </div>

                {/* Typography Selectors */}
                <div className="pt-6 border-t border-white/5 space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 italic">Font Style</label>
                       <select
                         value={fontFamily}
                         onChange={(e) => setFontFamily(e.target.value)}
                         className="w-full bg-black/50 border border-white/10 rounded-2xl p-3.5 text-xs font-black uppercase tracking-wider outline-none focus:border-purple-500 cursor-pointer"
                       >
                         {FONTS.map(f => (
                           <option key={f.id} value={f.id} className="bg-[#15151c] text-white">
                             {f.name}
                           </option>
                         ))}
                       </select>
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Font Size</label>
                          <span className="text-[10px] font-bold text-purple-400">{fontSize}px</span>
                        </div>
                        <input 
                          type="range"
                          min={18}
                          max={92}
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                     </div>
                   </div>

                   {/* Outline Stroke Customization */}
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Outline Thickness</label>
                          <span className="text-[10px] font-bold text-purple-400">{outlineWidth}px</span>
                        </div>
                        <input 
                          type="range"
                          min={0}
                          max={15}
                          value={outlineWidth}
                          onChange={(e) => setOutlineWidth(parseInt(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 italic">Outline Color</label>
                       <div className="flex items-center gap-3 p-2 bg-black/40 rounded-2xl border border-white/10 h-11">
                         <input 
                           type="color" 
                           value={outlineColor}
                           onChange={(e) => setOutlineColor(e.target.value)}
                           className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none"
                         />
                         <span className="text-[9px] font-black uppercase text-gray-500">{outlineColor}</span>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Text Positioning Offsets */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                   <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Top Margin Offset</label>
                        <span className="text-[10px] font-bold text-purple-400">{topOffset}px</span>
                      </div>
                      <input 
                        type="range"
                        min={5}
                        max={180}
                        value={topOffset}
                        onChange={(e) => setTopOffset(parseInt(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                   </div>
                   <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Bottom Margin Offset</label>
                        <span className="text-[10px] font-bold text-purple-400">{bottomOffset}px</span>
                      </div>
                      <input 
                        type="range"
                        min={5}
                        max={180}
                        value={bottomOffset}
                        onChange={(e) => setBottomOffset(parseInt(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                   </div>
                </div>

                {/* Color pickers */}
                <div className="pt-6 border-t border-white/5">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3 italic">Font Color</label>
                   <div className="flex items-center gap-4 p-3 bg-black/40 rounded-2xl border border-white/10">
                     <input 
                       type="color" 
                       value={textColor}
                       onChange={(e) => setTextColor(e.target.value)}
                       className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none"
                     />
                     <span className="text-[10px] font-black uppercase text-gray-400">{textColor}</span>
                   </div>
                </div>

                <button
                  onClick={reset}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Layout
                </button>
              </div>
            </div>

            {/* Pro Hint */}
            <div className="p-8 rounded-[2.5rem] bg-purple-500/5 border border-purple-500/10 flex gap-4">
               <Sparkles className="w-6 h-6 text-purple-400 shrink-0" />
               <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
                  Drag the sliders to shift headings so they don't cover characters' faces! Press **Enter** in the input text areas to write multi-line captions.
               </p>
            </div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="flex items-center justify-between px-8">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Matrix Output</span>
               </div>
               <div className="flex gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">600x600 Render Target</span>
               </div>
            </div>

            <div className="relative group">
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 flex items-center justify-center backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden min-h-[500px]">
                  {/* Canvas for Meme Rendering */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full h-auto rounded-xl"
                    />
                  </div>
                  
                  {/* Decorative Glow */}
                  <div className="absolute -top-1/4 -right-1/4 w-full h-full rounded-full blur-[150px] bg-purple-600/10 -z-10" />
               </div>

               {/* Watermark Overlay */}
               {!isPro && (
                 <div className="absolute bottom-12 right-12 opacity-30 pointer-events-none">
                    <h4 className="text-[10px] font-black italic tracking-tighter text-white">EXISMIC STUDIOS</h4>
                 </div>
               )}
            </div>

            {/* Fun Tip */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                     <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest mb-1 italic">Meme Logic</h5>
                     <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-medium">
                        Brevity is the soul of wit. Keep your punchline short for maximum viral potential.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Atmospheric Background */}
      <div className="fixed top-0 right-0 -z-10 w-[800px] h-[800px] bg-purple-600/[0.03] blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[700px] h-[700px] bg-cyan-600/[0.03] blur-[160px] rounded-full pointer-events-none animate-pulse" />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.4);
        }
      `}</style>
    </div>
  );
}
