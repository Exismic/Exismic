"use client";

import { CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  desc: string;
}

interface PdfSidebarProps {
  steps: Step[];
  stats?: { label: string; value: string | number }[];
  accentColor?: string;
  themeColor?: "red" | "cyan" | "emerald" | "purple";
}

export function PdfSidebar({
  steps,
  stats,
  accentColor = "text-red-400",
  themeColor = "red",
}: PdfSidebarProps) {
  const isRed = themeColor === "red";

  return (
    <aside className="space-y-4">
      {stats && stats.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e0a0d]/90 to-[#070508]/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
                Current job
              </p>
              <h3 className="mt-1 text-base font-black text-white">Document setup</h3>
            </div>
            <span className="flex size-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <CheckCircle2 className={cn("size-4", accentColor)} />
            </span>
          </div>
          <dl className="divide-y divide-white/5 border-y border-white/5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex min-h-11 items-center justify-between gap-4 py-2.5"
              >
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  {stat.label}
                </dt>
                <dd className="max-w-[58%] truncate text-right text-xs font-bold text-zinc-200">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e0a0d]/90 to-[#070508]/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
            <Info className={cn("size-4", accentColor)} />
          </span>
          <h3 className="text-sm font-black uppercase tracking-wider text-white">How it works</h3>
        </div>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[28px_1fr] gap-3">
              <span className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[10px] font-black text-zinc-300">
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <h4 className="text-xs font-black uppercase tracking-[0.08em] text-zinc-200">
                  {step.title}
                </h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex items-center gap-4 rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4 backdrop-blur-xl">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-400">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.12em] text-white">
            Client-Secure Processing
          </h4>
          <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-400">
            Your documents are processed securely in memory and never retained on permanent storage.
          </p>
        </div>
      </section>
    </aside>
  );
}
