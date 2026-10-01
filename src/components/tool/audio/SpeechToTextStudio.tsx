"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic2,
  FileText,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Download,
  Check,
  Search,
  Radio,
  Clock,
  Layers,
  Sliders,
  AudioWaveform,
  Volume2,
  X,
  Edit3,
  Eye,
  FileCode2,
  CornerDownLeft,
  Headphones,
  Film,
  Flame,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { generateSttDemoAudio } from "@/lib/vocal-demo-generator";

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

// 4 Instant 1-Click Blueprints (Zero Tech Jargon)
const STT_BLUEPRINTS = [
  {
    id: "podcast",
    title: "Podcast Conversation",
    icon: Radio,
    description: "Studio conversation on creative freedom and digital storytelling.",
    language: "en",
    duration: 18,
    text: "Welcome back to The Creative Wire. Today we are joined by industry pioneers to discuss how modern creators are building thriving audiences without traditional gatekeepers. The landscape has completely transformed over the past few years, giving individuals the power to produce studio-grade work right from their own desks. Quality and authenticity now triumph over massive corporate budgets.",
    segments: [
      { id: 0, start: 0.0, end: 4.8, text: "Welcome back to The Creative Wire." },
      { id: 1, start: 4.8, end: 10.5, text: "Today we are joined by industry pioneers to discuss how modern creators are building thriving audiences." },
      { id: 2, start: 10.5, end: 14.8, text: "The landscape has completely transformed over the past few years, giving individuals studio-grade power." },
      { id: 3, start: 14.8, end: 18.0, text: "Quality and authenticity now triumph over massive corporate budgets." },
    ],
  },
  {
    id: "voice-memo",
    title: "Quick Voice Memo",
    icon: Flame,
    description: "Daily reminder, key design priorities, and task action items.",
    language: "en",
    duration: 14,
    text: "Quick reminder for the product launch sync tomorrow at two o'clock. We need to finalize the navigation architecture, check mobile touch targets for the audio player, and review the contrast ratios on the dark mode badges before the release candidate is deployed to staging.",
    segments: [
      { id: 0, start: 0.0, end: 4.5, text: "Quick reminder for the product launch sync tomorrow at two o'clock." },
      { id: 1, start: 4.5, end: 9.8, text: "We need to finalize the navigation architecture and check mobile touch targets for the audio player." },
      { id: 2, start: 9.8, end: 14.0, text: "Review the contrast ratios on the dark mode badges before the release candidate is deployed." },
    ],
  },
  {
    id: "standup",
    title: "Team Standup",
    icon: Film,
    description: "Engineering sprint check-in, performance improvements, and roadmap.",
    language: "en",
    duration: 16,
    text: "Good morning team. Quick update from the engineering side: our audio processing pipeline latency is down by forty percent, the cloud storage vault indexing is running smoothly, and all unit tests passed overnight. Next up is user testing for the subtitle export module.",
    segments: [
      { id: 0, start: 0.0, end: 3.5, text: "Good morning team. Quick update from the engineering side." },
      { id: 1, start: 3.5, end: 8.9, text: "Our audio processing pipeline latency is down by forty percent." },
      { id: 2, start: 8.9, end: 12.8, text: "The cloud storage vault indexing is running smoothly, and all unit tests passed overnight." },
      { id: 3, start: 12.8, end: 16.0, text: "Next up is user testing for the subtitle export module." },
    ],
  },
  {
    id: "lecture",
    title: "University Lecture",
    icon: Compass,
    description: "Audio acoustics fundamentals and digital wave sampling overview.",
    language: "en",
    duration: 17,
    text: "In today's lecture, we examine the fundamentals of sound representation. When sound waves travel through physical space, they create continuous variations in atmospheric pressure. To capture this digitally, we sample the wave amplitude at discrete time intervals, typically forty-four thousand times per second.",
    segments: [
      { id: 0, start: 0.0, end: 4.2, text: "In today's lecture, we examine the fundamentals of sound representation." },
      { id: 1, start: 4.2, end: 9.6, text: "When sound waves travel through physical space, they create continuous variations in atmospheric pressure." },
      { id: 2, start: 9.6, end: 17.0, text: "To capture this digitally, we sample the wave amplitude at discrete time intervals, typically forty-four thousand times per second." },
    ],
  },
];

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  const pad = (n: number, w: number = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

export function SpeechToTextStudio() {
  // Audio Input & Source State
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("Sample Voice Memo");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [inputTab, setInputTab] = useState<"upload" | "record">("upload");

  // Microphone Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback & Waveform State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(18);
  const [speakingSpeed, setSpeakingSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // Transcript Output State
  const [transcriptText, setTranscriptText] = useState<string>(STT_BLUEPRINTS[0].text);
  const [segments, setSegments] = useState<TranscriptSegment[]>(STT_BLUEPRINTS[0].segments);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("en");
  const [viewMode, setViewMode] = useState<"paragraphs" | "timestamps">("paragraphs");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Processing & Standard 4 Dynamic Progress State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("Preparing audio...");
  const [uploadProgressText, setUploadProgressText] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Synthesize Instant Playable Audio Demo on Initial Load ($0 Compute, 0s Wait)
  useEffect(() => {
    let active = true;
    generateSttDemoAudio().then((demo) => {
      if (!active) return;
      setAudioUrl(demo.url);
      setDuration(demo.duration);
    }).catch(() => {});

    return () => {
      active = false;
      if (xhrRef.current) xhrRef.current.abort();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // 2. Smooth 60FPS RAF Playhead Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const updateLoop = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        }
        animFrameRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // 3. Sync Playback Rate with Speaking Speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speakingSpeed;
    }
  }, [speakingSpeed, audioUrl]);

  // 4. Word and Reading Metrics
  const wordCount = useMemo(() => {
    return transcriptText.trim() ? transcriptText.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [transcriptText]);

  const readingTimeMin = useMemo(() => {
    return Math.max(1, Math.round(wordCount / 200));
  }, [wordCount]);

  // 5. Filtered Highlights for Search
  const searchMatchesCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const regex = new RegExp(searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = transcriptText.match(regex);
    return matches ? matches.length : 0;
  }, [searchQuery, transcriptText]);

  // Visualizer Bars (54 Bars)
  const visualizerBars = useMemo(() => {
    return Array.from({ length: 54 }, (_, i) => {
      const phase = (i / 54) * Math.PI * 3.5;
      const height = Math.abs(Math.sin(phase) * 0.65 + Math.cos(phase * 1.8) * 0.35);
      return Math.max(0.12, Math.min(0.96, height));
    });
  }, []);

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  // File Drop Handling
  const handleDrop = useCallback((droppedFiles: File[]) => {
    const selected = droppedFiles[0];
    if (!selected) return;

    if (selected.size > 25 * 1024 * 1024) {
      showToast("File is too large. Maximum size is 25MB.");
      return;
    }

    setFile(selected);
    setAudioFileName(selected.name);
    setIsDemo(false);

    if (audioUrl && isDemo) {
      URL.revokeObjectURL(audioUrl);
    }
    const newUrl = URL.createObjectURL(selected);
    setAudioUrl(newUrl);
    setIsPlaying(false);
    setCurrentTime(0);

    // Read duration
    const tempAudio = new Audio();
    tempAudio.src = newUrl;
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDuration(tempAudio.duration);
      }
    };

    showToast(`Loaded ${selected.name}`);
  }, [audioUrl, isDemo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    maxSize: 25 * 1024 * 1024,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"],
      "video/mp4": [".mp4"],
    },
  });

  // 1-Click Blueprints Loader
  const handleLoadBlueprint = (bp: typeof STT_BLUEPRINTS[0]) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setAudioFileName(`${bp.title}.mp3`);
    setTranscriptText(bp.text);
    setSegments(bp.segments);
    setDuration(bp.duration);
    setCurrentTime(0);
    setIsDemo(true);
    setFile(null);
    setDetectedLanguage(bp.language);
    setIsEditing(false);
    setSearchQuery("");
    showToast(`Loaded ${bp.title}`);
  };

  // Live Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const recordedFile = new File([audioBlob], `mic-recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setFile(recordedFile);
        setAudioFileName("Live Microphone Recording");
        setIsDemo(false);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsPlaying(false);
        setCurrentTime(0);

        // Read audio duration
        const tempAudio = new Audio(url);
        tempAudio.onloadedmetadata = () => {
          if (tempAudio.duration && !isNaN(tempAudio.duration)) {
            setDuration(tempAudio.duration);
          }
        };

        // Stop all mic tracks
        stream.getTracks().forEach((track) => track.stop());
        showToast("Voice recording saved. Ready to transcribe!");
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      showToast("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Play / Pause Audio
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(duration, newTime));
    setCurrentTime(clamped);
    if (audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  };

  // Seek from Clickable Timestamp in Transcript
  const handleSeekTimestamp = (seconds: number) => {
    handleSeek(seconds);
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Transcribe Action with Standard 4 Dynamic Progress
  const handleTranscribe = async () => {
    if (!file && !isDemo) {
      showToast("Please upload or record an audio file first.");
      return;
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setIsProcessing(true);
    setProgress(5);
    setElapsed(0);
    setUploadProgressText("");
    setProcessingStage("Scanning audio frequencies and acoustic quality...");

    // Elapsed timer
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    const startTime = Date.now();
    elapsedTimerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Dynamic asymptotic ticker
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          setProcessingStage("Scanning audio frequencies and acoustic quality...");
          return Math.min(30, prev + 3.2);
        } else if (prev < 65) {
          setProcessingStage("Recognizing speech patterns and spoken vocabulary...");
          return Math.min(65, prev + 2.1);
        } else if (prev < 88) {
          setProcessingStage("Aligning words, punctuation, and timestamps...");
          return Math.min(88, prev + 1.2);
        } else if (prev < 98) {
          setProcessingStage("Formatting clean transcript...");
          return Math.min(98, prev + 0.4);
        }
        return prev;
      });
    }, 120);

    // If using the pre-loaded demo blueprint, simulate smooth full transcription without unnecessary network payload
    if (isDemo && !file) {
      setTimeout(() => {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        setProgress(100);
        setProcessingStage("Transcript ready!");

        setTimeout(() => {
          setIsProcessing(false);
          showToast("Transcript generated successfully!");
        }, 400);
      }, 1400);
      return;
    }

    // Call Cloud Whisper Transcription API with Real Byte Upload Tracking
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        const loadedMb = (event.loaded / 1024 / 1024).toFixed(1);
        const totalMb = (event.total / 1024 / 1024).toFixed(1);
        setUploadProgressText(`Uploading audio (${percent}%) • ${loadedMb} MB of ${totalMb} MB`);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          setProgress(100);
          setProcessingStage("Transcript ready!");

          setTimeout(() => {
            setTranscriptText(data.text || "");
            if (Array.isArray(data.segments) && data.segments.length > 0) {
              setSegments(data.segments);
            } else {
              // Construct sentence chunks
              const sentenceMatches = data.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [data.text];
              const secPerSentence = (data.duration || duration) / Math.max(1, sentenceMatches.length);
              setSegments(
                sentenceMatches.map((s: string, idx: number) => ({
                  id: idx,
                  start: Math.round(idx * secPerSentence * 10) / 10,
                  end: Math.round((idx + 1) * secPerSentence * 10) / 10,
                  text: s.trim(),
                }))
              );
            }

            if (data.language) setDetectedLanguage(data.language);
            if (data.duration && !isNaN(data.duration)) setDuration(data.duration);
            setIsProcessing(false);
            showToast("Transcript generated successfully!");
          }, 400);
        } catch {
          handleFailure("Invalid response format from transcription service.");
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          handleFailure(errData.error || `Transcription failed (${xhr.status})`);
        } catch {
          handleFailure(`Transcription failed (${xhr.status})`);
        }
      }
    };

    xhr.onerror = () => {
      handleFailure("Network error while connecting to transcription service.");
    };

    const formData = new FormData();
    formData.append("file", file!);
    formData.append("language", "auto");

    xhr.open("POST", "/api/tools/audio/stt");
    xhr.send(formData);
  };

  const handleFailure = (msg: string) => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setIsProcessing(false);
    showToast(msg);
  };

  const handleCancelTranscription = () => {
    if (xhrRef.current) xhrRef.current.abort();
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setIsProcessing(false);
    setProgress(0);
    showToast("Transcription cancelled");
  };

  // Copy All Text
  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transcriptText);
    setIsCopied(true);
    showToast("Transcript copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download as Plain TXT
  const handleDownloadTxt = () => {
    const blob = new Blob([transcriptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = audioFileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-") || "transcript";
    a.download = `${baseName}-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Downloaded clean transcript TXT");
  };

  // Download as Subtitle SRT
  const handleDownloadSrt = () => {
    let srtContent = "";
    segments.forEach((seg, idx) => {
      srtContent += `${idx + 1}\n`;
      srtContent += `${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n`;
      srtContent += `${seg.text.trim()}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = audioFileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-") || "transcript";
    a.download = `${baseName}-subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Downloaded video subtitles (.SRT)");
  };

  // Save to Cloud Vault
  const handleSaveToVault = () => {
    try {
      const existing = JSON.parse(localStorage.getItem("exismic_vault_files") || "[]");
      existing.unshift({
        id: `stt-${Date.now()}`,
        name: `${audioFileName} Transcript (${wordCount} words)`,
        type: "document",
        createdAt: new Date().toISOString(),
        folder: "Transcripts",
      });
      localStorage.setItem("exismic_vault_files", JSON.stringify(existing.slice(0, 50)));
      showToast("Saved to Cloud Vault");
    } catch {
      showToast("Saved to your files");
    }
  };

  // Reset Everything
  const handleReset = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setFile(null);
    setAudioFileName("Sample Voice Memo");
    setTranscriptText(STT_BLUEPRINTS[0].text);
    setSegments(STT_BLUEPRINTS[0].segments);
    setIsDemo(true);
    setSearchQuery("");
    setIsEditing(false);
    setCurrentTime(0);
    showToast("Reset to sample recording");
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-6">
      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          loop={isLooping}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (!isNaN(el.currentTime)) setCurrentTime(el.currentTime);
            if (el.duration && !isNaN(el.duration) && el.duration > 0) setDuration(el.duration);
          }}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            if (el.duration && !isNaN(el.duration) && el.duration > 0) setDuration(el.duration);
          }}
          onEnded={() => {
            if (!isLooping) {
              setIsPlaying(false);
              setCurrentTime(0);
            }
          }}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 rounded-2xl bg-[#0e101d] border border-pink-500/40 px-4 py-3 shadow-[0_10px_40px_rgba(236,72,153,0.3)] flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="size-2 rounded-full bg-pink-400 animate-ping" />
            <span className="text-xs font-bold text-white">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. STUDIO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-widest">
            <Link href="/category/audio" className="hover:underline flex items-center gap-1.5">
              <span>Audio & Music Tools</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">Speech to Text Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
              <Mic2 size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Speech to</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400">
                  Text Studio
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Turn voice memos, podcasts, and recordings into clean, readable text transcripts in seconds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5">
            <AudioWaveform size={13} />
            <span>AI Powered</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-bold flex items-center gap-1.5">
            <Clock size={13} />
            <span>Instant Transcripts</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN OBSIDIAN CYBER WORKSPACE */}
      <div className="rounded-[2.5rem] border-2 border-pink-500/35 bg-[#090a12] p-5 sm:p-7 shadow-[0_0_60px_rgba(236,72,153,0.12)] relative overflow-hidden backdrop-blur-2xl">
        {/* Ambient Neon Pink Radial Glows */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative space-y-6">
          {/* INSTANT BLUEPRINTS (1-Click Real World Samples) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <FileText size={13} />
                <span>Instant Audio Blueprints</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">Click to test transcription with 0 wait</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STT_BLUEPRINTS.map((bp) => {
                const IconComponent = bp.icon;
                const isCurrent = isDemo && audioFileName.includes(bp.title);

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

          {/* DUAL WORKSPACE COLUMNS: AUDIO INPUT + TRANSCRIPT CONSOLE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: AUDIO INPUT & PLAYER (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-4 sm:p-5 space-y-4">
                {/* Mode Selector: Upload File vs Record Live Mic */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <AudioWaveform size={13} />
                    <span>Audio Source</span>
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
                      "flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition group relative overflow-hidden",
                      isDragActive
                        ? "border-pink-500 bg-pink-500/10 shadow-[0_0_25px_rgba(236,72,153,0.2)]"
                        : "border-white/15 bg-white/[0.02] hover:border-pink-500/40 hover:bg-white/[0.04]"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="size-12 rounded-2xl bg-white/[0.06] group-hover:bg-pink-500/20 text-zinc-300 group-hover:text-pink-300 flex items-center justify-center transition shadow-inner">
                      <Upload size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white group-hover:text-pink-100 transition truncate max-w-xs">
                        {file ? file.name : "Drop an audio recording here"}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {file
                          ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to transcribe`
                          : "MP3, WAV, M4A, OGG, FLAC up to 25MB"}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: LIVE MICROPHONE RECORDER */}
                {inputTab === "record" && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center space-y-4">
                    <div className="relative mx-auto size-16 flex items-center justify-center">
                      {isRecording && (
                        <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                      )}
                      <div
                        className={cn(
                          "size-14 rounded-full flex items-center justify-center transition shadow-lg",
                          isRecording
                            ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                            : "bg-white/[0.06] text-zinc-300"
                        )}
                      >
                        <Mic2 size={24} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">
                        {isRecording ? "Recording in progress..." : "Ready to Record Audio"}
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
                          className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
                        >
                          <Mic2 size={14} />
                          <span>Start Recording</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-lg shadow-rose-600/30 cursor-pointer animate-pulse"
                        >
                          <Pause size={14} />
                          <span>Stop & Load Recording</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ACTIVE AUDIO FILE SUMMARY & PLAYER */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold truncate max-w-[200px]">
                      {audioFileName}
                    </span>
                    <span className="text-pink-400 font-mono font-bold text-[11px]">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* MINI INTERACTIVE WAVEFORM */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                      handleSeek(ratio * duration);
                    }}
                    className="relative h-14 w-full rounded-2xl bg-black/40 border border-white/10 p-2 flex items-center justify-between gap-1 cursor-pointer select-none group overflow-hidden"
                  >
                    {visualizerBars.map((bar, idx) => {
                      const barProgress = idx / visualizerBars.length;
                      const isPlayed = barProgress <= progressRatio;
                      const liveHeight = isPlaying
                        ? Math.min(1, bar * (0.7 + Math.sin(idx * 0.4 + currentTime * 8) * 0.3))
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

                  {/* PLAYER CONTROLS */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="size-9 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer"
                        title={isPlaying ? "Pause" : "Play audio"}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSeek(0)}
                        className="size-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                        title="Restart from 0:00"
                      >
                        <RotateCcw size={12} />
                      </button>

                      <span className="text-[11px] font-mono text-zinc-400">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Speed Controls */}
                    <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
                      {[0.85, 1.0, 1.25, 1.5].map((sp) => (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => setSpeakingSpeed(sp)}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer",
                            speakingSpeed === sp
                              ? "bg-pink-500 text-white"
                              : "text-zinc-400 hover:text-white"
                          )}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <button
                  type="button"
                  onClick={handleTranscribe}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer",
                    isProcessing
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:via-rose-400 hover:to-purple-500 border border-pink-400/40 shadow-[0_0_25px_rgba(236,72,153,0.35)]"
                  )}
                >
                  <Mic2 size={16} />
                  <span>{isProcessing ? "Transcribing Audio..." : "Transcribe Speech to Text"}</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: SMART TRANSCRIPT CONSOLE (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#0c0e18] p-5 space-y-4">
                {/* HEADER DETAILS & STATS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                      <FileText size={14} />
                      <span>Transcript Studio</span>
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold uppercase">
                      {detectedLanguage}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-semibold">
                    <span className="text-zinc-200">{wordCount} words</span>
                    <span>•</span>
                    <span className="text-pink-300 flex items-center gap-1">
                      <Clock size={11} />
                      <span>~{readingTimeMin} min read</span>
                    </span>
                  </div>
                </div>

                {/* TOOLBAR: FORMAT SWITCHER & SEARCH BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  {/* View Mode Toggle: Paragraphs vs Timestamps */}
                  <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("paragraphs")}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer",
                        viewMode === "paragraphs"
                          ? "bg-pink-500 text-white"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <FileText size={12} />
                      <span>Paragraphs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("timestamps")}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer",
                        viewMode === "timestamps"
                          ? "bg-pink-500 text-white"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Clock size={12} />
                      <span>Timestamps</span>
                    </button>
                  </div>

                  {/* Search / Filter Input */}
                  <div className="relative flex-1 min-w-[140px] max-w-xs">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search words..."
                      className="w-full h-8 pl-8 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/40"
                    />
                    {searchQuery && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-pink-400 bg-pink-500/20 px-1.5 py-0.5 rounded">
                        {searchMatchesCount}
                      </span>
                    )}
                  </div>

                  {/* Edit Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl border text-[11px] font-bold transition flex items-center gap-1 cursor-pointer",
                      isEditing
                        ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                        : "bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white"
                    )}
                    title="Toggle edit mode"
                  >
                    {isEditing ? <Eye size={12} /> : <Edit3 size={12} />}
                    <span>{isEditing ? "Read Mode" : "Edit Text"}</span>
                  </button>
                </div>

                {/* TRANSCRIPT TEXT CONTENT (READ OR EDIT) */}
                <div className="min-h-[280px] max-h-[380px] overflow-y-auto pr-1 rounded-2xl bg-black/30 border border-white/5 p-4 text-sm leading-relaxed text-zinc-200">
                  {isEditing ? (
                    <textarea
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      rows={11}
                      className="w-full bg-transparent text-white text-sm sm:text-base leading-relaxed resize-none focus:outline-none placeholder-zinc-500"
                      placeholder="Transcript text..."
                    />
                  ) : viewMode === "paragraphs" ? (
                    <div className="space-y-3">
                      {searchQuery.trim() ? (
                        <p className="text-sm sm:text-base leading-relaxed text-zinc-100 whitespace-pre-wrap">
                          {transcriptText.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")).map((chunk, idx) => {
                            const isMatch = chunk.toLowerCase() === searchQuery.toLowerCase();
                            return isMatch ? (
                              <mark key={idx} className="bg-pink-500 text-white font-bold px-1 rounded">
                                {chunk}
                              </mark>
                            ) : (
                              <span key={idx}>{chunk}</span>
                            );
                          })}
                        </p>
                      ) : (
                        <p className="text-sm sm:text-base leading-relaxed text-zinc-100 whitespace-pre-wrap">
                          {transcriptText}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Timestamps View */
                    <div className="space-y-2.5">
                      {segments.map((seg) => (
                        <div
                          key={seg.id}
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition group"
                        >
                          <button
                            type="button"
                            onClick={() => handleSeekTimestamp(seg.start)}
                            className="shrink-0 px-2 py-1 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/25 border border-pink-500/30 text-[10px] font-mono font-bold text-pink-300 transition flex items-center gap-1 cursor-pointer"
                            title="Click to play from this moment"
                          >
                            <Play size={9} />
                            <span>{formatTime(seg.start)}</span>
                          </button>
                          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed pt-0.5">
                            {searchQuery.trim() ? (
                              seg.text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")).map((chunk, idx) => {
                                const isMatch = chunk.toLowerCase() === searchQuery.toLowerCase();
                                return isMatch ? (
                                  <mark key={idx} className="bg-pink-500 text-white font-bold px-1 rounded">
                                    {chunk}
                                  </mark>
                                ) : (
                                  <span key={idx}>{chunk}</span>
                                );
                              })
                            ) : (
                              seg.text
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTTOM EXPORT & RETENTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{isCopied ? "Copied" : "Copy All"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadTxt}
                      className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download .TXT</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadSrt}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Export video captions with timestamps"
                    >
                      <FileCode2 size={13} />
                      <span>Download .SRT</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveToVault}
                      className="size-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      title="Save to Cloud Vault"
                    >
                      <Layers size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="size-8 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition cursor-pointer"
                      title="Reset transcript"
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
                    <Mic2 size={28} className="animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Transcribing Audio...
                  </h3>
                  <p className="text-xs sm:text-sm text-pink-300/90 font-medium">
                    {uploadProgressText || processingStage}
                  </p>
                </div>

                {/* CONTINUOUS HIGH-FREQUENCY PROGRESS BAR */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                    <span>Recognition Progress</span>
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
                      onClick={handleCancelTranscription}
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

