
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message });

  const email = 'ranahaseeb9427@gmail.com';
  const user = users.find(u => u.email === email);

  return NextResponse.json({ 
    search_email: email,
    found: !!user,
    user_id: user?.id,
    user_metadata: user?.user_metadata,
    email_confirmed: user?.email_confirmed_at,
    last_sign_in: user?.last_sign_in_at
  });
}
