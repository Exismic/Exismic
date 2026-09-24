"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Feather,
  PenTool,
  FileText,
  Mail,
  Layers,
  Send,
  Globe,
  Sliders,
  Copy,
  Download,
  Check,
  RotateCcw,
  Flame,
  ArrowRight,
  Shuffle,
  Share2,
  FileDown,
  BookOpen,
  Award,
  Coffee,
  Laugh,
  Target,
  Lightbulb,
  GraduationCap,
  Video,
  Split,
  Eye,
  Type,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { usePipedContent, setPipedContent } from "@/lib/tool-piping";
import { PipedBadge } from "@/components/tool/PipedBadge";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { ChatMarkdownRenderer } from "@/components/tool/ChatMarkdownRenderer";
import { useRouter } from "next/navigation";

// Content Formats
interface ContentFormat {
  id: string;
  name: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  samplePrompt: string;
}

const CONTENT_FORMATS: ContentFormat[] = [
  {
    id: "blog",
    name: "Blog Post",
    badge: "Articles & SEO",
    icon: FileText,
    placeholder: "Describe your blog post topic, target audience, and key sections to cover...",
    samplePrompt: "Write a comprehensive guide on 5 actionable ways remote engineers can improve deep focus and eliminate daily context switching.",
  },
  {
    id: "email",
    name: "Cold Email",
    badge: "Outreach & Sales",
    icon: Mail,
    placeholder: "Describe who you are emailing, your offer/message, and desired action...",
    samplePrompt: "Write a friendly, high-converting cold email to a tech podcast host proposing a guest interview about developer productivity.",
  },
  {
    id: "social",
    name: "Social Hook",
    badge: "Twitter / LinkedIn",
    icon: Layers,
    placeholder: "What insight, lesson, or opinion do you want to share on social media?...",
    samplePrompt: "Draft an engaging LinkedIn post about why consistency beats talent when learning to code, ending with a question to drive comments.",
  },
  {
    id: "script",
    name: "Video Script",
    badge: "YouTube & Reels",
    icon: Video,
    placeholder: "Describe the video topic, target length, and core message...",
    samplePrompt: "Create a 60-second YouTube Shorts script hook explaining why Next.js App Router changed full-stack web development.",
  },
  {
    id: "story",
    name: "Creative Story",
    badge: "Narrative & Fiction",
    icon: BookOpen,
    placeholder: "Describe the setting, characters, and theme of your story...",
    samplePrompt: "Write a suspenseful sci-fi short story about an autonomous AI satellite that discovers an encrypted radio signal from deep space.",
  },
  {
    id: "pitch",
    name: "Product Pitch",
    badge: "Marketing & Landing",
    icon: Target,
    placeholder: "Describe your product, target customer, problem solved, and unique benefits...",
    samplePrompt: "Draft a compelling product landing page hero section and 3 core value propositions for a lightning-fast browser screenshot utility.",
  },
];

// Tone of Voice Options (With Authentic Lucide Icons)
interface ToneOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

const TONES: ToneOption[] = [
  { id: "Professional", name: "Professional", icon: Award, desc: "Clear, polished, and executive" },
  { id: "Casual", name: "Casual", icon: Coffee, desc: "Friendly, natural, and conversational" },
  { id: "Witty", name: "Witty & Fun", icon: Laugh, desc: "Playful, energetic, and engaging" },
  { id: "Persuasive", name: "Persuasive", icon: Target, desc: "Compelling and action-oriented" },
  { id: "Creative", name: "Creative", icon: Lightbulb, desc: "Imaginative, expressive, and vivid" },
  { id: "Educational", name: "Educational", icon: GraduationCap, desc: "Clear, structured, and informative" },
];

// Content Lengths
const LENGTHS = [
  { id: "Short", name: "Short", words: "~150 words" },
  { id: "Medium", name: "Medium", words: "~400 words" },
  { id: "Long", name: "Long", words: "~800 words" },
];

// Supported Output Languages
interface LanguageOption {
  id: string;
  name: string;
  code: string;
  native: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: "en-us", name: "English (US)", code: "US", native: "English" },
  { id: "en-uk", name: "English (UK)", code: "UK", native: "English" },
  { id: "es", name: "Spanish", code: "ES", native: "Español" },
  { id: "fr", name: "French", code: "FR", native: "Français" },
  { id: "de", name: "German", code: "DE", native: "Deutsch" },
  { id: "ja", name: "Japanese", code: "JP", native: "日本語" },
  { id: "hi", name: "Hindi", code: "IN", native: "हिंदी" },
  { id: "pt", name: "Portuguese", code: "BR", native: "Português" },
  { id: "ar", name: "Arabic", code: "AE", native: "العربية" },
  { id: "it", name: "Italian", code: "IT", native: "Italiano" },
];

// 4 Instant Demonstration Blueprints ($0 Compute Client-Side Instant Clicks)
interface WritingBlueprint {
  id: string;
  title: string;
  badge: string;
  format: string;
  tone: string;
  length: string;
  prompt: string;
  demoResult: string;
}

const DEMO_BLUEPRINTS: WritingBlueprint[] = [
  {
    id: "clean-code",
    title: "5 Clean Code Habits for 2026",
    badge: "Dev & Tech Blog",
    format: "Blog Post",
    tone: "Professional",
    length: "Medium",
    prompt: "Write a high-quality blog post on 5 clean code habits every modern developer should cultivate in 2026. Include concrete takeaways and a motivating conclusion.",
    demoResult: `# 5 Clean Code Habits Every Developer Needs in 2026

Writing code that works is only half the battle. Writing code that your team can read, maintain, and confidently build upon six months from now is what separates great engineers from average ones.

Here are five pragmatic clean code habits to elevate your day-to-day workflow:

### 1. Optimize for Readability Over Cleverness
Clever one-liners often look impressive in code reviews, but they quickly become technical debt during late-night debugging sessions. Prioritize explicit variable naming and obvious function structures over obscure shorthand techniques.

### 2. Guard Clauses Over Deep Nesting
Deeply nested if-else ladders drain cognitive energy. Use early return statements (guard clauses) to handle error conditions upfront and keep the happy path flat and readable.

### 3. Keep Functions Single-Minded
Every function should do one thing and do it exceptionally well. When a helper function starts handling validation, database access, and formatting all at once, extract them into discrete, testable utilities.

### 4. Self-Documenting Code Over Stale Comments
Comments explaining *what* code does frequently fall out of sync with actual logic. Instead, write expressive function and variable names that explain what is happening, reserving comments solely for *why* an unusual decision was made.

### 5. Automated Formatting & Linters
Never argue about tabs, spaces, or semicolon placement in pull requests. Enforce a shared linter and automated formatter so your team can focus exclusively on architectural correctness.

---
**Key Takeaway**: Great code is not code that can never be rewritten; it is code that can be easily understood and improved by anyone on the team.`,
  },
  {
    id: "podcast-outreach",
    title: "Podcast Partnership Proposal",
    badge: "Cold Email",
    format: "Cold Email",
    tone: "Persuasive",
    length: "Short",
    prompt: "Write a friendly, high-converting cold email to a tech podcast host proposing a guest interview about developer productivity.",
    demoResult: `Subject: Podcast guest pitch: 3 practical bottlenecks slowing down modern dev teams

Hi [Host Name],

I've been following [Podcast Name] for the past few months, and your recent episode with [Previous Guest] on distributed systems was both insightful and refreshing.

I am reaching out because I lead developer tools at Exismic, where we've spent the past two years analyzing how engineering teams eliminate creative friction and build faster in-browser workflows.

I would love to join you for a focused 25-minute conversation on:
• The silent time-sinks costing software teams 8+ hours every week
• Why client-side in-browser processing is replacing clunky desktop tools
• 3 practical habits developers can adopt tomorrow to protect their focus

Would you be open to a quick 5-minute chat next Tuesday to see if this aligns with your upcoming recording schedule?

Best regards,

[Your Name]
Product Lead • [Your Company]
[Your Website / Portfolio Link]`,
  },
  {
    id: "social-breakthrough",
    title: "Why Creators Quit 2 Weeks Early",
    badge: "Viral Social Hook",
    format: "Social Hook",
    tone: "Creative",
    length: "Short",
    prompt: "Write a viral, thought-provoking LinkedIn/Twitter post breaking down why most creators give up 2 weeks before their breakthrough.",
    demoResult: `Most creators don't fail because their work is bad.

They fail because they stop 2 weeks before compound interest kicks in.

Here is the brutal truth about creative momentum:

1. Day 1 to 30 feels like shouting into an empty void. You put 10 hours into a post or video, and 4 people see it.
2. Day 31 to 60 is where 90% of people quietly quit. The initial excitement is gone, and the metrics still feel flat.
3. Day 61 to 90 is where algorithms, search engines, and word-of-mouth finally begin noticing patterns.

The secret isn't inspiration.
The secret is publishing on the days when nobody is clapping.

If you are in week three right now and wondering if anyone cares: keep shipping.

What's one project you almost gave up on that ended up paying off?`,
  },
  {
    id: "founder-story",
    title: "From Weekend Hack to 10k Users",
    badge: "Storytelling",
    format: "Creative Story",
    tone: "Casual",
    length: "Long",
    prompt: "Write an inspiring founder story about launching a weekend coding project, the unexpected hurdles during launch, and reaching our first 10,000 active creators.",
    demoResult: `# The Weekend Hack That Wouldn't Die: How We Hit 10,000 Users

It began on a rainy Saturday evening with a broken image compressor.

I was trying to optimize a series of high-resolution mockups for a client presentation. Every online tool I tried either demanded an email address, capped file sizes at 5MB, or slapped a low-res watermark across the canvas.

Frustrated, I opened an empty VS Code window and asked a simple question:
*"Why can't this just run directly in the browser with zero uploads?"*

### The 48-Hour Sprint
By Sunday midnight, the rough prototype was functional. It had no landing page, no fancy CSS animations, and only three buttons: Select, Compress, and Download. 

I shared a link on a small developer Discord server with a quick note:
*"Built this over the weekend because I was tired of email gates. Free, fast, runs in your browser."*

I closed my laptop and went to bed expecting nothing.

### The Monday Surge
When I woke up Monday morning, the analytics dashboard was completely redlining. 

Someone had shared the tool on Hacker News and Reddit. Over 1,200 active users were compressing images simultaneously. The amazing part? Because the entire processing engine ran on client-side memory, our server hosting costs stayed at exactly $0.

Then the bug reports arrived:
• Safari users couldn't download WebP files
• Mobile screens clipped the control buttons
• Large 4K photos caused older phones to run out of memory

Instead of panicking, we turned bug fixes into a public changelog. Every morning, we pushed improvements based directly on user comments.

### What Reaching 10,000 Creators Taught Us
Three months later, Exismic crossed 10,000 active monthly creators.

Looking back, the biggest lesson wasn't about clever marketing funnels or growth hacks. It was about respecting the user:
1. Don't hide simple utilities behind forced sign-ups
2. Never compromise on speed and privacy
3. Listen obsessively to the people using your software every day

To every builder shipping a side project this weekend: build for real problems, respect your users' time, and let the product speak for itself.`,
  },
];

const WRITER_COST = 8; // 8 Credits per run as configured in credit-policy.ts

export default function AiWriter() {
  const router = useRouter();
  const { credits, setShowUpsell } = useCredits();

  // Core Form State
  const [prompt, setPrompt] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("blog");
  const [tone, setTone] = useState<string>("Professional");
  const [length, setLength] = useState<string>("Medium");
  const [language, setLanguage] = useState<string>("English (US)");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLanguageOpen(false);
      }
    }
    if (isLanguageOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLanguageOpen]);

  // Execution & UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview" | "split">("write");
  const [mobileTab, setMobileTab] = useState<"editor" | "output" | "controls">("editor");
  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);
  const [outputViewMode, setOutputViewMode] = useState<"formatted" | "raw">("formatted");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ingest piped content from other tools
  const { pipedPayload, isPiped, clearPiped } = usePipedContent((payload) => {
    if (payload.content) {
      setPrompt(payload.content);
      setActiveTab("write");
      setMobileTab("editor");
    }
  });

  // Active format helper
  const currentFormat = useMemo(() => {
    return CONTENT_FORMATS.find((f) => f.id === selectedFormat) || CONTENT_FORMATS[0];
  }, [selectedFormat]);

  // Real-time Text Metrics
  const metrics = useMemo(() => {
    const textToCount = activeTab === "preview" && result ? result : prompt;
    const trimmed = textToCount.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = textToCount.length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readMinutes };
  }, [prompt, result, activeTab]);

  // Copy Result with toast
  const handleCopy = () => {
    const content = result || prompt;
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as Plain Text (.txt)
  const handleExportTxt = () => {
    const content = result || prompt;
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exismic-article-${Date.now()}.txt`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Export as Markdown (.md)
  const handleExportMd = () => {
    const content = result || prompt;
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exismic-draft-${Date.now()}.md`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Primary Generation Action
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setErrorMessage(null);

    // Credit Check (Pre-flight)
    if (credits < WRITER_COST) {
      setShowUpsell(true);
      return;
    }

    setIsGenerating(true);
    setResult("");
    setActiveTab("preview");
    setMobileTab("output");

    try {
      const response = await fetch("/api/tools/ai/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          tone,
          length,
          format: currentFormat.name,
          language,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate content. Please try again.");
      }

      const data = await response.json();
      setResult(data.content || "");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("quests-updated"));
        window.dispatchEvent(new Event("credits-updated"));
      }
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Failed to connect to the writing assistant.";
      setErrorMessage(msg);
      setResult("");
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Apply Demonstration Blueprint ($0 Compute)
  const applyBlueprint = (bp: WritingBlueprint) => {
    setActiveBlueprintId(bp.id);
    setPrompt(bp.prompt);
    setTone(bp.tone);
    setLength(bp.length);
    const matchingFormat = CONTENT_FORMATS.find((f) => f.name.toLowerCase() === bp.format.toLowerCase());
    if (matchingFormat) setSelectedFormat(matchingFormat.id);
    setResult(bp.demoResult);
    setActiveTab("preview");
    setMobileTab("output");
    setErrorMessage(null);
  };

  // Quick prompt filler
  const handleSelectFormat = (fmt: ContentFormat) => {
    setSelectedFormat(fmt.id);
    if (!prompt.trim()) {
      setPrompt(fmt.samplePrompt);
    }
    textareaRef.current?.focus();
  };

  // Shuffle Random Idea
  const handleRandomIdea = () => {
    const randomIndex = Math.floor(Math.random() * CONTENT_FORMATS.length);
    const fmt = CONTENT_FORMATS[randomIndex];
    setSelectedFormat(fmt.id);
    setPrompt(fmt.samplePrompt);
    setActiveBlueprintId(null);
    setErrorMessage(null);
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPrompt(text);
        textareaRef.current?.focus();
      }
    } catch (err) {
      console.warn("Clipboard read unavailable:", err);
    }
  };

  // Reset form
  const handleReset = () => {
    setPrompt("");
    setResult("");
    setActiveBlueprintId(null);
    setErrorMessage(null);
    setActiveTab("write");
    setMobileTab("editor");
  };

  // Direct tool handover
  const handleSendToTool = (href: string) => {
    const content = result || prompt;
    if (content) {
      setPipedContent({
        sourceToolId: "ai-writer",
        content,
      });
    }
    router.push(href);
  };

  return (
    <div className="w-full space-y-6 lg:pb-2">
      {/* 1. Top Live Stats & Quick Info Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-amber-500/20 bg-[#0e0a03]/90 p-5 md:p-6 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-500/10 border border-amber-400/40 text-amber-300 shadow-lg shadow-amber-500/10">
              <Feather className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  AI Writer Studio
                </h1>
                <span className="rounded-md bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Human Quality
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Draft compelling blog posts, cold emails, video scripts, and marketing copy with tailored tone and structure.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-200 font-bold flex items-center gap-1.5">
              <span>{WRITER_COST} Credits per Draft</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Watermarks</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Any Language</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Workspace Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden items-center bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              mobileTab === "editor" ? "bg-amber-400 text-amber-950 font-black shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            Prompt Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("output")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative",
              mobileTab === "output" ? "bg-amber-400 text-amber-950 font-black shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            Draft Output
            {result && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("controls")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              mobileTab === "controls" ? "bg-amber-400 text-amber-950 font-black shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            Controls
          </button>
        </div>

        {/* Desktop Helper Descriptor */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-amber-300">
            <Feather className="w-3.5 h-3.5 text-amber-400" /> Writing Studio
          </span>
          <span className="text-zinc-600">·</span>
          <span>Craft original content with rich formatting, instant blueprints, and tone customizers</span>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRandomIdea}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Load an inspiring prompt"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" /> Random Idea
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Clear all fields"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" /> Clear
          </button>

          {(result || prompt) && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-bold text-white hover:bg-white/10 hover:border-amber-400/40 transition-all cursor-pointer shadow-sm"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportTxt}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                title="Download as TXT file"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Download</span> .TXT
              </button>

              <button
                type="button"
                onClick={handleExportMd}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                title="Download as Markdown file"
              >
                <FileDown className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Download</span> .MD
              </button>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 3. Main Workspace Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Writing Stage, Output & Demonstration Blueprints */}
        <section
          className={cn(
            "lg:col-span-7 xl:col-span-8 space-y-6 order-1",
            mobileTab === "controls" ? "hidden lg:block" : "block"
          )}
        >
          {/* Obsidian macOS Writing Stage Container */}
          <div className="relative group overflow-hidden rounded-[2rem] border border-amber-500/20 bg-[#0a0803]/80 shadow-[0_40px_100px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
            {/* macOS Window Titlebar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-zinc-400 hidden sm:inline">
                  AI Creative Writing Stage
                </span>
              </div>

              {/* View Switcher Tabs (Desktop) */}
              <div className="hidden lg:flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    activeTab === "write"
                      ? "bg-amber-400 text-amber-950 font-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <PenTool className="w-3 h-3" />
                  Write Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    activeTab === "preview"
                      ? "bg-amber-400 text-amber-950 font-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Eye className="w-3 h-3" />
                  Preview Output
                  {result && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("split")}
                  className={cn(
                    "hidden xl:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    activeTab === "split"
                      ? "bg-amber-400 text-amber-950 font-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Split className="w-3 h-3" />
                  Split View
                </button>
              </div>

              {/* Live Metrics Pill */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="font-mono text-amber-300 font-bold">
                  {metrics.words} words
                </span>
                <span className="hidden sm:inline text-zinc-600">·</span>
                <span className="hidden sm:inline text-zinc-400">
                  {metrics.readMinutes}m read
                </span>
              </div>
            </div>

            {/* Stage Body */}
            <div className="p-5 sm:p-8 min-h-[460px] flex flex-col justify-between">
              {/* Piped badge if loaded from another tool */}
              {isPiped && pipedPayload && (
                <div className="mb-4">
                  <PipedBadge
                    sourceName={pipedPayload.sourceToolName}
                    onClear={() => {
                      setPrompt("");
                      clearPiped();
                    }}
                  />
                </div>
              )}

              {/* Views Grid (Supports Split Mode on Desktop) */}
              <div
                className={cn(
                  "gap-6",
                  activeTab === "split"
                    ? "grid grid-cols-1 xl:grid-cols-2"
                    : "flex flex-col"
                )}
              >
                {/* 1. Prompt Editor Pane */}
                <div
                  className={cn(
                    "flex flex-col space-y-4",
                    activeTab === "preview" && "hidden lg:hidden",
                    activeTab === "split" && "block"
                  )}
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400/90 flex items-center gap-1.5">
                      <currentFormat.icon className="w-3.5 h-3.5" />
                      Topic & Prompt Instructions ({currentFormat.name})
                    </span>
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="text-[10px] text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Paste from Clipboard
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (activeBlueprintId) setActiveBlueprintId(null);
                    }}
                    placeholder={currentFormat.placeholder}
                    className="w-full h-[320px] bg-black/40 border border-white/10 rounded-2xl p-5 text-base sm:text-lg font-normal text-white placeholder-zinc-600 outline-none resize-none leading-relaxed focus:border-amber-400/50 transition-colors selection:bg-amber-500/30"
                  />

                  {/* Format Quick Switcher Chips */}
                  <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                      Choose Content Goal
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CONTENT_FORMATS.map((fmt) => {
                        const Icon = fmt.icon;
                        const isSelected = selectedFormat === fmt.id;
                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleSelectFormat(fmt)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                              isSelected
                                ? "bg-amber-400/15 border-amber-400/60 text-amber-300 shadow-sm"
                                : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-amber-400" : "text-zinc-500")} />
                            <span>{fmt.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Draft Output Preview Pane */}
                <div
                  className={cn(
                    "flex flex-col space-y-4",
                    activeTab === "write" && "hidden lg:hidden",
                    activeTab === "split" && "block border-t xl:border-t-0 xl:border-l border-white/10 pt-6 xl:pt-0 xl:pl-6"
                  )}
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Generated Output
                    </span>
                    <div className="flex items-center gap-2">
                      {result && (
                        <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setOutputViewMode("formatted")}
                            className={cn(
                              "px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer",
                              outputViewMode === "formatted"
                                ? "bg-amber-400 text-amber-950 font-black shadow-sm"
                                : "text-zinc-400 hover:text-white"
                            )}
                          >
                            Formatted
                          </button>
                          <button
                            type="button"
                            onClick={() => setOutputViewMode("raw")}
                            className={cn(
                              "px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer",
                              outputViewMode === "raw"
                                ? "bg-amber-400 text-amber-950 font-black shadow-sm"
                                : "text-zinc-400 hover:text-white"
                            )}
                          >
                            Raw Markdown
                          </button>
                        </div>
                      )}
                      {result && (
                        <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                          {metrics.words} words
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-[320px] overflow-y-auto rounded-2xl border border-white/10 bg-black/60 p-5 scrollbar-thin scrollbar-thumb-white/10">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="relative">
                          <div className="w-14 h-14 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
                          <PenTool className="absolute inset-0 m-auto w-6 h-6 text-amber-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-amber-300">
                            Crafting Your Draft...
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            Writing in {tone} tone • {length} length
                          </p>
                        </div>
                      </div>
                    ) : result ? (
                      outputViewMode === "formatted" ? (
                        <div className="prose prose-invert max-w-none text-zinc-200 text-sm sm:text-base leading-relaxed font-sans selection:bg-amber-500/30">
                          <ChatMarkdownRenderer content={result} />
                        </div>
                      ) : (
                        <pre className="font-mono text-xs sm:text-sm text-amber-200/90 whitespace-pre-wrap leading-relaxed select-all">
                          {result}
                        </pre>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                          <Feather className="w-6 h-6 text-amber-400/60" />
                        </div>
                        <h4 className="text-sm font-bold text-zinc-300">
                          Your draft will appear here
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-sm">
                          Enter your prompt on the left and click Write with AI, or pick one of the 1-click demonstration blueprints below.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Output Action Bar */}
                  {result && !isGenerating && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "Copied" : "Copy Output"}
                        </button>
                        <button
                          type="button"
                          onClick={handleExportTxt}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-zinc-400" />
                          Save .TXT
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="text-emerald-400 font-bold">● Ready to publish</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage Bottom Bar */}
              <div className="pt-6 mt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="text-zinc-500 font-mono">
                    {prompt.length} chars
                  </span>
                  <span className="text-zinc-700">|</span>
                  <span className="text-amber-400 font-bold">
                    Target: {currentFormat.name}
                  </span>
                  <span className="text-zinc-700">|</span>
                  <span className="text-zinc-400">
                    Tone: {tone}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {result && (
                    <button
                      type="button"
                      onClick={() => handleSendToTool("/tools/ai/humanizer")}
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      Humanize Draft
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <PenTool className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                    <span>{isGenerating ? "Writing Draft..." : `Write Content (${WRITER_COST} Credits)`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Instant Demonstration Blueprints ($0 Compute Client-Side Instant Previews) */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  Instant Demonstration Blueprints
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                1-Click Sample Previews
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Click any demonstration blueprint below to immediately load a proven prompt, configure settings, and inspect sample generated output.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {DEMO_BLUEPRINTS.map((bp) => {
                const isActive = activeBlueprintId === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => applyBlueprint(bp)}
                    className={cn(
                      "text-left p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between",
                      isActive
                        ? "bg-amber-500/10 border-amber-400/50 shadow-lg shadow-amber-500/10"
                        : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-amber-400/30"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                          {bp.badge}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {bp.tone} • {bp.length}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {bp.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        "{bp.prompt}"
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-medium">{bp.format}</span>
                      <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Load Blueprint <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Creator Feature Highlights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Award className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">Custom Voice & Tone</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Tailor every paragraph to match your exact audience, from executive boardroom to punchy viral social hooks.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">100% Watermark-Free</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Download and copy completely unbranded, clean text ready for client proposals, websites, or emails.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Global Languages</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Write fluently across 10 worldwide languages with native vocabulary, phrasing, and cultural nuance.
              </p>
            </div>
          </div>

          {/* Next Action Pipeline & Chaining */}
          {result && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.03] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Next Action Pipeline
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Send this draft directly to companion AI tools with 1-click text handover.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSendToTool("/tools/ai/humanizer")}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  AI Humanizer →
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToTool("/tools/ai/grammar")}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Grammar Check →
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToTool("/tools/ai/social-caption")}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Social Caption →
                </button>
              </div>
            </div>
          )}

          {/* Result Retention Bar */}
          {result && !isGenerating && (
            <ResultRetentionBar
              toolType="ai-writer"
              toolName="AI Writer"
              title={prompt ? `Writer Output: ${prompt.slice(0, 40)}...` : "Written Article"}
              content={result}
              metadata={{ tone, length, format: currentFormat.name, language }}
              onCopy={handleCopy}
            />
          )}
        </section>

        {/* RIGHT COLUMN: Writing Controls Console */}
        <aside
          className={cn(
            "lg:col-span-5 xl:col-span-4 space-y-5 order-2",
            mobileTab === "editor" ? "hidden lg:block" : "block"
          )}
        >
          <div className="rounded-[2rem] border border-amber-500/20 bg-[#0e0a03]/90 p-5 sm:p-6 backdrop-blur-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  Writing Controls
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                Active Setup
              </span>
            </div>

            {/* 1. Content Format Selector */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center justify-between">
                <span>1. Content Format</span>
                <span className="text-[10px] font-bold text-amber-300">{currentFormat.name}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_FORMATS.map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => handleSelectFormat(fmt)}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer",
                        isSelected
                          ? "bg-amber-400/15 border-amber-400/60 text-amber-300 shadow-sm"
                          : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-amber-400" : "text-zinc-500")} />
                      <span className="truncate">{fmt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Tone of Voice Selector */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center justify-between">
                <span>2. Tone of Voice</span>
                <span className="text-[10px] font-bold text-amber-300">{tone}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      disabled={isGenerating}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer",
                        isSelected
                          ? "bg-amber-400/15 border-amber-400/60 text-amber-300 shadow-sm"
                          : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-amber-400" : "text-zinc-500")} />
                      <span className="truncate">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Content Length Selector */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center justify-between">
                <span>3. Content Length</span>
                <span className="text-[10px] font-bold text-amber-300">
                  {LENGTHS.find((l) => l.id === length)?.words}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map((l) => {
                  const isSelected = length === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLength(l.id)}
                      disabled={isGenerating}
                      className={cn(
                        "py-3 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                        isSelected
                          ? "bg-amber-400/15 border-amber-400/60 text-amber-300 shadow-sm"
                          : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <span className="font-bold">{l.name}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">{l.words}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Output Language Selector */}
            <div className="space-y-3" ref={languageDropdownRef}>
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center justify-between">
                <span>4. Output Language</span>
                <span className="text-[10px] font-bold text-amber-300">
                  {LANGUAGES.find((l) => l.name === language)?.code || "US"} · {language}
                </span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  disabled={isGenerating}
                  className={cn(
                    "w-full flex items-center justify-between bg-white/[0.04] border rounded-xl px-4 py-3 text-xs font-bold text-white transition-all cursor-pointer shadow-sm group",
                    isLanguageOpen
                      ? "border-amber-400/60 bg-amber-400/[0.08] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "border-white/10 hover:border-amber-400/40 hover:bg-white/[0.07]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-[10px] font-mono font-black text-amber-300">
                      {LANGUAGES.find((l) => l.name === language)?.code || "US"}
                    </span>
                    <span className="text-white text-xs font-bold">
                      {language}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
                      ({LANGUAGES.find((l) => l.name === language)?.native || "English"})
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-zinc-400 transition-transform duration-200 group-hover:text-amber-300",
                      isLanguageOpen && "rotate-180 text-amber-400"
                    )}
                  />
                </button>

                {/* Animated Obsidian-Gold Popover Menu */}
                <AnimatePresence>
                  {isLanguageOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-amber-500/30 bg-[#0e0a03]/98 p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_25px_rgba(245,158,11,0.2)] backdrop-blur-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/30"
                    >
                      {LANGUAGES.map((lang) => {
                        const isSelected = language === lang.name;
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => {
                              setLanguage(lang.name);
                              setIsLanguageOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer group",
                              isSelected
                                ? "bg-amber-400/20 text-amber-200 border border-amber-400/40"
                                : "text-zinc-300 hover:bg-white/[0.08] hover:text-white border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-mono font-black transition-colors",
                                  isSelected
                                    ? "bg-amber-400 text-amber-950 font-black shadow-sm"
                                    : "bg-white/10 text-amber-300/80 group-hover:bg-amber-400/15 group-hover:text-amber-300"
                                )}
                              >
                                {lang.code}
                              </span>
                              <span className="font-bold">{lang.name}</span>
                              <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400 font-normal">
                                • {lang.native}
                              </span>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <PenTool className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                <span>{isGenerating ? "Crafting Content..." : `Generate Content (${WRITER_COST} Credits)`}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                <span>Remaining: <strong className="text-white">{credits} Credits</strong></span>
                <span>Cost: <strong className="text-amber-400">{WRITER_COST} Credits</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Help & Smart Writing Advice Card */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Writing Tip</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              For best results, mention your specific goal, intended reader, and any key points you want covered. You can also pick any of the 4 blueprints on the left for instant inspiration.
            </p>
          </div>
        </aside>
      </main>

      {/* Chained Next Steps when writing is ready */}
      {result && (
        <ToolWorkflowChaining
          currentToolId="ai-writer"
          categoryId="ai"
          outputContent={result}
        />
      )}
    </div>
  );
}
