import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Free QR Code Generator - Create Custom QR Codes | Lumora",
  description: "Create downloadable QR codes for links and text with custom colors and error correction.",
  canonicalUrl: `${SITE_URL}/tools/qr-code`,
});

export default function QrCodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
