import React from "react";
import RedactBlurStudio from "@/components/tool/image/RedactBlurStudio";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("redact-blur", "image");
}

export default function RedactBlurPage() {
  return (
    <ToolPageShell
      toolId="redact-blur"
      categoryId="image"
      customTitle="Private Photo & Screen Blur Studio"
      customDescription="Blur, pixelate, or black out passwords, faces, credit cards, and private text from screenshots and photos. 100% on-device client privacy with instant clipboard copy and clean image download."
    >
      <RedactBlurStudio />
    </ToolPageShell>
  );
}
