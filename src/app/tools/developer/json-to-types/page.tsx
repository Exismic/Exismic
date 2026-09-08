import React from "react";
import JsonToTypes from "@/components/tool/developer/JsonToTypes";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("json-to-types", "developer");
}

export default function JsonToTypesPage() {
  return (
    <ToolPageShell
      toolId="json-to-types"
      categoryId="developer"
      customTitle="JSON to TypeScript & Zod Converter"
      customDescription="Convert raw JSON objects into type-safe TypeScript interfaces, types, and Zod schemas."
    >
      <JsonToTypes />
    </ToolPageShell>
  );
}
