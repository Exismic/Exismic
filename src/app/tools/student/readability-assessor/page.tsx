import React from "react";
import ReadabilityAssessor from "@/components/tool/student/ReadabilityAssessor";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("readability-assessor", "student");
}

export default function ReadabilityAssessorPage() {
  return <ReadabilityAssessor />;
}
