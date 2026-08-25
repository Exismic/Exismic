import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { action, userId, fileId, reason, amount, balanceType } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // 1. Suspend User
    if (action === "suspend") {
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

      await prisma.user.update({
        where: { id: userId },
        data: { status: "suspended" },
      });

      await createNotification(
        userId,
        "🚨 Account Suspended",
        reason || "Your account has been temporarily suspended by system administrators due to a violation of usage policies.",
        "warning"
      );

      return NextResponse.json({ success: true, message: "User account suspended successfully." });
    }

    // 2. Unsuspend User
    if (action === "unsuspend") {
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

      await prisma.user.update({
        where: { id: userId },
        data: { status: "active" },
      });

      await createNotification(
        userId,
        "✅ Account Re-Activated",
        "Your account privileges have been restored. You may now continue using Exismic tools.",
        "success"
      );

      return NextResponse.json({ success: true, message: "User account re-activated successfully." });
    }

    // 3. Warn User
    if (action === "warn") {
      if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

      const warningText = reason || "Automated usage anomaly or excessive request rate detected. Please ensure all activity complies with our fair use guidelines.";

      await createNotification(
        userId,
        "⚠️ Administrator Warning",
        warningText,
        "warning"
      );

      return NextResponse.json({ success: true, message: "Official warning dispatched to user." });
    }

    // 4. Adjust Credits (Add / Deduct)
    if (action === "adjust_credits") {
      const parsedAmount = parseInt(String(amount), 10);
      if (!userId || isNaN(parsedAmount) || parsedAmount === 0) {
        return NextResponse.json({ error: "Valid userId and non-zero amount are required." }, { status: 400 });
      }

      const targetBalance = balanceType === "daily" ? "daily" : balanceType === "bonus" ? "bonus" : "lifetime";

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { dailyCredits: true, bonusCredits: true, lifetimeCredits: true },
        });

        if (!user) throw new Error("User not found");

        const updateData: any = {};
        if (targetBalance === "lifetime") {
          updateData.lifetimeCredits = Math.max(0, (user.lifetimeCredits || 0) + parsedAmount);
        } else if (targetBalance === "bonus") {
          updateData.bonusCredits = Math.max(0, (user.bonusCredits || 0) + parsedAmount);
        } else {
          updateData.dailyCredits = Math.max(0, (user.dailyCredits || 0) + parsedAmount);
          updateData.creditsLastReset = new Date();
        }

        const savedUser = await tx.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            dailyCredits: true,
            bonusCredits: true,
            lifetimeCredits: true,
          }
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            amount: parsedAmount,
            balanceType: targetBalance,
            transactionType: "admin_adjustment",
            description: reason || `Admin balance adjustment (${parsedAmount > 0 ? `+${parsedAmount}` : parsedAmount} credits)`,
            metadata: {
              adminId: auth.user!.id,
              reason: reason || "Manual administrator adjustment",
            },
          },
        });

        return savedUser;
      });

      await createNotification(
        userId,
        parsedAmount > 0 ? "🎁 Credits Credited by Admin" : "⚠️ Balance Adjustment",
        `An administrator adjusted your ${targetBalance} balance by ${parsedAmount > 0 ? `+${parsedAmount}` : parsedAmount} credits. Reason: ${reason || "Account adjustment"}.`,
        parsedAmount > 0 ? "success" : "info"
      );

      const totalBalance = (updatedUser.dailyCredits || 0) + (updatedUser.bonusCredits || 0) + (updatedUser.lifetimeCredits || 0);

      return NextResponse.json({ 
        success: true, 
        message: `Successfully adjusted credits by ${parsedAmount > 0 ? `+${parsedAmount}` : parsedAmount}. New total: ${totalBalance}c.`,
        user: updatedUser
      });
    }

    // 5. Delete Output Asset
    if (action === "delete_asset") {
      if (!fileId) return NextResponse.json({ error: "fileId is required" }, { status: 400 });

      await prisma.userFile.delete({
        where: { id: fileId },
      });

      return NextResponse.json({ success: true, message: "Asset purged successfully." });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN_MODERATION_ACTION_ERROR]", error);
    return NextResponse.json({ error: "Failed to execute moderation action" }, { status: 500 });
  }
}
