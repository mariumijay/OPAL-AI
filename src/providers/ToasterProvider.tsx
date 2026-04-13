"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group border-border bg-card text-foreground shadow-lg rounded-xl glass-card",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
