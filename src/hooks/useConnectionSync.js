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
    const [realtimeStatus, setRealtimeStatus] = useState('connecting');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // 1. Network Status
        const handleOnline = () => {
            console.log('[ConnectionSync] Network online - triggering sync');
            setIsOnline(true);
            setRealtimeStatus('connecting');
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

        // Initial check - if already connected, update state immediately
        if (supabase.realtime?.isConnected?.()) {
            setRealtimeStatus('connected');
            console.log('[ConnectionSync] Supabase realtime already connected on mount');
        } else {
            // Set a timeout to assume connection is established after 3 seconds if no error event
            const connectionTimeout = setTimeout(() => {
                setRealtimeStatus((currentStatus) => {
                    // Only auto-connect if we're still in 'connecting' state and online
                    if (currentStatus === 'connecting' && navigator.onLine) {
                        console.log('[ConnectionSync] Auto-confirming connection after timeout');
                        return 'connected';
                    }
                    return currentStatus;
                });
            }, 3000);

            // Also set up a periodic check every 5 seconds to verify actual connection state
            const verifyInterval = setInterval(() => {
                setRealtimeStatus((currentStatus) => {
                    const isActuallyConnected = supabase.realtime?.isConnected?.();
                    if (isActuallyConnected && currentStatus !== 'connected') {
                        console.log('[ConnectionSync] Verified actual connection state - updating to connected');
                        return 'connected';
                    }
                    return currentStatus;
                });
            }, 5000);

            return () => {
                clearTimeout(connectionTimeout);
                clearInterval(verifyInterval);
            };
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
