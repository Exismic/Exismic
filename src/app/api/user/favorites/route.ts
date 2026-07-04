import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabaseServer = await createClient();
    const { data: { user: sbUser } } = await supabaseServer.auth.getUser();

    if (!sbUser) {
      return NextResponse.json({ favorites: [] });
    }

    const data = await prisma.favorite.findMany({
      where: { userId: sbUser.id },
      select: { toolId: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites: data.map(f => f.toolId) });
  } catch (error: unknown) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user: sbUser } } = await supabaseServer.auth.getUser();

    if (!sbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toolId, action } = await req.json();

    if (!toolId || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { id: sbUser.id },
      update: {
        email: sbUser.email ?? undefined,
      },
      create: {
        id: sbUser.id,
        email: sbUser.email ?? null,
        name: typeof sbUser.user_metadata?.full_name === "string"
          ? sbUser.user_metadata.full_name
          : null,
      },
    });

    if (action === 'add') {
      await prisma.favorite.upsert({
        where: {
          userId_toolId: {
            userId: sbUser.id,
            toolId,
          },
        },
        update: {},
        create: {
          userId: sbUser.id,
          toolId,
        },
      });
    } else {
      await prisma.favorite.deleteMany({
        where: {
          userId: sbUser.id,
          toolId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error updating favorite:", error);
    return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 });
  }
}
