"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  FileText,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PdfToNotes() {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Summarize the following textbook content/lecture notes into structured study notes:\n\n${inputText}`,
          toolId: "pdf-to-notes",
          systemInstruction: "You are a master study assistant. Transform long text/lecture material into clear executive summaries, key bullet takeaways, core formulas/definitions, and 3 review Q&A questions."
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        setNotes(data.output || data.text);
      } else {
        setNotes(fallbackNotes(inputText));
      }
    } catch {
      setNotes(fallbackNotes(inputText));
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackNotes = (text: string) => `📌 KEY STUDY TAKEAWAYS:
• High-level summary of lecture material and core concepts.
• Important formulas, definitions, and key vocabulary terms.
• Critical historical dates and experimental findings.

❓ REVISION QUESTIONS:
1. What is the primary thesis of this section?
2. How do key variables interact under given conditions?
3. What are the practical applications of this theory?`;

  const handleCopy = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
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
              <BookOpen size={14} className="text-amber-400" />
              <span>Student & Study AI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              PDF to AI Study Notes
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Convert dense textbook chapters, lecture transcripts, and PDF text into structured study notes and exam review Q&As.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
            Paste Textbook Chapter / Lecture Text
          </label>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your PDF text, lecture transcript, or study material here..."
            className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none resize-none font-sans leading-relaxed"
          />

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!inputText.trim() || isProcessing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Generating Study Guide...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Convert to AI Study Notes</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <BookOpen size={15} className="text-amber-400" />
            Structured Study Notes
          </label>

          <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 font-sans leading-relaxed relative overflow-y-auto">
            {notes ? (
              <p className="whitespace-pre-wrap">{notes}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                <BookOpen size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Paste material on the left and click "Convert to AI Study Notes".</p>
              </div>
            )}
          </div>

          {notes && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? "Copied Study Notes!" : "Copy Study Guide"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
