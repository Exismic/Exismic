"use client";

import React, { useState, useMemo } from "react";
import { 
  FileCode, 
  Copy, 
  Check, 
  Layers, 
  Download, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  Eye,
  Code2,
  RefreshCw,
  Zap,
  TrendingDown,
  Sparkle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolLaserDivider } from "@/components/tool/ToolLaserDivider";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";

// ============================================================================
// CURATED SVG BLUEPRINTS (Zero Tech Jargon, 100% Real Vector Graphics)
// ============================================================================

export interface SvgBlueprint {
  id: string;
  name: string;
  description: string;
  tag: string;
  svg: string;
}

export const SVG_BLUEPRINTS: SvgBlueprint[] = [
  {
    id: "figma-export",
    name: "Figma Icon Export",
    description: "Contains Figma XML namespaces, editor comments, and bloated group layers.",
    tag: "Figma Clean",
    svg: `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
  <!-- Generator: Figma Design Studio (v124) -->
  <g id="Layer_1" sketch:type="MSArtboardGroup">
    <circle id="bg_circle" cx="60" cy="60" r="50" fill="#84cc16" fill-opacity="0.2" stroke="#84cc16" stroke-width="4"/>
    <path id="vector_check" d="M42 60L54 72L78 48" stroke="#84cc16" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`,
  },
  {
    id: "illustrator-badge",
    name: "Adobe Illustrator Graphic",
    description: "Contains Illustrator serif tags, xml:space preserve, and nested clip paths.",
    tag: "Illustrator",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" xml:space="preserve" xmlns:serif="http://www.serif.com/">
  <!-- Exported from Adobe Illustrator CC 2026 -->
  <g id="CyberBadge">
    <polygon points="60,15 105,40 105,80 60,105 15,80 15,40" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="4"/>
    <circle cx="60" cy="60" r="22" fill="#84cc16" fill-opacity="0.3" stroke="#84cc16" stroke-width="3"/>
    <circle cx="60" cy="60" r="8" fill="#84cc16"/>
  </g>
</svg>`,
  },
  {
    id: "shield-security",
    name: "Cyber Security Shield",
    description: "Vector security shield with dual contour stroke and glowing lock symbol.",
    tag: "Icons & Badges",
    svg: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Security Shield Asset -->
  <path d="M50 15L80 28V52C80 70 67 84 50 90C33 84 20 70 20 52V28L50 15Z" fill="#84cc16" fill-opacity="0.1" stroke="#84cc16" stroke-width="4" stroke-linejoin="round"/>
  <path d="M42 48V42C42 37.5 45.5 34 50 34C54.5 34 58 37.5 58 42V48M38 48H62V64H38V48Z" stroke="#a3e635" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
  },
  {
    id: "spark-pulse",
    name: "Lightning Energy Bolt",
    description: "Dynamic high-voltage energy lightning icon with rounded corners.",
    tag: "Dynamic UI",
    svg: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Energy Bolt Asset -->
  <path d="M55 12L25 54H48L42 88L75 46H52L55 12Z" fill="#84cc16" fill-opacity="0.3" stroke="#84cc16" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: "browser-clay",
    name: "Browser Clay Window",
    description: "Miniature browser mockup frame with header buttons and viewport frame.",
    tag: "Frames & UI",
    svg: `<svg width="140" height="100" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Desktop Browser Container -->
  <rect x="10" y="10" width="120" height="80" rx="8" fill="#18181b" stroke="#84cc16" stroke-width="3"/>
  <rect x="10" y="10" width="120" height="20" rx="8" fill="#27272a"/>
  <circle cx="22" cy="20" r="3" fill="#ef4444"/>
  <circle cx="30" cy="20" r="3" fill="#f59e0b"/>
  <circle cx="38" cy="20" r="3" fill="#10b981"/>
</svg>`,
  },
  {
    id: "code-terminal",
    name: "Matrix Terminal Icon",
    description: "Command line terminal with prompt chevron and cursor pulse bar.",
    tag: "Developer Tools",
    svg: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Terminal Prompt -->
  <rect x="15" y="20" width="70" height="60" rx="6" fill="#09090b" stroke="#84cc16" stroke-width="4"/>
  <path d="M28 42L38 50L28 58" stroke="#84cc16" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="45" y1="58" x2="60" y2="58" stroke="#84cc16" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  }
];

export default function SvgOptimizer() {
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>("figma-export");
  const [rawSvg, setRawSvg] = useState<string>(SVG_BLUEPRINTS[0].svg);
  const [stripComments, setStripComments] = useState<boolean>(true);
  const [stripDimensions, setStripDimensions] = useState<boolean>(true);
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  const [stripEmptyGroups, setStripEmptyGroups] = useState<boolean>(true);
  const [minifyWhitespace, setMinifyWhitespace] = useState<boolean>(true);
  const [previewTab, setPreviewTab] = useState<"render" | "code">("render");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedDataUri, setCopiedDataUri] = useState<boolean>(false);

  // Apply Blueprint
  const applyBlueprint = (bp: SvgBlueprint) => {
    setActiveBlueprintId(bp.id);
    setRawSvg(bp.svg);
  };

  // Perform multi-stage optimization
  const optimizedSvg = useMemo(() => {
    let svg = rawSvg.trim();
    if (!svg) return "";

    // 1. Remove XML & HTML comments
    if (stripComments) {
      svg = svg.replace(/<!--[\s\S]*?-->/g, "");
    }

    // 2. Remove third-party editor metadata and attributes
    if (stripMetadata) {
      svg = svg.replace(/xmlns:serif="[^"]*"/gi, "");
      svg = svg.replace(/xmlns:sketch="[^"]*"/gi, "");
      svg = svg.replace(/sketch:type="[^"]*"/gi, "");
      svg = svg.replace(/xml:space="[^"]*"/gi, "");
      svg = svg.replace(/id="(Layer_\d+|MSArtboardGroup|svg\d+|vector_\d+|bg_\d+)"/gi, "");
      svg = svg.replace(/\s+/g, " ");
    }

    // 3. Remove hardcoded width and height to make SVG responsive via viewBox
    if (stripDimensions) {
      // Only remove if a viewBox exists so the SVG doesn't lose dimensions
      if (svg.includes("viewBox=")) {
        svg = svg.replace(/\s(width|height)="[^"]*"/gi, "");
      }
    }

    // 4. Remove empty <g> groups
    if (stripEmptyGroups) {
      svg = svg.replace(/<g>\s*<\/g>/gi, "");
      svg = svg.replace(/<g\s*>\s*<\/g>/gi, "");
    }

    // 5. Minify whitespace
    if (minifyWhitespace) {
      svg = svg.replace(/>\s+</g, "><");
      svg = svg.replace(/\s{2,}/g, " ");
    }

    return svg.trim();
  }, [rawSvg, stripComments, stripDimensions, stripMetadata, stripEmptyGroups, minifyWhitespace]);

  // Byte calculations
  const rawBytes = useMemo(() => new Blob([rawSvg]).size, [rawSvg]);
  const optBytes = useMemo(() => new Blob([optimizedSvg]).size, [optimizedSvg]);
  const savingsPct = rawBytes > 0 ? Math.max(0, Math.round(((rawBytes - optBytes) / rawBytes) * 100)) : 0;

  // Data URI calculation
  const dataUri = useMemo(() => {
    return `data:image/svg+xml;utf8,${encodeURIComponent(optimizedSvg)}`;
  }, [optimizedSvg]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(optimizedSvg);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyDataUri = () => {
    navigator.clipboard.writeText(dataUri);
    setCopiedDataUri(true);
    setTimeout(() => setCopiedDataUri(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized-${activeBlueprintId || "vector"}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. CURATED BLUEPRINTS (Spacious 3-Column Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-400">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                Curated SVG Blueprints
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                Sample vector assets exported from Figma, Adobe Illustrator, and web icon libraries
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-bold text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/25 uppercase tracking-wider">
            6 Ready Blueprints
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SVG_BLUEPRINTS.map((bp) => {
            const isActive = activeBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => applyBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden",
                  isActive
                    ? "bg-lime-500/15 border-lime-400/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-400/30"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/40 hover:bg-white/[0.04]"
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white group-hover:text-lime-300 transition-colors">
                      {bp.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 whitespace-nowrap shrink-0 group-hover:border-lime-500/30 group-hover:text-lime-300">
                      {bp.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {bp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-3 mt-3 border-t border-white/5">
                  <span className="text-lime-400 font-bold uppercase tracking-wider">
                    Click to Test
                  </span>
                  <span className="text-zinc-400 font-medium">Vector XML</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DUAL-PANE OPTIMIZER STUDIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Raw Markup Input & Rules */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-200">
                Raw SVG Markup
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Size: <strong className="text-zinc-200">{rawBytes} bytes</strong>
              </span>
            </div>

            <textarea
              value={rawSvg}
              onChange={(e) => {
                setRawSvg(e.target.value);
                setActiveBlueprintId("");
              }}
              rows={8}
              placeholder="<svg ...> ... </svg>"
              className="w-full p-4 rounded-2xl bg-black/70 border border-white/10 text-lime-300/90 text-xs font-mono focus:outline-none focus:border-lime-500/40 leading-relaxed resize-none custom-scrollbar shadow-inner"
            />

            {/* Optimization Checkbox Rules */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                Optimization Rules
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStripComments(!stripComments)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer",
                    stripComments
                      ? "bg-lime-500/15 border-lime-400/40 text-lime-300"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    stripComments ? "bg-lime-400 border-lime-400 text-black" : "border-zinc-600"
                  )}>
                    {stripComments && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Strip Comments</span>
                    <span className="text-[10px] text-zinc-500 block">Remove &lt;!-- ... --&gt;</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStripDimensions(!stripDimensions)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer",
                    stripDimensions
                      ? "bg-lime-500/15 border-lime-400/40 text-lime-300"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    stripDimensions ? "bg-lime-400 border-lime-400 text-black" : "border-zinc-600"
                  )}>
                    {stripDimensions && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Responsive viewBox</span>
                    <span className="text-[10px] text-zinc-500 block">Strip width / height</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStripMetadata(!stripMetadata)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer",
                    stripMetadata
                      ? "bg-lime-500/15 border-lime-400/40 text-lime-300"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    stripMetadata ? "bg-lime-400 border-lime-400 text-black" : "border-zinc-600"
                  )}>
                    {stripMetadata && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Strip Metadata & IDs</span>
                    <span className="text-[10px] text-zinc-500 block">Clean Figma & Adobe tags</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStripEmptyGroups(!stripEmptyGroups)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer",
                    stripEmptyGroups
                      ? "bg-lime-500/15 border-lime-400/40 text-lime-300"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    stripEmptyGroups ? "bg-lime-400 border-lime-400 text-black" : "border-zinc-600"
                  )}>
                    {stripEmptyGroups && <Check size={11} strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Remove Empty Groups</span>
                    <span className="text-[10px] text-zinc-500 block">Clean empty &lt;g&gt; containers</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>SVGO Architecture</span>
            <span className="text-lime-400 font-bold">100% In-Browser</span>
          </div>
        </div>

        {/* Right Column: Live Visual Canvas & Clean Code */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header with Byte Savings Meter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-lime-400">
                  Optimized Output
                </span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <TrendingDown size={13} />
                  {savingsPct}% Saved ({rawBytes}B → {optBytes}B)
                </span>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewTab("render")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    previewTab === "render"
                      ? "bg-lime-500/20 text-lime-300 border border-lime-400/40"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Eye size={12} />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("code")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    previewTab === "code"
                      ? "bg-lime-500/20 text-lime-300 border border-lime-400/40"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Code2 size={12} />
                  <span>Markup</span>
                </button>
              </div>
            </div>

            {/* Display Area: Live Canvas vs Code */}
            {previewTab === "render" ? (
              <div className="w-full min-h-[260px] max-h-[340px] rounded-2xl bg-black/80 border border-white/10 p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                {/* Subtle Grid Backdrop for Vector Alignment */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div 
                  className="max-w-[200px] max-h-[200px] flex items-center justify-center relative z-10 drop-shadow-[0_0_20px_rgba(132,204,22,0.2)]"
                  dangerouslySetInnerHTML={{ __html: optimizedSvg }}
                />

                <span className="text-[10px] text-zinc-500 font-mono mt-4 relative z-10">
                  Live Vector Render Preview
                </span>
              </div>
            ) : (
              <pre className="w-full min-h-[260px] max-h-[340px] rounded-2xl bg-black/80 border border-white/10 p-5 font-mono text-xs text-lime-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner custom-scrollbar selection:bg-lime-500/30 selection:text-lime-200">
                {optimizedSvg}
              </pre>
            )}
          </div>

          {/* Action Center Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleCopyDataUri}
              className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedDataUri ? <Check size={13} className="text-lime-400" /> : <Copy size={13} />}
              <span>{copiedDataUri ? "Copied Data URI!" : "Copy Data URI"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download .svg</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className={cn(
                  "py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm",
                  copiedCode
                    ? "bg-emerald-500 text-black border border-emerald-400"
                    : "bg-lime-500 hover:bg-lime-400 text-black border border-lime-400 hover:scale-[1.01]"
                )}
              >
                {copiedCode ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                <span>{copiedCode ? "Copied SVG!" : "Copy Clean SVG"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Laser Divider Horizon Bridge */}
      <ToolLaserDivider primaryHex="#84cc16" />

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="SVG Optimizer"
        title="Cleaned Vector SVG Markup"
        content={optimizedSvg}
        downloadAction={handleDownload}
        onCopy={handleCopyCode}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="svg-optimizer" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="svg-optimizer" />
    </div>
  );
}
