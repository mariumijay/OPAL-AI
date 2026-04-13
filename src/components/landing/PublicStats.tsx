"use client";

import { motion } from "framer-motion";
import { useCityDonorStats } from "@/hooks/useSupabaseData";
import { mockCityStats } from "@/data/mock";
import { SkeletonChart } from "@/components/shared/Skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function PublicStats() {
  const { data: liveStats, isLoading } = useCityDonorStats();

  // Use live data if available, fall back to mock
  const cityStats = liveStats && liveStats.length > 0 ? liveStats : mockCityStats;

  const chartData = cityStats.map((c) => ({
    city: c.city,
    Available: c.available_donors,
    Total: c.total_donors,
  }));

  return (
    <section id="stats" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Transparency
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Live Donor{" "}
            <span className="gradient-text">Availability</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Real-time donor statistics across our partner cities.
          </p>
        </motion.div>

        {isLoading ? (
          <SkeletonChart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Donors by City
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="city"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="Available" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* City cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Available Donors
              </h3>
              {cityStats.slice(0, 5).map((city) => (
                <div
                  key={city.city}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-sm">{city.city}</p>
                    <p className="text-xs text-muted-foreground">
                      {city.blood_donors} blood · {city.organ_donors} organ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {city.available_donors}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      available
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
