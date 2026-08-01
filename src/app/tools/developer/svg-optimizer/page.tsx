import React from "react";
import SvgOptimizer from "@/components/tool/developer/SvgOptimizer";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("svg-optimizer", "developer");
}

export default function SvgOptimizerPage() {
  return <SvgOptimizer />;
}
