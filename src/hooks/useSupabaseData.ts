"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { OpalMatchingEngine, MatchFeatures } from "@/lib/ai-engine";
import {
  mapDonor,
  mapBloodDonor,
  mapOrganDonor,
  mapMatchResult,
  mapRecipient,
  mapHospital,
} from "@/lib/mappers";
import type {
  Donor,
  Match,
  Recipient,
  Hospital,
  CityDonorStats,
  GlobalStats,
  DonorRow,
  RecipientRow,
  HospitalRow,
  MatchResultRow,
  MedicalProfileRow,
  BloodDonorRow,
  OrganDonorRow,
} from "@/lib/types";

// ---------- Donors (Separate Tables Architecture) ----------

export function useBloodDonors(): UseQueryResult<Donor[]> {
  return useQuery<Donor[]>({
    queryKey: ["blood_donors"],
    queryFn: async (): Promise<Donor[]> => {
      const { data, error } = await createClient()
        .from("blood_donors")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        // Silent error handle for logs, rethrow for Query
        throw error;
      }
      return (data as BloodDonorRow[]).map(mapBloodDonor);
    },
  });
}

export function useOrganDonors(): UseQueryResult<Donor[]> {
  return useQuery<Donor[]>({
    queryKey: ["organ_donors"],
    queryFn: async (): Promise<Donor[]> => {
      const { data, error } = await createClient()
        .from("organ_donors")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data as OrganDonorRow[]).map(mapOrganDonor);
    },
  });
}

/** Unified interface for components that need both */
export function useAllDonors(): UseQueryResult<Donor[]> {
  const blood = useBloodDonors();
  const organ = useOrganDonors();

  const isLoading = blood.isLoading || organ.isLoading;
  const error = blood.error || organ.error;
  
  const combinedData = [...(blood.data || []), ...(organ.data || [])].sort((a,b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    data: combinedData,
    isLoading,
    error,
    status: isLoading ? 'loading' : error ? 'error' : 'success',
  } as UseQueryResult<Donor[]>;
}

// ---------- Hospitals ----------

export function useHospitals(): UseQueryResult<Hospital[]> {
  return useQuery<Hospital[]>({
    queryKey: ["hospitals"],
    queryFn: async (): Promise<Hospital[]> => {
      const { data, error } = await createClient()
        .from("hospitals")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data as HospitalRow[]).map(mapHospital);
    },
  });
}

// ---------- Recipients ----------

export function useRecipients(): UseQueryResult<Recipient[]> {
  return useQuery<Recipient[]>({
    queryKey: ["recipients"],
    queryFn: async (): Promise<Recipient[]> => {
      const { data, error } = await createClient()
        .from("recipients")
        .select("*")
        .order("recipient_id", { ascending: false });
      
      if (error) throw error;
      return (data as RecipientRow[]).map(mapRecipient);
    },
  });
}

// ---------- Match Results ----------

export function useMatchResults(): UseQueryResult<Match[]> {
  return useQuery<Match[]>({
    queryKey: ["match_results"],
    queryFn: async (): Promise<Match[]> => {
      const { data, error } = await createClient()
        .from("match_results")
        .select("*")
        .order("id", { ascending: false });
      
      if (error) throw error;
      return (data as MatchResultRow[]).map(mapMatchResult);
    },
  });
}

// ---------- Matching Engine Interface ----------

const BACKEND_URL = "http://localhost:8000";

export function useFindDonors(
  params: { bloodType?: string; organType?: string; city: string; urgency: string },
  enabled: boolean = true
): UseQueryResult<Match[]> {
  return useQuery<Match[]>({
    queryKey: ["find_donors_v2", params],
    enabled: enabled && !!params.urgency,
    queryFn: async (): Promise<Match[]> => {
      // 1. Fetch data from Supabase (Filtering at Source for Performance)
      const supabase = createClient();
      const table = params.organType ? 'organ_donors' : 'blood_donors';
      const { data: rawDonors, error } = await supabase
        .from(table)
        .select("*")
        .eq('is_available', true);

      if (error) throw error;

      // 2. Process matches through the AI Matching Engine
      return (rawDonors || []).map((donor: any) => {
        const features: MatchFeatures = {
          bloodCompatibility: donor.blood_type === params.bloodType ? 1.0 : 0.8, // Simplified logic
          distanceKm: donor.city.toLowerCase() === params.city.toLowerCase() ? 5 : 50,
          urgencyLevel: params.urgency as any,
          donorReliability: 0.9, // This would be dynamic in production
          medicalVerified: donor.verification_status === 'verified'
        };

        const score = OpalMatchingEngine.calculateMatchProbability(features);
        const insight = OpalMatchingEngine.getMatchInsights(score, features);

        return {
          id: `match-${donor.id}`,
          donor_id: donor.id,
          donor_name: donor.full_name,
          match_score: score,
          insight: insight, // Transparency for Admin/Hospital
          compatibility: "compatible" as const,
          distance_km: features.distanceKm,
          status: 'pending',
          urgency: params.urgency,
          blood_type: donor.blood_type,
          cnic: donor.cnic || "---",
          hospital_name: 'Current Search',
          created_at: new Date().toISOString(),
        };
      }).sort((a, b) => b.match_score - a.match_score);
    },
  });
}

/** Legacy Aliases for UI stability */
export function useFindBloodDonors(bt: string, city: string, urg: string, enabled: boolean): UseQueryResult<Match[]> {
  return useFindDonors({ bloodType: bt, city, urgency: urg }, enabled);
}
export function useFindOrganDonors(ot: string, city: string, urg: string, enabled: boolean): UseQueryResult<Match[]> {
  return useFindDonors({ organType: ot, city, urgency: urg }, enabled);
}

export function useCityDonorStats(): UseQueryResult<CityDonorStats[]> {
  return useQuery<CityDonorStats[]>({
    queryKey: ["city_donor_stats"],
    queryFn: async (): Promise<CityDonorStats[]> => {
      const supabase = createClient();
      const [bloodRes, organRes] = await Promise.all([
        supabase.from("blood_donors").select("city, is_available"),
        supabase.from("organ_donors").select("city, is_available")
      ]);

      const statsMap: Record<string, CityDonorStats> = {};
      
      const processRows = (rows: { city: string, is_available: boolean }[], type: 'blood' | 'organ') => {
        rows.forEach((row) => {
          const city = row.city || 'Unknown';
          if (!statsMap[city]) {
            statsMap[city] = { city, total_donors: 0, available_donors: 0, blood_donors: 0, organ_donors: 0 };
          }
          const s = statsMap[city];
          s.total_donors++;
          if (row.is_available) s.available_donors++;
          if (type === 'blood') s.blood_donors++;
          if (type === 'organ') s.organ_donors++;
        });
      };

      processRows(bloodRes.data as any[] || [], 'blood');
      processRows(organRes.data as any[] || [], 'organ');

      return Object.values(statsMap).sort((a, b) => b.total_donors - a.total_donors);
    },
  });
}

export function useGlobalStats(): UseQueryResult<GlobalStats> {
  return useQuery<GlobalStats>({
    queryKey: ["global_stats"],
    queryFn: async (): Promise<GlobalStats> => {
      const res = await fetch("/api/public/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch live stats");
      }
      return await res.json();
    },
    refetchInterval: 10000, // Augmented Real-Time (polling every 10s)
  });
}

// ---------- Real-time ----------

export function useRealtimeMatchResults(onNewMatch?: (match: Match) => void): Match[] {
  const [realtimeMatches, setRealtimeMatches] = useState<Match[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`matches-realtime-${Math.random().toString(36).slice(2, 9)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_results" },
        (payload: any) => {
          const mapped = mapMatchResult(payload.new as MatchResultRow);
          setRealtimeMatches((prev) => [mapped, ...prev]);
          if (onNewMatch) onNewMatch(mapped);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Only run once on mount

  return realtimeMatches;
}
