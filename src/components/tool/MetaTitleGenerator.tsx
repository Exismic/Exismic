"use client";

import React, { useState } from "react";
import { 
  Target, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Search,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MetaTitleGenerator() {
  const [keyword, setKeyword] = useState("");
  const [topic, setTopic] = useState("");
  const [brandName, setBrandName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 5 high-CTR, SEO-optimized Meta Title tags under 60 characters for keyword: "${keyword}". Topic: ${topic}. Brand: ${brandName}. Ensure primary keyword is near the beginning.`,
          toolId: "meta-title-generator",
          systemInstruction: "You are an SEO specialist writing compelling title tags under 60 characters with high search click-through rates."
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        const raw = (data.output || data.text).split("\n").filter((l: string) => l.trim().length > 5);
        setTitles(raw.map((t: string) => t.replace(/^[\d.\s"'-]+/, "").replace(/["']/g, "").trim()));
      } else {
        setTitles(fallbackTitles(keyword, brandName));
      }
    } catch {
      setTitles(fallbackTitles(keyword, brandName));
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackTitles = (kw: string, brand: string): string[] => {
    const b = brand ? ` | ${brand}` : "";
    return [
      `Best ${kw} Guide (2026 Edition)${b}`,
      `Top 10 Tips for ${kw} (Free Guide)${b}`,
      `How to Master ${kw} Fast & Easily${b}`,
      `Ultimate ${kw} Resource for Creators${b}`,
      `${kw} Secrets You Need to Know${b}`
    ];
  };

  const copyTitle = (text: string, idx: number) => {
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
              <Target size={14} className="text-cyan-400" />
              <span>Search Engine Optimization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Meta Title Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate click-worthy title tags under 60 characters with live Google SERP length gauges.
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
              placeholder="e.g. AI Video Generator, Best Laptops"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Topic / Page Intent (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. beginner tutorial, pricing guide"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Brand Name (Optional)
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Exismic"
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
                <span>Generating Titles...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate SEO Titles</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Search size={15} className="text-cyan-400" />
            Generated SEO Title Tags
          </label>

          <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
            {titles.length > 0 ? (
              titles.map((t, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-white/10 bg-black/40 hover:border-cyan-500/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-cyan-300 font-sans truncate pr-2">{t}</p>
                    <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded", t.length <= 60 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300")}>
                      {t.length}/60 chars
                    </span>
                  </div>

                  {/* SERP Mock Preview */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <p className="text-[10px] text-zinc-500 truncate">https://yourdomain.com › {keyword.toLowerCase().replace(/\s+/g, "-")}</p>
                    <p className="text-xs font-medium text-blue-400 hover:underline cursor-pointer truncate">{t}</p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => copyTitle(t, i)}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedIdx === i ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedIdx === i ? "Copied" : "Copy Title Tag"}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                <Target size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Enter a keyword and click "Generate SEO Titles" to preview high-CTR meta tags.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
