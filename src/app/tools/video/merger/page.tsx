import VideoMerger from "@/components/tool/VideoMerger";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = constructMetadata({
  title: "Video Merger - Combine Multiple Video Clips Online | Exismic",
  description: "Arrange video clips and join them online into one MP4. Clips are normalized to a common 1280x720 output.",
  canonicalUrl: `${SITE_URL}/tools/video/merger`,
});

export default function VideoMergerPage() {
  return (
    <ToolPageShell
      toolId="video-merger"
      categoryId="video"
      customTitle="Video Merger"
      customDescription="Add clips, arrange their order, and join them online into a single MP4."
    >
      <VideoMerger />
    </ToolPageShell>
  );
}
