import { NextRequest, NextResponse } from "next/server";
import { getOptionalApiUser, getRequestIp } from "@/lib/api-security";
import { togglePostLike } from "@/lib/server/community-db";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await context.params;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const authUser = await getOptionalApiUser();
    const clientIp = getRequestIp(request);

    const result = await togglePostLike(
      postId,
      authUser ? authUser.id : null,
      clientIp
    );

    return NextResponse.json({
      success: true,
      liked: result.liked,
      likesCount: result.likesCount,
    });
  } catch (error: any) {
    console.error("[COMMUNITY_POST_LIKE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update like status", message: error?.message },
      { status: 500 }
    );
  }
}
