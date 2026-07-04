export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  period: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
  link: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    profileImage: string;
    summary: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

export interface AtsInsight {
  score: number;
  verdict: string;
  strengths: string[];
  gaps: string[];
  keywords: string[];
  fixes: string[];
}

export type ResumeTemplateId = "modern" | "executive" | "creative" | "classic";

export const RESUME_TEMPLATES: Array<{
  id: ResumeTemplateId;
  name: string;
  description: string;
  previewClass: string;
}> = [
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Clean SaaS-style resume with strong whitespace.",
    previewClass: "from-zinc-900 via-zinc-800 to-zinc-950",
  },
  {
    id: "executive",
    name: "Executive Pro",
    description: "Polished structure for leadership and business roles.",
    previewClass: "from-slate-950 via-blue-950 to-black",
  },
  {
    id: "creative",
    name: "Creative Bold",
    description: "High-contrast layout for portfolio-driven profiles.",
    previewClass: "from-violet-950 via-fuchsia-950 to-black",
  },
  {
    id: "classic",
    name: "Classic ATS",
    description: "Conservative layout optimized for screening systems.",
    previewClass: "from-stone-900 via-zinc-800 to-neutral-950",
  },
];

export const RESUME_ACCENT_COLORS = [
  "#7c3aed",
  "#06b6d4",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#334155",
];

export function createEmptyResume(): ResumeData {
  return {
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      profileImage: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeExperience(value: unknown, index: number): Experience {
  const item = asRecord(value);
  return {
    id: text(item.id, `exp-${index}-${Date.now()}`),
    company: text(item.company),
    role: text(item.role),
    period: text(item.period),
    description: text(item.description),
  };
}

function normalizeEducation(value: unknown, index: number): Education {
  const item = asRecord(value);
  return {
    id: text(item.id, `edu-${index}-${Date.now()}`),
    school: text(item.school),
    degree: text(item.degree),
    period: text(item.period),
  };
}

function normalizeProject(value: unknown, index: number): Project {
  const item = asRecord(value);
  return {
    id: text(item.id, `project-${index}-${Date.now()}`),
    name: text(item.name),
    role: text(item.role),
    description: text(item.description),
    link: text(item.link),
  };
}

export function normalizeResumeData(value: unknown): ResumeData {
  const root = asRecord(value);
  const personal = asRecord(root.personalInfo);
  const experience = Array.isArray(root.experience) ? root.experience : [];
  const education = Array.isArray(root.education) ? root.education : [];
  const skills = Array.isArray(root.skills) ? root.skills : [];
  const projects = Array.isArray(root.projects) ? root.projects : [];

  return {
    personalInfo: {
      fullName: text(personal.fullName),
      email: text(personal.email),
      phone: text(personal.phone),
      location: text(personal.location),
      website: text(personal.website),
      profileImage: text(personal.profileImage),
      summary: text(personal.summary),
    },
    experience: experience.map(normalizeExperience).slice(0, 8),
    education: education.map(normalizeEducation).slice(0, 6),
    skills: skills.map((skill) => text(skill)).filter(Boolean).slice(0, 32),
    projects: projects.map(normalizeProject).slice(0, 8),
  };
}

export function resumeToText(data: ResumeData) {
  return [
    data.personalInfo.fullName,
    data.personalInfo.summary,
    data.experience.map((item) => `${item.role} ${item.company} ${item.description}`).join(" "),
    data.education.map((item) => `${item.degree} ${item.school}`).join(" "),
    data.projects.map((item) => `${item.name} ${item.role} ${item.description}`).join(" "),
    data.skills.join(" "),
  ].join(" ");
}
