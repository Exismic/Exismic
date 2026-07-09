import type { Metadata } from "next";
import { SupportAgentFormPage } from "@/components/support-agent/SupportAgentFormPage";

export const metadata: Metadata = {
  title: "Create Support Agent - Exismic",
};

export default function NewSupportAgentPage() {
  return <SupportAgentFormPage />;
}
