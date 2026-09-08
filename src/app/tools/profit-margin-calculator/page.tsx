import ProfitMarginCalculator from "@/components/tool/ProfitMarginCalculator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Profit Margin & Markup Calculator - Business Financial Tool | Exismic",
  description: "Calculate gross profit margin, net profit percentage, and markup for products and services with real-time breakdown.",
};

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
