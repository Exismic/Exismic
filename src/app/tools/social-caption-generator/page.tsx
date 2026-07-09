import { SocialCaptionGenerator } from "@/components/tool/SocialCaptionGenerator";
import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "AI Social Media Caption Generator | Exismic",
  description: "Generate viral, platform-optimized captions with AI vision.",
  canonicalUrl: `${SITE_URL}/tools/social-caption-generator`,
});

export default function SocialCaptionPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="pt-32 px-6">
        <SocialCaptionGenerator />
      </div>
    </main>
  );
}
