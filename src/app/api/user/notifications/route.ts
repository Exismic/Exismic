import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getOrCreateUser } from "@/lib/user-access";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    const userId = dbUser.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (err) {
    console.error("[Notifications API GET] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    const userId = dbUser.id;

    const body = await req.json();
    const { action, id } = body;

    if (action === "mark-read") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
      });
    } else if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await prisma.notification.deleteMany({
        where: { id, userId },
      });
    } else if (action === "mark-all-read") {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else if (action === "clear-all") {
      await prisma.notification.deleteMany({
        where: { userId },
      });
    } else if (action === "claim") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      
      const notification = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notification) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      if (!notification.type.startsWith("claim:")) {
        return NextResponse.json({ error: "This notification is not claimable" }, { status: 400 });
      }

      const parts = notification.type.split(":");
      const rewardType = parts[1]; // "credits" or "pro"
      const amount = parseInt(parts[2], 10) || 0;

      if (rewardType === "credits" && amount > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: userId },
            data: {
              bonusCredits: { increment: amount },
              lifetimeCredits: { increment: amount },
            },
          });

          await tx.creditTransaction.create({
            data: {
              userId,
              amount: amount,
              balanceType: "bonus",
              transactionType: "admin_reward",
              description: `Claimed admin reward: +${amount} credits`,
            },
          });

          await tx.notification.delete({
            where: { id },
          });
        });
      } else if (rewardType === "pro" && amount > 0) {
        const userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: { planExpiresAt: true, plan: true },
        });

        let currentExpiry = userRecord?.planExpiresAt ? new Date(userRecord.planExpiresAt) : new Date();
        if (currentExpiry < new Date()) {
          currentExpiry = new Date();
        }
        const newExpiry = new Date(currentExpiry.getTime() + amount * 24 * 60 * 60 * 1000);

        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: userId },
            data: {
              plan: "pro",
              planExpiresAt: newExpiry,
              subscriptionStatus: "active",
            },
          });

          await tx.notification.delete({
            where: { id },
          });
        });
      } else {
        return NextResponse.json({ error: "Invalid claimable reward type" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Notifications API POST] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
