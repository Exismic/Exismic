"use client";

import React from "react";
import { Crown } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";
import { CreditModal } from "./CreditModal";
import { CreditTokenIcon } from "./CreditTokenIcon";
import { Skeleton } from "./Skeleton";
import { usePro } from "@/hooks/usePro";

export function CreditBadge() {
  const { credits, plan, loading, showUpsell, setShowUpsell, countdown } = useCredits();
  const { isPro: verifiedIsPro, isLoading: isProLoading } = usePro();
  const isPro = verifiedIsPro || plan === 'pro';

  if (loading || isProLoading) return <Skeleton className="h-11 w-36 rounded-full" />;

  return (
    <>
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpsell(true)}
            className={cn(
              "group/vault relative flex h-10 items-center gap-2.5 overflow-hidden rounded-full border pl-2.5 pr-4 transition-all duration-500",
              "border-white/10 bg-[#07070c]/80 shadow-[0_12px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-[#0a0a12]",
              isPro && "shadow-[0_15px_40px_rgba(168,85,247,0.12)] hover:border-purple-500/30"
            )}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.15),transparent_30%)] opacity-70" />
            <div className="pointer-events-none absolute inset-y-0 -left-10 w-10 skew-x-[-18deg] bg-white/10 blur-sm transition-transform duration-1000 group-hover/vault:translate-x-44" />
            <CreditTokenIcon />
            
            <div className="relative z-10 flex items-center">
              <span suppressHydrationWarning className="flex items-center gap-1.5 text-xs font-black tracking-tight text-white uppercase">
                <span className="animate-gradient-x bg-linear-to-r from-cyan-200 via-white to-purple-300 bg-[length:220%_100%] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.15)]">{credits.toLocaleString()}</span>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500/80">Credits</span>
              </span>
            </div>
          </button>

          {isPro && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-pulse">
              <Crown size={10} className="text-accent-purple fill-accent-purple/50" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">PRO MEMBER</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 px-2">
          <div className={cn(
            "w-1 h-1 rounded-full animate-pulse",
            isPro ? "bg-accent-purple" : "bg-zinc-500"
          )} />
          <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
            {isPro ? "Next Grant" : "Refill"} in <span className="text-zinc-400 font-bold tabular-nums">{countdown}</span>
          </span>
        </div>
      </div>

      <CreditModal 
        isOpen={showUpsell} 
        onClose={() => setShowUpsell(false)} 
        plan={isPro ? 'pro' : 'free'}
        credits={credits}
      />
    </>
  );
}
