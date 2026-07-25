import React from "react";
import { MaintenanceScreen } from "@/components/layout/MaintenanceScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scheduled System Upgrade | Exismic Studio",
  description: "Exismic Creative Studio is currently undergoing scheduled maintenance to deploy next-generation AI creative tools.",
};

export default function MaintenancePage() {
  return <MaintenanceScreen />;
}
