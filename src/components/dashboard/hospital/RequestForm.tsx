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
    <div className="glass-card rounded-[2.5rem] p-10 border border-border shadow-2xl relative overflow-hidden bg-white/40 backdrop-blur-md">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center gap-4 mb-10">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <Send className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight uppercase">Initiate Request</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black italic">Neural Search Protocol</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Row 1: Type & Blood */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Requirement Category</label>
            <div className="grid grid-cols-3 gap-3">
              {["Blood", "Plasma", "Organ"].map(type => (
                <label key={type} className="relative group">
                   <input type="radio" value={type} {...register("request_type")} className="sr-only" />
                   <div className={`py-4 rounded-2xl border text-xs font-black uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 ${
                     watch("request_type") === type 
                       ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                       : 'bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary/20'
                   }`}>
                     {type}
                   </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Required Blood Group</label>
            <div className="grid grid-cols-4 gap-2">
               {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                 <label key={t} className="relative">
                    <input type="radio" value={t} {...register("blood_type")} className="sr-only" />
                    <div className={`py-3 rounded-xl border text-center text-sm font-black cursor-pointer transition-all ${
                      watch("blood_type") === t 
                        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                        : 'bg-card border-border text-muted-foreground hover:bg-muted'
                    }`}>
                      {t}
                    </div>
                 </label>
               ))}
            </div>
            {errors.blood_type && <p className="text-[10px] text-red-500 font-bold mt-1 px-1">Please select blood type</p>}
          </div>
        </div>

        {watch("request_type") === "Organ" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="space-y-3 p-4 rounded-3xl bg-primary/5 border border-primary/10"
          >
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Specific Organ Analysis</label>
            <select {...register("organ_needed")} className="w-full bg-white border border-border rounded-2xl py-4 px-5 text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all appearance-none cursor-pointer">
               <option value="">Select Organ Type...</option>
               {["Kidney", "Liver", "Heart", "Lungs", "Corneas", "Pancreas"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </motion.div>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Urgency Parameters</label>
            </div>
            <div className="flex gap-3">
               {["Routine", "Urgent", "Emergency"].map(level => (
                 <label key={level} className="flex-1">
                    <input type="radio" value={level} {...register("urgency_level")} className="sr-only" />
                    <div className={`py-4 rounded-2xl border text-center text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                      watchUrgency === level 
                        ? level === 'Emergency' ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/30' : 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                        : 'bg-card border-border text-muted-foreground hover:bg-muted font-bold'
                    }`}>
                      {level}
                    </div>
                 </label>
               ))}
            </div>
          </div>

          <div className="space-y-5 pt-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Search Distance Control</label>
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase">{watchRadius}km</div>
            </div>
            <div className="px-2">
              <input 
                type="range" 
                min="5" 
                max="100" 
                step="5" 
                {...register("search_radius_km", { valueAsNumber: true })}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all" 
              />
              <div className="flex justify-between mt-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest px-1">
                <span>Local (5km)</span>
                <span>Regional (100km)</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSearching}
          className="group relative w-full py-6 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 disabled:opacity-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isSearching ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing Biological Vectors...</> : <><Search className="h-5 w-5" /> Execute Neural Match</>}
        </button>
      </form>
    </div>
  );
}
