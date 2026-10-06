import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AuthSessionMissingError } from '@supabase/supabase-js'
import { AUTH_PROOF_COOKIE, isVerifiedAppSession } from '@/lib/auth/session-proof'

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  const getVerifiedUser = client.auth.getUser.bind(client.auth)
  client.auth.getUser = async (jwt?: string) => {
    const result = await getVerifiedUser(jwt)
    if (!result.data.user || result.error) return result
    const { data: { session } } = await client.auth.getSession()
    if (!await isVerifiedAppSession(result.data.user, session, cookieStore.get(AUTH_PROOF_COOKIE)?.value)) {
      return { data: { user: null }, error: new AuthSessionMissingError() }
    }
    return result
  }
  return client
}
