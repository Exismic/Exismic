"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Video,
  Clapperboard,
  Flame,
  Target,
  AlertCircle,
  Play,
  Square,
  Volume2,
  VolumeX,
  Layers,
  Zap,
  Film,
  MessageSquare,
  Share2,
  TrendingUp,
  Sliders,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Wand2,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";

interface HookObj {
  hook: string;
  trigger?: string;
  explanation?: string;
}

interface ScriptBeat {
  time: string;
  voiceover: string;
  visual: string;
  sfx?: string;
  onScreenText?: string;
  retentionTip?: string;
}

interface BRollItem {
  scene: string;
  suggestion: string;
}

interface CtaItem {
  type: string;
  text: string;
}

interface ScriptOutput {
  viralScore?: number;
  viralAnalysis?: string;
  hooks: (string | HookObj)[];
  script: ScriptBeat[];
  bRollList?: BRollItem[];
  ctaOptions?: CtaItem[];
  cta?: string;
  hashtags?: string[];
}

interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (val: string) => void;
  className?: string;
}

function CustomSelect({ label, value, options, onChange, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-black text-neutral-300 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      {/* Select Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-inner",
          isOpen
            ? "border-rose-500 ring-1 ring-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            : "hover:border-neutral-700"
        )}
      >
        <span className="truncate pr-2">{selectedOption ? selectedOption.label : "Select option..."}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-rose-400"
          )}
        />
      </button>

      {/* Floating Glassmorphic Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-neutral-950/95 border border-neutral-700/80 backdrop-blur-2xl rounded-2xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(244,63,94,0.12)] max-h-80 overflow-y-auto space-y-1.5 no-scrollbar"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer",
                    isSelected
                      ? "bg-rose-500/20 text-rose-200 border border-rose-500/40 shadow-sm shadow-rose-500/20"
                      : "text-neutral-300 hover:bg-neutral-800/90 hover:text-white hover:translate-x-0.5"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 text-[10px] font-bold">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TOPIC_PRESETS = [
  { icon: "🚀", label: "5 Hidden AI Productivity Hacks", text: "5 hidden AI productivity hacks that save 10 hours a week" },
  { icon: "💀", label: "Dark Cyber Security Story", text: "Scariest cyber security horror story that actually happened" },
  { icon: "💰", label: "0 to $10k/mo Solopreneur Secret", text: "How to reach $10k/mo as a solo creator using AI tools" },
  { icon: "⚡", label: "3 Fitness Mistakes Ruining Gains", text: "3 workout mistakes that are secretly destroying your progress" },
  { icon: "🧠", label: "Psychological Tricks Nobody Tells You", text: "3 psychological manipulation tricks you should watch out for" },
];

export default function HookScriptGenerator() {
  // Primary Control States
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<"tiktok" | "shorts" | "reels">("tiktok");
  const [tone, setTone] = useState("controversial");
  const [niche, setNiche] = useState("Tech & AI");
  const [duration, setDuration] = useState("30-40s");
  const [hookFormula, setHookFormula] = useState("pattern_interrupt");
  const [pacing, setPacing] = useState("fast");
  const [goal, setGoal] = useState("viral_views");

  // UX States
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [output, setOutput] = useState<ScriptOutput | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "hooks" | "broll" | "strategy">("timeline");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Web Speech API Voiceover Preview State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speakingBeatIdx, setSpeakingBeatIdx] = useState<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { refreshCredits, toast } = useCredits();

  // Simulated loading stage sequence during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Clean up Web Speech API synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    stopAudio();

    const formData = new FormData();
    formData.append("topic", topic.trim());
    formData.append("platform", platform);
    formData.append("tone", tone);
    formData.append("niche", niche);
    formData.append("duration", duration);
    formData.append("hookFormula", hookFormula);
    formData.append("pacing", pacing);
    formData.append("goal", goal);

    try {
      const response = await fetch("/api/tools/creator/hook-script-generator", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video script package.");
      }

      let parsed: ScriptOutput;
      if (typeof data.result === "string") {
        parsed = JSON.parse(data.result);
      } else {
        parsed = data.result;
      }

      if (!parsed || !Array.isArray(parsed.hooks) || !Array.isArray(parsed.script)) {
        throw new Error("Received malformed script data from AI model.");
      }

      setOutput(parsed);
      setActiveTab("timeline");
      void refreshCredits();
      toast("100x Viral Script Package Generated!", "success");
    } catch (err: any) {
      console.error("[HookScriptGenerator] Error:", err);
      const msg = err?.message || "Failed to generate script. Please check your connection and try again.";
      setErrorMsg(msg);
      toast(msg, "warning");
    } finally {
      setIsGenerating(false);
    }
  };

  // Web Speech API Voiceover Player
  const playVoiceoverText = (text: string, beatIndex?: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast("Speech Synthesis is not supported in your browser.", "warning");
      return;
    }

    window.speechSynthesis.cancel();

    if (isPlayingAudio && speakingBeatIdx === (beatIndex ?? -1)) {
      stopAudio();
      return;
    }

    const cleanText = text.replace(/\*/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setSpeakingBeatIdx(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setSpeakingBeatIdx(null);
    };

    speechUtteranceRef.current = utterance;
    setIsPlayingAudio(true);
    setSpeakingBeatIdx(beatIndex ?? -1);
    window.speechSynthesis.speak(utterance);
  };

  const playFullVoiceover = () => {
    if (!output) return;
    const fullText = output.script.map((s) => s.voiceover).join(". ");
    playVoiceoverText(fullText, -1);
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setSpeakingBeatIdx(null);
  };

  // Copy Helpers
  const triggerCopyToast = (type: string, message: string) => {
    setCopiedType(type);
    toast(message, "success");
    setTimeout(() => setCopiedType(null), 2200);
  };

  const handleCopyFullPackage = () => {
    if (!output) return;
    const hooksText = output.hooks
      .map((h, i) => {
        const text = typeof h === "string" ? h : h.hook;
        const trigger = typeof h === "object" && h.trigger ? ` [${h.trigger}]` : "";
        return `#${i + 1}${trigger}: ${text}`;
      })
      .join("\n");

    const timelineText = output.script
      .map(
        (s) =>
          `⏱️ [${s.time}]\n🗣️ Voiceover: "${s.voiceover}"\n🎬 Visual: ${s.visual}${
            s.sfx ? `\n🔊 SFX: ${s.sfx}` : ""
          }${s.onScreenText ? `\n💬 Text Overlay: ${s.onScreenText}` : ""}`
      )
      .join("\n\n");

    const brollText = output.bRollList
      ? `\n\n🎥 B-ROLL SHOT LIST:\n` + output.bRollList.map((b) => `- ${b.scene}: ${b.suggestion}`).join("\n")
      : "";

    const ctaText = output.cta ? `\n\n⚡ CALL TO ACTION:\n${output.cta}` : "";
    const tagsText = output.hashtags ? `\n\n🏷️ HASHTAGS:\n${output.hashtags.join(" ")}` : "";

    const fullScript = `🔥 VIRAL SCRIPT PACKAGE (${platform.toUpperCase()})\nTopic: ${topic}\n\n🪝 VIRAL HOOK OPTIONS:\n${hooksText}\n\n🎬 TIMESTAMPED MASTER TIMELINE:\n${timelineText}${brollText}${ctaText}${tagsText}`;

    navigator.clipboard.writeText(fullScript);
    triggerCopyToast("full", "Copied full production script package!");
  };

  const handleCopyTeleprompter = () => {
    if (!output) return;
    const teleprompterText = output.script.map((s) => s.voiceover.replace(/\*/g, "")).join("\n\n");
    navigator.clipboard.writeText(teleprompterText);
    triggerCopyToast("teleprompter", "Copied teleprompter voiceover text!");
  };

  const handleCopySingleHook = (hookText: string, idx: number) => {
    navigator.clipboard.writeText(hookText);
    setCopiedHookIdx(idx);
    toast(`Copied Hook #${idx + 1}!`, "success");
    setTimeout(() => setCopiedHookIdx(null), 2000);
  };

  const loadingMessages = [
    "Analyzing viral hook psychology & retention loops...",
    "Engineering pattern interrupts for " + platform.toUpperCase() + "...",
    "Constructing timestamped shot list & sound design...",
    "Finalizing B-roll asset checklist & viral hashtag stack...",
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Dynamic Header Banner */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-rose-950/60 via-purple-950/40 to-neutral-950 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] backdrop-blur-2xl overflow-hidden group">
        {/* Glowing Background Auras */}
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-rose-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-40%] left-[-10%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/10">
              <Flame className="w-4 h-4 text-rose-400 animate-bounce" /> Exismic AI Viral Studio v2.0
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              AI Video Hook & Script Generator
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base font-medium leading-relaxed">
              Generate 100x high-retention video hooks, timestamped voiceover transcripts, visual shot directives, sound cues, and production checklists for TikTok, Shorts, & Reels.
            </p>
          </div>

          <div className="shrink-0 hidden lg:flex flex-col items-end gap-2 bg-neutral-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Algorithmic Precision
            </div>
            <span className="text-2xl font-black text-white">99.4%</span>
            <span className="text-[11px] text-neutral-400 font-medium">Viewer Retention Engine</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6 p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800/80 backdrop-blur-2xl shadow-2xl">
          {/* Preset Topic Inspiration Chips */}
          <div>
            <label className="block text-xs font-black text-neutral-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-rose-400" /> One-Click Inspiration Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(preset.text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-rose-500/50 hover:bg-rose-500/10 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic / Product Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-neutral-200 uppercase tracking-widest">
                Video Topic or Product <span className="text-rose-400">*</span>
              </label>
              {topic && (
                <button
                  type="button"
                  onClick={() => setTopic("")}
                  className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 hidden AI tools, horror stories, launch of a smart watch..."
              rows={3}
              className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-medium resize-none transition-all shadow-inner"
            />
          </div>

          {/* Target Platform */}
          <div>
            <label className="block text-xs font-black text-neutral-200 uppercase tracking-widest mb-2.5">
              Target Platform
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "tiktok", label: "TikTok", icon: "🎵" },
                { id: "shorts", label: "YT Shorts", icon: "🔴" },
                { id: "reels", label: "Reels", icon: "📸" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id as any)}
                  className={cn(
                    "py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    platform === p.id
                      ? "bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.02]"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  )}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Niche & Target Audience (Custom Dropdown) */}
          <div className="relative z-30">
            <CustomSelect
              label="Niche / Target Audience"
              value={niche}
              onChange={setNiche}
              options={[
                { value: "Tech & AI", label: "💻 Tech, AI & Digital Tools" },
                { value: "Business & Finance", label: "💰 Business, Money & Solopreneurs" },
                { value: "Fitness & Health", label: "🏋️ Fitness, Health & Nutrition" },
                { value: "Storytelling & True Crime", label: "📖 True Crime, Horrors & Lore" },
                { value: "Gaming & Culture", label: "🎮 Gaming, Anime & Web Culture" },
                { value: "SaaS & Marketing", label: "⚡ SaaS, Marketing & Growth" },
                { value: "Daily Vlogs & Life", label: "🎥 Daily Vlogs & Lifestyle" },
              ]}
            />
          </div>

          {/* Video Duration & Hook Formula (Row with Custom Dropdowns) */}
          <div className="grid grid-cols-2 gap-3 relative z-20">
            <CustomSelect
              label="Target Length"
              value={duration}
              onChange={setDuration}
              options={[
                { value: "15s", label: "⚡ 15s Micro-Burst", badge: "High Retention" },
                { value: "30-40s", label: "🔥 30-40s Viral Standard", badge: "Recommended" },
                { value: "60-90s", label: "🎬 60-90s Deep Story" },
              ]}
            />

            <CustomSelect
              label="Hook Formula"
              value={hookFormula}
              onChange={setHookFormula}
              options={[
                { value: "pattern_interrupt", label: "⚡ Pattern Interrupt" },
                { value: "negative_constraint", label: "⚠️ Negative Constraint" },
                { value: "curiosity_gap", label: "❓ Curiosity Gap" },
                { value: "bold_claim", label: "🏆 Bold Claim + Proof" },
                { value: "in_media_res", label: "🔥 Drop In-Media-Res" },
              ]}
            />
          </div>

          {/* Tone & Pacing (Row with Custom Dropdowns) */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <CustomSelect
              label="Hook Tone"
              value={tone}
              onChange={setTone}
              options={[
                { value: "controversial", label: "🔥 Bold & Controversial" },
                { value: "storytelling", label: "📖 Suspense & Story" },
                { value: "educational", label: "💡 Value-First & High Proof" },
                { value: "urgency", label: "⚡ High Urgency & FOMO" },
              ]}
            />

            <CustomSelect
              label="Pacing & Energy"
              value={pacing}
              onChange={setPacing}
              options={[
                { value: "fast", label: "⚡ Ultra Fast & Punchy" },
                { value: "cinematic", label: "🎥 Cinematic & Suspense" },
                { value: "hype", label: "🚀 High Energy & Loud" },
                { value: "calm", label: "🧠 Calm & Authoritative" },
              ]}
            />
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm tracking-widest uppercase shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Generating AI Script...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-rose-200" />
                <span>Generate Master Script Package</span>
              </>
            )}
          </button>
        </div>

        {/* Output Column / Interactive Studio */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800/80 backdrop-blur-2xl shadow-2xl flex flex-col min-h-[580px]">
          {isGenerating ? (
            /* Animated Loading State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
                <div className="absolute inset-3 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-spin [animation-duration:1.5s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-rose-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <h4 className="text-lg font-extrabold text-white">Engineering Master Script</h4>
                <p className="text-xs font-semibold text-rose-400 animate-pulse">
                  {loadingMessages[loadingStage]}
                </p>
              </div>
            </div>
          ) : output ? (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Studio Header & Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-black text-lg">
                    {output.viralScore ?? 96}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Viral Potential Index
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                        HIGH RETENTION
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-medium line-clamp-1 max-w-xs">
                      {output.viralAnalysis || "Optimized for maximum pattern interrupt and viewer retention."}
                    </p>
                  </div>
                </div>

                {/* Global Audio Preview & Copy Actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={isPlayingAudio ? stopAudio : playFullVoiceover}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      isPlayingAudio
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    )}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-rose-400" /> Listen Voiceover
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyTeleprompter}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedType === "teleprompter" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>Teleprompter</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyFullPackage}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-500/10"
                  >
                    {copiedType === "full" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-rose-300" />
                    )}
                    <span>Copy All</span>
                  </button>
                </div>
              </div>

              {/* Studio Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "timeline", label: "Timeline Script", icon: Target, badge: output.script.length },
                  { id: "hooks", label: "5 Viral Hooks", icon: Flame, badge: output.hooks.length },
                  { id: "broll", label: "B-Roll Shot List", icon: Film, badge: output.bRollList?.length ?? 0 },
                  { id: "strategy", label: "Growth & Tags", icon: TrendingUp },
                ].map((t) => {
                  const IconComp = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer",
                        isActive
                          ? "bg-rose-500/20 border border-rose-500/40 text-rose-200 shadow-md shadow-rose-500/10"
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                      )}
                    >
                      <IconComp className={cn("w-4 h-4", isActive ? "text-rose-400" : "text-neutral-500")} />
                      <span>{t.label}</span>
                      {t.badge !== undefined && t.badge > 0 && (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                            isActive ? "bg-rose-500/40 text-white" : "bg-neutral-800 text-neutral-400"
                          )}
                        >
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Timestamped Timeline */}
              {activeTab === "timeline" && (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                  {output.script.map((step, idx) => {
                    const isSpeakingThisBeat = isPlayingAudio && speakingBeatIdx === idx;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "p-4 rounded-2xl bg-neutral-950 border transition-all space-y-3",
                          isSpeakingThisBeat
                            ? "border-rose-500/60 shadow-lg shadow-rose-500/10 bg-rose-950/10"
                            : "border-neutral-800/80 hover:border-neutral-700"
                        )}
                      >
                        {/* Time Header & Beat Play Button */}
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">
                            ⏱️ {step.time}
                          </span>

                          <button
                            type="button"
                            onClick={() => playVoiceoverText(step.voiceover, idx)}
                            className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{isSpeakingThisBeat ? "Stop" : "Listen Beat"}</span>
                          </button>
                        </div>

                        {/* Spoken Voiceover */}
                        <div>
                          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-1">
                            🗣️ Spoken Voiceover
                          </span>
                          <p className="text-neutral-100 font-medium text-sm leading-relaxed">
                            "{step.voiceover}"
                          </p>
                        </div>

                        {/* Visual & SFX Directives */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800/80">
                            <span className="text-[10px] font-bold text-purple-400 uppercase block mb-0.5">
                              🎬 Visual Direction
                            </span>
                            <p className="text-neutral-300 italic">{step.visual}</p>
                          </div>

                          {step.sfx && (
                            <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800/80">
                              <span className="text-[10px] font-bold text-amber-400 uppercase block mb-0.5">
                                🔊 Sound Effect (SFX)
                              </span>
                              <p className="text-amber-200 font-medium">{step.sfx}</p>
                            </div>
                          )}
                        </div>

                        {/* On-Screen Text & Micro Retention Tip */}
                        {(step.onScreenText || step.retentionTip) && (
                          <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                            {step.onScreenText && (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
                                💬 On-Screen Text: "{step.onScreenText}"
                              </span>
                            )}
                            {step.retentionTip && (
                              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">
                                🧠 Retention Tip: {step.retentionTip}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: 5 Viral Hooks Vault */}
              {activeTab === "hooks" && (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                  {output.hooks.map((h, i) => {
                    const text = typeof h === "string" ? h : h.hook;
                    const trigger = typeof h === "object" ? h.trigger : null;
                    const explanation = typeof h === "object" ? h.explanation : null;

                    return (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2.5 hover:border-rose-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-black text-xs">
                              Hook #{i + 1}
                            </span>
                            {trigger && (
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-extrabold uppercase">
                                {trigger}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopySingleHook(text, i)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            {copiedHookIdx === i ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedHookIdx === i ? "Copied" : "Copy"}</span>
                          </button>
                        </div>

                        <p className="text-neutral-100 font-bold text-sm leading-relaxed">"{text}"</p>

                        {explanation && (
                          <p className="text-neutral-400 text-xs leading-relaxed italic bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60">
                            🧠 <span className="font-semibold text-neutral-300">Psychology:</span> {explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: B-Roll Shot List */}
              {activeTab === "broll" && (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                  {output.bRollList && output.bRollList.length > 0 ? (
                    output.bRollList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3.5"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/15 text-purple-300 font-black text-xs shrink-0 mt-0.5">
                          #{idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-white uppercase tracking-wider">{item.scene}</h5>
                          <p className="text-neutral-300 text-xs leading-relaxed">{item.suggestion}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-neutral-500 text-xs">
                      No B-Roll shot list generated for this format.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Growth & Hashtags */}
              {activeTab === "strategy" && (
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[460px] pr-1">
                  {/* Call to Actions */}
                  {output.ctaOptions && output.ctaOptions.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> High-Converting CTA Options
                      </h5>
                      <div className="grid grid-cols-1 gap-2">
                        {output.ctaOptions.map((cta, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1"
                          >
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">
                              {cta.type}
                            </span>
                            <p className="text-neutral-200 font-semibold">{cta.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary CTA Fallback */}
                  {output.cta && (!output.ctaOptions || output.ctaOptions.length === 0) && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                      <span className="text-rose-400 font-black uppercase tracking-wider block">
                        ⚡ Recommended CTA
                      </span>
                      <p className="text-rose-100 font-semibold leading-relaxed">{output.cta}</p>
                    </div>
                  )}

                  {/* Hashtags */}
                  {output.hashtags && output.hashtags.length > 0 && (
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-neutral-300 uppercase tracking-wider">
                          🏷️ Algorithmic Hashtag Stack
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(output.hashtags!.join(" "));
                            toast("Copied hashtag stack!", "success");
                          }}
                          className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Copy Tags
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {output.hashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-700 shadow-inner">
                <Clapperboard className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-base font-bold text-neutral-300">Ready for Production</h4>
                <p className="text-xs font-medium text-neutral-400 leading-relaxed">
                  Enter any video topic or product on the left to generate intelligent, platform-tailored viral hooks, speech transcripts, & visual directives.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
