import MetaTitleGenerator from "@/components/tool/MetaTitleGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Meta Title Generator - SEO Title Tag Optimizer | Exismic",
  description: "Generate click-worthy, SEO-optimized title tags under 60 characters with live Google SERP preview.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="meta-title-generator"
      categoryId="seo"
      customTitle="Meta Title Generator"
      customDescription="Generate click-worthy, SEO-optimized title tags under 60 characters with live Google SERP length gauges."
    >
      <MetaTitleGenerator />
    </ToolPageShell>
  );
}
