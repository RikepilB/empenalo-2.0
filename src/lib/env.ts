// Centralized env access. Server secrets are read lazily so they never leak
// into the client bundle. NEXT_PUBLIC_* are safe to read anywhere.

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  culqiPublicKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? "",
};

export function serverEnv() {
  return {
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabasePublishableKey:
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    culqiSecretKey: process.env.CULQI_SECRET_KEY ?? "",
    upstashUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
    upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  };
}
