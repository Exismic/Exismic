import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/api-security";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const post = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment views count non-blockingly
    prisma.communityPost
      .update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch(() => {});

    return NextResponse.json(post);
  } catch (error) {
    console.error("[COMMUNITY_POST_GET]", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireApiUser();
    if (authUser instanceof NextResponse) {
      return authUser;
    }

    const { id } = await context.params;
    const post = await prisma.communityPost.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isOwner = post.userId === authUser.id;
    const isAdmin = authUser.email && ADMIN_EMAILS.includes(authUser.email.toLowerCase());

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.communityPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Post removed" });
  } catch (error) {
    console.error("[COMMUNITY_POST_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
