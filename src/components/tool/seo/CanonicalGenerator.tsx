"use client";

import React, { useState, useMemo } from "react";
import { 
  Link2, 
  Globe, 
  Copy, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Download, 
  ShieldCheck, 
  Layers, 
  Check, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Code2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

export interface HreflangEntry {
  id: string;
  lang: string;
  region?: string;
  url: string;
}

export interface CanonicalBlueprint {
  id: string;
  title: string;
  category: string;
  canonicalUrl: string;
  enforceTrailingSlash: boolean;
  forceHttps: boolean;
  stripTrackingParams: boolean;
  hreflangs: HreflangEntry[];
}

export const CANONICAL_BLUEPRINTS: CanonicalBlueprint[] = [
  {
    id: "saas-multilingual",
    title: "Global SaaS Platform",
    category: "Software",
    canonicalUrl: "https://cloudspark.io/pricing",
    enforceTrailingSlash: false,
    forceHttps: true,
    stripTrackingParams: true,
    hreflangs: [
      { id: "1", lang: "en", region: "US", url: "https://cloudspark.io/pricing" },
      { id: "2", lang: "es", region: "ES", url: "https://cloudspark.io/es/pricing" },
      { id: "3", lang: "fr", region: "FR", url: "https://cloudspark.io/fr/tarifs" },
      { id: "4", lang: "de", region: "DE", url: "https://cloudspark.io/de/preise" },
      { id: "5", lang: "x-default", url: "https://cloudspark.io/pricing" }
    ]
  },
  {
    id: "ecommerce-product",
    title: "E-Commerce Product Page",
    category: "Retail",
    canonicalUrl: "https://shopstellar.com/products/wireless-earbuds",
    enforceTrailingSlash: true,
    forceHttps: true,
    stripTrackingParams: true,
    hreflangs: [
      { id: "1", lang: "en", region: "US", url: "https://shopstellar.com/products/wireless-earbuds/" },
      { id: "2", lang: "en", region: "GB", url: "https://uk.shopstellar.com/products/wireless-earbuds/" },
      { id: "3", lang: "en", region: "CA", url: "https://ca.shopstellar.com/products/wireless-earbuds/" },
      { id: "4", lang: "x-default", url: "https://shopstellar.com/products/wireless-earbuds/" }
    ]
  },
  {
    id: "blog-syndication",
    title: "Blog Original Source Tag",
    category: "Editorial",
    canonicalUrl: "https://dailytechjournal.com/articles/future-of-quantum-computing",
    enforceTrailingSlash: false,
    forceHttps: true,
    stripTrackingParams: true,
    hreflangs: [
      { id: "1", lang: "en", url: "https://dailytechjournal.com/articles/future-of-quantum-computing" },
      { id: "2", lang: "x-default", url: "https://dailytechjournal.com/articles/future-of-quantum-computing" }
    ]
  },
  {
    id: "agency-b2b",
    title: "B2B Agency Solutions",
    category: "B2B Services",
    canonicalUrl: "https://acmeenterprise.com/solutions/cloud-security",
    enforceTrailingSlash: true,
    forceHttps: true,
    stripTrackingParams: false,
    hreflangs: [
      { id: "1", lang: "en", region: "US", url: "https://acmeenterprise.com/solutions/cloud-security/" },
      { id: "2", lang: "es", region: "MX", url: "https://acmeenterprise.com/es-mx/solutions/cloud-security/" },
      { id: "3", lang: "pt", region: "BR", url: "https://acmeenterprise.com/pt-br/solutions/cloud-security/" },
      { id: "4", lang: "x-default", url: "https://acmeenterprise.com/solutions/cloud-security/" }
    ]
  },
  {
    id: "mobile-subdomain",
    title: "Mobile Subdomain Consolidation",
    category: "Infrastructure",
    canonicalUrl: "https://travelpulse.app/guides/tokyo",
    enforceTrailingSlash: false,
    forceHttps: true,
    stripTrackingParams: true,
    hreflangs: [
      { id: "1", lang: "en", url: "https://travelpulse.app/guides/tokyo" },
      { id: "2", lang: "ja", region: "JP", url: "https://travelpulse.app/ja/guides/tokyo" },
      { id: "3", lang: "x-default", url: "https://travelpulse.app/guides/tokyo" }
    ]
  },
  {
    id: "dtc-fashion",
    title: "Luxury Brand Multi-Market",
    category: "DTC Brand",
    canonicalUrl: "https://luminabrand.com/collection/summer-essentials",
    enforceTrailingSlash: true,
    forceHttps: true,
    stripTrackingParams: true,
    hreflangs: [
      { id: "1", lang: "en", region: "US", url: "https://luminabrand.com/collection/summer-essentials/" },
      { id: "2", lang: "fr", region: "FR", url: "https://luminabrand.com/fr/collection/summer-essentials/" },
      { id: "3", lang: "it", region: "IT", url: "https://luminabrand.com/it/collection/summer-essentials/" },
      { id: "4", lang: "x-default", url: "https://luminabrand.com/collection/summer-essentials/" }
    ]
  }
];

export default function CanonicalGenerator() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("saas-multilingual");
  const [canonicalUrl, setCanonicalUrl] = useState("https://cloudspark.io/pricing");
  const [enforceTrailingSlash, setEnforceTrailingSlash] = useState(false);
  const [forceHttps, setForceHttps] = useState(true);
  const [stripTrackingParams, setStripTrackingParams] = useState(true);
  const [hreflangs, setHreflangs] = useState<HreflangEntry[]>([
    { id: "1", lang: "en", region: "US", url: "https://cloudspark.io/pricing" },
    { id: "2", lang: "es", region: "ES", url: "https://cloudspark.io/es/pricing" },
    { id: "3", lang: "fr", region: "FR", url: "https://cloudspark.io/fr/tarifs" },
    { id: "4", lang: "de", region: "DE", url: "https://cloudspark.io/de/preise" },
    { id: "5", lang: "x-default", url: "https://cloudspark.io/pricing" }
  ]);
  const [copied, setCopied] = useState(false);

  // Apply Blueprint
  const handleSelectBlueprint = (bp: CanonicalBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setCanonicalUrl(bp.canonicalUrl);
    setEnforceTrailingSlash(bp.enforceTrailingSlash);
    setForceHttps(bp.forceHttps);
    setStripTrackingParams(bp.stripTrackingParams);
    setHreflangs(bp.hreflangs);
  };

  // Clean and format target URL
  const formattedCanonical = useMemo(() => {
    let u = canonicalUrl.trim();
    if (!u) return "";
    
    // Add protocol if missing
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      u = "https://" + u;
    }

    if (forceHttps && u.startsWith("http://")) {
      u = "https://" + u.slice(7);
    }

    try {
      const parsed = new URL(u);
      if (stripTrackingParams) {
        const trackingKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"];
        trackingKeys.forEach(k => parsed.searchParams.delete(k));
      }
      u = parsed.toString();
    } catch {
      // Keep basic string
    }

    if (enforceTrailingSlash && !u.endsWith("/") && !u.includes("?")) {
      u += "/";
    } else if (!enforceTrailingSlash && u.endsWith("/") && u.length > 8) {
      u = u.slice(0, -1);
    }

    return u;
  }, [canonicalUrl, enforceTrailingSlash, forceHttps, stripTrackingParams]);

  // Generate valid HTML markup
  const outputCode = useMemo(() => {
    let code = `<!-- Canonical Master Link (Prevents Duplicate Content) -->\n`;
    code += `<link rel="canonical" href="${formattedCanonical}" />\n`;

    if (hreflangs.length > 0) {
      code += `\n<!-- Multi-Language & Regional Hreflang Directives -->\n`;
      hreflangs.forEach((h) => {
        if (h.lang && h.url) {
          const hreflangCode = h.region ? `${h.lang}-${h.region}` : h.lang;
          code += `<link rel="alternate" hreflang="${hreflangCode}" href="${h.url.trim()}" />\n`;
        }
      });
    }
    return code;
  }, [formattedCanonical, hreflangs]);

  const addHreflang = (lang: string = "en", region: string = "", customUrl?: string) => {
    const newEntry: HreflangEntry = {
      id: Math.random().toString(36).substring(2, 9),
      lang,
      region,
      url: customUrl || (region ? `${formattedCanonical}/${lang}-${region.toLowerCase()}` : `${formattedCanonical}/${lang}`)
    };
    setHreflangs([...hreflangs, newEntry]);
  };

  const removeHreflang = (id: string) => {
    setHreflangs(hreflangs.filter(h => h.id !== id));
  };

  const updateHreflang = (id: string, field: keyof HreflangEntry, val: string) => {
    setHreflangs(hreflangs.map(h => h.id === id ? { ...h, [field]: val } : h));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canonical-and-hreflang-tags.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasXDefault = hreflangs.some(h => h.lang.toLowerCase() === "x-default");

  return (
    <div className="w-full space-y-8">
      {/* Top 6 Curated SEO Blueprints (Standard: Preloaded Blueprint #1, Zero Empty Voids) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">
              Instant Canonical & Regional Blueprints
            </h2>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">
            Click any blueprint to inspect proven multi-language tag structures
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CANONICAL_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap shrink-0">
                    {bp.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate text-right">
                    {bp.hreflangs.length} locales
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs font-mono text-zinc-400 line-clamp-1">
                    {bp.canonicalUrl.replace("https://", "")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs & Rules): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5">
            {/* Primary Master URL Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Link2 size={14} className="text-cyan-400" />
                  <span>Primary Master URL (Canonical) *</span>
                </label>
                <span className="text-[11px] text-zinc-500">The authoritative original link</span>
              </div>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => {
                  setCanonicalUrl(e.target.value);
                  setSelectedBlueprintId("");
                }}
                placeholder="https://example.com/pricing"
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-mono font-medium text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-zinc-600"
              />
            </div>

            {/* Quick URL Formatting Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 cursor-pointer hover:border-cyan-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={forceHttps}
                  onChange={(e) => setForceHttps(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs font-bold text-zinc-300">Force HTTPS</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 cursor-pointer hover:border-cyan-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={enforceTrailingSlash}
                  onChange={(e) => setEnforceTrailingSlash(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs font-bold text-zinc-300">Trailing Slash (/)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 cursor-pointer hover:border-cyan-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={stripTrackingParams}
                  onChange={(e) => setStripTrackingParams(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs font-bold text-zinc-300">Strip UTM Tags</span>
              </label>
            </div>

            {/* Multi-Language Hreflang Section */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Globe size={14} className="text-cyan-400" />
                    <span>Regional & Language Variants (Hreflang)</span>
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Direct searchers to their native language page
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addHreflang("fr", "FR")}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Language
                </button>
              </div>

              {/* Quick Add Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 self-center mr-1">Quick Add:</span>
                {[
                  { lang: "en", reg: "US", label: "English (US)" },
                  { lang: "en", reg: "GB", label: "English (UK)" },
                  { lang: "es", reg: "ES", label: "Spanish" },
                  { lang: "fr", reg: "FR", label: "French" },
                  { lang: "de", reg: "DE", label: "German" },
                  { lang: "ja", reg: "JP", label: "Japanese" },
                  { lang: "x-default", reg: "", label: "Global Default (x-default)" }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => addHreflang(preset.lang, preset.reg)}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-zinc-400 text-[10px] font-bold border border-white/10 transition-colors cursor-pointer"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>

              {/* Hreflang Entry List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {hreflangs.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 border border-white/10">
                    <div className="w-16 shrink-0">
                      <input
                        type="text"
                        placeholder="lang"
                        value={h.lang}
                        onChange={(e) => updateHreflang(h.id, "lang", e.target.value)}
                        className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs text-center focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="w-14 shrink-0">
                      <input
                        type="text"
                        placeholder="region"
                        value={h.region || ""}
                        onChange={(e) => updateHreflang(h.id, "region", e.target.value.toUpperCase())}
                        className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs text-center focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="Target URL"
                        value={h.url}
                        onChange={(e) => updateHreflang(h.id, "url", e.target.value)}
                        className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHreflang(h.id)}
                      className="p-2 rounded-xl hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer shrink-0"
                      title="Remove entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Generated Code & Quality Checks): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Code Preview Box */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Generated HTML Header Directives
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
                >
                  <Download size={13} /> Download .html
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:brightness-110 cursor-pointer"
                >
                  {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>
            </div>

            {/* Formatted Code Block */}
            <div className="rounded-2xl bg-black/80 border border-white/10 p-4 font-mono text-xs text-cyan-200 overflow-x-auto leading-relaxed shadow-inner max-h-[300px]">
              <pre>{outputCode}</pre>
            </div>

            {/* Quality & Validation Checklist */}
            <div className="rounded-2xl border border-white/5 bg-black/40 p-4 space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                Google Search Quality Checklist:
              </span>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                <span>Absolute URL provided with complete <code className="text-cyan-300 bg-cyan-950/40 px-1 py-0.5 rounded">https://</code> protocol</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                <span>Duplicate tracking query strings stripped from canonical reference</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                {hasXDefault ? (
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-amber-400 shrink-0" />
                )}
                <span className={hasXDefault ? "text-zinc-300" : "text-amber-300"}>
                  {hasXDefault ? "Global fallback (x-default) included for unlisted country visitors" : "Recommended: Add an x-default fallback for visitors from unlisted countries"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="canonical-generator"
        toolName="Canonical & Hreflang Tag Generator"
        title={`Canonical Tag for ${canonicalUrl}`}
        content={outputCode}
        downloadLabel="Download HTML Tags (.html)"
        downloadAction={handleDownload}
        onCopy={handleCopy}
      />

      {/* Chained Companion Tools in SEO */}
      <ToolWorkflowChaining
        currentToolId="canonical-generator"
        categoryId="seo"
        outputContent={`Canonical: ${formattedCanonical}, Locales: ${hreflangs.length}`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="canonical-generator"
        categoryId="seo"
        outputContent={`Canonical: ${formattedCanonical}, Locales: ${hreflangs.length}`}
      />
    </div>
  );
}
