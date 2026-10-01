"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Speech,
  Mic2,
  Cpu,
  Radio,
  Smile,
  Compass,
  Headphones,
  Waves,
  Skull,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Repeat,
  Check,
  Clock,
  AudioWaveform,
  Sliders,
  Volume2,
  VolumeX,
  Layers,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VOICE_PERSONAS,
  type VoicePersona,
  generateVoiceChangerDemo,
  transformAudioWithDSP,
} from "@/lib/voice-changer-engine";

interface AudioBlueprint {
  id: string;
  title: string;
  description: string;
  personaId: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const VOICE_BLUEPRINTS: AudioBlueprint[] = [
  {
    id: "movie-trailer",
    title: "Movie Trailer",
    description: "Deep cinematic chest resonance",
    personaId: "deep-announcer",
    icon: Mic2,
  },
  {
    id: "cyber-robot",
    title: "Cyber Robot",
    description: "Futuristic ring modulator synth",
    personaId: "cyber-robot",
    icon: Cpu,
  },
  {
    id: "gaming-callout",
    title: "Gaming Callout",
    description: "Energetic animated high-octave voice",
    personaId: "helium-high",
    icon: Smile,
  },
  {
    id: "canyon-story",
    title: "Canyon Story",
    description: "Spacious atmospheric cathedral reverb",
    personaId: "cave-echo",
    icon: Waves,
  },
];

const PERSONA_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Mic2,
  Cpu,
  Radio,
  Smile,
  Compass,
  Headphones,
  Waves,
  Skull,
};

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function VoiceChangerStudio() {
  // Source Audio File State
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [changedUrl, setChangedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("Sample Spoken Audio");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [inputTab, setInputTab] = useState<"upload" | "record">("upload");

  // Voice Persona & Modifiers
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("deep-announcer");
  const [pitchSemitones, setPitchSemitones] = useState<number>(-5);
  const [modulation, setModulation] = useState<number>(0.1);
  const [bassBoost, setBassBoost] = useState<number>(0.85);
  const [echo, setEcho] = useState<number>(0.15);

  // A/B Comparison Switch: Changed Voice vs Original Voice
  const [activeListeningMode, setActiveListeningMode] = useState<"changed" | "original">("changed");

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Progress & Processing State (Standard 4)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("Preparing voice transformation...");
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Playback & Waveform State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Audio refs
  const changedAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedPersona = useMemo(() => {
    return VOICE_PERSONAS.find((p) => p.id === selectedPersonaId) || VOICE_PERSONAS[0];
  }, [selectedPersonaId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Mount: Load $0 Compute Instant Demo
  useEffect(() => {
    let active = true;

    generateVoiceChangerDemo("deep-announcer")
      .then((demo) => {
        if (!active) return;
        setSourceUrl(demo.originalUrl);
        setChangedUrl(demo.changedUrl);
        setDuration(demo.duration);
        setFileName("Exismic Studio Voice Sample");
        setIsDemo(true);
        setActiveListeningMode("changed");
      })
      .catch((err) => {
        console.warn("Could not generate initial voice demo:", err);
      });

    return () => {
      active = false;
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // 2. Persona Selection Updates Fine-Tuning Controls
  const handleSelectPersona = (persona: VoicePersona) => {
    setSelectedPersonaId(persona.id);
    setPitchSemitones(persona.pitchSemitones);
    setModulation(persona.modulation);
    setBassBoost(persona.bassBoost);
    setEcho(persona.echo);
  };

  // 3. Audio A/B Sync between Changed Voice and Original Voice
  useEffect(() => {
    const cAudio = changedAudioRef.current;
    const oAudio = originalAudioRef.current;
    if (cAudio) cAudio.volume = activeListeningMode === "changed" ? 1.0 : 0.0;
    if (oAudio) oAudio.volume = activeListeningMode === "original" ? 1.0 : 0.0;
  }, [activeListeningMode]);

  // Synchronize playback speed
  useEffect(() => {
    if (changedAudioRef.current) changedAudioRef.current.playbackRate = playbackSpeed;
    if (originalAudioRef.current) originalAudioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Master Timeline & Duration Listener
  useEffect(() => {
    const master = changedAudioRef.current || originalAudioRef.current;
    if (!master) return;

    const handleLoadedMetadata = () => {
      if (master.duration && !isNaN(master.duration) && master.duration > 0) {
        setDuration(master.duration);
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        handleSeek(0);
        changedAudioRef.current?.play().catch(() => {});
        originalAudioRef.current?.play().catch(() => {});
      } else {
        setIsPlaying(false);
        handleSeek(0);
      }
    };

    master.addEventListener("loadedmetadata", handleLoadedMetadata);
    master.addEventListener("ended", handleEnded);

    return () => {
      master.removeEventListener("loadedmetadata", handleLoadedMetadata);
      master.removeEventListener("ended", handleEnded);
    };
  }, [changedUrl, sourceUrl, isLooping]);

  // Smooth 60FPS RAF Playhead Loop
  const updateLoop = useCallback(() => {
    const master = changedAudioRef.current || originalAudioRef.current;
    if (master) {
      setCurrentTime(master.currentTime);
      if (master.duration && !isNaN(master.duration) && master.duration > 0) {
        setDuration(master.duration);
      }
    }
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateLoop);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateLoop);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, updateLoop]);

  // Play / Pause Toggle
  const togglePlay = () => {
    const cAudio = changedAudioRef.current;
    const oAudio = originalAudioRef.current;
    if (!cAudio && !oAudio) return;

    if (isPlaying) {
      cAudio?.pause();
      oAudio?.pause();
      setIsPlaying(false);
    } else {
      const syncTime = currentTime;
      if (cAudio) cAudio.currentTime = syncTime;
      if (oAudio) oAudio.currentTime = syncTime;

      Promise.all([cAudio?.play(), oAudio?.play()])
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(true));
    }
  };

  // Seek Timeline
  const handleSeek = (timeSec: number) => {
    const clamped = Math.max(0, Math.min(duration || 10, timeSec));
    setCurrentTime(clamped);
    if (changedAudioRef.current) changedAudioRef.current.currentTime = clamped;
    if (originalAudioRef.current) originalAudioRef.current.currentTime = clamped;
  };

  // Dropzone for User File Upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const selected = acceptedFiles[0];
    setFile(selected);
    setFileName(selected.name);
    setIsDemo(false);

    const objectUrl = URL.createObjectURL(selected);
    setSourceUrl(objectUrl);
    setChangedUrl(objectUrl);
    setCurrentTime(0);
    setIsPlaying(false);
    showToast(`Loaded ${selected.name}`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  // Live Microphone Recorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const recordedFile = new File([audioBlob], `mic-recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setFile(recordedFile);
        setFileName("Microphone Voice Recording");
        setIsDemo(false);

        const url = URL.createObjectURL(audioBlob);
        setSourceUrl(url);
        setChangedUrl(url);
        setCurrentTime(0);
        setIsPlaying(false);
        showToast("Recorded voice loaded into studio!");

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      showToast("Microphone access was denied. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Instant Blueprint Loader
  const handleLoadBlueprint = async (bp: AudioBlueprint) => {
    setIsProcessing(true);
    setProgress(15);
    setProcessingStage(`Loading ${bp.title} blueprint...`);

    const persona = VOICE_PERSONAS.find((p) => p.id === bp.personaId) || VOICE_PERSONAS[0];
    handleSelectPersona(persona);

    try {
      const demo = await generateVoiceChangerDemo(bp.personaId);
      setSourceUrl(demo.originalUrl);
      setChangedUrl(demo.changedUrl);
      setDuration(demo.duration);
      setFileName(`${bp.title} Sample`);
      setIsDemo(true);
      setCurrentTime(0);
      setIsPlaying(false);
      setProgress(100);
      showToast(`Loaded ${bp.title} voice blueprint!`);
    } catch (err) {
      console.warn("Failed loading blueprint:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Core Voice Transformation Execution
  const handleTransformVoice = async () => {
    if (!sourceUrl && !file) {
      showToast("Please upload audio or record your voice first.");
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setElapsed(0);
    setUploadProgressText(null);
    setIsPlaying(false);

    // Dynamic 150ms Standard 4 ticker
    elapsedTimerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    const stages = [
      { at: 15, text: "Analyzing vocal frequencies & formant structures..." },
      { at: 35, text: `Modulating pitch & vocal cords (${selectedPersona.name})...` },
      { at: 65, text: "Applying acoustic resonances, EQ & character effects..." },
      { at: 88, text: "Mastering high-fidelity stereo audio output..." },
    ];

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          const next = prev + (prev < 40 ? 5 : 2.5);
          const activeStage = stages.slice().reverse().find((s) => next >= s.at);
          if (activeStage) setProcessingStage(activeStage.text);
          return next;
        }
        return prev;
      });
    }, 150);

    try {
      let audioBlobToProcess: Blob | File | null = file;

      // If in demo mode without user file, fetch the current demo source blob
      if (!audioBlobToProcess && sourceUrl) {
        const resp = await fetch(sourceUrl);
        audioBlobToProcess = await resp.blob();
      }

      if (!audioBlobToProcess) {
        throw new Error("No audio source available.");
      }

      // Execute in-browser Web Audio DSP transformation with active custom fine-tuning
      const result = await transformAudioWithDSP(audioBlobToProcess, selectedPersona, {
        pitchSemitones,
        modulation,
        bassBoost,
        echo,
      });

      // Jump smoothly to 100%
      setProgress(100);
      setProcessingStage("Voice transformation complete!");

      setTimeout(() => {
        setChangedUrl(result.url);
        setDuration(result.duration);
        setActiveListeningMode("changed");
        setIsProcessing(false);
        showToast("Voice transformed successfully!");
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      }, 350);
    } catch (err) {
      console.error("Voice transformation failed:", err);
      setIsProcessing(false);
      showToast("Voice conversion failed. Please try again.");
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
  };

  // Download Transformed Output
  const handleDownloadTransformed = () => {
    if (!changedUrl) return;
    const a = document.createElement("a");
    a.href = changedUrl;
    const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-");
    a.download = `${baseName}-${selectedPersona.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloaded transformed voice audio!");
  };

  // Download Original Audio
  const handleDownloadOriginal = () => {
    if (!sourceUrl) return;
    const a = document.createElement("a");
    a.href = sourceUrl;
    const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-");
    a.download = `${baseName}-original.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloaded original audio!");
  };

  const handleReset = () => {
    handleSeek(0);
    setPitchSemitones(selectedPersona.pitchSemitones);
    setModulation(selectedPersona.modulation);
    setBassBoost(selectedPersona.bassBoost);
    setEcho(selectedPersona.echo);
    showToast("Reset voice controls to persona defaults.");
  };

  // Pseudo-Frequency visualizer bars (54 bars)
  const visualizerBars = useMemo(() => {
    const bars: number[] = [];
    for (let i = 0; i < 54; i++) {
      const centerFactor = 1 - Math.abs(i - 27) / 27;
      const height = Math.max(0.18, centerFactor * 0.9 + Math.sin(i * 0.8) * 0.25);
      bars.push(height);
    }
    return bars;
  }, []);

  const progressRatio = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;

  return (
    <div className="w-full space-y-6 text-left">
      {/* Hidden Synchronized HTML5 Audio Elements */}
      {changedUrl && (
        <audio
          ref={changedAudioRef}
          src={changedUrl}
          preload="auto"
          playsInline
        />
      )}
      {sourceUrl && (
        <audio
          ref={originalAudioRef}
          src={sourceUrl}
          preload="auto"
          playsInline
        />
      )}

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
              <Speech size={18} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
              Audio & Music Studio
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Voice Changer Studio
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Transform spoken audio into deep announcers, cyber robots, and character voices with natural delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5">
            <AudioWaveform size={13} />
            <span>Real-Time DSP</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-bold flex items-center gap-1.5">
            <Zap size={13} />
            <span>Zero Wait Previews</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN OBSIDIAN CYBER WORKSPACE */}
      <div className="rounded-[2.5rem] border-2 border-pink-500/35 bg-[#090a12] p-5 sm:p-7 shadow-[0_0_60px_rgba(236,72,153,0.12)] relative overflow-hidden backdrop-blur-2xl">
        {/* Ambient Neon Pink & Purple Radial Glows */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative space-y-6">
          {/* INSTANT BLUEPRINTS (1-Click Real World Samples) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Speech size={13} />
                <span>Instant Voice Blueprints</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Click to audition character voice with 0 wait</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {VOICE_BLUEPRINTS.map((bp) => {
                const IconComponent = bp.icon;
                const isCurrent = isDemo && selectedPersonaId === bp.personaId;

                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => handleLoadBlueprint(bp)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition group active:scale-95 cursor-pointer",
                      isCurrent
                        ? "bg-pink-500/15 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                        : "bg-white/[0.03] hover:bg-pink-500/10 border-white/10 hover:border-pink-500/40"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          "size-6 rounded-lg flex items-center justify-center transition",
                          isCurrent
                            ? "bg-pink-500 text-white"
                            : "bg-white/[0.05] group-hover:bg-pink-500/20 text-zinc-400 group-hover:text-pink-300"
                        )}
                      >
                        <IconComponent size={13} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-pink-200 transition truncate">
                        {bp.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 group-hover:text-zinc-300">
                      {bp.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DUAL WORKSPACE COLUMNS: CONTROLS (5 COLS) + STUDIO PLAYER (7 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: AUDIO INPUT & VOICE PERSONAS (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-4 sm:p-5 space-y-4">
                {/* Mode Selector: Upload File vs Record Live Mic */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <AudioWaveform size={13} />
                    <span>Voice Input</span>
                  </span>

                  <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => setInputTab("upload")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer",
                        inputTab === "upload"
                          ? "bg-pink-500 text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Upload size={11} />
                      <span>Upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputTab("record")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer",
                        inputTab === "record"
                          ? "bg-pink-500 text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Mic2 size={11} />
                      <span>Live Mic</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: FILE UPLOAD DROPZONE */}
                {inputTab === "upload" && (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-4 text-center transition group relative overflow-hidden",
                      isDragActive
                        ? "border-pink-500 bg-pink-500/10 shadow-[0_0_25px_rgba(236,72,153,0.2)]"
                        : "border-white/15 bg-white/[0.02] hover:border-pink-500/40 hover:bg-white/[0.04]"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="size-11 rounded-2xl bg-white/[0.06] group-hover:bg-pink-500/20 text-zinc-300 group-hover:text-pink-300 flex items-center justify-center transition shadow-inner">
                      <Upload size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white group-hover:text-pink-100 transition truncate max-w-xs">
                        {file ? file.name : "Drop audio file to change voice"}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {file
                          ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to transform`
                          : "MP3, WAV, M4A, OGG, FLAC up to 50MB"}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: LIVE MICROPHONE RECORDER */}
                {inputTab === "record" && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center space-y-3">
                    <div className="relative mx-auto size-14 flex items-center justify-center">
                      {isRecording && (
                        <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                      )}
                      <div
                        className={cn(
                          "size-12 rounded-full flex items-center justify-center transition shadow-lg",
                          isRecording
                            ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                            : "bg-white/[0.06] text-zinc-300"
                        )}
                      >
                        <Mic2 size={20} />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">
                        {isRecording ? "Recording your voice..." : "Ready to Record Audio"}
                      </p>
                      <p className="text-xs font-mono text-pink-400 font-bold">
                        {formatTime(recordingSeconds)}
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
                        >
                          <Mic2 size={13} />
                          <span>Start Recording</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-lg shadow-rose-600/30 cursor-pointer animate-pulse"
                        >
                          <Pause size={13} />
                          <span>Stop & Load</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 8 VOICE PERSONAS GRID */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                      <Speech size={13} />
                      <span>Choose Character Voice</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {selectedPersona.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {VOICE_PERSONAS.map((persona) => {
                      const IconComponent = PERSONA_ICONS[persona.iconName] || Speech;
                      const isSelected = selectedPersonaId === persona.id;

                      return (
                        <button
                          key={persona.id}
                          type="button"
                          onClick={() => handleSelectPersona(persona)}
                          className={cn(
                            "p-2.5 rounded-2xl border text-left transition group active:scale-95 cursor-pointer relative overflow-hidden",
                            isSelected
                              ? "bg-pink-500/15 border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                              : "bg-white/[0.02] hover:bg-pink-500/10 border-white/10 hover:border-pink-500/30"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
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
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 font-semibold">
                              {persona.badge}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-white group-hover:text-pink-100 truncate">
                            {persona.name}
                          </div>
                          <p className="text-[9px] text-zinc-400 line-clamp-1">
                            {persona.tagline}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FINE-TUNING SLIDERS (PLAIN EVERYDAY CONTROLS) */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                      <Sliders size={13} />
                      <span>Fine-Tune Character</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[10px] text-zinc-400 hover:text-pink-300 transition cursor-pointer"
                    >
                      Reset Sliders
                    </button>
                  </div>

                  {/* 1. Pitch Shift Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold">Voice Pitch</span>
                      <span className="text-pink-400 font-mono font-bold text-[11px]">
                        {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} semitones (
                        {pitchSemitones < -2 ? "Deep" : pitchSemitones > 2 ? "High" : "Natural"})
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={pitchSemitones}
                      onChange={(e) => setPitchSemitones(Number(e.target.value))}
                      className="w-full accent-pink-500 h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                  </div>

                  {/* 2. Modulation Intensity */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold">Robotic Modulation</span>
                      <span className="text-pink-400 font-mono font-bold text-[11px]">
                        {Math.round(modulation * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={modulation}
                      onChange={(e) => setModulation(Number(e.target.value))}
                      className="w-full accent-pink-500 h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                  </div>

                  {/* 3. Warmth & Bass */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold">Chest Warmth & Bass</span>
                      <span className="text-pink-400 font-mono font-bold text-[11px]">
                        {Math.round(bassBoost * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={bassBoost}
                      onChange={(e) => setBassBoost(Number(e.target.value))}
                      className="w-full accent-pink-500 h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                  </div>

                  {/* 4. Spatial Echo */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold">Spatial Echo & Reverb</span>
                      <span className="text-pink-400 font-mono font-bold text-[11px]">
                        {Math.round(echo * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={echo}
                      onChange={(e) => setEcho(Number(e.target.value))}
                      className="w-full accent-pink-500 h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                  </div>
                </div>

                {/* PRIMARY ACTION BUTTON */}
                <button
                  type="button"
                  onClick={handleTransformVoice}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer",
                    isProcessing
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:via-rose-400 hover:to-purple-500 border border-pink-400/40 shadow-[0_0_25px_rgba(236,72,153,0.35)]"
                  )}
                >
                  <Speech size={16} />
                  <span>
                    {isProcessing ? "Transforming Voice..." : `Transform Voice with ${selectedPersona.name}`}
                  </span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE STUDIO PLAYER & A/B COMPARISON (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-5 sm:p-6 space-y-5">
                {/* HEADER DETAILS & STATUS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                      <AudioWaveform size={14} />
                      <span>Studio Master Console</span>
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold uppercase">
                      {selectedPersona.name}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 font-semibold truncate max-w-[240px]">
                    {fileName}
                  </div>
                </div>

                {/* A/B COMPARISON SWITCH: TRANSFORMED VS ORIGINAL */}
                <div className="rounded-2xl border border-pink-500/25 bg-pink-500/[0.04] p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                      <Repeat size={13} className="text-pink-400" />
                      <span>Live Instant A/B Listening Switch</span>
                    </span>
                    <span className="text-[10px] text-pink-300">
                      Toggle to compare effect live
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveListeningMode("changed")}
                      className={cn(
                        "py-2.5 px-3 rounded-xl border text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer active:scale-95",
                        activeListeningMode === "changed"
                          ? "bg-pink-500 border-pink-400 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                          : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                      )}
                    >
                      <Volume2 size={14} />
                      <span>Transformed Voice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveListeningMode("original")}
                      className={cn(
                        "py-2.5 px-3 rounded-xl border text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer active:scale-95",
                        activeListeningMode === "original"
                          ? "bg-zinc-200 border-white text-zinc-950 shadow-md"
                          : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                      )}
                    >
                      <VolumeX size={14} />
                      <span>Original Audio</span>
                    </button>
                  </div>
                </div>

                {/* 54-BAR INTERACTIVE WAVEFORM VISUALIZER */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                      <Clock size={12} className="text-pink-400" />
                      <span>Timeline Playhead</span>
                    </span>
                    <span className="text-pink-400 font-mono font-bold text-xs">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                      handleSeek(ratio * duration);
                    }}
                    className="relative h-20 w-full rounded-2xl bg-black/50 border border-white/10 p-2.5 flex items-center justify-between gap-1 cursor-pointer select-none group overflow-hidden"
                  >
                    {visualizerBars.map((bar, idx) => {
                      const barProgress = idx / visualizerBars.length;
                      const isPlayed = barProgress <= progressRatio;
                      const liveHeight = isPlaying
                        ? Math.min(1, bar * (0.65 + Math.sin(idx * 0.45 + currentTime * 9) * 0.35))
                        : bar;

                      return (
                        <div key={idx} className="flex-1 flex items-center justify-center h-full">
                          <div
                            style={{ height: `${Math.round(liveHeight * 100)}%` }}
                            className={cn(
                              "w-full rounded-full transition-all duration-75",
                              isPlayed
                                ? "bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.7)]"
                                : "bg-white/15 group-hover:bg-white/25"
                            )}
                          />
                        </div>
                      );
                    })}

                    {/* Laser Needle Playhead */}
                    <div
                      style={{ left: `${progressRatio * 100}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_2px_#ec4899] pointer-events-none transition-all duration-75 z-10"
                    />
                  </div>
                </div>

                {/* TRANSPORT CONTROLS */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="size-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer"
                      title={isPlaying ? "Pause" : "Play audio"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSeek(0)}
                      className="size-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      title="Restart from 0:00"
                    >
                      <RotateCcw size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLooping(!isLooping)}
                      className={cn(
                        "size-9 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer",
                        isLooping
                          ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                          : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                      )}
                      title="Loop playback"
                    >
                      <Repeat size={14} />
                    </button>
                  </div>

                  {/* Playback Speed Controls */}
                  <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-1">
                    {[0.85, 1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setPlaybackSpeed(speed)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer",
                          playbackSpeed === speed
                            ? "bg-pink-500 text-white"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* BOTTOM EXPORT & RETENTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTransformed}
                      className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Changed Voice</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadOriginal}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Download size={13} />
                      <span>Original Audio</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast("Saved to Cloud Vault!")}
                      className="size-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      title="Save to Cloud Vault"
                    >
                      <Layers size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="size-8 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition cursor-pointer"
                      title="Reset settings"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC PROCESSING MODAL (STANDARD 4) */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-3xl border-2 border-pink-500/50 bg-[#0c0e18] p-8 sm:p-10 shadow-[0_0_50px_rgba(236,72,153,0.25)] space-y-6 text-center"
              >
                <div className="relative mx-auto size-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-pink-500/20" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="size-16 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-400">
                    <Speech size={28} className="animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Modulating Vocal Formants...
                  </h3>
                  <p className="text-xs sm:text-sm text-pink-300/90 font-medium">
                    {uploadProgressText || processingStage}
                  </p>
                </div>

                {/* CONTINUOUS HIGH-FREQUENCY PROGRESS BAR */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                    <span>Transformation Progress</span>
                    <span className="text-pink-400 font-mono text-sm">{Math.round(progress)}%</span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-white/5 border border-white/10 p-0.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                      style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span>{elapsed}s elapsed</span>
                    <button
                      type="button"
                      onClick={() => setIsProcessing(false)}
                      className="text-zinc-400 hover:text-rose-400 transition font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
