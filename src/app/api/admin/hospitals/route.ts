import { createServerSupabase, getServiceSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createServerSupabase(cookieStore);
  const adminClient = getServiceSupabase();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if the user is an admin
    const isAdmin = user?.user_metadata?.role === "admin" || user?.email === "ranahaseeb9427@gmail.com";
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized access. Admins only." }, { status: 403 });
    }

    // Bypass RLS using admin client
    const { data, error } = await adminClient
      .from("hospitals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);

  } catch (error: any) {
    console.error("Admin Hospitals API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
