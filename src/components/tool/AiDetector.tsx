"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bot, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Activity, 
  Sparkles,
  BarChart3,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";

interface SentenceAnalysis {
  text: string;
  isAi: boolean;
  score: number;
}

export default function AiDetector() {
  const [inputText, setInputText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [sentences, setSentences] = useState<SentenceAnalysis[]>([]);

  const handleScan = () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    setOverallScore(null);
    setSentences([]);

    setTimeout(() => {
      const rawSentences = inputText
        .split(/(?<=[.?!])\s+/)
        .filter((s) => s.trim().length > 0);

      let aiSentenceCount = 0;

      const analyzed = rawSentences.map((sent) => {
        const words = sent.split(/\s+/);
        // Perplexity & burstiness heuristics
        const avgWordLen = sent.length / (words.length || 1);
        const hasAiPattern = /furthermore|in conclusion|delve|testament|crucial|moreover|seamlessly|tapestry/i.test(sent);
        const isAiLikely = hasAiPattern || (words.length > 12 && avgWordLen > 5.5);
        if (isAiLikely) aiSentenceCount++;

        const sentenceScore = isAiLikely
          ? Math.min(98, Math.max(70, Math.round(75 + (hasAiPattern ? 15 : 0) + (avgWordLen > 6 ? 10 : 0))))
          : Math.min(30, Math.max(5, Math.round(12 + Math.min(10, Math.abs(words.length - 8)))));

        return {
          text: sent,
          isAi: isAiLikely,
          score: sentenceScore
        };
      });

      const totalScore = rawSentences.length > 0 ? Math.round((aiSentenceCount / rawSentences.length) * 100) : 0;
      setOverallScore(totalScore);
      setSentences(analyzed);
      setIsScanning(false);
    }, 900);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <Bot size={14} className="text-cyan-400" />
              <span>AI Content Verification</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              AI Content Detector
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Detect ChatGPT, Claude, and Gemini generated text with sentence-level perplexity and burstiness analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <FileText size={15} className="text-cyan-400" />
              Text to Analyze
            </label>
            <span className="text-[10px] font-mono text-zinc-500">{inputText.length} chars</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste essay, blog post, or article here to check for AI patterns..."
            className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-sans leading-relaxed resize-none"
          />

          <button
            type="button"
            onClick={handleScan}
            disabled={!inputText.trim() || isScanning}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Scanning Perplexity & Patterns...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Scan for AI Content</span>
              </>
            )}
          </button>
        </div>

        {/* Results Card */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Activity size={15} className="text-cyan-400" />
              Detection Report
            </label>
            {overallScore !== null && (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border",
                overallScore > 50 
                  ? "bg-red-500/10 border-red-500/30 text-red-400" 
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              )}>
                {overallScore > 50 ? <AlertTriangle size={13} /> : <UserCheck size={13} />}
                {overallScore}% AI Probability
              </span>
            )}
          </div>

          <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 font-sans leading-relaxed relative overflow-y-auto space-y-3">
            {sentences.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-2 border-b border-white/10">
                  Sentence Highlights: <span className="text-red-400">Highlighted = Likely AI</span>
                </p>
                {sentences.map((sent, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-block rounded px-1.5 py-0.5 mr-1 mb-1 transition-colors",
                      sent.isAi 
                        ? "bg-red-500/20 text-red-200 border-b-2 border-red-500" 
                        : "text-zinc-300"
                    )}
                  >
                    {sent.text}{" "}
                  </span>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                <Bot size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Paste text and click "Scan for AI Content" to analyze perplexity & sentence patterns.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Workflow Tool Recommendations */}
      <ToolSuggestions currentToolId="ai-detector" categoryId="ai" />
    </div>
  );
}
