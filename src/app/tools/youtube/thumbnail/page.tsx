import { constructMetadata, SITE_URL } from "@/lib/seo";
import YouTubeThumbnailMaker from "./YoutubeThumbnailClient";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free YouTube Thumbnail Maker - Design High-CTR Thumbnails | Exismic",
  description: "Design eye-catching, high-converting YouTube thumbnails quickly with our intuitive editor and high-impact typography.",
  canonicalUrl: "/tools/youtube/thumbnail",
  keywords: ["youtube thumbnail maker","thumbnail creator","high ctr thumbnail","youtube banner maker","free thumbnail editor","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="youtube-thumbnail"
      categoryId="creator"
      customTitle="YouTube Thumbnail Maker"
      customDescription="Design eye-catching, high-converting YouTube thumbnails quickly with an interactive editor and custom typography."
    >
      <YouTubeThumbnailMaker />
    </ToolPageShell>
  );
}
