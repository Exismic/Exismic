import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import ProfitMarginCalculator from "@/components/tool/ProfitMarginCalculator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Profit Margin & Markup Calculator - Business Financial Tool | Exismic",
  description: "Calculate gross profit margin, net profit percentage, and markup for products and services with real-time breakdown.",
  canonicalUrl: `${SITE_URL}/tools/profit-margin-calculator`,
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="profit-margin-calculator"
      categoryId="business"
      customTitle="Profit Margin Calculator"
      customDescription="Calculate gross profit, margin percentage, markup rate, and net profit margins instantly."
    >
      <ProfitMarginCalculator />
    </ToolPageShell>
  );
}
