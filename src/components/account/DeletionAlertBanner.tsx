"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, RotateCcw, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

interface DeletionAlertBannerProps {
  scheduledDeletionAt?: string | Date | null;
  deletionRecoveryRequested?: boolean;
  onCancelled?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
}

function getTimeRemaining(targetDate?: string | Date | null): TimeRemaining {
  if (!targetDate) {
    return { days: 7, hours: 0, minutes: 0, seconds: 0, totalMs: 7 * 86400000, isExpired: false };
  }

  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const totalMs = target - now;

  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / 1000 / 60) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, totalMs, isExpired: false };
}

export function DeletionAlertBanner({
  scheduledDeletionAt,
  deletionRecoveryRequested = false,
  onCancelled,
}: DeletionAlertBannerProps) {
  const [time, setTime] = useState<TimeRemaining>(() => getTimeRemaining(scheduledDeletionAt));
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTime(getTimeRemaining(scheduledDeletionAt));
    const interval = setInterval(() => {
      setTime(getTimeRemaining(scheduledDeletionAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [scheduledDeletionAt]);

  const handleCancelDeletion = async () => {
    try {
      setIsCancelling(true);
      setError(null);

      const res = await fetch("/api/user/account/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: "Cancelled directly from dashboard alert" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel account deletion.");
      }

      setIsSuccess(true);
      if (onCancelled) {
        setTimeout(() => {
          onCancelled();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to cancel deletion. Please try from Account Settings.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.4 }}
        className="w-full relative z-20"
      >
        <div className="relative p-[1.5px] rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500/60 via-amber-500/50 to-rose-600/60 shadow-[0_0_35px_rgba(244,63,94,0.22),0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Subtle Ambient Pulse Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-950/70 via-black/85 to-amber-950/60 backdrop-blur-2xl" />

          <div className="relative p-4 sm:p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            {/* Left: Urgency Badge + Information */}
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]">
                <AlertTriangle size={20} className="text-rose-400 animate-pulse" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/25 border border-rose-400/40 text-rose-300">
                    Account Scheduled for Deletion
                  </span>
                  <span className="text-zinc-500 text-xs hidden sm:inline">•</span>
                  <span className="text-[11px] font-medium text-zinc-400">
                    7-Day Safety Grace Period
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  Your account, saved creations, projects, and credits will be permanently destroyed when this countdown reaches zero.
                </p>

                {error && (
                  <p className="text-xs text-rose-400 font-semibold">{error}</p>
                )}
              </div>
            </div>

            {/* Right: Live Ticking Countdown Reactor + Cancel Button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 shrink-0 border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
              {/* Live Reactor Countdown Pill */}
              <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-black/60 border border-rose-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <Clock size={15} className="text-rose-400 animate-spin-slow shrink-0" />
                <div className="flex items-baseline gap-1 font-mono text-xs sm:text-sm font-black text-rose-100">
                  <span>{time.days}d</span>
                  <span className="text-rose-400">:</span>
                  <span>{String(time.hours).padStart(2, "0")}h</span>
                  <span className="text-rose-400">:</span>
                  <span>{String(time.minutes).padStart(2, "0")}m</span>
                  <span className="text-rose-400">:</span>
                  <span className="text-rose-300 text-sm sm:text-base">{String(time.seconds).padStart(2, "0")}s</span>
                </div>
              </div>

              {/* Action Button */}
              {isSuccess ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 size={16} />
                  <span>Deletion Cancelled!</span>
                </div>
              ) : deletionRecoveryRequested ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 size={16} />
                  <span>Recovery Requested · Paused</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelDeletion}
                  disabled={isCancelling}
                  className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Restoring...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} className="group-hover:scale-110 transition-transform text-emerald-100" />
                      <span>Cancel Deletion & Keep Account</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
