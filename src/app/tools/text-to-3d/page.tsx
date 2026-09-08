import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import TextTo3D from "@/components/tool/TextTo3D";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("text-to-3d", "ai");
}

export default function TextTo3DPage() {
  return (
    <ToolPageShell
      toolId="text-to-3d"
      categoryId="ai"
      customTitle="Text-to-3D Generator"
      customDescription="Transform text descriptions into textured 3D models with interactive browser mesh preview."
    >
      <TextTo3D />
    </ToolPageShell>
  );
}
