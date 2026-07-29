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
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GstCalculator() {
  const [amount, setAmount] = useState<string>("10000");
  const [taxRate, setTaxRate] = useState<number>(18);
  const [gstMode, setGstMode] = useState<"exclusive" | "inclusive">("exclusive");
  const [transactionType, setTransactionType] = useState<"intra" | "inter">("intra");
  const [copied, setCopied] = useState(false);

  const numAmount = parseFloat(amount) || 0;

  const calculations = useMemo(() => {
    let baseAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (gstMode === "exclusive") {
      baseAmount = numAmount;
      gstAmount = (numAmount * taxRate) / 100;
      totalAmount = baseAmount + gstAmount;
    } else {
      totalAmount = numAmount;
      baseAmount = (numAmount * 100) / (100 + taxRate);
      gstAmount = totalAmount - baseAmount;
    }

    const cgst = transactionType === "intra" ? gstAmount / 2 : 0;
    const sgst = transactionType === "intra" ? gstAmount / 2 : 0;
    const igst = transactionType === "inter" ? gstAmount : 0;

    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: Math.round(igst * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }, [numAmount, taxRate, gstMode, transactionType]);

  const handleCopySummary = () => {
    const summary = `GST Calculation Summary:
Amount: ₹${numAmount} (${gstMode.toUpperCase()})
Tax Rate: ${taxRate}%
Base Amount: ₹${calculations.baseAmount.toLocaleString("en-IN")}
Total GST: ₹${calculations.gstAmount.toLocaleString("en-IN")} ${transactionType === "intra" ? `(CGST: ₹${calculations.cgst}, SGST: ₹${calculations.sgst})` : `(IGST: ₹${calculations.igst})`}
Total Amount: ₹${calculations.totalAmount.toLocaleString("en-IN")}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <IndianRupee size={14} className="text-emerald-400" />
              <span>India Business Utilities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              GST Calculator (India)
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Calculate inclusive & exclusive GST amounts with CGST, SGST, and IGST tax breakdowns.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-white/10">
            <button
              type="button"
              onClick={() => setGstMode("exclusive")}
              className={cn(
                "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                gstMode === "exclusive" 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              GST Exclusive (+ GST)
            </button>
            <button
              type="button"
              onClick={() => setGstMode("inclusive")}
              className={cn(
                "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                gstMode === "inclusive" 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              GST Inclusive (- GST)
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount..."
                className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-4 py-4 text-lg font-bold text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tax Slabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400">Select GST Tax Rate Slab</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 12, 18, 28].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTaxRate(rate)}
                  className={cn(
                    "py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border text-center cursor-pointer",
                    taxRate === rate 
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]" 
                      : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {/* Inter-state vs Intra-state */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">Transaction Supply Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransactionType("intra")}
                className={cn(
                  "py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                  transactionType === "intra" 
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" 
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                Intra-State (CGST + SGST)
              </button>
              <button
                type="button"
                onClick={() => setTransactionType("inter")}
                className={cn(
                  "py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                  transactionType === "inter" 
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" 
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                )}
              >
                Inter-State (IGST)
              </button>
            </div>
          </div>
        </div>

        {/* Output Calculation Card */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">GST Breakdown</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                {taxRate}% Rate
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Net Base Amount:</span>
                <span className="font-bold text-white">₹{calculations.baseAmount.toLocaleString("en-IN")}</span>
              </div>

              {transactionType === "intra" ? (
                <>
                  <div className="flex justify-between items-center text-sm pl-4 border-l-2 border-emerald-500/40">
                    <span className="text-zinc-400">CGST ({taxRate / 2}%):</span>
                    <span className="font-bold text-emerald-300">₹{calculations.cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-4 border-l-2 border-emerald-500/40">
                    <span className="text-zinc-400">SGST ({taxRate / 2}%):</span>
                    <span className="font-bold text-emerald-300">₹{calculations.sgst.toLocaleString("en-IN")}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-sm pl-4 border-l-2 border-cyan-500/40">
                  <span className="text-zinc-400">IGST ({taxRate}%):</span>
                  <span className="font-bold text-cyan-300">₹{calculations.igst.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-zinc-400">Total Tax Amount:</span>
                <span className="font-bold text-emerald-400">₹{calculations.gstAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-black border border-emerald-500/30 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Gross Amount</p>
              <p className="text-3xl font-black text-white">₹{calculations.totalAmount.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Summary Copied!" : "Copy Calculation Summary"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
