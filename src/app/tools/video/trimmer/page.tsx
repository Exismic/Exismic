import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import VideoTrimmerPage from "./VideoTrimmerClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "Free Online Video Trimmer & Cutter | Exismic",
  description: "Trim and cut videos easily in your browser. Set precise start and end times to crop unwanted sections fast.",
  canonicalUrl: "/tools/video/trimmer",
  keywords: ["video trimmer","cut video online","trim mp4","free video cutter","video editor online","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "video-trimmer" || t.href === "/tools/video/trimmer") || {
    id: "video-trimmer",
    name: "Free Online Video Trimmer & Cutter | Exismic",
    description: "Trim and cut videos easily in your browser. Set precise start and end times to crop unwanted sections fast.",
    href: "/tools/video/trimmer"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VideoTrimmerPage />
    </>
  );
}
