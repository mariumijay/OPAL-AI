"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfidenceMeter } from "@/components/shared/ConfidenceMeter";
import { BloodCompatBadge } from "@/components/shared/BloodCompatBadge";
import { SkeletonTable } from "@/components/shared/Skeleton";
import { useFindBloodDonors, useFindOrganDonors, useMatchResults } from "@/hooks/useSupabaseData";
import { BLOOD_TYPES, URGENCY_LEVELS, ORGAN_TYPES, CITIES } from "@/lib/constants";
import { formatDistance } from "@/lib/utils";
import type { UrgencyLevel, Match } from "@/lib/types";
import {
  Search,
  SlidersHorizontal,
  Phone,
  ArrowRightLeft,
  ChevronUp,
  ChevronDown,
  Zap,
  Droplets,
  HeartPulse,
  Activity,
  Filter,
} from "lucide-react";
import { ProcureModal } from "@/components/dashboard/hospital/ProcureModal";

type MatchMode = "blood" | "organ" | "history";
type SortKey = "match_score" | "distance_km";

export default function MatchingPage() {
  const searchParams = useSearchParams();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [mode, setMode] = useState<MatchMode>((searchParams.get("mode") as MatchMode) || "blood");
  const [bloodType, setBloodType] = useState(searchParams.get("bloodType") || "");
  const [organType, setOrganType] = useState(searchParams.get("organType") || "");
  const [city, setCity] = useState("Karachi"); 
  const [urgency, setUrgency] = useState<UrgencyLevel | "">((searchParams.get("urgency") as UrgencyLevel) || "Routine");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("match_score");
  const [sortAsc, setSortAsc] = useState(false);

  // Sync from URL if changed via internal nav (optional enhancement)
  useEffect(() => {
    const m = searchParams.get("mode") as MatchMode;
    if (m) setMode(m);
    const bt = searchParams.get("bloodType");
    if (bt) setBloodType(bt);
    const ot = searchParams.get("organType");
    if (ot) setOrganType(ot);
    const u = searchParams.get("urgency") as UrgencyLevel;
    if (u) setUrgency(u);
  }, [searchParams]);

  const isBloodSearchReady = mode === "blood" && !!bloodType && !!city && !!urgency;
  const isOrganSearchReady = mode === "organ" && !!organType && !!city && !!urgency;

  const {
    data: bloodMatches,
    isLoading: bloodLoading,
    isRefetching: bloodRefetching,
  } = useFindBloodDonors(bloodType, city, urgency, isBloodSearchReady);

  const {
    data: organMatches,
    isLoading: organLoading,
    isRefetching: organRefetching,
  } = useFindOrganDonors(organType, city, urgency, isOrganSearchReady);

  const { data: historyMatches, isLoading: historyLoading } = useMatchResults();

  const isLoading = (mode === "blood" && (bloodLoading || bloodRefetching)) ||
                    (mode === "organ" && (organLoading || organRefetching)) ||
                    (mode === "history" && historyLoading);

  // Success Toasts
  useEffect(() => {
    if (!isLoading && (((bloodMatches as any)?.length ?? 0) > 0 || ((organMatches as any)?.length ?? 0) > 0)) {
      const topMatch = ((bloodMatches as any)?.[0] || (organMatches as any)?.[0]);
      if (topMatch && topMatch.match_score > 90) {
        toast.success(`High-Confidence Match Found!`, {
          description: `Donor for ${topMatch.blood_type} is just ${formatDistance(topMatch.distance_km)} away.`,
          icon: <Activity className="h-4 w-4 text-success" />,
        });
      }
    }
  }, [isLoading, bloodMatches, organMatches]);

  const rawMatches: Match[] = useMemo(() => {
    if (mode === "blood") return (bloodMatches as any) || [];
    if (mode === "organ") return (organMatches as any) || [];
    if (mode === "history") return (historyMatches as any) || [];
    return [];
  }, [mode, bloodMatches, organMatches, historyMatches]);

  const filtered = useMemo(() => {
    let data = [...rawMatches];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(m => 
        m.donor_name?.toLowerCase().includes(q) || 
        m.blood_type?.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    return data;
  }, [rawMatches, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  const hasResults = filtered.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Live Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading gradient-text">Neural Matching Engine</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            Real-time geospatial synchronization active
          </p>
        </div>
      </div>

      {/* Mode Navigation */}
      <div className="flex p-1 bg-muted/30 rounded-2xl w-fit border border-white/5 backdrop-blur-md">
        {[
          { id: "blood" as MatchMode, label: "Hematology", icon: Droplets },
          { id: "organ" as MatchMode, label: "Transplant", icon: HeartPulse },
          { id: "history" as MatchMode, label: "History", icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === tab.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-white/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence mode="wait">
        {mode !== "history" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Filter className="h-3 w-3" /> Target Type
              </label>
              {mode === "blood" ? (
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                >
                  <option value="">All Blood Types</option>
                  {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              ) : (
                <select
                  value={organType}
                  onChange={(e) => setOrganType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                >
                  <option value="">All Organs</option>
                  {ORGAN_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-3 w-3" /> Location (RPC_CITY)
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              >
                {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Zap className="h-3 w-3" /> Priority Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel | "")}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              >
                {URGENCY_LEVELS.map((u) => (
                  <option key={u.value} value={u.value}>{u.emoji} {u.label}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Results Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Instant Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {filtered.length} Neural Matches
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SkeletonTable rows={6} />
            </motion.div>
          ) : hasResults ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Donor Persona</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer" onClick={() => toggleSort("match_score")}>
                      <span className="flex items-center gap-1">Confidence <SortIcon field="match_score" /></span>
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compatibility</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer" onClick={() => toggleSort("distance_km")}>
                      <span className="flex items-center gap-1">Distance <SortIcon field="distance_km" /></span>
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((match, i) => (
                    <motion.tr
                      key={match.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-white/5 transition-all"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center border border-white/10">
                            <span className="text-xs font-bold">{match.donor_name?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-none mb-1">{match.donor_name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground"># {match.donor_id.substring(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 min-w-[160px]">
                        <ConfidenceMeter score={match.match_score} size="sm" />
                      </td>
                      <td className="px-6 py-5">
                        <BloodCompatBadge level={match.compatibility} bloodType={match.blood_type} />
                      </td>
                      <td className="px-6 py-5 font-bold text-foreground">
                        {formatDistance(match.distance_km)}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={match.status} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all">
                            <Phone className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => { setSelectedMatch(match); setIsModalOpen(true); }}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                          >
                            Procure
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] py-24 text-center"
            >
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Intelligence Synchronized</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try broadening your parameters to find available donors.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProcureModal 
        match={selectedMatch} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
