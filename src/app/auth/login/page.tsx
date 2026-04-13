"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn, ArrowRight, AlertCircle, Info, Heart, Building2 } from "lucide-react";
import { LoginSchema, type LoginValues } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("success") === "password-reset") {
      toast.success("Password reset successful. Please login.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          router.push("/auth/verify-email");
          return;
        }
        throw error;
      }

      // Role check for specific redirection
      const role = authData.user?.user_metadata?.role;
      
      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else if (role === "hospital") {
        router.replace("/dashboard/hospital");
      } else if (role === "donor") {
        router.replace("/dashboard/donor");
      } else {
        // Fallback — profiles table check
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user?.id)
          .single();

        if (profile?.role === "admin") {
          router.replace("/dashboard/admin");
        } else if (profile?.role === "hospital") {
          router.replace("/dashboard/hospital");
        } else {
          router.replace("/dashboard/donor");
        }
      }

      toast.success("Welcome back to OPAL-AI!");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-3xl border border-border shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-70" />
          
          <div className="relative z-10">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight underline-gradient inline-block font-display">
                Sign In
              </h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Welcome back to Asia&apos;s leading AI donor platform.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="doctor@health.ai"
                      className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      suppressHydrationWarning
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1 ml-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-muted-foreground">
                      Password
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      {...register("password")}
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      suppressHydrationWarning
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1 ml-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold transition-all hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group overflow-hidden relative"
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-2 tracking-wide uppercase text-xs font-black">
                      Sign In to Account
                      <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </>
                )}
              </button>

              <div className="text-center pt-4 relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <p className="text-xs text-muted-foreground mt-4 mb-4 font-bold uppercase tracking-widest text-[9px]">
                  Don&apos;t have an account?
                </p>
                
                <div className="grid grid-cols-1 gap-3 px-2">
                  <Link
                    href="/auth/donor/signup"
                    className="w-full py-3 px-4 rounded-xl bg-muted/50 border border-border text-foreground font-bold hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      Become a Donor
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </Link>
                  
                  <Link
                    href="/auth/hospital/signup"
                    className="w-full py-3 px-4 rounded-xl bg-muted/50 border border-border text-foreground font-bold hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Hospital Portal
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Healthcare professionals: Your verified license is required for organ protocol access. 
            Donors: Your data is protected by AES-256 cloud encryption.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
