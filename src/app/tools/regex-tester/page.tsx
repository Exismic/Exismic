import RegexTester from "@/components/tool/RegexTester";
import { ToolPageShell } from "@/components/tool/ToolPageShell";

export const metadata = {
  title: "Free Regex Tester & Debugger Online - JavaScript Regular Expressions | Exismic",
  description: "Test regular expressions online with live match highlights, capture group breakdown, and regex cheat sheets.",
};

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
