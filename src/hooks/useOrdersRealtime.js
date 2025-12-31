import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../store/useSyncStore';
import { registerChannel, teardownChannel } from '../lib/realtimeRegistry';

/**
 * Hook to manage real-time subscriptions for the Orders page.
 * Listens for any changes to the 'orders' table and invalidates the list and stats queries.
 * Respects the global appEpoch for deterministic recovery.
 */
export function useOrdersRealtime() {
    const appEpoch = useSyncStore((state) => state.appEpoch);
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = registerChannel(
            supabase
                .channel('orders-realtime')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    (payload) => {
                        console.log('[Realtime] Order change detected:', payload.eventType);
                        // Invalidate the primary orders list
                        queryClient.invalidateQueries({ queryKey: ['orders'] });
                        // Invalidate order-specific details if open (using a dynamic pattern if needed)
                        // For now, simple list invalidation is authoritative
                    }
                )
                .subscribe()
        );

        return () => {
            teardownChannel(channel);
        };
    }, [appEpoch, queryClient]);
}
