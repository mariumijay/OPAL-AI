"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-w-0",
          isSidebarOpen ? "md:ml-[260px]" : "md:ml-[68px]",
          "ml-0"
        )}
      >
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen">
          <DashboardHeader />
          {children}
        </div>
      </main>
    </div>
  );
}
