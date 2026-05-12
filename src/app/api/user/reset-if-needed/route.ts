import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/user/reset-if-needed
 * Checks if the current user's credits need a daily reset (based on IST midnight).
 * This ensures users get their credits even if the cron job fails or they visit between cron runs.
 */
export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, creditsLastReset: true, plan: true, dailyCredits: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const lastReset = user.creditsLastReset ? new Date(user.creditsLastReset) : new Date(0);
    
    // Check if it's a new day in IST (GMT+5:30)
    const nowISTDate = now.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
    const lastResetISTDate = lastReset.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
    
    const isNewDay = nowISTDate !== lastResetISTDate;

    if (isNewDay) {
      console.log(`Resetting credits for user ${session.user.email} (New day in IST)`);
      const resetLimit = user.plan === 'pro' ? 1000 : 50;
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          dailyCredits: resetLimit,
          creditsLastReset: now,
          aiMessagesToday: 0,
        }
      });

      return NextResponse.json({
        success: true,
        resetPerformed: true,
        dailyCredits: updatedUser.dailyCredits
      });
    }

    return NextResponse.json({
      success: true,
      resetPerformed: false,
      dailyCredits: user.dailyCredits
    });

  } catch (error: any) {
    console.error('Reset check failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
