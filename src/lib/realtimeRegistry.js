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
        .on('error', (err) => {
            console.error('[RealtimeRegistry] Channel error:', err);
            useSyncStore.getState().incrementEpoch('realtime:error');
        })
        .on('close', () => {
            console.warn('[RealtimeRegistry] Channel closed');
            useSyncStore.getState().incrementEpoch('realtime:closed');
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
    console.log(`[RealtimeRegistry] Tearing down ${channels.size} channels`);
    channels.forEach((channel) => {
        supabase.removeChannel(channel);
    });
    channels.clear();
}
