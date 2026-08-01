import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import VideoCompressorPage from "./VideoCompressorClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "Free Online Video Compressor - Reduce Video File Size | Exismic",
  description: "Compress MP4, MOV, and WebM videos without losing quality. Reduce file sizes for fast web streaming and social sharing.",
  canonicalUrl: "/tools/video/compressor",
  keywords: ["video compressor","compress mp4","reduce video size","video shrinker online","free video compressor","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "video-compressor" || t.href === "/tools/video/compressor") || {
    id: "video-compressor",
    name: "Free Online Video Compressor",
    description: "Compress MP4, MOV, and WebM videos without losing quality. Reduce file sizes for fast web streaming and social sharing.",
    href: "/tools/video/compressor"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VideoCompressorPage />
    </>
  );
}
