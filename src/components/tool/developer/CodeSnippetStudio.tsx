"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Download,
  Code2,
  Edit3,
  Sliders,
  Palette,
  Maximize2,
  Eye,
  RefreshCw,
  FileCode,
  Laptop,
  CheckCircle2,
  Share2,
  Type,
  Square,
  Layers,
  ArrowRight,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// THEMES & STYLING DEFINITIONS (100% Plain English Labels)
// ============================================================================

export type ThemeId =
  | "obsidian-cosmic"
  | "tokyo-night"
  | "dracula"
  | "one-dark"
  | "synthwave"
  | "monokai"
  | "cyberpunk"
  | "nord"
  | "emerald"
  | "sunset";

export type BackgroundId =
  | "cosmic-nebula"
  | "cyber-neon"
  | "sunset-blaze"
  | "emerald-aurora"
  | "midnight-carbon"
  | "studio-spotlight"
  | "tech-grid"
  | "transparent";

export type WindowStyle = "mac" | "windows" | "clean";
export type PaddingSize = "compact" | "balanced" | "spacious" | "studio";
export type FontSize = "small" | "medium" | "large" | "xlarge";
export type ShadowDepth = "subtle" | "balanced" | "dramatic" | "none";
export type FontFamily = "jetbrains" | "fira" | "source" | "system";

interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  windowBg: string;
  borderColor: string;
  headerBg: string;
  colors: {
    text: string;
    keyword: string;
    string: string;
    function: string;
    number: string;
    comment: string;
    type: string;
    operator: string;
    boolean: string;
    punctuation: string;
    lineNumber: string;
  };
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  "obsidian-cosmic": {
    id: "obsidian-cosmic",
    name: "Obsidian Glow",
    badge: "SIGNATURE",
    windowBg: "#0b0f1d",
    borderColor: "rgba(139, 92, 246, 0.35)",
    headerBg: "#080b15",
    colors: {
      text: "#e2e8f0",
      keyword: "#c084fc",
      string: "#38bdf8",
      function: "#818cf8",
      number: "#fb923c",
      comment: "#64748b",
      type: "#f472b6",
      operator: "#e2e8f0",
      boolean: "#f87171",
      punctuation: "#94a3b8",
      lineNumber: "#475569",
    },
  },
  "tokyo-night": {
    id: "tokyo-night",
    name: "Tokyo Night",
    badge: "POPULAR",
    windowBg: "#1a1b26",
    borderColor: "rgba(122, 162, 247, 0.3)",
    headerBg: "#16161e",
    colors: {
      text: "#a9b1d6",
      keyword: "#bb9af7",
      string: "#9ece6a",
      function: "#7aa2f7",
      number: "#ff9e64",
      comment: "#565f89",
      type: "#2ac3de",
      operator: "#89ddff",
      boolean: "#f7768e",
      punctuation: "#c0caf5",
      lineNumber: "#444b6a",
    },
  },
  dracula: {
    id: "dracula",
    name: "Dracula Purple",
    badge: "CLASSIC",
    windowBg: "#282a36",
    borderColor: "rgba(189, 147, 249, 0.3)",
    headerBg: "#21222c",
    colors: {
      text: "#f8f8f2",
      keyword: "#ff79c6",
      string: "#f1fa8c",
      function: "#50fa7b",
      number: "#bd93f9",
      comment: "#6272a4",
      type: "#8be9fd",
      operator: "#ff79c6",
      boolean: "#bd93f9",
      punctuation: "#f8f8f2",
      lineNumber: "#6272a4",
    },
  },
  "one-dark": {
    id: "one-dark",
    name: "One Dark",
    badge: "CLEAN",
    windowBg: "#21252b",
    borderColor: "rgba(97, 175, 239, 0.25)",
    headerBg: "#1b1d23",
    colors: {
      text: "#abb2bf",
      keyword: "#c678dd",
      string: "#98c379",
      function: "#61afef",
      number: "#d19a66",
      comment: "#5c6370",
      type: "#e5c07b",
      operator: "#56b6c2",
      boolean: "#e06c75",
      punctuation: "#abb2bf",
      lineNumber: "#4b5263",
    },
  },
  synthwave: {
    id: "synthwave",
    name: "Synthwave 80s",
    badge: "RETRO",
    windowBg: "#262335",
    borderColor: "rgba(255, 126, 219, 0.4)",
    headerBg: "#1f1d2b",
    colors: {
      text: "#fede5d",
      keyword: "#ff7edb",
      string: "#36f9f6",
      function: "#fe4450",
      number: "#f97e72",
      comment: "#848bbd",
      type: "#72f1b8",
      operator: "#fede5d",
      boolean: "#fe4450",
      punctuation: "#fede5d",
      lineNumber: "#5c5773",
    },
  },
  monokai: {
    id: "monokai",
    name: "Monokai Warm",
    badge: "VIBRANT",
    windowBg: "#272822",
    borderColor: "rgba(166, 226, 46, 0.3)",
    headerBg: "#1e1f1c",
    colors: {
      text: "#f8f8f2",
      keyword: "#f92672",
      string: "#e6db74",
      function: "#a6e22e",
      number: "#ae81ff",
      comment: "#75715e",
      type: "#66d9ef",
      operator: "#f92672",
      boolean: "#ae81ff",
      punctuation: "#f8f8f2",
      lineNumber: "#5c5b56",
    },
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    badge: "NEON",
    windowBg: "#100e23",
    borderColor: "rgba(0, 255, 204, 0.45)",
    headerBg: "#090715",
    colors: {
      text: "#00ffcc",
      keyword: "#ff007f",
      string: "#ffe600",
      function: "#00bfff",
      number: "#ff5500",
      comment: "#6b5b95",
      type: "#00ffcc",
      operator: "#ff007f",
      boolean: "#ff5500",
      punctuation: "#ffe600",
      lineNumber: "#493d69",
    },
  },
  nord: {
    id: "nord",
    name: "Nord Frost",
    badge: "SUBTLE",
    windowBg: "#2e3440",
    borderColor: "rgba(136, 192, 208, 0.3)",
    headerBg: "#242933",
    colors: {
      text: "#d8dee9",
      keyword: "#81a1c1",
      string: "#a3be8c",
      function: "#88c0d0",
      number: "#b48ead",
      comment: "#4c566a",
      type: "#8fbcbb",
      operator: "#81a1c1",
      boolean: "#bf616a",
      punctuation: "#eceff4",
      lineNumber: "#4c566a",
    },
  },
  emerald: {
    id: "emerald",
    name: "Emerald Mint",
    badge: "FRESH",
    windowBg: "#081c15",
    borderColor: "rgba(52, 211, 153, 0.35)",
    headerBg: "#05130e",
    colors: {
      text: "#d1fae5",
      keyword: "#34d399",
      string: "#a7f3d0",
      function: "#6ee7b7",
      number: "#fcd34d",
      comment: "#166534",
      type: "#10b981",
      operator: "#6ee7b7",
      boolean: "#f87171",
      punctuation: "#d1fae5",
      lineNumber: "#14532d",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset Velvet",
    badge: "WARM",
    windowBg: "#200e1b",
    borderColor: "rgba(251, 146, 60, 0.35)",
    headerBg: "#170a13",
    colors: {
      text: "#fed7aa",
      keyword: "#f43f5e",
      string: "#fb923c",
      function: "#e879f9",
      number: "#facc15",
      comment: "#703a55",
      type: "#f97316",
      operator: "#f43f5e",
      boolean: "#f43f5e",
      punctuation: "#fed7aa",
      lineNumber: "#5f2c45",
    },
  },
};

const BACKGROUNDS: { id: BackgroundId; name: string; class: string; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }[] = [
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula",
    class: "bg-gradient-to-br from-[#070914] via-[#10142f] to-[#04060d]",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#080a18");
      g.addColorStop(0.5, "#13193a");
      g.addColorStop(1, "#05070f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Soft purple and cyan ambient glow
      const g1 = ctx.createRadialGradient(w * 0.25, h * 0.2, 10, w * 0.25, h * 0.2, w * 0.6);
      g1.addColorStop(0, "rgba(139, 92, 246, 0.35)");
      g1.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.8, h * 0.8, 10, w * 0.8, h * 0.8, w * 0.6);
      g2.addColorStop(0, "rgba(6, 182, 212, 0.3)");
      g2.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    class: "bg-gradient-to-br from-[#1c082e] via-[#091533] to-[#041d33]",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#1f0933");
      g.addColorStop(0.5, "#0b1738");
      g.addColorStop(1, "#031d30");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const g1 = ctx.createRadialGradient(w * 0.2, h * 0.8, 10, w * 0.2, h * 0.8, w * 0.55);
      g1.addColorStop(0, "rgba(236, 72, 153, 0.35)");
      g1.addColorStop(1, "rgba(236, 72, 153, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "sunset-blaze",
    name: "Sunset Horizon",
    class: "bg-gradient-to-br from-[#2a0b22] via-[#24133b] to-[#0d0a21]",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#330e2a");
      g.addColorStop(0.5, "#25123d");
      g.addColorStop(1, "#0b0920");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const g1 = ctx.createRadialGradient(w * 0.75, h * 0.25, 10, w * 0.75, h * 0.25, w * 0.55);
      g1.addColorStop(0, "rgba(249, 115, 22, 0.4)");
      g1.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "emerald-aurora",
    name: "Mint Aurora",
    class: "bg-gradient-to-br from-[#041a16] via-[#082b20] to-[#04120f]",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#051e19");
      g.addColorStop(0.5, "#0a3326");
      g.addColorStop(1, "#031410");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const g1 = ctx.createRadialGradient(w * 0.5, h * 0.3, 10, w * 0.5, h * 0.3, w * 0.55);
      g1.addColorStop(0, "rgba(16, 185, 129, 0.35)");
      g1.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "midnight-carbon",
    name: "Midnight Carbon",
    class: "bg-gradient-to-br from-[#0c0d12] via-[#14161f] to-[#090a0f]",
    draw: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0c0d12");
      g.addColorStop(0.5, "#141720");
      g.addColorStop(1, "#08090d");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "studio-spotlight",
    name: "Studio Spotlight",
    class: "bg-radial from-[#1e293b] via-[#0f172a] to-[#020617]",
    draw: (ctx, w, h) => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.6);
      g.addColorStop(0, "#1e293b");
      g.addColorStop(1, "#020617");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  },
  {
    id: "tech-grid",
    name: "Clean Grid",
    class: "bg-[#090d16] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]",
    draw: (ctx, w, h) => {
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    },
  },
  {
    id: "transparent",
    name: "Transparent",
    class: "bg-zinc-950/80 border border-dashed border-zinc-700",
    draw: (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
    },
  },
];

// ============================================================================
// STARTER SAMPLE SNIPPETS (100% Practical & Ready to Try)
// ============================================================================

interface SampleSnippet {
  id: string;
  name: string;
  filename: string;
  language: string;
  code: string;
}

const SAMPLE_SNIPPETS: SampleSnippet[] = [
  {
    id: "react-hook",
    name: "React Hook",
    filename: "useDebounce.ts",
    language: "typescript",
    code: `import { useState, useEffect } from "react";

// Hook that delays updating value until user stops typing
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}`,
  },
  {
    id: "python-api",
    name: "Python API",
    filename: "server.py",
    language: "python",
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Exismic Core API")

class UserProfile(BaseModel):
    username: str
    credits: int
    is_pro: bool = False

@app.get("/api/v1/user/{user_id}", response_model=UserProfile)
async def get_user_status(user_id: str):
    user = await database.find_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user`,
  },
  {
    id: "sql-query",
    name: "Database Query",
    filename: "monthly_revenue.sql",
    language: "sql",
    code: `-- Calculate monthly revenue growth and active subscribers
WITH monthly_metrics AS (
  SELECT 
    DATE_TRUNC('month', created_at) AS billing_month,
    COUNT(DISTINCT user_id) AS total_subscribers,
    SUM(amount_cents) / 100.0 AS gross_revenue
  FROM subscriptions
  WHERE status = 'active'
  GROUP BY 1
)
SELECT 
  billing_month,
  total_subscribers,
  gross_revenue,
  LAG(gross_revenue, 1) OVER (ORDER BY billing_month) AS previous_month
FROM monthly_metrics
ORDER BY billing_month DESC;`,
  },
  {
    id: "tailwind-card",
    name: "Glow Card Styling",
    filename: "CardGlow.tsx",
    language: "typescript",
    code: `export function GlowingCard({ title, children }: CardProps) {
  return (
    <div className="relative group rounded-3xl p-6 bg-black/60 border border-white/10 backdrop-blur-2xl">
      {/* Outer ambient glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500" />
      
      <div className="relative z-10 space-y-3">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-zinc-400">{children}</p>
      </div>
    </div>
  );
}`,
  },
  {
    id: "rust-worker",
    name: "Rust Worker",
    filename: "worker.rs",
    language: "rust",
    code: `use tokio::sync::mpsc;

pub struct JobDispatcher {
    sender: mpsc::Sender<JobTask>,
}

impl JobDispatcher {
    pub async fn dispatch(&self, task: JobTask) -> Result<(), String> {
        println!("🚀 Processing task ID: {}", task.id);
        
        match self.sender.send(task).await {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Worker queue full: {}", e)),
        }
    }
}`,
  },
];

// ============================================================================
// LIGHTWEIGHT SYNTAX TOKENIZER (Fast, Zero Dependencies, Zero Lag)
// ============================================================================

interface Token {
  type: keyof ThemeConfig["colors"];
  value: string;
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  const rules: { type: keyof ThemeConfig["colors"]; regex: RegExp }[] = [
    { type: "comment", regex: /^(\/\/.*|#.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)/ },
    { type: "string", regex: /^("[^"]*"|'[^']*'|`[^`]*`)/ },
    {
      type: "keyword",
      regex: /^(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|def|elif|try|except|finally|public|private|fn|impl|struct|SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|LIMIT|INSERT|UPDATE|DELETE|interface|type|enum|new|this|self|case|switch|break|continue|package|use|mut)\b/,
    },
    { type: "boolean", regex: /^(true|false|null|undefined|None|nil)\b/ },
    { type: "number", regex: /^(\b\d+(\.\d+)?\b)/ },
    { type: "function", regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/ },
    {
      type: "type",
      regex: /^(string|number|boolean|any|void|Promise|Record|Array|int|float|str|dict|list|bool|Result|Option|T|Props)\b/,
    },
    { type: "operator", regex: /^(=>|===|!==|==|!=|<=|>=|&&|\|\||\+|\-|\*|\/|%|=|&|\||\^|\?|:|<|>)/ },
    { type: "punctuation", regex: /^([{}()\[\];,\.])/ },
    { type: "text", regex: /^\s+/ },
    { type: "text", regex: /^[^\s"'`#\/=><&|+\-*%^?:;,.{}()\[\]0-9]+/ },
    { type: "text", regex: /^./ },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const rule of rules) {
      const match = remaining.match(rule.regex);
      if (match) {
        tokens.push({ type: rule.type, value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "text", value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

// ============================================================================
// MAIN COMPONENT: Aesthetic Code Snippet Studio
// ============================================================================

export default function CodeSnippetStudio() {
  // Studio Options
  const [code, setCode] = useState<string>(SAMPLE_SNIPPETS[0].code);
  const [filename, setFilename] = useState<string>(SAMPLE_SNIPPETS[0].filename);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("obsidian-cosmic");
  const [selectedBg, setSelectedBg] = useState<BackgroundId>("cosmic-nebula");
  const [windowStyle, setWindowStyle] = useState<WindowStyle>("mac");
  const [paddingSize, setPaddingSize] = useState<PaddingSize>("balanced");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [fontFamily, setFontFamily] = useState<FontFamily>("jetbrains");
  const [shadowDepth, setShadowDepth] = useState<ShadowDepth>("dramatic");
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"preview" | "code" | "style">("preview");

  // Export States
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);

  // Hidden offscreen canvas for rendering high-DPI output
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement | null>(null);

  const activeTheme = THEMES[selectedTheme];
  const activeBg = BACKGROUNDS.find((b) => b.id === selectedBg) || BACKGROUNDS[0];

  // Quick helper to load template
  const handleLoadSample = (sample: SampleSnippet) => {
    setCode(sample.code);
    setFilename(sample.filename);
  };

  // Allow pressing Tab inside code textarea to insert 2 spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      setCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Convert font size preset to numeric pixels
  const getFontSizePx = useCallback(() => {
    switch (fontSize) {
      case "small":
        return 13;
      case "medium":
        return 15;
      case "large":
        return 17;
      case "xlarge":
        return 20;
    }
  }, [fontSize]);

  // Convert padding preset to numeric pixels
  const getPaddingPx = useCallback(() => {
    switch (paddingSize) {
      case "compact":
        return 28;
      case "balanced":
        return 48;
      case "spacious":
        return 72;
      case "studio":
        return 96;
    }
  }, [paddingSize]);

  // Convert font family to CSS string
  const getFontFamilyCss = useCallback(() => {
    switch (fontFamily) {
      case "jetbrains":
        return '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      case "fira":
        return '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      case "source":
        return '"Source Code Pro", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      case "system":
        return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
    }
  }, [fontFamily]);

  // ============================================================================
  // HIGH-DPI CANVAS RENDER ENGINE (Generates 2X Crisp PNG)
  // ============================================================================
  const renderSnippetToCanvas = useCallback((): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const scale = 2; // 2x Retina high-resolution render
      const fontPx = getFontSizePx();
      const outerPad = getPaddingPx();
      const fontCss = `${fontPx}px ${getFontFamilyCss()}`;
      const lineHeight = Math.round(fontPx * 1.6);
      const lines = code.split("\n");

      // Offscreen canvas for text measurements
      const measureCanvas = document.createElement("canvas");
      const measureCtx = measureCanvas.getContext("2d")!;
      measureCtx.font = fontCss;

      // Calculate max line width
      let maxLineWidth = 0;
      lines.forEach((line) => {
        const width = measureCtx.measureText(line).width;
        if (width > maxLineWidth) maxLineWidth = width;
      });

      // Window header dimensions
      const headerHeight = windowStyle === "clean" ? 20 : 44;
      const windowInnerPadX = 24;
      const windowInnerPadY = 20;

      // Line number column width
      const maxLineDigits = String(lines.length).length;
      const lineNumberGutter = showLineNumbers ? measureCtx.measureText("9".repeat(maxLineDigits + 2)).width : 0;

      // Window card dimensions
      const minWindowWidth = 420;
      const windowWidth = Math.max(minWindowWidth, maxLineWidth + windowInnerPadX * 2 + lineNumberGutter + 40);
      const windowHeight = headerHeight + windowInnerPadY * 2 + lines.length * lineHeight;

      // Total canvas dimensions
      const totalWidth = windowWidth + outerPad * 2;
      const totalHeight = windowHeight + outerPad * 2 + (showWatermark ? 24 : 0);

      // Create target canvas
      const canvas = hiddenCanvasRef.current || document.createElement("canvas");
      canvas.width = totalWidth * scale;
      canvas.height = totalHeight * scale;

      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);

      // 1. Draw Background
      activeBg.draw(ctx, totalWidth, totalHeight);

      // 2. Draw Shadow under Window Card
      const cardX = outerPad;
      const cardY = outerPad;
      const cornerRadius = 18;

      if (shadowDepth !== "none") {
        ctx.save();
        const blur = shadowDepth === "dramatic" ? 50 : shadowDepth === "balanced" ? 30 : 15;
        const shadowY = shadowDepth === "dramatic" ? 24 : shadowDepth === "balanced" ? 14 : 6;
        ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
        ctx.shadowBlur = blur;
        ctx.shadowOffsetY = shadowY;
        ctx.fillStyle = activeTheme.windowBg;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, windowWidth, windowHeight, cornerRadius);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw Window Card Base & Border
      ctx.save();
      ctx.fillStyle = activeTheme.windowBg;
      ctx.strokeStyle = activeTheme.borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, windowWidth, windowHeight, cornerRadius);
      ctx.fill();
      ctx.stroke();

      // 4. Draw Window Header
      if (windowStyle !== "clean") {
        // Subtle header divider
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.beginPath();
        ctx.moveTo(cardX, cardY + headerHeight);
        ctx.lineTo(cardX + windowWidth, cardY + headerHeight);
        ctx.stroke();

        // Mac Traffic Lights
        if (windowStyle === "mac") {
          const btnRadius = 6;
          const btnY = cardY + headerHeight / 2;
          const btnStartX = cardX + 18;
          const btnGap = 20;

          // Red (Close)
          ctx.fillStyle = "#ff5f56";
          ctx.beginPath();
          ctx.arc(btnStartX, btnY, btnRadius, 0, Math.PI * 2);
          ctx.fill();

          // Yellow (Minimize)
          ctx.fillStyle = "#ffbd2e";
          ctx.beginPath();
          ctx.arc(btnStartX + btnGap, btnY, btnRadius, 0, Math.PI * 2);
          ctx.fill();

          // Green (Expand)
          ctx.fillStyle = "#27c93f";
          ctx.beginPath();
          ctx.arc(btnStartX + btnGap * 2, btnY, btnRadius, 0, Math.PI * 2);
          ctx.fill();
        } else if (windowStyle === "windows") {
          // Windows 11 icons on the right
          const iconY = cardY + headerHeight / 2;
          const rightX = cardX + windowWidth - 20;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1.2;

          // Close (X)
          ctx.beginPath();
          ctx.moveTo(rightX - 10, iconY - 4);
          ctx.lineTo(rightX - 2, iconY + 4);
          ctx.moveTo(rightX - 2, iconY - 4);
          ctx.lineTo(rightX - 10, iconY + 4);
          ctx.stroke();

          // Maximize (Square)
          ctx.strokeRect(rightX - 28, iconY - 4, 8, 8);

          // Minimize (Line)
          ctx.beginPath();
          ctx.moveTo(rightX - 44, iconY);
          ctx.lineTo(rightX - 36, iconY);
          ctx.stroke();
        }

        // Title Filename in Header Center
        if (filename.trim()) {
          ctx.font = `600 12px ${getFontFamilyCss()}`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
          ctx.textAlign = "center";
          ctx.fillText(filename.trim(), cardX + windowWidth / 2, cardY + headerHeight / 2 + 4);
          ctx.textAlign = "left";
        }
      }

      // 5. Draw Code Lines & Syntax Tokens
      const codeStartX = cardX + windowInnerPadX;
      const codeStartY = cardY + headerHeight + windowInnerPadY + fontPx;

      ctx.font = fontCss;

      lines.forEach((lineText, lineIdx) => {
        const lineY = codeStartY + lineIdx * lineHeight;

        // Draw Line Number
        if (showLineNumbers) {
          ctx.fillStyle = activeTheme.colors.lineNumber;
          ctx.textAlign = "right";
          ctx.fillText(String(lineIdx + 1), codeStartX + lineNumberGutter - 12, lineY);
          ctx.textAlign = "left";
        }

        // Tokenize and Draw Colored Tokens
        const tokens = tokenizeLine(lineText);
        let tokenX = codeStartX + lineNumberGutter;

        tokens.forEach((token) => {
          ctx.fillStyle = activeTheme.colors[token.type] || activeTheme.colors.text;
          ctx.fillText(token.value, tokenX, lineY);
          tokenX += ctx.measureText(token.value).width;
        });
      });

      // 6. Optional Watermark Badge
      if (showWatermark) {
        ctx.font = `500 10px sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.textAlign = "right";
        ctx.fillText("Made with Exismic", totalWidth - outerPad, totalHeight - 10);
      }

      ctx.restore();
      resolve(canvas);
    });
  }, [
    code,
    filename,
    activeTheme,
    activeBg,
    windowStyle,
    paddingSize,
    fontSize,
    fontFamily,
    shadowDepth,
    showLineNumbers,
    showWatermark,
    getFontSizePx,
    getPaddingPx,
    getFontFamilyCss,
  ]);

  // ============================================================================
  // EXPORT ACTIONS (1-Click Copy, Download PNG, Download SVG)
  // ============================================================================

  // 1. Copy Image to Clipboard
  const handleCopyImage = async () => {
    setIsCopying(true);
    setCopiedSuccess(false);

    try {
      const canvas = await renderSnippetToCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Could not render image");

        // Try native Clipboard API for image blobs
        if (navigator.clipboard && typeof window.ClipboardItem !== "undefined") {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
            setCopiedSuccess(true);
            setTimeout(() => setCopiedSuccess(false), 3000);

            // Also keep local URL for pipeline chaining
            const url = URL.createObjectURL(blob);
            setExportedImageUrl(url);
            setIsCopying(false);
            return;
          } catch {
            // Fallback if browser blocks image write
          }
        }

        // Fallback: copy code text and download image
        await navigator.clipboard.writeText(code);
        const url = URL.createObjectURL(blob);
        setExportedImageUrl(url);
        const link = document.createElement("a");
        link.download = `${filename ? filename.replace(/\.[^/.]+$/, "") : "code-snippet"}.png`;
        link.href = url;
        link.click();
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 3000);
        setIsCopying(false);
      }, "image/png");
    } catch {
      setIsCopying(false);
    }
  };

  // 2. Download High-Res PNG
  const handleDownloadPng = async () => {
    setIsDownloading(true);
    try {
      const canvas = await renderSnippetToCanvas();
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setExportedImageUrl(url);
        const link = document.createElement("a");
        const cleanName = filename ? filename.replace(/\.[^/.]+$/, "") : "code-snippet";
        link.download = `${cleanName}.png`;
        link.href = url;
        link.click();
        setIsDownloading(false);
      }, "image/png");
    } catch {
      setIsDownloading(false);
    }
  };

  // 3. Download Vector SVG
  const handleDownloadSvg = () => {
    const lines = code.split("\n");
    const fontPx = getFontSizePx();
    const lineHeight = Math.round(fontPx * 1.6);
    const outerPad = getPaddingPx();
    const maxLineLength = Math.max(...lines.map((l) => l.length), 20);
    const windowWidth = Math.max(450, maxLineLength * (fontPx * 0.62) + 60);
    const headerH = windowStyle === "clean" ? 20 : 44;
    const windowHeight = headerH + lines.length * lineHeight + 40;
    const totalW = windowWidth + outerPad * 2;
    const totalH = windowHeight + outerPad * 2;

    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const svgLines = lines
      .map((line, idx) => {
        const y = headerH + 30 + idx * lineHeight;
        const tokens = tokenizeLine(line);
        const xOffset = showLineNumbers ? 44 : 20;

        const tokenSpans = tokens
          .map((t) => {
            const color = activeTheme.colors[t.type] || activeTheme.colors.text;
            const escaped = escapeXml(t.value);
            return `<tspan fill="${color}">${escaped}</tspan>`;
          })
          .join("");

        const lineNumberSpan = showLineNumbers
          ? `<tspan fill="${activeTheme.colors.lineNumber}" text-anchor="end" x="${outerPad + 30}">${idx + 1}</tspan>`
          : "";

        const codeSpan = `<tspan x="${outerPad + xOffset}">${tokenSpans}</tspan>`;
        return `<text y="${outerPad + y}" class="code-line" xml:space="preserve">${lineNumberSpan}${codeSpan}</text>`;
      })
      .join("\n  ");

    // Clean font family for CSS without conflicting double-quotes
    const cleanFontFamily = fontFamily === "jetbrains"
      ? "'JetBrains Mono', monospace"
      : fontFamily === "fira"
      ? "'Fira Code', monospace"
      : fontFamily === "source"
      ? "'Source Code Pro', monospace"
      : "ui-monospace, monospace";

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" xml:space="preserve">
  <defs>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
    <linearGradient id="bgCosmic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080a18"/>
      <stop offset="50%" stop-color="#13193a"/>
      <stop offset="100%" stop-color="#05070f"/>
    </linearGradient>
    <linearGradient id="bgCyber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f0933"/>
      <stop offset="50%" stop-color="#0b1738"/>
      <stop offset="100%" stop-color="#031d30"/>
    </linearGradient>
    <linearGradient id="bgSunset" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#330e2a"/>
      <stop offset="50%" stop-color="#25123d"/>
      <stop offset="100%" stop-color="#0b0920"/>
    </linearGradient>
    <linearGradient id="bgEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#051e19"/>
      <stop offset="50%" stop-color="#0a3326"/>
      <stop offset="100%" stop-color="#031410"/>
    </linearGradient>
    <linearGradient id="bgCarbon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c0d12"/>
      <stop offset="50%" stop-color="#141720"/>
      <stop offset="100%" stop-color="#08090d"/>
    </linearGradient>
    <radialGradient id="bgSpotlight" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <style>
    .code-line {
      font-family: ${cleanFontFamily};
      font-size: ${fontPx}px;
      white-space: pre;
    }
    .window-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      font-weight: 600;
      fill: rgba(255, 255, 255, 0.55);
    }
  </style>
  ${
    selectedBg === "transparent"
      ? ""
      : selectedBg === "cyber-neon"
      ? `<rect width="100%" height="100%" fill="url(#bgCyber)"/>`
      : selectedBg === "sunset-blaze"
      ? `<rect width="100%" height="100%" fill="url(#bgSunset)"/>`
      : selectedBg === "emerald-aurora"
      ? `<rect width="100%" height="100%" fill="url(#bgEmerald)"/>`
      : selectedBg === "midnight-carbon"
      ? `<rect width="100%" height="100%" fill="url(#bgCarbon)"/>`
      : selectedBg === "studio-spotlight"
      ? `<rect width="100%" height="100%" fill="url(#bgSpotlight)"/>`
      : `<rect width="100%" height="100%" fill="url(#bgCosmic)"/>`
  }
  <rect x="${outerPad}" y="${outerPad}" width="${windowWidth}" height="${windowHeight}" rx="18" fill="${activeTheme.windowBg}" stroke="${activeTheme.borderColor}" stroke-width="1" filter="${shadowDepth !== "none" ? "url(#cardShadow)" : "none"}"/>
  ${
    windowStyle === "mac"
      ? `
  <circle cx="${outerPad + 20}" cy="${outerPad + 22}" r="6" fill="#ff5f56"/>
  <circle cx="${outerPad + 40}" cy="${outerPad + 22}" r="6" fill="#ffbd2e"/>
  <circle cx="${outerPad + 60}" cy="${outerPad + 22}" r="6" fill="#27c93f"/>`
      : windowStyle === "windows"
      ? `
  <line x1="${outerPad + windowWidth - 44}" y1="${outerPad + 22}" x2="${outerPad + windowWidth - 36}" y2="${outerPad + 22}" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
  <rect x="${outerPad + windowWidth - 28}" y="${outerPad + 18}" width="8" height="8" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
  <line x1="${outerPad + windowWidth - 12}" y1="${outerPad + 18}" x2="${outerPad + windowWidth - 4}" y2="${outerPad + 26}" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
  <line x1="${outerPad + windowWidth - 4}" y1="${outerPad + 18}" x2="${outerPad + windowWidth - 12}" y2="${outerPad + 26}" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>`
      : ""
  }
  ${
    filename
      ? `<text x="${outerPad + windowWidth / 2}" y="${outerPad + 26}" text-anchor="middle" class="window-title">${escapeXml(filename)}</text>`
      : ""
  }
  ${svgLines}
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${filename ? filename.replace(/\.[^/.]+$/, "") : "code-snippet"}.svg`;
    link.href = url;
    link.click();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 sm:space-y-8 pb-24 lg:pb-0">
      {/* Hidden canvas for high-DPI retina PNG exports */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* =========================================================
          STARTER TEMPLATES BAR (Quick 1-Click Code Blueprints)
      ========================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-[#090d1a]/80 border border-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-2 shrink-0">
          <Terminal size={15} className="text-cyan-400 shrink-0" />
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Templates:</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
            5 Presets
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
          {SAMPLE_SNIPPETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className={cn(
                "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0",
                filename === sample.filename
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.04]"
              )}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          MOBILE VIEW SELECTOR (Visible on mobile/tablet)
      ========================================================== */}
      <div className="lg:hidden flex items-center p-1 rounded-xl bg-[#080c18] border border-white/[0.08] shadow-lg gap-1">
        <button
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0",
            mobileTab === "preview"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 shadow-sm font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Eye size={14} className="text-cyan-400 shrink-0" />
          <span className="truncate">Preview</span>
        </button>
        <button
          onClick={() => setMobileTab("code")}
          className={cn(
            "flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0",
            mobileTab === "code"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 shadow-sm font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Code2 size={14} className="text-cyan-400 shrink-0" />
          <span className="truncate">Editor</span>
        </button>
        <button
          onClick={() => setMobileTab("style")}
          className={cn(
            "flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0",
            mobileTab === "style"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 shadow-sm font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders size={14} className="text-cyan-400 shrink-0" />
          <span className="truncate">Styling</span>
        </button>
      </div>

      {/* =========================================================
          MAIN STUDIO GRID: CONTROLS & LIVE GLOWING PREVIEW
      ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: OPTIONS & CODE INPUT (5 COLS) */}
        <div className={cn("lg:col-span-5 space-y-5", mobileTab === "preview" ? "hidden lg:block" : "block")}>
          {/* 1. Code & Filename Input */}
          <div className={cn("p-4 sm:p-5 rounded-3xl bg-[#080b16]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-4", mobileTab === "style" ? "hidden lg:block" : "block")}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Code2 size={15} className="text-cyan-400" />
                <span>Code</span>
              </label>
            </div>

            {/* Filename Input */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">File Name</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. index.ts, app.py, query.sql"
                className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Code Textarea */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Your Code</label>
              <textarea
                ref={codeEditorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={10}
                placeholder="Paste or write your code here..."
                className="w-full p-3 sm:p-4 rounded-2xl bg-black/70 border border-white/10 text-zinc-200 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>
          </div>

          {/* 2. Visual Styling Options */}
          <div className={cn("p-4 sm:p-5 rounded-3xl bg-[#080b16]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-4", mobileTab === "code" ? "hidden lg:block" : "block")}>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-200 uppercase tracking-wider">
              <Sliders size={15} className="text-purple-400" />
              <span>Style</span>
            </div>

            {/* Color Theme Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      "p-2 sm:p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer",
                      selectedTheme === theme.id
                        ? "bg-purple-500/15 border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: theme.colors.keyword }}
                    />
                    <span className="text-xs font-medium text-zinc-200 truncate">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Backdrop Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Background</label>
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg.id)}
                    className={cn(
                      "p-2 sm:p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer",
                      selectedBg === bg.id
                        ? "bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10"
                    )}
                  >
                    <div className={cn("w-3.5 h-3.5 rounded-md border border-white/20 shrink-0", bg.class)} />
                    <span className="text-xs font-medium text-zinc-200 truncate">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Window Style Selector */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-zinc-300">Header:</span>
              <div className="grid grid-cols-3 gap-1 sm:flex sm:items-center sm:gap-1.5 w-full sm:w-auto">
                {(
                  [
                    { id: "mac", label: "Mac" },
                    { id: "windows", label: "Windows" },
                    { id: "clean", label: "Clean" },
                  ] as { id: WindowStyle; label: string }[]
                ).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setWindowStyle(style.id)}
                    className={cn(
                      "py-1.5 px-2 rounded-lg text-xs font-medium transition-all text-center cursor-pointer",
                      windowStyle === style.id
                        ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50"
                        : "text-zinc-400 hover:text-zinc-200 bg-white/[0.03]"
                    )}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing / Card Padding */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-zinc-300">Padding:</span>
              <div className="grid grid-cols-4 gap-1 sm:flex sm:items-center sm:gap-1 w-full sm:w-auto">
                {(
                  [
                    { id: "compact", label: "Compact" },
                    { id: "balanced", label: "Balanced" },
                    { id: "spacious", label: "Spacious" },
                    { id: "studio", label: "Studio" },
                  ] as { id: PaddingSize; label: string }[]
                ).map((pad) => (
                  <button
                    key={pad.id}
                    onClick={() => setPaddingSize(pad.id)}
                    className={cn(
                      "py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all text-center cursor-pointer",
                      paddingSize === pad.id
                        ? "bg-purple-500/25 text-purple-300 border border-purple-400/50"
                        : "text-zinc-400 hover:text-zinc-200 bg-white/[0.03]"
                    )}
                  >
                    {pad.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Line Numbers */}
            <div className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Text Size</label>
                <div className="grid grid-cols-4 gap-1">
                  {(["small", "medium", "large", "xlarge"] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={cn(
                        "py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer text-center",
                        fontSize === size
                          ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50"
                          : "text-zinc-400 hover:text-zinc-200 bg-white/[0.03]"
                      )}
                    >
                      {size.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Line Numbers</label>
                <button
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className={cn(
                    "w-full py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    showLineNumbers
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
                  )}
                >
                  {showLineNumbers ? <Check size={14} /> : null}
                  <span>{showLineNumbers ? "On" : "Off"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE CARD PREVIEW & EXPORT ACTIONS (7 COLS) */}
        <div className={cn("lg:col-span-7 space-y-5", mobileTab !== "preview" ? "hidden lg:block" : "block")}>
          {/* The Live Render Card Preview */}
          <div className="p-2 sm:p-5 rounded-3xl bg-[#060812]/95 border border-white/[0.08] backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-2.5 px-1 sm:px-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                <Eye size={15} className="text-cyan-400" />
                <span>Preview</span>
              </span>
            </div>

            {/* Container representing the selected background */}
            <div
              className={cn(
                "rounded-2xl flex items-center justify-center transition-all duration-300 overflow-x-auto shadow-inner w-full min-w-0 max-w-full",
                activeBg.class,
                paddingSize === "compact" && "p-2.5 sm:p-8",
                paddingSize === "balanced" && "p-3.5 sm:p-12",
                paddingSize === "spacious" && "p-5 sm:p-16",
                paddingSize === "studio" && "p-6 sm:p-20"
              )}
            >
              {/* Window Card */}
              <div
                className={cn(
                  "rounded-2xl border transition-all duration-300 w-full min-w-0 max-w-full overflow-hidden",
                  shadowDepth === "dramatic" && "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]",
                  shadowDepth === "balanced" && "shadow-[0_15px_35px_-10px_rgba(0,0,0,0.65)]",
                  shadowDepth === "subtle" && "shadow-lg",
                  shadowDepth === "none" && "shadow-none"
                )}
                style={{
                  backgroundColor: activeTheme.windowBg,
                  borderColor: activeTheme.borderColor,
                }}
              >
                {/* Window Header */}
                {windowStyle !== "clean" && (
                  <div
                    className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-white/[0.06]"
                    style={{ backgroundColor: activeTheme.headerBg }}
                  >
                    {/* Left Mac buttons */}
                    {windowStyle === "mac" ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f]" />
                      </div>
                    ) : (
                      <div className="w-6 sm:w-8" />
                    )}

                    {/* Centered Filename */}
                    {filename.trim() ? (
                      <span className="text-[11px] sm:text-xs font-mono font-medium text-zinc-300 tracking-wide select-none truncate max-w-[160px] sm:max-w-xs">
                        {filename.trim()}
                      </span>
                    ) : (
                      <div />
                    )}

                    {/* Right Windows controls or spacing */}
                    {windowStyle === "windows" ? (
                      <div className="flex items-center gap-2 sm:gap-3 text-zinc-400">
                        <div className="w-2 sm:w-2.5 h-[1.5px] bg-zinc-400" />
                        <Square size={8} />
                        <span className="text-xs font-bold leading-none">&times;</span>
                      </div>
                    ) : (
                      <div className="w-6 sm:w-8" />
                    )}
                  </div>
                )}

                {/* Code Body */}
                <div
                  className={cn(
                    "p-3 sm:p-5 font-mono leading-relaxed overflow-x-auto select-text",
                    fontSize === "small" && "text-xs",
                    fontSize === "medium" && "text-xs sm:text-sm",
                    fontSize === "large" && "text-sm sm:text-base",
                    fontSize === "xlarge" && "text-base sm:text-lg"
                  )}
                  style={{ fontFamily: getFontFamilyCss() }}
                >
                  {code.split("\n").map((line, lineIdx) => {
                    const tokens = tokenizeLine(line);
                    return (
                      <div key={lineIdx} className="table-row leading-relaxed">
                        {showLineNumbers && (
                          <span
                            className="table-cell pr-3 sm:pr-5 text-right select-none opacity-45"
                            style={{ color: activeTheme.colors.lineNumber }}
                          >
                            {lineIdx + 1}
                          </span>
                        )}
                        <span className="table-cell whitespace-pre">
                          {tokens.length === 0 ? (
                            <span>&nbsp;</span>
                          ) : (
                            tokens.map((token, tIdx) => (
                              <span
                                key={tIdx}
                                style={{
                                  color: activeTheme.colors[token.type] || activeTheme.colors.text,
                                }}
                              >
                                {token.value}
                              </span>
                            ))
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              PRIMARY EXPORT CONTROLS (COPY & DOWNLOAD)
          ========================================================== */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#080d1e] via-[#0c1329] to-[#080d1e] border border-white/[0.12] shadow-2xl space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
              {/* Primary Copy Button */}
              <button
                onClick={handleCopyImage}
                disabled={isCopying}
                className={cn(
                  "w-full sm:flex-1 py-3.5 sm:py-4 px-5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-95",
                  copiedSuccess
                    ? "bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                    : "bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                )}
              >
                {isCopying ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    <span>Copying...</span>
                  </>
                ) : copiedSuccess ? (
                  <>
                    <Check size={17} className="text-white" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={17} />
                    <span>Copy Image</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Download PNG Button */}
                <button
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="flex-1 sm:flex-initial py-3.5 sm:py-4 px-5 rounded-2xl font-bold text-sm bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white hover:text-cyan-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isDownloading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  <span>PNG</span>
                </button>

                {/* Download SVG Button */}
                <button
                  onClick={handleDownloadSvg}
                  className="flex-1 sm:flex-initial py-3.5 sm:py-4 px-4 rounded-2xl font-semibold text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download scalable vector graphic"
                >
                  <span>SVG</span>
                </button>
              </div>
            </div>

            {/* Optional Watermark Toggle & Status info */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs text-zinc-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 bg-black/40 border-white/20 cursor-pointer"
                />
                <span>Add Exismic watermark</span>
              </label>

              {copiedSuccess && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 size={13} />
                  <span>Copied!</span>
                </span>
              )}
            </div>
          </div>

          {/* Media Pipeline Bar Integration */}
          {exportedImageUrl && (
            <div className="pt-2">
              <MediaPipelineBar
                imageUrl={exportedImageUrl}
                imageName={`${filename ? filename.replace(/\.[^/.]+$/, "") : "code-snippet"}.png`}
                sourceToolId="code-snippet"
                sourceToolName="Code Snippet Studio"
                actions={["compressor", "converter", "resizer", "eraser"]}
              />
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM FLOATING ACTION BAR (1-Tap instant switch & download on phones) */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-2 rounded-2xl bg-[#090b14]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center gap-2">
        {mobileTab === "preview" ? (
          <button
            onClick={() => setMobileTab("code")}
            className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all truncate"
          >
            <Edit3 size={14} className="text-cyan-400 shrink-0" />
            <span className="truncate">Edit Code</span>
          </button>
        ) : (
          <button
            onClick={() => setMobileTab("preview")}
            className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all truncate"
          >
            <Eye size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate">View Preview</span>
          </button>
        )}

        <button
          onClick={handleCopyImage}
          disabled={isCopying}
          className={cn(
            "py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0 cursor-pointer",
            copiedSuccess
              ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 border-white/10"
          )}
          title="Copy Image to clipboard"
        >
          {copiedSuccess ? <Check size={14} className="text-white" /> : isCopying ? <RefreshCw size={14} className="animate-spin" /> : <Copy size={14} />}
          <span>{copiedSuccess ? "Copied" : "Copy"}</span>
        </button>

        <button
          onClick={handleDownloadPng}
          disabled={isDownloading}
          className="relative group overflow-hidden px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          {isDownloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
          <span>{isDownloading ? "..." : "PNG"}</span>
        </button>
      </div>
    </div>
  );
}
