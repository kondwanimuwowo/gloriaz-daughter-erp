import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../store/useSyncStore';
import { registerChannel, teardownChannel } from '../lib/realtimeRegistry';

export function useCustomersRealtime() {
    const appEpoch = useSyncStore((state) => state.appEpoch);
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = registerChannel(
            supabase
                .channel('customers-realtime')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'customers' },
                    () => {
                        console.log('[Realtime] Customer change detected');
                        queryClient.invalidateQueries({ queryKey: ['customers'] });
                    }
                )
                .subscribe()
        );

        return () => {
            teardownChannel(channel);
        };
    }, [appEpoch, queryClient]);
}
