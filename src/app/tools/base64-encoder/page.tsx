import Base64Encoder from "@/components/tool/Base64Encoder";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Base64 Encoder & Decoder Online - Convert Text & Files | Exismic",
  description: "Quickly encode and decode text, strings, and files to Base64 format online with instant live preview.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="base64-encoder"
      categoryId="developer"
      customTitle="Base64 Encoder / Decoder"
      customDescription="Encode text to Base64 and decode Base64 strings to UTF-8 with instant live conversion."
    >
      <Base64Encoder />
    </ToolPageShell>
  );
}
