import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser =
      (await prisma.user.findUnique({ where: { id: user.id } })) ||
      (await prisma.user.findUnique({ where: { email: user.email } }));

    if (!dbUser) {
      return NextResponse.json(
        { error: "User record not found." },
        { status: 404 }
      );
    }

    const currentPlan = (dbUser.plan || "free").toLowerCase();
    if (currentPlan !== "pro") {
      return NextResponse.json(
        { error: "Retention discount is only available for active Pro members." },
        { status: 400 }
      );
    }

    // Check if user has already claimed a retention discount
    const existingDiscountOrder = await prisma.paymentOrder.findFirst({
      where: {
        userId: dbUser.id,
        gateway: "retention_discount",
      },
    });

    if (existingDiscountOrder) {
      return NextResponse.json(
        { error: "You have already claimed your 30% retention discount for this account." },
        { status: 400 }
      );
    }

    // Record retention discount order for audit and future billing discount calculation
    await prisma.paymentOrder.create({
      data: {
        userId: dbUser.id,
        planId: "pro",
        market: "GLOBAL",
        currency: "USD",
        amount: 0,
        gateway: "retention_discount",
        status: "applied",
        credits: 0,
        metadata: {
          discountPercent: 30,
          appliedAt: new Date().toISOString(),
          consumed: false,
        },
      },
    });

    // Upsert UserBilling record to ensure subscription remains active
    await prisma.userBilling.upsert({
      where: { userId: dbUser.id },
      update: {
        status: "active",
      },
      create: {
        userId: dbUser.id,
        planId: "pro",
        status: "active",
      },
    });

    // Reset subscription status on User to active if it was pending cancellation
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        subscriptionStatus: "active",
      },
    });

    // Send in-app notification confirming discount
    createNotification(
      dbUser.id,
      "30% Discount Applied!",
      "You've received a 30% discount on your next billing cycle. Thank you for staying with Exismic Pro!",
      "success"
    ).catch((err) => {
      console.error("Failed to send discount notification:", err);
    });

    return NextResponse.json({
      success: true,
      message: "30% discount applied to your next billing cycle!",
      discountPercentage: 30,
    });
  } catch (error: unknown) {
    console.error("Apply discount error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to apply discount.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
