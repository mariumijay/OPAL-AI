"use client";

import { useState } from "react";
import { Building2, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Hospital } from "@/lib/types";

export default function AdminHospitalsPage() {
  const { data: allHospitals, refetch: refetchHospitals, isLoading } = useQuery<Hospital[]>({
    queryKey: ['admin_all_hospitals'],
    queryFn: async () => {
      const res = await fetch('/api/admin/hospitals');
      if (!res.ok) throw new Error("Failed to fetch hospitals");
      return await res.json();
    },
    refetchInterval: 15000,
  });

  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const verifiedHospitals = allHospitals?.filter(h => h.is_verified) || [];

  const toggleHospitalVerification = async (id: string, current: boolean) => {
    setIsActionLoading(id);
    try {
      const res = await fetch("/api/admin/approve-hospital", {
        method: "POST",
        body: JSON.stringify({ hospital_id: id, revoke: current }),
      });
      if (!res.ok) throw new Error("Action failed");
      toast.success(current ? "Hospital suspended" : "Hospital re-verified");
      refetchHospitals();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Remove this hospital permanently?")) return;
    setIsActionLoading(id);
    try {
      const res = await fetch("/api/admin/reject-hospital", {
        method: "POST",
        body: JSON.stringify({ hospital_id: id }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Hospital removed");
      refetchHospitals();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">Verified <span className="text-primary">Facilities</span></h1>
        <p className="text-muted-foreground mt-2">Manage all active and approved medical centers.</p>
      </div>

      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Hospital Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">City</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">License</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {verifiedHospitals.map((h) => (
                <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold">{h.hospital_name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{h.city}</td>
                  <td className="px-6 py-4 text-sm font-mono">{h.license_number}</td>
                  <td className="px-6 py-4 flex gap-2">
                     <button 
                      onClick={() => toggleHospitalVerification(h.id, true)}
                      disabled={isActionLoading === h.id}
                      className="p-2 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all disabled:opacity-50" 
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleReject(h.id)}
                      disabled={isActionLoading === h.id}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50" 
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
