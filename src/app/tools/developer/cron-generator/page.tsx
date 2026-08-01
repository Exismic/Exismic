import React from "react";
import CronGenerator from "@/components/tool/developer/CronGenerator";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("cron-generator", "developer");
}

export default function CronGeneratorPage() {
  return <CronGenerator />;
}
