"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Home, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 space-y-8"
      >
        <div className="flex justify-center">
           <div className="relative">
              <Ghost className="h-24 w-24 text-muted-foreground opacity-20" />
              <Heart className="h-12 w-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
           </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-black font-display tracking-tighter text-foreground leading-none">404</h1>
          <h2 className="text-2xl font-bold font-display text-primary">Node Disconnected</h2>
          <p className="max-w-md text-muted-foreground mx-auto text-sm">
            The neural link to this coordinate has been severed. The page you are looking for does not exist in our medical directory.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-105"
          >
            <Home className="h-4 w-4" />
            Return to Base
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur-xl px-8 py-4 text-sm font-bold text-foreground transition-all hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Node
          </button>
        </div>
      </motion.div>

      {/* Corporate disclaimer for aesthetics */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">OPAL-AI • Forensic Logistics Terminal</p>
      </div>
    </div>
  );
}
