import React from "react";
import JsonToTypes from "@/components/tool/developer/JsonToTypes";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("json-to-types", "developer");
}

export default function JsonToTypesPage() {
  return <JsonToTypes />;
}
