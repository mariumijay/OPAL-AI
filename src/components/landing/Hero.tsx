"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, ArrowRight, Shield, Zap, Activity } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[110vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)]" />
        
        {/* Floating Glass Orbs */}
        <motion.div
          style={{ y: y1 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div
          style={{ y: y2 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-left space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-md"
            >
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-primary">
                The Future of Life-Saving Networks
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Wait Times <br />
              <span className="gradient-text">Shouldn't Cost</span> <br />
              Lives.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl text-lg text-muted-foreground leading-relaxed"
            >
              OPAL-AI leverages high-precision geospatial intelligence and real-time medical data synchronization to bridge the gap between donors and those in urgent need.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/auth/donor/signup"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-2xl shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90"
              >
                <Heart className="h-5 w-5 fill-current" />
                Join the Network
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur-xl px-8 py-4 text-base font-bold text-foreground transition-all hover:bg-card"
              >
                <Shield className="h-5 w-5 text-muted-foreground" />
                Hospital Portal
              </Link>
            </motion.div>

            {/* Quick Stats Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-8 pt-4"
            >
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">2ms</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Match Latency</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Verified Network</p>
              </div>
            </motion.div>
          </div>

          {/* Right Visual (The WOW Aspect) */}
          <div className="relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[500px] aspect-square"
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-[80px] animate-pulse" />
              
              {/* Main 3D Image */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden glass-card shadow-2xl border border-border bg-white/40">
                <Image
                  src="/assets/heart-visual.png"
                  alt="3D Heart Visualization"
                  fill
                  className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                
                {/* Floating UI Elements over image */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-8 left-8 p-3 rounded-xl bg-white/80 backdrop-blur-md border border-border flex items-center gap-3 shadow-lg"
                >
                  <div className="h-2 w-2 rounded-full bg-success animate-ping" />
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-tighter">Sync: 100% Live</span>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-8 right-8 p-3 rounded-xl bg-white/80 backdrop-blur-md border border-border shadow-lg"
                >
                  <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">AI Match Confidence</p>
                  <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: ["0%", "98%"] }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Decorative floating particles */}
              {mounted && [...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -40, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 4,
                    repeat: Infinity,
                    delay: i * 0.8,
                  }}
                  className="absolute h-1 w-1 rounded-full bg-primary shadow-[0_0_10px_#dc2626]"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                />
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
