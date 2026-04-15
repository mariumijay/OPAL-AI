"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, X, Brain } from "lucide-react";

interface MatchData {
  donorBloodType: string;
  recipientBloodType: string;
  requiredOrgan?: string;
  matchScore: number;
  distanceKm: number;
  urgencyLevel: string;
  donorCity: string;
  recipientCity: string;
  compatibilityPoints: number;
  distancePoints: number;
  urgencyPoints: number;
}

interface Props {
  matchData: MatchData;
}

export function AIAnalysisButton({ matchData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const getAnalysis = async () => {
    setIsLoading(true);
    setIsOpen(true);
    setAnalysis("");

    try {
      const res = await fetch("/api/ai/match-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAnalysis(data.analysis || "Analysis unavailable.");
    } catch {
      setAnalysis(
        "AI analysis temporarily unavailable. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-3">
      <button
        onClick={getAnalysis}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2
          py-2 px-4 rounded-xl border border-purple-500/30
          bg-purple-500/10 text-purple-400 font-bold text-xs
          hover:bg-purple-500/20 transition-all disabled:opacity-50
          uppercase tracking-widest"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        {isLoading ? "Gemini Analysing..." : "AI Analysis"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 p-4 rounded-xl bg-purple-500/5
              border border-purple-500/20 relative overflow-hidden"
          >
            <button
              onClick={() => {
                setIsOpen(false);
                setAnalysis("");
              }}
              className="absolute top-2 right-2 
                text-muted-foreground hover:text-foreground
                transition-colors"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-black text-purple-400
                uppercase tracking-widest">
                Gemini AI Analysis
              </span>
              <span className="text-xs text-purple-400/50 
                font-medium">
                — Powered by Google
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <div className="h-3 bg-purple-500/20 rounded-full
                  animate-pulse w-full" />
                <div className="h-3 bg-purple-500/20 rounded-full
                  animate-pulse w-4/5" />
                <div className="h-3 bg-purple-500/20 rounded-full
                  animate-pulse w-3/5" />
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground
                  leading-relaxed font-medium"
              >
                {analysis}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
