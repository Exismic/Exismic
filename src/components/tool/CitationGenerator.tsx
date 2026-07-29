"use client";

import React, { useState, useMemo } from "react";
import { 
  FileQuestion, 
  Copy, 
  CheckCircle2, 
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

type Style = "apa" | "mla" | "chicago" | "harvard";

export default function CitationGenerator() {
  const [style, setStyle] = useState<Style>("apa");
  const [author, setAuthor] = useState("Smith, John");
  const [title, setTitle] = useState("Artificial Intelligence in Modern Education");
  const [publisher, setPublisher] = useState("Academic Press");
  const [year, setYear] = useState("2025");
  const [url, setUrl] = useState("https://example.org/ai-education");
  const [copied, setCopied] = useState(false);

  const formattedCitation = useMemo(() => {
    const a = author.trim() || "Author";
    const t = title.trim() || "Untitled Source";
    const p = publisher.trim() || "Publisher";
    const y = year.trim() || "2026";
    const u = url.trim();

    if (style === "apa") {
      return `${a} (${y}). ${t}. ${p}.${u ? ` ${u}` : ""}`;
    }
    if (style === "mla") {
      return `${a}. "${t}." ${p}, ${y}.${u ? ` ${u}.` : ""}`;
    }
    if (style === "chicago") {
      return `${a}. ${y}. "${t}." ${p}.${u ? ` ${u}.` : ""}`;
    }
    return `${a} (${y}) ${t}. ${p}.${u ? ` Available at: ${u}` : ""}`;
  }, [style, author, title, publisher, year, url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <FileQuestion size={14} className="text-amber-400" />
              <span>Academic Writing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Academic Citation Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate formatted APA 7, MLA 9, Chicago, and Harvard references for research papers.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Citation Format Style</label>
            <div className="grid grid-cols-4 gap-2">
              {(["apa", "mla", "chicago", "harvard"] as Style[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border cursor-pointer",
                    style === s ? "bg-amber-500/20 border-amber-400 text-amber-300" : "bg-white/[0.03] border-white/10 text-zinc-400"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author (e.g. Smith, John)"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of Article / Book"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
            <input
              type="text"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="Publisher / Journal / Website Name"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year (e.g. 2025)"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL (Optional)"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <BookOpen size={15} className="text-amber-400" />
            Formatted {style.toUpperCase()} Citation
          </label>

          <pre className="w-full flex-1 min-h-[200px] rounded-2xl border border-white/10 bg-black/80 p-4 text-xs font-mono text-amber-300 overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {formattedCitation}
          </pre>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Copied Citation!" : "Copy Citation"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
