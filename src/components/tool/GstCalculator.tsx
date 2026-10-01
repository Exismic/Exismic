"use client";

import React, { useState, useMemo } from "react";
import { 
  IndianRupee, 
  Calculator, 
  Percent, 
  Receipt, 
  Check, 
  Copy, 
  CheckCircle2, 
  HelpCircle,
  Building2,
  RotateCcw,
  Download,
  Scale,
  TrendingUp,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// Blueprint Scenario Interface
export interface GstBlueprint {
  id: string;
  title: string;
  category: string;
  amount: string;
  rate: number;
  mode: "exclusive" | "inclusive";
  supplyType: "intra" | "inter";
  description: string;
}

// 6 Real-World Indian Business Tax Blueprints (Standard 3: Zero Dead Void)
export const GST_BLUEPRINTS: GstBlueprint[] = [
  {
    id: "tech-services",
    title: "Freelance IT & Consulting",
    category: "Services",
    amount: "50000",
    rate: 18,
    mode: "exclusive",
    supplyType: "intra",
    description: "Software engineering, marketing, and professional consulting services."
  },
  {
    id: "restaurant-dining",
    title: "Restaurant & Café Dining",
    category: "Food & Dining",
    amount: "2400",
    rate: 5,
    mode: "exclusive",
    supplyType: "intra",
    description: "Standard food and beverage dining bill at a local eatery or café."
  },
  {
    id: "electronics-hardware",
    title: "Electronics & Gadgets",
    category: "Retail Goods",
    amount: "34999",
    rate: 18,
    mode: "inclusive",
    supplyType: "inter",
    description: "Computer hardware, smartphone, or laptop retail purchase."
  },
  {
    id: "packaged-foods",
    title: "Packaged Foods & Dairy",
    category: "FMCG",
    amount: "4800",
    rate: 12,
    mode: "exclusive",
    supplyType: "intra",
    description: "Packaged grocery goods, processed foods, dry fruits, and butter."
  },
  {
    id: "luxury-automobiles",
    title: "Luxury Items & Auto",
    category: "Premium",
    amount: "145000",
    rate: 28,
    mode: "exclusive",
    supplyType: "inter",
    description: "Air conditioners, motorcycles, and luxury consumer appliances."
  },
  {
    id: "essential-groceries",
    title: "Essential Produce & Books",
    category: "Exempt",
    amount: "1500",
    rate: 0,
    mode: "exclusive",
    supplyType: "intra",
    description: "Agricultural fresh produce, unbranded food grains, and educational books."
  }
];

// Quick Amount Presets
const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

// Standard Indian Tax Slabs
const STANDARD_TAX_SLABS = [0, 5, 12, 18, 28];

export default function GstCalculator() {
  // Active state initialized with Blueprint #1
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("tech-services");
  const [amount, setAmount] = useState<string>(GST_BLUEPRINTS[0].amount);
  const [taxRate, setTaxRate] = useState<number>(GST_BLUEPRINTS[0].rate);
  const [customRate, setCustomRate] = useState<string>("");
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [gstMode, setGstMode] = useState<"exclusive" | "inclusive">(GST_BLUEPRINTS[0].mode);
  const [transactionType, setTransactionType] = useState<"intra" | "inter">(GST_BLUEPRINTS[0].supplyType);
  const [copied, setCopied] = useState<boolean>(false);

  const numAmount = parseFloat(amount) || 0;
  const effectiveTaxRate = isCustomRate ? parseFloat(customRate) || 0 : taxRate;

  // Real-Time Tax Mathematics
  const calculations = useMemo(() => {
    let baseAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (gstMode === "exclusive") {
      baseAmount = numAmount;
      gstAmount = (numAmount * effectiveTaxRate) / 100;
      totalAmount = baseAmount + gstAmount;
    } else {
      totalAmount = numAmount;
      baseAmount = (numAmount * 100) / (100 + effectiveTaxRate);
      gstAmount = totalAmount - baseAmount;
    }

    const cgst = transactionType === "intra" ? gstAmount / 2 : 0;
    const sgst = transactionType === "intra" ? gstAmount / 2 : 0;
    const igst = transactionType === "inter" ? gstAmount : 0;

    // Percent shares for visual ratio meter
    const baseSharePercent = totalAmount > 0 ? (baseAmount / totalAmount) * 100 : 100;
    const taxSharePercent = totalAmount > 0 ? (gstAmount / totalAmount) * 100 : 0;

    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: Math.round(igst * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      baseSharePercent: Math.round(baseSharePercent * 10) / 10,
      taxSharePercent: Math.round(taxSharePercent * 10) / 10,
    };
  }, [numAmount, effectiveTaxRate, gstMode, transactionType]);

  // Load a Blueprint Scenario
  const handleSelectBlueprint = (bp: GstBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setAmount(bp.amount);
    setGstMode(bp.mode);
    setTransactionType(bp.supplyType);
    setIsCustomRate(false);
    setTaxRate(bp.rate);
    setCustomRate("");
  };

  // Reset to Default / Blank
  const handleReset = () => {
    setSelectedBlueprintId("");
    setAmount("10000");
    setTaxRate(18);
    setGstMode("exclusive");
    setTransactionType("intra");
    setIsCustomRate(false);
    setCustomRate("");
  };

  // Copy Calculation Summary
  const handleCopySummary = () => {
    const modeLabel = gstMode === "exclusive" ? "Exclusive (+ Tax Added)" : "Inclusive (- Tax Inside Total)";
    const supplyLabel = transactionType === "intra" 
      ? `Intra-State (CGST 50%: ₹${calculations.cgst.toLocaleString("en-IN")}, SGST 50%: ₹${calculations.sgst.toLocaleString("en-IN")})`
      : `Inter-State (IGST 100%: ₹${calculations.igst.toLocaleString("en-IN")})`;

    const summary = `GST Calculation Breakdown (India):
----------------------------------------
Billing Mode: ${modeLabel}
Entered Amount: ₹${numAmount.toLocaleString("en-IN")}
Applicable GST Slab: ${effectiveTaxRate}%
Supply Location: ${transactionType === "intra" ? "Within Same State" : "Inter-State Border"}

Base Price (Before Tax): ₹${calculations.baseAmount.toLocaleString("en-IN")}
Total GST Tax Amount:   ₹${calculations.gstAmount.toLocaleString("en-IN")}
Tax Distribution:       ${supplyLabel}
----------------------------------------
Final Gross Total:      ₹${calculations.totalAmount.toLocaleString("en-IN")}
Calculated with Exismic Business Studio`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Receipt (.txt)
  const handleDownloadTxt = () => {
    const summary = `GST Tax Ledger Receipt
Date: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
Mode: GST ${gstMode.toUpperCase()}
Entered Amount: ₹${numAmount.toLocaleString("en-IN")}
GST Tax Rate: ${effectiveTaxRate}%

Base Net Amount:    ₹${calculations.baseAmount.toLocaleString("en-IN")}
${transactionType === "intra" ? `Central Tax (CGST ${effectiveTaxRate / 2}%): ₹${calculations.cgst.toLocaleString("en-IN")}\nState Tax (SGST ${effectiveTaxRate / 2}%):   ₹${calculations.sgst.toLocaleString("en-IN")}` : `Interstate Tax (IGST ${effectiveTaxRate}%): ₹${calculations.igst.toLocaleString("en-IN")}`}
Total GST Amount:   ₹${calculations.gstAmount.toLocaleString("en-IN")}
------------------------------------------------
Final Gross Total:  ₹${calculations.totalAmount.toLocaleString("en-IN")}`;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gst-calculation-${numAmount}-at-${effectiveTaxRate}pct.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Deck: Telemetry HUD & Studio Actions */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Category Badge & Tax Telemetry */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(249,115,22,0.15)]">
              <Receipt size={13} className="text-orange-400" />
              <span>Business & Finance Studio</span>
            </div>

            {/* Live Tax Telemetry Pill */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <div className="flex items-center gap-1.5">
                <Percent size={14} className="text-orange-400" />
                <span className="text-xs font-bold text-zinc-300">Active Rate:</span>
                <span className="text-sm font-black text-orange-400">
                  {effectiveTaxRate}%
                </span>
              </div>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
                {transactionType === "intra" ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)"}
              </span>
              <span className="h-3 w-px bg-white/10 hidden sm:inline" />
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 hidden md:flex">
                <span className="text-orange-400 font-bold">{calculations.taxSharePercent}%</span> Tax Share
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Copy calculation summary to clipboard"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} className="text-orange-400" />
                  <span className="text-orange-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-zinc-400" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download text receipt"
            >
              <Download size={13} className="text-zinc-400" />
              <span>Download .txt</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset calculation to default"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant 1-Click Blueprints Gallery (Standard 3: Zero Void Elimination) */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Layers size={14} className="text-orange-400" />
            Instant Business Scenarios
          </label>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any scenario to test real-world tax configurations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {GST_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-3 rounded-2xl text-left border transition-all cursor-pointer relative group flex flex-col justify-between min-h-[96px]",
                  isSelected
                    ? "bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.18)] ring-1 ring-orange-500/30"
                    : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider",
                      isSelected
                        ? "bg-orange-500/20 text-orange-300"
                        : "bg-white/10 text-zinc-400 group-hover:text-zinc-200"
                    )}>
                      {bp.rate}% GST
                    </span>
                    {isSelected && (
                      <span className="size-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <h4 className={cn(
                    "text-xs font-bold leading-tight line-clamp-1",
                    isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
                  )}>
                    {bp.title}
                  </h4>
                </div>
                <p className="text-[10px] text-zinc-500 truncate mt-1">
                  ₹{parseInt(bp.amount, 10).toLocaleString("en-IN")} • {bp.category}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dual-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calculation Inputs (6 of 12 columns) */}
        <div className="lg:col-span-6 space-y-5 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
          {/* Mode Switcher: Exclusive vs Inclusive */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Calculation Method</span>
              <span className="text-[10px] font-normal text-zinc-500">
                {gstMode === "exclusive" ? "Tax added on top of price" : "Tax already included in price"}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setGstMode("exclusive");
                  setSelectedBlueprintId("");
                }}
                className={cn(
                  "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  gstMode === "exclusive" 
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/25 font-black" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <span>GST Exclusive (+ GST)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setGstMode("inclusive");
                  setSelectedBlueprintId("");
                }}
                className={cn(
                  "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  gstMode === "inclusive" 
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/25 font-black" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <span>GST Inclusive (- GST)</span>
              </button>
            </div>
          </div>

          {/* Amount Input with Currency Symbol */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <IndianRupee size={13} className="text-orange-400" />
                <span>Bill Amount (₹)</span>
              </label>
              <span className="text-[10px] text-zinc-500">
                {numAmount > 0 ? `₹${numAmount.toLocaleString("en-IN")}` : "Enter value"}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-lg">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                min="0"
                step="any"
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedBlueprintId("");
                }}
                placeholder="Enter bill or invoice amount..."
                className="w-full rounded-2xl border border-white/10 bg-black/60 pl-10 pr-4 py-3.5 text-lg font-black text-white placeholder-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-zinc-500 pr-1">Quick Add:</span>
              {QUICK_AMOUNTS.map((quickVal) => (
                <button
                  key={quickVal}
                  type="button"
                  onClick={() => {
                    setAmount(quickVal.toString());
                    setSelectedBlueprintId("");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-orange-500/15 border border-white/10 hover:border-orange-500/30 text-[11px] font-semibold text-zinc-300 hover:text-orange-300 transition-all cursor-pointer"
                >
                  ₹{quickVal >= 100000 ? "1 Lakh" : quickVal >= 1000 ? `${quickVal / 1000}k` : quickVal}
                </button>
              ))}
            </div>
          </div>

          {/* Tax Slabs Selection (0%, 5%, 12%, 18%, 28%, Custom) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Percent size={13} className="text-orange-400" />
                <span>GST Tax Rate Slab</span>
              </label>
              <span className="text-[10px] text-zinc-500">
                {isCustomRate ? "Custom Rate Active" : "Standard Government Slabs"}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {STANDARD_TAX_SLABS.map((rate) => {
                const isSelected = !isCustomRate && taxRate === rate;
                return (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setTaxRate(rate);
                      setIsCustomRate(false);
                      setSelectedBlueprintId("");
                    }}
                    className={cn(
                      "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border text-center cursor-pointer",
                      isSelected
                        ? "bg-orange-500/20 border-orange-400 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.25)] ring-1 ring-orange-500/30"
                        : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {rate}%
                  </button>
                );
              })}

              {/* Custom Rate Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsCustomRate(true);
                  setSelectedBlueprintId("");
                }}
                className={cn(
                  "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border text-center cursor-pointer",
                  isCustomRate
                    ? "bg-orange-500/20 border-orange-400 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.25)] ring-1 ring-orange-500/30"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                Custom
              </button>
            </div>

            {/* Custom Rate Input when active */}
            {isCustomRate && (
              <div className="pt-1.5 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    placeholder="Enter custom GST % (e.g. 7.5, 3)..."
                    className="w-full rounded-xl border border-orange-500/40 bg-black/60 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-zinc-600"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-xs">
                    %
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  Custom Cess / Special Slab
                </span>
              </div>
            )}
          </div>

          {/* Transaction Supply Type: Intra-State vs Inter-State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Building2 size={13} className="text-orange-400" />
                <span>Supply Location / Transaction Type</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTransactionType("intra");
                  setSelectedBlueprintId("");
                }}
                className={cn(
                  "p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between",
                  transactionType === "intra"
                    ? "bg-orange-500/15 border-orange-400/50 text-orange-300 shadow-sm ring-1 ring-orange-500/20"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white">Intra-State</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300">
                    CGST + SGST
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 leading-tight">
                  Same state transaction (split 50/50)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransactionType("inter");
                  setSelectedBlueprintId("");
                }}
                className={cn(
                  "p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between",
                  transactionType === "inter"
                    ? "bg-orange-500/15 border-orange-400/50 text-orange-300 shadow-sm ring-1 ring-orange-500/20"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white">Inter-State</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    100% IGST
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 leading-tight">
                  Across state borders (single integrated tax)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output Tax Ledger & Composition Meter (6 of 12 columns) */}
        <div className="lg:col-span-6 space-y-5 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header with Rate Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Receipt size={15} className="text-orange-400" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                  Tax Ledger Breakdown
                </span>
              </div>
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full shadow-sm">
                {effectiveTaxRate}% GST Rate
              </span>
            </div>

            {/* Visual Tax Ratio Bar */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-zinc-300">Base Price ({calculations.baseSharePercent}%)</span>
                <span className="text-orange-400">Total Tax ({calculations.taxSharePercent}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden flex">
                <div 
                  className="h-full bg-zinc-400 transition-all duration-300"
                  style={{ width: `${calculations.baseSharePercent}%` }}
                  title={`Base Price: ₹${calculations.baseAmount.toLocaleString("en-IN")}`}
                />
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                  style={{ width: `${calculations.taxSharePercent}%` }}
                  title={`Tax Amount: ₹${calculations.gstAmount.toLocaleString("en-IN")}`}
                />
              </div>
            </div>

            {/* Itemized Calculation Rows */}
            <div className="space-y-3.5 font-sans">
              <div className="flex justify-between items-center text-sm p-2 rounded-xl bg-white/[0.02]">
                <span className="text-zinc-400">Net Base Price (Before Tax):</span>
                <span className="font-bold text-white text-base">
                  ₹{calculations.baseAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {/* State Tax Distribution */}
              {transactionType === "intra" ? (
                <div className="space-y-2 pl-3 border-l-2 border-orange-500/40">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-orange-400" />
                      Central GST (CGST {effectiveTaxRate / 2}%):
                    </span>
                    <span className="font-bold text-orange-300">
                      ₹{calculations.cgst.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      State GST (SGST {effectiveTaxRate / 2}%):
                    </span>
                    <span className="font-bold text-amber-300">
                      ₹{calculations.sgst.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pl-3 border-l-2 border-amber-500/40">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      Integrated GST (IGST {effectiveTaxRate}%):
                    </span>
                    <span className="font-bold text-amber-300">
                      ₹{calculations.igst.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                <span className="text-zinc-300 font-semibold">Total GST Amount:</span>
                <span className="font-black text-orange-400 text-base">
                  + ₹{calculations.gstAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Total Gross Amount Pinned Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/70 via-black to-black border border-orange-500/30 space-y-1 shadow-[0_10px_30px_rgba(249,115,22,0.12)]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  Final Gross Amount (Payable)
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                  INR (₹)
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{calculations.totalAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-zinc-400 pt-1">
                {gstMode === "exclusive" 
                  ? `₹${numAmount.toLocaleString("en-IN")} base + ₹${calculations.gstAmount.toLocaleString("en-IN")} GST`
                  : `₹${calculations.baseAmount.toLocaleString("en-IN")} base + ₹${calculations.gstAmount.toLocaleString("en-IN")} GST`}
              </p>
            </div>
          </div>

          {/* Action Copy Button */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:to-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20 active:scale-[0.99]"
          >
            {copied ? (
              <>
                <CheckCircle2 size={16} className="text-black" />
                <span>Summary Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} className="text-black" />
                <span>Copy Calculation Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="gst-calculator"
        toolName="GST Calculator (India)"
        title={`GST Calculation for ₹${numAmount.toLocaleString("en-IN")} at ${effectiveTaxRate}%`}
        content={`GST Calculation Summary:
Amount: ₹${numAmount} (${gstMode.toUpperCase()})
Tax Rate: ${effectiveTaxRate}%
Base Net Price: ₹${calculations.baseAmount.toLocaleString("en-IN")}
Total GST Tax: ₹${calculations.gstAmount.toLocaleString("en-IN")}
Total Payable: ₹${calculations.totalAmount.toLocaleString("en-IN")}`}
        downloadLabel="Download Tax Breakdown (.txt)"
        downloadAction={handleDownloadTxt}
        onCopy={handleCopySummary}
      />

      {/* Chained Companion Tools */}
      <ToolWorkflowChaining
        currentToolId="gst-calculator"
        categoryId="business"
        outputContent={`Total GST calculated: ₹${calculations.gstAmount} on ₹${calculations.totalAmount}`}
      />

      {/* Suggested Tools in Business Suite */}
      <ToolSuggestions
        currentToolId="gst-calculator"
        categoryId="business"
        outputContent={`Total GST calculated: ₹${calculations.gstAmount} on ₹${calculations.totalAmount}`}
      />
    </div>
  );
}
