import React from "react";
import SlowedReverbStudio from "@/components/tool/audio/SlowedReverbStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("slowed-reverb", "audio");
}

export default function SlowedReverbPage() {
  return (
    <ToolPageShell
      toolId="slowed-reverb"
      categoryId="audio"
      customTitle="Slowed + Reverb & Sped-Up Music Studio"
      customDescription="Transform songs into aesthetic Slowed + Reverb or Sped-Up Nightcore tracks in seconds. Customize speed, cathedral reverb, and bass rumble with live visualizer and instant audio download."
    >
      <SlowedReverbStudio />
    </ToolPageShell>
  );
}
