"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileText, 
  ListTodo, 
  Share2, 
  Clock, 
  AlertCircle,
  Play,
  ArrowRight
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import axios from "axios";

const YoutubeIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107c.502-1.89.502-5.837.502-5.837s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const SAMPLES = [
  { name: "SaaS Startup Guide", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }, // Replace with real links if desired, or keep as standard samples
  { name: "Figma to Code tutorial", url: "https://www.youtube.com/watch?v=8mG_J148x8E" },
  { name: "Intro to AI models", url: "https://www.youtube.com/watch?v=aircAruvnKk" }
];

const AUD_STEPS = [
  { title: "Paste Video Link", desc: "Paste any YouTube link (e.g., watch page URL or shortened youtu.be link)." },
  { title: "Choose Format", desc: "Select if you want a detailed Blog Post, a Social Thread, or Study Notes." },
  { title: "Transcribe", desc: "Exismic downloads the caption track and cleans the timing details." },
  { title: "AI Analysis", desc: "Llama-3 processes the transcript to draft your high-value summaries." }
];

type OutputFormat = "summary" | "blog" | "thread" | "transcript";

export default function YoutubeSummarizer() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<OutputFormat>("summary");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result data
  const [result, setResult] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [segments, setSegments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<OutputFormat>("summary");
  
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setError(null);
  };

  const simulateProgress = () => {
    setProgress(5);
    setStatus("Connecting to YouTube server...");
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        if (prev > 70) {
          setStatus("Generating formatted summaries and takeaways...");
          return prev + 1;
        }
        if (prev > 40) {
          setStatus("Analyzing transcript text using Exismic LLM...");
          return prev + 2;
        }
        if (prev > 15) {
          setStatus("Parsing subtitle timestamps...");
          return prev + 4;
        }
        return prev + 5;
      });
    }, 450);

    return interval;
  };

  const handleGenerate = async (selectedFormat: OutputFormat = format) => {
    if (!url.trim()) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post("/api/tools/ai/youtube-summarizer", {
        url: url.trim(),
        format: selectedFormat
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatus("Processing complete!");

      setResult(response.data.result);
      setVideoTitle(response.data.title);
      setVideoId(response.data.videoId);
      setSegments(response.data.segments || []);
      setActiveTab(selectedFormat);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || "Failed to process YouTube video.";
      setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = async (tab: OutputFormat) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    // If we already have the raw transcript data, we can switch between transcript/summary without calling API
    // but if we switch to "blog" or "thread" and don't have it, we generate it.
    // For simplicity: run handleGenerate for the new format
    await handleGenerate(tab);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${videoTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${activeTab}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileUrl);
  };

  const getThumbnailUrl = (id: string) => {
    return `https://img.youtube.com/vi/${id}/0.jpg`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Workspace */}
        <div className="xl:col-span-8 space-y-10">
          
          <div className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/[0.005] blur-[100px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                  <div className="p-2 bg-red-500/10 rounded-xl"><YoutubeIcon size={20} className="text-red-500" /></div>
                  YouTube Transcript Engine
                </h3>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Repurpose video assets into study guides & threads</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Input URL */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">YouTube Video Link</label>
                <div className="relative flex items-center">
                  <input 
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null); }}
                    placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
                    className="w-full h-16 bg-zinc-950/90 border border-white/5 focus:border-red-500/20 rounded-2xl pl-6 pr-16 text-zinc-300 font-medium outline-none focus:ring-4 focus:ring-red-500/5 transition-all duration-300 shadow-inner"
                  />
                  <div className="absolute right-4 p-2 rounded-xl bg-white/5 border border-white/5 text-zinc-500">
                    <YoutubeIcon size={16} />
                  </div>
                </div>
              </div>

              {/* Sample URLs */}
              <div className="space-y-3">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Sample Videos</span>
                <div className="flex flex-wrap gap-2.5">
                  {SAMPLES.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSampleClick(sample.url)}
                      className={cn(
                        "px-4 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        url === sample.url 
                          ? "bg-red-500/10 border-red-500/30 text-red-400" 
                          : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/15 hover:text-white"
                      )}
                    >
                      {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format selection panels */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Default Conversion Format</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "summary", name: "Study Notes", icon: ListTodo, desc: "Key takeaway bullets" },
                    { id: "blog", name: "Blog Post", icon: FileText, desc: "SEO-friendly article" },
                    { id: "thread", name: "Social Thread", icon: Share2, desc: "X/LinkedIn thread cards" },
                    { id: "transcript", name: "Transcript", icon: Clock, desc: "Raw time logs" }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setFormat(item.id as OutputFormat)}
                        className={cn(
                          "p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2",
                          format === item.id 
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                        )}
                      >
                        <Icon size={16} />
                        <span className="text-[10px] font-black uppercase block">{item.name}</span>
                        <span className="text-[8px] font-semibold opacity-70 block">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Trigger */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleGenerate(format)}
                  disabled={!url.trim() || isProcessing}
                  className={cn(
                    "w-full md:w-auto flex min-h-14 items-center justify-center gap-3 rounded-2xl px-10 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition hover:brightness-110 active:scale-98 cursor-pointer",
                    "bg-gradient-to-r from-red-600 to-rose-600",
                    "disabled:opacity-30 disabled:cursor-not-allowed"
                  )}
                >
                  <Sparkles size={16} />
                  {isProcessing ? "Transcribing Video..." : "Summarize Video"}
                </button>
              </div>
            </div>
          </div>

          {/* Results Workspace Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-8 relative overflow-hidden group animate-in fade-in duration-300"
              >
                {/* Video Info Card with YouTube Thumbnail integration */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-zinc-950/80 border border-white/5 relative z-10">
                  {videoId && (
                    <div className="relative w-full md:w-40 h-24 rounded-lg overflow-hidden shrink-0 bg-black flex items-center justify-center border border-white/5 shadow-inner">
                      <img 
                        src={getThumbnailUrl(videoId)} 
                        alt={videoTitle}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play size={20} className="text-white fill-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 text-center md:text-left min-w-0">
                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-md">Transcribed Video</span>
                    <h4 className="text-lg font-black text-white truncate pr-4">{videoTitle}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{url}</p>
                  </div>
                </div>

                {/* Switch Tabs Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-4 border-b border-white/5 relative z-10">
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "summary", name: "Takeaways", icon: ListTodo },
                      { id: "blog", name: "Blog Post", icon: FileText },
                      { id: "thread", name: "Social Thread", icon: Share2 },
                      { id: "transcript", name: "Transcript Lines", icon: Clock }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id as OutputFormat)}
                          className={cn(
                            "px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer",
                            activeTab === tab.id 
                              ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-sm"
                              : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                          )}
                        >
                          <Icon size={12} />
                          {tab.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy Output"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2.5 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer hover:bg-zinc-200"
                    >
                      <Download size={12} />
                      Download Output
                    </button>
                  </div>
                </div>

                {/* Tab content result renderer */}
                <div className="relative z-10 w-full rounded-2xl bg-zinc-950 border border-white/5 p-6 overflow-hidden">
                  {activeTab === "thread" ? (
                    /* Display thread cards cleanly */
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 selection:bg-red-500/20">
                      {result.split(/---\n?|\n\n\n?/).filter(Boolean).map((tweet, i) => (
                        <div key={i} className="p-5 rounded-xl border border-white/5 bg-white/[0.01] space-y-3">
                          <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                            <span>Post {i + 1}</span>
                            <span className="text-red-400 font-mono">{tweet.length} Chars</span>
                          </div>
                          <p className="text-xs font-semibold text-zinc-300 leading-relaxed whitespace-pre-wrap">{tweet.trim()}</p>
                        </div>
                      ))}
                    </div>
                  ) : activeTab === "transcript" && segments.length > 0 ? (
                    /* Display scrolling timestamp segments */
                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                      {segments.map((seg, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
                          <button 
                            className="px-2.5 py-1 text-[10px] font-black font-mono text-zinc-400 group-hover:text-red-400 bg-zinc-900 border border-white/5 rounded-md hover:border-red-500/20 transition-colors cursor-pointer select-none"
                            title="Copy segment line text"
                            onClick={() => navigator.clipboard.writeText(seg.text)}
                          >
                            {seg.timeLabel}
                          </button>
                          <p className="text-xs font-medium text-zinc-300 leading-relaxed mt-0.5">{seg.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* General markdown styled display (for summary & blog post) */
                    <div className="text-xs text-zinc-300 leading-relaxed overflow-y-auto max-h-[500px] custom-scrollbar pr-2 selection:bg-red-500/20 whitespace-pre-wrap">
                      {result}
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Sidebar steps panel */}
        <div className="xl:col-span-4 space-y-8">
          <PdfSidebar 
            accentColor="text-red-400"
            steps={AUD_STEPS}
            stats={result ? [
              { label: "Synthesis Engine", value: "Exismic Layout Engine" },
              { label: "Spoken Words", value: `~${result.split(/\s+/).length.toLocaleString()}` },
              { label: "Original Video ID", value: videoId }
            ] : []}
          />

          {error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em]">Transcription Error</p>
                <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full screen synthesis loader */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative mb-12">
              <div className="w-24 h-24 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <YoutubeIcon size={32} className="absolute inset-0 m-auto text-red-500 animate-pulse" />
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4 pr-4 px-4 -mx-4">{status}</h4>
            <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-6 font-black uppercase tracking-[0.4em]">Drafting content notes</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
