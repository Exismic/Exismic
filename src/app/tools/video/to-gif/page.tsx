import VideoToGif from "@/components/tool/VideoToGif";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = constructMetadata({
  title: "Video to GIF - Convert Video Clips to High Quality Animated GIFs | Exismic",
  description: "Convert video clips to high-quality optimized GIFs with custom color palettes and smooth playback.",
  canonicalUrl: `${SITE_URL}/tools/video/to-gif`,
});

export default function VideoToGifPage() {
  return (
    <ToolPageShell
      toolId="video-to-gif"
      categoryId="video"
      customTitle="Video to GIF"
      customDescription="Convert video clips into lightweight, high-quality animated GIFs with custom fps and dimensions."
    >
      <VideoToGif />
    </ToolPageShell>
  );
}
