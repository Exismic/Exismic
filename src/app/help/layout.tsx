import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Help and Support",
  description:
    "Get help with Exismic tools, accounts, subscriptions, files, and AI workflows.",
  canonicalUrl: `${SITE_URL}/help`,
});

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
