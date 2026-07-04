import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "YouTube Thumbnail Maker - Design High-CTR Thumbnails | Lumora",
  description: "Create polished YouTube thumbnails with images, text, effects, and export controls.",
  canonicalUrl: `${SITE_URL}/tools/youtube/thumbnail`,
});

export default function YoutubeThumbnailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
