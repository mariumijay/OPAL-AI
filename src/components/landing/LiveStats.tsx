"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Building2, Users, MapPin } from "lucide-react";
import { useGlobalStats } from "@/hooks/useSupabaseData";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    if (target === 0) {
      setCount(0);
      return;
    }
    
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function LiveStats() {
  const { data: liveStats } = useGlobalStats();

  // Use live data natively, showing 0 if db is empty. 
  // We remove the fallback to mock data as requested.
  const statsData = liveStats || { totalDonors: 0, totalHospitals: 0, livesSaved: 0, citiesCovered: 0 };

  const stats = [
    { icon: Users, value: statsData.totalDonors, label: "Registered Donors", suffix: "+" },
    { icon: Building2, value: statsData.totalHospitals, label: "Partner Hospitals", suffix: "" },
    { icon: Heart, value: statsData.livesSaved, label: "Lives Saved", suffix: "+" },
    { icon: MapPin, value: statsData.citiesCovered, label: "Cities Covered", suffix: "" },
  ];

  return (
    <section className="relative py-20 border-y border-border bg-muted/30 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group text-center space-y-3"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-border text-primary shadow-sm group-hover:scale-110 transition-transform">
                <stat.icon className="h-6 w-6" />
              </div>
              <p
                className="text-4xl font-black tracking-tighter text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
