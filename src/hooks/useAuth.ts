import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export function useAuth(redirectOnLogin: string | null = null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    let generation = 0;

    async function checkSession() {
      const current = ++generation;
      const { data, error } = await supabase.auth.getSession().catch(() => ({ data: { session: null }, error: null }));
      if (error && (error.message?.includes('Refresh Token') || (error as any).status === 400)) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
      }
      const session = data?.session ?? null;
      if (mounted) {
        const verified = session?.user && await fetch('/api/auth/session', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => Boolean(data?.verified)).catch(() => false);
        if (!mounted || current !== generation) return;
        setUser(verified ? session.user : null);
        setLoading(false);
        
        const isSuspended = typeof window !== 'undefined' && window.location.search.includes('error=suspended');
        if (verified && redirectOnLogin && !isSuspended) {
          setIsRedirecting(true);
          router.push(redirectOnLogin);
        }
      }
    }
    
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const current = ++generation;
      if (mounted) {
        const verified = session?.user && await fetch('/api/auth/session', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => Boolean(data?.verified)).catch(() => false);
        if (!mounted || current !== generation) return;
        setUser(verified ? session.user : null);
        setLoading(false);
        const isSuspended = typeof window !== 'undefined' && window.location.search.includes('error=suspended');
        if (event === 'SIGNED_IN' && verified && redirectOnLogin && !isSuspended) {
          setIsRedirecting(true);
          router.push(redirectOnLogin);
        } else if (event === 'SIGNED_OUT') {
          setIsRedirecting(false);
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, redirectOnLogin, supabase.auth]);

  return { user, loading, isRedirecting };
}
