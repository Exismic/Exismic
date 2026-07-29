"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Copy, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "ut",
  "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris",
  "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor",
  "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat",
  "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
  "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

export default function LoremIpsumGenerator() {
  const [count, setCount] = useState<number>(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [htmlFormat, setHtmlFormat] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const generatedText = React.useMemo(() => {
    if (unit === "words") {
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(LOREM_WORDS[i % LOREM_WORDS.length]);
      }
      const raw = words.join(" ");
      return htmlFormat ? `<p>${raw}</p>` : raw;
    }

    if (unit === "sentences") {
      const sentences: string[] = [];
      for (let s = 0; s < count; s++) {
        const sentenceWords = [];
        const length = Math.floor(Math.random() * 8) + 6;
        for (let w = 0; w < length; w++) {
          sentenceWords.push(LOREM_WORDS[(s * 7 + w) % LOREM_WORDS.length]);
        }
        let sent = sentenceWords.join(" ");
        sent = sent.charAt(0).toUpperCase() + sent.slice(1) + ".";
        sentences.push(sent);
      }
      const raw = sentences.join(" ");
      return htmlFormat ? `<p>${raw}</p>` : raw;
    }

    // Paragraphs
    const paragraphs: string[] = [];
    for (let p = 0; p < count; p++) {
      const sentences: string[] = [];
      for (let s = 0; s < 4; s++) {
        const sentenceWords = [];
        const length = Math.floor(Math.random() * 8) + 6;
        for (let w = 0; w < length; w++) {
          sentenceWords.push(LOREM_WORDS[(p * 20 + s * 5 + w) % LOREM_WORDS.length]);
        }
        let sent = sentenceWords.join(" ");
        sent = sent.charAt(0).toUpperCase() + sent.slice(1) + ".";
        sentences.push(sent);
      }
      paragraphs.push(sentences.join(" "));
    }

    if (htmlFormat) {
      return paragraphs.map((p) => `<p>${p}</p>`).join("\n\n");
    }
    return paragraphs.join("\n\n");
  }, [count, unit, htmlFormat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-lime-500/20 bg-gradient-to-br from-lime-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-300 text-xs font-black uppercase tracking-wider">
              <FileText size={14} className="text-lime-400" />
              <span>Design & Copy Utilities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Lorem Ipsum Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate dummy placeholder text in paragraphs, sentences, or words with optional HTML tag formatting.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Quantity ({count})
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-bold text-white focus:border-lime-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Unit Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["paragraphs", "sentences", "words"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={cn("py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border text-center capitalize cursor-pointer", unit === u ? "bg-lime-500/20 border-lime-400 text-lime-300" : "bg-white/[0.03] border-white/10 text-zinc-400")}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 text-xs text-zinc-300 font-bold cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={htmlFormat}
              onChange={(e) => setHtmlFormat(e.target.checked)}
              className="rounded accent-lime-400"
            />
            Wrap in HTML &lt;p&gt; tags
          </label>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300">Generated Text</label>

          <pre className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/80 p-4 font-sans text-xs text-zinc-200 overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {generatedText}
          </pre>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Copied Text!" : "Copy Lorem Ipsum"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
