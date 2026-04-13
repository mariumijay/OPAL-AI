const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

async function resetPassword() {
  const email = "ranahaseeb9427@gmail.com";
  const newPassword = "Hospital@123";

  console.log(`Searching for user: ${email}...`);

  // First, find the user ID by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
      console.error("Error listing users:", listError.message);
      return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.log(`User ${email} not found in Supabase Auth.`);
    return;
  }

  console.log(`User found (ID: ${user.id}). Updating password...`);

  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (error) {
    console.error("Error updating password:", error.message);
  } else {
    console.log(`Success! Password for ${email} has been reset to: ${newPassword}`);
  }
}

resetPassword();
