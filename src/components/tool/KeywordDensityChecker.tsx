"use client";

import React, { useState, useMemo } from "react";
import { 
  SearchCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  BarChart3,
  Copy,
  Download,
  RotateCcw,
  Tag,
  PieChart,
  Target,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// Common English Stop Words Filter
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

// 6 Real-World Content Blueprints (Standard: Preloaded Blueprint #1, Zero Empty Voids)
export interface DensityBlueprint {
  id: string;
  title: string;
  category: string;
  focusKeyword: string;
  content: string;
}

export const DENSITY_BLUEPRINTS: DensityBlueprint[] = [
  {
    id: "tech-review",
    title: "Tech Hardware Review",
    category: "Product Review",
    focusKeyword: "mechanical keyboard",
    content: `When choosing the best mechanical keyboard for long coding sessions, key switch ergonomics, acoustic feedback, and wireless connectivity are the primary factors to evaluate. A premium mechanical keyboard provides tactile response that reduces finger strain and boosts typing speed.

Hot-swappable mechanical keyboard switches allow developers to experiment with linear red switches, tactile brown switches, or clicky blue switches without soldering. High-grade mechanical keyboard builds feature sound-dampening foam, pre-lubed stabilizers, and durable PBT keycaps.

Whether you prefer a compact 75% mechanical keyboard or a full-sized gaming mechanical keyboard, choosing proper wrist support and custom key mapping guarantees peak typing comfort throughout workday marathons.`
  },
  {
    id: "saas-landing",
    title: "SaaS Software Landing Page",
    category: "Software Copy",
    focusKeyword: "cloud backup",
    content: `Protect your enterprise data with automated cloud backup solutions engineered for zero data loss and instant disaster recovery. Our continuous cloud backup engine automatically syncs files, databases, and virtual machines in real time.

With military-grade 256-bit encryption, this cloud backup platform keeps confidential files secure both in transit and at rest. If ransomware strikes, our one-click cloud backup restore retrieves complete operating system snapshots within seconds.

Thousands of engineering teams rely on our scalable cloud backup infrastructure to eliminate downtime and meet SOC2 compliance. Start your free cloud backup trial today.`
  },
  {
    id: "wellness-blog",
    title: "Health & Nutrition Editorial",
    category: "Health Blog",
    focusKeyword: "matcha green tea",
    content: `Switching from morning coffee to organic matcha green tea provides sustained mental focus without the afternoon energy crash or caffeine jitters. Matcha green tea contains high concentrations of L-theanine, an amino acid that promotes calm alertness.

Unlike steeped green tea, drinking ceremonial matcha green tea involves consuming the entire stone-ground tea leaf, delivering ten times more antioxidants. Regular consumption of matcha green tea supports metabolic rate and immune resilience.

To prepare traditional matcha green tea, whisk one teaspoon of ceremonial powder with hot water until a velvety green froth forms. Enjoy pure matcha green tea daily for holistic vitality.`
  },
  {
    id: "marketing-pitch",
    title: "Digital Marketing Strategy",
    category: "Agency Copy",
    focusKeyword: "organic search",
    content: `Scaling organic search traffic requires a systematic blend of technical website audits, high-intent keyword mapping, and authoritative digital PR link building. Unlike paid advertising, investments in organic search compound over quarters, driving qualified prospective leads with near-zero marginal cost.

Optimizing for organic search means aligning content with real user search intent and satisfying Google Core Web Vitals. When your website dominates organic search rankings for buyer queries, brand trust and conversion rates surge naturally.`
  },
  {
    id: "travel-guide",
    title: "Travel Itinerary Article",
    category: "Travel Guide",
    focusKeyword: "tokyo itinerary",
    content: `Planning a 5-day Tokyo itinerary is an unforgettable adventure through futuristic skyscrapers, serene shrines, and world-class street food. Day one of your Tokyo itinerary should explore Shibuya Crossing and the tranquil Meiji Shrine.

Day two of this Tokyo itinerary brings you to the historic temples of Asakusa and the electronic wonderland of Akihabara. Follow this Tokyo itinerary with a high-speed bullet train day trip to Mount Fuji.

Whether sampling authentic ramen in Shinjuku or exploring digital art exhibits, this curated Tokyo itinerary ensures you experience the absolute best of Japan.`
  },
  {
    id: "cybersecurity-brief",
    title: "Cybersecurity Technical Brief",
    category: "Security Guide",
    focusKeyword: "zero trust",
    content: `Adopting a zero trust security architecture is essential for protecting distributed remote teams against sophisticated credential theft and lateral network intrusions. Under zero trust principles, no user or device is granted implicit access.

Implementing zero trust involves continuous multifactor authentication, micro-segmentation, and least-privilege identity access controls. With zero trust policies active, security operations teams gain comprehensive visibility across every cloud endpoint.`
  }
];

export default function KeywordDensityChecker() {
  // Selected Blueprint
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("tech-review");

  // Form Inputs
  const [text, setText] = useState<string>(DENSITY_BLUEPRINTS[0].content);
  const [focusKeyword, setFocusKeyword] = useState<string>(DENSITY_BLUEPRINTS[0].focusKeyword);
  const [activeTab, setActiveTab] = useState<"1word" | "2word" | "3word">("1word");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [copied, setCopied] = useState<boolean>(false);

  // Analysis Engine
  const analysis = useMemo(() => {
    if (!text.trim()) {
      return { 
        totalWords: 0, 
        uniqueWords: 0,
        charCount: 0,
        readTimeMinutes: 0,
        wordFreq: [], 
        biGramFreq: [], 
        triGramFreq: [], 
        hasStuffing: false,
        topDensityWord: "",
        focusKeywordDensity: 0,
        focusKeywordCount: 0
      };
    }

    const charCount = text.length;
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1);

    const totalWords = words.length;
    if (totalWords === 0) {
      return { 
        totalWords: 0, 
        uniqueWords: 0,
        charCount,
        readTimeMinutes: 0,
        wordFreq: [], 
        biGramFreq: [], 
        triGramFreq: [], 
        hasStuffing: false,
        topDensityWord: "",
        focusKeywordDensity: 0,
        focusKeywordCount: 0
      };
    }

    const readTimeMinutes = Math.max(1, Math.round((totalWords / 220) * 10) / 10);

    // 1-Word Frequency
    const singleCounts: Record<string, number> = {};
    const allUnique = new Set<string>();

    words.forEach((w) => {
      allUnique.add(w);
      if (!STOP_WORDS.has(w) && w.length >= 3) {
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
      .slice(0, 20);

    // 2-Word Frequency
    const biGramCounts: Record<string, number> = {};
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      if ((!STOP_WORDS.has(w1) || !STOP_WORDS.has(w2)) && w1.length > 2 && w2.length > 2) {
        const phrase = `${w1} ${w2}`;
        biGramCounts[phrase] = (biGramCounts[phrase] || 0) + 1;
      }
    }

    const biGramFreq = Object.entries(biGramCounts)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalWords) * 100 * 10) / 10
      }))
      .filter((item) => item.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 3-Word Frequency
    const triGramCounts: Record<string, number> = {};
    for (let i = 0; i < words.length - 2; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      const w3 = words[i + 2];
      if ((!STOP_WORDS.has(w1) || !STOP_WORDS.has(w2) || !STOP_WORDS.has(w3)) && w1.length > 2) {
        const phrase = `${w1} ${w2} ${w3}`;
        triGramCounts[phrase] = (triGramCounts[phrase] || 0) + 1;
      }
    }

    const triGramFreq = Object.entries(triGramCounts)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalWords) * 100 * 10) / 10
      }))
      .filter((item) => item.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Keyword Stuffing check (> 3.5% density)
    const hasStuffing = wordFreq.some((item) => item.density > 3.5);
    const topDensityWord = wordFreq[0] ? `${wordFreq[0].word} (${wordFreq[0].density}%)` : "None";

    // Focus keyword stats if provided
    let focusKeywordCount = 0;
    let focusKeywordDensity = 0;
    if (focusKeyword.trim()) {
      const regex = new RegExp(`\\b${focusKeyword.trim().replace(/[^a-z0-9]/gi, "\\$&")}\\b`, "gi");
      const matches = text.match(regex);
      focusKeywordCount = matches ? matches.length : 0;
      focusKeywordDensity = Math.round((focusKeywordCount / totalWords) * 100 * 10) / 10;
    }

    return { 
      totalWords, 
      uniqueWords: allUnique.size,
      charCount,
      readTimeMinutes,
      wordFreq, 
      biGramFreq, 
      triGramFreq, 
      hasStuffing,
      topDensityWord,
      focusKeywordCount,
      focusKeywordDensity
    };
  }, [text, focusKeyword]);

  // Active list filtered by local search
  const currentList = activeTab === "1word" ? analysis.wordFreq : activeTab === "2word" ? analysis.biGramFreq : analysis.triGramFreq;
  const filteredList = currentList.filter((item) => 
    searchFilter ? item.word.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  // Load a Blueprint
  const handleSelectBlueprint = (bp: DensityBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setText(bp.content);
    setFocusKeyword(bp.focusKeyword);
  };

  // Reset to Baseline
  const handleReset = () => {
    setSelectedBlueprintId("");
    setText("");
    setFocusKeyword("");
    setSearchFilter("");
  };

  // Copy Summary
  const handleCopySummary = () => {
    const topSingle = analysis.wordFreq.slice(0, 5).map((w) => `${w.word}: ${w.count}x (${w.density}%)`).join(", ");
    const summary = `Keyword Density Analysis Report:
Total Words: ${analysis.totalWords} | Characters: ${analysis.charCount}
Reading Time: ~${analysis.readTimeMinutes} mins
Focus Keyword: ${focusKeyword || "None"} (${analysis.focusKeywordCount} occurrences, ${analysis.focusKeywordDensity}% density)
Top Keywords: ${topSingle}
Stuffing Warning: ${analysis.hasStuffing ? "Yes (some terms exceed 3.5%)" : "No (natural distribution)"}

Analyzed with Exismic SEO Studio`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Report (.txt)
  const handleDownloadTxt = () => {
    const summary = `Keyword Density & Content Frequency Report
Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

[EXECUTIVE METRICS]
-------------------------------------------------------
Total Words:             ${analysis.totalWords}
Unique Words:            ${analysis.uniqueWords}
Character Count:         ${analysis.charCount}
Estimated Reading Time:  ${analysis.readTimeMinutes} minutes
Focus Keyword:           ${focusKeyword || "None"} (${analysis.focusKeywordCount}x - ${analysis.focusKeywordDensity}%)
Stuffing Risk:           ${analysis.hasStuffing ? "WARNING (>3.5% detected)" : "HEALTHY (Natural language)"}

[TOP 1-WORD KEYWORDS]
-------------------------------------------------------
${analysis.wordFreq.map((w, i) => `${i + 1}. ${w.word} — ${w.count} times (${w.density}%)`).join("\n")}

[TOP 2-WORD PHRASES]
-------------------------------------------------------
${analysis.biGramFreq.map((w, i) => `${i + 1}. ${w.word} — ${w.count} times (${w.density}%)`).join("\n")}

[TOP 3-WORD PHRASES]
-------------------------------------------------------
${analysis.triGramFreq.map((w, i) => `${i + 1}. ${w.word} — ${w.count} times (${w.density}%)`).join("\n")}

Generated with Exismic SEO Studio
https://exismic.com/tools/keyword-density-checker`;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyword-density-report-${analysis.totalWords}-words.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Deck: Telemetry HUD & Studio Actions */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Category Badge & Studio Telemetry */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <PieChart size={13} className="text-cyan-400" />
              <span>SEO Webmaster Studio</span>
            </div>

            {/* Word Count Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <FileText size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-zinc-300">Total Words:</span>
              <span className="text-sm font-black text-cyan-400">{analysis.totalWords}</span>
            </div>

            {/* Reading Time Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Clock size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-zinc-300">Reading Time:</span>
              <span className="text-sm font-black text-white">~{analysis.readTimeMinutes} min</span>
            </div>

            {/* Health / Stuffing Status */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-xs font-bold text-zinc-300">SEO Health:</span>
              <span className={cn(
                "text-xs font-black px-2 py-0.5 rounded-full border",
                analysis.hasStuffing
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
              )}>
                {analysis.hasStuffing ? "⚠️ Stuffing Risk" : "✓ Natural Flow"}
              </span>
            </div>
          </div>

          {/* Right: Quick Reset & Export */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset content"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blueprint Selector Bar (Standard: 6 Blueprints, Preloaded Blueprint #1) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Sample Editorial & Commercial Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any content sample to inspect natural keyword densities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {DENSITY_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap shrink-0">
                    {bp.category}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400/90 truncate text-right">
                    "{bp.focusKeyword}"
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.content.slice(0, 100)}...
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Content Textarea & Keyword Tracker): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <FileText size={14} className="text-cyan-400" />
                <span>Article or Webpage Copy</span>
              </label>
              <span className="text-[11px] text-zinc-500">
                {analysis.totalWords} words • {analysis.uniqueWords} unique
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSelectedBlueprintId("");
              }}
              placeholder="Paste your blog article, product copy, or draft text here to scan keyword frequency..."
              className="w-full min-h-[360px] rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none transition-all resize-y leading-relaxed font-sans"
            />

            {/* Focus Keyword Audit Strip */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  Target Focus Keyword (Optional)
                </label>
                {focusKeyword.trim() && (
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    analysis.focusKeywordDensity >= 1.0 && analysis.focusKeywordDensity <= 2.8
                      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                      : analysis.focusKeywordDensity > 2.8
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                  )}>
                    {analysis.focusKeywordCount}x occurrences ({analysis.focusKeywordDensity}% density)
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 font-bold">
                  <Target size={14} />
                </div>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. mechanical keyboard"
                  className="w-full rounded-xl border border-white/10 bg-black/60 pl-9 pr-3 py-2 text-xs font-bold text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                SEO Best Practice: Aim for 1.0% to 2.5% density for your main target keyword.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Frequency Table & Metrics): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-4">
            {/* Header: Tabs & Local Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex gap-1 p-1 rounded-xl bg-black/60 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("1word")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeTab === "1word" ? "bg-cyan-500 text-black font-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  1-Word
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("2word")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeTab === "2word" ? "bg-cyan-500 text-black font-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  2-Word Phrases
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("3word")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeTab === "3word" ? "bg-cyan-500 text-black font-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  3-Word Phrases
                </button>
              </div>

              {/* Keyword Filter Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
                  <Search size={12} />
                </div>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter list..."
                  className="rounded-xl border border-white/10 bg-black/60 pl-7 pr-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none placeholder:text-zinc-600 w-36"
                />
              </div>
            </div>

            {/* Keyword Stuffing Warning Banner */}
            {analysis.hasStuffing && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Potential Keyword Stuffing Detected</p>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Certain terms exceed 3.5% density. Consider replacing repetitive keywords with natural synonyms to avoid search engine penalties.
                  </p>
                </div>
              </div>
            )}

            {/* Frequency Table */}
            <div className="w-full max-h-[340px] rounded-2xl border border-white/10 bg-black/40 p-3 overflow-y-auto space-y-2">
              {filteredList.length > 0 ? (
                filteredList.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-[10px] font-mono text-zinc-500">#{i + 1}</span>
                      <span className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                        {item.word}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 font-mono text-xs">{item.count}x</span>
                      <span className={cn(
                        "font-bold font-mono text-xs px-2 py-0.5 rounded",
                        item.density > 3.5
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : item.density >= 1.0
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-white/5 text-zinc-400 border border-white/10"
                      )}>
                        {item.density}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <SearchCheck size={32} className="mx-auto opacity-40 text-cyan-400" />
                  <p className="text-xs">No matching phrases found in this category.</p>
                </div>
              )}
            </div>

            {/* Copy Summary Button */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-[0.99]"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={16} className="text-black" />
                  <span>Report Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-black" />
                  <span>Copy Density Summary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="keyword-density-checker"
        toolName="Keyword Density Checker"
        title={`Keyword Analysis (${analysis.totalWords} words, ${analysis.uniqueWords} unique)`}
        content={`Keyword Density Report:\nTotal Words: ${analysis.totalWords}\nTop Keyword: ${analysis.topDensityWord}\nFocus Keyword: ${focusKeyword || "None"} (${analysis.focusKeywordCount}x - ${analysis.focusKeywordDensity}%)`}
        downloadLabel="Download Report (.txt)"
        downloadAction={handleDownloadTxt}
        onCopy={handleCopySummary}
      />

      {/* Chained Companion Tools in SEO */}
      <ToolWorkflowChaining
        currentToolId="keyword-density-checker"
        categoryId="seo"
        outputContent={`Total Words: ${analysis.totalWords}, Top Keyword: ${analysis.topDensityWord}`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="keyword-density-checker"
        categoryId="seo"
        outputContent={`Total Words: ${analysis.totalWords}, Top Keyword: ${analysis.topDensityWord}`}
      />
    </div>
  );
}
