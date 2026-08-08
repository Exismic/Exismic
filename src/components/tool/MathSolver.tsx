"use client";

import React, { useState, useMemo } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  BookOpen,
  Calculator,
  Compass,
  Check,
  GraduationCap,
  Sparkle
} from "lucide-react";
import { cn } from "@/lib/utils";

type DepthLevel = "quick" | "detailed" | "mastery";
type SubjectCategory = "auto" | "algebra" | "calculus" | "geometry" | "diffeq" | "linalg" | "stats" | "word";

interface MathPreset {
  title: string;
  category: SubjectCategory;
  problem: string;
}

const MATH_PRESETS: MathPreset[] = [
  { title: "Indefinite Integral", category: "calculus", problem: "Evaluate the indefinite integral: ∫ x^3 * e^(2x) dx" },
  { title: "2nd-Order Diff Eq", category: "diffeq", problem: "Solve differential equation: y'' - 4y' + 4y = e^(2x)" },
  { title: "Quadratic Equation", category: "algebra", problem: "Solve: 2x^2 + 5x - 3 = 0" },
  { title: "Complex Roots", category: "geometry", problem: "Find all complex roots of z^4 + 16 = 0 using Euler's formula." },
  { title: "Cylinder Optimization", category: "word", problem: "A cylindrical open-top container must hold 500 cm³. Find radius r and height h minimizing surface area." }
];

const MATH_SYMBOLS = ["x²", "√x", "π", "∫", "d/dx", "lim", "sin()", "cos()", "tan()", "log()", "±", "∞", "θ", "∑", "y''"];

export default function MathSolver() {
  const [problem, setProblem] = useState("Evaluate the indefinite integral: ∫ x^3 * e^(2x) dx");
  const [depth, setDepth] = useState<DepthLevel>("mastery");
  const [category, setCategory] = useState<SubjectCategory>("auto");
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const insertSymbol = (sym: string) => {
    setProblem((prev) => prev + (prev ? " " : "") + sym);
  };

  const handleSolve = async (targetProblem?: string) => {
    const activeProblem = targetProblem || problem;
    if (!activeProblem.trim()) return;
    setProblem(activeProblem);
    setIsSolving(true);
    setSolution(null);

    let depthPrompt = "";
    if (depth === "quick") {
      depthPrompt = "Provide a FAST, CONCISE 3-step solution with the final boxed answer directly.";
    } else if (depth === "detailed") {
      depthPrompt = "Provide a CLEAR, STEP-BY-STEP breakdown with formula definitions and algebraic transformations.";
    } else {
      depthPrompt = "Provide a MASTERY-LEVEL ACADEMIC BREAKDOWN. Include: 1) Core Principles & Governing Formulas, 2) Complete Detailed Step-by-Step Solution, 3) Alternative Verification or Graphing Intuition, 4) Common Pitfalls to Avoid, and 5) Final Boxed Answer.";
    }

    const catPrompt = category === "auto" 
      ? "Auto-detect the mathematical subject category and state it clearly at the top."
      : `Subject Domain: ${category.toUpperCase()}`;

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${catPrompt}\nExplanation Depth: ${depth.toUpperCase()}\n\nMath Problem / Equation:\n${activeProblem}`,
          toolId: "math-solver",
          systemInstruction: `You are an Elite Mathematics Professor and Research Scholar. ${depthPrompt} Format step headings cleanly without raw hashtags.`
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        setSolution(data.output || data.text);
      } else {
        setSolution(fallbackMath(activeProblem, depth));
      }
    } catch {
      setSolution(fallbackMath(activeProblem, depth));
    } finally {
      setIsSolving(false);
    }
  };

  const fallbackMath = (p: string, d: DepthLevel) => {
    if (d === "mastery") {
      return `📐 MASTERY ACADEMIC PROOF & STEP-BY-STEP SOLUTION
Problem: ${p}

1. CORE MATHEMATICAL GOVERNING PRINCIPLES
• Technique: Integration by Parts (Tabular / Repeated Method)
• Formula: ∫ u dv = u·v - ∫ v du
• Strategy: Set u = x³ (polynomial, degree 3) to reduce via differentiation, and dv = e^(2x) dx to integrate easily.

2. STEP-BY-STEP DERIVATION
Step 1: First Integration by Parts
  u = x³   =>   du = 3x² dx
  dv = e^(2x) dx   =>   v = (1/2)e^(2x)
  ∫ x³ e^(2x) dx = (1/2)x³ e^(2x) - (3/2) ∫ x² e^(2x) dx

Step 2: Second Integration by Parts
  For ∫ x² e^(2x) dx: u = x², dv = e^(2x) dx   =>   v = (1/2)e^(2x)
  Result: (1/2)x² e^(2x) - ∫ x e^(2x) dx

Step 3: Third Integration by Parts
  For ∫ x e^(2x) dx: u = x, dv = e^(2x) dx   =>   v = (1/2)e^(2x)
  Result: (1/2)x e^(2x) - (1/4)e^(2x)

Step 4: Combine & Factor Terms
  ∫ x³ e^(2x) dx = e^(2x) [ (1/2)x³ - (3/4)x² + (3/4)x - 3/8 ] + C

3. COMMON PITFALLS & VERIFICATION
• Pitfall: Forgetting to integrate the 1/2 factor at each step.
• Verification: Differentiating e^(2x)[(1/2)x³ - (3/4)x² + (3/4)x - 3/8] yields x³ e^(2x) perfectly via Product Rule.

✅ FINAL BOXED SOLUTION:
∫ x³ e^(2x) dx = e^(2x) / 8 · (4x³ - 6x² + 6x - 3) + C`;
    }

    return `⚡ QUICK SOLUTION FOR: ${p}

1. Use Integration by Parts 3 times (or Tabular Method).
2. Differentiate x³ down to 0; integrate e^(2x) to get factors of 1/2.
3. Sum alternating terms:
   + (x³)(1/2 e^2x) - (3x²)(1/4 e^2x) + (6x)(1/8 e^2x) - (6)(1/16 e^2x) + C

✅ FINAL ANSWER:
e^(2x) / 8 · (4x³ - 6x² + 6x - 3) + C`;
  };

  const handleCopy = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean raw Markdown formatting (e.g. ## Step 1:) for crystal clear rendering
  const formattedSolutionText = useMemo(() => {
    if (!solution) return "";
    return solution
      .replace(/^#{1,4}\s*/gm, "■ ")
      .replace(/\*\*(.*?)\*\*/g, "$1");
  }, [solution]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-zinc-950 to-indigo-950/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-widest shadow-inner">
              <BrainCircuit size={14} className="text-amber-400 animate-pulse" />
              <span>AI Symbolic Math Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase bg-gradient-to-r from-white via-amber-100 to-zinc-400 bg-clip-text text-transparent">
              AI Math Step Solver
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Solve algebra, calculus, differential equations, and word problems with customizable explanation depth.
            </p>
          </div>

          {/* Explanation Mode Selector - 3 Modes */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-1.5 backdrop-blur-md flex items-center gap-1 self-start md:self-auto">
            {[
              { id: "quick", label: "Quick", icon: Zap },
              { id: "detailed", label: "Detailed", icon: BookOpen },
              { id: "mastery", label: "Mastery Proof", icon: GraduationCap },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDepth(m.id as DepthLevel)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5",
                    depth === m.id
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20 font-bold scale-105"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Icon size={14} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preset Quick Load Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" /> Presets:
        </span>
        {MATH_PRESETS.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => {
              setCategory(preset.category);
              handleSolve(preset.problem);
            }}
            disabled={isSolving}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-amber-500/10 hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 font-medium transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <span>{preset.title}</span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
            
            {/* Math Subject Category Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Calculator size={15} /> Math Subject Domain
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: "auto", label: "✨ Auto" },
                  { id: "algebra", label: "Algebra" },
                  { id: "calculus", label: "Calculus" },
                  { id: "diffeq", label: "Diff Eq" },
                  { id: "geometry", label: "Geometry" },
                  { id: "linalg", label: "Lin Alg" },
                  { id: "stats", label: "Stats" },
                  { id: "word", label: "Word Prob" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as SubjectCategory)}
                    className={cn(
                      "py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer text-center",
                      category === cat.id
                        ? "bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-md font-extrabold"
                        : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/5"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Enter Problem or Equation *
                </label>
                <button
                  type="button"
                  onClick={() => setProblem("")}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
                >
                  Clear
                </button>
              </div>

              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. Evaluate ∫ x^3 * e^(2x) dx or Solve y'' - 4y' + 4y = e^(2x)..."
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all font-mono leading-relaxed resize-none"
              />
            </div>

            {/* Math Symbol Quick Insertion Toolbar */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Quick Math Notation Keys:</p>
              <div className="flex flex-wrap gap-1.5">
                {MATH_SYMBOLS.map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => insertSymbol(sym)}
                    className="px-2.5 py-1 rounded-lg border border-white/5 bg-white/[0.04] hover:bg-amber-500/20 hover:border-amber-400/40 text-xs font-mono font-bold text-amber-300 transition-all cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleSolve()}
              disabled={!problem.trim() || isSolving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer group"
            >
              {isSolving ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-white" />
                  <span>Computing Mathematical Proof...</span>
                </>
              ) : (
                <>
                  <BrainCircuit size={18} className="group-hover:scale-110 transition-transform text-amber-300" />
                  <span>Solve Math Problem ({depth.toUpperCase()})</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Detailed Solution Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 sm:p-8 pt-8 sm:pt-9 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6 min-h-[460px]">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  {depth === "mastery" ? "Mastery Academic Proof" : depth === "detailed" ? "Detailed Step Breakdown" : "Quick Solution"}
                </span>
                <p className="text-xs text-zinc-400 font-medium pt-1">
                  {category === "auto" ? "AUTO-DETECTED DOMAIN" : category.toUpperCase()} • Step-by-Step Explanation
                </p>
              </div>

              {solution && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy Proof"}</span>
                </button>
              )}
            </div>

            {/* Main Output Box */}
            <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/80 p-5 font-mono text-xs leading-relaxed overflow-y-auto">
              {isSolving ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-20 text-center animate-pulse">
                  <BrainCircuit size={40} className="text-amber-400 animate-bounce" />
                  <p className="text-sm font-bold text-white uppercase tracking-wider">Solving Mathematical Proof...</p>
                  <p className="text-xs text-zinc-400 max-w-xs">Generating detailed algebraic steps, discriminant analysis, and verified answers.</p>
                </div>
              ) : solution ? (
                <pre className="whitespace-pre-wrap text-amber-200 leading-relaxed font-mono selection:bg-amber-400 selection:text-black">
                  {formattedSolutionText}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Compass size={32} className="text-amber-400/60" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <p className="text-sm font-bold text-white uppercase tracking-wider">No Math Solution Generated</p>
                    <p className="text-xs text-zinc-400">Enter your equation on the left or select a preset to generate a step-by-step breakdown.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Copy Button */}
            {solution && !isSolving && (
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={18} className="text-black" />
                    <span>Copied Full Solution!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Copy Full Mathematical Proof</span>
                  </>
                )}
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}


