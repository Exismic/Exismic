import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PRICING_CONFIG } from '@/config/pricing'

/**
 * POST /api/cron/reset-credits
 * 
 * This endpoint should be called daily at 12:00 AM IST
 * Configure in vercel.json with cron schedule
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const expectedAuth = cronSecret ? `Bearer ${cronSecret}` : null

  if (!expectedAuth || !authHeader || authHeader !== expectedAuth) {
    console.warn('[CRON] Unauthorized cron attempt')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const start = Date.now()

  try {
    console.log('[CRON] ⏰ Starting daily credit reset...')
    const now = new Date()

    // 1. Expire cancelled Pro memberships after their paid-through date
    const expiredProResult = await prisma.user.updateMany({
      where: {
        plan: 'pro',
        subscriptionStatus: { in: ['cancelled', 'expired'] },
        planExpiresAt: { lte: now },
      },
      data: {
        plan: 'free',
        subscriptionStatus: 'expired',
        subscriptionId: null,
        dailyCredits: 50,
        aiGenerationsLimit: 50,
        creditsLastReset: now,
        aiMessagesToday: 0,
        aiMessagesReset: now,
      },
    })

    // 2. Reset FREE users (50 credits)
    const freeResult = await prisma.user.updateMany({
      where: { plan: 'free' },
      data: {
        dailyCredits: 50,
        bonusCredits: 0,
        creditsLastReset: now,
        aiMessagesToday: 0,
        aiMessagesReset: now,
      }
    })

    // 3. Rollover unused daily credits for PRO users who have Credit Stacking enabled
    const proStackingUsers = await prisma.user.findMany({
      where: {
        plan: 'pro',
        hasCreditStacking: true,
        OR: [
          { planExpiresAt: null },
          { planExpiresAt: { gt: now } },
          { subscriptionStatus: 'active' },
        ],
      },
      select: {
        id: true,
        dailyCredits: true,
        stackedCredits: true,
        maxStackedCredits: true,
      },
    })

    let stackedCount = 0
    for (const user of proStackingUsers) {
      const unusedDaily = Math.max(0, user.dailyCredits)
      if (unusedDaily > 0) {
        const cap = user.maxStackedCredits || 2500
        const newStacked = Math.min(cap, user.stackedCredits + unusedDaily)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            stackedCredits: newStacked,
          },
        })
        stackedCount++
      }
    }

    // 4. Reset PRO users to standard daily allowance (500 credits)
    const proDaily = PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS
    const proResult = await prisma.user.updateMany({
      where: {
        plan: 'pro',
        OR: [
          { planExpiresAt: null },
          { planExpiresAt: { gt: now } },
          { subscriptionStatus: 'active' },
        ],
      },
      data: {
        dailyCredits: proDaily,
        bonusCredits: 0,
        creditsLastReset: now,
        aiMessagesToday: 0,
        aiMessagesReset: now,
      }
    })

    const duration = Date.now() - start
    const successMessage = `✅ Daily credit reset completed: ${freeResult.count} free users (50 credits), ${proResult.count} pro users (${proDaily} credits), ${stackedCount} users banked stacked credits in ${duration}ms`

    console.log('[CRON]', successMessage)

    return NextResponse.json({
      success: true,
      message: successMessage,
      stats: {
        freeUsersReset: freeResult.count,
        proUsersReset: proResult.count,
        proUsersStacked: stackedCount,
        expiredProUsersDowngraded: expiredProResult.count,
        creditsPerFreeUser: 50,
        creditsPerProUser: proDaily,
        duration: `${duration}ms`,
        resetTime: now.toISOString(),
      }
    }, { status: 200 })
  } catch (err) {
    const duration = Date.now() - start
    const errorMessage = String(err)
    
    console.error('[CRON] ❌ Error during credit reset:', err)

    return NextResponse.json(
      {
        error: 'Credit reset failed',
        message: errorMessage,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const isAuthorized = Boolean(process.env.CRON_SECRET) && authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userStats = await prisma.user.groupBy({
      by: ['plan'],
      _count: true
    })

    return NextResponse.json({
      message: 'Cron endpoint is running',
      stats: {
        timestamp: new Date().toISOString(),
        users: userStats.reduce((acc, stat) => {
          acc[stat.plan] = stat._count
          return acc
        }, {} as Record<string, number>),
        authorized: isAuthorized
      },
      nextReset: {
        description: 'Daily reset runs at 12:00 AM IST',
        cronExpression: '30 18 * * *',
        timezone: 'UTC (18:30 UTC = 12:00 AM IST)'
      }
    })
  } catch (err) {
    console.error('[CRON] Error in GET:', err)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: String(err) },
      { status: 500 }
    )
  }
}
