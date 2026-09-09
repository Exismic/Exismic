import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { DiscordCardGenerator } from "./DiscordCardGenerator";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

export const metadata: Metadata = constructMetadata({
  title: "Discord Profile Card Generator - Live Presence, Spotify & Badges | Exismic",
  description:
    "Create a live Discord profile website and dynamic GitHub README SVG badge with real-time status, Spotify sync, custom cosmetics, and 1-click PNG/HTML exports.",
  canonicalUrl: `${SITE_URL}/tools/discord-card`,
  keywords: [
    "discord profile card",
    "discord card generator",
    "discord github badge",
    "discord presence generator",
    "discord profile maker",
    "Exismic",
  ],
  noIndex: true,
});

export default function DiscordCardPage() {
  return (
    <>
      <DiscordCardGenerator />
      <ToolSeoSection
        toolName="Discord Profile Card Studio"
        toolDescription="Create a live Discord profile website and dynamic GitHub README SVG badge with real-time status, Spotify sync, custom cosmetics, and 1-click PNG/HTML exports."
        categoryName="Productivity & Developer Tools"
        categoryId="developer"
        toolSlug="/tools/discord-card"
        showRelatedTools={true}
      />
    </>
  );
}
