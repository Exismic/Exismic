import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Free Hashtag Generator for Social Media | Lumora",
  description: "Generate relevant hashtag groups for social posts, campaigns, and content discovery.",
  canonicalUrl: `${SITE_URL}/tools/hashtag-generator`,
});

export default function HashtagGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
