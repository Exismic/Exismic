import React from "react";
import SerpSimulator from "@/components/tool/seo/SerpSimulator";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("serp-simulator", "seo");
}

export default function SerpSimulatorPage() {
  return <SerpSimulator />;
}
