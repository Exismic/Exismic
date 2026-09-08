import { ResumeBuilder } from "@/components/tool/ResumeBuilder";
import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "AI Resume Builder | Create Professional CVs Online",
  description: "Build a professional, ATS-friendly resume in minutes with AI content suggestions and modern templates.",
  canonicalUrl: `${SITE_URL}/tools/resume-builder`,
});

export default function ResumeBuilderPage() {
  return (
    <ToolPageShell
      toolId="resume-builder"
      categoryId="productivity"
      customTitle="AI Resume Builder"
      customDescription="Create polished, ATS-optimized resumes with modern templates, automated formatting, and live PDF export."
    >
      <ResumeBuilder />
    </ToolPageShell>
  );
}
