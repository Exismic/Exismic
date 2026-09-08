import React from "react";
import HookScriptGenerator from "@/components/tool/creator/HookScriptGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("hook-script-generator", "creator");
}

export default function HookScriptGeneratorPage() {
  return (
    <ToolPageShell toolId="hook-script-generator" categoryId="creator">
      <HookScriptGenerator />
    </ToolPageShell>
  );
}

