// ============================================================
// Constants — Blood Types, Organs, Cities, Compatibility
// Urgency values match Supabase schema (capitalized)
// ============================================================

import type { UrgencyLevel } from './types';

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const ORGAN_TYPES = [
  { value: 'Kidney', label: 'Kidney' },
  { value: 'Liver', label: 'Liver' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Lung', label: 'Lung' },
  { value: 'Pancreas', label: 'Pancreas' },
  { value: 'Cornea', label: 'Cornea' },
];

export const URGENCY_LEVELS: { value: UrgencyLevel; label: string; color: string; emoji: string }[] = [
  { value: 'Emergency', label: 'Emergency', color: '#e11d48', emoji: '🔴' },
  { value: 'Urgent', label: 'Urgent', color: '#eab308', emoji: '🟡' },
  { value: 'Routine', label: 'Routine', color: '#22c55e', emoji: '🟢' },
];

export const CITIES: { name: string; lat: number; lng: number }[] = [
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
  { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
  { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169 },
  { name: 'Faisalabad', lat: 31.4504, lng: 73.135 },
  { name: 'Multan', lat: 30.1575, lng: 71.5249 },
  { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
  { name: 'Quetta', lat: 30.1798, lng: 66.975 },
  { name: 'Hyderabad', lat: 25.396, lng: 68.3578 },
  { name: 'Sialkot', lat: 32.4945, lng: 74.5229 },
];

// FR-21: Blood compatibility matrix
export const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export function getCompatibilityLevel(recipientType: string, donorType: string): 'full' | 'compatible' | 'incompatible' {
  if (recipientType === donorType) return 'full';
  if (BLOOD_COMPATIBILITY[recipientType]?.includes(donorType)) return 'compatible';
  return 'incompatible';
}

export function getCompatibilityColor(level: 'full' | 'compatible' | 'incompatible'): string {
  switch (level) {
    case 'full': return '#16a34a';
    case 'compatible': return '#eab308';
    case 'incompatible': return '#dc2626';
  }
}

export const STATUS_FLOW = ['pending', 'approved', 'completed'] as const;

export const RECIPIENT_STATUS_FLOW = ['submitted', 'searching', 'matched', 'approved', 'in_transit', 'completed'] as const;
