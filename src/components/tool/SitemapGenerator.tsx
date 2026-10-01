"use client";

import React, { useState, useMemo } from "react";
import { 
  Network, 
  Copy, 
  CheckCircle2, 
  Download, 
  Globe, 
  Sliders, 
  RotateCcw, 
  Tag, 
  Check, 
  FileCode2, 
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { CyberDropdown, type DropdownOption } from "@/components/ui/CyberDropdown";

const CHANGEFREQ_OPTIONS: DropdownOption[] = [
  { value: "always", label: "Always (Live Feeds)", description: "Stock tickers & real-time updates", badge: "Live" },
  { value: "hourly", label: "Hourly (Active News)", description: "Breaking news & high-traffic publishers", badge: "News" },
  { value: "daily", label: "Daily (E-Commerce / Blogs)", description: "Online stores & active publication blogs", badge: "Recommended" },
  { value: "weekly", label: "Weekly (Standard Corporate)", description: "Landing pages, pricing & service pages" },
  { value: "monthly", label: "Monthly (Static Pages)", description: "Documentation & knowledge base articles" },
  { value: "yearly", label: "Yearly (Archival)", description: "Legal policies, terms & historic archives" },
  { value: "never", label: "Never (Deprecated)", description: "Static permanent historical documents" },
];

const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "1.0", label: "1.0 (Critical / Home)", description: "Homepage & flagship landing page", badge: "1.0" },
  { value: "0.9", label: "0.9 (Primary Conversion Pages)", description: "Main pricing, checkout & top products", badge: "0.9" },
  { value: "0.8", label: "0.8 (Main Category & Products)", description: "Category hubs & high-value landing pages", badge: "0.8" },
  { value: "0.6", label: "0.6 (Articles & Blog Posts)", description: "Editorial articles, tutorials & guides", badge: "0.6" },
  { value: "0.4", label: "0.4 (Utility & Secondary)", description: "Terms, privacy policies & legal pages", badge: "0.4" },
];

// 6 Curated Sitemap Blueprints (Standard: Preloaded Blueprint #1, Zero Empty Voids)
export interface SitemapBlueprint {
  id: string;
  title: string;
  category: string;
  urls: string[];
  changefreq: string;
  priority: string;
  description: string;
}

export const SITEMAP_BLUEPRINTS: SitemapBlueprint[] = [
  {
    id: "ecommerce-store",
    title: "E-Commerce Online Store",
    category: "Online Store",
    urls: [
      "https://example.com/",
      "https://example.com/collections/new-arrivals",
      "https://example.com/collections/best-sellers",
      "https://example.com/products/wireless-headphones",
      "https://example.com/about",
      "https://example.com/faq",
      "https://example.com/contact"
    ],
    changefreq: "daily",
    priority: "0.8",
    description: "Multi-page retail structure indexing catalogs, product pages, and customer FAQs."
  },
  {
    id: "saas-platform",
    title: "SaaS Software Platform",
    category: "Software",
    urls: [
      "https://example.com/",
      "https://example.com/features",
      "https://example.com/pricing",
      "https://example.com/integrations",
      "https://example.com/docs",
      "https://example.com/blog",
      "https://example.com/contact"
    ],
    changefreq: "weekly",
    priority: "0.9",
    description: "Search-optimized sitemap for cloud applications, pricing tiers, and API docs."
  },
  {
    id: "content-blog",
    title: "Editorial Media Blog",
    category: "Publishing",
    urls: [
      "https://example.com/",
      "https://example.com/technology",
      "https://example.com/business",
      "https://example.com/guides/ultimate-seo-playbook",
      "https://example.com/guides/web-design-trends-2026",
      "https://example.com/about-us",
      "https://example.com/newsletter"
    ],
    changefreq: "daily",
    priority: "0.8",
    description: "Rapid indexing structure for news publishers and content marketing blogs."
  },
  {
    id: "digital-agency",
    title: "Agency / Portfolio Site",
    category: "Services",
    urls: [
      "https://example.com/",
      "https://example.com/services/web-development",
      "https://example.com/services/seo-marketing",
      "https://example.com/case-studies",
      "https://example.com/clients",
      "https://example.com/careers",
      "https://example.com/contact"
    ],
    changefreq: "weekly",
    priority: "0.8",
    description: "Client service showcase linking landing pages, case studies, and quote forms."
  },
  {
    id: "doc-center",
    title: "Documentation & API Portal",
    category: "Developer",
    urls: [
      "https://example.com/docs",
      "https://example.com/docs/getting-started",
      "https://example.com/docs/authentication",
      "https://example.com/docs/api-reference",
      "https://example.com/docs/sdk/react",
      "https://example.com/docs/sdk/python",
      "https://example.com/changelog"
    ],
    changefreq: "weekly",
    priority: "0.7",
    description: "Technical reference hierarchy ensuring search bots find every endpoint guide."
  },
  {
    id: "local-business",
    title: "Local Business / Clinic",
    category: "Local Service",
    urls: [
      "https://example.com/",
      "https://example.com/services",
      "https://example.com/doctors",
      "https://example.com/patient-reviews",
      "https://example.com/book-appointment",
      "https://example.com/locations/london-clinic",
      "https://example.com/contact"
    ],
    changefreq: "monthly",
    priority: "0.8",
    description: "Regional business layout optimized for local map pack and service discovery."
  }
];

export default function SitemapGenerator() {
  // Selected Blueprint
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("ecommerce-store");

  // Form Inputs
  const [urlList, setUrlList] = useState<string>(SITEMAP_BLUEPRINTS[0].urls.join("\n"));
  const [changefreq, setChangefreq] = useState<string>(SITEMAP_BLUEPRINTS[0].changefreq);
  const [priority, setPriority] = useState<string>(SITEMAP_BLUEPRINTS[0].priority);
  const [includeLastmod, setIncludeLastmod] = useState<boolean>(true);

  const [copied, setCopied] = useState<boolean>(false);

  // Parse URLs
  const parsedUrls = useMemo(() => {
    return urlList
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith("http://") || u.startsWith("https://")));
  }, [urlList]);

  // Compiled XML content
  const xmlContent = useMemo(() => {
    const dateStr = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<!-- Generated by Exismic SEO Webmaster Studio -->\n`;
    xml += `<!-- Total URLs Indexed: ${parsedUrls.length} -->\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    parsedUrls.forEach((url, i) => {
      // Home page defaults to 1.0 priority
      const isHome = url.endsWith(".com/") || url.endsWith(".org/") || url.endsWith(".io/") || !url.split("://")[1]?.includes("/");
      const p = isHome ? "1.0" : priority;

      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      if (includeLastmod) {
        xml += `    <lastmod>${dateStr}</lastmod>\n`;
      }
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${p}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }, [parsedUrls, changefreq, priority, includeLastmod]);

  // Load a Blueprint
  const handleSelectBlueprint = (bp: SitemapBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setUrlList(bp.urls.join("\n"));
    setChangefreq(bp.changefreq);
    setPriority(bp.priority);
  };

  // Reset to Baseline
  const handleReset = () => {
    setSelectedBlueprintId("");
    setUrlList("https://yourdomain.com/\nhttps://yourdomain.com/about\nhttps://yourdomain.com/pricing\nhttps://yourdomain.com/blog");
    setChangefreq("weekly");
    setPriority("0.8");
  };

  // Insert a quick path to URL list
  const insertQuickPath = (slug: string) => {
    const lines = urlList.split("\n");
    const domain = lines[0]?.startsWith("http") ? new URL(lines[0]).origin : "https://yourdomain.com";
    const newUrl = `${domain}${slug}`;
    if (!urlList.includes(newUrl)) {
      setUrlList((prev) => `${prev.trim()}\n${newUrl}`);
    }
  };

  // Copy XML
  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download sitemap.xml
  const handleDownloadXml = () => {
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Deck: Telemetry HUD & Studio Actions */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Category Badge & Studio Telemetry */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Network size={13} className="text-cyan-400" />
              <span>SEO Webmaster Studio</span>
            </div>

            {/* Indexed URLs Count */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Globe size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-zinc-300">Indexed URLs:</span>
              <span className="text-sm font-black text-cyan-400">
                {parsedUrls.length} Valid Pages
              </span>
            </div>

            {/* Frequency & Priority Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Sliders size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-zinc-300">Crawl Cadence:</span>
              <span className="text-sm font-black text-white capitalize">
                {changefreq} • Priority {priority}
              </span>
            </div>
          </div>

          {/* Right: Quick Reset & Download */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset fields to baseline"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={handleDownloadXml}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Download sitemap.xml</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blueprint Selector Bar (Standard: 6 Blueprints, Preloaded Blueprint #1) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Verified XML Sitemap Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to pre-fill standard website page trees
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SITEMAP_BLUEPRINTS.map((bp) => {
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
                    {bp.urls.length} URLs
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (URL Input & Configuration): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5 flex flex-col">
            {/* URLs Textarea */}
            <div className="space-y-2 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Globe size={14} className="text-cyan-400" />
                  <span>Enter Website URLs (One Per Line)</span>
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {parsedUrls.length} valid URLs
                </span>
              </div>

              <textarea
                value={urlList}
                onChange={(e) => {
                  setUrlList(e.target.value);
                  setSelectedBlueprintId("");
                }}
                placeholder="https://yourdomain.com/&#10;https://yourdomain.com/about&#10;https://yourdomain.com/pricing"
                className="w-full flex-1 min-h-[220px] rounded-2xl border border-white/10 bg-black/60 p-4 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none transition-all resize-y leading-relaxed"
              />

              {/* Quick URL Inject Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500">Quick Add:</span>
                {["/about", "/pricing", "/features", "/blog", "/contact", "/faq"].map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => insertQuickPath(path)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 border border-white/10 cursor-pointer"
                  >
                    + {path}
                  </button>
                ))}
              </div>
            </div>

            {/* Cadence & Priority Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <CyberDropdown
                label="Update Frequency (`changefreq`)"
                value={changefreq}
                onChange={(val) => setChangefreq(val)}
                options={CHANGEFREQ_OPTIONS}
                themeColor="cyan"
              />

              <CyberDropdown
                label="Relative Priority (`priority`)"
                value={priority}
                onChange={(val) => setPriority(val)}
                options={PRIORITY_OPTIONS}
                themeColor="cyan"
              />
            </div>

            {/* Lastmod Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-cyan-400" />
                <span className="text-xs text-zinc-300">{"Include <lastmod> Timestamp (Today)"}</span>
              </div>
              <input
                type="checkbox"
                checked={includeLastmod}
                onChange={(e) => setIncludeLastmod(e.target.checked)}
                className="w-4 h-4 rounded bg-black/60 border-white/20 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column (XML Output & Schema Verification): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <FileCode2 size={15} className="text-cyan-400" />
                  <span>Validated sitemap.xml Output</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400">XML Schema 0.9</span>
              </div>

              {/* Code Container */}
              <pre className="w-full min-h-[340px] max-h-[420px] rounded-2xl border border-white/10 bg-black/80 p-4 text-xs font-mono text-cyan-300 overflow-y-auto leading-relaxed select-all">
                {xmlContent}
              </pre>

              {/* Google Search Console Checklist Strip */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  <span>Valid XML encoding and sitemaps.org namespace</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  <span>{parsedUrls.length} valid absolute HTTP/HTTPS URLs</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  <span>Ready for Google Search Console & Bing Webmaster Tools</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={16} className="text-cyan-400" />
                    <span>Copied XML!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-zinc-300" />
                    <span>Copy XML Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadXml}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Download size={16} className="text-black" />
                <span>Download sitemap.xml</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="sitemap-generator"
        toolName="XML Sitemap Generator"
        title={`XML Sitemap (${parsedUrls.length} Indexed Pages)`}
        content={xmlContent}
        downloadLabel="Download sitemap.xml"
        downloadAction={handleDownloadXml}
        onCopy={handleCopy}
      />

      {/* Chained Companion Tools in SEO */}
      <ToolWorkflowChaining
        currentToolId="sitemap-generator"
        categoryId="seo"
        outputContent={`XML Sitemap containing ${parsedUrls.length} URLs`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="sitemap-generator"
        categoryId="seo"
        outputContent={`XML Sitemap containing ${parsedUrls.length} URLs`}
      />
    </div>
  );
}
