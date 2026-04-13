import { getServiceSupabase } from "@/lib/supabase";

interface DonorInfo {
  donor_id: string | number;
  full_name: string;
  blood_type: string;
  latitude: number | null;
  longitude: number | null;
  organs_available?: string[];
}

interface RecipientInfo {
  recipient_id: number;
  first_name: string;
  last_name: string;
  blood_type: string;
  required_organ: string;
  urgency_level: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  hospital_name: string;
}

/**
 * Basic Medical Blood Type Compatibility Check
 */
function isBloodCompatible(donorBT: string, recipientBT: string): number {
  if (donorBT === recipientBT) return 100; // Perfect
  if (donorBT === 'O-') return 95; // Universal donor
  
  const compatibleMap: Record<string, string[]> = {
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'A+': ['A+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB+', 'AB-'],
    'AB+': ['AB+'],
  };

  return (compatibleMap[donorBT] || []).includes(recipientBT) ? 85 : 0;
}

/**
 * Haversine formula to calculate distance in KM
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * SRS Matching Formula Implementation
 */
export async function runMatchingAutomation(donorId: string, type: 'blood' | 'organ') {
  const supabase = getServiceSupabase();
  const maxRadiusKm = 100.0;

  try {
    const table = type === 'blood' ? 'blood_donors' : 'organ_donors';
    const { data: donor, error: donorErr } = await supabase
      .from(table)
      .select('*')
      .eq('donor_id', donorId)
      .single();

    if (donorErr || !donor) return 0;

    const donorInfo = donor as DonorInfo;

    // Fetch all recipients once
    const { data: recipients, error: recErr } = await supabase.from('recipients').select('*');
    if (recErr || !recipients) return 0;

    // Fetch Admin once for notifications
    const { data: adminUsers } = await supabase.auth.admin.listUsers();
    const admin = adminUsers.users.find(u => u.user_metadata?.role === 'admin');

    let matchCount = 0;

    for (const rec of (recipients as RecipientInfo[])) {
      // 1. Compatibility Points (0.50 weight)
      let compatPoints = 0;
      
      if (type === 'blood') {
        compatPoints = isBloodCompatible(donorInfo.blood_type, rec.blood_type);
      } else {
        // Organ matching requires both blood compatibility AND organ matching
        const organMatches = donorInfo.organs_available?.includes(rec.required_organ);
        if (organMatches) {
            const bloodCompat = isBloodCompatible(donorInfo.blood_type, rec.blood_type);
            compatPoints = bloodCompat > 0 ? bloodCompat : 0;
        }
      }

      if (compatPoints === 0) continue; 

      // 2. Distance Score (0.30 weight)
      let distScore = 0;
      let distanceKm = 0;
      if (donorInfo.latitude && donorInfo.longitude && rec.latitude && rec.longitude) {
        distanceKm = calculateDistance(donorInfo.latitude, donorInfo.longitude, rec.latitude, rec.longitude);
        distScore = Math.max(0, 100 - (distanceKm / maxRadiusKm * 100));
      } else {
        distScore = 50; // Neutral if no GPS
      }

      // 3. Urgency Points (0.20 weight)
      let urgPoints = 50;
      const urgency = rec.urgency_level?.toLowerCase();
      if (urgency === 'emergency') urgPoints = 100;
      else if (urgency === 'urgent') urgPoints = 75;

      // --- FINAL SRS FORMULA ---
      const finalScore = Math.round((compatPoints * 0.5) + (distScore * 0.3) + (urgPoints * 0.2));

      if (finalScore > 60) { // Threshold for a "Good Match"
        // Insert Match Result
        await supabase.from('match_results').insert([{
          donor_id: donorInfo.donor_id,
          donor_type: type, // 'blood' or 'organ'
          recipient_id: rec.recipient_id,
          match_score: finalScore,
          compatibility: compatPoints >= 95 ? 'High' : 'Medium',
          distance_km: parseFloat(distanceKm.toFixed(1)),
          status: 'pending',
          blood_type: rec.blood_type,
          organ_type: type === 'organ' ? rec.required_organ : null,
          donor_name: donorInfo.full_name,
          hospital_name: rec.hospital_name,
          created_at: new Date().toISOString()
        }]);

        // Send notification to Admin
        if (admin) {
          await supabase.from('notifications').insert([{
            user_id: admin.id,
            title: '🚨 High-Score Match',
            message: `Donor ${donorInfo.full_name} (${finalScore} points) matches Recipient in ${rec.city}.`,
            type: 'match',
            is_read: false,
            created_at: new Date().toISOString()
          }]);
        }
        matchCount++;
      }
    }

    return matchCount;
  } catch (err) {
    return 0;
  }
}
