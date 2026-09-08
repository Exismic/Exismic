import ResumeBulletGenerator from "@/components/tool/ResumeBulletGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Resume Bullet Point Generator - Action-Oriented Resume Bullets | Exismic",
  description: "Generate metric-driven, ATS-optimized resume bullet points using the STAR method for any job title.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="resume-bullet-generator"
      categoryId="productivity"
      customTitle="Resume Bullet Generator"
      customDescription="Create high-impact STAR framework bullet points with action verbs and quantifiable metrics."
    >
      <ResumeBulletGenerator />
    </ToolPageShell>
  );
}
