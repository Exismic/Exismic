"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  GitCompare,
  Copy,
  Check,
  Download,
  RotateCcw,
  ArrowLeftRight,
  Eye,
  FileText,
  FileCode2,
  Layers,
  Columns2,
  ListFilter,
  Trash2,
  CheckCircle2,
  UploadCloud,
  FileDiff,
  Code2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ClipboardPaste,
  FoldVertical,
  UnfoldVertical,
  FileDown,
  SlidersHorizontal,
  ArrowRight,
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
  isChange: boolean;
}

export interface DiffStats {
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  unchangedLines: number;
  totalLines: number;
  similarityPercent: number;
  totalChanges: number;
}

// ============================================================================
// REAL-WORLD & EDUCATIONAL PRESETS (Zero Emojis, Authentic Vector Icons)
// ============================================================================

interface DiffPreset {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: "code" | "legal" | "academic" | "api" | "style";
  leftTitle: string;
  rightTitle: string;
  leftContent: string;
  rightContent: string;
}

const PRESETS: DiffPreset[] = [
  {
    id: "react-hook-refactor",
    title: "TypeScript / React Hook Refactor",
    category: "Software Engineering",
    description: "Upgrading a legacy class component lifecycle to clean React hooks and async cancellation",
    iconName: "code",
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
    category: "Legal & Commercial",
    description: "Confidentiality clause negotiating survival terms, governing law, and return obligations",
    iconName: "legal",
    leftTitle: "Initial Standard Draft",
    rightTitle: "Negotiated Agreement Clause",
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
    category: "Academic & Writing",
    description: "Elevating a casual introductory paragraph into an evidence-backed academic thesis",
    iconName: "academic",
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
    category: "Cloud Architecture",
    description: "Upgrading legacy API response with scoped permissions, rate limits, and ISO timestamps",
    iconName: "api",
    leftTitle: "API v1 Response",
    rightTitle: "API v2 Response (OAuth2)",
    leftContent: `{
  "apiVersion": "1.4.0",
  "status": "success",
  "data": {
    "userId": "usr_99812",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "apiKey": "mock_key_9a87fbc9901b",
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
// LCS DIFF COMPARISON ENGINE (Myers & LCS with Word Tokenization)
// ============================================================================

/**
 * Splits string into words, spaces, and punctuation tokens for granular character/word highlighting
 */
function tokenizeString(str: string): string[] {
  return str.split(/(\s+|[^\w\s]+)/).filter((t) => t.length > 0);
}

/**
 * Computes word-level diff between two lines using Longest Common Subsequence
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

  if (
    m === n &&
    tokensA.every((t, i) => (ignoreCase ? t.toLowerCase() === tokensB[i].toLowerCase() : t === tokensB[i]))
  ) {
    return {
      leftTokens: tokensA.map((t) => ({ text: t, type: "unchanged" })),
      rightTokens: tokensB.map((t) => ({ text: t, type: "unchanged" })),
    };
  }

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
 * Computes line-level diff with LCS between two text inputs
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

  const rows: DiffRow[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  let opIndex = 0;
  let rowCounter = 0;

  while (opIndex < ops.length) {
    const curr = ops[opIndex];

    // Check for paired modification: consecutive removed followed by added
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
        isChange: true,
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
        isChange: false,
      });
      unchangedCount++;
    } else if (curr.type === "removed") {
      rows.push({
        id: `diff-rem-${rowCounter++}`,
        type: "removed",
        leftLineNumber: curr.leftIndex! + 1,
        leftText: rawLinesA[curr.leftIndex!],
        isChange: true,
      });
      removedCount++;
    } else if (curr.type === "added") {
      rows.push({
        id: `diff-add-${rowCounter++}`,
        type: "added",
        rightLineNumber: curr.rightIndex! + 1,
        rightText: rawLinesB[curr.rightIndex!],
        isChange: true,
      });
      addedCount++;
    }

    opIndex++;
  }

  const totalLines = Math.max(rawLinesA.length, rawLinesB.length);
  const matchedLines = unchangedCount;
  const similarityPercent =
    totalLines > 0 ? Math.round((matchedLines / totalLines) * 100) : 100;
  const totalChanges = addedCount + removedCount + modifiedCount;

  return {
    rows,
    stats: {
      addedLines: addedCount,
      removedLines: removedCount,
      modifiedLines: modifiedCount,
      unchangedLines: unchangedCount,
      totalLines,
      similarityPercent,
      totalChanges,
    },
  };
}

// ============================================================================
// MAIN COMPONENT: DIFF CHECKER STUDIO
// ============================================================================

export default function DiffCheckerStudio() {
  // Input State
  const [leftText, setLeftText] = useState<string>(PRESETS[0].leftContent);
  const [rightText, setRightText] = useState<string>(PRESETS[0].rightContent);
  const [leftLabel, setLeftLabel] = useState<string>(PRESETS[0].leftTitle);
  const [rightLabel, setRightLabel] = useState<string>(PRESETS[0].rightTitle);

  // Settings & Toggles
  const [viewMode, setViewMode] = useState<DiffViewMode>("split");
  const [granularity, setGranularity] = useState<DiffGranularity>("words");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [foldUnchanged, setFoldUnchanged] = useState<boolean>(false);
  const [showInputDrawer, setShowInputDrawer] = useState<boolean>(false);

  // Navigation & Jump
  const [currentChangeIndex, setCurrentChangeIndex] = useState<number>(0);

  // Mobile Segmented Navigation Tabs
  const [mobileTab, setMobileTab] = useState<"compare" | "inputs" | "presets">("compare");

  // User Feedback Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll Synchronization Refs
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const unifiedScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  // Compute Diff Engine
  const { rows, stats } = useMemo(() => {
    return computeDiffRows(leftText, rightText, {
      ignoreWhitespace,
      ignoreCase,
      granularity,
    });
  }, [leftText, rightText, ignoreWhitespace, ignoreCase, granularity]);

  // Indices of rows that represent changes for instant jumping
  const changeRowIndices = useMemo(() => {
    const indices: number[] = [];
    rows.forEach((row, index) => {
      if (row.isChange) indices.push(index);
    });
    return indices;
  }, [rows]);

  // Filtered rows when "Fold Unchanged" is active (surrounds changes with 3 context lines)
  const displayRows = useMemo(() => {
    if (!foldUnchanged) return rows;

    const includedIndices = new Set<number>();
    rows.forEach((row, idx) => {
      if (row.isChange) {
        for (let offset = -3; offset <= 3; offset++) {
          const target = idx + offset;
          if (target >= 0 && target < rows.length) {
            includedIndices.add(target);
          }
        }
      }
    });

    // If no changes exist, show all
    if (includedIndices.size === 0) return rows;

    return rows.filter((_, idx) => includedIndices.has(idx));
  }, [rows, foldUnchanged]);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show Toast
  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2200);
  };

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
    }, 40);
  };

  // Jump to Next / Previous Change
  const jumpToChange = (direction: "next" | "prev") => {
    if (changeRowIndices.length === 0) {
      triggerToast("No differences detected between the two texts");
      return;
    }

    let nextIndex = 0;
    if (direction === "next") {
      nextIndex = (currentChangeIndex + 1) % changeRowIndices.length;
    } else {
      nextIndex = (currentChangeIndex - 1 + changeRowIndices.length) % changeRowIndices.length;
    }
    setCurrentChangeIndex(nextIndex);

    const targetRowIndex = changeRowIndices[nextIndex];
    const targetElementId = `diff-row-${targetRowIndex}`;
    const el = document.getElementById(targetElementId);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-emerald-400", "ring-offset-2", "ring-offset-black");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-emerald-400", "ring-offset-2", "ring-offset-black");
      }, 1200);
    }
  };

  // Swap Left & Right
  const handleSwap = () => {
    const tempText = leftText;
    const tempLabel = leftLabel;
    setLeftText(rightText);
    setRightText(tempText);
    setLeftLabel(rightLabel);
    setRightLabel(tempLabel);
    setCurrentChangeIndex(0);
    triggerToast("Swapped Left and Right documents");
  };

  // Clear All
  const handleClear = () => {
    setLeftText("");
    setRightText("");
    setLeftLabel("Original Document");
    setRightLabel("Modified Document");
    setCurrentChangeIndex(0);
    triggerToast("Cleared both document inputs");
  };

  // Load Preset
  const handleLoadPreset = (preset: DiffPreset) => {
    setLeftText(preset.leftContent);
    setRightText(preset.rightContent);
    setLeftLabel(preset.leftTitle);
    setRightLabel(preset.rightTitle);
    setShowInputDrawer(false);
    setMobileTab("compare");
    setCurrentChangeIndex(0);
    triggerToast(`Loaded "${preset.title}"`);
  };

  // File Upload Handler
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
      triggerToast(`Loaded file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Paste from Clipboard
  const handlePasteClipboard = async (side: "left" | "right") => {
    try {
      const text = await navigator.clipboard.readText();
      if (side === "left") {
        setLeftText(text);
        setLeftLabel("Pasted Document");
      } else {
        setRightText(text);
        setRightLabel("Pasted Document");
      }
      triggerToast("Pasted text from clipboard");
    } catch {
      triggerToast("Clipboard access denied by browser");
    }
  };

  // Copy Action
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} to clipboard`);
  };

  // Generate Git Unified Patch Format (.diff)
  const generateUnifiedPatch = useCallback(() => {
    let patch = `--- a/${leftLabel}\n+++ b/${rightLabel}\n`;
    patch += `@@ -1,${leftText.split("\n").length} +1,${rightText.split("\n").length} @@\n`;

    rows.forEach((row) => {
      if (row.type === "unchanged") {
        patch += ` ${row.leftText ?? ""}\n`;
      } else if (row.type === "removed") {
        patch += `-${row.leftText ?? ""}\n`;
      } else if (row.type === "added") {
        patch += `+${row.rightText ?? ""}\n`;
      } else if (row.type === "modified") {
        patch += `-${row.leftText ?? ""}\n`;
        patch += `+${row.rightText ?? ""}\n`;
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
    triggerToast("Downloaded changes as .diff file");
  };

  // Download Self-Contained HTML Diff Report
  const handleDownloadHtmlReport = () => {
    const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Diff Report: ${leftLabel} vs ${rightLabel}</title>
  <style>
    body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #070913; color: #e2e8f0; margin: 0; padding: 24px; line-height: 1.5; font-size: 13px; }
    h1 { font-size: 20px; color: #ffffff; margin-bottom: 4px; font-family: system-ui, sans-serif; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; font-size: 12px; }
    .stat { padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); }
    .table { width: 100%; border-collapse: collapse; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
    .row { display: flex; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .num { width: 44px; text-align: right; padding: 2px 8px; color: #64748b; background: rgba(0,0,0,0.3); border-right: 1px solid rgba(255,255,255,0.06); user-select: none; }
    .code { flex: 1; padding: 2px 8px; white-space: pre-wrap; word-break: break-all; }
    .add { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border-left: 3px solid #10b981; }
    .rem { background: rgba(244, 63, 94, 0.15); color: #fda4af; border-left: 3px solid #f43f5e; }
    .mod { background: rgba(245, 158, 11, 0.12); color: #fde68a; border-left: 3px solid #f59e0b; }
    .tok-rem { background: rgba(244, 63, 94, 0.35); text-decoration: line-through; border-radius: 3px; padding: 1px 3px; }
    .tok-add { background: rgba(16, 185, 129, 0.35); font-weight: bold; border-radius: 3px; padding: 1px 3px; }
  </style>
</head>
<body>
  <h1>Text & Code Comparison Report</h1>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 0;">Comparing <strong>${leftLabel}</strong> to <strong>${rightLabel}</strong></p>
  <div class="stats">
    <div class="stat" style="color: #34d399;">+${stats.addedLines} Added</div>
    <div class="stat" style="color: #fb7185;">-${stats.removedLines} Removed</div>
    <div class="stat" style="color: #fbbf24;">~${stats.modifiedLines} Changed</div>
    <div class="stat" style="color: #818cf8;">${stats.similarityPercent}% Match</div>
  </div>
  <div class="table">
    ${rows
      .map((r) => {
        if (r.type === "unchanged") {
          return `<div class="row"><div class="num">${r.leftLineNumber ?? ""}</div><div class="num">${r.rightLineNumber ?? ""}</div><div class="code">${r.leftText ?? ""}</div></div>`;
        }
        if (r.type === "added") {
          return `<div class="row add"><div class="num"></div><div class="num">${r.rightLineNumber ?? ""}</div><div class="code">+ ${r.rightText ?? ""}</div></div>`;
        }
        if (r.type === "removed") {
          return `<div class="row rem"><div class="num">${r.leftLineNumber ?? ""}</div><div class="num"></div><div class="code">- ${r.leftText ?? ""}</div></div>`;
        }
        if (r.type === "modified") {
          return `<div class="row mod"><div class="num">${r.leftLineNumber ?? ""}</div><div class="num">${r.rightLineNumber ?? ""}</div><div class="code">~ ${r.rightText ?? ""}</div></div>`;
        }
        return "";
      })
      .join("")}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlReport], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diff-report-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast("Downloaded standalone HTML report");
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col gap-5 p-3 sm:p-5 md:p-6 lg:p-8 max-w-[1720px] mx-auto text-slate-100 pb-28 md:pb-10 select-none sm:select-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0a0f1d]/95 border border-emerald-500/40 text-emerald-200 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{toastMessage}</span>
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0a0d1a]/80 border border-white/[0.08] rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/10 blur-[90px] pointer-events-none rounded-full" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.25)] flex-shrink-0">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                Text & Code Comparison Studio
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                100% Client-Side Private
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Side-by-side and unified text comparison with granular word-level changes, git patch export, and zero server latency.
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 relative z-10">
          {/* Edit Inputs Toggle */}
          <button
            onClick={() => setShowInputDrawer(!showInputDrawer)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border",
              showInputDrawer
                ? "bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/[0.08]"
            )}
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>{showInputDrawer ? "Hide Input Drawer" : "Edit Documents"}</span>
          </button>

          {/* Copy Modified Document */}
          <button
            onClick={() => handleCopyText(rightText, "Modified Document")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all active:scale-95"
            title="Copy modified document text"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Modified</span>
          </button>

          {/* Copy Git Patch */}
          <button
            onClick={() => handleCopyText(generateUnifiedPatch(), "Git Unified Patch")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all active:scale-95"
            title="Copy Git-compatible patch format"
          >
            <FileDiff className="w-4 h-4 text-teal-400" />
            <span>Copy Patch</span>
          </button>

          {/* Download Patch .diff */}
          <button
            onClick={handleDownloadPatch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all active:scale-95"
            title="Download .diff patch file"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Download .diff</span>
            <span className="sm:hidden">.diff</span>
          </button>

          {/* Download HTML Report */}
          <button
            onClick={handleDownloadHtmlReport}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all active:scale-95"
            title="Download standalone HTML visual diff report"
          >
            <FileDown className="w-4 h-4 text-indigo-400" />
            <span>HTML Report</span>
          </button>
        </div>
      </div>

      {/* MOBILE SEGMENTED TABS (Strict 320px - 430px Friendly) */}
      <div className="flex md:hidden items-center p-1 rounded-xl bg-[#090c17] border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("compare")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "compare"
              ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Compare View</span>
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
          <span>Edit Texts</span>
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
          <BookOpen className="w-3.5 h-3.5" />
          <span>Examples</span>
        </button>
      </div>

      {/* LIVE METRICS & CHANGE CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Added Lines Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#090c17]/90 border border-white/[0.07] backdrop-blur-md">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
            +{stats.addedLines}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Added Lines
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              +{stats.addedLines}
            </div>
          </div>
        </div>

        {/* Removed Lines Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#090c17]/90 border border-white/[0.07] backdrop-blur-md">
          <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-sm flex-shrink-0">
            -{stats.removedLines}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Removed Lines
            </div>
            <div className="text-base sm:text-lg font-bold text-rose-400">
              -{stats.removedLines}
            </div>
          </div>
        </div>

        {/* Modified Lines Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#090c17]/90 border border-white/[0.07] backdrop-blur-md">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
            ~{stats.modifiedLines}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Modified Lines
            </div>
            <div className="text-base sm:text-lg font-bold text-amber-400">
              ~{stats.modifiedLines}
            </div>
          </div>
        </div>

        {/* Similarity Match */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#090c17]/90 border border-white/[0.07] backdrop-blur-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
            {stats.similarityPercent}%
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Content Match
            </div>
            <div className="text-base sm:text-lg font-bold text-indigo-300">
              {stats.similarityPercent}% Match
            </div>
          </div>
        </div>

        {/* Total Differences & Quick Jump */}
        <div className="col-span-2 lg:col-span-1 flex items-center justify-between p-3.5 rounded-xl bg-[#090c17]/90 border border-white/[0.07] backdrop-blur-md">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Differences
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {stats.totalChanges} {stats.totalChanges === 1 ? "Change" : "Changes"}
            </div>
          </div>
          {stats.totalChanges > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => jumpToChange("prev")}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] transition-all"
                title="Jump to Previous Difference"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => jumpToChange("next")}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] transition-all"
                title="Jump to Next Difference"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOOLBAR CONTROLS & COMPARISON SETTINGS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#0a0d1a]/80 border border-white/[0.08] backdrop-blur-xl">
        {/* Left Side: View Mode, Granularity & Fold */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Mode: Side by Side vs Single Stream */}
          <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/[0.08]">
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
              <span>Single Stream</span>
            </button>
          </div>

          {/* Granularity: Word Level vs Line Level */}
          <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/[0.08]">
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
              Word Precision
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
              Line Precision
            </button>
          </div>

          {/* Fold Unchanged Lines Toggle */}
          <button
            onClick={() => setFoldUnchanged(!foldUnchanged)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
              foldUnchanged
                ? "bg-indigo-600/25 border-indigo-500/40 text-indigo-300"
                : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200"
            )}
            title="Collapse unchanged lines to focus only on differences with context"
          >
            {foldUnchanged ? (
              <>
                <UnfoldVertical className="w-3.5 h-3.5 text-indigo-400" />
                <span>Show All Lines</span>
              </>
            ) : (
              <>
                <FoldVertical className="w-3.5 h-3.5 text-slate-400" />
                <span>Focus Differences</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Spacing, Case, Swap, Clear */}
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
            title="Ignore extra spaces, tabs, and indentation differences"
          >
            Ignore Spacing
          </button>

          {/* Ignore Capitalization */}
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

          {/* Swap Documents */}
          <button
            onClick={handleSwap}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 transition-all"
            title="Swap Original and Modified documents"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Swap Sides</span>
          </button>

          {/* Clear Inputs */}
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

      {/* EDIT DOCUMENTS DRAWER (Desktop Toggle or Mobile Inputs Tab) */}
      {(showInputDrawer || mobileTab === "inputs") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl bg-[#0a0d1a]/95 border border-indigo-500/30 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Left Document Editor */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 flex-shrink-0" />
                <input
                  type="text"
                  value={leftLabel}
                  onChange={(e) => setLeftLabel(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-rose-400 w-full truncate"
                  placeholder="Original Document Name"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePasteClipboard("left")}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="w-3 h-3 text-rose-400" />
                  <span>Paste</span>
                </button>
                <label className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer">
                  <UploadCloud className="w-3 h-3 text-rose-400" />
                  <span>Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload("left", e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                rows={12}
                className="w-full font-mono text-xs sm:text-sm bg-black/60 border border-white/[0.08] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-rose-500/50 resize-y leading-relaxed"
                placeholder="Paste original text or code here..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                {leftText.split("\n").length} lines &bull; {leftText.length} chars
              </div>
            </div>
          </div>

          {/* Right Document Editor */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <input
                  type="text"
                  value={rightLabel}
                  onChange={(e) => setRightLabel(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none border-b border-transparent focus:border-emerald-400 w-full truncate"
                  placeholder="Modified Document Name"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePasteClipboard("right")}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="w-3 h-3 text-emerald-400" />
                  <span>Paste</span>
                </button>
                <label className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer">
                  <UploadCloud className="w-3 h-3 text-emerald-400" />
                  <span>Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload("right", e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                rows={12}
                className="w-full font-mono text-xs sm:text-sm bg-black/60 border border-white/[0.08] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500/50 resize-y leading-relaxed"
                placeholder="Paste modified text or code here..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                {rightText.split("\n").length} lines &bull; {rightText.length} chars
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRESETS VIEW (Mobile Tab or Desktop Grid) */}
      {mobileTab === "presets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0a0d1a]/80 border border-white/[0.08]">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                  {preset.title}
                </span>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {preset.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* MAIN DIFF VIEWER CONTAINER */}
      <div
        className={cn(
          "flex-col rounded-2xl border border-white/[0.1] bg-[#070913] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)]",
          mobileTab !== "compare" ? "hidden md:flex" : "flex"
        )}
      >
        {/* Pane Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/[0.08] bg-[#05070e] text-xs font-semibold text-slate-400">
          <div className="flex items-center justify-between px-4 py-2.5 border-r border-white/[0.08]">
            <div className="flex items-center gap-2 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-rose-400/20" />
              <span className="truncate font-mono">{leftLabel} (Original)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {leftText.split("\n").length} lines
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
              <span className="truncate font-mono">{rightLabel} (Modified)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {rightText.split("\n").length} lines
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: SIDE-BY-SIDE SPLIT VIEW                                    */}
        {/* ------------------------------------------------------------------ */}
        {viewMode === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 max-h-[660px] divide-y md:divide-y-0 md:divide-x divide-white/[0.08] overflow-hidden font-mono text-xs sm:text-[13px]">
            {/* LEFT PANE (Original) */}
            <div
              ref={leftScrollRef}
              onScroll={() => handleScroll("left")}
              className="overflow-y-auto overflow-x-auto max-h-[620px] bg-[#060710] scrollbar-thin scrollbar-thumb-white/10"
            >
              {displayRows.map((row, index) => {
                const isRemoved = row.type === "removed";
                const isModified = row.type === "modified";
                const isAddedOnOtherSide = row.type === "added";

                return (
                  <div
                    key={`left-${row.id}`}
                    id={`diff-row-${index}`}
                    className={cn(
                      "flex items-stretch min-w-full leading-6 transition-colors border-l-2",
                      isRemoved && "bg-rose-950/25 border-rose-500 text-rose-100",
                      isModified && "bg-amber-950/20 border-amber-500 text-amber-100",
                      isAddedOnOtherSide && "bg-white/[0.01] border-transparent opacity-30 select-none",
                      !isRemoved && !isModified && !isAddedOnOtherSide && "border-transparent hover:bg-white/[0.02] text-slate-300"
                    )}
                  >
                    {/* Line Number */}
                    <div className="w-12 px-2 py-0.5 text-right text-slate-600 select-none bg-[#04050a] flex-shrink-0 border-r border-white/[0.05] text-[11px]">
                      {row.leftLineNumber ?? ""}
                    </div>

                    {/* Change Indicator Symbol */}
                    <div className="w-5 flex items-center justify-center select-none flex-shrink-0 font-bold text-xs">
                      {isRemoved && <span className="text-rose-400 font-mono">-</span>}
                      {isModified && <span className="text-amber-400 font-mono">~</span>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-2.5 py-0.5 whitespace-pre overflow-x-visible">
                      {isModified && row.leftTokens ? (
                        row.leftTokens.map((token, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              token.type === "removed" &&
                                "bg-rose-500/35 text-rose-100 border border-rose-500/40 rounded px-1 font-semibold line-through decoration-rose-300/60"
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
              className="overflow-y-auto overflow-x-auto max-h-[620px] bg-[#060710] scrollbar-thin scrollbar-thumb-white/10"
            >
              {displayRows.map((row) => {
                const isAdded = row.type === "added";
                const isModified = row.type === "modified";
                const isRemovedOnOtherSide = row.type === "removed";

                return (
                  <div
                    key={`right-${row.id}`}
                    className={cn(
                      "flex items-stretch min-w-full leading-6 transition-colors border-l-2",
                      isAdded && "bg-emerald-950/25 border-emerald-500 text-emerald-100",
                      isModified && "bg-amber-950/20 border-amber-500 text-amber-100",
                      isRemovedOnOtherSide && "bg-white/[0.01] border-transparent opacity-30 select-none",
                      !isAdded && !isModified && !isRemovedOnOtherSide && "border-transparent hover:bg-white/[0.02] text-slate-300"
                    )}
                  >
                    {/* Line Number */}
                    <div className="w-12 px-2 py-0.5 text-right text-slate-600 select-none bg-[#04050a] flex-shrink-0 border-r border-white/[0.05] text-[11px]">
                      {row.rightLineNumber ?? ""}
                    </div>

                    {/* Change Indicator Symbol */}
                    <div className="w-5 flex items-center justify-center select-none flex-shrink-0 font-bold text-xs">
                      {isAdded && <span className="text-emerald-400 font-mono">+</span>}
                      {isModified && <span className="text-amber-400 font-mono">~</span>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-2.5 py-0.5 whitespace-pre overflow-x-visible">
                      {isModified && row.rightTokens ? (
                        row.rightTokens.map((token, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              token.type === "added" &&
                                "bg-emerald-500/35 text-emerald-100 border border-emerald-500/40 rounded px-1 font-semibold"
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
        {/* VIEW 2: SINGLE UNIFIED STREAM VIEW                                 */}
        {/* ------------------------------------------------------------------ */}
        {viewMode === "unified" && (
          <div
            ref={unifiedScrollRef}
            className="overflow-y-auto overflow-x-auto max-h-[660px] bg-[#060710] font-mono text-xs sm:text-[13px] scrollbar-thin scrollbar-thumb-white/10"
          >
            {displayRows.map((row, index) => {
              if (row.type === "unchanged") {
                return (
                  <div
                    key={row.id}
                    id={`diff-row-${index}`}
                    className="flex items-stretch min-w-full leading-6 hover:bg-white/[0.02] border-l-2 border-transparent text-slate-300"
                  >
                    <div className="w-12 px-2 py-0.5 text-right text-slate-600 select-none bg-[#04050a] text-[11px] border-r border-white/[0.05]">
                      {row.leftLineNumber}
                    </div>
                    <div className="w-12 px-2 py-0.5 text-right text-slate-600 select-none bg-[#04050a] text-[11px] border-r border-white/[0.05]">
                      {row.rightLineNumber}
                    </div>
                    <div className="w-6 flex items-center justify-center text-slate-600 select-none">
                      {" "}
                    </div>
                    <div className="flex-1 px-2.5 py-0.5 whitespace-pre text-slate-300">
                      {row.leftText}
                    </div>
                  </div>
                );
              }

              if (row.type === "modified") {
                return (
                  <React.Fragment key={row.id}>
                    {/* Removed Line */}
                    <div
                      id={`diff-row-${index}`}
                      className="flex items-stretch min-w-full leading-6 bg-rose-950/25 border-l-2 border-rose-500 text-rose-100"
                    >
                      <div className="w-12 px-2 py-0.5 text-right text-rose-400/60 select-none bg-rose-950/40 text-[11px] border-r border-rose-500/20">
                        {row.leftLineNumber}
                      </div>
                      <div className="w-12 px-2 py-0.5 text-right text-slate-700 select-none bg-[#04050a] text-[11px] border-r border-white/[0.05]">
                        {" "}
                      </div>
                      <div className="w-6 flex items-center justify-center text-rose-400 font-bold select-none">
                        -
                      </div>
                      <div className="flex-1 px-2.5 py-0.5 whitespace-pre">
                        {row.leftTokens ? (
                          row.leftTokens.map((token, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                token.type === "removed" &&
                                  "bg-rose-500/35 text-rose-100 border border-rose-500/40 rounded px-1 font-semibold line-through decoration-rose-300/60"
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
                    <div className="flex items-stretch min-w-full leading-6 bg-emerald-950/25 border-l-2 border-emerald-500 text-emerald-100">
                      <div className="w-12 px-2 py-0.5 text-right text-slate-700 select-none bg-[#04050a] text-[11px] border-r border-white/[0.05]">
                        {" "}
                      </div>
                      <div className="w-12 px-2 py-0.5 text-right text-emerald-400/60 select-none bg-emerald-950/40 text-[11px] border-r border-emerald-500/20">
                        {row.rightLineNumber}
                      </div>
                      <div className="w-6 flex items-center justify-center text-emerald-400 font-bold select-none">
                        +
                      </div>
                      <div className="flex-1 px-2.5 py-0.5 whitespace-pre">
                        {row.rightTokens ? (
                          row.rightTokens.map((token, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                token.type === "added" &&
                                  "bg-emerald-500/35 text-emerald-100 border border-emerald-500/40 rounded px-1 font-semibold"
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
                    id={`diff-row-${index}`}
                    className="flex items-stretch min-w-full leading-6 bg-rose-950/25 border-l-2 border-rose-500 text-rose-100"
                  >
                    <div className="w-12 px-2 py-0.5 text-right text-rose-400/60 select-none bg-rose-950/40 text-[11px] border-r border-rose-500/20">
                      {row.leftLineNumber}
                    </div>
                    <div className="w-12 px-2 py-0.5 text-right text-slate-700 select-none bg-[#04050a] text-[11px] border-r border-white/[0.05]">
                      {" "}
                    </div>
                    <div className="w-6 flex items-center justify-center text-rose-400 font-bold select-none">
                      -
                    </div>
                    <div className="flex-1 px-2.5 py-0.5 whitespace-pre">{row.leftText}</div>
                  </div>
                );
              }

              if (row.type === "added") {
                return (
                  <div
                    key={row.id}
                    id={`diff-row-${index}`}
                    className="flex items-stretch min-w-full leading-6 bg-emerald-950/25 border-l-2 border-emerald-500 text-emerald-100"
                  >
                    <div className="w-12 px-2 py-0.5 text-right text-slate-700 select-none bg-[#04050a] text-[11px] border-r border-white/[0.05]">
                      {" "}
                    </div>
                    <div className="w-12 px-2 py-0.5 text-right text-emerald-400/60 select-none bg-emerald-950/40 text-[11px] border-r border-emerald-500/20">
                      {row.rightLineNumber}
                    </div>
                    <div className="w-6 flex items-center justify-center text-emerald-400 font-bold select-none">
                      +
                    </div>
                    <div className="flex-1 px-2.5 py-0.5 whitespace-pre">{row.rightText}</div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}

        {/* Diff Footer Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#05070e] border-t border-white/[0.08] text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>+{stats.addedLines} Added</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>-{stats.removedLines} Removed</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>~{stats.modifiedLines} Modified</span>
            </span>
            <span className="text-slate-500">
              {stats.unchangedLines} Unchanged Lines
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Zero Data Transmitted &bull; Private In-Memory Engine</span>
          </div>
        </div>
      </div>

      {/* DESKTOP SAMPLE PRESETS TILE BAR (Zero Emojis, Authentic Vector Icons) */}
      <div className="hidden md:flex flex-col gap-3 p-5 rounded-2xl bg-[#0a0d1a]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Instant Real-World Presets</h3>
          </div>
          <span className="text-xs text-slate-400">Test the comparison engine with realistic data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset) => {
            const IconComponent =
              preset.iconName === "code"
                ? Code2
                : preset.iconName === "legal"
                ? FileText
                : preset.iconName === "academic"
                ? BookOpen
                : Layers;

            return (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {preset.title}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-semibold text-emerald-400">
                  {preset.category}
                </span>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE FLOATING ACTION HUD (Fixed to Bottom on small screens) */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 flex items-center justify-between p-2 rounded-2xl bg-[#070a14]/95 border border-white/[0.12] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs font-bold text-white">
            {stats.totalChanges} {stats.totalChanges === 1 ? "Change" : "Changes"}
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {stats.similarityPercent}% Match
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {stats.totalChanges > 0 && (
            <>
              <button
                onClick={() => jumpToChange("prev")}
                className="p-2 rounded-xl bg-white/[0.06] text-slate-200 border border-white/[0.08] active:scale-95 transition-all"
                title="Previous Change"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => jumpToChange("next")}
                className="p-2 rounded-xl bg-white/[0.06] text-slate-200 border border-white/[0.08] active:scale-95 transition-all"
                title="Next Change"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => handleCopyText(rightText, "Modified Document")}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs border border-emerald-400/40 active:scale-95 transition-all shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
