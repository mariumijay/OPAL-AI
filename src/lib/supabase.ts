import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let browserClient: any = null;

/**
 * Singleton Browser Client
 * Ensures only one GoTrue instance exists in the browser context.
 */
export function createClient() {
  if (typeof window === "undefined") {
    return createSupabaseClient(supabaseUrl, supabaseKey);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "opal-ai-auth-token",
      },
    });
  }
  return browserClient;
}

/** 
 * Server-side Singleton (with Cookie Access)
 * Used for Route Handlers, Server Actions, and Server Components
 */
export async function createServerSupabase(customCookies?: any) {
  let cookieStore = customCookies;
  
  if (!cookieStore) {
    const { cookies } = require("next/headers");
    cookieStore = await cookies();
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    auth: {
      storageKey: "opal-ai-auth-token",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // This can be ignored if you have middleware refreshing
          // sessions before they load.
        }
      },
    },
  });
}

export const supabase = createClient();

export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

