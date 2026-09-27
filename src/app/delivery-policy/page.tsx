import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import DeliveryPolicyClient from "./DeliveryPolicyClient";

export const metadata: Metadata = constructMetadata({
  title: "Digital Delivery & Fulfillment Policy | Exismic",
  description:
    "Exismic shipping and electronic digital delivery policy. Learn how Pro subscriptions, generation credits, and digital tools are instantly provisioned.",
  canonicalUrl: `${SITE_URL}/delivery-policy`,
  keywords: [
    "exismic delivery policy",
    "digital shipping policy",
    "fulfillment policy",
    "electronic delivery",
    "instant credit delivery",
    "merchant shipping policy",
  ],
});

export default function DeliveryPolicyPage() {
  return <DeliveryPolicyClient />;
}
