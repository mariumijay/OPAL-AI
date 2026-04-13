
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  const email = "ranahaseeb9427@gmail.com";
  console.log(`Checking user: ${email}`);

  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error.message);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.log("RESULT: User not found in Supabase Auth.");
  } else {
    console.log("RESULT: User found!");
    console.log("User ID:", user.id);
    console.log("Metadata:", JSON.stringify(user.user_metadata, null, 2));
    console.log("Email Confirmed:", !!user.email_confirmed_at);
  }
}

checkUser();
