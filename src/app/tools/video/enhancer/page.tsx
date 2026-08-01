import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import VideoEnhancerPage from "./VideoEnhancerClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "AI Video Enhancer & Quality Upscaler Online | Exismic",
  description: "Enhance video clarity, contrast, and resolution with AI vision processing. Upscale footage automatically with studio results.",
  canonicalUrl: "/tools/video/enhancer",
  keywords: ["video enhancer","ai video upscaler","enhance video quality","fix blurry video","online video enhancer","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "video-enhancer" || t.href === "/tools/video/enhancer") || {
    id: "video-enhancer",
    name: "AI Video Enhancer & Quality Upscaler Online | Exismic",
    description: "Enhance video clarity, contrast, and resolution with AI vision processing. Upscale footage automatically with studio results.",
    href: "/tools/video/enhancer"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VideoEnhancerPage />
    </>
  );
}
