"use client";

import React, { useState, useMemo } from "react";
import { 
  FileSpreadsheet, 
  IndianRupee, 
  Copy, 
  CheckCircle2, 
  Scale, 
  TrendingUp,
  Download,
  RotateCcw,
  Tag,
  ShieldCheck,
  Zap,
  Briefcase,
  PieChart,
  Sliders,
  HelpCircle,
  ArrowRight,
  Info,
  Check,
  GraduationCap,
  Laptop,
  Flame,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// 6 Real-World Indian Salary Blueprints (Preloaded with Blueprint #1, Zero Empty Voids)
export interface SalaryBlueprint {
  id: string;
  title: string;
  role: string;
  ctc: string;
  regime: "new" | "old";
  description: string;
}

export const SALARY_BLUEPRINTS: SalaryBlueprint[] = [
  {
    id: "tech-mid-12lpa",
    title: "12 LPA Mid Software Engineer",
    role: "Engineering",
    ctc: "1200000",
    regime: "new",
    description: "Standard 3-5 years tech compensation with ₹75k standard deduction."
  },
  {
    id: "tech-senior-25lpa",
    title: "25 LPA Senior SDE / Lead",
    role: "Senior Tech",
    ctc: "2500000",
    regime: "new",
    description: "Senior engineering compensation spanning higher tax brackets."
  },
  {
    id: "tech-staff-45lpa",
    title: "45 LPA Staff Architect / Exec",
    role: "Leadership",
    ctc: "4500000",
    regime: "new",
    description: "Executive tech package with high take-home and EPF benefits."
  },
  {
    id: "entry-grad-6lpa",
    title: "6 LPA Fresher / Junior Dev",
    role: "Entry-Level",
    ctc: "600000",
    regime: "new",
    description: "Entry-level starter package (100% tax-free under Section 87A!)."
  },
  {
    id: "growth-marketer-8.5lpa",
    title: "8.5 LPA Growth Marketer",
    role: "Marketing",
    ctc: "850000",
    regime: "new",
    description: "Digital marketing or sales role with base and variable components."
  },
  {
    id: "senior-pm-18lpa",
    title: "18 LPA Senior Product Manager",
    role: "Product",
    ctc: "1800000",
    regime: "new",
    description: "Product owner or management salary structure with corporate perks."
  }
];

export default function SalaryCalculator() {
  // Selected Blueprint
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("tech-mid-12lpa");

  // Inputs
  const [ctc, setCtc] = useState<string>(SALARY_BLUEPRINTS[0].ctc);
  const [regime, setRegime] = useState<"new" | "old">("new");
  const [epfMode, setEpfMode] = useState<"standard" | "actual">("standard"); // standard = capped at ₹1,800/mo (₹21,600/yr); actual = 12% of basic
  
  // Old Regime Deductions (Optional)
  const [deduction80C, setDeduction80C] = useState<string>("150000"); // Max ₹1.5L
  const [deduction80D, setDeduction80D] = useState<string>("25000");  // Max ₹25k
  const [annualHra, setAnnualHra] = useState<string>("100000");

  const [copied, setCopied] = useState<boolean>(false);

  const numCtc = parseFloat(ctc) || 0;
  const num80C = Math.min(150000, parseFloat(deduction80C) || 0);
  const num80D = Math.min(50000, parseFloat(deduction80D) || 0);
  const numHraExemption = parseFloat(annualHra) || 0;

  // Real-time Salary & Tax Calculations
  const calculations = useMemo(() => {
    // 1. Standard Payslip Components
    const basic = numCtc * 0.50; // 50% Basic Salary
    const hra = numCtc * 0.20;   // 20% House Rent Allowance
    const specialAllowance = Math.max(0, numCtc - basic - hra);

    // 2. Provident Fund (EPF)
    const annualPf = epfMode === "standard" 
      ? Math.min(21600, basic * 0.12) 
      : basic * 0.12;
    const monthlyPf = Math.round(annualPf / 12);

    // 3. Professional Tax (Fixed in India ~ ₹200/mo = ₹2,400/yr)
    const annualPt = numCtc > 300000 ? 2400 : 0;
    const monthlyPt = Math.round(annualPt / 12);

    // 4. TAX CALCULATION: NEW REGIME (Budget 2024-25 Revised Slabs)
    const standardDeductionNew = 75000;
    let taxableNew = Math.max(0, numCtc - standardDeductionNew);
    let taxNew = 0;

    if (numCtc <= 775000) {
      // Full rebate under Section 87A up to ₹7L taxable (₹7.75L CTC with ₹75k standard deduction)
      taxNew = 0;
    } else {
      let temp = taxableNew;
      if (temp > 1500000) {
        taxNew += (temp - 1500000) * 0.30;
        temp = 1500000;
      }
      if (temp > 1200000) {
        taxNew += (temp - 1200000) * 0.20;
        temp = 1200000;
      }
      if (temp > 1000000) {
        taxNew += (temp - 1000000) * 0.15;
        temp = 1000000;
      }
      if (temp > 700000) {
        taxNew += (temp - 700000) * 0.10;
        temp = 700000;
      }
      if (temp > 300000) {
        taxNew += (temp - 300000) * 0.05;
      }
    }
    const totalTaxNew = Math.round(taxNew * 1.04); // 4% Health & Edu Cess

    // 5. TAX CALCULATION: OLD REGIME
    const standardDeductionOld = 50000;
    const totalOldDeductions = standardDeductionOld + num80C + num80D + numHraExemption;
    let taxableOld = Math.max(0, numCtc - totalOldDeductions);
    let taxOld = 0;

    if (taxableOld <= 500000) {
      taxOld = 0; // Section 87A rebate under old regime
    } else {
      let tempOld = taxableOld;
      if (tempOld > 1000000) {
        taxOld += (tempOld - 1000000) * 0.30;
        tempOld = 1000000;
      }
      if (tempOld > 500000) {
        taxOld += (tempOld - 500000) * 0.20;
        tempOld = 500000;
      }
      if (tempOld > 250000) {
        taxOld += (tempOld - 250000) * 0.05;
      }
    }
    const totalTaxOld = Math.round(taxOld * 1.04);

    // Active Regime Application
    const activeTotalTax = regime === "new" ? totalTaxNew : totalTaxOld;
    const monthlyTax = Math.round(activeTotalTax / 12);

    // In-Hand Take-Home
    const annualInHand = Math.max(0, numCtc - annualPf - annualPt - activeTotalTax);
    const monthlyInHand = Math.round(annualInHand / 12);

    // Percent Shares for Visual Allocation Bar
    const inHandSharePercent = numCtc > 0 ? (annualInHand / numCtc) * 100 : 0;
    const pfSharePercent = numCtc > 0 ? (annualPf / numCtc) * 100 : 0;
    const taxSharePercent = numCtc > 0 ? (activeTotalTax / numCtc) * 100 : 0;

    // Regime Comparison Savings
    const taxSavingsWithNew = totalTaxOld - totalTaxNew;

    return {
      basic: Math.round(basic),
      hra: Math.round(hra),
      specialAllowance: Math.round(specialAllowance),
      monthlyBasic: Math.round(basic / 12),
      monthlyHra: Math.round(hra / 12),
      monthlySpecialAllowance: Math.round(specialAllowance / 12),
      monthlyGross: Math.round(numCtc / 12),
      annualPf: Math.round(annualPf),
      monthlyPf,
      annualPt,
      monthlyPt,
      annualTax: activeTotalTax,
      monthlyTax,
      annualInHand: Math.round(annualInHand),
      monthlyInHand,
      inHandSharePercent: Math.round(inHandSharePercent * 10) / 10,
      pfSharePercent: Math.round(pfSharePercent * 10) / 10,
      taxSharePercent: Math.round(taxSharePercent * 10) / 10,
      totalTaxNew,
      totalTaxOld,
      taxSavingsWithNew
    };
  }, [numCtc, regime, epfMode, num80C, num80D, numHraExemption]);

  // Load a Blueprint Scenario
  const handleSelectBlueprint = (bp: SalaryBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setCtc(bp.ctc);
    setRegime(bp.regime);
  };

  // Reset to Baseline
  const handleReset = () => {
    setSelectedBlueprintId("");
    setCtc("1200000");
    setRegime("new");
    setEpfMode("standard");
  };

  // Copy Calculation Summary
  const handleCopySummary = () => {
    const summary = `In-Hand Salary Breakdown (CTC ₹${numCtc.toLocaleString("en-IN")}):
----------------------------------------
Annual CTC Package:          ₹${numCtc.toLocaleString("en-IN")}
Tax Regime:                  ${regime === "new" ? "New Tax Regime (FY 2024-25)" : "Old Tax Regime"}

Monthly Gross Salary:        ₹${calculations.monthlyGross.toLocaleString("en-IN")}
- Basic Salary (50%):        ₹${calculations.monthlyBasic.toLocaleString("en-IN")}
- HRA (20%):                 ₹${calculations.monthlyHra.toLocaleString("en-IN")}
- Special Allowance:         ₹${calculations.monthlySpecialAllowance.toLocaleString("en-IN")}

Monthly Deductions:
- Employee EPF (12%):        ₹${calculations.monthlyPf.toLocaleString("en-IN")}
- Professional Tax (PT):     ₹${calculations.monthlyPt.toLocaleString("en-IN")}
- Income Tax (TDS):          ₹${calculations.monthlyTax.toLocaleString("en-IN")}
----------------------------------------
Net Monthly In-Hand Pay:     ₹${calculations.monthlyInHand.toLocaleString("en-IN")}
Net Annual Take-Home Pay:    ₹${calculations.annualInHand.toLocaleString("en-IN")}
Calculated with Exismic Business & Finance Studio`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Salary Sheet (.txt)
  const handleDownloadTxt = () => {
    const summary = `In-Hand Salary & Payslip Breakdown
Generated on: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
Platform: Exismic Business & Finance Studio

[ANNUAL COMPENSATION SUMMARY]
-------------------------------------------------------
Total Annual CTC Package:    ₹${numCtc.toLocaleString("en-IN")}
Applicable Tax Regime:       ${regime === "new" ? "New Tax Regime (Budget 2024 Revised Slabs)" : "Old Tax Regime"}
Annual Standard Deduction:   ${regime === "new" ? "₹75,000" : "₹50,000"}

[MONTHLY PAYSLIP BREAKDOWN]
-------------------------------------------------------
Gross Monthly Salary:        ₹${calculations.monthlyGross.toLocaleString("en-IN")}
- Basic Salary (50%):        ₹${calculations.monthlyBasic.toLocaleString("en-IN")}
- House Rent Allowance (20%):₹${calculations.monthlyHra.toLocaleString("en-IN")}
- Special Allowance:         ₹${calculations.monthlySpecialAllowance.toLocaleString("en-IN")}

[MONTHLY STATUTORY DEDUCTIONS]
-------------------------------------------------------
- Employee Provident Fund:   ₹${calculations.monthlyPf.toLocaleString("en-IN")}
- Professional Tax (PT):     ₹${calculations.monthlyPt.toLocaleString("en-IN")}
- Income Tax TDS:            ₹${calculations.monthlyTax.toLocaleString("en-IN")}
Total Monthly Deductions:    ₹${(calculations.monthlyPf + calculations.monthlyPt + calculations.monthlyTax).toLocaleString("en-IN")}

[FINAL TAKE-HOME EARNINGS]
-------------------------------------------------------
Net In-Hand Monthly Pay:     ₹${calculations.monthlyInHand.toLocaleString("en-IN")}
Net Annual Take-Home Pay:    ₹${calculations.annualInHand.toLocaleString("en-IN")}
Effective Take-Home Rate:    ${calculations.inHandSharePercent}% of CTC

https://exismic.com/tools/salary-calculator`;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-in-hand-${numCtc}-ctc.txt`;
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
              <IndianRupee size={13} className="text-orange-400" />
              <span>Business & Finance Studio</span>
            </div>

            {/* Live Monthly In-Hand Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Briefcase size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-zinc-300">Monthly In-Hand:</span>
              <span className="text-sm font-black text-orange-400">
                ₹{calculations.monthlyInHand.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Live Effective Tax Rate Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Scale size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-zinc-300">Effective Tax:</span>
              <span className="text-sm font-black text-amber-400">
                {calculations.taxSharePercent}% (₹{calculations.monthlyTax.toLocaleString("en-IN")}/mo)
              </span>
            </div>

            {/* Take-Home % Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <TrendingUp size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-zinc-300">Take-Home:</span>
              <span className="text-sm font-black text-white">
                {calculations.inHandSharePercent}% of CTC
              </span>
            </div>
          </div>

          {/* Right: Reset & Export Actions */}
          <div className="flex items-center gap-3">
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
              <span className="hidden sm:inline">Export Payslip</span>
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
              Real-World CTC Blueprints & Career Packages
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any career blueprint to load verified compensation figures
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SALARY_BLUEPRINTS.map((bp) => {
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
                    <IndianRupee size={14} />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                    {bp.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                    ₹{parseInt(bp.ctc, 10) >= 10000000 ? `${parseInt(bp.ctc, 10) / 10000000} Cr` : `${parseInt(bp.ctc, 10) / 100000} LPA`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs & Regime Selector): 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-6">
            {/* CTC Package Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Annual Cost to Company (CTC) Package
                </label>
                <span className="text-xs font-black text-orange-400">
                  ₹{numCtc.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-black text-xl">
                  ₹
                </div>
                <input
                  type="number"
                  min="0"
                  value={ctc}
                  onChange={(e) => {
                    setCtc(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  placeholder="e.g. 1200000"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-4 py-4 text-xl font-black text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 focus:outline-none transition-all"
                />
              </div>

              {/* Quick LPA Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Quick Select:</span>
                {[600000, 850000, 1200000, 1800000, 2500000, 4500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setCtc(amt.toString());
                      setSelectedBlueprintId("");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                      numCtc === amt
                        ? "bg-orange-500/20 border-orange-500 text-orange-400 font-black"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    )}
                  >
                    ₹{amt / 100000} LPA
                  </button>
                ))}
              </div>
            </div>

            {/* Income Tax Regime Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Income Tax Regime
                </label>
                <span className="text-[11px] text-zinc-400">Budget 2024 Slabs</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegime("new")}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative",
                    regime === "new"
                      ? "bg-orange-500/15 border-orange-500/60 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/40"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20 text-zinc-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">New Tax Regime</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-orange-500 text-black">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    ₹75,000 standard deduction + zero tax up to ₹7.75 Lakhs under 87A rebate.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRegime("old")}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                    regime === "old"
                      ? "bg-orange-500/15 border-orange-500/60 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/40"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20 text-zinc-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">Old Tax Regime</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Allows Section 80C, 80D health, and HRA rent deductions.
                  </p>
                </button>
              </div>

              {/* Dynamic Regime Comparison Banner */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale size={15} className="text-orange-400 shrink-0" />
                  <p className="text-xs text-zinc-300">
                    {calculations.taxSavingsWithNew > 0 ? (
                      <span>New Regime saves you <strong className="text-orange-400">₹{calculations.taxSavingsWithNew.toLocaleString("en-IN")}</strong> more in annual tax!</span>
                    ) : calculations.taxSavingsWithNew < 0 ? (
                      <span>Old Regime saves you <strong className="text-amber-400">₹{Math.abs(calculations.taxSavingsWithNew).toLocaleString("en-IN")}</strong> with your current deductions.</span>
                    ) : (
                      <span>Both regimes result in the exact same tax for this income level.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Old Regime Exemptions Box (Conditional) */}
            {regime === "old" && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                  Old Regime Tax Deductions
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Section 80C (Max ₹1.5L)</label>
                    <input
                      type="number"
                      max="150000"
                      value={deduction80C}
                      onChange={(e) => setDeduction80C(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Section 80D (Health)</label>
                    <input
                      type="number"
                      max="50000"
                      value={deduction80D}
                      onChange={(e) => setDeduction80D(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Annual HRA Exemption</label>
                    <input
                      type="number"
                      value={annualHra}
                      onChange={(e) => setAnnualHra(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-bold text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EPF Deduction Option */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-bold text-zinc-300">Employee Provident Fund (EPF)</p>
                <p className="text-[11px] text-zinc-500">Government statutory retirement savings</p>
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/60 border border-white/10">
                <button
                  type="button"
                  onClick={() => setEpfMode("standard")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    epfMode === "standard" ? "bg-orange-500 text-black font-black" : "text-zinc-400 hover:text-white"
                  )}
                  title="Capped at statutory minimum ₹1,800/mo"
                >
                  Standard Cap (₹1.8k/mo)
                </button>
                <button
                  type="button"
                  onClick={() => setEpfMode("actual")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
                    epfMode === "actual" ? "bg-orange-500 text-black font-black" : "text-zinc-400 hover:text-white"
                  )}
                  title="Full 12% of actual basic salary"
                >
                  Full 12% Basic
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Hero Take-Home Result & Payslip Ledger): 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hero Monthly Take-Home Card */}
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-b from-orange-950/40 via-black to-black p-6 backdrop-blur-md shadow-2xl shadow-orange-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-orange-400">
                Monthly In-Hand Take-Home
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Cash in Bank
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight pt-1">
              ₹{calculations.monthlyInHand.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-zinc-400">Annual Take-Home:</span>
              <span className="font-bold text-white">₹{calculations.annualInHand.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Visual Income Allocation Bar */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <PieChart size={14} className="text-orange-400" />
                <span>CTC Package Allocation</span>
              </span>
              <span className="text-xs font-bold text-zinc-400">
                Total: ₹{numCtc.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-4 w-full rounded-full bg-zinc-800/80 overflow-hidden flex p-0.5 border border-white/10">
              <div
                style={{ width: `${calculations.inHandSharePercent}%` }}
                className="h-full bg-orange-500 transition-all duration-300 rounded-l-full relative"
                title={`In-Hand Pay: ${calculations.inHandSharePercent}%`}
              />
              <div
                style={{ width: `${calculations.pfSharePercent}%` }}
                className="h-full bg-amber-500 transition-all duration-300 relative"
                title={`EPF Savings: ${calculations.pfSharePercent}%`}
              />
              <div
                style={{ width: `${calculations.taxSharePercent}%` }}
                className="h-full bg-zinc-600 transition-all duration-300 rounded-r-full relative"
                title={`Income Tax: ${calculations.taxSharePercent}%`}
              />
            </div>

            {/* Legend Tiles */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  <span className="text-[10px] font-bold text-zinc-400">In-Hand</span>
                </div>
                <p className="text-xs font-black text-orange-400">{calculations.inHandSharePercent}%</p>
                <p className="text-[10px] text-zinc-400">₹{calculations.annualInHand.toLocaleString("en-IN")}</p>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span className="text-[10px] font-bold text-zinc-400">EPF Fund</span>
                </div>
                <p className="text-xs font-black text-amber-400">{calculations.pfSharePercent}%</p>
                <p className="text-[10px] text-zinc-400">₹{calculations.annualPf.toLocaleString("en-IN")}</p>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
                  <span className="text-[10px] font-bold text-zinc-400">TDS Tax</span>
                </div>
                <p className="text-xs font-black text-white">{calculations.taxSharePercent}%</p>
                <p className="text-[10px] text-zinc-400">₹{calculations.annualTax.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>

          {/* Detailed Monthly Payslip Ledger */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Monthly Payslip Ledger
              </span>
              <span className="text-[11px] font-bold text-orange-400">Monthly View</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Gross Monthly Salary (CTC / 12):</span>
                <span className="font-extrabold text-white">
                  ₹{calculations.monthlyGross.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pl-3 border-l-2 border-white/10 text-zinc-400">
                <span>Basic Salary (50%):</span>
                <span className="font-medium text-zinc-300">₹{calculations.monthlyBasic.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center text-xs pl-3 border-l-2 border-white/10 text-zinc-400">
                <span>House Rent Allowance (HRA 20%):</span>
                <span className="font-medium text-zinc-300">₹{calculations.monthlyHra.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center text-xs pl-3 border-l-2 border-white/10 text-zinc-400">
                <span>Special Allowance:</span>
                <span className="font-medium text-zinc-300">₹{calculations.monthlySpecialAllowance.toLocaleString("en-IN")}</span>
              </div>

              {/* Deductions Header */}
              <div className="pt-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Monthly Deductions
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Employee EPF Deduction:</span>
                <span className="font-bold text-amber-400">- ₹{calculations.monthlyPf.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Professional Tax (PT):</span>
                <span className="font-bold text-zinc-300">- ₹{calculations.monthlyPt.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Income Tax (TDS Deduction):</span>
                <span className="font-bold text-orange-400">- ₹{calculations.monthlyTax.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center text-xs py-2 px-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 mt-2">
                <span className="font-black text-white text-sm">Net Monthly In-Hand:</span>
                <span className="font-black text-orange-400 text-base">
                  ₹{calculations.monthlyInHand.toLocaleString("en-IN")}
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
                  <span>Salary Summary Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-black" />
                  <span>Copy Salary Summary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="salary-calculator"
        toolName="Salary & Take-Home Calculator"
        title={`Take-Home Salary: ₹${calculations.monthlyInHand.toLocaleString("en-IN")}/mo on ₹${numCtc.toLocaleString("en-IN")} CTC`}
        content={`Salary & In-Hand Breakdown:
CTC: ₹${numCtc}
Regime: ${regime.toUpperCase()}
Monthly In-Hand: ₹${calculations.monthlyInHand}
Annual In-Hand: ₹${calculations.annualInHand}
Monthly Tax: ₹${calculations.monthlyTax}
Monthly EPF: ₹${calculations.monthlyPf}`}
        downloadLabel="Download Payslip (.txt)"
        downloadAction={handleDownloadTxt}
        onCopy={handleCopySummary}
      />

      {/* Chained Companion Tools in Business & Finance */}
      <ToolWorkflowChaining
        currentToolId="salary-calculator"
        categoryId="business"
        outputContent={`In-Hand Pay: ₹${calculations.monthlyInHand}/mo on ₹${numCtc} CTC`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="salary-calculator"
        categoryId="business"
        outputContent={`In-Hand Pay: ₹${calculations.monthlyInHand}/mo on ₹${numCtc} CTC`}
      />
    </div>
  );
}
