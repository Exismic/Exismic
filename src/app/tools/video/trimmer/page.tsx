import { constructMetadata, SITE_URL } from "@/lib/seo";
import VideoTrimmer from "@/components/tool/VideoTrimmer";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Online Video Trimmer & Cutter | Exismic",
  description: "Trim and cut videos easily in your browser. Set precise start and end times to crop unwanted sections fast.",
  canonicalUrl: "/tools/video/trimmer",
  keywords: ["video trimmer","cut video online","trim mp4","free video cutter","video editor online","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="video-trimmer"
      categoryId="video"
      customTitle="Video Trimmer"
      customDescription="Trim and cut videos with frame-accurate precision directly in your browser without quality loss."
    >
      <VideoTrimmer />
    </ToolPageShell>
  );
}
