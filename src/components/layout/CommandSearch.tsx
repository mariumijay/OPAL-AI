"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  X, 
  Command, 
  User, 
  Building2, 
  Activity, 
  ArrowRight,
  TrendingUp,
  History,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAllDonors, useHospitals } from "@/hooks/useSupabaseData";
import { mockDonors, mockHospitals } from "@/data/mock";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "donor" | "hospital" | "metric" | "action";
  link: string;
  status?: string;
}

export function CommandSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: liveDonors } = useAllDonors();
  const { data: liveHospitals } = useHospitals();

  const donors = liveDonors?.length ? liveDonors : mockDonors;
  const hospitals = liveHospitals?.length ? liveHospitals : mockHospitals;

  const results: SearchResult[] = [];

  if (query.trim()) {
    const q = query.toLowerCase();
    
    // Search Donors
    donors.forEach(d => {
      if (d.full_name?.toLowerCase().includes(q) || d.blood_type?.toLowerCase().includes(q)) {
        results.push({
          id: d.id,
          title: d.full_name,
          subtitle: `Blood Type: ${d.blood_type} • ${d.city}`,
          type: "donor",
          link: "/dashboard/admin/donors",
          status: "Available"
        });
      }
    });

    // Search Hospitals
    hospitals.forEach(h => {
      if (h.name?.toLowerCase().includes(q) || h.city?.toLowerCase().includes(q)) {
        results.push({
          id: h.id,
          title: h.name,
          subtitle: `${h.hospital_type || 'Facility'} • ${h.city}`,
          type: "hospital",
          link: "/dashboard/admin/hospitals",
          status: "Verified"
        });
      }
    });

    // Smart Actions
    if ("emergency".includes(q)) {
      results.push({
        id: "action-emergency",
        title: "Initiate Emergency Broadcast",
        subtitle: "Trigger AI-powered alert system",
        type: "action",
        link: "/dashboard/hospital/requests"
      });
    }
  }

  // Handle hotkeys
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // This is handled by parent, but let's be safe
      }
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search className="h-5 w-5 text-primary" />
              <input 
                autoFocus
                className="flex-1 bg-transparent border-none focus:outline-none text-base placeholder:text-muted-foreground/50"
                placeholder="Search matching results, donors, hospitals..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!query.trim() ? (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Command className="h-8 w-8 text-primary/40" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">AI Neural Search</h3>
                  <p className="text-xs text-muted-foreground mt-1">Type anything to search across the entire OPAL-AI network.</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-8">
                    {[
                      { icon: Activity, label: "Live Matches", cmd: "matches" },
                      { icon: TrendingUp, label: "Global Stats", cmd: "stats" },
                      { icon: History, label: "Recent Alerts", cmd: "alerts" },
                      { icon: AlertCircle, label: "Medical Flags", cmd: "flags" },
                    ].map((item) => (
                      <button 
                        key={item.label}
                        onClick={() => setQuery(item.cmd)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border hover:bg-muted transition-colors text-left"
                      >
                        <item.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.slice(0, 8).map((res) => (
                    <button
                      key={res.id}
                      onClick={() => { router.push(res.link); onClose(); }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          {res.type === "donor" && <User className="h-5 w-5" />}
                          {res.type === "hospital" && <Building2 className="h-5 w-5" />}
                          {res.type === "action" && <Activity className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{res.title}</p>
                          <p className="text-xs text-muted-foreground">{res.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.status && <span className="text-[10px] font-black uppercase text-success bg-success/10 px-2 py-0.5 rounded-full">{res.status}</span>}
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm font-bold text-muted-foreground">No matching nodes found for &quot;{query}&quot;</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Try searching for a blood type, name, or city.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Select</span>
                <span className="flex items-center gap-1"><Command className="h-3 w-3" /> Open</span>
              </div>
              <p className="text-[10px] font-black text-primary uppercase">OPAL-AI Neural Engine v1.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
