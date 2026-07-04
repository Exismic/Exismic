import type { Metadata } from "next";
import { DiscordCardGenerator } from "./DiscordCardGenerator";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Discord Profile Card Generator | Lumora",
  description:
    "Create a live Discord profile card with your avatar, banner, status, activities, badges, profile effects, and connections.",
  canonicalUrl: `${SITE_URL}/tools/discord-card`,
});

export default function DiscordCardPage() {
  return <DiscordCardGenerator />;
}
