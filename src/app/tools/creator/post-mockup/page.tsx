import React from "react";
import SocialPostStudio from "@/components/tool/creator/SocialPostStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("post-mockup", "creator");
}

export default function SocialPostMockupPage() {
  return (
    <ToolPageShell
      toolId="post-mockup"
      categoryId="creator"
      customTitle="Fake Social Post & Tweet Studio"
      customDescription="Design photorealistic Twitter / X posts, Threads, and Instagram comment cards in seconds. Customize names, handles, verified badges, numbers, and themes for viral videos and presentations."
    >
      <SocialPostStudio />
    </ToolPageShell>
  );
}
