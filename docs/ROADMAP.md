# Roadmap

A build order that gets a usable, deployed site early and layers the analytics on top.
Each phase is shippable on its own.

## Phase 0 — Skeleton (½ day)

- [ ] `create-next-app` (App Router, TypeScript, Tailwind).
- [ ] Root layout, base styling, nav/footer.
- [ ] Deploy the empty shell to Vercel so the pipeline works end to end from day one.

## Phase 1 — The public portfolio (1–2 days)

The part that actually does the job of getting you hired. Ship this before analytics.

- [ ] Home page: who you are, headline, primary call to action.
- [ ] About page: background, 5 YOE story, skills.
- [ ] Projects index + `projects/[slug]` detail pages, sourced from MDX/TS in `content/`.
- [ ] Contact section (email link and/or a simple form).
- [ ] Résumé link/download.
- [ ] Polish: responsive layout, metadata/OG tags, favicon, fast Lighthouse scores.

At the end of Phase 1 you have a portfolio you can start sending out.

## Phase 2 — Analytics write path (1 day)

- [ ] Supabase project + `events` schema + RLS ([DATA_MODEL](DATA_MODEL.md)).
- [ ] `ANALYTICS_SALT_SECRET` + service role key wired into Vercel env.
- [ ] `POST /api/track` edge route: hashing, geo, UA parse, bot filter
      ([ANALYTICS](ANALYTICS.md)).
- [ ] `<AnalyticsTracker />` mounted in the root layout.
- [ ] Verify rows appear in Supabase from the live site.

After Phase 2 you're collecting data even though the dashboard doesn't exist yet — so the
data starts accruing while you build the UI.

## Phase 3 — Auth + dashboard (1–2 days)

- [ ] Supabase Auth wired up with `@supabase/ssr`; `/login` page.
- [ ] Owner account created; public sign-up disabled.
- [ ] `/dashboard` protected Server Component.
- [ ] Panels: page views, unique visitors, sessions, top pages, traffic sources
      (referrer/UTM), country breakdown, device mix. Queries in
      [DATA_MODEL](DATA_MODEL.md#deriving-sessions).
- [ ] Date-range selector (7 / 30 / 90 days).

## Phase 4 — Polish for portfolio value (ongoing)

- [ ] Short write-up on the site itself: "how I built privacy-first analytics," linking the
      repo. Turns the infrastructure into a talking point.
- [ ] A brief privacy note page describing what you measure.
- [ ] Clean the README and docs (this set) — reviewers read them.

---

## Later / optional

Nice-to-haves that don't block launch.

- **`daily_stats` rollup** — materialized view or scheduled function for instant dashboard
  loads once `events` grows.
- **Custom events** — add an `event_type` column to track résumé downloads and contact-form
  submissions, not just page views.
- **Data retention job** — scheduled delete of events older than N months.
- **Stronger salt rotation** — random per-day salt stored and expired, instead of derived
  from a secret ([ANALYTICS](ANALYTICS.md#why-a-daily-rotating-hash)).
- **Content out of the repo** — a small CMS or Supabase-backed content table if you want to
  edit projects without deploying. (Note: this adds data-fetching beyond the current
  one-API-route design — a conscious step, not a default.)
- **Live "who's viewing now" panel** — Supabase Realtime on the `events` table.
- **Compare-to-previous-period** deltas on each dashboard metric.

---

## Definition of done for v1

A deployed portfolio you're comfortable sending to employers, plus a working owner-only
dashboard showing real traffic to it — with the whole analytics layer documented well
enough to point to in an interview.
