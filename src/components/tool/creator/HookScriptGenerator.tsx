"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
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
  Film,
  Share2,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Zap,
  Rocket,
  ShieldAlert,
  Coins,
  Dumbbell,
  Brain,
  Clock,
  Mic2,
  Type,
  Eye,
  CheckCircle2,
  ChevronDown,
  Maximize2,
  Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { 
  HOOK_SCRIPT_BLUEPRINTS, 
  type ScriptOutput, 
  type ScriptBeat, 
  type BRollItem, 
  type CtaItem, 
  type HookObj 
} from "@/lib/hook-script-blueprints";
import { ToolLaserDivider } from "@/components/tool/ToolLaserDivider";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { sendToTool } from "@/lib/pipeline";

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
    <div ref={containerRef} className={cn("relative space-y-1.5", className)}>
      {label && (
        <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-11 px-3.5 rounded-xl bg-black/60 border border-white/10 hover:border-indigo-500/50 text-white text-xs font-semibold flex items-center justify-between transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 cursor-pointer shadow-inner"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption?.badge && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={cn("w-3.5 h-3.5 text-zinc-400 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#090a16] p-1.5 shadow-2xl backdrop-blur-2xl"
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
                    "w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer",
                    isSelected
                      ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-xs"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-bold">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
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
  { id: "ai-hacks", icon: Rocket, label: "5 Hidden AI Hacks", text: "5 hidden AI productivity hacks that save 10 hours a week" },
  { id: "cyber-security", icon: ShieldAlert, label: "Cyber Security Mystery", text: "Scariest cyber security horror story that actually happened" },
  { id: "solopreneur", icon: Coins, label: "$10k/mo Solo Creator", text: "How to reach $10k/mo as a solo creator using AI tools" },
  { id: "fitness", icon: Dumbbell, label: "3 Fitness Mistakes", text: "3 workout mistakes that are secretly destroying your progress" },
];

export default function HookScriptGenerator() {
  const router = useRouter();

  // Primary Control States
  const [topic, setTopic] = useState("5 hidden AI productivity hacks that save 10 hours a week");
  const [platform, setPlatform] = useState<"tiktok" | "shorts" | "reels">("tiktok");
  const [tone, setTone] = useState("controversial");
  const [niche, setNiche] = useState("Tech & AI");
  const [duration, setDuration] = useState("30-40s");
  const [hookFormula, setHookFormula] = useState("pattern_interrupt");
  const [pacing, setPacing] = useState("fast");
  const [goal, setGoal] = useState("viral_views");

  // Pre-load default blueprint on mount to avoid dead black void
  const [output, setOutput] = useState<ScriptOutput | null>(HOOK_SCRIPT_BLUEPRINTS["ai-hacks"].script);
  const [activePresetId, setActivePresetId] = useState<string>("ai-hacks");

  // UX & Processing States
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Analyzing audience retention psychology...");
  const [activeTab, setActiveTab] = useState<"timeline" | "hooks" | "broll" | "strategy">("timeline");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);
  const [isStudioExpanded, setIsStudioExpanded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Web Speech API Voiceover Preview State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speakingBeatIdx, setSpeakingBeatIdx] = useState<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { refreshCredits, toast } = useCredits();

  // Dynamic 150ms Progress Ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgressPercent(12);
      setLoadingStage("Drafting 4 viral hook candidates with high retention...");
      interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 94) {
            setLoadingStage("Finalizing visual scene beats & sound effects...");
            return prev;
          }
          if (prev >= 65) {
            setLoadingStage("Structuring camera framing & on-screen typography...");
            return prev + 2;
          }
          if (prev >= 35) {
            setLoadingStage("Calibrating voiceover pacing for " + platform.toUpperCase() + "...");
            return prev + 5;
          }
          return prev + 6;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isGenerating, platform]);

  // Clean up Web Speech API synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSelectPreset = (preset: typeof TOPIC_PRESETS[0]) => {
    setTopic(preset.text);
    setActivePresetId(preset.id);
    const blueprint = HOOK_SCRIPT_BLUEPRINTS[preset.id];
    if (blueprint) {
      setPlatform(blueprint.platform);
      setDuration(blueprint.duration);
      setNiche(blueprint.niche);
      setTone(blueprint.tone);
      setOutput(blueprint.script);
      setActiveTab("timeline");
      stopAudio();
    }
  };

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

      setProgressPercent(100);
      setOutput(parsed);
      setActiveTab("timeline");
      void refreshCredits();
      toast("Viral Script Package Generated!", "success");
    } catch (err: unknown) {
      console.error("[HookScriptGenerator] Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to generate script. Please check your connection and try again.";
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
    utterance.rate = 1.08;
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
          `[${s.time}]\nVoiceover: "${s.voiceover}"\nVisual Direction: ${s.visual}${
            s.sfx ? `\nSFX: ${s.sfx}` : ""
          }${s.onScreenText ? `\nText Overlay: ${s.onScreenText}` : ""}`
      )
      .join("\n\n");

    const brollText = output.bRollList
      ? `\n\nB-ROLL SHOT LIST:\n` + output.bRollList.map((b) => `- ${b.scene}: ${b.suggestion}`).join("\n")
      : "";

    const ctaText = output.cta ? `\n\nCALL TO ACTION:\n${output.cta}` : "";
    const tagsText = output.hashtags ? `\n\nHASHTAGS:\n${output.hashtags.join(" ")}` : "";

    const fullScript = `VIRAL SCRIPT PACKAGE (${platform.toUpperCase()})\nTopic: ${topic}\n\nVIRAL HOOK CANDIDATES:\n${hooksText}\n\nMASTER TIMELINE:\n${timelineText}${brollText}${ctaText}${tagsText}`;

    navigator.clipboard.writeText(fullScript);
    triggerCopyToast("full", "Copied complete production package!");
  };

  const handleCopyTeleprompter = () => {
    if (!output) return;
    const teleprompterText = output.script.map((s) => s.voiceover.replace(/\*/g, "")).join("\n\n");
    navigator.clipboard.writeText(teleprompterText);
    triggerCopyToast("teleprompter", "Copied teleprompter text!");
  };

  const handleOpenTeleprompter = async () => {
    if (!output) return;
    const teleprompterText = output.script.map((s) => s.voiceover.replace(/\*/g, "")).join("\n\n");
    const blob = new Blob([teleprompterText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    await sendToTool("/tools/creator/teleprompter", {
      name: `${topic.slice(0, 30)} - Script.txt`,
      url,
      fileType: "document",
      sourceToolId: "hook-script-generator",
      sourceToolName: "Hook & Script Generator",
      metadata: { text: teleprompterText }
    });
  };

  const handleCopySingleHook = (hookText: string, idx: number) => {
    navigator.clipboard.writeText(hookText);
    setCopiedHookIdx(idx);
    toast(`Copied Hook #${idx + 1}!`, "success");
    setTimeout(() => setCopiedHookIdx(null), 2000);
  };

  return (
    <div className="w-full space-y-10">
      {/* Flagship Symmetrical Obsidian Cyber Studio */}
      <div className="rounded-[2.5rem] border-2 border-indigo-500/25 bg-[#090a16]/90 backdrop-blur-2xl p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(99,102,241,0.15)] relative overflow-hidden">
        {/* Ambient Neon Backdrops */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: CONTROLS & DIRECTIVES */}
          <div className={cn(
            isStudioExpanded ? "hidden" : "lg:col-span-4 space-y-6"
          )}>
            
            {/* Topic Blueprints Chips */}
            <div>
              <label className="text-[11px] font-black text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-indigo-400" />
                Instant Production Blueprints
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TOPIC_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs",
                        isSelected
                          ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                          : "bg-black/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border",
                        isSelected 
                          ? "bg-indigo-500/30 border-indigo-400/50 text-indigo-300"
                          : "bg-white/5 border-white/10 text-zinc-400"
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video Topic Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">
                  Video Topic or Concept <span className="text-indigo-400">*</span>
                </label>
                {topic && (
                  <button
                    type="button"
                    onClick={() => { setTopic(""); setActivePresetId(""); }}
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setActivePresetId("");
                }}
                placeholder="e.g. 5 hidden AI tools, horror stories, launch of a smart watch..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-sm font-medium resize-none transition-all shadow-inner"
              />
            </div>

            {/* Target Platform Selector */}
            <div>
              <label className="block text-[11px] font-black text-zinc-300 uppercase tracking-widest mb-2.5">
                Target Platform
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "tiktok", label: "TikTok", icon: Film },
                  { id: "shorts", label: "YT Shorts", icon: Video },
                  { id: "reels", label: "IG Reels", icon: Clapperboard },
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id as any)}
                      className={cn(
                        "py-3 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                        isSelected
                          ? "bg-indigo-500/20 border-indigo-500/60 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] scale-[1.02]"
                          : "bg-black/50 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-indigo-400" : "text-zinc-500")} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Niche & Target Audience */}
            <div className="relative z-30">
              <CustomSelect
                label="Niche & Audience Category"
                value={niche}
                onChange={setNiche}
                options={[
                  { value: "Tech & AI", label: "Tech, AI & Digital Tools" },
                  { value: "Business & Finance", label: "Business, Money & Solopreneurs" },
                  { value: "Fitness & Health", label: "Fitness, Health & Nutrition" },
                  { value: "Storytelling & True Crime", label: "True Crime, Horrors & Lore" },
                  { value: "Gaming & Culture", label: "Gaming, Anime & Web Culture" },
                  { value: "SaaS & Marketing", label: "SaaS, Marketing & Growth" },
                  { value: "Daily Vlogs & Life", label: "Daily Vlogs & Lifestyle" },
                ]}
              />
            </div>

            {/* Video Duration & Hook Formula */}
            <div className="grid grid-cols-2 gap-3 relative z-20">
              <CustomSelect
                label="Target Duration"
                value={duration}
                onChange={setDuration}
                options={[
                  { value: "15s", label: "15s Micro-Burst", badge: "Fast" },
                  { value: "30-40s", label: "30-40s Viral Standard", badge: "Standard" },
                  { value: "60-90s", label: "60-90s Deep Story", badge: "Deep" },
                ]}
              />

              <CustomSelect
                label="Hook Blueprint"
                value={hookFormula}
                onChange={setHookFormula}
                options={[
                  { value: "pattern_interrupt", label: "Pattern Interrupt" },
                  { value: "negative_constraint", label: "Negative Constraint" },
                  { value: "curiosity_gap", label: "Curiosity Gap" },
                  { value: "bold_claim", label: "Bold Claim + Proof" },
                  { value: "in_media_res", label: "Drop In-Media-Res" },
                ]}
              />
            </div>

            {/* Tone & Pacing */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <CustomSelect
                label="Hook Tone"
                value={tone}
                onChange={setTone}
                options={[
                  { value: "controversial", label: "Bold & Contrarian" },
                  { value: "storytelling", label: "Suspense & Narrative" },
                  { value: "educational", label: "Value-First & Proof" },
                  { value: "urgency", label: "High Urgency & FOMO" },
                ]}
              />

              <CustomSelect
                label="Scene Pacing"
                value={pacing}
                onChange={setPacing}
                options={[
                  { value: "fast", label: "Ultra Fast & Punchy" },
                  { value: "cinematic", label: "Cinematic & Suspense" },
                  { value: "hype", label: "High Energy & Bold" },
                  { value: "calm", label: "Calm & Authoritative" },
                ]}
              />
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_35px_rgba(99,102,241,0.35)] transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Drafting Script Package...</span>
                </>
              ) : (
                <>
                  <Clapperboard className="w-4 h-4 text-indigo-200" />
                  <span>Generate Production Script</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE SCRIPT STUDIO */}
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col min-h-[580px] transition-all duration-300",
            isStudioExpanded ? "lg:col-span-12" : "lg:col-span-8"
          )}>
            
            {isGenerating ? (
              /* Dynamic 150ms Progress Indicator */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-500 animate-spin [animation-duration:1.5s]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-3 max-w-sm">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono">
                    [ {progressPercent}% ]
                  </span>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">
                    Generating Master Script
                  </h4>
                  <p className="text-xs font-semibold text-indigo-300 animate-pulse">
                    {loadingStage}
                  </p>
                </div>

                <div className="w-64 h-1.5 rounded-full bg-white/5 border border-white/10 mt-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  />
                </div>
              </div>
            ) : output ? (
              <div className="space-y-6 flex-1 flex flex-col">
                
                {/* Top Section: Full-Width Viewer Retention Score Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-inner">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-black text-2xl shadow-inner shrink-0">
                    {output.viralScore ?? 96}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        Viewer Retention Score
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 tracking-wider">
                        HIGH HOOK POWER
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                      {output.viralAnalysis || "Engineered for high 3-second retention and viewer re-watches."}
                    </p>
                  </div>
                </div>

                {/* Studio Action Toolbar */}
                <div className="flex items-center justify-between gap-3 flex-wrap pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsStudioExpanded(!isStudioExpanded)}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        isStudioExpanded
                          ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-500/20"
                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200"
                      )}
                      title={isStudioExpanded ? "Collapse to side-by-side view" : "Expand to wide studio focus mode"}
                    >
                      {isStudioExpanded ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Side View</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Expand Studio</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={isPlayingAudio ? stopAudio : playFullVoiceover}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        isPlayingAudio
                          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40"
                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200"
                      )}
                    >
                      {isPlayingAudio ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" /> Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Listen Voiceover
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenTeleprompter}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                      title="Open in Full-Screen Live Teleprompter Studio"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Teleprompter</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyFullPackage}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/25 active:scale-95"
                  >
                    {copiedType === "full" ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>Copy Package</span>
                  </button>
                </div>

                {/* Studio Navigation Tabs - 4-Column Responsive Grid (No horizontal overflow or clipping) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 border-b border-white/10 pb-4">
                  {[
                    { id: "timeline", label: "Scene Timeline", icon: Target, badge: output.script.length },
                    { id: "hooks", label: "Viral Hooks", icon: Flame, badge: output.hooks.length },
                    { id: "broll", label: "B-Roll Shots", icon: Film, badge: output.bRollList?.length ?? 0 },
                    { id: "strategy", label: "CTAs & Tags", icon: TrendingUp },
                  ].map((t) => {
                    const IconComp = t.icon;
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id as any)}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
                          isActive
                            ? "bg-indigo-500/25 border-2 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                            : "bg-white/[0.03] border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
                        )}
                      >
                        <IconComp className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-indigo-400" : "text-zinc-500")} />
                        <span className="truncate">{t.label}</span>
                        {t.badge !== undefined && t.badge > 0 && (
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                              isActive ? "bg-indigo-500 text-white" : "bg-white/10 text-zinc-400"
                            )}
                          >
                            {t.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Timestamped Scene Timeline */}
                {activeTab === "timeline" && (
                  <div className="space-y-4 pt-1">
                    {output.script.map((step, idx) => {
                      const isSpeakingThisBeat = isPlayingAudio && speakingBeatIdx === idx;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-5 sm:p-6 rounded-2xl bg-black/40 border transition-all space-y-4",
                            isSpeakingThisBeat
                              ? "border-indigo-500/60 shadow-lg shadow-indigo-500/20 bg-indigo-950/20"
                              : "border-white/10 hover:border-white/20"
                          )}
                        >
                          {/* Time Header & Beat Play Button */}
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              {step.time}
                            </span>

                            <button
                              type="button"
                              onClick={() => playVoiceoverText(step.voiceover, idx)}
                              className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-indigo-300 transition-colors cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{isSpeakingThisBeat ? "Stop" : "Listen Beat"}</span>
                            </button>
                          </div>

                          {/* Spoken Voiceover */}
                          <div>
                            <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest block flex items-center gap-1.5">
                              <Mic2 className="w-3 h-3 text-indigo-400" />
                              Spoken Voiceover
                            </span>
                            <p className="text-white font-bold text-base sm:text-lg leading-relaxed">
                              "{step.voiceover}"
                            </p>
                          </div>

                          {/* Visual & SFX Directives */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
                              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider block flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5" />
                                Visual Direction
                              </span>
                              <p className="text-zinc-200 font-medium leading-relaxed">{step.visual}</p>
                            </div>

                            {step.sfx && (
                              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
                                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                                  <Volume2 className="w-3.5 h-3.5" />
                                  Sound Effect (SFX)
                                </span>
                                <p className="text-amber-200 font-semibold leading-relaxed">{step.sfx}</p>
                              </div>
                            )}
                          </div>

                          {/* On-Screen Text & Retention Tip */}
                          {(step.onScreenText || step.retentionTip) && (
                            <div className="flex flex-wrap gap-2 text-xs pt-1">
                              {step.onScreenText && (
                                <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold flex items-center gap-1.5">
                                  <Type className="w-3.5 h-3.5 text-blue-400" />
                                  Text Overlay: "{step.onScreenText}"
                                </span>
                              )}
                              {step.retentionTip && (
                                <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                  Retention: {step.retentionTip}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Viral Hook Candidates */}
                {activeTab === "hooks" && (
                  <div className="space-y-4 pt-1">
                    {output.hooks.map((h, i) => {
                      const text = typeof h === "string" ? h : h.hook;
                      const trigger = typeof h === "object" ? h.trigger : null;
                      const explanation = typeof h === "object" ? h.explanation : null;

                      return (
                        <div
                          key={i}
                          className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3 hover:border-indigo-500/40 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs">
                                Hook #{i + 1}
                              </span>
                              {trigger && (
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase">
                                  {trigger}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopySingleHook(text, i)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              {copiedHookIdx === i ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedHookIdx === i ? "Copied" : "Copy Hook"}</span>
                            </button>
                          </div>

                          <p className="text-white font-bold text-base sm:text-lg leading-relaxed">"{text}"</p>

                          {explanation && (
                            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed italic bg-black/60 p-3.5 rounded-xl border border-white/5 flex items-start gap-2.5">
                              <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{explanation}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 3: B-Roll Shot List */}
                {activeTab === "broll" && (
                  <div className="space-y-4 pt-1">
                    {output.bRollList && output.bRollList.length > 0 ? (
                      output.bRollList.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-4 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-black text-sm shrink-0 mt-0.5">
                            #{idx + 1}
                          </div>
                          <div className="space-y-1.5">
                            <h5 className="text-sm font-black text-white uppercase tracking-wider">{item.scene}</h5>
                            <p className="text-zinc-200 text-sm leading-relaxed">{item.suggestion}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-zinc-500 text-sm">
                        No B-Roll shot list generated for this format.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Strategy, CTAs & Hashtags */}
                {activeTab === "strategy" && (
                  <div className="space-y-5 pt-1">
                    {/* Call to Actions */}
                    {output.ctaOptions && output.ctaOptions.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-400" /> High-Converting CTA Options
                        </h5>
                        <div className="grid grid-cols-1 gap-2.5">
                          {output.ctaOptions.map((cta, i) => (
                            <div
                              key={i}
                              className="p-4 rounded-xl bg-black/60 border border-white/5 text-xs sm:text-sm space-y-1.5"
                            >
                              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider block">
                                {cta.type}
                              </span>
                              <p className="text-zinc-100 font-semibold leading-relaxed">{cta.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Primary CTA Fallback */}
                    {output.cta && (!output.ctaOptions || output.ctaOptions.length === 0) && (
                      <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-sm space-y-1.5">
                        <span className="text-indigo-400 font-black uppercase tracking-wider block text-xs">
                          Recommended CTA
                        </span>
                        <p className="text-indigo-100 font-semibold leading-relaxed">{output.cta}</p>
                      </div>
                    )}

                    {/* Hashtags */}
                    {output.hashtags && output.hashtags.length > 0 && (
                      <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                            Targeted Hashtags
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(output.hashtags!.join(" "));
                              toast("Copied hashtag stack!", "success");
                            }}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                          >
                            Copy Tags
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {output.hashtags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold"
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
            ) : null}
          </div>
        </div>

        {/* Pipeline Bar Integration */}
        {output && (
          <div className="w-full pt-8 mt-8 border-t border-white/5 relative z-10">
            <MediaPipelineBar
              imageUrl="/og-image.png"
              imageName="video-script.txt"
              sourceToolId="hook-script-generator"
              sourceToolName="Hook & Script Generator"
              actions={["compressor", "meme", "resizer"]}
              title="Next Action Pipeline"
              subtitle="Carry this video script into audio voiceovers, teleprompters, or social carousels"
              accentColor="indigo"
            />
          </div>
        )}
      </div>

      {/* Category Reactive Laser Horizon Divider */}
      <ToolLaserDivider primaryHex="#6366f1" />

      {/* Result Retention Bar */}
      {output && (
        <ResultRetentionBar
          toolType="creator"
          toolName="Video Hook & Script Generator"
          title={`${topic.slice(0, 30)} - Script`}
          content={output.script.map((s) => s.voiceover).join(". ")}
        />
      )}
    </div>
  );
}
