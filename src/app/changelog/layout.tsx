import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Changelog - What's New & Product Updates",
  description: "Discover the latest features, improvements, AI tools, and updates added to Exismic.",
  canonicalUrl: `${SITE_URL}/changelog`,
});

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
