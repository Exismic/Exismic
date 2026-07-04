"use client";

import { useState, useRef } from "react";
import { 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Settings2, 
  ChevronDown,
  Loader2,
  Mic2,
  CheckCircle2,
  Music
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const VOICES = [
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'Lumora Narrator',
    accent: 'Multilingual',
    description: 'Clear, balanced',
  },
];

export function TextToSpeech() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showVoices, setShowVoices] = useState(false);
  
  // Settings
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);
  const [style, setStyle] = useState(0.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResult(null);
    setProgress(0);
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      progressInterval = setInterval(() => {
        setProgress(prev => Math.min(95, prev + Math.random() * 10));
      }, 300);

      const response = await fetch('/api/tools/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice_id: selectedVoice.id,
          settings: {
            stability,
            similarity_boost: similarity,
            style,
            use_speaker_boost: true
          }
        }),
      });

      setProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (error: unknown) {
      console.error("TTS generation failed:", error);
      const message = error instanceof Error ? error.message : "Unknown generation error.";
      alert("Failed to generate speech: " + message);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !result) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setResult(null);
    setIsPlaying(false);
    setPlaybackProgress(0);
    setText("");
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 space-y-10" suppressHydrationWarning>
      <AnimatePresence mode="wait">
        {!result && !isProcessing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="grid grid-cols-1 xl:grid-cols-3 gap-10"
          >
            {/* Main Input Area */}
            <div className="xl:col-span-2 space-y-6">
              <div className="relative group">
                <textarea 
                  className="w-full min-h-[400px] bg-zinc-900/50 rounded-[2.5rem] p-10 text-xl md:text-2xl text-white placeholder-zinc-700 border border-white/5 focus:border-accent-purple/30 focus:ring-4 focus:ring-accent-purple/5 outline-none transition-all resize-none shadow-2xl"
                  placeholder="Type what you want the voice to say here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="absolute bottom-8 right-10 flex items-center gap-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  <span>{text.length} characters</span>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={!text.trim()}
                className={cn(
                    "w-full py-6 rounded-3xl premium-gradient text-white font-black text-lg uppercase italic tracking-[0.2em] shadow-4xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:scale-100",
                    !text.trim() && "cursor-not-allowed"
                )}
              >
                <Sparkles size={24} /> Generate Speech
              </button>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-8">
              {/* Voice Selector */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 px-2">Select Voice</h3>
                <div className="relative">
                  <button 
                    onClick={() => setShowVoices(!showVoices)}
                    className="w-full p-6 rounded-2xl glass-dark border border-white/10 flex items-center justify-between hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center text-accent-purple"><Mic2 size={20} /></div>
                      <div className="text-left">
                        <p className="font-black text-white uppercase italic text-sm">{selectedVoice.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{selectedVoice.accent}</p>
                      </div>
                    </div>
                    <ChevronDown size={20} className={cn("text-zinc-500 group-hover:text-white transition-all", showVoices && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {showVoices && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-3 p-3 rounded-2xl glass-dark border border-white/10 shadow-3xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar"
                      >
                        {VOICES.map((voice) => (
                          <button
                            key={voice.id}
                            onClick={() => { setSelectedVoice(voice); setShowVoices(false); }}
                            className={cn(
                              "w-full p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-all mb-1 last:mb-0",
                              selectedVoice.id === voice.id ? "bg-accent-purple/10 border border-accent-purple/20" : "border border-transparent"
                            )}
                          >
                            <div className="text-left">
                              <p className={cn("font-black text-xs uppercase italic", selectedVoice.id === voice.id ? "text-accent-purple" : "text-white")}>{voice.name}</p>
                              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{voice.accent} • {voice.description}</p>
                            </div>
                            {selectedVoice.id === voice.id && <CheckCircle2 size={16} className="text-accent-purple" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-6 glass-dark border border-white/10 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-2">
                  <Settings2 size={16} className="text-accent-purple" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Voice Settings</h3>
                </div>

                {/* Stability */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stability</label>
                    <span className="text-[10px] font-black text-white">{stability}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={stability} onChange={(e) => setStability(parseFloat(e.target.value))}
                    className="w-full accent-accent-purple"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">
                    <span>Variable</span>
                    <span>Stable</span>
                  </div>
                </div>

                {/* Clarity/Similarity */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Clarity + Similarity</label>
                    <span className="text-[10px] font-black text-white">{similarity}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={similarity} onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                    className="w-full accent-accent-purple"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Style Exaggeration</label>
                    <span className="text-[10px] font-black text-white">{style}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={style} onChange={(e) => setStyle(parseFloat(e.target.value))}
                    className="w-full accent-accent-purple"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">
                    <span>None</span>
                    <span>Exaggerated</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : isProcessing ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-h-[500px] flex flex-col items-center justify-center space-y-10 glass-dark rounded-[3.5rem] border border-white/10 shadow-3xl"
          >
             <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                <motion.div 
                    className="absolute inset-0 border-4 border-transparent border-t-accent-purple rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <Loader2 size={64} className="text-accent-purple animate-pulse" />
                <div className="absolute -bottom-4 bg-zinc-900 border border-white/10 px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest italic">{Math.round(progress)}%</div>
             </div>
             <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Cloning Voice...</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Synthesis in progress</p>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full space-y-10"
          >
             <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg"><CheckCircle2 size={32} /></div>
                    <div>
                        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Speech Generated</h2>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">High-quality neural synthesis ready</p>
                    </div>
                </div>
                <button onClick={reset} className="px-6 py-3 rounded-xl border border-white/10 text-zinc-500 hover:text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-widest transition-all gap-2 flex items-center">
                    <RefreshCw size={14} /> Start Over
                </button>
             </div>

             <div className="glass-dark border border-white/10 rounded-[3.5rem] p-12 space-y-12 shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-purple/10 blur-[120px] -z-10 group-hover:bg-accent-purple/15 transition-all duration-700" />
                
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="w-48 h-48 rounded-[3rem] bg-zinc-800 border border-white/10 flex items-center justify-center text-accent-purple shadow-2xl group-hover:scale-105 transition-all duration-500">
                        <Music size={80} />
                    </div>
                    
                    <div className="flex-1 space-y-8 w-full">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Voice: {selectedVoice.name}</h3>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest">{selectedVoice.accent}</span>
                            </div>
                            <p className="text-zinc-500 italic font-medium text-lg line-clamp-2">&ldquo;{text}&rdquo;</p>
                        </div>

                        <div className="flex gap-6 items-center">
                            <button 
                                onClick={togglePlay}
                                className="w-24 h-24 rounded-3xl bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                            >
                                {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
                            </button>
                            
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-accent-purple" 
                                        animate={{ width: `${playbackProgress * 100}%` }}
                                        transition={{ duration: 0.1, ease: "linear" }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                    <span>Playing Neural Audio</span>
                                    <span>High Fidelity</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <a 
                                href={result!} 
                                download="generated-speech.mp3"
                                className="flex-1 py-5 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Download size={20} /> Download MP3
                            </a>
                        </div>
                    </div>
                </div>

                <audio 
                    ref={audioRef} 
                    src={result!} 
                    onTimeUpdate={(event) => {
                      const player = event.currentTarget;
                      setPlaybackProgress(player.duration ? player.currentTime / player.duration : 0);
                    }}
                    onEnded={() => {
                      setIsPlaying(false);
                      setPlaybackProgress(0);
                    }}
                    className="hidden"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
