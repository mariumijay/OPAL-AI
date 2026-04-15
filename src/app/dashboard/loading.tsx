"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center justify-center"
        >
          {/* Outer glow ring */}
          <div className="absolute h-24 w-24 rounded-full border border-primary/20 bg-primary/5" />
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
          
          {/* Inner core */}
          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
        </motion.div>
        
        <div className="flex flex-col items-center space-y-2 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
              Establishing Secure Uplink
            </h3>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-muted-foreground"
          >
            Decrypting medical profiles & syncing live geospatial data...
          </motion.p>
        </div>

        {/* Cinematic Progress Bar */}
        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
