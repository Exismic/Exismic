import React from "react";
import CanonicalGenerator from "@/components/tool/seo/CanonicalGenerator";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("canonical-generator", "seo");
}

export default function CanonicalGeneratorPage() {
  return <CanonicalGenerator />;
}
