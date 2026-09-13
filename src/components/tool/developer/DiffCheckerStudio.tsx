"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  GitCompare,
  Copy,
  Check,
  Download,
  RotateCcw,
  ArrowLeftRight,
  Sliders,
  Eye,
  FileText,
  FileCode2,
  Sparkles,
  Layers,
  Columns2,
  ListFilter,
  Trash2,
  CheckCircle2,
  UploadCloud,
  FileDiff,
  Maximize2,
  Code2,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export type DiffViewMode = "split" | "unified";
export type DiffGranularity = "words" | "lines";

export interface WordToken {
  text: string;
  type: "unchanged" | "added" | "removed";
}

export interface DiffRow {
  id: string;
  type: "unchanged" | "added" | "removed" | "modified";
  leftLineNumber?: number;
  rightLineNumber?: number;
  leftText?: string;
  rightText?: string;
  leftTokens?: WordToken[];
  rightTokens?: WordToken[];
}

export interface DiffStats {
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  unchangedLines: number;
  totalLines: number;
  similarityPercent: number;
}

// ============================================================================
// BUILT-IN SAMPLE PRESETS (Real-World & Educational)
// ============================================================================

interface DiffPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  leftTitle: string;
  rightTitle: string;
  leftContent: string;
  rightContent: string;
}

const PRESETS: DiffPreset[] = [
  {
    id: "react-hook-refactor",
    title: "TypeScript / React Hook Refactor",
    category: "Developer Code",
    description: "Refactoring legacy class component lifecycle to modern React Hooks",
    leftTitle: "Legacy Class (UserProfile.tsx)",
    rightTitle: "Modern Hook (UserProfile.tsx)",
    leftContent: `import React, { Component } from 'react';
import axios from 'axios';

interface Props {
  userId: string;
}

interface State {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export class UserProfile extends Component<Props, State> {
  state: State = {
    user: null,
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.fetchUser(this.props.userId);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser(this.props.userId);
    }
  }

  fetchUser = async (id: string) => {
    this.setState({ loading: true });
    try {
      const res = await axios.get(\`/api/users/\${id}\`);
      this.setState({ user: res.data, loading: false });
    } catch (err: any) {
      this.setState({ error: err.message, loading: false });
    }
  };

  render() {
    const { user, loading, error } = this.state;
    if (loading) return <div>Loading user profile...</div>;
    if (error) return <div>Error: {error}</div>;
    return <h1>{user?.name}</h1>;
  }
}`,
    rightContent: `import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
  userId: string;
}

export function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(\`/api/users/\${userId}\`);
        if (!isCancelled) {
          setUser(res.data);
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      isCancelled = true;
    };
  }, [userId]);

  if (loading) return <div>Loading user profile...</div>;
  if (error) return <div>Error: {error}</div>;
  return <h1>{user?.name}</h1>;
}`,
  },
  {
    id: "legal-clause-revision",
    title: "Legal Contract Clause (NDA)",
    category: "Legal & Business",
    description: "Confidentiality clause negotiating survival terms and governing jurisdiction",
    leftTitle: "Original Draft (Vendor Term)",
    rightTitle: "Revised Negotiated Clause",
    leftContent: `Section 4. Confidentiality & Non-Disclosure.

Each party agrees that all Confidential Information disclosed hereunder shall remain the property of the Disclosing Party. 
The Receiving Party shall exercise reasonable care, but not less than standard commercial care, to prevent the disclosure of any Confidential Information to third parties.

This obligation of confidentiality shall survive for a period of two (2) years following the termination of this Agreement.

The Receiving Party shall have no obligation to return or destroy Confidential Information maintained on automated archival backup systems, provided such data is not actively accessed.

This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of laws principles.`,
    rightContent: `Section 4. Confidentiality & Non-Disclosure.

Each party agrees that all Confidential Information disclosed hereunder shall remain the exclusive property of the Disclosing Party. 
The Receiving Party shall exercise the highest degree of care, and in no event less than standard commercial care, to prevent any unauthorized disclosure of Confidential Information.

This obligation of confidentiality shall survive for a period of five (5) years following the termination or expiration of this Agreement, except for Trade Secrets which shall survive indefinitely.

The Receiving Party must immediately return or permanently destroy all Confidential Information within ten (10) business days upon written request.

This Agreement shall be governed by and construed in accordance with the laws of the State of California, and parties consent to the exclusive jurisdiction of the state courts located in San Francisco County.`,
  },
  {
    id: "academic-essay-polish",
    title: "College Essay Draft & Thesis Polish",
    category: "Student & Writing",
    description: "Transforming a generic introductory paragraph into a sharp, evidence-backed thesis",
    leftTitle: "First Draft (Raw Notes)",
    rightTitle: "Polished Submission Draft",
    leftContent: `The Industrial Revolution was a very big deal in Europe. It changed almost everything about how people worked and lived. 
Before machines were invented, people mostly worked on farms and made things by hand in their villages.
Then steam engines were invented by James Watt and people started working in factories in big cities. 
This was bad because cities were dirty and dangerous for young children who had to work long hours.
In this paper, I will discuss why the Industrial Revolution had both positive and negative consequences for European society.`,
    rightContent: `The European Industrial Revolution marked a profound systemic transition from agrarian subsistence to mechanized factory capitalism.
Prior to mechanization, regional commerce operated primarily through localized cottage guilds and manual rural craftsmanship.
The introduction of high-pressure steam propulsion and mechanized textile looms catalyzed rapid urbanization, concentrating unprecedented labor populations into industrial centers.
While this manufacturing acceleration generated unprecedented capital formation, it simultaneously imposed severe socioeconomic vulnerabilities through tenement squalor and hazardous child labor exploitation.
This essay demonstrates that the Industrial Revolution restructured social stratification by giving birth to the urban industrial working class and sparking modern labor protections.`,
  },
  {
    id: "json-api-payload",
    title: "JSON API Response Schema (v1 vs v2)",
    category: "API & Data",
    description: "API payload upgrade with OAuth token deprecation and user profile expansion",
    leftTitle: "API v1 Response",
    rightTitle: "API v2 Response (OAuth2)",
    leftContent: `{
  "apiVersion": "1.4.0",
  "status": "success",
  "data": {
    "userId": "usr_99812",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "apiKey": "sk_live_9a87fbc9901b",
    "role": "editor",
    "quota": 5000,
    "createdAt": "2024-01-15T08:30:00Z"
  }
}`,
    rightContent: `{
  "apiVersion": "2.1.0",
  "status": "success",
  "data": {
    "userId": "usr_99812",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "role": "team_admin",
    "permissions": ["read", "write", "billing:manage", "team:invite"],
    "authMethod": "oauth2_google",
    "quota": {
      "total": 25000,
      "used": 4210,
      "resetDate": "2026-10-01T00:00:00Z"
    },
    "profile": {
      "avatarUrl": "https://cdn.exismic.xyz/avatars/usr_99812.png",
      "verified": true,
      "timezone": "America/New_York"
    },
    "createdAt": "2024-01-15T08:30:00Z"
  }
}`,
  },
];

// ============================================================================
// LCS DIFF ALGORITHM (Longest Common Subsequence Engine)
// ============================================================================

/**
 * Splits line into words, spaces, and punctuation tokens for granular highlighting
 */
function tokenizeString(str: string): string[] {
  return str.split(/(\s+|[^\w\s]+)/).filter((t) => t.length > 0);
}

/**
 * Computes word-level diff between two lines using LCS
 */
function diffWords(
  strA: string,
  strB: string,
  ignoreCase: boolean
): { leftTokens: WordToken[]; rightTokens: WordToken[] } {
  const tokensA = tokenizeString(strA);
  const tokensB = tokenizeString(strB);

  const m = tokensA.length;
  const n = tokensB.length;

  // Short circuit if identical
  if (
    m === n &&
    tokensA.every((t, i) => (ignoreCase ? t.toLowerCase() === tokensB[i].toLowerCase() : t === tokensB[i]))
  ) {
    return {
      leftTokens: tokensA.map((t) => ({ text: t, type: "unchanged" })),
      rightTokens: tokensB.map((t) => ({ text: t, type: "unchanged" })),
    };
  }

  // DP table for LCS
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const match = ignoreCase
        ? tokensA[i].toLowerCase() === tokensB[j].toLowerCase()
        : tokensA[i] === tokensB[j];
      if (match) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to assemble tokens
  const leftTokens: WordToken[] = [];
  const rightTokens: WordToken[] = [];

  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const match = ignoreCase
        ? tokensA[i - 1].toLowerCase() === tokensB[j - 1].toLowerCase()
        : tokensA[i - 1] === tokensB[j - 1];
      if (match) {
        leftTokens.unshift({ text: tokensA[i - 1], type: "unchanged" });
        rightTokens.unshift({ text: tokensB[j - 1], type: "unchanged" });
        i--;
        j--;
        continue;
      }
    }

    if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightTokens.unshift({ text: tokensB[j - 1], type: "added" });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      leftTokens.unshift({ text: tokensA[i - 1], type: "removed" });
      i--;
    }
  }

  return { leftTokens, rightTokens };
}

/**
 * Computes line-level diff with Myers/LCS between two texts
 */
function computeDiffRows(
  textA: string,
  textB: string,
  options: {
    ignoreWhitespace: boolean;
    ignoreCase: boolean;
    granularity: DiffGranularity;
  }
): { rows: DiffRow[]; stats: DiffStats } {
  const rawLinesA = textA.split("\n");
  const rawLinesB = textB.split("\n");

  const normalize = (line: string) => {
    let s = line;
    if (options.ignoreWhitespace) s = s.trim().replace(/\s+/g, " ");
    if (options.ignoreCase) s = s.toLowerCase();
    return s;
  };

  const normA = rawLinesA.map(normalize);
  const normB = rawLinesB.map(normalize);

  const m = normA.length;
  const n = normB.length;

  // LCS on lines
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (normA[i] === normB[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack into raw diff operations
  interface RawOp {
    type: "unchanged" | "added" | "removed";
    leftIndex?: number;
    rightIndex?: number;
  }
  const ops: RawOp[] = [];

  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normA[i - 1] === normB[j - 1]) {
      ops.unshift({ type: "unchanged", leftIndex: i - 1, rightIndex: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: "added", rightIndex: j - 1 });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      ops.unshift({ type: "removed", leftIndex: i - 1 });
      i--;
    }
  }

  // Pair consecutive removed + added into "modified" rows for split and inline alignment
  const rows: DiffRow[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  let opIndex = 0;
  let rowCounter = 0;

  while (opIndex < ops.length) {
    const curr = ops[opIndex];

    // Check for modified pair: consecutive removed followed by added
    if (
      curr.type === "removed" &&
      opIndex + 1 < ops.length &&
      ops[opIndex + 1].type === "added"
    ) {
      const removedOp = curr;
      const addedOp = ops[opIndex + 1];

      const leftText = rawLinesA[removedOp.leftIndex!];
      const rightText = rawLinesB[addedOp.rightIndex!];

      let leftTokens: WordToken[] | undefined;
      let rightTokens: WordToken[] | undefined;

      if (options.granularity === "words") {
        const wordDiff = diffWords(leftText, rightText, options.ignoreCase);
        leftTokens = wordDiff.leftTokens;
        rightTokens = wordDiff.rightTokens;
      }

      rows.push({
        id: `diff-mod-${rowCounter++}`,
        type: "modified",
        leftLineNumber: removedOp.leftIndex! + 1,
        rightLineNumber: addedOp.rightIndex! + 1,
        leftText,
        rightText,
        leftTokens,
        rightTokens,
      });

      modifiedCount++;
      opIndex += 2;
      continue;
    }

    if (curr.type === "unchanged") {
      rows.push({
        id: `diff-unc-${rowCounter++}`,
        type: "unchanged",
        leftLineNumber: curr.leftIndex! + 1,
        rightLineNumber: curr.rightIndex! + 1,
        leftText: rawLinesA[curr.leftIndex!],
        rightText: rawLinesB[curr.rightIndex!],
      });
      unchangedCount++;
    } else if (curr.type === "removed") {
      rows.push({
        id: `diff-rem-${rowCounter++}`,
        type: "removed",
        leftLineNumber: curr.leftIndex! + 1,
        leftText: rawLinesA[curr.leftIndex!],
      });
      removedCount++;
    } else if (curr.type === "added") {
      rows.push({
        id: `diff-add-${rowCounter++}`,
        type: "added",
        rightLineNumber: curr.rightIndex! + 1,
        rightText: rawLinesB[curr.rightIndex!],
      });
      addedCount++;
    }

    opIndex++;
  }

  const totalLines = Math.max(rawLinesA.length, rawLinesB.length);
  const matchedLines = unchangedCount;
  const similarityPercent =
    totalLines > 0 ? Math.round((matchedLines / totalLines) * 100) : 100;

  return {
    rows,
    stats: {
      addedLines: addedCount,
      removedLines: removedCount,
      modifiedLines: modifiedCount,
      unchangedLines: unchangedCount,
      totalLines,
      similarityPercent,
    },
  };
}

// ============================================================================
// MAIN DIFF CHECKER COMPONENT
// ============================================================================

export default function DiffCheckerStudio() {
  // Input Text State
  const [leftText, setLeftText] = useState<string>(PRESETS[0].leftContent);
  const [rightText, setRightText] = useState<string>(PRESETS[0].rightContent);
  const [leftLabel, setLeftLabel] = useState<string>(PRESETS[0].leftTitle);
  const [rightLabel, setRightLabel] = useState<string>(PRESETS[0].rightTitle);

  // Settings & Toggles
  const [viewMode, setViewMode] = useState<DiffViewMode>("split");
  const [granularity, setGranularity] = useState<DiffGranularity>("words");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [showInputMode, setShowInputMode] = useState<boolean>(false);

  // Mobile navigation tabs
  const [mobileTab, setMobileTab] = useState<"diff" | "inputs" | "presets">("diff");

  // Copy / Export Feedback
  const [copiedState, setCopiedState] = useState<string | null>(null);

  // Synchronized Scrolling Refs
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  // Compute Diff Rows & Statistics
  const { rows, stats } = useMemo(() => {
    return computeDiffRows(leftText, rightText, {
      ignoreWhitespace,
      ignoreCase,
      granularity,
    });
  }, [leftText, rightText, ignoreWhitespace, ignoreCase, granularity]);

  // Synchronized scroll handler for split view
  const handleScroll = (source: "left" | "right") => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;

    if (source === "left" && leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
      rightScrollRef.current.scrollLeft = leftScrollRef.current.scrollLeft;
    } else if (source === "right" && leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
      leftScrollRef.current.scrollLeft = rightScrollRef.current.scrollLeft;
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 50);
  };

  // Swap Left & Right
  const handleSwap = () => {
    const tempText = leftText;
    const tempLabel = leftLabel;
    setLeftText(rightText);
    setRightText(tempText);
    setLeftLabel(rightLabel);
    setRightLabel(tempLabel);
  };

  // Clear All
  const handleClear = () => {
    setLeftText("");
    setRightText("");
    setLeftLabel("Original Document");
    setRightLabel("Modified Document");
  };

  // Load Preset
  const handleLoadPreset = (preset: DiffPreset) => {
    setLeftText(preset.leftContent);
    setRightText(preset.rightContent);
    setLeftLabel(preset.leftTitle);
    setRightLabel(preset.rightTitle);
    setShowInputMode(false);
    setMobileTab("diff");
  };

  // File Upload Handlers (for either pane)
  const handleFileUpload = (side: "left" | "right", file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (side === "left") {
        setLeftText(content);
        setLeftLabel(file.name);
      } else {
        setRightText(content);
        setRightLabel(file.name);
      }
    };
    reader.readAsText(file);
  };

  // Copy Actions
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(type);
    setTimeout(() => setCopiedState(null), 2500);
  };

  // Generate Git Unified Patch format (.diff)
  const generateUnifiedPatch = useCallback(() => {
    let patch = `--- a/${leftLabel}\n+++ b/${rightLabel}\n`;
    patch += `@@ -1,${leftText.split("\n").length} +1,${rightText.split("\n").length} @@\n`;

    rows.forEach((row) => {
      if (row.type === "unchanged") {
        patch += ` ${row.leftText}\n`;
      } else if (row.type === "removed") {
        patch += `-${row.leftText}\n`;
      } else if (row.type === "added") {
        patch += `+${row.rightText}\n`;
      } else if (row.type === "modified") {
        patch += `-${row.leftText}\n`;
        patch += `+${row.rightText}\n`;
      }
    });
    return patch;
  }, [leftLabel, rightLabel, leftText, rightText, rows]);

  // Download Patch
  const handleDownloadPatch = () => {
    const patch = generateUnifiedPatch();
    const blob = new Blob([patch], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `changes-${Date.now()}.diff`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCopiedState("patch-downloaded");
    setTimeout(() => setCopiedState(null), 2500);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col gap-6 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[1700px] mx-auto text-slate-100">
      {/* Toast Notification */}
      {copiedState && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">
            {copiedState === "modified" && "Copied modified version to clipboard!"}
            {copiedState === "patch" && "Copied Git unified diff patch to clipboard!"}
            {copiedState === "original" && "Copied original version to clipboard!"}
            {copiedState === "patch-downloaded" && "Diff patch file downloaded!"}
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-white/[0.08] rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Text & Code Comparison Studio
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Private & Free
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Compare two versions of code, contracts, or text. Spot added, removed, and modified lines with word-level highlights.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowInputMode(!showInputMode)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border",
              showInputMode
                ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm"
                : "bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border-white/[0.1]"
            )}
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>{showInputMode ? "View Diff Results" : "Edit Text Inputs"}</span>
          </button>

          <button
            onClick={() => handleCopy(rightText, "modified")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all active:scale-95"
            title="Copy modified document to clipboard"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Modified</span>
          </button>

          <button
            onClick={() => handleCopy(generateUnifiedPatch(), "patch")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.18] transition-all active:scale-95"
            title="Copy Git-compatible unified diff patch"
          >
            <FileDiff className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Copy Patch</span>
          </button>

          <button
            onClick={handleDownloadPatch}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.18] transition-all active:scale-95"
            title="Download .diff file"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">.diff</span>
          </button>
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="flex md:hidden items-center justify-between p-1 rounded-xl bg-slate-900/80 border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("diff")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "diff"
              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Diff View</span>
        </button>
        <button
          onClick={() => setMobileTab("inputs")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "inputs"
              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Edit Inputs</span>
        </button>
        <button
          onClick={() => setMobileTab("presets")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "presets"
              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Examples</span>
        </button>
      </div>

      {/* METRICS & QUICK STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-md">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
            +{stats.addedLines}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Lines Added
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              +{stats.addedLines}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-md">
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-sm">
            -{stats.removedLines}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Lines Removed
            </div>
            <div className="text-base sm:text-lg font-bold text-rose-400">
              -{stats.removedLines}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-md">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
            ~{stats.modifiedLines}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Modified Lines
            </div>
            <div className="text-base sm:text-lg font-bold text-amber-400">
              ~{stats.modifiedLines}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-md">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
            {stats.similarityPercent}%
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Content Match
            </div>
            <div className="text-base sm:text-lg font-bold text-indigo-300">
              {stats.similarityPercent}% Match
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS & SETTINGS TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
        {/* Left Toggles: View Mode & Granularity */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Split vs Unified Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            <button
              onClick={() => setViewMode("split")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === "split"
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Side by Side</span>
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === "unified"
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Unified Stream</span>
            </button>
          </div>

          {/* Granularity Toggle (Words vs Lines) */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08]">
            <button
              onClick={() => setGranularity("words")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                granularity === "words"
                  ? "bg-white/[0.1] text-white"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Highlight exact words and characters modified"
            >
              Word Level
            </button>
            <button
              onClick={() => setGranularity("lines")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                granularity === "lines"
                  ? "bg-white/[0.1] text-white"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Highlight entire lines only"
            >
              Line Level
            </button>
          </div>
        </div>

        {/* Right Action Tools: Swap, Whitespace, Case, Clear */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ignore Whitespace */}
          <button
            onClick={() => setIgnoreWhitespace(!ignoreWhitespace)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
              ignoreWhitespace
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
            )}
            title="Ignore trailing spaces and indentation differences"
          >
            Ignore Whitespace
          </button>

          {/* Ignore Case */}
          <button
            onClick={() => setIgnoreCase(!ignoreCase)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
              ignoreCase
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
            )}
            title="Treat uppercase and lowercase characters as identical"
          >
            Ignore Case
          </button>

          {/* Swap Panes */}
          <button
            onClick={handleSwap}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 transition-all"
            title="Swap Original and Modified panes"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Swap</span>
          </button>

          {/* Clear Panes */}
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-rose-500/20 border border-white/[0.08] hover:border-rose-500/40 text-xs font-medium text-slate-400 hover:text-rose-300 transition-all"
            title="Clear both inputs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* EDIT INPUTS DRAWER / SECTION */}
      {(showInputMode || mobileTab === "inputs") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Left Text Input Pane */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={leftLabel}
                onChange={(e) => setLeftLabel(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-indigo-400"
                placeholder="Original Document Name"
              />
              <label className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload("left", e.target.files[0]);
                  }}
                />
              </label>
            </div>
            <textarea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              rows={12}
              className="w-full font-mono text-xs sm:text-sm bg-black/50 border border-white/[0.08] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-y leading-relaxed"
              placeholder="Paste original text or code here..."
            />
          </div>

          {/* Right Text Input Pane */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={rightLabel}
                onChange={(e) => setRightLabel(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-emerald-400"
                placeholder="Modified Document Name"
              />
              <label className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload("right", e.target.files[0]);
                  }}
                />
              </label>
            </div>
            <textarea
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              rows={12}
              className="w-full font-mono text-xs sm:text-sm bg-black/50 border border-white/[0.08] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-y leading-relaxed"
              placeholder="Paste modified text or code here..."
            />
          </div>
        </div>
      )}

      {/* PRESETS LIST (Visible in mobile Presets tab or when toggled) */}
      {mobileTab === "presets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className="flex flex-col gap-1 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                  {preset.title}
                </span>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {preset.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* MAIN DIFF VIEWER CONTAINER */}
      <div
        className={cn(
          "flex-col rounded-2xl border border-white/[0.1] bg-[#080914] overflow-hidden shadow-2xl",
          mobileTab !== "diff" ? "hidden md:flex" : "flex"
        )}
      >
        {/* Pane Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/[0.08] bg-slate-950/70 text-xs font-semibold text-slate-400">
          <div className="flex items-center justify-between px-4 py-2.5 border-r border-white/[0.08]">
            <div className="flex items-center gap-2 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="truncate">{leftLabel} (Original)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {leftText.split("\n").length} lines
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="truncate">{rightLabel} (Modified)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {rightText.split("\n").length} lines
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: SPLIT / SIDE-BY-SIDE VIEW                                 */}
        {/* ------------------------------------------------------------------ */}
        {viewMode === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 max-h-[640px] divide-y md:divide-y-0 md:divide-x divide-white/[0.08] overflow-hidden font-mono text-xs sm:text-[13px] select-text">
            {/* LEFT PANE (Original) */}
            <div
              ref={leftScrollRef}
              onScroll={() => handleScroll("left")}
              className="overflow-y-auto overflow-x-auto max-h-[600px] bg-[#070810] scrollbar-thin scrollbar-thumb-white/10"
            >
              {rows.map((row) => {
                const isRemoved = row.type === "removed";
                const isModified = row.type === "modified";
                const isAddedOnOtherSide = row.type === "added";

                return (
                  <div
                    key={`left-${row.id}`}
                    className={cn(
                      "flex items-stretch min-w-full leading-6 group transition-colors",
                      isRemoved && "bg-rose-950/30 text-rose-200",
                      isModified && "bg-amber-950/25 text-amber-200",
                      isAddedOnOtherSide && "bg-white/[0.01] opacity-35 select-none"
                    )}
                  >
                    {/* Line Number */}
                    <div className="w-12 px-2 py-0.5 text-right text-slate-600 select-none bg-black/20 flex-shrink-0 border-r border-white/[0.04] text-[11px]">
                      {row.leftLineNumber ?? ""}
                    </div>

                    {/* Change Indicator Symbol */}
                    <div className="w-5 flex items-center justify-center select-none flex-shrink-0 font-bold text-xs">
                      {isRemoved && <span className="text-rose-400">-</span>}
                      {isModified && <span className="text-amber-400">~</span>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-2 py-0.5 whitespace-pre overflow-x-visible">
                      {isModified && row.leftTokens ? (
                        row.leftTokens.map((token, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              token.type === "removed" &&
                                "bg-rose-500/40 text-rose-100 border border-rose-500/50 rounded px-1 font-semibold"
                            )}
                          >
                            {token.text}
                          </span>
                        ))
                      ) : (
                        row.leftText ?? " "
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT PANE (Modified) */}
            <div
              ref={rightScrollRef}
              onScroll={() => handleScroll("right")}
              className="overflow-y-auto overflow-x-auto max-h-[600px] bg-[#070810] scrollbar-thin scrollbar-thumb-white/10"
            >
              {rows.map((row) => {
                const isAdded = row.type === "added";
                const isModified = row.type === "modified";
                const isRemovedOnOtherSide = row.type === "removed";

                return (
                  <div
                    key={`right-${row.id}`}
                    className={cn(
                      "flex items-stretch min-w-full leading-6 group transition-colors",
                      isAdded && "bg-emerald-950/30 text-emerald-200",
                      isModified && "bg-amber-950/25 text-amber-200",
                      isRemovedOnOtherSide && "bg-white/[0.01] opacity-35 select-none"
                    )}
                  >
                    {/* Line Number */}
                    <div className="w-12 px-2 py-0.5 text-right text-slate-600 select-none bg-black/20 flex-shrink-0 border-r border-white/[0.04] text-[11px]">
                      {row.rightLineNumber ?? ""}
                    </div>

                    {/* Change Indicator Symbol */}
                    <div className="w-5 flex items-center justify-center select-none flex-shrink-0 font-bold text-xs">
                      {isAdded && <span className="text-emerald-400">+</span>}
                      {isModified && <span className="text-amber-400">~</span>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-2 py-0.5 whitespace-pre overflow-x-visible">
                      {isModified && row.rightTokens ? (
                        row.rightTokens.map((token, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              token.type === "added" &&
                                "bg-emerald-500/40 text-emerald-100 border border-emerald-500/50 rounded px-1 font-semibold"
                            )}
                          >
                            {token.text}
                          </span>
                        ))
                      ) : (
                        row.rightText ?? " "
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: UNIFIED STREAM VIEW                                        */}
        {/* ------------------------------------------------------------------ */}
        {viewMode === "unified" && (
          <div className="overflow-y-auto overflow-x-auto max-h-[640px] bg-[#070810] font-mono text-xs sm:text-[13px] select-text scrollbar-thin scrollbar-thumb-white/10">
            {rows.map((row) => {
              if (row.type === "unchanged") {
                return (
                  <div
                    key={row.id}
                    className="flex items-stretch min-w-full leading-6 hover:bg-white/[0.02]"
                  >
                    <div className="w-12 px-2 py-0.5 text-right text-slate-600 select-none bg-black/20 text-[11px] border-r border-white/[0.04]">
                      {row.leftLineNumber}
                    </div>
                    <div className="w-12 px-2 py-0.5 text-right text-slate-600 select-none bg-black/20 text-[11px] border-r border-white/[0.04]">
                      {row.rightLineNumber}
                    </div>
                    <div className="w-6 flex items-center justify-center text-slate-600 select-none">
                      {" "}
                    </div>
                    <div className="flex-1 px-2 py-0.5 whitespace-pre text-slate-300">
                      {row.leftText}
                    </div>
                  </div>
                );
              }

              if (row.type === "modified") {
                return (
                  <React.Fragment key={row.id}>
                    {/* Removed Line */}
                    <div className="flex items-stretch min-w-full leading-6 bg-rose-950/30 text-rose-200">
                      <div className="w-12 px-2 py-0.5 text-right text-rose-400/60 select-none bg-rose-950/40 text-[11px] border-r border-rose-500/20">
                        {row.leftLineNumber}
                      </div>
                      <div className="w-12 px-2 py-0.5 text-right text-slate-700 select-none bg-black/20 text-[11px] border-r border-white/[0.04]">
                        {" "}
                      </div>
                      <div className="w-6 flex items-center justify-center text-rose-400 font-bold select-none">
                        -
                      </div>
                      <div className="flex-1 px-2 py-0.5 whitespace-pre">
                        {row.leftTokens ? (
                          row.leftTokens.map((token, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                token.type === "removed" &&
                                  "bg-rose-500/40 text-rose-100 border border-rose-500/50 rounded px-1 font-semibold"
                              )}
                            >
                              {token.text}
                            </span>
                          ))
                        ) : (
                          row.leftText
                        )}
                      </div>
                    </div>

                    {/* Added Line */}
                    <div className="flex items-stretch min-w-full leading-6 bg-emerald-950/30 text-emerald-200">
                      <div className="w-12 px-2 py-0.5 text-right text-slate-700 select-none bg-black/20 text-[11px] border-r border-white/[0.04]">
                        {" "}
                      </div>
                      <div className="w-12 px-2 py-0.5 text-right text-emerald-400/60 select-none bg-emerald-950/40 text-[11px] border-r border-emerald-500/20">
                        {row.rightLineNumber}
                      </div>
                      <div className="w-6 flex items-center justify-center text-emerald-400 font-bold select-none">
                        +
                      </div>
                      <div className="flex-1 px-2 py-0.5 whitespace-pre">
                        {row.rightTokens ? (
                          row.rightTokens.map((token, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                token.type === "added" &&
                                  "bg-emerald-500/40 text-emerald-100 border border-emerald-500/50 rounded px-1 font-semibold"
                              )}
                            >
                              {token.text}
                            </span>
                          ))
                        ) : (
                          row.rightText
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              }

              if (row.type === "removed") {
                return (
                  <div
                    key={row.id}
                    className="flex items-stretch min-w-full leading-6 bg-rose-950/30 text-rose-200"
                  >
                    <div className="w-12 px-2 py-0.5 text-right text-rose-400/60 select-none bg-rose-950/40 text-[11px] border-r border-rose-500/20">
                      {row.leftLineNumber}
                    </div>
                    <div className="w-12 px-2 py-0.5 text-right text-slate-700 select-none bg-black/20 text-[11px] border-r border-white/[0.04]">
                      {" "}
                    </div>
                    <div className="w-6 flex items-center justify-center text-rose-400 font-bold select-none">
                      -
                    </div>
                    <div className="flex-1 px-2 py-0.5 whitespace-pre">{row.leftText}</div>
                  </div>
                );
              }

              if (row.type === "added") {
                return (
                  <div
                    key={row.id}
                    className="flex items-stretch min-w-full leading-6 bg-emerald-950/30 text-emerald-200"
                  >
                    <div className="w-12 px-2 py-0.5 text-right text-slate-700 select-none bg-black/20 text-[11px] border-r border-white/[0.04]">
                      {" "}
                    </div>
                    <div className="w-12 px-2 py-0.5 text-right text-emerald-400/60 select-none bg-emerald-950/40 text-[11px] border-r border-emerald-500/20">
                      {row.rightLineNumber}
                    </div>
                    <div className="w-6 flex items-center justify-center text-emerald-400 font-bold select-none">
                      +
                    </div>
                    <div className="flex-1 px-2 py-0.5 whitespace-pre">{row.rightText}</div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}

        {/* Diff Footer Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/80 border-t border-white/[0.08] text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>+{stats.addedLines} Added</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>-{stats.removedLines} Removed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>~{stats.modifiedLines} Modified</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Processed 100% locally in browser memory &bull; Zero data sent to servers
          </div>
        </div>
      </div>

      {/* SAMPLE PRESETS ROW (Desktop & Tablet) */}
      <div className="hidden md:flex flex-col gap-3 p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Instant Sample Presets</h3>
          </div>
          <span className="text-xs text-slate-500">Test diff engine with realistic data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className="flex flex-col gap-1 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-emerald-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                  {preset.title}
                </span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-emerald-400">
                {preset.category}
              </span>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
