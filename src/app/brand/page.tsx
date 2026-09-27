import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import BrandClient from "./BrandClient";

export const metadata: Metadata = constructMetadata({
  title: "Brand Assets & Media Press Kit | Exismic",
  description:
    "Official Exismic brand assets, downloadable vector SVG logos, color palettes, product guidelines, and press kit for media and creators.",
  canonicalUrl: `${SITE_URL}/brand`,
  keywords: [
    "exismic brand assets",
    "press kit",
    "logo download",
    "vector svg logo",
    "brand colors",
    "media kit",
  ],
});

export default function BrandPage() {
  return <BrandClient />;
}
