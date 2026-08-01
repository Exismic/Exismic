"use client";

import React, { useState, useMemo } from "react";
import { Code, Copy, Check, Plus, Trash2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface HreflangEntry {
  lang: string;
  url: string;
}

export default function CanonicalGenerator() {
  const [canonicalUrl, setCanonicalUrl] = useState("https://www.exismic.xyz/tools/sitemap-generator");
  const [enforceTrailingSlash, setEnforceTrailingSlash] = useState(false);
  const [hreflangs, setHreflangs] = useState<HreflangEntry[]>([
    { lang: "en", url: "https://www.exismic.xyz/tools/sitemap-generator" },
    { lang: "es", url: "https://www.exismic.xyz/es/tools/sitemap-generator" },
    { lang: "x-default", url: "https://www.exismic.xyz/tools/sitemap-generator" }
  ]);
  const [copied, setCopied] = useState(false);

  const formattedCanonical = useMemo(() => {
    let u = canonicalUrl.trim();
    if (!u) return "";
    if (enforceTrailingSlash && !u.endsWith("/")) u += "/";
    else if (!enforceTrailingSlash && u.endsWith("/") && u.length > 8) u = u.slice(0, -1);
    return u;
  }, [canonicalUrl, enforceTrailingSlash]);

  const outputCode = useMemo(() => {
    let code = `<!-- Canonical URL Tag -->\n<link rel="canonical" href="${formattedCanonical}" />\n`;
    if (hreflangs.length > 0) {
      code += `\n<!-- International Hreflang Tags -->\n`;
      hreflangs.forEach((h) => {
        if (h.lang && h.url) {
          code += `<link rel="alternate" hreflang="${h.lang.trim()}" href="${h.url.trim()}" />\n`;
        }
      });
    }
    return code;
  }, [formattedCanonical, hreflangs]);

  const addHreflang = () => {
    setHreflangs([...hreflangs, { lang: "fr", url: `${formattedCanonical}/fr` }]);
  };

  const removeHreflang = (idx: number) => {
    setHreflangs(hreflangs.filter((_, i) => i !== idx));
  };

  const updateHreflang = (idx: number, field: keyof HreflangEntry, val: string) => {
    const updated = [...hreflangs];
    updated[idx] = { ...updated[idx], [field]: val };
    setHreflangs(updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-teal-900/20 to-neutral-900 border border-cyan-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Code className="w-3.5 h-3.5" /> Technical SEO Tool
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Canonical & Hreflang Tag Generator
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">
          Generate valid self-referential canonical tags and multi-language hreflang HTML meta code to eliminate duplicate content issues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-6 space-y-5 p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Canonical Target URL
            </label>
            <input
              type="text"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="slashToggle"
              checked={enforceTrailingSlash}
              onChange={(e) => setEnforceTrailingSlash(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="slashToggle" className="text-xs text-neutral-300 font-medium cursor-pointer">
              Enforce Trailing Slash (`/`)
            </label>
          </div>

          {/* Hreflang Section */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> Hreflang Translations
              </span>
              <button
                onClick={addHreflang}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-cyan-300 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Language
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {hreflangs.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="en / es / fr / x-default"
                    value={h.lang}
                    onChange={(e) => updateHreflang(i, "lang", e.target.value)}
                    className="w-24 p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs text-center"
                  />
                  <input
                    type="text"
                    placeholder="Target language URL"
                    value={h.url}
                    onChange={(e) => updateHreflang(i, "url", e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                  />
                  <button
                    onClick={() => removeHreflang(i)}
                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Code Column */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Generated HTML &lt;head&gt; Code
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied HTML!" : "Copy Code"}
              </button>
            </div>

            <pre className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-cyan-300 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed shadow-inner my-auto">
              {outputCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
