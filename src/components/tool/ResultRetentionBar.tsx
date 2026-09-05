"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  Download,
  Loader2,
  Sparkles,
  Send,
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import Link from "next/link";

export interface ResultRetentionBarProps {
  toolType: string;
  toolName: string;
  title: string;
  content?: string;
  fileUrl?: string;
  metadata?: Record<string, unknown>;
  className?: string;
  downloadAction?: () => void | Promise<void>;
  downloadLabel?: string;
  onCopy?: () => void;
}

export function ResultRetentionBar({
  toolType,
  toolName,
  title,
  content,
  fileUrl,
  metadata,
  className = "",
  downloadAction,
  downloadLabel = "Download",
  onCopy,
}: ResultRetentionBarProps) {
  const { userId } = useCredits();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch logged in user email if available
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: { data: { user: { email?: string | null } | null } }) => {
      if (res.data?.user?.email) {
        setUserEmail(res.data.user.email);
        setTargetEmail(res.data.user.email);
      }
    });
  }, [userId]);

  const notifyQuestAndCreditUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("quests-updated"));
      window.dispatchEvent(new Event("credits-updated"));
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return;
    }

    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!userId) {
      setShowAuthGate(true);
      return;
    }

    if (isSaved || isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/files/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType,
          originalName: title || `${toolName} Output`,
          resultUrl: fileUrl,
          status: "completed",
          metadata: {
            ...(metadata || {}),
            contentSnippet: content ? content.slice(0, 400) : undefined,
            savedFromBar: true,
          },
        }),
      });

      if (res.ok) {
        setIsSaved(true);
        notifyQuestAndCreditUpdate();
      } else if (res.status === 401) {
        setShowAuthGate(true);
      }
    } catch (err) {
      console.warn("[ResultRetentionBar] Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim() || isSendingEmail) return;

    setIsSendingEmail(true);
    setEmailStatus("idle");
    setEmailMessage("");

    try {
      const res = await fetch("/api/tools/email-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail.trim(),
          toolType,
          toolName,
          title,
          content,
          fileUrl,
          metadata,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEmailStatus("success");
        setEmailMessage(data.message || `Output sent to ${targetEmail.trim()}`);
        notifyQuestAndCreditUpdate();
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setEmailStatus("idle");
          setEmailMessage("");
        }, 3000);
      } else {
        setEmailStatus("error");
        setEmailMessage(data.error || "Failed to send email. Please try again.");
      }
    } catch (err: any) {
      setEmailStatus("error");
      setEmailMessage(err.message || "Failed to connect to email service.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950/90 via-zinc-900/80 to-zinc-950/90 p-4 sm:p-5 backdrop-blur-xl shadow-2xl ${className}`}
    >
      {/* Top Header Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-300">
          <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-black uppercase tracking-wider text-[11px]">
            Output Ready
          </span>
          <span className="text-zinc-500 text-[11px] font-medium hidden sm:inline">
            · Keep your files organized & accessible
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
          <Sparkles size={12} className="text-amber-300 shrink-0" />
          <span>Earn daily quest credits</span>
        </div>
      </div>

      {/* Main Action Buttons Grid */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Email Me Result */}
        <button
          type="button"
          onClick={() => {
            setIsEmailModalOpen(true);
            setEmailStatus("idle");
            setEmailMessage("");
          }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-500/20 hover:from-violet-600/30 hover:to-cyan-500/30 border border-violet-500/30 hover:border-violet-500/50 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-violet-500/10"
        >
          <Mail size={14} className="text-violet-300" />
          <span>Email Me Result</span>
        </button>

        {/* Save to Cloud Library */}
        <button
          type="button"
          onClick={handleSaveToLibrary}
          disabled={isSaving || isSaved}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            isSaved
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-zinc-200 hover:text-white active:scale-95"
          }`}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin text-zinc-400" />
          ) : isSaved ? (
            <BookmarkCheck size={14} className="text-emerald-400" />
          ) : (
            <Bookmark size={14} className="text-zinc-400" />
          )}
          <span>{isSaved ? "Saved in Library" : "Save to Library"}</span>
        </button>

        {/* Copy Output (if content provided) */}
        {content && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-zinc-300 hover:text-white text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
            title="Copy output text to clipboard"
          >
            {copied ? (
              <Check size={14} className="text-emerald-400" />
            ) : (
              <Copy size={14} className="text-zinc-400" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
          </button>
        )}

        {/* Optional Direct Download button */}
        {downloadAction && (
          <button
            type="button"
            onClick={downloadAction}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
          >
            <Download size={14} />
            <span>{downloadLabel}</span>
          </button>
        )}

        {isSaved && (
          <Link
            href="/dashboard"
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 ml-auto"
          >
            View in Library &rarr;
          </Link>
        )}
      </div>

      {/* Portaled Modals: Mounted directly to document.body so they are never clipped by container overflow/backdrop-filter */}
      {mounted && typeof document !== "undefined" && createPortal(
        <>
          {/* Modal: Email Me Result */}
          <AnimatePresence>
            {isEmailModalOpen && (
              <div
                onClick={(e) => {
                  if (e.target === e.currentTarget) setIsEmailModalOpen(false);
                }}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#07070e] p-6 text-left shadow-2xl overflow-hidden"
                >
                  {/* Subtle top glow */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-24 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />

                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                        <Mail size={16} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">Email Me Result</h3>
                        <p className="text-[11px] text-zinc-400">
                          Deliver this {toolName} generation to your inbox
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(false)}
                      className="size-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSendEmail} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                        Recipient Email Address
                      </label>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 transition"
                      />
                    </div>

                    {/* Rate limit badge & safety info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-white/[0.03] border border-white/5 p-3 text-[11px] text-zinc-400">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
                        <span>
                          {userId
                            ? "Creator account active: 10 emails per day"
                            : "Guest export limit: 2 free emails per 24 hours"}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono sm:text-right shrink-0">
                        From: noreply@exismic.xyz
                      </span>
                    </div>

                    {/* Feedback status */}
                    {emailMessage && (
                      <div
                        className={`rounded-xl p-3 text-xs font-bold ${
                          emailStatus === "success"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                        }`}
                      >
                        {emailMessage}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsEmailModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSendingEmail || !targetEmail.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:brightness-110 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-500/25"
                      >
                        {isSendingEmail ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        <span>{isSendingEmail ? "Sending..." : "Send to Inbox"}</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Modal: Guest Cloud Library Gate */}
          <AnimatePresence>
            {showAuthGate && (
              <div
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowAuthGate(false);
                }}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#07070e] p-6 text-center shadow-2xl overflow-hidden"
                >
                  <div className="mx-auto size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                    <Bookmark size={22} />
                  </div>

                  <h3 className="text-lg font-black text-white">Save in Cloud Library</h3>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    Sign in or create a free account to keep all your resumes, notes,
                    invoices, and media generations saved permanently in your Exismic
                    cloud vault.
                  </p>

                  <div className="mt-6 flex flex-col gap-2.5">
                    <Link
                      href="/auth/signup"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition shadow-lg"
                    >
                      <span>Create Free Account (Takes 10s)</span>
                      <ArrowRight size={14} />
                    </Link>

                    <Link
                      href="/auth/login"
                      className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition"
                    >
                      Already have an account? Sign in
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShowAuthGate(false)}
                      className="text-xs text-zinc-500 hover:text-zinc-300 mt-1 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
}
