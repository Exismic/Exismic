import { ChatProvider } from "@/components/providers/ChatProvider";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "AI Chat Assistant - Chat with Multiple LLM Models | Exismic",
  description: "Interact with advanced AI models including GPT, Claude, and Llama in a unified chat interface with multi-modal attachments.",
  canonicalUrl: "/chat",
});

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
}
