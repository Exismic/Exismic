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
                  <span className="animate-gradient-x bg-linear-to-r from-cyan-200 via-white to-purple-300 bg-[length:220%_100%] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                    {displayedCredits.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500/80">Credits</span>
                </span>
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
