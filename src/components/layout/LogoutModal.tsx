"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, AlertCircle } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20 relative">
               <LogOut className="h-10 w-10" />
               <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
               </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black font-display tracking-tight text-foreground">Terminating Session?</h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[280px]">
                Are you sure you want to log out? Any unsaved medical records or matching progress might be lost.
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 pt-4">
              <button
                onClick={onConfirm}
                className="w-full py-4 rounded-2xl bg-destructive text-destructive-foreground font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-destructive/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-muted/50 border border-border text-foreground font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-muted"
              >
                No, Stay Connected
              </button>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
