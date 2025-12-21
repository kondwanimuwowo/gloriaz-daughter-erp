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
    params: {
      eventsPerSecond: 10,
    },
    // Aggressive heartbeat to prevent timeout
    heartbeatIntervalMs: 15000, // Send heartbeat every 15 seconds
    reconnectAfterMs: (tries) => {
      // Exponential backoff with max 10 seconds
      return Math.min(1000 * Math.pow(2, tries), 10000);
    },
    // Log connection state changes for debugging
    logger: import.meta.env.DEV ? console : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'erp-client',
      'apikey': supabaseAnonKey,
    },
    // Increase fetch timeout to 60 seconds
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(60000),
      });
    },
  },
  db: {
    schema: 'public',
  },
});

// Monitor connection state and handle reconnection
if (typeof window !== 'undefined') {
  // Handle visibility change - reconnect realtime when tab becomes active
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Tab is now visible, ensure realtime is connected
      const channels = supabase.getChannels();
      channels.forEach(channel => {
        if (channel.state !== 'joined') {
          channel.subscribe();
        }
      });
    }
  });

  // Handle online/offline events
  window.addEventListener('online', () => {
    console.log('Connection restored, reconnecting to Supabase...');
    const channels = supabase.getChannels();
    channels.forEach(channel => channel.subscribe());
  });

  window.addEventListener('offline', () => {
    console.warn('Connection lost');
  });
}
