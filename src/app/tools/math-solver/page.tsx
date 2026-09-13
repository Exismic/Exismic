import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import MathSolver from "@/components/tool/MathSolver";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free AI Math Solver - Step-by-Step Algebra & Calculus Solutions | Exismic",
  description: "Solve math equations, calculus problems, and word problems step-by-step with clear explanations and LaTeX formatting.",
  canonicalUrl: `${SITE_URL}/tools/math-solver`,
});

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
