"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, KeyRound, X, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Portal } from "@/components/ui/Portal";

interface ToolAuthGateProps {
  isOpen: boolean;
  onClose: () => void;
  toolName?: string;
  icon?: React.ReactNode;
}

export function ToolAuthGateModal({ isOpen, onClose, toolName = "this tool", icon }: ToolAuthGateProps) {
  const pathname = usePathname();
  const returnUrl = encodeURIComponent(pathname || "/tools");

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-cyan-500/30 bg-[#070814]/95 p-8 text-center text-white shadow-[0_25px_80px_rgba(6,182,212,0.15)] backdrop-blur-2xl"
            >
              {/* Background ambient glow */}
              <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

              <button
                onClick={onClose}
                className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                {icon ? (
                  <div className="flex items-center justify-center">{icon}</div>
                ) : (
                  <KeyRound size={28} className="text-cyan-300" />
                )}
              </div>

              <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 mb-3">
                Free Sign-In Required
              </span>

              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
                Unlock {toolName}
              </h3>

              <p className="text-sm font-medium leading-relaxed text-zinc-400 mb-6">
                Connect your account in seconds to generate your result and receive <strong className="text-white">50 free credits</strong> replenished daily.
              </p>

              <div className="space-y-3 mb-6 text-left rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs">
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <Zap size={14} className="text-amber-400 shrink-0" />
                  <span><strong>50 Daily Credits</strong> automatically renewed every 24 hours</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>Access to 50+ AI & developer tools</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/auth/login?returnUrl=${returnUrl}`}
                  className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-extrabold uppercase tracking-wider text-xs text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <LogIn size={16} />
                  <span>Continue with Google or Email</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function ToolAuthGateCard({ toolName = "this tool", icon }: { toolName?: string; icon?: React.ReactNode }) {
  const pathname = usePathname();
  const returnUrl = encodeURIComponent(pathname || "/tools");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#070918] to-black p-6 sm:p-8 text-center text-white shadow-2xl backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
        {icon ? (
          <div className="flex items-center justify-center">{icon}</div>
        ) : (
          <KeyRound size={24} className="text-cyan-300" />
        )}
      </div>

      <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">
        Free Account Required
      </span>

      <h4 className="text-xl font-black uppercase tracking-tight text-white mb-2">
        Sign in to run {toolName}
      </h4>

      <p className="mx-auto max-w-md text-xs font-medium leading-relaxed text-zinc-400 mb-6">
        Sign in with Google in 5 seconds to run your task and claim <strong className="text-white">50 daily free credits</strong> instantly.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={`/auth/login?returnUrl=${returnUrl}`}
          className="flex h-12 w-full sm:w-auto px-7 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-extrabold uppercase tracking-wider text-xs text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <LogIn size={15} />
          <span>Sign In / Sign Up Free</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
