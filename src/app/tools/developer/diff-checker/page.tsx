import React from "react";
import DiffCheckerStudio from "@/components/tool/developer/DiffCheckerStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("diff-checker", "developer");
}

export default function DiffCheckerPage() {
  return (
    <ToolPageShell
      toolId="diff-checker"
      categoryId="developer"
      customTitle="Text & Code Comparison Studio (Diff Checker)"
      customDescription="Compare two versions of code, contracts, or text side by side. Highlights added, removed, and modified lines with word-level precision. 100% private, zero server cost."
    >
      <DiffCheckerStudio />
    </ToolPageShell>
  );
}
