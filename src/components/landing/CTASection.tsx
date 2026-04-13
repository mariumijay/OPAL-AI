"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, HeartPulse } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-[3rem] p-12 sm:p-20 border border-white/10 text-center relative overflow-hidden"
        >
          {/* Internal Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="relative z-10 space-y-8">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <HeartPulse className="h-10 w-10 animate-bounce" />
            </div>
            
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight">
              Join Thousands of Donors <br /> 
              <span className="text-primary">Saving Lives Today.</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              OPAL-AI is Pakistan's first intelligent medical network. Whether you are a donor or a healthcare professional, your participation matters.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/auth/donor/signup"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary text-white font-black text-lg transition-all hover:scale-105 hover:bg-primary/90 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
              >
                Register as Donor
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link 
                href="/auth/hospital/signup"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-foreground font-bold text-lg transition-all hover:bg-white/10 flex items-center justify-center"
              >
                Hospital Enrolment
              </Link>
            </div>

            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pt-8">
              Verified by SAP & National Surgical Protocols
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
