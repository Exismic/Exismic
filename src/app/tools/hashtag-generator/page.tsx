import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import HashtagGenerator from "./HashtagGeneratorClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "AI Hashtag Generator for Instagram, TikTok & YouTube | Exismic",
  description: "Generate viral, high-reach hashtags for Instagram, TikTok, YouTube, and X. AI-powered hashtag recommendation engine free online.",
  canonicalUrl: "/tools/hashtag-generator",
  keywords: ["hashtag generator","instagram hashtags","tiktok hashtags","viral hashtags","free hashtag tool","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "hashtag-generator" || t.href === "/tools/hashtag-generator") || {
    id: "hashtag-generator",
    name: "AI Hashtag Generator for Instagram, TikTok & YouTube | Exismic",
    description: "Generate viral, high-reach hashtags for Instagram, TikTok, YouTube, and X. AI-powered hashtag recommendation engine free online.",
    href: "/tools/hashtag-generator"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HashtagGenerator />
    </>
  );
}
