import type { Metadata } from "next";
import { SupportAgentModulePage } from "@/components/support-agent/SupportAgentModulePage";

export const metadata: Metadata = {
  title: "Support Agent Conversations - Lumora",
};

export default async function SupportAgentConversationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupportAgentModulePage agentId={id} module="conversations" />;
}
