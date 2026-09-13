"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Music,
  Disc3,
  Clock,
  Flame,
  Zap,
  Radio,
  Church,
  Gauge,
  CheckCircle2,
  Share2,
  FileAudio,
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// SOUND PRESETS & TYPES (100% Plain English)
// ============================================================================

export interface SoundPreset {
  id: string;
  name: string;
  badge: string;
  speed: number;
  reverb: number; // 0 to 1
  bass: number; // 0 to 12 dB
  icon: string;
  description: string;
}

const SOUND_PRESETS: SoundPreset[] = [
  {
    id: "slowed-reverb",
    name: "Slowed + Reverb",
    badge: "VIRAL TIKTOK",
    speed: 0.85,
    reverb: 0.65,
    bass: 4.5,
    icon: "🌌",
    description: "The classic melancholic slowed pitch with deep concert hall echo.",
  },
  {
    id: "nightcore",
    name: "Sped Up / Nightcore",
    badge: "HIGH ENERGY",
    speed: 1.25,
    reverb: 0.15,
    bass: 2.0,
    icon: "🏎️",
    description: "Fast upbeat tempo with high pitch and punchy kick drums.",
  },
  {
    id: "cathedral",
    name: "Cathedral Echoes",
    badge: "IMMERSIVE",
    speed: 0.78,
    reverb: 0.90,
    bass: 6.0,
    icon: "⛪",
    description: "Deep heavy slowdown with massive, endless room decay.",
  },
  {
    id: "lofi-midnight",
    name: "Midnight Lo-Fi",
    badge: "WARM CHILL",
    speed: 0.90,
    reverb: 0.40,
    bass: 5.0,
    icon: "📻",
    description: "Smooth late-night relaxation with warm sub-bass presence.",
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

// Synthesize a relaxing 12-second 80s Synthwave Demo Track in memory
function generateSampleAudio(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 10;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Chord progression: Am -> F -> C -> G (2.5s each)
  const chords = [
    [220.0, 261.63, 329.63], // Am (A3, C4, E4)
    [174.61, 220.0, 261.63], // F  (F3, A3, C4)
    [130.81, 164.81, 196.0],  // C  (C3, E3, G3)
    [196.0, 246.94, 293.66], // G  (G3, B3, D4)
  ];

  for (let i = 0; i < length; i++) {
    const time = i / sampleRate;
    const chordIndex = Math.floor((time / 2.5) % 4);
    const chord = chords[chordIndex];

    // Synth pad harmonics
    let sample = 0;
    chord.forEach((freq) => {
      sample += Math.sin(2 * Math.PI * freq * time) * 0.12;
      sample += Math.sin(2 * Math.PI * (freq * 2) * time) * 0.05;
      sample += Math.sin(2 * Math.PI * (freq * 0.5) * time) * 0.08;
    });

    // Soft beat pulse
    const beatTime = (time * 2) % 1; // 120 bpm pulse
    const kick = Math.sin(2 * Math.PI * 65 * beatTime) * Math.exp(-beatTime * 12) * 0.25;

    // Pan slightly between channels
    left[i] = (sample + kick) * 0.8;
    right[i] = (sample * 0.9 + kick) * 0.8;
  }

  return buffer;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SlowedReverbStudio() {
  // Audio context & node references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Playback tracking
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Audio State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string>("Sample_Synthwave_Beat.mp3");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Sound Effects Controls
  const [speed, setSpeed] = useState<number>(0.85); // 0.50x to 1.50x
  const [reverb, setReverb] = useState<number>(0.65); // 0 to 1
  const [bass, setBass] = useState<number>(4.5); // 0 to 12 dB
  const [volume, setVolume] = useState<number>(0.85); // 0 to 1

  // UI state
  const [activeTab, setActiveTab] = useState<"player" | "effects" | "presets">("player");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Update Reverb Impulse Response on Convolver Node
  const updateReverb = useCallback(
    (ctx: BaseAudioContext, convolver: ConvolverNode, wetGain: GainNode, dryGain: GainNode, amount: number) => {
      if (amount <= 0.02) {
        wetGain.gain.setValueAtTime(0, ctx.currentTime);
        dryGain.gain.setValueAtTime(1, ctx.currentTime);
        return;
      }
      const duration = 0.5 + amount * 3.5;
      const decay = 2.2 - amount * 0.9;
      const impulse = createImpulseResponse(ctx, duration, decay);
      convolver.buffer = impulse;
      wetGain.gain.setValueAtTime(amount * 0.85, ctx.currentTime);
      dryGain.gain.setValueAtTime(Math.max(0.2, 1 - amount * 0.5), ctx.currentTime);
    },
    []
  );

  // Build real-time graph nodes
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
        masterNode.gain.value = volume;
        masterGainRef.current = masterNode;

        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 128;
        analyserNode.smoothingTimeConstant = 0.8;
        analyserRef.current = analyserNode;

        // Routing:
        // Source -> BassFilter
        // BassFilter -> DryGain -> MasterGain
        // BassFilter -> Convolver -> WetGain -> MasterGain
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
    [bass, reverb, volume, updateReverb]
  );

  // Load Built-in Demo Track on Mount
  useEffect(() => {
    const ctx = getAudioContext();
    const demoBuffer = generateSampleAudio(ctx);
    setAudioBuffer(demoBuffer);
    setDuration(demoBuffer.duration);
  }, [getAudioContext]);

  // Handle Audio File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ctx = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Stop current playback
      stopPlayback();
      setAudioBuffer(decodedBuffer);
      setDuration(decodedBuffer.duration);
      setFileName(file.name);
      pauseOffsetRef.current = 0;
      setCurrentTime(0);
    } catch {
      alert("Could not decode audio file. Please try a valid MP3, WAV, or M4A file.");
    }
  };

  // Play audio from specified offset
  const playFromOffset = useCallback(
    (offsetSeconds: number) => {
      if (!audioBuffer) return;
      const ctx = getAudioContext();
      setupAudioGraph(ctx);

      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
        } catch {
          // ignore
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = speed;
      source.connect(bassFilterRef.current!);

      source.onended = () => {
        // If track naturally reached the end
        if (sourceNodeRef.current === source) {
          setIsPlaying(false);
          pauseOffsetRef.current = 0;
          setCurrentTime(0);
        }
      };

      const clampedOffset = Math.max(0, Math.min(offsetSeconds, audioBuffer.duration));
      source.start(0, clampedOffset);
      sourceNodeRef.current = source;
      startTimeRef.current = ctx.currentTime - clampedOffset / speed;
      pauseOffsetRef.current = clampedOffset;
      setIsPlaying(true);
    },
    [audioBuffer, speed, getAudioContext, setupAudioGraph]
  );

  // Stop playback cleanly
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      // Pause
      const ctx = getAudioContext();
      const elapsed = (ctx.currentTime - startTimeRef.current) * speed;
      pauseOffsetRef.current = elapsed;
      stopPlayback();
    } else {
      // Play
      playFromOffset(pauseOffsetRef.current);
    }
  };

  // Reset track to start
  const handleReset = () => {
    stopPlayback();
    pauseOffsetRef.current = 0;
    setCurrentTime(0);
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioBuffer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * audioBuffer.duration;

    pauseOffsetRef.current = targetTime;
    setCurrentTime(targetTime);

    if (isPlaying) {
      playFromOffset(targetTime);
    }
  };

  // Dynamic parameter changes while playing
  useEffect(() => {
    if (sourceNodeRef.current && audioCtxRef.current) {
      sourceNodeRef.current.playbackRate.setValueAtTime(speed, audioCtxRef.current.currentTime);
    }
  }, [speed]);

  useEffect(() => {
    if (bassFilterRef.current && audioCtxRef.current) {
      bassFilterRef.current.gain.setValueAtTime(bass, audioCtxRef.current.currentTime);
    }
  }, [bass]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    if (audioCtxRef.current && convolverRef.current && wetGainRef.current && dryGainRef.current) {
      updateReverb(audioCtxRef.current, convolverRef.current, wetGainRef.current, dryGainRef.current, reverb);
    }
  }, [reverb, updateReverb]);

  // Apply Sound Preset
  const handleApplyPreset = (preset: SoundPreset) => {
    setSpeed(preset.speed);
    setReverb(preset.reverb);
    setBass(preset.bass);
  };

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(64);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);

      // Track current playhead time
      if (isPlaying && audioCtxRef.current && audioBuffer) {
        const elapsed = (audioCtxRef.current.currentTime - startTimeRef.current) * speed;
        setCurrentTime(Math.min(audioBuffer.duration, elapsed));
      }

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Idle gentle waveform
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, dataArray[i] * 0.92);
        }
      }

      // Draw canvas visualizer
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / dataArray.length) * 1.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i];
        const percent = val / 255;
        const barHeight = Math.max(4, percent * height * 0.85);

        // Neon violet to cyan gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, "rgba(168, 85, 247, 0.2)");
        gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.8)");
        gradient.addColorStop(1, "rgba(6, 182, 212, 1)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

        // Specular glowing cap
        if (val > 20) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillRect(x, height - barHeight - 2, barWidth - 2, 2);
        }

        x += barWidth;
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, speed, audioBuffer]);

  // 1-Click Offline Audio Export (WAV Download)
  const handleDownloadWav = async () => {
    if (!audioBuffer || isExporting) return;
    setIsExporting(true);
    setExportProgress(10);

    try {
      // Calculated duration of output including reverb tail
      const outputDuration = audioBuffer.duration / speed + (reverb > 0.1 ? 3.5 : 0.5);
      const sampleRate = 44100;
      const totalFrames = Math.ceil(outputDuration * sampleRate);

      const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

      // Build identical node chain in offlineCtx
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = speed;

      const bassNode = offlineCtx.createBiquadFilter();
      bassNode.type = "lowshelf";
      bassNode.frequency.value = 120;
      bassNode.gain.value = bass;

      const dryGain = offlineCtx.createGain();
      const wetGain = offlineCtx.createGain();
      const convolver = offlineCtx.createConvolver();

      updateReverb(offlineCtx, convolver, wetGain, dryGain, reverb);

      // Routing
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
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Top Banner / Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b0f19]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">Viral Sound Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SOUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white transition-all active:scale-95 flex items-center gap-1"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="lg:hidden flex items-center p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1">
        <button
          onClick={() => setActiveTab("player")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "player"
              ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Music className="w-3.5 h-3.5" />
          Player
        </button>
        <button
          onClick={() => setActiveTab("effects")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "effects"
              ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          Sound Effects
        </button>
        <button
          onClick={() => setActiveTab("presets")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "presets"
              ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Presets
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: AUDIO PLAYER & NEON VISUALIZER */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-7 space-y-5",
            activeTab !== "player" ? "hidden lg:block" : "block"
          )}
        >
          {/* Main Visualizer Stage */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#080914] border border-purple-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden space-y-5">
            {/* Top Bar: Track Name & Audio Upload Button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                  <Disc3 className={cn("w-5 h-5", isPlaying && "animate-spin")} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{fileName}</div>
                  <div className="text-xs text-zinc-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>

              {/* Upload Song Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                Drop Any Song
              </button>
            </div>

            {/* Reactive Visualizer Canvas */}
            <div className="h-36 sm:h-44 w-full rounded-2xl bg-black/50 border border-white/[0.06] flex items-center justify-center relative overflow-hidden p-2">
              <canvas
                ref={canvasRef}
                width={640}
                height={160}
                className="w-full h-full object-cover"
              />

              {!isPlaying && currentTime === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs text-center p-3 pointer-events-none">
                  <Sparkles className="w-6 h-6 text-purple-400 mb-1 animate-pulse" />
                  <span className="text-xs font-semibold text-zinc-200">Tap Play to listen to the slowed + reverb mix</span>
                  <span className="text-[11px] text-zinc-400">Sample synthwave track loaded and ready</span>
                </div>
              )}
            </div>

            {/* Scrubbable Seekbar */}
            <div className="space-y-1.5">
              <div
                onClick={handleSeek}
                className="w-full h-3 rounded-full bg-white/[0.08] hover:bg-white/[0.12] cursor-pointer relative overflow-hidden transition-colors"
              >
                <div
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full relative"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_white]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Big Friendly Player Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  title="Restart Track"
                  className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Master Play / Pause Button */}
              <button
                onClick={handleTogglePlay}
                className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 hover:opacity-95 text-white flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              {/* Download Action Button */}
              <button
                onClick={handleDownloadWav}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? `Rendering ${exportProgress}%...` : "Download Audio"}
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: SOUND SLIDERS & PRESETS */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-5 space-y-5",
            activeTab === "player" ? "hidden lg:block" : "block"
          )}
        >
          {/* Section: Sound Effects Sliders */}
          <div className="p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-pink-400" />
              Sound Customizer (Real-Time)
            </h3>

            {/* Slider 1: Speed & Pitch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-purple-400" />
                  Speed & Pitch
                </label>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {speed.toFixed(2)}x {speed < 1.0 ? "(Slowed)" : speed > 1.0 ? "(Sped Up)" : "(Normal)"}
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="1.50"
                step="0.01"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg bg-white/[0.1] accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>0.50x (Ultra Slow)</span>
                <span className="text-purple-400 font-bold">0.85x (Gold Ratio)</span>
                <span>1.50x (Nightcore)</span>
              </div>
            </div>

            {/* Slider 2: Cathedral Reverb */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Church className="w-3.5 h-3.5 text-pink-400" />
                  Room Reverb & Echo
                </label>
                <span className="text-xs font-mono font-bold text-pink-300">
                  {Math.round(reverb * 100)}% {reverb > 0.7 ? "(Cathedral)" : reverb > 0.3 ? "(Hall)" : "(Clean)"}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                value={reverb}
                onChange={(e) => setReverb(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg bg-white/[0.1] accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>0% (Dry)</span>
                <span className="text-pink-400 font-bold">65% (Concert)</span>
                <span>100% (Grand Cathedral)</span>
              </div>
            </div>

            {/* Slider 3: Deep Bass Rumble */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Deep Bass Rumble
                </label>
                <span className="text-xs font-mono font-bold text-amber-300">
                  +{bass.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={bass}
                onChange={(e) => setBass(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg bg-white/[0.1] accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>0 dB (Flat)</span>
                <span className="text-amber-400 font-bold">+4.5 dB (Punchy)</span>
                <span>+12 dB (Heavy Sub)</span>
              </div>
            </div>

            {/* Slider 4: Master Volume */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  Listening Volume
                </label>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-white/[0.1] accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Sound Presets Grid */}
          <div className="p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              1-Click Style Presets
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {SOUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-purple-500/30 text-left transition-all active:scale-95 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 group-hover:text-purple-300">
                      {preset.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-purple-200">{preset.name}</div>
                  <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
