const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
  const email = 'ranahaseeb9427@gmail.com';
  console.log(`Checking if user exists: ${email}`);
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  
  const user = users.find(u => u.email === email);
  
  if (user) {
    console.log('User Found!');
    console.log('ID:', user.id);
    console.log('Confirmed At:', user.email_confirmed_at);
    console.log('Last Sign In:', user.last_sign_in_at);
  } else {
    console.log('User NOT FOUND in Supabase Auth.');
    console.log('Current users in Auth:', users.map(u => u.email));
  }
}

checkUser();
