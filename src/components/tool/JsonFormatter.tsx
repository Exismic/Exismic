"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Braces, 
  Copy, 
  Check, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Download,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [stats, setStats] = useState({ lines: 0, size: "0 B" });

  const validateAndProcess = useCallback((mode: "format" | "minify") => {
    if (!input.trim()) {
      setError(null);
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const processed = mode === "format" 
        ? JSON.stringify(parsed, null, 2) 
        : JSON.stringify(parsed);
      
      setOutput(processed);
      setError(null);

      // Update stats
      const lines = processed.split("\n").length;
      const size = new Blob([processed]).size;
      setStats({ 
        lines, 
        size: size > 1024 ? `${(size / 1024).toFixed(2)} KB` : `${size} B` 
      });
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  }, [input]);

  // Real-time validation
  useEffect(() => {
    if (!input.trim()) {
      setError(null);
      return;
    }
    try {
      JSON.parse(input);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [input]);

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
    setStats({ lines: 0, size: "0 B" });
  };

  // Simple Highlighting Logic for Display
  const highlightJson = (json: string) => {
    if (!json) return null;
    return json.split("\n").map((line, i) => {
      // Very basic tokenization for color
      const coloredLine = line.replace(/(".*?")(\s*:)/g, '<span class="text-accent-blue">$1</span>$2')
                             .replace(/:(\s*)(".*?")/g, ':$1<span class="text-emerald-400">$2</span>')
                             .replace(/:(\s*)(true|false|null)/g, ':$1<span class="text-accent-purple font-bold">$2</span>')
                             .replace(/:(\s*)(\d+)/g, ':$1<span class="text-orange-400">$2</span>');
      
      return (
        <div key={i} className="flex gap-4 group">
          <span className="w-8 text-right text-zinc-700 font-mono text-[10px] select-none">{i + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: coloredLine }} className="font-mono text-xs text-zinc-300 break-all" />
        </div>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* 1. EDITOR ACTION BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl glass-dark border border-white/5">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple">
               <Braces size={20} />
            </div>
            <div>
               <h3 className="text-xs font-black text-white uppercase tracking-widest">JSON Workbench</h3>
               <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Instant formatting & validation</p>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={() => validateAndProcess("format")}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-300 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
            >
               Pretty Print
            </button>
            <button 
              onClick={() => validateAndProcess("minify")}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-300 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
            >
               Minify JSON
            </button>
            <button 
              onClick={clearAll}
              className="p-3 rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all"
            >
               <Trash2 size={18} />
            </button>
         </div>
      </div>

      {/* 2. SPLIT VIEW EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
         {/* Input Panel */}
         <div className="flex flex-col rounded-[2.5rem] glass-dark border border-white/5 overflow-hidden group">
            <div className="px-8 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Maximize2 size={12} />
                  Raw Input
               </span>
               <AnimatePresence>
                 {error && (
                   <motion.span 
                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                     className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2"
                   >
                      <AlertCircle size={14} />
                      Invalid Structure
                   </motion.span>
                 )}
               </AnimatePresence>
            </div>
            <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               className={cn(
                 "flex-1 w-full bg-transparent p-8 font-mono text-xs focus:outline-none resize-none transition-all custom-scrollbar",
                 error ? "text-red-400/80" : "text-zinc-300 placeholder:text-zinc-800"
               )}
               placeholder='{ "key": "Paste your JSON here..." }'
            />
            {error && (
              <div className="p-4 bg-red-400/5 text-[10px] font-mono text-red-400/80 px-8 border-t border-red-400/10">
                 Error: {error}
              </div>
            )}
         </div>

         {/* Output Panel */}
         <div className="flex flex-col rounded-[2.5rem] glass-dark border border-white/5 overflow-hidden relative">
            <div className="px-8 py-4 bg-accent-purple/5 border-b border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-bold text-accent-purple uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Formatted Result
               </span>
               <div className="flex items-center gap-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                  <span>{stats.lines} Lines</span>
                  <span>{stats.size}</span>
               </div>
            </div>
            
            <div className="flex-1 w-full p-8 overflow-y-auto custom-scrollbar bg-black/20">
               {output ? highlightJson(output) : (
                 <div className="h-full flex items-center justify-center text-zinc-800 font-mono text-[10px] uppercase tracking-[0.3em]">
                    Waiting for input
                 </div>
               )}
            </div>

            {/* Action Overlay */}
            <div className="absolute bottom-8 right-8 flex gap-3">
               <button 
                 onClick={downloadJson}
                 disabled={!output}
                 className="p-4 rounded-2xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-xl disabled:opacity-30 border border-white/5"
               >
                  <Download size={20} />
               </button>
               <button 
                 onClick={copyToClipboard}
                 disabled={!output}
                 className={cn(
                   "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl border",
                   isCopied ? "bg-emerald-500 border-emerald-400 text-white" : "bg-white border-white text-black hover:bg-zinc-200 disabled:opacity-30"
                 )}
               >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  {isCopied ? "Copied" : "Copy All"}
               </button>
            </div>
         </div>
      </div>

      {/* 3. PRO TIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 rounded-[2.5rem] bg-linear-to-r from-accent-purple/5 to-transparent border border-white/5 flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-accent-purple/10 text-accent-purple">
               <Zap size={24} />
            </div>
            <div className="space-y-2">
               <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Developer Insight</h4>
               <p className="text-zinc-500 text-sm leading-relaxed">
                  Use **Minify** for production environment variables and database entries to save bandwidth. Our engine ensures zero data loss during compression.
               </p>
            </div>
         </div>

         <div className="p-8 rounded-[2.5rem] bg-linear-to-r from-accent-blue/5 to-transparent border border-white/5 flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-accent-blue/10 text-accent-blue">
               <FileCode size={24} />
            </div>
            <div className="space-y-2">
               <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Auto-Discovery</h4>
               <p className="text-zinc-500 text-sm leading-relaxed">
                  The **Validation Engine** runs in the background. If you see red text in the input area, there's a syntax error that will prevent formatting.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
