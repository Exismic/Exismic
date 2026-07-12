"use client";

import React from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Skeleton, SkeletonLine } from "@/components/ui/Skeleton";
import { usePro } from "@/hooks/usePro";

interface ProtectedToolProps {
  children: React.ReactNode;
}

export function ProtectedTool({ children }: ProtectedToolProps) {
  const { user, isLoading } = useRequireAuth();
  const { isPro, isLoading: isProLoading } = usePro();
  const pathname = usePathname();
  const searchParams = useSearchParams();


  if (isLoading || (user && isProLoading)) {
    return (
      <div className="min-h-[520px] p-4 sm:p-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/5 bg-white/[0.025] p-5 sm:p-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-3">
              <SkeletonLine className="h-5 w-48" />
              <SkeletonLine className="w-64 max-w-[65vw]" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64 rounded-[1.75rem]" />
            <div className="space-y-4">
              <Skeleton className="h-24 rounded-[1.5rem]" />
              <Skeleton className="h-24 rounded-[1.5rem]" />
              <Skeleton className="h-14 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    const returnUrl = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""));
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[500px] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden"
      >
        {/* Aesthetic Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        <div className="relative z-10 max-w-md w-full space-y-8 bg-zinc-950/40 backdrop-blur-2xl border border-white/[0.06] p-12 rounded-[3rem] shadow-2xl">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 relative group">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Lock size={36} className="relative z-10" />
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
              Elite Access Required
            </h2>
            <p className="text-zinc-500 font-medium leading-relaxed">
              Login required to use Pro tools and credits system. Connect your account to unlock our high-performance AI engine.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href={`/auth/login?returnUrl=${returnUrl}`}
              className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-white text-xs font-black uppercase tracking-widest text-black shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] transition-all hover:bg-zinc-200"
            >
              Login to Continue
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              href="/"
              className="mt-4 block w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 transition-colors hover:text-white"
            >
              Back to Free Tools
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isPro) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex min-h-[500px] items-center justify-center overflow-hidden p-5 text-center sm:p-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(124,58,237,0.14),transparent_42%)]" />
        <div className="relative w-full max-w-md rounded-[2rem] border border-violet-400/20 bg-zinc-950/75 p-7 shadow-[0_30px_100px_rgba(76,29,149,0.18)] backdrop-blur-2xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-400/10 text-violet-200">
            <Lock size={28} />
          </div>
          <h2 className="mt-6 text-2xl font-black uppercase italic tracking-tight text-white">Pro tool</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            This tool uses Exismic&apos;s premium processing models and is included with Pro.
          </p>
          <Link
            href="/pro"
            className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_40px_rgba(139,92,246,0.24)] transition hover:brightness-110"
          >
            Explore Pro <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}
