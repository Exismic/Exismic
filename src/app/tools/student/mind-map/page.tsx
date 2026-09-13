import React from "react";
import MindMapStudio from "@/components/tool/student/MindMapStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("mind-map", "student");
}

export default function MindMapPage() {
  return (
    <ToolPageShell
      toolId="mind-map"
      categoryId="student"
      customTitle="Notes to Mind Map Studio"
      customDescription="Turn outlines, bullet points, and notes into interactive visual mind maps and concept trees. 100% private in-browser processing with 1-click high-res PNG and vector SVG downloads."
    >
      <MindMapStudio />
    </ToolPageShell>
  );
}
