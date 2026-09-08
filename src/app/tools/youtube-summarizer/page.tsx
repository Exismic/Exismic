import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import YoutubeSummarizer from "@/components/tool/YoutubeSummarizer";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("youtube-summarizer", "ai");
}

export default function YoutubeSummarizerPage() {
  return (
    <ToolPageShell
      toolId="youtube-summarizer"
      categoryId="ai"
      customTitle="YouTube AI Summarizer"
      customDescription="Convert any YouTube video into detailed study notes, summaries, or structured articles in seconds."
    >
      <YoutubeSummarizer />
    </ToolPageShell>
  );
}
