import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/user/deduct-credits
 * Deducts a specified amount of credits from the current user.
 * Prioritizes daily credits, then lifetime credits.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount = 1 } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, dailyCredits: true, lifetimeCredits: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalAvailable = user.dailyCredits + user.lifetimeCredits;

    if (totalAvailable < amount) {
      return NextResponse.json({ 
        error: 'Insufficient credits', 
        remaining: totalAvailable 
      }, { status: 403 });
    }

    let newDaily = user.dailyCredits;
    let newLifetime = user.lifetimeCredits;

    // Deduction logic: Use daily credits first, then lifetime
    if (newDaily >= amount) {
      newDaily -= amount;
    } else {
      const remaining = amount - newDaily;
      newDaily = 0;
      newLifetime -= remaining;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyCredits: newDaily,
        lifetimeCredits: newLifetime
      }
    });

    return NextResponse.json({
      success: true,
      remaining: updatedUser.dailyCredits + updatedUser.lifetimeCredits,
      daily: updatedUser.dailyCredits,
      lifetime: updatedUser.lifetimeCredits
    });

  } catch (error: any) {
    console.error('Credit deduction failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
