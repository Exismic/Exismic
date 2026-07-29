"use client";

import React, { useState, useMemo } from "react";
import { 
  FileSpreadsheet, 
  IndianRupee, 
  Copy, 
  CheckCircle2, 
  Scale, 
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SalaryCalculator() {
  const [ctc, setCtc] = useState<string>("1200000"); // 12 LPA default
  const [copied, setCopied] = useState(false);

  const numCtc = parseFloat(ctc) || 0;

  const calculations = useMemo(() => {
    // Standard Indian Salary breakdown assumptions:
    const basic = numCtc * 0.5; // 50% basic
    const pfDeductionAnnual = Math.min(basic * 0.12, 21600 * 12); // EPF
    const profTax = 2500; // Professional Tax
    const standardDeduction = 75000; // New Tax Regime 2024-25

    // New Tax Regime Tax Slabs (FY 2024-25)
    let taxableIncomeNew = Math.max(0, numCtc - standardDeduction - pfDeductionAnnual);
    let taxNew = 0;

    if (taxableIncomeNew > 1500000) {
      taxNew += (taxableIncomeNew - 1500000) * 0.3;
      taxableIncomeNew = 1500000;
    }
    if (taxableIncomeNew > 1200000) {
      taxNew += (taxableIncomeNew - 1200000) * 0.2;
      taxableIncomeNew = 1200000;
    }
    if (taxableIncomeNew > 900000) {
      taxNew += (taxableIncomeNew - 900000) * 0.15;
      taxableIncomeNew = 900000;
    }
    if (taxableIncomeNew > 600000) {
      taxNew += (taxableIncomeNew - 600000) * 0.1;
      taxableIncomeNew = 600000;
    }
    if (taxableIncomeNew > 300000) {
      taxNew += (taxableIncomeNew - 300000) * 0.05;
    }
    // Section 87A rebate for income up to 7 Lakhs under New Regime
    if (numCtc <= 775000) {
      taxNew = 0;
    }

    const cessNew = taxNew * 0.04;
    const totalTaxNew = taxNew + cessNew;

    const inHandAnnualNew = numCtc - pfDeductionAnnual - profTax - totalTaxNew;
    const monthlyInHandNew = inHandAnnualNew / 12;

    return {
      monthlyInHand: Math.round(monthlyInHandNew),
      annualInHand: Math.round(inHandAnnualNew),
      monthlyTax: Math.round(totalTaxNew / 12),
      annualTax: Math.round(totalTaxNew),
      monthlyPf: Math.round(pfDeductionAnnual / 12),
      annualPf: Math.round(pfDeductionAnnual),
    };
  }, [numCtc]);

  const handleCopy = () => {
    const summary = `Salary & In-Hand Breakdown (CTC ₹${numCtc.toLocaleString("en-IN")}):
Monthly Take-Home Salary: ₹${calculations.monthlyInHand.toLocaleString("en-IN")}
Annual Take-Home: ₹${calculations.annualInHand.toLocaleString("en-IN")}
Monthly Tax (TDS): ₹${calculations.monthlyTax.toLocaleString("en-IN")}
Monthly EPF Deduction: ₹${calculations.monthlyPf.toLocaleString("en-IN")}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <FileSpreadsheet size={14} className="text-emerald-400" />
              <span>Compensation & Tax</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              CTC to In-Hand Salary Calculator
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Calculate net monthly take-home salary from your annual CTC package with tax and EPF deductions.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Total Annual CTC Package (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
              <input
                type="number"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                placeholder="e.g. 1200000"
                className="w-full rounded-2xl border border-white/10 bg-black/50 pl-10 pr-4 py-4 text-xl font-bold text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Example: ₹12,000,000 for 12 LPA</p>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-black border border-emerald-500/30 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Monthly In-Hand Take-Home</p>
              <p className="text-4xl font-black text-white">₹{calculations.monthlyInHand.toLocaleString("en-IN")}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Annual Take-Home:</span>
                <span className="font-bold text-white">₹{calculations.annualInHand.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Monthly EPF Deduction:</span>
                <span className="font-bold text-amber-300">₹{calculations.monthlyPf.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Monthly Income Tax (TDS):</span>
                <span className="font-bold text-red-300">₹{calculations.monthlyTax.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Copied Salary Details!" : "Copy Salary Summary"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
