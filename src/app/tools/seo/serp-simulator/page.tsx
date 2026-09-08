import React from "react";
import SerpSimulator from "@/components/tool/seo/SerpSimulator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("serp-simulator", "seo");
}

export default function SerpSimulatorPage() {
  return (
    <ToolPageShell
      toolId="serp-simulator"
      categoryId="seo"
      customTitle="Google SERP Snippet Simulator"
      customDescription="Preview how title tags and meta descriptions appear in Google search results across desktop and mobile screens."
    >
      <SerpSimulator />
    </ToolPageShell>
  );
}
