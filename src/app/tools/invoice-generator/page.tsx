import { constructMetadata, SITE_URL } from "@/lib/seo";
import { Metadata } from "next";
import { InvoiceGeneratorClient } from "@/components/tool/InvoiceGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "Free Invoice Generator - Create Professional Invoices Online",
  description: "Create professional, branded invoices for your business or freelance work with our free AI-powered invoice generator. Custom templates, tax calculation, and more.",
  canonicalUrl: `${SITE_URL}/tools/invoice-generator`,
});

export default function InvoiceGeneratorPage() {
  const tool = TOOLS.find(t => t.id === 'invoice-generator');
  const category = CATEGORIES.find(c => c.id === 'productivity');

  return (
    <ToolPageShell
      toolId="invoice-generator"
      categoryId="productivity"
      customTitle="Invoice Generator"
      customDescription="Build polished invoices with tax calculations, discounts, payment terms, live preview, and multi-page PDF export."
    >
      <InvoiceGeneratorClient tool={tool || null} category={category || null} />
    </ToolPageShell>
  );
}
