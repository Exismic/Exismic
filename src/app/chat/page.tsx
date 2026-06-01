"use client";

import { ChatSidebar } from "@/components/tool/ChatSidebar";
import { ChatWorkspace } from "@/components/tool/ChatWorkspace";

export default function NewChatPage() {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#060608] text-zinc-300">
      <ChatSidebar />
      <ChatWorkspace />
    </div>
  );
}
