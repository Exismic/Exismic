import { constructMetadata, SITE_URL } from "@/lib/seo";
import VideoTrimmer from "@/components/tool/VideoTrimmer";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Online Video Trimmer & Cutter | Exismic",
  description: "Choose start and end times to trim a video clip. Upload it for online processing and download the selected section as an MP4.",
  canonicalUrl: "/tools/video/trimmer",
  keywords: ["video trimmer","cut video online","trim mp4","free video cutter","video editor online","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="video-trimmer"
      categoryId="video"
      customTitle="Video Trimmer"
      customDescription="Choose the start and end of a video clip, preview your selection, and process it online for an MP4 download."
    >
      <VideoTrimmer />
    </ToolPageShell>
  );
}
