"use client";

import React, { useState } from "react";
import { 
  Binary, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeftRight,
  FileCode
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Base64Encoder() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const output = React.useMemo(() => {
    if (!input) return "";
    try {
      if (mode === "encode") {
        return btoa(unescape(encodeURIComponent(input)));
      } else {
        return decodeURIComponent(escape(atob(input.trim())));
      }
    } catch {
      return mode === "decode" ? "[Invalid Base64 Input String]" : "";
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 p-1 rounded-xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setMode("encode")}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer", mode === "encode" ? "bg-lime-500 text-black shadow-lg" : "text-zinc-400")}
              >
                Encode
              </button>
              <button
                type="button"
                onClick={() => setMode("decode")}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer", mode === "decode" ? "bg-lime-500 text-black shadow-lg" : "text-zinc-400")}
              >
                Decode
              </button>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{input.length} chars</span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Paste text string to encode to Base64..." : "Paste Base64 string to decode..."}
            className="w-full flex-1 min-h-[260px] rounded-2xl border border-white/10 bg-black/50 p-4 text-xs font-mono text-lime-300 placeholder-zinc-600 focus:border-lime-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <FileCode size={15} className="text-lime-400" />
            {mode === "encode" ? "Base64 Encoded Output" : "Decoded Text Output"}
          </label>

          <pre className="w-full flex-1 min-h-[260px] rounded-2xl border border-white/10 bg-black/80 p-4 text-xs font-mono text-white overflow-y-auto leading-relaxed whitespace-pre-wrap break-all">
            {output || <span className="text-zinc-600 font-sans italic">Output will appear here live...</span>}
          </pre>

          {output && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? "Copied Output!" : "Copy Result"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
