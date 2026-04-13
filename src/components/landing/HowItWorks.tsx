"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, Handshake, HeartPulse } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Register & Verify",
    description:
      "Donors and hospitals sign up and complete verification for a trusted network.",
  },
  {
    icon: Search,
    number: "02",
    title: "Post a Request",
    description:
      "Hospitals submit blood or organ requests with urgency levels and location details.",
  },
  {
    icon: Handshake,
    number: "03",
    title: "AI Finds Matches",
    description:
      "Our engine scores and ranks compatible donors by proximity, availability, and compatibility.",
  },
  {
    icon: HeartPulse,
    number: "04",
    title: "Save a Life",
    description:
      "Hospitals contact donors, initiate transfers, and track progress to completion.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            The Process
          </p>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground font-medium">
            From registration to life-saving action — in four simple steps.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[32px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center space-y-5"
              >
                {/* Number circle */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-[2rem] bg-background border border-border shadow-xl shadow-primary/5 transition-all hover:scale-110 hover:border-primary">
                  <step.icon className="h-7 w-7 text-primary" />
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-md">
                    {step.number}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3
                    className="text-xl font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
