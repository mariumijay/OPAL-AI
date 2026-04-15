// ============================================================
// Mock Data — Fallback dataset for OPAL-AI
// Used when Supabase tables are empty
// ============================================================

import type { Donor, Match, Hospital, CityDonorStats, GlobalStats } from '@/lib/types';

// Keep legacy interface types for mock-only objects
interface DonorRequest {
  id: string;
  hospital_id: string;
  hospital_name?: string;
  request_type: 'blood' | 'organ';
  blood_type?: string;
  organ_type?: string;
  urgency: string;
  city: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface RecipientRequest {
  id: string;
  recipient_id: string;
  request_type: 'blood' | 'organ';
  blood_type?: string;
  organ_type?: string;
  urgency: string;
  hospital_name: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  estimated_wait?: string;
}

export const mockHospitals: Hospital[] = [
  {
    id: 'h-001',
    hospital_id: 'h-001',
    hospital_name: 'Aga Khan University Hospital',
    license_number: 'H-PK-AKU-001',
    city: 'Karachi',
    latitude: 24.8918,
    longitude: 67.0742,
    contact_email: 'admin@akuh.org',
    contact_phone: '+92-21-111',
    is_verified: true,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'h-002',
    hospital_id: 'h-002',
    hospital_name: 'Shaukat Khanum Memorial Hospital',
    license_number: 'H-PK-SKM-002',
    city: 'Lahore',
    latitude: 31.4697,
    longitude: 74.4108,
    contact_email: 'admin@skm.org',
    contact_phone: '+92-42-111',
    is_verified: true,
    created_at: '2024-02-20T08:00:00Z',
  },
  {
    id: 'h-pending-001',
    hospital_id: 'h-pending-001',
    hospital_name: 'Fatima Memorial Hospital (Pending)',
    license_number: 'H-PK-FMH-992',
    city: 'Lahore',
    latitude: 31.5204,
    longitude: 74.3587,
    contact_email: 'sarah.admin@fmh.org.pk',
    contact_phone: '+92-321-1234567',
    is_verified: false,
    created_at: new Date().toISOString(),
  },
];

export const mockDonors: Donor[] = [
  {
    id: 'd-a1b2c3',
    user_id: 'u-001',
    full_name: 'Ahmed Khan',
    first_name: 'Ahmed',
    last_name: 'Khan',
    age: 28,
    gender: 'Male',
    contact_number: '+923001234567',
    blood_type: 'O+',
    is_blood_donor: true,
    is_organ_donor: true,
    donating_items: 'Whole Blood, Kidney',
    city: 'Karachi',
    latitude: 24.8707,
    longitude: 67.0311,
    is_available: true,
    cnic: '42101-1234567-1',
    created_at: '2024-06-15T08:00:00Z',
    medical: {
        hiv_status: 'Negative',
        hepatitis_status: 'Negative',
        is_diabetic: false,
        is_smoker: false,
        medical_conditions: 'None',
        medications: 'None',
        height_cm: 180,
        weight_kg: 75,
        donor_status: 'Living',
        next_of_kin_name: 'N/A',
        next_of_kin_contact: 'N/A',
        consent_signed: true
    }
  },
  {
    id: 'd-d4e5f6',
    user_id: 'u-002',
    full_name: 'Fatima Ali',
    first_name: 'Fatima',
    last_name: 'Ali',
    age: 24,
    gender: 'Female',
    contact_number: '+923007654321',
    blood_type: 'A+',
    is_blood_donor: true,
    is_organ_donor: false,
    donating_items: 'Whole Blood',
    city: 'Karachi',
    latitude: 24.8918,
    longitude: 67.0542,
    is_available: true,
    cnic: '42101-9876543-2',
    created_at: '2024-04-20T08:00:00Z',
    medical: {
        hiv_status: 'Negative',
        hepatitis_status: 'Negative',
        is_diabetic: false,
        is_smoker: false,
        medical_conditions: 'None',
        medications: 'None',
        height_cm: 165,
        weight_kg: 60,
        donor_status: 'Living',
        next_of_kin_name: 'N/A',
        next_of_kin_contact: 'N/A',
        consent_signed: true
    }
  },
  {
    id: 'd-pending-001',
    user_id: 'u-003',
    full_name: 'Zainab Qureshi',
    first_name: 'Zainab',
    last_name: 'Qureshi',
    age: 22,
    gender: 'Female',
    contact_number: '+923051122334',
    blood_type: 'B+',
    is_blood_donor: true,
    is_organ_donor: false,
    donating_items: 'Platelets',
    city: 'Rawalpindi',
    latitude: 33.5651,
    longitude: 73.0169,
    is_available: false,
    cnic: '37405-1234567-8',
    created_at: new Date().toISOString(),
    medical: {
        hiv_status: 'Pending Test',
        hepatitis_status: 'Pending Test',
        is_diabetic: false,
        is_smoker: false,
        medical_conditions: 'None',
        medications: 'None',
        height_cm: 160,
        weight_kg: 52,
        donor_status: 'Pending Verification',
        next_of_kin_name: 'Father',
        next_of_kin_contact: '+92-300-0000000',
        consent_signed: true
    }
  }
];

export const mockMatches: Match[] = [
  {
    id: 'm-001',
    donor_id: 'd-a1b2c3',
    donor_name: 'Ahmed Khan',
    hospital_name: 'Aga Khan University Hospital',
    match_score: 97,
    compatibility: 'full',
    distance_km: 3.2,
    status: 'pending',
    urgency: 'Emergency',
    blood_type: 'O+',
    hospital_id: 'h-001',
    cnic: '42101-1234567-1',
    created_at: '2024-12-04T14:30:00Z',
  }
];

export const mockRequests: DonorRequest[] = [
  {
    id: 'r-001',
    hospital_id: 'h-001',
    hospital_name: 'Aga Khan University Hospital',
    request_type: 'blood',
    blood_type: 'O+',
    urgency: 'Emergency',
    city: 'Karachi',
    status: 'matching',
    notes: 'Urgent need for traffic accident victim',
    created_at: '2024-12-04T14:00:00Z',
    updated_at: '2024-12-04T14:30:00Z',
  }
];

export const mockRecipientRequests: RecipientRequest[] = [
  {
    id: 'rr-001',
    recipient_id: 'rec-001',
    request_type: 'blood',
    blood_type: 'O+',
    urgency: 'Emergency',
    hospital_name: 'Aga Khan University Hospital',
    status: 'matched',
    submitted_at: '2024-12-04T14:00:00Z',
    updated_at: '2024-12-04T14:30:00Z',
    estimated_wait: '2-4 hours',
  }
];

export const mockCityStats: CityDonorStats[] = [
  { city: 'Karachi', total_donors: 1247, available_donors: 892, blood_donors: 1050, organ_donors: 197 },
  { city: 'Lahore', total_donors: 983, available_donors: 741, blood_donors: 815, organ_donors: 168 },
];

export const mockGlobalStats: GlobalStats = {
  totalDonors: 4284,
  totalHospitals: 47,
  livesSaved: 2891,
  citiesCovered: 12,
};
