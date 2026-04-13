import type {
  DonorRow,
  MedicalProfileRow,
  RecipientRow,
  HospitalRow,
  MatchResultRow,
  Donor,
  Match,
  Recipient,
  Hospital,
  CompatibilityLevel,
  BloodDonorRow,
  OrganDonorRow,
} from './types';

export function safeField(value: string | null | undefined): string {
  if (!value || value === 'N/A' || value === 'null' || value === 'undefined' || value.trim() === '') {
    return '—';
  }
  return value;
}

function parseCompatibility(raw: string | null): CompatibilityLevel {
  if (!raw) return 'compatible';
  const lower = raw.toLowerCase();
  if (lower === 'full' || lower === 'perfect' || lower === '100') return 'full';
  if (lower === 'incompatible' || lower === 'none') return 'incompatible';
  return 'compatible';
}

function calculateAge(birthDate: string | null): number {
  if (!birthDate) return 0;
  try {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return 0;
  }
}

/** Unified Donor Mapper (Legacy) */
export function mapDonor(row: DonorRow, medical?: MedicalProfileRow): Donor {
  const bloodItems: string = row.donating_blood_items || '';
  const organItems: string = row.donating_organs || '';
  const combinedItems: string = [bloodItems, organItems].filter(Boolean).join(', ');

  return {
    id: String(row.id),
    user_id: row.user_id,
    full_name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    first_name: row.first_name || '',
    last_name: row.last_name || '',
    age: calculateAge(row.birth_date),
    gender: row.gender || '—',
    contact_number: safeField(row.contact_number),
    blood_type: row.blood_type || '—',
    donating_items: combinedItems || '—',
    cnic: row.cnic || '—',
    city: row.city || '—',
    latitude: row.latitude || null,
    longitude: row.longitude || null,
    is_available: row.status?.toLowerCase() !== 'inactive',
    is_blood_donor: !!row.is_blood_donor,
    is_organ_donor: !!row.is_organ_donor,
    
    medical: medical ? {
      hiv_status: safeField(medical.hiv_status),
      hepatitis_status: safeField(medical.hepatitis_status),
      is_diabetic: !!medical.is_diabetic,
      is_smoker: !!medical.is_smoker,
      medical_conditions: safeField(medical.medical_conditions),
      medications: safeField(medical.medications),
      height_cm: medical.height_cm,
      weight_kg: medical.weight_kg,
      donor_status: safeField(medical.donor_status),
      next_of_kin_name: safeField(medical.next_of_kin_name),
      next_of_kin_contact: safeField(medical.next_of_kin_contact),
      consent_signed: !!medical.consent_signed,
    } : undefined,

    created_at: row.created_at || new Date().toISOString(),
  };
}

/** Blood Donor Mapper (New Table) */
export function mapBloodDonor(row: BloodDonorRow): Donor {
  return {
    id: String(row.id),
    user_id: row.user_id || null,
    full_name: row.full_name,
    first_name: row.full_name.split(' ')[0] || '',
    last_name: row.full_name.split(' ').slice(1).join(' ') || '',
    age: row.age,
    gender: '—',
    contact_number: safeField(row.phone),
    blood_type: row.blood_type,
    donating_items: 'Whole Blood',
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    is_available: !!row.is_available,
    cnic: row.cnic || '—',
    is_blood_donor: true,
    is_organ_donor: false,
    medical: {
      hiv_status: '—',
      hepatitis_status: row.hepatitis_status,
      is_diabetic: false,
      is_smoker: false,
      medical_conditions: safeField(row.medical_conditions),
      medications: '—',
      height_cm: null,
      weight_kg: null,
      donor_status: 'Living',
      next_of_kin_name: '—',
      next_of_kin_contact: '—',
      consent_signed: true,
    },
    suspension_reason: row.suspension_reason || undefined,
    created_at: row.created_at || new Date().toISOString(),
  };
}

/** Organ Donor Mapper (New Table) */
export function mapOrganDonor(row: OrganDonorRow): Donor {
  const organs = Array.isArray(row.organs_available) 
    ? row.organs_available.join(', ') 
    : row.organs_available;

  return {
    id: String(row.id),
    user_id: row.user_id || null,
    full_name: row.full_name,
    first_name: row.full_name.split(' ')[0] || '',
    last_name: row.full_name.split(' ').slice(1).join(' ') || '',
    age: row.age,
    gender: '—',
    contact_number: safeField(row.phone),
    blood_type: row.blood_type,
    donating_items: organs,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    is_available: !!row.is_available,
    cnic: row.cnic || '—',
    is_blood_donor: false,
    is_organ_donor: true,
    medical: {
      hiv_status: row.hiv_status,
      hepatitis_status: row.hepatitis_status,
      is_diabetic: !!row.diabetes,
      is_smoker: !!row.smoker,
      medical_conditions: '—',
      medications: '—',
      height_cm: row.height_cm,
      weight_kg: row.weight_kg,
      donor_status: row.is_living_donor ? 'Living' : 'Posthumous',
      next_of_kin_name: row.next_of_kin_name,
      next_of_kin_contact: row.next_of_kin_contact,
      consent_signed: !!row.consent_given,
    },
    suspension_reason: row.suspension_reason || undefined,
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function mapMatchResult(row: MatchResultRow): Match {
  return {
    id: String(row.id),
    donor_id: String(row.donor_id),
    donor_name: safeField(row.donor_name),
    match_score: row.match_score ?? 0,
    compatibility: parseCompatibility(row.compatibility),
    distance_km: row.distance_km ?? 0,
    status: row.status || 'pending',
    urgency: row.urgency || '',
    blood_type: row.blood_type || '—',
    organ_type: row.organ_type || undefined,
    hospital_name: safeField(row.hospital_name),
    cnic: safeField(row.cnic),
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function mapRecipient(row: RecipientRow): Recipient {
  return {
    id: String(row.recipient_id),
    full_name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    blood_type: row.blood_type || '—',
    required_organ: safeField(row.required_organ),
    urgency_level: row.urgency_level || 'Routine',
    city: row.city || '—',
    hospital_name: safeField(row.hospital_name),
    status: row.status || 'submitted',
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id || '', // Explicit ID for markers/lists
    hospital_id: row.id || '',
    hospital_name: row.hospital_name || 'Legacy Facility',
    license_number: row.license_number || 'PENDING',
    city: row.city || 'Unknown',
    contact_email: row.contact_email || '',
    contact_phone: row.contact_phone || '',
    latitude: row.latitude,
    longitude: row.longitude,
    is_verified: !!row.is_verified,
    created_at: row.created_at || new Date().toISOString(),
    admin_name: row.admin_name,
    hospital_type: row.hospital_type
  };
}
