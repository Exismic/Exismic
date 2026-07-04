"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

export function SupportAgentAuthCard() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-20 text-white">
      <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl sm:p-10">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-24 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
            <Lock className="h-6 w-6 text-cyan-200" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-purple-100">
              <Sparkles className="h-3 w-3" />
              Lumora Support Agent
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">Sign in to manage agents</h1>
            <p className="max-w-xl text-sm font-semibold leading-7 text-zinc-400">
              Your support agents, business knowledge, widget settings, and conversations stay connected to your Lumora account.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 px-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_70px_rgba(34,211,238,0.18)] transition hover:scale-[1.02]"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
