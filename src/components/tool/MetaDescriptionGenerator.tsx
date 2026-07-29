"use client";

import React, { useState } from "react";
import { 
  SearchCheck, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Search,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MetaDescriptionGenerator() {
  const [keyword, setKeyword] = useState("");
  const [valueProp, setValueProp] = useState("");
  const [cta, setCta] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 4 compelling SEO Meta Descriptions under 155 characters for keyword: "${keyword}". Value Proposition: ${valueProp}. Call to Action: ${cta}. Include the keyword naturally and end with a strong CTA.`,
          toolId: "meta-description-generator",
          systemInstruction: "You are an expert search marketer writing high-converting meta descriptions under 155 characters."
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        const raw = (data.output || data.text).split("\n").filter((l: string) => l.trim().length > 10);
        setDescriptions(raw.map((d: string) => d.replace(/^[\d.\s"'-]+/, "").replace(/["']/g, "").trim()));
      } else {
        setDescriptions(fallbackDescriptions(keyword));
      }
    } catch {
      setDescriptions(fallbackDescriptions(keyword));
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackDescriptions = (kw: string): string[] => [
    `Looking for the best ${kw}? Explore our comprehensive 2026 guide with step-by-step tips, features, and expert insights. Try for free today!`,
    `Master ${kw} in minutes with our easy-to-use tools and step-by-step tutorials. Boost your workflow efficiency now!`,
    `Discover how ${kw} can transform your daily productivity. Get instant access to features, templates, and expert recommendations.`
  ];

  const copyDesc = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <SearchCheck size={14} className="text-cyan-400" />
              <span>SERP Optimization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Meta Description Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Create high-converting meta descriptions under 160 characters with live SERP snippet preview.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Primary Keyword *
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Graphic Design Software"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Core Value Offer / Pitch (Optional)
            </label>
            <input
              type="text"
              value={valueProp}
              onChange={(e) => setValueProp(e.target.value)}
              placeholder="e.g. Free 14-day trial, 50+ templates"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Call To Action (Optional)
            </label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="e.g. Try for free today, Get started now"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!keyword.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Writing Descriptions...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Meta Descriptions</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Search size={15} className="text-cyan-400" />
            Generated Descriptions
          </label>

          <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
            {descriptions.length > 0 ? (
              descriptions.map((d, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-white/10 bg-black/40 hover:border-cyan-500/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-200 font-sans">{d}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded", d.length <= 160 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300")}>
                      {d.length}/160 chars
                    </span>
                    <button
                      type="button"
                      onClick={() => copyDesc(d, i)}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedIdx === i ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedIdx === i ? "Copied" : "Copy Description"}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                <SearchCheck size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Enter a keyword and click "Generate Meta Descriptions" to draft search-optimized snippet text.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
