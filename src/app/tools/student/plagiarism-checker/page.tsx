import React from "react";
import PlagiarismChecker from "@/components/tool/student/PlagiarismChecker";
import { getToolMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return getToolMetadata("plagiarism-checker", "student");
}

export default function PlagiarismCheckerPage() {
  return <PlagiarismChecker />;
}
