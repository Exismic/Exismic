import type { Metadata } from "next";
import { SupportAgentDashboardClient } from "@/components/support-agent/SupportAgentDashboardClient";

export const metadata: Metadata = {
  title: "Support Agents - Exismic Dashboard",
};

export default function SupportAgentDashboardPage() {
  return <SupportAgentDashboardClient />;
}
