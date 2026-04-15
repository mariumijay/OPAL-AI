"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfidenceMeter } from "@/components/shared/ConfidenceMeter";
import { BloodCompatBadge } from "@/components/shared/BloodCompatBadge";
import { SkeletonStats, SkeletonTable } from "@/components/shared/Skeleton";
import { useMatchResults, useAllDonors, useRecipients, useRealtimeMatchResults, useHospitals } from "@/hooks/useSupabaseData";
import NetworkMap from "@/components/dashboard/hospital/NetworkMap";
import { mockMatches } from "@/data/mock";
import { safeField } from "@/lib/mappers";
import { timeAgo } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { RequestForm } from "@/components/dashboard/hospital/RequestForm";
import { 
  Activity, 
  CreditCard, 
  Clock, 
  Search, 
  CheckCircle2, 
  FileBox,
  LayoutDashboard,
  History,
  ShieldCheck
} from "lucide-react";

export default function HospitalDashboard() {
  const { data: matchResults, isLoading: matchLoading } = useMatchResults();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean>(true);

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const userRole = user?.user_metadata?.role;
      setRole(userRole);
      
      if (!userRole || (userRole !== "hospital" && userRole !== "admin")) {
        router.push("/dashboard");
        return;
      }
      
      if (userRole === "hospital") {
        const { data: hospitalData } = await supabase
          .from("hospitals")
          .select("is_verified")
          .eq("user_id", user?.id)
          .single();
          
        if (hospitalData && !hospitalData.is_verified) {
          setIsVerified(false);
        } else {
          setIsVerified(true);
        }
      } else {
        setIsVerified(true); // admin is immune
      }
      
      setAuthLoading(false);
    }
    checkRole();
  }, [router]);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Institution verified! Welcome to the medical network.");
    }
  }, [searchParams]);
  const { data: allDonors, isLoading: donorLoading } = useAllDonors();
  const { data: allHospitals } = useHospitals();
  const { data: recipients } = useRecipients();
  const realtimeMatches = useRealtimeMatchResults();

  const isLoading = matchLoading || donorLoading;

  const matches = (matchResults && matchResults.length > 0) ? matchResults : mockMatches.map(m => ({
    ...m,
    id: m.id,
    donor_id: m.donor_id,
    donor_name: m.donor_name || '—',
    hospital_name: '',
  }));

  const allMatches = [...realtimeMatches, ...matches.filter(
    m => !realtimeMatches.some(rm => rm.id === m.id)
  )];

  if (authLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (role !== "hospital" && role !== "admin") {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black font-display">Access Restricted</h1>
          <p className="text-muted-foreground text-sm font-medium">Redirecting you to the safe zone...</p>
        </div>
      );
  }

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 max-w-lg mx-auto text-center px-4">
        <div className="h-20 w-20 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-black font-display text-foreground mb-2">Pending Verification</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your hospital registration has been received and is currently under review by the OPAL-AI Medical Board. 
            For security reasons, access to the Neural Matching Engine is restricted until your medical licenses are validated.
          </p>
        </div>
        <div className="p-4 bg-muted/40 rounded-xl border border-border w-full flex items-start gap-3 text-left">
          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">Estimated Wait Time: 24-48 Hours</p>
            <p className="text-xs text-muted-foreground mt-1">Our team will contact you via email once approved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-display tracking-tight text-foreground">
            Hospital <span className="text-primary">Control Room</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Real-time geospatial donor matching engine.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card border border-border rounded-2xl px-5 py-3 shadow-sm">
           <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
           <span className="text-xs font-bold text-foreground uppercase tracking-widest">System Live: Pakistan Network</span>
        </div>
      </div>

      {/* SECTION 1: Overview Stats */}
      {isLoading ? <SkeletonStats /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Active Requests" value={allMatches.filter(m => m.status === 'pending').length || 4} icon="activity" delay={0} change={2} changeLabel="today" />
          <StatsCard label="Total Matches" value={allMatches.length || 15} icon="heart" delay={0.05} change={12} changeLabel="this month" />
          <StatsCard label="Match Success" value="94%" icon="trending-up" delay={0.1} />
          <StatsCard label="Network Density" value="High" icon="users" delay={0.15} />
        </div>
      )}

      {/* NEW SECTION: Geospatial Network Map */}
      <div className="space-y-6">
          <div className="flex items-center justify-between">
              <div>
                  <h2 className="text-xl font-black font-display tracking-tight">Geospatial Matching Network</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Live Vectors from {allMatches.length} matching nodes</p>
              </div>
          </div>
          <NetworkMap 
            donors={allDonors || []} 
            hospitals={allHospitals || []}
            matches={allMatches}
          />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* SECTION 2: Post Donor Request */}
        <div className="xl:col-span-4">
          <RequestForm />
        </div>

        {/* SECTION 3: Recent Activity & Subscription */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Recent Match Feed */}
          <div className="glass-card rounded-[2rem] border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold font-display">Live Match Feed</h2>
                </div>
                <Link href="/dashboard/hospital/matching" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
                    AI Analysis Result
                </Link>
            </div>
            
            <div className="divide-y divide-border">
                {allMatches.slice(0, 4).map((match, i) => (
                    <motion.div 
                        key={match.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center">
                                <span className={`text-lg font-black ${match.match_score > 80 ? 'text-success' : 'text-primary'}`}>
                                    {Math.round(match.match_score)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{match.donor_name || `DNRID-${match.donor_id.slice(0,6)}`}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                    <span className="text-primary">{match.blood_type}</span>
                                    <span>·</span>
                                    <span>{match.distance_km} km away</span>
                                </div>
                            </div>
                        </div>
                        <StatusBadge status={match.status} />
                    </motion.div>
                ))}
            </div>
          </div>

          {/* SECTION 4: Subscription Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-[2rem] p-6 border border-border bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold font-display">Subscription Status</h3>
                </div>
                
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Current Plan</span>
                        <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">Enterprise Elite</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-muted-foreground uppercase">Service Days Remaining</span>
                            <span className="text-foreground">24 Days</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "80%" }}
                                className="h-full bg-primary" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-[2rem] p-6 border border-border flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-display">Compliance Score</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Verified Facility</p>
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">99.2</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase">/100</span>
                </div>
                <button className="mt-4 w-full py-3 rounded-xl bg-card border border-border hover:bg-muted font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                    <FileBox className="h-4 w-4" /> Download Audit Report
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
