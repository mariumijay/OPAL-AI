"use client";

import { motion } from "framer-motion";
import { FolderOpen, Search, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "folder" | "search" | "alert";
  action?: () => void;
  actionLabel?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon = "folder", 
  action, 
  actionLabel 
}: EmptyStateProps) {
  const icons = {
    folder: <FolderOpen className="w-12 h-12 text-muted-foreground/40" />,
    search: <Search className="w-12 h-12 text-muted-foreground/40" />,
    alert: <AlertCircle className="w-12 h-12 text-destructive/40" />,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] border border-dashed border-border bg-muted/20"
    >
      <div className="mb-6 p-6 rounded-3xl bg-background shadow-inner">
        {icons[icon]}
      </div>
      <h3 className="text-xl font-black font-display tracking-tight text-foreground mb-2">
        {title}
      </h3>
      <p className="max-w-xs mx-auto text-sm text-muted-foreground leading-relaxed mb-8">
        {description}
      </p>
      {action && (
        <button
          onClick={action}
          className="px-8 py-3 rounded-2xl bg-foreground text-background text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
