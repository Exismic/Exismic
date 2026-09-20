"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BrainCircuit,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sliders,
  Zap,
  Bot,
  Cpu,
  Layers,
  Globe,
  ExternalLink,
  CheckCircle2,
  Code2,
  FileText,
  Wand2,
  ShieldCheck,
  ListOrdered,
  Lightbulb,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & FRAMEWORK DEFINITIONS (Zero Emojis, Authentic Vector Accents)
// ============================================================================

export type TargetModel = "claude" | "chatgpt" | "deepseek" | "gemini" | "universal";
export type PromptFramework = "create" | "cot" | "rtf" | "ape";
export type TonePersona = "expert" | "architect" | "copywriter" | "academic" | "executive" | "mentor";
export type OutputFormat = "markdown" | "checklist" | "code" | "json" | "stepbystep";

interface ModelConfig {
  id: TargetModel;
  name: string;
  badge: string;
  color: string;
  iconComponent: React.ComponentType<{ className?: string }>;
}

const TARGET_MODELS: ModelConfig[] = [
  {
    id: "claude",
    name: "Claude",
    badge: "XML TAGS",
    color: "#d97706", // Amber
    iconComponent: Bot,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    badge: "STRUCTURED",
    color: "#10b981", // Emerald
    iconComponent: Cpu,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "DEEP REASONING",
    color: "#3b82f6", // Blue
    iconComponent: BrainCircuit,
  },
  {
    id: "gemini",
    name: "Gemini",
    badge: "MULTIMODAL",
    color: "#8b5cf6", // Purple
    iconComponent: Layers,
  },
  {
    id: "universal",
    name: "Universal AI",
    badge: "ALL LLMS",
    color: "#06b6d4", // Cyan
    iconComponent: Globe,
  },
];

interface FrameworkConfig {
  id: PromptFramework;
  name: string;
  tag: string;
  description: string;
}

const FRAMEWORKS: FrameworkConfig[] = [
  {
    id: "create",
    name: "CREATE Protocol",
    tag: "RECOMMENDED",
    description: "Character, Request, Examples, Adjustments, Type, and Extras",
  },
  {
    id: "cot",
    name: "Chain of Thought",
    tag: "STEP-BY-STEP",
    description: "Forces systematic reasoning and edge-case inspection before answering",
  },
  {
    id: "rtf",
    name: "Role - Task - Format",
    tag: "HIGH SPEED",
    description: "Crisp, hyper-efficient directive without conversational fluff",
  },
  {
    id: "ape",
    name: "Action - Purpose - Expectation",
    tag: "BUSINESS GRADE",
    description: "Explicit mission goals, business rationale, and quality bounds",
  },
];

interface PersonaConfig {
  id: TonePersona;
  name: string;
  roleTitle: string;
  toneDescription: string;
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "expert",
    name: "World-Class Specialist",
    roleTitle: "World-Class Subject Matter Specialist with 15+ years of proven industry leadership",
    toneDescription: "Authoritative, mathematically precise, evidence-backed, with zero filler",
  },
  {
    id: "architect",
    name: "Senior Software Architect",
    roleTitle: "Staff Principal Software Architect & Systems Engineer",
    toneDescription: "Technically rigorous, scalable, following clean code and strict typing conventions",
  },
  {
    id: "copywriter",
    name: "Conversion Copywriter",
    roleTitle: "Direct-Response Copywriter and Creator Growth Strategist",
    toneDescription: "Punchy, persuasive, psychology-driven, hook-oriented, and rhythmically engaging",
  },
  {
    id: "academic",
    name: "Academic Researcher",
    roleTitle: "Senior University Researcher and Peer Reviewer",
    toneDescription: "Methodical, deeply researched, objective, with clear definitions and citations",
  },
  {
    id: "executive",
    name: "Strategy Consultant",
    roleTitle: "Senior Management Strategy Consultant (Top-tier caliber)",
    toneDescription: "High-ROI, executive summary first, bulleted findings, and risk-mitigated action steps",
  },
  {
    id: "mentor",
    name: "Master Educator",
    roleTitle: "Master Educator with a talent for conceptual clarity and scaffolding",
    toneDescription: "Approachable, intuitive, using clear real-world analogies and step-by-step guidance",
  },
];

interface SampleIdea {
  id: string;
  title: string;
  category: string;
  rawIdea: string;
  defaultPersona: TonePersona;
  defaultFormat: OutputFormat;
}

const SAMPLE_IDEAS: SampleIdea[] = [
  {
    id: "code-audit",
    title: "Code Review & Security Audit",
    category: "Coding & Dev",
    rawIdea: "Review this React and Node.js code for security vulnerabilities, memory leaks, and performance bottlenecks",
    defaultPersona: "architect",
    defaultFormat: "checklist",
  },
  {
    id: "cold-email",
    title: "High-Converting Cold Outreach",
    category: "Sales & Growth",
    rawIdea: "Write a 4-sentence personalized cold email to pitch our SaaS tool to a Head of Marketing",
    defaultPersona: "copywriter",
    defaultFormat: "markdown",
  },
  {
    id: "db-schema",
    title: "PostgreSQL Database Schema",
    category: "Backend & Cloud",
    rawIdea: "Design a PostgreSQL schema for a multi-tenant ride sharing platform like Uber with drivers, riders, rides, and payouts",
    defaultPersona: "architect",
    defaultFormat: "code",
  },
  {
    id: "essay-outline",
    title: "Research Paper Thesis & Structure",
    category: "Academic",
    rawIdea: "Build an argumentative academic paper structure on the ethical implications of autonomous AI agents in healthcare",
    defaultPersona: "academic",
    defaultFormat: "stepbystep",
  },
  {
    id: "refund-negotiation",
    title: "Firm But Polite Customer Negotiation",
    category: "Business",
    rawIdea: "Draft an email requesting a full refund for a cancelled flight that the airline initially refused to reimburse",
    defaultPersona: "executive",
    defaultFormat: "markdown",
  },
  {
    id: "api-schema",
    title: "REST API Spec & JSON Schema",
    category: "API Design",
    rawIdea: "Generate a complete REST API specification with status codes, error payloads, and JSON schema for user authentication with JWT",
    defaultPersona: "architect",
    defaultFormat: "json",
  },
];

// ============================================================================
// MASTER PROMPT GENERATOR ENGINE (Client-Side $0 Cost)
// ============================================================================

function generateMasterPrompt(
  rawIdea: string,
  model: TargetModel,
  framework: PromptFramework,
  personaId: TonePersona,
  format: OutputFormat,
  includeClarifyingQuestions: boolean,
  includeStrictNegativeRules: boolean,
  includeReasoningSteps: boolean
): string {
  const cleanIdea = rawIdea.trim() || "Help me execute this objective with maximum precision and depth.";
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];

  const formatLabels: Record<OutputFormat, string> = {
    markdown: "Clean Markdown with descriptive headers, bullet points, and high-visibility callouts",
    checklist: "Actionable, numbered step-by-step checklist prioritized by impact and difficulty",
    code: "Production-ready, battle-tested code with full types, inline comments, and zero placeholders",
    json: "Strict RFC-compliant JSON with typed schema and zero trailing comments",
    stepbystep: "Comprehensive sequential walkthrough with prerequisite checks and verification milestones",
  };

  // 1. CLAUDE 3.5 SONNET FORMAT (Anthropic XML Tag Architecture)
  if (model === "claude") {
    let p = `<role>\n`;
    p += `You are an elite ${persona.roleTitle}.\n`;
    p += `Your communication style must be: ${persona.toneDescription}.\n`;
    p += `</role>\n\n`;

    p += `<context_and_objective>\n`;
    p += `The user requires expert execution of the following mission:\n`;
    p += `"${cleanIdea}"\n`;
    p += `</context_and_objective>\n\n`;

    if (includeReasoningSteps || framework === "cot") {
      p += `<thinking_process>\n`;
      p += `Before generating your final response, analyze the problem systematically inside <thinking> tags:\n`;
      p += `1. Identify key constraints, hidden assumptions, and potential edge cases.\n`;
      p += `2. Break down the solution into clear architectural components.\n`;
      p += `3. Evaluate trade-offs and select the highest-leverage approach.\n`;
      p += `</thinking_process>\n\n`;
    }

    p += `<instructions>\n`;
    p += `Deliver a master-grade solution that thoroughly fulfills the objective.\n`;
    p += `- Structure your output using: ${formatLabels[format]}.\n`;
    p += `- Focus on real-world practicality, concrete specifics, and immediate applicability.\n`;
    if (includeClarifyingQuestions) {
      p += `- If critical variables or specifications are missing to achieve an optimal outcome, state reasonable working assumptions first, then provide 2-3 targeted clarifying questions at the conclusion.\n`;
    }
    p += `</instructions>\n\n`;

    if (includeStrictNegativeRules) {
      p += `<strict_rules>\n`;
      p += `- NEVER use conversational filler ("Sure, I can help with that!", "In today's fast-paced world"), clichés, or introductory throat-clearing.\n`;
      p += `- Do NOT provide high-level surface advice when concrete, actionable depth is required.\n`;
      p += `- Jump directly into the solution starting with the primary deliverable.\n`;
      p += `</strict_rules>\n\n`;
    }

    p += `<output_format>\n`;
    p += `Format your final response adhering strictly to: ${formatLabels[format]}.\n`;
    p += `</output_format>`;
    return p;
  }

  // 2. CHATGPT / DEEPSEEK / GEMINI / UNIVERSAL FORMAT
  let result = `### ROLE & PERSONA\n`;
  result += `You are an elite ${persona.roleTitle}.\n`;
  result += `**Communication Style:** ${persona.toneDescription}.\n\n`;

  result += `### CORE OBJECTIVE\n`;
  result += `Your mission is to deliver an exhaustive, highest-caliber response to the following task:\n`;
  result += `> "${cleanIdea}"\n\n`;

  if (framework === "cot" || includeReasoningSteps) {
    result += `### REASONING PROTOCOL (THINK STEP-BY-STEP)\n`;
    result += `1. **Deconstruction:** Identify all explicit and implicit requirements within the prompt.\n`;
    result += `2. **Architectural Design:** Formulate the optimal approach, considering edge cases and failure modes.\n`;
    result += `3. **Execution:** Produce the final deliverable with uncompromising depth and precision.\n\n`;
  }

  result += `### EXECUTION GUIDELINES\n`;
  result += `- **Deliverable Format:** ${formatLabels[format]}.\n`;
  result += `- **Depth Level:** Provide deep, comprehensive substance rather than high-level surface advice.\n`;
  result += `- **Quality Standard:** The output should be production-ready and immediately usable without requiring major rewrites.\n\n`;

  if (includeStrictNegativeRules) {
    result += `### STRICT CONSTRAINTS & GUARDRAILS\n`;
    result += `- **NO Fluff:** Avoid conversational openers ("Certainly!", "Great question!"), clichés, or generic summaries.\n`;
    result += `- **NO Hallucinated Certainty:** If a specific parameter is unknown, state reasonable assumptions clearly.\n`;
    result += `- **Direct Execution:** Start directly with the response content.\n\n`;
  }

  if (includeClarifyingQuestions) {
    result += `### CLARIFYING FOLLOW-UP\n`;
    result += `At the conclusion of your response, list 2-3 high-impact follow-up questions that would unlock even deeper customization for the user's workflow.\n`;
  }

  return result.trim();
}

// ============================================================================
// MAIN COMPONENT: PROMPT BUILDER STUDIO
// ============================================================================

export default function PromptBuilderStudio() {
  // Input State
  const [rawIdea, setRawIdea] = useState<string>(SAMPLE_IDEAS[0].rawIdea);

  // Configuration State
  const [targetModel, setTargetModel] = useState<TargetModel>("claude");
  const [framework, setFramework] = useState<PromptFramework>("create");
  const [persona, setPersona] = useState<TonePersona>("architect");
  const [format, setFormat] = useState<OutputFormat>("checklist");

  // Feature Toggles
  const [includeClarifyingQuestions, setIncludeClarifyingQuestions] = useState<boolean>(true);
  const [includeStrictNegativeRules, setIncludeStrictNegativeRules] = useState<boolean>(true);
  const [includeReasoningSteps, setIncludeReasoningSteps] = useState<boolean>(true);

  // Mobile Navigation Tabs
  const [mobileTab, setMobileTab] = useState<"builder" | "output" | "presets">("output");

  // Custom Dropdown State
  const [isPersonaOpen, setIsPersonaOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Outside click listener for custom persona dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPersonaOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Feedback State
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger Toast (Centered below navbar)
  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2200);
  };

  // Computed Master Prompt
  const generatedPrompt = useMemo(() => {
    return generateMasterPrompt(
      rawIdea,
      targetModel,
      framework,
      persona,
      format,
      includeClarifyingQuestions,
      includeStrictNegativeRules,
      includeReasoningSteps
    );
  }, [
    rawIdea,
    targetModel,
    framework,
    persona,
    format,
    includeClarifyingQuestions,
    includeStrictNegativeRules,
    includeReasoningSteps,
  ]);

  // Words and Estimated Token Count
  const stats = useMemo(() => {
    const wordCount = generatedPrompt.trim().split(/\s+/).filter(Boolean).length;
    const estimatedTokens = Math.round(wordCount * 1.33);
    return { wordCount, estimatedTokens };
  }, [generatedPrompt]);

  // Copy Action
  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedSuccess(true);
    triggerToast("Master prompt copied to clipboard!");
    setTimeout(() => {
      setCopiedSuccess(false);
    }, 2500);
  }, [generatedPrompt]);

  // Launch in ChatGPT
  const handleOpenChatGPT = () => {
    handleCopyPrompt();
    const encoded = encodeURIComponent(generatedPrompt);
    window.open(`https://chatgpt.com/?q=${encoded.slice(0, 1800)}`, "_blank");
  };

  // Launch in Claude
  const handleOpenClaude = () => {
    handleCopyPrompt();
    window.open("https://claude.ai/new", "_blank");
  };

  // Launch in DeepSeek
  const handleOpenDeepSeek = () => {
    handleCopyPrompt();
    window.open("https://chat.deepseek.com/", "_blank");
  };

  // Download .md File
  const handleDownloadMarkdown = () => {
    const blob = new Blob([generatedPrompt], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `master-prompt-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast("Saved prompt as Markdown file!");
  };

  // Load Preset
  const handleLoadPreset = (preset: SampleIdea) => {
    setRawIdea(preset.rawIdea);
    setPersona(preset.defaultPersona);
    setFormat(preset.defaultFormat);
    setMobileTab("output");
    triggerToast(`Loaded: ${preset.title}`);
  };

  // Auto-Enhance Button
  const handleInstantEnhance = () => {
    setIncludeReasoningSteps(true);
    setIncludeStrictNegativeRules(true);
    setIncludeClarifyingQuestions(true);
    setFramework("cot");
    triggerToast("Enhanced with Chain-of-Thought & negative guardrails!");
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col gap-5 p-3 sm:p-5 md:p-6 lg:p-8 max-w-[1720px] mx-auto text-slate-100 pb-28 md:pb-10 select-none sm:select-auto">
      {/* Toast Notification (Safely below navbar) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0a0f1d]/95 border border-cyan-500/40 text-cyan-200 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{toastMessage}</span>
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0d1a]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.25)] flex-shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                AI Mega-Prompt Builder
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Multi-LLM Protocol Console
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Transform simple 1-line ideas into master prompt engineering protocols for Claude, ChatGPT, DeepSeek, and Gemini.
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 relative z-10">
          <button
            onClick={handleInstantEnhance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-purple-200 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-400/50 transition-all active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            title="Auto-inject Chain-of-Thought reasoning and negative guardrails"
          >
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span>Auto Enhance</span>
          </button>

          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all active:scale-95"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Master Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SEGMENTED TABS (Strict 320px - 430px Friendly) */}
      <div className="flex md:hidden items-center p-1 rounded-xl bg-[#090c17] border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("builder")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "builder"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configure</span>
        </button>
        <button
          onClick={() => setMobileTab("output")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "output"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Mega Prompt</span>
        </button>
        <button
          onClick={() => setMobileTab("presets")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "presets"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Settings */}
        <div
          className={cn(
            "lg:col-span-5 flex-col gap-5",
            mobileTab === "output" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Panel 1: Simple Task or Raw Idea */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Your Simple Task or Idea</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Step 1</span>
            </div>
            <textarea
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              rows={3}
              placeholder="e.g. Write a cold outreach pitch for my SaaS to marketing leads..."
              className="w-full bg-black/50 border border-white/[0.08] rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-y leading-relaxed"
            />
          </div>

          {/* Panel 2: Target AI Model Architecture */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Target AI Model Architecture</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Step 2</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TARGET_MODELS.map((m) => {
                const isSelected = targetModel === m.id;
                const IconComponent = m.iconComponent;
                return (
                  <button
                    key={m.id}
                    onClick={() => setTargetModel(m.id)}
                    className={cn(
                      "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all",
                      isSelected
                        ? "bg-white/[0.08] border-cyan-500/60 text-white shadow-sm"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <IconComponent className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{m.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">{m.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel 3: Persona, Framework & Output Format */}
          <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Persona & Methodology</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Step 3</span>
            </div>

            {/* AI Expert Persona Selector (Custom Obsidian Dropdown) */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-xs font-medium text-slate-300">AI Expert Role</label>
              
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                className={cn(
                  "w-full bg-black/50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-left flex items-center justify-between transition-all",
                  isPersonaOpen
                    ? "border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30 text-white"
                    : "border-white/[0.08] hover:border-white/20 text-slate-200"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                  <span className="font-semibold text-slate-100">{PERSONAS.find((p) => p.id === persona)?.name}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0",
                    isPersonaOpen && "rotate-180 text-cyan-400"
                  )}
                />
              </button>

              {/* Custom Popover Menu */}
              {isPersonaOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#090d1a]/95 border border-white/[0.12] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-1.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1 max-h-[290px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  {PERSONAS.map((p) => {
                    const isSelected = persona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPersona(p.id);
                          setIsPersonaOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all group",
                          isSelected
                            ? "bg-cyan-600/20 text-white border border-cyan-500/40 shadow-sm"
                            : "hover:bg-white/[0.05] text-slate-300 hover:text-white"
                        )}
                      >
                        <div className="flex flex-col pr-2 min-w-0">
                          <span className={cn("text-xs font-semibold truncate", isSelected && "text-cyan-300")}>
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate mt-0.5">
                            {p.toneDescription}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Methodology Framework Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Prompting Methodology</label>
              <div className="grid grid-cols-2 gap-2">
                {FRAMEWORKS.map((fw) => {
                  const isSelected = framework === fw.id;
                  return (
                    <button
                      key={fw.id}
                      onClick={() => setFramework(fw.id)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all",
                        isSelected
                          ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-sm"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <div className="text-xs font-bold text-slate-200">{fw.name}</div>
                      <div className="text-[10px] text-cyan-400 mt-0.5 font-medium">{fw.tag}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Deliverable Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFormat("markdown")}
                  className={cn(
                    "py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all",
                    format === "markdown"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setFormat("checklist")}
                  className={cn(
                    "py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all",
                    format === "checklist"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Checklist
                </button>
                <button
                  onClick={() => setFormat("code")}
                  className={cn(
                    "py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all",
                    format === "code"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Code / Dev
                </button>
              </div>
            </div>

            {/* Quality Guardrails (Tactile Custom Checkboxes) */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Negative Guardrails & Protocols
              </span>

              {/* Guardrail 1 */}
              <button
                type="button"
                onClick={() => setIncludeStrictNegativeRules(!includeStrictNegativeRules)}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all group active:scale-[0.99]",
                  includeStrictNegativeRules
                    ? "bg-cyan-950/20 border-cyan-500/40 text-white shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-md flex items-center justify-center transition-all flex-shrink-0",
                      includeStrictNegativeRules
                        ? "bg-cyan-500 border border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                        : "bg-black/50 border border-white/20 group-hover:border-white/40"
                    )}
                  >
                    {includeStrictNegativeRules && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium truncate">
                    Ban conversational filler and generic introductions
                  </span>
                </div>
                <ShieldCheck
                  className={cn(
                    "w-3.5 h-3.5 flex-shrink-0 ml-2 transition-colors",
                    includeStrictNegativeRules ? "text-cyan-400" : "text-slate-600"
                  )}
                />
              </button>

              {/* Guardrail 2 */}
              <button
                type="button"
                onClick={() => setIncludeReasoningSteps(!includeReasoningSteps)}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all group active:scale-[0.99]",
                  includeReasoningSteps
                    ? "bg-cyan-950/20 border-cyan-500/40 text-white shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-md flex items-center justify-center transition-all flex-shrink-0",
                      includeReasoningSteps
                        ? "bg-cyan-500 border border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                        : "bg-black/50 border border-white/20 group-hover:border-white/40"
                    )}
                  >
                    {includeReasoningSteps && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium truncate">
                    Force step-by-step reasoning protocol
                  </span>
                </div>
                <BrainCircuit
                  className={cn(
                    "w-3.5 h-3.5 flex-shrink-0 ml-2 transition-colors",
                    includeReasoningSteps ? "text-cyan-400" : "text-slate-600"
                  )}
                />
              </button>

              {/* Guardrail 3 */}
              <button
                type="button"
                onClick={() => setIncludeClarifyingQuestions(!includeClarifyingQuestions)}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all group active:scale-[0.99]",
                  includeClarifyingQuestions
                    ? "bg-cyan-950/20 border-cyan-500/40 text-white shadow-sm"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-md flex items-center justify-center transition-all flex-shrink-0",
                      includeClarifyingQuestions
                        ? "bg-cyan-500 border border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                        : "bg-black/50 border border-white/20 group-hover:border-white/40"
                    )}
                  >
                    {includeClarifyingQuestions && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium truncate">
                    Request clarifying questions for missing parameters
                  </span>
                </div>
                <Lightbulb
                  className={cn(
                    "w-3.5 h-3.5 flex-shrink-0 ml-2 transition-colors",
                    includeClarifyingQuestions ? "text-cyan-400" : "text-slate-600"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Panel 4: Sample Presets */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/85 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Instant Blueprints</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_IDEAS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLoadPreset(item)}
                  className="flex flex-col p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/40 text-left transition-all group"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-cyan-400 mt-0.5 font-medium">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Master Prompt Live Output */}
        <div
          className={cn(
            "lg:col-span-7 flex-col gap-4",
            mobileTab !== "output" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Master Prompt Card Frame */}
          <div className="flex flex-col rounded-2xl border border-white/[0.1] bg-[#070914] overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Top Bar with Launchers */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#05070e] border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Engineered Master Prompt
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-mono">
                  {stats.wordCount} words &bull; ~{stats.estimatedTokens} tokens
                </span>
              </div>

              {/* Direct LLM Launch Handlers */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleOpenChatGPT}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
                  title="Copy and launch in ChatGPT"
                >
                  <span>ChatGPT</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={handleOpenClaude}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
                  title="Copy and launch in Claude"
                >
                  <span>Claude</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={handleOpenDeepSeek}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all"
                  title="Copy and launch in DeepSeek"
                >
                  <span>DeepSeek</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                  title="Download .md prompt file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt Content Terminal Box */}
            <div className="relative p-4 sm:p-6 bg-[#060812] max-h-[620px] overflow-y-auto font-mono text-xs sm:text-[13px] leading-relaxed text-slate-200 select-text scrollbar-thin scrollbar-thumb-white/10 whitespace-pre-wrap">
              {generatedPrompt}
            </div>

            {/* Bottom Status & 1-Click Copy Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#05070e] border-t border-white/[0.08]">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Optimized for <strong className="text-cyan-300">{TARGET_MODELS.find(m => m.id === targetModel)?.name}</strong> &bull; Zero prompt tokens wasted
              </div>

              <button
                onClick={handleCopyPrompt}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Master Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING ACTION HUD (Fixed to Bottom on small screens) */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 flex items-center justify-between p-2 rounded-2xl bg-[#070a14]/95 border border-white/[0.12] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs font-bold text-white font-mono">
            {stats.wordCount}w
          </span>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
            ~{stats.estimatedTokens} tok
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenChatGPT}
            className="p-2 rounded-xl bg-white/[0.06] text-emerald-400 border border-white/[0.08] active:scale-95 transition-all text-xs font-semibold"
            title="Launch in ChatGPT"
          >
            ChatGPT
          </button>

          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-xs border border-cyan-400/40 active:scale-95 transition-all shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedSuccess ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
