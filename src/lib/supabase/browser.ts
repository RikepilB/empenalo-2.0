"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

let client: SupabaseClient | undefined;

// Cached browser singleton. Uses the publishable (public) key only.
export function getSupabaseBrowser(): SupabaseClient {
  if (client) return client;
  client = createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey);
  return client;
}
