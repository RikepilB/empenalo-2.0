"use server";

import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { log } from "@/lib/logger";
import type { CurrentUser, Profile } from "@/types";

// ---------------------------------------------------------------------------
// TanStack `createServerFn(...).handler()` maps 1:1 to an exported async
// function in a "use server" module. Zod still validates every input.
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, document_number, created_at")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) return null;

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      email_confirmed_at: user.email_confirmed_at ?? null,
    },
    profile,
  };
}

export async function signOut(): Promise<{ ok: true }> {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  return { ok: true };
}

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function loginWithPassword(input: {
  email: string;
  password: string;
}): Promise<{ userId: string }> {
  const data = loginSchema.parse(input);

  const rl = await rateLimit(`login:${hashEmail(data.email)}`, 10, 600);
  if (!rl.allowed) throw new Error("Demasiados intentos. Espera unos minutos e intenta de nuevo.");

  const supabase = await getSupabaseServer();
  const { data: result, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    log.warn("login_failed", {
      email_hash: hashEmail(data.email),
      code: error.code,
      status: error.status,
    });
    if (error.code === "email_not_confirmed") {
      throw new Error("Tu correo aún no está verificado. Revisa tu bandeja de entrada.");
    }
    if (error.status === 429) {
      throw new Error("Demasiados intentos. Espera un minuto e intenta de nuevo.");
    }
    throw new Error("Correo o contraseña incorrectos.");
  }
  if (!result.user) throw new Error("No pudimos iniciar tu sesión. Intenta de nuevo.");
  return { userId: result.user.id };
}

function hashEmail(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h.toString(16);
}
