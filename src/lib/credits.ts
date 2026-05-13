import { prisma } from './prisma'
import { PRICING_CONFIG } from '@/config/pricing'

const FREE_DAILY_CREDITS = 50
const PRO_DAILY_CREDITS = PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS

/**
 * Check and reset credits if it's a new day (IST timezone)
 * Should be called server-side
 */
export async function resetCreditsIfNewDay(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyCredits: true,
        creditsLastReset: true,
        plan: true,
      }
    })

    if (!user) {
      console.warn(`[CREDITS] User not found: ${userId}`)
      return null
    }

    const now = new Date()
    const lastReset = user.creditsLastReset || new Date(0)

    // Compare dates in IST timezone
    const nowISTString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    const lastResetISTString = lastReset.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    
    const nowISTDate = new Date(nowISTString)
    const lastResetISTDate = new Date(lastResetISTString)

    // Check if it's a new day (different calendar day in IST)
    const isNewDay = 
      nowISTDate.getFullYear() !== lastResetISTDate.getFullYear() ||
      nowISTDate.getMonth() !== lastResetISTDate.getMonth() ||
      nowISTDate.getDate() !== lastResetISTDate.getDate()

    if (isNewDay) {
      const creditLimit = user.plan === 'pro' ? PRO_DAILY_CREDITS : FREE_DAILY_CREDITS

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          dailyCredits: creditLimit,
          creditsLastReset: now,
          aiMessagesToday: 0,
          aiMessagesReset: now,
        },
        select: {
          dailyCredits: true,
          lifetimeCredits: true,
          creditsLastReset: true,
          aiMessagesToday: true,
          plan: true,
        }
      })

      console.log(`[CREDITS] Daily reset for user ${userId}: ${creditLimit} credits restored`)
      return updatedUser
    }

    return user
  } catch (err) {
    console.error(`[CREDITS] Error resetting credits for ${userId}:`, err)
    throw err
  }
}

/**
 * Initialize credits for a new user
 */
export async function initializeUserCredits(userId: string) {
  try {
    const now = new Date()
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCredits: FREE_DAILY_CREDITS,
        lifetimeCredits: 0,
        creditsLastReset: now,
        aiMessagesToday: 0,
        aiMessagesReset: now,
        plan: 'free',
      },
      select: {
        id: true,
        dailyCredits: true,
        lifetimeCredits: true,
        plan: true,
      }
    })

    console.log(`[CREDITS] Initialized user ${userId} with ${FREE_DAILY_CREDITS} credits`)
    return user
  } catch (err) {
    console.error(`[CREDITS] Error initializing credits for ${userId}:`, err)
    throw err
  }
}

/**
 * Deduct credits from user (with fallback: lifetime → daily)
 */
export async function deductCredits(userId: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyCredits: true,
        lifetimeCredits: true,
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const totalAvailable = user.dailyCredits + user.lifetimeCredits
    if (totalAvailable < amount) {
      return { success: false, error: 'Insufficient credits', available: totalAvailable }
    }

    let newLifetime = user.lifetimeCredits
    let newDaily = user.dailyCredits

    // Deduct from lifetime first (these don't reset)
    if (newLifetime >= amount) {
      newLifetime -= amount
    } else {
      const remaining = amount - newLifetime
      newLifetime = 0
      newDaily -= remaining
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        lifetimeCredits: newLifetime,
        dailyCredits: newDaily,
      },
      select: {
        dailyCredits: true,
        lifetimeCredits: true,
      }
    })

    console.log(`[CREDITS] Deducted ${amount} credits from user ${userId}`)
    return { success: true, data: updated }
  } catch (err) {
    console.error(`[CREDITS] Error deducting credits from ${userId}:`, err)
    return { success: false, error: String(err) }
  }
}

/**
 * Add credits to user (lifetime - permanent credits)
 */
export async function addCredits(userId: string, amount: number, reason?: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        lifetimeCredits: {
          increment: amount
        }
      },
      select: {
        lifetimeCredits: true,
      }
    })

    console.log(`[CREDITS] Added ${amount} credits to user ${userId}${reason ? ` (${reason})` : ''}`)
    return { success: true, data: user }
  } catch (err) {
    console.error(`[CREDITS] Error adding credits to ${userId}:`, err)
    return { success: false, error: String(err) }
  }
}

/**
 * Get user credits (with daily reset check)
 */
export async function getUserCredits(userId: string) {
  try {
    // First, check if credits need resetting
    await resetCreditsIfNewDay(userId)

    // Then fetch current credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyCredits: true,
        lifetimeCredits: true,
        creditsLastReset: true,
        aiMessagesToday: true,
        plan: true,
      }
    })

    return user
  } catch (err) {
    console.error(`[CREDITS] Error getting credits for ${userId}:`, err)
    return null
  }
}
