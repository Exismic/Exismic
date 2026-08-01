"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Download,
  FileText,
  Lightbulb,
  Search,
  ChevronDown,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OutlineSection {
  title: string;
  topicSentence: string;
  points: string[];
}

interface OutlineResult {
  thesisOptions: string[];
  selectedThesisIndex: number;
  sections: OutlineSection[];
  scholarKeywords: string[];
  suggestedSources: string[];
}

// Custom Glassmorphic Dropdown Component
function CustomDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  icon: Icon
}: {
  label: string;
  value: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (val: T) => void;
  icon?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 text-white text-xs font-semibold flex items-center justify-between transition-all shadow-inner focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-4 h-4 text-amber-400 shrink-0" />}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-amber-400"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-2xl bg-neutral-900/95 border border-amber-500/30 backdrop-blur-xl shadow-2xl space-y-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer",
                value === opt.value
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              )}
            >
              <div className="pr-2">
                <div className="font-semibold">{opt.label}</div>
                {opt.description && (
                  <div className="text-[10px] text-neutral-400 font-normal leading-tight mt-0.5">
                    {opt.description}
                  </div>
                )}
              </div>
              {value === opt.value && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EssayOutlineBuilder() {
  const [topic, setTopic] = useState("");
  const [paperType, setPaperType] = useState<"argumentative" | "persuasive" | "expository" | "research">("argumentative");
  const [academicTone, setAcademicTone] = useState<"academic" | "analytical" | "policy" | "philosophical">("academic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<OutlineResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiSource, setAiSource] = useState<"ai" | "nlp">("ai");

  // Call Backend API Endpoint powered by Exismic AI Engine
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/tools/student/essay-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          paperType,
          academicTone
        })
      });

      const resData = await response.json();

      if (response.ok && resData.data && resData.data.sections) {
        setResult({
          thesisOptions: resData.data.thesisOptions || [],
          selectedThesisIndex: 0,
          sections: resData.data.sections || [],
          scholarKeywords: resData.data.scholarKeywords || [],
          suggestedSources: resData.data.suggestedSources || []
        });
        setAiSource("ai");
      } else {
        runFallbackNLP();
      }
    } catch (err: any) {
      runFallbackNLP();
    } finally {
      setIsGenerating(false);
    }
  };

  // Local fallback engine
  const runFallbackNLP = () => {
    const cleanTopic = topic.trim();
    const words = cleanTopic.split(/\s+/).filter((w) => w.length > 3);
    const coreSubject = words.slice(0, 4).join(" ") || cleanTopic;

    const thesisOptions = [
      `While critics contend that ${cleanTopic} introduces complex systemic challenges, a balanced framework combining regulatory oversight and structured adaptation yields net positive outcomes for society.`,
      `The rapid evolution of ${cleanTopic} fundamentally redefines contemporary standards, demonstrating that proactive integration is essential for sustainable progress.`,
      `An empirical examination of ${cleanTopic} reveals that its primary benefits outweigh speculative risks when implemented alongside strong ethical guidelines.`
    ];

    const sections: OutlineSection[] = [
      {
        title: "I. Introduction & Contextual Background",
        topicSentence: `Setting the stage for analyzing ${coreSubject} in modern society.`,
        points: [
          `Hook: Highlight a recent milestone, statistical trend, or real-world example surrounding ${cleanTopic}.`,
          `Background: Define key terminology and explain why ${coreSubject} has become a central academic debate.`,
          `Thesis Statement: Present clear argument defending the necessity of structured integration.`
        ]
      },
      {
        title: "II. Primary Supporting Pillar: Direct Positive Impact",
        topicSentence: `Evaluating how ${coreSubject} enhances efficiency, access, and overall capability.`,
        points: [
          `Primary Argument: Demonstrate how ${coreSubject} addresses longstanding systemic inefficiencies.`,
          `Empirical Evidence: Cite research findings, case studies, or statistical data illustrating success.`,
          `Analytical Connection: Explain how this evidence validates the core thesis statement.`
        ]
      },
      {
        title: "III. Secondary Supporting Pillar: Structural & Long-Term Viability",
        topicSentence: `Examining secondary institutional and economic advantages of adopting ${coreSubject}.`,
        points: [
          `Secondary Argument: Discuss broader societal, academic, or industry benefits over a 5-10 year horizon.`,
          `Comparative Analysis: Contrast traditional methods against modern frameworks incorporating ${coreSubject}.`,
          `Synthesis: Reiterate why structural adoption remains superior to stagnation.`
        ]
      },
      {
        title: "IV. Counterargument & Rebuttal Analysis",
        topicSentence: `Addressing opposition concerns regarding ${coreSubject} while reinforcing thesis validity.`,
        points: [
          `Counterargument: Acknowledge legitimate concerns regarding ethical risks, costs, or implementation hurdles.`,
          `Rebuttal & Refutation: Present counter-evidence demonstrating that proactive mitigation resolves opposition claims.`,
          `Nuanced Perspective: Show how acknowledging criticism strengthens the overall academic defense.`
        ]
      },
      {
        title: "V. Conclusion & Forward-Looking Synthesis",
        topicSentence: `Synthesizing key insights to deliver a decisive final conclusion.`,
        points: [
          `Restated Thesis: Rephrase the central thesis statement using fresh academic vocabulary.`,
          `Summary of Evidence: Recapitulate main supporting pillars from Sections II, III, and IV.`,
          `Final Call to Action: Outline recommendations for researchers, policy makers, and institutions.`
        ]
      }
    ];

    setResult({
      thesisOptions,
      selectedThesisIndex: 0,
      sections,
      scholarKeywords: [`"${coreSubject}" systematic review`, `"${cleanTopic}" ethical considerations`],
      suggestedSources: ["Journal of Academic Research (JSTOR)", "IEEE Policy Archives"]
    });
    setAiSource("nlp");
  };

  const handleCopy = () => {
    if (!result) return;
    const currentThesis = result.thesisOptions[result.selectedThesisIndex];
    const text =
      `THESIS STATEMENT:\n"${currentThesis}"\n\n` +
      `PAPER OUTLINE (${paperType.toUpperCase()}):\n` +
      result.sections
        .map(
          (s) =>
            `${s.title}\nTopic Sentence: ${s.topicSentence}\n` +
            s.points.map((p) => `  • ${p}`).join("\n")
        )
        .join("\n\n") +
      `\n\nRECOMMENDED SCHOLAR SEARCH TERMS:\n` +
      result.scholarKeywords.map((k) => `- ${k}`).join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const currentThesis = result.thesisOptions[result.selectedThesisIndex];
    const text =
      `ACADEMIC ESSAY OUTLINE\nTopic: ${topic}\nFormat: ${paperType}\nTone: ${academicTone}\n\n` +
      `THESIS STATEMENT:\n"${currentThesis}"\n\n` +
      `OUTLINE STRUCTURE:\n\n` +
      result.sections
        .map(
          (s) =>
            `${s.title}\nTopic Sentence: ${s.topicSentence}\n` +
            s.points.map((p) => `  • ${p}`).join("\n")
        )
        .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `essay-outline-${topic.slice(0, 15).replace(/\s+/g, "-")}.txt`;
    a.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Banner Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/60 via-purple-950/40 to-neutral-950 border border-amber-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" /> Exismic Academic AI Suite
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-400">
            <Cpu className="w-3.5 h-3.5 text-amber-400" /> Engine: Exismic Deep Neural v4.2
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Essay & Thesis Outline Builder
        </h1>
        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl leading-relaxed">
          Generate structured paragraph-by-paragraph essay outlines, customized thesis statement options, topic sentences, and Google Scholar search queries powered by Exismic AI Engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Controls Column */}
        <div className="lg:col-span-5 space-y-5 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Essay Topic or Research Prompt
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The ethical impact of artificial intelligence in higher education..."
              rows={4}
              className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed transition-all shadow-inner"
            />
          </div>

          {/* Custom Glassmorphic Styled Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomDropdown
              label="Paper Format Type"
              value={paperType}
              onChange={(val) => setPaperType(val as any)}
              icon={BookOpen}
              options={[
                { value: "argumentative", label: "Argumentative", description: "Claims, counterarguments & refutations" },
                { value: "persuasive", label: "Persuasive", description: "Stakeholder appeal & call to action" },
                { value: "expository", label: "Expository", description: "Objective analysis & mechanisms" },
                { value: "research", label: "Research Paper", description: "Abstract, methodology & findings" }
              ]}
            />

            <CustomDropdown
              label="Academic Tone"
              value={academicTone}
              onChange={(val) => setAcademicTone(val as any)}
              icon={SlidersHorizontal}
              options={[
                { value: "academic", label: "Standard Academic", description: "Formal scholarly vocabulary" },
                { value: "analytical", label: "Data & Empirical", description: "Metrics, evidence & facts" },
                { value: "policy", label: "Legal & Policy", description: "Regulatory & institutional governance" },
                { value: "philosophical", label: "Philosophical", description: "Ethical & conceptual inquiry" }
              ]}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs tracking-widest uppercase shadow-xl hover:shadow-amber-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Building Academic Outline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Essay Outline</span>
              </>
            )}
          </button>

          {/* Example Prompts */}
          <div className="pt-3 border-t border-neutral-800/80 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Try Example Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Ethical Impact of Generative AI in Higher Education",
                "Economics of Universal Basic Income",
                "Social Media Algorithms & Adolescent Mental Health",
                "Smart Grid Transition & Renewable Energy Storage"
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setTopic(example)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-amber-500/50 hover:text-white text-[11px] transition-all cursor-pointer"
                >
                  + {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl flex flex-col min-h-[480px]">
          {result ? (
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Exismic AI Generated Outline ({paperType.toUpperCase()})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all border border-neutral-700 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all border border-amber-500/40 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> TXT
                  </button>
                </div>
              </div>

              {/* Thesis Selection Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-neutral-950 border border-amber-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> AI Generated Thesis Options
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Select preferred angle</span>
                </div>
                <div className="space-y-2">
                  {result.thesisOptions.map((th, idx) => (
                    <button
                      key={idx}
                      onClick={() => setResult({ ...result, selectedThesisIndex: idx })}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer",
                        result.selectedThesisIndex === idx
                          ? "bg-amber-500/20 border-amber-500 text-amber-100 font-medium ring-1 ring-amber-500/40 shadow-md"
                          : "bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      )}
                    >
                      <span className="font-bold text-amber-400 mr-1.5">Option {idx + 1}:</span> "{th}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Outline Sections List */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {result.sections.map((sec, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-white text-sm tracking-tight">{sec.title}</h4>
                    </div>
                    <p className="text-xs text-amber-400/90 font-medium italic border-l-2 border-amber-500/50 pl-2.5 py-0.5">
                      Topic Sentence: "{sec.topicSentence}"
                    </p>
                    <ul className="space-y-1.5 text-neutral-300 text-xs list-disc pl-4 leading-relaxed">
                      {sec.points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Scholar Recommended Keywords */}
              {result.scholarKeywords && result.scholarKeywords.length > 0 && (
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                  <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-400" /> Recommended Google Scholar Search Queries
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.scholarKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-700 shadow-inner">
                <BookOpen className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="text-sm font-bold text-neutral-300">No Outline Generated Yet</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Enter your essay topic on the left to query Exismic AI for a structured thesis statement and paper outline.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
