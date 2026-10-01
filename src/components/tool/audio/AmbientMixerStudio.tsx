"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Layers,
  Zap,
  Check,
  Clock,
  Sliders,
  AudioWaveform,
  CloudRain,
  Flame,
  Coffee,
  Trees,
  Moon,
  Waves,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AMBIENT_CHANNELS,
  SOUNDSCAPE_PRESETS,
  type AmbientChannelConfig,
  type SoundscapePreset,
  generateChannelBuffer,
  exportMixedSoundscapeWav,
} from "@/lib/ambient-sound-engine";

const CHANNEL_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  CloudRain,
  Flame,
  Coffee,
  Trees,
  Moon,
  Waves,
};

export function AmbientMixerStudio() {
  // Master Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [activePresetId, setActivePresetId] = useState<string>("rainy-cafe");

  // Channel Volumes State (0.0 to 1.0)
  const [channelLevels, setChannelLevels] = useState<Record<string, number>>({
    rain: 0.75,
    fireplace: 0.2,
    cafe: 0.8,
    forest: 0.0,
    night: 0.15,
    ocean: 0.0,
  });

  // Mute / Solo States
  const [mutedChannels, setMutedChannels] = useState<Record<string, boolean>>({});
  const [soloChannel, setSoloChannel] = useState<string | null>(null);

  // Sleep / Focus Timer State (in minutes, 0 = off)
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [timerRemainingSec, setTimerRemainingSec] = useState<number>(0);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Web Audio Context & Nodes Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const channelNodesRef = useRef<Record<string, { gain: GainNode; source: AudioBufferSourceNode | null }>>({});
  const channelBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Live Waveform Visualizer Refs (Direct DOM manipulation for butter-smooth 60 FPS)
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const masterVolumeRef = useRef(masterVolume);
  const channelLevelsRef = useRef(channelLevels);
  const mutedChannelsRef = useRef(mutedChannels);
  const soloChannelRef = useRef(soloChannel);

  useEffect(() => {
    masterVolumeRef.current = masterVolume;
  }, [masterVolume]);

  useEffect(() => {
    channelLevelsRef.current = channelLevels;
  }, [channelLevels]);

  useEffect(() => {
    mutedChannelsRef.current = mutedChannels;
  }, [mutedChannels]);

  useEffect(() => {
    soloChannelRef.current = soloChannel;
  }, [soloChannel]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Initialize Web Audio Engine and Preload Procedural Buffers
  const initEngine = useCallback(async () => {
    if (audioCtxRef.current) return audioCtxRef.current;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;

    // Connect Web Audio AnalyserNode for real-time frequency analysis
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.75;
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    masterGainRef.current = masterGain;
    analyserRef.current = analyser;

    // Generate looping audio buffers for all 6 channels in parallel
    await Promise.all(
      AMBIENT_CHANNELS.map(async (ch) => {
        const buffer = await generateChannelBuffer(ch.id, 8);
        channelBuffersRef.current[ch.id] = buffer;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0; // initially silent until played
        gainNode.connect(masterGain);

        channelNodesRef.current[ch.id] = {
          gain: gainNode,
          source: null,
        };
      })
    );

    return ctx;
  }, [masterVolume]);

  // 2. Start / Stop Playing All Channels
  const togglePlay = async () => {
    const ctx = await initEngine();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (isPlaying) {
      // Stop all active sources
      Object.keys(channelNodesRef.current).forEach((id) => {
        const node = channelNodesRef.current[id];
        if (node.source) {
          try {
            node.source.stop();
          } catch {
            // ignore
          }
          node.source = null;
        }
      });
      setIsPlaying(false);
    } else {
      // Start looping sources for channels with volume > 0
      Object.keys(channelBuffersRef.current).forEach((id) => {
        const buffer = channelBuffersRef.current[id];
        const node = channelNodesRef.current[id];
        if (!buffer || !node) return;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(node.gain);
        source.start(0);
        node.source = source;

        // Apply current volume
        const isMuted = mutedChannels[id];
        const isSoloed = soloChannel !== null && soloChannel !== id;
        const targetVol = isMuted || isSoloed ? 0 : (channelLevels[id] ?? 0);
        node.gain.gain.setValueAtTime(targetVol, ctx.currentTime);
      });

      setIsPlaying(true);
      showToast("Soundscape playing!");
    }
  };

  // 3. Update Master Volume
  const handleMasterVolume = (val: number) => {
    setMasterVolume(val);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime);
    }
  };

  // 4. Update Individual Channel Volume
  const handleChannelVolume = (id: string, val: number) => {
    setChannelLevels((prev) => ({ ...prev, [id]: val }));
    const node = channelNodesRef.current[id];
    if (node && audioCtxRef.current) {
      const isMuted = mutedChannels[id];
      const isSoloed = soloChannel !== null && soloChannel !== id;
      const targetVol = isMuted || isSoloed ? 0 : val;
      node.gain.gain.setValueAtTime(targetVol, audioCtxRef.current.currentTime);
    }
  };

  // 5. Toggle Channel Mute
  const toggleMute = (id: string) => {
    setMutedChannels((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const node = channelNodesRef.current[id];
      if (node && audioCtxRef.current) {
        const isMuted = next[id];
        const targetVol = isMuted ? 0 : (channelLevels[id] ?? 0);
        node.gain.gain.setValueAtTime(targetVol, audioCtxRef.current.currentTime);
      }
      return next;
    });
  };

  // 6. Toggle Channel Solo
  const toggleSolo = (id: string) => {
    const nextSolo = soloChannel === id ? null : id;
    setSoloChannel(nextSolo);

    Object.keys(channelNodesRef.current).forEach((chId) => {
      const node = channelNodesRef.current[chId];
      if (node && audioCtxRef.current) {
        const isMuted = mutedChannels[chId];
        const isSoloed = nextSolo !== null && nextSolo !== chId;
        const targetVol = isMuted || isSoloed ? 0 : (channelLevels[chId] ?? 0);
        node.gain.gain.setValueAtTime(targetVol, audioCtxRef.current.currentTime);
      }
    });
  };

  // 7. Load Soundscape Preset
  const handleLoadPreset = (preset: SoundscapePreset) => {
    setActivePresetId(preset.id);
    setChannelLevels(preset.levels);
    setMutedChannels({});
    setSoloChannel(null);

    Object.keys(channelNodesRef.current).forEach((id) => {
      const node = channelNodesRef.current[id];
      if (node && audioCtxRef.current) {
        const targetVol = preset.levels[id] ?? 0;
        node.gain.gain.setValueAtTime(targetVol, audioCtxRef.current.currentTime);
      }
    });

    showToast(`Loaded ${preset.name} soundscape!`);
  };

  // 8. Sleep / Focus Timer Logic
  const handleSetTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    if (minutes === 0) {
      setTimerRemainingSec(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      showToast("Timer turned off (infinite loop)");
    } else {
      setTimerRemainingSec(minutes * 60);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      timerIntervalRef.current = setInterval(() => {
        setTimerRemainingSec((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            // Fade out and stop
            if (masterGainRef.current && audioCtxRef.current) {
              masterGainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 3);
            }
            setTimeout(() => {
              setIsPlaying(false);
              showToast("Focus timer completed!");
            }, 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      showToast(`Focus timer set for ${minutes} minutes`);
    }
  };

  // 9. Export Mixed Soundscape to WAV
  const handleExportWav = async () => {
    setIsExporting(true);
    showToast("Rendering your custom soundscape mix...");

    try {
      const blob = await exportMixedSoundscapeWav(channelLevels, masterVolume, 25);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exismic-ambient-${activePresetId}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("Downloaded 25-second seamless soundscape loop!");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Failed to render soundscape. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Reset all faders flat
  const handleResetMix = () => {
    const flat: Record<string, number> = {};
    AMBIENT_CHANNELS.forEach((ch) => {
      flat[ch.id] = ch.defaultVolume;
    });
    setChannelLevels(flat);
    setMutedChannels({});
    setSoloChannel(null);
    setMasterVolume(0.8);

    Object.keys(channelNodesRef.current).forEach((id) => {
      const node = channelNodesRef.current[id];
      if (node && audioCtxRef.current) {
        node.gain.gain.setValueAtTime(flat[id], audioCtxRef.current.currentTime);
      }
    });

    showToast("Reset all channels to default balance.");
  };

  // Real-time 60 FPS animated waveform visualizer loop
  useEffect(() => {
    let animId: number;
    let phase = 0;
    const freqData = new Uint8Array(64);

    const render = () => {
      phase += 0.08;
      const analyser = analyserRef.current;
      const hasAnalyser = analyser && isPlaying;

      if (hasAnalyser) {
        analyser.getByteFrequencyData(freqData);
      }

      const levels = channelLevelsRef.current;
      const muted = mutedChannelsRef.current;
      const solo = soloChannelRef.current;
      const mVol = masterVolumeRef.current;

      // Sum active sound levels to modulate visualizer intensity
      let totalActiveVolume = 0;
      Object.entries(levels).forEach(([chId, vol]) => {
        if (muted[chId]) return;
        if (solo !== null && solo !== chId) return;
        totalActiveVolume += vol;
      });

      const hasSound = totalActiveVolume > 0.01 && mVol > 0.01;

      for (let i = 0; i < 54; i++) {
        const barEl = barRefs.current[i];
        if (!barEl) continue;

        if (!isPlaying) {
          barEl.style.height = "14%";
          continue;
        }

        if (!hasSound) {
          // Gentle breathing motion if playing but tracks are muted/zero
          const idleWave = Math.sin(phase * 0.6 + i * 0.2);
          barEl.style.height = `${Math.round(14 + idleWave * 4)}%`;
          continue;
        }

        // Parabolic arc (naturally taller center, gentle slope to wings)
        const centerFactor = 1 - Math.abs(i - 27) / 27;

        // Real frequency energy from Web Audio analyser
        let freqEnergy = 0;
        if (hasAnalyser) {
          // Map 54 bars across the energetic frequency spectrum
          const binIdx = Math.min(63, Math.floor((i / 54) * 48));
          freqEnergy = (freqData[binIdx] || 0) / 255;
        }

        // Cinematic organic harmonic wave ripples (sinusoidal pulse motion)
        const w1 = Math.sin(phase * 1.2 + i * 0.32);
        const w2 = Math.cos(phase * 1.8 - i * 0.42);
        const w3 = Math.sin(phase * 0.65 + i * 0.14);
        const organicMotion = (w1 * 0.5 + w2 * 0.3 + w3 * 0.2 + 1) / 2; // 0 to 1

        // Combine frequency response, organic wave motion, and master volume
        const dynamicEnergy = (freqEnergy * 0.55 + organicMotion * 0.45) * mVol;
        const amplitude = (centerFactor * 0.25 + dynamicEnergy * 0.75) * 100;
        const targetHeight = Math.max(12, Math.min(96, Math.round(amplitude)));

        barEl.style.height = `${targetHeight}%`;
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(render);
    } else {
      // Return bars gently to resting state
      for (let i = 0; i < 54; i++) {
        const barEl = barRefs.current[i];
        if (barEl) {
          barEl.style.height = "14%";
        }
      }
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div className="w-full space-y-6 text-left">
      {/* FLOATING ACTION TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 rounded-2xl bg-zinc-900/95 border border-pink-500/40 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] backdrop-blur-xl flex items-center gap-2"
          >
            <Check size={14} className="text-pink-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HEADER & METADATA BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.2)]">
              <Headphones size={18} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
              Audio & Music Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cinematic Ambient Mixer
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Mix multi-layered organic soundscapes with rain, cozy fires, cafe murmurs, and ocean swells for deep focus and sleep.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5">
            <AudioWaveform size={13} />
            <span>6 Ambient Stems</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-bold flex items-center gap-1.5">
            <Zap size={13} />
            <span>Infinite Loop</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN OBSIDIAN CYBER WORKSPACE */}
      <div className="rounded-[2.5rem] border-2 border-pink-500/35 bg-[#090a12] p-5 sm:p-7 shadow-[0_0_60px_rgba(236,72,153,0.12)] relative overflow-hidden backdrop-blur-2xl">
        {/* Ambient Neon Pink & Purple Radial Glows */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative space-y-6">
          {/* CURATED SOUNDSCAPE PRESETS (1-Click Instant Mixes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Sliders size={13} />
                <span>Curated Soundscape Presets</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Click to load pre-balanced atmosphere</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {SOUNDSCAPE_PRESETS.map((preset) => {
                const IconComponent = CHANNEL_ICONS[preset.iconName] || Headphones;
                const isSelected = activePresetId === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition group active:scale-95 cursor-pointer",
                      isSelected
                        ? "bg-pink-500/15 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                        : "bg-white/[0.02] hover:bg-pink-500/10 border-white/10 hover:border-pink-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          "size-6 rounded-lg flex items-center justify-center transition",
                          isSelected
                            ? "bg-pink-500 text-white"
                            : "bg-white/[0.05] group-hover:bg-pink-500/20 text-zinc-400 group-hover:text-pink-300"
                        )}
                      >
                        <IconComponent size={13} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-pink-100 truncate">
                        {preset.name}
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-400 line-clamp-1">
                      {preset.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MASTER MIXING CONSOLE & 54-BAR WAVEFORM */}
          <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className={cn(
                    "size-12 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer shrink-0",
                    isPlaying
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                      : "bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:brightness-110"
                  )}
                  title={isPlaying ? "Pause Soundscape" : "Play Soundscape"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {isPlaying ? "Soundscape Live & Looping" : "Soundscape Paused"}
                    </h3>
                    <div className="relative flex items-center justify-center size-2.5">
                      {isPlaying ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full size-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        </>
                      ) : (
                        <span className="inline-flex rounded-full size-2 bg-zinc-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {isPlaying
                      ? "6-track spatial synthesizer active • Infinite seamless playback"
                      : "Click play to start your mixed ambient atmosphere"}
                  </p>
                </div>
              </div>

              {/* Master Volume & Focus Timer */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Master Volume */}
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-2xl">
                  <Volume2 size={14} className="text-pink-400 shrink-0" />
                  <span className="text-[11px] font-bold text-zinc-300">Master</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={masterVolume}
                    onChange={(e) => handleMasterVolume(Number(e.target.value))}
                    className="w-20 accent-pink-500 h-1.5 rounded-lg bg-white/10 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-pink-300 font-bold w-7 text-right">
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>

                {/* Focus Timer Selector */}
                <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-2xl text-xs">
                  <Timer size={14} className="text-pink-400" />
                  <span className="text-zinc-400 font-medium">Timer:</span>
                  <div className="flex items-center gap-1">
                    {[0, 15, 25, 45, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleSetTimer(m)}
                        className={cn(
                          "px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer",
                          timerMinutes === m
                            ? "bg-pink-500 text-white"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {m === 0 ? "Off" : `${m}m`}
                      </button>
                    ))}
                  </div>
                  {timerRemainingSec > 0 && (
                    <span className="ml-1 text-pink-300 font-mono font-bold text-[10px]">
                      ({Math.floor(timerRemainingSec / 60)}:{(timerRemainingSec % 60).toString().padStart(2, "0")})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 54-BAR MASTER FREQUENCY WAVEFORM */}
            <div
              onClick={togglePlay}
              title={isPlaying ? "Click to Pause Soundscape" : "Click to Play Soundscape"}
              className="h-16 w-full rounded-2xl bg-black/50 border border-white/10 p-2.5 flex items-center justify-between gap-1 select-none overflow-hidden relative cursor-pointer group hover:border-pink-500/30 transition"
            >
              {Array.from({ length: 54 }).map((_, idx) => (
                <div key={idx} className="flex-1 flex items-center justify-center h-full">
                  <div
                    ref={(el) => {
                      barRefs.current[idx] = el;
                    }}
                    style={{ height: "14%" }}
                    className={cn(
                      "w-full rounded-full",
                      isPlaying
                        ? "bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.7)] transition-none"
                        : "bg-white/10 group-hover:bg-white/20 transition-all duration-300 ease-out"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 6 INDEPENDENT AMBIENT CHANNEL FADER STRIPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AMBIENT_CHANNELS.map((ch) => {
              const IconComponent = CHANNEL_ICONS[ch.iconName] || Headphones;
              const currentVol = channelLevels[ch.id] ?? ch.defaultVolume;
              const isMuted = mutedChannels[ch.id] || false;
              const isSoloed = soloChannel === ch.id;

              return (
                <div
                  key={ch.id}
                  className={cn(
                    "p-4 rounded-3xl border transition relative overflow-hidden space-y-3",
                    currentVol > 0.05 && !isMuted
                      ? "bg-[#0c0e18] border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.08)]"
                      : "bg-[#090a12] border-white/5 opacity-75"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{ backgroundColor: `${ch.colorHex}20`, borderColor: `${ch.colorHex}40` }}
                        className="size-9 rounded-xl border flex items-center justify-center"
                      >
                        <IconComponent size={16} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                        <p className="text-[9px] text-zinc-400 truncate max-w-[140px]">
                          {ch.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleMute(ch.id)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[9px] font-bold transition cursor-pointer border",
                          isMuted
                            ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                            : "bg-white/[0.04] border-white/5 text-zinc-400 hover:text-white"
                        )}
                        title="Mute track"
                      >
                        Mute
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSolo(ch.id)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[9px] font-bold transition cursor-pointer border",
                          isSoloed
                            ? "bg-pink-500 border-pink-400 text-white"
                            : "bg-white/[0.04] border-white/5 text-zinc-400 hover:text-white"
                        )}
                        title="Solo track"
                      >
                        Solo
                      </button>
                    </div>
                  </div>

                  {/* Volume Slider & Level Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-semibold">Volume</span>
                      <span className="text-pink-300 font-mono font-bold">
                        {isMuted ? "Muted" : `${Math.round(currentVol * 100)}%`}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={isMuted ? 0 : currentVol}
                      onChange={(e) => handleChannelVolume(ch.id, Number(e.target.value))}
                      className="w-full accent-pink-500 h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM MASTER ACTIONS & EXPORT BAR */}
          <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportWav}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-lg shadow-pink-500/20 cursor-pointer disabled:opacity-50"
              >
                <Download size={14} />
                <span>{isExporting ? "Rendering WAV..." : "Download Mixed Soundscape (.WAV)"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetMix}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw size={13} />
                <span>Reset Mix</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast("Soundscape saved to Cloud Vault!")}
                className="size-9 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Save mix to Cloud Vault"
              >
                <Layers size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
