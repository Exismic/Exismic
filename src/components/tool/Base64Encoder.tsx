"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  Binary, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeftRight,
  FileCode,
  Tag,
  Upload,
  Download,
  FileText,
  ImageIcon,
  ShieldCheck,
  Check,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// ============================================================================
// TYPES & BLUEPRINTS (Zero Tech Jargon, 100% Everyday English)
// ============================================================================

export interface Base64Blueprint {
  id: string;
  title: string;
  category: string;
  input: string;
  mode: "encode" | "decode";
  description: string;
}

export const BASE64_BLUEPRINTS: Base64Blueprint[] = [
  {
    id: "json-api-payload",
    title: "JSON API Auth Payload",
    category: "Web API",
    input: `{\n  "userId": "usr_9981",\n  "role": "admin",\n  "exp": 1790745600\n}`,
    mode: "encode",
    description: "Encode structured JSON config or session tokens for HTTP headers."
  },
  {
    id: "basic-auth",
    title: "Basic Auth Header",
    category: "Security",
    input: "admin:supersecretpassword2026",
    mode: "encode",
    description: "Standard username:password pair formatted for HTTP Authorization headers."
  },
  {
    id: "svg-icon-data",
    title: "SVG Graphic Data URI",
    category: "Graphics",
    input: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#84cc16" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
    mode: "encode",
    description: "Vector icon markup encoded for inline CSS or HTML image sources."
  },
  {
    id: "url-safe-token",
    title: "URL-Safe Query Token",
    category: "Query Param",
    input: "session_token_xyz?redirect=/dashboard&verified=true",
    mode: "encode",
    description: "String encoded for passing safely inside website URLs and redirect query parameters."
  },
  {
    id: "decoded-credentials",
    title: "Decoded Service Credential",
    category: "Decoder",
    input: "ZXhpc21pY19hcGlfa2V5XzIwMjY6cHJvZHVjdGlvbg==",
    mode: "decode",
    description: "Instant decode of a base64 encoded credential string back to plain text."
  },
  {
    id: "multilingual-utf8",
    title: "Multilingual Unicode Text",
    category: "UTF-8 Clean",
    input: "Hello World • こんにちは • Bonjour le monde • مرحبا بالعالم 🚀",
    mode: "encode",
    description: "Safely handles emojis, Japanese, and international accents without byte corruption."
  }
];

export default function Base64Encoder() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("json-api-payload");
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputText, setInputText] = useState<string>(BASE64_BLUEPRINTS[0].input);
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // File to Base64 State
  const [fileDataUri, setFileDataUri] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [fileMime, setFileMime] = useState<string>("");
  const [fileCopied, setFileCopied] = useState<boolean>(false);

  // Bidirectional Text Encoder / Decoder Engine
  const outputText = useMemo(() => {
    if (!inputText.trim()) return "";
    try {
      if (mode === "encode") {
        // Safe UTF-8 Base64 Encoding
        const encoded = btoa(
          encodeURIComponent(inputText).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        );
        if (urlSafe) {
          return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }
        return encoded;
      } else {
        // Safe UTF-8 Base64 Decoding
        let clean = inputText.trim();
        if (urlSafe || clean.includes("-") || clean.includes("_")) {
          clean = clean.replace(/-/g, "+").replace(/_/g, "/");
          while (clean.length % 4 !== 0) {
            clean += "=";
          }
        }
        return decodeURIComponent(
          atob(clean)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      }
    } catch {
      return mode === "decode"
        ? "[Unable to decode: Invalid Base64 input characters or incomplete string]"
        : "[Encoding error: Unsupported characters]";
    }
  }, [inputText, mode, urlSafe]);

  // Load a Blueprint
  const handleSelectBlueprint = (bp: Base64Blueprint) => {
    setSelectedBlueprintId(bp.id);
    setActiveTab("text");
    setMode(bp.mode);
    setInputText(bp.input);
  };

  // Reset to Baseline
  const handleReset = () => {
    handleSelectBlueprint(BASE64_BLUEPRINTS[0]);
    setFileDataUri("");
    setFileName("");
  };

  // Copy Output
  const handleCopy = () => {
    if (!outputText || outputText.startsWith("[")) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // File Upload to Base64 Data URI
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileMime(file.type || "application/octet-stream");
    setFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`
    );

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Copy File Base64
  const handleCopyFileUri = (format: "dataUri" | "html" | "css") => {
    if (!fileDataUri) return;
    let payload = fileDataUri;
    if (format === "html") payload = `<img src="${fileDataUri}" alt="${fileName}" />`;
    if (format === "css") payload = `background-image: url("${fileDataUri}");`;

    navigator.clipboard.writeText(payload);
    setFileCopied(true);
    setTimeout(() => setFileCopied(false), 2000);
  };

  // Swap Input and Output
  const handleSwap = () => {
    if (!outputText || outputText.startsWith("[")) return;
    setInputText(outputText);
    setMode(mode === "encode" ? "decode" : "encode");
    setSelectedBlueprintId("");
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner / Quick Actions Bar */}
      <div className="rounded-3xl border border-lime-500/20 bg-gradient-to-b from-lime-500/5 to-transparent p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shrink-0">
              <Binary size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Base64 Encoder & Decoder Studio</span>
                <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-500/10 border border-lime-500/20 px-2 py-0.5 rounded-full">
                  Instant UTF-8 Safe
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Bidirectional data conversion for strings, headers, and media assets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "text"
                    ? "bg-lime-500 text-black font-black shadow-md shadow-lime-500/20"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                Text & Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === "file"
                    ? "bg-lime-500 text-black font-black shadow-md shadow-lime-500/20"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                File to Base64
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset fields to baseline"
            >
              <RotateCcw size={15} />
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
              Common Developer Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to pre-fill tested encoding samples
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {BASE64_BLUEPRINTS.map((bp) => {
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
                  <span className="text-[11px] font-mono text-zinc-500 truncate text-right capitalize">
                    {bp.mode} mode
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

      {/* Main Studio Workspace: 2-Column Grid */}
      {activeTab === "text" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-4 flex flex-col justify-between min-h-[440px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-black/60 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setMode("encode")}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                        mode === "encode"
                          ? "bg-lime-500 text-black shadow-md shadow-lime-500/20"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      Encode Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("decode")}
                      className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                        mode === "decode"
                          ? "bg-lime-500 text-black shadow-md shadow-lime-500/20"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      Decode Base64
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500">
                    {inputText.length} characters
                  </span>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  rows={12}
                  placeholder={
                    mode === "encode"
                      ? "Type or paste text, JSON, or code to encode into Base64..."
                      : "Paste Base64 encoded string to decode into plain text..."
                  }
                  className="w-full flex-1 rounded-2xl border border-white/10 bg-black/60 p-4 text-xs font-mono text-lime-300 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-all resize-y leading-relaxed"
                />
              </div>

              {/* URL-Safe Option Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={urlSafe}
                    onChange={(e) => setUrlSafe(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-lime-500 focus:ring-lime-500"
                  />
                  <span>URL-Safe Format (Uses - and _ without padding)</span>
                </label>

                {outputText && !outputText.startsWith("[") && (
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    title="Swap input and output"
                  >
                    <ArrowLeftRight size={12} className="text-lime-400" />
                    <span>Swap</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Output (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-4 flex flex-col justify-between min-h-[440px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <FileCode size={15} className="text-lime-400" />
                    <span>{mode === "encode" ? "Base64 Encoded Result" : "Decoded Plain Text"}</span>
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {outputText ? outputText.length : 0} characters
                  </span>
                </div>

                <div className="w-full rounded-2xl border border-white/10 bg-black/80 p-4 min-h-[280px] max-h-[360px] overflow-y-auto">
                  <p className="font-mono text-xs text-white break-all leading-relaxed select-all whitespace-pre-wrap">
                    {outputText || (
                      <span className="text-zinc-600 font-sans italic">
                        Conversion output will update automatically as you type...
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!outputText || outputText.startsWith("[")}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg",
                    outputText && !outputText.startsWith("[")
                      ? "bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500 text-black shadow-lime-500/20 hover:brightness-110 active:scale-[0.99]"
                      : "bg-white/5 border border-white/10 text-zinc-600 cursor-not-allowed"
                  )}
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Copied Output to Clipboard!" : "Copy Result"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* File Upload to Base64 Data URI Tab */
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md shadow-xl space-y-6">
          <div className="max-w-xl mx-auto space-y-4 text-center">
            <div className="w-14 h-14 rounded-3xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 mx-auto">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Convert Any File to Base64 Data URI</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Drag and drop images, SVGs, documents, or fonts. Processed 100% locally in browser memory.
              </p>
            </div>

            <label className="block p-8 rounded-2xl border-2 border-dashed border-white/20 hover:border-lime-500/50 bg-black/40 hover:bg-black/60 transition-all cursor-pointer group">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-xs font-bold text-zinc-300 group-hover:text-lime-300 transition-colors block">
                {fileName ? `Loaded: ${fileName} (${fileSize})` : "Click to select or drag a file here"}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-1">
                Supports PNG, JPG, SVG, WebP, PDF, TTF, and WOFF2
              </span>
            </label>
          </div>

          {/* Render File Data URI Output */}
          {fileDataUri && (
            <div className="space-y-4 pt-4 border-t border-white/10 max-w-3xl mx-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-lime-400" />
                  <span>{fileName} ({fileMime} • {fileSize})</span>
                </span>
                <span className="font-mono text-zinc-400 text-[11px]">
                  {fileDataUri.length} Base64 chars
                </span>
              </div>

              <div className="w-full rounded-2xl border border-white/10 bg-black/80 p-4 max-h-[160px] overflow-y-auto">
                <p className="font-mono text-[11px] text-lime-300 break-all leading-relaxed select-all">
                  {fileDataUri}
                </p>
              </div>

              {/* 3 Export Formats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyFileUri("dataUri")}
                  className="py-3 rounded-xl bg-lime-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-lime-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>Copy Data URI</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyFileUri("html")}
                  className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileCode size={13} className="text-lime-400" />
                  <span>Copy HTML &lt;img&gt;</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyFileUri("css")}
                  className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText size={13} className="text-lime-400" />
                  <span>Copy CSS url()</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="Base64 Encoder & Decoder"
        title="Base64 Converted Result"
        content={activeTab === "file" ? fileDataUri : outputText}
        onCopy={handleCopy}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="base64-encoder" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="base64-encoder" />
    </div>
  );
}
