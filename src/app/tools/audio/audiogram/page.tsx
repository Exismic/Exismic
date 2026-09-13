import React from "react";
import AudiogramStudio from "@/components/tool/audio/AudiogramStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("audiogram", "audio");
}

export default function AudiogramPage() {
  return (
    <ToolPageShell
      toolId="audiogram"
      categoryId="audio"
      customTitle="Audio Waveform Video Maker (Podcast Reels)"
      customDescription="Turn voice clips, podcast soundbites, and music into animated waveform videos for Instagram Reels, TikTok, and YouTube Shorts. 100% free client-side HD video export."
    >
      <AudiogramStudio />
    </ToolPageShell>
  );
}
