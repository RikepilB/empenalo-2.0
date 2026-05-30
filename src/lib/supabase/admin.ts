import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

let admin: SupabaseClient | undefined;

// Service-role client — bypasses RLS. SERVER ONLY. Never import in client code.
// Use for signed URLs, webhooks, and admin auth operations.
export function getSupabaseAdmin(): SupabaseClient {
  if (admin) return admin;
  const env = serverEnv();
  if (!env.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada.");
  }
  admin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return admin;
}
