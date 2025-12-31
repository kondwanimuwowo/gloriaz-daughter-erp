import { create } from 'zustand';

let lastEpochAt = 0;

/**
 * Global store for managing application-wide synchronization signals (App Epoch).
 */
export const useSyncStore = create((set, get) => ({
    appEpoch: 0,

    /**
     * Internal increment logic.
     */
    incrementEpoch: (reason = 'unknown') => {
        set((state) => {
            console.warn('[ERP RECOVERY]', reason, `(Epoch: ${state.appEpoch + 1})`);
            return { appEpoch: state.appEpoch + 1 };
        });
    },

    /**
     * Public, safe entry point for triggering recovery.
     * Prevents "recovery storms" by debouncing calls within 1000ms.
     */
    safeIncrementEpoch: (reason) => {
        const now = Date.now();
        if (now - lastEpochAt < 1000) {
            console.debug('[ERP RECOVERY] Debounced:', reason);
            return;
        }
        lastEpochAt = now;
        get().incrementEpoch(reason);
    }
}));
