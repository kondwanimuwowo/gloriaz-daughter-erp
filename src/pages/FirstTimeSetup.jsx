import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, Lock, User, Scissors, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import toast from "react-hot-toast";

export default function FirstTimeSetup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUsers, setHasUsers] = useState(null);
  const [checkingUsers, setCheckingUsers] = useState(true);
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  useEffect(() => {
    checkExistingUsers();
  }, []);

  const checkExistingUsers = async () => {
    try {
      // Try to get all users (this will work even without auth)
      const { data, error } = await authService.getAllUsers();

      if (error) {
        // If error, assume no users exist
        setHasUsers(false);
      } else {
        setHasUsers(data && data.length > 0);
      }
    } catch (error) {
      // If error, assume no users exist
      setHasUsers(false);
    } finally {
      setCheckingUsers(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Create the user
      await signUp(data.email, data.password, data.fullName, "admin");

      toast.success("Admin account created! Redirecting to login...");

      // Wait 2 seconds then redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Setup error:", error);
      toast.error(error.message || "Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  if (checkingUsers) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking system status...</p>
        </div>
      </div>
    );
  }

  // If users already exist, redirect to login
  if (hasUsers) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
            <CardContent className="pt-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">
                System Already Set Up
            </h2>
            <p className="text-muted-foreground mb-6">
                An admin account already exists. Please login with your credentials.
            </p>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 text-primary-foreground">
            <Scissors className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to Gloriaz Daughter
          </h1>
          <p className="text-muted-foreground">
            Create your admin account to get started
          </p>
        </div>

        {/* Setup Form */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">First Time Setup</AlertTitle>
                <AlertDescription className="text-blue-700">
                     You're creating the first admin account for this system. This
                     account will have full access.
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                          id="fullName"
                          placeholder="Your full name"
                          className={`pl-9 ${errors.fullName ? "border-destructive" : ""}`}
                          {...register("fullName", {
                              required: "Full name is required",
                              minLength: {
                                  value: 2,
                                  message: "Name must be at least 2 characters",
                              },
                          })}
                      />
                  </div>
                  {errors.fullName && (<p className="text-sm text-destructive">{errors.fullName.message}</p>)}
              </div>

              {/* Email */}
              <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                          id="email"
                          type="email"
                          placeholder="kondwanimuwowo@gmail.com"
                          className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
                          {...register("email", {
                              required: "Email is required",
                              pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: "Invalid email address",
                              },
                          })}
                      />
                  </div>
                  {errors.email && (<p className="text-sm text-destructive">{errors.email.message}</p>)}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`pl-9 pr-9 ${errors.password ? "border-destructive" : ""}`}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (<p className="text-sm text-destructive">{errors.password.message}</p>)}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`pl-9 pr-9 ${errors.confirmPassword ? "border-destructive" : ""}`}
                    placeholder="••••••••"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (<p className="text-sm text-destructive">{errors.confirmPassword.message}</p>)}
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Admin Account
              </Button>
            </form>
          </CardContent>
          <div className="p-4 text-center border-t bg-muted/50">
             <p className="text-xs text-muted-foreground">
                © 2024 Gloriaz Daughter. All rights reserved.
             </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

