import { constructMetadata, getToolJsonLd, SITE_URL } from "@/lib/seo";
import QRCodeGenerator from "./QrCodeClient";
import { Metadata } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";

export const metadata: Metadata = constructMetadata({
  title: "Free Custom QR Code Generator with Logo | Exismic",
  description: "Create customized high-resolution QR codes with custom colors, logos, and styling. Download PNG or SVG instantly for free.",
  canonicalUrl: "/tools/qr-code",
  keywords: ["qr code generator","custom qr code","qr code with logo","free qr maker","vector qr code","Exismic"],
});

export default function Page() {
  const tool = TOOLS.find(t => t.id === "productivity-qr" || t.href === "/tools/qr-code") || {
    id: "productivity-qr",
    name: "Free Custom QR Code Generator with Logo | Exismic",
    description: "Create customized high-resolution QR codes with custom colors, logos, and styling. Download PNG or SVG instantly for free.",
    href: "/tools/qr-code"
  };

  const jsonLd = getToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <QRCodeGenerator />
    </>
  );
}
