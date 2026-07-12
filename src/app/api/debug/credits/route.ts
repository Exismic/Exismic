import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { isAdminConfigured, isAdminEmail } from '@/lib/admin'

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
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Debug endpoint disabled' }, { status: 404 })
    }

    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser?.id || !authUser.email) {
      return NextResponse.json({
        error: 'Not authenticated',
        message: 'You need to be logged in'
      }, { status: 401 })
    }

    if (!isAdminEmail(authUser.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const userId = authUser.id
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
      console.log(`[DEBUG] 🛠️ User not found in database. Initializing user record for: ${userId}`)
      
      const email = authUser.email
      const userName = authUser.user_metadata?.full_name ||
                       authUser.user_metadata?.name ||
                       email?.split('@')[0] || 'User'
      
      const newUser = await prisma.user.upsert({
        where: { id: userId },
        update: {
          aiMessagesToday: 0,
          aiMessagesReset: new Date(),
        },
        create: {
          id: userId,
          email: email || '',
          name: userName,
          dailyCredits: 50,
          lifetimeCredits: 0,
          plan: 'free',
          creditsLastReset: new Date(),
          aiMessagesToday: 0,
          aiMessagesReset: new Date(),
        }
      })

      return NextResponse.json({
        success: true,
        message: 'User record was missing and has been initialized with 50 credits',
        data: {
          auth: {
            userId: authUser.id,
            email: authUser.email,
          },
          database: {
            ...newUser,
            totalCredits: 50
          }
        }
      })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        dailyCredits: true,
        lifetimeCredits: true,
        aiMessagesToday: true,
        plan: true,
        creditsLastReset: true,
        createdAt: true,
      }
    })

    console.log(`[DEBUG] User found:`, currentUser)

    return NextResponse.json({
      success: true,
      message: 'User found',
      data: {
        auth: {
          userId: authUser.id,
          email: authUser.email,
          authProvider: authUser.user_metadata?.provider || 'unknown'
        },
        database: {
          id: currentUser?.id,
          email: currentUser?.email,
          name: currentUser?.name,
          dailyCredits: currentUser?.dailyCredits,
          lifetimeCredits: currentUser?.lifetimeCredits,
          aiMessagesToday: currentUser?.aiMessagesToday,
          totalCredits: (currentUser?.dailyCredits || 0) + (currentUser?.lifetimeCredits || 0),
          plan: currentUser?.plan,
          creditsLastReset: currentUser?.creditsLastReset,
          createdAt: currentUser?.createdAt,
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
