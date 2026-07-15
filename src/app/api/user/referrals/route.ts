import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

function generateReferralCode(email: string) {
  const prefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${rand}`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { referralCode: true, email: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate referral code if missing
    if (!dbUser.referralCode && dbUser.email) {
      const code = generateReferralCode(dbUser.email);
      dbUser = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code },
        select: { referralCode: true, email: true },
      });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referred: {
          select: {
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total earnings from creditTransactions of type referral_reward or referral_commission
    const earnings = await prisma.creditTransaction.aggregate({
      where: {
        userId: user.id,
        transactionType: { in: ["referral_reward", "referral_commission"] },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      referralCode: dbUser.referralCode,
      totalReferred: referrals.length,
      totalEarned: earnings._sum.amount ?? 0,
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.referred.name || "Explorer",
        avatar: r.referred.image,
        email: r.referred.email ? `${r.referred.email.split("@")[0].slice(0, 3)}***@${r.referred.email.split("@")[1]}` : null,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("[REFERRALS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
