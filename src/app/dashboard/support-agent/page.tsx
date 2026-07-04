import type { Metadata } from "next";
import { SupportAgentDashboardClient } from "@/components/support-agent/SupportAgentDashboardClient";

export const metadata: Metadata = {
  title: "Support Agents - Lumora Dashboard",
};

export default function SupportAgentDashboardPage() {
  return <SupportAgentDashboardClient />;
}
