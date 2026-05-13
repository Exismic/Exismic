import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/emails'

/**
 * Auth Callback Route - Handles OAuth/Email auth completion
 * Path: /auth/callback
 * 
 * This route:
 * 1. Exchanges auth code for session
 * 2. Creates new user with 50 free credits
 * 3. Sends welcome email
 * 4. Redirects to dashboard
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || searchParams.get('returnUrl') || '/'

  if (code) {
    try {
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error || !session?.user?.id) {
        console.error('[AUTH] Auth exchange failed:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }

      const userId = session.user.id
      const email = session.user.email
      const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name

      // Get current time in IST for accurate credits_last_reset
      const now = new Date()

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!existingUser) {
        // NEW USER - Initialize with 50 free credits
        console.log(`[AUTH] 🆕 New user signup: ${userId} (${email})`)

        // Create user with initial credits
        await prisma.user.create({
          data: {
            id: userId,
            email,
            name: userName,
            dailyCredits: 50, // 50 free credits on signup
            lifetimeCredits: 0,
            plan: 'free',
            creditsLastReset: now,
            aiMessagesToday: 0,
            aiMessagesReset: now,
          }
        })

        console.log(`[AUTH] ✅ User created with 50 daily credits: ${userId}`)

        // Send welcome email (non-blocking)
        try {
          await sendWelcomeEmail(email)
          console.log(`[AUTH] 📧 Welcome email sent to: ${email}`)
        } catch (err) {
          console.error(`[AUTH] ⚠️  Welcome email failed for ${email}:`, err)
          // Don't block signup if email fails
        }
      } else {
        // EXISTING USER - Just update sync fields if needed
        console.log(`[AUTH] 🔄 Existing user login: ${userId} (${email})`)

        // Only update name if it changed and we got new data
        if (userName && userName !== existingUser.name) {
          await prisma.user.update({
            where: { id: userId },
            data: { name: userName }
          })
        }
      }

      // Determine redirect URL
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      let redirectUrl: string

      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }

      console.log(`[AUTH] ✅ Auth completed, redirecting to: ${redirectUrl}`)

      return NextResponse.redirect(redirectUrl)
    } catch (err) {
      console.error('[AUTH] ❌ Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
  }

  // No code provided
  console.warn('[AUTH] No auth code provided')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

/**
 * Optional: Add error response for debugging
 * Helps identify which part failed
 */
export async function POST(request: Request) {
  // Fallback for any POST attempts
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for auth callback.' },
    { status: 405 }
  )
}
