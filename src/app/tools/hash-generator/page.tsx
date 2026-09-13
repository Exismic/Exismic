import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import HashGenerator from "@/components/tool/HashGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Online Hash Generator - SHA-1, SHA-256, SHA-512 | Exismic",
  description: "Compute SHA-1, SHA-256, and SHA-512 cryptographic hashes online instantly with real-time updates.",
  canonicalUrl: `${SITE_URL}/tools/hash-generator`,
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="hash-generator"
      categoryId="developer"
      customTitle="Cryptographic Hash Generator"
      customDescription="Compute SHA-1, SHA-256, and SHA-512 cryptographic hashes in real-time in your browser."
    >
      <HashGenerator />
    </ToolPageShell>
  );
}
