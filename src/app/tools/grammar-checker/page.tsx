import GrammarChecker from "@/components/tool/GrammarChecker";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Grammar Checker & Style Editor Online | Exismic",
  description: "Check grammar, spelling, punctuation, and writing style online. Improve sentence clarity and tone with AI-powered corrections.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="grammar-checker"
      categoryId="productivity"
      customTitle="Grammar & Style Checker"
      customDescription="Fix spelling mistakes, grammatical errors, and phrasing with real-time AI suggestions."
    >
      <GrammarChecker />
    </ToolPageShell>
  );
}
