import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import SubtitleGeneratorPage from "./VideoSubtitlesClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "AI Subtitle Generator & Auto Captions Maker | Exismic",
  description: "Automatically generate subtitles and captions for your videos using AI speech recognition. Export SRT files or burn captions in video.",
  canonicalUrl: "/tools/video/subtitles",
  keywords: ["auto subtitle generator","ai captions","video subtitles maker","srt generator","free subtitles tool","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "video-subtitles" || t.href === "/tools/video/subtitles") || {
    id: "video-subtitles",
    name: "AI Subtitle Generator & Auto Captions Maker | Exismic",
    description: "Automatically generate subtitles and captions for your videos using AI speech recognition. Export SRT files or burn captions in video.",
    href: "/tools/video/subtitles"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SubtitleGeneratorPage />
    </>
  );
}
