import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface CommunityPostRecord {
  id: string;
  userId?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  title: string;
  category: string;
  prompt: string;
  toolName: string;
  toolUrl: string;
  previewUrl: string;
  mediaType: string;
  tags: string[];
  likesCount: number;
  viewsCount: number;
  featured: boolean;
  createdAt: string | Date;
  isLiked?: boolean;
}

export async function fetchCommunityPosts(options: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  authUserId?: string | null;
  clientIp?: string;
}) {
  const {
    category = "all",
    search = "",
    sort = "trending",
    page = 1,
    limit = 30,
    authUserId = null,
    clientIp = "127.0.0.1",
  } = options;

  const offset = (page - 1) * limit;

  // Try Prisma model first if available
  if ((prisma as any).communityPost) {
    try {
      const where: any = {};
      if (category !== "all") {
        where.category = category;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { prompt: { contains: search, mode: "insensitive" } },
          { authorName: { contains: search, mode: "insensitive" } },
          { toolName: { contains: search, mode: "insensitive" } },
        ];
      }

      let orderBy: any = [{ likesCount: "desc" }, { createdAt: "desc" }];
      if (sort === "newest") {
        orderBy = [{ createdAt: "desc" }];
      } else if (sort === "most_liked") {
        orderBy = [{ likesCount: "desc" }, { createdAt: "desc" }];
      } else if (sort === "trending") {
        orderBy = [{ featured: "desc" }, { likesCount: "desc" }, { createdAt: "desc" }];
      }

      const [posts, total] = await Promise.all([
        (prisma as any).communityPost.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
          include: {
            likes: {
              where: authUserId
                ? { userId: authUserId }
                : { clientIp: clientIp },
              select: { id: true },
            },
          },
        }),
        (prisma as any).communityPost.count({ where }),
      ]);

      const formatted = posts.map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        author: p.authorName,
        authorAvatar: p.authorAvatar,
        likes: p.likesCount,
        views: p.viewsCount,
        prompt: p.prompt,
        toolUrl: p.toolUrl,
        toolName: p.toolName,
        previewUrl: p.previewUrl,
        mediaType: p.mediaType,
        tags: p.tags || [],
        featured: p.featured,
        createdAt: typeof p.createdAt === "string" ? p.createdAt : p.createdAt.toISOString(),
        isLiked: p.likes && p.likes.length > 0,
      }));

      return { posts: formatted, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (e) {
      console.warn("[COMMUNITY_DB] Prisma model query failed, falling back to raw SQL:", e);
    }
  }

  // Fallback to direct raw SQL query
  let sortClause = `ORDER BY p.featured DESC, p.likes_count DESC, p.created_at DESC`;
  if (sort === "newest") {
    sortClause = `ORDER BY p.created_at DESC`;
  } else if (sort === "most_liked") {
    sortClause = `ORDER BY p.likes_count DESC, p.created_at DESC`;
  }

  const conditions: string[] = ["1=1"];
  const params: any[] = [];

  if (category !== "all") {
    params.push(category);
    conditions.push(`p.category = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    const pIndex = params.length;
    conditions.push(
      `(LOWER(p.title) LIKE LOWER($${pIndex}) OR LOWER(p.prompt) LIKE LOWER($${pIndex}) OR LOWER(p.author_name) LIKE LOWER($${pIndex}) OR LOWER(p.tool_name) LIKE LOWER($${pIndex}))`
    );
  }

  const whereSql = conditions.join(" AND ");

  // Build raw query for items
  let userLikeCondition = `l.client_ip = '${clientIp.replace(/'/g, "''")}' AND l.user_id IS NULL`;
  if (authUserId) {
    userLikeCondition = `l.user_id = '${authUserId.replace(/'/g, "''")}'`;
  }

  const query = `
    SELECT 
      p.id, 
      p.user_id as "userId", 
      p.author_name as "authorName", 
      p.author_avatar as "authorAvatar",
      p.title, 
      p.category, 
      p.prompt, 
      p.tool_name as "toolName", 
      p.tool_url as "toolUrl",
      p.preview_url as "previewUrl", 
      p.media_type as "mediaType", 
      p.tags,
      p.likes_count as "likesCount", 
      p.views_count as "viewsCount", 
      p.featured,
      p.created_at as "createdAt",
      CASE WHEN l.id IS NOT NULL THEN true ELSE false END as "isLiked"
    FROM community_posts p
    LEFT JOIN community_likes l ON l.post_id = p.id AND (${userLikeCondition})
    WHERE ${whereSql}
    ${sortClause}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countQuery = `
    SELECT COUNT(*)::int as count 
    FROM community_posts p 
    WHERE ${whereSql}
  `;

  const [rawPosts, countResult] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(query, ...params),
    prisma.$queryRawUnsafe<any[]>(countQuery, ...params),
  ]);

  const total = countResult[0]?.count || 0;

  const formatted = rawPosts.map((p: any) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    author: p.authorName,
    authorAvatar: p.authorAvatar,
    likes: Number(p.likesCount || 0),
    views: Number(p.viewsCount || 0),
    prompt: p.prompt,
    toolUrl: p.toolUrl,
    toolName: p.toolName,
    previewUrl: p.previewUrl,
    mediaType: p.mediaType || "image",
    tags: Array.isArray(p.tags) ? p.tags : [],
    featured: Boolean(p.featured),
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    isLiked: Boolean(p.isLiked),
  }));

  return {
    posts: formatted,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function insertCommunityPost(data: {
  userId?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  title: string;
  category: string;
  prompt: string;
  toolName: string;
  toolUrl: string;
  previewUrl: string;
  mediaType?: string;
  tags?: string[];
}) {
  const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const tagsArray = Array.isArray(data.tags) ? data.tags : [];

  if ((prisma as any).communityPost) {
    try {
      return await (prisma as any).communityPost.create({
        data: {
          id,
          userId: data.userId || null,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar || null,
          title: data.title,
          category: data.category,
          prompt: data.prompt,
          toolName: data.toolName,
          toolUrl: data.toolUrl,
          previewUrl: data.previewUrl,
          mediaType: data.mediaType || "image",
          tags: tagsArray,
          likesCount: 1,
        },
      });
    } catch (e) {
      console.warn("[COMMUNITY_DB] Insert via Prisma model failed, falling back to raw SQL:", e);
    }
  }

  await prisma.$executeRaw`
    INSERT INTO community_posts (
      id, user_id, author_name, author_avatar, title, category, prompt, 
      tool_name, tool_url, preview_url, media_type, tags, likes_count, views_count, 
      featured, created_at, updated_at
    ) VALUES (
      ${id}, ${data.userId || null}, ${data.authorName}, ${data.authorAvatar || null}, 
      ${data.title}, ${data.category}, ${data.prompt}, ${data.toolName}, ${data.toolUrl}, 
      ${data.previewUrl}, ${data.mediaType || "image"}, ${tagsArray}::text[], 1, 0, 
      false, NOW(), NOW()
    )
  `;

  if (data.userId) {
    const likeId = `like_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await prisma.$executeRaw`
      INSERT INTO community_likes (id, post_id, user_id, created_at)
      VALUES (${likeId}, ${id}, ${data.userId}, NOW())
      ON CONFLICT DO NOTHING
    `.catch(() => {});
  }

  return { id, ...data, likesCount: 1 };
}

export async function togglePostLike(
  postId: string,
  authUserId: string | null,
  clientIp: string
) {
  // Check if like exists
  let existingLikes: any[] = [];

  if (authUserId) {
    existingLikes = await prisma.$queryRaw`
      SELECT id FROM community_likes 
      WHERE post_id = ${postId} AND user_id = ${authUserId}
      LIMIT 1
    `;
  } else {
    existingLikes = await prisma.$queryRaw`
      SELECT id FROM community_likes 
      WHERE post_id = ${postId} AND client_ip = ${clientIp} AND user_id IS NULL
      LIMIT 1
    `;
  }

  if (existingLikes.length > 0) {
    // Delete like and decrement count
    const likeId = existingLikes[0].id;
    await prisma.$executeRaw`
      DELETE FROM community_likes WHERE id = ${likeId}
    `;
    await prisma.$executeRaw`
      UPDATE community_posts 
      SET likes_count = GREATEST(0, likes_count - 1), updated_at = NOW()
      WHERE id = ${postId}
    `;

    const updated: any[] = await prisma.$queryRaw`
      SELECT likes_count as "likesCount" FROM community_posts WHERE id = ${postId}
    `;

    return { liked: false, likesCount: Number(updated[0]?.likesCount ?? 0) };
  } else {
    // Insert like and increment count
    const likeId = `like_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (authUserId) {
      await prisma.$executeRaw`
        INSERT INTO community_likes (id, post_id, user_id, created_at)
        VALUES (${likeId}, ${postId}, ${authUserId}, NOW())
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO community_likes (id, post_id, client_ip, created_at)
        VALUES (${likeId}, ${postId}, ${clientIp}, NOW())
      `;
    }

    await prisma.$executeRaw`
      UPDATE community_posts 
      SET likes_count = likes_count + 1, updated_at = NOW()
      WHERE id = ${postId}
    `;

    const updated: any[] = await prisma.$queryRaw`
      SELECT likes_count as "likesCount" FROM community_posts WHERE id = ${postId}
    `;

    return { liked: true, likesCount: Number(updated[0]?.likesCount ?? 1) };
  }
}
