"use client";

import React, { useState } from "react";
import { 
  Key, 
  Copy, 
  CheckCircle2, 
  Check,
  RefreshCw, 
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UuidGenerator() {
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateUuids = React.useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID();
      if (!hyphens) id = id.replace(/-/g, "");
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setUuids(list);
  }, [count, uppercase, hyphens]);

  React.useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
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
              <Key size={14} className="text-lime-400" />
              <span>Developer Utilities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              UUID / GUID Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate bulk RFC 4122 Version-4 UUIDs for database primary keys, API tokens, and seed scripts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Quantity ({count})
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-lime-400 cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Formatting Toggles</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHyphens(!hyphens)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 text-left cursor-pointer group select-none",
                  hyphens
                    ? "bg-lime-500/10 border-lime-500/40 text-white shadow-[0_0_15px_rgba(163,230,53,0.12)]"
                    : "bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-300",
                  hyphens
                    ? "bg-gradient-to-br from-lime-400 to-emerald-500 border-lime-300 text-black shadow-[0_0_10px_rgba(163,230,53,0.5)] scale-105"
                    : "bg-neutral-900 border-neutral-700 text-transparent group-hover:border-neutral-600"
                )}>
                  <Check size={12} strokeWidth={3} className={cn("transition-transform duration-200", hyphens ? "scale-100" : "scale-0")} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold block leading-tight">Include Hyphens</span>
                  <span className="text-[10px] text-neutral-500 font-medium block mt-0.5">8-4-4-4-12 standard</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUppercase(!uppercase)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 text-left cursor-pointer group select-none",
                  uppercase
                    ? "bg-lime-500/10 border-lime-500/40 text-white shadow-[0_0_15px_rgba(163,230,53,0.12)]"
                    : "bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-300",
                  uppercase
                    ? "bg-gradient-to-br from-lime-400 to-emerald-500 border-lime-300 text-black shadow-[0_0_10px_rgba(163,230,53,0.5)] scale-105"
                    : "bg-neutral-900 border-neutral-700 text-transparent group-hover:border-neutral-600"
                )}>
                  <Check size={12} strokeWidth={3} className={cn("transition-transform duration-200", uppercase ? "scale-100" : "scale-0")} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold block leading-tight">UPPERCASE</span>
                  <span className="text-[10px] text-neutral-500 font-medium block mt-0.5">Capitalize hex characters</span>
                </div>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={generateUuids}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Generate New Batch</span>
          </button>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Generated UUIDs</span>
            <span className="text-xs font-mono font-bold text-lime-400">{uuids.length} Generated</span>
          </div>

          <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/80 p-4 font-mono text-xs text-lime-300 overflow-y-auto space-y-2 leading-relaxed">
            {uuids.map((id, i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-lime-500/40 transition-all">
                <span>{id}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopyAll}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Copied All UUIDs!" : "Copy All UUIDs"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
