
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
  if (!user) return NextResponse.json({ error: 'User not found' });

  const { data, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { 
      password: 'Haseebdevil1@',
      user_metadata: { ...user.user_metadata, role: 'admin' },
      email_confirm: true 
    }
  );

  if (updateError) return NextResponse.json({ error: updateError.message });

  return NextResponse.json({ 
    success: true, 
    message: 'Password and Role updated successfully via API',
    metadata: data.user.user_metadata
  });
}
