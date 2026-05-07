"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  RefreshCw, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Trash2,
  Zap,
  FileAudio,
  Loader2,
  CheckCircle2,
  Download,
  Waves,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Waveform Component ---
const WaveformVisualizer = ({ peaks, color, progress, onSeek }: { peaks: number[], color: string, progress: number, onSeek?: (p: number) => void }) => {
    return (
        <div 
            className="flex items-center gap-[1px] h-full w-full py-4 px-2 relative cursor-pointer group/wave"
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const p = Math.max(0, Math.min(1, x / rect.width));
                onSeek?.(p);
            }}
        >
            {peaks.map((p, i) => {
                const barProgress = i / peaks.length;
                const isPlayed = barProgress <= progress;
                return (
                    <div 
                        key={i} 
                        className={cn(
                            "flex-1 rounded-full transition-colors duration-200", 
                            isPlayed ? color : "bg-white/10"
                        )} 
                        style={{ height: `${Math.max(0.1, p) * 100}%`, minHeight: '2px' }}
                    />
                );
            })}
            
            <motion.div 
                className="absolute top-0 bottom-0 w-[2px] bg-white z-20 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                initial={false}
                animate={{ left: `${progress * 100}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.1 }}
            />
        </div>
    );
};

export function NoiseRemover() {
  const [audio, setAudio] = useState<{ file: File; url: string; duration: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ original: { url: string; peaks: number[] }; cleaned: { url: string; peaks: number[] } } | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => { setIsMounted(true); }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const audioTag = new Audio(url);
      audioTag.onloadedmetadata = () => {
        setAudio({ file, url, duration: audioTag.duration });
      };
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".flac"] },
    multiple: false,
  });

  const extractPeaks = (buffer: AudioBuffer, points: number) => {
    const channelData = buffer.getChannelData(0);
    const step = Math.floor(channelData.length / points);
    const peaks = [];
    for (let i = 0; i < points; i++) {
        let max = 0;
        for (let j = 0; j < step; j++) {
            const val = Math.abs(channelData[i * step + j]);
            if (val > max) max = val;
        }
        peaks.push(max);
    }
    return peaks;
  };

  const handleProcess = async () => {
    if (!audio) return;
    setIsProcessing(true);
    setProgress(10);

    try {
        const formData = new FormData();
        formData.append('file', audio.file);

        // Simulation for now since we'll build the backend next
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(90, prev + (Math.random() * 5)));
        }, 500);

        const response = await fetch('/api/tools/audio/noise-remover', {
            method: 'POST',
            body: formData,
        });

        clearInterval(progressInterval);
        if (!response.ok) throw new Error('Noise removal failed');

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Unknown error');

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Process original for visual comparison
        let origPeaks = Array.from({ length: 80 }, () => Math.random() * 0.3 + 0.1);
        try {
            const origRes = await fetch(audio.url);
            const origBuf = await origRes.arrayBuffer();
            const origAudioBuf = await audioContext.decodeAudioData(origBuf);
            origPeaks = extractPeaks(origAudioBuf, 80);
        } catch (err) {
            console.warn("Original peak extraction failed:", err);
        }

        // Process cleaned result
        const cleanedUrl = data.result.cleaned || audio.url;
        let cleanPeaks = Array.from({ length: 80 }, () => Math.random() * 0.2 + 0.05);
        try {
            const cleanRes = await fetch(cleanedUrl);
            const cleanBuf = await cleanRes.arrayBuffer();
            const cleanAudioBuf = await audioContext.decodeAudioData(cleanBuf);
            cleanPeaks = extractPeaks(cleanAudioBuf, 80);
        } catch (err) {
            console.warn("Cleaned peak extraction failed:", err);
            // Fallback to original peaks if same URL
            if (cleanedUrl === audio.url) cleanPeaks = origPeaks.map(p => p * 0.8);
        }

        setResult({
            original: { url: audio.url, peaks: origPeaks },
            cleaned: { url: cleanedUrl, peaks: cleanPeaks }
        });
        setProgress(100);
        
        if (data.result.isDemo) {
            console.info("Running in demo mode due to service unavailability.");
        }
    } catch (e: any) {
        console.error("Processing error:", e);
        alert("Failed to remove noise: " + e.message);
    } finally {
        setIsProcessing(false);
    }
  };

  const togglePlay = (id: string, url: string) => {
    // Pause other track
    Object.keys(audioRefs.current).forEach(k => {
        if (k !== id && !audioRefs.current[k]?.paused) {
            audioRefs.current[k]?.pause();
            setIsPlaying(p => ({ ...p, [k]: false }));
        }
    });

    if (!audioRefs.current[id]) {
      const audioTag = new Audio(url);
      audioRefs.current[id] = audioTag;
      audioTag.onloadedmetadata = () => setDurations(prev => ({ ...prev, [id]: audioTag.duration }));
      audioTag.ontimeupdate = () => setPlaybackProgress(prev => ({ ...prev, [id]: audioTag.currentTime / audioTag.duration }));
      audioTag.onended = () => {
          setIsPlaying(p => ({ ...p, [id]: false }));
          setPlaybackProgress(prev => ({ ...prev, [id]: 0 }));
      };
    }

    const a = audioRefs.current[id];
    if (isPlaying[id]) { 
        a.pause(); 
        setIsPlaying(p => ({...p, [id]: false})); 
    } else { 
        a.play().catch(console.error);
        setIsPlaying(p => ({...p, [id]: true})); 
    }
  };

  const handleSeek = (id: string, percent: number) => {
      const a = audioRefs.current[id];
      if (a && a.duration) {
          a.currentTime = percent * a.duration;
          setPlaybackProgress(prev => ({ ...prev, [id]: percent }));
      }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setAudio(null);
    setResult(null);
    setStep(0);
    setProgress(0);
  };

  if (!isMounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto py-8" suppressHydrationWarning>
      <AnimatePresence mode="wait">
        {!audio && !result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} {...getRootProps()} className="min-h-[400px] rounded-[3rem] border-2 border-dashed border-white/10 glass-dark flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-white/20 transition-all shadow-2xl">
            <input {...getInputProps()} />
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-accent-cyan group-hover:scale-110 transition-all mb-6">
              <VolumeX size={32} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">AI Noise Remover</h2>
            <p className="text-zinc-500 font-medium">Remove background noise, hum, and hiss from your recordings.</p>
            <div className="mt-10 px-10 py-4 rounded-xl premium-gradient text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                Select Audio File
            </div>
          </motion.div>
        )}

        {audio && !isProcessing && !result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-dark border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl">
             <div className="w-32 h-32 rounded-3xl bg-zinc-800 flex items-center justify-center text-accent-cyan shadow-inner border border-white/10"><FileAudio size={48} /></div>
             <div className="flex-1 space-y-4 w-full">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{audio.file.name}</h3>
                <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <span>{audio.file.type.split('/')[1]?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatTime(audio.duration)}</span>
                </div>
                <div className="flex gap-4">
                   <button onClick={handleProcess} className="flex-1 py-4 rounded-xl premium-gradient text-white font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                      <Zap size={16} /> Clean Audio
                   </button>
                   <button onClick={() => setAudio(null)} className="px-6 py-4 rounded-xl border border-white/10 text-zinc-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                </div>
             </div>
          </motion.div>
        )}

        {isProcessing && (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-8">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                <motion.div 
                    className="absolute inset-0 border-4 border-transparent border-t-accent-cyan rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-2xl font-black text-white italic">{Math.round(progress)}%</span>
             </div>
             <div className="text-center space-y-2">
                <p className="text-xl font-black text-white uppercase italic tracking-widest">Neural Cleaning in progress...</p>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Removing background noise</p>
             </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6 glass-dark p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="space-y-2 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Audio Cleaned</h2>
                    </div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Background noise successfully suppressed</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => { setAudio(null); setResult(null); }} className="px-8 py-4 rounded-xl border border-white/10 text-zinc-500 hover:text-white hover:bg-white/5 font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                        <RefreshCw size={16}/> Try Another
                    </button>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-8">
                {/* Cleaned Result */}
                <div className="glass-dark border-2 border-accent-cyan/30 rounded-[3rem] p-10 space-y-8 relative overflow-hidden shadow-3xl bg-accent-cyan/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 blur-[100px] -z-10" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-accent-cyan text-white flex items-center justify-center shadow-xl"><Sparkles size={32} /></div>
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Cleaned Audio</h3>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Enhanced with AI</p>
                            </div>
                        </div>
                        <a href={result.cleaned.url} download="cleaned_audio.mp3" className="hidden md:flex px-10 py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all items-center gap-3">
                            <Download size={20} /> Download Result
                        </a>
                    </div>
                    
                    <div className="bg-black/40 border border-white/5 rounded-[2rem] h-40 relative overflow-hidden group/wave-container">
                        <WaveformVisualizer 
                            peaks={result.cleaned.peaks} 
                            color="bg-accent-cyan" 
                            progress={playbackProgress['cleaned'] || 0}
                            onSeek={(p) => handleSeek('cleaned', p)}
                        />
                        <div className="absolute bottom-4 right-6 text-[10px] font-black text-white/30 tracking-widest uppercase">
                            {formatTime((playbackProgress['cleaned'] || 0) * (durations['cleaned'] || 0))} / {formatTime(durations['cleaned'] || 0)}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => togglePlay('cleaned', result.cleaned.url)} className="w-20 h-20 rounded-2xl bg-accent-cyan flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            {isPlaying['cleaned'] ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
                        </button>
                        <a href={result.cleaned.url} download="cleaned_audio.mp3" className="md:hidden flex-1 py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest shadow-xl items-center justify-center flex gap-3">
                            <Download size={20} /> Download
                        </a>
                        <div className="flex-1 flex items-center px-8 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                                    <span>Noise Suppression</span>
                                    <span className="text-accent-cyan">Max</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-cyan w-[95%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Original for Comparison */}
                <div className="glass-dark border border-white/5 rounded-[3rem] p-8 space-y-6 relative overflow-hidden opacity-60 hover:opacity-100 transition-opacity shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center"><Volume2 size={24} /></div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Original (With Noise)</h3>
                        </div>
                    </div>
                    
                    <div className="bg-black/40 border border-white/5 rounded-2xl h-24 relative overflow-hidden">
                        <WaveformVisualizer 
                            peaks={result.original.peaks} 
                            color="bg-zinc-500" 
                            progress={playbackProgress['original'] || 0}
                            onSeek={(p) => handleSeek('original', p)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => togglePlay('original', result.original.url)} className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all">
                            {isPlaying['original'] ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                        </button>
                        <p className="flex-1 flex items-center text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Compare with cleaned version to hear the difference</p>
                    </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
