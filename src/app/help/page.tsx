"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  HelpCircle, 
  Send, 
  Zap, 
  ShieldCheck, 
  User, 
  AlignLeft, 
  ImagePlus, 
  CheckCircle2, 
  X, 
  Loader2, 
  AlertTriangle,
  LifeBuoy,
  CreditCard,
  Bug,
  Lightbulb,
  MessageSquare,
  Crown,
  Layers,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Key,
  Flame,
  Sparkles,
  Settings,
  ShoppingBag,
  CornerDownLeft,
  Coins
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { submitContactRequest, getActiveSupportTicket } from "@/app/actions/contact";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { AvatarWithFrame } from "@/components/ui/AvatarWithFrame";
import { PremiumName } from "@/components/ui/PremiumName";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: "How do credits work and refill?", icon: CreditCard },
  { label: "What are Sparks and how to earn them?", icon: Sparkles },
  { label: "Are currency spends refundable?", icon: ShieldCheck },
  { label: "What benefits come with Pro?", icon: Crown },
  { label: "Where can I report a bug with a tool?", icon: Bug },
  { label: "What file types are supported?", icon: Layers },
];

/**
 * Rich Markdown formatter for Support Chat messages.
 * Converts raw Markdown (bold, lists, tables, code, and route links) into polished React elements.
 * Eliminates all token artifacts and unformatted strings.
 */
function FormattedChatMessage({ content }: { content: string }) {
  const renderInlineStyles = (text: string) => {
    let s = text;

    // 1. Normalize routes wrapped in backticks or asterisks or plain paths:
    s = s.replace(/\*\*`?(\/(?:account|developer|community|shop|pro|help|history|pricing|tools|auth)[a-zA-Z0-9\/-]*)`?\*\*/g, '«ROUTE:$1»');
    s = s.replace(/`(\/(?:account|developer|community|shop|pro|help|history|pricing|tools|auth)[a-zA-Z0-9\/-]*)`/g, '«ROUTE:$1»');
    
    // 2. Explicit markdown links [label](/route) or [label](https://...)
    s = s.replace(/\[([^\]]+)\]\((\/[a-zA-Z0-9\/-]+)\)/g, '«LINK:$1:$2»');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '«EXTLINK:$1:$2»');

    // 3. Standalone route paths in plain text (supports start of string, whitespace, or parens/brackets)
    s = s.replace(/(^|[\s([{])(\/(?:account|developer|community|shop|pro|help|history|pricing|tools|auth)[a-zA-Z0-9\/-]*)(?=$|[\s.,;:!?)}\]])/g, '$1«ROUTE:$2»');

    // 4. Paired bold: **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, '«BOLD:$1»');

    // 5. Paired italic: *text*
    s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '«ITALIC:$1»');

    // 6. Inline code: `code`
    s = s.replace(/`([^`]+)`/g, '«CODE:$1»');

    // 7. Strip any remaining orphan asterisks
    s = s.replace(/\*{1,4}/g, '');

    // Split by custom token delimiters «...»
    const tokenRegex = /(«ROUTE:[^»]+»|«LINK:[^»]+»|«EXTLINK:[^»]+»|«BOLD:[^»]+»|«ITALIC:[^»]+»|«CODE:[^»]+»)/g;
    const parts = s.split(tokenRegex);

    return parts.map((part, i) => {
      if (!part) return null;

      if (part.startsWith('«ROUTE:') && part.endsWith('»')) {
        const route = part.slice(7, -1);
        return (
          <Link
            key={i}
            href={route}
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/25 hover:border-cyan-400/40 text-cyan-300 hover:text-cyan-100 text-[11px] font-mono font-medium transition-all shadow-sm align-baseline"
          >
            <span>{route}</span>
            <ExternalLink size={9} className="shrink-0 text-cyan-400" />
          </Link>
        );
      }

      if (part.startsWith('«LINK:') && part.endsWith('»')) {
        const payload = part.slice(6, -1);
        const firstColon = payload.indexOf(':');
        const label = payload.slice(0, firstColon);
        const route = payload.slice(firstColon + 1);
        return (
          <Link
            key={i}
            href={route}
            className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/25 hover:border-cyan-400/40 text-cyan-300 hover:text-cyan-100 text-[11px] font-medium transition-all shadow-sm align-baseline"
          >
            <span>{label}</span>
            <ExternalLink size={9} className="shrink-0 text-cyan-400" />
          </Link>
        );
      }

      if (part.startsWith('«EXTLINK:') && part.endsWith('»')) {
        const payload = part.slice(9, -1);
        const firstColon = payload.indexOf(':');
        const label = payload.slice(0, firstColon);
        const url = payload.slice(firstColon + 1);
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-medium text-xs align-baseline"
          >
            <span>{label}</span>
            <ExternalLink size={10} className="shrink-0" />
          </a>
        );
      }

      if (part.startsWith('«BOLD:') && part.endsWith('»')) {
        const boldText = part.slice(6, -1);
        return (
          <strong key={i} className="font-bold text-white">
            {boldText}
          </strong>
        );
      }

      if (part.startsWith('«ITALIC:') && part.endsWith('»')) {
        const italicText = part.slice(8, -1);
        return (
          <em key={i} className="italic text-zinc-300">
            {italicText}
          </em>
        );
      }

      if (part.startsWith('«CODE:') && part.endsWith('»')) {
        const codeText = part.slice(6, -1);
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-white/[0.07] text-cyan-200 font-mono text-[11px] border border-white/10"
          >
            {codeText}
          </code>
        );
      }

      return part;
    });
  };

  // Block Tokenizer:
  type Block =
    | { type: 'hr' }
    | { type: 'heading'; level: number; text: string }
    | { type: 'table'; headers: string[]; rows: string[][] }
    | { type: 'code'; language: string; code: string }
    | { type: 'numbered'; num: string; text: string }
    | { type: 'bullet'; text: string }
    | { type: 'paragraph'; text: string }
    | { type: 'spacer' };

  const splitCells = (rowLine: string): string[] => {
    let line = rowLine.trim();
    if (line.startsWith("|")) line = line.slice(1);
    if (line.endsWith("|")) line = line.slice(0, -1);
    return line.split("|").map(c => c.trim());
  };

  const isTableSeparator = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed.includes("-")) return false;
    const cells = splitCells(trimmed);
    return cells.length > 0 && cells.every(c => /^:?-+:?$/.test(c.trim()));
  };

  const isTableRow = (line: string): boolean => {
    const trimmed = line.trim();
    return trimmed.startsWith("|") && (trimmed.endsWith("|") || trimmed.split("|").length > 2);
  };

  const blocks: Block[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      blocks.push({ type: 'spacer' });
      i++;
      continue;
    }

    // 1. Horizontal Rule (---, ***, ___)
    if (/^(?:---|\*\*\*|___)\s*$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 2. Fenced Code Block (```lang ... ```)
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({ type: 'code', language, code: codeLines.join("\n") });
      continue;
    }

    // 3. Table Block
    if (isTableRow(trimmed)) {
      const tableLines: string[] = [];
      while (i < lines.length && (isTableRow(lines[i]) || isTableSeparator(lines[i]))) {
        tableLines.push(lines[i]);
        i++;
      }

      const nonSeparatorLines = tableLines.filter(l => !isTableSeparator(l));
      if (nonSeparatorLines.length > 0) {
        const headers = splitCells(nonSeparatorLines[0]);
        const rows = nonSeparatorLines.slice(1).map(l => splitCells(l));
        blocks.push({ type: 'table', headers, rows });
      }
      continue;
    }

    // 4. Heading (# Header, ## Header, ### Header, etc.)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2]
      });
      i++;
      continue;
    }

    // 5. Standalone Bold Header: e.g. **Pro Subscription Benefits:**
    const boldHeaderMatch = trimmed.match(/^\*\*([^*:]+):?\*\*$/);
    if (boldHeaderMatch) {
      blocks.push({
        type: 'heading',
        level: 3,
        text: boldHeaderMatch[1]
      });
      i++;
      continue;
    }

    // 6. Numbered List Item (1. or 1) )
    const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numberedMatch) {
      blocks.push({
        type: 'numbered',
        num: numberedMatch[1],
        text: numberedMatch[2]
      });
      i++;
      continue;
    }

    // 7. Bullet List Item (- or * or •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({
        type: 'bullet',
        text: bulletMatch[1]
      });
      i++;
      continue;
    }

    // 8. Standard Paragraph
    blocks.push({
      type: 'paragraph',
      text: trimmed
    });
    i++;
  }

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'spacer':
            return <div key={idx} className="h-1" />;

          case 'hr':
            return <div key={idx} className="my-3.5 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />;

          case 'heading': {
            const startsWithNumber = /^(\d+)[\.\)]\s*/.test(block.text);
            return (
              <div key={idx} className="pt-2 pb-0.5">
                <h4 className={cn(
                  "font-bold tracking-tight text-white flex items-center gap-2",
                  block.level <= 2 ? "text-sm sm:text-base text-white font-extrabold" : "text-xs sm:text-sm text-cyan-300"
                )}>
                  {!startsWithNumber && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  )}
                  <span>{renderInlineStyles(block.text)}</span>
                </h4>
              </div>
            );
          }

          case 'numbered':
            return (
              <div key={idx} className="flex items-start gap-3 pl-0.5 text-zinc-300">
                <span className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {block.num}
                </span>
                <div className="flex-1 leading-relaxed">{renderInlineStyles(block.text)}</div>
              </div>
            );

          case 'bullet':
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-0.5 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                <div className="flex-1 leading-relaxed">{renderInlineStyles(block.text)}</div>
              </div>
            );

          case 'table':
            return (
              <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#05060d]/80 backdrop-blur-md shadow-lg ring-1 ring-white/[0.04]">
                <table className="w-full text-left text-xs border-collapse">
                  {block.headers.length > 0 && (
                    <thead className="bg-white/[0.04] border-b border-white/[0.08] text-white">
                      <tr>
                        {block.headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-4 py-2.5 font-bold uppercase tracking-wider text-[11px] text-zinc-200">
                            {renderInlineStyles(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-white/[0.04]">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={cn("px-4 py-2.5 leading-relaxed", cIdx === 0 ? "font-semibold text-white" : "text-zinc-300")}>
                            {renderInlineStyles(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'code':
            return (
              <div key={idx} className="my-2.5 rounded-xl border border-white/[0.08] bg-[#05060d] overflow-hidden shadow-md">
                {block.language && (
                  <div className="px-3.5 py-1.5 bg-white/[0.03] border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    {block.language}
                  </div>
                )}
                <pre className="p-3.5 text-xs font-mono text-cyan-200 overflow-x-auto">
                  <code>{block.code}</code>
                </pre>
              </div>
            );

          case 'paragraph':
            return (
              <p key={idx} className="text-zinc-300 leading-relaxed">
                {renderInlineStyles(block.text)}
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

export default function HelpPage() {
  const supabase = useMemo(() => createClient(), []);
  
  // Real-time User & Pro store
  const { user: dbUser, authUser, isPro, isLoading: isProLoading } = usePro();
  const creditState = useCredits();

  // Local fetched profile state
  const [profileData, setProfileData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  // Navigation tab between AI Agent & Manual Ticket
  const [activeMode, setActiveMode] = useState<"ai" | "ticket">("ai");

  // AI Agent Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am the Exismic AI Support Assistant, powered by the platform knowledge engine. I know all 40+ Exismic tools, credit rules, Pro membership benefits, and developer APIs.\n\nHow can I help you today? You can ask a question or tap one of the quick suggestions below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Dedicated internal scroll ref for the message container ONLY (no window scrolling)
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Ticket Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Transaction fields state
  const [transactionId, setTransactionId] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactionError, setTransactionError] = useState("");
  const [isValidatingTransaction, setIsValidatingTransaction] = useState(false);
  const [isTransactionVerified, setIsTransactionVerified] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active ticket checking state
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [checkingActiveTicket, setCheckingActiveTicket] = useState(false);

  // 1. Direct API Profile Fetch on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadDirectProfile() {
      try {
        const res = await fetch(`/api/user/profile?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user && isMounted) {
            setProfileData(json.user);
            setUser(json.user);
            if (json.user.name) setName(json.user.name);
            if (json.user.email) setEmail(json.user.email);
          }
        }
      } catch (err) {
        console.warn("Direct profile fetch error:", err);
      }
    }
    loadDirectProfile();
    return () => { isMounted = false; };
  }, []);

  // 2. Sync real-time profile details from usePro & Supabase
  useEffect(() => {
    const activeData = profileData || dbUser;
    const resolvedName = activeData?.full_name || activeData?.name || activeData?.username || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || "";
    const resolvedEmail = activeData?.email || authUser?.email || "";

    if (resolvedName && (!name || name === "")) setName(resolvedName);
    if (resolvedEmail && (!email || email === "")) setEmail(resolvedEmail);
    if (authUser || activeData) setUser(activeData || authUser);
  }, [profileData, dbUser, authUser, name, email]);

  // Total credits calculation
  const totalAvailableCredits = (profileData?.daily_credits || creditState?.dailyCredits || 0) + 
                                (profileData?.bonus_credits || creditState?.bonusCredits || 0) + 
                                (profileData?.lifetime_credits || creditState?.lifetimeCredits || 0);

  const activeIsPro = isPro || profileData?.is_pro || false;
  const activeDisplayName = name || profileData?.name || profileData?.username || dbUser?.name || "Creator";
  const activeDisplayEmail = email || profileData?.email || dbUser?.email || authUser?.email || "";
  const avatarFrame = profileData?.avatar_frame || dbUser?.avatar_frame || null;
  const nameGradient = profileData?.name_gradient || dbUser?.name_gradient || null;
  const avatarUrl = profileData?.custom_avatar_url || dbUser?.custom_avatar_url || null;

  // INTERNAL ONLY SCROLLING - Scrolls only the chat container without hijacking the page/window!
  useEffect(() => {
    if (activeMode === "ai" && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatMessages, isAiLoading, activeMode]);

  // Check active unresolved ticket when email is loaded
  useEffect(() => {
    if (!activeDisplayEmail) return;
    async function checkTicket() {
      setCheckingActiveTicket(true);
      try {
        const ticket = await getActiveSupportTicket(activeDisplayEmail);
        setActiveTicket(ticket);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingActiveTicket(false);
      }
    }
    checkTicket();
  }, [activeDisplayEmail]);

  // Load transactions in background for billing inquiries
  useEffect(() => {
    if (subject === "Billing Inquiry" && user && transactions.length === 0) {
      const fetchUserTransactions = async () => {
        setIsTransactionsLoading(true);
        try {
          const res = await fetch("/api/user/transactions");
          const json = await res.json();
          if (res.ok && json.success) {
            setTransactions(json.data);
          }
        } catch (error) {
          console.error("Failed to load user transactions:", error);
        } finally {
          setIsTransactionsLoading(false);
        }
      };
      fetchUserTransactions();
    }
  }, [subject, user, transactions.length]);

  const handleSendAiMessage = async (queryText?: string) => {
    const textToSend = queryText || chatInput.trim();
    if (!textToSend || isAiLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput("");
    setIsAiLoading(true);

    const userContext = {
      name: activeDisplayName,
      email: activeDisplayEmail,
      isPro: activeIsPro,
      credits: totalAvailableCredits,
      dailyStreak: creditState?.dailyStreak || 0,
    };

    try {
      const res = await fetch("/api/help/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userContext,
        })
      });

      const data = await res.json();
      const replyContent = data.reply || "I am currently unable to reach the knowledge base. Please reach out to our support team at support@exismic.xyz.";

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an unexpected error. Please submit a support ticket below or email support@exismic.xyz.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Chat cleared. Ask me anything about Exismic tools, Pro membership, credits, or API integrations!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const validateTransactionId = async (ref: string) => {
    const trimmed = ref.trim();
    if (!trimmed) {
      setTransactionError("Transaction Reference ID is required for billing inquiries.");
      setIsTransactionVerified(false);
      return false;
    }
    
    setIsValidatingTransaction(true);
    setTransactionError("");
    try {
      const res = await fetch(`/api/user/transactions/validate?ref=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (res.ok && json.success && json.isValid) {
        setIsTransactionVerified(true);
        setTransactionError("");
        return true;
      } else {
        setTransactionError("Transaction reference not found. Please verify the ID or select a recent purchase.");
        setIsTransactionVerified(false);
        return false;
      }
    } catch (error) {
      setTransactionError("Validation failed. Please try again.");
      setIsTransactionVerified(false);
      return false;
    } finally {
      setIsValidatingTransaction(false);
    }
  };

  const subjectOptions = [
    { label: "General Support", icon: HelpCircle, desc: "General help, tools & account" },
    { label: "Billing Inquiry", icon: CreditCard, desc: "Purchases, refunds & Pro plans" },
    { label: "Bug Report", icon: Bug, desc: "Errors, glitches & broken tools" },
    { label: "Feature Request", icon: Lightbulb, desc: "Suggestions & ideas" },
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    if (subject === "Billing Inquiry") {
      const isValid = isTransactionVerified || await validateTransactionId(transactionId);
      if (!isValid) {
        setErrorMsg("A valid Transaction Reference ID is required for billing inquiries.");
        setIsSubmitting(false);
        return;
      }
    }
    
    const finalMessage = subject === "Billing Inquiry"
      ? `[Transaction Reference: ${transactionId}]\n\n${message}`
      : message;
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("subject", subject);
    formData.append("message", finalMessage);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    
    const result = await submitContactRequest(formData);
    
    if (result.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image size must be less than 5MB.");
        return;
      }
      setImageFile(file);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("support@exismic.xyz");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-cyan-500/30 pb-32 overflow-hidden" suppressHydrationWarning>
      {/* Background Lighting Architecture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[900px] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/8 blur-[130px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/8 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.025]" />
      </div>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 space-y-10 relative z-10">
        <PageBreadcrumb items={[{ label: "Support & Help Center" }]} />

        {/* Hero Section with Live Authenticated User Status Strip */}
        <header className="relative isolate overflow-hidden rounded-[2.5rem] border-2 border-cyan-400/40 bg-gradient-to-b from-[#0e0c1f]/95 via-[#090814]/95 to-[#04040a]/98 p-6 sm:p-10 lg:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_40px_rgba(34,211,238,0.2)] backdrop-blur-2xl space-y-8">
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <ExismicMark size={18} letter="S" theme="blue" animated={false} />
                <span>Exismic Support & Knowledge Hub</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic leading-[1.1]">
                Instant Answers & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-200 to-white drop-shadow-sm">
                  AI Support Intelligence.
                </span>
              </h1>
              <p className="text-zinc-400 font-medium text-xs sm:text-sm leading-relaxed">
                Chat live with our trained AI Support Assistant for immediate guidance across all 40+ tools, or submit a ticket directly to the Exismic support team.
              </p>
            </div>

            {/* High-Contrast Interactive Mode Switcher Tabs */}
            <div className="flex bg-[#070814]/90 p-1.5 rounded-2xl border border-white/[0.08] shrink-0 shadow-2xl backdrop-blur-xl self-start md:self-auto ring-1 ring-white/[0.05]">
              <button
                type="button"
                onClick={() => setActiveMode("ai")}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
                  activeMode === "ai"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <ExismicMark size={18} letter="S" theme="blue" animated={activeMode === "ai"} />
                <span>AI Support Agent</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("ticket")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
                  activeMode === "ticket"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <MessageSquare size={16} />
                <span>Submit Ticket</span>
              </button>
            </div>
          </div>

          {/* User Account Context Banner (Fetched & Live) */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. User Identity */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <AvatarWithFrame
                avatarUrl={avatarUrl}
                displayName={activeDisplayName}
                isPro={activeIsPro}
                frameId={avatarFrame}
                size="sm"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <PremiumName name={activeDisplayName} gradientId={nameGradient} isPro={activeIsPro} className="text-xs font-black truncate" />
                  {activeIsPro && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-black uppercase tracking-wider shrink-0">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 truncate font-mono mt-0.5">{activeDisplayEmail || "Guest User"}</p>
              </div>
            </div>

            {/* 2. Available Vault Credits */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300 flex items-center justify-center shrink-0">
                  <CreditCard size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-white font-mono">{totalAvailableCredits.toLocaleString()}</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Vault Credits</p>
                </div>
              </div>
              <Link href="/shop" className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                Refill <ExternalLink size={10} />
              </Link>
            </div>

            {/* 3. Membership Status */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", activeIsPro ? "bg-amber-500/15 border-amber-400/30 text-amber-300" : "bg-zinc-800 border-white/10 text-zinc-400")}>
                  <Crown size={16} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-white">{activeIsPro ? "Pro VIP Active" : "Free Plan"}</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{activeIsPro ? "500 Daily Credits" : "50 Daily Credits"}</p>
                </div>
              </div>
              <Link href="/pro" className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                {activeIsPro ? "Perks" : "Upgrade"} <ExternalLink size={10} />
              </Link>
            </div>

            {/* 4. Support Guarantee */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-tight text-white">Under 24h Review</p>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider truncate">Dedicated Support Desk</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <div className="space-y-8">
          
          {/* =========================================================================
              1. AI SUPPORT ASSISTANT (OPEN-CANVAS FULL-WIDTH IMMERSIVE STUDIO)
             ========================================================================= */}
          {activeMode === "ai" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Open Studio Workspace */}
              <div className="relative overflow-hidden rounded-[2rem] border-2 border-cyan-400/40 bg-[#070814]/90 backdrop-blur-2xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.95),0_0_45px_rgba(6,182,212,0.25)] flex flex-col min-h-[640px] max-h-[760px]">
                
                {/* Subtle Ambient Studio Lighting */}
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-gradient-to-b from-cyan-500/[0.08] via-blue-600/[0.03] to-transparent blur-3xl -z-0" />
                <div className="pointer-events-none absolute -bottom-20 right-0 w-80 h-80 bg-purple-600/[0.04] blur-3xl -z-0" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] opacity-60 -z-0" />

                {/* Studio Header Bar */}
                <div className="px-6 py-4.5 sm:px-8 sm:py-5 border-b border-white/[0.07] bg-[#070814]/85 backdrop-blur-xl flex items-center justify-between gap-4 z-20">
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="relative p-1.5 rounded-2xl bg-gradient-to-b from-cyan-500/15 to-transparent border border-cyan-400/25 shadow-[0_0_20px_rgba(6,182,212,0.18)] shrink-0">
                      <ExismicMark size={36} letter="S" theme="blue" animated={true} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">Exismic AI Assistant</h3>
                        <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.18)]">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                          </span>
                          Live Support Intelligence
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-400 font-normal mt-0.5">Trained across all 11 tool suites, credit rules, Pro perks, and developer APIs</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="group px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all duration-200 text-xs font-medium flex items-center gap-2 border border-white/[0.08] hover:border-white/[0.18] cursor-pointer shadow-sm active:scale-95"
                    title="Reset chat conversation"
                  >
                    <RotateCcw size={13} className="text-zinc-400 group-hover:text-cyan-300 group-hover:-rotate-45 transition-all duration-200" />
                    <span className="hidden sm:inline">Reset Session</span>
                  </button>
                </div>

                {/* Open Chat Message Stream (Internal-only smooth scrolling) */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 relative z-10 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]"
                >
                  {chatMessages.map((msg) => {
                    const isUser = msg.role === "user";
                    const isCopied = copiedMessageId === msg.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-3.5 sm:gap-4 max-w-full group/msg",
                          isUser ? "ml-auto flex-row-reverse max-w-[85%]" : "mr-auto max-w-[92%]"
                        )}
                      >
                        {/* Avatar Column */}
                        <div className="shrink-0 pt-0.5">
                          {isUser ? (
                            <AvatarWithFrame
                              avatarUrl={avatarUrl}
                              displayName={activeDisplayName}
                              isPro={activeIsPro}
                              frameId={avatarFrame}
                              size="sm"
                            />
                          ) : (
                            <div className="p-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                              <ExismicMark size={28} letter="S" theme="blue" animated={false} />
                            </div>
                          )}
                        </div>

                        {/* Content Area */}
                        <div className={cn("space-y-1.5", isUser ? "max-w-full" : "flex-1 min-w-0")}>
                          {isUser ? (
                            <div className="px-5 py-3.5 rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 text-white font-medium text-xs sm:text-sm leading-relaxed shadow-[0_4px_20px_rgba(147,51,234,0.3)] border border-purple-400/30">
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ) : (
                            <div className="rounded-2xl rounded-tl-sm bg-white/[0.03] hover:bg-white/[0.045] border border-white/[0.07] hover:border-white/[0.12] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.25)] text-zinc-200 backdrop-blur-md transition-all duration-200">
                              <FormattedChatMessage content={msg.content} />
                            </div>
                          )}

                          {/* Message Actions */}
                          <div className={cn("flex items-center gap-3 text-[10px] text-zinc-500 pt-1", isUser ? "justify-end px-2" : "justify-start pl-1")}>
                            <span className="font-mono">{msg.timestamp}</span>
                            {!isUser && (
                              <button
                                type="button"
                                onClick={() => copyMessage(msg.id, msg.content)}
                                className="opacity-0 group-hover/msg:opacity-100 px-2 py-0.5 rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Copy answer"
                              >
                                {isCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                <span>{isCopied ? "Copied" : "Copy"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* AI Loading State */}
                  {isAiLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3.5 sm:gap-4 mr-auto max-w-[92%] items-center"
                    >
                      <div className="shrink-0">
                        <div className="p-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                          <ExismicMark size={28} letter="S" theme="blue" animated={true} />
                        </div>
                      </div>
                      <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-white/[0.03] border border-cyan-500/20 backdrop-blur-md flex items-center gap-3 text-cyan-300 text-xs font-medium shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <Loader2 size={15} className="animate-spin text-cyan-400" />
                        <span className="text-zinc-400">Exismic AI Assistant is finding your answer...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Floating Prompt Suggestions Strip */}
                <div className="relative px-5 sm:px-8 py-3 border-t border-white/[0.06] bg-[#060712]/80 backdrop-blur-xl">
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#060712] to-transparent z-10" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#060712] to-transparent z-10" />
                  <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendAiMessage(prompt.label)}
                        disabled={isAiLoading}
                        className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-400/40 text-[11px] sm:text-xs font-medium text-zinc-300 hover:text-cyan-200 whitespace-nowrap transition-all duration-200 cursor-pointer disabled:opacity-40 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:-translate-y-0.5 active:translate-y-0 shrink-0"
                      >
                        <prompt.icon size={13} className="text-cyan-400/80 group-hover:text-cyan-300 transition-colors shrink-0" />
                        <span>{prompt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floating Futuristic Input Command Bar */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendAiMessage(); }}
                  className="p-3 sm:p-5 border-t border-white/[0.07] bg-[#070814]/95 backdrop-blur-2xl z-20"
                >
                  <div className="relative flex items-center w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus-within:border-cyan-400/50 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_30px_rgba(6,182,212,0.2)] focus-within:ring-1 focus-within:ring-cyan-400/30 transition-all duration-300 p-1.5 sm:p-2 gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about any tool, credits, Pro benefits, APIs, or issue..."
                      disabled={isAiLoading}
                      className="flex-1 h-11 sm:h-12 bg-transparent border-none pl-3 sm:pl-4 pr-2 text-xs sm:text-sm font-medium text-white placeholder-zinc-500 outline-none focus:outline-none ring-0 focus:ring-0"
                    />
                    {chatInput && (
                      <button
                        type="button"
                        onClick={() => setChatInput("")}
                        className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <X size={15} />
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isAiLoading || !chatInput.trim()}
                      className="group h-11 sm:h-12 px-6 sm:px-7 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:pointer-events-none disabled:shadow-none transition-all cursor-pointer shrink-0"
                    >
                      <span>Ask AI</span>
                      <Send size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Secondary Support Channels (Under AI Studio) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Direct Email Card */}
                <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] hover:border-white/[0.14] bg-[#070814]/80 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4 transition-all duration-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-white tracking-wide">Direct Email Desk</h4>
                      <p className="text-[11px] text-zinc-400 font-mono">support@exismic.xyz</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] cursor-pointer"
                    >
                      {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedEmail ? "Copied" : "Copy"}</span>
                    </button>
                    <a
                      href="mailto:support@exismic.xyz"
                      className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <span>Open Mail</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Developer API Docs Card */}
                <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] hover:border-white/[0.14] bg-[#070814]/80 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4 transition-all duration-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                      <Key size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-white tracking-wide">Developer API Suite</h4>
                      <p className="text-[11px] text-zinc-400">Endpoints, Keys & cURL Samples</p>
                    </div>
                  </div>
                  <Link
                    href="/developer/docs"
                    className="px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  >
                    <span>Browse Docs</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              2. MANUAL SUPPORT TICKET WORKSPACE (2-COLUMN WORKSPACE)
             ========================================================================= */}
          {activeMode === "ticket" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Workspace (Col 8) */}
              <div className="lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-[2rem] border-2 border-purple-500/40 bg-[#070814]/90 backdrop-blur-2xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.95),0_0_45px_rgba(168,85,247,0.25)] p-6 sm:p-10"
                >
                  {/* Ambient Backdrop Glows */}
                  <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-3/4 h-52 bg-gradient-to-b from-purple-600/[0.08] via-indigo-600/[0.03] to-transparent blur-3xl -z-0" />
                  <div className="pointer-events-none absolute -bottom-24 -left-20 w-72 h-72 bg-pink-600/[0.04] blur-3xl -z-0" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] opacity-60 -z-0" />
                  
                  <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <div className="space-y-1.5 border-b border-white/[0.07] pb-6">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Send a Support Ticket</h2>
                      <p className="text-xs sm:text-sm text-zinc-400 font-normal mt-0.5">Submit your request directly to the Exismic support desk.</p>
                    </div>

                    <form onSubmit={handleSubmitTicket} className="space-y-6">
                      {errorMsg && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-3">
                          <X size={16} className="shrink-0" /> {errorMsg}
                        </div>
                      )}

                      {activeTicket && (
                        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                            <AlertTriangle size={14} /> Active Ticket in Progress
                          </div>
                          <p className="leading-relaxed">
                            You already have an open request: <strong className="text-white">"{activeTicket.subject}"</strong> (Status: <span className="uppercase text-amber-400 font-bold">{activeTicket.status}</span>) submitted on {new Date(activeTicket.createdAt).toLocaleDateString()}.
                          </p>
                          <p className="text-zinc-400 text-[10px]">
                            To maintain top support response times, please wait until your pending ticket is resolved before submitting a new one.
                          </p>
                        </div>
                      )}
                      
                      {isSuccess ? (
                        <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                          <div className="relative w-20 h-20">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative w-full h-full rounded-3xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                              <CheckCircle2 size={40} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Request Received!</p>
                            <p className="text-zinc-400 text-xs max-w-sm mx-auto">Our support team will review your ticket and reply to <span className="text-white font-semibold">{email}</span> within 24 hours.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setIsSuccess(false); setMessage(""); setImageFile(null); }}
                            className="px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.12] text-white font-semibold text-xs uppercase tracking-wider transition-all"
                          >
                            Submit Another Request
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Subject Category Selector */}
                          <div className="space-y-3">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">Select Category</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {subjectOptions.map(opt => {
                                const isSelected = subject === opt.label;
                                return (
                                  <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => setSubject(opt.label)}
                                    className={cn(
                                      "group relative p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.98]",
                                      isSelected
                                        ? "bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.2)] text-white ring-1 ring-purple-400/30"
                                        : "bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200",
                                      isSelected 
                                        ? "bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                                        : "bg-white/[0.04] border-white/[0.08] text-zinc-400 group-hover:text-zinc-200 group-hover:border-white/[0.15]"
                                    )}>
                                      <opt.icon size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold uppercase tracking-wide truncate">{opt.label}</p>
                                      <p className="text-[11px] text-zinc-400/80 mt-0.5 truncate">{opt.desc}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Name & Email Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">Your Name</label>
                              <div className="relative flex items-center group">
                                <User size={15} className="absolute left-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                <input 
                                  required 
                                  value={name} 
                                  onChange={e => setName(e.target.value)} 
                                  type="text" 
                                  placeholder="Your full name" 
                                  className="w-full h-12 bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-11 pr-4 text-xs sm:text-sm font-medium text-white placeholder-zinc-500 focus:border-purple-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-purple-400/20 focus:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all outline-none"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">Email Address</label>
                              <div className="relative flex items-center group">
                                <Mail size={15} className="absolute left-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                                <input 
                                  required 
                                  value={email} 
                                  onChange={e => setEmail(e.target.value)} 
                                  type="email" 
                                  placeholder="your.email@example.com" 
                                  className="w-full h-12 bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-11 pr-4 text-xs sm:text-sm font-medium text-white placeholder-zinc-500 focus:border-purple-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-purple-400/20 focus:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Billing Transaction Reference input */}
                          <AnimatePresence>
                            {subject === "Billing Inquiry" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 overflow-hidden"
                              >
                                <div className="space-y-2">
                                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">Transaction Reference / Order ID</label>
                                  <div className="relative flex items-center">
                                    <input 
                                      required 
                                      value={transactionId} 
                                      onChange={e => {
                                        setTransactionId(e.target.value);
                                        setIsTransactionVerified(false);
                                        setTransactionError("");
                                      }} 
                                      onBlur={() => validateTransactionId(transactionId)}
                                      type="text" 
                                      placeholder="e.g. mock_pay_123 or pay_abc789" 
                                      className={cn(
                                        "w-full h-12 bg-white/[0.03] hover:bg-white/[0.04] border rounded-xl pl-4 pr-12 text-xs sm:text-sm font-medium transition-all outline-none text-white",
                                        transactionError 
                                          ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                                          : isTransactionVerified 
                                            ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                                            : "border-white/[0.08] hover:border-white/[0.14] focus:border-purple-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-purple-400/20"
                                      )} 
                                    />
                                    <div className="absolute right-4 flex items-center gap-2">
                                      {isValidatingTransaction && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
                                      {!isValidatingTransaction && isTransactionVerified && <CheckCircle2 size={16} className="text-emerald-400" />}
                                    </div>
                                  </div>
                                  {transactionError && (
                                    <p className="text-[11px] font-semibold text-red-400">{transactionError}</p>
                                  )}
                                </div>

                                {/* Quick Purchase Selection Chips */}
                                {user && (isTransactionsLoading || transactions.length > 0) && (
                                  <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Quick-select recent order:</label>
                                    {isTransactionsLoading ? (
                                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <Loader2 size={12} className="animate-spin text-purple-400" /> Loading orders...
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                                        {transactions.map(tx => {
                                          const date = new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                          const ref = tx.transactionReference || tx.providerPaymentId || tx.id;
                                          const label = `${tx.kind === 'pro_subscription' || tx.kind === 'pro_renewal' ? 'PRO' : 'Credits'} - ${(tx.amount / 100).toFixed(2)} ${tx.currency} (${date})`;
                                          return (
                                            <button
                                              key={tx.id}
                                              type="button"
                                              onClick={() => {
                                                setTransactionId(ref);
                                                setIsTransactionVerified(true);
                                                setTransactionError("");
                                              }}
                                              className={cn(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer",
                                                transactionId === ref
                                                  ? "bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                                  : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                                              )}
                                            >
                                              {label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Message Textarea */}
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">Describe Your Issue or Request</label>
                            <div className="relative group">
                              <AlignLeft size={15} className="absolute left-4 top-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                              <textarea 
                                required 
                                value={message} 
                                onChange={e => setMessage(e.target.value)} 
                                placeholder={
                                  subject === "Bug Report" ? "What tool were you using? What happened, and what did you expect to happen?" :
                                  subject === "Feature Request" ? "Describe your feature or tool suggestion..." :
                                  subject === "Billing Inquiry" ? "Please provide details about your charge or account upgrade..." :
                                  "How can our support team help you today?"
                                }
                                className="w-full h-36 bg-white/[0.03] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-11 pr-4 pt-3.5 pb-3 text-xs sm:text-sm font-medium text-white placeholder-zinc-500 outline-none focus:border-purple-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-purple-400/20 focus:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all resize-none leading-relaxed"
                              />
                            </div>
                          </div>

                          {/* Screenshot / File Attachment */}
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">Attachment (Optional screenshot)</label>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              ref={fileInputRef}
                              onChange={handleImageChange}
                            />
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className={cn(
                                "w-full h-16 border border-dashed rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all duration-200 px-4 group",
                                imageFile 
                                ? "border-purple-400/50 bg-purple-500/10 text-white shadow-[0_0_20px_rgba(168,85,247,0.18)]" 
                                : "border-white/[0.12] hover:border-purple-400/40 bg-white/[0.02] hover:bg-purple-500/[0.04] text-zinc-400 hover:text-zinc-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                              )}
                            >
                              {imageFile ? (
                                <>
                                  <CheckCircle2 size={18} className="text-purple-400 shrink-0" />
                                  <span className="text-xs font-semibold tracking-wide truncate">{imageFile.name} attached</span>
                                  <button 
                                    type="button"
                                    className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors"
                                    onClick={(e) => { e.stopPropagation(); setImageFile(null); }}
                                  >
                                    <X size={15} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <ImagePlus size={18} className="text-zinc-500 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-200" />
                                  <span className="text-xs font-medium">Click to attach a screenshot (JPG/PNG under 5MB)</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Submit Action Bar */}
                          <div className="pt-6 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-normal">
                              <Clock size={14} className="text-purple-400 shrink-0" />
                              <span>Guaranteed response within 24 hours</span>
                            </div>
                            
                            <button 
                              disabled={isSubmitting || checkingActiveTicket || !!activeTicket} 
                              type="submit" 
                              className="group/btn w-full sm:w-auto h-11 sm:h-12 px-7 sm:px-8 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.55)] border border-purple-400/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
                            >
                              {checkingActiveTicket ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Checking ticket status...
                                </span>
                              ) : isSubmitting ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Sending ticket...
                                </span>
                              ) : activeTicket ? (
                                <span>Submission Locked (Pending Ticket)</span>
                              ) : (
                                <>
                                  <span>Submit Support Ticket</span>
                                  <Send size={13} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Direct Channels (Col 4) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Direct Email Support Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative overflow-hidden p-6 sm:p-7 rounded-[2rem] border-2 border-cyan-400/30 hover:border-cyan-400/50 bg-[#070814]/90 backdrop-blur-2xl shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(34,211,238,0.2)] space-y-5 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)] shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white uppercase">Direct Email Desk</h3>
                      <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Official Inquiries</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Prefer to write directly from your email client? Send technical inquiries or attachments to our desk.
                  </p>
                  <div className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.14] flex items-center justify-between gap-2 transition-all">
                    <span className="text-xs font-semibold text-white font-mono truncate select-all">support@exismic.xyz</span>
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0"
                      title="Copy email"
                    >
                      {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <a
                    href="mailto:support@exismic.xyz"
                    className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/15 border border-white/[0.08] hover:border-cyan-400/30 text-white hover:text-cyan-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-98"
                  >
                    <span>Open Mail Client</span>
                    <ExternalLink size={13} />
                  </a>
                </motion.div>

                {/* Developer API Docs Quick Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative overflow-hidden p-6 sm:p-7 rounded-[2rem] border-2 border-purple-500/30 hover:border-purple-500/50 bg-[#070814]/90 backdrop-blur-2xl shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(168,85,247,0.2)] space-y-4 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)] shrink-0">
                      <Key size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white uppercase">Developer API Docs</h3>
                      <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Integration Guides</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    Building apps with Exismic? Explore endpoints, cURL examples, and API key management.
                  </p>
                  <Link
                    href="/developer/docs"
                    className="w-full py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] active:scale-98"
                  >
                    <span>Browse API Docs</span>
                    <ExternalLink size={13} />
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Common Questions & Knowledge Base (FAQ) */}
        <section className="space-y-8 pt-8">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-normal">Quick answers to common questions about tools, Pro plans, and processing</p>
            </div>
            <div className="h-px flex-1 bg-white/10 hidden md:block" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { 
                q: "How do I upgrade to Pro?", 
                a: "Visit the Pro plan page or open your Account Settings to unlock unlimited AI access, custom themes, and fast generation.", 
                icon: Crown,
                iconColor: "text-amber-400",
                badgeColor: "bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              },
              { 
                q: "What file types are supported?", 
                a: "Exismic supports all industry standard image formats (PNG, JPG, WebP, SVG), audio, video, and high-fidelity PDF documents.", 
                icon: Layers,
                iconColor: "text-cyan-400",
                badgeColor: "bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              },
              { 
                q: "Is my creative data private?", 
                a: "Yes. All processing is transient and encrypted end-to-end. We never permanently store or sell your uploaded files.", 
                icon: ShieldCheck,
                iconColor: "text-emerald-400",
                badgeColor: "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              },
              { 
                q: "How fast is file processing?", 
                a: "Most conversions, format shifts, and AI models execute within 2 to 5 seconds depending on file resolution and model size.", 
                icon: Zap,
                iconColor: "text-yellow-400",
                badgeColor: "bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
              },
              { 
                q: "How do credit refills work?", 
                a: "Free users receive a daily credit allowance that refills every 24 hours. Extra top-up credits bought from the shop are permanent and never expire.", 
                icon: CreditCard,
                iconColor: "text-purple-400",
                badgeColor: "bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              },
              { 
                q: "What are Exismic Sparks and how do I earn them?", 
                a: "Sparks are platform reward points you earn by completing daily directives, weekly challenges, and maintaining login streaks. Spend them on cosmetics, shields, and shop discount vouchers.", 
                icon: Flame,
                iconColor: "text-amber-400",
                badgeColor: "bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              },
              { 
                q: "Are spent Sparks or Credits refundable?", 
                a: "No. All spends are strictly final. Once you spend Credits to run tools or spend Sparks on cosmetics, shields, or vouchers, the transaction cannot be refunded, reversed, or replaced under any circumstance.", 
                icon: AlertTriangle,
                iconColor: "text-rose-400",
                badgeColor: "bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              },
              { 
                q: "Can Sparks or Credits be converted into cash?", 
                a: "No. Credits and Sparks are strictly digital utility tokens designed exclusively for the platform. They have no cash value, cannot be withdrawn for money, and cannot be traded between accounts.", 
                icon: Coins,
                iconColor: "text-teal-400",
                badgeColor: "bg-teal-500/10 border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
              },
              { 
                q: "Can I use Exismic tools for commercial work?", 
                a: "Yes. All assets created with Exismic tools and AI generation suites come with full commercial rights for your projects.", 
                icon: HelpCircle,
                iconColor: "text-pink-400",
                badgeColor: "bg-pink-500/10 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
              }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -3 }}
                className="group relative p-6 sm:p-7 rounded-2xl border-2 border-white/[0.08] hover:border-purple-400/40 bg-[#070814]/90 hover:bg-[#0a0c1e]/95 backdrop-blur-2xl transition-all duration-300 shadow-xl hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8),0_0_30px_-5px_rgba(168,85,247,0.25)] flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle ambient light bloom */}
                <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-purple-500/[0.03] group-hover:bg-purple-500/[0.08] rounded-full blur-2xl transition-all duration-500" />

                <div className="space-y-4 relative z-10">
                  <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm", faq.badgeColor, faq.iconColor, "group-hover:scale-105")}>
                    <faq.icon size={18} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight leading-snug">{faq.q}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
