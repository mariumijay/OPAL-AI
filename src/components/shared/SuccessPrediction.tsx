"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, AlertTriangle } from "lucide-react";

interface PredictionData {
  probability: number;
  confidence: "high" | "medium" | "low";
  topFactor: string;
  riskFactor: string;
}

interface Props {
  matchScore: number;
  distanceKm: number;
  bloodType: string;
  urgencyLevel: string;
  donationType: string;
  donorCity: string;
  hospitalCity: string;
}

export function SuccessPrediction({
  matchScore,
  distanceKm,
  bloodType,
  urgencyLevel,
  donationType,
  donorCity,
  hospitalCity,
}: Props) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Blood type rarity classification
  const getRarity = (type: string): string => {
    if (!type) return "common";
    const rare = ["AB-", "B-", "O-", "A-"];
    const uncommon = ["AB+", "A+"];
    if (rare.includes(type)) return "rare";
    if (uncommon.includes(type)) return "uncommon";
    return "common";
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch("/api/ai/predict-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchScore,
            distanceKm,
            bloodType,
            urgencyLevel,
            donationType,
            donorCity,
            hospitalCity,
            timeOfDay: getTimeOfDay(),
            bloodTypeRarity: getRarity(bloodType),
          }),
        });

        const data = await res.json();
        setPrediction(data);
      } catch {
        setPrediction({
          probability: 65,
          confidence: "medium",
          topFactor: "Compatible match found",
          riskFactor: "Analysis unavailable",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrediction();
  }, [matchScore, distanceKm, bloodType, urgencyLevel, donationType, donorCity, hospitalCity]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-border mb-4">
        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">
          AI predicting response rate...
        </span>
      </div>
    );
  }

  if (!prediction) return null;

  const { probability, confidence, topFactor, riskFactor } = prediction;

  // Color based on probability
  const color =
    probability >= 70
      ? {
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          text: "text-green-500",
          bar: "bg-green-500",
          glow: "shadow-green-500/20",
        }
      : probability >= 50
      ? {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-500",
          bar: "bg-yellow-500",
          glow: "shadow-yellow-500/20",
        }
      : {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-500",
          bar: "bg-red-500",
          glow: "shadow-red-500/20",
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 mb-4 rounded-xl border ${color.bg} ${color.border} ${color.glow} shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className={`w-3 h-3 ${color.text}`} />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            AI Prediction
          </span>
        </div>
        <span className={`text-xs font-bold ${color.text} uppercase tracking-wide`}>
          {confidence} confidence
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${probability}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${color.bar}`}
          />
        </div>
        <span className={`text-lg font-black ${color.text} min-w-[3rem] text-right`}>
          {probability}%
        </span>
      </div>

      <p className={`text-xs font-bold ${color.text} mb-1`}>
        {probability >= 70
          ? "Likely to respond"
          : probability >= 50
          ? "May respond"
          : "Low response chance"}
      </p>

      <div className="space-y-1 mt-2 pt-2 border-t border-white/5">
        <p className="text-xs text-green-500 font-medium">✓ {topFactor}</p>
        <div className="flex items-start gap-1 mt-1">
          <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground font-medium">{riskFactor}</p>
        </div>
      </div>
    </motion.div>
  );
}
