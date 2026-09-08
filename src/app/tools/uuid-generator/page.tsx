import UuidGenerator from "@/components/tool/UuidGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";
import { constructMetadata, SITE_URL } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Free UUID Generator - Generate Random v4 UUIDs Online | Exismic",
  description: "Generate random, unique RFC 4122 Version-4 UUIDs and GUIDs instantly in bulk for databases and APIs.",
  canonicalUrl: `${SITE_URL}/tools/uuid-generator`,
  keywords: ["uuid generator", "v4 uuid", "guid generator", "random uuid", "online uuid generator"],
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="uuid-generator"
      categoryId="developer"
      customTitle="UUID / GUID Generator"
      customDescription="Generate bulk RFC 4122 Version-4 UUIDs for database primary keys, API tokens, and seed scripts."
    >
      <UuidGenerator />
    </ToolPageShell>
  );
}
