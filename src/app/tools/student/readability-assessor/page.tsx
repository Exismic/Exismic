import React from "react";
import ReadabilityAssessor from "@/components/tool/student/ReadabilityAssessor";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("readability-assessor", "student");
}

export default function ReadabilityAssessorPage() {
  return (
    <ToolPageShell
      toolId="readability-assessor"
      categoryId="student"
      customTitle="Text Readability & Grade Level Assessor"
      customDescription="Calculate Flesch Reading Ease, grade level readability, sentence complexity, and generate clear, simplified rewrites."
    >
      <ReadabilityAssessor />
    </ToolPageShell>
  );
}
