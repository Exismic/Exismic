import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import GrammarChecker from "@/components/tool/GrammarChecker";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free AI Grammar Checker & Style Editor Online | Exismic",
  description: "Check grammar, spelling, punctuation, and writing style online. Improve sentence clarity and tone with AI-powered corrections.",
  canonicalUrl: `${SITE_URL}/tools/grammar-checker`,
});

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
