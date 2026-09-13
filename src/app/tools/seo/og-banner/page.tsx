import React from "react";
import OgBannerStudio from "@/components/tool/seo/OgBannerStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("og-banner", "seo");
}

export default function OgBannerPage() {
  return (
    <ToolPageShell
      toolId="og-banner"
      categoryId="seo"
      customTitle="Social Share Banner Studio (OG Maker)"
      customDescription="Design custom 1200x630 social preview banners, Open Graph cards, and blog hero graphics in real time. Choose from 5 layouts, customize glowing themes, preview on Twitter and Discord, and download in 1 click."
    >
      <OgBannerStudio />
    </ToolPageShell>
  );
}
