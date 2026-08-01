"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Zap,
  RotateCcw,
  Eye,
  Smartphone,
  Monitor,
  Wand2,
  FileText,
  TrendingUp,
  BarChart3,
  Trash2,
  Type,
  ListFilter,
  CheckCircle2,
  Info,
  Lightbulb,
  CornerDownLeft,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

// Standardized Unicode Converters
function toUnicodeBold(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d400 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d41a + (code - 97));
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ce + (code - 48));
    return char;
  });
}

function toUnicodeItalic(text: string): string {
  return text.replace(/[A-Za-z]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d434 + (code - 65));
    if (code >= 97 && code <= 122) {
      // Special case for 'h' in Unicode Math Italic
      if (code === 104) return "\u210e";
      return String.fromCodePoint(0x1d44e + (code - 97));
    }
    return char;
  });
}

function toUnicodeBoldItalic(text: string): string {
  return text.replace(/[A-Za-z]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d468 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d482 + (code - 97));
    return char;
  });
}

function toUnicodeUnderline(text: string): string {
  return text.split("").map((c) => (/[A-Za-z0-9]/.test(c) ? c + "\u0332" : c)).join("");
}

function toUnicodeMonospace(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d670 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d68a + (code - 97));
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7f6 + (code - 48));
    return char;
  });
}

// Templates for Creator Inspiration
const TEMPLATES = [
  {
    title: "The Hard-Learned Mistake",
    category: "Storytelling",
    text: `I made a $50,000 mistake early in my career.\n\nI thought working 80 hours a week was the only way to win.\n\nHere are 4 harsh truths I learned after building products for 5 years:\n\n- Focus on high-leverage decisions over busywork\n- Rest is a core multiplier of output\n- Systems beat hustle every single time\n- Delegation is key to scaling\n\nWhat is the biggest lesson you learned the hard way?`
  },
  {
    title: "The Step-by-Step Blueprint",
    category: "Guide",
    text: `How to build a $10k/mo side project while working a 9-to-5:\n\n(Without burning out or quitting your job)\n\nA step-by-step breakdown of my exact framework:\n\n1. Identify a hyper-specific problem people pay to solve\n2. Build a minimal prototype in 48 hours\n3. Pre-sell to 10 customers before writing full code\n4. Automate customer support from Day 1\n\nSave this post for your next weekend build.`
  },
  {
    title: "The Contrarian Take",
    category: "Opinion",
    text: `Unpopular opinion: Most resume advice on LinkedIn is completely outdated.\n\nRecruiters don't spend 5 minutes reading your objective statement.\n\nThey scan your profile for 6 seconds looking for 3 specific things:\n\n- Quantifiable metric results ($ raised, % growth, users acquired)\n- Proof of domain mastery\n- Clear communication style\n\nStop listing job duties. Start listing business impact.`
  },
  {
    title: "The Metric Drop",
    category: "Case Study",
    text: `In 2023, our landing page converted at 1.8%.\n\nLast month, we hit 8.4% conversion without changing our pricing.\n\nHere are the 3 copy tweaks that made all the difference:\n\n⚡ Removed jargon from the hero headline\n⚡ Added social proof above the fold\n⚡ Simplified our CTA to a single action\n\nWhich of these are you trying first?`
  },
  {
    title: "The Curated List",
    category: "Resource",
    text: `I spent 100+ hours testing free AI tools so you don't have to.\n\nHere are the 5 most powerful tools that will save you 20 hours a week:\n\n1. Tool A - Automated research & summaries\n2. Tool B - Instant UI mockup generator\n3. Tool C - AI code auditor & refactorer\n4. Tool D - High-converting post scheduler\n5. Tool E - Content hook score evaluator\n\nRepost this if you found it helpful!`
  }
];

export default function LinkedinFormatter() {
  const [rawText, setRawText] = useState(TEMPLATES[0].text);
  const [bulletStyle, setBulletStyle] = useState("⚡");
  const [copied, setCopied] = useState(false);
  const [isExpandedPreview, setIsExpandedPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply formatting to selected text in textarea
  const applyTextTransform = (transformFn: (text: string) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      // If no text selected, select the current word under cursor
      const text = rawText;
      let left = start;
      let right = start;
      while (left > 0 && /\S/.test(text[left - 1])) left--;
      while (right < text.length && /\S/.test(text[right])) right++;
      
      if (left < right) {
        const word = text.slice(left, right);
        const transformedWord = transformFn(word);
        const nextText = text.slice(0, left) + transformedWord + text.slice(right);
        setRawText(nextText);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(left, left + transformedWord.length);
        });
      }
      return;
    }

    const selectedText = rawText.substring(start, end);
    const transformed = transformFn(selectedText);
    const updatedText = rawText.substring(0, start) + transformed + rawText.substring(end);

    setRawText(updatedText);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformed.length);
    });
  };

  // Formatted output with dynamic bullet styling
  const formattedText = useMemo(() => {
    if (!rawText) return "";
    const paragraphs = rawText.split("\n\n");
    return paragraphs
      .map((p) => {
        const lines = p.split("\n");
        return lines
          .map((line) => {
            const trimmed = line.trim();
            if (
              trimmed.startsWith("- ") ||
              trimmed.startsWith("* ") ||
              trimmed.startsWith("• ") ||
              /^\d+\.\s/.test(trimmed)
            ) {
              const content = trimmed.replace(/^([-*•]|\d+\.)\s*/, "");
              return `${bulletStyle} ${content}`;
            }
            return line;
          })
          .join("\n");
      })
      .join("\n\n");
  }, [rawText, bulletStyle]);

  // Hook & Post Performance Analyzer
  const hookAnalysis = useMemo(() => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      return {
        score: 0,
        grade: "N/A",
        hookLength: 0,
        hookText: "",
        truncatedHook: "",
        feedback: [
          { type: "info", text: "Write or paste a draft post to run real-time hook analysis." }
        ]
      };
    }

    const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
    const firstLine = lines[0] || "";
    const hookLength = firstLine.length;

    let score = 0;
    const feedback: { type: "success" | "warning" | "error" | "info"; text: string }[] = [];

    // 1. Hook Length evaluation (0 - 35 pts)
    if (hookLength >= 40 && hookLength <= 130) {
      score += 35;
      feedback.push({
        type: "success",
        text: `Optimal hook length (${hookLength} chars). Fits nicely before LinkedIn's '...see more' cutoff.`
      });
    } else if (hookLength >= 20 && hookLength < 40) {
      score += 20;
      feedback.push({
        type: "warning",
        text: `Hook is slightly concise (${hookLength} chars). Consider adding a intriguing hook angle.`
      });
    } else if (hookLength > 130 && hookLength <= 180) {
      score += 15;
      feedback.push({
        type: "warning",
        text: `Hook is a bit long (${hookLength} chars). LinkedIn might truncate it mid-sentence.`
      });
    } else if (hookLength < 20) {
      score += 5;
      feedback.push({
        type: "error",
        text: `Hook is too short (${hookLength} chars). A strong opening line needs substance to stop the scroll.`
      });
    } else {
      score += 10;
      feedback.push({
        type: "error",
        text: `Hook is too long (${hookLength} chars). Cut back under 130 chars to avoid preview truncation.`
      });
    }

    // 2. Power Words & Emotional Triggers (0 - 30 pts)
    const powerWordRegex = /(mistake|secret|stop|never|how i|why|percent|%|\$|unpopular|truth|roadmap|framework|built|grew|failed|lessons|system|blueprint|hacks|step|strategy|don't|won't|revenue|salary|zero|guaranteed|reason)/i;
    const matchesPowerWord = powerWordRegex.test(firstLine);
    if (matchesPowerWord) {
      score += 30;
      feedback.push({
        type: "success",
        text: "Hook contains high-converting power words/curiosity triggers."
      });
    } else {
      feedback.push({
        type: "warning",
        text: "Add power words like 'mistake', 'framework', 'unpopular', 'how I', or metrics."
      });
    }

    // 3. Numbers & Specific Data (0 - 20 pts)
    const hasNumbers = /\d+|%|\$/.test(firstLine);
    if (hasNumbers) {
      score += 20;
      feedback.push({
        type: "success",
        text: "Includes quantifiable metrics or numbers, increasing click-through credibility."
      });
    } else {
      feedback.push({
        type: "info",
        text: "Try incorporating a specific stat or dollar amount (e.g. '$10k', '90 days', '3 steps')."
      });
    }

    // 4. Structure & Spacing Check (0 - 15 pts)
    const hasGoodSpacing = rawText.includes("\n\n");
    const paragraphsCount = rawText.split("\n\n").length;
    if (hasGoodSpacing && paragraphsCount >= 3) {
      score += 15;
      feedback.push({
        type: "success",
        text: "Great multi-paragraph structure with breathable line-spacing."
      });
    } else if (!hasGoodSpacing && rawText.length > 200) {
      score += 0;
      feedback.push({
        type: "error",
        text: "Wall of text detected! Insert double line breaks to improve readability on mobile."
      });
    } else {
      score += 5;
      feedback.push({
        type: "info",
        text: "Break longer paragraphs into 1-2 sentence bites for maximum mobile retention."
      });
    }

    // Penalties for Spammy / SHOUTING
    const uppercaseRatio = (firstLine.match(/[A-Z]/g) || []).length / (firstLine.length || 1);
    if (uppercaseRatio > 0.45 && firstLine.length > 15) {
      score = Math.max(10, score - 20);
      feedback.push({
        type: "error",
        text: "Avoid ALL CAPS shouting in your hook line."
      });
    }

    let grade = "C";
    if (score >= 85) grade = "A+";
    else if (score >= 75) grade = "A";
    else if (score >= 60) grade = "B";
    else if (score >= 40) grade = "C";
    else grade = "D";

    return {
      score: Math.min(100, score),
      grade,
      hookLength,
      hookText: firstLine,
      truncatedHook: firstLine.length > 140 ? firstLine.slice(0, 137) + "..." : firstLine,
      feedback
    };
  }, [rawText]);

  // Clean formatting helpers
  const handleFixSpacing = () => {
    if (!rawText) return;
    // Replace multiple empty lines with standard double line breaks
    const cleaned = rawText
      .split("\n")
      .map((l) => l.trimEnd())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    setRawText(cleaned);
  };

  const handleClearText = () => {
    setRawText("");
  };

  const handleCopy = () => {
    if (!formattedText) return;
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stats calculation
  const charCount = rawText.length;
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-950/60 via-indigo-950/40 to-neutral-950 border border-blue-500/20 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5" /> LinkedIn Growth Suite
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              LinkedIn Post Formatter & Hook Score Analyzer
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Format long-form text with unicode styling, custom bullet icons, double spacing, and real-time hook strength evaluation to maximize feed reach.
            </p>
          </div>

          {/* Quick Template Selector */}
          <div className="shrink-0 space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-blue-400" /> Hook Templates
            </label>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  const t = TEMPLATES.find((item) => item.title === e.target.value);
                  if (t) {
                    setRawText(t.text);
                    setSelectedTemplate(t.title);
                  }
                }}
                className="w-full sm:w-56 appearance-none px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer pr-10"
              >
                <option value="" disabled>Select a Viral Hook...</option>
                {TEMPLATES.map((tmpl) => (
                  <option key={tmpl.title} value={tmpl.title}>
                    [{tmpl.category}] {tmpl.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Column */}
        <div className="lg:col-span-7 space-y-4 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl">
          {/* Toolbar Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                Raw Post Draft
              </span>
            </div>

            {/* Unicode Formatting Tools */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => applyTextTransform(toUnicodeBold)}
                title="Bold (Highlight text or click word)"
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-extrabold transition-all border border-neutral-700 hover:border-blue-500/50"
              >
                𝗕
              </button>
              <button
                onClick={() => applyTextTransform(toUnicodeItalic)}
                title="Italic (Highlight text or click word)"
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs italic transition-all border border-neutral-700 hover:border-blue-500/50"
              >
                𝘐
              </button>
              <button
                onClick={() => applyTextTransform(toUnicodeBoldItalic)}
                title="Bold Italic"
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-bold italic transition-all border border-neutral-700 hover:border-blue-500/50"
              >
                𝑩𝑰
              </button>
              <button
                onClick={() => applyTextTransform(toUnicodeUnderline)}
                title="Underline"
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-medium transition-all border border-neutral-700 hover:border-blue-500/50"
              >
                U̲
              </button>
              <button
                onClick={() => applyTextTransform(toUnicodeMonospace)}
                title="Monospace Code Font"
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white text-xs font-mono transition-all border border-neutral-700 hover:border-blue-500/50"
              >
                𝙼
              </button>

              <div className="h-4 w-px bg-neutral-800 mx-1" />

              <button
                onClick={handleFixSpacing}
                title="Standardize line spacing for mobile readability"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold transition-all border border-blue-500/30"
              >
                <ListFilter className="w-3.5 h-3.5" /> Fix Spacing
              </button>
              <button
                onClick={handleClearText}
                title="Clear Draft"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-all border border-neutral-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={14}
              className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-blue-500 font-sans leading-relaxed resize-none shadow-inner transition-all placeholder:text-neutral-600"
              placeholder="Write or paste your LinkedIn post draft here..."
            />
          </div>

          {/* Bullet Style Picker & Stats */}
          <div className="space-y-4 pt-2 border-t border-neutral-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Custom Bullet Icon Converter
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {["⚡", "👉", "🚀", "💡", "📌", "✅", "•", "🔹", "🎯"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBulletStyle(b)}
                      className={cn(
                        "w-9 h-9 rounded-xl border text-base font-bold transition-all flex items-center justify-center active:scale-95",
                        bulletStyle === b
                          ? "bg-blue-500/20 border-blue-500 text-white ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20"
                          : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Counts */}
              <div className="flex items-center gap-4 bg-neutral-950 px-4 py-2.5 rounded-2xl border border-neutral-800/80 text-xs">
                <div>
                  <span className="text-neutral-500 block">Characters</span>
                  <span className={cn("font-bold", charCount > 3000 ? "text-red-400" : "text-neutral-200")}>
                    {charCount.toLocaleString()} / 3,000
                  </span>
                </div>
                <div className="h-6 w-px bg-neutral-800" />
                <div>
                  <span className="text-neutral-500 block">Words</span>
                  <span className="font-bold text-neutral-200">{wordCount}</span>
                </div>
                <div className="h-6 w-px bg-neutral-800" />
                <div>
                  <span className="text-neutral-500 block">Read Time</span>
                  <span className="font-bold text-neutral-200">~{readTimeMinutes} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics & Preview Column */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Hook Strength Indicator Card */}
          <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Hook Strength Score
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-xs font-extrabold text-neutral-300 border border-neutral-700">
                  Grade {hookAnalysis.grade}
                </span>
                <span
                  className={cn(
                    "text-xl font-black",
                    hookAnalysis.score >= 75
                      ? "text-emerald-400"
                      : hookAnalysis.score >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  )}
                >
                  {hookAnalysis.score} <span className="text-xs text-neutral-500 font-normal">/ 100</span>
                </span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    hookAnalysis.score >= 75
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : hookAnalysis.score >= 50
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-red-500 to-rose-400"
                  )}
                  style={{ width: `${hookAnalysis.score}%` }}
                />
              </div>
            </div>

            {/* Realtime Feedback Breakdown */}
            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {hookAnalysis.feedback.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/60"
                >
                  {f.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                  {f.type === "warning" && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                  {f.type === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
                  {f.type === "info" && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                  <span className="text-neutral-300 leading-snug">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn Feed Realistic Preview */}
          <div className="p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between space-y-4">
            {/* Header & Controls */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  LinkedIn Feed Preview
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Device Selector */}
                <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={cn(
                      "p-1 rounded-lg text-xs transition-all",
                      previewDevice === "desktop"
                        ? "bg-neutral-800 text-blue-400"
                        : "text-neutral-500 hover:text-neutral-300"
                    )}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={cn(
                      "p-1 rounded-lg text-xs transition-all",
                      previewDevice === "mobile"
                        ? "bg-neutral-800 text-blue-400"
                        : "text-neutral-500 hover:text-neutral-300"
                    )}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Post"}
                </button>
              </div>
            </div>

            {/* LinkedIn Post Mock Box */}
            <div
              className={cn(
                "mx-auto w-full transition-all duration-300 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4",
                previewDevice === "mobile" ? "max-w-xs" : "w-full"
              )}
            >
              {/* Post Author Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0">
                  YOU
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-neutral-100 truncate">Your Name</h4>
                  <p className="text-xs text-neutral-400 truncate">Creator & Industry Leader • 1st</p>
                  <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                    1h • 🌐
                  </p>
                </div>
              </div>

              {/* Feed Post Content */}
              <div className="text-neutral-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans max-h-72 overflow-y-auto pr-1">
                {formattedText ? (
                  <>
                    {!isExpandedPreview && formattedText.length > 180 ? (
                      <div>
                        {formattedText.slice(0, 160)}
                        <button
                          onClick={() => setIsExpandedPreview(true)}
                          className="text-neutral-400 hover:text-blue-400 font-semibold ml-1 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          ...see more
                        </button>
                      </div>
                    ) : (
                      <div>
                        {formattedText}
                        {isExpandedPreview && formattedText.length > 180 && (
                          <button
                            onClick={() => setIsExpandedPreview(false)}
                            className="text-blue-400 hover:underline block text-xs mt-2"
                          >
                            Collapse preview
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-neutral-600 italic">Your formatted LinkedIn post will render here...</span>
                )}
              </div>

              {/* Mock Reactions Footer */}
              <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">👍</span>
                    <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">❤️</span>
                    <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white">💡</span>
                  </span>
                  <span>142 reactions</span>
                </div>
                <span>28 comments • 12 reposts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
