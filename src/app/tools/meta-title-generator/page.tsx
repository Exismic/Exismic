import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import MetaTitleGenerator from "@/components/tool/MetaTitleGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free AI Meta Title Generator - SEO Title Tag Optimizer | Exismic",
  description: "Generate click-worthy, SEO-optimized title tags under 60 characters with live Google SERP preview.",
  canonicalUrl: `${SITE_URL}/tools/meta-title-generator`,
});

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
