import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import AffiliatesClient from "./AffiliatesClient";

export const metadata: Metadata = constructMetadata({
  title: "Creator & Partner Affiliate Program | Exismic",
  description:
    "Join the Exismic Creator & Partner Affiliate Program. Earn up to 30% recurring commissions by sharing practical AI and creative tools with your audience.",
  canonicalUrl: `${SITE_URL}/affiliates`,
  keywords: [
    "exismic affiliate program",
    "creator partnership",
    "saas affiliate",
    "earn recurring commission",
    "ai tool partner program",
    "influencer affiliate",
  ],
});

export default function AffiliatesPage() {
  return <AffiliatesClient />;
}
