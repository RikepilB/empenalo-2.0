# EMPEÑALO 2.0 — TanStack → Next.js Migration Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or executing-plans. Steps use checkbox (`- [ ]`).

**Goal:** Re-platform the EMPEÑALO TanStack Start prototype onto Next.js 15 (App Router, React 19) deployed to Vercel, reusing the existing Supabase backend verbatim (Auth + 11 tables + RPCs + RLS). Disposable fallback; Laravel is the eventual backend target.

**Architecture:** TanStack `createServerFn(...).handler()` → Next `'use server'` actions. Route `beforeLoad` guards → `middleware.ts` (session refresh + auth gate) + route-group server layouts (role enforcement). `VITE_*` env → `NEXT_PUBLIC_*`. Same Supabase schema, no migration.

**Tech Stack:** Next 15 · React 19 · TS strict · `@supabase/ssr` · Tailwind v4 + shadcn · Culqi · Upstash Redis · Vercel.

---

## ⚠️ Prerequisite — install approval (supply-chain rule)

Nothing is installed. Before `bun install`, the user approves these by name (all >7 days old): `next@15.1.0`, `react@19.0.0`, `react-dom@19.0.0`, `@supabase/ssr@0.5.2`, `@supabase/supabase-js@2.45.4`, `zod@3.23.8`, `@upstash/redis@1.34.3`, `@upstash/ratelimit@2.0.4`, `lucide-react@0.460.0`, `tailwindcss@4.0.0` + the devDeps in `package.json`. After install: scan for secrets, confirm only expected files changed.

---

## Done (skeleton committed)

- Project config: `package.json` (pinned), `tsconfig.json` (strict + `noUncheckedIndexedAccess`), `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`.
- Infra: `src/lib/env.ts`, `src/lib/supabase/{server,browser,admin}.ts`, `src/middleware.ts`, `src/lib/{logger,cache,rate-limit}.ts`.
- Auth Server Actions: `src/services/auth.ts` (`getCurrentUser`, `signOut`, `loginWithPassword` — Zod + rate-limit + sanitizeError).
- Routes: landing `/`, `/app/login`, `/negocio/login` (deterministic login + clean-slate session, ported from the demo-freeze fix).
- Design tokens: subset in `src/app/globals.css` (Tailwind v4 `@theme`).

---

## Env var remap

| TanStack (`.env.local` / `.dev.vars`) | Next.js |
|---|---|
| `VITE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | same (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | same (server-only) |
| `CULQI_SECRET_KEY` | same |
| `VITE_CULQI_PUBLIC_KEY` | `NEXT_PUBLIC_CULQI_PUBLIC_KEY` |
| — | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (new) |

---

## Service-port pattern (apply to every service)

TanStack:
```ts
export const fn = createServerFn({ method: "POST" })
  .inputValidator(schema)
  .handler(async ({ data }) => { /* getSupabaseServer() ... */ });
```
Next (`'use server'` module):
```ts
export async function fn(input: Input): Promise<Out> {
  const data = schema.parse(input);
  const supabase = await getSupabaseServer(); // note: await — cookies() is async in 15
  /* same body; throw sanitizeError(...) on DB error */
}
```
Key diffs: `getSupabaseServer()` is `async`; inputs are plain args (validate with `schema.parse`); call from client components directly (no `{ data }` wrapper).

---

## Task 1: Port domain services

**Files:** `src/services/{solicitudes,propuestas,operations,business,billing}.ts`

- [ ] Port `business.ts` first (`getBusinessContext`, `getBusinessProfile`, `updateBusiness` — incl. the demo-freeze Cuenta additions). Then `solicitudes.ts` (list/create/get with nested selects — keep N+1-free `*, solicitud_photos(*), propuestas(count)`), `propuestas.ts` (create quota-gated, accept via `accept_propuesta` RPC, reject), `operations.ts`, `billing.ts` (Culqi live/demo).
- [ ] Each input `schema.parse`'d; each write `rateLimit`'d (solicitud 10/h, propuesta 30/h, accept 10/h); errors via `sanitizeError`.
- [ ] Verify: `bun run typecheck`. Commit per service.

## Task 2: Route groups + role-enforcing layouts

**Files:** `src/app/app/layout.tsx`, `src/app/negocio/layout.tsx`

- [ ] Server-component layout calls `getCurrentUser()`; redirect (`next/navigation` `redirect`) to the portal login if role mismatches (`/app` → role must be `client`, else `/negocio/dashboard`; `/negocio` → `business`, else `/app/dashboard`). Middleware already gates unauthenticated.
- [ ] Add an `error.tsx` (Spanish, "Iniciar sesión" recovery) + `loading.tsx` (spinner) at each group root so panels never go blank — ports the demo-freeze black-page fix.

## Task 3: Port remaining routes

**Files:** `src/app/app/*`, `src/app/negocio/*`

- [ ] Client portal: `dashboard`, `publish`, `mis-articulos`, `proposals`, `code`, `cuenta`, `register`, `forgot-password`.
- [ ] Business portal: `dashboard` (apply the demo-freeze "Propuestas enviadas" real-count fix), `solicitudes`, `solicitud`, `propuesta`, `propuestas`, `perfil` (Cuenta redesign), `plan`, `notifications`, `register`, `forgot-password`.
- [ ] Data fetching: Server Components call services directly (no React Query needed for first paint); use client components only for interactivity. Where client-side caching helps, add `@tanstack/react-query` later.

## Task 4: Culqi webhook → Route Handler

**Files:** `src/app/api/culqi-webhook/route.ts`

- [ ] `export async function POST(req: Request)` — read raw body, verify HMAC-SHA256 signature, dispatch on event, use `getSupabaseAdmin()`. Mirror the TanStack `api.culqi-webhook.ts`.

## Task 5: Design system + shadcn primitives

- [ ] Port full token set from the TanStack `styles.css` into `globals.css` `@theme`. Re-add shadcn primitives (`bunx shadcn@latest add ...` — approval-gated) or copy `src/ui/primitives/*` and adjust imports.
- [ ] Port shared shells: `PhoneFrame` (client mobile), `BusinessLayout` (sidebar nav incl. "Cuenta").

## Task 6: Vercel deploy

- [ ] `vercel` project; set env vars (Supabase + `SUPABASE_SERVICE_ROLE_KEY` + Culqi + Upstash). `NEXT_PUBLIC_*` only for non-secrets.
- [ ] Verify build, auth round-trip, one publish→propuesta→accept flow on the deployed URL.

---

## Parity checklist (carry the demo-freeze fixes forward)

- [ ] Business dashboard "Propuestas enviadas" = real `listMyPropuestas` count, not subscription quota.
- [ ] Login portals labeled "Portal Cliente" / "Portal Casa de empeño". ✅ (done in skeleton)
- [ ] Deterministic login + clean-slate stale session. ✅ (done in skeleton)
- [ ] No black page: group `error.tsx` (Spanish) + `loading.tsx`.
- [ ] Negocio "Cuenta" = business details + RUC + password change (not billing junk).
