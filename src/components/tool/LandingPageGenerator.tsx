"use client";

import React, { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  PanelTop,
  Monitor,
  Tablet,
  Smartphone,
  Code2,
  Globe,
  Copy,
  Check,
  Download,
  ExternalLink,
  RotateCw,
  Rocket,
  Layers,
  Palette,
  CheckCircle2,
  Zap,
  ChevronDown,
  Sliders,
  ArrowRight,
  Lock,
  ShieldCheck,
  Eye,
  Share2,
  FileCode,
  LayoutGrid,
  AlertCircle,
  X,
  Cpu,
  Layout,
  Clock
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useCredits } from "@/hooks/useCredits";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import {
  LANDING_PAGE_BLUEPRINTS,
  type LandingPageBlueprint
} from "./landing-page-generator-blueprints";

type ViewportMode = "desktop" | "tablet" | "mobile";

const STYLE_OPTIONS = [
  {
    id: "modern",
    name: "Obsidian Dark SaaS",
    desc: "Exismic signature dark mode with amber & gold accents",
    icon: Layout,
  },
  {
    id: "minimalist",
    name: "Clean Light Editorial",
    desc: "Crisp typography with high-contrast minimalist white space",
    icon: Palette,
  },
  {
    id: "creative",
    name: "Cyber Neon Gradient",
    desc: "Vibrant violet & cyan gradients for tech-forward launches",
    icon: Zap,
  },
  {
    id: "emerald",
    name: "Emerald Growth",
    desc: "Clean forest & mint green for finance and sustainability",
    icon: ShieldCheck,
  },
];

const TOPIC_CHIPS = [
  "SaaS Analytics",
  "Creative Agency",
  "Mobile App Promo",
  "AI Studio",
  "E-Commerce Store",
  "Personal Portfolio",
  "Newsletter Launch"
];

const SECTIONS_CHECKLIST = [
  "Floating Glass Navbar",
  "Hero Headline & Dual CTAs",
  "Live Dashboard / Mockup Frame",
  "Core Features (3-Column Grid)",
  "Transparent Pricing Tiers",
  "Client Proof & Reviews",
  "Responsive Footer"
];

const TOOL_COST = 15;

export default function LandingPageGenerator() {
  const { credits, deductCredits, setShowUpsell, isPro } = useCredits();

  // Active blueprint: default to Blueprint 0 (ApexMetrics) so there's NEVER an empty dead void
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(
    LANDING_PAGE_BLUEPRINTS[0].id
  );
  const [prompt, setPrompt] = useState<string>(LANDING_PAGE_BLUEPRINTS[0].prompt);
  const [style, setStyle] = useState<string>("modern");
  const [isStyleDrawerOpen, setIsStyleDrawerOpen] = useState(false);

  // Results & Display
  const [htmlOutput, setHtmlOutput] = useState<string>(LANDING_PAGE_BLUEPRINTS[0].html);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // In-flight generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSelectBlueprint = (blueprint: LandingPageBlueprint) => {
    setSelectedBlueprintId(blueprint.id);
    setPrompt(blueprint.prompt);
    setStyle(blueprint.style);
    setHtmlOutput(blueprint.html);
    setError(null);
    setIframeKey((prev) => prev + 1);
  };

  const handleTopicChipClick = (topic: string) => {
    const newPrompt = `A high-converting, modern responsive landing page for a ${topic} with a clean layout, hero showcase, feature grid, and pricing cards.`;
    setPrompt(newPrompt);
    setError(null);
  };

  const simulateProgress = () => {
    setProgress(10);
    setStatusMessage("Designing page layout and structure...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        if (prev > 75) {
          setStatusMessage("Polishing your page preview...");
          return prev + 1;
        }
        if (prev > 50) {
          setStatusMessage("Building sections and buttons...");
          return prev + 2;
        }
        if (prev > 25) {
          setStatusMessage("Choosing colors and typography...");
          return prev + 3;
        }
        return prev + 5;
      });
    }, 350);

    return interval;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (credits < TOOL_COST) {
      setShowUpsell(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setActiveTab("preview");

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post("/api/tools/ai/landing-page-generator", {
        prompt: prompt.trim(),
        style,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Website generated successfully!");
      setHtmlOutput(response.data.html);
      setIframeKey((prev) => prev + 1);
      setSelectedBlueprintId("custom");

      // Deduct credits in frontend store
      if (deductCredits) {
        deductCredits(TOOL_COST);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("[LandingPageGenerator Error]:", err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Could not generate website code. Please try again.";
      setError(errMsg);
    } finally {
      setIsGenerating(false);
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
    const cleanName = prompt.trim().slice(0, 24).toLowerCase().replace(/[^a-z0-9]/g, "-") || "landing-page";
    link.download = `${cleanName}-website.html`;
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

  const handleReloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-12">
      {/* Symmetrical Dual-Pane Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Pane: Blueprint & Prompt Studio (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Studio Header Badge */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
                  <PanelTop className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Website Blueprint Studio
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Draft, preview & export responsive HTML landing pages
                  </p>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Draft</span>
              </div>
            </div>

            {/* Prompt Input Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Describe Your Website Concept
                </label>
                {prompt && (
                  <button
                    onClick={() => setPrompt("")}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-medium transition cursor-pointer"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setError(null);
                  }}
                  rows={4}
                  placeholder="Describe your SaaS product, agency, portfolio, or business (e.g. 'A dark themed landing page for a copywriter assistant SaaS application with a price grid')..."
                  className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-2xl p-4 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/10 transition-all resize-none font-medium leading-relaxed custom-scrollbar shadow-inner"
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-500">
                  {prompt.length}/1000
                </div>
              </div>
            </div>

            {/* Quick Topic Chips */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                Popular Categories
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TOPIC_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleTopicChipClick(chip)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-zinc-400 hover:text-white hover:border-amber-500/30 hover:bg-amber-500/5 transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Instant Demonstration Blueprints ($0 Previews) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Instant Demonstration Blueprints ($0 Free Previews)
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Click to preview</span>
              </div>

              <div className="space-y-2.5">
                {LANDING_PAGE_BLUEPRINTS.map((bp) => {
                  const isSelected = selectedBlueprintId === bp.id;
                  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                    Layout: Layout,
                    Palette: Palette,
                    Smartphone: Smartphone,
                    Cpu: Cpu,
                  };
                  const BpIcon = iconMap[bp.iconName] || Layout;

                  return (
                    <button
                      key={bp.id}
                      onClick={() => handleSelectBlueprint(bp)}
                      className={cn(
                        "w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative group flex items-center justify-between gap-3",
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] text-white"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/30"
                              : "bg-white/5 border border-white/10 text-zinc-400 group-hover:text-amber-300 group-hover:border-amber-500/30"
                          )}
                        >
                          <BpIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {bp.name}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0",
                                isSelected
                                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                  : "bg-white/5 text-zinc-400 border border-white/5"
                              )}
                            >
                              {bp.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                            {bp.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 group-hover:text-amber-300 group-hover:border-amber-500/30 text-[10px] font-bold uppercase tracking-wider transition">
                            Preview $0
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Design Theme Selector Drawer */}
            <div className="border border-white/5 rounded-2xl bg-black/40 overflow-hidden">
              <button
                onClick={() => setIsStyleDrawerOpen(!isStyleDrawerOpen)}
                className="w-full flex items-center justify-between p-4 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                    Design Theme & Palette ({STYLE_OPTIONS.find((s) => s.id === style)?.name})
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-300 text-zinc-500",
                    isStyleDrawerOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {isStyleDrawerOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {STYLE_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          const isCurrent = style === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setStyle(opt.id)}
                              className={cn(
                                "p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5",
                                isCurrent
                                  ? "bg-amber-500/10 border-amber-500/40 text-white"
                                  : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", isCurrent ? "text-amber-400" : "text-zinc-500")} />
                              <div>
                                <div className="text-[11px] font-bold">{opt.name}</div>
                                <div className="text-[9px] text-zinc-500 leading-tight mt-0.5">{opt.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Included Sections Checklist Preview */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                Included High-Conversion Sections
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SECTIONS_CHECKLIST.map((sec, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-0.5">
                  <div className="font-bold uppercase tracking-wider text-[10px]">Notice</div>
                  <div className="text-[11px] leading-relaxed text-zinc-300">{error}</div>
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <div className="pt-2 space-y-3">
              {credits >= TOOL_COST ? (
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className={cn(
                    "w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-2xl",
                    "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-zinc-950 shadow-amber-500/30 active:scale-[0.98]",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <Rocket className="w-4 h-4 text-zinc-950 fill-zinc-950/20 shrink-0" />
                  <span>
                    {isGenerating ? "Generating Custom Website..." : "Generate Custom Website"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/25 text-zinc-950 text-[10px] font-black border border-black/10">
                    {TOOL_COST} Credits
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowUpsell(true)}
                  className="w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-xl bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-2 border-amber-500/70 hover:border-amber-400 hover:bg-amber-500/35 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.2)] active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="text-amber-200 font-black">
                    Refill Credits (Need {TOOL_COST})
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/25 border border-amber-400/40 text-amber-200 text-[10px] font-black">
                    Costs {TOOL_COST} Credits
                  </span>
                </button>
              )}

              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-medium">
                <span>
                  Your balance: <strong className="text-white">{credits} Credits</strong>
                </span>
                {credits < TOOL_COST ? (
                  <button
                    onClick={() => setShowUpsell(true)}
                    className="text-amber-400 hover:text-amber-300 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition underline underline-offset-2"
                  >
                    Get More Credits
                  </button>
                ) : (
                  <span className="text-zinc-500 text-[10px]">Instant HTML & CSS Delivery</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Live Interactive Browser Sandbox (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-4 sm:p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* macOS Browser Chrome Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/5">
              {/* Traffic Lights & URL Simulation */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                </div>

                <div className="flex-1 sm:w-72 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 shadow-inner">
                  <div className="flex items-center gap-1.5 truncate">
                    <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-mono text-zinc-400 truncate">
                      preview.exismic.app/{selectedBlueprintId === "custom" ? "custom-site" : selectedBlueprintId}
                    </span>
                  </div>
                  <button
                    onClick={handleReloadIframe}
                    title="Refresh Preview"
                    className="text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Viewport Switcher Buttons */}
              <div className="flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-xl">
                {[
                  { mode: "desktop", name: "Desktop", icon: Monitor, label: "100%" },
                  { mode: "tablet", name: "Tablet", icon: Tablet, label: "768px" },
                  { mode: "mobile", name: "Mobile", icon: Smartphone, label: "375px" }
                ].map((item) => {
                  const Icon = item.icon;
                  const isCurrent = viewport === item.mode;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => setViewport(item.mode as ViewportMode)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer",
                        isCurrent
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                      title={`Switch to ${item.name} (${item.label})`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage View & Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Tabs: Interactive Preview vs Source Code */}
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-1 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer",
                    activeTab === "preview"
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                      : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Interactive Preview
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={cn(
                    "flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer",
                    activeTab === "code"
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                      : "text-zinc-500 hover:text-white"
                  )}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  HTML Source Code
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleOpenNewTab}
                  title="Open website in full new tab"
                  className="p-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy Code"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Download className="w-3 h-3" />
                  Download HTML
                </button>
              </div>
            </div>

            {/* Stage Canvas (Iframe Preview or Code Viewer) */}
            <div className="w-full min-h-[580px] bg-black/80 rounded-2xl p-2 sm:p-4 border border-white/5 flex justify-center items-center overflow-hidden">
              {activeTab === "preview" ? (
                <motion.div
                  animate={{
                    width:
                      viewport === "desktop"
                        ? "100%"
                        : viewport === "tablet"
                        ? "768px"
                        : "375px",
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  className="h-[620px] max-w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#08080a] relative flex flex-col"
                >
                  <iframe
                    key={iframeKey}
                    srcDoc={htmlOutput}
                    title="Exismic AI Landing Page Preview"
                    className="w-full h-full border-0 bg-[#08080a]"
                    sandbox="allow-scripts"
                  />
                </motion.div>
              ) : (
                /* Source Code Display */
                <div className="w-full h-[620px] rounded-xl bg-[#08080a] border border-white/10 p-5 overflow-auto custom-scrollbar text-left font-mono">
                  <pre className="text-xs text-zinc-300 leading-relaxed selection:bg-amber-500/20">
                    <code>{htmlOutput}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Cloud Drive & Email Retention Bar */}
      <ResultRetentionBar
        toolType="landing-page-generator"
        toolName="AI Landing Page Generator"
        title="Responsive Landing Page"
        content={htmlOutput}
        downloadAction={handleDownload}
        downloadLabel="Download HTML File"
        onCopy={handleCopy}
      />

      {/* Creative Pipeline Next Steps */}
      <div className="bg-[#0c0d14]/70 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
              Workflow Pipeline
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              Launch Your Site With Companion Tools
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Combine your landing page with share assets and branding
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/tools/developer/code-snippet"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>Code Snippet Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create polished syntax-highlighted code cards for social launches and docs.
            </p>
          </Link>

          <Link
            href="/tools/seo/og-banner"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>OG Share Banner Maker</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate matching high-res Twitter and LinkedIn social link preview cards.
            </p>
          </Link>

          <Link
            href="/tools/developer/favicon-studio"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <Palette className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>Favicon Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate crisp multi-resolution browser favicons and Apple touch icons.
            </p>
          </Link>
        </div>
      </div>

      {/* In-Flight Generation Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050608]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
              <Globe className="absolute inset-0 m-auto w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 max-w-md">
              {statusMessage}
            </h4>
            <div className="w-full max-w-sm h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 font-medium tracking-normal">
              Creating a clean, responsive landing page for you
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
