"use client";

import { cn } from "@/lib/utils";

export function MarketSwitcher({ value, onChange }: { value: "IN" | "GLOBAL"; onChange: (value: "IN" | "GLOBAL") => void }) {
  return (
    <div className="inline-grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
      {[
        { id: "IN" as const, label: "India", sub: "INR / Razorpay" },
        { id: "GLOBAL" as const, label: "International", sub: "USD / PayPal" },
      ].map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "min-h-12 rounded-xl px-4 text-left transition-all",
            value === option.id ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.12)]" : "text-zinc-500 hover:bg-white/[0.05] hover:text-white"
          )}
        >
          <span className="block text-[10px] font-black uppercase tracking-[0.18em]">{option.label}</span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.08em] opacity-60">{option.sub}</span>
        </button>
      ))}
    </div>
  );
}
