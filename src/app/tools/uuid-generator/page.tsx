import UuidGenerator from "@/components/tool/UuidGenerator";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { ToolSeoSection } from "@/components/seo/ToolSeoSection";

export const metadata = constructMetadata({
  title: "Free UUID Generator - Generate Random v4 UUIDs Online | Exismic",
  description: "Generate random, unique RFC 4122 Version-4 UUIDs and GUIDs instantly in bulk for databases and APIs.",
  canonicalUrl: `${SITE_URL}/tools/uuid-generator`,
  keywords: ["uuid generator", "v4 uuid", "guid generator", "random uuid", "online uuid generator"],
});

export default function Page() {
  return (
    <>
      <UuidGenerator />
      <ToolSeoSection
        toolName="UUID / GUID Generator"
        toolDescription="Generate random, unique RFC 4122 Version-4 UUIDs and GUIDs instantly in bulk for databases, APIs, and software engineering."
        categoryName="Developer Tools"
        categoryId="developer"
        toolSlug="/tools/uuid-generator"
      />
    </>
  );
}

