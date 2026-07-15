import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          referrer: {
            select: {
              name: true,
              email: true,
            }
          },
          referred: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      }),
      prisma.referral.count(),
    ]);

    return NextResponse.json({
      success: true,
      referrals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    await logError("ADMIN_REFERRALS_GET", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
