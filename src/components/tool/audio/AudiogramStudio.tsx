"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  AudioWaveform,
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
  CheckCircle2,
  Share2,
  FileAudio,
  Headphones,
  Video,
  ImageIcon,
  Type,
  Maximize2,
  Eye,
  Radio,
  Palette,
  Sparkle,
  Film,
  Camera,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// TYPES & THEMES
// ============================================================================

export type AspectRatioMode = "vertical" | "square" | "landscape";
export type WaveformStyle = "bars" | "radial" | "wave" | "dots";

export interface ColorTheme {
  id: string;
  name: string;
  badge: string;
  bgGrad: [string, string, string];
  waveColors: [string, string];
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
}

const COLOR_THEMES: ColorTheme[] = [
  {
    id: "obsidian-cyber",
    name: "Obsidian Neon",
    badge: "SIGNATURE",
    bgGrad: ["#080914", "#05060d", "#020306"],
    waveColors: ["#06b6d4", "#8b5cf6"], // Cyan to Purple
    cardBg: "rgba(15, 23, 42, 0.85)",
    cardBorder: "rgba(99, 102, 241, 0.4)",
    textPrimary: "#ffffff",
    textSecondary: "#94a3b8",
  },
  {
    id: "sunset-vibes",
    name: "Sunset Blaze",
    badge: "WARM",
    bgGrad: ["#1a081e", "#0f0414", "#06010a"],
    waveColors: ["#ec4899", "#f97316"], // Pink to Orange
    cardBg: "rgba(35, 12, 42, 0.85)",
    cardBorder: "rgba(236, 72, 153, 0.4)",
    textPrimary: "#ffffff",
    textSecondary: "#f472b6",
  },
  {
    id: "emerald-mint",
    name: "Emerald Aurora",
    badge: "ORGANIC",
    bgGrad: ["#06130d", "#030a07", "#010503"],
    waveColors: ["#10b981", "#06b6d4"], // Emerald to Cyan
    cardBg: "rgba(6, 32, 20, 0.85)",
    cardBorder: "rgba(16, 185, 129, 0.4)",
    textPrimary: "#ffffff",
    textSecondary: "#6ee7b7",
  },
  {
    id: "tokyo-indigo",
    name: "Tokyo Twilight",
    badge: "ELECTRIC",
    bgGrad: ["#0b0d22", "#070817", "#03040c"],
    waveColors: ["#6366f1", "#a855f7"], // Indigo to Violet
    cardBg: "rgba(19, 24, 56, 0.85)",
    cardBorder: "rgba(129, 140, 248, 0.4)",
    textPrimary: "#ffffff",
    textSecondary: "#a5b4fc",
  },
  {
    id: "golden-solaris",
    name: "Golden Solaris",
    badge: "PREMIUM",
    bgGrad: ["#171004", "#0e0a02", "#050301"],
    waveColors: ["#f59e0b", "#eab308"], // Amber to Gold
    cardBg: "rgba(38, 26, 6, 0.85)",
    cardBorder: "rgba(245, 158, 11, 0.4)",
    textPrimary: "#ffffff",
    textSecondary: "#fde047",
  },
];

interface SampleClip {
  id: string;
  title: string;
  speaker: string;
  category: string;
  description: string;
}

const SAMPLE_TEMPLATES: SampleClip[] = [
  {
    id: "tech-podcast",
    title: "Why Simple Tools Always Win Over Complex AI",
    speaker: "Alex Rivera • Tech Unfiltered Ep. 42",
    category: "Tech & Creator",
    description: "Viral quote hook discussing user experience and software design.",
  },
  {
    id: "startup-advice",
    title: "The 3 Things We Learned Scaling to 100k Users",
    speaker: "Sarah Chen • Founder Stories",
    category: "Startup & Growth",
    description: "Actionable founder advice for building fast without outside capital.",
  },
  {
    id: "mindset-quote",
    title: "Focus on Depth, Not Surface-Level Attention",
    speaker: "Marcus Reed • Daily Mindset",
    category: "Motivation",
    description: "Deep, resonant wisdom excerpt designed for viral Reels & TikTok.",
  },
];

// ============================================================================
// MAIN AUDIOGRAM STUDIO COMPONENT
// ============================================================================

export default function AudiogramStudio() {
  // Video Configuration State
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>("vertical");
  const [waveformStyle, setWaveformStyle] = useState<WaveformStyle>("bars");
  const [themeId, setThemeId] = useState<string>("obsidian-cyber");
  const activeTheme = COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[0];

  // Content State
  const [episodeTitle, setEpisodeTitle] = useState<string>("Why Simple Tools Always Win Over Complex AI");
  const [speakerName, setSpeakerName] = useState<string>("Alex Rivera • Tech Unfiltered Ep. 42");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  // Audio State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("Synthwave Lo-Fi Demo");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Video Recording & Export State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile segmented tabs
  const [mobileTab, setMobileTab] = useState<"video" | "audio" | "text" | "export">("video");

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Playback Timing Refs
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coverImageElementRef = useRef<HTMLImageElement | null>(null);

  // Preload cover image element when URL changes
  useEffect(() => {
    if (!coverImageUrl) {
      coverImageElementRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = coverImageUrl;
    img.onload = () => {
      coverImageElementRef.current = img;
    };
  }, [coverImageUrl]);

  // Format MM:SS helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --------------------------------------------------------------------------
  // SYNTHESIZE BUILT-IN DEMO SOUNDTRACK (In-Memory $0 Cost)
  // --------------------------------------------------------------------------
  const synthesizeDemoAudio = useCallback(async () => {
    const sampleRate = 44100;
    const dur = 15; // 15 seconds demo loop
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const buffer = ctx.createBuffer(2, sampleRate * dur, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Warm Lo-Fi Synth Chords + Bass Pulse
    const chordFreqs = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [196, 246.94, 293.66], // G
      [164.81, 196, 246.94], // Em
    ];

    for (let i = 0; i < sampleRate * dur; i++) {
      const t = i / sampleRate;
      const chordIndex = Math.floor((t / 3.75) % 4);
      const chord = chordFreqs[chordIndex];

      // Lo-fi tape warmth & chords
      let sample = 0;
      chord.forEach((freq, fIdx) => {
        const envelope = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 3.75);
        sample += Math.sin(2 * Math.PI * freq * t) * 0.15 * (1 - fIdx * 0.2) * envelope;
      });

      // Warm 55Hz sub-bass pulse on each measure
      const beat = (t % 0.9375) / 0.9375;
      const kickEnv = Math.exp(-beat * 8);
      const sub = Math.sin(2 * Math.PI * 55 * t) * kickEnv * 0.4;

      // Soft tape vinyl crackle
      const crackle = (Math.random() - 0.5) * 0.008;

      const mixed = (sample + sub + crackle) * 0.7;
      left[i] = mixed;
      right[i] = mixed;
    }

    setAudioBuffer(buffer);
    setDuration(dur);
    setAudioFileName("Synthwave Lo-Fi Demo");
  }, []);

  // Initialize demo track on first visit
  useEffect(() => {
    synthesizeDemoAudio();
  }, [synthesizeDemoAudio]);

  // --------------------------------------------------------------------------
  // AUDIO PLAYBACK & NODE MANAGEMENT
  // --------------------------------------------------------------------------
  const initAudioNodes = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
    }

    if (!gainNodeRef.current) {
      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : 1;
      gainNodeRef.current = gain;
    }

    if (!audioDestinationRef.current) {
      audioDestinationRef.current = ctx.createMediaStreamDestination();
    }
  };

  const handlePlay = (offset: number = pauseOffsetRef.current) => {
    if (!audioBuffer) return;
    initAudioNodes();
    const ctx = audioCtxRef.current!;

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // Safe ignore
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const analyser = analyserRef.current!;
    const gain = gainNodeRef.current!;
    const dest = audioDestinationRef.current!;

    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);
    gain.connect(dest); // Stream for recording

    source.onended = () => {
      if (ctx.currentTime - startTimeRef.current + pauseOffsetRef.current >= audioBuffer.duration - 0.2) {
        setIsPlaying(false);
        setCurrentTime(0);
        pauseOffsetRef.current = 0;
      }
    };

    startTimeRef.current = ctx.currentTime;
    pauseOffsetRef.current = offset;
    source.start(0, offset);
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (!sourceNodeRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const elapsed = ctx.currentTime - startTimeRef.current;
    pauseOffsetRef.current = Math.min(pauseOffsetRef.current + elapsed, duration);
    setCurrentTime(pauseOffsetRef.current);

    try {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    } catch {
      // Safe ignore
    }
    sourceNodeRef.current = null;
    setIsPlaying(false);
  };

  const handleSeek = (newTime: number) => {
    pauseOffsetRef.current = newTime;
    setCurrentTime(newTime);
    if (isPlaying) {
      handlePlay(newTime);
    }
  };

  const handleReset = () => {
    handlePause();
    pauseOffsetRef.current = 0;
    setCurrentTime(0);
  };

  // --------------------------------------------------------------------------
  // AUDIO FILE UPLOAD HANDLER
  // --------------------------------------------------------------------------
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handlePause();
    setAudioFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      setDuration(decoded.duration);
      setCurrentTime(0);
      pauseOffsetRef.current = 0;

      setToastMessage(`Loaded: ${file.name}`);
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      alert("Failed to read audio file. Please try an MP3, WAV, or AAC file.");
    }
  };

  // --------------------------------------------------------------------------
  // COVER IMAGE UPLOAD HANDLER
  // --------------------------------------------------------------------------
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCoverImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // --------------------------------------------------------------------------
  // LIVE CANVAS DRAWING LOOP (Renders Video Frames in Real Time)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set internal resolution based on Aspect Ratio
    let width = 1080;
    let height = 1920;
    if (aspectRatio === "square") {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === "landscape") {
      width = 1920;
      height = 1080;
    }

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const freqData = new Uint8Array(analyserRef.current ? analyserRef.current.frequencyBinCount : 64);

    const renderFrame = () => {
      // 1. Update current playhead time
      if (isPlaying && audioCtxRef.current) {
        const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
        const cur = Math.min(pauseOffsetRef.current + elapsed, duration);
        setCurrentTime(cur);
      }

      // 2. Fetch live audio frequency data
      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(freqData);
      } else {
        // Idle gentle breathing wave when paused
        const t = performance.now() / 800;
        for (let i = 0; i < freqData.length; i++) {
          freqData[i] = Math.floor(30 + 25 * Math.sin(t + i * 0.15));
        }
      }

      // Calculate bass power for pulsing avatar
      let bassSum = 0;
      for (let i = 0; i < 8; i++) bassSum += freqData[i] || 0;
      const bassEnergy = bassSum / 8 / 255; // 0 to 1

      // 3. Draw Background Atmosphere Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, activeTheme.bgGrad[0]);
      grad.addColorStop(0.5, activeTheme.bgGrad[1]);
      grad.addColorStop(1, activeTheme.bgGrad[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial glow orbs behind artwork
      const glowOrb = ctx.createRadialGradient(
        width / 2,
        height * 0.42,
        20,
        width / 2,
        height * 0.42,
        width * 0.6
      );
      glowOrb.addColorStop(0, `${activeTheme.waveColors[0]}44`);
      glowOrb.addColorStop(1, "transparent");
      ctx.fillStyle = glowOrb;
      ctx.fillRect(0, 0, width, height);

      // Subtle tech dots grid
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      const dotSpacing = 48;
      for (let x = 24; x < width; x += dotSpacing) {
        for (let y = 24; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Draw Central Cover Artwork Card
      const cardSize = aspectRatio === "vertical" ? width * 0.58 : width * 0.32;
      const cardCenterX = width / 2;
      const cardCenterY = aspectRatio === "vertical" ? height * 0.40 : height * 0.45;
      const cardScale = 1 + bassEnergy * 0.06;

      ctx.save();
      ctx.translate(cardCenterX, cardCenterY);
      ctx.scale(cardScale, cardScale);

      // Cover drop-shadow glow
      ctx.shadowColor = activeTheme.waveColors[0];
      ctx.shadowBlur = 40 * cardScale;

      const cardHalf = cardSize / 2;
      const cardRadius = 36;

      // Draw rounded squircle box
      ctx.beginPath();
      ctx.roundRect(-cardHalf, -cardHalf, cardSize, cardSize, cardRadius);
      ctx.fillStyle = activeTheme.cardBg;
      ctx.fill();

      // If user provided a cover photo, draw it clipped
      if (coverImageElementRef.current) {
        ctx.save();
        ctx.clip();
        ctx.drawImage(coverImageElementRef.current, -cardHalf, -cardHalf, cardSize, cardSize);
        ctx.restore();
      } else {
        // Futuristic vinyl disc placeholder
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, cardSize * 0.32, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, cardSize * 0.18, 0, Math.PI * 2);
        ctx.stroke();

        // Center jewel icon
        ctx.fillStyle = activeTheme.waveColors[0];
        ctx.beginPath();
        ctx.arc(0, 0, cardSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }

      // Border highlight rim
      ctx.strokeStyle = activeTheme.cardBorder;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-cardHalf, -cardHalf, cardSize, cardSize, cardRadius);
      ctx.stroke();
      ctx.restore();

      // 5. Draw Dynamic Audio Waveform
      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, activeTheme.waveColors[0]);
      waveGrad.addColorStop(1, activeTheme.waveColors[1]);

      // Style A: Classic Bouncing Bars
      if (waveformStyle === "bars") {
        const barCount = 42;
        const totalWaveWidth = width * (aspectRatio === "vertical" ? 0.85 : 0.65);
        const barWidth = totalWaveWidth / barCount - 6;
        const startX = (width - totalWaveWidth) / 2;
        const baseY = aspectRatio === "vertical" ? height * 0.66 : height * 0.75;
        const maxBarHeight = 160;

        for (let i = 0; i < barCount; i++) {
          const freqIndex = Math.floor((i / barCount) * (freqData.length * 0.7));
          const val = freqData[freqIndex] || 0;
          const h = Math.max(12, (val / 255) * maxBarHeight);
          const bx = startX + i * (barWidth + 6);

          ctx.fillStyle = waveGrad;
          ctx.beginPath();
          ctx.roundRect(bx, baseY - h / 2, barWidth, h, barWidth / 2);
          ctx.fill();

          // Mirror glass reflection below
          ctx.fillStyle = `${activeTheme.waveColors[0]}22`;
          ctx.beginPath();
          ctx.roundRect(bx, baseY + h / 2 + 8, barWidth, h * 0.35, barWidth / 2);
          ctx.fill();
        }
      }

      // Style B: Radial Energy Aura
      else if (waveformStyle === "radial") {
        const radius = cardSize * 0.64;
        const rayCount = 64;
        const cx = cardCenterX;
        const cy = cardCenterY;

        ctx.save();
        ctx.strokeStyle = waveGrad;
        ctx.lineCap = "round";

        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2;
          const freqIndex = Math.floor((i / rayCount) * (freqData.length * 0.6));
          const val = freqData[freqIndex] || 0;
          const rayLen = 15 + (val / 255) * 110;

          const x1 = cx + Math.cos(angle) * radius;
          const y1 = cy + Math.sin(angle) * radius;
          const x2 = cx + Math.cos(angle) * (radius + rayLen);
          const y2 = cy + Math.sin(angle) * (radius + rayLen);

          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Style C: Smooth Flowing Wave
      else if (waveformStyle === "wave") {
        const baseY = aspectRatio === "vertical" ? height * 0.66 : height * 0.75;
        const waveWidth = width * (aspectRatio === "vertical" ? 0.85 : 0.65);
        const startX = (width - waveWidth) / 2;
        const points = 36;
        const step = waveWidth / points;

        ctx.save();
        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = 6;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.shadowColor = activeTheme.waveColors[0];
        ctx.shadowBlur = 18;

        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const freqIndex = Math.floor((i / points) * (freqData.length * 0.5));
          const val = freqData[freqIndex] || 0;
          const offset = Math.sin((i / 4) + performance.now() / 400) * ((val / 255) * 85);
          const px = startX + i * step;
          const py = baseY + offset;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Style D: Bouncing Dots
      else if (waveformStyle === "dots") {
        const dotCount = 36;
        const waveWidth = width * (aspectRatio === "vertical" ? 0.85 : 0.65);
        const step = waveWidth / dotCount;
        const startX = (width - waveWidth) / 2;
        const baseY = aspectRatio === "vertical" ? height * 0.66 : height * 0.75;

        for (let i = 0; i < dotCount; i++) {
          const freqIndex = Math.floor((i / dotCount) * (freqData.length * 0.6));
          const val = freqData[freqIndex] || 0;
          const bounce = (val / 255) * 70;
          const dx = startX + i * step;
          const dy = baseY - bounce;

          ctx.fillStyle = waveGrad;
          ctx.beginPath();
          ctx.arc(dx, dy, 6 + (val / 255) * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Draw Episode Title & Speaker Captions
      ctx.textAlign = "center";

      // Speaker / Host Badge
      const textBaseY = aspectRatio === "vertical" ? height * 0.76 : height * 0.82;
      ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = activeTheme.textSecondary;
      ctx.fillText(speakerName.toUpperCase(), width / 2, textBaseY);

      // Episode Title
      ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = activeTheme.textPrimary;

      // Wrap title if long
      const words = episodeTitle.split(" ");
      let line = "";
      let currentLineY = textBaseY + 54;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width * 0.85 && n > 0) {
          ctx.fillText(line.trim(), width / 2, currentLineY);
          line = words[n] + " ";
          currentLineY += 54;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), width / 2, currentLineY);

      // 7. Live Audio Timestamp Pill
      const pillY = height - 80;
      const pillWidth = 240;
      const pillHeight = 46;

      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.roundRect((width - pillWidth) / 2, pillY, pillWidth, pillHeight, 23);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "bold 20px monospace";
      ctx.fillStyle = activeTheme.textPrimary;
      ctx.fillText(
        `${formatTime(currentTime)} / ${formatTime(duration)}`,
        width / 2,
        pillY + 30
      );

      // 8. Progress Conduit Line at Bottom Edge
      const progressPercent = duration > 0 ? currentTime / duration : 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, height - 8, width, 8);

      ctx.fillStyle = waveGrad;
      ctx.fillRect(0, height - 8, width * progressPercent, 8);

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [aspectRatio, waveformStyle, activeTheme, episodeTitle, speakerName, isPlaying, currentTime, duration]);

  // --------------------------------------------------------------------------
  // 1-CLICK HD VIDEO EXPORT ENGINE (Canvas + Web Audio MediaRecorder)
  // --------------------------------------------------------------------------
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer || isRecording) return;

    setIsRecording(true);
    setRecordingProgress(0);
    setExportedVideoUrl(null);

    // Stop live playback
    handlePause();
    pauseOffsetRef.current = 0;
    setCurrentTime(0);

    initAudioNodes();
    const ctx = audioCtxRef.current!;

    // 1. Capture stream from canvas (30 FPS)
    const canvasStream = canvas.captureStream(30);

    // 2. Audio destination stream
    const audioDest = audioDestinationRef.current!;

    // 3. Combine tracks into single stream
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDest.stream.getAudioTracks(),
    ]);

    // 4. Select supported codec
    let mimeType = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm;codecs=vp8,opus";
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
    }

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 4500000, // 4.5 Mbps HD
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: mimeType });
      const videoUrl = URL.createObjectURL(videoBlob);
      setExportedVideoUrl(videoUrl);
      setIsRecording(false);
      setRecordingProgress(100);

      // Auto trigger download
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `podcast-reel-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setToastMessage("HD Video rendered & downloaded successfully!");
      setTimeout(() => setToastMessage(null), 3000);
    };

    recorder.start(100);

    // 5. Play audio from 0 into recorder
    handlePlay(0);

    // Track progress intervals
    const recordStartTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - recordStartTime) / 1000;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 99);
      setRecordingProgress(pct);

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        recorder.stop();
        handlePause();
      }
    }, 200);
  };

  // 1-Click Snapshot (PNG Still Card)
  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `audiogram-cover-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setToastMessage("Saved snapshot card as PNG!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load Preset
  const handleLoadPreset = (preset: SampleClip) => {
    setEpisodeTitle(preset.title);
    setSpeakerName(preset.speaker);
    setToastMessage(`Loaded: ${preset.category}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col gap-6 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[1700px] mx-auto text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <AudioWaveform className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Audio Waveform Video Maker
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                100% Free • HD 1080p
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Turn voice clips, podcast soundbites, and music into animated waveform videos for Instagram Reels, TikTok, and Shorts.
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleDownloadSnapshot}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] hover:border-white/[0.2] transition-all active:scale-95"
            title="Download still frame PNG for thumbnail"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Save Cover PNG</span>
          </button>

          <button
            onClick={handleExportVideo}
            disabled={isRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isRecording ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Rendering {recordingProgress}%...</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                <span>Export HD Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-xl bg-slate-900/80 border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("video")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "video"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Stage</span>
        </button>
        <button
          onClick={() => setMobileTab("audio")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "audio"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <AudioWaveform className="w-3.5 h-3.5" />
          <span>Style</span>
        </button>
        <button
          onClick={() => setMobileTab("text")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "text"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Titles</span>
        </button>
        <button
          onClick={() => setMobileTab("export")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "export"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* Main Studio Grid: Left Controls + Center/Right Live Video Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Settings */}
        <div
          className={cn(
            "lg:col-span-5 flex-col gap-6",
            mobileTab === "video" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Panel 1: Screen Shape & Waveform Style */}
          <div
            className={cn(
              "flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl",
              mobileTab !== "audio" && mobileTab !== "video" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Video Shape & Waveform</h3>
            </div>

            {/* Screen Shape (Aspect Ratio) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Social Platform Shape</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAspectRatio("vertical")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    aspectRatio === "vertical"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="w-4 h-6 border-2 border-current rounded-sm" />
                  <span>9:16 Reels</span>
                </button>
                <button
                  onClick={() => setAspectRatio("square")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    aspectRatio === "square"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="w-5 h-5 border-2 border-current rounded-sm" />
                  <span>1:1 Square</span>
                </button>
                <button
                  onClick={() => setAspectRatio("landscape")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    aspectRatio === "landscape"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="w-6 h-4 border-2 border-current rounded-sm" />
                  <span>16:9 YouTube</span>
                </button>
              </div>
            </div>

            {/* Waveform Style */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Animation Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setWaveformStyle("bars")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl border text-xs font-medium transition-all text-center",
                    waveformStyle === "bars"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Bouncing Bars
                </button>
                <button
                  onClick={() => setWaveformStyle("radial")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl border text-xs font-medium transition-all text-center",
                    waveformStyle === "radial"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Radial Aura
                </button>
                <button
                  onClick={() => setWaveformStyle("wave")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl border text-xs font-medium transition-all text-center",
                    waveformStyle === "wave"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Smooth Wave
                </button>
                <button
                  onClick={() => setWaveformStyle("dots")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl border text-xs font-medium transition-all text-center",
                    waveformStyle === "dots"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Pulse Dots
                </button>
              </div>
            </div>

            {/* Atmosphere Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Glow Palette & Lighting</label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setThemeId(theme.id)}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all",
                        isSelected
                          ? "bg-white/[0.08] border-cyan-500/60 text-white shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${theme.waveColors[0]}, ${theme.waveColors[1]})`,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-200">{theme.name}</div>
                        <div className="text-[10px] text-slate-500">{theme.badge}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panel 2: Audio Clip & Cover Image */}
          <div
            className={cn(
              "flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl",
              mobileTab !== "audio" && mobileTab !== "video" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Audio & Artwork</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono truncate max-w-[160px]">
                {audioFileName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Audio File Upload */}
              <label className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer transition-all text-center group">
                <Upload className="w-5 h-5 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">Upload Audio Clip</span>
                <span className="text-[10px] text-slate-500 mt-0.5">MP3, WAV, M4A, AAC</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </label>

              {/* Cover Photo Upload */}
              <label className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer transition-all text-center group">
                <ImageIcon className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">
                  {coverImageUrl ? "Change Cover Photo" : "Add Cover Photo"}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Panel 3: Titles & Captions */}
          <div
            className={cn(
              "flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl",
              mobileTab !== "text" && mobileTab !== "video" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Titles & Captions</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Quote / Episode Title</label>
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                placeholder="Catchy hook or question..."
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Speaker / Podcast Name</label>
              <input
                type="text"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                placeholder="Host Name • Show Title"
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Panel 4: Presets */}
          <div
            className={cn(
              "flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl",
              mobileTab !== "export" && mobileTab !== "video" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Sample Templates</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleLoadPreset(tpl)}
                  className="flex flex-col p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {tpl.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {tpl.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Video Stage Canvas & Audio Player */}
        <div
          className={cn(
            "lg:col-span-7 flex-col gap-4 items-center",
            mobileTab !== "video" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Main Video Canvas Showcase Frame */}
          <div className="relative w-full flex items-center justify-center p-3 sm:p-6 rounded-2xl bg-black/80 border border-white/[0.08] overflow-hidden shadow-2xl">
            {/* Ambient Backlight Glow */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25 blur-3xl transition-colors duration-500"
              style={{
                background: `radial-gradient(circle at center, ${activeTheme.waveColors[0]}, transparent 70%)`,
              }}
            />

            {/* The Live Rendering Canvas Element */}
            <canvas
              ref={canvasRef}
              className={cn(
                "rounded-xl shadow-2xl transition-all duration-300 border border-white/[0.12] max-h-[620px] w-auto",
                aspectRatio === "vertical" && "aspect-[9/16]",
                aspectRatio === "square" && "aspect-square",
                aspectRatio === "landscape" && "aspect-video"
              )}
            />

            {/* Rendering Overlay during Video Export */}
            {isRecording && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-50 animate-in fade-in duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  <span className="absolute font-bold text-lg text-white">
                    {recordingProgress}%
                  </span>
                </div>
                <div className="text-center">
                  <h4 className="text-base font-bold text-white">Rendering HD Audiogram...</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Capturing synchronized audio and glowing waveforms in 1080p
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AUDIO PLAYER & SCRUBBER BAR */}
          <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            {/* Scrubber Seekbar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-xs font-mono text-slate-400 w-12">
                {formatTime(duration)}
              </span>
            </div>

            {/* Audio Control Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={isPlaying ? handlePause : () => handlePlay()}
                  className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center transition-transform active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  title={isPlaying ? "Pause" : "Play preview"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                  title="Reset to beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="hidden sm:inline font-mono">
                  {aspectRatio === "vertical" ? "1080 × 1920 (9:16)" : aspectRatio === "square" ? "1080 × 1080 (1:1)" : "1920 × 1080 (16:9)"}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                  {waveformStyle.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* MediaPipelineBar Integration */}
          <div className="w-full">
            <MediaPipelineBar
              imageUrl="/og-image.png"
              imageName="audiogram-cover.png"
              sourceToolId="audiogram"
              sourceToolName="Audio Waveform Video Maker"
              actions={["compressor", "resizer", "converter", "meme"]}
              title="Next Action Pipeline"
              subtitle="Pass your video artwork or snapshot directly into companion tools"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
