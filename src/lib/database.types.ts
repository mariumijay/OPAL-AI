// ============================================================
// Supabase Database Types for TypeScript
// Tells the Supabase client about our tables and RPC functions
// ============================================================

export type Database = {
  public: {
    Tables: {
      blood_donors: {
        Row: {
          donor_id: number;
          first_name: string;
          last_name: string;
          blood_type: string;
          blood_products_donating: string | null;
          city: string;
          hospital_name: string | null;
          hepatitis_status: string | null;
          medical_conditions: string | null;
          time_of_death: string | null;
          cause_of_death: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      organ_donors: {
        Row: {
          donor_id: number;
          first_name: string;
          last_name: string;
          blood_type: string;
          organs_donating: string | null;
          city: string;
          hospital_name: string | null;
          hepatitis_status: string | null;
          medical_conditions: string | null;
          time_of_death: string | null;
          cause_of_death: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      recipients: {
        Row: {
          recipient_id: number;
          first_name: string;
          last_name: string;
          blood_type: string;
          required_organ: string | null;
          urgency_level: string;
          city: string;
          hospital_name: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      hospitals: {
        Row: {
          hospital_name: string;
          city: string;
          contact_email: string | null;
          contact_phone: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      match_results: {
        Row: {
          id: number;
          donor_id: number;
          recipient_id: number | null;
          match_score: number;
          compatibility: string | null;
          distance_km: number | null;
          status: string | null;
          urgency: string | null;
          blood_type: string | null;
          organ_type: string | null;
          donor_name: string | null;
          hospital_name: string | null;
          created_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      find_blood_donors: {
        Args: {
          req_blood_type: string;
          req_city: string;
          req_urgency: string;
        };
        Returns: {
          donor_id: number;
          first_name: string;
          last_name: string;
          blood_type: string;
          city: string;
          hospital_name: string | null;
          match_score: number;
          compatibility: string;
          distance_km: number;
          status: string | null;
          blood_products_donating: string | null;
        }[];
      };
      find_organ_donors: {
        Args: {
          req_organ: string;
          req_city: string;
          req_urgency: string;
        };
        Returns: {
          donor_id: number;
          first_name: string;
          last_name: string;
          blood_type: string;
          city: string;
          hospital_name: string | null;
          match_score: number;
          compatibility: string;
          distance_km: number;
          status: string | null;
          organs_donating: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
};
