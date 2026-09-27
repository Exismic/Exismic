import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import DeveloperHubClient from "./DeveloperHubClient";

export const metadata: Metadata = constructMetadata({
  title: "Developer Platform & Cloud API | Exismic",
  description:
    "Integrate Exismic's high-speed AI tools, media conversion engines, and document processing into your apps with our unified REST API.",
  canonicalUrl: `${SITE_URL}/developer`,
  keywords: [
    "exismic api",
    "developer platform",
    "ai rest api",
    "image processing api",
    "cloud tools api",
    "developer portal",
  ],
});

export default function DeveloperPage() {
  return <DeveloperHubClient />;
}
