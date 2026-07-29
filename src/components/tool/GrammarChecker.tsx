"use client";

import React, { useState } from "react";
import { 
  CheckCheck, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Check, 
  AlertCircle,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";

interface Correction {
  original: string;
  suggestion: string;
  type: "spelling" | "grammar" | "style";
  reason: string;
}

export default function GrammarChecker() {
  const [inputText, setInputText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [copied, setCopied] = useState(false);

  const handleCheck = async () => {
    if (!inputText.trim()) return;
    setIsChecking(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Check and fix all grammar, spelling, punctuation, and style flaws in the following text. Return the corrected version:\n\n${inputText}`,
          toolId: "grammar-checker",
          systemInstruction: "You are a professional proofreader and editor. Fix errors silently and deliver clear, error-free prose."
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        setCorrectedText(data.output || data.text);
      } else {
        setCorrectedText(inputText.replace(/\bteh\b/g, "the").replace(/\bi\b/g, "I"));
      }
    } catch {
      setCorrectedText(inputText.replace(/\bteh\b/g, "the"));
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopy = () => {
    if (!correctedText) return;
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <CheckCheck size={14} className="text-emerald-400" />
              <span>AI Proofreader</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Grammar & Style Checker
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Instantly fix spelling mistakes, grammatical errors, and awkward phrasing with real-time AI suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <FileText size={15} className="text-emerald-400" />
              Original Draft
            </label>
            <span className="text-[10px] font-mono text-zinc-500">{inputText.length} chars</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste your document text here to check grammar..."
            className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans leading-relaxed resize-none"
          />

          <button
            type="button"
            onClick={handleCheck}
            disabled={!inputText.trim() || isChecking}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isChecking ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Checking Grammar & Style...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Check & Correct Text</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Corrected Text
            </label>
          </div>

          <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 font-sans leading-relaxed relative overflow-y-auto">
            {correctedText ? (
              <p className="whitespace-pre-wrap">{correctedText}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                <CheckCheck size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Click "Check & Correct Text" to highlight and fix errors.</p>
              </div>
            )}
          </div>

          {correctedText && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? "Copied!" : "Copy Corrected Text"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Smart Workflow Tool Recommendations */}
      <ToolSuggestions currentToolId="grammar-checker" categoryId="ai" />
    </div>
  );
}
