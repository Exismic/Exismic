import { publicJson } from "@/lib/public-json";
import { createClient } from "@/utils/supabase/server";
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user-access';

export async function GET(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  try {
    const params = await props.params;
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();


    if (!sbUser || !sbUser.email) {
      return publicJson({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(sbUser);

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: params.sessionId }
    });

    if (!chatSession) {
      return publicJson({ error: "Session not found" }, { status: 404 });
    }

    if (chatSession.userId !== user.id) {
      return publicJson({ error: "Unauthorized" }, { status: 403 });
    }

    let parsedMessages = [];
    try {
      parsedMessages = JSON.parse(chatSession.messages);
    } catch (e) {
      console.error("Failed to parse messages JSON", e);
    }

    return publicJson({
      id: chatSession.id,
      title: chatSession.title,
      messages: parsedMessages
    });
  } catch (error) {
    console.error("Fetch session error:", error);
    return publicJson({ error: "Failed to fetch session" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ sessionId: string }> }) {
  try {
    const params = await props.params;
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser || !sbUser.email) {
      return publicJson({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(sbUser);

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: params.sessionId }
    });

    if (!chatSession) {
      return publicJson({ error: "Session not found" }, { status: 404 });
    }

    if (chatSession.userId !== user.id) {
      return publicJson({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.chatSession.delete({
      where: { id: params.sessionId }
    });

    return publicJson({ success: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return publicJson({ error: "Failed to delete session" }, { status: 500 });
  }
}
