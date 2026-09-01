import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalApiUser, requireApiUser, getRequestIp } from "@/lib/api-security";
import { ensureCommunityPostsSeeded } from "@/lib/server/seed-community";
import { getOrCreateUser } from "@/lib/user-access";
import { fetchCommunityPosts, insertCommunityPost } from "@/lib/server/community-db";

export async function GET(request: NextRequest) {
  try {
    await ensureCommunityPostsSeeded().catch(() => {});

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const sort = searchParams.get("sort") || "trending"; // trending | most_liked | newest
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(60, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    const authUser = await getOptionalApiUser();
    const clientIp = getRequestIp(request);

    const result = await fetchCommunityPosts({
      category,
      search,
      sort,
      page,
      limit,
      authUserId: authUser ? authUser.id : null,
      clientIp,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[COMMUNITY_POSTS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch community posts", message: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireApiUser();
    if (authUser instanceof NextResponse) {
      return authUser;
    }

    const dbUser = await getOrCreateUser(authUser);
    const body = await request.json();

    let {
      title,
      prompt,
      category,
      toolName,
      toolUrl,
      previewUrl,
      mediaType = "image",
      tags = [],
      userFileId,
    } = body;

    // If publishing from an existing UserFile
    if (userFileId) {
      const file = await prisma.userFile.findUnique({
        where: { id: userFileId },
      });

      if (!file || file.userId !== authUser.id) {
        return NextResponse.json(
          { error: "File not found or unauthorized" },
          { status: 404 }
        );
      }

      previewUrl = file.resultUrl || previewUrl;
      prompt = prompt || file.originalUrl || file.originalName || "Generated Creation";
      title = title || file.originalName || "My Creation";
      
      const lowerTool = (file.toolType || "").toLowerCase();
      if (!category) {
        if (lowerTool.includes("minecraft") || lowerTool.includes("skin")) {
          category = "skins";
          toolName = toolName || "Minecraft Skin Maker";
          toolUrl = toolUrl || `/tools/image/minecraft-skin?prompt=${encodeURIComponent(prompt)}`;
        } else if (lowerTool.includes("vector") || lowerTool.includes("svg")) {
          category = "vectors";
          toolName = toolName || "SVG Vectorizer";
          toolUrl = toolUrl || `/tools/developer/svg-vectorizer`;
        } else if (lowerTool.includes("palette") || lowerTool.includes("color")) {
          category = "palettes";
          toolName = toolName || "Palette Generator";
          toolUrl = toolUrl || `/tools/creator/palette-generator`;
        } else if (lowerTool.includes("sfx") || lowerTool.includes("audio")) {
          category = "audio";
          toolName = toolName || "SFX Generator";
          toolUrl = toolUrl || `/tools/audio/sfx-generator`;
          mediaType = "audio";
        } else {
          category = "images";
          toolName = toolName || "AI Image Generator";
          toolUrl = toolUrl || `/tools/image/generator?prompt=${encodeURIComponent(prompt)}`;
        }
      }
    }

    if (!title || !previewUrl || !category) {
      return NextResponse.json(
        { error: "Missing required fields (title, previewUrl, category)" },
        { status: 400 }
      );
    }

    const authorName =
      dbUser.name ||
      dbUser.username ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.user_name ||
      authUser.email?.split("@")[0] ||
      "Creator";

    const authorAvatar =
      dbUser.customAvatarUrl ||
      dbUser.image ||
      authUser.user_metadata?.avatar_url ||
      null;

    const createdPost = await insertCommunityPost({
      userId: authUser.id,
      authorName,
      authorAvatar,
      title: title.slice(0, 100),
      prompt: (prompt || title).slice(0, 1000),
      category,
      toolName: toolName || "Exismic AI Studio",
      toolUrl: toolUrl || "/tools",
      previewUrl,
      mediaType,
      tags: Array.isArray(tags) ? tags.map((t: string) => String(t).trim().replace(/^#/, "")).filter(Boolean) : [],
    });

    return NextResponse.json({
      success: true,
      post: createdPost,
    });
  } catch (error: any) {
    console.error("[COMMUNITY_POSTS_CREATE]", error);
    return NextResponse.json(
      { error: "Failed to publish post to community", message: error?.message },
      { status: 500 }
    );
  }
}
