const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qsmwlrywrjuudfjooqsz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXdscnl3cmp1dWRmam9vcXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2MzYyOSwiZXhwIjoyMDkxMDM5NjI5fQ.jNfTgIzcfXOZZQCBYsovQXWdLZtMegsSqD_gXpyOBs4';

const supabase = createClient(supabaseUrl, serviceKey);

async function inspectTable() {
  console.log('Inspecting hospitals table...');
  const { data, error } = await supabase.from('hospitals').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns found:', data.length > 0 ? Object.keys(data[0]) : 'Table is empty, no rows to inspect.');
  }
  
  // Try to find any other tables
  console.log('Checking for other related tables...');
  const tables = ['hospital_profiles', 'medical_institutions', 'clinics'];
  for (const t of tables) {
      const { error: tErr } = await supabase.from(t).select('count').limit(1);
      if (!tErr) console.log(`Table [${t}] exists!`);
  }
}

inspectTable();
