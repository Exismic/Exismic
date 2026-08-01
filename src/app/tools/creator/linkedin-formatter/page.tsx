import React from "react";
import LinkedinFormatter from "@/components/tool/creator/LinkedinFormatter";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("linkedin-formatter", "creator");
}

export default function LinkedinFormatterPage() {
  return <LinkedinFormatter />;
}
