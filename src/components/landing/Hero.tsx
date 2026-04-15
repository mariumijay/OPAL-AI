"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Shield, Activity, Zap, MapPin, Brain, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const STATS = [
  { value: "800+", label: "Verified Donors" },
  { value: "2ms", label: "Match Latency" },
  { value: "99.4%", label: "AI Accuracy" },
  { value: "24/7", label: "Live Network" },
];

const TICKER_ITEMS = [
  "🔴 URGENT · O- Blood · Lahore · 2.4km away",
  "🫀 Kidney Match Found · Karachi · 89% Compatibility",
  "🩸 B+ Blood Request · Islamabad · Hospital Verified",
  "✅ Match Confirmed · Faisalabad · Donor En Route",
  "⚡ AI Score: 97% · Heart Donor · Rawalpindi",
];

// Fake heartbeat ECG path
const ECG_PATH = "M0,50 L40,50 L55,10 L65,90 L75,20 L90,60 L110,50 L160,50 L175,8 L188,92 L200,22 L215,65 L230,50 L280,50 L295,15 L308,85 L320,30 L335,60 L350,50 L400,50";

export function Hero() {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTickerIndex(i => (i + 1) % TICKER_ITEMS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
      background: "linear-gradient(180deg, #fafafa 0%, #ffffff 50%, #fef2f2 100%)"
    }}>

      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)",
        backgroundSize: "80px 80px"
      }} />

      {/* Soft radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220,38,38,0.06) 0%, transparent 70%)"
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-8 z-10">

            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-black tracking-widest uppercase text-primary">
                Pakistan&apos;s First AI Donor Network
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Every Second<br />
              <span className="text-primary" style={{ textShadow: "0 0 60px rgba(220,38,38,0.2)" }}>
                Saves a Life.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="max-w-lg text-lg text-muted-foreground leading-relaxed"
            >
              OPAL-AI connects verified blood and organ donors with hospitals in real-time — powered by a trained Machine Learning engine and geospatial matching.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/auth/donor/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 text-sm font-black text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
              >
                <Heart className="h-4 w-4 fill-white" />
                Become a Donor
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/hospital/signup"
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-border bg-white px-7 py-4 text-sm font-black text-foreground hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-0.5 transition-all"
              >
                <Shield className="h-4 w-4 text-primary" />
                Hospital Portal
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-5 pt-2"
            >
              {["Admin Verified", "AES-256 Encrypted", "PMDC Compliant"].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  {t}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN — Pure CSS Dashboard Preview ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main card */}
            <div className="relative rounded-3xl border border-border bg-white shadow-2xl shadow-black/8 overflow-hidden">

              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                    <Heart className="h-3.5 w-3.5 text-white fill-white" />
                  </div>
                  <span className="text-sm font-black">OPAL-AI</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase">Live</span>
                </div>
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c) => (
                    <div key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
                  ))}
                </div>
              </div>

              <div className="p-5 space-y-4">

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Active Donors", value: "847", icon: Heart, color: "text-primary", bg: "bg-primary/8" },
                    { label: "AI Matches", value: "1.2k", icon: Brain, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Hospitals", value: "34", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-2xl ${s.bg} p-3 border border-border/50`}>
                      <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
                      <p className="text-lg font-black text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* ECG Heartbeat */}
                <div className="rounded-2xl border border-border bg-foreground/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Live AI Match Signal</p>
                    <span className="flex items-center gap-1 text-[10px] font-black text-primary">
                      <Activity className="h-3 w-3" /> 99.4%
                    </span>
                  </div>
                  <svg viewBox="0 0 400 100" className="w-full h-12" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0" />
                        <stop offset="30%" stopColor="#dc2626" stopOpacity="1" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    <motion.polyline
                      points={ECG_PATH}
                      fill="none"
                      stroke="url(#ecgGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </svg>
                </div>

                {/* Match cards */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top AI Matches</p>
                  {[
                    { name: "Ahmed R.", type: "Blood · O+", city: "Lahore", score: 97, urgent: true },
                    { name: "Fatima K.", type: "Kidney", city: "Karachi", score: 91, urgent: false },
                    { name: "Hassan M.", type: "Blood · A-", city: "Islamabad", score: 88, urgent: false },
                  ].map((m, i) => (
                    <motion.div
                      key={m.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 border border-border/50 hover:border-primary/20 hover:bg-primary/3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                          {m.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-black text-foreground">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.type} · {m.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.urgent && <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[8px] font-black uppercase">Urgent</span>}
                        <span className="text-xs font-black text-primary">{m.score}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge — top right */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-border px-4 py-3 flex items-center gap-2"
            >
              <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider">Match Speed</p>
                <p className="text-base font-black text-primary">2ms</p>
              </div>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-border px-4 py-3"
            >
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Trained On</p>
              <p className="text-sm font-black text-foreground">800+ Records</p>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-border pt-10"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-foreground">{s.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Live Ticker ── */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 overflow-hidden rounded-2xl border border-border bg-muted/30 px-6 py-3 flex items-center gap-4"
          >
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">Live</span>
            <motion.p
              key={tickerIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-xs font-bold text-muted-foreground truncate"
            >
              {TICKER_ITEMS[tickerIndex]}
            </motion.p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
