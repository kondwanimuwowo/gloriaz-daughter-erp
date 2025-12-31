import { create } from 'zustand';

/**
 * Global store for managing application-wide synchronization signals (App Epoch).
 * The appEpoch counter acts as an authoritative "version" for the entire system state.
 * When it increments, ALL active components (Data and Real-time) must reboot.
 */
export const useSyncStore = create((set) => ({
    appEpoch: 0,

    /**
     * Increments the global app epoch, triggering a full 
     * data and real-time subscription refresh across the app.
     * @param {string} reason - Mandatory reason for the recovery trigger.
     */
    incrementEpoch: (reason = 'unknown') => {
        set((state) => {
            console.warn('[ERP RECOVERY]', reason, `(Epoch: ${state.appEpoch + 1})`);
            return { appEpoch: state.appEpoch + 1 };
        });
    },
}));
