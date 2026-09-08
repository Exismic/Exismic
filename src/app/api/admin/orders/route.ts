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
    const gateway = searchParams.get("gateway") || "all";
    const kind = searchParams.get("kind") || "all"; // all | subscription | credits
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (gateway !== "all") {
      where.provider = gateway;
    }

    if (kind === "subscription") {
      where.kind = { contains: "subscription", mode: "insensitive" };
    } else if (kind === "credits") {
      where.kind = { not: { contains: "subscription", mode: "insensitive" } };
    }

    if (search) {
      // Find matching users first
      const matchingUsers = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      const matchingUserIds = matchingUsers.map((u) => u.id);

      where.OR = [
        { userId: { in: matchingUserIds } },
        { providerPaymentId: { contains: search, mode: "insensitive" } },
        { providerOrderId: { contains: search, mode: "insensitive" } },
        { transactionReference: { contains: search, mode: "insensitive" } },
      ];
    }

    const [
      transactions,
      total,
      totalCount,
      subCount,
      inrSum,
      usdSum,
      activeProUsersCount,
    ] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.paymentTransaction.count({ where }),
      prisma.paymentTransaction.count(),
      prisma.paymentTransaction.count({
        where: { kind: { contains: "subscription", mode: "insensitive" } },
      }),
      prisma.paymentTransaction.aggregate({
        where: { currency: "INR" },
        _sum: { amount: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: { currency: "USD" },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { plan: "pro" } }),
    ]);

    // Gather unique user IDs to hydrate user data
    const userIds = Array.from(new Set(transactions.map((t) => t.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
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
        planExpiresAt: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const ordersWithUsers = transactions.map((tx) => ({
      ...tx,
      user: userMap.get(tx.userId) || {
        id: tx.userId,
        name: "Unknown Creator",
        username: null,
        email: null,
        image: null,
        customAvatarUrl: null,
        avatarFrame: null,
        nameGradient: null,
        insignia: null,
        plan: "free",
        planExpiresAt: null,
      },
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: totalCount,
        subscriptionsCount: subCount,
        creditPacksCount: totalCount - subCount,
        activeProUsers: activeProUsersCount,
        totalRevenueINR: (inrSum._sum.amount ?? 0) / 100, // stored in paise
        totalRevenueUSD: (usdSum._sum.amount ?? 0) / 100, // stored in cents
      },
      orders: ordersWithUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN_ORDERS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
