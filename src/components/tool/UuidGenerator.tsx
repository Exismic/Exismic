"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Key, 
  Copy, 
  CheckCircle2, 
  Check, 
  RefreshCw, 
  Download, 
  Tag, 
  Sliders, 
  FileCode,
  RotateCcw,
  Sparkles as SparklesProhibited
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// ============================================================================
// TYPES & BLUEPRINTS (Zero Tech Jargon, 100% Everyday English)
// ============================================================================

export interface UuidBlueprint {
  id: string;
  title: string;
  category: string;
  count: number;
  uppercase: boolean;
  hyphens: boolean;
  prefix?: string;
  format: "standard" | "json" | "sql";
  description: string;
}

export const UUID_BLUEPRINTS: UuidBlueprint[] = [
  {
    id: "standard-v4",
    title: "Standard RFC 4122 (v4)",
    category: "Standard",
    count: 5,
    uppercase: false,
    hyphens: true,
    format: "standard",
    description: "The universal 36-character hyphenated UUID standard (8-4-4-4-12)."
  },
  {
    id: "compact-hex",
    title: "Compact Hex (No Hyphens)",
    category: "No Hyphens",
    count: 5,
    uppercase: false,
    hyphens: false,
    format: "standard",
    description: "32-character solid hex string, ideal for MongoDB object IDs and Redis keys."
  },
  {
    id: "uppercase-guid",
    title: "Uppercase Microsoft GUID",
    category: "Windows / .NET",
    count: 5,
    uppercase: true,
    hyphens: true,
    format: "standard",
    description: "Capitalized GUID standard formatted for C#, .NET, and Windows Registry keys."
  },
  {
    id: "prefixed-entity",
    title: "Prefixed Entity Tokens",
    category: "Stripe-Style",
    count: 5,
    uppercase: false,
    hyphens: false,
    prefix: "usr_",
    format: "standard",
    description: "Modern API entity format like Stripe (e.g. usr_..., cus_..., inv_...)."
  },
  {
    id: "json-array",
    title: "Formatted JSON Array",
    category: "API Mock Data",
    count: 10,
    uppercase: false,
    hyphens: true,
    format: "json",
    description: "Pre-formatted JSON array ready to drop directly into API mock fixtures."
  },
  {
    id: "sql-seed",
    title: "SQL INSERT Values Seed",
    category: "Database Seed",
    count: 10,
    uppercase: false,
    hyphens: true,
    format: "sql",
    description: "SQL INSERT statement tuples formatted for database migrations and seed scripts."
  }
];

export default function UuidGenerator() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("standard-v4");
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [prefix, setPrefix] = useState<string>("");
  const [format, setFormat] = useState<"standard" | "json" | "sql">("standard");

  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate UUIDs
  const generateUuids = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID();
      if (!hyphens) id = id.replace(/-/g, "");
      if (uppercase) id = id.toUpperCase();
      if (prefix.trim()) id = `${prefix.trim()}${id}`;
      list.push(id);
    }
    setUuids(list);
  }, [count, uppercase, hyphens, prefix]);

  // Initial generation
  useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  // Load a Blueprint
  const handleSelectBlueprint = (bp: UuidBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setCount(bp.count);
    setUppercase(bp.uppercase);
    setHyphens(bp.hyphens);
    setPrefix(bp.prefix || "");
    setFormat(bp.format);
  };

  // Reset to Baseline
  const handleReset = () => {
    handleSelectBlueprint(UUID_BLUEPRINTS[0]);
  };

  // Output formatting
  const formattedOutput = useMemo(() => {
    if (format === "json") {
      return JSON.stringify(uuids, null, 2);
    }
    if (format === "sql") {
      return `INSERT INTO items (id)\nVALUES\n  ${uuids.map((id) => `('${id}')`).join(",\n  ")};`;
    }
    return uuids.join("\n");
  }, [uuids, format]);

  // Copy All
  const handleCopyAll = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Copy Single Item
  const handleCopySingle = (id: string, index: number) => {
    navigator.clipboard.writeText(id);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Download Output File
  const handleDownload = () => {
    const ext = format === "json" ? "json" : format === "sql" ? "sql" : "txt";
    const blob = new Blob([formattedOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${new Date().toISOString().split("T")[0]}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner / Quick Controls Bar */}
      <div className="rounded-3xl border border-lime-500/20 bg-gradient-to-b from-lime-500/5 to-transparent p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shrink-0">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>UUID & GUID Generator Studio</span>
                <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-500/10 border border-lime-500/20 px-2 py-0.5 rounded-full">
                  RFC 4122 v4 Cryptographic
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Bulk generate random unique identifiers for databases, APIs, and test mocks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset fields to baseline"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={generateUuids}
              className="px-4 py-2 rounded-2xl bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/40 text-xs font-bold text-lime-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-lime-500/10"
            >
              <RefreshCw size={14} className="text-lime-400" />
              <span>Generate New Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Curated Production Blueprints (Spacious 3-Column Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-lime-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Common Identification Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to pre-fill tested identifier formats
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {UUID_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-lime-500/15 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-300 border border-lime-500/20 whitespace-nowrap shrink-0">
                    {bp.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate text-right">
                    {bp.count} IDs ({bp.format})
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-lime-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5">
            {/* Quantity Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Batch Quantity ({count} IDs)
                </label>
                <span className="text-[11px] font-mono font-bold text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/20">
                  {count} Items
                </span>
              </div>

              {/* Quick Quantity Buttons */}
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 5, 10, 25, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => {
                      setCount(qty);
                      setSelectedBlueprintId("");
                    }}
                    className={cn(
                      "py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-center",
                      count === qty
                        ? "bg-lime-500 text-black border-lime-400 shadow-md shadow-lime-500/20"
                        : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    {qty}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="1"
                max="100"
                value={count}
                onChange={(e) => {
                  setCount(parseInt(e.target.value, 10));
                  setSelectedBlueprintId("");
                }}
                className="w-full h-2 rounded-lg bg-zinc-800 accent-lime-400 cursor-pointer mt-2"
              />
            </div>

            {/* Formatting Options */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                Formatting direct options
              </label>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setHyphens(!hyphens);
                    setSelectedBlueprintId("");
                  }}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer",
                    hyphens
                      ? "bg-lime-500/10 border-lime-500/40 text-white"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20"
                  )}
                >
                  <div>
                    <p className="text-xs font-bold">Include Hyphens (-)</p>
                    <p className="text-[10px] text-zinc-500">8-4-4-4-12 canonical format</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all",
                    hyphens ? "bg-lime-400 border-lime-300 text-black font-black" : "border-zinc-700 bg-zinc-900"
                  )}>
                    {hyphens && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUppercase(!uppercase);
                    setSelectedBlueprintId("");
                  }}
                  className={cn(
                    "w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer",
                    uppercase
                      ? "bg-lime-500/10 border-lime-500/40 text-white"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:border-white/20"
                  )}
                >
                  <div>
                    <p className="text-xs font-bold">UPPERCASE Letters</p>
                    <p className="text-[10px] text-zinc-500">Capitalized Microsoft GUID format</p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all",
                    uppercase ? "bg-lime-400 border-lime-300 text-black font-black" : "border-zinc-700 bg-zinc-900"
                  )}>
                    {uppercase && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              </div>

              {/* Custom Prefix Field */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-zinc-400">Custom Entity Prefix (Optional)</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => {
                    setPrefix(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  placeholder="e.g. usr_ or order_"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs font-mono text-lime-300 focus:border-lime-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              {/* Export Output Format Tabs */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                  Export Structure Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "standard", label: "Line-by-Line" },
                    { id: "json", label: "JSON Array" },
                    { id: "sql", label: "SQL INSERT" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormat(item.id as any)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer",
                        format === item.id
                          ? "bg-lime-500 text-black border-lime-400 font-black shadow-md shadow-lime-500/10"
                          : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output List & Copy Action (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-4 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <FileCode size={15} className="text-lime-400" />
                  <span>Generated Identifiers ({uuids.length})</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download size={13} className="text-lime-400" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Format-Aware Output Surface */}
              {format === "standard" ? (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {uuids.map((id, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 group hover:border-lime-500/30 transition-all"
                    >
                      <span className="text-xs font-mono text-lime-300 select-all truncate">
                        {id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySingle(id, idx)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-lime-500/20 text-zinc-400 hover:text-lime-300 text-[10px] font-bold border border-white/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedIndex === idx ? <Check size={11} className="text-lime-400" /> : <Copy size={11} />}
                        <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full rounded-2xl border border-white/10 bg-black/80 p-4 min-h-[360px] max-h-[380px] overflow-y-auto">
                  <pre className="font-mono text-xs text-lime-300 leading-relaxed select-all whitespace-pre-wrap">
                    {formattedOutput}
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Action: Copy All */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-lime-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedAll ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span>{copiedAll ? `Copied All ${uuids.length} Identifiers!` : `Copy All (${uuids.length} UUIDs)`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="UUID & GUID Generator"
        title="Generated UUID Tokens"
        content={formattedOutput}
        downloadAction={handleDownload}
        onCopy={handleCopyAll}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="uuid-generator" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="uuid-generator" />
    </div>
  );
}
