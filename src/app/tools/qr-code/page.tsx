import { constructMetadata, SITE_URL } from "@/lib/seo";
import QRCodeGenerator from "./QrCodeClient";
import { Metadata } from "next";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Custom QR Code Generator with Logo | Exismic",
  description: "Create customized high-resolution QR codes with custom colors, logos, and styling. Download PNG or SVG instantly for free.",
  canonicalUrl: "/tools/qr-code",
  keywords: ["qr code generator","custom qr code","qr code with logo","free qr maker","vector qr code","Exismic"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="productivity-qr"
      categoryId="productivity"
      customTitle="QR Code Studio"
      customDescription="Generate customized high-resolution QR codes with custom colors, logos, and instant PNG downloads."
    >
      <QRCodeGenerator />
    </ToolPageShell>
  );
}
