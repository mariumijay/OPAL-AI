const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL:", url);
console.log("Key Length:", key ? key.length : 0);

if (!url || !key) {
    console.log("ERROR: Missing URL or Key!");
    process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
    console.log("Testing connection to Supabase...");
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) {
            console.log("CONNECTION FAILED:", error.message);
        } else {
            console.log("CONNECTION SUCCESSFUL! Found users:", data.users.length);
        }
    } catch (e) {
        console.log("CRITICAL FETCH ERROR:", e.message);
    }
}

testConnection();
