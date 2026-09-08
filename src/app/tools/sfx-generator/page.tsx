import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import SfxGenerator from "@/components/tool/SfxGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("sfx-generator", "audio");
}

export default function SfxGeneratorPage() {
  return (
    <ToolPageShell
      toolId="sfx-generator"
      categoryId="audio"
      customTitle="AI Sound Effects"
      customDescription="Generate custom sound effects for videos, podcasts, and games from descriptive text prompts."
    >
      <SfxGenerator />
    </ToolPageShell>
  );
}
