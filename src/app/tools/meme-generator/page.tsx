"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Laugh, 
  Download, 
  Copy, 
  Star, 
  Type, 
  Maximize, 
  Layout, 
  Palette, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2,
  X,
  Search,
  Sparkles,
  RefreshCw,
  Image as ImageIcon
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
  { id: "batman", name: "Batman Slapping Robin", url: "https://i.imgflip.com/9ehk9.jpg" },
  { id: "simply", name: "One Does Not Simply", url: "https://i.imgflip.com/1bij.jpg" },
  { id: "aliens", name: "Ancient Aliens", url: "https://i.imgflip.com/26am.jpg" },
  { id: "harold", name: "Hide the Pain Harold", url: "https://i.imgflip.com/gk6z4.jpg" },
  { id: "spongebob", name: "Mocking Spongebob", url: "https://i.imgflip.com/1otk96.jpg" },
  { id: "grumpy", name: "Grumpy Cat", url: "https://i.imgflip.com/8p0a.jpg" },
];

export default function MemeGenerator() {
  const { isPro } = usePro();
  const [topText, setTopText] = useState("WHEN THE CODE");
  const [bottomText, setBottomText] = useState("FINALLY WORKS");
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(MEME_TEMPLATES[0]);
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedTemplate.url;
    img.onload = () => {
      // Set canvas size to match image aspect ratio
      const aspectRatio = img.width / img.height;
      canvas.width = 600;
      canvas.height = 600 / aspectRatio;

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Setup text style
      ctx.fillStyle = textColor;
      ctx.strokeStyle = "black";
      ctx.lineWidth = Math.max(1, fontSize / 10);
      ctx.textAlign = "center";
      ctx.font = `black ${fontSize}px Impact, sans-serif`;
      if (!ctx.font.includes("Impact")) {
        ctx.font = `bold ${fontSize}px sans-serif`;
      }

      // Draw Top Text
      ctx.textBaseline = "top";
      const topWords = topText.split("\n");
      topWords.forEach((word, i) => {
        ctx.fillText(word, canvas.width / 2, 20 + i * fontSize);
        ctx.strokeText(word, canvas.width / 2, 20 + i * fontSize);
      });

      // Draw Bottom Text
      ctx.textBaseline = "bottom";
      const bottomWords = bottomText.split("\n");
      bottomWords.reverse().forEach((word, i) => {
        ctx.fillText(word, canvas.width / 2, canvas.height - 20 - i * fontSize);
        ctx.strokeText(word, canvas.width / 2, canvas.height - 20 - i * fontSize);
      });
    };
  }, [topText, bottomText, selectedTemplate, fontSize, textColor]);

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
    const randomIndex = Math.floor(Math.random() * MEME_TEMPLATES.length);
    setSelectedTemplate(MEME_TEMPLATES[randomIndex]);
  };

  const reset = () => {
    setTopText("");
    setBottomText("");
    setFontSize(40);
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
                <Laugh className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-400">
                Meme Studio
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium"
            >
              Create viral memes with the internet&apos;s favorite templates.
            </motion.p>
          </div>
          
          <div className="flex gap-3 justify-center">
             <button 
               onClick={() => setIsFavorite(!isFavorite)}
               className={cn(
                 "p-4 rounded-2xl border transition-all duration-300",
                 isFavorite ? "bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-600/20" : "bg-white/5 border-white/10 text-gray-500"
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
                {/* Template Grid */}
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 italic">Core Template</label>
                   <div className="grid grid-cols-5 gap-2 h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {MEME_TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTemplate(t)}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                            selectedTemplate.id === t.id ? "border-purple-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                           <img src={t.url} className="w-full h-full object-cover" alt={t.name} />
                        </button>
                      ))}
                   </div>
                </div>

                {/* Text Inputs */}
                <div className="space-y-4">
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 italic">Headline (Top)</label>
                      <input 
                        type="text" 
                        value={topText}
                        onChange={(e) => setTopText(e.target.value.toUpperCase())}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-purple-500 outline-none transition-all shadow-inner"
                        placeholder="TOP TEXT..."
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 italic">Punchline (Bottom)</label>
                      <input 
                        type="text" 
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value.toUpperCase())}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-purple-500 outline-none transition-all shadow-inner"
                        placeholder="BOTTOM TEXT..."
                      />
                   </div>
                </div>

                {/* Style Specs */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                   <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Scale</label>
                        <span className="text-[10px] font-bold text-purple-400">{fontSize}px</span>
                      </div>
                      <input 
                        type="range"
                        min={10}
                        max={100}
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full accent-purple-500 h-1 bg-white/10 rounded-full appearance-none"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 italic">Chromatic</label>
                      <div className="flex items-center gap-4 p-3 bg-black/40 rounded-xl border border-white/5">
                        <input 
                          type="color" 
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none"
                        />
                        <span className="text-[9px] font-black uppercase text-gray-500">{textColor}</span>
                      </div>
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
                  Our renderer uses high-precision canvas anchoring to ensure text remains crisp even on 4K displays. Use **Shift + Enter** for multi-line text.
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
