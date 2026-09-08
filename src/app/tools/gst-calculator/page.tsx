import GstCalculator from "@/components/tool/GstCalculator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Indian GST Calculator Online - Inclusive & Exclusive Tax Calculator | Exismic",
  description: "Calculate GST amount, CGST, SGST, and IGST instantly for all standard tax slabs in India.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="gst-calculator"
      categoryId="business"
      customTitle="GST Calculator (India)"
      customDescription="Calculate inclusive and exclusive GST amounts with CGST, SGST, and IGST tax breakdowns."
    >
      <GstCalculator />
    </ToolPageShell>
  );
}
