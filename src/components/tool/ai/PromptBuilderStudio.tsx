"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  BrainCircuit,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sliders,
  Eye,
  Zap,
  ArrowRight,
  Bot,
  ExternalLink,
  CheckCircle2,
  Code2,
  Send,
  FileText,
  Layers,
  Wand2,
  ShieldCheck,
  ListOrdered,
  ChevronRight,
  Lightbulb,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & FRAMEWORK DEFINITIONS
// ============================================================================

export type TargetModel = "claude" | "chatgpt" | "gemini" | "deepseek" | "universal";
export type PromptFramework = "create" | "cot" | "rtf" | "ape";
export type TonePersona = "expert" | "architect" | "copywriter" | "academic" | "executive" | "mentor";
export type OutputFormat = "markdown" | "json" | "checklist" | "code" | "stepbystep";

interface ModelConfig {
  id: TargetModel;
  name: string;
  badge: string;
  color: string;
  icon: string;
}

const TARGET_MODELS: ModelConfig[] = [
  {
    id: "claude",
    name: "Claude 3.5 Sonnet",
    badge: "XML TAGS",
    color: "#d97706", // Amber
    icon: "🎭",
  },
  {
    id: "chatgpt",
    name: "ChatGPT / GPT-4o",
    badge: "STRUCTURED",
    color: "#10b981", // Emerald
    icon: "🟢",
  },
  {
    id: "deepseek",
    name: "DeepSeek R1 / V3",
    badge: "REASONING",
    color: "#3b82f6", // Blue
    icon: "🐳",
  },
  {
    id: "gemini",
    name: "Google Gemini 1.5",
    badge: "MULTIMODAL",
    color: "#8b5cf6", // Purple
    icon: "✨",
  },
  {
    id: "universal",
    name: "Universal AI",
    badge: "ALL LLMS",
    color: "#06b6d4", // Cyan
    icon: "⚡",
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
    tag: "MOST POPULAR",
    description: "Character, Request, Examples, Adjustments, Type, and Extras",
  },
  {
    id: "cot",
    name: "Chain of Thought (CoT)",
    tag: "DEEP REASONING",
    description: "Forces the model to break down logic step-by-step before answering",
  },
  {
    id: "rtf",
    name: "Role - Task - Format",
    tag: "FAST & DIRECT",
    description: "Crisp, hyper-efficient directive without fluff",
  },
  {
    id: "ape",
    name: "Action - Purpose - Expectation",
    tag: "BUSINESS GRADE",
    description: "Defines the exact mission, underlying business goal, and quality criteria",
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
    roleTitle: "World-Class Subject Matter Specialist with 15+ years of industry leadership",
    toneDescription: "Authoritative, mathematically precise, evidence-backed, with zero fluff",
  },
  {
    id: "architect",
    name: "Senior Software Architect",
    roleTitle: "Staff Principal Software Architect & Systems Engineer",
    toneDescription: "Technically rigorous, scalable, following clean code and strict typing conventions",
  },
  {
    id: "copywriter",
    name: "Elite Conversion Copywriter",
    roleTitle: "Elite Direct-Response Copywriter and Creator Growth Strategist",
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
    name: "Executive Strategy Consultant",
    roleTitle: "Senior Management Consultant (McKinsey / BCG caliber)",
    toneDescription: "High-ROI, executive summary first, bulleted findings, and risk-mitigated action steps",
  },
  {
    id: "mentor",
    name: "Master Educator & Teacher",
    roleTitle: "Master Educator with a talent for conceptual clarity",
    toneDescription: "Approachable, intuitive, using clear real-world analogies and scaffolding",
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
    rawIdea: "Write a 4-sentence personalized cold email to pitch our SaaS tool to Head of Marketing",
    defaultPersona: "copywriter",
    defaultFormat: "markdown",
  },
  {
    id: "db-schema",
    title: "PostgreSQL Database Schema",
    category: "Backend & Systems",
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
    title: "Firm But Polite Refund Request",
    category: "Business",
    rawIdea: "Draft an email requesting a full refund for a cancelled flight that the airline refused to reimburse",
    defaultPersona: "executive",
    defaultFormat: "markdown",
  },
  {
    id: "api-schema",
    title: "REST API Endpoint & JSON Schema",
    category: "API Design",
    rawIdea: "Generate a complete REST API spec with status codes and error responses for user authentication with JWT",
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
  const cleanIdea = rawIdea.trim() || "Help me achieve this task with maximum quality and detail.";
  const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];

  const formatLabels: Record<OutputFormat, string> = {
    markdown: "Clean Markdown with descriptive headers, bullet points, and high-visibility callouts",
    json: "Strict RFC-compliant JSON with typed schema and zero trailing comments",
    checklist: "Actionable, numbered step-by-step checklist prioritized by impact and difficulty",
    code: "Production-ready, battle-tested code with full types, inline explanations, and zero placeholders",
    stepbystep: "Comprehensive sequential walkthrough with prerequisite checks and verification milestones",
  };

  // 1. CLAUDE 3.5 SONNET FORMAT (Optimized for Anthropic XML Tag Architecture)
  if (model === "claude") {
    let p = `<role>\n`;
    p += `You are an elite ${persona.roleTitle}.\n`;
    p += `Your communication tone must be: ${persona.toneDescription}.\n`;
    p += `</role>\n\n`;

    p += `<context_and_objective>\n`;
    p += `The user needs expert assistance with the following mission:\n`;
    p += `"${cleanIdea}"\n`;
    p += `</context_and_objective>\n\n`;

    if (includeReasoningSteps || framework === "cot") {
      p += `<thinking_process>\n`;
      p += `Before providing your final response, analyze the problem systematically inside <thinking> tags:\n`;
      p += `1. Identify key constraints, hidden assumptions, and potential edge cases.\n`;
      p += `2. Break down the solution into logical structural components.\n`;
      p += `3. Evaluate potential trade-offs and select the highest-leverage approach.\n`;
      p += `</thinking_process>\n\n`;
    }

    p += `<instructions>\n`;
    p += `Deliver a masterclass solution that completely fulfills the objective.\n`;
    p += `- Structure your output using: ${formatLabels[format]}.\n`;
    p += `- Emphasize real-world practicality, concrete specifics, and immediate applicability.\n`;
    if (includeClarifyingQuestions) {
      p += `- If critical information or variables are missing to achieve an optimal outcome, state your recommended assumptions first, then provide 2-3 targeted clarifying questions at the end.\n`;
    }
    p += `</instructions>\n\n`;

    if (includeStrictNegativeRules) {
      p += `<strict_rules>\n`;
      p += `- NEVER use conversational pleasantries, generic filler ("Sure, I can help with that!", "In today's fast-paced world"), or introductory throat-clearing.\n`;
      p += `- Do NOT provide generic, high-level summaries when concrete, actionable depth is required.\n`;
      p += `- Jump directly into the solution starting with the primary deliverable.\n`;
      p += `</strict_rules>\n\n`;
    }

    p += `<output_format>\n`;
    p += `Format your final response cleanly adhering to: ${formatLabels[format]}.\n`;
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
// MAIN COMPONENT
// ============================================================================

export default function PromptBuilderStudio() {
  // Input Idea
  const [rawIdea, setRawIdea] = useState<string>(SAMPLE_IDEAS[0].rawIdea);

  // Model & Framework Selectors
  const [targetModel, setTargetModel] = useState<TargetModel>("claude");
  const [framework, setFramework] = useState<PromptFramework>("create");
  const [persona, setPersona] = useState<TonePersona>("architect");
  const [format, setFormat] = useState<OutputFormat>("checklist");

  // Feature Toggles
  const [includeClarifyingQuestions, setIncludeClarifyingQuestions] = useState<boolean>(true);
  const [includeStrictNegativeRules, setIncludeStrictNegativeRules] = useState<boolean>(true);
  const [includeReasoningSteps, setIncludeReasoningSteps] = useState<boolean>(true);

  // Mobile navigation tabs
  const [mobileTab, setMobileTab] = useState<"builder" | "output" | "presets">("output");

  // Feedback State
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Copy Prompt
  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedSuccess(true);
    setToastMessage("Master prompt copied to clipboard!");
    setTimeout(() => {
      setCopiedSuccess(false);
      setToastMessage(null);
    }, 2500);
  }, [generatedPrompt]);

  // Open in ChatGPT
  const handleOpenChatGPT = () => {
    handleCopyPrompt();
    const encoded = encodeURIComponent(generatedPrompt);
    window.open(`https://chatgpt.com/?q=${encoded.slice(0, 1800)}`, "_blank");
  };

  // Open in Claude
  const handleOpenClaude = () => {
    handleCopyPrompt();
    window.open("https://claude.ai/new", "_blank");
  };

  // Download as .md file
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

    setToastMessage("Master prompt saved as Markdown!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load Preset
  const handleLoadPreset = (preset: SampleIdea) => {
    setRawIdea(preset.rawIdea);
    setPersona(preset.defaultPersona);
    setFormat(preset.defaultFormat);
    setMobileTab("output");
    setToastMessage(`Loaded: ${preset.title}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // One-Click Enhance Button
  const handleInstantEnhance = () => {
    setIncludeReasoningSteps(true);
    setIncludeStrictNegativeRules(true);
    setIncludeClarifyingQuestions(true);
    setFramework("cot");
    setToastMessage("Enhanced prompt with Chain-of-Thought & Guardrails!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col gap-6 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[1700px] mx-auto text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                AI Mega-Prompt Builder
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                100% Free • Multi-LLM
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Turn simple 1-line ideas into master-grade prompt engineering protocols for ChatGPT, Claude, Gemini, and DeepSeek.
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleInstantEnhance}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-purple-200 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 hover:border-purple-400/50 transition-all active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            title="Add advanced reasoning protocols and edge-case guards"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Auto Enhance</span>
          </button>

          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all active:scale-95"
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

      {/* Mobile Segmented Navigation Tabs */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-xl bg-slate-900/80 border border-white/[0.08]">
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
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* Main Studio Grid: Left Configuration + Right Live Master Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Configuration Controls */}
        <div
          className={cn(
            "lg:col-span-5 flex-col gap-6",
            mobileTab === "output" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Panel 1: Your Raw 1-Line Idea */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Your Simple Task or Idea</h3>
              </div>
              <span className="text-[11px] text-slate-500">Step 1</span>
            </div>
            <textarea
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              rows={3}
              placeholder="e.g. Write an email to pitch my SaaS product to marketing leads..."
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-y leading-relaxed"
            />
          </div>

          {/* Panel 2: Target AI Model */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Target AI Model Architecture</h3>
              </div>
              <span className="text-[11px] text-slate-500">Step 2</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TARGET_MODELS.map((m) => {
                const isSelected = targetModel === m.id;
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
                      <span>{m.icon}</span>
                      <span className="truncate">{m.name.split(" ")[0]}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">{m.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel 3: Persona, Framework & Format */}
          <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Persona & Formatting</h3>
              </div>
              <span className="text-[11px] text-slate-500">Step 3</span>
            </div>

            {/* Persona Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">AI Expert Role</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as TonePersona)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Framework Selector */}
            <div className="space-y-2">
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
                      <div className="text-[10px] text-cyan-400 mt-0.5">{fw.tag}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Expected Output Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFormat("markdown")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all",
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
                    "py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all",
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
                    "py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all",
                    format === "code"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  )}
                >
                  Code / Dev
                </button>
              </div>
            </div>

            {/* Quality Guardrail Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStrictNegativeRules}
                  onChange={(e) => setIncludeStrictNegativeRules(e.target.checked)}
                  className="rounded border-white/20 text-cyan-500 focus:ring-cyan-500 bg-black/40"
                />
                <span>Ban conversational filler and generic introductions</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeReasoningSteps}
                  onChange={(e) => setIncludeReasoningSteps(e.target.checked)}
                  className="rounded border-white/20 text-cyan-500 focus:ring-cyan-500 bg-black/40"
                />
                <span>Force step-by-step reasoning protocol</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeClarifyingQuestions}
                  onChange={(e) => setIncludeClarifyingQuestions(e.target.checked)}
                  className="rounded border-white/20 text-cyan-500 focus:ring-cyan-500 bg-black/40"
                />
                <span>Request clarifying questions for missing variables</span>
              </label>
            </div>
          </div>

          {/* Panel 4: Sample Presets */}
          <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Instant Presets</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_IDEAS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLoadPreset(item)}
                  className="flex flex-col p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {item.title}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-cyan-400">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {item.rawIdea}
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
          <div className="flex flex-col rounded-2xl border border-white/[0.1] bg-[#080914] overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Stage Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Engineered Master Prompt
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                  {generatedPrompt.split(/\s+/).length} words
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-950/80 border-t border-white/[0.08]">
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
    </div>
  );
}
