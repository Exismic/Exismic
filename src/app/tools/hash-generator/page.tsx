import HashGenerator from "@/components/tool/HashGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Online Hash Generator - SHA-1, SHA-256, SHA-512 | Exismic",
  description: "Compute SHA-1, SHA-256, and SHA-512 cryptographic hashes online instantly with real-time updates.",
};

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
