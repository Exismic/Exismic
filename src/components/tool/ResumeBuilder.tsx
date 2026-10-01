"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Download,
  FileText,
  GraduationCap,
  ImagePlus,
  Layout,
  Link as LinkIcon,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Target,
  Trash2,
  Trophy,
  User,
  Wrench,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  Check,
  Copy,
  RotateCcw,
  Zap,
  Bot,
  Brain,
  Cpu,
  LayoutGrid,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { usePipedContent } from "@/lib/tool-piping";
import { PipedBadge } from "@/components/tool/PipedBadge";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import { getFunctionalStorageItem, removeFunctionalStorageItem, setFunctionalStorageItem } from "@/lib/cookie-consent";
import {
  RESUME_ACCENT_COLORS,
  RESUME_TEMPLATES,
  createEmptyResume,
  normalizeResumeData,
  resumeToText,
  type AtsInsight,
  type Education,
  type Experience,
  type Project,
  type ResumeData,
  type ResumeTemplateId,
} from "@/lib/resume";

type ActiveTab = "content" | "design" | "ai";
type ActiveSection = "personal" | "experience" | "education" | "skills" | "projects";
type PDFRendererModule = typeof import("@react-pdf/renderer");
type ResumePDFComponent = ComponentType<{
  data: ResumeData;
  accentColor: string;
  template: ResumeTemplateId;
}>;

interface ResumeSuggestResponse {
  success?: boolean;
  suggestion?: string;
  resume?: ResumeData;
  insight?: AtsInsight;
  error?: string;
}

interface CareerBlueprint {
  id: string;
  title: string;
  role: string;
  badge: string;
  data: ResumeData;
}

const STORAGE_KEY = "exismic_resume_data_v2";

const CAREER_BLUEPRINTS: CareerBlueprint[] = [
  {
    id: "fullstack",
    title: "Full-Stack Engineer",
    role: "Senior Full-Stack Developer",
    badge: "Engineering",
    data: {
      personalInfo: {
        fullName: "Alex Chen",
        email: "alex.chen@example.com",
        phone: "+1 (555) 234-5678",
        location: "San Francisco, CA (Remote)",
        website: "github.com/alexchen-dev",
        profileImage: "",
        summary: "Product-minded Senior Full-Stack Engineer with 5+ years of experience architecting high-throughput web applications, microservices, and design systems. Led migration to Next.js and Node.js reducing page load times by 42% across 1.2M monthly users.",
      },
      experience: [
        {
          id: "exp-1",
          company: "TechVanguard Labs",
          role: "Senior Software Engineer",
          period: "2022 - Present",
          description: "• Architected high-performance cloud services using Next.js, TypeScript, and PostgreSQL serving 1.2M active users.\n• Reduced API response latency by 38% through optimized database indexing and Redis query caching.\n• Mentored 6 junior engineers and established automated CI/CD deployment pipelines with 94% test coverage.",
        },
        {
          id: "exp-2",
          company: "CloudFlow Systems",
          role: "Frontend Engineer",
          period: "2019 - 2022",
          description: "• Built company core component design system used by 45+ developers, cutting feature delivery time by 30%.\n• Implemented real-time collaboration canvas using WebSockets handling 40,000 concurrent state updates.",
        },
      ],
      education: [
        {
          id: "edu-1",
          school: "University of California, Berkeley",
          degree: "B.S. in Computer Science",
          period: "2015 - 2019",
        },
      ],
      skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Docker", "GraphQL", "AWS", "Redis"],
      projects: [
        {
          id: "proj-1",
          name: "HyperScale UI",
          role: "Lead Maintainer",
          period: "2023",
          description: "Open-source accessible UI component primitives with 14,000+ GitHub stars and 200k weekly npm downloads.",
          link: "github.com/alexchen/hyperscale-ui",
        },
      ],
    },
  },
  {
    id: "designer",
    title: "Product Designer",
    role: "Lead UI/UX Designer",
    badge: "Design",
    data: {
      personalInfo: {
        fullName: "Sophia Miller",
        email: "sophia.miller@example.com",
        phone: "+1 (555) 345-6789",
        location: "New York, NY",
        website: "sophiadesigns.io",
        profileImage: "",
        summary: "Lead Product Designer passionate about transforming complex enterprise workflows into intuitive, beautiful consumer-grade software. Specialize in multi-brand design systems, user journey mapping, and conversion-focused SaaS interfaces.",
      },
      experience: [
        {
          id: "exp-1",
          company: "Orbit Creative Studio",
          role: "Lead UI/UX Designer",
          period: "2021 - Present",
          description: "• Spearheaded end-to-end redesign of flagship mobile app, increasing 30-day user retention by 28% and achieving a 4.9 App Store rating.\n• Created multi-platform token design system that accelerated developer handoff by 45%.\n• Conducted 50+ qualitative user interviews to validate feature roadmaps.",
        },
        {
          id: "exp-2",
          company: "PixelCraft Agency",
          role: "Senior Product Designer",
          period: "2018 - 2021",
          description: "• Delivered complete brand guidelines, design systems, and responsive web applications for 14 venture-backed startups.\n• Designed interactive dashboards that boosted client enterprise sales closing rates by 22%.",
        },
      ],
      education: [
        {
          id: "edu-1",
          school: "Rhode Island School of Design",
          degree: "B.F.A. in Interaction Design",
          period: "2014 - 2018",
        },
      ],
      skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Information Architecture", "Design Tokens", "Mobile UX", "Wireframing"],
      projects: [
        {
          id: "proj-1",
          name: "Aura Design Tokens",
          role: "Creator",
          period: "2023",
          description: "Modular, accessible design system token generator used by over 80,000 designers worldwide.",
          link: "figma.com/@auratokens",
        },
      ],
    },
  },
  {
    id: "product",
    title: "Product Manager",
    role: "Principal Product Manager",
    badge: "Product",
    data: {
      personalInfo: {
        fullName: "Marcus Vance",
        email: "marcus.vance@example.com",
        phone: "+1 (555) 456-7890",
        location: "Austin, TX (Hybrid)",
        website: "linkedin.com/in/marcusvance",
        profileImage: "",
        summary: "Outcome-driven Product Leader with 7+ years translating customer discovery into scalable commercial products. Proven track record driving $14M in ARR expansion, lifting onboarding funnel conversion by 34%, and leading cross-functional squads.",
      },
      experience: [
        {
          id: "exp-1",
          company: "Apex Cloud Technologies",
          role: "Principal Product Manager",
          period: "2022 - Present",
          description: "• Owned product roadmap for enterprise collaboration suite, growing quarterly active users from 400k to 1.8M.\n• Introduced tiered packaging and self-serve onboarding that drove $6.2M in net new ARR within 9 months.\n• Aligned engineering, design, and GTM teams across bi-weekly agile development sprints.",
        },
        {
          id: "exp-2",
          company: "Pulse Commerce",
          role: "Senior Product Manager",
          period: "2019 - 2022",
          description: "• Shipped 1-click checkout experience that increased mobile checkout conversion by 22% and added $8M annualized GMV.\n• Defined product telemetry metrics and instituted rigorous A/B experimentation framework.",
        },
      ],
      education: [
        {
          id: "edu-1",
          school: "Stanford University",
          degree: "B.S. in Management Science & Engineering",
          period: "2015 - 2019",
        },
      ],
      skills: ["Product Strategy", "Agile Sprints", "A/B Testing", "User Discovery", "Go-To-Market", "SQL & Analytics", "OKRs", "Pricing"],
      projects: [
        {
          id: "proj-1",
          name: "SaaS Funnel Blueprint",
          role: "Author",
          period: "2022",
          description: "Comprehensive product playbook on optimizing B2B self-serve onboarding conversion rates.",
          link: "marcusvance.com/playbook",
        },
      ],
    },
  },
  {
    id: "data",
    title: "Data & AI Specialist",
    role: "Senior Machine Learning Engineer",
    badge: "Data & AI",
    data: {
      personalInfo: {
        fullName: "Elena Rostova",
        email: "elena.rostova@example.com",
        phone: "+1 (555) 567-8901",
        location: "Seattle, WA",
        website: "github.com/erostova",
        profileImage: "",
        summary: "Machine Learning Engineer specializing in large language model fine-tuning, retrieval-augmented generation (RAG), and high-throughput real-time inference pipelines. Built predictive architectures handling 60M+ daily events.",
      },
      experience: [
        {
          id: "exp-1",
          company: "NeuralCore AI",
          role: "Senior Machine Learning Engineer",
          period: "2021 - Present",
          description: "• Trained and deployed domain-specific LLM classifiers achieving 97.4% precision on semantic categorization benchmarks.\n• Optimized vector database query latency by 55% using custom HNSW graph indexing and quantization.\n• Supervised pipeline infrastructure handling 60M daily embedding lookups with 99.98% uptime.",
        },
        {
          id: "exp-2",
          company: "DataPulse Analytics",
          role: "Data Scientist",
          period: "2018 - 2021",
          description: "• Developed anomaly detection algorithms that reduced annual payment fraud chargebacks by $3.2M.\n• Constructed automated feature engineering pipelines in Python and Apache Spark.",
        },
      ],
      education: [
        {
          id: "edu-1",
          school: "Carnegie Mellon University",
          degree: "M.S. in Machine Learning & Robotics",
          period: "2016 - 2018",
        },
      ],
      skills: ["Python", "PyTorch", "Transformers", "LLMs", "RAG Pipelines", "SQL", "FastAPI", "Vector DBs", "Docker", "MLOps"],
      projects: [
        {
          id: "proj-1",
          name: "FastEmbed Python Engine",
          role: "Core Contributor",
          period: "2023",
          description: "High-speed tokenization library with zero PyTorch runtime dependencies for edge inference.",
          link: "github.com/erostova/fastembed",
        },
      ],
    },
  },
  {
    id: "marketing",
    title: "Growth Marketer",
    role: "Head of Growth Marketing",
    badge: "Marketing",
    data: {
      personalInfo: {
        fullName: "Jordan Lee",
        email: "jordan.lee@example.com",
        phone: "+1 (555) 678-9012",
        location: "Chicago, IL (Remote)",
        website: "jordangrowth.com",
        profileImage: "",
        summary: "Data-driven Growth Marketing Leader experienced in scaling early-stage B2B and consumer SaaS from $1M to $12M ARR. Specialize in customer acquisition cost reduction, SEO keyword dominance, and viral product-led expansion loops.",
      },
      experience: [
        {
          id: "exp-1",
          company: "LaunchPad Media",
          role: "Head of Growth Marketing",
          period: "2022 - Present",
          description: "• Directed $4.5M annual performance marketing budget, delivering 3.4x blended return on ad spend (ROAS) across paid search and paid social.\n• Scaled organic inbound search traffic from 80k to 550k monthly sessions through programmatic SEO content hub architecture.\n• Lowered customer acquisition cost (CAC) by 32% while doubling qualified sales demo velocity.",
        },
        {
          id: "exp-2",
          company: "SaaSify Scale",
          role: "Senior Growth Marketer",
          period: "2019 - 2022",
          description: "• Architected automated email lifecycle workflows that increased free-to-paid trial conversion by 26%.\n• Designed customer referral engine accounting for 35% of total monthly new logo acquisitions.",
        },
      ],
      education: [
        {
          id: "edu-1",
          school: "New York University",
          degree: "B.S. in Marketing & Data Analytics",
          period: "2015 - 2019",
        },
      ],
      skills: ["Growth Strategy", "SEO", "Google Ads", "Conversion Rate Optimization", "HubSpot", "Google Analytics 4", "Email Lifecycle", "Mixpanel"],
      projects: [
        {
          id: "proj-1",
          name: "Organic Search Masterclass",
          role: "Lead Creator",
          period: "2023",
          description: "Playbook on programmatic search optimization read by over 40,000 marketing professionals.",
          link: "jordangrowth.com/masterclass",
        },
      ],
    },
  },
  {
    id: "executive",
    title: "Executive Director",
    role: "Director of Operations & Strategy",
    badge: "Executive",
    data: {
      personalInfo: {
        fullName: "David Sterling",
        email: "david.sterling@example.com",
        phone: "+1 (555) 789-0123",
        location: "Boston, MA",
        website: "linkedin.com/in/davidsterling-ops",
        profileImage: "",
        summary: "Executive Operations Strategist with 10+ years driving global supply chain efficiencies, restructuring corporate operations, and executing multi-million dollar capital budgets. Proven expertise in cross-functional team leadership and P&L governance.",
      },
      experience: [
        {
          id: "exp-1",
          company: "Global Logistics Hub",
          role: "Director of Operations",
          period: "2020 - Present",
          description: "• Managed $35M departmental operating budget across 4 international regional fulfillment centers.\n• Decreased average supply chain transit turnaround times by 24% while reducing operational overhead by 16%.\n• Championed enterprise ERP migration unifying inventory visibility across 14 distribution hubs.",
        },
        {
          id: "exp-2",
          company: "Apex Holdings",
          role: "Senior Operations Manager",
          period: "2015 - 2020",
          description: "• Consolidated 120 key vendor contracts, generating $4.8M in negotiated multi-year procurement savings.\n• Led corporate workforce productivity audit that improved fulfillment throughput by 31%.",
        },
      ],
      education: [
        {
          id: "edu-1",
          school: "Georgia Institute of Technology",
          degree: "B.S. in Industrial & Systems Engineering",
          period: "2011 - 2015",
        },
      ],
      skills: ["Strategic Planning", "P&L Management", "Supply Chain Optimization", "Team Leadership", "Process Automation", "Vendor Negotiation", "Risk Governance"],
      projects: [
        {
          id: "proj-1",
          name: "Global Ops Framework",
          role: "Co-Author",
          period: "2021",
          description: "Standard operating procedure framework for decentralized international logistics teams.",
          link: "davidsterling.com/framework",
        },
      ],
    },
  },
];

const SECTION_NAV: Array<{ id: ActiveSection; label: string; icon: typeof User }> = [
  { id: "personal", label: "Profile", icon: User },
  { id: "experience", label: "Work", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: Trophy },
];

const TOP_TABS: Array<{ id: ActiveTab; label: string; icon: typeof User }> = [
  { id: "content", label: "Content", icon: User },
  { id: "design", label: "Design & Style", icon: Layout },
  { id: "ai", label: "AI Tailoring", icon: Bot },
];

const inputClass = "w-full min-h-12 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm font-bold text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10";
const textareaClass = "w-full min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold leading-relaxed text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 resize-none";

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
}

function formatBulletLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*]|\d+\.)\s*/, "").trim())
    .filter(Boolean);
}

function uniqueSkills(skills: string[]) {
  return [...new Set(skills.map((skill) => skill.trim()).filter(Boolean))].slice(0, 32);
}

export function ResumeBuilder() {
  const { isPro } = usePro();
  const { credits, refreshCredits, setShowUpsell } = useCredits();
  const { isCompact, toggleCompact, isFocusMode, toggleFocusMode } = useSidebarStore();
  const [zoom, setZoom] = useState<number>(0.85);
  const [data, setData] = useState<ResumeData>(() => CAREER_BLUEPRINTS[0].data);
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("fullstack");
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [activeSection, setActiveSection] = useState<ActiveSection>("personal");
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>("modern");
  const [accentColor, setAccentColor] = useState("#10b981"); // Default Emerald
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [aiBrief, setAiBrief] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [atsInsight, setAtsInsight] = useState<AtsInsight | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [PDFRenderer, setPDFRenderer] = useState<PDFRendererModule | null>(null);
  const [ResumePDF, setResumePDF] = useState<ResumePDFComponent | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { pipedPayload, isPiped, clearPiped } = usePipedContent((payload) => {
    if (payload.content) {
      setNotice(`Imported content from ${payload.sourceToolName}. You can add it to your experience or skills.`);
    }
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      if (window.innerWidth < 1440) {
        setZoom(0.78);
      } else if (window.innerWidth < 1680) {
        setZoom(0.85);
      } else {
        setZoom(0.95);
      }
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    import("./ResumePDF").then((mod) => setResumePDF(() => mod.default));
    import("@react-pdf/renderer").then((mod) => setPDFRenderer(mod));
  }, [isClient]);

  useEffect(() => {
    try {
      const saved = getFunctionalStorageItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        data?: unknown;
        selectedTemplate?: ResumeTemplateId;
        accentColor?: string;
      };
      setData(normalizeResumeData(parsed.data));
      if (parsed.selectedTemplate && RESUME_TEMPLATES.some((template) => template.id === parsed.selectedTemplate)) {
        setSelectedTemplate(parsed.selectedTemplate);
      }
      if (parsed.accentColor) setAccentColor(parsed.accentColor);
    } catch (error) {
      console.error("Failed to load saved resume:", error);
      removeFunctionalStorageItem(STORAGE_KEY);
    }
  }, []);

  const completionScore = useMemo(() => {
    const checks = [
      data.personalInfo.fullName,
      data.personalInfo.email,
      data.personalInfo.summary,
      data.experience.length > 0 ? "experience" : "",
      data.skills.length >= 5 ? "skills" : "",
      data.education.length > 0 || data.projects.length > 0 ? "proof" : "",
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [data]);

  const missingFields = useMemo(() => {
    const missing = [];
    if (!data.personalInfo.fullName) missing.push("name");
    if (!data.personalInfo.email) missing.push("email");
    if (!data.personalInfo.summary) missing.push("summary");
    if (!data.experience.length) missing.push("experience");
    if (data.skills.length < 5) missing.push("5+ skills");
    return missing;
  }, [data]);

  const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleProfileImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAiError("Please upload a PNG, JPG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAiError("Profile image must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updatePersonalInfo("profileImage", String(reader.result));
      setAiError(null);
    };
    reader.readAsDataURL(file);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: createId("exp"), company: "", role: "", period: "", description: "" },
      ],
    }));
  };

  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: createId("edu"), school: "", degree: "", period: "" },
      ],
    }));
  };

  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: createId("project"), name: "", role: "", description: "", link: "" },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setData((prev) => ({ ...prev, experience: prev.experience.filter((item) => item.id !== id) }));
  };

  const removeEducation = (id: string) => {
    setData((prev) => ({ ...prev, education: prev.education.filter((item) => item.id !== id) }));
  };

  const removeProject = (id: string) => {
    setData((prev) => ({ ...prev, projects: prev.projects.filter((item) => item.id !== id) }));
  };

  const addSkill = (skill: string) => {
    setData((prev) => ({ ...prev, skills: uniqueSkills([...prev.skills, skill]) }));
  };

  const removeSkill = (skill: string) => {
    setData((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== skill) }));
  };

  const saveDraft = () => {
    const saved = setFunctionalStorageItem(STORAGE_KEY, JSON.stringify({ data, selectedTemplate, accentColor }));
    setSavedSuccess(true);
    setNotice(saved ? "Resume saved locally on this device." : "Enable Functional cookies to save this resume on your device.");
    window.setTimeout(() => {
      setNotice(null);
      setSavedSuccess(false);
    }, 2500);
  };

  const applyBlueprint = (bp: CareerBlueprint) => {
    setData(bp.data);
    setActiveBlueprintId(bp.id);
    setNotice(`Loaded ${bp.title} career blueprint.`);
    window.setTimeout(() => setNotice(null), 2500);
  };

  const clearAll = () => {
    setData(createEmptyResume());
    setActiveBlueprintId("");
    setNotice("Cleared to blank resume canvas.");
    window.setTimeout(() => setNotice(null), 2500);
  };

  const fillSample = () => {
    applyBlueprint(CAREER_BLUEPRINTS[0]);
  };

  const generateWithAI = async (section: "summary" | "experience" | "skills", role: string, context: string, id?: string) => {
    setIsGenerating(id || section);
    setAiError(null);

    try {
      const response = await fetch("/api/tools/ai/resume-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "section", section, role, context }),
      });
      const result = await response.json() as ResumeSuggestResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.error || "AI suggestion failed.");
      }

      if (section === "summary" && result.suggestion) {
        updatePersonalInfo("summary", result.suggestion);
      } else if (section === "experience" && id && result.suggestion) {
        updateExperience(id, "description", result.suggestion);
      } else if (section === "skills" && result.suggestion) {
        const newSkills = result.suggestion
          .split(/[,\n]/)
          .map((skill) => skill.trim().replace(/^[\d.*-]+/, "").trim())
          .filter((skill) => skill.length > 1 && skill.length < 36 && !skill.includes("."));
        setData((prev) => ({ ...prev, skills: uniqueSkills([...prev.skills, ...newSkills]) }));
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI suggestion failed.");
    } finally {
      setIsGenerating(null);
    }
  };

  const generateFullResume = async () => {
    setIsGenerating("full-resume");
    setAiError(null);

    try {
      const response = await fetch("/api/tools/ai/resume-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "full",
          brief: aiBrief,
          role: targetRole,
          jobDescription,
        }),
      });
      const result = await response.json() as ResumeSuggestResponse;

      if (response.status === 402 || result.error?.toLowerCase().includes("credits")) {
        setShowUpsell(true);
        throw new Error(result.error || "Insufficient credits. Please top up to build your resume.");
      }

      if (!response.ok || !result.success || !result.resume) {
        throw new Error(result.error || "Exismic AI could not build the resume.");
      }

      await refreshCredits();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("quests-updated"));
      }
      setData(normalizeResumeData(result.resume));
      setActiveTab("content");
      setActiveSection("personal");
      setNotice("Exismic AI built your resume draft.");
      window.setTimeout(() => setNotice(null), 2500);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Exismic AI could not build the resume.");
    } finally {
      setIsGenerating(null);
    }
  };

  const runAtsMatch = async () => {
    setIsGenerating("ats");
    setAiError(null);

    try {
      const response = await fetch("/api/tools/ai/resume-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ats",
          resume: data,
          resumeText: resumeToText(data),
          role: targetRole,
          jobDescription,
        }),
      });
      const result = await response.json() as ResumeSuggestResponse;

      if (response.status === 402 || result.error?.toLowerCase().includes("credits")) {
        setShowUpsell(true);
        throw new Error(result.error || "Insufficient credits. Please top up to run ATS match.");
      }

      if (!response.ok || !result.success || !result.insight) {
        throw new Error(result.error || "ATS analysis failed.");
      }

      await refreshCredits();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("quests-updated"));
      }
      setAtsInsight(result.insight);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "ATS analysis failed.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleExport = async () => {
    if (!ResumePDF || !PDFRenderer) return;

    try {
      setIsGenerating("exporting");
      const blob = await PDFRenderer.pdf(
        <ResumePDF data={data} accentColor={accentColor} template={selectedTemplate} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(data.personalInfo.fullName || "Exismic_Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("quests-updated"));
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      setAiError("PDF export failed. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pb-24">
      {/* Studio Top Control Deck */}
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <FileText size={14} className="text-emerald-400" />
              <span>Resume Studio</span>
            </div>
            
            {/* Dynamic Strength Meter */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-1.5">
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Strength</span>
                  <span className={cn(
                    "text-xs font-mono font-black",
                    completionScore >= 80 ? "text-emerald-400" : completionScore >= 50 ? "text-cyan-400" : "text-amber-400"
                  )}>
                    {completionScore}%
                  </span>
                </div>
                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      completionScore >= 80 ? "bg-emerald-400" : completionScore >= 50 ? "bg-cyan-400" : "bg-amber-400"
                    )}
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={saveDraft}
              className={cn(
                "min-h-11 rounded-2xl border px-4 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer",
                savedSuccess
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400/50"
              )}
            >
              {savedSuccess ? <Check size={14} /> : <CheckCircle2 size={14} />}
              <span>{savedSuccess ? "Saved!" : "Save Draft"}</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={!isClient || !ResumePDF || !PDFRenderer || isGenerating === "exporting"}
              className="min-h-11 rounded-2xl bg-white hover:bg-zinc-200 text-black px-4 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating === "exporting" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Export PDF</span>
            </button>

            {/* Studio Workspace Layout Toggles */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-white/10">
              <button
                type="button"
                onClick={toggleCompact}
                title={isCompact ? "Expand Sidebar" : "Collapse Sidebar"}
                className={cn(
                  "min-h-11 px-3.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer",
                  isCompact ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                )}
              >
                {isCompact ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
                <span className="text-[11px] font-bold">{isCompact ? "Show Sidebar" : "Compact"}</span>
              </button>

              <button
                type="button"
                onClick={toggleFocusMode}
                title={isFocusMode ? "Exit Focus Mode" : "Focus Studio (Hide UI)"}
                className={cn(
                  "min-h-11 px-3.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer",
                  isFocusMode ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                )}
              >
                {isFocusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                <span className="text-[11px] font-bold">{isFocusMode ? "Exit Focus" : "Focus Studio"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Instant Career Blueprints Bar */}
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.025] p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <LayoutGrid size={15} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Instant Career Blueprints</h3>
              <p className="text-[11px] font-medium text-zinc-400">Select a pre-filled, ATS-ready blueprint to jumpstart your resume in 1 click</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Start Blank</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CAREER_BLUEPRINTS.map((bp) => {
            const isSelected = activeBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => applyBlueprint(bp)}
                className={cn(
                  "p-3 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between group",
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
        <div className="mb-5">
          <PipedBadge
            sourceName={pipedPayload.sourceToolName}
            onClear={() => {
              setNotice(null);
              clearPiped();
            }}
          />
        </div>
      )}

      {(notice || aiError) && (
        <div className={cn(
          "mb-5 rounded-2xl border px-5 py-4 text-sm font-bold",
          aiError ? "border-rose-400/20 bg-rose-500/10 text-rose-100" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
        )}>
          {aiError || notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-5 space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-3 backdrop-blur-2xl">
            <div className="grid grid-cols-3 gap-2">
              {TOP_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-black uppercase tracking-wider transition",
                    activeTab === tab.id
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] font-black"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <tab.icon size={15} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "content" && (
                <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="flex border-b border-white/10 overflow-x-auto">
                    {SECTION_NAV.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "flex min-w-[92px] flex-1 items-center justify-center gap-2 px-3 py-4 text-[10px] font-black uppercase tracking-widest transition",
                          activeSection === section.id
                            ? "bg-emerald-500/15 text-emerald-300 border-b-2 border-emerald-400 font-black"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]",
                        )}
                      >
                        <section.icon size={14} />
                        {section.label}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-none space-y-5 p-5 lg:max-h-[680px] lg:overflow-y-auto">
                    {activeSection === "personal" && (
                      <Panel title="Personal Details" icon={User}>
                        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div
                              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.6rem] border border-white/15 bg-gradient-to-br from-emerald-500 to-teal-700 bg-cover bg-center text-2xl font-black text-white shadow-[0_18px_50px_rgba(16,185,129,0.18)]"
                              style={data.personalInfo.profileImage ? { backgroundImage: `url(${data.personalInfo.profileImage})` } : undefined}
                            >
                              {!data.personalInfo.profileImage && (data.personalInfo.fullName || "YN")
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-white">Profile image</p>
                              <p className="mt-1 text-xs font-bold leading-relaxed text-zinc-500">Use a clean headshot or brand avatar. It replaces the initials badge in modern, executive, and creative templates.</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-black uppercase tracking-widest text-black transition hover:scale-[1.02] active:scale-95">
                                  <ImagePlus size={15} />
                                  Upload Image
                                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfileImageUpload} className="hidden" />
                                </label>
                                {data.personalInfo.profileImage && (
                                  <button onClick={() => updatePersonalInfo("profileImage", "")} className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black uppercase tracking-widest text-zinc-300 transition hover:text-white">
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <input value={data.personalInfo.fullName} onChange={(event) => updatePersonalInfo("fullName", event.target.value)} placeholder="Full name" className={inputClass} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input value={data.personalInfo.email} onChange={(event) => updatePersonalInfo("email", event.target.value)} placeholder="Email" className={inputClass} />
                          <input value={data.personalInfo.phone} onChange={(event) => updatePersonalInfo("phone", event.target.value)} placeholder="Phone" className={inputClass} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input value={data.personalInfo.location} onChange={(event) => updatePersonalInfo("location", event.target.value)} placeholder="Location" className={inputClass} />
                          <input value={data.personalInfo.website} onChange={(event) => updatePersonalInfo("website", event.target.value)} placeholder="Website / LinkedIn" className={inputClass} />
                        </div>
                        <div className="relative">
                          <textarea value={data.personalInfo.summary} onChange={(event) => updatePersonalInfo("summary", event.target.value)} placeholder="Professional summary" className={textareaClass} />
                          <AIButton loading={isGenerating === "summary"} onClick={() => generateWithAI("summary", targetRole || data.personalInfo.fullName || "professional", data.personalInfo.summary)} />
                        </div>
                      </Panel>
                    )}

                    {activeSection === "experience" && (
                      <Panel title="Work Experience" icon={Briefcase} action={<IconButton onClick={addExperience}><Plus size={16} /></IconButton>}>
                        {data.experience.length === 0 && <EmptyState text="Add a role or let Exismic Ai build one from your brief." />}
                        {data.experience.map((exp) => (
                          <EditorCard key={exp.id} onRemove={() => removeExperience(exp.id)}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input value={exp.company} onChange={(event) => updateExperience(exp.id, "company", event.target.value)} placeholder="Company" className={inputClass} />
                              <input value={exp.role} onChange={(event) => updateExperience(exp.id, "role", event.target.value)} placeholder="Role" className={inputClass} />
                            </div>
                            <input value={exp.period} onChange={(event) => updateExperience(exp.id, "period", event.target.value)} placeholder="Period, e.g. 2024 - Present" className={inputClass} />
                            <div className="relative">
                              <textarea value={exp.description} onChange={(event) => updateExperience(exp.id, "description", event.target.value)} placeholder="Achievements and responsibilities" className={textareaClass} />
                              <AIButton loading={isGenerating === exp.id} onClick={() => generateWithAI("experience", exp.role || targetRole || "professional", exp.company, exp.id)} />
                            </div>
                          </EditorCard>
                        ))}
                      </Panel>
                    )}

                    {activeSection === "education" && (
                      <Panel title="Education" icon={GraduationCap} action={<IconButton onClick={addEducation}><Plus size={16} /></IconButton>}>
                        {data.education.length === 0 && <EmptyState text="Add education, certifications, bootcamps, or relevant coursework." />}
                        {data.education.map((edu) => (
                          <EditorCard key={edu.id} onRemove={() => removeEducation(edu.id)}>
                            <input value={edu.school} onChange={(event) => updateEducation(edu.id, "school", event.target.value)} placeholder="School / University" className={inputClass} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input value={edu.degree} onChange={(event) => updateEducation(edu.id, "degree", event.target.value)} placeholder="Degree / Certification" className={inputClass} />
                              <input value={edu.period} onChange={(event) => updateEducation(edu.id, "period", event.target.value)} placeholder="Period" className={inputClass} />
                            </div>
                          </EditorCard>
                        ))}
                      </Panel>
                    )}

                    {activeSection === "skills" && (
                      <Panel title="Skills" icon={Wrench}>
                        <SkillInput onAdd={addSkill} />
                        <button
                          onClick={() => generateWithAI("skills", targetRole || "professional", data.skills.join(", "))}
                          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-black uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-500/15 cursor-pointer"
                        >
                          {isGenerating === "skills" ? <Loader2 size={16} className="animate-spin" /> : <Cpu size={16} />}
                          Suggest Skills With AI
                        </button>
                        <div className="flex flex-wrap gap-2">
                          {data.skills.map((skill) => (
                            <span key={skill} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-200">
                              {skill}
                              <button onClick={() => removeSkill(skill)} className="text-zinc-600 transition hover:text-rose-300" aria-label={`Remove ${skill}`}>
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </Panel>
                    )}

                    {activeSection === "projects" && (
                      <Panel title="Projects" icon={Trophy} action={<IconButton onClick={addProject}><Plus size={16} /></IconButton>}>
                        {data.projects.length === 0 && <EmptyState text="Add standout projects, case studies, or shipped products." />}
                        {data.projects.map((project) => (
                          <EditorCard key={project.id} onRemove={() => removeProject(project.id)}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input value={project.name} onChange={(event) => updateProject(project.id, "name", event.target.value)} placeholder="Project name" className={inputClass} />
                              <input value={project.role} onChange={(event) => updateProject(project.id, "role", event.target.value)} placeholder="Role / Stack" className={inputClass} />
                            </div>
                            <input value={project.link} onChange={(event) => updateProject(project.id, "link", event.target.value)} placeholder="Project link" className={inputClass} />
                            <textarea value={project.description} onChange={(event) => updateProject(project.id, "description", event.target.value)} placeholder="Impact, scope, metrics" className={textareaClass} />
                          </EditorCard>
                        ))}
                      </Panel>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "design" && (
                <motion.div key="design" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8 p-5">
                  <Panel title="Templates" icon={Layout}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {RESUME_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={cn(
                            "text-left rounded-3xl border p-3 transition-all cursor-pointer",
                            selectedTemplate === template.id ? "border-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "border-white/10 bg-white/[0.035] hover:border-white/20",
                          )}
                        >
                          <div className={cn("mb-4 aspect-[4/3] rounded-2xl bg-gradient-to-br p-3", template.previewClass)}>
                            <div className="h-2 w-1/2 rounded-full bg-white/80" />
                            <div className="mt-4 space-y-2">
                              <div className="h-1.5 rounded-full bg-white/55" />
                              <div className="h-1.5 w-5/6 rounded-full bg-white/25" />
                              <div className="h-1.5 w-2/3 rounded-full bg-white/25" />
                            </div>
                          </div>
                          <p className="text-sm font-black text-white">{template.name}</p>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-500">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Accent Color" icon={Award}>
                    <div className="flex flex-wrap gap-3">
                      {RESUME_ACCENT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setAccentColor(color)}
                          className={cn(
                            "h-11 w-11 rounded-2xl border border-white/15 transition hover:scale-105 active:scale-95",
                            accentColor === color && "ring-2 ring-white ring-offset-4 ring-offset-black",
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Use ${color}`}
                        />
                      ))}
                    </div>
                  </Panel>
                </motion.div>
              )}

              {activeTab === "ai" && (
                <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5 p-5">
                  <Panel title="AI Resume Tailor" icon={Bot}>
                    <ProNotice isPro={isPro} credits={credits} />
                    <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Target role or job title, e.g. Senior Frontend Developer" className={inputClass} />
                    <textarea value={aiBrief} onChange={(event) => setAiBrief(event.target.value)} placeholder="Briefly describe your career background, key projects, strongest skills, and achievements." className={cn(textareaClass, "min-h-36")} />
                    <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the job description here for keyword matching and role-targeted tailoring." className={cn(textareaClass, "min-h-36")} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={generateFullResume}
                        disabled={!aiBrief.trim() || isGenerating === "full-resume"}
                        className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 px-4 text-xs font-black uppercase tracking-widest text-black transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                      >
                        {isGenerating === "full-resume" ? <Loader2 size={17} className="animate-spin" /> : <Bot size={17} />}
                        {isPro ? "Build Resume (Pro)" : "Build Resume (15 Credits)"}
                      </button>
                      <button
                        onClick={runAtsMatch}
                        disabled={!jobDescription.trim() || isGenerating === "ats"}
                        className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 text-xs font-black uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                      >
                        {isGenerating === "ats" ? <Loader2 size={17} className="animate-spin" /> : <Target size={17} />}
                        {isPro ? "Job Match Scan (Pro)" : "Job Match Scan (10 Credits)"}
                      </button>
                    </div>
                  </Panel>

                  {atsInsight && (
                    <Panel title="Job Match Insights" icon={Target}>
                      <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200/70">Match Score</p>
                        <p className="mt-2 text-5xl font-black text-white">{atsInsight.score}%</p>
                        <p className="mt-2 text-sm font-bold leading-relaxed text-emerald-100/80">{atsInsight.verdict}</p>
                      </div>
                      <InsightList title="Strengths" items={atsInsight.strengths} />
                      <InsightList title="Missing Keywords" items={atsInsight.keywords} />
                      <InsightList title="Fix Next" items={atsInsight.fixes} />
                    </Panel>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleExport}
            disabled={!isClient || !ResumePDF || !PDFRenderer || isGenerating === "exporting"}
            className="group relative flex min-h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-[2rem] bg-white px-6 text-xs font-black uppercase tracking-[0.22em] text-black shadow-2xl transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 translate-x-[-120%] skew-x-12 bg-cyan-200/70 transition-transform duration-1000 group-hover:translate-x-[120%]" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-black text-white">
              {isGenerating === "exporting" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            </span>
            <span className="relative">{isGenerating === "exporting" ? "Generating PDF" : "Download PDF"}</span>
          </button>
        </section>

        <section className="xl:col-span-7">
          <div className="sticky top-24 space-y-4">
            {/* Canvas Zoom and Dimensions Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <FileText size={15} className="text-emerald-400" />
                <span className="text-white font-black text-xs uppercase tracking-wider">A4 Live Sheet</span>
                <span className="text-zinc-500 text-[11px] hidden sm:inline">· Standard Printable A4</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.08) * 100) / 100))}
                  className="size-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-mono font-black text-white min-w-12 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.2, Math.round((z + 0.08) * 100) / 100))}
                  className="size-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <button
                  type="button"
                  onClick={() => setZoom(0.78)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer",
                    Math.abs(zoom - 0.78) < 0.03 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-zinc-400 hover:text-white"
                  )}
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer",
                    zoom === 1 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-zinc-400 hover:text-white"
                  )}
                >
                  100%
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ScorePill label="Strength" value={`${completionScore}%`} />
              <ScorePill label="Sections" value={`${data.experience.length + data.education.length + data.projects.length}`} />
              <ScorePill label="Skills" value={`${data.skills.length}`} />
              <ScorePill label="Style" value={selectedTemplate} />
            </div>
            {missingFields.length > 0 ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Suggested additions to maximize hiring score:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingFields.map((field) => (
                    <span key={field} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                      + Add {field}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-2.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>All core sections completed. Your resume is fully ready for job applications!</span>
              </div>
            )}
            <ResumePreview data={data} accentColor={accentColor} selectedTemplate={selectedTemplate} zoom={zoom} />

            {/* Retention Bar: Email Resume, Save to Cloud Vault, Daily Quests */}
            <ResultRetentionBar
              toolType="resume-builder"
              toolName="Resume Builder"
              title={data.personalInfo.fullName ? `${data.personalInfo.fullName} - Resume` : "My Resume"}
              content={resumeToText(data)}
              metadata={{
                template: selectedTemplate,
                accentColor,
                completionScore,
                role: targetRole || "Professional",
              }}
              downloadAction={handleExport}
              downloadLabel="Download PDF"
              className="mt-4"
            />
          </div>
        </section>
      </div>

      {/* Smart Workflow Tool Recommendations with Live Resume Content Piping */}
      <ToolWorkflowChaining
        currentToolId="resume-builder"
        categoryId="productivity"
        getContent={() => resumeToText(data)}
      />
    </div>
  );
}

function Panel({ title, icon: Icon, action, children }: { title: string; icon: typeof User; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <Icon size={18} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function IconButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10 cursor-pointer">
      {children}
    </button>
  );
}

function AIButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition active:scale-95 cursor-pointer"
      aria-label="Enhance with AI"
      title="Enhance with AI"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={14} className="fill-white" />}
    </button>
  );
}

function EditorCard({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <div className="relative space-y-3 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
      <button onClick={onRemove} className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/20 text-rose-200 transition hover:bg-rose-500/30 cursor-pointer" aria-label="Remove">
        <Trash2 size={14} />
      </button>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-5 text-sm font-bold leading-relaxed text-zinc-500">
      {text}
    </div>
  );
}

function SkillInput({ onAdd }: { onAdd: (skill: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onAdd(value);
            setValue("");
          }
        }}
        placeholder="Type a skill and press Enter"
        className={inputClass}
      />
      <button
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Add skill"
      >
        <Plus size={17} />
      </button>
    </div>
  );
}

function ProNotice({ isPro, credits }: { isPro: boolean; credits: number }) {
  if (isPro) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold leading-relaxed text-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Crown size={16} className="text-emerald-400 shrink-0" />
          <span>Pro Active: Unlimited resume tailoring and job keyword scans included.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 flex items-center justify-between text-xs font-bold text-zinc-300">
      <div className="flex items-center gap-2.5">
        <Zap size={16} className="text-emerald-400 shrink-0" />
        <span>Use your daily credits to generate a complete resume or run keyword scans.</span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
        {credits} Credits Available
      </span>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">{title}</p>
      <div className="space-y-2">
        {items.slice(0, 6).map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold leading-relaxed text-zinc-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white capitalize">{value}</p>
    </div>
  );
}

function ResumePreview({
  data,
  accentColor,
  selectedTemplate,
  zoom = 1,
}: {
  data: ResumeData;
  accentColor: string;
  selectedTemplate: ResumeTemplateId;
  zoom?: number;
}) {
  const role = data.experience[0]?.role || "Professional Resume";
  const name = data.personalInfo.fullName || "Your Name";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const contactItems = [
    data.personalInfo.email ? { icon: Mail, text: data.personalInfo.email } : null,
    data.personalInfo.phone ? { icon: Phone, text: data.personalInfo.phone } : null,
    data.personalInfo.location ? { icon: MapPin, text: data.personalInfo.location } : null,
    data.personalInfo.website ? { icon: LinkIcon, text: data.personalInfo.website } : null,
  ].filter((item): item is { icon: typeof Mail; text: string } => Boolean(item));
  const pageClass = cn(
    "min-h-[1020px] w-[760px] text-black shadow-2xl rounded-sm shrink-0",
    selectedTemplate === "modern" && "bg-white p-12",
    selectedTemplate === "executive" && "bg-[#fbfaf7] p-10",
    selectedTemplate === "creative" && "bg-[#fffafb] p-10",
    selectedTemplate === "classic" && "bg-white p-12 font-serif",
  );

  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 p-2 sm:p-4 shadow-[0_35px_100px_rgba(0,0,0,0.45)] flex justify-center">
      <div
        className="transition-transform duration-200 origin-top flex justify-center"
        style={{
          transform: `scale(${zoom})`,
          width: 760,
          marginBottom: zoom < 1 ? `-${Math.round((1 - zoom) * 1050)}px` : 0,
        }}
      >
        <div className={pageClass}>
        <PreviewHeader
          accentColor={accentColor}
          contactItems={contactItems}
          initials={initials}
          name={name}
          profileImage={data.personalInfo.profileImage}
          role={role}
          template={selectedTemplate}
        />

        {selectedTemplate === "executive" ? (
          <div className="grid grid-cols-[210px_1fr] gap-8 pt-8">
            <aside className="space-y-8 border-r border-stone-200 pr-7">
              {data.skills.length > 0 && <SkillsPreview accentColor={accentColor} skills={data.skills} template={selectedTemplate} />}
              {data.education.length > 0 && <EducationPreview accentColor={accentColor} education={data.education} template={selectedTemplate} />}
            </aside>
            <main>
              {data.personalInfo.summary && <SummaryPreview accentColor={accentColor} summary={data.personalInfo.summary} template={selectedTemplate} />}
              {data.experience.length > 0 && <ExperiencePreview accentColor={accentColor} experience={data.experience} template={selectedTemplate} />}
              {data.projects.length > 0 && <ProjectsPreview accentColor={accentColor} projects={data.projects} template={selectedTemplate} />}
            </main>
          </div>
        ) : (
          <>
            {data.personalInfo.summary && <SummaryPreview accentColor={accentColor} summary={data.personalInfo.summary} template={selectedTemplate} />}
            {data.experience.length > 0 && <ExperiencePreview accentColor={accentColor} experience={data.experience} template={selectedTemplate} />}
            {data.education.length > 0 && <EducationPreview accentColor={accentColor} education={data.education} template={selectedTemplate} />}
            {data.projects.length > 0 && <ProjectsPreview accentColor={accentColor} projects={data.projects} template={selectedTemplate} />}
            {data.skills.length > 0 && <SkillsPreview accentColor={accentColor} skills={data.skills} template={selectedTemplate} />}
          </>
        )}
        </div>
      </div>
    </div>
  );
}

function PreviewHeader({
  accentColor,
  contactItems,
  initials,
  name,
  profileImage,
  role,
  template,
}: {
  accentColor: string;
  contactItems: Array<{ icon: typeof Mail; text: string }>;
  initials: string;
  name: string;
  profileImage: string;
  role: string;
  template: ResumeTemplateId;
}) {
  if (template === "executive") {
    return (
      <header className="rounded-[1.8rem] bg-[#10131a] p-8 text-white">
        <div className="mb-7 flex items-center justify-between gap-6">
          <div className="h-px flex-1 bg-white/20" />
          <p className="text-[10px] font-black uppercase tracking-[0.42em]" style={{ color: "#d7b56d" }}>Executive Profile</p>
        </div>
        <div className="flex items-start gap-6">
          <HeaderAvatar accentColor="#d7b56d" initials={initials} profileImage={profileImage} variant="executive" />
          <div className="min-w-0">
            <h2 className="max-w-[460px] break-words text-[40px] font-black uppercase leading-[1.04]" style={{ letterSpacing: 0 }}>{name}</h2>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.24em]" style={{ color: "#d7b56d" }}>{role}</p>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-300">
          {contactItems.map((item) => <Contact key={item.text} icon={item.icon} text={item.text} color="#d7b56d" />)}
        </div>
      </header>
    );
  }

  if (template === "creative") {
    return (
      <header className="relative overflow-hidden rounded-[2rem] p-8 text-white" style={{ background: `linear-gradient(135deg, ${accentColor}, #17111f 58%, #06b6d4)` }}>
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative flex items-start gap-6">
          <HeaderAvatar accentColor="white" initials={initials} profileImage={profileImage} variant="creative" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.38em] text-white/70">Portfolio Resume</p>
            <h2 className="mt-3 max-w-[520px] break-words text-[42px] font-black uppercase leading-[1.02]" style={{ letterSpacing: 0 }}>{name}</h2>
            <p className="mt-3 text-sm font-black uppercase tracking-[0.2em] text-white/80">{role}</p>
          </div>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-black uppercase tracking-widest text-white/80">
          {contactItems.map((item) => <Contact key={item.text} icon={item.icon} text={item.text} color="white" />)}
        </div>
      </header>
    );
  }

  if (template === "classic") {
    return (
      <header className="border-b-2 border-zinc-950 pb-7 text-center">
        {profileImage && (
          <div className="mb-5 flex justify-center">
            <HeaderAvatar accentColor="#111827" initials={initials} profileImage={profileImage} variant="classic" />
          </div>
        )}
        <h2 className="break-words text-[34px] font-black uppercase leading-tight" style={{ letterSpacing: 0 }}>{name}</h2>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-600">{role}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
          {contactItems.map((item) => <Contact key={item.text} icon={item.icon} text={item.text} color="#111827" />)}
        </div>
      </header>
    );
  }

  return (
    <header className="rounded-[1.8rem] border border-zinc-100 bg-zinc-50 p-8">
      <div className="flex items-start gap-6">
        <HeaderAvatar accentColor={accentColor} initials={initials} profileImage={profileImage} variant="modern" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-zinc-400">Professional Resume</p>
          <h2 className="mt-3 max-w-[520px] break-words text-[40px] font-black uppercase leading-[1.03]" style={{ color: accentColor, letterSpacing: 0 }}>{name}</h2>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">{role}</p>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-black uppercase tracking-widest text-zinc-500">
        {contactItems.map((item) => <Contact key={item.text} icon={item.icon} text={item.text} color={accentColor} />)}
      </div>
    </header>
  );
}

function HeaderAvatar({ accentColor, initials, profileImage, variant }: { accentColor: string; initials: string; profileImage: string; variant: "modern" | "executive" | "creative" | "classic" }) {
  const isClassic = variant === "classic";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-cover bg-center font-black text-white shadow-lg",
        isClassic ? "h-20 w-20 rounded-full border-2 border-zinc-900 text-2xl" : "h-20 w-20 rounded-[1.5rem] text-3xl",
        variant === "creative" && "border border-white/25 bg-white/15",
        variant === "executive" && "border border-[#d7b56d]/40",
      )}
      style={profileImage ? { backgroundImage: `url(${profileImage})` } : { backgroundColor: accentColor }}
    >
      {!profileImage && (initials || "CV")}
    </div>
  );
}

function SummaryPreview({ accentColor, summary, template }: { accentColor: string; summary: string; template: ResumeTemplateId }) {
  return (
    <PreviewSection title="Professional Profile" color={accentColor} template={template}>
      <p className={cn(
        "text-[15px] font-medium leading-relaxed text-zinc-700",
        template === "creative" && "rounded-3xl bg-white p-5 shadow-sm",
        template === "executive" && "text-[14px]",
      )}>
        {summary}
      </p>
    </PreviewSection>
  );
}

function ExperiencePreview({ accentColor, experience, template }: { accentColor: string; experience: Experience[]; template: ResumeTemplateId }) {
  return (
    <PreviewSection title="Experience" color={accentColor} template={template}>
      <div className="space-y-7">
        {experience.map((item) => (
          <div key={item.id} className={cn(
            template === "creative" && "rounded-3xl bg-white p-5 shadow-sm",
            template !== "classic" && "border-l-2 pl-5",
            template === "classic" && "border-b border-zinc-200 pb-5",
          )} style={template !== "classic" ? { borderColor: template === "executive" ? "#d7b56d" : accentColor } : undefined}>
            <div className="flex items-baseline justify-between gap-5">
              <h3 className="text-lg font-black uppercase" style={{ letterSpacing: 0 }}>{item.company || "Company"}</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.period}</span>
            </div>
            <p className="mt-1 text-xs font-black uppercase tracking-widest" style={{ color: template === "executive" ? "#9a762d" : accentColor }}>{item.role || "Role"}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm font-medium leading-relaxed text-zinc-700">
              {formatBulletLines(item.description).map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </PreviewSection>
  );
}

function EducationPreview({ accentColor, education, template }: { accentColor: string; education: Education[]; template: ResumeTemplateId }) {
  return (
    <PreviewSection title="Education" color={accentColor} template={template}>
      <div className="space-y-4">
        {education.map((item) => (
          <div key={item.id} className={cn(template === "creative" && "rounded-2xl bg-white p-4 shadow-sm")}>
            <div className="flex items-baseline justify-between gap-5">
              <div>
                <h3 className="font-black">{item.school || "School"}</h3>
                <p className="text-sm font-medium text-zinc-600">{item.degree || "Degree"}</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.period}</span>
            </div>
          </div>
        ))}
      </div>
    </PreviewSection>
  );
}

function ProjectsPreview({ accentColor, projects, template }: { accentColor: string; projects: Project[]; template: ResumeTemplateId }) {
  return (
    <PreviewSection title="Projects" color={accentColor} template={template}>
      <div className="space-y-6">
        {projects.map((item) => (
          <div key={item.id} className={cn(template === "creative" && "rounded-3xl bg-white p-5 shadow-sm")}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-black uppercase" style={{ letterSpacing: 0 }}>{item.name || "Project"}</h3>
              {item.link && <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.link.replace(/^https?:\/\//, "")}</span>}
            </div>
            {item.role && <p className="mt-1 text-xs font-black uppercase tracking-widest" style={{ color: template === "executive" ? "#9a762d" : accentColor }}>{item.role}</p>}
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-medium leading-relaxed text-zinc-700">
              {formatBulletLines(item.description).map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </PreviewSection>
  );
}

function SkillsPreview({ accentColor, skills, template }: { accentColor: string; skills: string[]; template: ResumeTemplateId }) {
  return (
    <PreviewSection title="Core Competencies" color={accentColor} template={template}>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className={cn(
              "px-3 py-1.5 text-[11px] font-black uppercase",
              template === "classic" && "rounded border border-zinc-300 text-zinc-800",
              template === "executive" && "rounded-full bg-[#10131a] text-white",
              template === "creative" && "rounded-full text-white",
              template === "modern" && "rounded bg-zinc-100 text-zinc-800",
            )}
            style={template === "creative" ? { backgroundColor: accentColor } : undefined}
          >
            {skill}
          </span>
        ))}
      </div>
    </PreviewSection>
  );
}

function Contact({ icon: Icon, text, color }: { icon: typeof Mail; text: string; color: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon size={12} style={{ color }} />
      {text}
    </span>
  );
}

function PreviewSection({ title, color, template, children }: { title: string; color: string; template: ResumeTemplateId; children: ReactNode }) {
  return (
    <section className={cn("mt-9", template === "executive" && "mt-7")}>
      <h3
        className={cn(
          "mb-4 text-[11px] font-black uppercase tracking-[0.34em]",
          template === "classic" && "border-b border-zinc-300 pb-2 tracking-[0.22em]",
          template === "creative" && "inline-flex rounded-full bg-white px-4 py-2 shadow-sm",
        )}
        style={{ color: template === "executive" ? "#9a762d" : color }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
