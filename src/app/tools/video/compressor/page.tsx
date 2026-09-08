import { constructMetadata, SITE_URL } from "@/lib/seo";
import VideoCompressor from "@/components/tool/VideoCompressor";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Online Video Compressor - Reduce Video File Size | Exismic",
  description: "Compress MP4, MOV, and WebM videos without losing quality. Reduce file sizes for fast web streaming and social sharing.",
  canonicalUrl: "/tools/video/compressor",
  keywords: ["video compressor","compress mp4","reduce video size","video shrinker online","free video compressor","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="video-compressor"
      categoryId="video"
      customTitle="Video Compressor"
      customDescription="Shrink your video files by up to 90% without losing quality. Optimized for Discord, WhatsApp, and web sharing."
    >
      <VideoCompressor />
    </ToolPageShell>
  );
}
