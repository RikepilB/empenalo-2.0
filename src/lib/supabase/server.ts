import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { serverEnv } from "@/lib/env";

// Cookie-aware server client. Next 15 `cookies()` is async.
// Use in Server Components, Route Handlers, and Server Actions.
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const env = serverEnv();

  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component (read-only cookies). Session refresh
          // is handled by middleware, so this is safe to ignore.
        }
      },
    },
  });
}
