import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../store/useSyncStore';
import { registerChannel, teardownChannel } from '../lib/realtimeRegistry';

export function useInventoryRealtime() {
    const appEpoch = useSyncStore((state) => state.appEpoch);
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = registerChannel(
            supabase
                .channel('inventory-realtime')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'inventory' },
                    () => {
                        console.log('[Realtime] Inventory change detected');
                        queryClient.invalidateQueries({ queryKey: ['inventory'] });
                    }
                )
                .subscribe()
        );

        return () => {
            teardownChannel(channel);
        };
    }, [appEpoch, queryClient]);
}
