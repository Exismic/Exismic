"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Download, 
  X, 
  AudioWaveform, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  ChevronDown, 
  AlertCircle,
  HelpCircle,
  Clock
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import axios from "axios";

const PRESET_TAGS = [
  "Retro 8-bit game jump",
  "Cinematic laser beam blast",
  "Heavy metal sword clash",
  "Soft rain falling on leaves",
  "Futuristic hovercar engine zoom",
  "Mystical wizard spell cast",
  "Cartoon slip and fall whoosh"
];

const AUD_STEPS = [
  { title: "Describe Sound", desc: "Type what you want to hear (e.g. 'retro game coins clinking' or 'thunder crash')." },
  { title: "Tune Duration", desc: "Open Advanced Settings to set a precise sound length from 0.5s to 22s." },
  { title: "AI Generation", desc: "ElevenLabs synthesizes your sound using high-fidelity foley models." },
  { title: "Play & Download", desc: "Listen to your custom audio clip instantly and export it as an MP3." }
];

export default function SfxGenerator() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(3.0);
  const [influence, setInfluence] = useState(0.3);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleTagClick = (tag: string) => {
    setPrompt(tag);
    setError(null);
  };

  const simulateProgress = () => {
    setProgress(10);
    setStatus("Parsing foley text description...");
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        if (prev > 70) {
          setStatus("Reconstructing high-fidelity audio signals...");
          return prev + 1;
        }
        if (prev > 40) {
          setStatus("Synthesizing audio waveform layers...");
          return prev + 3;
        }
        return prev + 6;
      });
    }, 300);

    return interval;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError(null);
    setAudioUrl(null);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post(
        "/api/tools/audio/sfx-generator",
        { prompt: prompt.trim(), duration, influence },
        { responseType: "arraybuffer" }
      );

      clearInterval(progressInterval);
      setProgress(100);
      setStatus("Sound effect ready!");

      // Convert arraybuffer response to a local URL for the player
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      
      // Axios error decoding for arraybuffer responses
      let errorMessage = "Failed to generate sound effect. Please try again.";
      if (err.response?.data) {
        try {
          const decoded = JSON.parse(new TextDecoder().decode(err.response.data));
          errorMessage = decoded.error || errorMessage;
        } catch {
          // fallback
        }
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        {/* Main Work Area */}
        <div className="xl:col-span-8 space-y-10">
          <div className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/[0.01] blur-[100px] rounded-full pointer-events-none" />

            {/* Header Title */}
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                  <div className="p-2 bg-accent-blue/10 rounded-xl"><AudioWaveform className="w-5 h-5 text-accent-blue" /></div>
                  Foley Sound Workshop
                </h3>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Generate foley effects and audio assets via prompts</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Description Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Describe your sound effect</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => { setPrompt(e.target.value); setError(null); }}
                  placeholder="Enter a prompt description (e.g. 'retro 8-bit game jump', 'soft wind blowing through branches')..."
                  className="w-full min-h-[140px] bg-zinc-950/90 border border-white/5 focus:border-accent-blue/30 rounded-[2rem] p-6 text-zinc-300 font-medium leading-relaxed outline-none focus:ring-4 focus:ring-accent-blue/5 transition-all duration-300 resize-none shadow-inner custom-scrollbar"
                />
              </div>

              {/* Preset Tags */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Quick Prompts</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTagClick(tag)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all duration-300 cursor-pointer",
                        prompt === tag 
                          ? "bg-accent-blue/15 border-accent-blue/30 text-accent-blue" 
                          : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/15 hover:text-white"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings Disclosure */}
              <div className="border border-white/5 rounded-[2rem] bg-zinc-950/30 overflow-hidden">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="w-full flex items-center justify-between p-6 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sliders size={16} className="text-accent-blue" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Advanced Audio Controls</span>
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform duration-300", isSettingsOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        {/* Duration Slider */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <span className="flex items-center gap-2"><Clock size={12} /> Target Duration</span>
                            <span className="text-accent-blue font-bold">{duration.toFixed(1)}s</span>
                          </div>
                          <input 
                            type="range"
                            min="0.5"
                            max="22.0"
                            step="0.5"
                            value={duration}
                            onChange={(e) => setDuration(parseFloat(e.target.value))}
                            className="w-full accent-accent-blue h-1 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none"
                          />
                          <span className="text-[8px] font-semibold text-zinc-600 uppercase block">Min 0.5s · Max 22.0s</span>
                        </div>

                        {/* Prompt Influence Slider */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <span className="flex items-center gap-2"><HelpCircle size={12} /> Prompt Influence</span>
                            <span className="text-accent-blue font-bold">{Math.round(influence * 100)}%</span>
                          </div>
                          <input 
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.05"
                            value={influence}
                            onChange={(e) => setInfluence(parseFloat(e.target.value))}
                            className="w-full accent-accent-blue h-1 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none"
                          />
                          <span className="text-[8px] font-semibold text-zinc-600 uppercase block">Higher influence keeps generated audio close to foley description</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Trigger Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isProcessing}
                  className={cn(
                    "w-full md:w-auto flex min-h-14 items-center justify-center gap-3 rounded-2xl px-10 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition hover:brightness-110 active:scale-98 cursor-pointer",
                    "bg-gradient-to-r from-blue-600 to-indigo-600",
                    "disabled:opacity-30 disabled:cursor-not-allowed"
                  )}
                >
                  <Sparkles size={16} />
                  {isProcessing ? "Synthesizing..." : "Generate Sound Effect"}
                </button>
              </div>
            </div>
          </div>

          {/* Results audio dashboard */}
          <AnimatePresence>
            {audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-8 relative overflow-hidden group"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <AudioWaveform size={26} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white italic uppercase tracking-tighter pr-4 px-4 -mx-4">Audio Generated</h4>
                      <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">WAV format · Ready to use in your projects</p>
                    </div>
                  </div>

                  <a
                    href={audioUrl}
                    download={`exismic-${prompt.trim().replace(/[^a-z0-9]/gi, "-").toLowerCase()}.wav`}
                    className="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-white px-6 text-[10px] font-black uppercase tracking-widest text-black shadow-2xl transition hover:bg-zinc-200 cursor-pointer active:scale-98"
                  >
                    <Download size={16} />
                    Download WAV
                  </a>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-950/60 border border-white/5">
                  <CustomSfxPlayer src={audioUrl} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar steps */}
        <div className="xl:col-span-4 space-y-8">
          <PdfSidebar 
            accentColor="text-accent-blue"
            steps={AUD_STEPS}
            stats={prompt ? [
              { label: "Duration", value: `${duration.toFixed(1)}s` },
              { label: "API Provider", value: "ElevenLabs" },
              { label: "Format", value: "WAV Audio" }
            ] : []}
          />

          {error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em]">Synthesis Error</p>
                <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Synthesis loader screen overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-24 h-24 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
              <AudioWaveform className="absolute inset-0 m-auto w-8 h-8 text-accent-blue animate-pulse" />
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">{status}</h4>
            <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-blue shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-6 font-black uppercase tracking-[0.4em]">Foley synthesis active</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom Player + Waveform Animation
function CustomSfxPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    setIsPlaying(false);
    setCurrentTime(0);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Waveform Equalizer Animation */}
      <div className="h-16 flex items-center justify-center gap-1.5 px-4 overflow-hidden border-b border-white/5 pb-6">
        {Array.from({ length: 48 }).map((_, idx) => {
          // Bouncing height animations based on play state
          const duration = 0.5 + Math.random() * 0.8;
          const delay = Math.random() * 0.5;
          return (
            <motion.div
              key={idx}
              animate={isPlaying ? {
                height: [8, 20 + Math.random() * 40, 8]
              } : {
                height: 8
              }}
              transition={isPlaying ? {
                duration,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
              } : { duration: 0.2 }}
              className={cn(
                "w-1 rounded-full transition-colors duration-300",
                isPlaying ? "bg-accent-blue" : "bg-zinc-800"
              )}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-4 w-full">
        <audio ref={audioRef} src={src} preload="metadata" />
        
        {/* Play control */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex size-11 items-center justify-center rounded-xl bg-accent-blue text-white hover:brightness-110 active:scale-95 transition-all shrink-0 shadow-lg cursor-pointer"
        >
          {isPlaying ? <Pause className="size-4 fill-white" /> : <Play className="size-4 fill-white ml-0.5" />}
        </button>

        {/* Elapsed Time */}
        <span className="text-xs font-mono text-zinc-500 shrink-0 select-none">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Scrub Slider */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.05"
          value={currentTime}
          onChange={handleScrub}
          className="flex-1 h-1 rounded-full bg-white/10 accent-accent-blue cursor-pointer appearance-none focus:outline-none"
        />

        {/* Volume Mute */}
        <button
          type="button"
          onClick={toggleMute}
          className="flex size-9 items-center justify-center rounded-xl text-zinc-500 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          {isMuted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
