import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../store/useSyncStore';
import { registerChannel, teardownChannel } from '../lib/realtimeRegistry';

/**
 * Hook to manage real-time subscriptions for the Finance page.
 * Listens for changes in orders and expenses to invalidate TanStack Query caches.
 * Respects the global appEpoch for deterministic recovery.
 */
export function useFinanceRealtime() {
    const appEpoch = useSyncStore((state) => state.appEpoch);
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = registerChannel(
            supabase
                .channel('finance-realtime')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    () => {
                        console.log('[Realtime] Orders changed, invalidating finance data');
                        queryClient.invalidateQueries({ queryKey: ['finance-data'] });
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'expenses' },
                    () => {
                        console.log('[Realtime] Expenses changed, invalidating finance data');
                        queryClient.invalidateQueries({ queryKey: ['finance-data'] });
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'payments' },
                    () => {
                        console.log('[Realtime] Payments changed, invalidating finance data');
                        queryClient.invalidateQueries({ queryKey: ['finance-data'] });
                    }
                )
                .subscribe()
        );

        return () => {
            teardownChannel(channel);
        };
    }, [appEpoch, queryClient]);
}
