"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Check, X, Activity } from "lucide-react";
import { toast } from "sonner";
import { useHospitals } from "@/hooks/useSupabaseData";
import { Hospital } from "@/lib/types";

export default function AdminApprovalsPage() {
  const { data: allHospitals, refetch: refetchHospitals, isLoading } = useHospitals();
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const pendingHospitals: Hospital[] = allHospitals?.filter(h => !h.is_verified) || [];

  const handleApprove = async (id: string) => {
    setIsActionLoading(id);
    try {
      const res = await fetch("/api/admin/approve-hospital", {
        method: "POST",
        body: JSON.stringify({ hospital_id: id }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      toast.success("Hospital approved successfully");
      refetchHospitals();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject and remove this hospital?")) return;
    setIsActionLoading(id);
    try {
      const res = await fetch("/api/admin/reject-hospital", {
        method: "POST",
        body: JSON.stringify({ hospital_id: id }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      toast.success("Hospital rejected and removed");
      refetchHospitals();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  if (isLoading && !allHospitals) {
     return <div className="h-64 bg-muted animate-pulse rounded-2xl" />;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Hospital Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">License</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">City</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingHospitals.map((h, i) => (
                <motion.tr 
                  key={h.hospital_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold">{h.hospital_name}</td>
                  <td className="px-6 py-4 text-sm font-mono">{h.license_number}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{h.city}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      onClick={() => handleApprove(h.hospital_id)}
                      disabled={isActionLoading === h.hospital_id}
                      className="p-2 rounded-lg bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white disabled:opacity-50 transition-all"
                    >
                      {isActionLoading === h.hospital_id ? <Activity className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleReject(h.hospital_id)}
                      disabled={isActionLoading === h.hospital_id}
                      className="p-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white disabled:opacity-50 transition-all"
                    >
                       <X className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {pendingHospitals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                    No pending registrations at the moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
