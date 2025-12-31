import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSyncStore } from '../store/useSyncStore';

/**
 * Hook to monitor connection and synchronization state.
 * It manages the global syncGeneration signal based on network 
 * and realtime socket lifecycle events.
 * 
 * @returns {object} { syncGeneration, isOnline, realtimeStatus }
 */
export function useConnectionSync() {
    const { appEpoch, incrementEpoch } = useSyncStore();
    const [realtimeStatus, setRealtimeStatus] = useState('initializing');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // 1. Network Status
        const handleOnline = () => {
            console.log('[ConnectionSync] Network online - triggering sync');
            setIsOnline(true);
            incrementEpoch('network:online');
        };

        const handleOffline = () => {
            console.log('[ConnectionSync] Network offline');
            setIsOnline(false);
            setRealtimeStatus('disconnected');
        };

        // 2. Supabase Realtime Status Events (Dispatched from src/lib/supabase.js)
        const handleRealtimeStatus = (e) => {
            const status = e.detail;
            console.log(`[ConnectionSync] Realtime status change: ${status}`);
            setRealtimeStatus(status);

            // Recovery must occur ONLY on real failure.
            // Connected is a healthy state, not a reason to reboot the app.
            if (status === 'error' || status === 'disconnected') {
                useSyncStore.getState().safeIncrementEpoch(`realtime:${status}`);
            }
        };

        // 3. Manual sync trigger from window (for debug/recovery)
        const handleManualSync = () => useSyncStore.getState().safeIncrementEpoch('manual:trigger');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('supabase-realtime-status', handleRealtimeStatus);
        window.addEventListener('force-app-sync', handleManualSync);

        // Initial check
        if (supabase.realtime?.isConnected?.()) {
            setRealtimeStatus('connected');
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('supabase-realtime-status', handleRealtimeStatus);
            window.removeEventListener('force-app-sync', handleManualSync);
        };
    }, [incrementEpoch]);

    return { appEpoch, isOnline, realtimeStatus };
}
