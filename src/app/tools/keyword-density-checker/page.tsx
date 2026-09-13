import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import KeywordDensityChecker from "@/components/tool/KeywordDensityChecker";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Keyword Density Checker - Analyze Text Keyword Frequency | Exismic",
  description: "Analyze text content for keyword frequency percentages, phrase density, and avoid keyword stuffing to optimize search rankings.",
  canonicalUrl: `${SITE_URL}/tools/keyword-density-checker`,
});

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
