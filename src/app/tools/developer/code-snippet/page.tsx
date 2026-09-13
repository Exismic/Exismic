import React from "react";
import CodeSnippetStudio from "@/components/tool/developer/CodeSnippetStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("code-snippet", "developer");
}

export default function CodeSnippetPage() {
  return (
    <ToolPageShell
      toolId="code-snippet"
      categoryId="developer"
      customTitle="Aesthetic Code Snippet Studio"
      customDescription="Turn code into beautiful, glowing images for social media, blogs, presentations, and docs. Pick themes, window frames, and gradient backdrops, then copy or download in one click."
    >
      <CodeSnippetStudio />
    </ToolPageShell>
  );
}
