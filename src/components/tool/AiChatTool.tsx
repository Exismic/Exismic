"use client";

import { ChatProvider } from "@/components/providers/ChatProvider";
import { ChatSidebar } from "@/components/tool/ChatSidebar";
import { ChatWorkspace } from "@/components/tool/ChatWorkspace";

export function AiChatTool() {
  return (
    <ChatProvider>
      <div className="fixed inset-0 z-[200] flex h-[100dvh] w-full overflow-hidden bg-[#060608] text-zinc-300">
        <ChatSidebar />
        <ChatWorkspace />
      </div>
    </ChatProvider>
  );
}
