"use client";

import React, { useState, useMemo } from "react";
import { 
  FileCode, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  Download, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolLaserDivider } from "@/components/tool/ToolLaserDivider";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";

// ============================================================================
// CURATED BLUEPRINTS (Zero Tech Jargon, 100% Real API Structures)
// ============================================================================

export interface TypeBlueprint {
  id: string;
  name: string;
  description: string;
  tag: string;
  rootName: string;
  json: string;
}

export const TYPE_BLUEPRINTS: TypeBlueprint[] = [
  {
    id: "user-profile",
    name: "User Account & Profile",
    description: "Account credentials, subscription tier, credits, and nested profile object.",
    tag: "Auth & Users",
    rootName: "UserProfile",
    json: JSON.stringify({
      id: 101,
      username: "alex_creator",
      email: "alex@exismic.xyz",
      isPro: true,
      credits: 5400,
      profile: {
        firstName: "Alex",
        lastName: "Morgan",
        role: "designer",
        avatarUrl: "https://avatar.exismic.xyz/u/101.png"
      },
      tags: ["design", "ai", "tools"]
    }, null, 2),
  },
  {
    id: "product-item",
    name: "E-Commerce Product Record",
    description: "SKU, price numbers, stock counts, dimensions, and variant items.",
    tag: "E-Commerce",
    rootName: "ProductRecord",
    json: JSON.stringify({
      sku: "EX-AUDIO-PRO",
      title: "Obsidian Studio Headphones",
      price: 249.99,
      inStock: true,
      inventoryCount: 38,
      dimensions: {
        weightGrams: 320,
        heightMm: 195,
        widthMm: 160
      },
      colors: ["cosmic-black", "cyber-lime", "arctic-white"]
    }, null, 2),
  },
  {
    id: "paginated-response",
    name: "Paginated API Response",
    description: "Standard pagination wrapper with records array, total items, and next page flag.",
    tag: "API Envelope",
    rootName: "ApiResponse",
    json: JSON.stringify({
      status: 200,
      success: true,
      page: 1,
      totalPages: 8,
      totalRecords: 192,
      data: [
        { id: "rec_1", title: "Quarterly Financial Overview", author: "Ray" },
        { id: "rec_2", title: "Q3 Engineering Roadmap", author: "DevTeam" }
      ]
    }, null, 2),
  },
  {
    id: "payment-intent",
    name: "Payment Intent Transaction",
    description: "Stripe-style payment event with charge ID, amount in cents, and payment methods.",
    tag: "Billing",
    rootName: "PaymentIntent",
    json: JSON.stringify({
      id: "pi_3Otw928kLa01",
      amountCents: 4900,
      currency: "usd",
      status: "succeeded",
      customerEmail: "billing@exismic.xyz",
      metadata: {
        planTier: "creator_annual",
        seats: 3
      }
    }, null, 2),
  },
  {
    id: "app-config",
    name: "Application Settings Schema",
    description: "Application runtime settings, feature toggles, and rate limit definitions.",
    tag: "App Config",
    rootName: "AppSettings",
    json: JSON.stringify({
      appName: "Exismic Studio",
      version: "2.4.0",
      maintenanceMode: false,
      features: {
        enableAiAssistants: true,
        enableRetentionVault: true,
        maxUploadMb: 50
      }
    }, null, 2),
  },
  {
    id: "geo-address",
    name: "Geo Location & Address Record",
    description: "Physical coordinate points, street address, city, and timezone metadata.",
    tag: "Geo & Maps",
    rootName: "LocationRecord",
    json: JSON.stringify({
      placeId: "loc_sf_001",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94105",
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      },
      isHeadquarters: true
    }, null, 2),
  }
];

// ============================================================================
// RECURSIVE TYPE GENERATION ENGINE
// ============================================================================

type FormatMode = "interface" | "type" | "zod" | "json-schema";

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateTypesFromJson(
  jsonStr: string,
  rootName: string = "RootObject",
  mode: FormatMode,
  isOptional: boolean = false,
  isReadonly: boolean = false
): { code: string; error: string | null } {
  try {
    const parsed = JSON.parse(jsonStr);
    const subInterfaces: string[] = [];

    // Helper to extract primitive/nested TypeScript types
    const parseTsType = (val: any, parentKey: string): string => {
      if (val === null) return "any | null";
      if (typeof val === "string") return "string";
      if (typeof val === "number") return "number";
      if (typeof val === "boolean") return "boolean";

      if (Array.isArray(val)) {
        if (val.length === 0) return "any[]";
        const itemType = parseTsType(val[0], `${parentKey}Item`);
        return `${itemType}[]`;
      }

      if (typeof val === "object") {
        const subName = `${capitalize(parentKey)}Type`;
        let subCode = mode === "type" ? `export type ${subName} = {\n` : `export interface ${subName} {\n`;
        Object.entries(val).forEach(([k, v]) => {
          const optMark = isOptional ? "?" : "";
          const roMark = isReadonly ? "readonly " : "";
          subCode += `  ${roMark}${k}${optMark}: ${parseTsType(v, k)};\n`;
        });
        subCode += `}\n`;
        subInterfaces.push(subCode);
        return subName;
      }

      return "any";
    };

    // Helper for Zod schema generation
    const parseZodType = (val: any): string => {
      if (val === null) return "z.any().nullable()";
      if (typeof val === "string") return "z.string()";
      if (typeof val === "number") return "z.number()";
      if (typeof val === "boolean") return "z.boolean()";

      if (Array.isArray(val)) {
        if (val.length === 0) return "z.array(z.any())";
        return `z.array(${parseZodType(val[0])})`;
      }

      if (typeof val === "object") {
        let lines: string[] = [];
        Object.entries(val).forEach(([k, v]) => {
          const fieldType = isOptional ? `${parseZodType(v)}.optional()` : parseZodType(v);
          lines.push(`    ${k}: ${fieldType}`);
        });
        return `z.object({\n${lines.join(",\n")}\n  })`;
      }

      return "z.any()";
    };

    // 1. Zod Mode
    if (mode === "zod") {
      let code = `import { z } from 'zod';\n\n`;
      code += `export const ${rootName}Schema = z.object({\n`;
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        Object.entries(parsed).forEach(([k, v]) => {
          const zodField = isOptional ? `${parseZodType(v)}.optional()` : parseZodType(v);
          code += `  ${k}: ${zodField},\n`;
        });
      }
      code += `});\n\nexport type ${rootName} = z.infer<typeof ${rootName}Schema>;`;
      return { code, error: null };
    }

    // 2. JSON Schema Mode
    if (mode === "json-schema") {
      const generateJsonSchemaProps = (obj: any): any => {
        const props: Record<string, any> = {};
        if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return props;
        Object.entries(obj).forEach(([k, v]) => {
          if (v === null) props[k] = { type: "null" };
          else if (typeof v === "string") props[k] = { type: "string" };
          else if (typeof v === "number") props[k] = { type: Number.isInteger(v) ? "integer" : "number" };
          else if (typeof v === "boolean") props[k] = { type: "boolean" };
          else if (Array.isArray(v)) {
            props[k] = {
              type: "array",
              items: v.length > 0 ? (typeof v[0] === "object" ? generateJsonSchemaProps(v[0]) : { type: typeof v[0] }) : {}
            };
          } else if (typeof v === "object") {
            props[k] = {
              type: "object",
              properties: generateJsonSchemaProps(v)
            };
          }
        });
        return props;
      };

      const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: rootName,
        type: "object",
        properties: generateJsonSchemaProps(parsed),
        required: isOptional ? [] : Object.keys(parsed || {})
      };

      return { code: JSON.stringify(schema, null, 2), error: null };
    }

    // 3. TypeScript Interface / Type Mode
    let rootBody = "";
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      Object.entries(parsed).forEach(([k, v]) => {
        const optMark = isOptional ? "?" : "";
        const roMark = isReadonly ? "readonly " : "";
        rootBody += `  ${roMark}${k}${optMark}: ${parseTsType(v, k)};\n`;
      });
    }

    const keyword = mode === "type" ? "type" : "interface";
    const equals = mode === "type" ? " = " : " ";
    const mainInterface = `export ${keyword} ${rootName}${equals}{\n${rootBody}};\n`;

    const fullCode = subInterfaces.length > 0
      ? `${subInterfaces.join("\n")}\n${mainInterface}`
      : mainInterface;

    return { code: fullCode.trim(), error: null };
  } catch (err: any) {
    return { code: "", error: err.message || "Invalid JSON syntax." };
  }
}

export default function JsonToTypes() {
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("user-profile");
  const [jsonInput, setJsonInput] = useState<string>(TYPE_BLUEPRINTS[0].json);
  const [rootName, setRootName] = useState<string>("UserProfile");
  const [targetFormat, setTargetFormat] = useState<FormatMode>("interface");
  const [isOptional, setIsOptional] = useState<boolean>(false);
  const [isReadonly, setIsReadonly] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const applyBlueprint = (bp: TypeBlueprint) => {
    setActiveBlueprintId(bp.id);
    setJsonInput(bp.json);
    setRootName(bp.rootName);
  };

  const { code: generatedCode, error } = useMemo(() => {
    return generateTypesFromJson(jsonInput, rootName.trim() || "RootObject", targetFormat, isOptional, isReadonly);
  }, [jsonInput, rootName, targetFormat, isOptional, isReadonly]);

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    const ext = targetFormat === "json-schema" ? "json" : "ts";
    const mime = targetFormat === "json-schema" ? "application/json" : "text/typescript";
    const blob = new Blob([generatedCode], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rootName.toLowerCase() || "types"}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
                Instant Type Blueprints
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                1-click tested payloads for authentication, e-commerce, webhooks, and REST envelopes
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/25 uppercase tracking-wider">
            6 Ready Blueprints
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {TYPE_BLUEPRINTS.map((bp) => {
            const isActive = activeBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => applyBlueprint(bp)}
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
                    {bp.rootName}
                  </span>
                  <span className="text-zinc-400 font-medium">Click to Load</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DUAL-PANE TYPE CONVERTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Raw JSON Input & Configuration */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-200">
                  JSON Input Payload
                </span>
              </div>

              {/* Root Interface Name Input */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Type Name:
                </span>
                <input
                  type="text"
                  value={rootName}
                  onChange={(e) => setRootName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  placeholder="RootObject"
                  className="w-36 py-1 px-2.5 rounded-xl bg-black/60 border border-white/15 text-lime-300 font-mono text-xs text-center font-bold focus:border-lime-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Input Textarea */}
            <div className="relative">
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setActiveBlueprintId("");
                }}
                rows={12}
                placeholder='{ "key": "value" }'
                className={cn(
                  "w-full p-4 rounded-2xl bg-black/70 border text-xs font-mono focus:outline-none leading-relaxed resize-none custom-scrollbar shadow-inner",
                  error ? "border-red-500/40 text-red-300" : "border-white/10 text-lime-300/90 focus:border-lime-500/40"
                )}
              />
              {error && (
                <div className="mt-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 font-mono flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Type Modifier Toggles */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-zinc-300 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isOptional}
                onChange={(e) => setIsOptional(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-lime-400 cursor-pointer"
              />
              <span>Optional Fields (key?)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-300 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isReadonly}
                onChange={(e) => setIsReadonly(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-lime-400 cursor-pointer"
              />
              <span>Read-Only Properties</span>
            </label>
          </div>
        </div>

        {/* Right Column: Generated Code Output */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Format Selection Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              {/* Target Format Pills */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10">
                {(["interface", "type", "zod", "json-schema"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setTargetFormat(fmt)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer",
                      targetFormat === fmt
                        ? "bg-lime-500/20 text-lime-300 border border-lime-400/40 shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {fmt === "json-schema" ? "JSON Schema" : fmt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!generatedCode}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                  title="Download types file"
                >
                  <Download size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!generatedCode}
                  className={cn(
                    "py-1.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-30",
                    copied ? "bg-emerald-500 text-black border border-emerald-400" : "bg-lime-500 hover:bg-lime-400 text-black border border-lime-400"
                  )}
                >
                  {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>
            </div>

            {/* Generated Code Output Stage */}
            <pre className="w-full min-h-[300px] max-h-[420px] rounded-2xl bg-black/80 border border-white/10 p-5 font-mono text-xs text-lime-300/90 overflow-x-auto whitespace-pre leading-relaxed shadow-inner custom-scrollbar selection:bg-lime-500/30 selection:text-lime-200">
              {generatedCode || "// Paste valid JSON on the left to see TypeScript definitions"}
            </pre>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Target: {targetFormat === "zod" ? "Zod Schema (v3+)" : targetFormat === "json-schema" ? "Draft 7 Schema" : "TypeScript 5.x"}</span>
            <span className="text-lime-400 font-bold">100% Type-Safe</span>
          </div>
        </div>
      </div>

      {/* Laser Divider Horizon Bridge */}
      <ToolLaserDivider primaryHex="#84cc16" />

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="JSON to Types Converter"
        title="Generated TypeScript Definitions"
        content={generatedCode}
        downloadAction={handleDownload}
        onCopy={handleCopy}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="json-to-types" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="json-to-types" />
    </div>
  );
}
