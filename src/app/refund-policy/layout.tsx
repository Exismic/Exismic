import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Refund & Cancellation Policy",
  description: "Understand our cancellation process, subscription refund guidelines, and digital compute token policies.",
  canonicalUrl: `${SITE_URL}/refund-policy`,
});

export default function RefundPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
