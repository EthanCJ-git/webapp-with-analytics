# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Phase 0 is done: the app is scaffolded (`create-next-app`, App Router, TypeScript, Tailwind
v4) but still an empty shell — no `components/`, `lib/`, `supabase/`, or `content/` yet, and
no Supabase wiring. `docs/ROADMAP.md` lays out the remaining build order (Phase 1: public
portfolio, Phase 2: analytics write path, Phase 3: auth + dashboard).

When asked to start building, follow the roadmap phase order rather than jumping straight to
the analytics pipeline — Phase 1 (the portfolio itself) is the point of the project and should
work before any tracking code exists.

This project is on Next.js 16, which postdates this assistant's training data — see
`AGENTS.md` for breaking-changes context before writing App Router code that relies on
remembered conventions.

## Commands

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys + salt secret (once Phase 2 adds it)
npm run dev                  # http://localhost:3000
npm run build
npm run lint
```

Database schema changes go through `supabase/migrations/*.sql`, applied via the Supabase SQL
editor or `supabase db push` — there is no ORM.

## Architecture

Read `docs/ARCHITECTURE.md`, `docs/ANALYTICS.md`, and `docs/DATA_MODEL.md` before making
structural changes — the design has specific invariants that are easy to accidentally break:

- **Exactly one API route: `POST /api/track`.** Every other route is either a static Server
  Component (public portfolio) or a dynamic Server Component reading Supabase directly with
  RLS enforcing access (dashboard). Do not add new API routes for things Supabase's client +
  RLS can already do — this "one API route" property is a deliberate, load-bearing constraint,
  not an oversight.
- **Three independent paths, kept separate:** serving content (static, no Supabase involved),
  recording a visit (`<AnalyticsTracker/>` → `/api/track` → `events` table, service-role
  insert), and reading analytics (`/dashboard`, owner-session Supabase reads gated by RLS).
- **Content lives in the repo** (MDX/TS under `content/`), not the database, specifically to
  keep the public site a zero-API static surface. Moving content into Supabase is a noted
  future step, not a default.
- **Authorization is RLS-only.** There is no hand-written authz check anywhere in application
  code. The `events` table has a single `SELECT` policy matching the owner's JWT email and no
  insert/update/delete policies for `anon`/`authenticated` — writes only happen server-side via
  the Supabase **service role key**, which bypasses RLS. Any change to the write path must keep
  the service role key out of client components and out of anything prefixed `NEXT_PUBLIC_`.
- **The visitor hash is the core privacy mechanism:** `SHA-256(SALT_SECRET + ip + ua)` →
  `visitor_hash`. Raw IP is read from `x-forwarded-for` server-side only, used in-memory, and
  never stored or logged. The hash does **not** rotate — it's stable indefinitely, which is
  deliberate: it lets the dashboard recognize a returning visitor across days without ever
  setting a cookie or client-side ID (the alternative that would need a consent banner). The
  tradeoff is that identity tracks the IP+UA pair, not the person: an IP change looks like a
  new visitor, and a shared IP+UA (same household/NAT) collides into one. Full rationale and
  honest limitations: `docs/ANALYTICS.md#why-a-fixed-salt-hash-instead-of-a-cookie`.
- **Sessions are derived at query time**, not stored. A session is a run of events per
  `visitor_hash` with no gap > 30 minutes, computed with a `lag()` window-function query
  (`docs/DATA_MODEL.md#deriving-sessions`). The write path stays a single unconditional
  `INSERT` — don't introduce read-before-write logic to "help" this.
- **Bot filtering happens once, server-side,** before insert, and still returns `204` either
  way so scrapers get no signal that they were filtered.
- **Edge runtime for `/api/track`** — chosen for latency and native `x-vercel-ip-country` geo
  headers. Documented as swappable to Node if a future dependency needs Node APIs.

## Documentation map

- `docs/ARCHITECTURE.md` — system design, request flows, rendering strategy per route group,
  and the rationale behind each major design decision.
- `docs/ANALYTICS.md` — the `/api/track` contract (request/response shape, headers read,
  status codes), the visitor-hash algorithm, bot filtering, and a reference implementation of
  `components/analytics-tracker.tsx` and `app/api/track/route.ts`.
- `docs/DATA_MODEL.md` — the `events` schema, index rationale, RLS policies, and the SQL for
  sessionization and the core dashboard aggregates (page views, uniques, top pages, traffic
  sources).
- `docs/SETUP.md` — Supabase project setup, RLS owner-email policy, environment variables,
  Vercel deploy steps, and a troubleshooting table for common issues (no rows appearing, RLS
  misconfiguration, double-counting in dev under Strict Mode, etc.).
- `docs/ROADMAP.md` — phase-by-phase build order and explicitly out-of-scope "later" ideas
  (rollup tables, custom events, retention jobs, salt rotation).
