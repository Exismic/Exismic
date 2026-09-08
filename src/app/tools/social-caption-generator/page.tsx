import { SocialCaptionGenerator } from "@/components/tool/SocialCaptionGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "AI Social Media Caption Generator | Exismic",
  description: "Generate engaging, platform-optimized captions with AI assistance for Instagram, TikTok, YouTube, and X.",
  canonicalUrl: `${SITE_URL}/tools/social-caption-generator`,
});

export default function SocialCaptionPage() {
  return (
    <ToolPageShell
      toolId="social-caption-generator"
      categoryId="creator"
      customTitle="AI Social Media Caption Generator"
      customDescription="Generate engaging, platform-optimized captions with AI assistance for Instagram, TikTok, YouTube, and X."
    >
      <SocialCaptionGenerator />
    </ToolPageShell>
  );
}
