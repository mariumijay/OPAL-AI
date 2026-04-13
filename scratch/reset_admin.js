
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qsmwlrywrjuudfjooqsz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXdscnl3cmp1dWRmam9vcXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2MzYyOSwiZXhwIjoyMDkxMDM5NjI5fQ.jNfTgIzcfXOZZQCBYsovQXWdLZtMegsSqD_gXpyOBs4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword(email, newPassword) {
  console.log(`Searching for user: ${email}...`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const user = users.find(u => u.email === email);
  if (!user) {
    console.error('User not found');
    return;
  }

  console.log(`Found user ${user.id}. Resetting password and ensuring role...`);
  
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { 
      password: newPassword,
      user_metadata: { ...user.user_metadata, role: 'admin' },
      email_confirm: true // Ensure email is confirmed too
    }
  );

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Successfully updated password and metadata.');
    console.log('Metadata:', JSON.stringify(data.user.user_metadata, null, 2));
  }
}

resetPassword('ranahaseeb9427@gmail.com', 'Haseebdevil1@');
