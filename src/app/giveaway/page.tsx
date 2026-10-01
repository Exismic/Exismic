import { Metadata } from "next";
import { GiveawayPageClient } from "@/components/giveaway/GiveawayPageClient";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Community Giveaways | Exismic",
  description:
    "Check Exismic community giveaways, current availability, entry details, and results.",
  canonicalUrl: `${SITE_URL}/giveaway`,
});

export default function GiveawayPage() {
  return <GiveawayPageClient />;
}
