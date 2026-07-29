"use client";

import React, { useState } from "react";
import { 
  FileSignature, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Briefcase, 
  Target, 
  Plus,
  Trash2
} from "lucide-react";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";

export default function ResumeBulletGenerator() {
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [taskDetails, setTaskDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [bullets, setBullets] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!jobTitle.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 5 high-impact, action-oriented, metric-driven STAR-framework resume bullet points for a ${jobTitle} position. Key Skills: ${skills}. Task Context: ${taskDetails}. Ensure strong action verbs and metrics (% increase, $ saved, team size).`,
          toolId: "resume-bullet-generator",
          systemInstruction: "You are a senior recruiter crafting top 1% resume bullet points with strong action verbs and quantified achievements."
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        const raw = (data.output || data.text).split("\n").filter((l: string) => l.trim().length > 5);
        setBullets(raw.map((b: string) => b.replace(/^[•\-\d.\s]+/, "").trim()));
      } else {
        setBullets(fallbackBullets(jobTitle));
      }
    } catch {
      setBullets(fallbackBullets(jobTitle));
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackBullets = (title: string): string[] => [
    `Engineered scalable systems for ${title} role, improving processing efficiency by 34% and reducing downtime.`,
    `Spearheaded cross-functional initiative across engineering and design teams, delivering core deliverables 2 weeks ahead of schedule.`,
    `Optimized key workflow metrics by 45% through implementation of automated CI/CD and data pipeline strategies.`,
    `Mentored 5 junior team members and authored comprehensive technical documentation used by 50+ staff across the organization.`,
    `Analyzed customer feedback loops and reduced churn by 18% within the first 6 months.`
  ];

  const copyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
              <FileSignature size={14} className="text-indigo-400" />
              <span>Career & ATS Optimization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Resume Bullet Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Create high-impact STAR framework bullet points with action verbs and quantifiable metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Briefcase size={14} className="text-indigo-400" /> Target Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer, Product Manager"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Target size={14} className="text-indigo-400" /> Key Skills / Tech Stack
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Next.js, PostgreSQL, Leadership"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Raw Task / Project Details (Optional)
            </label>
            <textarea
              value={taskDetails}
              onChange={(e) => setTaskDetails(e.target.value)}
              placeholder="Describe what you worked on or achieved..."
              className="w-full min-h-[120px] rounded-xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!jobTitle.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Crafting Bullets...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate STAR Bullets</span>
              </>
            )}
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <FileSignature size={15} className="text-indigo-400" />
            Generated Resume Bullets
          </label>

          <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
            {bullets.length > 0 ? (
              bullets.map((b, i) => (
                <div
                  key={i}
                  className="group relative p-4 rounded-2xl border border-white/10 bg-black/40 hover:border-indigo-500/40 transition-all space-y-2"
                >
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">• {b}</p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => copyBullet(b, i)}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedIdx === i ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedIdx === i ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                <FileSignature size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Fill in your job title and click "Generate STAR Bullets" to create ATS resume bullet points.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Workflow Tool Recommendations */}
      <ToolSuggestions currentToolId="resume-bullet-generator" categoryId="productivity" />
    </div>
  );
}
