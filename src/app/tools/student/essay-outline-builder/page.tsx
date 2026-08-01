import React from "react";
import EssayOutlineBuilder from "@/components/tool/student/EssayOutlineBuilder";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("essay-outline-builder", "student");
}

export default function EssayOutlineBuilderPage() {
  return <EssayOutlineBuilder />;
}
