"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  AudioWaveform,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Sliders,
  Music,
  Disc3,
  CheckCircle2,
  Headphones,
  Video,
  ImageIcon,
  Type,
  Maximize2,
  Eye,
  Radio,
  Palette,
  Film,
  Camera,
  Layers,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  BookOpen,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// TYPES & THEMES (Zero Emojis, Authentic Vector Accents)
// ============================================================================

export type AspectRatioMode = "vertical" | "square" | "portrait" | "landscape";
export type WaveformStyle = "bars" | "radial" | "wave" | "dots";
export type CoverShape = "squircle" | "vinyl";
export type FontStyle = "sans" | "display" | "mono";

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
    name: "Obsidian Cyan",
    badge: "SIGNATURE",
    bgGrad: ["#070914", "#04050b", "#020306"],
    waveColors: ["#06b6d4", "#8b5cf6"], // Cyan to Purple
    cardBg: "rgba(12, 18, 36, 0.88)",
    cardBorder: "rgba(99, 102, 241, 0.45)",
    textPrimary: "#ffffff",
    textSecondary: "#94a3b8",
  },
  {
    id: "sunset-blaze",
    name: "Sunset Blaze",
    badge: "WARM",
    bgGrad: ["#18071a", "#0e0310", "#050108"],
    waveColors: ["#ec4899", "#f97316"], // Pink to Orange
    cardBg: "rgba(35, 12, 42, 0.88)",
    cardBorder: "rgba(236, 72, 153, 0.45)",
    textPrimary: "#ffffff",
    textSecondary: "#f472b6",
  },
  {
    id: "emerald-matrix",
    name: "Emerald Aurora",
    badge: "ORGANIC",
    bgGrad: ["#05130b", "#020905", "#010402"],
    waveColors: ["#10b981", "#06b6d4"], // Emerald to Cyan
    cardBg: "rgba(6, 32, 20, 0.88)",
    cardBorder: "rgba(16, 185, 129, 0.45)",
    textPrimary: "#ffffff",
    textSecondary: "#6ee7b7",
  },
  {
    id: "tokyo-twilight",
    name: "Tokyo Twilight",
    badge: "ELECTRIC",
    bgGrad: ["#0a0c20", "#060714", "#03040b"],
    waveColors: ["#6366f1", "#a855f7"], // Indigo to Violet
    cardBg: "rgba(19, 24, 56, 0.88)",
    cardBorder: "rgba(129, 140, 248, 0.45)",
    textPrimary: "#ffffff",
    textSecondary: "#a5b4fc",
  },
  {
    id: "golden-solaris",
    name: "Golden Solaris",
    badge: "PREMIUM",
    bgGrad: ["#171003", "#0d0902", "#040201"],
    waveColors: ["#f59e0b", "#eab308"], // Amber to Gold
    cardBg: "rgba(38, 26, 6, 0.88)",
    cardBorder: "rgba(245, 158, 11, 0.45)",
    textPrimary: "#ffffff",
    textSecondary: "#fde047",
  },
  {
    id: "crimson-phantom",
    name: "Crimson Phantom",
    badge: "INTENSE",
    bgGrad: ["#190508", "#0e0204", "#050102"],
    waveColors: ["#f43f5e", "#fb7185"], // Rose to Coral
    cardBg: "rgba(42, 10, 16, 0.88)",
    cardBorder: "rgba(244, 63, 94, 0.45)",
    textPrimary: "#ffffff",
    textSecondary: "#fda4af",
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
    category: "Tech & Product",
    description: "Punchy dialogue quote addressing user experience, speed, and software clarity.",
  },
  {
    id: "startup-advice",
    title: "The 3 Things We Learned Scaling to 100k Users",
    speaker: "Sarah Chen • Founder Stories",
    category: "Business & Growth",
    description: "Actionable founder lesson on building viral loops without outside venture capital.",
  },
  {
    id: "mindset-quote",
    title: "Focus on Depth, Not Surface-Level Attention",
    speaker: "Marcus Reed • Daily Mindset",
    category: "Mindset & Life",
    description: "Resonant philosophical wisdom excerpt designed for viral Reels & TikTok.",
  },
  {
    id: "music-soundbite",
    title: "Midnight Drive in Tokyo (Synthwave Remix)",
    speaker: "KAVINSKY • Electronic Sessions",
    category: "Music & Beats",
    description: "Hypnotic synth bassline visualizer for music producers and DJ teasers.",
  },
];

// ============================================================================
// MAIN COMPONENT: AUDIOGRAM STUDIO
// ============================================================================

export default function AudiogramStudio() {
  // Video Layout & Format State
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>("vertical");
  const [waveformStyle, setWaveformStyle] = useState<WaveformStyle>("bars");
  const [themeId, setThemeId] = useState<string>("obsidian-cyber");
  const activeTheme = COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[0];

  // Visual Customization State
  const [coverShape, setCoverShape] = useState<CoverShape>("squircle");
  const [fontStyle, setFontStyle] = useState<FontStyle>("sans");
  const [waveHeightMultiplier, setWaveHeightMultiplier] = useState<number>(1.0);
  const [useBlurredBackdrop, setUseBlurredBackdrop] = useState<boolean>(true);

  // Content State
  const [episodeTitle, setEpisodeTitle] = useState<string>("Why Simple Tools Always Win Over Complex AI");
  const [speakerName, setSpeakerName] = useState<string>("Alex Rivera • Tech Unfiltered Ep. 42");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  // Audio Playback State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("Synthwave Lo-Fi Demo");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Video Recording & Export State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Navigation Tabs
  const [mobileTab, setMobileTab] = useState<"stage" | "style" | "audio" | "titles">("stage");

  // Web Audio Context & Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Playback Timing Refs
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas & Image Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coverImageElementRef = useRef<HTMLImageElement | null>(null);
  const vinylRotationAngleRef = useRef<number>(0);

  // Trigger Toast (Centered below navbar)
  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2200);
  };

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

  // Format Time MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --------------------------------------------------------------------------
  // IN-MEMORY DEMO AUDIO SYNTHESIZER ($0 Server Cost)
  // --------------------------------------------------------------------------
  const synthesizeDemoAudio = useCallback(async () => {
    const sampleRate = 44100;
    const dur = 15; // 15 seconds loop
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const buffer = ctx.createBuffer(2, sampleRate * dur, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Warm Lo-Fi Synth Chords: Am -> F -> G -> Em
    const chordFreqs = [
      [220, 261.63, 329.63],
      [174.61, 220, 261.63],
      [196, 246.94, 293.66],
      [164.81, 196, 246.94],
    ];

    for (let i = 0; i < sampleRate * dur; i++) {
      const t = i / sampleRate;
      const chordIndex = Math.floor((t / 3.75) % 4);
      const chord = chordFreqs[chordIndex];

      let sample = 0;
      chord.forEach((freq, fIdx) => {
        const envelope = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 3.75);
        sample += Math.sin(2 * Math.PI * freq * t) * 0.14 * (1 - fIdx * 0.2) * envelope;
      });

      // Warm 55Hz sub-bass thump on every 4 beats
      const beat = (t % 0.9375) / 0.9375;
      const kickEnv = Math.exp(-beat * 7.5);
      const sub = Math.sin(2 * Math.PI * 55 * t) * kickEnv * 0.42;

      // Subtle vintage vinyl warmth
      const crackle = (Math.random() - 0.5) * 0.006;

      const mixed = (sample + sub + crackle) * 0.72;
      left[i] = mixed;
      right[i] = mixed;
    }

    setAudioBuffer(buffer);
    setDuration(dur);
    setAudioFileName("Synthwave Lo-Fi Demo (Built-in)");
  }, []);

  // Initialize demo track on load
  useEffect(() => {
    synthesizeDemoAudio();
  }, [synthesizeDemoAudio]);

  // --------------------------------------------------------------------------
  // AUDIO NODES & PLAYBACK MANAGEMENT
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
    gain.connect(dest); // Connect to recorder destination stream

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

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = nextMuted ? 0 : 1;
    }
  };

  // --------------------------------------------------------------------------
  // FILE UPLOAD HANDLERS
  // --------------------------------------------------------------------------
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handlePause();
    setAudioFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      setDuration(decoded.duration);
      setCurrentTime(0);
      pauseOffsetRef.current = 0;

      triggerToast(`Loaded audio: ${file.name}`);
    } catch {
      triggerToast("Could not decode audio. Try standard MP3 or WAV.");
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCoverImageUrl(dataUrl);
      triggerToast("Custom cover artwork applied");
    };
    reader.readAsDataURL(file);
  };

  // --------------------------------------------------------------------------
  // LIVE CANVAS RENDERING ENGINE (30 FPS Reactive Visualizer)
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
    } else if (aspectRatio === "portrait") {
      width = 1080;
      height = 1350; // 4:5 Instagram Portrait
    } else if (aspectRatio === "landscape") {
      width = 1920;
      height = 1080; // 16:9 YouTube
    }

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const freqData = new Uint8Array(analyserRef.current ? analyserRef.current.frequencyBinCount : 64);

    const renderFrame = () => {
      // 1. Synchronize Playhead
      if (isPlaying && audioCtxRef.current) {
        const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
        const cur = Math.min(pauseOffsetRef.current + elapsed, duration);
        setCurrentTime(cur);

        // Advance vinyl spin if vinyl mode
        if (coverShape === "vinyl") {
          vinylRotationAngleRef.current += 0.015;
        }
      }

      // 2. Fetch Audio Spectrum Data
      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(freqData);
      } else {
        // Subtle ambient idle pulse when paused
        const t = performance.now() / 900;
        for (let i = 0; i < freqData.length; i++) {
          freqData[i] = Math.floor(28 + 22 * Math.sin(t + i * 0.18));
        }
      }

      // Calculate bass energy for reactive pulsing
      let bassSum = 0;
      for (let i = 0; i < 8; i++) bassSum += freqData[i] || 0;
      const bassEnergy = bassSum / 8 / 255; // 0 to 1

      // 3. Draw Background
      if (useBlurredBackdrop && coverImageElementRef.current) {
        // Blurred Cover Background
        ctx.save();
        ctx.filter = "blur(60px) brightness(0.35) saturate(1.4)";
        ctx.drawImage(coverImageElementRef.current, -100, -100, width + 200, height + 200);
        ctx.restore();

        // Dark overlay vignette
        const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.8);
        vignette.addColorStop(0, "rgba(0,0,0,0.2)");
        vignette.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Gradient Atmosphere
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, activeTheme.bgGrad[0]);
        grad.addColorStop(0.5, activeTheme.bgGrad[1]);
        grad.addColorStop(1, activeTheme.bgGrad[2]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Ambient radial center glow
      const glowOrb = ctx.createRadialGradient(
        width / 2,
        height * 0.40,
        30,
        width / 2,
        height * 0.40,
        width * 0.65
      );
      glowOrb.addColorStop(0, `${activeTheme.waveColors[0]}40`);
      glowOrb.addColorStop(1, "transparent");
      ctx.fillStyle = glowOrb;
      ctx.fillRect(0, 0, width, height);

      // Subtle tech dot matrix grid
      ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
      const dotSpacing = 52;
      for (let x = 26; x < width; x += dotSpacing) {
        for (let y = 26; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Studio Geometry & Layout Budgeting (Calibrated per Aspect Ratio & Waveform Mode)
      const isLandscape = aspectRatio === "landscape";
      let cardSize: number;
      let cardCenterX: number;
      let cardCenterY: number;
      let waveBaseY = 0;
      let waveBarMaxHeight = 100;
      let maxRadialRayLen = 65;
      let innerRadius = 0;
      let cx = width / 2;
      let cy = height / 2;

      let startX = 0;
      let totalWaveWidth = 0;

      let speakerFontSize = 22;
      let speakerX = width / 2;
      let speakerY = 0;

      let titleFontSize = 36;
      let titleLineHeight = 48;
      let titleX = width / 2;
      let titleY = 0;

      let pillX = width / 2;
      let pillY = height - 76;

      if (isLandscape) {
        // 1920 x 1080: Broadcast Split-Studio Layout
        // Left Column: Album Art / Vinyl Showcase
        cardSize = 500;
        cardCenterX = 480;
        cardCenterY = 540;
        cx = cardCenterX;
        cy = cardCenterY;
        innerRadius = (cardSize / 2) * (coverShape === "vinyl" ? 1.02 : 1.08);
        maxRadialRayLen = 70;

        // Right Column: Controls, Visualizer, & Titles
        if (waveformStyle === "radial") {
          // Circular Aura wraps around the artwork on the left; titles on the right
          speakerX = 1320;
          speakerY = 410;
          speakerFontSize = 24;

          titleX = 1320;
          titleY = 475;
          titleFontSize = 42;
          titleLineHeight = 54;

          pillX = 1320;
          pillY = 720;
        } else {
          // Horizontal Waveform on the right
          startX = 920;
          totalWaveWidth = 840;
          waveBaseY = 610;
          waveBarMaxHeight = 110;

          speakerX = 1340;
          speakerY = 320;
          speakerFontSize = 22;

          titleX = 1340;
          titleY = 380;
          titleFontSize = 38;
          titleLineHeight = 48;

          pillX = 1340;
          pillY = 790;
        }
      } else if (aspectRatio === "vertical") {
        // 1080 x 1920 (9:16 Story / Reel)
        totalWaveWidth = width * 0.86;
        startX = (width - totalWaveWidth) / 2;
        pillX = width / 2;
        pillY = 1780;

        if (waveformStyle === "radial") {
          cardSize = 520;
          cardCenterX = width / 2;
          cardCenterY = 640;
          cx = cardCenterX;
          cy = cardCenterY;
          innerRadius = (cardSize / 2) * (coverShape === "vinyl" ? 1.02 : 1.08);
          maxRadialRayLen = 85;

          speakerX = width / 2;
          speakerY = 1180;
          speakerFontSize = 26;

          titleX = width / 2;
          titleY = 1260;
          titleFontSize = 44;
          titleLineHeight = 56;
        } else {
          cardSize = 500;
          cardCenterX = width / 2;
          cardCenterY = 460;

          waveBaseY = 940;
          waveBarMaxHeight = 140;

          speakerX = width / 2;
          speakerY = 1220;
          speakerFontSize = 26;

          titleX = width / 2;
          titleY = 1300;
          titleFontSize = 44;
          titleLineHeight = 56;
        }
      } else if (aspectRatio === "portrait") {
        // 1080 x 1350 (4:5 Feed)
        totalWaveWidth = width * 0.84;
        startX = (width - totalWaveWidth) / 2;
        pillX = width / 2;
        pillY = 1220;

        if (waveformStyle === "radial") {
          cardSize = 420;
          cardCenterX = width / 2;
          cardCenterY = 460;
          cx = cardCenterX;
          cy = cardCenterY;
          innerRadius = (cardSize / 2) * (coverShape === "vinyl" ? 1.02 : 1.08);
          maxRadialRayLen = 65;

          speakerX = width / 2;
          speakerY = 850;
          speakerFontSize = 22;

          titleX = width / 2;
          titleY = 915;
          titleFontSize = 36;
          titleLineHeight = 46;
        } else {
          cardSize = 390;
          cardCenterX = width / 2;
          cardCenterY = 320;

          waveBaseY = 670;
          waveBarMaxHeight = 110;

          speakerX = width / 2;
          speakerY = 850;
          speakerFontSize = 22;

          titleX = width / 2;
          titleY = 915;
          titleFontSize = 36;
          titleLineHeight = 46;
        }
      } else {
        // 1080 x 1080 (1:1 Square)
        totalWaveWidth = width * 0.82;
        startX = (width - totalWaveWidth) / 2;
        pillX = width / 2;
        pillY = 960;

        if (waveformStyle === "radial") {
          cardSize = 360;
          cardCenterX = width / 2;
          cardCenterY = 370;
          cx = cardCenterX;
          cy = cardCenterY;
          innerRadius = (cardSize / 2) * (coverShape === "vinyl" ? 1.02 : 1.08);
          maxRadialRayLen = 55;

          speakerX = width / 2;
          speakerY = 705;
          speakerFontSize = 20;

          titleX = width / 2;
          titleY = 760;
          titleFontSize = 32;
          titleLineHeight = 42;
        } else {
          cardSize = 320;
          cardCenterX = width / 2;
          cardCenterY = 250;

          waveBaseY = 535;
          waveBarMaxHeight = 85;

          speakerX = width / 2;
          speakerY = 690;
          speakerFontSize = 20;

          titleX = width / 2;
          titleY = 745;
          titleFontSize = 32;
          titleLineHeight = 42;
        }
      }

      // 5. Draw Central Cover Artwork Card (Squircle or Vinyl)
      const cardScale = 1 + bassEnergy * 0.05;
      ctx.save();
      ctx.translate(cardCenterX, cardCenterY);
      ctx.scale(cardScale, cardScale);

      // Drop shadow glow
      ctx.shadowColor = activeTheme.waveColors[0];
      ctx.shadowBlur = 45 * cardScale;

      const cardHalf = cardSize / 2;

      if (coverShape === "vinyl") {
        // VINYL DISC MODE
        ctx.rotate(vinylRotationAngleRef.current);

        // Vinyl Black Base
        ctx.beginPath();
        ctx.arc(0, 0, cardHalf, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0a0f";
        ctx.fill();

        // Vinyl Grooves
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1.5;
        for (let r = cardHalf * 0.4; r < cardHalf * 0.95; r += 14) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center Artwork Label
        const labelRadius = cardHalf * 0.44;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, labelRadius, 0, Math.PI * 2);
        ctx.clip();

        if (coverImageElementRef.current) {
          ctx.drawImage(coverImageElementRef.current, -labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
        } else {
          ctx.fillStyle = activeTheme.cardBg;
          ctx.fillRect(-labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
          // Center vector logo
          ctx.fillStyle = activeTheme.waveColors[0];
          ctx.beginPath();
          ctx.arc(0, 0, labelRadius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Center Spindle Hole
        ctx.fillStyle = "#05060a";
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // SQUIRCLE CARD MODE
        const cardRadius = 38;
        ctx.beginPath();
        ctx.roundRect(-cardHalf, -cardHalf, cardSize, cardSize, cardRadius);
        ctx.fillStyle = activeTheme.cardBg;
        ctx.fill();

        if (coverImageElementRef.current) {
          ctx.save();
          ctx.clip();
          ctx.drawImage(coverImageElementRef.current, -cardHalf, -cardHalf, cardSize, cardSize);
          ctx.restore();
        } else {
          // Default Holographic Disc Emblem
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, cardSize * 0.32, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, cardSize * 0.18, 0, Math.PI * 2);
          ctx.stroke();

          // Glowing Center Jewel
          ctx.fillStyle = activeTheme.waveColors[0];
          ctx.beginPath();
          ctx.arc(0, 0, cardSize * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }

        // Frosted Border Rim
        ctx.strokeStyle = activeTheme.cardBorder;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(-cardHalf, -cardHalf, cardSize, cardSize, cardRadius);
        ctx.stroke();
      }

      ctx.restore();

      // 6. Dynamic Audio Waveform Visualizers
      const waveGrad = ctx.createLinearGradient(
        startX,
        waveBaseY - waveBarMaxHeight,
        startX + totalWaveWidth,
        waveBaseY + waveBarMaxHeight
      );
      waveGrad.addColorStop(0, activeTheme.waveColors[0]);
      waveGrad.addColorStop(1, activeTheme.waveColors[1]);

      // STYLE 1: BOUNCING BARS
      if (waveformStyle === "bars") {
        const barCount = isLandscape ? 36 : 42;
        const barWidth = totalWaveWidth / barCount - 6;
        const maxBarHeight = waveBarMaxHeight * waveHeightMultiplier;

        for (let i = 0; i < barCount; i++) {
          const freqIndex = Math.floor((i / barCount) * (freqData.length * 0.65));
          const val = freqData[freqIndex] || 0;
          const h = Math.max(12, (val / 255) * maxBarHeight);
          const bx = startX + i * (barWidth + 6);

          ctx.fillStyle = waveGrad;
          ctx.beginPath();
          ctx.roundRect(bx, waveBaseY - h / 2, barWidth, h, barWidth / 2);
          ctx.fill();

          // Reflective floor shimmer (strictly capped)
          const refH = Math.min(22, h * 0.32);
          ctx.fillStyle = `${activeTheme.waveColors[0]}22`;
          ctx.beginPath();
          ctx.roundRect(bx, waveBaseY + h / 2 + 6, barWidth, refH, barWidth / 2);
          ctx.fill();
        }
      }

      // STYLE 2: CIRCULAR AURA (Luminous Orbit Halo + Outer Spectrum Rays)
      else if (waveformStyle === "radial") {
        const rayCount = 64;
        ctx.save();

        // Inner glowing orbit ring
        ctx.strokeStyle = `${activeTheme.waveColors[0]}66`;
        ctx.lineWidth = 3;
        ctx.shadowColor = activeTheme.waveColors[0];
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Outer pulsing rays
        ctx.lineCap = "round";
        const baseAngleOffset = coverShape === "vinyl" ? vinylRotationAngleRef.current : 0;

        for (let i = 0; i < rayCount; i++) {
          const angle = baseAngleOffset + (i / rayCount) * Math.PI * 2;
          const freqIndex = Math.floor((i / rayCount) * (freqData.length * 0.6));
          const val = freqData[freqIndex] || 0;
          const rayLen = (10 + (val / 255) * maxRadialRayLen) * waveHeightMultiplier;

          const x1 = cx + Math.cos(angle) * (innerRadius + 4);
          const y1 = cy + Math.sin(angle) * (innerRadius + 4);
          const x2 = cx + Math.cos(angle) * (innerRadius + 4 + rayLen);
          const y2 = cy + Math.sin(angle) * (innerRadius + 4 + rayLen);

          ctx.lineWidth = 3.5;
          ctx.strokeStyle = waveGrad;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // STYLE 3: FLOWING WAVE (Organic Multi-Layer Neon Liquid Soundwave)
      else if (waveformStyle === "wave") {
        const pointCount = isLandscape ? 36 : 42;
        const step = totalWaveWidth / (pointCount - 1);
        const maxOffset = (waveBarMaxHeight * 0.65) * waveHeightMultiplier;
        const pts: { x: number; y: number }[] = [];

        for (let i = 0; i < pointCount; i++) {
          const freqIndex = Math.floor((i / pointCount) * (freqData.length * 0.65));
          const val = freqData[freqIndex] || 0;
          const offset = Math.sin(i / 2.8 + performance.now() / 460) * ((val / 255) * maxOffset);
          pts.push({ x: startX + i * step, y: waveBaseY + offset });
        }

        // Layer 1: Ambient Translucent Liquid Fill
        ctx.save();
        const fillGrad = ctx.createLinearGradient(0, waveBaseY - maxOffset, 0, waveBaseY);
        fillGrad.addColorStop(0, `${activeTheme.waveColors[0]}44`);
        fillGrad.addColorStop(1, "transparent");
        ctx.fillStyle = fillGrad;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, waveBaseY);
        ctx.lineTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.lineTo(pts[pts.length - 1].x, waveBaseY);
        ctx.closePath();
        ctx.fill();

        // Layer 2: Mirror Lower Reflection Fill
        const mirrorGrad = ctx.createLinearGradient(0, waveBaseY, 0, waveBaseY + maxOffset * 0.6);
        mirrorGrad.addColorStop(0, `${activeTheme.waveColors[1]}20`);
        mirrorGrad.addColorStop(1, "transparent");
        ctx.fillStyle = mirrorGrad;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, waveBaseY);
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = waveBaseY - (pts[i].y - waveBaseY) * 0.45;
          const nextYc = waveBaseY - (pts[i + 1].y - waveBaseY) * 0.45;
          ctx.quadraticCurveTo(pts[i].x, yc, xc, (yc + nextYc) / 2);
        }
        ctx.lineTo(pts[pts.length - 1].x, waveBaseY);
        ctx.closePath();
        ctx.fill();

        // Layer 3: Neon Glowing Crest Spline
        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = 4.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = activeTheme.waveColors[0];
        ctx.shadowBlur = 16;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        ctx.restore();
      }

      // STYLE 4: RHYTHM DOTS (Studio Hi-Fi LED Column Equalizer)
      else if (waveformStyle === "dots") {
        const colCount = isLandscape ? 30 : 36;
        const ledsPerCol = 8;
        const colWidth = totalWaveWidth / colCount;
        const dotWidth = Math.max(8, Math.min(15, colWidth - 5));
        const dotHeight = 6;
        const dotRadius = 3;
        const ledSpacing = 9;
        const bottomLedY = waveBaseY + (ledsPerCol * ledSpacing) / 2 - 4;

        ctx.save();
        for (let c = 0; c < colCount; c++) {
          const freqIndex = Math.floor((c / colCount) * (freqData.length * 0.65));
          const val = freqData[freqIndex] || 0;
          const activeLevel = Math.max(1, Math.round((val / 255) * ledsPerCol * waveHeightMultiplier));
          const dotX = startX + c * colWidth + (colWidth - dotWidth) / 2;

          for (let l = 0; l < ledsPerCol; l++) {
            const ledY = bottomLedY - l * ledSpacing;
            if (l < activeLevel) {
              if (l === activeLevel - 1) {
                // Peak indicator LED (Bright luminous accent)
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = activeTheme.waveColors[0];
                ctx.shadowBlur = 10;
              } else {
                ctx.fillStyle = waveGrad;
                ctx.shadowBlur = 0;
              }
            } else {
              // Inactive translucent dark capsule
              ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
              ctx.shadowBlur = 0;
            }
            ctx.beginPath();
            ctx.roundRect(dotX, ledY, dotWidth, dotHeight, dotRadius);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // 7. Typography & Captions
      ctx.textAlign = "center";

      // Font Family Mapping
      let fontName = "system-ui, -apple-system, sans-serif";
      if (fontStyle === "display") fontName = "Georgia, serif";
      if (fontStyle === "mono") fontName = "ui-monospace, Menlo, Monaco, monospace";

      // Speaker Name
      ctx.font = `bold ${speakerFontSize}px ${fontName}`;
      ctx.fillStyle = activeTheme.textSecondary;
      ctx.fillText(speakerName.toUpperCase(), speakerX, speakerY);

      // Episode Title (with word-wrap)
      ctx.font = `bold ${titleFontSize}px ${fontName}`;
      ctx.fillStyle = activeTheme.textPrimary;

      const words = episodeTitle.split(" ");
      let line = "";
      let currentLineY = titleY;
      const maxTextWidth = isLandscape ? 820 : width * 0.84;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          ctx.fillText(line.trim(), titleX, currentLineY);
          line = words[n] + " ";
          currentLineY += titleLineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), titleX, currentLineY);

      // 8. Timecode Pill
      const pillWidth = 224;
      const pillHeight = 42;

      ctx.fillStyle = "rgba(0, 0, 0, 0.70)";
      ctx.beginPath();
      ctx.roundRect(pillX - pillWidth / 2, pillY, pillWidth, pillHeight, 21);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "bold 18px monospace";
      ctx.fillStyle = activeTheme.textPrimary;
      ctx.fillText(`${formatTime(currentTime)} / ${formatTime(duration)}`, pillX, pillY + 27);

      // 9. Bottom Edge Audio Progress Bar
      const progressPercent = duration > 0 ? currentTime / duration : 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, height - 7, width, 7);

      ctx.fillStyle = waveGrad;
      ctx.fillRect(0, height - 7, width * progressPercent, 7);

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    aspectRatio,
    waveformStyle,
    activeTheme,
    coverShape,
    fontStyle,
    waveHeightMultiplier,
    useBlurredBackdrop,
    episodeTitle,
    speakerName,
    isPlaying,
    currentTime,
    duration,
  ]);

  // --------------------------------------------------------------------------
  // 1-CLICK HD VIDEO EXPORT (Canvas + Web Audio MediaRecorder)
  // --------------------------------------------------------------------------
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer || isRecording) return;

    setIsRecording(true);
    setRecordingProgress(0);

    // Stop current playback
    handlePause();
    pauseOffsetRef.current = 0;
    setCurrentTime(0);

    initAudioNodes();
    const ctx = audioCtxRef.current!;

    // 1. Capture stream from canvas at 30 FPS
    const canvasStream = canvas.captureStream(30);

    // 2. Capture stream from audio destination
    const audioDest = audioDestinationRef.current!;

    // 3. Combined stream
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDest.stream.getAudioTracks(),
    ]);

    // 4. Codec detection
    let mimeType = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm;codecs=vp8,opus";
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
    }

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 4800000, // 4.8 Mbps HD
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
      setIsRecording(false);
      setRecordingProgress(100);

      // Trigger automatic download
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `audiogram-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      triggerToast("HD Video rendered and downloaded!");
    };

    recorder.start(100);

    // 5. Play audio from start into the recorder
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
    }, 180);
  };

  // 1-Click Snapshot (PNG Still Cover)
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

    triggerToast("Cover image downloaded as high-res PNG!");
  };

  // Load Preset Clip
  const handleLoadPreset = (preset: SampleClip) => {
    setEpisodeTitle(preset.title);
    setSpeakerName(preset.speaker);
    triggerToast(`Loaded: ${preset.title}`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col gap-5 p-3 sm:p-5 md:p-6 lg:p-8 max-w-[1720px] mx-auto text-slate-100 pb-28 md:pb-10 select-none sm:select-auto">
      {/* Toast Notification (Safely below navbar) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0a0f1d]/95 border border-cyan-500/40 text-cyan-200 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{toastMessage}</span>
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0d1a]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.25)] flex-shrink-0">
            <AudioWaveform className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                Audio Waveform Video Maker
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                100% In-Browser &bull; HD 1080p
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Generate animated audiogram videos for Instagram Reels, TikTok, and YouTube Shorts with reactive waveforms and cover art.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 relative z-10">
          <button
            onClick={handleDownloadSnapshot}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all active:scale-95"
            title="Download still cover card as high-res PNG"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Save Cover PNG</span>
          </button>

          <button
            onClick={handleExportVideo}
            disabled={isRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all active:scale-95 disabled:opacity-50"
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

      {/* MOBILE SEGMENTED TABS (Strict 320px - 430px Friendly) */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-[#090c17] border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("stage")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "stage"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Stage</span>
        </button>
        <button
          onClick={() => setMobileTab("style")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "style"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Style</span>
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
          <Music className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>
        <button
          onClick={() => setMobileTab("titles")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "titles"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Titles</span>
        </button>
      </div>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Settings Studio */}
        <div
          className={cn(
            "lg:col-span-5 flex-col gap-5",
            mobileTab === "stage" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Panel 1: Video Format & Waveform Style */}
          <div
            className={cn(
              "flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl",
              mobileTab !== "style" && mobileTab !== "stage" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Video Shape & Waveform</h3>
            </div>

            {/* Social Platform Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Social Platform Shape</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setAspectRatio("vertical")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    aspectRatio === "vertical"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="w-3.5 h-5 border-2 border-current rounded-sm" />
                  <span>9:16 Story</span>
                </button>
                <button
                  onClick={() => setAspectRatio("square")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    aspectRatio === "square"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="w-4 h-4 border-2 border-current rounded-sm" />
                  <span>1:1 Square</span>
                </button>
                <button
                  onClick={() => setAspectRatio("portrait")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    aspectRatio === "portrait"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="w-3.5 h-4.5 border-2 border-current rounded-sm" />
                  <span>4:5 Feed</span>
                </button>
                <button
                  onClick={() => setAspectRatio("landscape")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all",
                    aspectRatio === "landscape"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="w-5 h-3.5 border-2 border-current rounded-sm" />
                  <span>16:9 Video</span>
                </button>
              </div>
            </div>

            {/* Waveform Animation Style */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Waveform Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setWaveformStyle("bars")}
                  className={cn(
                    "py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center",
                    waveformStyle === "bars"
                      ? "bg-cyan-600/25 border-cyan-500/50 text-cyan-300 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Bouncing Bars
                </button>
                <button
                  onClick={() => setWaveformStyle("radial")}
                  className={cn(
                    "py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center",
                    waveformStyle === "radial"
                      ? "bg-cyan-600/25 border-cyan-500/50 text-cyan-300 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Circular Aura
                </button>
                <button
                  onClick={() => setWaveformStyle("wave")}
                  className={cn(
                    "py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center",
                    waveformStyle === "wave"
                      ? "bg-cyan-600/25 border-cyan-500/50 text-cyan-300 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Flowing Wave
                </button>
                <button
                  onClick={() => setWaveformStyle("dots")}
                  className={cn(
                    "py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center",
                    waveformStyle === "dots"
                      ? "bg-cyan-600/25 border-cyan-500/50 text-cyan-300 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Rhythm Dots
                </button>
              </div>
            </div>

            {/* Waveform Height Multiplier Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Waveform Amplitude</span>
                <span className="font-mono text-cyan-400">{waveHeightMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={waveHeightMultiplier}
                onChange={(e) => setWaveHeightMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Atmosphere Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Glow Palette</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setThemeId(theme.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-all",
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
                      <span className="truncate font-semibold text-slate-200">{theme.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panel 2: Audio File & Artwork Controls */}
          <div
            className={cn(
              "flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl",
              mobileTab !== "audio" && mobileTab !== "stage" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Audio & Cover Artwork</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono truncate max-w-[170px]">
                {audioFileName}
              </span>
            </div>

            {/* Audio & Image Upload Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Audio Upload */}
              <label className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer transition-all text-center group">
                <Upload className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">Load Audio Track</span>
                <span className="text-[10px] text-slate-500 mt-0.5">MP3, WAV, AAC, M4A</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </label>

              {/* Cover Artwork Upload */}
              <label className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/40 cursor-pointer transition-all text-center group">
                <ImageIcon className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">
                  {coverImageUrl ? "Change Cover" : "Upload Artwork"}
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

            {/* Artwork Shape & Backdrop Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Shape: Squircle vs Vinyl */}
              <button
                onClick={() => setCoverShape(coverShape === "squircle" ? "vinyl" : "squircle")}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-all"
              >
                <span>Artwork Shape</span>
                <span className="font-semibold text-cyan-400 capitalize">
                  {coverShape === "squircle" ? "Card" : "Vinyl"}
                </span>
              </button>

              {/* Blurred Cover Backdrop Toggle */}
              <button
                onClick={() => setUseBlurredBackdrop(!useBlurredBackdrop)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-medium text-slate-300 hover:text-white transition-all"
              >
                <span>Blurred Backdrop</span>
                <span className={cn("font-semibold", useBlurredBackdrop ? "text-emerald-400" : "text-slate-500")}>
                  {useBlurredBackdrop ? "Active" : "Off"}
                </span>
              </button>
            </div>
          </div>

          {/* Panel 3: Titles, Captions & Typography */}
          <div
            className={cn(
              "flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl",
              mobileTab !== "titles" && mobileTab !== "stage" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Titles & Typography</h3>
              </div>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
                <button
                  onClick={() => setFontStyle("sans")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-all",
                    fontStyle === "sans" ? "bg-white/[0.1] text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  Sans
                </button>
                <button
                  onClick={() => setFontStyle("display")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-all font-serif",
                    fontStyle === "display" ? "bg-white/[0.1] text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  Serif
                </button>
                <button
                  onClick={() => setFontStyle("mono")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-medium transition-all font-mono",
                    fontStyle === "mono" ? "bg-white/[0.1] text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  Mono
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Headline / Episode Title</label>
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                placeholder="Catchy question or viral hook..."
                className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Speaker / Show Attribution</label>
              <input
                type="text"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                placeholder="Speaker Name • Podcast Title"
                className="w-full bg-black/50 border border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Panel 4: Quick Blueprints & Presets */}
          <div
            className={cn(
              "flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl",
              mobileTab !== "titles" && mobileTab !== "stage" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Instant Presets</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleLoadPreset(tpl)}
                  className="flex flex-col p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/40 text-left transition-all group"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                    {tpl.title}
                  </span>
                  <span className="text-[10px] text-cyan-400 mt-0.5 font-medium">
                    {tpl.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Video Stage Showcase & Master Audio Console */}
        <div
          className={cn(
            "lg:col-span-7 flex-col gap-4 items-center",
            mobileTab !== "stage" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Main Video Canvas Showcase Frame */}
          <div className="relative w-full flex items-center justify-center p-3 sm:p-6 rounded-2xl bg-black/90 border border-white/[0.08] overflow-hidden shadow-2xl">
            {/* Ambient Reactive Backlight */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25 blur-3xl transition-colors duration-500"
              style={{
                background: `radial-gradient(circle at center, ${activeTheme.waveColors[0]}, transparent 70%)`,
              }}
            />

            {/* Live Visualizer Canvas */}
            <canvas
              ref={canvasRef}
              className={cn(
                "rounded-xl shadow-2xl transition-all duration-300 border border-white/[0.12] max-h-[580px] w-auto",
                aspectRatio === "vertical" && "aspect-[9/16]",
                aspectRatio === "square" && "aspect-square",
                aspectRatio === "portrait" && "aspect-[4/5]",
                aspectRatio === "landscape" && "aspect-video"
              )}
            />

            {/* Live HD Video Rendering Overlay */}
            {isRecording && (
              <div className="absolute inset-0 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-50 animate-in fade-in duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  <span className="absolute font-bold text-lg text-white">
                    {recordingProgress}%
                  </span>
                </div>
                <div className="text-center px-4">
                  <h4 className="text-base font-bold text-white">Rendering HD Video...</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Capturing synchronized audio and glowing waveforms in 1080p
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AUDIO PLAYER & TRANSPORT CONSOLE */}
          <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            {/* Scrubber Seekbar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.05}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-xs font-mono text-slate-400 w-12">
                {formatTime(duration)}
              </span>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play / Pause */}
                <button
                  onClick={isPlaying ? handlePause : () => handlePlay()}
                  className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center transition-transform active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  title={isPlaying ? "Pause" : "Play preview"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                {/* Reset to Start */}
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                  title="Reset to beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Mute Toggle */}
                <button
                  onClick={toggleMute}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Format & Style Specs */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="hidden sm:inline">
                  {aspectRatio === "vertical"
                    ? "1080 × 1920 (9:16)"
                    : aspectRatio === "portrait"
                    ? "1080 × 1350 (4:5)"
                    : aspectRatio === "square"
                    ? "1080 × 1080 (1:1)"
                    : "1920 × 1080 (16:9)"}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-cyan-300 font-sans uppercase font-medium">
                  {waveformStyle}
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

      {/* MOBILE FLOATING ACTION HUD (Fixed to bottom on small screens) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 flex items-center justify-between p-2 rounded-2xl bg-[#070a14]/95 border border-white/[0.12] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 pl-2">
          <button
            onClick={isPlaying ? handlePause : () => handlePlay()}
            className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <span className="text-xs font-mono font-medium text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadSnapshot}
            className="p-2 rounded-xl bg-white/[0.06] text-slate-200 border border-white/[0.08] active:scale-95 transition-all"
            title="Save PNG Cover"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={handleExportVideo}
            disabled={isRecording}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-xs border border-cyan-400/40 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            <Film className="w-3.5 h-3.5" />
            <span>{isRecording ? `${recordingProgress}%` : "Export"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
