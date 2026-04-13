"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-[9999] px-3 py-1.5 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap shadow-2xl border border-white/20 pointer-events-none"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
