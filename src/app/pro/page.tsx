import { Metadata } from "next";
import { ProClient } from "./ProClient";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Lumora Pro - Unlimited Elite AI Power",
  description: "Upgrade to Lumora Pro for unlimited AI generations, 20x faster processing, 4K exports, and commercial rights. Unlock the full potential of our elite AI studio.",
  canonicalUrl: `${SITE_URL}/pro`,
});

export default function ProPage() {
  return <ProClient />;
}
