const { createClient } = require('@supabase/supabase-js');

// Hardcoded for diagnostic purpose only
const supabaseUrl = "https://qsmwlrywrjuudfjooqsz.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXdscnl3cmp1dWRmam9vcXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2MzYyOSwiZXhwIjoyMDkxMDM5NjI5fQ.jNfTgIzcfXOZZQCBYsovQXWdLZtMegsSqD_gXpyOBs4";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
  console.log("--- OPAL-AI Database Diagnostics ---");
  
  const tables = ['donors', 'blood_donors', 'organ_donors', 'hospitals'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
       console.log(`[!] Table '${table}' Error:`, error.message);
    } else {
       console.log(`[OK] Table '${table}' exists. Count: ${count}`);
    }
  }

  // Check if there is a 'users' or 'profiles' table in public
  const { error: userError } = await supabase.from('users').select('*', { head: true });
  if (userError) {
    console.log("[OK] No 'users' table in public (standard).");
  } else {
    console.log("[!] WARNING: 'users' table exists in public. If donors points here, we need samples in this table.");
  }

  const { error: profileError } = await supabase.from('profiles').select('*', { head: true });
  if (profileError) {
    console.log("[OK] No 'profiles' table in public.");
  } else {
    console.log("[!] WARNING: 'profiles' table exists in public.");
  }
}

diagnose();
