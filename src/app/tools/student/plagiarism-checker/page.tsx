import React from "react";
import PlagiarismChecker from "@/components/tool/student/PlagiarismChecker";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("plagiarism-checker", "student");
}

export default function PlagiarismCheckerPage() {
  return (
    <ToolPageShell
      toolId="plagiarism-checker"
      categoryId="student"
      customTitle="Text Similarity & Plagiarism Diff Checker"
      customDescription="Compare two texts side-by-side to detect identical phrases, paraphrase similarity, and citation gaps."
    >
      <PlagiarismChecker />
    </ToolPageShell>
  );
}
