import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import AmbientMixer from "@/components/tool/AmbientMixer";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("ambient-mixer", "audio");
}

export default function AmbientMixerPage() {
  return (
    <ToolPageShell
      toolId="ambient-mixer"
      categoryId="audio"
      customTitle="Cinematic Ambient Mixer"
      customDescription="Mix ambient soundscapes with rain, fireplace, cafe, and forest audio layers for deep focus and relaxation."
    >
      <AmbientMixer />
    </ToolPageShell>
  );
}
