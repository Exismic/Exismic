import React from "react";
import SvgOptimizer from "@/components/tool/developer/SvgOptimizer";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("svg-optimizer", "developer");
}

export default function SvgOptimizerPage() {
  return (
    <ToolPageShell
      toolId="svg-optimizer"
      categoryId="developer"
      customTitle="SVG Optimizer & File Cleaner (SVGO)"
      customDescription="Clean XML metadata, editor artifacts, and inline styles to shrink SVG file size by up to 70%."
    >
      <SvgOptimizer />
    </ToolPageShell>
  );
}
