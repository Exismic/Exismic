import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import ToolsLibraryClient from "./ToolsLibraryClient";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

export const metadata: Metadata = constructMetadata({
  title: "Exismic AI Tools Directory - Free Image, Video, Audio, PDF & Productivity Utilities",
  description:
    "Explore Exismic's complete suite of free AI tools and online utilities. Remove background, detect AI text, edit videos, merge PDFs, generate code, and convert files instantly.",
  canonicalUrl: `${SITE_URL}/tools`,
  keywords: ["AI tools directory", "free online utilities", "AI image editor", "PDF merger", "free developer tools", "Exismic"],
});

export default function ToolsPage() {
  return (
    <>
      <ToolsLibraryClient />
      <ToolSeoSection
        toolName="Exismic AI Tools Library"
        toolDescription="Explore over 50+ high-performance AI, media processing, PDF, developer, and student productivity tools built for studio-grade results in your browser."
        categoryName="AI Tools Directory"
        categoryId="ai"
        toolSlug="/tools"
      />
    </>
  );
}

