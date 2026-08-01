"use client";

import React, { useState } from "react";
import { SearchCode, Monitor, Smartphone, Copy, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SerpSimulator() {
  const [title, setTitle] = useState("Exismic - All-in-One AI Tools | Image, Video & Audio Studio");
  const [url, setUrl] = useState("https://www.exismic.xyz/tools/sitemap-generator");
  const [description, setDescription] = useState("Create, edit, convert, and enhance images, video, audio, PDFs, and documents with Exismic's studio-grade AI utilities.");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const titleCharCount = title.length;
  const descCharCount = description.length;
  // Estimated pixel width calculation (~9px per char avg for standard font)
  const titlePx = titleCharCount * 9.2;
  const isTitleOver = titlePx > 580;
  const isDescOver = descCharCount > 160;

  const handleCopyMeta = () => {
    const code = `<title>${title}</title>\n<meta name="description" content="${description}" />`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-teal-900/20 to-neutral-900 border border-cyan-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <SearchCode className="w-3.5 h-3.5" /> Google Search Optimizer
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Google SERP Snippet Simulator
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">
          Preview how your title tags and meta descriptions will render in real Google Search results across Desktop and Mobile viewports with pixel-width meters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Controls */}
        <div className="lg:col-span-6 space-y-4 p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                SEO Title Tag
              </label>
              <span className={cn("text-xs font-mono font-bold", isTitleOver ? "text-red-400" : "text-emerald-400")}>
                {titleCharCount} / 60 chars ({Math.round(titlePx)}px / 580px)
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              Page Target URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Meta Description
              </label>
              <span className={cn("text-xs font-mono font-bold", isDescOver ? "text-red-400" : "text-emerald-400")}>
                {descCharCount} / 160 chars
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <button
            onClick={handleCopyMeta}
            className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied HTML Meta Tags!" : "Copy HTML Meta Code"}
          </button>
        </div>

        {/* Live SERP Preview */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Live Google Search Result Preview
              </span>
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setDevice("desktop")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all",
                    device === "desktop" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-neutral-400"
                  )}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all",
                    device === "mobile" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-neutral-400"
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>
            </div>

            {/* Google Result Box Simulation */}
            <div className={cn("p-5 rounded-2xl bg-white text-black font-sans shadow-xl my-auto transition-all", device === "mobile" ? "max-w-[340px] mx-auto" : "w-full")}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-[9px] font-bold text-neutral-600">
                  G
                </div>
                <span className="text-xs text-[#202124] truncate">{url || "https://example.com"}</span>
              </div>
              <h3 className="text-lg text-[#1a0dab] font-normal hover:underline cursor-pointer leading-tight mb-1 truncate">
                {title || "Page Title Sample"}
              </h3>
              <p className="text-xs text-[#4d5156] leading-normal line-clamp-2">
                {description || "Meta description snippet will appear here in search engine results pages."}
              </p>
            </div>

            {/* Status alerts */}
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              {isTitleOver && (
                <p className="text-xs text-amber-400 flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 shrink-0" /> Title width exceeds 580px; Google may truncate with "..."
                </p>
              )}
              {isDescOver && (
                <p className="text-xs text-amber-400 flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 shrink-0" /> Meta description exceeds 160 characters.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
