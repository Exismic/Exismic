import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Privacy Policy",
  description: "Read how Exismic collects, uses, protects, and manages account and tool data.",
  canonicalUrl: `${SITE_URL}/privacy-policy`,
});

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
