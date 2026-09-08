import React from "react";
import EssayOutlineBuilder from "@/components/tool/student/EssayOutlineBuilder";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("essay-outline-builder", "student");
}

export default function EssayOutlineBuilderPage() {
  return (
    <ToolPageShell
      toolId="essay-outline-builder"
      categoryId="student"
      customTitle="AI Essay & Thesis Outline Builder"
      customDescription="Generate structured paragraph-by-paragraph essay outlines, strong thesis statements, and research search prompts."
    >
      <EssayOutlineBuilder />
    </ToolPageShell>
  );
}
