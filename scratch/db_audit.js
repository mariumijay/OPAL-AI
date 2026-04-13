const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qsmwlrywrjuudfjooqsz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXdscnl3cmp1dWRmam9vcXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2MzYyOSwiZXhwIjoyMDkxMDM5NjI5fQ.jNfTgIzcfXOZZQCBYsovQXWdLZtMegsSqD_gXpyOBs4';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkFinalSecurity() {
  console.log('--- Final FYP Security Audit ---');
  
  const tables = ['hospitals', 'blood_donors', 'organ_donors', 'recipients', 'match_results', 'notifications'];
  
  for (const t of tables) {
    // Check if RLS is enabled using a trick:
    // We'll try to query without the service key (using the anon key)
    // and see if we get anything. 
    // Actually, I can't easily switch keys here.
    // I will use an SQL query to check pg_tables directly.
    const { data, error } = await supabase.rpc('check_rls_status', { table_name: t });
    
    if (error) {
       // Fallback: Use direct select and guess by error
       const { error: selectErr } = await supabase.from(t).select('count').limit(1);
       if (!selectErr) {
           console.log(`✅ Table [${t}] exists.`);
       } else {
           console.log(`❌ Table [${t}] error: ${selectErr.message}`);
       }
    } else {
        console.log(`Table [${t}] RLS Status:`, data);
    }
  }
}

checkFinalSecurity();
