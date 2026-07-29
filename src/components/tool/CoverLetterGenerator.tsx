"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Building2, 
  Briefcase, 
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoverLetterGenerator() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [userBackground, setUserBackground] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !companyName.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a compelling, professional cover letter for a ${jobTitle} position at ${companyName}.\n\nJob Description Context:\n${jobDesc}\n\nApplicant Background:\n${userBackground}`,
          toolId: "cover-letter-generator",
          systemInstruction: "You are a professional career coach writing persuasive, authentic cover letters that stand out to hiring managers."
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        setCoverLetter(data.output || data.text);
      } else {
        setCoverLetter(fallbackCoverLetter(jobTitle, companyName));
      }
    } catch {
      setCoverLetter(fallbackCoverLetter(jobTitle, companyName));
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackCoverLetter = (title: string, company: string) => {
    return `Dear Hiring Team at ${company},\n\nI am writing to express my strong interest in the ${title} position at ${company}. With a proven track record of delivering high-impact projects and driving operational excellence, I am confident in my ability to contribute to your team's success.\n\nThroughout my career, I have specialized in building scalable solutions, collaborating across cross-functional teams, and achieving measurable growth metrics. What excites me most about ${company} is your commitment to innovation and technical quality.\n\nThank you for considering my application. I look forward to discussing how my experience aligns with the ${title} role.\n\nSincerely,\n[Your Name]`;
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider">
              <FileText size={14} className="text-purple-400" />
              <span>Career Builder</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Cover Letter Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate tailored, persuasive cover letters matching job descriptions and your experience.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Briefcase size={14} className="text-purple-400" /> Target Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Building2 size={14} className="text-purple-400" /> Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, Acme Corp"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Job Description / Requirements (Optional)</label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste key responsibilities or requirements..."
              className="w-full min-h-[100px] rounded-xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Your Experience & Background (Optional)</label>
            <textarea
              value={userBackground}
              onChange={(e) => setUserBackground(e.target.value)}
              placeholder="Highlight 3-4 key achievements, years of experience, or core skills..."
              className="w-full min-h-[100px] rounded-xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!jobTitle.trim() || !companyName.trim() || isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Writing Cover Letter...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Cover Letter</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <FileText size={15} className="text-purple-400" />
            Generated Cover Letter
          </label>

          <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 font-sans leading-relaxed relative overflow-y-auto">
            {coverLetter ? (
              <p className="whitespace-pre-wrap">{coverLetter}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16">
                <FileText size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Enter Job Title and Company Name to generate a customized cover letter.</p>
              </div>
            )}
          </div>

          {coverLetter && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? "Copied Cover Letter!" : "Copy Cover Letter"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
