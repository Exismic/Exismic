"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";

interface CurrencySwitcherProps {
  currentCurrency?: "INR" | "USD";
  onChange?: (currency: "INR" | "USD") => void;
  className?: string;
}

export function CurrencySwitcher({ currentCurrency, onChange, className = "" }: CurrencySwitcherProps) {
  const [currency, setCurrency] = useState<"INR" | "USD">(currentCurrency || "INR");

  useEffect(() => {
    if (currentCurrency) {
      setCurrency(currentCurrency);
      return;
    }
    const saved = localStorage.getItem("exismic_currency");
    if (saved === "USD" || saved === "INR") {
      setCurrency(saved);
    }
  }, [currentCurrency]);

  const handleSelect = (selected: "INR" | "USD") => {
    setCurrency(selected);
    try {
      localStorage.setItem("exismic_currency", selected);
      document.cookie = `exismic_currency=${selected}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}

    if (onChange) {
      onChange(selected);
    } else {
      // Reload or trigger window event for reactive updates
      window.dispatchEvent(new Event("exismic_currency_change"));
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#070a12]/90 p-1 text-xs shadow-inner backdrop-blur-xl ${className}`}>
      <div className="flex items-center gap-1 pl-2 pr-1 text-zinc-400">
        <Globe size={13} className="text-cyan-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Region:</span>
      </div>

      <button
        type="button"
        onClick={() => handleSelect("INR")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
          currency === "INR"
            ? "bg-white/[0.12] text-white shadow-sm ring-1 ring-white/20"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        ₹ INR
      </button>

      <button
        type="button"
        onClick={() => handleSelect("USD")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
          currency === "USD"
            ? "bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/40 font-black"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        $ USD
      </button>
    </div>
  );
}
