import CoverLetterGenerator from "@/components/tool/CoverLetterGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Cover Letter Generator - Tailored Job Applications | Exismic",
  description: "Create personalized, professional cover letters tailored to any job opening in minutes with AI.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="cover-letter-generator"
      categoryId="productivity"
      customTitle="Cover Letter Generator"
      customDescription="Generate personalized, professional cover letters tailored to any job opening in seconds."
    >
      <CoverLetterGenerator />
    </ToolPageShell>
  );
}
