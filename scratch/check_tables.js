const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log("Inspecting public tables...");
  
  // Get all table names
  const { data: tables, error } = await supabase.from('donors').select('*').limit(0);
  if (error) console.log("Donors table check error:", error.message);
  else console.log("Donors table exists.");

  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(0);
  if (pErr) console.log("Profiles table check error:", pErr.message);
  else console.log("Profiles table exists.");

  const { data: users, error: uErr } = await supabase.from('users').select('*').limit(0);
  if (uErr) console.log("Users table check error:", uErr.message);
  else console.log("Users table exists.");
}

checkTables();
