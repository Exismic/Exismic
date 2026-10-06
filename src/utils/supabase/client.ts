import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          lock: async (_name, _acquireTimeout, fn) => {
            // Bypass navigator.locks in React 19 / Fast Refresh to eliminate 5000ms deadlocks
            return await fn();
          }
        }
      }
    )
    const signOut = client.auth.signOut.bind(client.auth)
    client.auth.signOut = async (options?: { scope?: 'global' | 'local' | 'others' }) => {
      if (options?.scope !== 'others') {
        await fetch('/api/auth/session', { method: 'POST' }).catch(() => undefined)
      }
      return signOut(options)
    }
  }

  return client
}
