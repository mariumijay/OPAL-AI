"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ShieldCheck, Activity, Heart, Info } from "lucide-react";
import { useRealtimeMatchResults } from "@/hooks/useSupabaseData";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'match' | 'system' | 'alert';
  timestamp: Date;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'initial',
      title: 'Neural Link Active',
      message: 'Secure connection to national health grid established.',
      type: 'system',
      timestamp: new Date()
    }
  ]);

  // Hook into Realtime Match Results
  useRealtimeMatchResults((newMatch) => {
    const notify: Notification = {
      id: newMatch.id,
      title: 'New High-Priority Match',
      message: `Compatible donor ${newMatch.donor_name} detected for current facility.`,
      type: 'match',
      timestamp: new Date()
    };
    setNotifications(prev => [notify, ...prev]);
    
    // Also show a toast if center is closed
    if (!isOpen) {
      toast("Match Alert", {
        description: notify.message,
        icon: <Heart className="h-4 w-4 text-primary" />
      });
    }
  });

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-card border border-border hover:bg-muted transition-all group"
      >
        <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[8px] font-bold text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 z-50 glass-card rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <h3 className="font-bold font-display text-sm tracking-tight text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> 
                  Operations Intelligence
                </h3>
                <button 
                  onClick={() => setNotifications([])}
                  className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <Info className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                    <p className="text-xs text-muted-foreground font-medium">No active transmissions in current buffer.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-muted/30 transition-colors relative group">
                        <div className="flex gap-3">
                           <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === 'match' ? 'bg-primary shadow-[0_0_8px_#dc2626]' : 'bg-blue-500'}`} />
                           <div className="space-y-1">
                              <p className="text-xs font-bold text-foreground leading-none">{n.title}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground/50 font-mono italic">
                                {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-muted/50 text-center border-t border-border">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">OPAL Secure Node v2.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
