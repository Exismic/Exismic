import type { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { MinecraftSkinWorkspace } from "@/components/tool/MinecraftSkinWorkspace";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { getToolMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return getToolMetadata("minecraft-skin", "image");
}

// Keep the public heading, guide, FAQ and links outside the editor's loading
// boundary. Do not route this page through the all-tools client bundle.
export default function MinecraftSkinPage() {
  return (
    <ToolPageShell
      toolId="image-minecraft-skin"
      categoryId="image"
      className="w-full max-w-[1720px] space-y-6 pt-6 sm:pt-10 md:space-y-8 md:pt-12"
      afterGuide={<ToolSuggestions currentToolId="image-minecraft-skin" categoryId="image" />}
    >
      <MinecraftSkinWorkspace />
    </ToolPageShell>
  );
}
