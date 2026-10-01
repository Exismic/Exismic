"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Download, 
  X, 
  FileText,
  ScanText,
  CheckCircle2,
  AlertCircle,
  Zap,
  Briefcase,
  FileCheck2,
  ChevronRight,
  TrendingUp,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Upload,
  LayoutGrid,
  Target,
  ShieldCheck,
  Award
} from "lucide-react";
import Link from "next/link";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { usePipedContent } from "@/lib/tool-piping";
import { PipedBadge } from "@/components/tool/PipedBadge";
import axios from "axios";

interface ScanResult {
  atsScore: number;
  verdict: string;
  analysis: {
    format: { score: number; critique: string };
    experience: { score: number; critique: string };
    skills: { score: number; critique: string };
  };
  keywords: {
    matched: string[];
    missing: string[];
  };
  suggestions: string[];
}

interface CareerBlueprint {
  id: string;
  title: string;
  role: string;
  badge: string;
  resumeText: string;
  jobDescription: string;
}

const CAREER_BLUEPRINTS: CareerBlueprint[] = [
  {
    id: "fullstack",
    title: "Full-Stack Engineer",
    role: "Senior Full-Stack Developer",
    badge: "Engineering",
    resumeText: `Alex Chen
San Francisco, CA • alex.chen@example.com • github.com/alexchen-dev

SUMMARY:
Product-minded Senior Full-Stack Engineer with 5+ years of experience architecting high-throughput web applications, microservices, and design systems. Led migration to Next.js and Node.js reducing page load times by 42% across 1.2M monthly users.

EXPERIENCE:
TechVanguard Labs — Senior Software Engineer (2022 - Present)
• Architected high-performance cloud services using Next.js, TypeScript, and PostgreSQL serving 1.2M active users.
• Reduced API response latency by 38% through optimized database indexing and Redis query caching.
• Mentored 6 junior engineers and established automated CI/CD deployment pipelines with 94% test coverage.

CloudFlow Systems — Frontend Engineer (2019 - 2022)
• Built company core component design system used by 45+ developers, cutting feature delivery time by 30%.
• Implemented real-time collaboration canvas using WebSockets handling 40,000 concurrent state updates.

EDUCATION:
University of California, Berkeley — B.S. in Computer Science (2015 - 2019)

SKILLS:
TypeScript, React, Next.js, Node.js, PostgreSQL, Tailwind CSS, Docker, GraphQL, AWS, Redis, Microservices, CI/CD`,
    jobDescription: `Target Role: Senior Full-Stack Engineer

About the Role:
We are looking for a Senior Full-Stack Software Engineer to build scalable cloud features for our high-growth collaboration platform. You will work closely with product and design to deliver performant web interfaces and reliable backend microservices.

Key Responsibilities:
• Architect, build, and maintain production features using React, Next.js, TypeScript, and Node.js.
• Design robust SQL database schemas and high-throughput APIs in PostgreSQL and Redis.
• Improve web vital performance, latency, and test coverage across CI/CD pipelines.
• Collaborate in agile cross-functional sprints and mentor teammates.

Required Skills & Qualifications:
• 4+ years of professional full-stack development experience.
• Strong expertise in TypeScript, React/Next.js, and Node.js services.
• Deep understanding of SQL databases, indexing, and REST/GraphQL APIs.
• Experience with cloud deployments (AWS or GCP) and Docker containers.`
  },
  {
    id: "designer",
    title: "Product Designer",
    role: "Lead UI/UX Designer",
    badge: "Design",
    resumeText: `Sophia Miller
New York, NY • sophia.miller@example.com • sophiadesigns.io

SUMMARY:
Lead Product Designer passionate about transforming complex enterprise workflows into intuitive, beautiful consumer-grade software. Specialize in multi-brand design systems, user journey mapping, and conversion-focused SaaS interfaces.

EXPERIENCE:
Orbit Creative Studio — Lead UI/UX Designer (2021 - Present)
• Spearheaded end-to-end redesign of flagship mobile app, increasing 30-day user retention by 28% and achieving a 4.9 App Store rating.
• Created multi-platform token design system that accelerated developer handoff by 45%.
• Conducted 50+ qualitative user interviews to validate feature roadmaps.

PixelCraft Agency — Senior Product Designer (2018 - 2021)
• Delivered complete brand guidelines, design systems, and responsive web applications for 14 venture-backed startups.
• Designed interactive dashboards that boosted client enterprise sales closing rates by 22%.

EDUCATION:
Rhode Island School of Design — B.F.A. in Interaction Design (2014 - 2018)

SKILLS:
Figma, Design Systems, User Research, Prototyping, Information Architecture, Design Tokens, Mobile UX, Wireframing, Usability Testing, Visual Design`,
    jobDescription: `Target Role: Lead Product Designer (UI/UX)

About the Role:
We are seeking an experienced Lead Product Designer to guide product aesthetics, interaction paradigms, and design system governance across web and mobile experiences.

Key Responsibilities:
• Lead end-to-end product design lifecycle from user discovery to polished high-fidelity prototypes.
• Maintain and evolve enterprise design systems and component libraries in Figma.
• Conduct user research, usability testing sessions, and translate data insights into clean UI solutions.
• Partner closely with engineering to ensure pixel-perfect implementation of tokens and animations.

Required Skills & Qualifications:
• 5+ years designing responsive web apps and native mobile applications.
• Mastery of Figma, design systems, component tokens, and interactive prototyping.
• Strong portfolio demonstrating structured design thinking and measurable business outcomes.
• Excellent communication and cross-functional leadership skills.`
  },
  {
    id: "product",
    title: "Product Manager",
    role: "Principal Product Manager",
    badge: "Product",
    resumeText: `Marcus Vance
Austin, TX • marcus.vance@example.com • linkedin.com/in/marcusvance

SUMMARY:
Outcome-driven Product Leader with 7+ years translating customer discovery into scalable commercial products. Proven track record driving $14M in ARR expansion, lifting onboarding funnel conversion by 34%, and leading cross-functional squads.

EXPERIENCE:
Apex Cloud Technologies — Principal Product Manager (2022 - Present)
• Owned product roadmap for enterprise collaboration suite, growing quarterly active users from 400k to 1.8M.
• Introduced tiered packaging and self-serve onboarding that drove $6.2M in net new ARR within 9 months.
• Aligned engineering, design, and GTM teams across bi-weekly agile development sprints.

Pulse Commerce — Senior Product Manager (2019 - 2022)
• Shipped 1-click checkout experience that increased mobile checkout conversion by 22% and added $8M annualized GMV.
• Defined product telemetry metrics and instituted rigorous A/B experimentation framework.

EDUCATION:
Stanford University — B.S. in Management Science & Engineering (2015 - 2019)

SKILLS:
Product Strategy, Agile Sprints, A/B Testing, User Discovery, Go-To-Market, SQL & Analytics, OKRs, Pricing, Roadmap Planning, Stakeholder Management`,
    jobDescription: `Target Role: Principal Product Manager

About the Role:
Join our leadership team to steer core product growth, user onboarding, and enterprise monetization strategy. You will set vision, define quarterly OKRs, and work with engineering and GTM teams to ship customer-obsessed features.

Key Responsibilities:
• Formulate 12-month product roadmaps aligned with corporate revenue targets.
• Run continuous customer discovery interviews and data-driven A/B experimentation.
• Define core performance metrics, telemetry tracking, and funnel conversion milestones.
• Coordinate sprint execution with engineering and product design squads.

Required Skills & Qualifications:
• 6+ years of SaaS product management experience with proven commercial impact.
• Strong analytical background with SQL, event telemetry, and cohort retention analysis.
• Exceptional track record in PLG (product-led growth) onboarding and enterprise packaging.
• Outstanding executive presentation and stakeholder alignment abilities.`
  },
  {
    id: "marketing",
    title: "Growth Marketer",
    role: "Head of Growth & Demand Gen",
    badge: "Marketing",
    resumeText: `Elena Rostova
Chicago, IL • elena.rostova@example.com • elenagrowth.com

SUMMARY:
Data-backed Growth Marketing Leader with 6+ years scaling B2B & consumer SaaS acquisition. Scaled annual inbound pipeline from $2M to $11M ARR while reducing CAC by 31% across paid, organic search, and lifecycle channels.

EXPERIENCE:
GrowthWave Analytics — Head of Growth (2021 - Present)
• Managed $240k monthly digital marketing budget across Google Ads, LinkedIn, and Meta, delivering a 4.2x ROAS.
• Built organic SEO content flywheel generating 450,000 monthly organic visitors and 12,000 monthly product signups.
• Implemented automated email nurturing drip sequences lifting free-to-paid conversion by 24%.

Beacon SaaS — Performance Marketing Manager (2018 - 2021)
• Scaled paid search acquisition channel 3x year-over-year at target payback periods.
• Ran continuous multivariate landing page experiments using Webflow and PostHog.

EDUCATION:
Northwestern University — B.A. in Marketing & Communications (2014 - 2018)

SKILLS:
Demand Generation, Performance Marketing, SEO Strategy, CAC Optimization, Google Ads, LinkedIn Ads, Conversion Rate Optimization (CRO), HubSpot, PostHog, Email Nurturing`,
    jobDescription: `Target Role: Head of Growth Marketing

About the Role:
We are seeking an analytical, high-energy Growth Marketing Leader to own demand generation, user acquisition, and lifecycle retention funnels across paid and organic channels.

Key Responsibilities:
• Own the full-funnel acquisition strategy across paid search, social, SEO, and email lifecycle.
• Allocate monthly multi-channel performance marketing budgets to maximize blended ROAS and minimize CAC.
• Oversee rapid CRO experimentation across landing pages, signup funnels, and email automations.
• Partner with product leadership to accelerate product-led growth (PLG) trial conversion.

Required Skills & Qualifications:
• 5+ years of hands-on growth marketing and demand generation experience in B2B/B2C SaaS.
• Proven track record managing significant paid media budgets with rigorous attribution.
• Deep proficiency with analytics tools (Google Analytics 4, PostHog, Mixpanel) and marketing automation.
• Strong copywriting and creative testing mindset.`
  }
];

const SCAN_STEPS = [
  { step: "01", title: "Upload or Paste Resume", desc: "Select your PDF resume or paste raw resume text." },
  { step: "02", title: "Add Target Role", desc: "Paste the job description or auto-draft it with AI." },
  { step: "03", title: "Run Match Scan", desc: "Exismic AI evaluates keyword alignment and formatting." },
  { step: "04", title: "Apply Tailored Fixes", desc: "Use the actionable report to improve hiring chances." }
];

export default function ResumeAnalyzer() {
  const [inputMode, setInputMode] = useState<"upload" | "text">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "suggestions">("overview");
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { pipedPayload, isPiped, clearPiped } = usePipedContent((payload) => {
    if (payload.content) {
      setJobDescription(payload.content);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setResumeText("");
      setActiveBlueprintId("");
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const applyBlueprint = (bp: CareerBlueprint) => {
    setFile(null);
    setInputMode("text");
    setResumeText(bp.resumeText);
    setJobDescription(bp.jobDescription);
    setActiveBlueprintId(bp.id);
    setResult(null);
    setError(null);
  };

  const clearAll = () => {
    setFile(null);
    setResumeText("");
    setJobDescription("");
    setActiveBlueprintId("");
    setResult(null);
    setError(null);
  };

  const handleAutoGenerateJobDesc = async () => {
    if (!file && !resumeText.trim()) return;
    setIsGeneratingJobDesc(true);
    setError(null);

    try {
      let response;
      if (file) {
        const payload = new FormData();
        payload.append("file", file);
        payload.append("action", "generate-job-description");
        response = await axios.post("/api/tools/productivity/resume-analyzer", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        response = await axios.post("/api/tools/productivity/resume-analyzer", {
          action: "generate-job-description",
          resumeText
        });
      }

      if (response.data.success && response.data.jobDescription) {
        setJobDescription(response.data.jobDescription);
      } else {
        throw new Error("Could not automatically generate job description details.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to auto-generate job description.");
    } finally {
      setIsGeneratingJobDesc(false);
    }
  };

  const startDynamicProgress = () => {
    setProgress(12);
    setStatus("Extracting resume text and qualifications...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(interval);
          return 92;
        }
        if (prev > 68) {
          setStatus("Scoring keyword alignment & measurable impact...");
          return prev + 2;
        }
        if (prev > 38) {
          setStatus("Comparing resume against target role requirements...");
          return prev + 4;
        }
        return prev + 6;
      });
    }, 180);

    progressTimerRef.current = interval;
    return interval;
  };

  const handleScan = async () => {
    const hasResume = Boolean(file || resumeText.trim().length >= 50);
    const hasJobDesc = jobDescription.trim().length >= 20;

    if (!hasResume || !hasJobDesc) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    startDynamicProgress();

    try {
      let response;
      if (file) {
        const payload = new FormData();
        payload.append("file", file);
        payload.append("jobDescription", jobDescription);
        response = await axios.post("/api/tools/productivity/resume-analyzer", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        response = await axios.post("/api/tools/productivity/resume-analyzer", {
          resumeText,
          jobDescription
        });
      }

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(100);
      setStatus("Scan complete!");

      if (response.data.success && response.data.result) {
        setResult(response.data.result);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("quests-updated"));
        }
      } else {
        throw new Error("Unable to parse recommendations. Please try again.");
      }
    } catch (err: any) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      console.error(err);
      setError(err.response?.data?.error || err.message || "Something went wrong during analysis.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyReport = () => {
    if (!result) return;
    const textReport = `EXISMIC AI RESUME MATCH REPORT
---------------------------------
Overall Match Score: ${result.atsScore}%
Verdict: ${result.verdict}

ANALYSIS BREAKDOWN:
- Formatting & Readability: ${result.analysis.format.score}% (${result.analysis.format.critique})
- Experience & Impact: ${result.analysis.experience.score}% (${result.analysis.experience.critique})
- Skill Alignment: ${result.analysis.skills.score}% (${result.analysis.skills.critique})

MATCHED KEYWORDS:
${result.keywords.matched.join(", ") || "None"}

RECOMMENDED MISSING KEYWORDS:
${result.keywords.missing.join(", ") || "None"}

ACTIONABLE RECOMMENDATIONS:
${result.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;
    navigator.clipboard.writeText(textReport);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const downloadReportTxt = () => {
    if (!result) return;
    const textReport = `EXISMIC AI RESUME MATCH REPORT
---------------------------------
Overall Match Score: ${result.atsScore}%
Verdict: ${result.verdict}

ANALYSIS BREAKDOWN:
- Formatting & Readability: ${result.analysis.format.score}% (${result.analysis.format.critique})
- Experience & Impact: ${result.analysis.experience.score}% (${result.analysis.experience.critique})
- Skill Alignment: ${result.analysis.skills.score}% (${result.analysis.skills.critique})

MATCHED KEYWORDS:
${result.keywords.matched.join(", ") || "None"}

RECOMMENDED MISSING KEYWORDS:
${result.keywords.missing.join(", ") || "None"}

ACTIONABLE RECOMMENDATIONS:
${result.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;
    const blob = new Blob([textReport], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Resume_Match_Report_${result.atsScore}pct.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBorder = (score: number) => {
    if (score >= 80) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    if (score >= 50) return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  };

  const hasResume = Boolean(file || resumeText.trim().length >= 50);
  const isReadyToScan = hasResume && jobDescription.trim().length >= 20;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16">
      {/* Studio Top Control Deck */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <ScanText size={15} className="text-emerald-400" />
              <span>Resume Scanner Studio</span>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-bold text-zinc-300">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Status</span>
              <span className="flex items-center gap-1.5 text-zinc-200">
                <span className={cn("size-2 rounded-full", hasResume ? "bg-emerald-400" : "bg-zinc-600")} />
                {file ? file.name : resumeText ? "Text Resume Loaded" : "Waiting for resume"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyBlueprint(CAREER_BLUEPRINTS[0])}
              className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black uppercase tracking-wider text-zinc-300 transition hover:text-white hover:bg-white/[0.08] cursor-pointer"
            >
              Load Sample
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.02] px-4 text-xs font-black uppercase tracking-wider text-zinc-400 transition hover:text-white hover:bg-white/[0.06] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>

            <Link
              href="/tools/resume-builder"
              className="min-h-11 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-black uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} />
              <span>Resume Builder</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 1-Click Instant Career Blueprints Bar */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <LayoutGrid size={15} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Instant 1-Click Career Blueprints</h3>
              <p className="text-[11px] font-medium text-zinc-400">Test the scanner instantly with complete, realistic resumes matched to live job posts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CAREER_BLUEPRINTS.map((bp) => {
            const isSelected = activeBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => applyBlueprint(bp)}
                className={cn(
                  "p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/30"
                    : "bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]"
                )}
              >
                <div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1.5",
                    isSelected ? "bg-emerald-400 text-black font-black" : "bg-white/10 text-zinc-400 group-hover:text-zinc-200"
                  )}>
                    {bp.badge}
                  </span>
                  <p className={cn(
                    "text-xs font-bold leading-snug line-clamp-1",
                    isSelected ? "text-white font-black" : "text-zinc-300 group-hover:text-white"
                  )}>
                    {bp.title}
                  </p>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-1 mt-1 font-medium">{bp.role}</p>
              </button>
            );
          })}
        </div>
      </div>

      {isPiped && pipedPayload && (
        <div className="mb-2">
          <PipedBadge
            sourceName={pipedPayload.sourceToolName}
            onClear={() => {
              setJobDescription("");
              clearPiped();
            }}
          />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-200 flex items-center gap-3">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Workspace Column */}
        <div className="xl:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="input-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Step 1: Resume Input Card */}
                <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <FileCheck2 size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-black uppercase tracking-wider text-white">1. Select Your Resume</h2>
                        <p className="text-xs text-zinc-400">Upload your PDF or paste your resume text directly</p>
                      </div>
                    </div>

                    <div className="flex rounded-xl bg-black/40 border border-white/10 p-1">
                      <button
                        type="button"
                        onClick={() => setInputMode("upload")}
                        className={cn(
                          "px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer",
                          inputMode === "upload" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        Upload PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode("text")}
                        className={cn(
                          "px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer",
                          inputMode === "text" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        Paste Text
                      </button>
                    </div>
                  </div>

                  {inputMode === "upload" ? (
                    <div>
                      {!file ? (
                        <div
                          {...getRootProps()}
                          className={cn(
                            "relative min-h-[220px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 group",
                            isDragActive
                              ? "border-emerald-400 bg-emerald-500/10 scale-[0.99] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                              : "border-white/15 bg-white/[0.02] hover:border-emerald-400/50 hover:bg-emerald-500/[0.04]"
                          )}
                        >
                          <input {...getInputProps()} />
                          <div className="flex size-16 items-center justify-center rounded-2xl bg-black/50 border border-white/10 text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={28} />
                          </div>
                          <p className="text-sm font-black text-white uppercase tracking-wider mb-1">
                            Drag & drop your PDF resume
                          </p>
                          <p className="text-xs text-zinc-500">or click to browse files from your computer (PDF up to 10MB)</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                              <FileCheck2 size={24} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">{file.name}</p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 mt-0.5">
                                PDF Document · {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to Scan
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="p-2 text-zinc-500 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={resumeText}
                        onChange={(e) => {
                          setResumeText(e.target.value);
                          setFile(null);
                        }}
                        placeholder="Paste your complete resume text here (Summary, Experience, Education, Skills)..."
                        className="w-full min-h-[220px] rounded-2xl border border-white/10 bg-black/40 p-4 text-sm font-bold leading-relaxed text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 resize-none"
                      />
                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 mt-2 px-1">
                        <span>{resumeText.trim().length >= 50 ? "✓ Resume text ready" : "Enter at least 50 characters"}</span>
                        <span>{resumeText.length} characters</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Target Job Description Card */}
                <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Target size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-black uppercase tracking-wider text-white">2. Target Job Description</h2>
                        <p className="text-xs text-zinc-400">Paste the job post or role description to benchmark keywords</p>
                      </div>
                    </div>

                    {hasResume && (
                      <button
                        type="button"
                        onClick={handleAutoGenerateJobDesc}
                        disabled={isGeneratingJobDesc || isProcessing}
                        className="min-h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Bot size={14} className={cn(isGeneratingJobDesc && "animate-spin")} />
                        <span>{isGeneratingJobDesc ? "Drafting..." : "Auto-Draft With AI"}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste key responsibilities, requirements, and required skills from the job posting..."
                      className="w-full min-h-[220px] rounded-2xl border border-white/10 bg-black/40 p-4 text-sm font-bold leading-relaxed text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 resize-none"
                    />

                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider px-1">
                      {jobDescription.trim().length >= 20 ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-400" />
                          Minimum requirements length satisfied
                        </span>
                      ) : (
                        <span className="text-zinc-500">Provide at least 20 characters of the job description</span>
                      )}
                      <span className="text-zinc-500">{jobDescription.length} characters</span>
                    </div>
                  </div>

                  {/* Scan CTA Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleScan}
                      disabled={!isReadyToScan || isProcessing}
                      className={cn(
                        "w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest text-black shadow-2xl transition hover:brightness-110 active:scale-98 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                        "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                      )}
                    >
                      <ScanText size={18} />
                      <span>{isProcessing ? "Scanning Compatibility..." : "Run Job Match Scan"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Step 3: Scan Results Report Dashboard */
              <motion.div
                key="results-report"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Result Hero Header */}
                <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                      {/* Animated Gauge SVG */}
                      <div className="relative flex items-center justify-center shrink-0 size-28 filter drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <svg className="size-full transform -rotate-90">
                          <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="transparent" />
                          <motion.circle 
                            cx="56" 
                            cy="56" 
                            r="48" 
                            stroke="currentColor" 
                            strokeWidth="8" 
                            fill="transparent" 
                            className={getScoreColor(result.atsScore)}
                            strokeDasharray={301.59}
                            initial={{ strokeDashoffset: 301.59 }}
                            animate={{ strokeDashoffset: 301.59 - (301.59 * result.atsScore) / 100 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className={cn("absolute text-3xl font-black font-mono", getScoreColor(result.atsScore))}>
                          {result.atsScore}%
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block", getScoreBorder(result.atsScore))}>
                          Match Score: {result.atsScore >= 80 ? "Strong Match" : result.atsScore >= 50 ? "Moderate Alignment" : "Needs Optimization"}
                        </span>
                        <h3 className="text-2xl font-black text-white uppercase tracking-wider">Audit Report Complete</h3>
                        <p className="text-zinc-300 text-xs font-medium max-w-lg leading-relaxed">{result.verdict}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/tools/resume-builder"
                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black px-4 text-xs font-black uppercase tracking-wider transition shadow-lg active:scale-95"
                      >
                        <FileText size={14} />
                        <span>Fix in Builder</span>
                      </Link>

                      <button
                        type="button"
                        onClick={copyReport}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white px-3.5 text-xs font-bold transition active:scale-95 cursor-pointer"
                        title="Copy Summary"
                      >
                        {copiedReport ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedReport ? "Copied!" : "Copy"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadReportTxt}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white px-3.5 text-xs font-bold transition active:scale-95 cursor-pointer"
                        title="Download Text Report"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Sub-tabs selector */}
                  <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                    {[
                      { id: "overview", name: "Overview" },
                      { id: "keywords", name: "Skills & Keywords" },
                      { id: "suggestions", name: "Recommended Fixes" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer",
                          activeTab === tab.id
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div>
                    <AnimatePresence mode="wait">
                      {activeTab === "overview" && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          {[
                            { title: "Formatting & Layout", data: result.analysis.format, label: "Readability", icon: <FileText size={16} className="text-emerald-400" /> },
                            { title: "Experience & Impact", data: result.analysis.experience, label: "Measurables", icon: <TrendingUp size={16} className="text-cyan-400" /> },
                            { title: "Skill Alignment", data: result.analysis.skills, label: "Match Score", icon: <Award size={16} className="text-amber-400" /> }
                          ].map((section, idx) => (
                            <div 
                              key={idx} 
                              className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3.5"
                            >
                              <div className="flex justify-between items-center">
                                <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", getScoreBorder(section.data.score))}>
                                  {section.data.score}% · {section.label}
                                </span>
                                <div className="p-2 bg-white/5 rounded-xl">
                                  {section.icon}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-black text-white uppercase tracking-wider">{section.title}</h4>
                                <p className="text-zinc-400 text-xs font-medium leading-relaxed">{section.data.critique}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {activeTab === "keywords" && (
                        <motion.div
                          key="keywords"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          {/* Matched */}
                          <div className="space-y-3 p-5 rounded-2xl bg-black/40 border border-emerald-500/20">
                            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                              <CheckCircle2 size={15} />
                              <span>Matched Skills & Keywords ({result.keywords.matched.length})</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.keywords.matched.length > 0 ? (
                                result.keywords.matched.map((kw, i) => (
                                  <span 
                                    key={i} 
                                    className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-bold text-xs"
                                  >
                                    {kw}
                                  </span>
                                ))
                              ) : (
                                <p className="text-xs text-zinc-500">No direct matched keywords detected.</p>
                              )}
                            </div>
                          </div>

                          {/* Missing */}
                          <div className="space-y-3 p-5 rounded-2xl bg-black/40 border border-amber-500/20">
                            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                              <Target size={15} />
                              <span>Missing Skills to Add ({result.keywords.missing.length})</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.keywords.missing.length > 0 ? (
                                result.keywords.missing.map((kw, i) => (
                                  <span 
                                    key={i} 
                                    className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-bold text-xs"
                                  >
                                    + {kw}
                                  </span>
                                ))
                              ) : (
                                <p className="text-xs text-emerald-400 font-medium">Outstanding! You matched all critical role keywords.</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "suggestions" && (
                        <motion.div
                          key="suggestions"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-3"
                        >
                          {result.suggestions.map((sug, i) => (
                            <div 
                              key={i} 
                              className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3.5"
                            >
                              <div className="size-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 text-xs font-bold mt-0.5">
                                <CheckCircle2 size={13} />
                              </div>
                              <p className="text-zinc-200 text-xs font-medium leading-relaxed">{sug}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-white/10">
                    <button 
                      type="button"
                      onClick={() => {
                        setResult(null);
                        setError(null);
                      }}
                      className="text-xs font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Scan Another Resume</span>
                    </button>

                    <Link
                      href="/tools/resume-builder"
                      className="text-xs font-black text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>Open Resume Builder</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Retention Bar: Save to Cloud Vault & Daily Quests */}
                <ResultRetentionBar
                  toolType="resume-analyzer"
                  toolName="AI Resume Scanner"
                  title={`Resume Match Audit (${result.atsScore}%)`}
                  content={`Match Score: ${result.atsScore}%\nVerdict: ${result.verdict}\n\nMatched Keywords: ${result.keywords.matched.join(", ")}\nMissing Keywords: ${result.keywords.missing.join(", ")}\n\nFixes:\n${result.suggestions.join("\n")}`}
                  metadata={{
                    atsScore: result.atsScore,
                    matchedKeywords: result.keywords.matched.length,
                    missingKeywords: result.keywords.missing.length,
                  }}
                  downloadAction={downloadReportTxt}
                  downloadLabel="Download Report (.TXT)"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar Column */}
        <div className="xl:col-span-4 space-y-6">
          {/* Document Setup Status */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Scan Session</p>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">Audit Setup</h3>
              </div>
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 size={15} />
              </span>
            </div>

            <div className="divide-y divide-white/5 text-xs font-bold">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Resume Input</span>
                <span className="text-zinc-200">
                  {file ? "PDF Upload" : resumeText ? "Text Resume" : "None"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Job Target</span>
                <span className="text-zinc-200">
                  {jobDescription.trim().length > 0 ? `${jobDescription.trim().length} chars` : "Not specified"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Analysis Engine</span>
                <span className="text-emerald-400">Exismic Match Pro</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Confidentiality</span>
                <span className="text-emerald-400">100% Private</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Status</span>
                <span className={cn("font-black", isReadyToScan ? "text-emerald-400" : "text-zinc-500")}>
                  {result ? "Complete" : isReadyToScan ? "Ready to Scan" : "Awaiting Input"}
                </span>
              </div>
            </div>
          </div>

          {/* How It Works Steps */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <ScanText size={16} className="text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">How It Works</h3>
            </div>

            <div className="space-y-3.5">
              {SCAN_STEPS.map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white">{s.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Guarantee Card */}
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 backdrop-blur-xl text-xs font-bold text-zinc-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-black">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="uppercase tracking-wider">Private & Encrypted</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
              Your resume and job postings are processed securely in memory and are never stored on public servers or shared with third parties.
            </p>
          </div>
        </div>
      </div>

      {/* Smart Workflow Tool Recommendations */}
      <ToolWorkflowChaining
        currentToolId="resume-analyzer"
        categoryId="productivity"
        outputContent={
          result
            ? `Job Context:\n${jobDescription}\n\nATS Match Score: ${result.atsScore}%\nMissing Keywords: ${result.keywords.missing.join(", ")}\nRecommendations:\n${result.suggestions.join("\n")}`
            : jobDescription
        }
      />

      {/* Dynamic Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative mb-8">
              <div className="size-20 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
              <ScanText className="absolute inset-0 m-auto size-7 text-emerald-400 animate-pulse" />
            </div>
            <h4 className="text-2xl font-black text-white uppercase tracking-wider mb-3">{status}</h4>
            <div className="w-full max-w-sm h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-mono font-black text-emerald-400 mt-4">[ {progress}% ]</p>
            <p className="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-widest">Auditing keyword matches & formatting structure</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
