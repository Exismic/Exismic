import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import LandingPageGenerator from "@/components/tool/LandingPageGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("landing-page-generator", "ai");
}

export default function LandingPageGeneratorPage() {
  return (
    <ToolPageShell
      toolId="landing-page-generator"
      categoryId="ai"
      customTitle="AI Landing Page Generator"
      customDescription="Generate responsive, beautifully styled HTML and CSS landing page mockups from plain English descriptions."
    >
      <LandingPageGenerator />
    </ToolPageShell>
  );
}
