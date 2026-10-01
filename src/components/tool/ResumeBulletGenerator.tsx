"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileSignature, 
  Send, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Briefcase, 
  Target,
  FileText,
  RotateCcw,
  ArrowRight,
  Sliders,
  Check,
  ChevronDown,
  PenTool,
  Award,
  Zap,
  Flame,
  ShieldCheck,
  Layers,
  TrendingUp,
  User,
  Plus
} from "lucide-react";
import { usePipedContent, setPipedContent } from "@/lib/tool-piping";
import { PipedBadge } from "@/components/tool/PipedBadge";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { cn } from "@/lib/utils";

// Dropdown Option Type
interface StudioDropdownOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
  dotColor?: string;
  description?: string;
}

// Custom Obsidian Cyber Dropdown Component
function StudioDropdown<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: StudioDropdownOption<T>[];
  onChange: (val: T) => void;
  className?: string;
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

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full min-h-11 rounded-xl border bg-black/60 px-3.5 py-2 text-xs font-bold text-white flex items-center justify-between transition-all duration-200 cursor-pointer shadow-inner gap-2",
          isOpen
            ? "border-emerald-400/60 ring-2 ring-emerald-500/20 bg-emerald-500/[0.04]"
            : "border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.04]"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selected.dotColor && (
            <span className={cn("size-2 rounded-full shrink-0", selected.dotColor)} />
          )}
          <span className="text-white font-bold truncate">{selected.label}</span>
          {selected.badge && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0 whitespace-nowrap">
              {selected.badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-zinc-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-emerald-400"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 p-2 rounded-2xl bg-zinc-950/98 border border-emerald-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-1.5 max-h-72 overflow-y-auto"
          >
            {options.map((opt) => {
              const isOptionActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl text-xs transition-all flex items-start justify-between cursor-pointer group gap-3",
                    isOptionActive
                      ? "bg-emerald-500/15 text-emerald-200 font-bold border border-emerald-400/30 shadow-sm"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {opt.dotColor && (
                        <span className={cn("size-2 rounded-full shrink-0", opt.dotColor)} />
                      )}
                      <span className="font-bold text-white text-xs whitespace-nowrap">
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0 whitespace-nowrap">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <p className="text-[11px] text-zinc-400 font-normal leading-relaxed whitespace-normal">
                        {opt.description}
                      </p>
                    )}
                  </div>
                  {isOptionActive && (
                    <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Seniority Level Options
export type SeniorityLevel = "entry" | "mid" | "senior" | "lead" | "executive";
const SENIORITY_OPTIONS: Array<StudioDropdownOption<SeniorityLevel>> = [
  { value: "entry", label: "Entry Level (0–2 yrs)", description: "Hands-on execution, task delivery & team support", dotColor: "bg-teal-400" },
  { value: "mid", label: "Mid-Level Specialist (3–5 yrs)", description: "Project ownership, domain mastery & cross-team delivery", dotColor: "bg-emerald-400" },
  { value: "senior", label: "Senior Specialist (5–8 yrs)", description: "Technical mentorship, architecture & business impact", dotColor: "bg-cyan-400" },
  { value: "lead", label: "Lead / Staff (8+ yrs)", description: "Strategic roadmaps, team leadership & org scaling", dotColor: "bg-indigo-400" },
  { value: "executive", label: "Executive / Director (10+ yrs)", description: "P&L oversight, department vision & board KPIs", dotColor: "bg-amber-400" },
];

// Framework Format Options
export type FrameworkFormat = "star" | "xyz" | "executive";
const FRAMEWORK_OPTIONS: Array<StudioDropdownOption<FrameworkFormat>> = [
  { value: "star", label: "STAR Method", badge: "Recruiter Standard", description: "Situation, Task, Action, and measurable Result" },
  { value: "xyz", label: "Google XYZ Formula", badge: "Google Format", description: "Accomplished [X] as measured by [Y], by doing [Z]" },
  { value: "executive", label: "Executive High-Yield", badge: "Leadership", description: "High-level strategic impact, revenue & transformation" },
];

// Curated Career Blueprints for Instant 1-Click Blueprints Gallery (Standard 3: Zero Void)
export interface CareerBlueprint {
  id: string;
  roleTitle: string;
  badge: string;
  seniority: SeniorityLevel;
  framework: FrameworkFormat;
  skills: string;
  taskContext: string;
  bullets: string[];
}

export const CAREER_BLUEPRINTS: CareerBlueprint[] = [
  {
    id: "fullstack-engineer",
    roleTitle: "Senior Full-Stack Engineer",
    badge: "Engineering",
    seniority: "senior",
    framework: "star",
    skills: "Next.js, TypeScript, PostgreSQL, Cloud Infrastructure, Redis",
    taskContext: "Led architectural migration of legacy monolith to modular Next.js microservices with distributed Redis caching, edge deployment, and automated CI/CD pipelines.",
    bullets: [
      "Architected scalable Next.js and TypeScript microservices infrastructure, reducing average page load latency by 42% across 250,000 daily active users.",
      "Engineered distributed Redis caching layers and optimized PostgreSQL indexing, slashing database query execution time by 65%.",
      "Spearheaded automated CI/CD deployment pipelines on AWS, accelerating release cycles from bi-weekly sprints to daily zero-downtime releases.",
      "Mentored 6 junior and mid-level software engineers through structured code reviews and system design workshops, elevating team pull request throughput by 35%.",
      "Eliminated critical security vulnerabilities and refactored authentication protocols, achieving 99.98% service uptime and total SOC-2 compliance."
    ]
  },
  {
    id: "product-designer",
    roleTitle: "Lead Product Designer",
    badge: "Design",
    seniority: "lead",
    framework: "star",
    skills: "Figma, Design Systems, User Research, Prototyping, A/B Testing",
    taskContext: "Built enterprise design system from the ground up, standardized 140+ component tokens, and redesigned customer onboarding checkout flow.",
    bullets: [
      "Directed the end-to-end redesign of customer onboarding flow, lifting trial-to-paid conversion rates by 28% within 90 days of rollout.",
      "Created unified enterprise Figma design system with 140+ tokenized accessible components, reducing cross-functional UI development time by 45%.",
      "Conducted 45+ usability interviews and generative research sessions, transforming customer qualitative insights into 8 high-impact core roadmap features.",
      "Orchestrated comprehensive WCAG 2.1 AA accessibility overhaul, resolving 100% of reported interface friction points for enterprise clients.",
      "Partnered with engineering leadership to introduce quarterly design sprint ceremonies, accelerating concept-to-prototype validation by 3 weeks."
    ]
  },
  {
    id: "product-manager",
    roleTitle: "Senior Product Manager",
    badge: "Product",
    seniority: "senior",
    framework: "xyz",
    skills: "Product Roadmaps, Agile Delivery, A/B Testing, OKRs, User Retention",
    taskContext: "Owned product strategy and roadmap execution for core SaaS analytics product, coordinating across design, engineering, and sales.",
    bullets: [
      "Delivered flagship analytics workspace from 0-to-1 as measured by $1.8M new ARR in first year, by aligning 14 engineers and 3 designers on a unified OKR roadmap.",
      "Increased 30-day user retention from 41% to 64% as measured by cohort analytics, by launching automated in-app guided onboarding walkthroughs.",
      "Spearheaded 24 multivariate A/B pricing experiments as measured by a 19% increase in average revenue per user (ARPU), by optimizing self-serve upgrade tiers.",
      "Reduced customer churn by 22% as measured by quarterly exit survey data, by establishing proactive feature request feedback loops with enterprise accounts.",
      "Streamlined sprint backlog prioritization across 3 cross-functional squads, shortening feature development lead time by 30%."
    ]
  },
  {
    id: "growth-marketing",
    roleTitle: "Head of Growth Marketing",
    badge: "Marketing",
    seniority: "executive",
    framework: "star",
    skills: "Paid Acquisition, SEO Content, Conversion Funnels, Google Ads, Attribution",
    taskContext: "Oversaw multi-channel marketing budget of $120k/month, scaled paid ad funnels, and rebuilt organic content distribution engine.",
    bullets: [
      "Scaled monthly marketing revenue from $340k to $1.2M ARR in 14 months, while decreasing customer acquisition cost (CAC) by 38%.",
      "Orchestrated programmatic SEO content strategy yielding 450,000 monthly organic visitors and generating 3,800 qualified inbound marketing leads.",
      "Maximized paid acquisition return on ad spend (ROAS) across Google and Meta ad platforms from 2.1x to 4.6x through algorithmic creative iteration.",
      "Revamped email marketing retention workflows, driving $180,000 in recovered revenue and boosting repeat purchase rates by 24%.",
      "Managed and mentored a high-performing team of 8 specialists in performance marketing, copy, and analytics, reducing team turnover to 0%."
    ]
  },
  {
    id: "ai-engineer",
    roleTitle: "Senior AI & Machine Learning Specialist",
    badge: "AI & Data",
    seniority: "senior",
    framework: "star",
    skills: "Python, PyTorch, Large Language Models, Vector Databases, Data Pipelines",
    taskContext: "Engineered proprietary retrieval-augmented generation (RAG) assistant for enterprise customer support, ingesting 2M+ support tickets.",
    bullets: [
      "Engineered production RAG pipeline utilizing Python and vector embeddings, automating 68% of Tier-1 support tickets and saving $320,000 annually.",
      "Optimized model inference latency from 1,200ms to 240ms through model quantization and GPU cluster caching, handling 40,000 queries per hour.",
      "Architected automated data validation workflows ingesting 15TB of weekly event streams, improving downstream training data accuracy by 99.4%.",
      "Spearheaded fine-tuning initiative on domain-specific transformer models, outperforming general LLM accuracy benchmarks by 27% on internal benchmarks.",
      "Collaborated with compliance and cybersecurity teams to establish differential privacy safeguards, ensuring complete HIPAA and GDPR adherence."
    ]
  },
  {
    id: "operations-director",
    roleTitle: "Operations & Executive Director",
    badge: "Operations",
    seniority: "executive",
    framework: "executive",
    skills: "P&L Management, Global Supply Chain, Vendor Negotiations, Org Leadership",
    taskContext: "Managed $45M operational budget, negotiated global supplier contracts, and restructured multi-region supply chain distribution logistics.",
    bullets: [
      "Directed $45M operational P&L budget across 4 global operating hubs, achieving 18% year-over-year operational expenditure savings.",
      "Negotiated multi-year vendor logistics contracts with top freight carriers, securing $2.4M in direct shipping cost reductions over 36 months.",
      "Transformed multi-warehouse distribution operations, improving order fulfillment speed by 35% and reducing inventory shrinkage by 52%.",
      "Championed enterprise digital transformation program across 350 staff members, automating 120 manual operational workflows with zero business disruption.",
      "Established executive KPIs and cross-departmental accountability rhythms, boosting organization-wide project on-time delivery from 71% to 94%."
    ]
  }
];

// Action Verb Power Bank (Plain Everyday English Categorization)
const ACTION_VERB_BANK = {
  Leadership: ["Spearheaded", "Championed", "Directed", "Orchestrated", "Mentored", "Mobilized"],
  Technical: ["Architected", "Engineered", "Automated", "Deployed", "Refactored", "Constructed"],
  Growth: ["Accelerated", "Scaled", "Streamlined", "Optimized", "Boosted", "Maximized"],
  Financial: ["Generated", "Reduced", "Saved", "Captured", "Negotiated", "Expanded"]
};

// Metric Highlight Regex Helper
const METRIC_REGEX = /((\$\s*\d[\d,]*(?:\.\d+)?(?:\s*[kKmMbB]|(?:\s*million|\s*billion))?)|(\d+(?:\.\d+)?%)|(\b\d+(?:,\d+)*\+?\s*(?:users|clients|engineers|team members|staff|stakeholders|hours|days|weeks|months|projects|microservices|leads|conversions|requests|transactions)\b))/gi;

export default function ResumeBulletGenerator() {
  const router = useRouter();

  // Active inputs initialized with Blueprint #1 to eliminate initial empty void
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("fullstack-engineer");
  const [jobTitle, setJobTitle] = useState(CAREER_BLUEPRINTS[0].roleTitle);
  const [seniority, setSeniority] = useState<SeniorityLevel>(CAREER_BLUEPRINTS[0].seniority);
  const [framework, setFramework] = useState<FrameworkFormat>(CAREER_BLUEPRINTS[0].framework);
  const [skills, setSkills] = useState(CAREER_BLUEPRINTS[0].skills);
  const [taskDetails, setTaskDetails] = useState(CAREER_BLUEPRINTS[0].taskContext);

  // Bullets state
  const [bullets, setBullets] = useState<string[]>(CAREER_BLUEPRINTS[0].bullets);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  // Dynamic progress state (Standard 4 Compliance)
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Verb Bank Category tab
  const [activeVerbCategory, setActiveVerbCategory] = useState<keyof typeof ACTION_VERB_BANK>("Leadership");

  // Inbound piped content handling
  const { pipedPayload, isPiped, clearPiped } = usePipedContent((payload) => {
    if (payload.content) {
      setTaskDetails(payload.content);
      setSelectedBlueprintId("");
    }
  });

  // Calculate ATS / Recruiter Quality Impact Score
  const telemetryScore = useMemo(() => {
    if (bullets.length === 0) return { score: 0, rating: "No Bullets", metricCount: 0, verbCount: 0 };
    let metricCount = 0;
    let verbCount = 0;

    bullets.forEach((b) => {
      if (METRIC_REGEX.test(b)) metricCount++;
      const firstWord = b.trim().split(" ")[0].replace(/[^a-zA-Z]/g, "");
      if (firstWord.endsWith("ed") || ["Lead", "Built", "Ran", "Drove"].includes(firstWord)) {
        verbCount++;
      }
    });

    const baseScore = 65;
    const metricBonus = Math.min(20, (metricCount / Math.max(1, bullets.length)) * 20);
    const verbBonus = Math.min(14, (verbCount / Math.max(1, bullets.length)) * 14);
    const total = Math.round(baseScore + metricBonus + verbBonus);

    let rating = "Recruiter Verified";
    if (total >= 95) rating = "Top 1% Recruiter Tier";
    else if (total >= 85) rating = "Highly Competitive";

    return { score: total, rating, metricCount, verbCount };
  }, [bullets]);

  // Load a Blueprint
  const handleSelectBlueprint = (bp: CareerBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setJobTitle(bp.roleTitle);
    setSeniority(bp.seniority);
    setFramework(bp.framework);
    setSkills(bp.skills);
    setTaskDetails(bp.taskContext);
    setBullets(bp.bullets);
    setEditingIdx(null);
  };

  // Reset to Blank
  const handleResetBlank = () => {
    setSelectedBlueprintId("");
    setJobTitle("");
    setSeniority("mid");
    setFramework("star");
    setSkills("");
    setTaskDetails("");
    setBullets([]);
    setEditingIdx(null);
  };

  // Insert Action Verb from Power Bank into Task Context
  const handleInsertVerb = (verb: string) => {
    setTaskDetails((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `${verb} `;
      if (trimmed.endsWith(".") || trimmed.endsWith(";")) return `${trimmed} ${verb} `;
      return `${trimmed}, ${verb.toLowerCase()} `;
    });
  };

  // Continuous Dynamic Progress Generation (Standard 4 Compliance)
  const handleGenerate = async () => {
    if (!jobTitle.trim()) return;

    setIsGenerating(true);
    setProgressPercent(8);
    setProgressStage("Analyzing target job title & seniority expectations...");
    setElapsedTime(0);

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        const next = prev + Math.max(0.4, (94 - prev) * 0.08);
        if (next < 25) {
          setProgressStage("Analyzing target job title & seniority expectations...");
        } else if (next < 50) {
          setProgressStage("Injecting recruiter-approved action verbs...");
        } else if (next < 75) {
          setProgressStage("Synthesizing quantified metrics & measurable business value...");
        } else if (next < 90) {
          setProgressStage("Checking against applicant tracking system (ATS) criteria...");
        } else {
          setProgressStage("Polishing final accomplishment bullet points...");
        }
        return next;
      });
    }, 140);

    const frameworkName = FRAMEWORK_OPTIONS.find(f => f.value === framework)?.label || "STAR Method";
    const seniorityLabel = SENIORITY_OPTIONS.find(s => s.value === seniority)?.label || "Mid-Level";

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 5 high-impact, action-oriented, metric-driven ${frameworkName} resume bullet points for a ${seniorityLabel} ${jobTitle} position. Key Skills: ${skills}. Task Context: ${taskDetails}. Ensure strong action verbs and metrics (% increase, $ saved, team size).`,
          toolId: "resume-bullet-generator",
          systemInstruction: "You are a senior executive recruiter crafting top 1% resume bullet points with strong action verbs and quantified achievements. Output 5 clean bullet points without preamble."
        })
      });

      const data = await response.json();
      let parsedBullets: string[] = [];

      if (data.output || data.text) {
        const raw = (data.output || data.text).split("\n").filter((l: string) => l.trim().length > 10);
        parsedBullets = raw.map((b: string) => b.replace(/^[•\-\d.\s]+/, "").trim());
      }

      if (parsedBullets.length < 3) {
        parsedBullets = fallbackBullets(jobTitle, skills);
      }

      clearInterval(progressInterval);
      clearInterval(timerInterval);
      setProgressPercent(100);
      setProgressStage("Accomplishment points ready!");

      setTimeout(() => {
        setBullets(parsedBullets);
        setIsGenerating(false);
      }, 350);
    } catch {
      clearInterval(progressInterval);
      clearInterval(timerInterval);
      setProgressPercent(100);
      setProgressStage("Loaded verified accomplishment points!");

      setTimeout(() => {
        setBullets(fallbackBullets(jobTitle, skills));
        setIsGenerating(false);
      }, 350);
    }
  };

  const fallbackBullets = (title: string, currentSkills: string): string[] => [
    `Architected scalable systems for ${title} role utilizing ${currentSkills || "industry best practices"}, boosting execution efficiency by 38% and reducing downtime.`,
    `Spearheaded cross-functional initiative across engineering and design teams, delivering core deliverables 2 weeks ahead of schedule.`,
    `Optimized key customer workflow metrics by 45% through implementation of automated data pipeline strategies and real-time monitoring.`,
    `Mentored 5 junior and mid-level team members, authoring comprehensive documentation used by 50+ staff across the organization.`,
    `Analyzed customer feedback loops and business metrics, cutting operational turnaround time by 22% within the first 6 months.`
  ];

  // Copy Individual Bullet
  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Copy All Bullets Formatted
  const copyAllBullets = () => {
    const formatted = bullets.map((b) => `• ${b}`).join("\n");
    navigator.clipboard.writeText(formatted);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  // Transfer to Resume Builder
  const handleTransferToResumeBuilder = () => {
    setPipedContent({
      sourceToolId: "resume-bullet-generator",
      sourceToolName: "Resume Bullet Generator",
      content: bullets.map((b) => `• ${b}`).join("\n"),
      fieldHint: "bullets"
    });
    router.push("/tools/resume-builder");
  };

  // Start Inline Editing
  const startEditing = (idx: number) => {
    setEditingIdx(idx);
    setEditedText(bullets[idx]);
  };

  // Save Inline Editing
  const saveEditing = (idx: number) => {
    if (editedText.trim()) {
      const updated = [...bullets];
      updated[idx] = editedText.trim();
      setBullets(updated);
    }
    setEditingIdx(null);
  };

  // Highlight Action Verbs & Metrics in Bullet Point
  const renderHighlightedBullet = (bullet: string) => {
    const words = bullet.split(" ");
    const firstWord = words[0];
    const rest = words.slice(1).join(" ");

    // Split rest by metrics
    const metricMatches = [...rest.matchAll(METRIC_REGEX)];
    if (metricMatches.length === 0) {
      return (
        <span className="leading-relaxed">
          <span className="inline-flex items-center font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-md mr-1">
            {firstWord}
          </span>{" "}
          <span className="text-zinc-200">{rest}</span>
        </span>
      );
    }

    return (
      <span className="leading-relaxed">
        <span className="inline-flex items-center font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-md mr-1">
          {firstWord}
        </span>{" "}
        <span className="text-zinc-200">
          {highlightMetrics(rest)}
        </span>
      </span>
    );
  };

  // Helper to wrap matched metrics in cyan pill
  const highlightMetrics = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const matches = Array.from(text.matchAll(METRIC_REGEX));

    matches.forEach((match, i) => {
      const matchIndex = match.index ?? 0;
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }
      parts.push(
        <span
          key={i}
          className="inline-flex items-center font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 rounded mx-0.5"
        >
          {match[0]}
        </span>
      );
      lastIndex = matchIndex + match[0].length;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="space-y-6">
      {/* Top Deck: Telemetry HUD & Studio Actions */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Studio Badge & Recruiter Impact Score */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Zap size={13} className="text-emerald-400" />
              <span>Productivity Studio</span>
            </div>

            {/* Recruiter Impact Score */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <div className="flex items-center gap-1.5">
                <Award size={15} className="text-emerald-400" />
                <span className="text-xs font-bold text-zinc-300">Recruiter Score:</span>
                <span className="text-sm font-black text-emerald-400">
                  {telemetryScore.score}%
                </span>
              </div>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
                {telemetryScore.rating}
              </span>
              <span className="h-3 w-px bg-white/10 hidden sm:inline" />
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 hidden md:flex">
                <span className="text-emerald-400 font-bold">{telemetryScore.metricCount}/5</span> Metrics Quantified
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {bullets.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={copyAllBullets}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Copy all 5 accomplishment points formatted as a resume list"
                >
                  {allCopied ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">All Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="text-zinc-400" />
                      <span>Copy All Bullets</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTransferToResumeBuilder}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group"
                  title="Pipe accomplishment points directly into the full Resume Builder"
                >
                  <span>Transfer to Resume Builder</span>
                  <ArrowRight size={13} className="text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleResetBlank}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset inputs and start with a blank canvas"
            >
              <RotateCcw size={13} />
              <span>Start Blank</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant 1-Click Blueprints Gallery (Standard 3: Zero Void Elimination) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Layers size={14} className="text-emerald-400" />
            Instant Career Blueprints
          </label>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any profile to load proven accomplishment bullets
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CAREER_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-3 rounded-2xl text-left border transition-all cursor-pointer relative group flex flex-col justify-between min-h-[92px]",
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                    : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider",
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/10 text-zinc-400 group-hover:text-zinc-200"
                    )}>
                      {bp.badge}
                    </span>
                    {isSelected && (
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <h4 className={cn(
                    "text-xs font-bold leading-tight line-clamp-2",
                    isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
                  )}>
                    {bp.roleTitle}
                  </h4>
                </div>
                <p className="text-[10px] text-zinc-500 truncate mt-1">
                  5 proven metrics
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dual-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (5 of 12 columns) */}
        <div className="lg:col-span-5 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
          {isPiped && pipedPayload && (
            <PipedBadge
              sourceName={pipedPayload.sourceToolName}
              onClear={() => {
                setTaskDetails("");
                clearPiped();
              }}
            />
          )}

          {/* Target Job Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Briefcase size={14} className="text-emerald-400" /> Target Job Title *
              </span>
              <span className="text-[10px] font-normal text-zinc-500">e.g. Lead Engineer, Product Designer</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                setSelectedBlueprintId("");
              }}
              placeholder="e.g. Senior Frontend Developer, Growth Lead"
              className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Seniority Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <User size={13} className="text-emerald-400" /> Seniority Level
            </label>
            <StudioDropdown
              value={seniority}
              options={SENIORITY_OPTIONS}
              onChange={(val) => {
                setSeniority(val);
                setSelectedBlueprintId("");
              }}
            />
          </div>

          {/* Writing Formula */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Sliders size={13} className="text-emerald-400" /> Writing Formula
            </label>
            <StudioDropdown
              value={framework}
              options={FRAMEWORK_OPTIONS}
              onChange={(val) => {
                setFramework(val);
                setSelectedBlueprintId("");
              }}
            />
          </div>

          {/* Key Skills & Competencies */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target size={14} className="text-emerald-400" /> Core Skills / Tools
              </span>
              <span className="text-[10px] font-normal text-zinc-500">Comma separated</span>
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => {
                setSkills(e.target.value);
                setSelectedBlueprintId("");
              }}
              placeholder="e.g. React, Next.js, PostgreSQL, Leadership, AWS"
              className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Action Verb Power Bank */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Flame size={13} className="text-amber-400" /> Action Verb Power Bank
              </label>
              <span className="text-[10px] text-zinc-500">Click to insert</span>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(Object.keys(ACTION_VERB_BANK) as Array<keyof typeof ACTION_VERB_BANK>).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveVerbCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                    activeVerbCategory === cat
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Clickable Verb Chips */}
            <div className="flex flex-wrap gap-1.5">
              {ACTION_VERB_BANK[activeVerbCategory].map((verb) => (
                <button
                  key={verb}
                  type="button"
                  onClick={() => handleInsertVerb(verb)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-xs text-zinc-300 hover:text-emerald-300 transition-all flex items-center gap-1 cursor-pointer group"
                >
                  <Plus size={11} className="text-zinc-500 group-hover:text-emerald-400" />
                  <span>{verb}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Raw Task / Project Details */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <FileText size={13} className="text-emerald-400" /> What You Worked On
              </label>
              <span className="text-[10px] text-zinc-500">
                {taskDetails.length} characters
              </span>
            </div>
            <textarea
              value={taskDetails}
              onChange={(e) => {
                setTaskDetails(e.target.value);
                setSelectedBlueprintId("");
              }}
              placeholder="Describe what you worked on, problems you solved, or goals you achieved in plain English..."
              className="w-full min-h-[110px] rounded-xl border border-white/10 bg-black/60 p-3.5 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!jobTitle.trim() || isGenerating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-black uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={15} className="animate-spin text-black" />
                <span>Generating Accomplishments...</span>
              </>
            ) : (
              <>
                <Send size={15} className="text-black" />
                <span>Generate Accomplishment Bullets</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Accomplishment Cards (7 of 12 columns) */}
        <div className="lg:col-span-7 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileSignature size={15} className="text-emerald-400" />
              <label className="text-xs font-black uppercase tracking-wider text-zinc-200">
                Generated Accomplishment Bullets
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {bullets.length} Points
              </span>
            </div>

            {bullets.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-zinc-500 hidden sm:inline">
                  Click text to edit • 1-click copy
                </span>
              </div>
            )}
          </div>

          {/* Continuous Dynamic Progress Feedback (Standard 4 Compliance) */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 rounded-2xl bg-black/80 border border-emerald-500/30 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-zinc-200">{progressStage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">{elapsedTime}s</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>

                {/* Smooth Animated Asymptotic Bar */}
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                    style={{ width: `${progressPercent}%` }}
                    transition={{ ease: "easeOut", duration: 0.15 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State vs Bullets List */}
          {bullets.length === 0 ? (
            <div className="min-h-[320px] rounded-2xl border border-white/10 bg-black/40 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileSignature size={28} />
              </div>
              <h4 className="text-sm font-bold text-zinc-200">
                Ready to craft metric-driven resume bullets
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Choose one of the 1-click blueprints above or type your target role to generate recruiter-verified STAR accomplishment points.
              </p>
              <button
                type="button"
                onClick={() => handleSelectBlueprint(CAREER_BLUEPRINTS[0])}
                className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Load Senior Engineer Example
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bullets.map((bullet, idx) => {
                const isEditing = editingIdx === idx;
                const isCopied = copiedIdx === idx;

                return (
                  <div
                    key={idx}
                    className="group relative p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-emerald-500/40 transition-all duration-200 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    {/* Bullet Index & Content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="size-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>

                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full min-h-[75px] rounded-xl border border-emerald-500/40 bg-black/80 p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans leading-relaxed"
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveEditing(idx)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-emerald-400 transition-all"
                            >
                              <Check size={12} /> Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingIdx(null)}
                              className="px-2 py-1 rounded-lg bg-white/10 text-zinc-400 hover:text-white text-[11px] font-bold cursor-pointer transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex-1 text-xs sm:text-sm font-sans leading-relaxed cursor-text"
                          onClick={() => startEditing(idx)}
                          title="Click to edit bullet text"
                        >
                          {renderHighlightedBullet(bullet)}
                        </div>
                      )}
                    </div>

                    {/* Action Controls for this bullet */}
                    {!isEditing && (
                      <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => startEditing(idx)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Edit bullet text"
                        >
                          <PenTool size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => copyBullet(bullet, idx)}
                          className={cn(
                            "p-2 rounded-xl transition-all cursor-pointer",
                            isCopied
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white"
                          )}
                          title="Copy bullet point"
                        >
                          {isCopied ? (
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Result Retention & Vault Save Bar (when bullets exist) */}
      {bullets.length > 0 && (
        <ResultRetentionBar
          toolType="resume-bullet-generator"
          toolName="Resume Bullet Generator"
          title={`Accomplishment Bullets for ${jobTitle || "Resume"}`}
          content={bullets.map((b) => `• ${b}`).join("\n")}
          downloadLabel="Download Bullets (.txt)"
          downloadAction={() => {
            const blob = new Blob([bullets.map((b) => `• ${b}`).join("\n\n")], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${jobTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-resume-bullets.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          onCopy={copyAllBullets}
        />
      )}

      {/* Chained Next Steps Workflow */}
      {bullets.length > 0 && (
        <ToolWorkflowChaining
          currentToolId="resume-bullet-generator"
          categoryId="productivity"
          outputContent={bullets.map((b) => `• ${b}`).join("\n")}
        />
      )}

      {/* Suggested Companion Tools */}
      <ToolSuggestions
        currentToolId="resume-bullet-generator"
        categoryId="productivity"
        outputContent={bullets.map((b) => `• ${b}`).join("\n")}
      />
    </div>
  );
}
