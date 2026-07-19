# Setup

From clone to deployed. Assumes Node 18+ and a GitHub account.

## 1. Install

```bash
git clone <your-repo-url> portfolio-analytics
cd portfolio-analytics
npm install
```

## 2. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com) (Free tier is fine).
2. In **Project Settings → API**, note:
   - **Project URL**
   - **anon public** key
   - **service_role** key *(secret — treat like a password)*
3. In **Authentication → Providers**, enable **Email**. For a single-owner site, turn
   **off** public sign-ups after you create your own account (below), so visitors can't
   register.

## 3. Apply the schema

Open **SQL Editor** in Supabase and run the contents of
`supabase/migrations/0001_init.sql` (the schema, indexes, and RLS policy — reproduced in
[DATA_MODEL](DATA_MODEL.md)). **Edit the owner email** in the RLS policy to your address
before running:

```sql
create policy "Owner can read events"
  on public.events
  for select
  to authenticated
  using ( auth.jwt() ->> 'email' = 'you@example.com' );  -- <- change this
```

*(Alternatively, use the Supabase CLI: `supabase db push`.)*

## 4. Create your owner account

Easiest: in **Authentication → Users → Add user**, create a user with your email/password.
That's the only account that will ever exist. Confirm public sign-up is disabled so it
stays that way.

## 5. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

### Environment variables

| Variable                        | Scope        | Purpose                                             |
| ------------------------------- | ------------ | --------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | client + server | Supabase project URL (used by browser auth + dashboard reads) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Anon key. Safe in the browser; RLS protects data.  |
| `SUPABASE_URL`                  | server       | Same URL, for the tracking route.                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | **server only** | Lets `/api/track` insert. Bypasses RLS. **Never** expose. |
| `ANALYTICS_SALT_SECRET`         | **server only** | Long random string seeding the visitor hash.  |

> **The golden rule:** anything prefixed `NEXT_PUBLIC_` is shipped to the browser. The
> service role key and salt secret must **never** carry that prefix and must never be
> imported into a client component.

Generate a strong salt secret:

```bash
openssl rand -base64 48
```

`.env.example` for reference:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANALYTICS_SALT_SECRET=
```

## 6. Run locally

```bash
npm run dev            # http://localhost:3000
```

Visit a few pages, then sign in at `/login` and open `/dashboard`. You should see your own
visits appear.

> **Local geo note:** `x-vercel-ip-country` only exists on Vercel, so `country` will be
> `null` in local dev. That's expected — it populates once deployed.

---

## 7. Deploy to Vercel

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js
   automatically.
3. Add all five environment variables under **Project → Settings → Environment Variables**
   (mark them for Production and Preview). Use the exact same names as `.env.local`.
4. Deploy. Every push to `main` redeploys.

### Post-deploy checklist

- [ ] Visit the live site, click through a few pages.
- [ ] Confirm rows land in the Supabase `events` table with a non-null `country`.
- [ ] Sign in on the deployed `/dashboard` and confirm data renders.
- [ ] Open the live site in an incognito window and confirm a **different** browser can't
      reach `/dashboard` data (RLS check).
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` does not appear anywhere in the client bundle
      (search the deployed source, or just verify it's never imported outside
      `app/api/track/route.ts`).

---

## Common issues

| Symptom                                   | Likely cause / fix                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| No rows appear in `events`                | Service role key missing/wrong in the tracking route env; check `/api/track` logs in Vercel. |
| Dashboard shows nothing when logged in    | Owner email in the RLS policy doesn't match your login email.          |
| Dashboard shows data to *anyone*          | RLS not enabled, or a permissive policy exists. Re-check DATA_MODEL RLS. |
| `country` always null                     | Expected locally; only set on Vercel via geo headers.                  |
| Every load counts twice in dev            | React Strict Mode double-invokes effects in dev only; production fires once. |
