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
      customTitle="LinkedIn Post Formatter"
      customDescription="Format your posts with clean line breaks, bold headlines, bullet points, and get an instant score on your opening hook."
    >
      <LinkedinFormatter />
    </ToolPageShell>
  );
}
