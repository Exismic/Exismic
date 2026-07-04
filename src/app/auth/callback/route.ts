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
 * 3. Redirects to dashboard
 */
export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const tokenHash = searchParams.get('token_hash')
    const verificationType = searchParams.get('type')
    const next = searchParams.get('next') || '/'

    console.log('[AUTH] Callback triggered')
    console.log('[AUTH] Code:', code ? 'present' : 'missing')
    console.log('[AUTH] Token hash:', tokenHash ? 'present' : 'missing')
    console.log('[AUTH] Next:', next)

    if (!code && (!tokenHash || verificationType !== 'magiclink')) {
      console.warn('[AUTH] No valid auth code or magic-link token provided')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const supabase = await createClient()
    
    const { data, error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: 'magiclink',
        })

    if (error) {
      console.error('[AUTH] Session exchange error:', error.message)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const session = data.session
    if (!session?.user?.id) {
      console.error('[AUTH] No user in session')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const userId = session.user.id
    const email = session.user.email
    const userName = session.user.user_metadata?.full_name || 
                     session.user.user_metadata?.name || 
                     email?.split('@')[0] || 'User'
    const providerAvatar =
      session.user.user_metadata?.avatar_url ||
      session.user.user_metadata?.picture ||
      session.user.user_metadata?.user_avatar ||
      null
    const discordIdentity = session.user.identities?.find(identity => identity.provider === 'discord')
    const discordUserId = discordIdentity?.identity_data?.sub || discordIdentity?.id || null
    const discordUsername =
      discordIdentity?.identity_data?.preferred_username ||
      discordIdentity?.identity_data?.name ||
      session.user.user_metadata?.preferred_username ||
      null

    const now = new Date()

    console.log(`[AUTH] User: ${userId}`)
    console.log(`[AUTH] Email: ${email}`)

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          dailyCredits: true,
          image: true,
          customAvatarUrl: true
        }
      })

      if (!existingUser) {
        // NEW USER
        console.log(`[AUTH] 🆕 Creating new user: ${userId}`)

        const newUser = await prisma.user.create({
          data: {
            id: userId,
            email: email || '',
            name: userName,
            image: providerAvatar,
            discordUserId: discordUserId ? String(discordUserId) : null,
            discordUsername: discordUsername ? String(discordUsername) : null,
            dailyCredits: 50,
            lifetimeCredits: 0,
            plan: 'free',
            creditsLastReset: now,
            aiMessagesToday: 0,
            aiMessagesReset: now,
          }
        })

        console.log(`[AUTH] ✅ New user created with 50 credits: ${userId}`)
        console.log(`[AUTH] User data:`, newUser)

        if (email) {
          const welcomeSent = await sendWelcomeEmail(email);
          if (!welcomeSent) {
            console.error(`[AUTH] Welcome email provider rejected delivery for ${email}`);
          }
        }
      } else {
        // EXISTING USER - Just log
        console.log(`[AUTH] 🔄 Existing user login: ${userId}`)
        console.log(`[AUTH] Current credits: ${existingUser.dailyCredits}`)

        if (existingUser.customAvatarUrl) {
          await supabase.auth.updateUser({
            data: {
              avatar_url: existingUser.customAvatarUrl,
              picture: existingUser.customAvatarUrl,
              custom_avatar_url: existingUser.customAvatarUrl,
            }
          })
        } else if (providerAvatar && providerAvatar !== existingUser.image) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              image: providerAvatar,
              ...(discordUserId ? { discordUserId: String(discordUserId) } : {}),
              ...(discordUsername ? { discordUsername: String(discordUsername) } : {}),
            }
          })
          await supabase.auth.updateUser({
            data: {
              avatar_url: providerAvatar,
              picture: providerAvatar,
            }
          })
        } else if (discordUserId || discordUsername) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              ...(discordUserId ? { discordUserId: String(discordUserId) } : {}),
              ...(discordUsername ? { discordUsername: String(discordUsername) } : {}),
            }
          })
        }
      }
    } catch (dbError) {
      console.error('[AUTH] Database error:', dbError)
      // Don't fail auth, just log the error
    }

    // Redirect to dashboard
    const redirectUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/`
    
    console.log(`[AUTH] ✅ Auth complete, redirecting to: ${redirectUrl}`)

    return NextResponse.redirect(redirectUrl)

  } catch (err) {
    console.error('[AUTH] ❌ Callback error:', err)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
}
