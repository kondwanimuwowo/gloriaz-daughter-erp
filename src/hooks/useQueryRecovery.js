import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSyncStore } from '../store/useSyncStore';

/**
 * Hook to synchronize TanStack Query cache with the global App Epoch.
 * When appEpoch increments, it invalidates and refetchs all queries 
 * marked as 'erpCritical'.
 */
export function useQueryRecovery() {
    const appEpoch = useSyncStore((state) => state.appEpoch);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (appEpoch === 0) return; // Skip initial mount if already handled

        console.log('[QueryRecovery] Validating ERP critical queries for Epoch:', appEpoch);

        // Invalidate triggers 'stale' state immediately
        queryClient.invalidateQueries({
            predicate: (query) => query.meta?.erpCritical === true,
        });

        // Refetch ensures the network call happens immediately
        queryClient.refetchQueries({
            predicate: (query) => query.meta?.erpCritical === true,
        });
    }, [appEpoch, queryClient]);
}
