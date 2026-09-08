import React from "react";
import CronGenerator from "@/components/tool/developer/CronGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("cron-generator", "developer");
}

export default function CronGeneratorPage() {
  return (
    <ToolPageShell
      toolId="cron-generator"
      categoryId="developer"
      customTitle="Cron Expression Generator & Explainer"
      customDescription="Build, parse, and translate 5-part cron expressions visually into plain English schedules."
    >
      <CronGenerator />
    </ToolPageShell>
  );
}
