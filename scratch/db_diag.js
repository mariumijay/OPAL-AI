const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
  console.log("Checking blood_donors table constraints...");
  
  // Try to find out what user_id points to via a raw query if possible, 
  // or just check if we can insert with a random UUID to see the error message detail.
  const testId = '00000000-0000-0000-0000-000000000000';
  const { error } = await supabase.from('blood_donors').insert([{
    user_id: testId,
    full_name: 'Audit Test',
    blood_type: 'O+',
    city: 'Test'
  }]);

  console.log("Error detail:", error?.details);
  console.log("Error message:", error?.message);
}

inspectSchema();
