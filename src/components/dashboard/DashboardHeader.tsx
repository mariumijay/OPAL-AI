"use client";

import { useEffect, useState } from "react";
import { LogOut, User, Bell, Search, Settings, Command } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { LogoutModal } from "../layout/LogoutModal";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { NotificationCenter } from "../layout/NotificationCenter";
import { CommandSearch } from "../layout/CommandSearch";

export function DashboardHeader() {
  const [user, setUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Session terminated. See you soon!");
      router.push("/");
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: `Neural Indexing: "${searchQuery}"...`,
        success: (data) => {
          setIsSearching(false);
          return `Global search complete. No matches for "${searchQuery}" in this node.`;
        },
        error: "Search failed",
      }
    );
  };

  // Get Page Title from Path
  const getPageTitle = () => {
    if (pathname.includes("/admin/approvals")) return "Institutional Approvals";
    if (pathname.includes("/admin/donors")) return "Donor Directory";
    if (pathname.includes("/admin/hospitals")) return "Hospital Network";
    if (pathname.includes("/admin")) return "Command Center";
    if (pathname.includes("/hospital/requests")) return "Emergency Requests";
    if (pathname.includes("/hospital/matching")) return "AI Matchmaker";
    if (pathname.includes("/hospital")) return "Control Room";
    if (pathname.includes("/donor")) return "Health Portal";
    return "Dashboard";
  };

  return (
    <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
          Internal Terminal / {user?.user_metadata?.role || "User"}
        </p>
        <h2 className="text-xl font-black font-display tracking-tight text-foreground">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div 
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border rounded-2xl mr-4 group hover:ring-2 hover:ring-primary/20 transition-all cursor-text"
        >
          <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          <div className="text-muted-foreground/50 text-xs w-32 lg:w-48 select-none">
            Search records...
          </div>
          <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-muted border border-border rounded text-[9px] font-black text-muted-foreground">
            <Command className="h-2 w-2" /> K
          </div>
        </div>

        <NotificationCenter />
        
        <div className="h-8 w-px bg-border mx-2" />

        <CommandSearch 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-none">
              {user?.user_metadata?.first_name || "Account"}
            </p>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-tighter mt-1">
              {user?.user_metadata?.role || "Authorized"}
            </p>
          </div>
          
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
            title="Secure Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />
    </div>
  );
}
