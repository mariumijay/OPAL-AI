"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a"; // green
  if (score >= 60) return "#eab308"; // yellow
  if (score >= 40) return "#f97316"; // orange
  return "#dc2626"; // red
}

export function ConfidenceMeter({
  score,
  size = "md",
  showLabel = true,
  className,
}: ConfidenceMeterProps) {
  const color = getScoreColor(score);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("flex-1 rounded-full bg-muted overflow-hidden", heights[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", heights[size])}
          style={{ backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-bold tabular-nums min-w-[36px] text-right"
          style={{ color }}
        >
          {Math.round(score)}%
        </span>
      )}
    </div>
  );
}
