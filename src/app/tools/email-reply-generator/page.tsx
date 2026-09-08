import EmailReplyGenerator from "@/components/tool/EmailReplyGenerator";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free AI Email Reply Generator - Smart Quick Responses | Exismic",
  description: "Generate professional email replies instantly. Choose tone, response intent, and key details for clean email communication.",
};

export default function Page() {
  return (
    <ToolPageShell
      toolId="email-reply-generator"
      categoryId="productivity"
      customTitle="Email Reply Generator"
      customDescription="Draft tailored, professional email responses in seconds based on intent, context, and tone."
    >
      <EmailReplyGenerator />
    </ToolPageShell>
  );
}
