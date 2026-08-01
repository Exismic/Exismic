import React from "react";
import OgPreviewer from "@/components/tool/seo/OgPreviewer";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("og-previewer", "seo");
}

export default function OgPreviewerPage() {
  return <OgPreviewer />;
}
