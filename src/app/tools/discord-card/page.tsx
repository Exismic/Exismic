import type { Metadata } from "next";
import { DiscordCardGenerator } from "./DiscordCardGenerator";

export const metadata: Metadata = {
  title: "Discord Profile Card Generator | Lumora",
  description:
    "Create a live Discord profile card with your avatar, banner, status, activities, badges, profile effects, and connections.",
};

export default function DiscordCardPage() {
  return <DiscordCardGenerator />;
}
