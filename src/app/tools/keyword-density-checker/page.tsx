import KeywordDensityChecker from "@/components/tool/KeywordDensityChecker";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Keyword Density Checker - Analyze Text Keyword Frequency | Exismic",
  description: "Analyze text content for keyword frequency percentages, phrase density, and avoid keyword stuffing to optimize search rankings.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="keyword-density-checker"
      categoryId="seo"
      customTitle="Keyword Density Checker"
      customDescription="Analyze word frequencies, phrase densities, and keyword stuffing warnings for SEO content."
    >
      <KeywordDensityChecker />
    </ToolPageShell>
  );
}
