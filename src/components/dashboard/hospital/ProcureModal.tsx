"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Mail, Phone, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Match } from "@/lib/types";

interface ProcureModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProcureModal({ match, isOpen, onClose }: ProcureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!match) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call to procure
      await new Promise(r => setTimeout(r, 2000));
      toast.success("Procurement Request Sent!", {
        description: `Donor for ${match.blood_type} has been notified. Check match history for updates.`,
      });
      onClose();
    } catch (e) {
      toast.error("Network synchronization failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold font-display tracking-tight">Procurement Protocol</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Verification Step Required</p>
                 </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
               <div className="rounded-2xl border border-white/5 bg-white/5 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Target Donor</p>
                        <p className="text-lg font-bold text-foreground">{match.donor_name}</p>
                        <p className="text-xs font-mono text-muted-foreground">ID: {match.donor_id}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Compatibility</p>
                        <span className="text-2xl font-black text-primary">{match.blood_type}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                     <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">+92 XXX-XXXXXXX</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">Encrypted Node</span>
                     </div>
                  </div>
               </div>

               <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                     Proceeding will formally request this donor for medical procurement. High-priority matching protocols will be logged and audited for compliance.
                  </p>
               </div>

               <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full py-5 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest transition-all hover:bg-primary/90 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Verifying Credentials...</> : "Confirm Procurement"}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-muted-foreground font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Abort Request
                  </button>
               </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
