"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithPassword, getCurrentUser, signOut } from "@/services/auth";
import type { CurrentUser } from "@/types";

export default function BusinessLogin() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") ?? "/negocio/dashboard";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setExisting)
      .catch(() => setExisting(null));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData(e.currentTarget);
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");

      await loginWithPassword({ email, password });
      router.refresh();
      const user = await getCurrentUser();

      if (!user?.profile) {
        await signOut();
        throw new Error("Tu cuenta aún se está creando. Espera unos segundos e intenta de nuevo.");
      }
      if (user.profile.role !== "business") {
        await signOut();
        throw new Error(
          "Esta cuenta no pertenece a este portal. Usa el portal de clientes para iniciar sesión.",
        );
      }

      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        {existing?.profile && (
          <div className="mb-4 rounded-lg border border-status-pending/30 bg-status-pending/10 px-4 py-3 text-sm">
            <p className="font-semibold text-status-pending">
              Hay una sesión activa
              {existing.profile.full_name ? ` (${existing.profile.full_name})` : ""}.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ciérrala antes de entrar con otra cuenta.
            </p>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.refresh();
                setExisting(null);
              }}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Portal Casa de empeño
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold">Inicia sesión — Casa de empeño</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede al panel de gestión de tu negocio.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Correo</label>
              <input
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="contacto@tunegocio.pe"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-60"
            >
              {submitting ? "Entrando..." : "Entrar al panel"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Nueva casa de empeño?{" "}
            <Link href="/negocio/register" className="font-medium text-primary hover:underline">
              Crear cuenta de negocio
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/app/login" className="hover:text-foreground">
            Soy cliente →
          </Link>
        </p>
      </div>
    </main>
  );
}
