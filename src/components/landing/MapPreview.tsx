"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const DonorMap = dynamic(() => import("../map/DonorMap"), { 
    ssr: false,
    loading: () => (
        <div className="h-[600px] w-full bg-card/50 backdrop-blur-sm animate-pulse rounded-3xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Initialising Geospatial Database...</span>
            </div>
        </div>
    )
});

export function MapPreview() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <MapPin className="h-3 w-3" />
            Live Network Status
          </div>
          <h2 className="text-4xl font-black mb-4 font-display">Find Donors in Real-Time</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our high-precision map interface allows hospitals to visualize donor density and proximity instantly for optimized logistics.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="rounded-3xl border border-white/10 overflow-hidden shadow-3xl bg-card"
        >
          <DonorMap />
        </motion.div>
        
        <div className="mt-8 flex justify-center gap-8">
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_#dc2626]" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verified Donors</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Medical Facilities</span>
            </div>
        </div>
      </div>
    </section>
  );
}
