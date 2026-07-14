"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  CloudRain, 
  Flame, 
  Coffee, 
  Trees, 
  Moon,
  Sliders
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import axios from "axios";

interface FoleyChannel {
  id: string;
  name: string;
  url: string;
  icon: React.ComponentType<any>;
  color: string;
  volume: number;
}

const INITIAL_CHANNELS: FoleyChannel[] = [
  { id: "rain", name: "Heavy Rain", url: "https://raw.githubusercontent.com/stu442/pomodoro-web/master/public/sounds/rain.mp3", icon: CloudRain, color: "text-blue-400", volume: 0.0 },
  { id: "fireplace", name: "Cozy Fireplace", url: "https://raw.githubusercontent.com/stu442/pomodoro-web/master/public/sounds/fireplace.mp3", icon: Flame, color: "text-orange-400", volume: 0.0 },
  { id: "cafe", name: "Coffee Shop", url: "https://raw.githubusercontent.com/stu442/pomodoro-web/master/public/sounds/coffeeshop.mp3", icon: Coffee, color: "text-amber-500", volume: 0.0 },
  { id: "forest", name: "Forest Nature", url: "https://raw.githubusercontent.com/stu442/pomodoro-web/master/public/sounds/forest.mp3", icon: Trees, color: "text-emerald-400", volume: 0.0 },
  { id: "night", name: "Quiet Night", url: "https://raw.githubusercontent.com/stu442/pomodoro-web/master/public/sounds/night.mp3", icon: Moon, color: "text-indigo-400", volume: 0.0 }
];

const PRESETS = [
  { name: "Rainy Coffee Shop", icon: "🌧️☕", levels: { rain: 0.8, fireplace: 0.0, cafe: 0.6, forest: 0.0, night: 0.2 } },
  { name: "Forest Campfire", icon: "🌲🔥", levels: { rain: 0.1, fireplace: 0.8, cafe: 0.0, forest: 0.7, night: 0.3 } },
  { name: "Cozy Midnight Cabin", icon: "🛖🌙", levels: { rain: 0.4, fireplace: 0.7, cafe: 0.0, forest: 0.2, night: 0.8 } }
];

const AUD_STEPS = [
  { title: "Choose Ambient Foley", desc: "Drag foley track sliders (Rain, Fire, Cafe) to set your baseline ambient layers." },
  { title: "Describe AI Lo-Fi", desc: "Type a backing track vibe (e.g. chill lofi piano beat, space ambient drone)." },
  { title: "Mix & Generate", desc: "Generate custom loops from Hugging Face and blend it seamlessly with your foley." },
  { title: "React Visualizer", desc: "Double check the glowing canvas visualizer. Click Master Play/Pause to loop." }
];

export default function AmbientMixer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [channels, setChannels] = useState<FoleyChannel[]>(INITIAL_CHANNELS);
  
  // AI Music State
  const [musicPrompt, setMusicPrompt] = useState("");
  const [musicVolume, setMusicVolume] = useState(0.0);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicStreamUrl, setMusicStreamUrl] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  
  // Web Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Track specific DOM audio element refs
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const hlsInstanceRef = useRef<any>(null);
  
  // Canvas Reactivity Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // 1. Initialize Web Audio API nodes
  const initAudioEngine = () => {
    if (audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      analyser.connect(ctx.destination);

      // Connect standard foley audio tag elements
      channels.forEach((ch) => {
        const audio = audioElementsRef.current[ch.id];
        if (audio) {
          const source = ctx.createMediaElementSource(audio);
          source.connect(analyser);
        }
      });

      // Connect AI music audio tag element
      if (musicAudioRef.current) {
        const source = ctx.createMediaElementSource(musicAudioRef.current);
        source.connect(analyser);
      }
    } catch (err) {
      console.error("Failed to initialize Web Audio Engine:", err);
    }
  };

  // 2. Play / Pause Master Toggle
  const togglePlay = async () => {
    initAudioEngine();
    
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }

    if (isPlaying) {
      // Pause everything
      channels.forEach(ch => audioElementsRef.current[ch.id]?.pause());
      musicAudioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play active ones (volume > 0)
      channels.forEach(ch => {
        const audio = audioElementsRef.current[ch.id];
        if (audio && ch.volume > 0) {
          audio.play().catch(e => console.log("Audio play blocked:", e));
        }
      });

      if (musicAudioRef.current && musicVolume > 0) {
        musicAudioRef.current.play().catch(e => console.log("Music play blocked:", e));
      }
      setIsPlaying(true);
    }
  };

  // 3. Update single slider foley volume
  const handleVolumeChange = (id: string, value: number) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === id) {
        const audio = audioElementsRef.current[id];
        if (audio) {
          audio.volume = value;
          if (isPlaying && value > 0 && audio.paused) {
            audio.play().catch(e => console.log("Foley play blocked:", e));
          } else if (value === 0 && !audio.paused) {
            audio.pause();
          }
        }
        return { ...ch, volume: value };
      }
      return ch;
    }));
  };

  // 4. Update AI backing music volume
  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    const audio = musicAudioRef.current;
    if (audio) {
      audio.volume = value;
      if (isPlaying && value > 0 && audio.paused) {
        audio.play().catch(e => console.log("Music play blocked:", e));
      } else if (value === 0 && !audio.paused) {
        audio.pause();
      }
    }
  };

  // 5. Apply Atmos presets
  const applyPreset = (levels: { [key: string]: number }) => {
    initAudioEngine();
    setChannels(prev => prev.map(ch => {
      const targetVol = levels[ch.id] ?? 0.0;
      const audio = audioElementsRef.current[ch.id];
      if (audio) {
        audio.volume = targetVol;
        if (isPlaying) {
          if (targetVol > 0 && audio.paused) {
            audio.play().catch(e => console.log("Preset audio play failed:", e));
          } else if (targetVol === 0 && !audio.paused) {
            audio.pause();
          }
        }
      }
      return { ...ch, volume: targetVol };
    }));
  };

  // 6. Generate AI Backing Track
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) return;
    setIsGeneratingMusic(true);
    setError(null);

    // Stop current HLS instance if active
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

    try {
      const response = await axios.post("/api/tools/audio/ambient-mixer", {
        prompt: musicPrompt.trim(),
        duration: 15
      });

      const hlsUrl = response.data.url;
      setMusicStreamUrl(hlsUrl);
      setMusicVolume(0.5); // Default to half volume on successful generation

      // Dynamically load Hls.js from CDN
      const HlsModule = await new Promise<any>((resolve) => {
        if ((window as any).Hls) {
          resolve((window as any).Hls);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.onload = () => resolve((window as any).Hls);
        document.head.appendChild(script);
      });

      if (musicAudioRef.current) {
        initAudioEngine();
        
        if (HlsModule.isSupported()) {
          const hls = new HlsModule({
            maxBufferSize: 0,
            maxBufferLength: 5,
            liveSyncDuration: 3,
          });
          hlsInstanceRef.current = hls;
          hls.loadSource(hlsUrl);
          hls.attachMedia(musicAudioRef.current);
          hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
            if (isPlaying && musicVolume > 0) {
              musicAudioRef.current?.play().catch(e => console.log("HLS stream play failed:", e));
            }
          });
        } else if (musicAudioRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          // Native Safari HLS support
          musicAudioRef.current.src = hlsUrl;
          if (isPlaying && musicVolume > 0) {
            musicAudioRef.current.play().catch(e => console.log("Safari stream play failed:", e));
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to generate AI audio loop.");
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // 7. Dynamic Canvas frequency visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      
      // Semi-transparent overlay to create a trailing glow motion effect
      ctx.fillStyle = "rgba(5, 5, 5, 0.2)";
      ctx.fillRect(0, 0, width, height);

      const analyser = analyserRef.current;
      if (!analyser || !isPlaying) {
        // Flat center line visualizer idle state
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = "rgba(168, 85, 247, 0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.beginPath();
      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255.0; // 0.0 to 1.0
        const y = (height / 2) + (v * (height / 2.5) * Math.sin(i * 0.1 + Date.now() * 0.005));

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      
      // Dual-gradient colors matching aesthetic
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, "#a855f7"); // purple-500
      grad.addColorStop(0.5, "#6366f1"); // indigo-500
      grad.addColorStop(1, "#3b82f6"); // blue-500

      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(168, 85, 247, 0.5)";
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying]);

  // Clean up HLS and Audio Context nodes on unmount
  useEffect(() => {
    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      
      {/* Audio tags for local buffer streaming */}
      {channels.map((ch) => (
        <audio 
          key={ch.id}
          ref={(el) => { if (el) audioElementsRef.current[ch.id] = el; }}
          src={ch.url}
          loop
          crossOrigin="anonymous"
        />
      ))}
      <audio 
        ref={musicAudioRef}
        loop
        crossOrigin="anonymous"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Main Workstation Studio */}
        <div className="xl:col-span-8 space-y-10">
          
          <div className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-10 relative overflow-hidden group">
            
            {/* Visualizer Backdrop */}
            <div className="absolute inset-x-0 top-0 h-44 bg-zinc-950/80 border-b border-white/5 rounded-t-[3.5rem] overflow-hidden flex items-center justify-center p-0 z-0 select-none">
              <canvas ref={canvasRef} className="w-full h-full object-cover" width={800} height={200} />
            </div>

            {/* Header Spacer */}
            <div className="h-32 pointer-events-none relative z-10" />

            {/* Mixer Controls */}
            <div className="space-y-8 relative z-10">
              
              {/* Master play controller */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xl font-black uppercase tracking-tight italic flex items-center justify-center sm:justify-start gap-3">
                    <span className="p-2 bg-purple-500/10 rounded-xl">
                      <Sliders className="w-4 h-4 text-purple-400" />
                    </span>
                    Audio Mix console
                  </h3>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    Adjust volume levels and overlay custom synthesizers
                  </p>
                </div>

                <button
                  onClick={togglePlay}
                  className={cn(
                    "h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer shadow-lg active:scale-98",
                    isPlaying 
                      ? "bg-purple-600/15 border border-purple-500/30 text-purple-400 hover:bg-purple-600/25" 
                      : "bg-white text-black hover:bg-zinc-200"
                  )}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? "Pause Soundscape" : "Play Soundscape"}
                </button>
              </div>

              {/* Preset buttons */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.25em]">Atmosphere Presets</span>
                <div className="flex flex-wrap gap-3">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPreset(preset.levels)}
                      className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 cursor-pointer transition-all"
                    >
                      <span>{preset.icon}</span>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {channels.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <div key={ch.id} className="p-6 rounded-2xl bg-zinc-950 border border-white/5 flex items-center gap-6">
                      <div className={cn("p-3 bg-white/5 rounded-xl", ch.color)}>
                        <Icon size={18} />
                      </div>
                      
                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-zinc-500">
                          <span>{ch.name}</span>
                          <span className={ch.color}>{Math.round(ch.volume * 100)}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={ch.volume}
                          onChange={(e) => handleVolumeChange(ch.id, parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Music Loop Panel */}
              <div className="p-8 rounded-3xl bg-zinc-950 border border-purple-500/10 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Music className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">AI Background Loops</span>
                    <p className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">Describe backing track loops to load</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text"
                      value={musicPrompt}
                      onChange={(e) => setMusicPrompt(e.target.value)}
                      placeholder="e.g. relaxing lofi piano, deep space ambient, chill synthwave beats..."
                      className="flex-1 h-14 bg-black border border-white/5 focus:border-purple-500/20 rounded-2xl px-5 text-xs font-semibold text-zinc-300 outline-none"
                    />
                    <button
                      onClick={handleGenerateMusic}
                      disabled={isGeneratingMusic || !musicPrompt.trim()}
                      className="h-14 px-8 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-colors shrink-0"
                    >
                      <Sparkles size={14} />
                      {isGeneratingMusic ? "Generating Loop..." : "Generate AI Loop"}
                    </button>
                  </div>

                  {musicStreamUrl && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-white/5 bg-black flex items-center gap-6"
                    >
                      <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500">
                          <span>AI Music Track Vol</span>
                          <span className="text-purple-400">{Math.round(musicVolume * 100)}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={musicVolume}
                          onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Info Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          <PdfSidebar 
            accentColor="text-purple-400"
            steps={AUD_STEPS}
            stats={musicStreamUrl ? [
              { label: "Mixing Console", value: "Exismic Studio Console" },
              { label: "Acoustic Latent", value: "Exismic Music Engine" },
              { label: "Channels Mixed", value: "6 Stereo Tracks" }
            ] : []}
          />

          {error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em]">Atmosphere Error</p>
                <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generating Music Backdrop Loader */}
      <AnimatePresence>
        {isGeneratingMusic && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-24 h-24 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <Music className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">
              Generating Ambient Loops...
            </h4>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] max-w-sm leading-relaxed">
              Invoking Meta MusicGen GPU workers. Sound segment will begin loop playing shortly.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
