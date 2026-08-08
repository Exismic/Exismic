"use client";

import React, { useState, useMemo } from "react";
import {
  FileQuestion,
  Sparkles,
  RefreshCw,
  ArrowRightLeft,
  Copy,
  Check,
  Info,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Zap,
  Bookmark,
  FileCheck2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SentenceDiff {
  text: string;
  status: "exact_copy" | "paraphrased" | "original";
  matchedSourceSentence?: string;
  similarityScore: number;
  suggestion?: string;
}

interface AnalysisReport {
  exactMatchScore: number;
  semanticSimilarityScore: number;
  riskLevel: string;
  summary: string;
  sentenceAnalysis: SentenceDiff[];
}

interface TestPreset {
  name: string;
  doc1: string;
  doc2: string;
}

const TEST_PRESETS: TestPreset[] = [
  {
    name: "Paraphrase Test Case",
    doc1: "Artificial intelligence is transforming higher education by personalizing learning pathways, providing instant feedback, and assisting faculty with curriculum design.",
    doc2: "Artificial intelligence is transforming higher education by personalizing learning pathways and giving immediate feedback to students."
  },
  {
    name: "Verbatim Overlap",
    doc1: "Quantum computing leverages superposition and entanglement to perform complex computations exponentially faster than classical supercomputers for specific mathematical algorithms.",
    doc2: "Quantum computing leverages superposition and entanglement to perform complex computations exponentially faster than classical supercomputers."
  },
  {
    name: "Original Comparison",
    doc1: "The Industrial Revolution marked a major turning point in history; almost every aspect of daily life was influenced in some way by technological advancements.",
    doc2: "Modern renewable energy systems, such as solar photovoltaic panels and offshore wind turbines, are driving the global transition toward zero-carbon power grids."
  }
];

export default function PlagiarismChecker() {
  const [textA, setTextA] = useState(TEST_PRESETS[0].doc1);
  const [textB, setTextB] = useState(TEST_PRESETS[0].doc2);

  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [copied, setCopied] = useState(false);

  // Fast Client-Side Word Overlap (Instant Live Metric)
  const liveStats = useMemo(() => {
    const wordsA = textA.toLowerCase().match(/\b\w+\b/g) || [];
    const wordsB = textB.toLowerCase().match(/\b\w+\b/g) || [];

    if (wordsA.length === 0 || wordsB.length === 0) {
      return { similarityPct: 0, sharedWordsCount: 0, totalWords: 0 };
    }

    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    let sharedCount = 0;

    setA.forEach((word) => {
      if (setB.has(word)) sharedCount++;
    });

    const similarityPct = Math.round((sharedCount / Math.max(setA.size, setB.size)) * 100);

    return {
      similarityPct,
      sharedWordsCount: sharedCount,
      totalWords: Math.max(wordsA.length, wordsB.length)
    };
  }, [textA, textB]);

  // Auto-run analysis whenever textA or textB changes
  React.useEffect(() => {
    if (textA.trim() && textB.trim()) {
      runFallbackAnalysis();
    } else {
      setReport(null);
    }
  }, [textA, textB]);

  // Run Deep AI Semantic Plagiarism Scan via Backend Route
  const handleRunScan = async () => {
    if (!textA.trim() || !textB.trim()) return;
    setIsScanning(true);

    try {
      const response = await fetch("/api/tools/student/plagiarism-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc1: textA, doc2: textB })
      });

      const resData = await response.json();

      if (response.ok && resData.data) {
        setReport(resData.data);
      } else {
        runFallbackAnalysis();
      }
    } catch {
      runFallbackAnalysis();
    } finally {
      setIsScanning(false);
    }
  };

  // Local fallback analyzer
  const runFallbackAnalysis = () => {
    const sentencesB = textB
      .split(/(?<=[.?!])\s+/)
      .filter((s) => s.trim().length > 0);

    const wordsA = new Set((textA.toLowerCase().match(/\b\w+\b/g) || []));

    let exactCount = 0;
    let paraCount = 0;

    const analyzed: SentenceDiff[] = sentencesB.map((sent) => {
      const sWords = sent.toLowerCase().match(/\b\w+\b/g) || [];
      let matchCount = 0;
      sWords.forEach((w) => {
        if (wordsA.has(w)) matchCount++;
      });

      const ratio = sWords.length > 0 ? matchCount / sWords.length : 0;

      if (ratio > 0.75) {
        exactCount++;
        return {
          text: sent,
          status: "exact_copy",
          similarityScore: Math.round(ratio * 100),
          suggestion: "High verbatim overlap detected. Rephrase sentence structure or add quotation marks and citation."
        };
      } else if (ratio > 0.4) {
        paraCount++;
        return {
          text: sent,
          status: "paraphrased",
          similarityScore: Math.round(ratio * 100),
          suggestion: "Paraphrased idea detected. Ensure proper in-text citation."
        };
      } else {
        return {
          text: sent,
          status: "original",
          similarityScore: Math.round(ratio * 100)
        };
      }
    });

    const exactPct = Math.round((exactCount / (sentencesB.length || 1)) * 100);
    const paraPct = Math.round((paraCount / (sentencesB.length || 1)) * 100);
    const semanticScore = Math.min(99, exactPct + paraPct * 0.8);

    setReport({
      exactMatchScore: exactPct,
      semanticSimilarityScore: Math.round(semanticScore),
      riskLevel:
        semanticScore > 65
          ? "High Plagiarism Risk"
          : semanticScore > 35
          ? "Moderate Paraphrase Risk"
          : "Low Risk / Original",
      summary: `Analysis complete. Detected ${exactCount} verbatim sentence match(es) and ${paraCount} paraphrased segment(s).`,
      sentenceAnalysis: analyzed
    });
  };

  const handleSwap = () => {
    const temp = textA;
    setTextA(textB);
    setTextB(temp);
  };

  const handleClear = () => {
    setTextA("");
    setTextB("");
    setReport(null);
  };

  const loadPreset = (preset: TestPreset) => {
    setTextA(preset.doc1);
    setTextB(preset.doc2);
  };

  const handleCopyReport = () => {
    if (!report) return;
    const text =
      `PLAGIARISM & SIMILARITY REPORT\n` +
      `Risk Level: ${report.riskLevel}\n` +
      `Exact Match: ${report.exactMatchScore}%\n` +
      `Semantic Similarity: ${report.semanticSimilarityScore}%\n\n` +
      `SUMMARY:\n${report.summary}\n\n` +
      `SENTENCE ANALYSIS:\n` +
      report.sentenceAnalysis
        .map((s) => `[${s.status.toUpperCase()}] ${s.text} (${s.similarityScore}% match)`)
        .join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Banner Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-indigo-950/30 border border-amber-500/20 shadow-2xl backdrop-blur-2xl space-y-3">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest shadow-inner">
          <FileQuestion className="w-4 h-4 text-amber-400" />
          <span>Similarity & Diff Engine</span>
        </div>
        <h1 className="relative z-10 text-2xl sm:text-4xl font-black text-white tracking-tight uppercase bg-gradient-to-r from-white via-amber-100 to-zinc-400 bg-clip-text text-transparent">
          Text Similarity & Plagiarism Diff Checker
        </h1>
        <p className="relative z-10 text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
          Compare two text documents side-by-side to highlight exact word matches, semantic paraphrase risk, sentence-level diffs, and citation suggestions.
        </p>
      </div>

      {/* Test Presets Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" /> Quick Samples:
        </span>
        {TEST_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => loadPreset(preset)}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-amber-500/10 hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Bookmark size={13} className="text-amber-400" />
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Control Actions & Live Overview */}
      <div className="p-6 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Instant Word Overlap
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400">
              <span className="text-white font-bold">{liveStats.sharedWordsCount}</span> shared unique words
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-black/60 border border-white/5 overflow-hidden p-0.5">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  liveStats.similarityPct > 50
                    ? "bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    : liveStats.similarityPct > 25
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    : "bg-gradient-to-r from-emerald-500 to-green-500"
                )}
                style={{ width: `${Math.max(4, liveStats.similarityPct)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span
                className={cn(
                  "font-black text-sm",
                  liveStats.similarityPct > 50
                    ? "text-rose-400"
                    : liveStats.similarityPct > 25
                    ? "text-amber-400"
                    : "text-emerald-400"
                )}
              >
                {liveStats.similarityPct}% Match
              </span>
              <span className="text-zinc-500 font-medium">Real-Time Metric</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSwap}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            title="Swap Document 1 and Document 2"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Swap Docs
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Main Input Textareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document 1 (Original Source) */}
        <div className="space-y-3 p-6 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-400">
              Original Reference Source (Doc 1) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {textA.trim() ? textA.trim().split(/\s+/).length : 0} words
              </span>
              <button
                type="button"
                onClick={() => setTextA("")}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={textA}
            onChange={(e) => {
              setTextA(e.target.value);
            }}
            rows={10}
            placeholder="Paste the original reference source (textbook excerpt, online article, or paper)..."
            className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none leading-relaxed transition-all placeholder:text-zinc-600 font-medium flex-1"
          />
        </div>

        {/* Document 2 (Draft to Check) */}
        <div className="space-y-3 p-6 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-400">
              Your Student Draft / Essay (Doc 2) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {textB.trim() ? textB.trim().split(/\s+/).length : 0} words
              </span>
              <button
                type="button"
                onClick={() => setTextB(textA)}
                title="Copy Document 1 into Document 2"
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase transition-colors"
              >
                + Copy Doc 1
              </button>
              <button
                type="button"
                onClick={() => setTextB("")}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={textB}
            onChange={(e) => {
              setTextB(e.target.value);
            }}
            rows={10}
            placeholder="Paste your essay or draft here to check if it matches or paraphrases Document 1..."
            className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none leading-relaxed transition-all placeholder:text-zinc-600 font-medium flex-1"
          />
        </div>
      </div>

      {/* AI Semantic Plagiarism Analysis Report & Highlighted Diff View */}
      {report && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in duration-300">
          {/* Report Header & Risk Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> AI Plagiarism & Paraphrase Audit Report
              </span>
              <div className="flex items-center gap-3 pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md",
                    report.exactMatchScore > 40 || report.riskLevel.includes("High")
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : report.semanticSimilarityScore > 35
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  )}
                >
                  {report.exactMatchScore > 40 ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {report.riskLevel}
                </span>
                <span className="text-xs font-bold text-zinc-300">
                  Exact Copy: <span className="text-rose-400">{report.exactMatchScore}%</span> • Semantic Similarity: <span className="text-amber-400">{report.semanticSimilarityScore}%</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/10 self-start sm:self-auto cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              {copied ? "Copied Report!" : "Copy Report"}
            </button>
          </div>

          {/* AI Summary */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/5 text-xs text-zinc-300 leading-relaxed space-y-1 shadow-inner font-medium">
            <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] block">
              Audit Executive Summary
            </span>
            <p>{report.summary}</p>
          </div>

          {/* Highlighted Sentence Diff Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                Sentence-by-Sentence Diff Breakdown (Document 2)
              </h4>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Verbatim Copy
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Paraphrased
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Original
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {report.sentenceAnalysis.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-4 rounded-2xl border text-xs space-y-2 transition-all shadow-md",
                    item.status === "exact_copy"
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                      : item.status === "paraphrased"
                      ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                      : "bg-black/60 border-white/5 text-zinc-300"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
                      {item.status === "exact_copy" ? "Exact Match" : item.status === "paraphrased" ? "Paraphrased Idea" : "Original Content"} ({item.similarityScore}% similarity)
                    </span>
                  </div>

                  <p className="text-sm font-medium leading-relaxed">"{item.text}"</p>

                  {item.suggestion && (
                    <div className="pt-2 border-t border-white/10 text-[11px] text-zinc-400 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item.suggestion}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

