import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    // Base filter for shop redemptions / spends or community free gift
    const where: any = {
      OR: [
        { source: { in: ["shop_redemption", "free_gift_100"] } },
        { amount: { lt: 0 } },
      ],
    };

    if (category === "cosmetics") {
      where.AND = [
        {
          OR: [
            { metadata: { path: ["itemType"], equals: "avatar_frame" } },
            { metadata: { path: ["itemType"], equals: "name_gradient" } },
            { metadata: { path: ["itemType"], equals: "profile_theme" } },
            { metadata: { path: ["itemType"], equals: "creator_insignia" } },
            { metadata: { path: ["itemType"], equals: "studio_canopy" } },
          ],
        },
      ];
    } else if (category === "shields") {
      where.AND = [
        { metadata: { path: ["itemType"], equals: "streak_shield" } },
      ];
    } else if (category === "vouchers") {
      where.AND = [
        { metadata: { path: ["itemType"], equals: "shop_voucher" } },
      ];
    } else if (category === "free_gift") {
      where.AND = [
        {
          OR: [
            { source: "free_gift_100" },
            { metadata: { path: ["itemId"], equals: "sparks_free_gift_100" } },
          ],
        },
      ];
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [
      transactions,
      total,
      circulationAggregate,
      spentAggregate,
      freeGiftCount,
      totalSpendsCount,
    ] = await Promise.all([
      prisma.sparksTransaction.findMany({
        where,
        select: {
          id: true,
          userId: true,
          amount: true,
          balanceAfter: true,
          source: true,
          description: true,
          metadata: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
              customAvatarUrl: true,
              avatarFrame: true,
              nameGradient: true,
              insignia: true,
              plan: true,
              sparks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.sparksTransaction.count({ where }),
      prisma.user.aggregate({
        _sum: { sparks: true },
      }),
      prisma.sparksTransaction.aggregate({
        where: { amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.sparksTransaction.count({
        where: {
          OR: [
            { source: "free_gift_100" },
            { metadata: { path: ["itemId"], equals: "sparks_free_gift_100" } },
          ],
        },
      }),
      prisma.sparksTransaction.count({
        where: { amount: { lt: 0 } },
      }),
    ]);

    const totalSparksSpent = Math.abs(spentAggregate._sum.amount ?? 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalSparksInCirculation: circulationAggregate._sum.sparks ?? 0,
        totalSparksSpent,
        totalRedemptionsCount: totalSpendsCount,
        freeGiftClaimsCount: freeGiftCount,
      },
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN_SPARKS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
