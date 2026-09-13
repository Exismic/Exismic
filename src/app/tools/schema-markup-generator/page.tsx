import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import SchemaMarkupGenerator from "@/components/tool/SchemaMarkupGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Schema Markup Generator - JSON-LD Structured Data Builder | Exismic",
  description: "Generate Google-compliant JSON-LD schema markup for Articles, FAQs, Products, Local Businesses, and How-To guides.",
  canonicalUrl: `${SITE_URL}/tools/schema-markup-generator`,
});

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
