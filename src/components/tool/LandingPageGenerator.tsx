"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Layout, 
  Sparkles, 
  Code, 
  Copy, 
  Check, 
  Download, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Sliders, 
  ChevronDown, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import axios from "axios";

const PRESETS = [
  { name: "Dark SaaS Dashboard", prompt: "A modern dark-themed SaaS analytics dashboard with glowing charts, responsive columns, and neon accents." },
  { name: "Creative Agency", prompt: "A sleek, minimalist portfolio website for a digital creative agency with visual grids and large bold headings." },
  { name: "Fitness Tracker App", prompt: "An energetic mobile application promo page with high contrast elements, stats callouts, and download CTAs." },
  { name: "Eco E-Commerce Store", prompt: "A clean, pastel green themed landing page for organic soaps and skin care products with grid listings." }
];

const AUD_STEPS = [
  { title: "Describe Concept", desc: "Type what your landing page is about (e.g. 'SaaS analytics platform' or 'personal portfolio')." },
  { title: "Select Style", desc: "Choose your primary theme preset (Dark SaaS, Minimalist Light, or Gradient Creative)." },
  { title: "Generate Code", desc: "AI writes a clean, responsive HTML/CSS page styled with modern CSS." },
  { title: "Test & Export", desc: "Toggle viewport sizes (mobile, tablet, desktop) and export the code." }
];

type ViewportMode = "desktop" | "tablet" | "mobile";

export default function LandingPageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results
  const [htmlOutput, setHtmlOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [copied, setCopied] = useState(false);

  // Loading simulation
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    setError(null);
  };

  const simulateProgress = () => {
    setProgress(5);
    setStatus("Preparing page generator...");
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) {
          clearInterval(interval);
          return 96;
        }
        if (prev > 75) {
          setStatus("Generating sections and content...");
          return prev + 1;
        }
        if (prev > 45) {
          setStatus("Building layout and design grid...");
          return prev + 2;
        }
        if (prev > 20) {
          setStatus("Applying modern styling and colors...");
          return prev + 4;
        }
        return prev + 6;
      });
    }, 400);

    return interval;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError(null);
    setHtmlOutput(null);
    setProgress(0);
    setActiveTab("preview");

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post("/api/tools/ai/landing-page-generator", {
        prompt: prompt.trim(),
        style
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatus("Landing page generated!");
      setHtmlOutput(response.data.html);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || "Failed to generate website code.";
      setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!htmlOutput) return;
    navigator.clipboard.writeText(htmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!htmlOutput) return;
    const blob = new Blob([htmlOutput], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${prompt.trim().slice(0, 20).toLowerCase().replace(/[^a-z0-9]/g, "-")}-landing-page.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    if (!htmlOutput) return;
    const blob = new Blob([htmlOutput], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Main Workspace */}
        <div className="xl:col-span-8 space-y-10">
          
          <div className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/[0.01] blur-[100px] rounded-full pointer-events-none" />

            {/* Title Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                  <div className="p-2 bg-accent-blue/10 rounded-xl"><Layout className="w-5 h-5 text-accent-blue" /></div>
                  Page Synthesis Studio
                </h3>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Draft, preview, and export responsive HTML templates</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Prompt Box */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Describe your page concept</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => { setPrompt(e.target.value); setError(null); }}
                  placeholder="Describe your SaaS product, agency, portfolio, or business (e.g. 'A dark themed landing page for a copywriter assistant SaaS application with a price grid')..."
                  className="w-full min-h-[140px] bg-zinc-950/90 border border-white/5 focus:border-accent-blue/30 rounded-[2rem] p-6 text-zinc-300 font-medium leading-relaxed outline-none focus:ring-4 focus:ring-accent-blue/5 transition-all duration-300 resize-none shadow-inner custom-scrollbar"
                />
              </div>

              {/* Presets Grid */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Sample Prompts</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(preset.prompt)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer group",
                        prompt === preset.prompt 
                          ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue" 
                          : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/15 hover:text-white"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider block mb-1 group-hover:text-accent-blue transition-colors">
                        {preset.name}
                      </span>
                      <span className="text-[10px] font-medium opacity-80 leading-relaxed block truncate">
                        {preset.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Styling drawer */}
              <div className="border border-white/5 rounded-[2rem] bg-zinc-950/30 overflow-hidden">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="w-full flex items-center justify-between p-6 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sliders size={16} className="text-accent-blue" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Theme & Styles Config</span>
                  </div>
                  <ChevronDown size={16} className={cn("transition-transform duration-300", isSettingsOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-white/5 mt-6 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Design Style Tone</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { id: "modern", name: "Modern Dark", desc: "Dark mode SaaS look" },
                            { id: "minimalist", name: "Clean Light", desc: "Sleek, bright tech style" },
                            { id: "creative", name: "Neon Gradient", desc: "Bold, modern dark gradients" }
                          ].map((tone) => (
                            <button
                              key={tone.id}
                              onClick={() => setStyle(tone.id)}
                              className={cn(
                                "p-4 rounded-xl border text-center transition-all cursor-pointer",
                                style === tone.id 
                                  ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
                                  : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                              )}
                            >
                              <span className="text-[10px] font-black uppercase block">{tone.name}</span>
                              <span className="text-[8px] font-semibold opacity-70 block mt-1">{tone.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isProcessing}
                  className={cn(
                    "w-full md:w-auto flex min-h-14 items-center justify-center gap-3 rounded-2xl px-10 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition hover:brightness-110 active:scale-98 cursor-pointer",
                    "bg-gradient-to-r from-blue-600 to-indigo-600",
                    "disabled:opacity-30 disabled:cursor-not-allowed"
                  )}
                >
                  <Sparkles size={16} />
                  {isProcessing ? "Generating Page..." : "Generate Landing Page"}
                </button>
              </div>
            </div>
          </div>

          {/* Results display panel */}
          <AnimatePresence>
            {htmlOutput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-8 relative overflow-hidden group"
              >
                {/* Result header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-4 border-b border-white/5">
                  {/* Local Tabs */}
                  <div className="flex gap-4">
                    {[
                      { id: "preview", name: "Interactive Preview", icon: Layout },
                      { id: "code", name: "HTML Source Code", icon: Code }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={cn(
                            "px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer",
                            activeTab === tab.id 
                              ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue shadow-sm"
                              : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                          )}
                        >
                          <Icon size={12} />
                          {tab.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenNewTab}
                      className="p-3 bg-white/5 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Open page in fullscreen new tab"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy Code"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2.5 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer hover:bg-zinc-200"
                    >
                      <Download size={12} />
                      Download HTML
                    </button>
                  </div>
                </div>

                {/* Tab Content Panels */}
                <div className="min-h-[500px] w-full">
                  {activeTab === "preview" ? (
                    <div className="space-y-6">
                      {/* Responsive toggles */}
                      <div className="flex justify-center gap-2 p-1.5 bg-zinc-950/80 border border-white/5 rounded-2xl w-fit mx-auto">
                        {[
                          { mode: "desktop", name: "Desktop", icon: Monitor },
                          { mode: "tablet", name: "Tablet", icon: Tablet },
                          { mode: "mobile", name: "Mobile", icon: Smartphone }
                        ].map((btn) => {
                          const Icon = btn.icon;
                          return (
                            <button
                              key={btn.mode}
                              onClick={() => setViewport(btn.mode as ViewportMode)}
                              className={cn(
                                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer",
                                viewport === btn.mode 
                                  ? "bg-white/10 text-white" 
                                  : "text-zinc-500 hover:text-white"
                              )}
                            >
                              <Icon size={12} />
                              {btn.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* Iframe Viewport Container */}
                      <div className="w-full flex justify-center bg-zinc-950 rounded-3xl p-4 min-h-[550px] border border-white/5 overflow-hidden">
                        <motion.div
                          animate={{ 
                            width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px" 
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="h-[550px] max-w-full overflow-hidden rounded-2xl bg-[#08080a] shadow-2xl relative"
                        >
                          <iframe 
                            srcDoc={htmlOutput}
                            title="AI Landing Page Preview"
                            className="w-full h-full border-0 bg-[#08080a]"
                            sandbox="allow-scripts"
                          />
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    /* Raw code display */
                    <div className="relative w-full rounded-2xl bg-zinc-950 border border-white/5 p-6 overflow-hidden">
                      <pre className="text-xs font-mono text-zinc-400 leading-relaxed overflow-x-auto max-h-[550px] custom-scrollbar selection:bg-blue-500/20">
                        <code>{htmlOutput}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Sidebar Info Pane */}
        <div className="xl:col-span-4 space-y-8">
          <PdfSidebar 
            accentColor="text-accent-blue"
            steps={AUD_STEPS}
            stats={prompt ? [
              { label: "Synthesis engine", value: "Exismic Layout Engine" },
              { label: "CSS Framework", value: "Tailwind CSS" },
              { label: "Format", value: "Standalone HTML" }
            ] : []}
          />

          {error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em]">Synthesis Error</p>
                <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Synthesis loader screen overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-24 h-24 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
              <Layout className="absolute inset-0 m-auto w-8 h-8 text-accent-blue animate-pulse" />
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">{status}</h4>
            <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-blue shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-6 font-black uppercase tracking-[0.4em]">Drafting webpage mockup</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
