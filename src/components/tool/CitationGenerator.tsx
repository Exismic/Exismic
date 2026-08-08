"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Copy, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  Layers,
  Globe,
  Book,
  FileCode,
  Check,
  Zap,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";

type Style = "apa" | "mla" | "chicago" | "harvard";
type SourceType = "journal" | "book" | "website" | "article";

interface SamplePreset {
  name: string;
  sourceType: SourceType;
  author: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
}

const PRESETS: SamplePreset[] = [
  {
    name: "AI Journal Paper",
    sourceType: "journal",
    author: "Smith, John & Johnson, Sarah",
    title: "Artificial Intelligence in Modern Educational Ecosystems",
    publisher: "Journal of Educational Technology & AI",
    year: "2025",
    volume: "14",
    issue: "2",
    pages: "105-122",
    doi: "10.1016/j.jedtech.2025.04.012",
    url: "https://doi.org/10.1016/j.jedtech.2025.04.012"
  },
  {
    name: "Quantum Computing Book",
    sourceType: "book",
    author: "Nielsen, Michael & Chuang, Isaac",
    title: "Quantum Computation and Quantum Information Systems",
    publisher: "Cambridge University Press",
    year: "2024",
    url: "https://www.cambridge.org/quantum-computing"
  },
  {
    name: "Tech News Article",
    sourceType: "website",
    author: "Vaswani, Ashish",
    title: "Understanding Transformer Networks and Attention Mechanisms",
    publisher: "Deep Learning Insights",
    year: "2025",
    url: "https://example.org/transformers-explained"
  }
];

export default function CitationGenerator() {
  const [style, setStyle] = useState<Style>("apa");
  const [sourceType, setSourceType] = useState<SourceType>("journal");
  const [author, setAuthor] = useState("Smith, John");
  const [title, setTitle] = useState("Artificial Intelligence in Modern Education");
  const [publisher, setPublisher] = useState("Academic Press");
  const [year, setYear] = useState("2025");
  const [volume, setVolume] = useState("14");
  const [issue, setIssue] = useState("2");
  const [pages, setPages] = useState("105-122");
  const [url, setUrl] = useState("https://example.org/ai-education");
  const [doi, setDoi] = useState("10.1016/j.jedtech.2025.04.012");
  
  const [copyState, setCopyState] = useState<"full" | "intext" | "bibtex" | null>(null);
  const [outputFormat, setOutputFormat] = useState<"plain" | "html" | "bibtex">("plain");

  // Formatted Citation Logic
  const { fullCitation, inTextCitation, bibtexCitation } = useMemo(() => {
    const a = author.trim() || "Author";
    const t = title.trim() || "Untitled Source";
    const p = publisher.trim() || "Publisher";
    const y = year.trim() || "2026";
    const u = url.trim();
    const d = doi.trim();
    const vol = volume.trim();
    const iss = issue.trim();
    const pg = pages.trim();

    // Primary Author Last Name for In-Text
    const lastName = a.split(",")[0]?.trim() || a.split(" ")[0] || "Author";

    let full = "";
    let inText = `(${lastName}, ${y})`;

    if (style === "apa") {
      inText = `(${lastName}, ${y})`;
      const volIss = vol ? ` ${vol}${iss ? `(${iss})` : ""}` : "";
      const pgStr = pg ? `, ${pg}` : "";
      const link = d ? `https://doi.org/${d}` : u;
      full = `${a} (${y}). ${t}. ${p}${volIss}${pgStr}.${link ? ` ${link}` : ""}`;
    } else if (style === "mla") {
      inText = `(${lastName}${pg ? ` ${pg}` : ""})`;
      const volStr = vol ? `, vol. ${vol}` : "";
      const issStr = iss ? `, no. ${iss}` : "";
      const pgStr = pg ? `, pp. ${pg}` : "";
      const link = d ? ` https://doi.org/${d}.` : u ? ` ${u}.` : "";
      full = `${a}. "${t}." ${p}${volStr}${issStr}, ${y}${pgStr}.${link}`;
    } else if (style === "chicago") {
      inText = `(${lastName} ${y})`;
      const volIss = vol ? ` ${vol}${iss ? `, no. ${iss}` : ""}` : "";
      const pgStr = pg ? `: ${pg}` : "";
      const link = d ? ` https://doi.org/${d}.` : u ? ` ${u}.` : "";
      full = `${a}. ${y}. "${t}." ${p}${volIss}${pgStr}.${link}`;
    } else {
      // Harvard
      inText = `(${lastName}, ${y})`;
      const volIss = vol ? ` ${vol}${iss ? `(${iss})` : ""}` : "";
      const pgStr = pg ? `, pp.${pg}` : "";
      const link = d ? ` Available at: https://doi.org/${d}` : u ? ` Available at: ${u}` : "";
      full = `${a} (${y}) '${t}', ${p}${volIss}${pgStr}.${link}`;
    }

    // BibTeX format construction
    const citationKey = `${lastName.toLowerCase().replace(/[^a-z]/g, "")}${y}`;
    const bibtex = `@article{${citationKey},\n  author = {${a}},\n  title = {${t}},\n  journal = {${p}},\n  year = {${y}},\n  volume = {${vol}},\n  number = {${iss}},\n  pages = {${pg}},\n  url = {${u || (d ? `https://doi.org/${d}` : "")}}\n}`;

    return { fullCitation: full, inTextCitation: inText, bibtexCitation: bibtex };
  }, [style, author, title, publisher, year, volume, issue, pages, url, doi]);

  const loadPreset = (preset: SamplePreset) => {
    setSourceType(preset.sourceType);
    setAuthor(preset.author);
    setTitle(preset.title);
    setPublisher(preset.publisher);
    setYear(preset.year);
    setVolume(preset.volume || "");
    setIssue(preset.issue || "");
    setPages(preset.pages || "");
    setDoi(preset.doi || "");
    setUrl(preset.url || "");
  };

  const copyToClipboard = (text: string, type: "full" | "intext" | "bibtex") => {
    navigator.clipboard.writeText(text);
    setCopyState(type);
    setTimeout(() => setCopyState(null), 2000);
  };

  const displayOutput = useMemo(() => {
    if (outputFormat === "bibtex") return bibtexCitation;
    if (outputFormat === "html") {
      return `${author} (${year}). <i>${title}</i>. ${publisher}. ${url}`;
    }
    return fullCitation;
  }, [outputFormat, fullCitation, bibtexCitation, author, year, title, publisher, url]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-zinc-950 to-indigo-950/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest shadow-inner">
              <BookOpen size={14} className="text-amber-400" />
              <span>Academic Writing Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase bg-gradient-to-r from-white via-amber-100 to-zinc-400 bg-clip-text text-transparent">
              Academic Citation Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate flawless APA 7, MLA 9, Chicago 17th, and Harvard style reference entries & in-text citations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-2xl p-2.5 backdrop-blur-md">
            {(["apa", "mla", "chicago", "harvard"] as Style[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                  style === s 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105 font-bold" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preset Quick Load Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" /> Quick Samples:
        </span>
        {PRESETS.map((preset) => (
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            
            {/* Source Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Layers size={15} /> Source Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "journal", label: "Journal", icon: FileText },
                  { id: "book", label: "Book", icon: Book },
                  { id: "website", label: "Website", icon: Globe },
                  { id: "article", label: "Article", icon: FileCode },
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSourceType(st.id as SourceType)}
                      className={cn(
                        "py-3 px-2 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center gap-1.5",
                        sourceType === st.id
                          ? "bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-md"
                          : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/5"
                      )}
                    >
                      <Icon size={16} />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Author Name(s) *</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Smith, John or Johnson, Sarah & Davis, Robert"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Title of Work *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Artificial Intelligence in Modern Education"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Publisher / Journal Name</label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="e.g. Academic Press or Journal of AI Studies"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all font-medium"
                />
              </div>

              {/* Grid 2-cols */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Year *</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2025"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-3.5 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-all font-medium text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Volume</label>
                  <input
                    type="text"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="14"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-3.5 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-all font-medium text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Issue</label>
                  <input
                    type="text"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="2"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-3.5 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-all font-medium text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Pages</label>
                  <input
                    type="text"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="105-122"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-3.5 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-all font-medium text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">DOI (Digital Object Identifier)</label>
                  <input
                    type="text"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="10.1016/j.jedtech.2025..."
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">URL Link</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.org/ai-education"
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Output Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 sm:p-8 pt-8 sm:pt-9 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6 min-h-[440px]">
            
            {/* Header / Format Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    {style.toUpperCase()} Reference
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium pt-0.5">Formatted Reference Entry</p>
              </div>

              {/* Format Toggle */}
              <div className="flex items-center bg-black/80 border border-white/10 rounded-xl p-1 text-[11px] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setOutputFormat("plain")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                    outputFormat === "plain" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-zinc-400 hover:text-white"
                  )}
                >
                  Plain
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat("html")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                    outputFormat === "html" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-zinc-400 hover:text-white"
                  )}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat("bibtex")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                    outputFormat === "bibtex" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-zinc-400 hover:text-white"
                  )}
                >
                  BibTeX
                </button>
              </div>
            </div>

            {/* Main Formatted Citation Box */}
            <div className="relative rounded-2xl border border-amber-500/30 bg-black/80 p-5 space-y-3 shadow-inner">
              <pre className="text-xs font-mono text-amber-300 overflow-y-auto leading-relaxed whitespace-pre-wrap selection:bg-amber-400 selection:text-black">
                {displayOutput}
              </pre>
            </div>

            {/* In-Text Citation Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">In-Text Citation (Parenthetical):</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inTextCitation, "intext")}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copyState === "intext" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copyState === "intext" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-sm font-mono text-white font-bold bg-black/50 px-3.5 py-2 rounded-xl border border-white/5">
                {inTextCitation}
              </p>
            </div>

            {/* Action Copy Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => copyToClipboard(displayOutput, "full")}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copyState === "full" ? (
                  <>
                    <CheckCircle2 size={18} className="text-black" />
                    <span>Copied Full Reference!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Copy Full Reference Entry</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(bibtexCitation, "bibtex")}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copyState === "bibtex" ? <Check size={15} className="text-emerald-400" /> : <FileCode size={15} />}
                <span>{copyState === "bibtex" ? "Copied BibTeX!" : "Copy as BibTeX Entry"}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

