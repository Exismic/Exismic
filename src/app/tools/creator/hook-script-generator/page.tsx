import React from "react";
import HookScriptGenerator from "@/components/tool/creator/HookScriptGenerator";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("hook-script-generator", "creator");
}

export default function HookScriptGeneratorPage() {
  return <HookScriptGenerator />;
}
