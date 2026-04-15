"use client";

import { motion } from "framer-motion";
import { Cpu, Radio, ShieldCheck, Map, Brain, Zap, Database, GitBranch } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Trained Random Forest model scores donors on 24 clinical features — blood type, age, conditions, and organ type — delivering ranked results in milliseconds.",
    tag: "ML Model",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    icon: Map,
    title: "Geospatial Intelligence",
    description: "Haversine formula calculates Earth-accurate distances across Pakistan's 20+ cities. Real-time map with 'Locate Me' and proximity markers.",
    tag: "Real-time",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: ShieldCheck,
    title: "3-Layer Verification",
    description: "PMDC-compliant admin-approval flow. Every donor and hospital passes manual verification before network access is granted.",
    tag: "Compliance",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    icon: Radio,
    title: "Live Sync Network",
    description: "Supabase Realtime keeps match results, donor availability, and hospital requests synchronized across all connected clients instantly.",
    tag: "WebSocket",
    color: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/10",
  },
  {
    icon: Zap,
    title: "Emergency Urgency Engine",
    description: "Critical requests are scored with a dynamic urgency multiplier — ensuring life-critical cases always surface first in the queue.",
    tag: "Priority AI",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
  },
  {
    icon: Database,
    title: "Medical Data Export",
    description: "Admin can export live dataset as CSV anytime. Hospitals generate compliance audit reports with full match history at one click.",
    tag: "Analytics",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    icon: Cpu,
    title: "Gemini AI Analysis",
    description: "Google Gemini 1.5 Flash generates doctor-readable match narratives, donor eligibility checks, and response probability predictions.",
    tag: "NLP",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  {
    icon: GitBranch,
    title: "Approval Flow",
    description: "Automated email dispatch on registration and approval. Next.js middleware blocks dashboard access until admin verifies users.",
    tag: "Security",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <p className="text-xs font-black uppercase tracking-widest text-primary bg-primary/8 inline-block px-4 py-1.5 rounded-full border border-primary/15">
            Platform Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Built for{" "}
            <span className="text-primary">Life-Critical</span>{" "}
            Decisions
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-lg leading-relaxed">
            Every feature is purpose-built for the realities of emergency medical response in Pakistan.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`group relative rounded-2xl border ${feature.border} bg-white p-6 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1.5 transition-all duration-300 cursor-default`}
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} ${feature.color} transition-transform group-hover:scale-110`}>
                <feature.icon className="h-5 w-5" />
              </div>

              {/* Tag */}
              <span className={`inline-block mb-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${feature.bg} ${feature.color}`}>
                {feature.tag}
              </span>

              <h3 className="mb-2 text-sm font-black text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom hover bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${feature.bg.replace('bg-', 'bg-').replace('/8', '')} opacity-60`}
                style={{ background: `currentColor` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
