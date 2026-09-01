"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code2, 
  Terminal, 
  Key, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  ChevronRight, 
  ShieldAlert, 
  Layers, 
  Coins, 
  ArrowRight,
  BookOpen,
  Zap,
  Globe,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Clock,
  ArrowUpRight,
  FileCode,
  LayoutGrid,
  Search
} from "lucide-react";
import { API_TOOL_REGISTRY, ApiToolDefinition } from "@/lib/api-v1-registry";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { cn } from "@/lib/utils";

export default function DeveloperDocsPage() {
  const tools = Object.values(API_TOOL_REGISTRY);
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.toolId || "generate-text");
  const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "javascript" | "python" | "typescript">("curl");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(tools[0]?.inputSchema.example || {}, null, 2)
  );
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load saved API key from session storage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = sessionStorage.getItem("exismic_dev_api_key");
      if (savedKey) setUserApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = (val: string) => {
    setUserApiKey(val);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("exismic_dev_api_key", val);
    }
  };

  const selectedTool = API_TOOL_REGISTRY[selectedToolId] || tools[0];

  const handleSelectTool = (tool: ApiToolDefinition) => {
    setSelectedToolId(tool.toolId);
    setTestPayload(JSON.stringify(tool.inputSchema.example, null, 2));
    setTestResult(null);
    setTestError(null);
    setResponseTime(null);
  };

  const handleResetPayload = () => {
    setTestPayload(JSON.stringify(selectedTool.inputSchema.example, null, 2));
  };

  const filteredTools = tools.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.toolId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCurlCode = () => {
    const key = userApiKey.trim() || "ex_live_YOUR_API_KEY";
    return `curl -X POST https://exismic.com/api/v1/tools/${selectedTool.toolId} \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${testPayload.replace(/\n\s*/g, " ").trim()}'`;
  };

  const getJsCode = () => {
    const key = userApiKey.trim() || "ex_live_YOUR_API_KEY";
    return `// JavaScript / Node.js (fetch)
const response = await fetch("https://exismic.com/api/v1/tools/${selectedTool.toolId}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${testPayload})
});

const data = await response.json();
console.log("Exismic API Result:", data);`;
  };

  const getTsCode = () => {
    const key = userApiKey.trim() || "ex_live_YOUR_API_KEY";
    return `// TypeScript SDK client pattern
interface ExismicApiResponse<T = Record<string, any>> {
  success: boolean;
  data?: T;
  usage?: { creditsDeducted: number; remainingCredits: number };
  error?: string;
}

async function executeTool(): Promise<ExismicApiResponse> {
  const res = await fetch("https://exismic.com/api/v1/tools/${selectedTool.toolId}", {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${key}",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(${testPayload}),
  });
  return res.json();
}`;
  };

  const getPythonCode = () => {
    const key = userApiKey.trim() || "ex_live_YOUR_API_KEY";
    return `# Python (requests)
import requests

url = "https://exismic.com/api/v1/tools/${selectedTool.toolId}"
headers = {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
}
payload = ${testPayload}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`;
  };

  const currentCode = 
    selectedLanguage === "curl" 
      ? getCurlCode() 
      : selectedLanguage === "javascript" 
      ? getJsCode() 
      : selectedLanguage === "typescript"
      ? getTsCode()
      : getPythonCode();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(`https://exismic.com/api/v1/tools/${selectedTool.toolId}`);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const handleCopyResponse = () => {
    if (!testResult) return;
    navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const handleRunLiveTest = async () => {
    if (!userApiKey.trim()) {
      setTestError("Please enter your active API Key in the field above to test live requests.");
      return;
    }

    let parsedBody = {};
    try {
      parsedBody = JSON.parse(testPayload);
    } catch {
      setTestError("Invalid JSON payload. Please check your syntax before executing.");
      return;
    }

    setTestLoading(true);
    setTestError(null);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const res = await fetch(`/api/v1/tools/${selectedTool.toolId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedBody),
      });

      const json = await res.json();
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTime(elapsed);

      if (!res.ok) {
        setTestError(`HTTP ${res.status}: ${json.error || "Request failed"}`);
      } else {
        setTestResult(json);
      }
    } catch (err: any) {
      setTestError(err.message || "Network error occurred.");
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060e] text-zinc-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Background Ambient Gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent blur-[150px]" />
        <div className="absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-fuchsia-600/10 via-purple-600/10 to-transparent blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        
        {/* Breadcrumb & Navigation Topbar */}
        <PageBreadcrumb
          items={[{ label: "Developer Docs & API" }]}
          rightElement={
            <Link
              href="/account/settings?tab=developer"
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/30 hover:bg-cyan-500/10 text-zinc-300 hover:text-white transition-all text-xs font-bold"
            >
              <Key size={13} className="text-cyan-400" />
              <span>Manage API Keys</span>
              <ArrowUpRight size={13} className="text-zinc-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />

        {/* Hero Section Banner */}
        <div className="relative rounded-[2.5rem] border border-white/[0.12] bg-[linear-gradient(135deg,#0d0e20_0%,#090a16_50%,#060812_100%)] p-8 sm:p-12 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,#8b5cf6,#ec4899,#06b6d4,transparent)] bg-[length:200%_100%]"
            animate={{ backgroundPosition: ["100% 0%", "-100% 0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Terminal size={14} className="text-cyan-300" />
              <span>Developer API v1.0</span>
              <span className="flex size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Exismic <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 drop-shadow-[0_2px_20px_rgba(168,85,247,0.35)]">Developer Platform</span>
            </h1>
            
            <p className="text-zinc-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-medium">
              Integrate Exismic’s high-performance AI, image removal, student research, and media generation engines directly into your applications with simple, metered REST APIs.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/account/settings?tab=developer"
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:brightness-115 text-white font-black text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(124,58,237,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Key size={15} />
                <span>Get API Key in Settings</span>
                <ArrowRight size={14} />
              </Link>

              <a
                href="#playground"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Play size={13} className="text-cyan-400" />
                <span>Interactive Sandbox</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3 Core Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="group relative p-6 rounded-3xl border border-white/[0.1] bg-[linear-gradient(135deg,rgba(124,58,237,0.08),rgba(255,255,255,0.02)_60%)] space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-[0_15px_40px_rgba(124,58,237,0.15)]">
            <div className="size-11 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
              <Key size={20} />
            </div>
            <h2 className="text-base font-black text-white">1. Bearer Authentication</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Authenticate all REST calls with your live secret key in the standard header:
            </p>
            <div className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[11px] font-mono text-cyan-300 truncate">
              Authorization: Bearer ex_live_...
            </div>
          </div>

          <div className="group relative p-6 rounded-3xl border border-white/[0.1] bg-[linear-gradient(135deg,rgba(6,182,212,0.08),rgba(255,255,255,0.02)_60%)] space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_15px_40px_rgba(6,182,212,0.15)]">
            <div className="size-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Coins size={20} />
            </div>
            <h2 className="text-base font-black text-white">2. Automatic Credit Metering</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Each execution automatically deducts balance credits. Every response returns accurate remaining quota.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300">
              <span className="size-2 rounded-full bg-amber-400" />
              <span>Real-time usage tracking</span>
            </div>
          </div>

          <div className="group relative p-6 rounded-3xl border border-white/[0.1] bg-[linear-gradient(135deg,rgba(16,185,129,0.08),rgba(255,255,255,0.02)_60%)] space-y-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_15px_40px_rgba(16,185,129,0.15)]">
            <div className="size-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <Zap size={20} />
            </div>
            <h2 className="text-base font-black text-white">3. Ultra-Fast Edge Execution</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Distributed edge endpoints and high-concurrency neural pipelines deliver responses in sub-500ms.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-400">
              <Clock size={12} />
              <span>~380ms average latency</span>
            </div>
          </div>
        </div>

        {/* Main API Explorer & Interactive Playground Grid */}
        <div id="playground" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Left Navigation: Endpoint Catalog */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <LayoutGrid size={14} className="text-cyan-400" />
                Available Endpoints
              </h2>
              <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30">
                {tools.length} Tools
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:border-cyan-400/50 focus:bg-white/[0.06] outline-none transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 pb-1 overflow-x-auto custom-scrollbar">
              {[
                { id: "all", label: "All" },
                { id: "ai", label: "AI & LLM" },
                { id: "image", label: "Image" },
                { id: "student", label: "Student" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeCategory === cat.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                      : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5 hover:border-white/15"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Tool Selection Buttons List */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTools.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 border border-white/5 rounded-2xl bg-white/[0.01]">
                  No endpoints matched your search.
                </div>
              ) : (
                filteredTools.map((tool) => {
                  const isSelected = tool.toolId === selectedTool.toolId;
                  return (
                    <button
                      key={tool.toolId}
                      onClick={() => handleSelectTool(tool)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group cursor-pointer active:scale-[0.99]",
                        isSelected
                          ? "bg-[linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.1))] border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                          : "bg-[#090a16] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] text-zinc-400"
                      )}
                    >
                      {isSelected && (
                        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 via-purple-500 to-fuchsia-500" />
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-white group-hover:text-cyan-200 transition-colors truncate">
                          {tool.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0">
                          {tool.creditCost} Credits
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-1.5 py-0.2 text-[8px] font-black uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          POST
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono truncate">
                          /api/v1/tools/{tool.toolId}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Schema, Code Generator, Live Playground */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Selected Tool Details Card */}
            <div className="p-6 sm:p-8 rounded-[2rem] border border-white/[0.12] bg-[linear-gradient(145deg,#090a16_0%,#0c0e22_50%,#080914_100%)] shadow-[0_20px_70px_rgba(0,0,0,0.6)] space-y-6">
              
              {/* Endpoint Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      POST
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEndpoint}
                      title="Click to copy full endpoint URL"
                      className="group flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-400/40 text-xs sm:text-sm font-bold text-white font-mono transition-all"
                    >
                      <span>/api/v1/tools/{selectedTool.toolId}</span>
                      {copiedEndpoint ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} className="text-zinc-500 group-hover:text-cyan-300" />
                      )}
                    </button>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{selectedTool.name}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{selectedTool.description}</p>
                </div>

                <div className="flex flex-col items-end gap-1 p-3 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Execution Cost</span>
                  <span className="text-base font-black text-amber-300 flex items-center gap-1.5">
                    <Coins size={14} className="text-amber-400" />
                    {selectedTool.creditCost} Credits
                  </span>
                </div>
              </div>

              {/* Request Parameters Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Code2 size={14} className="text-purple-400" />
                  Request Body Parameters (JSON)
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/30">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.04] text-zinc-400 font-bold uppercase tracking-wider border-b border-white/[0.06]">
                      <tr>
                        <th className="p-3.5">Field</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Required</th>
                        <th className="p-3.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {selectedTool.inputSchema.fields.map((field) => (
                        <tr key={field.name} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5 font-mono font-bold text-cyan-300">{field.name}</td>
                          <td className="p-3.5 font-mono text-purple-300">
                            <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-400/20 text-[11px]">
                              {field.type}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {field.required ? (
                              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[10px] uppercase">
                                Required
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] uppercase">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-zinc-300 leading-relaxed">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Code Snippets Section */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10">
                    {(["curl", "javascript", "typescript", "python"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          selectedLanguage === lang
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {lang === "javascript" ? "Node.js" : lang === "typescript" ? "TypeScript" : lang}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedCode ? "Copied to Clipboard" : "Copy Snippet"}</span>
                  </button>
                </div>

                {/* macOS Style Terminal Window */}
                <div className="rounded-2xl border border-white/10 bg-[#030408] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-rose-500/80" />
                      <span className="size-3 rounded-full bg-amber-500/80" />
                      <span className="size-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {selectedLanguage === "curl" ? "curl-command.sh" : selectedLanguage === "typescript" ? "client.ts" : selectedLanguage === "javascript" ? "index.js" : "request.py"}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase">UTF-8</span>
                  </div>
                  <pre className="p-4 sm:p-5 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed custom-scrollbar">
                    <code>{currentCode}</code>
                  </pre>
                </div>
              </div>

              {/* Interactive Live API Playground / Sandbox */}
              <div className="p-6 sm:p-7 rounded-[1.75rem] border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(6,182,212,0.06),rgba(124,58,237,0.04)_50%,rgba(0,0,0,0.5))] shadow-[0_0_40px_rgba(6,182,212,0.08)] space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                      <Play size={15} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Live API Playground</h4>
                      <p className="text-[11px] text-zinc-400">Test actual requests against live Exismic endpoints</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 uppercase tracking-wider">
                    Interactive Sandbox
                  </span>
                </div>

                {/* API Key Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key size={13} className="text-cyan-400" />
                      Your Exismic Secret API Key
                    </span>
                    <Link href="/account/settings?tab=developer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                      <span>Get API Key</span>
                      <ArrowUpRight size={11} />
                    </Link>
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder="ex_live_..."
                      value={userApiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-cyan-400 focus:bg-black/80 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Request Payload JSON Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-zinc-300 flex items-center gap-1.5">
                      <FileCode size={13} className="text-purple-400" />
                      Request Body JSON
                    </label>
                    <button
                      type="button"
                      onClick={handleResetPayload}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw size={11} />
                      Reset to Default Example
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/15 text-zinc-200 text-xs font-mono focus:border-purple-400 focus:bg-black/80 outline-none resize-y custom-scrollbar"
                  />
                </div>

                {/* Run CTA Button */}
                <button
                  type="button"
                  onClick={handleRunLiveTest}
                  disabled={testLoading}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <Play size={14} className="fill-white" />
                  <span>
                    {testLoading 
                      ? "Executing Request on Exismic Cloud..." 
                      : `Execute Live Request (${selectedTool.creditCost} Credits)`}
                  </span>
                </button>

                {/* Error Banner */}
                {testError && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-200 text-xs flex items-start gap-2.5 shadow-lg"
                  >
                    <ShieldAlert size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold">Request Failed</div>
                      <div className="font-mono text-[11px] text-rose-300">{testError}</div>
                    </div>
                  </motion.div>
                )}

                {/* Success Result Container */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2.5 pt-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 size={15} />
                        <span>Response 200 OK</span>
                        {typeof responseTime === "number" && (
                          <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            ⚡ {responseTime}ms
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyResponse}
                        className="text-[11px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedResponse ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedResponse ? "Copied" : "Copy Response JSON"}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-[#020205] border border-emerald-500/40 font-mono text-xs text-emerald-300 overflow-x-auto max-h-72 custom-scrollbar shadow-inner">
                      <code>{JSON.stringify(testResult, null, 2)}</code>
                    </pre>
                  </motion.div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
