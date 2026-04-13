"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, RefreshCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      
      // Get email from URL if present, or localStorage
      const searchParams = new URLSearchParams(window.location.search);
      const email = searchParams.get("email") || localStorage.getItem("pending-verify-email");

      if (!email) {
        toast.error("Enter your email again on the signup page.");
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) throw error;

      setResendTimer(60);
      toast.success("Verification link resent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#050505]">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          
          <div className="relative z-10 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20"
            >
              <Mail className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
              Check your email
            </h1>
            <p className="text-muted-foreground mb-8">
              We&apos;ve sent a verification link to your email address. Please click it to activate your account.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-left flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  The link will expire in 24 hours for security reasons.
                </span>
              </div>

              <button
                onClick={handleResend}
                disabled={resendTimer > 0 || isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white font-bold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  <>
                    <RefreshCcw className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
