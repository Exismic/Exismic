import { constructMetadata, SITE_URL } from "@/lib/seo";
import SubtitleGenerator from "@/components/tool/SubtitleGenerator";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "AI Subtitle Generator & Auto Captions Maker | Exismic",
  description: "Automatically generate subtitles and captions for your videos using AI speech recognition. Export SRT files or burn captions in video.",
  canonicalUrl: "/tools/video/subtitles",
  keywords: ["auto subtitle generator","ai captions","video subtitles maker","srt generator","free subtitles tool","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="video-subtitles"
      categoryId="video"
      customTitle="AI Subtitle Generator"
      customDescription="Generate accurate subtitles and captions for your videos automatically. Export SRT or VTT files with precise timestamps."
    >
      <SubtitleGenerator />
    </ToolPageShell>
  );
}
