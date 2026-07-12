import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PRICING_CONFIG } from '@/config/pricing'

/**
 * POST /api/cron/reset-credits
 * 
 * This endpoint should be called daily at 12:00 AM IST
 * Configure in vercel.json with cron schedule
 * 
 * Requires Authorization header with CRON_SECRET
 * 
 * Example:
 * curl -X POST https://your-domain.com/api/cron/reset-credits \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  // Verify the request is from Vercel Cron
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
    console.log(`[CRON] Current time (IST): ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`)

    // Get current time
    const now = new Date()

    // Expire cancelled Pro memberships after their paid-through date.
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

    // Reset FREE users (50 credits)
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

    // Reset PRO users to the configured daily allowance. Cancelled users keep Pro until planExpiresAt.
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
    const successMessage = `✅ Daily credit reset completed: ${freeResult.count} free users (50 credits), ${proResult.count} pro users (${proDaily} credits) in ${duration}ms`

    console.log('[CRON]', successMessage)
    console.log('[CRON] Reset timestamp:', now.toISOString())

    return NextResponse.json({
      success: true,
      message: successMessage,
      stats: {
        freeUsersReset: freeResult.count,
        proUsersReset: proResult.count,
        expiredProUsersDowngraded: expiredProResult.count,
        creditsPerFreeUser: 50,
        creditsPerProUser: proDaily,
        duration: `${duration}ms`,
        resetTime: now.toISOString(),
        resetTimeIST: now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      }
    }, { status: 200 })
  } catch (err) {
    const duration = Date.now() - start
    const errorMessage = String(err)
    
    console.error('[CRON] ❌ Error during credit reset:', err)
    console.error('[CRON] Duration before error:', `${duration}ms`)

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

/**
 * Optional: GET endpoint for testing/monitoring
 * Returns the last reset status
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Check if request is authorized
    const authHeader = request.headers.get('authorization')
    const isAuthorized = Boolean(process.env.CRON_SECRET) && authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get some stats about user credits
    const userStats = await prisma.user.groupBy({
      by: ['plan'],
      _count: true
    })

    const stats = {
      timestamp: new Date().toISOString(),
      users: userStats.reduce((acc, stat) => {
        acc[stat.plan] = stat._count
        return acc
      }, {} as Record<string, number>),
      authorized: isAuthorized
    }

    return NextResponse.json({
      message: 'Cron endpoint is running',
      stats,
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
