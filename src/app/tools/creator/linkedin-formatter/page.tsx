import React from "react";
import LinkedinFormatter from "@/components/tool/creator/LinkedinFormatter";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("linkedin-formatter", "creator");
}

export default function LinkedinFormatterPage() {
  return (
    <ToolPageShell
      toolId="linkedin-formatter"
      categoryId="creator"
      customTitle="LinkedIn Post Formatter & Hook Analyzer"
      customDescription="Format text with unicode styling, custom bullet icons, readable spacing, and live hook strength ratings."
    >
      <LinkedinFormatter />
    </ToolPageShell>
  );
}
