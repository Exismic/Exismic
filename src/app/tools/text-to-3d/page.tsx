import { constructMetadata } from "@/lib/seo";
import { Metadata } from "next";
import TextTo3D from "@/components/tool/TextTo3D";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  // This unlisted preview is not part of the published tool catalog.
  return constructMetadata({
    title: "Text-to-3D Preview | Exismic",
    description: "Preview the Exismic text-to-3D workspace and its concept-to-model workflow.",
    canonicalUrl: "/tools/text-to-3d",
    noIndex: true,
  });
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
