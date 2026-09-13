import { Metadata } from "next";
import { GiveawayPageClient } from "@/components/giveaway/GiveawayPageClient";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "New Giveaway Coming Soon | Exismic",
  description:
    "A special community giveaway is dropping on Exismic! Stay tuned for the official countdown, prize reveals, and entry qualification.",
  canonicalUrl: `${SITE_URL}/giveaway`,
});

export default function GiveawayPage() {
  return <GiveawayPageClient />;
}
