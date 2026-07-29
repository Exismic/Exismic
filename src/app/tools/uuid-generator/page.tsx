import UuidGenerator from "@/components/tool/UuidGenerator";

export const metadata = {
  title: "Free UUID Generator - Generate Random v4 UUIDs Online | Exismic",
  description: "Generate random, unique RFC 4122 Version-4 UUIDs and GUIDs instantly in bulk for databases and APIs.",
};

export default function Page() {
  return <UuidGenerator />;
}
