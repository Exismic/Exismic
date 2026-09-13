import React from "react";
import TeleprompterStudio from "@/components/tool/creator/TeleprompterStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("teleprompter", "creator");
}

export default function TeleprompterPage() {
  return (
    <ToolPageShell
      toolId="teleprompter"
      categoryId="creator"
      customTitle="Live Studio Teleprompter"
      customDescription="Distraction-free auto-scrolling script reader for video creators, presentations, and speeches. Features mirror mode for teleprompter glass, speed controls, and camera selfie preview."
    >
      <TeleprompterStudio />
    </ToolPageShell>
  );
}
