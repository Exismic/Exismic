import SchemaMarkupGenerator from "@/components/tool/SchemaMarkupGenerator";

export const metadata = {
  title: "Free Schema Markup Generator - JSON-LD Structured Data Builder | Exismic",
  description: "Generate Google-compliant JSON-LD schema markup for Articles, FAQs, Products, Local Businesses, and How-To guides.",
};

export default function Page() {
  return <SchemaMarkupGenerator />;
}
