import Link from "next/link";

export default function Landing() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-widest text-foreground">
          EMPEÑALO
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Empeña tu artículo y recibe múltiples ofertas reales de casas de empeño verificadas en
          Lima.
        </p>
        <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
          2.0 · Next.js
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/app/login" className="btn-primary">
          Soy cliente
        </Link>
        <Link
          href="/negocio/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-2"
        >
          Soy casa de empeño
        </Link>
      </div>
    </main>
  );
}
