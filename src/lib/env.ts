/**
 * OPAL-AI Environment Configuration & Validation
 * Ensures the system does not start in a degraded or broken state.
 */

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_BACKEND_URL",
  "GEMINI_API_KEY",
] as const;

export function validateEnv() {
  if (typeof window !== "undefined") return; // Only validate on server startup

  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    const errorMsg = `
============================================================
CRITICAL CONFIGURATION ERROR: MISSING ENVIRONMENT VARIABLES
============================================================
The following variables must be defined for the system to function:
${missing.map((v) => ` - ${v}`).join("\n")}

Please check your .env.local file or platform configuration.
============================================================`;
    
    console.error(errorMsg);
    
    if (process.env.NODE_ENV === "production") {
      throw new Error(`System Startup Failed: Missing ${missing.length} environment variables.`);
    }
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL!,
  isProd: process.env.NODE_ENV === "production",
};
