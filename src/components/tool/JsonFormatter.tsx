"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Braces, 
  Copy, 
  Check, 
  Trash2, 
  Maximize2, 
  Download,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Zap,
  ArrowUpDown,
  Wrench,
  Layers,
  FileCheck2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolLaserDivider } from "@/components/tool/ToolLaserDivider";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";

// ============================================================================
// CURATED JSON BLUEPRINTS (Zero Tech Jargon, 100% Real-World Data)
// ============================================================================

export interface JsonBlueprint {
  id: string;
  name: string;
  description: string;
  tag: string;
  json: string;
}

export const JSON_BLUEPRINTS: JsonBlueprint[] = [
  {
    id: "user-profile",
    name: "User Account & Profile",
    description: "Account credentials, subscription tier, credits, and notification preferences.",
    tag: "Auth & Users",
    json: JSON.stringify({
      user_id: "usr_9482103",
      username: "alex_creator",
      email: "alex@exismic.xyz",
      plan: "creator_pro",
      active_subscription: true,
      credits_available: 5420,
      profile: {
        first_name: "Alex",
        last_name: "Morgan",
        role: "Lead Creative Technologist",
        verified: true,
        joined_at: "2026-01-15T08:30:00Z"
      },
      tags: ["design", "ai-tools", "sound-design", "video-editor"]
    }, null, 2),
  },
  {
    id: "product-catalog",
    name: "E-Commerce Product Record",
    description: "Item SKU, pricing, variants, warehouse stock, and category taxonomies.",
    tag: "E-Commerce",
    json: JSON.stringify({
      product_id: "prod_cyber_aurora_01",
      sku: "EX-KEY-88",
      name: "Cyber Mechanical Studio Keyboard",
      currency: "USD",
      pricing: {
        base_price: 189.99,
        discount_percent: 15,
        sale_price: 161.49
      },
      inventory: {
        in_stock: true,
        warehouse_qty: 48,
        backorder_allowed: false
      },
      categories: ["Peripherals", "Creator Hardware", "Sound Dampened"]
    }, null, 2),
  },
  {
    id: "payment-intent",
    name: "Payment Intent & Invoice",
    description: "Stripe-style invoice event with charge ID, fee breakdowns, and payment status.",
    tag: "Billing & Sales",
    json: JSON.stringify({
      id: "pi_3MtwBwLkdIwHu7ix28a3tqZ0",
      object: "payment_intent",
      amount: 4900,
      currency: "usd",
      status: "succeeded",
      customer: "cus_NbV3xPZg8k0qL1",
      description: "Exismic Pro Monthly Membership (Annual Renewal)",
      payment_method_types: ["card", "apple_pay"],
      charges: {
        total_count: 1,
        paid: true,
        receipt_url: "https://pay.exismic.xyz/receipts/pi_3MtwBwLkd"
      },
      created: 1775044800
    }, null, 2),
  },
  {
    id: "github-webhook",
    name: "Code Push & Webhook Event",
    description: "Repository branch update with commit author, diff summary, and deploy trigger.",
    tag: "DevOps & CI/CD",
    json: JSON.stringify({
      event: "push",
      repository: {
        name: "exismic-next-frontend",
        full_name: "exismic/exismic-next-frontend",
        private: true,
        default_branch: "main"
      },
      sender: {
        login: "rayan-antigravity",
        type: "User",
        site_admin: false
      },
      head_commit: {
        id: "b2b63c0f419d8419",
        message: "feat(tools): overhaul developer suite with matrix neon lime styling",
        timestamp: "2026-09-30T12:00:00Z",
        added: ["src/components/tool/LoremIpsumGenerator.tsx"],
        modified: ["src/components/tool/JsonFormatter.tsx"]
      }
    }, null, 2),
  },
  {
    id: "paginated-api",
    name: "REST API Paginated Envelope",
    description: "Standard API response envelope with pagination offsets, cursors, and metadata.",
    tag: "API Standard",
    json: JSON.stringify({
      success: true,
      status_code: 200,
      pagination: {
        current_page: 1,
        per_page: 25,
        total_items: 104,
        total_pages: 5,
        has_next_page: true
      },
      data: [
        { id: "tool-01", name: "Password Generator", category: "developer", rating: 4.95 },
        { id: "tool-02", name: "Base64 Encoder", category: "developer", rating: 4.92 },
        { id: "tool-03", name: "Regex Tester", category: "developer", rating: 4.98 }
      ],
      server_timestamp: "2026-09-30T12:15:30Z"
    }, null, 2),
  },
  {
    id: "feature-flags",
    name: "Settings & Feature Flags",
    description: "Application configuration, experimental feature toggles, and limits.",
    tag: "App Config",
    json: JSON.stringify({
      environment: "production",
      version: "2.4.0",
      maintenance_mode: false,
      features: {
        enable_ai_assistants: true,
        enable_mesh_gradients: true,
        enable_instant_retention: true,
        beta_sound_mixer: false
      },
      rate_limits: {
        requests_per_minute: 120,
        burst_allowance: 250
      }
    }, null, 2),
  }
];

export function JsonFormatter() {
  // Pre-fill Blueprint #1 by default so the editor never opens as a blank void!
  const [input, setInput] = useState<string>(JSON_BLUEPRINTS[0].json);
  const [indentSize, setIndentSize] = useState<number | "tab">(2);
  const [sortAlphabetical, setSortAlphabetical] = useState<boolean>(false);
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("user-profile");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [repairSuccess, setRepairSuccess] = useState<boolean>(false);

  // Recursively sort object keys alphabetically
  const sortKeysDeep = useCallback((obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortKeysDeep);
    }
    if (obj !== null && typeof obj === "object") {
      const sortedKeys = Object.keys(obj).sort();
      const result: Record<string, any> = {};
      for (const k of sortedKeys) {
        result[k] = sortKeysDeep(obj[k]);
      }
      return result;
    }
    return obj;
  }, []);

  // Validation & Error parsing
  const { error, parsedObject } = useMemo(() => {
    if (!input.trim()) return { error: null, parsedObject: null };
    try {
      const parsed = JSON.parse(input);
      return { error: null, parsedObject: parsed };
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Invalid JSON structure.";
      return { error: message, parsedObject: null };
    }
  }, [input]);

  // Formatted Output computation
  const output = useMemo(() => {
    if (!parsedObject) return "";
    let dataToFormat = parsedObject;
    if (sortAlphabetical) {
      dataToFormat = sortKeysDeep(dataToFormat);
    }

    if (indentSize === 0) {
      // Minified
      return JSON.stringify(dataToFormat);
    }
    return JSON.stringify(dataToFormat, null, indentSize === "tab" ? "\t" : indentSize);
  }, [parsedObject, sortAlphabetical, indentSize, sortKeysDeep]);

  // Live Statistics
  const stats = useMemo(() => {
    const rawBytes = new Blob([input]).size;
    const formattedBytes = new Blob([output]).size;
    const lines = output ? output.split("\n").length : 0;
    const sizeStr = formattedBytes > 1024 ? `${(formattedBytes / 1024).toFixed(2)} KB` : `${formattedBytes} B`;
    const savings = rawBytes > 0 && formattedBytes > 0 && indentSize === 0
      ? `${Math.max(0, Math.round(((rawBytes - formattedBytes) / rawBytes) * 100))}% smaller`
      : null;

    return { lines, sizeStr, savings };
  }, [input, output, indentSize]);

  // Apply Blueprint
  const handleApplyBlueprint = (bp: JsonBlueprint) => {
    setActiveBlueprintId(bp.id);
    setInput(bp.json);
  };

  // Auto-Repair common JSON mistakes (single quotes, unquoted keys, trailing commas)
  const handleAutoRepair = () => {
    try {
      let repaired = input.trim();
      // Remove trailing commas before closing braces/brackets
      repaired = repaired.replace(/,(\s*[\]}])/g, "$1");
      // Replace single quoted strings with double quotes
      repaired = repaired.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
      // Add quotes to unquoted keys: e.g. { foo: "bar" } -> { "foo": "bar" }
      repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

      const parsed = JSON.parse(repaired);
      setInput(JSON.stringify(parsed, null, 2));
      setRepairSuccess(true);
      setTimeout(() => setRepairSuccess(false), 2500);
    } catch {
      // If regex repair fails, leave input as is
    }
  };

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
    a.download = indentSize === 0 ? "data.min.json" : "data.formatted.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearAll = () => {
    setInput("");
    setActiveBlueprintId("");
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. CURATED BLUEPRINTS (Spacious 3-Column Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                Curated JSON Blueprints
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                Instant test payloads for authentication, e-commerce, webhooks, and APIs
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/25 uppercase tracking-wider">
            6 Ready Blueprints
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {JSON_BLUEPRINTS.map((bp) => {
            const isActive = activeBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleApplyBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden",
                  isActive
                    ? "bg-lime-500/15 border-lime-400/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-400/30"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/40 hover:bg-white/[0.04]"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white group-hover:text-lime-300 transition-colors">
                      {bp.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 whitespace-nowrap shrink-0 group-hover:border-lime-500/30 group-hover:text-lime-300">
                      {bp.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-3 mt-3 border-t border-white/5">
                  <span className="text-lime-400 font-bold uppercase tracking-wider">
                    Click to Load
                  </span>
                  <span className="text-zinc-400 font-medium">Valid JSON</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TOOLBAR CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
        {/* Left: Format Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mr-1 hidden sm:inline">
            Spacing:
          </span>
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setIndentSize(2)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                indentSize === 2 ? "bg-lime-500/20 text-lime-300 border border-lime-400/40" : "text-zinc-400 hover:text-white"
              )}
            >
              2 Spaces
            </button>
            <button
              type="button"
              onClick={() => setIndentSize(4)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                indentSize === 4 ? "bg-lime-500/20 text-lime-300 border border-lime-400/40" : "text-zinc-400 hover:text-white"
              )}
            >
              4 Spaces
            </button>
            <button
              type="button"
              onClick={() => setIndentSize("tab")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                indentSize === "tab" ? "bg-lime-500/20 text-lime-300 border border-lime-400/40" : "text-zinc-400 hover:text-white"
              )}
            >
              Tab
            </button>
            <button
              type="button"
              onClick={() => setIndentSize(0)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                indentSize === 0 ? "bg-lime-500/20 text-lime-300 border border-lime-400/40" : "text-zinc-400 hover:text-white"
              )}
            >
              Minify
            </button>
          </div>

          {/* Sort Keys Toggle */}
          <button
            type="button"
            onClick={() => setSortAlphabetical(!sortAlphabetical)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer",
              sortAlphabetical
                ? "bg-lime-500/20 border-lime-400/40 text-lime-300"
                : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
            )}
            title="Sort object keys in alphabetical order (A-Z)"
          >
            <ArrowUpDown size={13} />
            <span>Sort Keys (A-Z)</span>
          </button>
        </div>

        {/* Right: Repair & Clear Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleAutoRepair}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer",
              repairSuccess
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
            )}
            title="Auto-fix single quotes, unquoted keys, and trailing commas"
          >
            <Wrench size={13} />
            <span>{repairSuccess ? "Repaired!" : "Auto-Fix Syntax"}</span>
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
            title="Clear all text"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 3. SPLIT-VIEW JSON WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Raw Input Editor */}
        <div className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden backdrop-blur-md shadow-2xl min-h-[500px]">
          <div className="px-6 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <FileCode size={13} className="text-zinc-500" />
              Raw Input JSON
            </span>

            {error ? (
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1.5">
                <AlertCircle size={12} />
                Syntax Error
              </span>
            ) : input.trim() ? (
              <span className="text-[10px] font-bold text-lime-400 bg-lime-500/10 px-2.5 py-0.5 rounded-full border border-lime-500/20 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                Valid JSON
              </span>
            ) : null}
          </div>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setActiveBlueprintId("");
            }}
            placeholder='{ "key": "Paste your raw JSON payload here..." }'
            className={cn(
              "flex-1 w-full bg-transparent p-6 font-mono text-xs focus:outline-none resize-none transition-all custom-scrollbar leading-relaxed",
              error ? "text-red-300 placeholder:text-zinc-700" : "text-zinc-200 placeholder:text-zinc-700 selection:bg-lime-500/30 selection:text-lime-200"
            )}
          />

          {error && (
            <div className="p-3.5 bg-red-950/40 text-[11px] font-mono text-red-300 px-6 border-t border-red-500/20 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-red-400" />
              <span className="truncate">{error}</span>
            </div>
          )}
        </div>

        {/* Right: Formatted Output */}
        <div className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden backdrop-blur-md shadow-2xl relative min-h-[500px]">
          <div className="px-6 py-3.5 bg-lime-500/5 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={13} />
              Formatted Result
            </span>

            <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                <strong className="text-zinc-200">{stats.lines}</strong> lines
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                <strong className="text-zinc-200">{stats.sizeStr}</strong>
              </span>
              {stats.savings && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  {stats.savings}
                </span>
              )}
            </div>
          </div>

          <pre className="flex-1 w-full p-6 overflow-auto font-mono text-xs text-lime-300/90 bg-black/60 custom-scrollbar leading-relaxed whitespace-pre selection:bg-lime-500/30 selection:text-lime-200">
            {output || (
              <span className="text-zinc-700 select-none">
                Waiting for valid JSON input to format...
              </span>
            )}
          </pre>

          {/* Floating Actions at Bottom Right */}
          <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              100% In-Browser & Private
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={downloadJson}
                disabled={!output}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                title="Download JSON file"
              >
                <Download size={14} />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!output}
                className={cn(
                  "py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-30 disabled:cursor-not-allowed",
                  isCopied
                    ? "bg-emerald-500 text-black border border-emerald-400 shadow-emerald-500/20"
                    : "bg-lime-500 hover:bg-lime-400 text-black border border-lime-400 shadow-lime-500/20 hover:scale-[1.01]"
                )}
              >
                {isCopied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                <span>{isCopied ? "Copied All!" : "Copy Result"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Laser Divider Horizon Bridge */}
      <ToolLaserDivider primaryHex="#84cc16" />

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="JSON Formatter & Validator"
        title="Formatted JSON Document"
        content={output}
        downloadAction={downloadJson}
        onCopy={copyToClipboard}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="productivity-json" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="productivity-json" />
    </div>
  );
}
export default JsonFormatter;
