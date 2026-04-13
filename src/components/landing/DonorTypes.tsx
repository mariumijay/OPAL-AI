"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Droplets, Shield, Heart, ArrowRight } from "lucide-react";

const donorTypes = [
  {
    type: "Blood Donor",
    icon: Droplets,
    description: "Donate plasma or whole blood to help patients in emergency surgeries and chronic treatments.",
    cta: "Join as Blood Donor",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    type: "Organ Donor",
    icon: Heart,
    description: "Pledge to donate organs like Kidney, Liver, or Heart. Your decision can save up to 8 lives.",
    cta: "Pledge Now",
    color: "text-rose-600",
    bg: "bg-rose-600/10",
  },
  {
    type: "Verified Network",
    icon: Shield,
    description: "Hospitals can join our verified network to access the national donor matching pool instantly.",
    cta: "Hospital Registration",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  }
];

export function DonorTypes() {
  return (
    <section className="py-24 relative overflow-hidden bg-background/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {donorTypes.map((item, i) => (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card group flex flex-col items-center text-center p-8 rounded-3xl border border-white/10 hover:border-primary/30 transition-all hover:-translate-y-2 shadow-2xl"
            >
              <div className={`mb-6 p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display">{item.type}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                {item.description}
              </p>
              <Link
                href={item.type === "Hospital Registration" ? "/auth/hospital/signup" : "/auth/donor/signup"}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    item.type === "Hospital Registration" 
                    ? "bg-card hover:bg-muted text-foreground border border-border" 
                    : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                }`}
              >
                {item.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
