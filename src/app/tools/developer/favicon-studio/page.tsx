import React from "react";
import FaviconStudio from "@/components/tool/developer/FaviconStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("favicon-studio", "developer");
}

export default function FaviconStudioPage() {
  return (
    <ToolPageShell
      toolId="favicon-studio"
      categoryId="developer"
      customTitle="Favicon & App Icon Studio"
      customDescription="Generate complete favicon and app icon kits for websites, iPhone, Android, and web apps. Create from images, emojis, or letters, and download a ready-to-use icon pack."
    >
      <FaviconStudio />
    </ToolPageShell>
  );
}
