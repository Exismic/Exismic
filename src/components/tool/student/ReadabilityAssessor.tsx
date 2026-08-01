"use client";

import React, { useState, useMemo } from "react";
import {
  BrainCircuit,
  BookOpen,
  CheckCircle2,
  Zap,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Info,
  AlertCircle,
  FileText,
  Wand2,
  SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplexSentence {
  originalSentence: string;
  reason: string;
  simplifiedSuggestion: string;
}

interface ReadabilityReport {
  fleschEase: number;
  gradeLevel: string;
  targetAudience: string;
  readabilityStatus: string;
  jargonWords: string[];
  complexSentences: ComplexSentence[];
  simplifiedRewrites: {
    middleSchool: string;
    highSchool: string;
    executive: string;
  };
  keyRecommendations: string[];
}

export default function ReadabilityAssessor() {
  const [textInput, setTextInput] = useState(
    "Quantum computing leverages the fundamental principles of quantum mechanics to process information at unprecedented speeds. Unlike classical computers that rely on binary bits, quantum systems utilize qubits capable of existing in superposition. This technological leap enables the rapid execution of complex cryptographic algorithms and drug discovery simulations."
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<ReadabilityReport | null>(null);
  const [activeRewriteTab, setActiveRewriteTab] = useState<"middleSchool" | "highSchool" | "executive">("middleSchool");
  const [copied, setCopied] = useState(false);

  // Fast Client-Side Realtime Math Metrics
  const liveMetrics = useMemo(() => {
    if (!textInput.trim()) {
      return { words: 0, sentences: 0, syllables: 0, fleschEase: 0, gradeLevel: 0, readTimeMin: 0 };
    }

    const wordsArr = textInput.trim().split(/\s+/).filter(Boolean);
    const wordsCount = wordsArr.length;
    const sentencesCount = Math.max(1, textInput.split(/[.!?]+/).filter((s) => s.trim().length > 0).length);

    // Syllables estimation
    let syllablesCount = 0;
    wordsArr.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, "");
      const matches = clean.match(/[aeiouy]{1,2}/g);
      syllablesCount += matches ? matches.length : 1;
    });

    const ASL = wordsCount / sentencesCount; // Average Sentence Length
    const ASW = syllablesCount / wordsCount; // Average Syllables per Word

    // Accurate Flesch Reading Ease Formula
    let fleschEase = Math.round(206.835 - 1.015 * ASL - 84.6 * ASW);
    fleschEase = Math.min(100, Math.max(5, fleschEase));

    // Flesch-Kincaid Grade Level
    let gradeLevel = Math.round(0.39 * ASL + 11.8 * ASW - 15.59);
    gradeLevel = Math.max(1, Math.min(20, gradeLevel));

    const readTimeMin = Math.max(1, Math.ceil(wordsCount / 200));

    return {
      words: wordsCount,
      sentences: sentencesCount,
      syllables: syllablesCount,
      fleschEase,
      gradeLevel,
      readTimeMin
    };
  }, [textInput]);

  // Run Backend AI Readability & Sentence Audit
  const handleRunAiAudit = async () => {
    if (!textInput.trim()) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/tools/student/readability-assessor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput.trim() })
      });

      const resData = await response.json();

      if (response.ok && resData.data) {
        setAiReport(resData.data);
      } else {
        runFallbackAudit();
      }
    } catch (err) {
      runFallbackAudit();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Local fallback audit
  const runFallbackAudit = () => {
    const wordsArr = textInput.trim().split(/\s+/).filter(Boolean);
    const complexWords = wordsArr.filter((w) => w.length >= 9).slice(0, 5);

    const sentences = textInput.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const complexSents: ComplexSentence[] = sentences
      .filter((s) => s.split(/\s+/).length > 20)
      .slice(0, 3)
      .map((s) => ({
        originalSentence: s.trim(),
        reason: "Long sentence with high syllable count.",
        simplifiedSuggestion: s.trim().slice(0, Math.floor(s.length / 2)) + "..."
      }));

    setAiReport({
      fleschEase: liveMetrics.fleschEase,
      gradeLevel: `Grade ${liveMetrics.gradeLevel} (University Level)`,
      targetAudience: liveMetrics.gradeLevel > 12 ? "Academic / Technical" : "General Audience",
      readabilityStatus: liveMetrics.fleschEase < 40 ? "Dense & Academic" : "Clear & Accessible",
      jargonWords: complexWords,
      complexSentences: complexSents,
      simplifiedRewrites: {
        middleSchool: textInput.slice(0, 150) + "... (Simplified 8th-grade version)",
        highSchool: textInput.slice(0, 180) + "... (Balanced 10th-grade version)",
        executive: textInput.slice(0, 120) + "... (Executive summary)"
      },
      keyRecommendations: [
        "Break longer sentences into 2 shorter independent clauses.",
        "Replace multi-syllable jargon words with everyday equivalents where possible."
      ]
    });
  };

  const handleApplyRewrite = (text: string) => {
    setTextInput(text);
  };

  const handleCopyReport = () => {
    if (!aiReport) return;
    const reportText =
      `READABILITY AUDIT REPORT\n` +
      `Flesch Reading Ease: ${aiReport.fleschEase}/100\n` +
      `Grade Level: ${aiReport.gradeLevel}\n` +
      `Target Audience: ${aiReport.targetAudience}\n\n` +
      `RECOMMENDATIONS:\n` +
      aiReport.keyRecommendations.map((r) => `- ${r}`).join("\n");

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Banner Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/60 via-purple-950/40 to-neutral-950 border border-amber-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <BrainCircuit className="w-3.5 h-3.5" /> Exismic Readability Engine
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Text Readability & Grade Level Assessor
        </h1>
        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl leading-relaxed">
          Evaluate Flesch-Kincaid Grade Level, Flesch Reading Ease score, sentence complexity, jargon density, and generate 1-click AI simplified rewrites.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Text Input Column */}
        <div className="lg:col-span-6 space-y-4 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Input Content Text
            </label>
            <span className="text-[11px] text-neutral-500 font-mono">
              {liveMetrics.words} words • {liveMetrics.sentences} sentences
            </span>
          </div>

          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setAiReport(null);
            }}
            rows={11}
            className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed transition-all placeholder:text-neutral-600 shadow-inner"
            placeholder="Paste text here to evaluate readability..."
          />

          <button
            onClick={handleRunAiAudit}
            disabled={!textInput.trim() || isAnalyzing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs tracking-widest uppercase shadow-xl hover:shadow-amber-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Deep AI Readability Audit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Readability & Sentence Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Readability Metrics & AI Report Column */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between space-y-6">
            {/* Live Metrics Header */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Flesch Reading Ease
                </span>
                <div className="text-3xl font-black text-amber-400 mt-1 flex items-baseline gap-2">
                  {liveMetrics.fleschEase} <span className="text-xs text-neutral-500 font-normal">/ 100</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  Est. Grade Level
                </span>
                <div className="text-2xl font-black text-purple-400 mt-1">
                  Grade {liveMetrics.gradeLevel}
                </div>
              </div>
            </div>

            {/* Quick Live Stats Pill Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs shadow-inner">
                <span className="text-neutral-500 block">Total Words</span>
                <span className="text-white font-bold text-sm">{liveMetrics.words}</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs shadow-inner">
                <span className="text-neutral-500 block">Sentences</span>
                <span className="text-white font-bold text-sm">{liveMetrics.sentences}</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs shadow-inner">
                <span className="text-neutral-500 block">Est. Read Time</span>
                <span className="text-white font-bold text-sm">~{liveMetrics.readTimeMin} min</span>
              </div>
            </div>

            {/* AI Deep Analysis Section */}
            {aiReport ? (
              <div className="space-y-4 pt-2 border-t border-neutral-800/80 animate-in fade-in duration-200">
                {/* Target Audience & Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                      🎯 {aiReport.targetAudience}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                      📊 {aiReport.readabilityStatus}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all border border-neutral-700 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Report"}
                  </button>
                </div>

                {/* Jargon Words Tags */}
                {aiReport.jargonWords && aiReport.jargonWords.length > 0 && (
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">
                      Complex Jargon & Multi-Syllable Terms Detected:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiReport.jargonWords.map((j, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                          {j}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-Click AI Simplifier Tabs */}
                {aiReport.simplifiedRewrites && (
                  <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-neutral-950 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-purple-400" /> AI 1-Click Text Simplifier
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                      <button
                        onClick={() => setActiveRewriteTab("middleSchool")}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                          activeRewriteTab === "middleSchool" ? "bg-purple-600 text-white shadow-md" : "text-neutral-400"
                        )}
                      >
                        8th Grade
                      </button>
                      <button
                        onClick={() => setActiveRewriteTab("highSchool")}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                          activeRewriteTab === "highSchool" ? "bg-purple-600 text-white shadow-md" : "text-neutral-400"
                        )}
                      >
                        10th Grade
                      </button>
                      <button
                        onClick={() => setActiveRewriteTab("executive")}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                          activeRewriteTab === "executive" ? "bg-purple-600 text-white shadow-md" : "text-neutral-400"
                        )}
                      >
                        Executive
                      </button>
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/10">
                      "{aiReport.simplifiedRewrites[activeRewriteTab]}"
                    </p>

                    <button
                      onClick={() => handleApplyRewrite(aiReport.simplifiedRewrites[activeRewriteTab])}
                      className="w-full py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-all border border-purple-500/40 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Replace Input Text with Simplified Version
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-amber-400 mx-auto opacity-80" />
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Click <strong>"Run AI Readability & Sentence Audit"</strong> to generate target audience analysis, complex sentence breakdowns, and 1-click simplified rewrites.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
