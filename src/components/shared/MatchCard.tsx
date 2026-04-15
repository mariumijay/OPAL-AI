"use client";

import { motion } from "framer-motion";
import { Heart, MapPin, Activity, ShieldCheck, ArrowUpRight, ClipboardList, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Match } from "@/lib/types";
import { AIAnalysisButton } from "./AIAnalysisButton";
import { SuccessPrediction } from "./SuccessPrediction";
interface MatchCardProps {
  match: Match;
  onProcure: (match: Match) => void;
  index?: number;
}

export function MatchCard({ match, onProcure, index = 0 }: MatchCardProps) {
  const scoreColor = 
    match.match_score >= 80 ? "text-green-500" : 
    match.match_score >= 60 ? "text-yellow-500" : 
    "text-red-500";
  
  const progressColor = 
    match.match_score >= 80 ? "bg-green-500" : 
    match.match_score >= 60 ? "bg-yellow-500" : 
    "bg-red-500";

  const isOrgan = !!match.organ_type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative glass-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display tracking-tight text-foreground">{match.donor_name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-muted text-muted-foreground`}>
                  ID: {match.donor_id.slice(0, 8)}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20`}>
                  CNIC: {match.cnic}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                  <MapPin className="h-3 w-3" />
                  {match.distance_km} KM
                </div>
              </div>
          </div>
        </div>

        <div className="text-right">
           <div className={`text-2xl font-black font-display ${scoreColor}`}>
             {match.match_score}<span className="text-xs ml-0.5">pts</span>
           </div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Match Score</p>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Score Breakdown</span>
          <span>
            {match.score_breakdown ? 
              `${match.score_breakdown.compatibility} + ${match.score_breakdown.distance} + ${match.score_breakdown.urgency}` : 
              match.match_score}
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
          <div className={`${progressColor} h-full transition-all duration-1000`} style={{ width: `${match.match_score}%` }} />
        </div>
        <p className="text-[9px] text-muted-foreground italic">
          Compatibility(50%) + Distance(30%) + Urgency(20%)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{isOrgan ? "Target Organ" : "Blood Group"}</p>
          <div className="flex items-center gap-2">
            {isOrgan && <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(220,38,38,0.6)]" />}
            <p className="text-sm font-bold text-primary">{isOrgan ? match.organ_type : match.blood_type}</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Clinic Status</p>
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${isOrgan ? "bg-warning" : "bg-success"} animate-pulse`} />
            <p className="text-sm font-bold text-foreground">{isOrgan ? "Screening Ready" : "Immediate"}</p>
          </div>
        </div>
      </div>

      {isOrgan && (
        <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.15em] flex items-center gap-2">
              <ClipboardList className="h-3 w-3" /> Medical Protocol Required
            </h4>
            <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground uppercase">
              <Info className="h-2.5 w-2.5" /> Stage 1/4
            </div>
          </div>
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-[10px] font-bold text-foreground opacity-80">
               <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
               Identity Verified & Legal Consent Logged
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
               <div className="h-3 w-3 rounded-full border border-border shrink-0" />
               Schedule HLA Tissue Typing (Physical Call)
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
               <div className="h-3 w-3 rounded-full border border-border shrink-0" />
               Cross-match Serology Verification
             </div>
          </div>
          <div className="pt-2 flex items-center gap-2 text-[9px] font-bold text-warning uppercase tracking-tighter">
             <AlertTriangle className="h-3 w-3" /> High Precision Logistics Mandatory
          </div>
        </div>
      )}

      <SuccessPrediction
        matchScore={match.match_score}
        distanceKm={match.distance_km || 0}
        bloodType={match.blood_type || "Unknown"}
        urgencyLevel={match.urgency || "routine"}
        donationType={match.organ_type ? "organ" : "blood"}
        donorCity={"Unknown"}
        hospitalCity={"Unknown"}
      />

      <button
        onClick={() => onProcure(match)}
        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn ${
          isOrgan 
            ? "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20" 
            : "bg-foreground text-background hover:bg-primary hover:text-white"
        }`}
      >
        {isOrgan ? "Initiate Clinical Screening" : "Initiate Procurement"}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
      </button>

      <AIAnalysisButton
        matchData={{
          donorBloodType: match.blood_type,
          recipientBloodType: "Required Type", // Hardcoded since we don't have recipient type injected in this component yet
          requiredOrgan: match.organ_type || undefined,
          matchScore: match.match_score,
          distanceKm: match.distance_km || 0,
          urgencyLevel: match.urgency || "routine",
          donorCity: "Unknown",
          recipientCity: "Unknown",
          compatibilityPoints: match.score_breakdown ? match.score_breakdown.compatibility : Math.round(match.match_score * 0.5),
          distancePoints: match.score_breakdown ? match.score_breakdown.distance : Math.round(match.match_score * 0.3),
          urgencyPoints: match.score_breakdown ? match.score_breakdown.urgency : Math.round(match.match_score * 0.2),
        }}
      />

      {/* Decorative pulse for high matches */}
      {match.match_score > 90 && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[8px] font-bold text-white items-center justify-center">!</span>
        </div>
      )}
    </motion.div>
  );
}
