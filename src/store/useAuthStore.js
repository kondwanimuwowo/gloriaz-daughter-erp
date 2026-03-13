import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import { useSyncStore } from "./useSyncStore";

let authInitialized = false;
let lastSessionId = null;
let lastAuthEventAt = 0;

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,
  authSubscription: null,
  refreshInterval: null,

  // Refresh session
  refreshSession: async () => {
    try {
      console.log("[Auth] Manually refreshing session...");
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session) {
        set({ session: data.session });
        console.log("[Auth] Session refreshed successfully");
      } else {
        console.warn("[Auth] refreshSession returned no session");
      }
    } catch (error) {
      console.error("[Auth] Session refresh error:", error);
      // DO NOT call signOut() here immediately; let onAuthStateChange handle it if it's a real failure
    }
  },

  // Validate current session
  validateSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("[Auth] getSession error in validateSession:", error);
        return false;
      }

      if (!session) {
        console.warn("[Auth] No active session found during validation check");
        // Check if we already have a user; if so, maybe it's clearing?
        if (get().user) {
          console.warn("[Auth] Session disappeared unexpectedly!");
          // We don't call signOut() immediately to avoid kicking users on transient nulls
          // The onAuthStateChange listener will handle real sign-outs
        }
        return false;
      }

      // Check if session is about to expire (within 5 minutes)
      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      console.log(`[Auth] Session valid. Expires in ${Math.round(timeUntilExpiry / 1000 / 60)} mins`);

      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log("[Auth] Session expiring soon, triggering refresh...");
        await get().refreshSession();
      }

      return true;
    } catch (error) {
      console.error("[Auth] Session validation error:", error);
      return false;
    }
  },

  // Initialize auth state
  initialize: async () => {
    if (authInitialized) return;
    authInitialized = true;

    // Safety timeout to prevent permanent loading loop
    const timeout = setTimeout(() => {
      if (!get().initialized) {
        console.warn("Auth initialization timed out, forcing ready state");
        set({ loading: false, initialized: true });
      }
    }, 5000);

    try {
      console.log("Starting auth initialization...");
      const session = await authService.getSession();
      console.log("Session retrieved:", !!session);

      if (session?.user) {
        console.log("User found, fetching profile...");
        const profile = await authService.getUserProfile(session.user.id);

        // Update last session tracking before setting state
        lastSessionId = session.access_token;
        lastAuthEventAt = Date.now();

        set({
          user: session.user,
          profile,
          session,
          loading: false,
          initialized: true,
        });

        // Start periodic session refresh every 5 minutes
        if (get().refreshInterval) clearInterval(get().refreshInterval);
        const refreshInterval = setInterval(() => {
          get().validateSession();
        }, 5 * 60 * 1000);

        set({ refreshInterval });

        // Initial data sync on auth success
        useSyncStore.getState().safeIncrementEpoch('auth:init');
      } else {
        console.log("No session found");
        set({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        const token = session?.access_token;
        const now = Date.now();
        console.log(`[Auth] Event: ${event}`);

        if (session) {
          set({ session, user: session.user });
          if (!get().profile) {
            await get().fetchProfile(session.user.id);
          }
        } else {
          set({ session: null, user: null, profile: null });
        }

        // Deduplication & Normalization
        if (token && token === lastSessionId) {
          // Suppression of redundant events for same session
          return;
        }

        // Specifically suppress SIGNED_IN if it rapidly follows INITIAL_SESSION (normalization)
        if (event === 'SIGNED_IN' && now - lastAuthEventAt < 1500) {
          console.log('[Auth] Normalizing SIGNED_IN event (skipping redundant recovery)');
          return;
        }

        lastSessionId = token;
        lastAuthEventAt = now;

        // HARD RECOVERY TRIGGER: Treat these as authoritative state resets
        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "INITIAL_SESSION"
        ) {
          useSyncStore.getState().safeIncrementEpoch(`auth:${event}`);
        }

        if (event === "SIGNED_OUT") {
          useSyncStore.getState().safeIncrementEpoch("auth:SIGNED_OUT");
        }
      });

      set({ authSubscription: subscription, initialized: true });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ loading: false, initialized: true });
    } finally {
      clearTimeout(timeout);
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      const { user, session } = await authService.signIn(email, password);
      const profile = await authService.getUserProfile(user.id);

      if (!profile.active) {
        await authService.signOut();
        throw new Error(
          "Your account has been deactivated. Please contact an administrator."
        );
      }

      set({ user, profile, session });
      toast.success("Welcome back!");

      // Start session validation interval
      if (get().refreshInterval) clearInterval(get().refreshInterval);
      const refreshInterval = setInterval(() => {
        get().validateSession();
      }, 5 * 60 * 1000);

      set({ refreshInterval });

      return { user, profile };
    } catch (error) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  },

  // Sign up
  signUp: async (email, password, fullName, role = "employee") => {
    try {
      const data = await authService.signUp(email, password, fullName, role);
      toast.success(`User created successfully!`);
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to create user");
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      // Clear intervals
      const { refreshInterval, authSubscription } = get();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }

      await authService.signOut();
      set({
        user: null,
        profile: null,
        session: null,
        refreshInterval: null,
        authSubscription: null
      });
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
      throw error;
    }
  },

  // Fetch profile
  fetchProfile: async (userId) => {
    try {
      const profile = await authService.getUserProfile(userId);
      set({ profile });
      return profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    try {
      const updatedProfile = await authService.updateUserProfile(
        user.id,
        updates
      );
      set({ profile: updatedProfile });
      toast.success("Profile updated successfully");
      return updatedProfile;
    } catch (error) {
      toast.error("Failed to update profile");
      throw error;
    }
  },

  // Check if user has role
  hasRole: (role) => {
    const { profile } = get();
    return profile?.role === role;
  },

  // Check if user has any of the roles
  hasAnyRole: (roles) => {
    const { profile } = get();
    return roles.includes(profile?.role);
  },

  // Check if user is admin
  isAdmin: () => {
    const { profile } = get();
    return profile?.role === "admin";
  },

  // Check if user is manager
  isManager: () => {
    const { profile } = get();
    return profile?.role === "manager";
  },
}));
