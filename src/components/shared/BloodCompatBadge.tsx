"use client";

import { cn } from "@/lib/utils";
import { getCompatibilityColor } from "@/lib/constants";
import type { CompatibilityLevel } from "@/lib/types";

interface BloodCompatBadgeProps {
  level: CompatibilityLevel;
  bloodType?: string;
  className?: string;
}

const levelLabels: Record<CompatibilityLevel, string> = {
  full: "Perfect Match",
  compatible: "Compatible",
  incompatible: "Incompatible",
};

export function BloodCompatBadge({
  level,
  bloodType,
  className,
}: BloodCompatBadgeProps) {
  const color = getCompatibilityColor(level);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border",
        className
      )}
      style={{
        color,
        borderColor: `${color}33`,
        backgroundColor: `${color}15`,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {bloodType && <span className="font-bold">{bloodType}</span>}
      {levelLabels[level]}
    </span>
  );
}
