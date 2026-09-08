import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import ResumeAnalyzer from "@/components/tool/ResumeAnalyzer";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("resume-analyzer", "productivity");
}

export default function ResumeAnalyzerPage() {
  return (
    <ToolPageShell
      toolId="resume-analyzer"
      categoryId="productivity"
      customTitle="AI Resume Scanner"
      customDescription="Scan and compare your resume against target job descriptions to identify missing keywords and formatting improvements."
    >
      <ResumeAnalyzer />
    </ToolPageShell>
  );
}
