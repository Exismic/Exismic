import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Extract authenticated user from request
 * Used in API routes to get the current user
 */
export async function getAuth(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('[AUTH] Error getting session:', error)
      return { userId: null, error }
    }

    if (!session?.user?.id) {
      return { userId: null, error: 'No session' }
    }

    return { userId: session.user.id }
  } catch (err) {
    console.error('[AUTH] Error in getAuth:', err)
    return { userId: null, error: err }
  }
}

/**
 * Verify if user is authenticated
 * Returns true/false for simple auth checks
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return !!session?.user?.id
  } catch {
    return false
  }
}

/**
 * Get current user ID
 * Returns user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  } catch {
    return null
  }
}
