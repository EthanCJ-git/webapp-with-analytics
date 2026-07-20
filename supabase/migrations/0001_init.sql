-- Analytics events. One row per page view.
create table public.events (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  visitor_hash    text        not null,
  path            text        not null,
  referrer        text,
  referrer_domain text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  country         text,
  browser         text,
  os              text,
  device_type     text,
  screen_width    int
);

-- Time-range scans (almost every dashboard query filters on a window).
create index events_created_at_idx on public.events (created_at desc);

-- "Top pages" grouping.
create index events_path_idx on public.events (path);

-- Sessionization + unique-visitor counts per visitor.
create index events_visitor_idx on public.events (visitor_hash, created_at);

alter table public.events enable row level security;

-- Reads: only the authenticated owner, matched by email claim.
-- No insert/update/delete policies exist for anon or authenticated roles.
-- Writes happen exclusively from the server using the service role key,
-- which bypasses RLS entirely.
create policy "Owner can read events"
  on public.events
  for select
  to authenticated
  using ( auth.jwt() ->> 'email' = 'ecj000@gmail.com' );
