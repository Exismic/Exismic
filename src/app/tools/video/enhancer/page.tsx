import { constructMetadata, SITE_URL } from "@/lib/seo";
import VideoEnhancer from "@/components/tool/VideoEnhancer";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "AI Video Enhancer & Quality Upscaler Online | Exismic",
  description: "Enhance video clarity, contrast, and resolution with AI vision processing. Upscale footage automatically with studio results.",
  canonicalUrl: "/tools/video/enhancer",
  keywords: ["video enhancer","ai video upscaler","enhance video quality","fix blurry video","online video enhancer","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="video-enhancer"
      categoryId="video"
      customTitle="AI Video Enhancer"
      customDescription="Restore clarity, sharpen details, and improve video lighting and quality with automated processing."
    >
      <VideoEnhancer />
    </ToolPageShell>
  );
}
