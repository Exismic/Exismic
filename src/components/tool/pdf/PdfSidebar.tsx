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
}

export function PdfSidebar({
  steps,
  stats,
  accentColor = "text-emerald-400",
}: PdfSidebarProps) {
  return (
    <aside className="space-y-4">
      {stats && stats.length > 0 && (
        <section className="rounded-lg border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">
                Current job
              </p>
              <h3 className="mt-1 text-lg font-black text-white">Document setup</h3>
            </div>
            <CheckCircle2 className={cn("size-5", accentColor)} />
          </div>
          <dl className="divide-y divide-white/7 border-y border-white/7">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex min-h-12 items-center justify-between gap-4 py-3"
              >
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
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

      <section className="rounded-lg border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border border-white/8 bg-white/[0.035]">
            <Info className={cn("size-4", accentColor)} />
          </span>
          <h3 className="text-base font-black text-white">How it works</h3>
        </div>
        <ol className="space-y-5">
          {steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[32px_1fr] gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg border border-white/8 bg-black/25 text-[10px] font-black text-white">
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <h4 className="text-xs font-black uppercase tracking-[0.08em] text-zinc-200">
                  {step.title}
                </h4>
                <p className="mt-1 text-xs leading-5 text-zinc-600">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex items-center gap-4 rounded-lg border border-emerald-300/12 bg-emerald-300/[0.035] p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.12em] text-white">
            Request-scoped processing
          </h4>
          <p className="mt-1 text-[10px] leading-4 text-zinc-600">
            Generated files are returned directly without persistent result storage.
          </p>
        </div>
      </section>
    </aside>
  );
}
