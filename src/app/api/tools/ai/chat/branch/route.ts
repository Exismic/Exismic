import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user-access";

type BranchMessage = {
  role?: "user" | "assistant";
  content?: string;
  attachments?: unknown;
  timestamp?: string;
  imageUrl?: string;
  isImage?: boolean;
  enhancedPrompt?: string;
  chatMode?: string;
  studentMode?: boolean;
};

const cleanBranchMessage = (message: BranchMessage) => ({
  role: message.role,
  content: message.content || "",
  attachments: message.attachments,
  timestamp: message.timestamp,
  imageUrl: message.imageUrl,
  isImage: message.isImage,
  enhancedPrompt: message.enhancedPrompt,
  chatMode: message.chatMode,
  studentMode: message.studentMode,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser || !sbUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(sbUser);
    const body = await req.json();
    const sourceSessionId = typeof body.sourceSessionId === "string" ? body.sourceSessionId : null;
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return NextResponse.json({ error: "Branch needs at least one message" }, { status: 400 });
    }

    let sourceTitle = "New Chat";
    if (sourceSessionId) {
      const sourceSession = await prisma.chatSession.findUnique({
        where: { id: sourceSessionId },
        select: { userId: true, title: true }
      });

      if (!sourceSession) {
        return NextResponse.json({ error: "Source chat not found" }, { status: 404 });
      }

      if (sourceSession.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      sourceTitle = sourceSession.title || sourceTitle;
    }

    const cleanedMessages = messages
      .filter((message: BranchMessage) => message?.role === "user" || message?.role === "assistant")
      .map(cleanBranchMessage);

    if (cleanedMessages.length === 0) {
      return NextResponse.json({ error: "No valid messages to branch" }, { status: 400 });
    }

    const branchTitle = `Branch: ${sourceTitle}`.slice(0, 60);
    const newSession = await prisma.chatSession.create({
      data: {
        userId: user.id,
        title: branchTitle,
        messages: JSON.stringify(cleanedMessages),
      }
    });

    return NextResponse.json({
      id: newSession.id,
      title: newSession.title,
      messages: cleanedMessages,
    });
  } catch (error) {
    console.error("[Chat Branch] Error:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
