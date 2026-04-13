"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const DonorMap = dynamic(() => import("@/components/map/DonorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] rounded-xl border border-border bg-card">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const Map = useMemo(() => DonorMap, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Geospatial Map View
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize hospitals and nearby available donors
        </p>
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden border border-border"
      >
        <Map />
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <span>Hospital</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-success" />
          <span>Available Donor</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>Unavailable Donor</span>
        </div>
      </div>
    </div>
  );
}
