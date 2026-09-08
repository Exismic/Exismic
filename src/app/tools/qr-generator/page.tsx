import { getToolMetadata } from "@/lib/seo";
import { Metadata } from "next";
import QrGenerator from "@/components/tool/QrGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("qr-generator", "ai");
}

export default function QrGeneratorPage() {
  return (
    <ToolPageShell
      toolId="qr-generator"
      categoryId="ai"
      customTitle="Artistic AI QR Code"
      customDescription="Transform standard black-and-white QR codes into custom, stunning, scannable generative artwork."
    >
      <QrGenerator />
    </ToolPageShell>
  );
}
