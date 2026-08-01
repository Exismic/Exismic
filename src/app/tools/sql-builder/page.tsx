import React from "react";
import SqlBuilder from "@/components/tool/developer/SqlBuilder";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("sql-builder", "developer");
}

export default function SqlBuilderPage() {
  return <SqlBuilder />;
}
