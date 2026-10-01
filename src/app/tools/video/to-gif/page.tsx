import VideoToGif from "@/components/tool/VideoToGif";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = constructMetadata({
  title: "Video to GIF - Convert Video Clips to High Quality Animated GIFs | Exismic",
  description: "Convert a selected video clip to GIF. Choose start and end times, 320/480/640-pixel width, and 10–30 frames per second, then download the animation.",
  canonicalUrl: `${SITE_URL}/tools/video/to-gif`,
});

export default function VideoToGifPage() {
  return (
    <ToolPageShell
      toolId="video-gif"
      categoryId="video"
      customTitle="Video to GIF"
      customDescription="Convert video clips into lightweight, high-quality animated GIFs with custom fps and dimensions."
    >
      <VideoToGif />
    </ToolPageShell>
  );
}
