"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Users,
  Building2,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  heart: Heart,
  users: Users,
  building: Building2,
  "trending-up": TrendingUp,
};

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
  delay?: number;
  className?: string;
}

export function StatsCard({
  label,
  value,
  change,
  changeLabel,
  icon = "activity",
  delay = 0,
  className,
}: StatsCardProps) {
  const Icon = iconMap[icon] || Activity;
  const isPositive = change && change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
