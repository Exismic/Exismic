import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import YouTubeThumbnailMaker from "./YoutubeThumbnailClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "Free YouTube Thumbnail Maker - Design High-CTR Thumbnails | Exismic",
  description: "Design eye-catching, high-converting YouTube thumbnails quickly with our intuitive editor and high-impact typography.",
  canonicalUrl: "/tools/youtube/thumbnail",
  keywords: ["youtube thumbnail maker","thumbnail creator","high ctr thumbnail","youtube banner maker","free thumbnail editor","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "youtube-thumbnail" || t.href === "/tools/youtube/thumbnail") || {
    id: "youtube-thumbnail",
    name: "Free YouTube Thumbnail Maker",
    description: "Design eye-catching, high-converting YouTube thumbnails quickly with our intuitive editor and high-impact typography.",
    href: "/tools/youtube/thumbnail"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YouTubeThumbnailMaker />
    </>
  );
}
