import SalaryCalculator from "@/components/tool/SalaryCalculator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free CTC to In-Hand Salary Calculator India - New vs Old Tax Regime | Exismic",
  description: "Calculate your net monthly take-home salary from total CTC package with tax regime comparison and deduction breakdown.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="salary-calculator"
      categoryId="business"
      customTitle="CTC to In-Hand Salary Calculator"
      customDescription="Calculate net monthly take-home salary from your annual CTC package with tax and EPF deductions."
    >
      <SalaryCalculator />
    </ToolPageShell>
  );
}
