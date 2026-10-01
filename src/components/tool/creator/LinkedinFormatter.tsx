"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  AlertCircle,
  Zap,
  RotateCcw,
  Eye,
  Smartphone,
  Monitor,
  LayoutTemplate,
  FileText,
  TrendingUp,
  Trash2,
  ListFilter,
  CheckCircle2,
  Info,
  ChevronDown,
  BookOpen,
  Compass,
  Flame,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

// Standardized Unicode Converters (Mathematical Alphanumeric Symbols)
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
      if (code === 104) return "\u210e"; // Special Planck constant symbol for 'h'
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

function toUnicodeStrikethrough(text: string): string {
  return text.split("").map((c) => (/[A-Za-z0-9]/.test(c) ? c + "\u0336" : c)).join("");
}

// High-Converting Viral Templates for Creators
interface PostTemplate {
  title: string;
  category: "Storytelling" | "Guide" | "Opinion" | "Case Study" | "Resource" | "Career";
  tag: string;
  text: string;
}

const TEMPLATES: PostTemplate[] = [
  {
    title: "The $50,000 Career Mistake",
    category: "Storytelling",
    tag: "High Engagement",
    text: `I made a $50,000 mistake early in my career.\n\nI thought working 80 hours a week was the only way to win.\n\nHere are 4 harsh truths I learned after building products for 5 years:\n\n- Focus on high-leverage decisions over busywork\n- Rest is a core multiplier of output\n- Systems beat hustle every single time\n- Delegation is key to scaling\n\nWhat is the biggest lesson you learned the hard way?`
  },
  {
    title: "The 9-to-5 Launch Blueprint",
    category: "Guide",
    tag: "Actionable",
    text: `How to build a $10k/mo side project while working a 9-to-5:\n\n(Without burning out or quitting your job)\n\nA step-by-step breakdown of my exact framework:\n\n1. Identify a hyper-specific problem people pay to solve\n2. Build a minimal prototype in 48 hours\n3. Pre-sell to 10 customers before writing full code\n4. Automate customer support from Day 1\n\nSave this post for your next weekend build.`
  },
  {
    title: "The Contrarian Industry Take",
    category: "Opinion",
    tag: "Thought Leadership",
    text: `Unpopular opinion: Most resume advice on LinkedIn is completely outdated.\n\nRecruiters don't spend 5 minutes reading your objective statement.\n\nThey scan your profile for 6 seconds looking for 3 specific things:\n\n- Quantifiable metric results ($ raised, % growth, users acquired)\n- Proof of domain mastery\n- Clear communication style\n\nStop listing job duties. Start listing business impact.`
  },
  {
    title: "Before & After Conversion Growth",
    category: "Case Study",
    tag: "Metric Driven",
    text: `In 2023, our landing page converted at 1.8%.\n\nLast month, we hit 8.4% conversion without changing our pricing.\n\nHere are the 3 copy tweaks that made all the difference:\n\n- Removed jargon from the hero headline\n- Added social proof above the fold\n- Simplified our CTA to a single action\n\nWhich of these are you trying first?`
  },
  {
    title: "5 High-Leverage Creative Tools",
    category: "Resource",
    tag: "Viral List",
    text: `I spent 100+ hours testing free creator tools so you don't have to.\n\nHere are 5 powerful tools that save 15+ hours every single week:\n\n- Tool 1: Clean background voice & audio splitter\n- Tool 2: High-converting video hook script builder\n- Tool 3: Realistic LinkedIn feed preview & text styler\n- Tool 4: Instant swipeable social carousel maker\n- Tool 5: High-contrast YouTube thumbnail analyzer\n\nBookmark this list for your next content batch.`
  },
  {
    title: "The Uncomfortable Career Pivot",
    category: "Career",
    tag: "Relatable Story",
    text: `12 months ago, I walked away from a comfortable corporate salary.\n\nEveryone told me I was crazy.\n\nHere is what nobody tells you about starting from zero at 30:\n\n- Month 1-3: Terrifying silence and imposter syndrome\n- Month 4-6: The first small customer that proves you are not delusional\n- Month 7-9: Systems start replacing chaotic panic\n- Month 10-12: Complete control over your time and craft\n\nThe real risk was never failing. The real risk was never trying.`
  }
];

export default function LinkedinFormatter() {
  const [rawText, setRawText] = useState(TEMPLATES[0].text);
  const [bulletStyle, setBulletStyle] = useState("⚡");
  const [copied, setCopied] = useState(false);
  const [isExpandedPreview, setIsExpandedPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0].title);
  const [authorName, setAuthorName] = useState("Your Name");
  const [authorHeadline, setAuthorHeadline] = useState("Creator & Industry Leader • 1st");

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

  // Convert lines into bullet points
  const handleApplyBulletsToLines = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      // Bulletize selected text lines
      const selected = rawText.substring(start, end);
      const converted = selected
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return line;
          const clean = trimmed.replace(/^([-*•⚡👉🚀💡📌✅🔹🎯]|\d+\.)\s*/, "");
          return `${bulletStyle} ${clean}`;
        })
        .join("\n");
      const updated = rawText.substring(0, start) + converted + rawText.substring(end);
      setRawText(updated);
    } else {
      // Convert all dash or bullet lines in entire text
      const updated = rawText
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("* ") ||
            trimmed.startsWith("• ") ||
            /^\d+\.\s/.test(trimmed)
          ) {
            const clean = trimmed.replace(/^([-*•]|\d+\.)\s*/, "");
            return `${bulletStyle} ${clean}`;
          }
          return line;
        })
        .join("\n");
      setRawText(updated);
    }
  };

  // Standardize paragraph line spacing for mobile readability
  const handleFixSpacing = () => {
    if (!rawText) return;
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

  // Formatted output with dynamic bullet styling for preview
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

  // Hook Strength & Post Performance Rating
  const hookAnalysis = useMemo(() => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      return {
        score: 0,
        grade: "N/A",
        hookLength: 0,
        hookText: "",
        feedback: [
          {
            type: "info" as const,
            title: "Ready for your draft",
            text: "Type or pick a template to see real-time hook ratings and line suggestions."
          }
        ]
      };
    }

    const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
    const firstLine = lines[0] || "";
    const hookLength = firstLine.length;

    let score = 0;
    const feedback: { type: "success" | "warning" | "error" | "info"; title: string; text: string }[] = [];

    // 1. Hook Length evaluation (0 - 35 pts)
    if (hookLength >= 35 && hookLength <= 110) {
      score += 35;
      feedback.push({
        type: "success",
        title: "Optimal Hook Length",
        text: `Great length (${hookLength} characters). Fits comfortably before the LinkedIn '...see more' cutoff button.`
      });
    } else if (hookLength >= 20 && hookLength < 35) {
      score += 22;
      feedback.push({
        type: "warning",
        title: "Slightly Short",
        text: `Short opener (${hookLength} characters). Add a curiosity angle or stakes to stop feed scrollers.`
      });
    } else if (hookLength > 110 && hookLength <= 145) {
      score += 18;
      feedback.push({
        type: "warning",
        title: "接近 Cutoff Limit",
        text: `Close to the cutoff (${hookLength} characters). Mobile screens may clip your key words before readers tap more.`
      });
    } else if (hookLength < 20) {
      score += 5;
      feedback.push({
        type: "error",
        title: "Too Short",
        text: `Opening line has only ${hookLength} characters. Expand with a specific story hook, metric, or problem.`
      });
    } else {
      score += 10;
      feedback.push({
        type: "error",
        title: "Too Long",
        text: `Opening line is ${hookLength} characters. Shorten to under 110 characters so your punchline isn't cut off.`
      });
    }

    // 2. Power Words & Psychological Triggers (0 - 30 pts)
    const powerWordRegex = /(mistake|secret|stop|never|how i|why|percent|%|\$|unpopular|truth|roadmap|framework|built|grew|failed|lessons|system|blueprint|hacks|step|strategy|don't|won't|revenue|salary|zero|guaranteed|reason|nobody|harsh|honest)/i;
    const matchesPowerWord = powerWordRegex.test(firstLine);
    if (matchesPowerWord) {
      score += 30;
      feedback.push({
        type: "success",
        title: "High-Converting Trigger Words",
        text: "Includes strong emotional curiosity triggers that encourage readers to pause and click."
      });
    } else {
      feedback.push({
        type: "warning",
        title: "Add Curiosity Triggers",
        text: "Consider adding words like 'mistake', 'framework', 'unpopular', 'how I', or 'truth' for curiosity."
      });
    }

    // 3. Numbers & Specific Measurable Data (0 - 20 pts)
    const hasNumbers = /\d+|%|\$/.test(firstLine);
    if (hasNumbers) {
      score += 20;
      feedback.push({
        type: "success",
        title: "Clear Credibility Numbers",
        text: "Contains specific metrics or numbers, boosting click-through credibility by ~38%."
      });
    } else {
      feedback.push({
        type: "info",
        title: "Consider Adding Metrics",
        text: "Posts with specific numbers (e.g. '$10k', '48 hours', '3 steps') gain higher reader trust."
      });
    }

    // 4. Structure & Spacing Check (0 - 15 pts)
    const hasGoodSpacing = rawText.includes("\n\n");
    const paragraphsCount = rawText.split("\n\n").length;
    if (hasGoodSpacing && paragraphsCount >= 3) {
      score += 15;
      feedback.push({
        type: "success",
        title: "Clean Breathable Spacing",
        text: "Excellent paragraph spacing. Easy to scan and read on both smartphones and laptops."
      });
    } else if (!hasGoodSpacing && rawText.length > 200) {
      score += 0;
      feedback.push({
        type: "error",
        title: "Wall of Text Warning",
        text: "Long text block without spacing. Click 'Format Spacing' to break text into digestible lines."
      });
    } else {
      score += 8;
      feedback.push({
        type: "info",
        title: "Add Paragraph Breaks",
        text: "Separate your thoughts into 1-2 sentence lines for comfortable mobile viewing."
      });
    }

    // Check for spammy all-caps
    const uppercaseRatio = (firstLine.match(/[A-Z]/g) || []).length / (firstLine.length || 1);
    if (uppercaseRatio > 0.45 && firstLine.length > 15) {
      score = Math.max(10, score - 20);
      feedback.push({
        type: "error",
        title: "Avoid All Caps",
        text: "Too many capital letters in your opener. Use normal sentence capitalization to look professional."
      });
    }

    let grade = "C";
    if (score >= 88) grade = "A+";
    else if (score >= 75) grade = "A";
    else if (score >= 60) grade = "B";
    else if (score >= 40) grade = "C";
    else grade = "D";

    return {
      score: Math.min(100, score),
      grade,
      hookLength,
      hookText: firstLine,
      feedback
    };
  }, [rawText]);

  // Copy with confirmation
  const handleCopy = () => {
    if (!formattedText) return;
    void navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text stats
  const charCount = rawText.length;
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const lineCount = rawText ? rawText.split("\n").length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="w-full space-y-7 text-zinc-100">
      {/* 1-Click Viral Hook Blueprints */}
      <div className="rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(99,102,241,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Viral Hook Blueprints
              </span>
              <p className="text-[11px] text-zinc-400 font-medium">
                Click any proven structure to load it directly into your post editor
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/90 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 self-start sm:self-auto">
            {TEMPLATES.length} Formats Available
          </span>
        </div>

        {/* All 6 Templates - Clean Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.title;
            return (
              <button
                key={tmpl.title}
                type="button"
                onClick={() => {
                  setRawText(tmpl.text);
                  setSelectedTemplate(tmpl.title);
                }}
                className={cn(
                  "relative flex flex-col items-start justify-between text-left p-3.5 rounded-2xl transition-all duration-200 border cursor-pointer min-h-[96px]",
                  isSelected
                    ? "bg-indigo-600/25 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white"
                    : "bg-[#0c0e18] border-white/10 text-zinc-300 hover:border-indigo-500/40 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-colors",
                      isSelected
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-zinc-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300"
                    )}
                  >
                    {tmpl.category}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-300 shrink-0" />}
                </div>

                <p className="text-xs font-bold leading-snug line-clamp-2 text-zinc-200 group-hover:text-white">
                  {tmpl.title}
                </p>

                <span className="text-[9px] text-zinc-500 font-medium mt-1 truncate w-full">
                  {tmpl.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Editor vs Live Preview & Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Draft Post Editor */}
        <div className="lg:col-span-7 space-y-4 rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(99,102,241,0.06)]">
          {/* Editor Header & Format Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                Your Post Draft
              </span>
            </div>

            {/* Unicode Styling Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyTextTransform(toUnicodeBold)}
                title="Bold (Transform highlighted word)"
                className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs font-black transition-all border border-white/10 hover:border-indigo-400/50 cursor-pointer"
              >
                𝗕
              </button>
              <button
                type="button"
                onClick={() => applyTextTransform(toUnicodeItalic)}
                title="Italic (Transform highlighted word)"
                className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs italic font-serif transition-all border border-white/10 hover:border-indigo-400/50 cursor-pointer"
              >
                𝘐
              </button>
              <button
                type="button"
                onClick={() => applyTextTransform(toUnicodeBoldItalic)}
                title="Bold Italic"
                className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs font-black italic transition-all border border-white/10 hover:border-indigo-400/50 cursor-pointer"
              >
                𝑩𝑰
              </button>
              <button
                type="button"
                onClick={() => applyTextTransform(toUnicodeUnderline)}
                title="Underline"
                className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs font-medium transition-all border border-white/10 hover:border-indigo-400/50 cursor-pointer"
              >
                U̲
              </button>
              <button
                type="button"
                onClick={() => applyTextTransform(toUnicodeMonospace)}
                title="Typewriter Monospace Font"
                className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs font-mono transition-all border border-white/10 hover:border-indigo-400/50 cursor-pointer"
              >
                𝙼
              </button>
              <button
                type="button"
                onClick={() => applyTextTransform(toUnicodeStrikethrough)}
                title="Strikethrough"
                className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs transition-all border border-white/10 hover:border-indigo-400/50 cursor-pointer"
              >
                S̶
              </button>

              <div className="h-4 w-px bg-white/10 mx-1" />

              <button
                type="button"
                onClick={handleFixSpacing}
                title="Standardize paragraph line breaks for easy mobile reading"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-bold transition-all border border-indigo-500/30 cursor-pointer"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Format Spacing</span>
              </button>

              <button
                type="button"
                onClick={handleApplyBulletsToLines}
                title="Add current bullet symbol to lines"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-all border border-white/10 hover:border-indigo-400/50 cursor-pointer"
              >
                <span>Add Bullets</span>
              </button>

              <button
                type="button"
                onClick={handleClearText}
                title="Clear Draft"
                className="p-1.5 rounded-lg bg-black/60 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-all border border-white/10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Writing Surface */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={15}
              className="w-full p-4.5 rounded-2xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/80 font-sans leading-relaxed resize-none shadow-inner transition-all placeholder:text-zinc-600"
              placeholder="Write your LinkedIn post here, or paste raw notes to polish them with line breaks and formatting..."
            />
          </div>

          {/* Bullet Points Selector & Stats Grid */}
          <div className="space-y-4 pt-3 border-t border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                  Bullet Points & Emojis
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {["⚡", "👉", "🚀", "💡", "📌", "✅", "•", "🔹", "🎯"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBulletStyle(b)}
                      className={cn(
                        "w-9 h-9 rounded-xl border text-base font-bold transition-all flex items-center justify-center active:scale-95 cursor-pointer",
                        bulletStyle === b
                          ? "bg-indigo-600/30 border-indigo-400 text-white shadow-md shadow-indigo-500/25 scale-105"
                          : "bg-black/50 border-white/10 text-zinc-400 hover:border-indigo-500/40 hover:text-white"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-Time Post Metrics */}
              <div className="flex items-center gap-3 bg-black/60 px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Characters</span>
                  <span className={cn("font-bold text-sm", charCount > 3000 ? "text-red-400" : "text-white")}>
                    {charCount.toLocaleString()} <span className="text-[11px] text-zinc-500 font-normal">/ 3k</span>
                  </span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Words</span>
                  <span className="font-bold text-sm text-white">{wordCount}</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Read Time</span>
                  <span className="font-bold text-sm text-white">~{readTimeMinutes} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Opening Hook Score & LinkedIn Live Preview */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Opening Hook Strength Score Card */}
          <div className="rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(99,102,241,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    Opening Hook Score
                  </span>
                  <p className="text-[11px] text-zinc-400 font-medium">Live rating for your first line</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border",
                    hookAnalysis.score >= 88
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                      : hookAnalysis.score >= 70
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                      : hookAnalysis.score >= 50
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-red-500/20 text-red-300 border-red-500/40"
                  )}
                >
                  Grade {hookAnalysis.grade}
                </span>
                <span
                  className={cn(
                    "text-xl font-black tracking-tight",
                    hookAnalysis.score >= 75
                      ? "text-emerald-400"
                      : hookAnalysis.score >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  )}
                >
                  {hookAnalysis.score}
                  <span className="text-xs text-zinc-500 font-normal"> / 100</span>
                </span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    hookAnalysis.score >= 85
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : hookAnalysis.score >= 60
                      ? "bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : hookAnalysis.score >= 40
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                      : "bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                  )}
                  style={{ width: `${Math.max(4, hookAnalysis.score)}%` }}
                />
              </div>
            </div>

            {/* Actionable Feedback Pills */}
            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {hookAnalysis.feedback.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-black/50 border border-white/10 transition-colors"
                >
                  {item.type === "success" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {item.type === "warning" && (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  {item.type === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  {item.type === "info" && (
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{item.title}</span>
                    <span className="text-zinc-300 leading-snug">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn Realistic Feed Preview Card */}
          <div className="rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(99,102,241,0.06)] flex-1 flex flex-col justify-between space-y-4">
            {/* Header & Controls */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    LinkedIn Feed Preview
                  </span>
                  <p className="text-[11px] text-zinc-400 font-medium">How viewers see your post</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Device Selector */}
                <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                      previewDevice === "desktop"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    )}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                      previewDevice === "mobile"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    )}
                    title="Mobile App Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Copy Formatted Post Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Post"}</span>
                </button>
              </div>
            </div>

            {/* LinkedIn Mock Feed Post Box */}
            <div
              className={cn(
                "mx-auto w-full transition-all duration-300 bg-[#0e111a] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4",
                previewDevice === "mobile" ? "max-w-xs" : "w-full"
              )}
            >
              {/* Post Author Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white text-xs shadow-md shrink-0 border border-indigo-400/40">
                  YOU
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {authorName}
                    </h4>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      You
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">{authorHeadline}</p>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    Just now • Edited • 🌐
                  </p>
                </div>
              </div>

              {/* Feed Post Content with Cutoff */}
              <div className="text-zinc-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans max-h-72 overflow-y-auto pr-1">
                {formattedText ? (
                  <>
                    {!isExpandedPreview && formattedText.length > (previewDevice === "mobile" ? 140 : 210) ? (
                      <div>
                        {formattedText.slice(0, previewDevice === "mobile" ? 130 : 190)}
                        <button
                          type="button"
                          onClick={() => setIsExpandedPreview(true)}
                          className="text-zinc-400 hover:text-indigo-400 font-bold ml-1 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          ...see more
                        </button>
                      </div>
                    ) : (
                      <div>
                        {formattedText}
                        {isExpandedPreview && formattedText.length > (previewDevice === "mobile" ? 140 : 210) && (
                          <button
                            type="button"
                            onClick={() => setIsExpandedPreview(false)}
                            className="text-indigo-400 hover:underline block text-xs mt-2 font-bold cursor-pointer"
                          >
                            Collapse preview
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-zinc-600 italic">Your formatted LinkedIn post will render here live...</span>
                )}
              </div>

              {/* Realistic Reactions Count Bar */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white shadow-sm ring-1 ring-black">👍</span>
                    <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white shadow-sm ring-1 ring-black">❤️</span>
                    <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white shadow-sm ring-1 ring-black">💡</span>
                  </div>
                  <span className="font-semibold text-zinc-300">184 reactions</span>
                </div>
                <span>42 comments • 16 reposts</span>
              </div>

              {/* Realistic Interactive Action Buttons */}
              <div className="pt-2 border-t border-white/5 grid grid-cols-4 gap-1 text-[11px] font-semibold text-zinc-400">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Like</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Comment</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                >
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Repost</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
