import SchemaMarkupGenerator from "@/components/tool/SchemaMarkupGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Schema Markup Generator - JSON-LD Structured Data Builder | Exismic",
  description: "Generate Google-compliant JSON-LD schema markup for Articles, FAQs, Products, Local Businesses, and How-To guides.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="schema-markup-generator"
      categoryId="seo"
      customTitle="Schema Markup Generator"
      customDescription="Generate Google-compliant JSON-LD structured data for FAQ, Article, Product, and Business schemas."
    >
      <SchemaMarkupGenerator />
    </ToolPageShell>
  );
}
