import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../store/useSyncStore';
import { registerChannel, teardownChannel } from '../lib/realtimeRegistry';

/**
 * Hook to manage real-time subscriptions for the Dashboard.
 * Listens for changes in orders, inventory, and attendance to invalidate TanStack Query caches.
 * Automatically tears down and recreates subscriptions when the global appEpoch increments.
 */
export function useDashboardRealtime() {
    const appEpoch = useSyncStore((state) => state.appEpoch);
    const queryClient = useQueryClient();

    useEffect(() => {
        // 1. Teardown existing dashboard-related channels if they exist
        // (Note: registerChannel handles individual teardown on return via registry)

        // 2. Setup New Channel
        const channel = registerChannel(
            supabase
                .channel('dashboard-realtime')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'orders' },
                    () => {
                        console.log('[Realtime] Orders changed, invalidating dashboard queries');
                        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
                        queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'inventory' },
                    () => {
                        console.log('[Realtime] Inventory changed, invalidating dashboard queries');
                        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'attendance' },
                    () => {
                        console.log('[Realtime] Attendance changed, invalidating dashboard queries');
                        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
                    }
                )
                .subscribe()
        );

        // Clean up on unmount or epoch change
        return () => {
            teardownChannel(channel);
        };
    }, [appEpoch, queryClient]);
}
