import { Metadata } from "next";
import { ProClient } from "./ProClient";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { PRICING_CONFIG } from "@/config/pricing";

export const metadata: Metadata = constructMetadata({
  title: "Exismic Pro - Daily Credits & Priority Processing",
  description: `Get ${PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS} daily credits with Exismic Pro, priority processing, access to Pro tools, and commercial export benefits for supported workflows.`,
  canonicalUrl: `${SITE_URL}/pro`,
});

export default function ProPage() {
  return <ProClient />;
}
