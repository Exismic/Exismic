import type { Metadata } from "next";
import { SupportAgentManageClient } from "@/components/support-agent/SupportAgentManageClient";

export const metadata: Metadata = {
  title: "Manage Support Agent - Lumora",
};

export default async function ManageSupportAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupportAgentManageClient agentId={id} />;
}
