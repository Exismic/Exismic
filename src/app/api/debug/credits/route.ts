import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * DEBUG ENDPOINT - Check user credits and auth
 * GET /api/debug/credits
 * 
 * Shows:
 * - Current user info
 * - Database credits
 * - Auth status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'Not authenticated',
        message: 'You need to be logged in'
      }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`[DEBUG] Checking credits for user: ${userId}`)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        dailyCredits: true,
        lifetimeCredits: true,
        plan: true,
        creditsLastReset: true,
        createdAt: true,
      }
    })

    if (!user) {
      console.warn(`[DEBUG] User not found in database: ${userId}`)
      return NextResponse.json({
        error: 'User not found in database',
        userId: userId,
        message: 'User exists in Supabase auth but not in database'
      }, { status: 404 })
    }

    console.log(`[DEBUG] User found:`, user)

    return NextResponse.json({
      success: true,
      message: 'User found with credits',
      data: {
        auth: {
          userId: session.user.id,
          email: session.user.email,
          authProvider: session.user.user_metadata?.provider || 'unknown'
        },
        database: {
          id: user.id,
          email: user.email,
          name: user.name,
          dailyCredits: user.dailyCredits,
          lifetimeCredits: user.lifetimeCredits,
          totalCredits: user.dailyCredits + user.lifetimeCredits,
          plan: user.plan,
          creditsLastReset: user.creditsLastReset,
          createdAt: user.createdAt,
        }
      }
    })

  } catch (err) {
    console.error('[DEBUG] Error:', err)
    return NextResponse.json({
      error: 'Debug error',
      message: String(err)
    }, { status: 500 })
  }
}
