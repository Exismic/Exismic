import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { DiscordBioClient } from "./DiscordBioClient";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  return constructMetadata({
    title: `Discord Profile | Exismic`,
    description: `Live Discord profile card with real-time status, activities, avatar cosmetics, and connected accounts.`,
    canonicalUrl: `${SITE_URL}/d/${userId}`,
  });
}

export default async function DiscordBioPage({ params }: PageProps) {
  const { userId } = await params;
  return <DiscordBioClient initialUserId={userId} />;
}
