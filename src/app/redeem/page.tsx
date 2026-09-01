import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { RedeemClient } from "./RedeemClient";

export const metadata: Metadata = constructMetadata({
  title: "Redeem Gift Voucher & Promo Code | Exismic",
  description: "Claim your Exismic Pro gift pass, bonus credits, and reward vouchers. Instant activation across all AI creative studios.",
  canonicalUrl: `${SITE_URL}/redeem`,
});

export default function RedeemPage() {
  return <RedeemClient />;
}
