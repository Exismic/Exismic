import React from "react";
import CanonicalGenerator from "@/components/tool/seo/CanonicalGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("canonical-generator", "seo");
}

export default function CanonicalGeneratorPage() {
  return (
    <ToolPageShell
      toolId="canonical-generator"
      categoryId="seo"
      customTitle="Canonical & Hreflang Tag Generator"
      customDescription="Generate valid canonical link tags and multi-language hreflang HTML meta code to prevent duplicate content indexing penalties."
    >
      <CanonicalGenerator />
    </ToolPageShell>
  );
}
