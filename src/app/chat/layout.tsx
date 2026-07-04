import { ChatProvider } from "@/components/providers/ChatProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
}
