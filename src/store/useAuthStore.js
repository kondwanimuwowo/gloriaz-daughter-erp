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
      } else {
        set({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const profile = await authService.getUserProfile(session.user.id);
          set({ user: session.user, profile, session });
        } else if (event === "SIGNED_OUT") {
          set({ user: null, profile: null, session: null });
        }
      });
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
      toast.success("Account created! Please check your email to verify.");
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to sign up");
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await authService.signOut();
      set({ user: null, profile: null, session: null });
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
