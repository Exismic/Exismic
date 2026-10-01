import { constructMetadata, SITE_URL } from "@/lib/seo";
import VideoCompressor from "@/components/tool/VideoCompressor";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Online Video Compressor - Reduce Video File Size | Exismic",
  description: "Compress video online with selectable quality and MP4 or WebM output. Compare file sizes and preview the result before downloading.",
  canonicalUrl: "/tools/video/compressor",
  keywords: ["video compressor","compress mp4","reduce video size","video shrinker online","free video compressor","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="video-compressor"
      categoryId="video"
      customTitle="Video Compressor"
      customDescription="Reduce video file size with quality controls and MP4 or WebM output. Preview the result and compare its size before downloading."
    >
      <VideoCompressor />
    </ToolPageShell>
  );
}
