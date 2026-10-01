"use client";

import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  Percent, 
  Calendar, 
  Copy, 
  CheckCircle2, 
  PieChart,
  ShieldCheck,
  Download,
  RotateCcw,
  TrendingUp,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Table,
  PiggyBank
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// Supported Currencies
export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "CAD", symbol: "CA$", label: "CAD ($)" },
  { code: "AUD", symbol: "AU$", label: "AUD ($)" }
];

// Loan Blueprints (Standard: Preloaded Blueprint #1, Zero Empty Voids)
export interface LoanBlueprint {
  id: string;
  title: string;
  category: string;
  icon: typeof Home;
  amount: string;
  rate: string;
  tenureYears: string;
  currency: string;
  description: string;
}

export const LOAN_BLUEPRINTS: LoanBlueprint[] = [
  {
    id: "home-loan",
    title: "Residential Home Loan",
    category: "Real Estate",
    icon: Home,
    amount: "3000000",
    rate: "8.5",
    tenureYears: "20",
    currency: "INR",
    description: "Long-term mortgage financing for an apartment or family house."
  },
  {
    id: "new-car-loan",
    title: "Sedan / EV Car Loan",
    category: "Vehicle",
    icon: Car,
    amount: "1200000",
    rate: "9.0",
    tenureYears: "5",
    currency: "INR",
    description: "Vehicle loan financing with fixed monthly auto payments."
  },
  {
    id: "personal-loan",
    title: "Personal / Home Reno",
    category: "Unsecured",
    icon: CreditCard,
    amount: "500000",
    rate: "12.5",
    tenureYears: "3",
    currency: "INR",
    description: "Short-term personal loan for medical, travel, or home renovation."
  },
  {
    id: "higher-education",
    title: "Higher Education Loan",
    category: "Student",
    icon: GraduationCap,
    amount: "2000000",
    rate: "9.8",
    tenureYears: "7",
    currency: "INR",
    description: "University tuition financing with post-graduation repayment."
  },
  {
    id: "business-equipment",
    title: "Business & Machinery",
    category: "Commercial",
    icon: Briefcase,
    amount: "5000000",
    rate: "11.5",
    tenureYears: "5",
    currency: "INR",
    description: "Commercial capital loan for hardware, tooling, and office expansion."
  },
  {
    id: "two-wheeler",
    title: "Two-Wheeler Commuter",
    category: "Auto",
    icon: Zap,
    amount: "150000",
    rate: "13.5",
    tenureYears: "2",
    currency: "INR",
    description: "Quick installment loan for a motorcycle or commuter electric scooter."
  }
];

export default function EmiCalculator() {
  // Currency Selector
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");

  // Selected Blueprint
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("home-loan");

  // Inputs
  const [loanAmount, setLoanAmount] = useState<string>(LOAN_BLUEPRINTS[0].amount);
  const [interestRate, setInterestRate] = useState<string>(LOAN_BLUEPRINTS[0].rate);
  const [tenureYears, setTenureYears] = useState<string>(LOAN_BLUEPRINTS[0].tenureYears);
  const [tenureType, setTenureType] = useState<"years" | "months">("years");

  // Optional Extra Payment / Prepayment Simulator
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<string>("0");
  const [showPrepayment, setShowPrepayment] = useState<boolean>(false);

  // Amortization Schedule Visibility
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);

  const currSymbol = useMemo(() => {
    return CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || "₹";
  }, [selectedCurrency]);

  const P = parseFloat(loanAmount) || 0;
  const annualRate = parseFloat(interestRate) || 0;
  const r = annualRate / 12 / 100;
  const tenureNum = parseFloat(tenureYears) || 0;
  const totalMonths = tenureType === "years" ? tenureNum * 12 : tenureNum;
  const extraPmt = parseFloat(extraMonthlyPayment) || 0;

  // Real-time EMI Calculations
  const calculations = useMemo(() => {
    if (P <= 0 || r <= 0 || totalMonths <= 0) {
      return { 
        emi: 0, 
        totalInterest: 0, 
        totalPayment: 0, 
        principalPercent: 50, 
        interestPercent: 50,
        prepaymentSavings: 0,
        monthsSaved: 0
      };
    }

    // Standard EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = (P * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - P;

    const principalPercent = Math.round((P / totalPayment) * 100);
    const interestPercent = 100 - principalPercent;

    // Prepayment simulation if extra monthly amount is provided
    let prepaymentSavings = 0;
    let monthsSaved = 0;

    if (extraPmt > 0) {
      let balance = P;
      let totalInterestWithPrepay = 0;
      let monthsWithPrepay = 0;
      const combinedPayment = emi + extraPmt;

      while (balance > 0 && monthsWithPrepay < totalMonths) {
        monthsWithPrepay++;
        const interestForMonth = balance * r;
        totalInterestWithPrepay += interestForMonth;
        const principalForMonth = combinedPayment - interestForMonth;
        balance -= principalForMonth;
        if (balance <= 0) break;
      }

      prepaymentSavings = Math.max(0, Math.round(totalInterest - totalInterestWithPrepay));
      monthsSaved = Math.max(0, totalMonths - monthsWithPrepay);
    }

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalPercent,
      interestPercent,
      prepaymentSavings,
      monthsSaved
    };
  }, [P, r, totalMonths, extraPmt]);

  // Year-by-Year Amortization Schedule Data
  const yearlySchedule = useMemo(() => {
    if (P <= 0 || r <= 0 || totalMonths <= 0 || calculations.emi <= 0) return [];

    const schedule = [];
    let currentBalance = P;
    const monthlyEmi = calculations.emi;
    const totalYears = Math.ceil(totalMonths / 12);

    for (let yr = 1; yr <= totalYears; yr++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;
      const openingBalance = currentBalance;

      for (let m = 1; m <= 12; m++) {
        if (currentBalance <= 0) break;
        const interestM = currentBalance * r;
        let principalM = monthlyEmi - interestM;
        if (principalM > currentBalance) {
          principalM = currentBalance;
        }
        yearlyInterest += interestM;
        yearlyPrincipal += principalM;
        currentBalance -= principalM;
      }

      const percentRepaid = Math.min(100, Math.round(((P - Math.max(0, currentBalance)) / P) * 100));

      schedule.push({
        year: yr,
        openingBalance: Math.round(openingBalance),
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        closingBalance: Math.max(0, Math.round(currentBalance)),
        percentRepaid
      });

      if (currentBalance <= 0) break;
    }

    return schedule;
  }, [P, r, totalMonths, calculations.emi]);

  // Load a Blueprint Scenario
  const handleSelectBlueprint = (bp: LoanBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setLoanAmount(bp.amount);
    setInterestRate(bp.rate);
    setTenureYears(bp.tenureYears);
    setTenureType("years");
    setSelectedCurrency(bp.currency);
    setExtraMonthlyPayment("0");
  };

  // Reset to Baseline
  const handleReset = () => {
    setSelectedBlueprintId("");
    setLoanAmount("1000000");
    setInterestRate("8.5");
    setTenureYears("15");
    setTenureType("years");
    setExtraMonthlyPayment("0");
  };

  // Copy Calculation Summary
  const handleCopySummary = () => {
    const summary = `Loan EMI & Repayment Summary:
----------------------------------------
Loan Amount (Principal): ${currSymbol}${P.toLocaleString()}
Interest Rate:           ${annualRate}% p.a.
Loan Tenure:             ${tenureYears} ${tenureType} (${totalMonths} Months)

Monthly Loan EMI:        ${currSymbol}${calculations.emi.toLocaleString()}
Total Interest Payable:  ${currSymbol}${calculations.totalInterest.toLocaleString()} (${calculations.interestPercent}% of total)
Total Repayment Amount:  ${currSymbol}${calculations.totalPayment.toLocaleString()}
${extraPmt > 0 ? `Extra Monthly Payment:   ${currSymbol}${extraPmt.toLocaleString()} (Saves ${currSymbol}${calculations.prepaymentSavings.toLocaleString()} & ${calculations.monthsSaved} months)` : ""}
----------------------------------------
Calculated with Exismic Business & Finance Studio`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Amortization Schedule (.txt)
  const handleDownloadTxt = () => {
    let scheduleText = `Year\tOpening\t\tPrincipal\tInterest\tClosing\t\tRepaid%\n`;
    yearlySchedule.forEach((row) => {
      scheduleText += `Yr ${row.year}\t${currSymbol}${row.openingBalance.toLocaleString()}\t${currSymbol}${row.principalPaid.toLocaleString()}\t${currSymbol}${row.interestPaid.toLocaleString()}\t${currSymbol}${row.closingBalance.toLocaleString()}\t${row.percentRepaid}%\n`;
    });

    const summary = `Loan EMI Amortization Schedule
Generated on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
Currency: ${selectedCurrency}

[LOAN PARAMETERS]
-------------------------------------------------------
Principal Amount:        ${currSymbol}${P.toLocaleString()}
Interest Rate:           ${annualRate}% p.a.
Tenure:                  ${tenureYears} ${tenureType} (${totalMonths} Months)

[PAYMENT SUMMARY]
-------------------------------------------------------
Monthly Loan EMI:        ${currSymbol}${calculations.emi.toLocaleString()}
Total Interest Payable:  ${currSymbol}${calculations.totalInterest.toLocaleString()}
Total Amount Payable:    ${currSymbol}${calculations.totalPayment.toLocaleString()}
Principal Share:         ${calculations.principalPercent}%
Interest Share:          ${calculations.interestPercent}%

[YEAR-BY-YEAR AMORTIZATION SCHEDULE]
-------------------------------------------------------
${scheduleText}

Calculated with Exismic Business & Finance Studio
https://exismic.com/tools/emi-calculator`;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loan-emi-schedule-${P}-${annualRate}pct-${selectedCurrency.toLowerCase()}.txt`;
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
              <Calculator size={13} className="text-orange-400" />
              <span>Business & Finance Studio</span>
            </div>

            {/* Live Monthly EMI Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <CreditCard size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-zinc-300">Monthly EMI:</span>
              <span className="text-sm font-black text-orange-400">
                {currSymbol}{calculations.emi.toLocaleString()}
              </span>
            </div>

            {/* Principal vs Interest Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Percent size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-zinc-300">Split:</span>
              <span className="text-sm font-black text-zinc-300">
                {calculations.principalPercent}% P / <span className="text-orange-400">{calculations.interestPercent}% Int</span>
              </span>
            </div>

            {/* Total Payable Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <TrendingUp size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-zinc-300">Total Payable:</span>
              <span className="text-sm font-black text-white">
                {currSymbol}{calculations.totalPayment.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right: Currency Selector & Quick Actions */}
          <div className="flex items-center gap-3">
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
              <span className="hidden sm:inline">Export Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blueprint Selector Bar (Standard: 6 Blueprints, Preloaded Blueprint #1) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CreditCard size={13} className="text-orange-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Real-World Loan Blueprints & Scenarios
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to pre-fill verified rates & tenures
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {LOAN_BLUEPRINTS.map((bp) => {
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
                    {currSymbol}{parseFloat(bp.amount).toLocaleString()} <span className="text-zinc-500 font-normal">({bp.rate}%)</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs & Controls): 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-6">
            {/* Loan Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Principal Loan Amount
                </label>
                <span className="text-[11px] font-bold text-orange-400">
                  {currSymbol}{P.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-black text-lg">
                  {currSymbol}
                </div>
                <input
                  type="number"
                  min="0"
                  value={loanAmount}
                  onChange={(e) => {
                    setLoanAmount(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  placeholder="e.g. 1000000"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-4 py-3.5 text-xl font-black text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 focus:outline-none transition-all"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Quick Select:</span>
                {[500000, 1000000, 2500000, 5000000, 10000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setLoanAmount(amt.toString());
                      setSelectedBlueprintId("");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      P === amt
                        ? "bg-orange-500/20 border-orange-500 text-orange-400 font-black"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    {currSymbol}{amt >= 10000000 ? `${amt / 10000000} Cr` : amt >= 100000 ? `${amt / 100000} L` : amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate Input & Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Annual Interest Rate (% p.a.)
                </label>
                <span className="text-sm font-black text-orange-400">
                  {annualRate}%
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-500 font-bold">
                  % p.a.
                </div>
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  max="35"
                  value={interestRate}
                  onChange={(e) => {
                    setInterestRate(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  placeholder="e.g. 8.5"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 pl-4 pr-16 py-3.5 text-lg font-black text-white focus:border-orange-500 focus:outline-none transition-all"
                />
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="5"
                max="20"
                step="0.1"
                value={Math.min(20, Math.max(5, annualRate))}
                onChange={(e) => {
                  setInterestRate(e.target.value);
                  setSelectedBlueprintId("");
                }}
                className="w-full h-2 rounded-lg bg-black/60 accent-orange-500 cursor-pointer"
              />

              {/* Common Rate Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {[7.5, 8.5, 9.5, 11.0, 13.5].map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => {
                      setInterestRate(rt.toString());
                      setSelectedBlueprintId("");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      annualRate === rt
                        ? "bg-orange-500/20 border-orange-500 text-orange-400 font-black"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    {rt}%
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Tenure with Years vs Months Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Loan Tenure
                </label>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/60 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setTenureType("years")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                      tenureType === "years" ? "bg-orange-500 text-black font-black" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenureType("months")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                      tenureType === "months" ? "bg-orange-500 text-black font-black" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Months
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={tenureType === "years" ? 40 : 480}
                  value={tenureYears}
                  onChange={(e) => {
                    setTenureYears(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  placeholder={tenureType === "years" ? "e.g. 15" : "e.g. 180"}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3.5 text-lg font-black text-white focus:border-orange-500 focus:outline-none transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400 text-xs font-bold">
                  {totalMonths} total months
                </div>
              </div>

              {/* Quick Tenure Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {[1, 3, 5, 10, 15, 20, 25, 30].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setTenureYears(yr.toString());
                      setTenureType("years");
                      setSelectedBlueprintId("");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      tenureType === "years" && tenureNum === yr
                        ? "bg-orange-500/20 border-orange-500 text-orange-400 font-black"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
            </div>

            {/* Prepayment / Extra Monthly EMI Accordion */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowPrepayment(!showPrepayment)}
                className="w-full flex items-center justify-between py-2 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <PiggyBank size={15} className="text-orange-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-300 group-hover:text-orange-300 transition-colors">
                    Prepayment & Early Payoff Simulator
                  </span>
                </div>
                {showPrepayment ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
              </button>

              {showPrepayment && (
                <div className="p-4 rounded-2xl bg-black/40 border border-orange-500/20 space-y-3 mt-2">
                  <p className="text-[11px] text-zinc-300">
                    See how much interest you save and how many years you shave off your debt by paying extra each month.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                      Extra Monthly Contribution
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 font-black">
                        {currSymbol}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={extraMonthlyPayment}
                        onChange={(e) => setExtraMonthlyPayment(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-white/10 bg-black/60 pl-9 pr-4 py-2.5 text-sm font-black text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {extraPmt > 0 && calculations.prepaymentSavings > 0 && (
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-orange-400">
                          Saves {currSymbol}{calculations.prepaymentSavings.toLocaleString()} in interest!
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Closes loan {Math.floor(calculations.monthsSaved / 12)} years {calculations.monthsSaved % 12} months earlier.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Hero EMI Result & Breakdown): 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hero EMI Card */}
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-b from-orange-950/40 via-black to-black p-6 backdrop-blur-md shadow-2xl shadow-orange-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-orange-400">
                Monthly Loan EMI
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Fixed Repayment
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight pt-1">
              {currSymbol}{calculations.emi.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400">
              For {totalMonths} scheduled monthly payments at {annualRate}% p.a.
            </p>
          </div>

          {/* Visual Ratio Waterfall (Principal vs Total Interest) */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <PieChart size={14} className="text-orange-400" />
                <span>Payment Proportion Split</span>
              </span>
              <span className="text-xs font-bold text-zinc-400">
                Total: {currSymbol}{calculations.totalPayment.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-4 w-full rounded-full bg-zinc-800/80 overflow-hidden flex p-0.5 border border-white/10">
              <div
                style={{ width: `${calculations.principalPercent}%` }}
                className="h-full bg-zinc-400 transition-all duration-300 rounded-l-full relative"
                title={`Principal: ${calculations.principalPercent}%`}
              />
              <div
                style={{ width: `${calculations.interestPercent}%` }}
                className="h-full bg-orange-500 transition-all duration-300 rounded-r-full relative"
                title={`Interest: ${calculations.interestPercent}%`}
              />
            </div>

            {/* Split Legend Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Principal Amount
                  </span>
                </div>
                <p className="text-lg font-black text-white">{currSymbol}{P.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-500">{calculations.principalPercent}% of total payment</p>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Total Interest
                  </span>
                </div>
                <p className="text-lg font-black text-orange-400">{currSymbol}{calculations.totalInterest.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-500">{calculations.interestPercent}% of total payment</p>
              </div>
            </div>
          </div>

          {/* Detailed Financial Ledger */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Loan Repayment Ledger
              </span>
              <span className="text-[11px] font-bold text-orange-400">{totalMonths} Installments</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Principal Borrowed:</span>
                <span className="font-extrabold text-white text-sm">
                  {currSymbol}{P.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Interest Rate:</span>
                <span className="font-bold text-zinc-300">
                  {annualRate}% p.a.
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Total Interest Payable:</span>
                <span className="font-bold text-orange-400">
                  {currSymbol}{calculations.totalInterest.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs py-2 px-3 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                <span className="font-black text-white text-sm">Total Repayment Amount:</span>
                <span className="font-black text-orange-400 text-base">
                  {currSymbol}{calculations.totalPayment.toLocaleString()}
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
                  <span>EMI Summary Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-black" />
                  <span>Copy EMI Summary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Year-by-Year Amortization Schedule Accordion */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl">
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <Table size={16} className="text-orange-400" />
            <div>
              <span className="text-sm font-black text-white group-hover:text-orange-300 transition-colors">
                Year-by-Year Loan Amortization Schedule
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Inspect annual principal reduction, interest breakdown, and remaining loan balance
              </p>
            </div>
          </div>
          {showSchedule ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
        </button>

        {showSchedule && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Opening Balance</th>
                  <th className="py-2.5 px-3">Principal Paid</th>
                  <th className="py-2.5 px-3">Interest Paid</th>
                  <th className="py-2.5 px-3">Closing Balance</th>
                  <th className="py-2.5 px-3 text-right">Repaid %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-black text-orange-400">Year {row.year}</td>
                    <td className="py-3 px-3 text-zinc-300">{currSymbol}{row.openingBalance.toLocaleString()}</td>
                    <td className="py-3 px-3 font-bold text-white">{currSymbol}{row.principalPaid.toLocaleString()}</td>
                    <td className="py-3 px-3 text-amber-400">{currSymbol}{row.interestPaid.toLocaleString()}</td>
                    <td className="py-3 px-3 font-medium text-zinc-300">{currSymbol}{row.closingBalance.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-black text-orange-400">{row.percentRepaid}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="emi-calculator"
        toolName="Loan EMI Calculator"
        title={`Loan EMI: ${currSymbol}${calculations.emi.toLocaleString()}/mo on ${currSymbol}${P.toLocaleString()}`}
        content={`Loan EMI Calculation Summary:
Principal: ${currSymbol}${P}
Interest Rate: ${annualRate}% p.a.
Tenure: ${tenureYears} ${tenureType}
Monthly EMI: ${currSymbol}${calculations.emi}
Total Interest: ${currSymbol}${calculations.totalInterest}
Total Payable: ${currSymbol}${calculations.totalPayment}`}
        downloadLabel="Download Amortization (.txt)"
        downloadAction={handleDownloadTxt}
        onCopy={handleCopySummary}
      />

      {/* Chained Companion Tools in Business & Finance */}
      <ToolWorkflowChaining
        currentToolId="emi-calculator"
        categoryId="business"
        outputContent={`Monthly EMI: ${currSymbol}${calculations.emi}, Total Interest: ${currSymbol}${calculations.totalInterest}`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="emi-calculator"
        categoryId="business"
        outputContent={`Monthly EMI: ${currSymbol}${calculations.emi}, Total Interest: ${currSymbol}${calculations.totalInterest}`}
      />
    </div>
  );
}
