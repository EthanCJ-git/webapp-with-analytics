# Portfolio + First-Party Analytics

A personal portfolio site with a **privacy-first, self-built visitor analytics pipeline**.
The public site is pure React (Next.js App Router, Server Components). The only server
endpoint in the whole project is a single tracking route — everything else renders
statically or reads the database directly through Supabase with row-level security.

The analytics layer is deliberately hand-rolled rather than dropped in from a SaaS. It is
cookieless and stores no raw IP addresses, but it does recognize returning visitors across
days via a one-way hash of IP + user agent, so you can tell whether the same person is still
looking around the site. It exists both to answer a real question — *which channels actually
drive traffic to my site during a job search* — and to serve as a compact, reviewable
demonstration of full-stack design.

---

## Highlights

- **Pure-React public site.** Portfolio content ships as static Server Components. No
  client-side data fetching, no API round-trips to view a page.
- **One API route, by design.** `POST /api/track` is the only custom server endpoint.
  Auth and dashboard reads go directly through Supabase.
- **Cookieless, GDPR-minded analytics.** No cookies, no localStorage identifiers, no raw
  IPs at rest. Visitors are identified by a salted hash of IP + user agent, which lets us
  recognize the same visitor across days without ever storing anything client-side. See
  [`docs/ANALYTICS.md`](docs/ANALYTICS.md).
- **Owner-only dashboard.** A protected `/dashboard` route shows page views, unique
  visitors, sessions, referrers, UTM breakdowns, and geography. Access is enforced by
  Supabase Auth + Postgres row-level security.
- **Runs on free tiers.** Vercel Hobby + Supabase Free comfortably cover a personal site.

---

## Tech stack

| Layer          | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js (App Router) + React Server Components      |
| Language       | TypeScript                                          |
| Styling        | Tailwind CSS *(swappable)*                           |
| Hosting        | Vercel                                              |
| Database       | Supabase (Postgres)                                 |
| Auth           | Supabase Auth (owner login for the dashboard)       |
| Analytics      | Custom `POST /api/track` → Postgres `events` table   |
| Content        | Local MDX / TS data modules in the repo             |

> TypeScript and Tailwind are recommended defaults, not hard requirements. Nothing in the
> architecture depends on them.

---

## Project structure

```
.
├── README.md
├── docs/
│   ├── ARCHITECTURE.md      System design, request flows, rendering strategy
│   ├── DATA_MODEL.md        Postgres schema, indexes, RLS policies, session queries
│   ├── ANALYTICS.md         Tracking pipeline: endpoint contract, hashing, privacy
│   ├── SETUP.md             Local dev, Supabase provisioning, env vars, deployment
│   └── ROADMAP.md           Phased build plan
├── app/
│   ├── (site)/              Public portfolio (static Server Components)
│   │   ├── page.tsx         Home
│   │   ├── about/
│   │   ├── projects/
│   │   │   └── [slug]/
│   │   └── contact/
│   ├── dashboard/           Protected analytics dashboard (auth required)
│   ├── login/
│   ├── api/
│   │   └── track/route.ts   The ONE custom endpoint
│   └── layout.tsx           Mounts <AnalyticsTracker />
├── components/
│   └── analytics-tracker.tsx  Client component; fires a beacon on route change
├── content/                 Portfolio content (MDX / TS data)
├── lib/
│   ├── supabase/            Server + browser Supabase clients
│   └── analytics/           Hashing, UA parsing, bot filter, geo helpers
└── supabase/
    └── migrations/          SQL schema + RLS
```

---

## Quick start

Full instructions are in [`docs/SETUP.md`](docs/SETUP.md). The short version:

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in Supabase keys + salt secret

# 3. Apply the database schema
#    (paste supabase/migrations/0001_init.sql into the Supabase SQL editor,
#     or use the Supabase CLI — see docs/SETUP.md)

# 4. Run
npm run dev                  # http://localhost:3000
```

---

## Documentation map

| Document                                   | What it covers                                         |
| ------------------------------------------ | ------------------------------------------------------ |
| [Architecture](docs/ARCHITECTURE.md)       | How the pieces fit, request flows, why the design      |
| [Data model](docs/DATA_MODEL.md)           | Schema, indexes, RLS, sessionization SQL               |
| [Analytics](docs/ANALYTICS.md)             | The tracking pipeline end to end + privacy posture     |
| [Setup](docs/SETUP.md)                     | Getting from clone to deployed                          |
| [Roadmap](docs/ROADMAP.md)                 | Build order and future ideas                            |

---

## A note on privacy

This project is built to collect the minimum data needed to understand traffic, and to
avoid storing anything that identifies an individual. It is designed with GDPR/CCPA
principles in mind (no cookies, no client-side storage, no raw IPs at rest). The one-way
visitor hash is a pseudonymous identifier that persists across days by design — that is a
deliberate tradeoff, not an oversight, and the honest limitations are documented alongside it.
It is not legal advice — if you deploy your own version, confirm your own obligations. The
privacy posture is documented in full in
[`docs/ANALYTICS.md`](docs/ANALYTICS.md#privacy-posture).
