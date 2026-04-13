"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { ForgotPasswordSchema, type ForgotPasswordValues } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }
      
      setIsSubmitted(true);
      toast.success("Reset link sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#050505]">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
          
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2 underline-gradient inline-block">
                    Forgot Password
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="doctor@opal.ai"
                        suppressHydrationWarning
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-xl bg-primary text-white font-bold transition-all hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10 text-center py-4"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-muted-foreground mb-8">
                  We have sent a reset link to your email. Please follow the link to create a new password.
                </p>
                <Link
                  href="/auth/login"
                  className="w-full h-14 rounded-xl border border-white/10 text-white font-bold transition-all hover:bg-white/5 flex items-center justify-center gap-2"
                >
                  Return to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
