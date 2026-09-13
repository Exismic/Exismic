import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import ResumeBulletGenerator from "@/components/tool/ResumeBulletGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free AI Resume Bullet Point Generator - Action-Oriented Resume Bullets | Exismic",
  description: "Generate metric-driven, ATS-optimized resume bullet points using the STAR method for any job title.",
  canonicalUrl: `${SITE_URL}/tools/resume-bullet-generator`,
});

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
