import VideoMerger from "@/components/tool/VideoMerger";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = constructMetadata({
  title: "Video Merger - Combine Multiple Video Clips Online | Exismic",
  description: "Merge multiple video clips into a single seamless video with automated normalization and fast browser processing.",
  canonicalUrl: `${SITE_URL}/tools/video/merger`,
});

export default function VideoMergerPage() {
  return (
    <ToolPageShell
      toolId="video-merger"
      categoryId="video"
      customTitle="Video Merger"
      customDescription="Combine multiple clips into a single video with drag-and-drop timeline reordering and high-definition export."
    >
      <VideoMerger />
    </ToolPageShell>
  );
}
