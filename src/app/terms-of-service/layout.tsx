import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Lumora Terms of Service",
  description: "Review the terms that govern access to Lumora accounts, tools, and services.",
  canonicalUrl: `${SITE_URL}/terms-of-service`,
});

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
