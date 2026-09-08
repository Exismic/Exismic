"use client";

import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  Percent, 
  Calendar, 
  Copy, 
  CheckCircle2, 
  PieChart,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("1000000"); // 10 Lakhs
  const [interestRate, setInterestRate] = useState<string>("8.5"); // 8.5%
  const [tenureYears, setTenureYears] = useState<string>("15");

  const [copied, setCopied] = useState(false);

  const P = parseFloat(loanAmount) || 0;
  const r = (parseFloat(interestRate) || 0) / 12 / 100;
  const n = (parseFloat(tenureYears) || 0) * 12;

  const calculations = useMemo(() => {
    if (P <= 0 || r <= 0 || n <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: 0, principalPercent: 50, interestPercent: 50 };
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    const principalPercent = Math.round((P / totalPayment) * 100);
    const interestPercent = 100 - principalPercent;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalPercent,
      interestPercent,
    };
  }, [P, r, n]);

  const handleCopy = () => {
    const summary = `Loan EMI Calculation:
Loan Amount: ₹${P.toLocaleString("en-IN")}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenureYears} Years (${n} Months)
Monthly EMI: ₹${calculations.emi.toLocaleString("en-IN")}
Total Interest Payable: ₹${calculations.totalInterest.toLocaleString("en-IN")}
Total Amount Payable: ₹${calculations.totalPayment.toLocaleString("en-IN")}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Loan Amount (₹)
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="e.g. 1000000"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-base font-bold text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Interest Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="e.g. 8.5"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-base font-bold text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Loan Tenure (Years)
            </label>
            <input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              placeholder="e.g. 15"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-base font-bold text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 to-black border border-blue-500/30 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Monthly Loan EMI</p>
              <p className="text-4xl font-black text-white">₹{calculations.emi.toLocaleString("en-IN")}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Principal Amount:</span>
                <span className="font-bold text-white">₹{P.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Total Interest Payable:</span>
                <span className="font-bold text-blue-300">₹{calculations.totalInterest.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                <span className="text-zinc-300 font-bold">Total Amount Payable:</span>
                <span className="font-black text-emerald-400">₹{calculations.totalPayment.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <span className="text-white">Principal ({calculations.principalPercent}%)</span>
                <span className="text-blue-400">Interest ({calculations.interestPercent}%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-blue-500/20 overflow-hidden flex">
                <div style={{ width: `${calculations.principalPercent}%` }} className="bg-white h-full" />
                <div style={{ width: `${calculations.interestPercent}%` }} className="bg-blue-500 h-full" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? "Copied EMI Summary!" : "Copy EMI Summary"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
