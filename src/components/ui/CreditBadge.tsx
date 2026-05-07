"use client";

import React from "react";
import { Zap, Sparkles } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";
import { CreditModal } from "./CreditModal";

export function CreditBadge() {
  const { credits, plan, loading, showUpsell, setShowUpsell } = useCredits();

  if (loading) return (
    <div className="w-24 h-9 bg-white/5 animate-pulse rounded-full" />
  );

  return (
    <>
      <button
        onClick={() => setShowUpsell(true)}
        className={cn(
          "group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
          plan === 'pro' 
            ? "bg-accent-purple/10 border-accent-purple/20 hover:border-accent-purple/40" 
            : "bg-white/5 border-white/10 hover:border-white/20"
        )}
      >
        <div className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
          plan === 'pro' ? "bg-accent-purple text-white" : "bg-zinc-800 text-zinc-400"
        )}>
          <Zap size={12} fill="currentColor" />
        </div>
        <div className="flex flex-col items-start leading-none">
          <span suppressHydrationWarning className="text-[10px] font-black italic uppercase tracking-tight text-white">
            {credits.toLocaleString()} <span className="text-zinc-500 not-italic font-medium">Credits</span>
          </span>
          {plan === 'pro' && (
            <span className="text-[8px] font-black uppercase tracking-widest text-accent-purple">Pro Plan</span>
          )}
        </div>
      </button>

      <CreditModal 
        isOpen={showUpsell} 
        onClose={() => setShowUpsell(false)} 
        plan={plan} 
        credits={credits}
      />
    </>
  );
}
