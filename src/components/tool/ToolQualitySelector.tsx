"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, Crown, LockKeyhole, Sparkles, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getQualityToolPolicy, type OutputTier } from "@/lib/tool-quality-policy";
import { cn } from "@/lib/utils";

export function ToolQualitySelector({ toolId }: { toolId: string }) {
  const policy = getQualityToolPolicy(toolId);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [tier, setTier] = useState<OutputTier>("standard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const cookieName = `exismic_output_tier_${toolId}`;

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      const stored = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${cookieName}=`))
        ?.split("=")[1];
      setIsAuthenticated(Boolean(data.session?.user));
      if (!data.session?.user && stored === "hd") {
        document.cookie = `${cookieName}=standard; path=/; max-age=31536000; samesite=lax`;
        setTier("standard");
      } else {
        setTier(stored === "hd" ? "hd" : "standard");
      }
    });
  }, [cookieName, supabase]);

  if (!policy) return null;

  const chooseTier = (nextTier: OutputTier) => {
    if (nextTier === "hd" && !isAuthenticated) return;
    document.cookie = `${cookieName}=${nextTier}; path=/; max-age=31536000; samesite=lax`;
    setTier(nextTier);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
      {/* Background Subtle Gradient Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-cyan-500/10 blur-[80px]" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 size-64 rounded-full bg-purple-500/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Left Description Info */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                <Sparkles size={11} className="text-cyan-300 animate-pulse" />
                Output Quality Mode
             </div>
          </div>
          <p className="text-xs font-semibold leading-relaxed text-zinc-300">
            Standard is <span className="text-cyan-300 font-bold">100% Free</span>. HD export uses <span className="text-purple-300 font-bold">{policy.hdCreditCost} credits</span> for lossless full-resolution clarity.
          </p>
        </div>

        {/* Quality Toggle Buttons */}
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:w-[360px] shrink-0">
          
          {/* STANDARD BUTTON */}
          <button
            type="button"
            onClick={() => chooseTier("standard")}
            className={cn(
              "group relative flex min-h-13 flex-col items-center justify-center rounded-xl border px-3 py-2.5 transition-all duration-300 active:scale-[0.98]",
              tier === "standard"
                ? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent text-white shadow-[0_0_25px_rgba(34,211,238,0.2)]"
                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-400/30 hover:bg-cyan-500/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
              {tier === "standard" ? (
                <Check size={14} className="text-cyan-400" />
              ) : (
                <Zap size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              )}
              <span className={tier === "standard" ? "text-cyan-100" : ""}>Standard</span>
            </div>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-400/80">
              Free • Fast
            </span>
          </button>

          {/* HD BUTTON */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => chooseTier("hd")}
              className={cn(
                "group relative flex min-h-13 flex-col items-center justify-center rounded-xl border px-3 py-2.5 transition-all duration-300 active:scale-[0.98]",
                tier === "hd"
                  ? "border-purple-400/60 bg-gradient-to-br from-purple-500/25 via-fuchsia-500/15 to-transparent text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-purple-400/40 hover:bg-purple-500/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                {tier === "hd" ? (
                  <Check size={14} className="text-purple-300" />
                ) : (
                  <Crown size={14} className="text-amber-400 fill-amber-400/20 group-hover:scale-110 transition-transform" />
                )}
                <span className={tier === "hd" ? "text-purple-100" : ""}>HD Quality</span>
              </div>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-purple-300/90">
                {policy.hdCreditCost} Credits • Lossless
              </span>
            </button>
          ) : (
            <Link
              href={`/auth/login?returnUrl=${encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""))}`}
              className="group flex min-h-13 flex-col items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10 px-3 py-2.5 text-purple-200 transition-all duration-300 hover:border-purple-400/60 hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            >
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                <LockKeyhole size={14} className="text-purple-400" />
                <span>HD Quality</span>
              </div>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-purple-300/80">
                Sign in to unlock
              </span>
            </Link>
          )}

        </div>

      </div>
    </div>
  );
}
