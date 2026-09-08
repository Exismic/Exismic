import React from "react";
import OgPreviewer from "@/components/tool/seo/OgPreviewer";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("og-previewer", "seo");
}

export default function OgPreviewerPage() {
  return (
    <ToolPageShell
      toolId="og-previewer"
      categoryId="seo"
      customTitle="Open Graph (OG) Social Link Previewer"
      customDescription="Preview how your website link cards render when shared on Twitter/X, LinkedIn, Facebook, and Discord."
    >
      <OgPreviewer />
    </ToolPageShell>
  );
}
