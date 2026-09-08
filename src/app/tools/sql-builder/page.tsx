import React from "react";
import SqlBuilder from "@/components/tool/developer/SqlBuilder";
import { getToolMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export async function generateMetadata() {
  return getToolMetadata("sql-builder", "developer");
}

export default function SqlBuilderPage() {
  return (
    <ToolPageShell
      toolId="sql-builder"
      categoryId="developer"
      customTitle="Visual SQL Query Builder"
      customDescription="Construct complex SQL queries visually or translate plain text into clean, formatted PostgreSQL and MySQL queries."
    >
      <SqlBuilder />
    </ToolPageShell>
  );
}
