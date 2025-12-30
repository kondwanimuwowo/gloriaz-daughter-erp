import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Employees from "./pages/Employees";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import FirstTimeSetup from "./pages/FirstTimeSetup";
import Finance from "./pages/Finance"; // NEW
import Analytics from "./pages/Analytics"; // NEW
import Production from "./pages/Production"; // NEW
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  const { initialize, initialized, refreshSession } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && initialized) {
        // App became visible, refresh session to ensure it's valid
        refreshSession();
      }
    };

    // Track user activity to keep session alive
    let activityTimeout;
    const handleUserActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        if (initialized) {
          refreshSession();
        }
      }, 2 * 60 * 1000); // Refresh after 2 minutes of activity
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(activityTimeout);
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSession, initialized]);

  // Show loading screen while initializing auth
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={300}>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route
              path="/signup"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <SignUp />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* All authenticated users */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="profile" element={<Profile />} />
              <Route path="first-time-setup" element={<FirstTimeSetup />} />

              {/* Admin and Manager only */}
              <Route
                path="inventory"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employees"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <Employees />
                  </ProtectedRoute>
                }
              />

              {/* NEW: Analytics - Admin and Manager only */}
              <Route
                path="analytics"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* Admin only */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              <Route
                path="finance"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <Finance />
                  </ProtectedRoute>
                }
              />

              <Route
                path="production"
                element={
                  <ProtectedRoute requiredRoles={["admin", "manager"]}>
                    <Production />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
