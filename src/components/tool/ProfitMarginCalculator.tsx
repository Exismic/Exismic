"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Copy, 
  CheckCircle2, 
  PieChart, 
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfitMarginCalculator() {
  const [cost, setCost] = useState<string>("500");
  const [price, setPrice] = useState<string>("850");
  const [operatingExpenses, setOperatingExpenses] = useState<string>("100");
  const [copied, setCopied] = useState(false);

  const numCost = parseFloat(cost) || 0;
  const numPrice = parseFloat(price) || 0;
  const numOpEx = parseFloat(operatingExpenses) || 0;

  const calculations = useMemo(() => {
    const grossProfit = numPrice - numCost;
    const grossMargin = numPrice > 0 ? (grossProfit / numPrice) * 100 : 0;
    const markup = numCost > 0 ? (grossProfit / numCost) * 100 : 0;
    const netProfit = grossProfit - numOpEx;
    const netMargin = numPrice > 0 ? (netProfit / numPrice) * 100 : 0;

    return {
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMargin: Math.round(grossMargin * 10) / 10,
      markup: Math.round(markup * 10) / 10,
      netProfit: Math.round(netProfit * 100) / 100,
      netMargin: Math.round(netMargin * 10) / 10,
    };
  }, [numCost, numPrice, numOpEx]);

  const handleCopy = () => {
    const summary = `Profit Margin Summary:
Cost Price: $${numCost}
Selling Price: $${numPrice}
Gross Profit: $${calculations.grossProfit} (${calculations.grossMargin}% Gross Margin)
Markup Percentage: ${calculations.markup}%
Net Profit: $${calculations.netProfit} (${calculations.netMargin}% Net Margin)`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <TrendingUp size={14} className="text-emerald-400" />
              <span>Business Finance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Profit Margin Calculator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Calculate gross profit, margin percentage, markup rate, and net profit margins instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Cost of Goods Sold (COGS)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g. 500"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-base font-bold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Selling Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 850"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-base font-bold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Operating Expenses (OpEx - Optional)
            </label>
            <input
              type="number"
              value={operatingExpenses}
              onChange={(e) => setOperatingExpenses(e.target.value)}
              placeholder="e.g. 100"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-base font-bold text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Financial Metrics</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Gross Margin</p>
                <p className="text-2xl font-black text-emerald-400">{calculations.grossMargin}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Markup Rate</p>
                <p className="text-2xl font-black text-cyan-400">{calculations.markup}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Gross Profit:</span>
                <span className="font-bold text-white">${calculations.grossProfit}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Net Profit Margin:</span>
                <span className="font-bold text-emerald-400">{calculations.netMargin}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Net Profit Amount:</span>
                <span className="font-bold text-emerald-400">${calculations.netProfit}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Copied!" : "Copy Profit Breakdown"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
