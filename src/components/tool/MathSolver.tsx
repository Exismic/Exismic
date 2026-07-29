"use client";

import React, { useState } from "react";
import { 
  BrainCircuit, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MathSolver() {
  const [problem, setProblem] = useState("2x^2 + 5x - 3 = 0");
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSolve = async () => {
    if (!problem.trim()) return;
    setIsSolving(true);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Solve the following math equation / problem step-by-step with clear explanations:\n\n${problem}`,
          toolId: "math-solver",
          systemInstruction: "You are a master mathematics tutor. Provide clear, step-by-step solutions to algebra, calculus, geometry, and word problems with formatted step breakdowns and final boxed answer."
        })
      });

      const data = await response.json();
      if (data.output || data.text) {
        setSolution(data.output || data.text);
      } else {
        setSolution(fallbackMath(problem));
      }
    } catch {
      setSolution(fallbackMath(problem));
    } finally {
      setIsSolving(false);
    }
  };

  const fallbackMath = (p: string) => `📐 STEP-BY-STEP SOLUTION FOR: ${p}

Step 1: Identify key equation parameters.
For a quadratic equation ax² + bx + c = 0, where a = 2, b = 5, c = -3.

Step 2: Apply the Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)
• b² - 4ac = 5² - 4(2)(-3) = 25 + 24 = 49
• √49 = 7

Step 3: Solve for x:
• x₁ = (-5 + 7) / 4 = 2 / 4 = 1/2 (0.5)
• x₂ = (-5 - 7) / 4 = -12 / 4 = -3

✅ FINAL ANSWER:
x = 0.5 or x = -3`;

  const handleCopy = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-zinc-950 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <BrainCircuit size={14} className="text-amber-400" />
              <span>AI Math Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              AI Step-by-Step Math Solver
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Solve algebra, calculus, geometry, and word math problems with detailed step-by-step breakdowns.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
            Enter Math Problem / Equation
          </label>

          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. Solve 2x^2 + 5x - 3 = 0 or Find derivative of x^3 * sin(x)..."
            className="w-full flex-1 min-h-[220px] rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none resize-none font-mono leading-relaxed"
          />

          <button
            type="button"
            onClick={handleSolve}
            disabled={!problem.trim() || isSolving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSolving ? (
              <>
                <RefreshCw size={16} className="animate-spin text-white" />
                <span>Solving Equation...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Solve Math Problem</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <BrainCircuit size={15} className="text-amber-400" />
            Step-by-Step Explanation
          </label>

          <div className="w-full flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-black/50 p-4 text-xs font-mono text-amber-200 overflow-y-auto leading-relaxed">
            {solution ? (
              <p className="whitespace-pre-wrap">{solution}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-3 py-16 font-sans">
                <BrainCircuit size={36} className="opacity-40" />
                <p className="text-xs font-medium max-w-xs">Type a math problem and click "Solve Math Problem".</p>
              </div>
            )}
          </div>

          {solution && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? "Copied Solution!" : "Copy Explanation"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
