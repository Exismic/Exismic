"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  FileText, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Sliders, 
  Code2, 
  Layers, 
  Type, 
  ListOrdered,
  FileCode,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";

// ============================================================================
// LOREM VOCABULARY & SENTENCE GENERATOR
// ============================================================================

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "ut",
  "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris",
  "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor",
  "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat",
  "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
  "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
  "perspiciatis", "unde", "omnis", "iste", "natus", "error", "voluptatem", "accusantium",
  "doloremque", "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "illo",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta", "explicabo"
];

export interface LoremBlueprint {
  id: string;
  name: string;
  description: string;
  tag: string;
  count: number;
  unit: "paragraphs" | "sentences" | "words" | "bullets";
  format: "plain" | "html" | "markdown" | "json";
  startWithLorem: boolean;
}

export const LOREM_BLUEPRINTS: LoremBlueprint[] = [
  {
    id: "hero-section",
    name: "Hero Section Pitch",
    description: "Punchy headline-length sentence + 2 supporting subtext lines for landing pages.",
    tag: "Website Copy",
    count: 3,
    unit: "sentences",
    format: "plain",
    startWithLorem: true,
  },
  {
    id: "blog-article",
    name: "Blog Article Draft",
    description: "3 structured, natural-length paragraphs ideal for editorial mockups & docs.",
    tag: "Long-form",
    count: 3,
    unit: "paragraphs",
    format: "plain",
    startWithLorem: true,
  },
  {
    id: "product-blurb",
    name: "Product Card Blurb",
    description: "2 concise benefit-focused sentences tailored for SaaS cards & pricing grids.",
    tag: "E-Commerce",
    count: 2,
    unit: "sentences",
    format: "plain",
    startWithLorem: false,
  },
  {
    id: "user-testimonial",
    name: "Customer Testimonial",
    description: "1 authentic paragraph structured like genuine social proof & feedback.",
    tag: "Social Proof",
    count: 1,
    unit: "paragraphs",
    format: "plain",
    startWithLorem: false,
  },
  {
    id: "bullet-points",
    name: "Feature Bullet Points",
    description: "5 bulleted benefit statements formatted for UI lists & spec sheets.",
    tag: "UI Lists",
    count: 5,
    unit: "bullets",
    format: "markdown",
    startWithLorem: false,
  },
  {
    id: "mobile-onboarding",
    name: "Mobile App Screens",
    description: "3 bite-sized paragraphs formatted for mobile carousel slides.",
    tag: "Mobile UX",
    count: 3,
    unit: "paragraphs",
    format: "html",
    startWithLorem: true,
  },
];

export default function LoremIpsumGenerator() {
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("blog-article");
  const [count, setCount] = useState<number>(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words" | "bullets">("paragraphs");
  const [format, setFormat] = useState<"plain" | "html" | "markdown" | "json">("plain");
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(42);
  const [copied, setCopied] = useState<boolean>(false);

  // Apply a blueprint with 0s wait
  const applyBlueprint = (bp: LoremBlueprint) => {
    setActiveBlueprintId(bp.id);
    setCount(bp.count);
    setUnit(bp.unit);
    setFormat(bp.format);
    setStartWithLorem(bp.startWithLorem);
    setSeed(Date.now());
  };

  // Pseudo-random deterministic generator based on seed
  const getRandomWord = useCallback((idx: number) => {
    const val = (idx * 9301 + 49297 + seed) % 233280;
    const wordIdx = Math.floor((val / 233280) * LOREM_WORDS.length);
    return LOREM_WORDS[wordIdx];
  }, [seed]);

  const generatedText = useMemo(() => {
    // 1. Words mode
    if (unit === "words") {
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithLorem) {
          words.push("Lorem");
        } else if (i === 1 && startWithLorem) {
          words.push("ipsum");
        } else {
          words.push(getRandomWord(i));
        }
      }

      if (format === "html") {
        return `<p>${words.join(" ")}</p>`;
      }
      if (format === "markdown") {
        return `_${words.join(" ")}_`;
      }
      if (format === "json") {
        return JSON.stringify(words, null, 2);
      }
      return words.join(" ");
    }

    // 2. Sentences mode
    if (unit === "sentences") {
      const sentences: string[] = [];
      for (let s = 0; s < count; s++) {
        const sentenceWords: string[] = [];
        const length = (s % 4) + 8; // 8-11 words
        for (let w = 0; w < length; w++) {
          if (s === 0 && w === 0 && startWithLorem) {
            sentenceWords.push("Lorem");
          } else if (s === 0 && w === 1 && startWithLorem) {
            sentenceWords.push("ipsum");
          } else {
            sentenceWords.push(getRandomWord(s * 15 + w));
          }
        }
        let sent = sentenceWords.join(" ");
        sent = sent.charAt(0).toUpperCase() + sent.slice(1) + ".";
        sentences.push(sent);
      }

      if (format === "html") {
        return sentences.map((s) => `<p>${s}</p>`).join("\n");
      }
      if (format === "markdown") {
        return sentences.join("\n\n");
      }
      if (format === "json") {
        return JSON.stringify(sentences, null, 2);
      }
      return sentences.join(" ");
    }

    // 3. Bullet Points mode
    if (unit === "bullets") {
      const bullets: string[] = [];
      for (let b = 0; b < count; b++) {
        const words: string[] = [];
        const length = (b % 3) + 6;
        for (let w = 0; w < length; w++) {
          words.push(getRandomWord(b * 12 + w));
        }
        let item = words.join(" ");
        item = item.charAt(0).toUpperCase() + item.slice(1);
        bullets.push(item);
      }

      if (format === "html") {
        return `<ul>\n${bullets.map((b) => `  <li>${b}</li>`).join("\n")}\n</ul>`;
      }
      if (format === "markdown") {
        return bullets.map((b) => `- ${b}`).join("\n");
      }
      if (format === "json") {
        return JSON.stringify(bullets, null, 2);
      }
      return bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
    }

    // 4. Paragraphs mode (Default)
    const paragraphs: string[] = [];
    for (let p = 0; p < count; p++) {
      const sentences: string[] = [];
      const sentenceCount = 4;
      for (let s = 0; s < sentenceCount; s++) {
        const sentenceWords: string[] = [];
        const length = (s % 5) + 7;
        for (let w = 0; w < length; w++) {
          if (p === 0 && s === 0 && w === 0 && startWithLorem) {
            sentenceWords.push("Lorem");
          } else if (p === 0 && s === 0 && w === 1 && startWithLorem) {
            sentenceWords.push("ipsum");
          } else if (p === 0 && s === 0 && w === 2 && startWithLorem) {
            sentenceWords.push("dolor");
          } else if (p === 0 && s === 0 && w === 3 && startWithLorem) {
            sentenceWords.push("sit");
          } else if (p === 0 && s === 0 && w === 4 && startWithLorem) {
            sentenceWords.push("amet");
          } else {
            sentenceWords.push(getRandomWord(p * 50 + s * 10 + w));
          }
        }
        let sent = sentenceWords.join(" ");
        sent = sent.charAt(0).toUpperCase() + sent.slice(1) + ".";
        sentences.push(sent);
      }
      paragraphs.push(sentences.join(" "));
    }

    if (format === "html") {
      return paragraphs.map((p) => `<p>${p}</p>`).join("\n\n");
    }
    if (format === "markdown") {
      return paragraphs.join("\n\n");
    }
    if (format === "json") {
      return JSON.stringify(paragraphs, null, 2);
    }
    return paragraphs.join("\n\n");
  }, [count, unit, format, startWithLorem, getRandomWord]);

  // Live text metrics
  const metrics = useMemo(() => {
    const raw = generatedText.replace(/<[^>]*>/g, "").replace(/[#*_`]/g, "");
    const words = raw.trim().split(/\s+/).filter(Boolean).length;
    const chars = generatedText.length;
    const readingTimeSec = Math.max(1, Math.round((words / 200) * 60));
    return {
      words,
      chars,
      readingTime: readingTimeSec < 60 ? `${readingTimeSec}s read` : `${Math.ceil(readingTimeSec / 60)}m read`,
      lines: generatedText.split("\n").length
    };
  }, [generatedText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === "html" ? "html" : format === "json" ? "json" : format === "markdown" ? "md" : "txt";
    const mime = format === "html" ? "text/html" : format === "json" ? "application/json" : "text/plain";
    const blob = new Blob([generatedText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lorem-ipsum-${unit}-${count}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. CURATED BLUEPRINTS (Spacious 3-Column Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                Instant Placeholder Blueprints
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                1-click calibrated layouts for websites, app cards, blog posts, and documentation
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/25 uppercase tracking-wider">
            6 Ready Blueprints
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {LOREM_BLUEPRINTS.map((bp) => {
            const isActive = activeBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => applyBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden",
                  isActive
                    ? "bg-lime-500/15 border-lime-400/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-400/30"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/40 hover:bg-white/[0.04]"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white group-hover:text-lime-300 transition-colors">
                      {bp.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 whitespace-nowrap shrink-0 group-hover:border-lime-500/30 group-hover:text-lime-300">
                      {bp.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-3 mt-3 border-t border-white/5">
                  <span className="text-lime-400 font-bold uppercase tracking-wider">
                    {bp.count} {bp.unit}
                  </span>
                  <span className="text-zinc-400 uppercase font-semibold">
                    {bp.format} format
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DUAL-PANE GENERATOR STUDIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fine-Tuning Controls */}
        <div className="lg:col-span-5 space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
                <Sliders size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">
                  Content Settings
                </h4>
                <p className="text-[10px] text-zinc-400 font-medium">Customize quantity & format</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSeed(Date.now())}
              className="p-2 rounded-xl bg-white/5 hover:bg-lime-500/20 text-zinc-400 hover:text-lime-300 border border-white/10 hover:border-lime-500/30 transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
              title="Re-shuffle words"
            >
              <RefreshCw size={12} />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Unit Type Segmented Control */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Unit Type</span>
              <span className="text-[10px] font-mono text-lime-400 capitalize">{unit}</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
              {(["paragraphs", "sentences", "words", "bullets"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => { setUnit(u); setActiveBlueprintId(""); }}
                  className={cn(
                    "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-center cursor-pointer",
                    unit === u
                      ? "bg-lime-500/20 border border-lime-400/40 text-lime-300 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-black uppercase tracking-wider text-zinc-300">
                Quantity Count
              </label>
              <span className="font-mono text-xs font-bold text-lime-400 bg-lime-500/10 px-2.5 py-0.5 rounded-lg border border-lime-500/25">
                {count} {unit}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={unit === "words" ? 250 : 25}
              value={count}
              onChange={(e) => { setCount(parseInt(e.target.value) || 1); setActiveBlueprintId(""); }}
              className="w-full accent-lime-400 cursor-pointer h-2 bg-black/60 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 px-1">
              <span>1</span>
              <span>{unit === "words" ? "125" : "12"}</span>
              <span>{unit === "words" ? "250" : "25"}</span>
            </div>
          </div>

          {/* Export Output Format */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Syntax Format</span>
              <span className="text-[10px] font-mono text-lime-400 uppercase">{format}</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
              {(["plain", "html", "markdown", "json"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => { setFormat(fmt); setActiveBlueprintId(""); }}
                  className={cn(
                    "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-center cursor-pointer",
                    format === fmt
                      ? "bg-lime-500/20 border border-lime-400/40 text-lime-300 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Classic Opening Checkbox */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="flex items-center gap-3 text-xs text-zinc-300 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => { setStartWithLorem(e.target.checked); setActiveBlueprintId(""); }}
                className="w-4 h-4 rounded accent-lime-400 cursor-pointer"
              />
              <span>Start with classic "Lorem ipsum dolor sit amet..."</span>
            </label>
          </div>
        </div>

        {/* Right Column: Output Preview & Live Actions */}
        <div className="lg:col-span-7 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between min-h-[460px]">
          <div className="space-y-3">
            {/* Header & Live Metrics Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  Generated Placeholder Content
                </span>
              </div>

              {/* Metrics Pill Grid */}
              <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                  <strong className="text-lime-400">{metrics.words}</strong> words
                </span>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                  <strong className="text-zinc-200">{metrics.chars}</strong> chars
                </span>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-emerald-400 font-bold">
                  {metrics.readingTime}
                </span>
              </div>
            </div>

            {/* Generated Code/Text Stage */}
            <pre className="w-full min-h-[300px] max-h-[420px] rounded-2xl border border-white/10 bg-black/80 p-5 font-mono text-xs text-zinc-200 overflow-y-auto leading-relaxed whitespace-pre-wrap selection:bg-lime-500/30 selection:text-lime-200 custom-scrollbar shadow-inner">
              {generatedText}
            </pre>
          </div>

          {/* Action Center Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={handleCopy}
              className="py-3.5 px-4 rounded-2xl bg-lime-500 hover:bg-lime-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(132,204,22,0.25)] hover:scale-[1.01] active:scale-[0.99]"
            >
              {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Generated Text"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              <span>Download File ({format === "html" ? ".html" : format === "json" ? ".json" : ".txt"})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="Lorem Ipsum Generator"
        title="Generated Placeholder Text"
        content={generatedText}
        downloadAction={handleDownload}
        onCopy={handleCopy}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="lorem-ipsum-generator" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="lorem-ipsum-generator" />
    </div>
  );
}
