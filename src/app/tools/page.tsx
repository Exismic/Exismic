import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import ToolsLibraryClient from "./ToolsLibraryClient";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Ai Tools - Image, Video, Audio, PDF and Productivity",
  description:
    "Browse Exismic's complete collection of AI-powered image, video, audio, PDF, coding, and productivity tools.",
  canonicalUrl: `${SITE_URL}/tools`,
});

export default function ToolsPage() {
  return <ToolsLibraryClient />;
}
