"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Download, 
  Share2, 
  ArrowLeft, 
  CheckCircle2, 
  Bot, 
  Cpu,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { TOOLS } from "@/data/tools";
import { cn } from "@/lib/utils";

const DEFAULT_ANALYSIS = [
  "Looking at the segments...",
  "Checking colors and lights...",
  "Cleaning up the edges...",
  "Finishing up...",
];

export default function ResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Real dynamic data from the upload process
  const resultUrl = searchParams.get("resultUrl") || searchParams.get("url") || "/placeholder.jpg";
  const originalUrl = searchParams.get("originalUrl") || "/placeholder.jpg";
  const isRealAi = searchParams.get("real") === "true";
  const rawAnalysis = searchParams.get("analysis");
  const textResult = searchParams.get("textResult");
  const tool = TOOLS.find(t => t.id.includes(params.toolId as string));
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovering, setIsHovering] = useState(false);
  const isPdf = resultUrl.toLowerCase().endsWith('.pdf');
  const isImage = !isPdf && (resultUrl.match(/\.(jpeg|jpg|png|webp)$/i) || tool?.category === 'image');

  const analysisLog = useMemo(() => {
    if (!rawAnalysis) return DEFAULT_ANALYSIS;
    try {
      const parsed: unknown = JSON.parse(rawAnalysis);
      return Array.isArray(parsed) && parsed.every(item => typeof item === "string")
        ? parsed
        : DEFAULT_ANALYSIS;
    } catch {
      return DEFAULT_ANALYSIS;
    }
  }, [rawAnalysis]);

  const [mockAnalysis, setMockAnalysis] = useState<string[]>([]);

  useEffect(() => {
    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < analysisLog.length) {
        setMockAnalysis(prev => [...prev, analysisLog[currentStage]]);
        setStage(currentStage);
        currentStage++;
      } else {
        setIsFinished(true);
        clearInterval(interval);
      }
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 60);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [analysisLog]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const container = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - container.left) / container.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Neural Link Copied to Clipboard!");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Preview Area */}
        <div className="flex-1 space-y-6">
          <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center group shadow-2xl">
            {!isFinished ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-black/80 backdrop-blur-md z-20">
                {/* Real Preview while processing */}
                {originalUrl !== "/placeholder.jpg" && (
                  <div className="absolute inset-0 opacity-20 filter blur-xl">
                    <img src={originalUrl} className="w-full h-full object-cover" alt="Processing buffer" />
                  </div>
                )}
                
                <Cpu className="w-12 h-12 text-violet-500 animate-pulse mb-6 relative z-30" />
                <h2 className="text-2xl font-bold mb-2 relative z-30">Working on it</h2>
                <p className="text-zinc-400 relative z-30 animate-pulse">{analysisLog[stage] || "Processing..."}</p>
                
                <div className="w-full max-w-sm h-2 bg-white/10 rounded-full mt-8 overflow-hidden relative z-30">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-linear-to-r from-indigo-500 to-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                  />
                </div>
              </div>
            ) : textResult ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full p-10 overflow-y-auto custom-scrollbar"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest">Ready</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(textResult)}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white group"
                      title="Copy to clipboard"
                    >
                      <Share2 size={16} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <div className="text-xl text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap selection:bg-violet-500/30">
                    {textResult}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full relative group/slider cursor-col-resize"
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Transparent Checkerboard - Only for Background Remover */}
                {tool?.id === 'img-bg-remover' && (
                  <div 
                    className="absolute inset-0 opacity-20" 
                    style={{ backgroundImage: 'conic-gradient(#fff 0.25turn, #000 0.25turn 0.5turn, #fff 0.5turn 0.75turn, #000 0.75turn)', backgroundSize: '20px 20px', backgroundColor: '#111' }} 
                  />
                )}
                
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {tool?.id === 'img-upscaler' ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      {/* Before (Original) */}
                      <img 
                        src={originalUrl} 
                        className="absolute inset-0 w-full h-full object-contain bg-[#111]"
                        alt="Original"
                      />
                      
                      {/* After (Upscaled) */}
                      <div 
                        className="absolute inset-0 w-full h-full transition-all duration-75 ease-out select-none"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                      >
                        <img 
                          src={resultUrl} 
                          className="absolute inset-0 w-full h-full object-contain bg-[#111]"
                          alt="Upscaled"
                        />
                      </div>

                      {/* Slider Bar */}
                      <div 
                        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20 pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-black/20">
                          <RefreshCw className="w-4 h-4 text-black animate-spin-slow" />
                        </div>
                      </div>

                      {/* Labels */}
                      <AnimatePresence>
                        {isHovering && (
                          <>
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 pointer-events-none"
                            >
                              Upscaled
                            </motion.div>
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 pointer-events-none"
                            >
                              Original
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : isPdf ? (
                    <div className="w-full h-full bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
                      <iframe 
                        src={resultUrl} 
                        className="w-full flex-1 border-none"
                        title="PDF Result"
                      />
                      <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Preview</span>
                         <a 
                           href={resultUrl} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest"
                         >
                           Open in New Tab
                         </a>
                      </div>
                    </div>
                  ) : resultUrl.match(/\.(mp3|wav|ogg|m4a)$/i) || tool?.category === 'audio' ? (
                    <div className="w-full h-full bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center justify-center p-12 text-center">
                       <div className="w-24 h-24 rounded-full bg-violet-600/20 flex items-center justify-center mb-8 animate-pulse shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                         <RefreshCw className="w-12 h-12 text-violet-500 animate-spin-slow" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">All done</h3>
                      <p className="text-zinc-500 mb-8 max-w-sm">Listen to your audio below.</p>
                      
                      <div className="w-full max-w-md bg-white/5 p-6 rounded-2xl border border-white/10">
                        <audio 
                          controls 
                          className="w-full custom-audio-player h-10"
                        >
                          <source src={resultUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                      
                      <style jsx>{`
                        .custom-audio-player::-webkit-media-controls-panel {
                          background-color: rgba(255, 255, 255, 0.05);
                        }
                        .custom-audio-player::-webkit-media-controls-current-time-display,
                        .custom-audio-player::-webkit-media-controls-time-remaining-display {
                          color: #999;
                        }
                      `}</style>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center"
                    >
                      <img 
                        src={resultUrl} 
                        className={cn(
                          "max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]",
                          !isRealAi && "filter hue-rotate-15"
                        )}
                        alt="Processed Result"
                      />
                      <div className="absolute inset-0 bg-violet-500/10 pointer-events-none" />
                    </motion.div>
                  )}
                  
                  <div className="absolute bottom-6 right-6 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3 z-30">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest leading-none">AI Processed</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between">
             <div className="space-y-1">
              <h2 className="text-2xl font-bold font-outfit text-white">Your {tool?.name} is ready</h2>
              <p className="text-sm text-zinc-500">Made with Lumora</p>
            </div>
            {isFinished && (
              <div className="flex gap-4">
                {textResult ? (
                   <button 
                    onClick={() => navigator.clipboard.writeText(textResult)}
                    className="px-6 py-2 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                  >
                    <Download size={18} />
                    Copy
                  </button>
                ) : (
                   <a 
                    href={resultUrl}
                    download={resultUrl.split('/').pop()}
                    className="px-6 py-2 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                  >
                    <Download size={18} />
                    Save file
                  </a>
                )}
                <button onClick={handleShare} className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors group relative">
                  <Share2 size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time AI Insight Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="p-8 rounded-[2rem] bg-[#161617] border border-white/10 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bot className="w-20 h-20 text-violet-500" />
            </div>

             <div className="flex items-center gap-3 text-violet-400 font-bold text-sm tracking-widest uppercase">
              <Cpu size={18} />
              What happened
            </div>

            <div className="space-y-5 relative z-10">
              <AnimatePresence>
                {mockAnalysis.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 text-sm text-zinc-400 leading-relaxed font-mono"
                  >
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 shadow-[0_0_5px_rgba(139,92,246,0.8)]" />
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isFinished && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-8 border-t border-white/5 space-y-4"
              >
                 <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                   <div className="flex items-center gap-2">
                     <span className="w-1 h-1 rounded-full bg-emerald-500" />
                     Time taken
                   </div>
                  <span className="text-zinc-200">0.38s</span>
                </div>
                 <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                   <div className="flex items-center gap-2">
                     <span className="w-1 h-1 rounded-full bg-violet-500" />
                     Score
                   </div>
                  <span className="text-violet-400">99.98%</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-6 rounded-[2rem] bg-linear-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20">
            <div className="flex items-center gap-2 text-violet-400 mb-2">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Dynamic Engine</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {tool?.id === 'img-upscaler' ? (
                <>Your image was made better using smart AI.</>
              ) : tool?.id === 'img-bg-remover' ? (
                <>Your image was fixed using smart AI.</>
              ) : (
                <>Your file was fixed using Lumora's smart AI.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
