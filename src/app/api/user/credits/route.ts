import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getUserCredits, deductCredits } from '@/lib/credits'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/credits
 * Fetch current user's credits (with automatic daily reset check)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const credits = await getUserCredits(userId)

    if (!credits) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { getTodayInIndia } = await import('@/lib/credits');
    const claimDate = getTodayInIndia();
    const todayClaim = await prisma.creditShopClaim.findUnique({
      where: {
        userId_claimDate: {
          userId,
          claimDate,
        },
      },
      select: { amount: true, rarity: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        dailyCredits: credits.dailyCredits,
        bonusCredits: credits.bonusCredits,
        lifetimeCredits: credits.lifetimeCredits,
        purchasedCredits: credits.lifetimeCredits,
        totalCredits: credits.dailyCredits + credits.bonusCredits + credits.lifetimeCredits,
        aiMessagesToday: credits.aiMessagesToday,
        plan: credits.plan,
        lastReset: credits.creditsLastReset,
        todayClaim: todayClaim || null,
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (err) {
    console.error('[API] Error fetching credits:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/credits
 * Deduct credits or consume AI message usage.
 * 
 * Body:
 * {
 *   action: 'deduct' | 'consume-message',
 *   amount: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user?.id) {
      console.error('[API] Auth error or no user:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const { action, amount } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    const normalizedAmount = Number(amount ?? 0)
    if (action === 'deduct' && (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0 || normalizedAmount > 10000)) {
      return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
    }

    console.log(`[API] Processing credit action: ${action} for user: ${userId}`)

    let result: { success: boolean; error?: string; data?: unknown } = { success: true }
    
    try {
      if (action === 'deduct') {
        result = await deductCredits(userId, normalizedAmount)
      } else if (action === 'consume-message') {
        const now = new Date()
        const updated = await prisma.user.upsert({
          where: { id: userId },
          update: {
            aiMessagesToday: { increment: 1 },
            updatedAt: now
          },
          create: {
            id: userId,
            email: user.email || null,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
            dailyCredits: 50,
            bonusCredits: 0,
            lifetimeCredits: 0,
            aiMessagesToday: 1,
            plan: 'free',
            createdAt: now,
            updatedAt: now
          },
          select: { aiMessagesToday: true }
        })
        result = { success: true, data: updated }
      } else {
        return NextResponse.json(
          { error: 'Invalid action. Use "deduct" or "consume-message"' },
          { status: 400 }
        )
      }
    } catch (actionErr) {
      console.error(`[API] Error performing action ${action}:`, actionErr)
      throw actionErr
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.data || result })
  } catch (err) {
    console.error('[API] Global POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
