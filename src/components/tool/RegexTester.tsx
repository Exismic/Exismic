"use client";

import React, { useState, useMemo } from "react";
import { 
  Terminal, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegexTester() {
  const [pattern, setPattern] = useState<string>("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
  const [flags, setFlags] = useState<string>("gi");
  const [testText, setTestText] = useState<string>("Contact us at support@exismic.com or sales@domain.org for inquiries.");

  const evaluation = useMemo(() => {
    if (!pattern) return { matches: [], isValid: true, error: null };
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { text: string; index: number }[] = [];
      let match;

      if (flags.includes("g")) {
        while ((match = regex.exec(testText)) !== null) {
          matches.push({ text: match[0], index: match.index });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testText);
        if (match) matches.push({ text: match[0], index: match.index });
      }

      return { matches, isValid: true, error: null };
    } catch (e: any) {
      return { matches: [], isValid: false, error: e.message };
    }
  }, [pattern, flags, testText]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-lime-500/20 bg-gradient-to-br from-lime-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-300 text-xs font-black uppercase tracking-wider">
              <Terminal size={14} className="text-lime-400" />
              <span>Regex Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Regex Tester & Debugger
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Test and evaluate JavaScript regular expression patterns in real-time with match count and syntax validation.
            </p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3 space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Regular Expression Pattern
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="enter pattern..."
                className="w-full rounded-2xl border border-white/10 bg-black/50 pl-8 pr-12 py-3.5 text-xs font-mono text-lime-300 focus:border-lime-500 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">/{flags}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Regex Flags
            </label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="g, i, m"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-xs font-mono text-white focus:border-lime-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Test Text */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
            Test String Content
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to evaluate regex matches against..."
            className="w-full min-h-[160px] rounded-2xl border border-white/10 bg-black/50 p-4 text-xs font-mono text-zinc-200 focus:border-lime-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Results */}
        <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Regex Evaluation Results
            </span>
            {evaluation.isValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Check size={12} /> {evaluation.matches.length} Matches Found
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                <AlertTriangle size={12} /> Syntax Error
              </span>
            )}
          </div>

          {!evaluation.isValid && (
            <p className="text-xs font-mono text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{evaluation.error}</p>
          )}

          {evaluation.isValid && evaluation.matches.length > 0 && (
            <div className="space-y-2">
              {evaluation.matches.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-xs">
                  <span className="text-lime-300 font-bold">{m.text}</span>
                  <span className="text-zinc-500 text-[10px]">Index: {m.index}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
