import type { Metadata } from "next";
import { getToolMetadata } from "@/lib/seo";

export const metadata: Metadata = getToolMetadata("video-subtitles");

export default function VideoSubtitlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
