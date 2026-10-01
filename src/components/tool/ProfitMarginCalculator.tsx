"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Copy, 
  CheckCircle2, 
  PieChart, 
  Scale,
  Receipt,
  Download,
  RotateCcw,
  Tag,
  ShoppingBag,
  Building2,
  Boxes,
  Briefcase,
  Headphones,
  Sliders,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// Supported International Currencies
export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "CAD", symbol: "CA$", label: "CAD ($)" },
  { code: "AUD", symbol: "AU$", label: "AUD ($)" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)" }
];

// Commercial Blueprints (Standard: Preloaded Blueprint #1, Zero Empty Voids)
export interface ProfitBlueprint {
  id: string;
  title: string;
  category: string;
  icon: typeof ShoppingBag;
  cost: string;
  price: string;
  expenses: string;
  targetMargin: number;
  currency: string;
  description: string;
}

export const PROFIT_BLUEPRINTS: ProfitBlueprint[] = [
  {
    id: "ecommerce-dtc",
    title: "E-commerce DTC Brand",
    category: "Physical Retail",
    icon: ShoppingBag,
    cost: "25",
    price: "68",
    expenses: "14",
    targetMargin: 45,
    currency: "USD",
    description: "Direct-to-consumer apparel or consumer products with online ad acquisition costs."
  },
  {
    id: "saas-subscription",
    title: "SaaS & Digital App",
    category: "Software",
    icon: Zap,
    cost: "8",
    price: "49",
    expenses: "12",
    targetMargin: 60,
    currency: "USD",
    description: "Cloud software licenses, mobile app subscriptions, or digital creator memberships."
  },
  {
    id: "retail-bakery",
    title: "Bakery & Coffee Shop",
    category: "Food & Dining",
    icon: Receipt,
    cost: "3.50",
    price: "9.00",
    expenses: "2.00",
    targetMargin: 40,
    currency: "USD",
    description: "Fresh pastries, specialty roasted coffee, or prepared takeaway lunch bowls."
  },
  {
    id: "wholesale-distribution",
    title: "Wholesale Supply",
    category: "B2B Distribution",
    icon: Boxes,
    cost: "420",
    price: "750",
    expenses: "110",
    targetMargin: 30,
    currency: "USD",
    description: "Bulk manufacturing pallets, hardware components, or warehouse logistics."
  },
  {
    id: "agency-consulting",
    title: "Consulting & Agency",
    category: "Professional Services",
    icon: Briefcase,
    cost: "1200",
    price: "3500",
    expenses: "450",
    targetMargin: 50,
    currency: "USD",
    description: "Brand strategy sprints, full-stack website redesigns, or marketing retainers."
  },
  {
    id: "consumer-electronics",
    title: "Electronics Hardware",
    category: "Consumer Tech",
    icon: Headphones,
    cost: "320",
    price: "449",
    expenses: "45",
    targetMargin: 20,
    currency: "USD",
    description: "Noise-cancelling headphones, smart tablets, computer monitors, and accessories."
  }
];

export default function ProfitMarginCalculator() {
  // Mode Selector: "analyze" (Analyze existing cost & price) vs "target" (Calculate target price for desired margin)
  const [activeTab, setActiveTab] = useState<"analyze" | "target">("analyze");

  // Selected Currency
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  // Blueprint selection
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("ecommerce-dtc");

  // Form Inputs (Preloaded with Blueprint #1)
  const [cost, setCost] = useState<string>(PROFIT_BLUEPRINTS[0].cost);
  const [price, setPrice] = useState<string>(PROFIT_BLUEPRINTS[0].price);
  const [operatingExpenses, setOperatingExpenses] = useState<string>(PROFIT_BLUEPRINTS[0].expenses);
  const [targetMargin, setTargetMargin] = useState<number>(PROFIT_BLUEPRINTS[0].targetMargin);

  const [copied, setCopied] = useState<boolean>(false);

  // Active Currency Symbol
  const currSymbol = useMemo(() => {
    return CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "$";
  }, [selectedCurrency]);

  const numCost = parseFloat(cost) || 0;
  const numPrice = parseFloat(price) || 0;
  const numOpEx = parseFloat(operatingExpenses) || 0;

  // Real-time Financial Calculations (Mode A: Analyze)
  const calculations = useMemo(() => {
    const grossProfit = numPrice - numCost;
    const grossMargin = numPrice > 0 ? (grossProfit / numPrice) * 100 : 0;
    const markup = numCost > 0 ? (grossProfit / numCost) * 100 : 0;
    const markupMultiplier = numCost > 0 ? numPrice / numCost : 0;
    const netProfit = grossProfit - numOpEx;
    const netMargin = numPrice > 0 ? (netProfit / numPrice) * 100 : 0;

    // Visual Waterfall Shares
    const costSharePercent = numPrice > 0 ? Math.min(100, Math.max(0, (numCost / numPrice) * 100)) : 0;
    const expenseSharePercent = numPrice > 0 ? Math.min(100, Math.max(0, (numOpEx / numPrice) * 100)) : 0;
    const profitSharePercent = numPrice > 0 ? Math.max(0, 100 - costSharePercent - expenseSharePercent) : 0;

    // Breakeven units if OpEx represents fixed monthly overhead and gross profit is unit margin
    const breakevenUnits = grossProfit > 0 && numOpEx > 0 ? Math.ceil(numOpEx / grossProfit) : 1;

    // Margin Health Evaluation
    let marginHealth = { label: "Unhealthy / Loss", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
    if (grossMargin >= 60) {
      marginHealth = { label: "Exceptional Margin", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" };
    } else if (grossMargin >= 35) {
      marginHealth = { label: "Healthy Commercial Margin", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
    } else if (grossMargin >= 15) {
      marginHealth = { label: "Standard Retail Margin", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" };
    } else if (grossMargin > 0) {
      marginHealth = { label: "Slim Margin", color: "text-orange-300", bg: "bg-orange-400/10 border-orange-400/30" };
    }

    return {
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMargin: Math.round(grossMargin * 10) / 10,
      markup: Math.round(markup * 10) / 10,
      markupMultiplier: Math.round(markupMultiplier * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      netMargin: Math.round(netMargin * 10) / 10,
      costSharePercent: Math.round(costSharePercent * 10) / 10,
      expenseSharePercent: Math.round(expenseSharePercent * 10) / 10,
      profitSharePercent: Math.round(profitSharePercent * 10) / 10,
      breakevenUnits,
      marginHealth
    };
  }, [numCost, numPrice, numOpEx]);

  // Mode B: Target Margin Pricing Calculations
  const targetCalculations = useMemo(() => {
    // Formula: Required Price = (Cost + Expenses) / (1 - TargetMargin / 100)
    const validTargetMargin = Math.min(99, Math.max(1, targetMargin));
    const totalUnitCost = numCost + numOpEx;
    const requiredSellingPrice = totalUnitCost / (1 - validTargetMargin / 100);
    const requiredGrossProfit = requiredSellingPrice - numCost;
    const requiredNetProfit = requiredSellingPrice - totalUnitCost;
    const requiredMarkup = numCost > 0 ? (requiredGrossProfit / numCost) * 100 : 0;

    return {
      requiredPrice: Math.round(requiredSellingPrice * 100) / 100,
      requiredGrossProfit: Math.round(requiredGrossProfit * 100) / 100,
      requiredNetProfit: Math.round(requiredNetProfit * 100) / 100,
      requiredMarkup: Math.round(requiredMarkup * 10) / 10
    };
  }, [numCost, numOpEx, targetMargin]);

  // Load a Blueprint Scenario
  const handleSelectBlueprint = (bp: ProfitBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setCost(bp.cost);
    setPrice(bp.price);
    setOperatingExpenses(bp.expenses);
    setTargetMargin(bp.targetMargin);
    setSelectedCurrency(bp.currency);
  };

  // Reset to Clean Blank Baseline
  const handleReset = () => {
    setSelectedBlueprintId("");
    setCost("50");
    setPrice("100");
    setOperatingExpenses("15");
    setTargetMargin(40);
  };

  // Apply Quick Price Adjustment Pill (+5%, +10%, +25%, .99 Round)
  const applyPriceAdjustment = (type: "pct5" | "pct10" | "pct25" | "dot99" | "round") => {
    const current = parseFloat(price) || 0;
    if (type === "pct5") {
      setPrice((Math.round(current * 1.05 * 100) / 100).toFixed(2));
    } else if (type === "pct10") {
      setPrice((Math.round(current * 1.10 * 100) / 100).toFixed(2));
    } else if (type === "pct25") {
      setPrice((Math.round(current * 1.25 * 100) / 100).toFixed(2));
    } else if (type === "dot99") {
      const whole = Math.floor(current);
      setPrice((whole + 0.99).toFixed(2));
    } else if (type === "round") {
      setPrice(Math.ceil(current).toFixed(2));
    }
  };

  // Apply Target Price to Active Price Field
  const handleApplyTargetPrice = () => {
    setPrice(targetCalculations.requiredPrice.toFixed(2));
    setActiveTab("analyze");
  };

  // Copy Calculation Summary
  const handleCopySummary = () => {
    const summary = `Commercial Profit Margin & Markup Ledger:
------------------------------------------------
Item Unit Cost:          ${currSymbol}${numCost.toLocaleString()}
Selling Price:           ${currSymbol}${numPrice.toLocaleString()}
Operating Overhead:      ${currSymbol}${numOpEx.toLocaleString()}

Gross Profit:            ${currSymbol}${calculations.grossProfit.toLocaleString()} (${calculations.grossMargin}% Gross Margin)
Markup Rate:             ${calculations.markup}% (${calculations.markupMultiplier}x Multiplier)
Net Retained Profit:     ${currSymbol}${calculations.netProfit.toLocaleString()} (${calculations.netMargin}% Net Margin)

Revenue Distribution:
- Production Cost:       ${calculations.costSharePercent}%
- Operating Overhead:    ${calculations.expenseSharePercent}%
- Retained Net Profit:   ${calculations.profitSharePercent}%
------------------------------------------------
Calculated with Exismic Business & Finance Studio`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Financial Sheet (.txt)
  const handleDownloadTxt = () => {
    const summary = `Commercial Profit Margin & Pricing Breakdown
Generated on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
Currency: ${selectedCurrency}

[EXECUTIVE SUMMARY]
-------------------------------------------------------
Selling Price:           ${currSymbol}${numPrice.toLocaleString()}
Direct Unit Cost:        ${currSymbol}${numCost.toLocaleString()}
Operating Expenses:      ${currSymbol}${numOpEx.toLocaleString()}

[PROFIT & MARGIN METRICS]
-------------------------------------------------------
Gross Profit Amount:     ${currSymbol}${calculations.grossProfit.toLocaleString()}
Gross Profit Margin:     ${calculations.grossMargin}%
Markup on Cost:          ${calculations.markup}% (${calculations.markupMultiplier}x Cost Multiplier)
Net Operating Profit:    ${currSymbol}${calculations.netProfit.toLocaleString()}
Net Profit Margin:       ${calculations.netMargin}%

[REVENUE SHARE COMPOSITION]
-------------------------------------------------------
Production Cost Share:   ${calculations.costSharePercent}%
Overhead Expense Share:  ${calculations.expenseSharePercent}%
Retained Profit Share:   ${calculations.profitSharePercent}%

[TARGET MARGIN PRICING GOAL]
-------------------------------------------------------
Desired Target Margin:   ${targetMargin}%
Target Price Needed:     ${currSymbol}${targetCalculations.requiredPrice.toLocaleString()}
Target Net Profit:       ${currSymbol}${targetCalculations.requiredNetProfit.toLocaleString()}

Calculated with Exismic Business & Finance Studio
https://exismic.com/tools/profit-margin-calculator`;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-margin-${numCost}-to-${numPrice}-${selectedCurrency.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Deck: Telemetry HUD & Studio Actions */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Category Badge & Studio Telemetry */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(249,115,22,0.15)]">
              <TrendingUp size={13} className="text-orange-400" />
              <span>Business & Finance Studio</span>
            </div>

            {/* Live Gross Margin Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Percent size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-zinc-300">Gross Margin:</span>
              <span className={cn(
                "text-sm font-black",
                calculations.grossMargin >= 35 ? "text-orange-400" : calculations.grossMargin > 0 ? "text-amber-400" : "text-rose-400"
              )}>
                {calculations.grossMargin}%
              </span>
            </div>

            {/* Live Markup Multiplier Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Scale size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-zinc-300">Markup:</span>
              <span className="text-sm font-black text-amber-400">
                {calculations.markupMultiplier}x ({calculations.markup}%)
              </span>
            </div>

            {/* Net Cash Profit Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <DollarSign size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-zinc-300">Net Profit:</span>
              <span className={cn(
                "text-sm font-black",
                calculations.netProfit >= 0 ? "text-orange-400" : "text-rose-400"
              )}>
                {currSymbol}{calculations.netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right: Currency Selector & Quick Reset */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/60 border border-white/10">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => setSelectedCurrency(curr.code)}
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    selectedCurrency === curr.code
                      ? "bg-orange-500 text-black shadow-sm font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {curr.symbol}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset fields to baseline"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} className="text-orange-400" />
              <span className="hidden sm:inline">Export Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blueprint Selector Bar (Standard: 6 Blueprints, Preloaded Blueprint #1) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-orange-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Commercial Blueprints & Scenarios
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to populate commercial financials
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PROFIT_BLUEPRINTS.map((bp) => {
            const Icon = bp.icon;
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-orange-500/15 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-orange-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "p-1.5 rounded-xl border transition-colors",
                    isSelected ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-white/5 border-white/10 text-zinc-400 group-hover:text-orange-400"
                  )}>
                    <Icon size={14} />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                    {bp.category}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                    {currSymbol}{bp.price} <span className="text-zinc-500 font-normal">({bp.targetMargin}% target)</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs & Mode Tabs): 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1.5 rounded-2xl bg-black/50 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("analyze")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeTab === "analyze"
                  ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-black font-black shadow-md shadow-orange-500/20"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <BarChart3 size={15} />
              <span>Margin & Markup Analyzer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("target")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeTab === "target"
                  ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-black font-black shadow-md shadow-orange-500/20"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Sliders size={15} />
              <span>Target Price Calculator</span>
            </button>
          </div>

          {/* Form Card Container */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5">
            {activeTab === "analyze" ? (
              <>
                {/* Item Cost Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span>Item Unit Cost (Direct Production Cost)</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">Materials, labor, or wholesale buy</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-black text-base">
                      {currSymbol}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={cost}
                      onChange={(e) => {
                        setCost(e.target.value);
                        setSelectedBlueprintId("");
                      }}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-4 py-3.5 text-lg font-black text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Selling Price Input with Quick Adjusters */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span>Selling Price (Customer Retail Price)</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">Listed catalog or checkout amount</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-orange-400 font-black text-base">
                      {currSymbol}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        setSelectedBlueprintId("");
                      }}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-4 py-3.5 text-lg font-black text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Price Quick Experimentation Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => applyPriceAdjustment("pct5")}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/10 text-xs font-bold text-zinc-300 hover:text-orange-300 transition-all cursor-pointer"
                    >
                      +5%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPriceAdjustment("pct10")}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/10 text-xs font-bold text-zinc-300 hover:text-orange-300 transition-all cursor-pointer"
                    >
                      +10%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPriceAdjustment("pct25")}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/10 text-xs font-bold text-zinc-300 hover:text-orange-300 transition-all cursor-pointer"
                    >
                      +25%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPriceAdjustment("dot99")}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/10 text-xs font-bold text-zinc-300 hover:text-orange-300 transition-all cursor-pointer"
                    >
                      .99 Charm Price
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPriceAdjustment("round")}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500/40 border border-white/10 text-xs font-bold text-zinc-300 hover:text-orange-300 transition-all cursor-pointer"
                    >
                      Round Up (.00)
                    </button>
                  </div>
                </div>

                {/* Operating Expenses (Optional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <span>Operating & Overhead Expenses (Per Sale - Optional)</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">Shipping, payment fees, marketing</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-black text-base">
                      {currSymbol}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={operatingExpenses}
                      onChange={(e) => {
                        setOperatingExpenses(e.target.value);
                        setSelectedBlueprintId("");
                      }}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-4 py-3.5 text-base font-bold text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Mode B: Target Margin Pricing Planner */
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
                  <Sliders size={18} className="text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Target Margin Price Finder</h4>
                    <p className="text-[11px] text-zinc-300 mt-0.5">
                      Tell us your unit cost and the profit percentage you want to maintain. We will calculate the exact price to charge your customers.
                    </p>
                  </div>
                </div>

                {/* Direct Cost Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                    Direct Unit Cost
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-black">
                      {currSymbol}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-4 py-3.5 text-base font-bold text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Overhead Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                    Delivery & Overhead Expenses (Per Sale)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-black">
                      {currSymbol}
                    </div>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={operatingExpenses}
                      onChange={(e) => setOperatingExpenses(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-4 py-3.5 text-base font-bold text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Desired Target Margin Slider & Presets */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      Desired Profit Margin: <span className="text-orange-400 text-sm font-black">{targetMargin}%</span>
                    </label>
                    <span className="text-[11px] text-zinc-400">Industry standard: 30% - 50%</span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="1"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-lg bg-black/60 accent-orange-500 cursor-pointer"
                  />

                  {/* Target Margin Presets */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[20, 30, 40, 50, 60, 75].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setTargetMargin(rate)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                          targetMargin === rate
                            ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-sm font-black"
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                        )}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Target Results Box */}
                <div className="p-4 rounded-2xl bg-black/50 border border-orange-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Required Selling Price:</span>
                    <span className="text-2xl font-black text-orange-400">
                      {currSymbol}{targetCalculations.requiredPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Required Markup on Cost:</span>
                    <span className="font-bold text-white">{targetCalculations.requiredMarkup}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Net Profit Per Sale:</span>
                    <span className="font-bold text-orange-400">{currSymbol}{targetCalculations.requiredNetProfit.toLocaleString()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyTargetPrice}
                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20 active:scale-[0.99] mt-2"
                  >
                    <span>Use {currSymbol}{targetCalculations.requiredPrice.toLocaleString()} in Analyzer</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Visual Distribution & Ledger): 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Key Metric Tiles (Gross Margin & Markup Rate) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Gross Margin Card */}
            <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    Gross Margin
                  </span>
                  <Percent size={14} className="text-orange-400" />
                </div>
                <div className="text-3xl font-black text-orange-400">
                  {calculations.grossMargin}%
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", calculations.marginHealth.bg, calculations.marginHealth.color)}>
                  {calculations.marginHealth.label}
                </span>
              </div>
            </div>

            {/* Markup Rate Card */}
            <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    Markup Rate
                  </span>
                  <Scale size={14} className="text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400">
                  {calculations.markup}%
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 font-medium">Multiplier:</span>
                <span className="font-extrabold text-white">{calculations.markupMultiplier}x Cost</span>
              </div>
            </div>
          </div>

          {/* Real-Time Revenue Waterfall Bar (Proportion Visualization) */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <PieChart size={14} className="text-orange-400" />
                <span>Revenue Share Breakdown</span>
              </span>
              <span className="text-xs font-bold text-zinc-400">
                Total: {currSymbol}{numPrice.toLocaleString()}
              </span>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="h-4 w-full rounded-full bg-zinc-800/80 overflow-hidden flex p-0.5 border border-white/10">
              {/* Cost Portion */}
              {calculations.costSharePercent > 0 && (
                <div
                  style={{ width: `${calculations.costSharePercent}%` }}
                  className="h-full bg-zinc-500 transition-all duration-300 rounded-l-full relative group cursor-pointer"
                  title={`Direct Unit Cost: ${calculations.costSharePercent}%`}
                />
              )}
              {/* OpEx Portion */}
              {calculations.expenseSharePercent > 0 && (
                <div
                  style={{ width: `${calculations.expenseSharePercent}%` }}
                  className="h-full bg-amber-500/80 transition-all duration-300 relative group cursor-pointer"
                  title={`Overhead & Delivery: ${calculations.expenseSharePercent}%`}
                />
              )}
              {/* Net Profit Portion */}
              {calculations.profitSharePercent > 0 && (
                <div
                  style={{ width: `${calculations.profitSharePercent}%` }}
                  className="h-full bg-orange-500 transition-all duration-300 rounded-r-full relative group cursor-pointer"
                  title={`Net Retained Profit: ${calculations.profitSharePercent}%`}
                />
              )}
            </div>

            {/* Legend Tiles */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
                  <span className="text-[10px] font-bold text-zinc-400">Unit Cost</span>
                </div>
                <p className="text-xs font-black text-white">{calculations.costSharePercent}%</p>
                <p className="text-[10px] text-zinc-400">{currSymbol}{numCost.toLocaleString()}</p>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span className="text-[10px] font-bold text-zinc-400">Overhead</span>
                </div>
                <p className="text-xs font-black text-amber-400">{calculations.expenseSharePercent}%</p>
                <p className="text-[10px] text-zinc-400">{currSymbol}{numOpEx.toLocaleString()}</p>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  <span className="text-[10px] font-bold text-zinc-400">Net Profit</span>
                </div>
                <p className="text-xs font-black text-orange-400">{calculations.profitSharePercent}%</p>
                <p className="text-[10px] text-zinc-400">{currSymbol}{calculations.netProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Detailed Financial Ledger Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Detailed Financial Ledger
              </span>
              <span className="text-[11px] font-bold text-orange-400">Per Unit View</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Customer Selling Price:</span>
                <span className="font-extrabold text-white text-sm">
                  {currSymbol}{numPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Direct Unit Cost (COGS):</span>
                <span className="font-bold text-zinc-300">
                  - {currSymbol}{numCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 px-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="font-bold text-zinc-300">Gross Profit (Before Overhead):</span>
                <span className="font-black text-orange-400">
                  {currSymbol}{calculations.grossProfit.toLocaleString()} ({calculations.grossMargin}%)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Overhead & Delivery Expenses:</span>
                <span className="font-bold text-zinc-300">
                  - {currSymbol}{numOpEx.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs py-2 px-3 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                <span className="font-black text-white text-sm">Net Retained Cash Profit:</span>
                <span className={cn(
                  "font-black text-base",
                  calculations.netProfit >= 0 ? "text-orange-400" : "text-rose-400"
                )}>
                  {currSymbol}{calculations.netProfit.toLocaleString()} ({calculations.netMargin}%)
                </span>
              </div>
            </div>

            {/* Copy Summary Button */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:from-orange-400 hover:to-amber-300 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20 active:scale-[0.99] mt-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={16} className="text-black" />
                  <span>Ledger Summary Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-black" />
                  <span>Copy Profit Breakdown</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="profit-margin-calculator"
        toolName="Profit Margin Calculator"
        title={`Profit Ledger: ${currSymbol}${numPrice.toLocaleString()} (${calculations.grossMargin}% Gross Margin)`}
        content={`Profit Margin & Pricing Breakdown:
Selling Price: ${currSymbol}${numPrice}
Unit Cost: ${currSymbol}${numCost}
Overhead: ${currSymbol}${numOpEx}
Gross Margin: ${calculations.grossMargin}%
Markup Rate: ${calculations.markup}%
Net Cash Profit: ${currSymbol}${calculations.netProfit} (${calculations.netMargin}%)`}
        downloadLabel="Download Ledger (.txt)"
        downloadAction={handleDownloadTxt}
        onCopy={handleCopySummary}
      />

      {/* Chained Companion Tools in Business & Finance */}
      <ToolWorkflowChaining
        currentToolId="profit-margin-calculator"
        categoryId="business"
        outputContent={`Gross Margin: ${calculations.grossMargin}%, Net Profit: ${currSymbol}${calculations.netProfit}`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="profit-margin-calculator"
        categoryId="business"
        outputContent={`Gross Margin: ${calculations.grossMargin}%, Net Profit: ${currSymbol}${calculations.netProfit}`}
      />
    </div>
  );
}
