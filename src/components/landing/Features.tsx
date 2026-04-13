"use client";

import { motion } from "framer-motion";
import { Cpu, Radio, ShieldCheck, Map } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI-Powered Matching",
    description:
      "Our intelligent algorithm scores donors based on compatibility, distance, availability, and urgency to find the perfect match in seconds.",
  },
  {
    icon: Radio,
    title: "Real-Time Tracking",
    description:
      "Track every stage of the donation process — from request to completion — with live updates and browser notifications.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Network",
    description:
      "Every hospital and donor undergoes rigorous verification. Our platform ensures trust, transparency, and compliance at every step.",
  },
  {
    icon: Map,
    title: "Geospatial Intelligence",
    description:
      "Visualize donors and hospitals on an interactive map. Our distance calculations optimize logistics for time-critical transfers.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Why OPAL-AI
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built for{" "}
            <span className="gradient-text">Life-Critical</span>{" "}
            Decisions
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Every second counts. Our platform is engineered for speed, accuracy,
            and reliability when it matters most.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3
                className="mb-2 text-lg font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
