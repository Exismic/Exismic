import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import GstCalculator from "@/components/tool/GstCalculator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Indian GST Calculator Online - Inclusive & Exclusive Tax Calculator | Exismic",
  description: "Calculate GST amount, CGST, SGST, and IGST instantly for all standard tax slabs in India.",
  canonicalUrl: `${SITE_URL}/tools/gst-calculator`,
});

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
