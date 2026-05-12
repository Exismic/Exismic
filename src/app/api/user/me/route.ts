import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/me
 * Securely fetches the current user's profile and credit data from Prisma.
 * This bypasses Supabase RLS issues by using the server-side admin client.
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        // Ensure we return the snake_case mapped fields for the hooks to read easily if needed
        daily_credits: user.dailyCredits,
        lifetime_credits: user.lifetimeCredits,
        credits_last_reset: user.creditsLastReset,
        ai_messages_today: user.aiMessagesToday,
        plan: user.plan
      }
    });

  } catch (error: any) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
