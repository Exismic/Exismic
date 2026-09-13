import React from "react";
import MeshGradientStudio from "@/components/tool/developer/MeshGradientStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("mesh-gradient", "developer");
}

export default function MeshGradientPage() {
  return (
    <ToolPageShell
      toolId="mesh-gradient"
      categoryId="developer"
      customTitle="CSS Mesh Gradient & Glassmorphism Studio"
      customDescription="Design organic flowing color gradients and frosted glass cards in real time. Drag color points, tweak glass blur and shine, then copy clean website code or download 4K wallpapers in one click."
    >
      <MeshGradientStudio />
    </ToolPageShell>
  );
}
