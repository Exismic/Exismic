import type { Metadata } from "next";
import { SupportAgentModulePage } from "@/components/support-agent/SupportAgentModulePage";

export const metadata: Metadata = {
  title: "Support Agent Playground - Exismic",
};

export default async function SupportAgentPlaygroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupportAgentModulePage agentId={id} module="playground" />;
}
