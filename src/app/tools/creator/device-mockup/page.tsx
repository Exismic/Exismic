import React from "react";
import DeviceMockupStudio from "@/components/tool/creator/DeviceMockupStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("device-mockup", "creator");
}

export default function DeviceMockupPage() {
  return (
    <ToolPageShell
      toolId="device-mockup"
      categoryId="creator"
      customTitle="3D Device & App Mockup Studio"
      customDescription="Wrap your screenshots, app designs, and website previews into photorealistic 3D iPhones, MacBooks, and glass browser frames with custom angles and studio lighting."
    >
      <DeviceMockupStudio />
    </ToolPageShell>
  );
}
