"use client";

import { motion } from "framer-motion";
import { useRecipients } from "@/hooks/useSupabaseData";
import { mockRecipientRequests } from "@/data/mock";
import { SkeletonTable } from "@/components/shared/Skeleton";
import { RECIPIENT_STATUS_FLOW } from "@/lib/constants";
import {
  Clock,
  Search,
  Handshake,
  CheckCircle,
  Truck,
  HeartPulse,
  FileText,
  User,
} from "lucide-react";

const statusIcons: Record<string, typeof Clock> = {
  submitted: FileText,
  searching: Search,
  matched: Handshake,
  approved: CheckCircle,
  in_transit: Truck,
  completed: HeartPulse,
};

const statusLabels: Record<string, string> = {
  submitted: "Request Submitted",
  searching: "Searching Donors",
  matched: "Donor Matched",
  approved: "Transfer Approved",
  in_transit: "In Transit",
  completed: "Completed",
};

function mapRecipientStatus(raw: string | null): string {
  if (!raw) return 'submitted';
  const lower = raw.toLowerCase();
  if (RECIPIENT_STATUS_FLOW.includes(lower as typeof RECIPIENT_STATUS_FLOW[number])) return lower;
  if (lower === 'active' || lower === 'pending') return 'searching';
  if (lower === 'done' || lower === 'fulfilled') return 'completed';
  return 'submitted';
}

export default function RecipientPage() {
  const { data: recipients, isLoading } = useRecipients();

  const hasLiveData = recipients && recipients.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Request Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading requests...</p>
        </div>
        <SkeletonTable rows={4} />
      </div>
    );
  }

  // Build request cards from either live recipients or mock data
  const requests = hasLiveData
    ? recipients.map((r) => ({
        id: r.id,
        type: r.required_organ && r.required_organ !== '—' ? 'organ' : 'blood',
        blood_type: r.blood_type,
        organ: r.required_organ,
        urgency: r.urgency_level,
        hospital: r.hospital_name,
        status: mapRecipientStatus(r.status),
        submitted_at: r.created_at,
        estimated_wait: r.urgency_level === 'Emergency' ? '2-4 hours' : '1-3 weeks',
      }))
    : mockRecipientRequests.map((r) => ({
        id: r.id,
        type: r.request_type,
        blood_type: r.blood_type || '',
        organ: r.organ_type || '',
        urgency: r.urgency,
        hospital: r.hospital_name,
        status: r.status,
        submitted_at: r.submitted_at,
        estimated_wait: r.estimated_wait,
      }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Request Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {hasLiveData ? `${recipients.length} recipients from Supabase` : "Showing demo data"}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
          <User className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No recipient requests found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req, idx) => {
            const currentIndex = RECIPIENT_STATUS_FLOW.indexOf(
              req.status as (typeof RECIPIENT_STATUS_FLOW)[number]
            );

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold capitalize" style={{ fontFamily: "var(--font-display)" }}>
                      {req.type} Request — {req.blood_type}
                      {req.organ && req.organ !== '—' && ` · ${req.organ}`}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {req.hospital || '—'} · Submitted{" "}
                      {new Date(req.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        req.urgency === "Emergency"
                          ? "bg-destructive/10 text-destructive"
                          : req.urgency === "Urgent"
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {req.urgency?.toUpperCase()}
                    </span>
                    {req.estimated_wait && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Est. {req.estimated_wait}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    {RECIPIENT_STATUS_FLOW.map((status, i) => {
                      const Icon = statusIcons[status];
                      const isActive = i <= currentIndex;
                      const isCurrent = i === currentIndex;

                      return (
                        <div key={status} className="flex flex-col items-center flex-1 relative">
                          {i > 0 && (
                            <div
                              className={`absolute top-5 right-1/2 left-[-50%] h-0.5 ${
                                i <= currentIndex ? "bg-primary" : "bg-border"
                              }`}
                              style={{ width: "100%", left: "-50%" }}
                            />
                          )}
                          <div
                            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                              isCurrent
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 pulse-live"
                                : isActive
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span
                            className={`mt-2 text-[10px] font-medium text-center leading-tight max-w-[70px] ${
                              isActive ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {statusLabels[status]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
