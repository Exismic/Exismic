import React from "react";
import ThumbnailAnalyzer from "@/components/tool/creator/ThumbnailAnalyzer";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("thumbnail-analyzer", "creator");
}

export default function ThumbnailAnalyzerPage() {
  return <ThumbnailAnalyzer />;
}
