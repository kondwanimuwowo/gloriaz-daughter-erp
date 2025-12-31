import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../store/useSyncStore';
import { registerChannel, teardownChannel } from '../lib/realtimeRegistry';

export function useEmployeesRealtime() {
    const appEpoch = useSyncStore((state) => state.appEpoch);
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = registerChannel(
            supabase
                .channel('employees-realtime')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'employees' },
                    () => {
                        console.log('[Realtime] Employee change detected');
                        queryClient.invalidateQueries({ queryKey: ['employees'] });
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'attendance' },
                    () => {
                        console.log('[Realtime] Attendance change detected');
                        queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
                    }
                )
                .subscribe()
        );

        return () => {
            teardownChannel(channel);
        };
    }, [appEpoch, queryClient]);
}
