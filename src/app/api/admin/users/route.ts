import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export async function GET(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "all";
    const role = searchParams.get("role") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (plan !== "all") {
      where.plan = plan;
    }

    if (role !== "all") {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          plan: true,
          dailyCredits: true,
          bonusCredits: true,
          createdAt: true,
          image: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { userId, plan, role, dailyCredits, bonusCredits, status, action, giftType, giftAmount } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (action === "send-gift") {
      if (!giftType || !giftAmount || giftAmount <= 0) {
        return NextResponse.json({ error: "Invalid gift parameter values" }, { status: 400 });
      }

      const giftTitle = giftType === "credits" ? "🎁 Admin Gift: Bonus Credits!" : "🎁 Admin Gift: Pro Tier Access!";
      const giftMsg = giftType === "credits"
        ? `You've been rewarded +${giftAmount} bonus credits by our administration panel. Claim them below.`
        : `You've been rewarded ${giftAmount} days of premium Pro membership access by our administration panel. Claim below.`;
      const giftNotificationType = `claim:${giftType}:${giftAmount}`;

      await prisma.notification.create({
        data: {
          userId,
          title: giftTitle,
          message: giftMsg,
          type: giftNotificationType,
        }
      });

      return NextResponse.json({ success: true });
    }

    const updateData: any = {};

    if (plan !== undefined) updateData.plan = plan;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    
    if (dailyCredits !== undefined) {
      const parsedVal = parseInt(dailyCredits, 10);
      if (isNaN(parsedVal)) return NextResponse.json({ error: "Invalid dailyCredits value" }, { status: 400 });
      updateData.dailyCredits = parsedVal;
    }

    if (bonusCredits !== undefined) {
      const parsedVal = parseInt(bonusCredits, 10);
      if (isNaN(parsedVal)) return NextResponse.json({ error: "Invalid bonusCredits value" }, { status: 400 });
      updateData.bonusCredits = parsedVal;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        dailyCredits: true,
        bonusCredits: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
