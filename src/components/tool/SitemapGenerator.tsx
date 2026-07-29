"use client";

import React, { useState, useMemo } from "react";
import { 
  FileCheck, 
  Copy, 
  CheckCircle2, 
  Download, 
  Globe, 
  Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SitemapGenerator() {
  const [urlList, setUrlList] = useState(
    "https://yourdomain.com/\nhttps://yourdomain.com/about\nhttps://yourdomain.com/pricing\nhttps://yourdomain.com/blog"
  );
  const [changefreq, setChangefreq] = useState("weekly");
  const [priority, setPriority] = useState("0.8");
  const [copied, setCopied] = useState(false);

  const xmlContent = useMemo(() => {
    const urls = urlList
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && u.startsWith("http"));

    const dateStr = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    urls.forEach((url) => {
      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }, [urlList, changefreq, priority]);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <FileCheck size={14} className="text-cyan-400" />
              <span>Google Search Console Tool</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              XML Sitemap Generator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Generate valid XML sitemaps for Google Search Console with changefreq and priority metadata.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Enter Website Page URLs (One Per Line)
            </label>
            <textarea
              value={urlList}
              onChange={(e) => setUrlList(e.target.value)}
              placeholder="https://yourdomain.com/"
              className="w-full flex-1 min-h-[220px] rounded-2xl border border-white/10 bg-black/50 p-4 text-xs font-mono text-cyan-300 placeholder-zinc-600 focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Change Frequency</label>
              <select
                value={changefreq}
                onChange={(e) => setChangefreq(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Page Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="1.0">1.0 (High / Home)</option>
                <option value="0.8">0.8 (Medium / Category)</option>
                <option value="0.5">0.5 (Standard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* XML Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Globe size={15} className="text-cyan-400" />
            Generated sitemap.xml Output
          </label>

          <pre className="w-full flex-1 min-h-[260px] rounded-2xl border border-white/10 bg-black/80 p-4 text-[11px] font-mono text-emerald-300 overflow-y-auto leading-relaxed">
            {xmlContent}
          </pre>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? "Copied!" : "Copy XML"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Download size={16} />
              <span>Download sitemap.xml</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
