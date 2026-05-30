# EMPEÑALO 2.0 — Next.js baseline

Next.js 15 (App Router, React 19) re-platform of the EMPEÑALO pawn-shop marketplace. Reuses the existing Supabase project verbatim (Auth + 11 tables + RPCs + RLS). Disposable fallback to the TanStack prototype; Laravel is the eventual target backend.

## Status

Hand-written skeleton — **no dependencies installed yet**. See `docs/MIGRATION-PLAN.md` for the full port plan and remaining work.

## Setup (run yourself — installs are not automated)

```bash
cp .env.example .env.local   # fill in Supabase + (optional) Culqi / Upstash
bun install                  # pulls Next 15, React 19, Supabase SSR, Tailwind v4, Upstash
bun dev                      # http://localhost:8080
```

> Package installs require explicit approval per the project supply-chain rules — that's why this repo ships the manifest but not `node_modules`.

## What's wired

| Path | Purpose |
|---|---|
| `src/lib/env.ts` | Public vs server-only env access |
| `src/lib/supabase/{server,browser,admin}.ts` | SSR cookie client / browser singleton / service-role |
| `src/middleware.ts` | Supabase session refresh + `/app` `/negocio` auth gate |
| `src/lib/{logger,cache,rate-limit}.ts` | sanitizeError + Upstash-backed cache/rate-limit (in-memory local fallback) |
| `src/services/auth.ts` | `'use server'` actions: `getCurrentUser`, `signOut`, `loginWithPassword` |
| `src/app/page.tsx` | Landing |
| `src/app/app/login/page.tsx` | Client login (deterministic, clean-slate session) |
| `src/app/negocio/login/page.tsx` | Business login |

## Stack

Next.js 15 · React 19 · TypeScript strict · Supabase (Auth/Postgres/Storage) · Tailwind v4 + shadcn (to port) · Culqi · Upstash Redis · Vercel.
