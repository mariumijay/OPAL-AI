"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
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

interface FastAPIMatch {
  id: string;
  full_name: string;
  blood_type: string;
  distance_km: number;
}

interface FastAPIMatchResponse {
  matches: FastAPIMatch[];
}

export function useFindDonors(
  params: { bloodType?: string; organType?: string; city: string; urgency: string },
  enabled: boolean = true
): UseQueryResult<Match[]> {
  return useQuery<Match[]>({
    queryKey: ["find_donors_fastapi", params],
    enabled: enabled && !!params.urgency,
    queryFn: async (): Promise<Match[]> => {
      // Fetch current session for real hospital ID
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const hospitalId = session?.user?.id;
      if (!hospitalId && enabled) throw new Error("Hospital authentication required");
      
      const endpoint = params.organType ? "/api/matching/organ" : "/api/matching/blood";
      
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital_id: hospitalId,
          required_blood_type: params.bloodType || "O+", 
          required_organ: params.organType || null,
          urgency_level: params.urgency.toLowerCase(),
          max_distance_km: 100.0 // Adjusted for scoring
        })
      });

      if (!response.ok) {
        throw new Error("FastAPI Matcher Error");
      }

      const result = await response.json() as FastAPIMatchResponse;
      
      return result.matches.map((match) => {
        // --- SRS Scoring Formula ---
        // Final = Compatibility(0.50) + Distance(0.30) + Urgency(0.20)
        
        let compatScore = 0;
        if (match.blood_type === params.bloodType) compatScore = 100;
        else if (match.blood_type === 'O-') compatScore = 95;
        else compatScore = 85; // Simple compatible check for demo

        const maxRadius = 100.0;
        const distScore = Math.max(0, 100 - (match.distance_km / maxRadius * 100));

        let urgScore = 50;
        if (params.urgency === 'Emergency') urgScore = 100;
        else if (params.urgency === 'Urgent') urgScore = 75;

        const finalScore = (compatScore * 0.5) + (distScore * 0.3) + (urgScore * 0.2);

        return {
          id: `api-match-${match.id}`,
          donor_id: match.id,
          donor_name: match.full_name,
          match_score: Math.round(finalScore),
          score_breakdown: {
            compatibility: Math.round(compatScore * 0.5),
            distance: Math.round(distScore * 0.3),
            urgency: Math.round(urgScore * 0.2)
          },
          compatibility: "compatible" as const,
          distance_km: parseFloat(match.distance_km.toFixed(1)),
          status: 'pending',
          urgency: params.urgency,
          blood_type: match.blood_type,
          cnic: "—", // Added to fix type error
          hospital_name: 'Current Facility',
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
      const supabase = createClient();
      
      const [
        bloodRes,
        organRes,
        hospitalsRes,
        matchesRes
      ] = await Promise.all([
        supabase.from("blood_donors").select("*", { count: 'exact', head: true }),
        supabase.from("organ_donors").select("*", { count: 'exact', head: true }),
        supabase.from("hospitals").select("*", { count: 'exact', head: true }),
        supabase.from("match_results").select("id")
      ]);

      return {
        totalDonors: (bloodRes.count || 0) + (organRes.count || 0),
        totalHospitals: hospitalsRes.count || 0,
        livesSaved: matchesRes.data?.length || 0, 
        citiesCovered: 12 // Simplified for visual dashboard
      };
    },
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
