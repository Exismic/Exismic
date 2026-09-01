"use client";

import React, { useState, useEffect, useRef } from "react";
import { Crown } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";
import { CreditModal } from "./CreditModal";
import { CreditTokenIcon } from "./CreditTokenIcon";
import { Skeleton } from "./Skeleton";
import { usePro } from "@/hooks/usePro";

interface FloatingBubble {
  id: string;
  amount: number;
  type: "increment" | "decrement";
}

export function CreditBadge() {
  const { credits, plan, loading, showUpsell, setShowUpsell, countdown } = useCredits();
  const { isPro: verifiedIsPro, isLoading: isProLoading } = usePro();
  const isPro = verifiedIsPro || plan === 'pro';

  // Rolling tally state
  const [displayedCredits, setDisplayedCredits] = useState(credits);
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);
  const prevCreditsRef = useRef(credits);
  const isFirstLoadRef = useRef(true);

  // Synchronize initially when loading ends
  useEffect(() => {
    if (!loading) {
      if (isFirstLoadRef.current) {
        setDisplayedCredits(credits);
        prevCreditsRef.current = credits;
        isFirstLoadRef.current = false;
      }
    }
  }, [loading, credits]);

  // Dynamic counter and floating bubble animations
  useEffect(() => {
    if (loading || isFirstLoadRef.current) return;

    const startValue = prevCreditsRef.current;
    const endValue = credits;
    if (startValue === endValue) return;

    // 1. Spawn floating bubble notification (+X or -X)
    const diff = endValue - startValue;
    const bubbleId = Math.random().toString(36).substring(2, 9);
    setBubbles((prev) => [
      ...prev,
      {
        id: bubbleId,
        amount: Math.abs(diff),
        type: diff > 0 ? "increment" : "decrement",
      },
    ]);

    // Cleanup bubble after animation (1s)
    const cleanupTimer = setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    }, 1000);

    // 2. Animate counter roll tally (Brawl Stars style)
    const duration = 600; // ms
    const startTime = performance.now();
    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuad curve for smooth deceleration
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);

      setDisplayedCredits(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      } else {
        prevCreditsRef.current = endValue;
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(cleanupTimer);
    };
  }, [credits, loading]);

  if (loading || isProLoading) return <Skeleton className="h-11 w-36 rounded-full" />;

  return (
    <>
      {/* Inline styles for custom floating bubble animations */}
      <style jsx global>{`
        @keyframes exismicFloatUpAndFade {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.85);
          }
          15% {
            opacity: 1;
            transform: translateY(-5px) scale(1.1);
          }
          30% {
            transform: translateY(-15px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-42px) scale(0.9);
          }
        }
        .exismic-float-bubble {
          animation: exismicFloatUpAndFade 1s cubic-bezier(0.25, 1, 0.50, 1) forwards;
        }
      `}</style>

      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowUpsell(true)}
              className={cn(
                "group/vault relative flex h-10 cursor-pointer items-center rounded-full p-[1px] select-none isolate transition-all duration-500 hover:scale-[1.03] active:scale-95 touch-manipulation",
                "shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.18)] hover:shadow-[0_15px_45px_rgba(6,182,212,0.45),0_0_30px_rgba(168,85,247,0.35)]",
                isPro && "shadow-[0_15px_40px_rgba(168,85,247,0.2)] hover:border-purple-500/50"
              )}
            >
              {/* Radiant Cyber Halo Glow */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/40 via-blue-500/50 to-purple-600/40 opacity-70 blur-[3px] group-hover/vault:opacity-100 group-hover/vault:blur-[6px] transition-all duration-500 pointer-events-none"
              />

              {/* Metallic Gradient Outer Border Rim */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-cyan-400/50 via-sky-300/70 to-purple-400/50 group-hover/vault:from-cyan-300 group-hover/vault:via-white group-hover/vault:to-purple-300 transition-all duration-300 pointer-events-none"
              />

              {/* Glassmorphic Cyber-Obsidian Core */}
              <div className="relative flex h-full items-center gap-2.5 overflow-hidden rounded-full pl-2 pr-3.5 bg-gradient-to-r from-[#060814]/95 via-[#0b1026]/95 to-[#080718]/95 border border-cyan-400/25 group-hover/vault:border-cyan-300/60 backdrop-blur-2xl transition-all duration-300">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_20%_50%,rgba(6,182,212,0.25),transparent_48%),radial-gradient(circle_at_85%_50%,rgba(168,85,247,0.18),transparent_42%)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-12 w-12 skew-x-[-22deg] bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent blur-[1px] transition-transform duration-1000 group-hover/vault:translate-x-56"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent"
                />

                <CreditTokenIcon />
                
                <div className="relative z-10 flex items-center">
                  <span suppressHydrationWarning className="flex items-center gap-1.5 text-sm font-black tracking-tight text-white">
                    <span className="font-sans font-black bg-gradient-to-b from-white via-slate-100 to-slate-200 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover/vault:drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] transition-all">
                      {displayedCredits.toLocaleString()}
                    </span>
                    <span className="font-sans text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] group-hover/vault:from-white group-hover/vault:via-cyan-100 group-hover/vault:to-sky-200 transition-all">
                      CREDITS
                    </span>
                  </span>
                </div>
              </div>
            </button>

            {/* Floating positive/negative value bubbles */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center gap-1">
              {bubbles.map((b) => (
                <span
                  key={b.id}
                  className={cn(
                    "exismic-float-bubble text-[10px] font-black tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] italic px-2 py-0.5 rounded-full select-none border",
                    b.type === "increment"
                      ? "text-emerald-400 bg-emerald-950/90 border-emerald-500/30"
                      : "text-rose-400 bg-rose-950/90 border-rose-500/30"
                  )}
                >
                  {b.type === "increment" ? "+" : "-"}{b.amount}
                </span>
              ))}
            </div>
          </div>

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
