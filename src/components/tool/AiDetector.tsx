"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Activity, 
  Copy, 
  Check, 
  ArrowRight, 
  Sliders, 
  Layers, 
  UserCheck, 
  RotateCcw, 
  AlertCircle,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { setPipedContent, usePipedContent } from "@/lib/tool-piping";
import { PipedBadge } from "@/components/tool/PipedBadge";
import { 
  AI_DETECTOR_BLUEPRINTS, 
  type AiDetectorBlueprint 
} from "./ai-detector-blueprints";

// Common machine writing markers and clichés
const AI_MARKERS = [
  "delve", "delving", "tapestry", "crucial", "furthermore", "moreover",
  "in conclusion", "testament", "beacon", "paramount", "seamlessly",
  "pivotal", "underscores", "foster", "ever-evolving", "fast-paced",
  "rich tapestry", "landscape", "dynamic realm", "harness", "holistic",
  "it is important to note", "plays a crucial role", "in summary"
];

interface SentenceAnalysis {
  text: string;
  isAi: boolean;
  score: number; // 0 to 100 (% AI)
  reasons: string[];
}

export default function AiDetector() {
  const router = useRouter();

  // Active inputs
  const [inputText, setInputText] = useState(AI_DETECTOR_BLUEPRINTS[0].text);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(AI_DETECTOR_BLUEPRINTS[0].id);

  // Analysis state
  const [isScanning, setIsScanning] = useState(false);
  const [overallScore, setOverallScore] = useState<number>(AI_DETECTOR_BLUEPRINTS[0].score);
  const [sentences, setSentences] = useState<SentenceAnalysis[]>([]);
  const [flaggedWords, setFlaggedWords] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"highlights" | "list">("highlights");

  const { pipedPayload, isPiped, clearPiped } = usePipedContent((payload) => {
    if (payload.content) {
      setInputText(payload.content);
      setSelectedBlueprintId("custom");
      void runAnalysis(payload.content);
    }
  });

  const analyzeContent = (text: string) => {
    const rawSentences = text
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawSentences.length === 0) {
      return {
        overallScore: 0,
        sentences: [],
        detectedMarkers: [],
      };
    }

    const detectedMarkers: string[] = [];
    let aiWeightedSum = 0;

    const analyzedSentences: SentenceAnalysis[] = rawSentences.map((sent) => {
      const words = sent.split(/\s+/).filter(Boolean);
      const reasons: string[] = [];
      let sentenceAiScore = 10;

      // 1. Check for known robotic cliché markers
      AI_MARKERS.forEach((marker) => {
        const regex = new RegExp(`\\b${marker}\\b`, "i");
        if (regex.test(sent)) {
          if (!detectedMarkers.includes(marker.toLowerCase())) {
            detectedMarkers.push(marker.toLowerCase());
          }
          sentenceAiScore += 25;
          reasons.push(`Contains robotic phrasing: "${marker}"`);
        }
      });

      // 2. Sentence length and structure uniformity
      if (words.length >= 14 && words.length <= 26) {
        sentenceAiScore += 15;
        reasons.push("Uniform sentence structure");
      }

      // 3. Average word length (AI often uses elevated multi-syllabic vocabulary)
      const avgWordLength = sent.length / (words.length || 1);
      if (avgWordLength > 5.6) {
        sentenceAiScore += 20;
        reasons.push("Formal, academic vocabulary density");
      }

      // 4. Natural human cues (personal pronouns, short punchy statements)
      if (/\b(I|me|my|we|our|honestly|actually|literally|guess what|nope|anyway)\b/i.test(sent)) {
        sentenceAiScore = Math.max(5, sentenceAiScore - 30);
      }

      if (words.length < 8) {
        sentenceAiScore = Math.max(5, sentenceAiScore - 20);
      }

      const clampedScore = Math.min(99, Math.max(2, Math.round(sentenceAiScore)));
      const isAi = clampedScore >= 50;
      aiWeightedSum += clampedScore;

      return {
        text: sent,
        isAi,
        score: clampedScore,
        reasons: reasons.length > 0 ? reasons : ["Natural conversational flow"],
      };
    });

    const averageScore = Math.round(aiWeightedSum / rawSentences.length);

    return {
      overallScore: averageScore,
      sentences: analyzedSentences,
      detectedMarkers,
    };
  };

  const runAnalysis = (text: string) => {
    setIsScanning(true);
    setTimeout(() => {
      const res = analyzeContent(text);
      setOverallScore(res.overallScore);
      setSentences(res.sentences);
      setFlaggedWords(res.detectedMarkers);
      setIsScanning(false);
    }, 500);
  };

  // Run initial blueprint analysis on mount
  useEffect(() => {
    const res = analyzeContent(AI_DETECTOR_BLUEPRINTS[0].text);
    setOverallScore(AI_DETECTOR_BLUEPRINTS[0].score);
    setSentences(res.sentences);
    setFlaggedWords(res.detectedMarkers);
  }, []);

  const handleScan = () => {
    if (!inputText.trim()) return;
    runAnalysis(inputText);
  };

  const handleSelectBlueprint = (bp: AiDetectorBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setInputText(bp.text);
    const res = analyzeContent(bp.text);
    setOverallScore(bp.score);
    setSentences(res.sentences);
    setFlaggedWords(res.detectedMarkers);
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText.trim()) {
        setInputText(clipText);
        setSelectedBlueprintId("custom");
        runAnalysis(clipText);
      }
    } catch {
      // Fallback
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToHumanizer = () => {
    if (!inputText.trim()) return;
    setPipedContent({
      sourceToolId: "ai-detector",
      sourceToolName: "AI Content Detector",
      content: inputText,
      fieldHint: "text",
    });
    router.push("/tools/ai-humanizer");
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const humanScore = 100 - (overallScore ?? 0);

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-12">
      {/* Symmetrical Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Pane: Text Input Studio (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Studio Header Badge */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Detection Studio
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Inspect text for machine writing and generic AI patterns
                  </p>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Scan</span>
              </div>
            </div>

            {/* Target Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Text to Analyze
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasteClipboard}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Paste Text
                  </button>
                  {inputText && (
                    <button
                      onClick={() => {
                        setInputText("");
                        setSelectedBlueprintId("custom");
                        setOverallScore(0);
                        setSentences([]);
                        setFlaggedWords([]);
                      }}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-medium transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {isPiped && pipedPayload && (
                <PipedBadge
                  sourceName={pipedPayload.sourceToolName}
                  onClear={() => {
                    setInputText("");
                    clearPiped();
                  }}
                  className="mb-1"
                />
              )}

              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setSelectedBlueprintId("custom");
                  }}
                  rows={8}
                  placeholder="Paste your essay, article, email, or draft to check authenticity..."
                  className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-2xl p-4 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/10 transition-all resize-none font-medium leading-relaxed custom-scrollbar shadow-inner"
                />
                <div className="flex items-center justify-between pt-2 px-1 text-[10px] font-bold text-zinc-500">
                  <span>{wordCount.toLocaleString()} words</span>
                  <span>{inputText.length.toLocaleString()} characters</span>
                </div>
              </div>
            </div>

            {/* 4 Instant Demonstration Blueprints ($0 Previews) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Instant Demonstration Blueprints ($0 Free Previews)
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  Click to test
                </span>
              </div>

              <div className="space-y-2">
                {AI_DETECTOR_BLUEPRINTS.map((bp) => {
                  const isSelected = selectedBlueprintId === bp.id;
                  return (
                    <button
                      key={bp.id}
                      onClick={() => handleSelectBlueprint(bp)}
                      className={cn(
                        "w-full p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative group flex items-center justify-between gap-3",
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-white"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {bp.name}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border",
                              bp.score > 60
                                ? "bg-red-500/10 text-red-300 border-red-500/20"
                                : bp.score > 30
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            )}
                          >
                            {bp.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                          {bp.tagline}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 group-hover:text-amber-300 group-hover:border-amber-500/30 text-[10px] font-bold uppercase tracking-wider transition">
                            Preview $0
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scan Action Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleScan}
                disabled={!inputText.trim() || isScanning}
                className={cn(
                  "w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-2xl",
                  "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-zinc-950 shadow-amber-500/30 active:scale-[0.98]",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Checking sentence patterns...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-zinc-950 fill-zinc-950/20" />
                    <span>Check for AI Writing</span>
                    <span className="px-2 py-0.5 rounded-full bg-black/20 text-zinc-950 text-[9px] font-black border border-black/10">
                      100% Free
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-zinc-500 font-medium">
                Evaluates linguistic pacing, sentence variety, and common robotic phrasing
              </p>
            </div>

          </div>
        </div>

        {/* Right Pane: Authenticity & Detection Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-5 sm:p-7 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full animate-pulse",
                  overallScore > 60 
                    ? "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]" 
                    : overallScore > 30 
                    ? "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]" 
                    : "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                )} />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Authenticity Report
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl">
                <button
                  onClick={() => setViewMode("highlights")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                    viewMode === "highlights"
                      ? "bg-amber-400 text-zinc-950 font-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Sentence Highlights
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                    viewMode === "list"
                      ? "bg-amber-400 text-zinc-950 font-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Sentence Breakdown ({sentences.length})
                </button>
              </div>
            </div>

            {/* Score Ring & Metric Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Primary AI vs Human Score */}
              <div className="sm:col-span-1 p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  AI Likelihood
                </div>
                <div className="text-4xl font-black font-mono tracking-tight flex items-baseline gap-0.5">
                  <span className={cn(
                    overallScore > 60 ? "text-red-400" : overallScore > 30 ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {overallScore}%
                  </span>
                </div>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                  overallScore > 60 
                    ? "bg-red-500/10 text-red-300 border-red-500/30" 
                    : overallScore > 30 
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30" 
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                )}>
                  {overallScore > 60 ? "Likely AI" : overallScore > 30 ? "Mixed Writing" : "Human Written"}
                </span>
              </div>

              {/* Human Authenticity Score */}
              <div className="sm:col-span-1 p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Human Flow Score
                </div>
                <div className="text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-0.5">
                  <span className={cn(
                    humanScore >= 70 ? "text-emerald-400" : humanScore >= 40 ? "text-amber-400" : "text-zinc-400"
                  )}>
                    {humanScore}%
                  </span>
                </div>
                <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">
                  {humanScore >= 70 ? "Natural Rhythm" : humanScore >= 40 ? "Needs Human Flow" : "Stiff Sentence Structure"}
                </span>
              </div>

              {/* Robotic Words Detected */}
              <div className="sm:col-span-1 p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  AI Clichés Detected
                </div>
                <div className="text-4xl font-black font-mono tracking-tight text-white">
                  <span className={flaggedWords.length > 0 ? "text-amber-400" : "text-emerald-400"}>
                    {flaggedWords.length}
                  </span>
                </div>
                <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">
                  {flaggedWords.length > 0 ? "Flagged Buzzwords" : "Zero AI Buzzwords"}
                </span>
              </div>

            </div>

            {/* Flagged AI Clichés Chips */}
            {flaggedWords.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Common AI Buzzwords Found in Text:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {flaggedWords.map((word) => (
                    <span
                      key={word}
                      className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[10px] font-bold"
                    >
                      &quot;{word}&quot;
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Main Interactive Results Viewer */}
            <div className="p-4 sm:p-6 rounded-3xl bg-black/70 border border-white/10 shadow-inner min-h-[300px]">
              
              {/* Highlighted Text Mode */}
              {viewMode === "highlights" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-white/5 pb-2.5 font-bold">
                    <span className="uppercase tracking-wider">Interactive Sentence View</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-400" /> Likely AI
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Natural Human
                      </span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed space-y-1 font-normal">
                    {sentences.map((sent, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "inline rounded-md px-1.5 py-0.5 mr-1 mb-1 transition-all duration-200 inline-block",
                          sent.isAi
                            ? "bg-red-500/20 text-red-200 border-b-2 border-red-500/80 hover:bg-red-500/30"
                            : "text-zinc-200 hover:text-white"
                        )}
                        title={sent.reasons.join(" • ")}
                      >
                        {sent.text}{" "}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sentence Breakdown List Mode */}
              {viewMode === "list" && (
                <div className="space-y-3">
                  {sentences.map((sent, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left space-y-1.5 transition-all",
                        sent.isAi
                          ? "bg-red-500/10 border-red-500/30 text-white"
                          : "bg-white/[0.02] border-white/5 text-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-zinc-400">Sentence #{idx + 1}</span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider",
                            sent.isAi
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          )}
                        >
                          {sent.score}% AI Probability
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed">{sent.text}</p>
                      <p className="text-[10px] text-zinc-400 italic">
                        {sent.reasons.join(" • ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Bottom Action Strip: 1-Click Humanize Chaining */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
              </div>

              {overallScore > 30 && (
                <button
                  onClick={handleSendToHumanizer}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <UserCheck className="w-4 h-4 text-zinc-950" />
                  <span>Humanize This Text</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Recommended Next Steps & Tool Workflows */}
      <ToolWorkflowChaining
        currentToolId="ai-detector"
        categoryId="ai"
        outputContent={inputText}
      />

      {/* Smart Workflow Tool Recommendations */}
      <ToolSuggestions currentToolId="ai-detector" categoryId="ai" />
    </div>
  );
}
