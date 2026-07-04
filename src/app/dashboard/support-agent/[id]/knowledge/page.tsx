import type { Metadata } from "next";
import { SupportAgentModulePage } from "@/components/support-agent/SupportAgentModulePage";

export const metadata: Metadata = {
  title: "Support Agent Knowledge - Lumora",
};

export default async function SupportAgentKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupportAgentModulePage agentId={id} module="knowledge" />;
}
