import MathSolver from "@/components/tool/MathSolver";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Math Solver - Step-by-Step Algebra & Calculus Solutions | Exismic",
  description: "Solve math equations, calculus problems, and word problems step-by-step with clear explanations and LaTeX formatting.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="math-solver"
      categoryId="student"
      customTitle="AI Math Step Solver"
      customDescription="Solve algebra, calculus, and word problems with step-by-step mathematical reasoning and formulas."
    >
      <MathSolver />
    </ToolPageShell>
  );
}
