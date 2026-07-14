"use client";

import React, { useState, useCallback } from "react";
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
  FileQuestion,
  Wand2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { PdfSidebar } from "./pdf/PdfSidebar";
import { PdfActionButton } from "./pdf/PdfActionButton";
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

const RUN_STEPS = [
  { title: "Upload CV", desc: "Select or drop your current PDF resume to begin the extraction process." },
  { title: "Paste Target Job", desc: "Copy and paste the exact description of the role you are targeting." },
  { title: "Run ATS Scan", desc: "Llama 3 reads formatting, experience metrics, and keyword matches." },
  { title: "Review Report", desc: "Optimize your resume using custom recommendations to bypass filters." }
];

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "suggestions">("overview");
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false);

  const handleAutoGenerateJobDesc = async () => {
    if (!file) return;
    setIsGeneratingJobDesc(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("action", "generate-job-description");

      const response = await axios.post("/api/tools/productivity/resume-analyzer", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success && response.data.jobDescription) {
        setJobDescription(response.data.jobDescription);
      } else {
        throw new Error("Could not automatically generate job description details.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to auto-generate description.");
    } finally {
      setIsGeneratingJobDesc(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      "application/pdf": [".pdf"]
    },
    multiple: false,
  });

  const simulateProgress = () => {
    setProgress(5);
    setStatus("Extracting text from PDF resume...");
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        if (prev > 60) {
          setStatus("Scrutinizing skill keywords & formatting...");
          return prev + 2;
        }
        if (prev > 30) {
          setStatus("Cross-matching experience against job description...");
          return prev + 5;
        }
        return prev + 8;
      });
    }, 400);

    return interval;
  };

  const handleScan = async () => {
    if (!file || jobDescription.trim().length < 20) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);

    const progressInterval = simulateProgress();

    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("jobDescription", jobDescription);

      const response = await axios.post("/api/tools/productivity/resume-analyzer", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatus("Analysis complete!");

      if (response.data.success && response.data.result) {
        setResult(response.data.result);
      } else {
        throw new Error("Unable to parse recommendations. Please try again.");
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      setError(err.response?.data?.error || err.message || "Something went wrong during analysis.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Color picker for score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBorderClass = (score: number) => {
    if (score >= 80) return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
    if (score >= 50) return "border-amber-500/20 bg-amber-500/5 text-amber-400";
    return "border-red-500/20 bg-red-500/5 text-red-400";
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        {/* Main Workspace */}
        <div className="xl:col-span-8 space-y-10">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                {...(getRootProps() as unknown as import("framer-motion").HTMLMotionProps<"div">)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={cn(
                  "relative h-[480px] rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-all duration-700 group overflow-hidden shadow-3xl",
                  isDragActive ? "border-accent-blue/50 bg-accent-blue/[0.02] scale-[0.99] shadow-[0_0_50px_rgba(59,130,246,0.15)]" : "hover:bg-white/[0.02] hover:border-white/10 hover:shadow-[0_0_50px_rgba(255,255,255,0.01)]"
                )}
              >
                <input {...getInputProps()} />
                
                {/* Radial color backglow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.04)_0%,transparent_60%)] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  {/* Glowing Floating Icon Container */}
                  <div className="relative w-28 h-28 rounded-[2.2rem] bg-zinc-950/80 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:-rotate-3 group-hover:border-accent-blue/30 transition-all duration-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <FileText className={cn("w-10 h-10 transition-all duration-500", isDragActive ? "text-accent-blue" : "text-zinc-500 group-hover:text-white group-hover:scale-110")} />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic transition-all duration-500 group-hover:tracking-normal">
                      Resume <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 font-extrabold">Scanner</span>
                    </h3>
                    <p className="text-zinc-500 font-medium text-xs uppercase tracking-widest text-[9px]">Select or drop your PDF Resume</p>
                  </div>
                  
                  {/* Interactive Button */}
                  <div className="px-10 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500">
                    Select File
                  </div>
                </div>
              </motion.div>
            ) : !result ? (
              <motion.div 
                key="job-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-10 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/[0.01] blur-[100px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                      <div className="p-2 bg-accent-blue/10 rounded-xl"><Briefcase className="w-5 h-5 text-accent-blue" /></div>
                      Job Alignment Target
                    </h3>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Paste the target job description to match keywords</p>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setJobDescription(""); setError(null); }}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white hover:rotate-90 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8 relative z-10">
                  {/* File preview */}
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center gap-4 min-w-0">
                      <FileCheck2 className="w-8 h-8 text-accent-blue shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                          PDF DOCUMENT • {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFile(null)} 
                      className="text-zinc-500 hover:text-red-400 text-[9px] font-black uppercase tracking-widest transition-colors duration-200 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Job description input */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Target Job Description</label>
                      {file && (
                        <button
                          type="button"
                          onClick={handleAutoGenerateJobDesc}
                          disabled={isGeneratingJobDesc || isProcessing}
                          className="text-[9px] font-black uppercase tracking-widest text-accent-blue bg-accent-blue/10 border border-accent-blue/20 hover:bg-accent-blue/25 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          <Sparkles size={12} className={cn(isGeneratingJobDesc && "animate-spin")} />
                          {isGeneratingJobDesc ? "Generating..." : "Auto-generate from Resume"}
                        </button>
                      )}
                    </div>
                    
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the key responsibilities, role expectations, and skills requirements from the job post..."
                      className="w-full min-h-[240px] bg-zinc-950/90 border border-white/5 focus:border-accent-blue/30 rounded-[2rem] p-6 text-zinc-300 font-medium leading-relaxed outline-none focus:ring-4 focus:ring-accent-blue/5 transition-all duration-300 resize-none shadow-inner custom-scrollbar"
                    />
                    
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-2">
                      {jobDescription.trim().length >= 20 ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Minimum length satisfied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 text-[8px] font-black uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse" />
                          Minimum 20 characters required
                        </span>
                      )}
                      <span className="text-zinc-600">{jobDescription.length} characters</span>
                    </div>
                  </div>
                </div>

                {/* Inline Scan Action Button */}
                <div className="pt-4 flex justify-end relative z-10">
                  <button
                    onClick={handleScan}
                    disabled={!file || jobDescription.trim().length < 20 || isProcessing}
                    className={cn(
                      "w-full md:w-auto flex min-h-14 items-center justify-center gap-3 rounded-2xl px-10 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition hover:brightness-110 active:scale-98",
                      "bg-gradient-to-r from-blue-600 to-indigo-600",
                      "disabled:opacity-30 disabled:cursor-not-allowed"
                    )}
                  >
                    <ScanText size={18} />
                    {isProcessing ? "Scanning..." : "Run ATS Audit"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Result Dashboard Header */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/[0.02] blur-[100px] rounded-full pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                      {/* Gauge representation */}
                      <div className="relative flex items-center justify-center shrink-0 w-28 h-28 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                          <motion.circle 
                            cx="56" 
                            cy="56" 
                            r="48" 
                            stroke="currentColor" 
                            strokeWidth="8" 
                            fill="transparent" 
                            className={getScoreColorClass(result.atsScore)}
                            strokeDasharray={301.59}
                            initial={{ strokeDashoffset: 301.59 }}
                            animate={{ strokeDashoffset: 301.59 - (301.59 * result.atsScore) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className={cn("absolute text-3xl font-black italic tracking-tighter", getScoreColorClass(result.atsScore))}>
                          {result.atsScore}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                          Overall ATS Score
                        </span>
                        <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">ATS Audit Complete</h4>
                        <p className="text-zinc-400 text-xs font-semibold max-w-md leading-relaxed">{result.verdict}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Link 
                        href="/tools/resume-builder"
                        className="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-white px-6 text-[10px] font-black uppercase tracking-widest text-black shadow-2xl transition hover:scale-105 active:scale-98"
                      >
                        <Wand2 size={16} />
                        Fix in Builder
                      </Link>
                    </div>
                  </div>

                  {/* Tabs selector */}
                  <div className="border-b border-white/5 flex gap-8 pb-px overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {[
                      { id: "overview", name: "Report Overview" },
                      { id: "keywords", name: "Keywords Matrix" },
                      { id: "suggestions", name: "Actionable Fixes" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "pb-4 font-black uppercase tracking-widest text-[9px] relative transition-colors cursor-pointer",
                          activeTab === tab.id ? "text-accent-blue" : "text-zinc-500 hover:text-white"
                        )}
                      >
                        {tab.name}
                        {activeTab === tab.id && (
                          <motion.div 
                            layoutId="activeTab" 
                            className="absolute bottom-0 inset-x-0 h-0.5 bg-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.4)]" 
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div className="min-h-[280px]">
                    <AnimatePresence mode="wait">
                      {activeTab === "overview" && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                          {[
                            { title: "Formatting & Layout", data: result.analysis.format, label: "Readability", icon: <FileText size={18} className="text-blue-400" /> },
                            { title: "Content & Impact", data: result.analysis.experience, label: "Measurables", icon: <TrendingUp size={18} className="text-amber-400" /> },
                            { title: "Skill Alignment", data: result.analysis.skills, label: "Keyword Match", icon: <Sparkles size={18} className="text-emerald-400" /> }
                          ].map((section, idx) => (
                            <motion.div 
                              key={idx} 
                              whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.12)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.7)" }}
                              className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 flex flex-col justify-between min-h-[220px] transition-all duration-300 relative group overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                              <div className="space-y-5 relative z-10">
                                <div className="flex justify-between items-start gap-4">
                                  <span className={cn("px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border", getScoreBorderClass(section.data.score))}>
                                    {section.data.score}% {section.label}
                                  </span>
                                  <div className="p-2 bg-white/5 rounded-xl">
                                    {section.icon}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h5 className="text-base font-black text-white uppercase tracking-wider italic pr-4 px-4 -mx-4">{section.title}</h5>
                                  <p className="text-zinc-400 text-xs font-semibold leading-relaxed">{section.data.critique}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}

                      {activeTab === "keywords" && (
                        <motion.div
                          key="keywords"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                          {/* Matched */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Matched Keywords ({result.keywords.matched.length})
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {result.keywords.matched.length > 0 ? (
                                result.keywords.matched.map((kw, i) => (
                                  <motion.span 
                                    key={i} 
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-bold text-xs cursor-default hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200"
                                  >
                                    {kw}
                                  </motion.span>
                                ))
                              ) : (
                                <p className="text-xs text-zinc-600 font-medium">No direct matched keywords detected.</p>
                              )}
                            </div>
                          </div>

                          {/* Missing */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Recommended Missing ({result.keywords.missing.length})
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {result.keywords.missing.length > 0 ? (
                                result.keywords.missing.map((kw, i) => (
                                  <motion.span 
                                    key={i} 
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-bold text-xs cursor-default hover:bg-amber-500/20 hover:border-amber-500/40 transition-all duration-200"
                                  >
                                    {kw}
                                  </motion.span>
                                ))
                              ) : (
                                <p className="text-xs text-emerald-400 font-medium">Perfect! You matched all critical job descriptions.</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "suggestions" && (
                        <motion.div
                          key="suggestions"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          {result.suggestions.map((sug, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ x: 6, borderColor: "rgba(59, 130, 246, 0.15)", backgroundColor: "rgba(255,255,255,0.01)" }}
                              className="p-5 rounded-2xl bg-zinc-900/20 border border-white/5 flex items-start gap-4 transition-all duration-300"
                            >
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 text-xs font-bold mt-0.5 shadow-sm">
                                <CheckCircle2 size={12} />
                              </div>
                              <p className="text-zinc-300 text-sm font-semibold leading-relaxed">{sug}</p>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={() => { setFile(null); setResult(null); setJobDescription(""); setError(null); }}
                    className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors pt-4 cursor-pointer"
                  >
                    Upload Another Resume
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Status / Audit steps */}
        <div className="xl:col-span-4 space-y-8">
          {!result && (
            <div className="hidden xl:block">
              <PdfActionButton
                onClick={handleScan}
                isLoading={isProcessing}
                disabled={!file || jobDescription.trim().length < 20}
                label={!file ? "Select Resume File" : isProcessing ? "Scanning..." : "Run ATS Audit"}
                subLabel={!file ? "Upload PDF to begin" : jobDescription.trim().length < 20 ? "Provide job description" : "Ready to analyze"}
                icon={ScanText}
              />
            </div>
          )}

          <PdfSidebar 
            accentColor="text-accent-blue"
            steps={RUN_STEPS}
            stats={file ? [
              { label: "File", value: file.name.slice(0, 18) + (file.name.length > 18 ? "..." : "") },
              { label: "Requirements", value: `${jobDescription.trim().length} Chars` },
              { label: "Parser", value: "Exismic Llama" }
            ] : []}
          />

          {!result && error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em]">Crawl Error</p>
                <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global analysis loader overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-24 h-24 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
              <TrendingUp className="absolute inset-0 m-auto w-8 h-8 text-accent-blue animate-pulse" />
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">{status}</h4>
            <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-blue shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-6 font-black uppercase tracking-[0.4em]">Audit matrix calculations active</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
