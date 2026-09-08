import { constructMetadata, SITE_URL } from "@/lib/seo";
import HashtagGenerator from "./HashtagGeneratorClient";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { Metadata } from "next";

export const metadata: Metadata = constructMetadata({
  title: "AI Hashtag Generator for Instagram, TikTok & YouTube | Exismic",
  description: "Generate viral, high-reach hashtags for Instagram, TikTok, YouTube, and X. Free online hashtag builder.",
  canonicalUrl: `${SITE_URL}/tools/hashtag-generator`,
  keywords: ["hashtag generator","instagram hashtags","tiktok hashtags","viral hashtags","free hashtag tool","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="hashtag-generator"
      categoryId="creator"
      customTitle="AI Hashtag Generator"
      customDescription="Build focused, platform-aware hashtag sets for Instagram, TikTok, YouTube, and X with balanced reach."
    >
      <HashtagGenerator />
    </ToolPageShell>
  );
}
