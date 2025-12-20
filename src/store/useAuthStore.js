import { create } from "zustand";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

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
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session) {
        set({ session: data.session });
        console.log("Session refreshed successfully");
      }
    } catch (error) {
      console.error("Session refresh error:", error);
      // If refresh fails, sign out
      await get().signOut();
    }
  },

  // Validate current session
  validateSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (!session) {
        console.warn("No active session found");
        await get().signOut();
        return false;
      }
      
      // Check if session is about to expire (within 5 minutes)
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log("Session expiring soon, refreshing...");
        await get().refreshSession();
      }
      
      return true;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  },

  // Initialize auth state
  initialize: async () => {
    try {
      const session = await authService.getSession();

      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        set({
          user: session.user,
          profile,
          session,
          loading: false,
          initialized: true,
        });
        
        // Start periodic session refresh every 5 minutes
        const refreshInterval = setInterval(() => {
          get().validateSession();
        }, 5 * 60 * 1000);
        
        set({ refreshInterval });
      } else {
        set({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }

      // Listen for auth changes and store the subscription
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await authService.getUserProfile(session.user.id);
          set({ user: session.user, profile, session });
        } else if (event === "SIGNED_OUT") {
          set({ user: null, profile: null, session: null });
        } else if (event === "TOKEN_REFRESHED" && session) {
          console.log("Token refreshed automatically");
          set({ session });
        } else if (event === "USER_UPDATED" && session) {
          set({ session });
        }
      });
      
      set({ authSubscription: subscription });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ loading: false, initialized: true });
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
