"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  SearchCode, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Tag, 
  Replace, 
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles as SparklesProhibited
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// ============================================================================
// TYPES & BLUEPRINTS (Zero Tech Jargon, 100% Everyday English)
// ============================================================================

export interface RegexBlueprint {
  id: string;
  title: string;
  category: string;
  pattern: string;
  flags: string;
  testText: string;
  description: string;
}

export const REGEX_BLUEPRINTS: RegexBlueprint[] = [
  {
    id: "email-validator",
    title: "Email Address Pattern",
    category: "Form Validation",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "gi",
    testText: "Contact support at alex@exismic.xyz or reach out to sales@company.org for licensing inquiries.",
    description: "Standard pattern matching email usernames, domain names, and top-level domain extensions."
  },
  {
    id: "url-extractor",
    title: "URL & Website Link Extractor",
    category: "Web Scraping",
    pattern: "https?://[\\w-]+(\\.[\\w-]+)+(/[\\w-.,@?^=%&:/~+#]*)?",
    flags: "gi",
    testText: "Check our tools at https://exismic.xyz/tools and API docs at https://docs.exismic.xyz/v1/auth.",
    description: "Extracts secure HTTP and HTTPS web URLs with paths, queries, and hash fragments."
  },
  {
    id: "iso-date",
    title: "Date Formats (YYYY-MM-DD)",
    category: "Dates & Time",
    pattern: "(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])",
    flags: "g",
    testText: "Project milestone scheduled for 2026-09-30 with release deployment on 2026-10-15.",
    description: "Matches calendar dates with capture groups for Year (Group 1), Month (Group 2), and Day (Group 3)."
  },
  {
    id: "hex-colors",
    title: "Hex Color Codes (#fff)",
    category: "CSS Styling",
    pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b",
    flags: "gi",
    testText: "Primary brand theme is #84cc16 with dark obsidian #090a12 and crisp text #ffffff.",
    description: "Finds 3-digit and 6-digit hexadecimal web color values with the leading hash."
  },
  {
    id: "phone-numbers",
    title: "Phone Numbers (International)",
    category: "Contact Info",
    pattern: "(\\+?\\d{1,3}[- ]?)?\\(?\\d{3}\\)?[- ]?\\d{3}[- ]?\\d{4}",
    flags: "g",
    testText: "Call our customer line at +1 (555) 234-5678 or local office 555-876-5432.",
    description: "Matches international and standard domestic telephone numbers with country codes."
  },
  {
    id: "ip-addresses",
    title: "IPv4 Network Addresses",
    category: "Networking",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    testText: "Server cluster gateway: 192.168.1.1 routing to cloud DNS 8.8.8.8 and backup 1.1.1.1.",
    description: "Validates 4-octet IPv4 addresses ensuring numbers never exceed 255."
  }
];

export default function RegexTester() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("email-validator");
  const [pattern, setPattern] = useState<string>(REGEX_BLUEPRINTS[0].pattern);
  const [flags, setFlags] = useState<string>(REGEX_BLUEPRINTS[0].flags);
  const [testText, setTestText] = useState<string>(REGEX_BLUEPRINTS[0].testText);

  // Substitution / Replace Mode State
  const [isReplaceMode, setIsReplaceMode] = useState<boolean>(false);
  const [replacementPattern, setReplacementPattern] = useState<string>("[REDACTED]");
  const [copied, setCopied] = useState<boolean>(false);

  // Regex Evaluation Engine
  const evaluation = useMemo(() => {
    if (!pattern.trim()) {
      return { matches: [], isValid: true, error: null, replacedText: testText };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches: Array<{
        text: string;
        index: number;
        groups: string[];
      }> = [];

      let replaced = testText;
      if (isReplaceMode) {
        replaced = testText.replace(regex, replacementPattern);
      }

      if (flags.includes("g")) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      return { matches, isValid: true, error: null, replacedText: replaced };
    } catch (err: any) {
      return { matches: [], isValid: false, error: err.message, replacedText: testText };
    }
  }, [pattern, flags, testText, isReplaceMode, replacementPattern]);

  // Load a Blueprint
  const handleSelectBlueprint = (bp: RegexBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setPattern(bp.pattern);
    setFlags(bp.flags);
    setTestText(bp.testText);
  };

  // Reset to Baseline
  const handleReset = () => {
    handleSelectBlueprint(REGEX_BLUEPRINTS[0]);
    setIsReplaceMode(false);
  };

  // Toggle Single Flag
  const toggleFlag = (f: string) => {
    if (flags.includes(f)) {
      setFlags(flags.replace(f, ""));
    } else {
      setFlags(flags + f);
    }
  };

  // Highlight matches directly in the test string
  const highlightedContent = useMemo(() => {
    if (!evaluation.isValid || evaluation.matches.length === 0 || !pattern.trim()) {
      return <span>{testText}</span>;
    }

    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(testText)) !== null) {
        // Preceding non-match text
        if (match.index > lastIndex) {
          parts.push(
            <span key={`text-${lastIndex}`}>{testText.slice(lastIndex, match.index)}</span>
          );
        }

        // Highlighted match
        parts.push(
          <mark
            key={`match-${match.index}`}
            className="bg-lime-400 text-black font-mono font-bold px-1.5 py-0.5 rounded-md shadow-sm shadow-lime-400/40 inline-block"
          >
            {match[0]}
          </mark>
        );

        lastIndex = regex.lastIndex;
        if (match.index === regex.lastIndex) regex.lastIndex++;
      }

      // Remaining non-match text
      if (lastIndex < testText.length) {
        parts.push(<span key={`text-${lastIndex}`}>{testText.slice(lastIndex)}</span>);
      }

      return parts;
    } catch {
      return <span>{testText}</span>;
    }
  }, [testText, pattern, flags, evaluation]);

  // Copy Clean Regex Expression
  const handleCopyExpression = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner / Quick Actions */}
      <div className="rounded-3xl border border-lime-500/20 bg-gradient-to-b from-lime-500/5 to-transparent p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shrink-0">
              <SearchCode size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Regular Expression Tester & Debugger</span>
                <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-500/10 border border-lime-500/20 px-2 py-0.5 rounded-full">
                  ECMAScript Compatible
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Interactive pattern evaluator with live visual highlights and substitution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset fields to baseline"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={handleCopyExpression}
              className="px-4 py-2 rounded-2xl bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/40 text-xs font-bold text-lime-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-lime-500/10"
            >
              {copied ? <Check size={14} className="text-lime-400" /> : <Copy size={14} />}
              <span>{copied ? "Expression Copied!" : "Copy /pattern/flags"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Curated Production Blueprints (Spacious 3-Column Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-lime-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Tested Regular Expression Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to pre-fill tested validation formulas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {REGEX_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-lime-500/15 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-lime-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-300 border border-lime-500/20 whitespace-nowrap shrink-0">
                    {bp.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate text-right">
                    /{bp.flags}/
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-lime-300 transition-colors line-clamp-1">
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

      {/* Main Studio Interactive Workspace: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pattern & Flag Builder (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5">
            {/* Pattern Input with Leading and Trailing Slash */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Regular Expression Pattern
                </label>
                {evaluation.isValid ? (
                  <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-500/10 border border-lime-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={10} /> Valid Syntax
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle size={10} /> Invalid Syntax
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-base font-bold">
                  /
                </span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => {
                    setPattern(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  placeholder="e.g. [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 pl-8 pr-16 py-3.5 text-xs font-mono text-lime-300 focus:border-lime-500 focus:outline-none transition-all placeholder:text-zinc-600"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lime-400 font-mono text-xs font-bold bg-lime-500/10 px-2 py-1 rounded-lg border border-lime-500/20">
                  /{flags}
                </span>
              </div>

              {!evaluation.isValid && (
                <p className="text-xs font-mono text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  {evaluation.error}
                </p>
              )}
            </div>

            {/* Interactive Flag Toggles */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                Evaluation Flags
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { flag: "g", label: "Global", desc: "Find all matches (g)" },
                  { flag: "i", label: "Ignore Case", desc: "Case-insensitive (i)" },
                  { flag: "m", label: "Multiline", desc: "^ and $ match lines (m)" },
                  { flag: "s", label: "DotAll", desc: ". matches newlines (s)" }
                ].map((item) => {
                  const isActive = flags.includes(item.flag);
                  return (
                    <button
                      key={item.flag}
                      type="button"
                      onClick={() => toggleFlag(item.flag)}
                      className={cn(
                        "p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                        isActive
                          ? "bg-lime-500/20 border-lime-500 text-lime-300 font-black shadow-md shadow-lime-500/10"
                          : "bg-black/40 border-white/10 text-zinc-500 hover:text-white"
                      )}
                    >
                      <span className="text-xs font-mono font-bold uppercase">{item.flag}</span>
                      <span className="text-[10px] truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Substitution / Replace Mode Toggle */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReplaceMode}
                    onChange={(e) => setIsReplaceMode(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-lime-500 focus:ring-lime-500"
                  />
                  <span>Enable Substitution / Replace Mode</span>
                </label>
              </div>

              {isReplaceMode && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    Replacement String
                  </label>
                  <input
                    type="text"
                    value={replacementPattern}
                    onChange={(e) => setReplacementPattern(e.target.value)}
                    placeholder="Replacement string (e.g. $1 or [REDACTED])..."
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs font-mono text-white focus:border-lime-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Test String Input */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-lime-400" />
                  <span>Test String Content</span>
                </label>
                <span className="text-[11px] font-mono text-zinc-500">
                  {testText.length} characters
                </span>
              </div>

              <textarea
                rows={5}
                value={testText}
                onChange={(e) => {
                  setTestText(e.target.value);
                  setSelectedBlueprintId("");
                }}
                placeholder="Enter sample text to test your regular expression against..."
                className="w-full rounded-2xl border border-white/10 bg-black/60 p-4 text-xs font-mono text-zinc-200 focus:border-lime-500 focus:outline-none transition-all resize-y leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Match Highlights & Groups (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5">
            {/* Header Status */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Live Match Highlighting Stage
              </span>
              <span className={cn(
                "text-xs font-bold font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5",
                evaluation.matches.length > 0
                  ? "bg-lime-500/10 text-lime-400 border-lime-500/30"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              )}>
                <CheckCircle2 size={13} />
                <span>{evaluation.matches.length} Matches Found</span>
              </span>
            </div>

            {/* Visual Highlight Surface */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400">Interactive Visual Canvas</label>
              <div className="w-full rounded-2xl border border-white/10 bg-black/80 p-4 min-h-[160px] max-h-[220px] overflow-y-auto text-xs font-mono leading-relaxed select-text">
                {highlightedContent}
              </div>
            </div>

            {/* Replaced Text Preview if Active */}
            {isReplaceMode && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                  <Replace size={13} className="text-lime-400" />
                  <span>Substituted Output Preview</span>
                </label>
                <div className="w-full rounded-2xl border border-white/10 bg-black/80 p-4 max-h-[140px] overflow-y-auto text-xs font-mono text-lime-300 leading-relaxed select-all">
                  {evaluation.replacedText}
                </div>
              </div>
            )}

            {/* Matches & Capture Groups List */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Match Breakdown & Groups
                </span>
                <span className="text-[11px] text-zinc-500">
                  {evaluation.matches.length} item{evaluation.matches.length === 1 ? "" : "s"}
                </span>
              </div>

              {evaluation.matches.length > 0 ? (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {evaluation.matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-black/60 border border-white/10 flex flex-col gap-1.5 group hover:border-lime-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-lime-300 bg-lime-500/10 px-2 py-0.5 rounded-lg border border-lime-500/20">
                          {m.text}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Index: {m.index} - {m.index + m.text.length}
                        </span>
                      </div>

                      {m.groups.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                          {m.groups.map((grp, gIdx) => (
                            <span
                              key={gIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10"
                            >
                              Group #{gIdx + 1}: <strong className="text-lime-400">{grp}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center text-zinc-500 text-xs">
                  No regex matches found in test string. Try adjusting pattern or flags.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention & History */}
      <ResultRetentionBar
        toolType="developer"
        toolName="Regex Tester & Debugger"
        title="Tested Regular Expression"
        content={`Pattern: /${pattern}/${flags}\nMatches: ${evaluation.matches.length}\nTest Text: ${testText}`}
      />

      {/* Tool Suggestions */}
      <ToolSuggestions currentToolId="regex-tester" />

      {/* Tool Workflow Chaining */}
      <ToolWorkflowChaining currentToolId="regex-tester" />
    </div>
  );
}
