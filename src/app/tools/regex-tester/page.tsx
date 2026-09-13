import { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import RegexTester from "@/components/tool/RegexTester";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata: Metadata = constructMetadata({
  title: "Free Regex Tester & Debugger Online - JavaScript Regular Expressions | Exismic",
  description: "Test regular expressions online with live match highlights, capture group breakdown, and regex cheat sheets.",
  canonicalUrl: `${SITE_URL}/tools/regex-tester`,
});

export default function Page() {
  return (
    <ToolPageShell
      toolId="regex-tester"
      categoryId="developer"
      customTitle="Regex Tester & Debugger"
      customDescription="Test and validate JavaScript regular expressions with real-time matching and syntax breakdown."
    >
      <RegexTester />
    </ToolPageShell>
  );
}
