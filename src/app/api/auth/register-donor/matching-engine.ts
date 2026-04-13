import { getServiceSupabase } from "@/lib/supabase";

export async function runMatchingAutomation(donorId: string, type: 'blood' | 'organ') {
  const supabase = getServiceSupabase();
  console.log(`Starting matching automation for donor: ${donorId} (${type})`);

  try {
    // 1. Fetch the donor data
    const table = type === 'blood' ? 'blood_donors' : 'organ_donors';
    const { data: donor, error: donorErr } = await supabase
      .from(table)
      .select('*')
      .eq('donor_id', donorId)
      .single();

    if (donorErr || !donor) throw new Error("Donor not found for matching");

    // 2. Search for matching recipients
    let query = supabase.from('recipients').select('*');
    
    if (type === 'blood') {
      query = query.eq('blood_type', donor.blood_type);
    } else {
      // Find recipients needing any of the organs the donor is donating
      const organs = donor.organs_available || [];
      query = query.in('required_organ', organs);
    }

    const { data: recipients, error: recErr } = await supabase.from('recipients').select('*');
    // Filter manually for match (simplified for demo)
    const matches = recipients?.filter((r: any) => {
        if (type === 'blood') return r.blood_type === donor.blood_type;
        return donor.organs_available?.includes(r.required_organ);
    }).slice(0, 3) || []; // Just take top 3 for notification spam prevention

    console.log(`Found ${matches.length} matches for donor ${donor.full_name}`);

    // 3. Create match results and notifications
    for (const match of matches) {
      // Insert Match Result
      await supabase.from('match_results').insert([{
        donor_id: donor.donor_id,
        recipient_id: match.recipient_id,
        match_score: 95, // High initial score
        compatibility: 'High',
        status: 'pending',
        blood_type: donor.blood_type,
        organ_type: type === 'organ' ? match.required_organ : null,
        donor_name: donor.full_name,
        hospital_name: match.hospital_name || 'General Hospital',
        created_at: new Date().toISOString()
      }]);

      // Notify the Admin/Hospital
      // Note: In real app, we would notify the specific hospital's user_id
      // For now, we notify the admin (if we have admin user_id) or just log it
      const { data: adminUsers } = await supabase.auth.admin.listUsers();
      const admin = adminUsers.users.find((u: any) => u.user_metadata.role === 'admin');
      
      if (admin) {
        await supabase.from('notifications').insert([{
          user_id: admin.id,
          title: '🚨 New Match Detected!',
          message: `New donor ${donor.full_name} matches recipient ${match.first_name} ${match.last_name}.`,
          type: 'match',
          is_read: false,
          created_at: new Date().toISOString()
        }]);
      }
    }

    return matches.length;
  } catch (err) {
    console.error("Matching Automation Failed:", err);
    return 0;
  }
}
