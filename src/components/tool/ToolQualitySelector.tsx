"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, LockKeyhole, Sparkles, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getQualityToolPolicy, type OutputTier } from "@/lib/tool-quality-policy";

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
    <div className="flex flex-col gap-3 border-y border-white/[0.07] bg-black/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <Sparkles size={13} className="text-cyan-300" /> Output quality
        </div>
        <p className="mt-1 text-xs font-medium text-zinc-400">
          Standard is free. HD uses {policy.hdCreditCost} credits after a successful result.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2 sm:w-[310px]">
        <button
          type="button"
          onClick={() => chooseTier("standard")}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-md border px-3 text-[10px] font-black uppercase tracking-[0.14em] transition ${
            tier === "standard"
              ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
              : "border-white/10 bg-white/[0.03] text-zinc-500 hover:text-white"
          }`}
        >
          {tier === "standard" ? <Check size={14} /> : <Zap size={14} />} Standard
        </button>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => chooseTier("hd")}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-md border px-3 text-[10px] font-black uppercase tracking-[0.14em] transition ${
              tier === "hd"
                ? "border-violet-300/35 bg-violet-300/10 text-violet-100 shadow-[0_0_24px_rgba(139,92,246,0.12)]"
                : "border-white/10 bg-white/[0.03] text-zinc-500 hover:text-white"
            }`}
          >
            {tier === "hd" ? <Check size={14} /> : <Sparkles size={14} />} HD
          </button>
        ) : (
          <Link
            href={`/auth/login?returnUrl=${encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""))}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-violet-300/20 bg-violet-300/[0.06] px-3 text-[10px] font-black uppercase tracking-[0.14em] text-violet-200 transition hover:bg-violet-300/10"
          >
            <LockKeyhole size={14} /> Login for HD
          </Link>
        )}
      </div>
    </div>
  );
}
