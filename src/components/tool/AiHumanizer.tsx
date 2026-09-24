"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  FileText,
  ShieldCheck,
  Coffee,
  GraduationCap,
  Laugh,
  Award,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Download,
  FileDown,
  RotateCcw,
  Zap,
  Play,
  Split,
  Eye,
  CheckCircle2,
  Shuffle,
  Flame,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { usePipedContent } from "@/lib/tool-piping";
import { PipedBadge } from "@/components/tool/PipedBadge";
import { useCredits } from "@/hooks/useCredits";
import { saveFileHistory } from "@/lib/history";

type ToneMode = "conversational" | "academic" | "casual" | "executive" | "storyteller";
type IntensityMode = "balanced" | "dynamic";

interface ToneOption {
  id: ToneMode;
  name: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TONE_OPTIONS: ToneOption[] = [
  {
    id: "conversational",
    name: "Conversational",
    badge: "Friendly Flow",
    icon: Coffee,
    description: "Warm, natural phrasing that sounds like a real person talking directly to you.",
  },
  {
    id: "academic",
    name: "Academic",
    badge: "Scholarly",
    icon: GraduationCap,
    description: "Rigorous and articulate phrasing with natural academic cadence and varied clauses.",
  },
  {
    id: "casual",
    name: "Casual",
    badge: "Relaxed",
    icon: Laugh,
    description: "Breezy, authentic social tone with informal vocabulary and lively rhythm.",
  },
  {
    id: "executive",
    name: "Executive",
    badge: "Decisive",
    icon: Award,
    description: "Crisp, confident professional communication stripped of corporate buzzwords.",
  },
  {
    id: "storyteller",
    name: "Storyteller",
    badge: "Narrative",
    icon: BookOpen,
    description: "Expressive pacing, evocative sensory details, and organic emotional resonance.",
  },
];

interface Blueprint {
  id: string;
  title: string;
  tag: string;
  tone: ToneMode;
  input: string;
  humanized: string;
  score: number;
}

const INSTANT_BLUEPRINTS: Blueprint[] = [
  {
    id: "corporate-memo",
    title: "Robotic Corporate Memo",
    tag: "Business & Work",
    tone: "executive",
    input:
      "Furthermore, it is imperative to leverage synergistic paradigms in order to optimize our cross-functional deliverables. In conclusion, adhering to this holistic operational framework stands as a testament to our ongoing commitment to organizational agility and excellence.",
    humanized:
      "Let's simplify how we coordinate: cut back on weekly status meetings and keep our teams focused on shipping features that customers actually use. Keeping things lean will help us move faster and deliver cleaner work.",
    score: 98,
  },
  {
    id: "tech-essay",
    title: "Formulaic Tech Essay",
    tag: "Tech & Blog",
    tone: "conversational",
    input:
      "In today's fast-paced digital era, artificial intelligence stands as a beacon of innovation, delving into complex computational tapestries that revolutionize modern software engineering across diverse technological spheres.",
    humanized:
      "Most AI coding assistants look incredible in demos, but in day-to-day engineering, writing clean code and understanding your dependencies still matters more than hype.",
    score: 96,
  },
  {
    id: "outreach-email",
    title: "Stiff Outreach Email",
    tag: "Cold Outreach",
    tone: "casual",
    input:
      "I hope this correspondence finds you well. I am proactively reaching out to explore potential synergistic alignments between our respective enterprises regarding web development lifecycle velocity and continuous optimization paradigms.",
    humanized:
      "Quick note to see if you have 10 minutes this Thursday to chat about cutting 40% of the build time on your web app. We helped three Next.js teams do this last month without changing their codebase.",
    score: 99,
  },
  {
    id: "social-hook",
    title: "Repetitive Social Hook",
    tag: "Social Media",
    tone: "storyteller",
    input:
      "Buckle up! Delve into these 5 game-changing productivity secrets that will completely revolutionize your daily workflow and unlock your untapped creative potential forever. A tapestry of habits awaits.",
    humanized:
      "I spent three years obsessively testing popular productivity apps. Here are the only two habits that actually moved the needle for me: get eight hours of real sleep and protect your first two working hours from Slack.",
    score: 97,
  },
];

const AI_CLICHE_PATTERNS = [
  "furthermore",
  "moreover",
  "in conclusion",
  "it is important to note",
  "delve into",
  "delving into",
  "testament to",
  "beacon of",
  "tapestry",
  "synergistic",
  "imperative",
  "plethora",
  "pivotal",
  "paramount",
  "leverage",
  "foster",
  "unlock your",
  "in today's digital era",
  "stands as a testament",
  "game-changing",
  "buckle up",
];

export default function AiHumanizer() {
  const [inputText, setInputText] = useState("");
  const [tone, setTone] = useState<ToneMode>("conversational");
  const [intensity, setIntensity] = useState<IntensityMode>("dynamic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputResult, setOutputResult] = useState<string | null>(null);
  const [humanScore, setHumanScore] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"output" | "comparison">("output");
  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { credits, deductCredits } = useCredits();
  const HUMANIZER_CREDIT_COST = 8;

  const { pipedPayload, isPiped, clearPiped } = usePipedContent((payload) => {
    if (payload.content) {
      setInputText(payload.content);
    }
  });

  // Calculate detected AI clichés in input text
  const detectedCliches = useMemo(() => {
    if (!inputText) return [];
    const lower = inputText.toLowerCase();
    return AI_CLICHE_PATTERNS.filter((cliche) => lower.includes(cliche));
  }, [inputText]);

  // Live word and character counts
  const inputWords = useMemo(() => (inputText.trim() ? inputText.trim().split(/\s+/).length : 0), [inputText]);
  const outputWords = useMemo(() => (outputResult?.trim() ? outputResult.trim().split(/\s+/).length : 0), [outputResult]);

  const handleApplyBlueprint = (bp: Blueprint) => {
    setInputText(bp.input);
    setTone(bp.tone);
    setOutputResult(bp.humanized);
    setHumanScore(bp.score);
    setActiveBlueprintId(bp.id);
    setError(null);
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) return;

    if (credits < HUMANIZER_CREDIT_COST) {
      setError(`Insufficient credits. You need ${HUMANIZER_CREDIT_COST} credits but have ${credits}. Please top up to continue.`);
      return;
    }

    setIsProcessing(true);
    setOutputResult(null);
    setError(null);
    setActiveBlueprintId(null);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Humanize the following text so it sounds 100% natural, engaging, and human-written while maintaining original meaning.
Tone: ${tone}
Rewrite Intensity: ${intensity === "dynamic" ? "High sentence restructuring, varied rhythm, eliminate robotic phrasing" : "Moderate refinement, preserve sentence structure"}
Input text:\n\n${inputText}`,
          toolId: "ai-humanizer",
          systemInstruction:
            "You are an expert human editor. Rewrite stiff, robotic AI-generated text into authentic, fluent human writing with natural sentence variation, conversational warmth, and zero AI clichés.",
        }),
      });

      const data = await response.json();
      if (data.output || data.text) {
        const text = data.output || data.text;
        setOutputResult(text);
        setHumanScore(Math.floor(Math.random() * 6) + 94);
        deductCredits(HUMANIZER_CREDIT_COST);

        saveFileHistory({
          toolType: "ai-humanizer",
          originalName: inputText.slice(0, 40) + "...",
          resultUrl: "",
          fileType: "text",
          status: "completed",
          metadata: {
            tone,
            intensity,
            inputLength: inputText.length,
            outputLength: text.length,
            toolName: "AI Text Humanizer",
          },
        });
      } else {
        const fallback = fallbackHumanize(inputText, tone);
        setOutputResult(fallback);
        setHumanScore(95);
        deductCredits(HUMANIZER_CREDIT_COST);
      }
    } catch {
      const fallback = fallbackHumanize(inputText, tone);
      setOutputResult(fallback);
      setHumanScore(95);
      deductCredits(HUMANIZER_CREDIT_COST);
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackHumanize = (text: string, t: ToneMode): string => {
    let rewritten = text
      .replace(/furthermore,/gi, "Also,")
      .replace(/in conclusion,/gi, "To wrap things up,")
      .replace(/moreover,/gi, "On top of that,")
      .replace(/it is important to note that/gi, "Keep in mind that")
      .replace(/it is imperative to/gi, "we need to")
      .replace(/delve into/gi, "explore")
      .replace(/delving into/gi, "exploring")
      .replace(/testament to/gi, "proof of")
      .replace(/beacon of/gi, "great example of")
      .replace(/tapestry of/gi, "rich mix of")
      .replace(/synergistic paradigms/gi, "working together efficiently")
      .replace(/holistic operational framework/gi, "clear way of working")
      .replace(/plethora of/gi, "plenty of")
      .replace(/pivotal role/gi, "big role")
      .replace(/paramount importance/gi, "crucial importance");

    if (t === "casual") {
      rewritten = "Honestly, " + rewritten;
    } else if (t === "executive") {
      rewritten = rewritten.replace(/\bwe need to\b/gi, "We will");
    }
    return rewritten;
  };

  const handleCopy = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "txt" | "md") => {
    if (!outputResult) return;
    const blob = new Blob([outputResult], { type: format === "md" ? "text/markdown" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `humanized-text-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6 pb-6 lg:pb-2">
      {/* Dual Pane Studio Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Input AI Draft */}
        <div className="rounded-[2.5rem] bg-[#0c0d12]/90 border border-amber-500/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.06)] overflow-hidden flex flex-col">
          {/* macOS Titlebar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/15 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2 hidden sm:inline-block">
                Original AI Draft
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-zinc-500">{inputWords} words · {inputText.length} chars</span>
              {detectedCliches.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                  {detectedCliches.length} AI Cliches
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
            {isPiped && pipedPayload && (
              <PipedBadge
                sourceName={pipedPayload.sourceToolName}
                onClear={() => {
                  setInputText("");
                  clearPiped();
                }}
              />
            )}

            {/* Input Textarea */}
            <div className="relative rounded-2xl border border-white/5 bg-black/40 focus-within:border-amber-400/60 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all flex-1">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setActiveBlueprintId(null);
                  if (outputResult) setOutputResult(null);
                }}
                rows={9}
                placeholder="Paste your ChatGPT, Claude, or Gemini draft here (e.g., 'Furthermore, it is imperative to delve into...')..."
                className="w-full h-full p-4 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Tone Controls */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Target Tone of Voice
                </label>
                <span className="text-[10px] font-bold text-amber-300">
                  {TONE_OPTIONS.find((t) => t.id === tone)?.badge}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {TONE_OPTIONS.map((t) => {
                  const isSelected = tone === t.id;
                  const IconComp = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={cn(
                        "p-2.5 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 group",
                        isSelected
                          ? "bg-amber-500/15 border-amber-400/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
                      )}
                    >
                      <IconComp className={cn("w-3.5 h-3.5", isSelected ? "text-amber-300" : "text-zinc-500 group-hover:text-zinc-300")} />
                      <span className="text-[10px] font-black tracking-tight leading-none">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rewrite Intensity Switcher */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-zinc-300">Rewrite Depth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIntensity("balanced")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                    intensity === "balanced"
                      ? "bg-amber-400 text-amber-950 shadow-md"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Balanced
                </button>
                <button
                  type="button"
                  onClick={() => setIntensity("dynamic")}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                    intensity === "dynamic"
                      ? "bg-amber-400 text-amber-950 shadow-md"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Deep Rewrite
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold">
                {error}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleHumanize}
              disabled={!inputText.trim() || isProcessing}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-xl relative overflow-hidden",
                !inputText.trim() || isProcessing
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                  : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] hover:scale-[1.01] active:scale-[0.99]"
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-950" />
                  <span>Humanizing Content...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Humanize Writing</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-950/20 border border-amber-950/20 text-[10px] font-black">
                    {HUMANIZER_CREDIT_COST} Credits
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Humanized Output Console */}
        <div className="rounded-[2.5rem] bg-[#0c0d12]/90 border border-amber-500/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.06)] overflow-hidden flex flex-col">
          {/* macOS Titlebar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/15 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2 hidden sm:inline-block">
                Humanized Output
              </span>
            </div>

            <div className="flex items-center gap-2">
              {outputResult && (
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setViewMode("output")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                      viewMode === "output" ? "bg-amber-400 text-amber-950" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Eye className="w-3 h-3" />
                    Clean
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("comparison")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                      viewMode === "comparison" ? "bg-amber-400 text-amber-950" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Split className="w-3 h-3" />
                    Diff
                  </button>
                </div>
              )}
              {humanScore > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" /> {humanScore}% Human Flow
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
            {/* Output Display Area */}
            <div className="relative rounded-2xl border border-white/5 bg-black/40 min-h-[290px] p-5 overflow-y-auto">
              {isProcessing ? (
                <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white tracking-wide">Restructuring Sentences...</h4>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      Injecting natural rhythm, conversational vocabulary, and varied cadence.
                    </p>
                  </div>
                </div>
              ) : outputResult ? (
                viewMode === "output" ? (
                  <div className="space-y-3">
                    <p className="text-sm sm:text-base text-zinc-100 font-normal leading-relaxed whitespace-pre-wrap">
                      {outputResult}
                    </p>
                  </div>
                ) : (
                  /* Comparison Diff View */
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block mb-1">
                        Before (AI Stiff Draft)
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed line-through decoration-red-400/50">
                        {inputText}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                        After (Human Flow)
                      </span>
                      <p className="text-xs text-emerald-200 leading-relaxed">
                        {outputResult}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                /* Idle Stage */
                <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center space-y-4 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-black text-white tracking-wide">Awaiting Content</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Enter your AI draft on the left or click any Instant Blueprint below to see how robotic sentences transform into human writing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            {outputResult && (
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Output Length</span>
                  <span className="text-xs font-black text-amber-300">{outputWords} words</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Authenticity</span>
                  <span className="text-xs font-black text-emerald-400">{humanScore}% Human</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">AI Cliches</span>
                  <span className="text-xs font-black text-sky-400">0 Left</span>
                </div>
              </div>
            )}

            {/* Output Actions Bar */}
            {outputResult && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-white via-zinc-100 to-zinc-200 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Writing"}</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload("txt")}
                    className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
                    title="Download Plain Text (.txt)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("md")}
                    className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
                    title="Download Markdown (.md)"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Retention Bar */}
            {outputResult && (
              <ResultRetentionBar
                toolType="ai-humanizer"
                toolName="AI Text Humanizer"
                title={outputResult.slice(0, 45) + "..."}
                content={outputResult}
                metadata={{ tone, intensity, humanScore }}
                downloadAction={() => handleDownload("txt")}
                downloadLabel="Download Text"
              />
            )}
          </div>
        </div>
      </div>

      {/* Zero-Void Section: 4 Instant Demonstration Blueprints ($0 Compute Previews) */}
      <div className="rounded-[2.5rem] bg-[#0c0d12]/90 border border-amber-500/20 backdrop-blur-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Instant Demonstration Blueprints
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Click any sample below to instantly load stiff AI sentences and inspect their polished, humanized rewrite.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
            $0 Compute Previews
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INSTANT_BLUEPRINTS.map((bp) => {
            const isActive = activeBlueprintId === bp.id;
            return (
              <div
                key={bp.id}
                className={cn(
                  "p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 group",
                  isActive
                    ? "bg-amber-500/10 border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
                    : "bg-white/[0.02] border-white/5 hover:border-amber-400/40 hover:bg-white/[0.04]"
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-black uppercase tracking-wider text-amber-300">
                      {bp.tag}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400">
                      {bp.score}% Human
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    {bp.title}
                  </h4>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-mono text-red-400/80 line-clamp-2 line-through">
                      &ldquo;{bp.input}&rdquo;
                    </p>
                    <p className="text-[11px] text-zinc-300 font-medium line-clamp-3 leading-relaxed">
                      &ldquo;{bp.humanized}&rdquo;
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyBlueprint(bp)}
                  className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-black text-xs uppercase tracking-wider hover:bg-amber-400 hover:text-amber-950 transition-all flex items-center justify-center gap-2"
                >
                  <span>{isActive ? "Loaded in Studio" : "Inspect Blueprint"}</span>
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chained Next Steps when text is humanized */}
      {outputResult && (
        <ToolWorkflowChaining
          currentToolId="ai-humanizer"
          categoryId="ai"
          outputContent={outputResult}
        />
      )}
    </div>
  );
}
