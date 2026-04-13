"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted/40 rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )} 
      style={style} 
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32 opacity-50" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/5">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 px-5 py-4"
          >
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48 opacity-60" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-40 opacity-60" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  const heights = [45, 70, 35, 80, 55, 90, 40];
  
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
      <Skeleton className="h-4 w-32 mb-8" />
      <div className="flex items-end gap-3 h-[280px]">
        {heights.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-1">
            <Skeleton className={`w-full rounded-t-lg transition-all duration-1000`} style={{ height: `${h}%` }} />
            <Skeleton className="h-1.5 w-full opacity-30" />
          </div>
        ))}
      </div>
    </div>
  );
}
