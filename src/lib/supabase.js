import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'erp-auth-token',
    flowType: 'pkce',
  },
  realtime: {
    heartbeatIntervalMs: 10000,
    params: {
      eventsPerSecond: 5,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'erp-client',
    },
  },
});

// Realtime Connection Monitoring
// Note: Some versions of supabase-js don't expose onOpen/onClose directly on the client.
// We access the internal stateChangeCallbacks if available, or fall back to polling.

const rt = supabase.realtime;

const handleOpen = () => {
  console.log('[Realtime] Connected successfully');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabase-realtime-status', { detail: 'connected' }));
  }
};

const handleClose = () => {
  console.warn('[Realtime] Connection closed');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabase-realtime-status', { detail: 'disconnected' }));
  }
};

const handleError = (err) => {
  console.error('[Realtime] Connection error:', err);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabase-realtime-status', { detail: 'error' }));
  }
};

// Workaround: Push to internal callbacks if public helpers are missing
if (rt.stateChangeCallbacks) {
  if (Array.isArray(rt.stateChangeCallbacks.open)) rt.stateChangeCallbacks.open.push(handleOpen);
  if (Array.isArray(rt.stateChangeCallbacks.close)) rt.stateChangeCallbacks.close.push(handleClose);
  if (Array.isArray(rt.stateChangeCallbacks.error)) rt.stateChangeCallbacks.error.push(handleError);
} else {
  // Fallback: If onOpen exists, use it (future proofing)
  if (typeof rt.onOpen === 'function') rt.onOpen(handleOpen);
  if (typeof rt.onClose === 'function') rt.onClose(handleClose);
  if (typeof rt.onError === 'function') rt.onError(handleError);
}

// Force reconnection logic
export const ensureRealtimeConnection = () => {
  const socket = supabase.realtime;
  if (!socket.isConnected()) {
    console.log('[Realtime] Not connected, attempting reconnection...');
    socket.connect();
  }
};

// Auto-reconnect on visibility change
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      ensureRealtimeConnection();
    }
  });
}
