"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, CheckCircle2, Loader2, Lightbulb, Clock, UserCheck, ShieldAlert, Check } from "lucide-react";
import { CATEGORIES } from "@/data/tools";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 Hours
const STORAGE_KEY = "exismic:last_tool_suggestion_time";

interface SuggestToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export function SuggestToolModal({ isOpen, onClose, defaultCategory = "pdf" }: SuggestToolModalProps) {
  const [toolName, setToolName] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategory);
  const [description, setDescription] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Cooldown State
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(0);

  const checkCooldown = useCallback(() => {
    try {
      const storedTimeStr = localStorage.getItem(STORAGE_KEY);
      if (storedTimeStr) {
        const lastTime = parseInt(storedTimeStr, 10);
        const elapsed = Date.now() - lastTime;
        if (elapsed < COOLDOWN_MS) {
          setCooldownRemainingMs(COOLDOWN_MS - elapsed);
          return true;
        }
      }
    } catch {
      // localStorage error fallback
    }
    setCooldownRemainingMs(0);
    return false;
  }, []);

  // Fetch logged-in user email on open
  useEffect(() => {
    if (!isOpen) return;

    checkCooldown();

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setIsLoggedIn(true);
      }
    });
  }, [isOpen, checkCooldown]);

  // Update cooldown timer every second if active
  useEffect(() => {
    if (!isOpen || cooldownRemainingMs <= 0) return;

    const timer = setInterval(() => {
      const storedTimeStr = localStorage.getItem(STORAGE_KEY);
      if (storedTimeStr) {
        const lastTime = parseInt(storedTimeStr, 10);
        const elapsed = Date.now() - lastTime;
        if (elapsed < COOLDOWN_MS) {
          setCooldownRemainingMs(COOLDOWN_MS - elapsed);
        } else {
          setCooldownRemainingMs(0);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, cooldownRemainingMs]);

  useEffect(() => {
    if (defaultCategory) {
      setCategoryId(defaultCategory);
    }
  }, [defaultCategory]);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim()) {
      setError("Please enter a tool idea or name.");
      return;
    }

    if (cooldownRemainingMs > 0) {
      setError("You are currently on a 12-hour submission cooldown.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/tools/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: toolName.trim(),
          categoryId,
          description: description.trim(),
          userEmail: userEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit suggestion.");
      }

      // Save cooldown timestamp in localStorage
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY, now.toString());
      setCooldownRemainingMs(COOLDOWN_MS);

      setSuccess(true);
      setToolName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatRemainingTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const currentStyle = CATEGORY_ANIM_STYLES[categoryId] || CATEGORY_ANIM_STYLES.pdf;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full max-w-lg overflow-hidden rounded-[2.2rem] bg-[#080911]/95 p-6 sm:p-8 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.85)] border transition-colors duration-500",
              currentStyle.cardBorder
            )}
          >
            {/* Header Ambient Glow */}
            <div className={cn("pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-[90px] opacity-60 transition-colors duration-500", currentStyle.aura)} />
            <div className={cn("pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-[90px] opacity-40 transition-colors duration-500", currentStyle.aura)} />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all touch-manipulation z-30"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* 1. COOLDOWN ACTIVE VIEW */}
            {cooldownRemainingMs > 0 && !success ? (
              <div className="py-6 text-center space-y-6 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                  <Clock size={34} className="animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                    <ShieldAlert size={12} />
                    12-Hour Cooldown Active
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight italic uppercase">
                    Slot Recharging
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
                    To maintain quality, users can submit one tool suggestion every 12 hours. Next slot opens in:
                  </p>
                </div>

                {/* Countdown Box */}
                <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/25 max-w-xs mx-auto space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Time Remaining</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                    ⏱ {formatRemainingTime(cooldownRemainingMs)}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-8 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all touch-manipulation"
                  >
                    Got It
                  </button>
                </div>
              </div>
            ) : success ? (
              /* 2. SUCCESS CONFIRMATION VIEW */
              <div className="py-8 text-center space-y-6 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={38} />
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                    <Sparkles size={12} /> Request Dispatched
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tight">
                    Suggestion Submitted!
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
                    Your request was sent straight to our product team!
                    {userEmail && (
                      <span className="block mt-2 text-cyan-300 font-semibold">
                        A confirmation email was sent to <span className="underline">{userEmail}</span>.
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold text-zinc-400 max-w-xs mx-auto flex items-center justify-center gap-2">
                  <Clock size={14} className="text-amber-400" />
                  <span>12-hour cooldown started</span>
                </div>

                <button
                  onClick={onClose}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all touch-manipulation shadow-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              /* 3. INPUT FORM VIEW */
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {/* Header Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg", currentStyle.badge)}>
                      <Lightbulb size={12} className="animate-pulse" />
                      Community Wishlist
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight italic uppercase">
                    Suggest A <span className={cn("text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]", currentStyle.textGrad)}>Tool</span>
                  </h3>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                    Tell us what generator, editor, or AI feature you'd love to see built next.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Account Status Pill */}
                {isLoggedIn && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-zinc-300 min-w-0">
                      <UserCheck size={15} className="text-emerald-400 shrink-0" />
                      <span className="truncate font-semibold text-[11px]">
                        Account: <strong className="text-white">{userEmail}</strong>
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-black uppercase tracking-wider text-emerald-300 shrink-0 flex items-center gap-1">
                      <Check size={10} /> Auto-Filled
                    </span>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4 pt-1">
                  {/* Tool Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      Tool Idea / Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={toolName}
                      onChange={(e) => setToolName(e.target.value)}
                      placeholder="e.g. PDF Watermark Stamper, AI Vocal Remover..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-white placeholder:text-zinc-600 outline-none focus:border-white/30 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      required
                    />
                  </div>

                  {/* Category Pills Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      Target Suite / Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => {
                        const isSelected = cat.id === categoryId;
                        const catStyle = CATEGORY_ANIM_STYLES[cat.id] || CATEGORY_ANIM_STYLES.pdf;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setCategoryId(cat.id)}
                            className={cn(
                              "p-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider text-left transition-all touch-manipulation flex items-center justify-between",
                              isSelected
                                ? cn("bg-white/10 text-white border-white/30 shadow-md", catStyle.badge)
                                : "bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <span className="truncate">{cat.name}</span>
                            {isSelected && <Check size={12} className="shrink-0 ml-1 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description / Use Case */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      What should it do? (Optional details)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Describe what inputs, options, or outputs this tool should have..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white placeholder:text-zinc-600 outline-none focus:border-white/30 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    />
                  </div>

                  {/* Fallback Email Input for non-logged-in users */}
                  {!isLoggedIn && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                        Your Email (For status updates & confirmation)
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-white placeholder:text-zinc-600 outline-none focus:border-white/30 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      "w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg overflow-hidden touch-manipulation hover:scale-[1.01] active:scale-[0.99]",
                      currentStyle.buttonGrad,
                      submitting && "opacity-75 cursor-not-allowed"
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Submit Tool Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
