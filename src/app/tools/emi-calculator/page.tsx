import EmiCalculator from "@/components/tool/EmiCalculator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Loan EMI Calculator - Home, Car & Personal Loan Calculator | Exismic",
  description: "Calculate monthly EMI, total interest payable, and detailed loan amortization schedule online.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="emi-calculator"
      categoryId="business"
      customTitle="Loan EMI Calculator"
      customDescription="Calculate monthly EMI, total interest, and complete loan amortization summaries for Home, Car, and Personal loans."
    >
      <EmiCalculator />
    </ToolPageShell>
  );
}
