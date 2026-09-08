import React from "react";
import ThumbnailAnalyzer from "@/components/tool/creator/ThumbnailAnalyzer";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("thumbnail-analyzer", "creator");
}

export default function ThumbnailAnalyzerPage() {
  return (
    <ToolPageShell
      toolId="thumbnail-analyzer"
      categoryId="creator"
      customTitle="YouTube Thumbnail Analyzer"
      customDescription="Test thumbnail contrast, color balance, readability, and YouTube timestamp badge overlap before publishing."
    >
      <ThumbnailAnalyzer />
    </ToolPageShell>
  );
}
