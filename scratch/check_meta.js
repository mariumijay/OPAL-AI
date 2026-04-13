
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qsmwlrywrjuudfjooqsz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXdscnl3cmp1dWRmam9vcXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2MzYyOSwiZXhwIjoyMDkxMDM5NjI5fQ.jNfTgIzcfXOZZQCBYsovQXWdLZtMegsSqD_gXpyOBs4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser(email) {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User Metadata:', JSON.stringify(user.user_metadata, null, 2));
  }
}

checkUser('ranahaseeb9427@gmail.com');
