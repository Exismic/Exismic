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
  Sparkles,
  Target,
  Trash2,
  Trophy,
  User,
  Wand2,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
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

const STORAGE_KEY = "lumora_resume_data_v2";

const SECTION_NAV: Array<{ id: ActiveSection; label: string; icon: typeof User }> = [
  { id: "personal", label: "Profile", icon: User },
  { id: "experience", label: "Work", icon: Briefcase },
  { id: "education", label: "School", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: Trophy },
];

const TOP_TABS: Array<{ id: ActiveTab; label: string; icon: typeof User }> = [
  { id: "content", label: "Content", icon: User },
  { id: "design", label: "Design", icon: Layout },
  { id: "ai", label: "Lumora AI", icon: Sparkles },
];

const inputClass = "w-full min-h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm font-bold text-white placeholder:text-zinc-700 outline-none transition-all focus:border-violet-300/50 focus:ring-4 focus:ring-violet-500/10";
const textareaClass = "w-full min-h-28 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold leading-relaxed text-white placeholder:text-zinc-700 outline-none transition-all focus:border-violet-300/50 focus:ring-4 focus:ring-violet-500/10 resize-none";

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
  const [data, setData] = useState<ResumeData>(() => createEmptyResume());
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [activeSection, setActiveSection] = useState<ActiveSection>("personal");
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>("modern");
  const [accentColor, setAccentColor] = useState("#7c3aed");
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    import("./ResumePDF").then((mod) => setResumePDF(() => mod.default));
    import("@react-pdf/renderer").then((mod) => setPDFRenderer(mod));
  }, [isClient]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
      localStorage.removeItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, selectedTemplate, accentColor }));
    setNotice("Resume saved on this device.");
    window.setTimeout(() => setNotice(null), 2500);
  };

  const fillSample = () => {
    setData({
      personalInfo: {
        fullName: "Rayan Studio",
        email: "rayan@example.com",
        phone: "+1 555 0149",
        location: "Remote",
        website: "portfolio.example.com",
        profileImage: "",
        summary: "Product-focused frontend developer with experience building polished SaaS interfaces, AI tool workflows, and responsive design systems. Known for shipping fast, improving usability, and translating messy product ideas into clean user experiences.",
      },
      experience: [
        {
          id: createId("exp"),
          company: "Lumora Labs",
          role: "Frontend Developer",
          period: "2024 - Present",
          description: "- Built responsive AI tool pages used across image, productivity, and video workflows\n- Improved conversion-focused UI patterns with premium dark-mode components\n- Partnered with backend engineers to connect AI generation APIs and user history",
        },
      ],
      education: [
        {
          id: createId("edu"),
          school: "Independent Product Studio",
          degree: "Full Stack Product Development",
          period: "2023 - 2024",
        },
      ],
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "UI Design", "API Integration", "Supabase", "AI Workflows"],
      projects: [
        {
          id: createId("project"),
          name: "Lumora Tool Suite",
          role: "Builder",
          description: "- Designed and implemented premium AI tools with responsive layouts\n- Connected generation flows to API routes, local state, and downloadable results",
          link: "lumora.ai",
        },
      ],
    });
    setSelectedTemplate("modern");
    setAccentColor("#06b6d4");
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
    if (!isPro) return;
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

      if (!response.ok || !result.success || !result.resume) {
        throw new Error(result.error || "Lumora AI could not build the resume.");
      }

      setData(normalizeResumeData(result.resume));
      setActiveTab("content");
      setActiveSection("personal");
      setNotice("Lumora AI built your resume draft.");
      window.setTimeout(() => setNotice(null), 2500);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Lumora AI could not build the resume.");
    } finally {
      setIsGenerating(null);
    }
  };

  const runAtsMatch = async () => {
    if (!isPro) return;
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

      if (!response.ok || !result.success || !result.insight) {
        throw new Error(result.error || "ATS analysis failed.");
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
      link.download = `${(data.personalInfo.fullName || "Lumora_Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setAiError("PDF export failed. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-24">
      <div className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_18px_60px_rgba(124,58,237,0.25)]">
              <FileText size={21} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-200/70">Resume Studio</p>
              <h1 className="text-2xl font-black text-white">AI Resume Builder</h1>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            <ScorePill label="Ready" value={`${completionScore}%`} />
            <button onClick={fillSample} className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black uppercase text-zinc-300 transition hover:text-white">
              Sample
            </button>
            <button onClick={saveDraft} className="min-h-11 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 text-xs font-black uppercase text-emerald-100 transition hover:bg-emerald-300/15">
              Save
            </button>
          </div>
        </div>
      </div>

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
                    activeTab === tab.id ? "bg-white text-black" : "text-zinc-500 hover:bg-white/[0.05] hover:text-white",
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
                          activeSection === section.id ? "bg-violet-500/15 text-violet-100" : "text-zinc-600 hover:text-white",
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
                              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.6rem] border border-white/15 bg-gradient-to-br from-cyan-500 to-violet-600 bg-cover bg-center text-2xl font-black text-white shadow-[0_18px_50px_rgba(6,182,212,0.18)]"
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
                        {data.experience.length === 0 && <EmptyState text="Add a role or let Lumora AI build one from your brief." />}
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
                        <button onClick={() => generateWithAI("skills", targetRole || "professional", data.skills.join(", "))} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-400/10 text-xs font-black uppercase tracking-widest text-violet-100 transition hover:bg-violet-400/15">
                          {isGenerating === "skills" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          Generate Skill Set
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
                            "text-left rounded-3xl border p-3 transition-all",
                            selectedTemplate === template.id ? "border-violet-300/50 bg-violet-400/10" : "border-white/10 bg-white/[0.035] hover:border-white/20",
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
                  <Panel title="Lumora AI Resume" icon={Sparkles}>
                    <ProNotice isPro={isPro} />
                    <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Target role, e.g. Frontend Developer" className={inputClass} />
                    <textarea value={aiBrief} onChange={(event) => setAiBrief(event.target.value)} disabled={!isPro} placeholder="Briefly describe your experience, education, projects, strongest skills, achievements, and target industry." className={cn(textareaClass, "min-h-36", !isPro && "opacity-50")} />
                    <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} disabled={!isPro} placeholder="Paste a job description for ATS matching and targeted resume generation." className={cn(textareaClass, "min-h-36", !isPro && "opacity-50")} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button onClick={generateFullResume} disabled={!isPro || !aiBrief.trim() || isGenerating === "full-resume"} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-300 px-4 text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                        {isGenerating === "full-resume" ? <Loader2 size={17} className="animate-spin" /> : <Wand2 size={17} />}
                        Build Resume
                      </button>
                      <button onClick={runAtsMatch} disabled={!isPro || !jobDescription.trim() || isGenerating === "ats"} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 text-xs font-black uppercase tracking-widest text-cyan-100 transition hover:bg-cyan-300/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                        {isGenerating === "ats" ? <Loader2 size={17} className="animate-spin" /> : <Target size={17} />}
                        ATS Match
                      </button>
                    </div>
                  </Panel>

                  {atsInsight && (
                    <Panel title="ATS Insights" icon={Target}>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ScorePill label="Complete" value={`${completionScore}%`} />
              <ScorePill label="Sections" value={`${data.experience.length + data.education.length + data.projects.length}`} />
              <ScorePill label="Skills" value={`${data.skills.length}`} />
              <ScorePill label="Template" value={selectedTemplate} />
            </div>
            {missingFields.length > 0 && (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm font-bold text-amber-100">
                Missing: {missingFields.join(", ")}
              </div>
            )}
            <ResumePreview data={data} accentColor={accentColor} selectedTemplate={selectedTemplate} />
          </div>
        </section>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, action, children }: { title: string; icon: typeof User; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-violet-100">
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
    <button onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10">
      {children}
    </button>
  );
}

function AIButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg transition hover:bg-violet-500" aria-label="Generate with AI">
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
    </button>
  );
}

function EditorCard({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <div className="relative space-y-3 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
      <button onClick={onRemove} className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/20 text-rose-200 transition hover:bg-rose-500/30" aria-label="Remove">
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
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition hover:scale-105 active:scale-95"
        aria-label="Add skill"
      >
        <Plus size={17} />
      </button>
    </div>
  );
}

function ProNotice({ isPro }: { isPro: boolean }) {
  if (isPro) {
    return (
      <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold leading-relaxed text-cyan-100">
        Lumora AI can build a full resume draft and score it against a job description.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black/25 text-amber-100">
          <Lock size={17} />
        </div>
        <div>
          <p className="text-sm font-black text-white">Lumora AI is Pro only</p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-amber-100/75">Upgrade to generate full resumes and ATS analysis from a short brief.</p>
          <Link href="/pro" className="mt-3 inline-flex min-h-10 items-center rounded-2xl bg-amber-300 px-4 text-xs font-black uppercase tracking-widest text-black">
            Upgrade
          </Link>
        </div>
      </div>
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
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function ResumePreview({ data, accentColor, selectedTemplate }: { data: ResumeData; accentColor: string; selectedTemplate: ResumeTemplateId }) {
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
    "mx-auto min-h-[1020px] w-[760px] text-black shadow-2xl",
    selectedTemplate === "modern" && "bg-white p-12",
    selectedTemplate === "executive" && "bg-[#fbfaf7] p-10",
    selectedTemplate === "creative" && "bg-[#fffafb] p-10",
    selectedTemplate === "classic" && "bg-white p-12 font-serif",
  );

  return (
    <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-zinc-950/80 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
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
