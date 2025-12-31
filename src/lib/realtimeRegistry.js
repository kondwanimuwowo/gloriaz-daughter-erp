import { supabase } from './supabase';
import { useSyncStore } from '../store/useSyncStore';

/**
 * Global registry for Supabase Realtime Channels.
 * Ensures that all active subscriptions can be deterministically torn down
 * and that any connection failures trigger a global recovery signal.
 */
const channels = new Set();

/**
 * Registers a channel in the global registry and attaches recovery listeners.
 * @param {RealtimeChannel} channel - The channel instance to register.
 * @returns {RealtimeChannel} - The registered channel.
 */
export function registerChannel(channel) {
    channels.add(channel);

    // Failure triggers a global App Epoch increment
    channel
        // Recovery must occur ONLY on real failure.
        // Connected is a healthy state, not a reason to reboot the app.
        .on('state', (status) => {
            if (status === 'error' || status === 'disconnected') {
                console.warn(`[RealtimeRegistry] Channel state changed to ${status}. Triggering epoch increment.`);
                useSyncStore.getState().safeIncrementEpoch(`realtime:${status}`);
            } else {
                console.log(`[RealtimeRegistry] Channel state changed to ${status}.`);
            }
        })
        .on('close', () => {
            console.warn('[RealtimeRegistry] Channel closed');
            useSyncStore.getState().safeIncrementEpoch('realtime:closed');
        });

    return channel;
}

/**
 * Deterministically removes a specific channel from Supabase and the registry.
 * @param {RealtimeChannel} channel - The channel to tear down.
 */
export function teardownChannel(channel) {
    if (!channel) return;
    supabase.removeChannel(channel);
    channels.delete(channel);
}

/**
 * Clears all active channels in the registry.
 * Used during global recovery/epoch increments.
 */
export function teardownAllChannels() {
    if (channels.size === 0) return;
    console.log(`[RealtimeRegistry] Tearing down ${channels.size} channels`);
    channels.forEach((channel) => {
        try {
            supabase.removeChannel(channel);
        } catch (err) {
            console.warn('[RealtimeRegistry] Error removing channel:', err);
        }
    });
    channels.clear();
}
