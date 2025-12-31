import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, Lock, Scissors, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((state) => state.signIn);

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background p-4">
      <motion.div
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full transform -translate-y-10" />

        <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden p-8 md:p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-6">
              <Scissors className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mt-2 text-center text-sm">
              Enter your credentials to access your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11 bg-background/50 border-input/60 focus:bg-background transition-all"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive font-medium ml-1 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 bg-background/50 border-input/60 focus:bg-background transition-all"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-medium ml-1 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="border-border/60" />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Secure System
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground/60">
              © 2024 Gloriaz Daughter. Protected by advanced encryption.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
