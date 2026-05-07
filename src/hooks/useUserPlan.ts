"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

export function useUserPlan() {
  const { data: session, update } = useSession();
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial set
    setPlan((session.user as any).plan || 'free');

    // Subscribe to realtime changes in Supabase
    const channel = supabase
      .channel(`user-plan-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'User',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.new.plan) {
            setPlan(payload.new.plan);
            // Refresh NextAuth session to sync with DB
            update();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, update]);

  return {
    plan,
    isPro: plan === 'pro',
    isLoading: !session && !plan
  };
}
