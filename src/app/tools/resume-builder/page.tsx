import { ResumeBuilder } from "@/components/tool/ResumeBuilder";
import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "AI Resume Builder | Create Professional CVs Online",
  description: "Build a professional, ATS-friendly resume in minutes with AI content suggestions and modern templates.",
  canonicalUrl: `${SITE_URL}/tools/resume-builder`,
});

export default function ResumeBuilderPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="pt-32 px-6">
        <ResumeBuilder />
      </div>
    </main>
  );
}
