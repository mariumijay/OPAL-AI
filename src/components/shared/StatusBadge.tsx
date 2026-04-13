"use client";

import { cn } from "@/lib/utils";
import type { MatchStatus } from "@/lib/types";

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
  },
  approved: {
    label: "Approved",
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent",
  },
  completed: {
    label: "Completed",
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-destructive/10",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  open: {
    label: "Open",
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent",
  },
  matching: {
    label: "Matching",
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning pulse-dot",
  },
  matched: {
    label: "Matched",
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  fulfilled: {
    label: "Fulfilled",
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  submitted: {
    label: "Submitted",
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent",
  },
  searching: {
    label: "Searching",
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning pulse-dot",
  },
  in_transit: {
    label: "In Transit",
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent pulse-dot",
  },
};

interface StatusBadgeProps {
  status: MatchStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
