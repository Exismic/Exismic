"use client";

import React, { useState, useMemo } from "react";
import { 
  SearchCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  BarChart3,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "cannot", "could",
  "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have",
  "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is",
  "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
  "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some",
  "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this",
  "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
  "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
]);

export default function KeywordDensityChecker() {
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState<"1word" | "2word" | "3word">("1word");

  const analysis = useMemo(() => {
    if (!text.trim()) return { totalWords: 0, wordFreq: [], biGramFreq: [], triGramFreq: [], hasStuffing: false };

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 1);

    const totalWords = words.length;
    if (totalWords === 0) return { totalWords: 0, wordFreq: [], biGramFreq: [], triGramFreq: [], hasStuffing: false };

    // 1-Word Frequency
    const singleCounts: Record<string, number> = {};
    words.forEach((w) => {
      if (!STOP_WORDS.has(w)) {
        singleCounts[w] = (singleCounts[w] || 0) + 1;
      }
    });

    const wordFreq = Object.entries(singleCounts)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalWords) * 100 * 10) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 2-Word Frequency
    const biGramCounts: Record<string, number> = {};
    for (let i = 0; i < words.length - 1; i++) {
      if (!STOP_WORDS.has(words[i]) || !STOP_WORDS.has(words[i + 1])) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        biGramCounts[phrase] = (biGramCounts[phrase] || 0) + 1;
      }
    }

    const biGramFreq = Object.entries(biGramCounts)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalWords) * 100 * 10) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 3-Word Frequency
    const triGramCounts: Record<string, number> = {};
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      triGramCounts[phrase] = (triGramCounts[phrase] || 0) + 1;
    }

    const triGramFreq = Object.entries(triGramCounts)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalWords) * 100 * 10) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const hasStuffing = wordFreq.some((item) => item.density > 3.5);

    return { totalWords, wordFreq, biGramFreq, triGramFreq, hasStuffing };
  }, [text]);

  const activeList = activeTab === "1word" ? analysis.wordFreq : activeTab === "2word" ? analysis.biGramFreq : analysis.triGramFreq;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <SearchCheck size={14} className="text-cyan-400" />
              <span>SEO Content Audit</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Keyword Density Checker
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Analyze word frequencies, N-gram phrase densities, and keyword stuffing warnings for SEO content.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Content Text to Analyze
            </label>
            <span className="text-[10px] font-mono text-zinc-500">{analysis.totalWords} words</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your blog post, article draft, or webpage copy here..."
            className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Frequency Table */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("1word")}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer", activeTab === "1word" ? "bg-cyan-500 text-black font-black" : "text-zinc-400")}
                >
                  Single Words
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("2word")}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer", activeTab === "2word" ? "bg-cyan-500 text-black font-black" : "text-zinc-400")}
                >
                  2-Word Phrases
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("3word")}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer", activeTab === "3word" ? "bg-cyan-500 text-black font-black" : "text-zinc-400")}
                >
                  3-Word Phrases
                </button>
              </div>

              {analysis.hasStuffing && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase">
                  <AlertTriangle size={12} /> Stuffing Warning
                </span>
              )}
            </div>

            <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 font-sans text-xs overflow-y-auto space-y-2">
              {activeList.length > 0 ? (
                activeList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-zinc-200 truncate max-w-[200px]">{item.word}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 font-mono">{item.count}x</span>
                      <span className={cn("font-bold font-mono px-2 py-0.5 rounded", item.density > 3.5 ? "bg-red-500/20 text-red-300" : "bg-cyan-500/20 text-cyan-300")}>
                        {item.density}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                  <SearchCheck size={36} className="opacity-40" />
                  <p className="text-xs font-medium max-w-xs">Paste text to analyze keyword frequency density.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
