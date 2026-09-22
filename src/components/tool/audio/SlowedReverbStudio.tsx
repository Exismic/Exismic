"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  Volume2,
  VolumeX,
  Disc3,
  Flame,
  Zap,
  Radio,
  Gauge,
  Headphones,
  Waves,
  Repeat,
  Activity,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// SOUND PRESETS & TYPES
// ============================================================================

export interface SoundPreset {
  id: string;
  name: string;
  badge: string;
  speed: number;
  reverb: number; // 0 to 1
  bass: number; // 0 to 12 dB
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const SOUND_PRESETS: SoundPreset[] = [
  {
    id: "slowed-reverb",
    name: "Slowed + Reverb",
    badge: "VIRAL SLOWED",
    speed: 0.85,
    reverb: 0.65,
    bass: 4.5,
    icon: Waves,
  },
  {
    id: "nightcore",
    name: "Sped Up (Nightcore)",
    badge: "HIGH ENERGY",
    speed: 1.25,
    reverb: 0.15,
    bass: 2.0,
    icon: Zap,
  },
  {
    id: "cathedral",
    name: "Cathedral Echoes",
    badge: "DREAMY ECHO",
    speed: 0.75,
    reverb: 0.90,
    bass: 6.0,
    icon: Radio,
  },
  {
    id: "lofi-midnight",
    name: "Midnight Lo-Fi",
    badge: "CHILL LO-FI",
    speed: 0.90,
    reverb: 0.40,
    bass: 5.0,
    icon: Headphones,
  },
  {
    id: "bass-boost",
    name: "Club Bass Boost",
    badge: "DEEP BASS",
    speed: 1.00,
    reverb: 0.20,
    bass: 10.0,
    icon: Flame,
  },
  {
    id: "submerged",
    name: "Submerged Echo",
    badge: "DREAMLIKE",
    speed: 0.80,
    reverb: 0.75,
    bass: 3.5,
    icon: Activity,
  },
];

// Helper to format seconds into mm:ss
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// Generate in-memory synthetic impulse response for convolution reverb
function createImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const t = i / length;
    const envelope = Math.pow(1 - t, decay);
    left[i] = (Math.random() * 2 - 1) * envelope;
    right[i] = (Math.random() * 2 - 1) * envelope;
  }
  return impulse;
}

// Encode AudioBuffer into 16-bit Stereo PCM WAV Blob (100% Client-Side)
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let resultBuffer: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    resultBuffer = new Float32Array(left.length * 2);
    for (let i = 0; i < left.length; i++) {
      resultBuffer[i * 2] = left[i];
      resultBuffer[i * 2 + 1] = right[i];
    }
  } else {
    resultBuffer = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = resultBuffer.length * bytesPerSample;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Float to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < resultBuffer.length; i++) {
    const s = Math.max(-1, Math.min(1, resultBuffer[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Built-in Initial Demo Track (10-second 80s Synthwave)
function generateInitialDemoTrack(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 10;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const chords = [
    [220.0, 261.63, 329.63], // Am
    [174.61, 220.0, 261.63], // F
    [130.81, 164.81, 196.0],  // C
    [196.0, 246.94, 293.66], // G
  ];

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    const chordIndex = Math.floor((time / 2.5) % 4);
    const chord = chords[chordIndex];

    let sample = 0;
    chord.forEach((freq) => {
      sample += Math.sin(2 * Math.PI * freq * time) * 0.12;
      sample += Math.sin(2 * Math.PI * (freq * 2) * time) * 0.05;
      sample += Math.sin(2 * Math.PI * (freq * 0.5) * time) * 0.08;
    });

    const beatTime = (time * 2) % 1;
    const kick = Math.sin(2 * Math.PI * 65 * beatTime) * Math.exp(-beatTime * 12) * 0.25;

    left[i] = (sample + kick) * 0.8;
    right[i] = (sample * 0.9 + kick) * 0.8;
  }

  return buffer;
}

// ============================================================================
// SLEEK DSP RANGE SLIDER COMPONENT
// ============================================================================

interface DspSliderProps {
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  badgeText?: string;
  accent: "cyan" | "indigo" | "amber" | "emerald";
  shortcuts: { label: string; value: number }[];
  onChange: (val: number) => void;
}

function DspSlider({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  displayValue,
  badgeText,
  accent,
  shortcuts,
  onChange,
}: DspSliderProps) {
  const accentConfig = {
    cyan: {
      hex: "#06b6d4",
      iconColor: "text-cyan-400",
      badgeColor: "text-cyan-300",
      thumbBorder: "[&::-webkit-slider-thumb]:border-cyan-400 [&::-moz-range-thumb]:border-cyan-400",
      thumbShadow: "[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(6,182,212,0.85)]",
      activeChip: "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.25)] font-bold",
    },
    indigo: {
      hex: "#6366f1",
      iconColor: "text-indigo-400",
      badgeColor: "text-indigo-300",
      thumbBorder: "[&::-webkit-slider-thumb]:border-indigo-400 [&::-moz-range-thumb]:border-indigo-400",
      thumbShadow: "[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(99,102,241,0.85)]",
      activeChip: "bg-indigo-500/20 text-indigo-300 border-indigo-400/50 shadow-[0_0_8px_rgba(99,102,241,0.25)] font-bold",
    },
    amber: {
      hex: "#f59e0b",
      iconColor: "text-amber-400",
      badgeColor: "text-amber-300",
      thumbBorder: "[&::-webkit-slider-thumb]:border-amber-400 [&::-moz-range-thumb]:border-amber-400",
      thumbShadow: "[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(245,158,11,0.85)]",
      activeChip: "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-bold",
    },
    emerald: {
      hex: "#10b981",
      iconColor: "text-emerald-400",
      badgeColor: "text-emerald-300",
      thumbBorder: "[&::-webkit-slider-thumb]:border-emerald-400 [&::-moz-range-thumb]:border-emerald-400",
      thumbShadow: "[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(16,185,129,0.85)]",
      activeChip: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.25)] font-bold",
    },
  };

  const cfg = accentConfig[accent];
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
            <Icon size={13} className={cfg.iconColor} />
          </div>
          <label className="text-xs font-semibold text-zinc-200">{label}</label>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <span className={cn("text-xs font-bold", cfg.badgeColor)}>
            {displayValue}
          </span>
          {badgeText && (
            <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06]">
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Custom Sleek Slider Track (Eliminates white Windows bar) */}
      <div className="relative py-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${cfg.hex} 0%, ${cfg.hex} ${pct}%, #27272a ${pct}%, #27272a 100%)`,
          }}
          className={cn(
            "w-full h-2 rounded-full appearance-none cursor-pointer outline-none transition-all",
            "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1.25 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-115",
            cfg.thumbBorder,
            cfg.thumbShadow,
            "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent",
            "[&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer",
            cfg.thumbBorder
          )}
        />
      </div>

      {/* Tactile Quick-Select Chips */}
      <div className="grid grid-cols-4 gap-1.5 pt-0.5">
        {shortcuts.map((sc) => {
          const isActive = Math.abs(value - sc.value) < 0.01;
          return (
            <button
              key={sc.label}
              type="button"
              onClick={() => onChange(sc.value)}
              className={cn(
                "py-1 px-1 text-[10px] font-mono rounded-lg border transition-all text-center truncate cursor-pointer",
                isActive
                  ? cfg.activeChip
                  : "bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-zinc-200 border-white/[0.06]"
              )}
            >
              {sc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SlowedReverbStudio() {
  // Web Audio Context & Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Playhead Tracking Refs (Robust dynamic speed & seek compensation)
  const animFrameRef = useRef<number | null>(null);
  const playheadPositionRef = useRef<number>(0);
  const lastAnchorTimeRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(0.85);
  const hasInitializedRef = useRef<boolean>(false);
  const hasUploadedCustomAudioRef = useRef<boolean>(false);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const durationRef = useRef<number>(0);
  const isLoopingRef = useRef<boolean>(true);

  // Audio State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string>("Sample_Synthwave_Beat.mp3");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Sound Effects Controls
  const [speed, setSpeed] = useState<number>(0.85); // 0.50x to 1.50x
  const [reverb, setReverb] = useState<number>(0.65); // 0 to 1
  const [bass, setBass] = useState<number>(4.5); // 0 to 12 dB
  const [volume, setVolume] = useState<number>(0.85); // 0 to 1
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // UI state
  const [activeTab, setActiveTab] = useState<"player" | "effects" | "presets">("player");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [activePresetId, setActivePresetId] = useState<string>("slowed-reverb");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Live stereo meter levels
  const [meterL, setMeterL] = useState<number>(0);
  const [meterR, setMeterR] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with refs
  useEffect(() => {
    isLoopingRef.current = isLooping;
    if (sourceNodeRef.current) {
      sourceNodeRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    audioBufferRef.current = audioBuffer;
  }, [audioBuffer]);

  // Initialize Web Audio Context
  const getAudioContext = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Update Reverb Impulse Response
  const updateReverb = useCallback(
    (ctx: BaseAudioContext, convolver: ConvolverNode, wetGain: GainNode, dryGain: GainNode, amount: number) => {
      if (amount <= 0.02) {
        wetGain.gain.setValueAtTime(0, ctx.currentTime);
        dryGain.gain.setValueAtTime(1, ctx.currentTime);
        return;
      }
      const reverbDuration = 0.5 + amount * 3.5;
      const decay = 2.2 - amount * 0.9;
      const impulse = createImpulseResponse(ctx, reverbDuration, decay);
      convolver.buffer = impulse;
      wetGain.gain.setValueAtTime(amount * 0.85, ctx.currentTime);
      dryGain.gain.setValueAtTime(Math.max(0.2, 1 - amount * 0.5), ctx.currentTime);
    },
    []
  );

  // Build Real-Time Graph Nodes
  const setupAudioGraph = useCallback(
    (ctx: AudioContext) => {
      if (!bassFilterRef.current) {
        const bassNode = ctx.createBiquadFilter();
        bassNode.type = "lowshelf";
        bassNode.frequency.value = 120;
        bassNode.gain.value = bass;
        bassFilterRef.current = bassNode;

        const convNode = ctx.createConvolver();
        convolverRef.current = convNode;

        const wetNode = ctx.createGain();
        wetGainRef.current = wetNode;

        const dryNode = ctx.createGain();
        dryGainRef.current = dryNode;

        const masterNode = ctx.createGain();
        masterNode.gain.value = isMuted ? 0 : volume;
        masterGainRef.current = masterNode;

        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 128;
        analyserNode.smoothingTimeConstant = 0.8;
        analyserRef.current = analyserNode;

        // Routing:
        // Source -> BassFilter -> DryGain -> MasterGain
        // Source -> BassFilter -> Convolver -> WetGain -> MasterGain
        // MasterGain -> Analyser -> Destination
        bassNode.connect(dryNode);
        dryNode.connect(masterNode);

        bassNode.connect(convNode);
        convNode.connect(wetNode);
        wetNode.connect(masterNode);

        masterNode.connect(analyserNode);
        analyserNode.connect(ctx.destination);

        updateReverb(ctx, convNode, wetNode, dryNode, reverb);
      }
    },
    [bass, reverb, volume, isMuted, updateReverb]
  );

  // Load Built-in Demo Track on Initial Mount (Guarded so it NEVER overwrites uploaded files)
  useEffect(() => {
    if (hasInitializedRef.current || hasUploadedCustomAudioRef.current) return;
    hasInitializedRef.current = true;
    const ctx = getAudioContext();
    const demoBuffer = generateInitialDemoTrack(ctx);
    if (!hasUploadedCustomAudioRef.current) {
      audioBufferRef.current = demoBuffer;
      setAudioBuffer(demoBuffer);
      durationRef.current = demoBuffer.duration;
      setDuration(demoBuffer.duration);
    }
  }, [getAudioContext]);

  // Stop playback cleanly
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setMeterL(0);
    setMeterR(0);
  }, []);

  // Play audio from specified offset with anchor compensation
  const playFromOffset = useCallback(
    (offsetSeconds: number) => {
      const activeBuf = audioBufferRef.current;
      if (!activeBuf) return;
      const ctx = getAudioContext();
      setupAudioGraph(ctx);

      stopPlayback();

      const source = ctx.createBufferSource();
      source.buffer = activeBuf;
      source.playbackRate.value = currentSpeedRef.current;
      source.loop = isLoopingRef.current;
      source.connect(bassFilterRef.current!);

      source.onended = () => {
        if (!isLoopingRef.current) {
          setIsPlaying(false);
          playheadPositionRef.current = 0;
          setCurrentTime(0);
        }
      };

      const clampedOffset = Math.max(0, Math.min(offsetSeconds, activeBuf.duration));
      source.start(0, clampedOffset);
      sourceNodeRef.current = source;
      playheadPositionRef.current = clampedOffset;
      lastAnchorTimeRef.current = ctx.currentTime;
      setIsPlaying(true);
    },
    [getAudioContext, setupAudioGraph, stopPlayback]
  );

  // Handle Audio File Upload (Permanently locks out demo buffer overwrite)
  const handleProcessFile = async (file: File) => {
    if (!file) return;
    try {
      const ctx = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

      stopPlayback();
      hasUploadedCustomAudioRef.current = true;
      audioBufferRef.current = decodedBuffer;
      setAudioBuffer(decodedBuffer);
      durationRef.current = decodedBuffer.duration;
      setDuration(decodedBuffer.duration);
      setFileName(file.name);
      playheadPositionRef.current = 0;
      setCurrentTime(0);
    } catch {
      alert("Could not decode audio file. Please try a valid MP3, WAV, or M4A file.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
    e.target.value = "";
  };

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      if (audioCtxRef.current && audioBufferRef.current) {
        const now = audioCtxRef.current.currentTime;
        const dur = audioBufferRef.current.duration;
        const elapsedSinceAnchor = (now - lastAnchorTimeRef.current) * currentSpeedRef.current;
        let pos = playheadPositionRef.current + elapsedSinceAnchor;
        if (isLoopingRef.current && dur > 0) {
          pos = pos % dur;
        } else {
          pos = Math.min(dur, pos);
        }
        playheadPositionRef.current = pos;
        setCurrentTime(pos);
      }
      stopPlayback();
    } else {
      playFromOffset(playheadPositionRef.current);
    }
  }, [isPlaying, playFromOffset, stopPlayback]);

  // Handle Speed Change (Sample-accurate, NEVER cuts off music or changes duration)
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying && audioCtxRef.current && sourceNodeRef.current) {
      const now = audioCtxRef.current.currentTime;
      const dur = audioBufferRef.current?.duration || 0;
      const elapsedSinceAnchor = (now - lastAnchorTimeRef.current) * currentSpeedRef.current;
      let currentPos = playheadPositionRef.current + elapsedSinceAnchor;
      if (isLoopingRef.current && dur > 0) {
        currentPos = currentPos % dur;
      } else {
        currentPos = Math.min(dur, currentPos);
      }

      playheadPositionRef.current = currentPos;
      lastAnchorTimeRef.current = now;
      currentSpeedRef.current = newSpeed;

      // Update Web Audio hardware rate seamlessly
      sourceNodeRef.current.playbackRate.setValueAtTime(newSpeed, now);
    } else {
      currentSpeedRef.current = newSpeed;
    }
  };

  // Skip ±5 seconds
  const handleSkip = (seconds: number) => {
    const dur = durationRef.current;
    if (!dur) return;
    const newTime = Math.max(0, Math.min(dur, currentTime + seconds));
    playheadPositionRef.current = newTime;
    setCurrentTime(newTime);
    if (isPlaying) {
      playFromOffset(newTime);
    }
  };

  // Reset track to start
  const handleReset = () => {
    stopPlayback();
    playheadPositionRef.current = 0;
    setCurrentTime(0);
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const dur = durationRef.current;
    if (!dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * dur;

    playheadPositionRef.current = targetTime;
    setCurrentTime(targetTime);

    if (isPlaying) {
      playFromOffset(targetTime);
    }
  };

  // Dynamic DSP node updates
  useEffect(() => {
    if (bassFilterRef.current && audioCtxRef.current) {
      bassFilterRef.current.gain.setValueAtTime(bass, audioCtxRef.current.currentTime);
    }
  }, [bass]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioCtxRef.current && convolverRef.current && wetGainRef.current && dryGainRef.current) {
      updateReverb(audioCtxRef.current, convolverRef.current, wetGainRef.current, dryGainRef.current, reverb);
    }
  }, [reverb, updateReverb]);

  // Keyboard Shortcuts (Space: Play/Pause, L: Loop, R: Reset Flat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === "KeyL") {
        e.preventDefault();
        setIsLooping((prev) => !prev);
      } else if (e.code === "KeyR") {
        e.preventDefault();
        handleSpeedChange(1.0);
        setReverb(0);
        setBass(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTogglePlay]);

  // Apply Sound Preset
  const handleApplyPreset = (preset: SoundPreset) => {
    setActivePresetId(preset.id);
    handleSpeedChange(preset.speed);
    setReverb(preset.reverb);
    setBass(preset.bass);
  };

  // High-DPI Visualizer & Continuous Playhead Tracker
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(64);
    let idlePhase = 0;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      idlePhase += 0.04;

      // Track playhead continuously with anchored calculation
      if (isPlaying && audioCtxRef.current && audioBufferRef.current) {
        const now = audioCtxRef.current.currentTime;
        const dur = audioBufferRef.current.duration;
        const elapsedSinceAnchor = (now - lastAnchorTimeRef.current) * currentSpeedRef.current;
        let pos = playheadPositionRef.current + elapsedSinceAnchor;
        if (isLoopingRef.current && dur > 0) {
          pos = pos % dur;
        } else {
          pos = Math.min(dur, pos);
        }
        setCurrentTime(pos);
      }

      // Responsive Retina canvas resolution
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Studio measurement grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 1;
      for (let y = 0; y < displayHeight; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(displayWidth, y);
        ctx.stroke();
      }

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);

        // Peak levels for stereo meters
        let sumLow = 0;
        let sumHigh = 0;
        for (let i = 0; i < 32; i++) sumLow += dataArray[i];
        for (let i = 32; i < 64; i++) sumHigh += dataArray[i];
        const lvlL = Math.min(100, Math.round((sumLow / (32 * 255)) * 100 * (1 + bass * 0.05)));
        const lvlR = Math.min(100, Math.round((sumHigh / (32 * 255)) * 100));
        setMeterL(lvlL);
        setMeterR(lvlR);

        // Live Neon Spectrum Bars
        const barCount = 48;
        const totalSpacing = 3;
        const barWidth = Math.max(3, (displayWidth - (barCount * totalSpacing)) / barCount);
        let x = 6;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i] || 0;
          const percent = val / 255;
          const barHeight = Math.max(4, percent * displayHeight * 0.85);

          const gradient = ctx.createLinearGradient(0, displayHeight, 0, displayHeight - barHeight);
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.2)");
          gradient.addColorStop(0.6, "rgba(99, 102, 241, 0.85)");
          gradient.addColorStop(1, "rgba(6, 182, 212, 1)");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, displayHeight - barHeight, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          if (val > 20) {
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "rgba(6, 182, 212, 0.9)";
            ctx.shadowBlur = 6;
            ctx.fillRect(x, displayHeight - barHeight - 2, barWidth, 2);
            ctx.shadowBlur = 0;
          }

          x += barWidth + totalSpacing;
        }
      } else {
        // Idle State: Breathing Organic Sinusoidal Wave
        ctx.lineWidth = 2;
        const waveGradient = ctx.createLinearGradient(0, 0, displayWidth, 0);
        waveGradient.addColorStop(0, "rgba(6, 182, 212, 0.2)");
        waveGradient.addColorStop(0.5, "rgba(99, 102, 241, 0.8)");
        waveGradient.addColorStop(1, "rgba(168, 85, 247, 0.2)");

        ctx.strokeStyle = waveGradient;
        ctx.beginPath();
        const midY = displayHeight / 2;

        for (let xPos = 0; xPos < displayWidth; xPos += 3) {
          const wave = Math.sin((xPos * 0.015) + idlePhase) * 12 * Math.sin((xPos / displayWidth) * Math.PI);
          if (xPos === 0) ctx.moveTo(xPos, midY + wave);
          else ctx.lineTo(xPos, midY + wave);
        }
        ctx.stroke();

        ctx.fillStyle = "rgba(6, 182, 212, 0.12)";
        ctx.fillRect(0, midY - 1, displayWidth, 2);
      }

      ctx.restore();
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, bass]);

  // 1-Click Offline Audio Export (16-Bit WAV Download)
  const handleDownloadWav = async () => {
    const activeBuf = audioBufferRef.current;
    if (!activeBuf || isExporting) return;
    setIsExporting(true);
    setExportProgress(10);

    try {
      const outputDuration = activeBuf.duration / speed + (reverb > 0.1 ? 3.5 : 0.5);
      const sampleRate = 44100;
      const totalFrames = Math.ceil(outputDuration * sampleRate);

      const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

      const source = offlineCtx.createBufferSource();
      source.buffer = activeBuf;
      source.playbackRate.value = speed;

      const bassNode = offlineCtx.createBiquadFilter();
      bassNode.type = "lowshelf";
      bassNode.frequency.value = 120;
      bassNode.gain.value = bass;

      const dryGain = offlineCtx.createGain();
      const wetGain = offlineCtx.createGain();
      const convolver = offlineCtx.createConvolver();

      updateReverb(offlineCtx, convolver, wetGain, dryGain, reverb);

      source.connect(bassNode);
      bassNode.connect(dryGain);
      dryGain.connect(offlineCtx.destination);

      bassNode.connect(convolver);
      convolver.connect(wetGain);
      wetGain.connect(offlineCtx.destination);

      source.start(0);

      setExportProgress(40);
      const renderedBuffer = await offlineCtx.startRendering();
      setExportProgress(80);

      const wavBlob = audioBufferToWavBlob(renderedBuffer);
      setExportProgress(100);

      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      a.download = `${baseName}-slowed-reverb.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to render audio. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5 pb-20 sm:pb-24 lg:pb-0">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#090c16]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Slowed & Reverb Studio</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                Instant Preview
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Slow down songs, add dreamy echo, boost bass, and download clean audio</p>
          </div>
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="lg:hidden grid grid-cols-3 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg">
        <button
          onClick={() => setActiveTab("player")}
          className={cn(
            "py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeTab === "player"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Player</span>
        </button>
        <button
          onClick={() => setActiveTab("effects")}
          className={cn(
            "py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeTab === "effects"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Adjust Sound</span>
        </button>
        <button
          onClick={() => setActiveTab("presets")}
          className={cn(
            "py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeTab === "presets"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Styles</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: AUDIO PLAYER & QUICK SOUND PRESETS */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-7 space-y-4",
            activeTab !== "player" && activeTab !== "presets" ? "hidden lg:block" : "block"
          )}
        >
          <div
            className={cn(
              "p-5 sm:p-6 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4",
              activeTab !== "player" ? "hidden lg:block" : "block"
            )}
          >
            {/* Top Track Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-xs">
                  <Disc3 className={cn("w-5 h-5", isPlaying && "animate-spin")} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate tracking-tight">{fileName}</div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                    <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-cyan-400 font-semibold">{speed.toFixed(2)}x Speed</span>
                  </div>
                </div>
              </div>

              {/* Upload Song Trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Song</span>
              </button>
            </div>

            {/* Reactive Visualizer Canvas Stage */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessFile(file);
              }}
              className={cn(
                "h-44 sm:h-52 w-full rounded-2xl bg-[#04060d] border transition-all flex flex-col items-center justify-center relative overflow-hidden p-2 shadow-inner",
                isDragging ? "border-cyan-400 bg-cyan-950/20" : "border-white/[0.08]"
              )}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full block"
              />


              {/* Drag overlay prompt */}
              {isDragging && (
                <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-cyan-300 text-xs font-bold gap-1 z-10 pointer-events-none">
                  <Upload className="w-6 h-6 animate-bounce" />
                  <span>Drop your song to load</span>
                </div>
              )}

              {/* Real-Time Stereo Channel Peak Meters (VU Meter) */}
              <div className="absolute bottom-2 inset-x-3 flex items-center justify-between gap-3 px-3 py-1 rounded-xl bg-black/60 border border-white/[0.06] backdrop-blur-md">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-bold text-zinc-400">L</span>
                  <div className="h-1.5 flex-1 bg-white/[0.08] rounded-full overflow-hidden relative">
                    <div
                      style={{ width: `${meterL}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-400 rounded-full transition-all duration-75"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-bold text-zinc-400">R</span>
                  <div className="h-1.5 flex-1 bg-white/[0.08] rounded-full overflow-hidden relative">
                    <div
                      style={{ width: `${meterR}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-400 rounded-full transition-all duration-75"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scrubbable Seekbar */}
            <div className="space-y-1.5 pt-1">
              <div
                onClick={handleSeek}
                className="w-full h-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] cursor-pointer relative overflow-hidden transition-colors"
              >
                <div
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 rounded-full relative"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span className="text-zinc-500 text-[10px]">
                  {isLooping ? "Looping song" : "Plays once"}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Master Transport Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Restart Track"
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(-5)}
                  title="Rewind 5s"
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer hidden sm:flex items-center justify-center text-xs font-mono font-bold"
                >
                  -5s
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(5)}
                  title="Forward 5s"
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer hidden sm:flex items-center justify-center text-xs font-mono font-bold"
                >
                  +5s
                </button>

                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  title={isLooping ? "Loop Enabled" : "Loop Disabled"}
                  className={cn(
                    "p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-1",
                    isLooping
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-xs"
                      : "bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white"
                  )}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Master Play / Pause Button */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white flex items-center justify-center shadow-[0_0_28px_rgba(6,182,212,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] border border-white/25 transition-all active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              {/* High-Fidelity WAV Export */}
              <button
                type="button"
                onClick={handleDownloadWav}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] border border-indigo-400/30 bg-no-repeat bg-clip-padding overflow-hidden flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? `Saving ${exportProgress}%...` : "Download Song (WAV)"}</span>
              </button>
            </div>
          </div>

          {/* Section: Instant Sound Styles (Directly Below Player) */}
          <div
            className={cn(
              "p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-3",
              activeTab !== "presets" ? "hidden lg:block" : "block"
            )}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Waves className="w-3.5 h-3.5 text-indigo-400" />
                <span>Instant Sound Styles</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">6 Popular Styles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {SOUND_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      "group relative p-3 rounded-2xl border text-left transition-all duration-150 active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-2.5",
                      isSelected
                        ? "bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-transparent border-cyan-400/60 shadow-[0_0_18px_rgba(6,182,212,0.18)]"
                        : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07] hover:border-white/[0.12]"
                    )}
                  >
                    {/* Header: Icon + Title + Badge */}
                    <div className="flex items-start justify-between gap-1.5 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                            isSelected
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs"
                              : "bg-white/[0.04] text-zinc-400 border-white/[0.08] group-hover:text-zinc-200"
                          )}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white leading-tight">
                            {preset.name}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mt-0.5">
                            {preset.badge}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                          <Check size={11} className="stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {/* Clean Specs Bar (Proportional columns, zero truncation) */}
                    <div className="grid grid-cols-[1fr_1.35fr_1fr] gap-1.5 pt-0.5 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                      <span className={cn("py-0.5 px-1 rounded bg-black/40 border border-white/[0.05] text-center whitespace-nowrap", isSelected && "text-cyan-300 border-cyan-500/30")}>
                        {preset.speed.toFixed(2)}x
                      </span>
                      <span className={cn("py-0.5 px-1.5 rounded bg-black/40 border border-white/[0.05] text-center whitespace-nowrap font-medium", isSelected && "text-indigo-300 border-indigo-500/30")}>
                        {Math.round(preset.reverb * 100)}% Echo
                      </span>
                      <span className={cn("py-0.5 px-1 rounded bg-black/40 border border-white/[0.05] text-center whitespace-nowrap", isSelected && "text-amber-300 border-amber-500/30")}>
                        +{preset.bass.toFixed(1)}dB
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: CUSTOMIZE SOUND */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-5 space-y-4",
            activeTab !== "effects" ? "hidden lg:block" : "block"
          )}
        >
          {/* Sound Customizer Card */}
          <div className="p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Customize Sound</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  handleSpeedChange(1.0);
                  setReverb(0);
                  setBass(0);
                }}
                className="text-[11px] text-zinc-500 hover:text-cyan-300 transition-colors cursor-pointer font-medium"
              >
                Reset All
              </button>
            </div>

            {/* Slider 1: Song Speed & Pitch */}
            <DspSlider
              label="Speed & Pitch"
              icon={Gauge}
              value={speed}
              min={0.50}
              max={1.50}
              step={0.01}
              displayValue={`${speed.toFixed(2)}x`}
              badgeText={speed < 1.0 ? "Slowed" : speed > 1.0 ? "Sped Up" : "Normal"}
              accent="cyan"
              shortcuts={[
                { label: "0.75x Slow", value: 0.75 },
                { label: "0.85x Slowed", value: 0.85 },
                { label: "1.00x Normal", value: 1.00 },
                { label: "1.25x Fast", value: 1.25 },
              ]}
              onChange={handleSpeedChange}
            />

            {/* Slider 2: Echo & Reverb */}
            <DspSlider
              label="Echo & Reverb"
              icon={Waves}
              value={reverb}
              min={0}
              max={1}
              step={0.01}
              displayValue={`${Math.round(reverb * 100)}%`}
              badgeText={reverb > 0.7 ? "Dreamy" : reverb > 0.3 ? "Concert" : "Off"}
              accent="indigo"
              shortcuts={[
                { label: "0% Off", value: 0 },
                { label: "35% Light", value: 0.35 },
                { label: "65% Concert Hall", value: 0.65 },
                { label: "90% Deep Echo", value: 0.90 },
              ]}
              onChange={setReverb}
            />

            {/* Slider 3: Bass Boost */}
            <DspSlider
              label="Bass Boost"
              icon={Flame}
              value={bass}
              min={0}
              max={12}
              step={0.5}
              displayValue={`+${bass.toFixed(1)} dB`}
              badgeText={bass >= 8 ? "Heavy Bass" : bass >= 4 ? "Punchy" : "Normal"}
              accent="amber"
              shortcuts={[
                { label: "0 dB Off", value: 0 },
                { label: "+4.5 dB Punchy", value: 4.5 },
                { label: "+8.0 dB Deep", value: 8.0 },
                { label: "+12 dB Max Bass", value: 12.0 },
              ]}
              onChange={setBass}
            />

            {/* Slider 4: Volume */}
            <DspSlider
              label="Volume"
              icon={isMuted ? VolumeX : Volume2}
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.01}
              displayValue={isMuted ? "MUTED" : `${Math.round(volume * 100)}%`}
              accent="emerald"
              shortcuts={[
                { label: "Mute", value: 0 },
                { label: "50% Medium", value: 0.50 },
                { label: "85% Normal", value: 0.85 },
                { label: "100% Max", value: 1.00 },
              ]}
              onChange={(val) => {
                setVolume(val);
                if (isMuted && val > 0) setIsMuted(false);
                if (val === 0) setIsMuted(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM FLOATING ACTION BAR */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-2.5 rounded-2xl bg-[#090b14]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0 active:scale-95 shadow-md cursor-pointer"
          >
            {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
          </button>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{fileName}</div>
            <div className="text-[10px] text-zinc-400 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)} • {speed.toFixed(2)}x
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadWav}
          disabled={isExporting}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 active:scale-95 shadow-md border border-indigo-400/30 bg-no-repeat bg-clip-padding overflow-hidden cursor-pointer disabled:opacity-50"
        >
          <Download size={13} />
          <span>{isExporting ? `${exportProgress}%` : "WAV"}</span>
        </button>
      </div>
    </div>
  );
}
