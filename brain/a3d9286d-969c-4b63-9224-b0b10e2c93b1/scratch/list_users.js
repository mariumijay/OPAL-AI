
async function check() {
  const url = "https://qsmwlrywrjuudfjooqsz.supabase.co/auth/v1/admin/users";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXdscnl3cmp1dWRmam9vcXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ2MzYyOSwiZXhwIjoyMDkxMDM5NjI5fQ.jNfTgIzcfXOZZQCBYsovQXWdLZtMegsSqD_gXpyOBs4";
  
  console.log("Fetching users...");
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    
    if (!res.ok) {
        console.log("Error response:", await res.text());
        return;
    }
    
    const data = await res.json();
    console.log("Total users found:", data.users?.length || 0);
    
    data.users.forEach(u => {
      console.log(`- ${u.email} [${u.id}] (Role: ${u.user_metadata?.role || 'none'})`);
    });
    
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}

check();
