import { constructMetadata, SITE_URL } from "@/lib/seo";
import YouTubeThumbnailMaker from "./YoutubeThumbnailClient";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free YouTube Thumbnail Maker - Design 1280x720 PNG Thumbnails",
  description: "Design 1280x720 YouTube thumbnails with templates, editable text, colors, and image layers. Preview your design and download PNG.",
  canonicalUrl: "/tools/youtube/thumbnail",
  keywords: ["youtube thumbnail maker","thumbnail creator","high ctr thumbnail","youtube banner maker","free thumbnail editor","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="youtube-thumbnail"
      categoryId="creator"
      customTitle="YouTube Thumbnail Maker"
      customDescription="Design 1280x720 thumbnails with templates, editable text, colors, and image layers, then download PNG."
    >
      <YouTubeThumbnailMaker />
    </ToolPageShell>
  );
}
