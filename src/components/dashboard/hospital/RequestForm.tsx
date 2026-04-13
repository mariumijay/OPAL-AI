"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DonorRequestSchema, type DonorRequestValues } from "@/lib/schemas/hospital";
import { Send, AlertTriangle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function RequestForm() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<DonorRequestValues>({
    resolver: zodResolver(DonorRequestSchema),
    defaultValues: {
      request_type: "Blood",
      urgency_level: "Routine",
      search_radius_km: 20
    }
  });

  const watchUrgency = watch("urgency_level");
  const watchRadius = watch("search_radius_km");

  const onSubmit = async (data: DonorRequestValues) => {
    setIsSearching(true);
    try {
      const mode = data.request_type.toLowerCase() === 'organ' ? 'organ' : 'blood';
      
      const query = new URLSearchParams({
        mode,
        bloodType: data.blood_type,
        organType: data.organ_needed || "",
        urgency: data.urgency_level,
        radius: data.search_radius_km.toString()
      });
      
      toast.success("Initializing Neural Matching Interface...");
      
      // Navigate to matching results page
      router.push(`/dashboard/hospital/matching?${query.toString()}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-border shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display">Post Donor Request</h2>
          <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-widest font-bold">New Medical Requirement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Requirement Type</label>
            <div className="flex gap-2">
              {["Blood", "Plasma", "Organ"].map(type => (
                <label key={type} className="flex-1">
                   <input type="radio" value={type} {...register("request_type")} className="sr-only" />
                   <div className={`py-3 rounded-xl border text-center text-sm font-bold cursor-pointer transition-all ${watch("request_type") === type ? 'bg-primary border-primary text-white shadow-lg' : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}>
                     {type}
                   </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Required Blood Type</label>
            <select {...register("blood_type")} className="w-full bg-card border border-border rounded-xl py-4 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold">
               {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {watch("request_type") === "Organ" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Organ Needed</label>
            <select {...register("organ_needed")} className="w-full bg-card border border-border rounded-xl py-4 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold">
               {["Kidney", "Liver", "Heart", "Lungs", "Corneas", "Pancreas"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-muted-foreground">Urgency Level</label>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${watchUrgency === 'Emergency' ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground'}`}>
               {watchUrgency} Priority
            </span>
          </div>
          <div className="flex gap-2">
             {["Routine", "Urgent", "Emergency"].map(level => (
               <label key={level} className="flex-1">
                  <input type="radio" value={level} {...register("urgency_level")} className="sr-only" />
                  <div className={`py-3 rounded-xl border text-center text-xs font-black uppercase tracking-tighter cursor-pointer transition-all ${watchUrgency === level ? 'bg-primary border-primary text-white scale-105' : 'bg-card border-border text-muted-foreground'}`}>
                    {level}
                  </div>
               </label>
             ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-muted-foreground">Search Radius (km)</label>
            <span className="text-sm font-black text-primary">{watchRadius}km</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="100" 
            step="5" 
            {...register("search_radius_km", { valueAsNumber: true })}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSearching}
          className="w-full py-5 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest transition-all hover:bg-primary/90 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {isSearching ? <><Loader2 className="h-5 w-5 animate-spin" /> Calculating Compatability...</> : <><Search className="h-5 w-5" /> Find Matching Donors</>}
        </button>
      </form>
    </div>
  );
}
