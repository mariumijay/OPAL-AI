const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qsmwlrywrjuudfjooqsz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXdscnl3cmp1dWRmam9vcXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2MzYyOSwiZXhwIjoyMDkxMDM5NjI5fQ.jNfTgIzcfXOZZQCBYsovQXWdLZtMegsSqD_gXpyOBs4';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkSchema() {
  console.log('Checking hospitals table columns...');
  const testCols = [
    'hospital_name', 
    'license_number', 
    'admin_name', 
    'representative_name', 
    'contact_person',
    'admin_designation',
    'designation'
  ];
  
  for (const col of testCols) {
    const { error } = await supabase.from('hospitals').select(col).limit(1);
    if (error) {
      console.log(`❌ Column [${col}] is NOT in the database.`);
    } else {
      console.log(`✅ Column [${col}] is present.`);
    }
  }

  // Also check what IS there by grabbing a row if possible
  const { data } = await supabase.from('hospitals').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('Actual columns found in a row:', Object.keys(data[0]));
  }
}

checkSchema();
