import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Daily Credit Reset Cron Job
 * Resets daily credits for all users at 12:00 AM IST (18:30 UTC).
 * Standard Users: 50 credits
 * Pro Users: 1000 credits
 */

export async function GET(req: Request) {
  try {
    // 1. Verify Authorization
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting daily credit reset...');

    // 2. Perform Reset
    // We update all users, setting dailyCredits based on their plan
    
    // Update Standard Users (Plan: free)
    const standardReset = await prisma.user.updateMany({
      where: {
        plan: 'free',
      },
      data: {
        dailyCredits: 50,
        creditsLastReset: new Date(),
      },
    });

    // Update Pro Users (Plan: pro)
    const proReset = await prisma.user.updateMany({
      where: {
        plan: 'pro',
      },
      data: {
        dailyCredits: 1000,
        creditsLastReset: new Date(),
      },
    });

    console.log(`Credit reset complete. Standard: ${standardReset.count}, Pro: ${proReset.count}`);

    return NextResponse.json({
      success: true,
      message: 'Credits reset successfully',
      stats: {
        standard: standardReset.count,
        pro: proReset.count
      }
    });

  } catch (error: any) {
    console.error('Cron reset failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
