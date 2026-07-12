import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { normalizeFavoriteToolId } from "@/lib/favorites";
import { listFavoriteToolIds, resolveFavoriteOwner } from "@/lib/server/favorites";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
};

export async function GET() {
  try {
    const supabaseServer = await createClient();
    const { data: { user: sbUser } } = await supabaseServer.auth.getUser();

    if (!sbUser) {
      return NextResponse.json(
        { favorites: [], authenticated: false },
        { headers: responseHeaders },
      );
    }

    const owner = await resolveFavoriteOwner(sbUser);
    const favorites = owner ? await listFavoriteToolIds(owner.id) : [];

    return NextResponse.json(
      { favorites, authenticated: true },
      { headers: responseHeaders },
    );
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

    const body = await req.json().catch(() => null);
    const toolId = normalizeFavoriteToolId(body?.toolId);
    const action = body?.action;

    if (!toolId || !["add", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const owner = await resolveFavoriteOwner(sbUser, { create: true });

    if (action === 'add') {
      await prisma.favorite.upsert({
        where: {
          userId_toolId: {
            userId: owner.id,
            toolId,
          },
        },
        update: {},
        create: {
          userId: owner.id,
          toolId,
        },
      });
    } else {
      await prisma.favorite.deleteMany({
        where: {
          userId: owner.id,
          toolId,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        isFavorited: action === "add",
        favorites: await listFavoriteToolIds(owner.id),
      },
      { headers: responseHeaders },
    );
  } catch (error: unknown) {
    console.error("Error updating favorite:", error);
    return NextResponse.json({ error: "Failed to update favorite" }, { status: 500 });
  }
}
